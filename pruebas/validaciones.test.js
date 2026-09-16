'use strict';

/** Reglas de acceso por país y validaciones cruzadas. */

const test = require('node:test');
const assert = require('node:assert');

const { rutaDesdeRaiz, leerJson } = require('../scripts/lib/archivos');
const { validarSolicitud, validarPais, validarTipo } = require('../src/core/validaciones.js');

const { paises } = leerJson(rutaDesdeRaiz('data', 'paises.json'));
const CO = paises.find((p) => p.codigo === 'CO');
const MX = paises.find((p) => p.codigo === 'MX');
const BR = paises.find((p) => p.codigo === 'BR');

/** Una solicitud de Cashback CO válida, para ir rompiéndola de a un campo. */
function solicitudBase(cambios) {
  const base = {
    pais: 'CO',
    tipo: 'cashback',
    tienda: 'Tienda de Prueba',
    alcance: 'Nacional',
    ciudades: '',
    segmento: 'todos',
    metodoPago: 'todos',
    declaracion: true,
    fechaInicio: '2026-09-20',
    horaInicio: '00:00',
    fechaFin: '2026-09-21',
    horaFin: '23:59',
    organizadorRazonSocial: 'Organizador de Prueba S.A.S.',
    organizadorId: '900111222-1',
    porcentaje: 20,
    tope: 20000,
    presupuesto: 1000000,
    maxPedidos: 1,
    sinLimite: false,
    carga: 'inmediata',
    vigencia: 'dias',
    diasVigencia: 30,
    redencion: 'tienda',
    condiciones: [],
  };
  return Object.assign(base, cambios || {});
}

const CONTEXTO = { fechaReferencia: '2026-09-16', usuarioEnEquipo: false };

function campos(entrada, pais, contexto) {
  const resultado = validarSolicitud(entrada, pais || CO, contexto || CONTEXTO);
  return Array.from(new Set(resultado.errores.map((e) => e.campo))).sort();
}

test('la solicitud base es válida', () => {
  assert.deepStrictEqual(campos(solicitudBase()), []);
});

test('un país en piloto no aparece para quien no está en el equipo', () => {
  assert.ok(validarPais(MX, false));
  assert.strictEqual(validarPais(MX, true), null);
});

test('un país bloqueado no genera para nadie', () => {
  assert.ok(validarPais(BR, false));
  assert.ok(validarPais(BR, true));
});

test('un país activo genera para cualquiera', () => {
  assert.strictEqual(validarPais(CO, false), null);
});

test('el tipo debe estar habilitado para el país', () => {
  assert.strictEqual(validarTipo('cashback', MX), null);
  assert.ok(validarTipo('carrera_compras', MX), 'Carrera no está habilitada en México');
  assert.ok(validarTipo('inventado', CO));
});

test('si el país no está disponible no se revisa nada más', () => {
  const resultado = validarSolicitud({ pais: 'MX', tipo: 'cashback' }, MX, CONTEXTO);
  assert.strictEqual(resultado.errores.length, 1);
  assert.strictEqual(resultado.errores[0].campo, 'pais');
});

test('la campaña no puede terminar antes de empezar', () => {
  assert.deepStrictEqual(campos(solicitudBase({ fechaFin: '2026-09-19' })), ['fechaFin']);
});

test('la campaña no puede empezar en una fecha que ya pasó', () => {
  assert.deepStrictEqual(campos(solicitudBase({ fechaInicio: '2026-09-15', fechaFin: '2026-09-16' })), ['fechaInicio']);
});

test('empezar hoy sí está permitido', () => {
  assert.deepStrictEqual(campos(solicitudBase({ fechaInicio: '2026-09-16' })), []);
});

test('el tope no puede ser mayor que el presupuesto', () => {
  assert.deepStrictEqual(campos(solicitudBase({ tope: 2000000 })), ['tope']);
});

test('el tope y el presupuesto deben ser mayores que cero', () => {
  assert.deepStrictEqual(campos(solicitudBase({ tope: 0 })), ['tope']);
  assert.deepStrictEqual(campos(solicitudBase({ presupuesto: 0 })), ['presupuesto']);
});

test('la fecha límite de redención debe ser posterior al fin', () => {
  const entrada = solicitudBase({ vigencia: 'fecha', diasVigencia: null, fechaFinRedencion: '2026-09-21' });
  assert.deepStrictEqual(campos(entrada), ['fechaFinRedencion']);
});

