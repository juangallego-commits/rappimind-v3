'use strict';

/**
 * Claves duplicadas dentro de un mismo objeto.
 *
 * En JavaScript, escribir dos veces la misma clave no es un error: la última
 * gana y la primera desaparece sin decir nada. Ha pasado tres veces en este
 * proyecto y las tres se vieron tarde:
 *
 *   1. `formaBeneficio` se definió para Brasil sobre la que ya existía para
 *      Travel, así que la de Brasil nunca existió.
 *   2. `porcentaje`, `tope` y `compraMinima` quedaron con dos bloques
 *      `variantes`, y el segundo borró las variantes de Brasil y del ETA. El
 *      resultado: en una campaña brasileña, que no da Créditos, la pantalla
 *      seguía preguntando cuántos Créditos devuelves.
 *
 * Esta prueba lee los archivos como texto, no como módulos, porque para cuando
 * Node los carga la clave duplicada ya se perdió.
 */

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const CARPETA = path.join(__dirname, '..', 'src', 'core');

/** Las claves de primer nivel de cada objeto literal, con su línea. */
function clavesRepetidas(texto, sangria) {
  const patron = new RegExp('^ {' + sangria + '}(\\w+):', 'gm');
  const vistas = {};
  const repetidas = [];
  let encontrado;
  while ((encontrado = patron.exec(texto)) !== null) {
    const clave = encontrado[1];
    const linea = texto.slice(0, encontrado.index).split('\n').length;
    if (vistas[clave]) repetidas.push(clave + ' (líneas ' + vistas[clave] + ' y ' + linea + ')');
    else vistas[clave] = linea;
  }
  return repetidas;
}

test('ninguna pregunta está definida dos veces', () => {
  const texto = fs.readFileSync(path.join(CARPETA, 'preguntas.js'), 'utf8');
  const desde = texto.indexOf('var PREGUNTAS = {');
  assert.ok(desde !== -1, 'no encontré PREGUNTAS');

  // Las preguntas son las claves con dos espacios de sangría seguidas de p({.
  const soloPreguntas = texto.slice(desde).match(/^ {2}\w+: p\(\{/gm) || [];
  const nombres = soloPreguntas.map((l) => l.trim().split(':')[0]);
  const vistas = {};
  const repetidas = [];
  for (const nombre of nombres) {
    if (vistas[nombre]) repetidas.push(nombre);
    vistas[nombre] = true;
  }
  assert.deepStrictEqual(repetidas, [], 'preguntas definidas dos veces: ' + repetidas.join(', '));
});

test('ninguna pregunta tiene dos bloques de variantes', () => {
  const texto = fs.readFileSync(path.join(CARPETA, 'preguntas.js'), 'utf8');
  const problemas = [];

  // Cada pregunta va desde "  nombre: p({" hasta el siguiente "  }),".
  const patron = /^ {2}(\w+): p\(\{$/gm;
  let encontrado;
  while ((encontrado = patron.exec(texto)) !== null) {
    const desde = encontrado.index;
    const hasta = texto.indexOf('\n  }),', desde);
    const cuerpo = texto.slice(desde, hasta === -1 ? texto.length : hasta);
    const cuantos = (cuerpo.match(/^ {4}variantes: \{$/gm) || []).length;
    if (cuantos > 1) problemas.push(encontrado[1] + ' tiene ' + cuantos + ' bloques de variantes');
  }
  assert.deepStrictEqual(problemas, [], problemas.join(' | '));
});

test('ningún esquema está definido dos veces', () => {
  const texto = fs.readFileSync(path.join(CARPETA, 'esquemas.js'), 'utf8');
  const desde = texto.indexOf('var ESQUEMAS = {');
  const hasta = texto.indexOf('\n};', desde);
  const repetidas = clavesRepetidas(texto.slice(desde, hasta), 2);
  assert.deepStrictEqual(repetidas, [], 'tipos definidos dos veces: ' + repetidas.join(', '));
});

test('cada variante apunta a un tipo que existe', () => {
  const { PREGUNTAS } = require('../src/core/preguntas.js');
  const { ESQUEMAS } = require('../src/core/esquemas.js');

  for (const id of Object.keys(PREGUNTAS)) {
    const variantes = PREGUNTAS[id].variantes;
    if (!variantes) continue;
    for (const tipo of Object.keys(variantes)) {
      assert.ok(ESQUEMAS[tipo], id + ' tiene una variante para "' + tipo + '", que no es un tipo de campaña');
    }
  }
});
