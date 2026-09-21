'use strict';

/**
 * Mide el contraste de la paleta de identidad contra WCAG 2.1.
 *
 * Lee los valores de docs/diseno/tokens/, asi que no hay numeros escritos a
 * mano aqui: si un token cambia, la medicion cambia con el. Lo unico escrito a
 * mano es la lista de PARES, que dice que va encima de que, porque eso no se
 * puede deducir de un archivo de tokens.
 *
 * Los minimos de WCAG 2.1:
 *   4.5  texto normal
 *   3    texto grande (18.66px en negrita, o 24px), bordes de control,
 *        objetos graficos que comunican informacion, e indicadores de foco
 *
 * Quedan fuera a proposito los componentes inactivos, que WCAG exime, y las
 * etiquetas cuyo significado carga su propio texto.
 *
 * Correrlo:  npm run contraste
 */

const path = require('path');
const { rutaDesdeRaiz, leerTexto, listarArchivos } = require('./lib/archivos');

const CARPETA_TOKENS = rutaDesdeRaiz('docs', 'diseno', 'tokens');

/** Saca { nombre: valor } de todos los archivos de tokens. */
function leerTokens() {
  const tokens = {};
  for (const archivo of listarArchivos(CARPETA_TOKENS, '.css')) {
    const texto = leerTexto(path.join(CARPETA_TOKENS, archivo));
    const patron = /(--[\w-]+)\s*:\s*([^;]+);/g;
    let hallado;
    while ((hallado = patron.exec(texto)) !== null) {
      tokens[hallado[1]] = hallado[2].trim();
    }
  }
  return tokens;
}

/** Resuelve un valor que puede ser un token, un var() anidado o un literal. */
function resolver(valor, tokens, profundidad) {
  if ((profundidad || 0) > 10) throw new Error('var() circular en ' + valor);
  if (valor.indexOf('--') === 0) return resolver(tokens[valor] || valor, tokens, (profundidad || 0) + 1);
  const anidado = /^var\((--[\w-]+)\)$/.exec(valor.trim());
  if (anidado) return resolver(tokens[anidado[1]] || anidado[1], tokens, (profundidad || 0) + 1);
  return valor.trim();
}

function desdeHex(h) {
  h = h.replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16), 1];
}

/** Acepta #rgb, #rrggbb, rgb() y rgba(). Devuelve [r, g, b, alfa]. */
function aColor(valor) {
  if (valor.indexOf('#') === 0) return desdeHex(valor);
  const rgba = /rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,/\s]+([\d.]+))?\s*\)/.exec(valor);
  if (rgba) return [Number(rgba[1]), Number(rgba[2]), Number(rgba[3]), rgba[4] === undefined ? 1 : Number(rgba[4])];
  throw new Error('no se como leer el color: ' + valor);
}

/** Compone un color con alfa sobre un fondo ya opaco. */
function componer(color, fondo) {
  const a = color[3];
  if (a >= 1) return color;
  return [0, 1, 2].map((i) => Math.round(a * color[i] + (1 - a) * fondo[i])).concat(1);
}

