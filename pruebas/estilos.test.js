'use strict';

/**
 * Las variables de la hoja de estilos.
 *
 * Una variable de CSS que no existe no lanza ningún error: la propiedad se
 * queda sin valor y la pantalla se ve mal, nada más. Pasó con el botón del
 * idioma: se escribió `var(--marca)` cuando la variable se llama
 * `--naranja-marca`, y el botón del idioma elegido quedó con texto blanco sobre
 * fondo blanco, o sea invisible. En español solo se veía BR y en portugués solo
 * ES, que es justo lo contrario de lo que el botón tiene que mostrar.
 *
 * Desde el cambio de identidad estas pruebas miran la hoja COMPLETA, o sea los
 * cinco archivos de src/client/tokens/ más src/client/estilos.css, en el mismo
 * orden en que el build los concatena. Eso no es comodidad: los tokens ya no
 * viven dentro de estilos.css, así que leer solo ese archivo daría por
 * indefinidas las variables que sí existen. Y de paso convierte a la primera
 * prueba en la red que atrapa el modo de falla de la skill
 * frontera-apps-script: si alguien agrega un archivo de tokens y se olvida de
 * ponerlo en ORDEN, esto lo dice por su nombre en vez de que los valores se
 * pierdan en silencio dentro del <style> que sirve Apps Script.
 */

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { hojaCompleta, ORDEN } = require('../scripts/lib/hoja-completa');

/** La hoja entera: tokens más estilos, en el orden del build. */
const HOJA = hojaCompleta();

/** Solo src/client/estilos.css, para lo que es de la hoja y no de los tokens. */
const ESTILOS = fs.readFileSync(path.join(__dirname, '..', 'src', 'client', 'estilos.css'), 'utf8');

/** Las variables que se definen de verdad, aunque vayan varias en una línea. */
function definidas(css) {
  const nombres = new Set();
  const patron = /(--[\w-]+)\s*:/g;
  let encontrado;
  while ((encontrado = patron.exec(css)) !== null) {
    // Solo cuenta como definición si no viene dentro de un var().
    const antes = css.slice(Math.max(0, encontrado.index - 5), encontrado.index);
    if (antes.indexOf('var(') === -1) nombres.add(encontrado[1]);
  }
  return nombres;
}

