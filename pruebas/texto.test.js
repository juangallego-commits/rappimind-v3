'use strict';

/**
 * El motor debe ignorar los retornos de carro. Los modelos y las salidas
 * esperadas se editan en Windows y en Linux, y el texto generado tiene que ser
 * el mismo en los dos.
 */

const test = require('node:test');
const assert = require('node:assert');

const {
  normalizarTexto,
  lineasDe,
  recortarFinalDeLinea,
  normalizarParaComparar,
  tieneRetornoDeCarro,
} = require('../src/core/texto.js');

test('normalizarTexto convierte los finales de linea de Windows', () => {
  assert.strictEqual(normalizarTexto('uno\r\ndos\r\ntres'), 'uno\ndos\ntres');
});

test('normalizarTexto convierte los retornos de carro sueltos', () => {
  assert.strictEqual(normalizarTexto('uno\rdos'), 'uno\ndos');
});

test('normalizarTexto quita la marca BOM', () => {
  assert.strictEqual(normalizarTexto('﻿# TITULO'), '# TITULO');
});

test('normalizarTexto tolera nulo y vacio', () => {
  assert.strictEqual(normalizarTexto(null), '');
  assert.strictEqual(normalizarTexto(undefined), '');
  assert.strictEqual(normalizarTexto(''), '');
});

test('un mismo texto guardado en Windows y en Linux produce lo mismo', () => {
  const linux = '# TITULO\n\n§ Vigencia. Texto.\n• Punto.\n';
  const windows = linux.replace(/\n/g, '\r\n');
  assert.strictEqual(normalizarTexto(windows), normalizarTexto(linux));
  assert.deepStrictEqual(lineasDe(windows), lineasDe(linux));
});

test('recortarFinalDeLinea quita espacios al final sin tocar el contenido', () => {
  assert.strictEqual(recortarFinalDeLinea('uno   \r\ndos\t\n'), 'uno\ndos\n');
});

test('normalizarParaComparar ignora lineas en blanco al inicio y al final', () => {
  assert.strictEqual(normalizarParaComparar('\r\n\r\n# TITULO\r\n\r\n'), '# TITULO');
});

test('tieneRetornoDeCarro detecta el \\r', () => {
  assert.ok(tieneRetornoDeCarro('uno\r\ndos'));
  assert.ok(!tieneRetornoDeCarro('uno\ndos'));
  assert.ok(!tieneRetornoDeCarro(null));
});
