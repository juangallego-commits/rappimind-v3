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
    // Los dos documentos publicados corren en Turbo Restaurantes, que es
    // ademas como corren casi todas.
    alcanceTurbo: 'restaurantes',
  }, extra || {});
}

const BOGOTA = { ciudades: 'Bogotá', fechaInicio: '2026-09-16', fechaFin: '2026-09-16', horaInicio: '11:00', horaFin: '15:00', presupuesto: 37000000 };
const BARRANQUILLA = { ciudades: 'Barranquilla', fechaInicio: '2026-09-01', fechaFin: '2026-09-01', horaInicio: '07:00', horaFin: '23:00', presupuesto: 95087585 };

/*
 * La otra forma: unas tiendas concretas de Turbo, con nombre propio. Son las
 * dark stores tipo Turbo Carulla, no las marcas de Turbo Restaurantes.
 */
const TIENDAS_CONCRETAS = Object.assign({}, BOGOTA, {
  alcanceTurbo: 'tiendas',
  tiendasEta: [{ nombre: 'Turbo Calleja' }, { nombre: 'Turbo Chico' }],
});

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
  // Desde el 20 de septiembre de 2026 (punto B4) esta cláusula tutea, como el
  // resto del documento. Antes decía "recibirán", en tercera persona, y el
  // documento cambiaba de persona a mitad.
  assert.ok(texto.indexOf('recibirás en Créditos el **cien por ciento (100%)** del valor de los Productos Participantes') !== -1, texto);
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

test('un tope mayor que el presupuesto se rechaza', () => {
  const { validarSolicitud } = require('../src/core/validaciones.js');
  const opciones = { fechaReferencia: '2026-08-01', usuarioEnEquipo: true };

  const sano = validarSolicitud(campana(BOGOTA), CO, opciones);
  assert.deepStrictEqual(sano.errores, [], JSON.stringify(sano.errores));

  // Con un tope de 99 millones y un presupuesto de 37, la primera orden se
  // llevaría toda la campaña.
  const roto = validarSolicitud(campana(Object.assign({}, BOGOTA, { tope: 99000000 })), CO, opciones);
  assert.strictEqual(roto.valido, false);
  assert.strictEqual(roto.errores[0].campo, 'tope');
});

test('los mensajes de error son los que alguien escribió, no el genérico', () => {
  const { validarSolicitud } = require('../src/core/validaciones.js');
  const sinEta = campana(BOGOTA);
  delete sinEta.etaMinutos;

  const revision = validarSolicitud(sinEta, CO, { fechaReferencia: '2026-08-01', usuarioEnEquipo: true });
  const delEta = revision.errores.filter((e) => e.campo === 'etaMinutos')[0];
  assert.ok(delEta, 'no se quejó del ETA vacío');
  assert.strictEqual(delEta.mensaje, 'Escribe en cuántos minutos prometes la entrega.');
});

// --- D1: las dos formas en que puede correr una campaña del ETA -------------

/*
 * La decisión 33 proponía una lista cerrada de dos categorías. Juan la corrigió
 * diciendo que son tiendas por zona con nombre propio, y el punto D1 hizo que el
 * documento las listara siempre. El 21 de septiembre de 2026 aclaró que esa
 * corrección era sobre las dark stores tipo Turbo Carulla, que venden CPGs: las
 * campañas de "15 minutos o Cashback" corren normalmente en Turbo Restaurantes,
 * donde están El Corral Turbo, McDonald's Turbo y las demás marcas. Listarlas
 * serían decenas y cambiarían de un día para otro. Existen las dos cosas, así
 * que el formulario pregunta y el documento tiene dos formas.
 */

test('por defecto el documento dice lo mismo que los dos publicados', () => {
  const texto = documento(BOGOTA);
  assert.ok(texto.indexOf('Participarán todas las tiendas virtuales bajo la modalidad “Turbo Restaurantes” ' +
    'al interior de la Plataforma Rappi que se encuentren habilitadas en la ciudad de Bogotá ' +
    'durante la vigencia de la Campaña.') !== -1, texto);
  assert.ok(texto.indexOf('El listado de Tiendas Participantes será el que se encuentre visible y disponible ' +
    'para el Usuario/Consumidor dentro del botón “Turbo” de la Plataforma Rappi al momento de realizar ' +
    'la orden, el cual podrá variar en función de la operación y disponibilidad de cada Aliado Comercial.') !== -1, texto);
  assert.ok(texto.indexOf('órdenes realizadas a través de las Tiendas Participantes identificadas con la ' +
    'modalidad “Turbo Restaurantes”.') !== -1, texto);
});

test('la categoría Turbo sale nombrada donde antes estaba fija', () => {
  const texto = documento(Object.assign({}, BOGOTA, { alcanceTurbo: 'turbo' }));
  assert.ok(texto.indexOf('bajo la modalidad “Turbo” al interior de la Plataforma Rappi') !== -1, texto);
  assert.strictEqual(texto.indexOf('Turbo Restaurantes'), -1, texto);
});

