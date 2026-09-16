'use strict';

/** Criterio de aceptación 2 de la especificación: números en letras. */

const test = require('node:test');
const assert = require('node:assert');

const {
  numeroEnLetras,
  letrasYCifra,
  formatearMiles,
  cantidadCreditos,
  montoConMoneda,
  porcentajeEnLetras,
} = require('../src/core/numeros.js');

const CO = { separador_miles: '.', moneda_nombre: 'pesos M/Cte.', moneda_simbolo: '$' };
const MX = { separador_miles: ',', moneda_nombre: 'pesos', moneda_simbolo: '$' };

test('los ejemplos del criterio de aceptación', () => {
  assert.strictEqual(letrasYCifra(1) + ' pedido', 'un (1) pedido');
  assert.strictEqual(letrasYCifra(21) + ' participantes', 'veintiún (21) participantes');
  assert.strictEqual(cantidadCreditos(1000000, CO), 'un millón (1.000.000) de Créditos');
  assert.strictEqual(cantidadCreditos(1500000, CO), 'un millón quinientos mil (1.500.000) Créditos');
  assert.strictEqual(porcentajeEnLetras(100), 'cien por ciento (100%)');
});

test('apócope ante sustantivo masculino y ante mil', () => {
  assert.strictEqual(numeroEnLetras(1, true), 'un');
  assert.strictEqual(numeroEnLetras(21, true), 'veintiún');
  assert.strictEqual(numeroEnLetras(31, true), 'treinta y un');
  assert.strictEqual(numeroEnLetras(21000, true), 'veintiún mil');
  assert.strictEqual(numeroEnLetras(101, true), 'ciento un');
});

test('sin apócope ante "por ciento"', () => {
  assert.strictEqual(porcentajeEnLetras(21), 'veintiuno por ciento (21%)');
  assert.strictEqual(porcentajeEnLetras(1), 'uno por ciento (1%)');
});

test('cien y ciento, y las decenas con tilde', () => {
  assert.strictEqual(numeroEnLetras(100), 'cien');
  assert.strictEqual(numeroEnLetras(101), 'ciento uno');
  assert.strictEqual(numeroEnLetras(16), 'dieciséis');
  assert.strictEqual(numeroEnLetras(22), 'veintidós');
  assert.strictEqual(numeroEnLetras(23), 'veintitrés');
  assert.strictEqual(numeroEnLetras(26), 'veintiséis');
});

test('nunca dice "un mil"', () => {
  assert.strictEqual(numeroEnLetras(1000), 'mil');
  assert.strictEqual(numeroEnLetras(1500), 'mil quinientos');
  assert.ok(numeroEnLetras(1000).indexOf('un mil') === -1);
});

test('millones en singular y plural', () => {
  assert.strictEqual(numeroEnLetras(1000000), 'un millón');
  assert.strictEqual(numeroEnLetras(2000000), 'dos millones');
  assert.strictEqual(numeroEnLetras(21000000), 'veintiún millones');
});

test('"de" solo cuando termina en millón o millones', () => {
  assert.ok(cantidadCreditos(12000000, CO).indexOf(') de Créditos') !== -1);
  assert.ok(cantidadCreditos(1500000, CO).indexOf(') Créditos') !== -1);
  assert.ok(cantidadCreditos(1500000, CO).indexOf(') de Créditos') === -1);
});

test('separador de miles por país', () => {
  assert.strictEqual(formatearMiles(12000000, '.'), '12.000.000');
  assert.strictEqual(formatearMiles(12000000, ','), '12,000,000');
  assert.strictEqual(formatearMiles(500, '.'), '500');
});

test('montos con la moneda del país', () => {
  assert.strictEqual(montoConMoneda(50000, CO), 'cincuenta mil pesos M/Cte. ($50.000)');
  assert.strictEqual(montoConMoneda(200000, MX), 'doscientos mil pesos ($200,000)');
});

test('cero y números grandes', () => {
  assert.strictEqual(numeroEnLetras(0), 'cero');
  assert.strictEqual(numeroEnLetras(999999999999).indexOf('millones') !== -1, true);
});
