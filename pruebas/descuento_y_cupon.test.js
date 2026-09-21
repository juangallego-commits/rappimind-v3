'use strict';

/**
 * El Descuento y el Cupón: lo que cambia cuando cambia la forma del beneficio.
 *
 * Los casos dorados fijan cuatro combinaciones, una por forma. Aquí va lo otro:
 * que la frase cambie cuando tiene que cambiar y se quede igual cuando no. Es la
 * parte que un caso dorado no ve, y en estos dos modelos es justo donde está el
 * riesgo, porque el mismo documento sirve para rebajar un precio y para regalar
 * un envío, y esas dos cosas no se calculan igual.
 */

const test = require('node:test');
const assert = require('node:assert');

const { rutaDesdeRaiz, leerJson } = require('../scripts/lib/archivos');
const { cargarModelos } = require('../scripts/lib/modelos');
const { generarTexto } = require('../src/core/generar.js');
const { validarSolicitud } = require('../src/core/validaciones.js');
const { textoPlano } = require('../src/core/texto.js');
const { camposVisibles } = require('../src/core/esquemas.js');
const { nombreDeCampana } = require('../src/core/nombres.js');
const { ESQUEMAS } = require('../src/core/esquemas.js');
const { PREGUNTAS } = require('../src/core/preguntas.js');
const {
  FORMAS_DEL_DESCUENTO, codigoDeCupon, unidadesEnLetras,
} = require('../src/core/derivados_descuento.js');
const { solicitud } = require('./dobles/solicitudes.js');

const { paises } = leerJson(rutaDesdeRaiz('data', 'paises.json'));
const modelos = cargarModelos();
const FECHA = '2026-09-16';
const MX = paises.filter((p) => p.codigo === 'MX')[0];

function documento(tipo, respuestas, pais) {
  const fila = pais || MX;
  const salida = generarTexto(solicitud(fila.codigo, tipo, respuestas), fila, modelos, {
    fechaReferencia: FECHA,
    usuarioEnEquipo: true,
  });
  assert.ok(salida.valido, 'no generó: ' + salida.errores.map((e) => e.campo + ' ' + e.mensaje).join(' | '));
  return textoPlano(salida.texto);
}

function errores(tipo, respuestas, pais) {
  const fila = pais || MX;
  const revision = validarSolicitud(solicitud(fila.codigo, tipo, respuestas), fila, {
    fechaReferencia: FECHA,
    usuarioEnEquipo: true,
  });
  return revision.errores;
}

// --- La forma del beneficio decide sobre qué se calcula ----------------------

test('cada forma del beneficio dice en qué consiste, y las cinco son distintas', () => {
  const frases = {};
  for (const forma of FORMAS_DEL_DESCUENTO) {
    const texto = documento('descuento', { formaDelDescuento: forma.valor });
    const linea = texto.split('\n').filter((l) => l.indexOf('El Beneficio consiste en') !== -1)[0];
    assert.ok(linea, forma.valor + ': el documento no dice en qué consiste el Beneficio');
    frases[forma.valor] = linea;
  }
  assert.strictEqual(new Set(Object.values(frases)).size, FORMAS_DEL_DESCUENTO.length,
    'dos formas del beneficio imprimen la misma frase');
});

test('una campaña de envío gratis no dice que el Beneficio excluye el envío', () => {
  /*
   * Es la contradicción que obligó a separar exclusiones_descuento de
   * exclusiones_beneficio. La viñeta "Propinas, costos de envío, tarifas de
   * servicio e impuestos" es correcta para el Cashback y falsa aquí, y una
   * contradicción impresa se resuelve a favor del usuario.
   */
  for (const forma of ['envio', 'envio_y_tarifa']) {
    const texto = documento('descuento', { formaDelDescuento: forma });
    assert.ok(texto.indexOf('El Beneficio cubre únicamente el costo de envío') !== -1, forma);
    assert.strictEqual(texto.indexOf('sin incluir el costo de envío'), -1,
      forma + ': el documento excluye el envío en una campaña cuyo beneficio es el envío');
  }

  const tarifa = documento('descuento', { formaDelDescuento: 'tarifa_servicio' });
  assert.ok(tarifa.indexOf('El Beneficio cubre únicamente la tarifa de servicio') !== -1);
  assert.strictEqual(tarifa.indexOf('sin incluir el costo de envío, la tarifa de servicio'), -1);

  // Y con un descuento sobre el precio sí sale la base de cálculo del Cashback.
  const porcentaje = documento('descuento', { formaDelDescuento: 'porcentaje' });
  assert.ok(porcentaje.indexOf('sin incluir el costo de envío, la tarifa de servicio ni las propinas') !== -1);
});

