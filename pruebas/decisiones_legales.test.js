'use strict';

/**
 * Las decisiones de Legal que cambian una frase según lo que responde el comercial.
 *
 * Vienen de la respuesta al encargo 01 (`docs/encargos/respuestas/01-legal.md`).
 * Los casos dorados de `casos_base.json` fijan el texto de una combinación cada
 * uno; lo que se protege aquí es lo otro: que la frase cambie cuando tiene que
 * cambiar y se quede igual cuando no. Esa es la parte que un caso dorado no ve.
 */

const test = require('node:test');
const assert = require('node:assert');

const { calcularDerivados } = require('../src/core/derivados.js');
const { calcularDerivadosTravel } = require('../src/core/derivados_travel.js');
const { paisDesdeFila } = require('../src/core/paises.js');
const { rutaDesdeRaiz, leerJson } = require('../scripts/lib/archivos');

const PAISES = leerJson(rutaDesdeRaiz('data', 'paises.json')).paises.map(paisDesdeFila);
const porCodigo = (codigo) => PAISES.filter((p) => p.codigo === codigo)[0];
const CO = porCodigo('CO');

function cashback(extra) {
  return calcularDerivados(Object.assign({ tipo: 'cashback', segmento: 'todos' }, extra), CO);
}

function travel(extra) {
  return calcularDerivadosTravel(
    Object.assign({ tipo: 'cashback_travel', formaBeneficio: 'porcentaje' }, extra), CO, {});
}

// --- Decisión 18: la verificación de elegibilidad -----------------------------

/**
 * "Verificamos antes de acreditar" y "acreditamos de manera inmediata" no
 * pueden ser ciertas a la vez, y una contradicción impresa se resuelve a favor
 * del usuario: acreditación inmediata y sin verificación. Con carga inmediata,
 * la verificación pasa a ser posterior y con reversión.
 */
test('con carga inmediata la verificación es posterior y con reversión', () => {
  const frase = cashback({ carga: 'inmediata' }).TEXTO_VERIFICACION;
  assert.ok(frase.indexOf('después de acreditar el Beneficio') !== -1, frase);
  assert.ok(frase.indexOf('descontar o revocar los Créditos acreditados') !== -1, frase);
  assert.ok(frase.indexOf('antes de acreditar') === -1, 'quedó la contradicción: ' + frase);
});

test('con carga al día siguiente o en una fecha, la verificación sigue siendo previa', () => {
  for (const carga of ['dia_siguiente', 'fecha']) {
    const frase = cashback({ carga: carga, fechaCarga: '2026-10-01' }).TEXTO_VERIFICACION;
    assert.ok(frase.indexOf('antes de acreditar el Beneficio') !== -1, carga + ': ' + frase);
    assert.ok(frase.indexOf('los Créditos no serán acreditados') !== -1, carga + ': ' + frase);
  }
});

test('en Travel la verificación cambia con la carga al confirmarse la reserva', () => {
  const alConfirmarse = travel({ carga: 'al_confirmarse' }).TEXTO_VERIFICACION_TRAVEL;
  assert.ok(alConfirmarse.indexOf('Rappi Travel podrá verificar') !== -1, alConfirmarse);
  assert.ok(alConfirmarse.indexOf('después de acreditar el Beneficio') !== -1, alConfirmarse);

  const enDias = travel({ carga: 'dias_habiles', diasCarga: 10 }).TEXTO_VERIFICACION_TRAVEL;
  assert.ok(enDias.indexOf('se reserva el derecho de verificar') !== -1, enDias);
  assert.ok(enDias.indexOf('antes de acreditar el Beneficio') !== -1, enDias);
});

test('la verificación nunca sale vacía en un documento que la pide', () => {
  // Va dentro del bloque compartido acreditacion, que usan cashback,
  // cashback_day y cashback_eta. Si se queda sin valor, el documento no se
  // genera y el comercial no entiende por qué.
  for (const carga of ['inmediata', 'dia_siguiente', 'fecha']) {
    assert.ok(cashback({ carga: carga }).TEXTO_VERIFICACION, 'sin frase con carga ' + carga);
  }
});

// --- Decisión 35: los días de "reactivados" ----------------------------------

test('los días sin comprar se nombran con el término de cada país', () => {
  const entrada = { tipo: 'cashback', segmento: 'reactivados', diasSinCompra: 30, carga: 'dia_siguiente' };
  assert.ok(calcularDerivados(entrada, CO).TEXTO_SEGMENTO.indexOf('treinta (30) días calendario') !== -1);
  assert.ok(calcularDerivados(entrada, porCodigo('MX')).TEXTO_SEGMENTO.indexOf('treinta (30) días naturales') !== -1);
  assert.ok(calcularDerivados(entrada, porCodigo('AR')).TEXTO_SEGMENTO.indexOf('treinta (30) días corridos') !== -1);

  // "días" a secas dejaba discutir si eran hábiles a quien quedó por fuera por
  // pocos días.
  const co = calcularDerivados(entrada, CO).TEXTO_SEGMENTO;
  assert.ok(!/\(30\) días anteriores/.test(co), 'volvió el "días" sin término del país: ' + co);
});

