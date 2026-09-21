'use strict';

/**
 * Mide el contraste de la paleta de identidad contra WCAG 2.1.
 *
 * Lee los valores de src/client/tokens/, asi que no hay numeros escritos a
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

// Los de PRODUCCION, no los de la entrega: son los que de verdad se sirven.
// docs/diseno/tokens/ se queda como llego de Claude Design, y los seis
// arreglos de docs/diseno/AUDITORIA_CONTRASTE.md solo estan aqui.
const CARPETA_TOKENS = rutaDesdeRaiz('src', 'client', 'tokens');

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

  // El numero del paso de la pantalla final. Con la paleta vieja daba 4.43:1,
  // por debajo de 4.5, y quedo anotado en docs/PARA_EL_DISENO.md punto 3.
  { que: 'numero del paso de publicar', frente: '--rm-neon-texto', fondo: '--rm-hueco-bg', min: 4.5 },
  { que: 'bajada del panel de momento sobre beige', frente: '--rm-texto-2', fondo: '--rm-hueco-bg', min: 4.5 },

  // --- El mensaje de error, que es texto normal (13.5px en negrita) ------
  { que: 'mensaje de error sobre papel', frente: '--rm-aviso-error-color', fondo: '#FFFFFF', min: 4.5 },
  { que: 'mensaje de error sobre niebla', frente: '--rm-aviso-error-color', fondo: '--rm-niebla', min: 4.5 },

  // --- Texto blanco sobre el gradiente: se mide en sus tres paradas -------
  // Decision 80: el boton primario lleva texto grande, asi que le toca 3.
  { que: 'blanco sobre el gradiente al 0%', frente: '#FFFFFF', fondo: '--color-neon-orange', min: 3,
    nota: 'el BOTON PRIMARIO recorta el gradiente al 17%, asi que esa parada no lleva SU texto. Lo que lleve texto sobre el gradiente sin recortar va con --rm-grad-texto y se mide aparte' },
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

  // El punto exacto de la decision 98: el blanco sobre el ARRANQUE del gradiente
  // recortado, que es la parada mas clara y por tanto la peor de todo el boton.
  // Le toca 3 y no 4.5 porque el texto va a 19px en peso 700, y el umbral de
  // texto grande de WCAG empieza en 18.66px en negrita. Si alguien mueve el
  // recorte hacia el naranja, esta linea se pone en rojo.
  { que: 'blanco sobre el arranque del gradiente del boton', frente: '#FFFFFF', fondo: '--rm-grad-boton', min: 3 },
  { que: 'blanco sobre el neon hundido', frente: '#FFFFFF', fondo: '--rm-neon-presionado', min: 4.5 },

  // Los tres sitios que ponen blanco sobre el gradiente SIN recortar. La nota
  // de arriba hablaba en general y por eso ninguno se media: la pildora de
  // Publicado llevaba letra blanca de 13px sobre el gradiente de marca, donde
  // el blanco no llega a 4.5 en ningun punto del tramo.
  { que: 'blanco sobre el gradiente de texto, parada clara', frente: '#FFFFFF', fondo: '--rm-grad-texto', colorNumeroFondo: 0, min: 4.5 },
  { que: 'blanco sobre el gradiente de texto, parada media', frente: '#FFFFFF', fondo: '--rm-grad-texto', colorNumeroFondo: 1, min: 4.5 },
  { que: 'blanco sobre el gradiente de texto, parada final', frente: '#FFFFFF', fondo: '--rm-grad-texto', colorNumeroFondo: 2, min: 4.5 },
  { que: 'pildora de Publicado', frente: '--rm-estado-publicado-fg', fondo: '--rm-grad-texto', colorNumeroFondo: 0, min: 4.5 },

  // El enlace de acento dentro del panel informativo. Se media --rm-neon-texto
  // sobre papel y sobre niebla, pero nunca sobre el celeste, y ahi es donde
  // caia: daba 4.31:1.
  { que: 'enlace de acento sobre el panel informativo', frente: '--rm-neon-texto', fondo: '--rm-aviso-info-bg', min: 4.5 },
  { que: 'enlace de acento sobre el panel serio', frente: '--rm-neon-texto', fondo: '--rm-aviso-serio-bg', min: 4.5 },

  // La superficie del control deshabilitado contra el fondo de pagina. No se
  // medía, y por eso el boton primario deshabilitado llego a quedar en niebla
  // sobre niebla: 1.00:1 exactos, o sea invisible como boton.
  { que: 'superficie del boton deshabilitado sobre el fondo de pagina', frente: '--rm-papel', fondo: '--rm-niebla', min: 1.05,
    nota: 'no es un minimo de WCAG: es que la superficie no puede ser el mismo color que la pagina, o el control deja de leerse como control' },
  { que: 'borde del control deshabilitado', frente: '--rm-campo-off-borde', fondo: '--rm-niebla', min: 3,
    nota: 'WCAG exime los componentes inactivos' },

  // --- Indicadores de foco: WCAG 2.4.11 los mide contra el color de al lado
  //
  // Un solo anillo para todo control, y es un outline solido, no el halo de
  // box-shadow de la entrega: aquel daba 1.99:1 en el control y 1.57:1 en el
  // campo, cuando el anillo que la aplicacion ya tenia cumplia con 3.44:1.
  // El foco visible esta entre los intocables de docs/PARA_EL_DISENO.md, asi
  // que bajarlo habria sido una regresion. Se mide contra los dos fondos sobre
  // los que aparece de verdad.
  { que: 'anillo de foco sobre papel', frente: '--rm-anillo-color', fondo: '#FFFFFF', min: 3 },
  { que: 'anillo de foco sobre niebla', frente: '--rm-anillo-color', fondo: '--rm-niebla', min: 3 },
  { que: 'anillo de foco sobre el beige del aviso serio', frente: '--rm-anillo-color', fondo: '--rm-aviso-serio-bg', min: 3 },

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
  console.log('Fuente de los valores: src/client/tokens/\n');

  for (const par of PARES) {
    // colorNumeroFondo hace falta para los gradientes: un gradiente no es un
    // color, son varios, y el que importa es el peor de sus paradas. Sin esto
    // se medía siempre la primera y las otras pasaban sin mirar.
    const fondo = aColor(soloElColor(resolver(par.fondo, tokens), par.colorNumeroFondo));
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