test('el tope se pregunta solo donde cabe, y con el envío dice quién paga el exceso', () => {
  const pideTope = (forma) =>
    camposVisibles('descuento', { tipo: 'descuento', formaDelDescuento: forma }).map((c) => c.id).indexOf('tope') !== -1;

  assert.ok(pideTope('porcentaje'), 'un porcentaje sin techo se come el presupuesto');
  assert.ok(pideTope('envio'), 'el envío gratis sí puede tener tope: Legal Brasil ya lo tiene escrito');
  assert.ok(pideTope('envio_y_tarifa'));
  assert.ok(!pideTope('monto'), 'con monto fijo el tope ya es el monto');
  assert.ok(!pideTope('tarifa_servicio'), 'la tarifa de servicio no lleva tope en ningún documento aprobado');

  const conEnvio = documento('descuento', { formaDelDescuento: 'envio', tope: 5000 });
  assert.ok(conEnvio.indexOf('el valor que exceda ese monto lo asume el Usuario/Consumidor') !== -1, conEnvio);

  // Con un descuento sobre el precio la frase no lleva esa coletilla: lo que
  // pase del tope no se cobra, simplemente no se descuenta.
  const conPorcentaje = documento('descuento', { formaDelDescuento: 'porcentaje', tope: 5000 });
  assert.ok(conPorcentaje.indexOf('el Beneficio máximo por cada pedido es de') !== -1);
  assert.strictEqual(conPorcentaje.indexOf('lo asume el Usuario/Consumidor'), -1);
});

test('el tope es opcional y sin él la viñeta desaparece entera', () => {
  const sinTope = documento('descuento', { formaDelDescuento: 'porcentaje', tope: null });
  assert.strictEqual(sinTope.indexOf('Tope por pedido:'), -1, 'quedó la viñeta del tope vacía');
  assert.ok(sinTope.indexOf('Máximo de pedidos:') !== -1, 'se llevó por delante la viñeta de al lado');
  assert.ok(PREGUNTAS.tope.variantes.descuento.opcional, 'el tope no se ve opcional en el Descuento');
});

// --- Cómo termina la campaña -------------------------------------------------

test('la vigencia solo nombra lo que de verdad puede agotarse', () => {
  const porFecha = documento('descuento', { agotamiento: 'fecha' });
  assert.strictEqual(porFecha.indexOf('o hasta agotar'), -1, 'promete un agotamiento que no existe');
  assert.strictEqual(porFecha.indexOf('Límite de la Campaña:'), -1);

  const porPresupuesto = documento('descuento', { agotamiento: 'presupuesto', presupuesto: 3000000 });
  assert.ok(porPresupuesto.indexOf('o hasta agotar el presupuesto disponible, lo que ocurra primero') !== -1);
  assert.ok(porPresupuesto.indexOf('un presupuesto total de tres millones de pesos MXN ($3,000,000)') !== -1);

  const porUnidades = documento('descuento', { agotamiento: 'unidades', unidadesDisponibles: 250 });
  assert.ok(porUnidades.indexOf('o hasta agotar las unidades disponibles, lo que ocurra primero') !== -1);
  assert.ok(porUnidades.indexOf('la Campaña cuenta con doscientos cincuenta (250) pedidos con Beneficio') !== -1);
});

test('una sola unidad no sale en plural', () => {
  const una = documento('descuento', { agotamiento: 'unidades', unidadesDisponibles: 1 });
  assert.ok(una.indexOf('cuenta con un (1) pedido con Beneficio. Una vez agotado,') !== -1, una);
  assert.strictEqual(/\(1\) pedidos/.test(una), false, 'quedó "(1) pedidos"');
});