function canal(v) {
  v /= 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

function luminancia(c) {
  return 0.2126 * canal(c[0]) + 0.7152 * canal(c[1]) + 0.0722 * canal(c[2]);
}

function razon(frente, fondo) {
  const a = luminancia(frente);
  const b = luminancia(fondo);
  return Math.round(((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)) * 100) / 100;
}

/**
 * Que va encima de que. `min` es el minimo de WCAG que le toca a ese par.
 *
 * `nota` explica por que un par que no llega igual se acepta. Un par con nota
 * no cuenta como falla; un par sin nota que no llegue, si.
 */
const PARES = [
  // --- Texto sobre superficies -------------------------------------------
  { que: 'texto principal sobre papel', frente: '--rm-texto', fondo: '#FFFFFF', min: 4.5 },
  { que: 'texto principal sobre niebla', frente: '--rm-texto', fondo: '--rm-niebla', min: 4.5 },
  { que: 'texto secundario sobre papel', frente: '--rm-texto-2', fondo: '#FFFFFF', min: 4.5 },
  { que: 'texto secundario sobre niebla', frente: '--rm-texto-2', fondo: '--rm-niebla', min: 4.5 },
  { que: 'texto deshabilitado sobre niebla', frente: '--rm-texto-off', fondo: '--rm-niebla', min: 4.5 },
  { que: 'texto de marcador de posicion sobre papel', frente: '--rm-placeholder', fondo: '#FFFFFF', min: 4.5 },
  { que: 'texto de marcador de posicion sobre niebla', frente: '--rm-placeholder', fondo: '--rm-niebla', min: 4.5 },
  { que: 'texto secundario del DS sobre papel', frente: '--color-muted', fondo: '#FFFFFF', min: 4.5 },

  // --- Texto sobre los pasteles ------------------------------------------
  { que: 'texto sobre panel informativo', frente: '--rm-texto', fondo: '--rm-aviso-info-bg', min: 4.5 },
  { que: 'texto sobre panel serio', frente: '--rm-texto', fondo: '--rm-aviso-serio-bg', min: 4.5 },
  { que: 'texto del hueco sobre su fondo', frente: '--rm-texto', fondo: '--rm-hueco-bg', min: 4.5 },

  // --- El mensaje de error, que es texto normal (13.5px en negrita) ------
  { que: 'mensaje de error sobre papel', frente: '--rm-aviso-error-color', fondo: '#FFFFFF', min: 4.5 },
  { que: 'mensaje de error sobre niebla', frente: '--rm-aviso-error-color', fondo: '--rm-niebla', min: 4.5 },

  // --- Texto blanco sobre el gradiente: se mide en sus tres paradas -------
  // Decision 80: el boton primario lleva texto grande, asi que le toca 3.
  { que: 'blanco sobre el gradiente al 0%', frente: '#FFFFFF', fondo: '--color-neon-orange', min: 3,
    nota: 'la decision 80 recorta el gradiente del boton al 17%, asi que esta parada no lleva texto' },
  { que: 'blanco sobre el gradiente al 55%', frente: '#FFFFFF', fondo: '--color-neon-red', min: 3 },
  { que: 'blanco sobre el gradiente al 100%', frente: '#FFFFFF', fondo: '--color-neon-pink', min: 3 },

  // --- Estados de campana -------------------------------------------------
  { que: 'estado generado', frente: '--rm-estado-generado-fg', fondo: '--rm-estado-generado-bg', min: 4.5 },
  { que: 'estado borrador', frente: '--rm-estado-borrador-fg', fondo: '--rm-estado-borrador-bg', min: 4.5 },
  { que: 'estado vencido', frente: '--rm-estado-vencido-fg', fondo: '#FFFFFF', min: 4.5 },

  // --- Bordes de control y foco (min 3) -----------------------------------
  { que: 'borde del campo con valor', frente: '--rm-campo-lleno', fondo: '#FFFFFF', min: 3 },
  { que: 'borde del campo en error', frente: '--rm-campo-error', fondo: '#FFFFFF', min: 3 },
  { que: 'borde del campo vacio', frente: '--rm-campo-vacio', fondo: '#FFFFFF', min: 3 },
  { que: 'borde de la opcion elegida', frente: '--rm-opcion-sel-borde', fondo: '#FFFFFF', min: 3 },
  { que: 'borde del control deshabilitado', frente: '--rm-campo-off-borde', fondo: '--rm-niebla', min: 3,
    nota: 'WCAG exime los componentes inactivos' },

  // --- Indicadores de foco: WCAG 2.4.11 los mide contra el color de al lado
  { que: 'anillo de foco del control', frente: '--rm-anillo', colorNumero: 1, fondo: '#FFFFFF', min: 3 },
  { que: 'anillo del campo enfocado', frente: '--rm-anillo-campo', fondo: '#FFFFFF', min: 3 },

  // --- Objetos graficos que comunican estado ------------------------------
  { que: 'barra del paso hecho', frente: '--rm-paso-hecho', fondo: '#FFFFFF', min: 3 },
  { que: 'barra del paso pendiente', frente: '--rm-paso-pendiente', fondo: '#FFFFFF', min: 3,
    nota: 'es el carril vacio de la barra; lo que comunica el avance es el paso hecho y el actual, mas la linea de texto de encima' },
  { que: 'subrayado punteado del hueco', frente: '--rm-hueco-subrayado', fondo: '--rm-hueco-bg', min: 3 },
  { que: 'borde de la pildora de vencido', frente: '--rm-estado-vencido-borde', fondo: '#FFFFFF', min: 3,
    nota: 'es una etiqueta, no un control, y su significado lo carga el texto' },
];

/**
 * Se queda con un color del valor. Hace falta porque varios tokens no son un
 * color pelado: el subrayado es `1.5px dotted rgba(...)` y el anillo de foco es
 * una sombra de dos capas, donde la que se mide contra el fondo es la de afuera.
 */
function soloElColor(valor, indice) {
  const encontrados = valor.match(/#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)/g);
  if (!encontrados) return valor;
  return encontrados[indice || 0] || encontrados[0];
}

function medir() {
  const tokens = leerTokens();
  const fallas = [];
  const avisos = [];

  console.log('Contraste de la paleta de identidad, medido contra WCAG 2.1.');
  console.log('Fuente de los valores: docs/diseno/tokens/\n');

  for (const par of PARES) {
    const fondo = aColor(soloElColor(resolver(par.fondo, tokens)));
    const frente = componer(aColor(soloElColor(resolver(par.frente, tokens), par.colorNumero)), fondo);
    const r = razon(frente, fondo);
    const llega = r >= par.min;

    const marca = llega ? 'ok  ' : par.nota ? 'nota' : 'FALLA';
    console.log('  ' + marca.padEnd(6) + par.que.padEnd(46, '.') + String(r).padStart(7) + ':1   min ' + par.min);

    if (!llega && par.nota) avisos.push(par);
    if (!llega && !par.nota) fallas.push({ par: par, razon: r });
  }

  console.log('');
  for (const aviso of avisos) {
    console.log('  nota · ' + aviso.que + ': ' + aviso.nota + '.');
  }
  if (avisos.length) console.log('');

  if (fallas.length === 0) {
    console.log('Todo lo que tiene que llegar, llega.');
    return 0;
  }

  console.log('No llegan ' + fallas.length + ':');
  for (const falla of fallas) {
    console.log('  · ' + falla.par.que + ': ' + falla.razon + ':1, necesita ' + falla.par.min + '.');
  }
  console.log('\nLos arreglos propuestos estan en docs/diseno/AUDITORIA_CONTRASTE.md.');
  return 1;
}

if (require.main === module) {
  try {
    process.exit(medir());
  } catch (error) {
    console.error('La medicion fallo: ' + error.message);
    process.exit(2);
  }
}

module.exports = { razon, aColor, componer, luminancia, PARES };
