'use strict';

/**
 * Ampliar una campaña en curso.
 *
 * La regla que se protege aquí: una campaña que ya arrancó solo puede recibir
 * más, nunca menos. Bajarle el presupuesto o adelantarle el fin cambiaría las
 * condiciones de alguien que ya compró.
 */

const test = require('node:test');
const assert = require('node:assert');

const {
  momentoDeLaCampana, puedeAmpliar, validarAmpliacion, aplicarAmpliacion, textoDeAmpliacion,
} = require('../src/core/ampliacion.js');
const { calcularDerivados } = require('../src/core/derivados.js');
const { paisDesdeFila } = require('../src/core/paises.js');
const { rutaDesdeRaiz, leerJson } = require('../scripts/lib/archivos');

const COLOMBIA = paisDesdeFila(
  leerJson(rutaDesdeRaiz('data', 'paises.json')).paises.find((p) => p.codigo === 'CO')
);

function campana(extra) {
  return Object.assign({
    tipo: 'cashback_travel',
    fechaInicio: '2026-10-01', horaInicio: '00:00',
    fechaFin: '2026-10-31', horaFin: '23:59',
    presupuesto: 5000000, maxOrdenes: 20,
  }, extra || {});
}

const PUBLICADA = { link_publicado: 'https://promos.rappi.com/colombia/x' };

test('el momento sale de la hora, no de una casilla', () => {
  assert.strictEqual(momentoDeLaCampana(campana(), '2026-09-20'), 'no_empezada');
  assert.strictEqual(momentoDeLaCampana(campana(), '2026-10-15'), 'en_curso');
  assert.strictEqual(momentoDeLaCampana(campana(), '2026-11-05'), 'terminada');

  // El mismo día cuenta con la hora: una franja de 6 a 8 de la noche.
  const franja = campana({ fechaInicio: '2026-10-15', fechaFin: '2026-10-15', horaInicio: '18:00', horaFin: '20:00' });
  assert.strictEqual(momentoDeLaCampana(franja, '2026-10-15', '17:00'), 'no_empezada');
  assert.strictEqual(momentoDeLaCampana(franja, '2026-10-15', '19:00'), 'en_curso');
  assert.strictEqual(momentoDeLaCampana(franja, '2026-10-15', '21:00'), 'terminada');
});

test('solo se amplía una campaña publicada y en curso', () => {
  assert.strictEqual(puedeAmpliar(PUBLICADA, campana(), '2026-10-15').puede, true);

  // Sin publicar todavía no hay nada que reemplazar en Squarespace.
  assert.strictEqual(puedeAmpliar({ link_publicado: '' }, campana(), '2026-10-15').puede, false);

  // Antes de arrancar se edita y se regenera, no se amplía.
  const antes = puedeAmpliar(PUBLICADA, campana(), '2026-09-20');
  assert.strictEqual(antes.puede, false);
  assert.ok(antes.motivo.indexOf('todavía no arranca') !== -1, antes.motivo);

  // Terminada nunca se reabre.
  const despues = puedeAmpliar(PUBLICADA, campana(), '2026-11-05');
  assert.strictEqual(despues.puede, false);
  assert.ok(despues.motivo.indexOf('Usar como base') !== -1, despues.motivo);
});

test('la vigencia solo se mueve hacia adelante', () => {
  const haciaAtras = validarAmpliacion(campana(), { fechaFin: '2026-10-20' }, '2026-10-15');
  assert.strictEqual(haciaAtras.valido, false);
  assert.strictEqual(haciaAtras.errores[0].campo, 'fechaFin');
  assert.ok(haciaAtras.errores[0].mensaje.indexOf('hacia adelante') !== -1);

  const haciaAdelante = validarAmpliacion(campana(), { fechaFin: '2026-11-15' }, '2026-10-15');
  assert.strictEqual(haciaAdelante.valido, true);
  assert.strictEqual(haciaAdelante.cambios.fechaFin, '2026-11-15');
});

test('los números solo suben', () => {
  const baja = validarAmpliacion(campana(), { presupuesto: 3000000 }, '2026-10-15');
  assert.strictEqual(baja.valido, false);
  assert.ok(baja.errores[0].mensaje.indexOf('quien ya compró') !== -1, baja.errores[0].mensaje);

  const sube = validarAmpliacion(campana(), { presupuesto: 9000000, maxOrdenes: 40 }, '2026-10-15');
  assert.strictEqual(sube.valido, true);
  assert.deepStrictEqual(sube.cambios, { presupuesto: 9000000, maxOrdenes: 40 });
});

test('una ampliación vacía se rechaza con su razón', () => {
  const nada = validarAmpliacion(campana(), {}, '2026-10-15');
  assert.strictEqual(nada.valido, false);
  assert.ok(nada.errores[0].mensaje.indexOf('No pediste ningún cambio') !== -1);
});

test('una campaña que no está en curso no se puede ampliar', () => {
  const terminada = validarAmpliacion(campana(), { presupuesto: 9000000 }, '2026-11-05');
  assert.strictEqual(terminada.valido, false);
  assert.ok(terminada.errores[0].mensaje.indexOf('ya terminó') !== -1, terminada.errores[0].mensaje);
});

test('la ampliación no toca la entrada original y deja su nota', () => {
  const original = campana();
  const nueva = aplicarAmpliacion(original, { fechaFin: '2026-11-15', horaFin: '23:59', presupuesto: 9000000 }, '2026-10-15');

  assert.strictEqual(original.fechaFin, '2026-10-31', 'se modificó la entrada original');
  assert.strictEqual(original.modificaciones, undefined);

  assert.strictEqual(nueva.fechaFin, '2026-11-15');
  assert.strictEqual(nueva.presupuesto, 9000000);
  assert.strictEqual(nueva.modificaciones.length, 1);
  assert.strictEqual(nueva.modificaciones[0].fecha, '2026-10-15');
});

