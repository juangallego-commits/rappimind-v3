'use strict';

/**
 * El cashback por incumplimiento del ETA (botón Turbo).
 *
 * Los dos casos reproducen los T&C publicados de Bogotá (16/09/2026) y
 * Barranquilla (1/09/2026). Lo que se protege: que el documento salga completo,
 * que los números concuerden, y que las mejoras de `docs/MEJORAS_ETA.md` sigan
 * puestas, sobre todo la cláusula de datos personales, que los publicados no
 * llevaban.
 */

const test = require('node:test');
const assert = require('node:assert');

const { renderizar } = require('../src/core/motor.js');
const { cargarModelos } = require('../scripts/lib/modelos.js');
const { paisDesdeFila } = require('../src/core/paises.js');
const { esquemaDe } = require('../src/core/esquemas.js');
const { nombreDeCampana } = require('../src/core/nombres.js');
const { rutaDesdeRaiz, leerJson } = require('../scripts/lib/archivos');

const MODELOS = cargarModelos();
const CO = paisDesdeFila(leerJson(rutaDesdeRaiz('data', 'paises.json')).paises.find((p) => p.codigo === 'CO'));

function campana(extra) {
  return Object.assign({
    pais: 'CO', negocio: 'rappi', tipo: 'cashback_eta',
    etaMinutos: 15, porcentaje: 100, tope: 100000,
    maxPedidos: 1, carga: 'dia_siguiente', vigencia: 'dias', diasVigencia: 7,
    exclusionesEta: ['travel', 'soat', 'atm', 'favor'],
    metodoPago: 'sin_efectivo', declaracion: true,
  }, extra || {});
}

const BOGOTA = { ciudades: 'Bogotá', fechaInicio: '2026-09-16', fechaFin: '2026-09-16', horaInicio: '11:00', horaFin: '15:00', presupuesto: 37000000 };
const BARRANQUILLA = { ciudades: 'Barranquilla', fechaInicio: '2026-09-01', fechaFin: '2026-09-01', horaInicio: '07:00', horaFin: '23:00', presupuesto: 95087585 };

function documento(extra) {
  const resultado = renderizar('cashback_eta', campana(extra), CO, MODELOS);
  assert.deepStrictEqual(resultado.errores, [], 'el documento salió con errores');
  assert.deepStrictEqual(resultado.placeholdersVacios, [], 'el documento salió con huecos');
  return resultado.texto;
}

test('el documento de Bogotá sale como el publicado', () => {
  const texto = documento(BOGOTA);

  assert.ok(texto.indexOf('fijado para esta Campaña en quince (15) minutos') !== -1, texto);
  assert.ok(texto.indexOf('en la ciudad de Bogotá, dentro de la República de Colombia') !== -1, texto);
  assert.ok(texto.indexOf('desde las **11:00 a. m.** hasta las **3:00 p. m.** del **16 de septiembre de 2026**') !== -1, texto);
  assert.ok(texto.indexOf('recibirán en Créditos el **cien por ciento (100%)** del valor de los Productos Participantes') !== -1, texto);
  assert.ok(texto.indexOf('El monto máximo del Cashback que se otorgará por orden es de **cien mil (100.000) Créditos**') !== -1, texto);
  assert.ok(texto.indexOf('Rappi se obliga a cumplir con el ETA exhibido') !== -1, texto);
});

test('el presupuesto va en letras y en cifra, y sin decimales', () => {
  // Los publicados lo escribían solo en cifra, y uno llegó a decir
  // "95.087.585,10 de Créditos": unos puntos que no se fraccionan.
  assert.ok(documento(BOGOTA).indexOf('**treinta y siete millones (37.000.000) de Créditos**') !== -1);

  const barranquilla = documento(BARRANQUILLA);
  // Sin el "de", porque las letras no terminan en millones: solo lo lleva
  // "doce millones (12.000.000) de Créditos".
  assert.ok(barranquilla.indexOf('noventa y cinco millones ochenta y siete mil quinientos ochenta y cinco (95.087.585) Créditos') !== -1, barranquilla);
  assert.ok(barranquilla.indexOf(',10') === -1, 'volvieron los Créditos con decimales');
});

test('las órdenes concuerdan en femenino, que es como las nombra el documento', () => {
  assert.ok(documento(BOGOTA).indexOf('Máximo una (1) orden por Usuario/Consumidor') !== -1);
  assert.ok(documento(Object.assign({}, BOGOTA, { maxPedidos: 2 })).indexOf('Máximo dos (2) órdenes por Usuario/Consumidor') !== -1);
  assert.ok(documento(Object.assign({}, BOGOTA, { maxPedidos: 200 })).indexOf('Máximo doscientas (200) órdenes') !== -1);
});

test('sin exclusiones la frase de redención cierra bien igual', () => {
  const texto = documento(Object.assign({}, BOGOTA, { exclusionesEta: [] }));
  assert.ok(texto.indexOf('podrán ser utilizados o redimidos en cualquier sección de la Plataforma Rappi.') !== -1, texto);
  assert.ok(texto.indexOf('a excepción de') === -1, 'quedó una excepción sin nada detrás');
});

test('las mejoras frente a los documentos publicados siguen puestas', () => {
  const texto = documento(BOGOTA);

  // La más importante: los publicados no llevaban cláusula de datos personales.
  assert.ok(texto.indexOf('Tratamiento de datos personales') !== -1, 'falta la cláusula de datos personales');
  assert.ok(texto.indexOf(CO.url_privacidad) !== -1, 'falta el enlace de la política de privacidad');
  assert.ok(texto.indexOf('Superintendencia de Industria y Comercio') !== -1, 'falta la autoridad de datos');

  // Rappi queda identificada con su razón social, su NIT y su domicilio.
  assert.ok(texto.indexOf('**Rappi S.A.S.**, identificada con **NIT 900.843.898-9** y domiciliada en Bogotá D.C.') !== -1, texto);

  // El enlace del botón Turbo, que el documento citaba y ahora sale del Sheet.
  assert.ok(texto.indexOf(CO.url_tc_turbo) !== -1, 'falta el enlace de los T&C del botón Turbo');

  // La redención quedó dentro de la cláusula de Créditos, no suelta entre las
  // restricciones, y se dice una sola vez.
  assert.strictEqual(texto.split('en cualquier sección de la Plataforma Rappi').length - 1, 1,
    'la redención se dice más de una vez');
});

test('el título dice la modalidad, la ciudad, los minutos y el porcentaje', () => {
  const esquema = esquemaDe('cashback_eta');
  assert.strictEqual(
    nombreDeCampana(campana(BOGOTA), esquema, CO),
    'Turbo Restaurantes Bogotá · 15 minutos o 100% Cashback · 16 sep 2026'
  );
  assert.strictEqual(
    nombreDeCampana(campana(BARRANQUILLA), esquema, CO),
    'Turbo Restaurantes Barranquilla · 15 minutos o 100% Cashback · 1 sep 2026'
  );
});

test('el documento no lleva tablas ni marcadores sin resolver', () => {
  for (const caso of [BOGOTA, BARRANQUILLA]) {
    const texto = documento(caso);
    assert.ok(texto.indexOf('{{') === -1 && texto.indexOf('[[') === -1, 'quedó un marcador sin resolver');
    assert.ok(texto.indexOf('|') === -1, 'el documento no puede llevar tablas');
  }
});