function usadas(css) {
  const nombres = new Set();
  const patron = /var\((--[\w-]+)/g;
  let encontrado;
  while ((encontrado = patron.exec(css)) !== null) nombres.add(encontrado[1]);
  return nombres;
}

/**
 * Resuelve un valor que puede ser un literal o una cadena de var().
 *
 * Hace falta porque los valores de la hoja ya no son todos números escritos a
 * mano: `--r-panel` es `var(--radius-md)` y eso está en otro archivo.
 */
function resolver(valor, mapa, vuelta) {
  if ((vuelta || 0) > 10) throw new Error('var() circular en ' + valor);
  const anidado = /^var\(\s*(--[\w-]+)\s*\)$/.exec(String(valor).trim());
  if (!anidado) return String(valor).trim();
  return resolver(mapa[anidado[1]], mapa, (vuelta || 0) + 1);
}

/** { nombre: valor } de todas las definiciones de la hoja completa. */
function valores(css) {
  const mapa = {};
  const patron = /(--[\w-]+)\s*:\s*([^;]+);/g;
  let encontrado;
  while ((encontrado = patron.exec(css)) !== null) {
    const antes = css.slice(Math.max(0, encontrado.index - 5), encontrado.index);
    if (antes.indexOf('var(') === -1) mapa[encontrado[1]] = encontrado[2].trim();
  }
  return mapa;
}

test('toda variable de estilo que se usa está definida', () => {
  // --avance la pone el JavaScript en el atributo style de la barra de progreso.
  const puestasDesdeElJavaScript = ['--avance'];

  const hay = definidas(HOJA);
  const faltan = [];
  for (const nombre of usadas(HOJA)) {
    if (hay.has(nombre)) continue;
    if (puestasDesdeElJavaScript.indexOf(nombre) !== -1) continue;
    faltan.push(nombre);
  }

  assert.deepStrictEqual(faltan.sort(), [],
    'variables usadas y nunca definidas: ' + faltan.join(', '));
});

test('la hoja que se sirve trae los cinco archivos de tokens y la hoja', () => {
  // Si el build deja de concatenar uno, los var() de ese archivo se quedan sin
  // valor dentro del <style> de Apps Script, sin lanzar ningún error. Esta
  // prueba y la de arriba son las dos mitades de esa red.
  assert.strictEqual(ORDEN.length, 6, 'ORDEN dejó de tener los cinco tokens más la hoja');
  assert.strictEqual(ORDEN[ORDEN.length - 2], 'tokens/rappimind.css',
    'rappimind.css tiene que ir el último de los tokens: es la capa de aplicación y pisa a los de marca');
  assert.strictEqual(ORDEN[ORDEN.length - 1], 'estilos.css',
    'estilos.css va al final de todo: es quien usa los tokens');

  for (const relativa of ORDEN) {
    assert.ok(HOJA.indexOf('/* src/client/' + relativa + ' */') !== -1,
      'la hoja servida no trae ' + relativa);
  }
});

test('la hoja que se sirve no lleva ningún @import', () => {
  // Apps Script sirve la hoja embebida en un solo <style>, así que un @import
  // apunta a una ruta que del lado del usuario no existe. No falla: el
  // navegador se queda sin esos valores y la aplicación sale despintada.
  assert.ok(HOJA.indexOf('@import') === -1,
    'hay un @import en la hoja servida, y no sobrevive a Apps Script');
});

test('una familia de display solo se usa en peso 900', () => {
  // De PP Object Sans se sirve UNA sola cara, la de peso 900. Dentro de una
  // familia, cuando el peso pedido no existe el navegador elige el más cercano
  // que sí exista: si --rm-display se usara en peso 500, saldría Heavy y nadie
  // vería un error. Por eso la familia de display solo vale donde el peso es
  // 900, y el cuerpo va con Archivo, que es variable y cubre 400 a 900.
  const caras = HOJA.match(/@font-face\s*\{[^}]*\}/g) || [];
  const pesos = caras.map((c) => {
    const p = /font-weight:\s*(\d+)/.exec(c);
    return p ? Number(p[1]) : null;
  });
  assert.deepStrictEqual(pesos, [900],
    'cambió el juego de caras incrustadas: revisa la pila de --rm-display antes de seguir');

  // Sin comentarios: los de este repositorio son largos y nombran tokens, así
  // que sin quitarlos el bloque :root entero entra como si fuera un selector.
  const limpia = HOJA.replace(/\/\*[\s\S]*?\*\//g, '');
  const reglas = limpia.match(/[^{}]+\{[^}]*\}/g) || [];
  const sinPeso = [];
  for (const regla of reglas) {
    const selector = regla.split('{')[0].trim();
    const cuerpo = regla.slice(regla.indexOf('{'));
    // En :root se DEFINE la familia; lo que se vigila es dónde se USA.
    if (selector === ':root') continue;
    if (!/var\(\s*--rm-display\s*\)/.test(cuerpo)) continue;
    if (!/font-weight:\s*900/.test(cuerpo)) sinPeso.push(selector);
  }
  assert.deepStrictEqual(sinPeso, [],
    'estas reglas piden la familia de display sin fijar peso 900, así que saldrían en Heavy sin avisar: ' + sinPeso.join(' · '));

  // La otra mitad, y es la que se escapa mirando solo quién declara la familia:
  // un hijo la HEREDA. `.marca em` heredaba display y pedía peso 500, así que
  // habría salido en Heavy igual que el resto del logotipo, sin declarar nada.
  // Por eso todo descendiente de quien usa display tiene que decir su familia.
  const conDisplay = [];
  for (const regla of reglas) {
    const cuerpo = regla.slice(regla.indexOf('{'));
    if (/var\(\s*--display\s*\)/.test(cuerpo)) {
      for (const sel of regla.split('{')[0].split(',')) conDisplay.push(sel.trim());
    }
  }
  const herederos = [];
  for (const regla of reglas) {
    const selector = regla.split('{')[0].trim();
    const cuerpo = regla.slice(regla.indexOf('{'));
    const peso = /font-weight:\s*(\d+)/.exec(cuerpo);
    if (!peso || peso[1] === '900') continue;
    if (/font-family:/.test(cuerpo)) continue;      // dice la suya, no hereda
    for (const padre of conDisplay) {
      if (selector.indexOf(padre + ' ') === 0) herederos.push(selector);
    }
  }
  assert.deepStrictEqual(herederos, [],
    'estas reglas heredan la familia de display y piden otro peso, así que saldrían en Heavy: ' + herederos.join(' · '));
});