test('la nota de modificación sale escrita en el documento', () => {
  const nueva = aplicarAmpliacion(campana(), { fechaFin: '2026-11-15', horaFin: '23:59', presupuesto: 9000000 }, '2026-10-15');
  const texto = calcularDerivados(nueva, COLOMBIA).TEXTO_NOTAS_DE_MODIFICACION;

  assert.ok(texto.indexOf('Modificación del 15 de octubre de 2026') !== -1, texto);
  assert.ok(texto.indexOf('la vigencia de la Campaña se amplía hasta las 11:59 p. m. del 15 de noviembre de 2026') !== -1, texto);
  assert.ok(texto.indexOf('el presupuesto de la Campaña se amplía a') !== -1, texto);
  assert.ok(texto.indexOf('los Beneficios ya otorgados se mantienen') !== -1, texto);
});

test('dos ampliaciones dejan dos notas, en orden', () => {
  const una = aplicarAmpliacion(campana(), { presupuesto: 9000000 }, '2026-10-10');
  const dos = aplicarAmpliacion(una, { maxOrdenes: 60 }, '2026-10-20');

  assert.strictEqual(dos.modificaciones.length, 2);
  const texto = calcularDerivados(dos, COLOMBIA).TEXTO_NOTAS_DE_MODIFICACION;
  assert.ok(texto.indexOf('Modificación del 10 de octubre de 2026') < texto.indexOf('Modificación del 20 de octubre de 2026'));
});

test('en un descuento la nota habla de descuentos, no de Créditos', () => {
  const descuento = campana({ tipo: 'descuento_travel', unidades: 100, presupuesto: null, maxOrdenes: null });
  const nueva = aplicarAmpliacion(descuento, { unidades: 250 }, '2026-10-15');
  const texto = calcularDerivados(nueva, COLOMBIA).TEXTO_NOTAS_DE_MODIFICACION;

  assert.ok(texto.indexOf('las unidades con descuento se amplían a doscientas cincuenta (250)') !== -1, texto);
  assert.ok(texto.indexOf('los descuentos ya aplicados se mantienen') !== -1, texto);
});

test('el historial dice en palabras por qué no se puede ampliar', () => {
  assert.ok(textoDeAmpliacion(PUBLICADA, campana(), '2026-10-15').indexOf('está en curso') !== -1);
  assert.ok(textoDeAmpliacion(PUBLICADA, campana(), '2026-11-05').indexOf('Usar como base') !== -1);
  assert.ok(textoDeAmpliacion({ link_publicado: '' }, campana(), '2026-10-15').indexOf('no está publicada') !== -1);
});

test('las respuestas para reusar salen sin la nota de la ampliación ni el consecutivo', () => {
  // "Usar como base" devolvía datos_json tal cual: la campaña nueva imprimía
  // la nota de modificación de la vieja y su primera ampliación decía versión 3.
  const { sinRastroDeAmpliacion } = require('../src/core/ampliacion.js');
  const ampliada = aplicarAmpliacion(campana({ sufijoNombre: 2 }), { presupuesto: 3000000 }, '2026-09-16');
  assert.strictEqual(ampliada.modificaciones.length, 1);

  const limpia = sinRastroDeAmpliacion(ampliada);
  assert.strictEqual(limpia.modificaciones, undefined);
  assert.strictEqual(limpia.sufijoNombre, undefined);
  assert.strictEqual(limpia.presupuesto, 3000000, 'lo demás se conserva');
});

/*
 * Un tipo que no pregunta la fecha de fin.
 *
 * El cashback por ETA es de un solo día: termina el día que empieza, y por eso
 * su esquema no tiene fechaFin. momentoDeLaCampana leía entrada.fechaFin en
 * crudo, así que para él esa campaña no terminaba nunca y ofrecía ampliarla
 * años después de haber acabado. validaciones.js ya había resuelto lo mismo
 * con fechaFinDeLaCampana(), y aquí no se había propagado.
 *
 * La pantalla rellena esa fecha al responder el día de inicio, así que por el
 * camino normal no se llegaba. Por el de una solicitud guardada antes de que
 * el navegador lo hiciera, sí.
 */
test('una campaña de un solo día termina ese día, aunque el tipo no pregunte el fin', () => {
  const unDia = { tipo: 'cashback_eta', fechaInicio: '2026-10-15', horaInicio: '09:00', horaFin: '15:00' };

  assert.strictEqual(momentoDeLaCampana(unDia, '2026-10-15', '12:00'), 'en_curso');
  assert.strictEqual(momentoDeLaCampana(unDia, '2026-10-15', '16:00'), 'terminada');
  assert.strictEqual(momentoDeLaCampana(unDia, '2026-10-16', '12:00'), 'terminada');
  assert.strictEqual(momentoDeLaCampana(unDia, '2035-01-01', '12:00'), 'terminada');

  const publicada = { link_publicado: 'https://rappi.com/x' };
  assert.strictEqual(puedeAmpliar(publicada, unDia, '2027-06-30', '12:00').puede, false,
    'ofreció ampliar una campaña de un día que terminó hace meses');
});

test('y un tipo que sí pregunta el fin sigue igual', () => {
  const conFin = {
    tipo: 'cashback', fechaInicio: '2026-10-15', horaInicio: '09:00',
    fechaFin: '2026-10-20', horaFin: '23:59',
  };
  assert.strictEqual(momentoDeLaCampana(conFin, '2026-10-17', '12:00'), 'en_curso');
  assert.strictEqual(momentoDeLaCampana(conFin, '2026-10-21', '12:00'), 'terminada');
});