test('las ciudades son obligatorias cuando el alcance no es nacional', () => {
  assert.deepStrictEqual(campos(solicitudBase({ alcance: 'Ciudades', ciudades: '' })), ['ciudades']);
  assert.deepStrictEqual(campos(solicitudBase({ alcance: 'Ciudades', ciudades: 'Bogotá' })), []);
});

test('los días sin compra solo se piden para usuarios reactivados', () => {
  assert.deepStrictEqual(campos(solicitudBase({ segmento: 'reactivados' })), ['diasSinCompra']);
  assert.deepStrictEqual(campos(solicitudBase({ segmento: 'reactivados', diasSinCompra: 60 })), []);
  assert.deepStrictEqual(campos(solicitudBase({ segmento: 'nuevos' })), []);
});

test('sin límite de pedidos deja de exigir el máximo', () => {
  assert.deepStrictEqual(campos(solicitudBase({ maxPedidos: null })), ['maxPedidos']);
  assert.deepStrictEqual(campos(solicitudBase({ maxPedidos: null, sinLimite: true })), []);
});

test('el porcentaje tiene que estar entre 1 y 100', () => {
  assert.deepStrictEqual(campos(solicitudBase({ porcentaje: 101 })), ['porcentaje']);
  assert.deepStrictEqual(campos(solicitudBase({ porcentaje: 100 })), []);
});

test('hay que marcar la declaración', () => {
  assert.deepStrictEqual(campos(solicitudBase({ declaracion: false })), ['declaracion']);
});

test('el nombre de la campaña lo arma la herramienta, no el comercial', () => {
  // Ya no hay campo de texto libre: lo que el comercial mande en nombreCampana
  // se ignora, y el nombre sale de la tienda, el porcentaje y el día de inicio.
  const { nombreDeCampana } = require('../src/core/nombres.js');
  const { esquemaDe } = require('../src/core/esquemas.js');

  assert.deepStrictEqual(campos(solicitudBase({ nombreCampana: 'x'.repeat(81) })), []);
  assert.strictEqual(
    nombreDeCampana({ tipo: 'cashback', tienda: 'El Corral', porcentaje: 50, fechaInicio: '2026-09-20' }, esquemaDe('cashback')),
    'El Corral · 50% Cashback · 20 sep 2026'
  );
});

test('el Cashback Day exige al menos dos tiendas y no permite ID repetido', () => {
  function day(tiendas) {
    return solicitudBase({
      tipo: 'cashback_day',
      tiendas: tiendas,
      presupuesto: null,
      organizadorRazonSocial: undefined,
      organizadorId: undefined,
      tienda: undefined,
      alcance: undefined,
    });
  }
  const una = { marca: 'Uno', razonSocial: 'Uno S.A.S.', id: '900777888-2', ciudades: 'Bogotá', presupuesto: 1000 };
  const otra = { marca: 'Dos', razonSocial: 'Dos S.A.S.', id: '901222333-9', nacional: true, presupuesto: 2000 };

  assert.deepStrictEqual(campos(day([])), ['tiendas']);
  assert.deepStrictEqual(campos(day([una])), ['tiendas']);
  assert.deepStrictEqual(campos(day([una, otra])), []);
  assert.deepStrictEqual(campos(day([una, Object.assign({}, otra, { id: '900777888-2' })])), ['tiendas']);
});

test('el Cashback Day no pide organizador', () => {
  const entrada = solicitudBase({
    tipo: 'cashback_day',
    presupuesto: null,
    tiendas: [
      { marca: 'Uno', razonSocial: 'Uno S.A.S.', id: '900777888-2', ciudades: 'Bogotá', presupuesto: 1000 },
      { marca: 'Dos', razonSocial: 'Dos S.A.S.', id: '901222333-9', nacional: true, presupuesto: 2000 },
    ],
  });
  delete entrada.organizadorRazonSocial;
  delete entrada.organizadorId;
  assert.deepStrictEqual(campos(entrada), []);
});

test('cada error trae campo y mensaje', () => {
  const resultado = validarSolicitud(solicitudBase({ presupuesto: null }), CO, CONTEXTO);
  assert.ok(!resultado.valido);
  for (const error of resultado.errores) {
    assert.ok(error.campo, 'un error sin campo');
    assert.ok(error.mensaje, 'un error sin mensaje');
  }
});