// --- Decisión 22: la base de cálculo de Travel -------------------------------

test('el cashback de Travel se calcula sin impuestos, tasas ni contribuciones', () => {
  const frase = travel({ categorias: ['Vuelos'] }).TEXTO_BASE_CALCULO_TRAVEL;
  assert.ok(frase.indexOf('antes de impuestos, tasas y contribuciones') !== -1, frase);
  assert.ok(frase.indexOf('el IVA, las tasas aeroportuarias') !== -1, frase);
});

test('con Asistencia marcada se sigue quitando la exclusión de seguros de viaje', () => {
  const conAsistencia = travel({ categorias: ['Vuelos', 'Asistencia'] }).TEXTO_BASE_CALCULO_TRAVEL;
  assert.ok(conAsistencia.indexOf('asistencias o seguros de viaje') === -1, conAsistencia);
  assert.ok(conAsistencia.indexOf('antes de impuestos, tasas y contribuciones') !== -1, conAsistencia);
});

test('el ejemplo del tope habla del valor que cuenta, no del valor pagado', () => {
  const frase = travel({ categorias: ['Vuelos'], porcentaje: 10, tope: 100000 }).TEXTO_EJEMPLO_TOPE_TRAVEL;
  assert.ok(frase.indexOf('el valor que cuenta para el cálculo del Beneficio') !== -1, frase);
  assert.ok(frase.indexOf('si es menor, recibirás el 10% de ese valor') !== -1, frase);
  // Si el ejemplo dijera "el valor pagado", le prometería el tope a quien paga
  // el umbral con impuestos incluidos aunque su tarifa sin impuestos no llegue.
  assert.ok(frase.indexOf('el valor pagado debe ser') === -1, frase);
});

// --- Decisión 43: el ámbito, según las categorías marcadas -------------------

test('una campaña solo de vuelos no habla de servicios, y al revés', () => {
  assert.strictEqual(travel({ categorias: ['Vuelos'], ambito: 'nacional' }).TEXTO_AMBITO_TRAVEL,
    'Aplica únicamente para vuelos con origen y destino en la República de Colombia.');
  assert.strictEqual(travel({ categorias: ['Vuelos'], ambito: 'internacional' }).TEXTO_AMBITO_TRAVEL,
    'Aplica únicamente para vuelos con origen o destino fuera de la República de Colombia.');
  assert.strictEqual(travel({ categorias: ['Hoteles', 'Autos'], ambito: 'nacional' }).TEXTO_AMBITO_TRAVEL,
    'Aplica únicamente para servicios que se presten en la República de Colombia.');
  assert.strictEqual(travel({ categorias: ['Hoteles'], ambito: 'internacional' }).TEXTO_AMBITO_TRAVEL,
    'Aplica únicamente para servicios que se presten fuera de la República de Colombia.');
});

test('con vuelos y otras categorías juntas se queda la frase completa', () => {
  const mezcla = travel({ categorias: ['Vuelos', 'Hoteles'], ambito: 'nacional' }).TEXTO_AMBITO_TRAVEL;
  assert.ok(mezcla.indexOf('vuelos con origen y destino') !== -1, mezcla);
  assert.ok(mezcla.indexOf('servicios que se presten') !== -1, mezcla);

  // Un Paquete lleva vuelo y alojamiento: acortar la frase perdería una de las
  // dos cosas, así que va la completa, que nombra las dos.
  const paquetes = travel({ categorias: ['Paquetes'], ambito: 'nacional' }).TEXTO_AMBITO_TRAVEL;
  assert.strictEqual(paquetes, mezcla);
});

test('sin ámbito elegido no se dice nada del ámbito', () => {
  assert.strictEqual(travel({ categorias: ['Vuelos'] }).TEXTO_AMBITO_TRAVEL, '');
  assert.strictEqual(travel({ categorias: ['Vuelos'], ambito: 'ambos' }).TEXTO_AMBITO_TRAVEL, '');
});

// --- Decisión 30: el ETA no se paga si el retraso es del usuario -------------

test('el modelo del ETA deja a salvo las causas del usuario y la fuerza mayor', () => {
  const { cargarModelos } = require('../scripts/lib/modelos');
  const eta = cargarModelos().modelos.cashback_eta;
  assert.ok(eta.indexOf('Rappi se obliga a cumplir con el ETA exhibido dentro de la Plataforma Rappi.') !== -1);
  assert.ok(eta.indexOf('No habrá lugar al Beneficio cuando el retraso se deba a causas que te sean imputables') !== -1);
  assert.ok(eta.indexOf('ni cuando obedezca a fuerza mayor o caso fortuito') !== -1);
});
