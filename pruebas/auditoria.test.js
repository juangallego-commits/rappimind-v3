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
  // Con un campo de casillas de verdad: las secciones donde los Créditos no se
  // pueden redimir. Antes se probaba con las condiciones del pedido, que
  // dejaron de ser casillas el 20 de septiembre de 2026 (punto D2).
  const campo = {
    id: 'exclusionesRedencion', tipo: 'casillas',
    opciones: [
      { valor: 'travel', etiqueta: 'Rappi Travel' },
      { valor: 'atm', etiqueta: 'Cajero ATM' },
    ],
  };
  assert.strictEqual(valorLegible(campo, ['travel', 'atm']), 'Rappi Travel, Cajero ATM');
});

test('las tiendas del Cashback Multitienda van una por línea', () => {
  /*
   * Con los nombres de campo de verdad, que son los de CAMPOS_POR_TIENDA.
   * Esta prueba usaba los del Cashback de una tienda (tienda,
   * organizadorRazonSocial, organizadorId), que en una fila de esta lista no
   * existen: confirmaba la misma equivocación que tenía el código, así que la
   * columna del Sheet guardaba " ·  · " por cada tienda y nadie se enteraba.
   */
  const { ESQUEMAS } = require('../src/core/esquemas.js');
  const texto = tiendasLegibles([
    { marca: 'Beer Station', razonSocial: 'Beer S.A.S.', id: '900.111.222-1', ciudades: 'Bogotá', presupuesto: 3000000, tiendaTurbo: 'normal' },
    { marca: 'EVOK', razonSocial: 'Evok S.A.S.', id: '830.111.222-6', nacional: true, presupuesto: 2000000, tiendaTurbo: 'sin_turbo' },
  ]);
  const lineas = texto.split('\n');
  assert.strictEqual(lineas.length, 2);
  assert.ok(lineas[0].indexOf('Beer Station') === 0, lineas[0]);
  assert.ok(lineas[0].indexOf('900.111.222-1') !== -1, lineas[0]);
  assert.ok(lineas[1].indexOf('cobertura nacional') !== -1, lineas[1]);

  // Y ninguna línea puede quedar sin datos: es como se vio el defecto.
  for (const linea of lineas) {
    assert.ok(linea.replace(/[·\s]/g, '').length > 0, 'una tienda salió vacía: "' + linea + '"');
  }

  // Los nombres que lee esta función son los que el esquema define de verdad.
  const delEsquema = ESQUEMAS.cashback_day.camposPorTienda.map((c) => c.id);
  const fuente = require('node:fs').readFileSync(
    require('node:path').join(__dirname, '..', 'src', 'core', 'auditoria.js'), 'utf8');
  const cuerpo = fuente.slice(fuente.indexOf('function tiendasLegibles'), fuente.indexOf('function productosLegibles'));
  for (const llave of ['marca', 'razonSocial', 'id', 'presupuesto']) {
    assert.ok(delEsquema.indexOf(llave) !== -1, llave + ' ya no existe en el esquema');
    assert.ok(cuerpo.indexOf('t.' + llave) !== -1, 'la auditoría no lee t.' + llave);
  }
});

test('los productos de la Carrera van uno por línea, con su EAN', () => {
  const { productosLegibles } = require('../src/core/auditoria.js');
  const texto = productosLegibles([
    { nombre: 'Galletas Lunaria clásicas', ean: '7702001008285' },
    { nombre: 'Galletas Lunaria de chocolate', ean: '7501031311309' },
  ]);
  assert.deepStrictEqual(texto.split('\n'), [
    'Galletas Lunaria clásicas · EAN 7702001008285',
    'Galletas Lunaria de chocolate · EAN 7501031311309',
  ]);
});

test('las tiendas de Turbo del cashback por ETA van una por línea', () => {
  const { tiendasEtaLegibles } = require('../src/core/auditoria.js');
  assert.strictEqual(
    tiendasEtaLegibles([{ nombre: 'Turbo Calleja' }, { nombre: 'Turbo Chico' }]),
    'Turbo Calleja\nTurbo Chico');
  assert.strictEqual(tiendasEtaLegibles([]), '');
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
    tiendasEta: [{ nombre: 'Turbo Calleja' }, { nombre: 'Turbo Chico' }],
  });

  assert.strictEqual(fila.resp_metodoPago, 'Con todo menos efectivo');
  assert.strictEqual(fila.resp_exclusionesEta, 'Rappi Travel, Seguro Soat');
  // Y el tipo va con su nombre: quien audita no tiene por qué saber qué es
  // "cashback_eta".
  assert.strictEqual(fila.resp_tipo, '15 minutos o Cashback');
  // Y las tiendas de Turbo quedan legibles en su columna: quien audita tiene
  // que poder ver cuáles se nombraron sin abrir el documento.
  assert.strictEqual(fila.resp_tiendasEta, 'Turbo Calleja\nTurbo Chico');
});

