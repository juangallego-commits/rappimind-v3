'use strict';

/**
 * El nombre de la campaña y la dirección con la que se publica.
 *
 * Lo que se está protegiendo aquí es el caso real del 16 de septiembre: una
 * campaña titulada "99% de Cashback El Corral 20/09" cuyo articulado decía
 * cincuenta por ciento (50%) con vigencia el 17 de septiembre. Como el nombre
 * ahora sale del mismo dato que la cláusula, eso no puede volver a pasar.
 */

const test = require('node:test');
const assert = require('node:assert');

const {
  nombreDeCampana, direccionDeCampana, sufijoLibreDeNombre, fechaCortaDeNombre, sinTildes,
} = require('../src/core/nombres.js');
const { esquemaDe } = require('../src/core/esquemas.js');
const { calcularDerivados } = require('../src/core/derivados.js');
const { paisDesdeFila } = require('../src/core/paises.js');
const { rutaDesdeRaiz, leerJson } = require('../scripts/lib/archivos');

const COLOMBIA = paisDesdeFila(
  leerJson(rutaDesdeRaiz('data', 'paises.json')).paises.find((p) => p.codigo === 'CO')
);

function nombre(entrada) {
  return nombreDeCampana(entrada, esquemaDe(entrada.tipo));
}

test('el Cashback lleva la tienda, el porcentaje y el día de inicio', () => {
  assert.strictEqual(
    nombre({ tipo: 'cashback', tienda: 'El Corral', porcentaje: 50, fechaInicio: '2026-09-20' }),
    'El Corral · 50% Cashback · 20 sep 2026'
  );
});

test('el porcentaje del nombre es el mismo que el de la cláusula', () => {
  const entrada = { tipo: 'cashback', tienda: 'El Corral', porcentaje: 50, fechaInicio: '2026-09-20' };
  const valores = calcularDerivados(entrada, COLOMBIA);

  assert.ok(valores.PORCENTAJE.indexOf('cincuenta por ciento (50%)') !== -1, valores.PORCENTAJE);
  assert.ok(valores.NOMBRE_CAMPANA.indexOf('50%') !== -1, valores.NOMBRE_CAMPANA);
  // El caso que obligó a esto: no puede haber un 99 en el título y un 50 abajo.
  assert.strictEqual(valores.NOMBRE_CAMPANA, 'El Corral · 50% Cashback · 20 sep 2026');
});

test('la Carrera de Compras no lleva porcentaje, porque no tiene', () => {
  assert.strictEqual(
    nombre({ tipo: 'carrera_compras', tienda: 'Carulla', fechaInicio: '2026-10-05' }),
    'Carulla · Carrera de Compras · 5 oct 2026'
  );
});

test('el Cashback Multitienda no lleva tienda ni porcentaje: cada una tiene el suyo', () => {
  assert.strictEqual(
    nombre({ tipo: 'cashback_day', fechaInicio: '2026-09-24' }),
    'Cashback Multitienda · 24 sep 2026'
  );
});

test('sin fecha de inicio todavía no hay nombre', () => {
  assert.strictEqual(nombre({ tipo: 'cashback', tienda: 'El Corral', porcentaje: 50 }), '');
  assert.strictEqual(nombre({ tipo: 'cashback', fechaInicio: 'no es una fecha' }), '');
});

test('la dirección sale del nombre, sin tildes ni signos', () => {
  assert.strictEqual(
    direccionDeCampana('Farmacia Ñandú · 15% Cashback · 3 ene 2027'),
    'farmacia-nandu-15-cashback-3-ene-2027'
  );
  assert.strictEqual(direccionDeCampana('  ¡Hola!  Mundo  '), 'hola-mundo');
  assert.strictEqual(sinTildes('ÁÉÍÓÚñÇ'), 'AEIOUnC');
});

test('dos campañas nunca se llaman igual', () => {
  const base = 'El Corral · 50% Cashback · 20 sep 2026';
  assert.strictEqual(sufijoLibreDeNombre(base, []), 1);
  assert.strictEqual(sufijoLibreDeNombre(base, [base]), 2);
  assert.strictEqual(sufijoLibreDeNombre(base, [base, base + ' · 2']), 3);

  // Mayúsculas y tildes no hacen una campaña distinta para quien busca.
  assert.strictEqual(sufijoLibreDeNombre(base, ['EL CORRAL · 50% CASHBACK · 20 SEP 2026']), 2);
});

test('el consecutivo entra al nombre y a la dirección', () => {
  const entrada = { tipo: 'cashback', tienda: 'El Corral', porcentaje: 50, fechaInicio: '2026-09-20', sufijoNombre: 2 };
  assert.strictEqual(nombre(entrada), 'El Corral · 50% Cashback · 20 sep 2026 · 2');
  assert.strictEqual(direccionDeCampana(nombre(entrada)), 'el-corral-50-cashback-20-sep-2026-2');
});

test('la fecha corta usa el mes abreviado, no el número', () => {
  assert.strictEqual(fechaCortaDeNombre('2026-01-01'), '1 ene 2026');
  assert.strictEqual(fechaCortaDeNombre('2026-12-31'), '31 dic 2026');
  assert.strictEqual(fechaCortaDeNombre('2026-02-30'), '');
});

test('el nombre no se puede escribir a mano', () => {
  // Lo que venga en nombreCampana se ignora: el documento no puede decir algo
  // que el comercial escribió sin que nadie lo revisara.
  const entrada = {
    tipo: 'cashback', tienda: 'El Corral', porcentaje: 50, fechaInicio: '2026-09-20',
    nombreCampana: '99% de Cashback El Corral 20/09',
  };
  assert.strictEqual(calcularDerivados(entrada, COLOMBIA).NOMBRE_CAMPANA, 'El Corral · 50% Cashback · 20 sep 2026');
});

test('el cashback por ETA no lleva tienda, aunque una haya quedado de otro tipo', () => {
  // Al cambiar de Cashback a cashback por ETA, la tienda del intento anterior
  // seguía en las respuestas y el nombre salía "Jumbo · 15 minutos o 100%...".
  const { MODALIDAD_TURBO_POR_DEFECTO } = require('../src/core/derivados_eta.js');
  const entrada = { tipo: 'cashback_eta', tienda: 'Jumbo', ciudades: 'Bogotá', etaMinutos: 15, porcentaje: 100, fechaInicio: '2026-09-16' };
  const resultado = nombre(entrada);
  assert.ok(resultado.indexOf('Jumbo') === -1, resultado);
  assert.ok(resultado.indexOf(MODALIDAD_TURBO_POR_DEFECTO + ' Bogotá') === 0, resultado);
});