test('las unidades llevan el separador de miles del país', () => {
  // letrasYCifra escribe la cifra sin separador, que está bien para "un (1)
  // pedido" y mal para "(25000)" al lado de un "$25.000" del mismo documento.
  assert.strictEqual(unidadesEnLetras(25000, { separador_miles: '.' }), 'veinticinco mil (25.000)');
  assert.strictEqual(unidadesEnLetras(25000, { separador_miles: ',' }), 'veinticinco mil (25,000)');
  assert.strictEqual(unidadesEnLetras(1, { separador_miles: '.' }), 'un (1)');
});

// --- El Cupón ----------------------------------------------------------------

test('el cierre del Cupón solo nombra unidades o presupuesto cuando los hay', () => {
  const porFecha = documento('cupon', { agotamiento: 'fecha' });
  assert.ok(porFecha.indexOf('solo puede utilizarse durante la vigencia de la Campaña.') !== -1, porFecha);

  const porUnidades = documento('cupon', { agotamiento: 'unidades', unidadesDisponibles: 300 });
  assert.ok(porUnidades.indexOf('durante la vigencia de la Campaña y mientras queden unidades disponibles.') !== -1);

  const porPresupuesto = documento('cupon', { agotamiento: 'presupuesto', presupuesto: 900000 });
  assert.ok(porPresupuesto.indexOf('durante la vigencia de la Campaña y mientras haya presupuesto disponible.') !== -1);
});

test('las dos formas de activar el cupón dicen cosas distintas, y el código va impreso', () => {
  const conCodigo = documento('cupon', { activacionCupon: 'codigo', codigoCupon: 'VERANO20' });
  assert.ok(conCodigo.indexOf('debes ingresar el código VERANO20 en la sección “Cupones”') !== -1, conCodigo);

  const deLaSeccion = documento('cupon', { activacionCupon: 'seccion' });
  assert.ok(deLaSeccion.indexOf('debes activar el cupón de la Campaña en la sección “Cupones”') !== -1);
  assert.strictEqual(deLaSeccion.indexOf('ingresar el código'), -1);

  // Y sin código no se pregunta el código.
  const campos = camposVisibles('cupon', { tipo: 'cupon', activacionCupon: 'seccion' }).map((c) => c.id);
  assert.strictEqual(campos.indexOf('codigoCupon'), -1);
});

test('el código sale impreso como se teclea: en mayúsculas y sin espacios', () => {
  assert.strictEqual(codigoDeCupon({ codigoCupon: ' verano20 ' }), 'VERANO20');
  assert.strictEqual(codigoDeCupon({ codigoCupon: '' }), '');
  assert.strictEqual(codigoDeCupon({}), '');
});

test('un código con espacios no pasa: en la aplicación ese cupón no existe', () => {
  /*
   * Se valida sobre lo que el comercial escribió y no sobre la versión
   * normalizada. Aceptar "RAPPI 30" en silencio y publicar "RAPPI30" sería
   * publicar un código que nadie aprobó.
   */
  const conEspacio = errores('cupon', { activacionCupon: 'codigo', codigoCupon: 'RAPPI 30' });
  assert.deepStrictEqual(conEspacio.map((e) => e.campo), ['codigoCupon']);
  assert.strictEqual(conEspacio[0].mensaje, PREGUNTAS.codigoCupon.errores.formato);

  for (const malo of ['RAPPI_30', 'RAPPI.30', 'RAPPI/30', 'ÑOÑO30']) {
    assert.deepStrictEqual(
      errores('cupon', { activacionCupon: 'codigo', codigoCupon: malo }).map((e) => e.campo),
      ['codigoCupon'], malo + ' debería rechazarse');
  }
  for (const bueno of ['RAPPI30', 'rappi30', 'RAPPI-30', '30OFF']) {
    assert.deepStrictEqual(
      errores('cupon', { activacionCupon: 'codigo', codigoCupon: bueno }).map((e) => e.campo),
      [], bueno + ' debería pasar');
  }

  const largo = errores('cupon', { activacionCupon: 'codigo', codigoCupon: 'A'.repeat(25) });
  assert.deepStrictEqual(largo.map((e) => e.campo), ['codigoCupon']);
  assert.strictEqual(largo[0].mensaje, PREGUNTAS.codigoCupon.errores.largo);
});