test('la variable que se puso desde el JavaScript existe donde se dice', () => {
  const cliente = fs.readFileSync(path.join(__dirname, '..', 'src', 'client', 'js', '62-pasos.js'), 'utf8');
  assert.ok(cliente.indexOf('--avance') !== -1,
    '--avance ya no se pone desde el JavaScript: revisa la lista de excepciones de esta prueba');
});

test('el botón del idioma elegido se distingue del otro', () => {
  // La regla que documenta la cabecera de este archivo. El fondo lleva el neón
  // de texto y no el plano, porque encima va una letra: el plano da 3.79:1 y
  // aquí el mínimo es 4.5:1.
  const regla = ESTILOS.match(/\.selector-idioma button\[aria-pressed="true"\][^}]*\}/);
  assert.ok(regla, 'no encontré la regla del idioma elegido');
  assert.ok(/background:\s*var\(--neon-texto\)/.test(regla[0]), regla[0]);
  assert.ok(/color:\s*var\(--papel\)/.test(regla[0]), regla[0]);
});

test('el buscador del historial recibe el mismo estilo que los demás campos', () => {
  // En "Mis campañas" el campo de búsqueda salía con el ancho por defecto del
  // navegador y cortaba su propio texto de ayuda: "Busca por nombre, tienda o".
  //
  // Se busca sobre el texto entero y no por el principio de una línea: la regla
  // de los campos es una lista larga de selectores y basta con partirla en dos
  // líneas, o cambiar las comillas simples por dobles, para que una búsqueda
  // por prefijo de línea deje de encontrarla y la prueba falle por el motivo
  // equivocado.
  const reglaDeCampos = /(^|\})\s*([^{}]*input\[type=['"]text['"][^{}]*)\{/m.exec(ESTILOS);
  assert.ok(reglaDeCampos, 'no encontré la regla de los campos');
  assert.ok(/input\[type=['"]search['"]\]/.test(reglaDeCampos[2]),
    'input[type=search] no entra en la regla de los campos');
  assert.ok(/\.buscador\s*\{[^}]*max-width/.test(ESTILOS), 'el buscador no tiene un ancho máximo');
});

test('en celular la última fila de botones no queda debajo del selector de idioma', () => {
  // El selector fijo (bottom 76px, 42px de alto) tapaba "Revisar y generar" y
  // "Generar T&C" al llegar al final, porque la página solo reservaba 96px.
  //
  // Los dos números se resuelven por token si hace falta. Antes se exigía un
  // literal seguido de px: en cuanto uno de los dos pasara a var(--algo), la
  // expresión devolvía null y esta prueba reventaba con "no encontré las dos
  // reglas del celular", que manda a buscar donde no es.
  const mapa = valores(HOJA);
  const enPixeles = (bruto, queEs) => {
    const valor = resolver(bruto, mapa);
    const numero = /^(-?[\d.]+)px$/.exec(valor);
    assert.ok(numero, queEs + ' no está en píxeles, sino en "' + valor + '"');
    return Number(numero[1]);
  };

  const celular = ESTILOS.slice(ESTILOS.indexOf('@media (max-width: 900px)'));
  const selector = /\.selector-idioma\s*\{[^}]*bottom:\s*([^;}]+)[;}]/.exec(celular);
  const pagina = /\.pagina\s*\{[^}]*padding:\s*[^;}]*?\s([^\s;}]+)\s*[;}]/.exec(celular);
  assert.ok(selector && pagina, 'no encontré las dos reglas del celular');

  // El alto sale del propio botón, no de un número clavado: si la tipografía o
  // el relleno cambian, esta cuenta cambia con ellos en vez de quedarse vieja.
  const reglaBoton = /\.selector-idioma button\s*\{[^}]*\}/.exec(ESTILOS);
  assert.ok(reglaBoton, 'no encontré la regla del botón del idioma');
  const relleno = /padding:\s*([^;}]+)[;}]/.exec(reglaBoton[0]);
  const cuerpo = /font-size:\s*([\d.]+)rem/.exec(reglaBoton[0]);
  assert.ok(relleno && cuerpo, 'el botón del idioma cambió de forma: recalcula el alto en esta prueba');
  const rellenoArriba = enPixeles(relleno[1].trim().split(/\s+/)[0], 'el relleno del botón del idioma');
  const reglaCaja = /\.selector-idioma\s*\{[^}]*\}/.exec(ESTILOS);
  const rellenoCaja = enPixeles(/padding:\s*([^;}]+)[;}]/.exec(reglaCaja[0])[1].trim().split(/\s+/)[0], 'el relleno de la caja del idioma');
  const alturaLinea = Math.ceil(Number(cuerpo[1]) * 16 * 1.55);
  const altoDelSelector = alturaLinea + rellenoArriba * 2 + rellenoCaja * 2 + 2; // 2 del borde

  const margen = 16;
  const reservado = enPixeles(pagina[1], 'el relleno de abajo de la página en celular');
  const llegaHasta = enPixeles(selector[1], 'el bottom del selector de idioma') + altoDelSelector;
  assert.ok(reservado >= llegaHasta + margen,
    'la página reserva ' + reservado + 'px y el selector llega hasta ' + llegaHasta + 'px');
});

