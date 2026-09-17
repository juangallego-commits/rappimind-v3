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
 */

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

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

test('toda variable de estilo que se usa está definida', () => {
  // --avance la pone el JavaScript en el atributo style de la barra de progreso.
  const puestasDesdeElJavaScript = ['--avance'];

  const hay = definidas(ESTILOS);
  const faltan = [];
  for (const nombre of usadas(ESTILOS)) {
    if (hay.has(nombre)) continue;
    if (puestasDesdeElJavaScript.indexOf(nombre) !== -1) continue;
    faltan.push(nombre);
  }

  assert.deepStrictEqual(faltan.sort(), [],
    'variables usadas y nunca definidas: ' + faltan.join(', '));
});

test('la variable que se puso desde el JavaScript existe donde se dice', () => {
  const cliente = fs.readFileSync(path.join(__dirname, '..', 'src', 'client', 'js', '62-pasos.js'), 'utf8');
  assert.ok(cliente.indexOf('--avance') !== -1,
    '--avance ya no se pone desde el JavaScript: revisa la lista de excepciones de esta prueba');
});

test('el botón del idioma elegido se distingue del otro', () => {
  const regla = ESTILOS.match(/\.selector-idioma button\[aria-pressed="true"\][^}]*\}/);
  assert.ok(regla, 'no encontré la regla del idioma elegido');
  assert.ok(/background:\s*var\(--naranja-marca\)/.test(regla[0]), regla[0]);
  assert.ok(/color:\s*#fff/.test(regla[0]), regla[0]);
});

test('el buscador del historial recibe el mismo estilo que los demás campos', () => {
  // En "Mis campañas" el campo de búsqueda salía con el ancho por defecto del
  // navegador y cortaba su propio texto de ayuda: "Busca por nombre, tienda o".
  const css = fs.readFileSync(path.join(__dirname, '..', 'src', 'client', 'estilos.css'), 'utf8');
  const reglaDeCampos = css.split('\n').find((linea) => linea.indexOf("input[type='text']") === 0);
  assert.ok(reglaDeCampos && reglaDeCampos.indexOf("input[type='search']") !== -1, 'input[type=search] no entra en la regla de los campos');
  assert.ok(/\.buscador\s*\{[^}]*max-width/.test(css), 'el buscador no tiene un ancho máximo');
});

test('en celular la última fila de botones no queda debajo del selector de idioma', () => {
  // El selector fijo (bottom 76px, 42px de alto) tapaba "Revisar y generar" y
  // "Generar T&C" al llegar al final, porque la página solo reservaba 96px.
  const celular = ESTILOS.slice(ESTILOS.indexOf('@media (max-width: 900px)'));
  const selector = /\.selector-idioma\s*\{[^}]*bottom:\s*(\d+)px/.exec(celular);
  const pagina = /\.pagina\s*\{[^}]*padding:[^;}]*\s(\d+)px\s*;?\s*\}/.exec(celular);
  assert.ok(selector && pagina, 'no encontré las dos reglas del celular');

  const altoDelSelector = 42;
  const margen = 16;
  assert.ok(Number(pagina[1]) >= Number(selector[1]) + altoDelSelector + margen,
    'la página reserva ' + pagina[1] + 'px y el selector llega hasta ' + (Number(selector[1]) + altoDelSelector) + 'px');
});