// --- Cruces ------------------------------------------------------------------

test('un tope mayor que el presupuesto no se genera', () => {
  const revision = errores('descuento', {
    formaDelDescuento: 'porcentaje', tope: 900000, agotamiento: 'presupuesto', presupuesto: 500000,
  });
  assert.deepStrictEqual(revision.map((e) => e.campo), ['tope']);
  assert.strictEqual(revision[0].mensaje, PREGUNTAS.tope.errores.mayorQuePresupuesto);
});

test('la lista de productos con EAN se revisa igual que en la Carrera', () => {
  // Un EAN mal copiado del empaque salía impreso dentro de la cláusula de
  // Productos Participantes y nadie se enteraba.
  const malo = errores('descuento', {
    productos: 'especificos',
    productosDetalle: [{ nombre: 'Galletas Lunaria', ean: '7702001008286' }],
  });
  assert.deepStrictEqual(malo.map((e) => e.campo), ['productosDetalle']);

  const bueno = errores('descuento', {
    productos: 'especificos',
    productosDetalle: [{ nombre: 'Galletas Lunaria', ean: '7702001008285' }],
  });
  assert.deepStrictEqual(bueno.map((e) => e.campo), []);
});

// --- El nombre de la campaña -------------------------------------------------

test('el nombre no promete un porcentaje que el articulado no tiene', () => {
  const base = { tienda: 'El Corral', fechaInicio: '2026-10-01', porcentaje: 30 };

  assert.strictEqual(
    nombreDeCampana(Object.assign({}, base, { formaDelDescuento: 'porcentaje' }), ESQUEMAS.descuento),
    'El Corral · 30% Descuento · 1 oct 2026');
  assert.strictEqual(
    nombreDeCampana(Object.assign({}, base, { formaDelDescuento: 'porcentaje' }), ESQUEMAS.cupon),
    'El Corral · 30% Cupón · 1 oct 2026');

  // Con monto fijo el porcentaje que quedó en la entrada de un tipo anterior no
  // puede colarse al título: un "30%" al lado del nombre se lee como el
  // descuento, y el articulado diría otra cosa.
  assert.strictEqual(
    nombreDeCampana(Object.assign({}, base, { formaDelDescuento: 'monto', montoDescuento: 10000 }), ESQUEMAS.descuento),
    'El Corral · Descuento · 1 oct 2026');

  assert.strictEqual(
    nombreDeCampana(Object.assign({}, base, { formaDelDescuento: 'envio' }), ESQUEMAS.descuento),
    'El Corral · Descuento de envío gratis · 1 oct 2026');
  assert.strictEqual(
    nombreDeCampana(Object.assign({}, base, { formaDelDescuento: 'envio_y_tarifa' }), ESQUEMAS.cupon),
    'El Corral · Cupón de envío y tarifa de servicio gratis · 1 oct 2026');
});

test('el Cupom de Brasil se titula como Cupom, no como la Promoção', () => {
  const BR = paises.filter((p) => p.codigo === 'BR')[0];
  const base = { tienda: 'Petz', fechaInicio: '2026-10-01', porcentaje: 10, beneficioBr: 'desconto' };

  assert.strictEqual(nombreDeCampana(base, ESQUEMAS.promocao_br, BR), 'Petz · 10% OFF · 1 out 2026');
  assert.strictEqual(nombreDeCampana(base, ESQUEMAS.cupom_br, BR), 'Petz · Cupom 10% OFF · 1 out 2026');
  assert.strictEqual(
    nombreDeCampana(Object.assign({}, base, { beneficioBr: 'frete_gratis' }), ESQUEMAS.cupom_br, BR),
    'Petz · Cupom Frete grátis · 1 out 2026');
});