test('los umbrales de la barra de progreso cuadran con la regla de los 88px', () => {
  // La regla de docs/diseno/ESPECIFICACION_ESTADOS.md, sección 1: las etiquetas
  // se ven si hay 6 pasos o menos Y cada segmento mide 88px o más. Si falla
  // cualquiera de las dos, se caen todas a la vez.
  //
  // En CSS eso son cinco consultas de contenedor, una por número de pasos, y
  // cada umbral es una cuenta: n segmentos de 88px más (n-1) huecos. Si alguien
  // cambia el hueco de la barra o el mínimo por segmento y no rehace los cinco
  // números, la regla deja de cumplirse y nada falla a la vista: las etiquetas
  // simplemente se caen antes o después de lo que deberían.
  const mapa = valores(HOJA);
  const minimo = Number(/^(\d+)px$/.exec(resolver('var(--rm-paso-min-etiqueta)', mapa))[1]);
  const maximo = Number(resolver('var(--rm-paso-max-etiqueta)', mapa));
  const hueco = Number(/^(\d+)px$/.exec(resolver('var(--e3)', mapa))[1]);

  assert.strictEqual(minimo, 88, 'cambió el mínimo por segmento');
  assert.strictEqual(maximo, 6, 'cambió el máximo de pasos con etiqueta');

  const reglaDeLaBarra = /\.progreso\s*\{[^}]*gap:\s*([^;}]+)[;}]/.exec(ESTILOS);
  assert.ok(reglaDeLaBarra, 'no encontré la regla de .progreso');
  assert.strictEqual(resolver(reglaDeLaBarra[1].trim(), mapa), hueco + 'px',
    'el hueco de la barra ya no es el que suponen los umbrales');

  // Una consulta por cada número de pasos que todavía lleva etiqueta, de 2 a 6.
  // La de 2 cubre también el caso de un solo paso.
  const consultas = {};
  const patron = /@container\s+barra\s*\(min-width:\s*(\d+)px\)\s*\{\s*\.progreso:not\(:has\(li:nth-child\((\d+)\)\)\)/g;
  let hallado;
  while ((hallado = patron.exec(ESTILOS)) !== null) {
    consultas[Number(hallado[2]) - 1] = Number(hallado[1]);
  }

  const esperados = {};
  for (let pasos = 2; pasos <= maximo; pasos++) esperados[pasos] = pasos * minimo + (pasos - 1) * hueco;

  assert.deepStrictEqual(consultas, esperados,
    'los umbrales no cuadran con n * ' + minimo + ' + (n-1) * ' + hueco);
});

test('la barra de progreso es una sola fila y no se parte', () => {
  // Con nueve pasos y flex-wrap, la barra pasaba a una segunda fila. La
  // especificación dice una fila siempre, con un segmento por paso, y son las
  // etiquetas las que se caen cuando no caben.
  const regla = /\.progreso\s*\{[^}]*\}/.exec(ESTILOS);
  assert.ok(regla, 'no encontré la regla de .progreso');
  assert.ok(/flex-wrap:\s*nowrap/.test(regla[0]), regla[0]);

  // Y el nombre del paso actual tiene que quedar a la vista en escritorio, que
  // es a donde se mudó cuando las etiquetas se caen.
  const compacta = /\.progreso-compacto\s*\{[^}]*\}/.exec(ESTILOS);
  assert.ok(compacta && /display:\s*block/.test(compacta[0]),
    'la línea de "Paso n de m · Nombre" no se ve: si las etiquetas se caen, nadie sabe en qué paso está');
});
