'use strict';

/**
 * Las columnas de respuesta del Sheet.
 *
 * Para auditar hay que poder abrir la pestaña Solicitudes y ver qué contestó
 * cada comercial, sin leer el JSON crudo.
 */

const test = require('node:test');
const assert = require('node:assert');

const {
  PREFIJO_RESPUESTA, columnasDeRespuestas, valorLegible, tiendasLegibles, respuestasParaElSheet,
} = require('../src/core/auditoria.js');
const { ESQUEMAS, camposVisibles } = require('../src/core/esquemas.js');

test('hay una columna por cada campo de cada tipo, sin repetir', () => {
  const columnas = columnasDeRespuestas();
  assert.strictEqual(new Set(columnas).size, columnas.length, 'hay columnas repetidas');

  for (const tipo of Object.keys(ESQUEMAS)) {
    for (const campo of ESQUEMAS[tipo].campos) {
      assert.ok(
        columnas.indexOf(PREFIJO_RESPUESTA + campo.id) !== -1,
        campo.id + ' del tipo ' + tipo + ' no tiene columna en el Sheet'
      );
    }
  }
});

test('ninguna columna de respuesta choca con las columnas de siempre', () => {
  // Por eso llevan prefijo: pais, tipo y tienda existen en las dos listas.
  const { PESTANAS } = require('../src/server/Config.js');
  for (const columna of columnasDeRespuestas()) {
    assert.strictEqual(PESTANAS.Solicitudes.indexOf(columna), -1, columna + ' choca con una columna existente');
  }
});

test('el valor que se guarda es el que se lee, no el código interno', () => {
  const campo = {
    id: 'redencion', tipo: 'lista',
    opciones: [
      { valor: 'tienda', etiqueta: 'Solo en esta tienda' },
      { valor: 'general', etiqueta: 'En cualquier parte de Rappi' },
    ],
  };
  assert.strictEqual(valorLegible(campo, 'tienda'), 'Solo en esta tienda');
  assert.strictEqual(valorLegible(campo, ''), '');

  assert.strictEqual(valorLegible({ tipo: 'casilla' }, true), 'Sí');
  assert.strictEqual(valorLegible({ tipo: 'casilla' }, false), 'No');
  // Los números siguen siendo números, para poder sumarlos y filtrarlos.
  assert.strictEqual(valorLegible({ tipo: 'numero' }, '25000'), 25000);
});

test('las respuestas de varias opciones van en una sola celda', () => {
  const campo = {
    id: 'condiciones', tipo: 'casillas',
    opciones: [
      { valor: 'turbo', etiqueta: 'Solo si el pedido se hace por Turbo' },
      { valor: 'consumo_local', etiqueta: 'Solo si consume en el local' },
    ],
  };
  assert.strictEqual(
    valorLegible(campo, ['turbo', 'consumo_local']),
    'Solo si el pedido se hace por Turbo, Solo si consume en el local'
  );
});

test('las tiendas del Cashback Multitienda van una por línea', () => {
  const texto = tiendasLegibles([
    { tienda: 'Beer Station', organizadorRazonSocial: 'Beer S.A.S.', organizadorId: '900111222-1', porcentaje: 99, tope: 15000, presupuesto: 3000000 },
    { tienda: 'EVOK', organizadorRazonSocial: 'Evok S.A.S.', organizadorId: '900333444-0', porcentaje: 50, tope: 10000, presupuesto: 2000000 },
  ]);
  const lineas = texto.split('\n');
  assert.strictEqual(lineas.length, 2);
  assert.ok(lineas[0].indexOf('Beer Station') === 0, lineas[0]);
  assert.ok(lineas[0].indexOf('99%') !== -1, lineas[0]);
});

test('solo se llenan las preguntas que se le hicieron al comercial', () => {
  const entrada = {
    tipo: 'cashback', pais: 'CO', tienda: 'El Corral', porcentaje: 50,
    segmento: 'todos', redencion: 'tienda', declaracion: true,
    // Un valor que quedó de antes de cambiar la respuesta de segmento: la
    // pregunta ya no aplica, así que no debe aparecer en la auditoría.
    diasSinCompra: 90,
  };
  const fila = respuestasParaElSheet(entrada);

  assert.strictEqual(fila[PREFIJO_RESPUESTA + 'tienda'], 'El Corral');
  assert.strictEqual(fila[PREFIJO_RESPUESTA + 'redencion'], 'Solo en esta tienda');
  assert.ok(!(PREFIJO_RESPUESTA + 'diasSinCompra' in fila), 'se guardó una respuesta que no se preguntó');

  const preguntadas = camposVisibles('cashback', entrada).map((c) => PREFIJO_RESPUESTA + c.id);
  for (const columna of Object.keys(fila)) {
    assert.ok(preguntadas.indexOf(columna) !== -1, columna + ' no corresponde a ninguna pregunta visible');
  }
});

test('un tipo que no existe no escribe nada', () => {
  assert.deepStrictEqual(respuestasParaElSheet({ tipo: 'no_existe' }), {});
  assert.deepStrictEqual(respuestasParaElSheet(null), {});
});

test('el Sheet guarda lo que el comercial leyó, no el identificador interno', () => {
  // El defecto: valorLegible solo miraba las opciones del esquema, así que un
  // campo que reusa una pregunta con opciones quedaba en crudo. Quien audita
  // veía "sin_efectivo" donde el comercial había elegido "Con todo menos efectivo".
  const fila = respuestasParaElSheet({
    pais: 'CO', negocio: 'rappi', tipo: 'cashback_eta', ciudades: 'Bogotá',
    fechaInicio: '2026-09-16', horaInicio: '11:00', horaFin: '15:00',
    etaMinutos: 15, porcentaje: 100, tope: 100000, presupuesto: 37000000, maxPedidos: 1,
    carga: 'dia_siguiente', vigencia: 'dias', diasVigencia: 7,
    exclusionesEta: ['travel', 'soat'], metodoPago: 'sin_efectivo', declaracion: true,
  });

  assert.strictEqual(fila.resp_metodoPago, 'Con todo menos efectivo');
  assert.strictEqual(fila.resp_exclusionesEta, 'Rappi Travel, Seguro Soat');
  // Y el tipo va con su nombre: quien audita no tiene por qué saber qué es
  // "cashback_eta".
  assert.strictEqual(fila.resp_tipo, '15 minutos o Cashback');
});

