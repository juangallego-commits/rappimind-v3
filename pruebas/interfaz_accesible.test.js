'use strict';

/**
 * Lo que se puede vigilar de la accesibilidad sin abrir un navegador.
 *
 * El comportamiento de verdad (dónde queda el foco, qué dice el lector de
 * pantalla) solo se ve en el navegador, y por eso está también en
 * `.claude/skills/flujo-y-ux/scripts/recorrer-flujo.js`. Lo que sí se puede
 * probar aquí es que el mecanismo siga enchufado: la lección de la skill es que
 * un mecanismo que la interfaz no llama es un mecanismo que no existe, y esa
 * clase de defecto sí se caza leyendo el archivo.
 *
 * El defecto que dio origen a estas pruebas: al cambiar de pantalla, la
 * aplicación redibujaba el <main> entero y no avisaba. La región de anuncios
 * quedaba vacía y `document.activeElement` volvía al <body>, así que quien
 * navega con teclado tenía que recorrer otra vez la barra de arriba en cada
 * pantalla, y quien usa lector de pantalla no se enteraba de que había
 * cambiado de pantalla.
 */

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const RAIZ = path.join(__dirname, '..');
const CLIENTE = path.join(RAIZ, 'src', 'client', 'js');

function leer(archivo) {
  return fs.readFileSync(path.join(CLIENTE, archivo), 'utf8');
}

test('cambiar de pantalla entrega el foco y anuncia dónde quedamos', () => {
  const app = leer('70-app.js');

  assert.ok(/function entregarLaPantalla\(\)/.test(app), 'se fue entregarLaPantalla()');
  assert.ok(/RM\.util\.anunciar\(/.test(app), 'entregarLaPantalla ya no anuncia');

  // ir() la llama; si alguien la borra de ahí, el mecanismo deja de existir.
  const cuerpoDeIr = app.slice(app.indexOf('function ir(pantalla)'));
  const hastaElCierre = cuerpoDeIr.slice(0, cuerpoDeIr.indexOf('\n}\n'));
  assert.ok(hastaElCierre.indexOf('entregarLaPantalla()') !== -1,
    'ir() ya no entrega la pantalla:\n' + hastaElCierre);
});

test('el foco no se mueve en cada redibujo, solo al cambiar de pantalla', () => {
  /*
   * dibujar() corre con cada respuesta dentro de la misma pantalla. Si el foco
   * saltara ahí, se lo quitaría al campo que la persona está llenando en ese
   * momento, que es peor que el defecto que se arregló.
   */
  const app = leer('70-app.js');
  const desdeDibujar = app.slice(app.indexOf('function dibujar()'));
  const cuerpo = desdeDibujar.slice(0, desdeDibujar.indexOf('\n}\n'));
  assert.ok(cuerpo.indexOf('entregarLaPantalla') === -1,
    'dibujar() mueve el foco y le quitaría el campo a quien está escribiendo');
});

test('la región de anuncios existe y es la que usa la interfaz', () => {
  const indice = fs.readFileSync(path.join(RAIZ, 'src', 'client', 'Index.html'), 'utf8');
  assert.ok(indice.indexOf('id="anuncios"') !== -1, 'no está la región de anuncios');
  assert.ok(indice.indexOf('aria-live="polite"') !== -1, 'la región no anuncia sola');
  assert.ok(indice.indexOf('role="status"') !== -1);

  const util = leer('10-util.js');
  assert.ok(/function anunciar\(mensaje\)/.test(util));
  assert.ok(util.indexOf("porId('anuncios')") !== -1, 'anunciar() ya no escribe en esa región');
});

test('el anillo de foco del título solo se quita cuando lo pone el código', () => {
  /*
   * El título recibe el foco por código, no porque alguien haya tabulado hasta
   * él, así que no lleva anillo. Con :focus-visible, si alguien llega tabulando
   * de verdad el anillo sigue saliendo: quitarlo del todo dejaría a quien
   * navega con teclado sin saber dónde está.
   */
  const estilos = fs.readFileSync(path.join(RAIZ, 'src', 'client', 'estilos.css'), 'utf8');
  const regla = /h1\[tabindex='-1'\]:focus:not\(:focus-visible\)\s*\{\s*outline:\s*none/;
  assert.ok(regla.test(estilos), 'falta la regla del anillo del título');
  assert.ok(!/h1\[tabindex='-1'\]:focus\s*\{\s*outline:\s*none/.test(estilos),
    'se quitó el anillo también para quien llega tabulando');
});

test('ningún texto que el comercial lee escribe un guion como puntuación', () => {
  /*
   * Regla 8 de CLAUDE.md. Se revisa sobre los literales de los textos de
   * pantalla, no sobre el código: un guion dentro de una expresión regular o de
   * un nombre de clase no es puntuación.
   */
  const excepciones = [
    'Cupon de descuento - Valor fijo',
    'Cupon de descuento - Toda la tienda',
  ];
  const sospechosos = [];
  ['10-util.js', '20-estado.js', '30-servidor.js', '40-documento.js', '50-campos.js',
    '60-flujo.js', '62-pasos.js', '63-tyc-genericos.js', '64-tiendas.js', '66-resumen.js',
    '68-pantallas.js', '70-app.js'].forEach((archivo) => {
    const texto = leer(archivo);
    const literales = texto.match(/'[^'\n]{12,}'/g) || [];
    literales.forEach((literal) => {
      if (excepciones.some((e) => literal.indexOf(e) !== -1)) return;
      // Un guion con espacio a los dos lados, dentro de una frase con espacios.
      if (/[a-záéíóúñ] - [a-záéíóúñ]/i.test(literal)) sospechosos.push(archivo + ': ' + literal);
    });
  });
  assert.deepStrictEqual(sospechosos, [], 'guiones como puntuación:\n' + sospechosos.join('\n'));
});