test('con tiendas concretas la cláusula las nombra una por una', () => {
  const texto = documento(TIENDAS_CONCRETAS);

  assert.ok(texto.indexOf('Participarán únicamente las siguientes tiendas virtuales del botón “Turbo” ' +
    'al interior de la Plataforma Rappi, habilitadas en la ciudad de Bogotá durante la vigencia de la Campaña:') !== -1, texto);
  assert.ok(texto.indexOf('\n• Turbo Calleja\n• Turbo Chico\n') !== -1, texto);
  assert.ok(texto.indexOf('La disponibilidad de cada Tienda Participante podrá variar en función de la ' +
    'operación de cada Aliado Comercial.') !== -1, texto);
});

test('con tiendas concretas ninguna frase dice que el listado es el de la app', () => {
  // Las dos juntas se contradicen: una dice que participan estas dos y la otra
  // que participan las que la app muestre. El usuario lee la que le conviene.
  const texto = documento(TIENDAS_CONCRETAS);
  assert.strictEqual(texto.indexOf('El listado de Tiendas Participantes será el que se encuentre visible'), -1, texto);
  assert.strictEqual(texto.indexOf('bajo la modalidad'), -1, texto);
  // Y la viñeta de condiciones cierra sin categoría, porque no hay ninguna.
  assert.ok(texto.indexOf('órdenes realizadas a través de las Tiendas Participantes.') !== -1, texto);
  assert.strictEqual(texto.indexOf('identificadas con la modalidad'), -1, texto);
});

test('una tienda sin nombre no genera, y el hueco se anuncia', () => {
  const resultado = renderizar('cashback_eta',
    campana(Object.assign({}, TIENDAS_CONCRETAS, { tiendasEta: [{ nombre: 'Turbo Calleja' }, { nombre: '' }] })),
    CO, MODELOS);
  assert.deepStrictEqual(resultado.placeholdersVacios, ['TEXTO_TIENDAS_ETA'],
    'una tienda a medias tiene que dejar el hueco entero, no una viñeta rota');
});

test('sin ciudad la cláusula no se escribe, en ninguna de las dos formas', () => {
  const { textoTiendasEta } = require('../src/core/derivados_eta.js');
  assert.strictEqual(textoTiendasEta({ alcanceTurbo: 'restaurantes' }), '');
  assert.strictEqual(textoTiendasEta({ alcanceTurbo: 'tiendas', tiendasEta: [{ nombre: 'Turbo Calleja' }] }), '');
  assert.strictEqual(textoTiendasEta({ ciudades: 'Bogotá', alcanceTurbo: 'tiendas', tiendasEta: [] }), '');
});

test('las tres formas del ETA tienen su texto, y solo la de tiendas pide lista', () => {
  const { MODALIDAD_POR_ALCANCE, modalidadTurbo } = require('../src/core/derivados_eta.js');
  const { ESQUEMAS } = require('../src/core/esquemas.js');
  const campo = ESQUEMAS.cashback_eta.campos.filter((c) => c.id === 'alcanceTurbo')[0];
  const valores = campo.opciones.map((o) => o.valor);

  assert.deepStrictEqual(valores, ['restaurantes', 'turbo', 'tiendas']);
  // Las etiquetas del formulario y los nombres que salen impresos viven en dos
  // archivos distintos a propósito. Esto cuida que no se separen.
  for (const valor of valores) {
    if (valor === 'tiendas') {
      assert.strictEqual(modalidadTurbo({ alcanceTurbo: valor }), '', 'la de tiendas no nombra categoría');
      continue;
    }
    assert.ok(MODALIDAD_POR_ALCANCE[valor], valor + ' no tiene nombre para imprimir');
  }
  // Sin respuesta, el documento dice lo que decían los dos publicados.
  assert.strictEqual(modalidadTurbo({}), 'Turbo Restaurantes');
});

test('la lista de tiendas se revisa, y solo cuando aplica', () => {
  const { validarTiendasEta } = require('../src/core/validaciones.js');
  const esquema = esquemaDe('cashback_eta');

  // Una campaña de categoría no lleva lista, así que no se le exige.
  assert.deepStrictEqual(validarTiendasEta({ alcanceTurbo: 'restaurantes' }, esquema), []);

  assert.strictEqual(validarTiendasEta({ alcanceTurbo: 'tiendas', tiendasEta: [] }, esquema).length, 1);
  assert.strictEqual(
    validarTiendasEta({ alcanceTurbo: 'tiendas', tiendasEta: [{ nombre: 'Turbo Chico' }] }, esquema).length, 0);

  // La misma tienda dos veces la nombraría dos veces, y las mayúsculas no la
  // vuelven otra tienda.
  const repetida = validarTiendasEta(
    { alcanceTurbo: 'tiendas', tiendasEta: [{ nombre: 'Turbo Chico' }, { nombre: 'turbo chico' }] }, esquema);
  assert.strictEqual(repetida.length, 1);
  assert.ok(repetida[0].mensaje.indexOf('ya está en la lista') !== -1, repetida[0].mensaje);
});
