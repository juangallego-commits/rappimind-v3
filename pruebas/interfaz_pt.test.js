'use strict';

/**
 * La interfaz en portugués.
 *
 * Son dos idiomas distintos y conviene no confundirlos:
 *
 *   - El del **documento** sale del país y no se elige. Un T&C de Brasil va en
 *     portugués siempre.
 *   - El de la **interfaz** lo elige quien llena el formulario, con el botón de
 *     abajo a la derecha.
 *
 * Lo que se protege aquí: que las preguntas que un KAM de Brasil recorre de
 * verdad estén todas traducidas, y que el español no cambie.
 */

const test = require('node:test');
const assert = require('node:assert');

const { ESQUEMAS } = require('../src/core/esquemas.js');
const { preguntaDe } = require('../src/core/preguntas.js');
const { preguntaEnIdioma, PREGUNTAS_PT } = require('../src/core/preguntas_pt.js');
const { traducirInterfaz, IDIOMAS_DE_INTERFAZ } = require('../src/core/textos_interfaz.js');

/** Los campos que un comercial de Brasil ve de verdad. */
const CAMPOS_DE_BRASIL = ESQUEMAS.promocao_br.campos
  .filter((campo) => preguntaDe(campo.id, 'promocao_br').pregunta)
  .map((campo) => campo.id);

test('todas las preguntas que ve un KAM de Brasil están en portugués', () => {
  const sinTraducir = CAMPOS_DE_BRASIL.filter((id) => !PREGUNTAS_PT[id]);
  assert.deepStrictEqual(sinTraducir, [],
    'faltan por traducir: ' + sinTraducir.join(', '));
});

test('cada pregunta traducida trae enunciado, ayuda y porqué', () => {
  for (const id of CAMPOS_DE_BRASIL) {
    const pt = PREGUNTAS_PT[id];
    assert.ok(pt.pregunta, id + ' no tiene enunciado en portugués');
    assert.ok(pt.ayuda, id + ' no tiene ayuda en portugués');
    assert.ok(pt.porQue, id + ' no explica por qué se pregunta');
    assert.ok(pt.errores && pt.errores.vacio, id + ' no dice qué pasa si se deja vacío');
  }
});

test('las opciones traducidas cubren todas las del español', () => {
  for (const id of CAMPOS_DE_BRASIL) {
    const enEspanol = preguntaDe(id, 'promocao_br');
    const pt = PREGUNTAS_PT[id];
    if (!enEspanol.opciones) continue;
    assert.ok(pt.opciones, id + ' tiene opciones en español y ninguna en portugués');
    for (const opcion of enEspanol.opciones) {
      assert.ok(pt.opciones[opcion.valor],
        id + ': la opción "' + opcion.valor + '" no está traducida');
    }
  }
});

test('las opciones se traducen por su valor, no por su posición', () => {
  const enPt = preguntaEnIdioma(preguntaDe('beneficioBr', 'promocao_br'), 'beneficioBr', 'pt');
  for (const opcion of enPt.opciones) {
    const esperada = PREGUNTAS_PT.beneficioBr.opciones[opcion.valor];
    assert.strictEqual(opcion.etiqueta, esperada.etiqueta, 'se desalineó la opción ' + opcion.valor);
  }
});

test('lo que no está traducido sale en español, no vacío ni roto', () => {
  // Un KAM de Brasil no ve las preguntas de Carrera de Compras, así que no están
  // traducidas. Si alguna vez llega a una, tiene que leer algo.
  const sinTraducir = preguntaEnIdioma(preguntaDe('criterioGanador', 'carrera_compras'), 'criterioGanador', 'pt');
  assert.ok(sinTraducir.pregunta, 'una pregunta sin traducir se quedó sin enunciado');
  assert.strictEqual(sinTraducir.pregunta, preguntaDe('criterioGanador', 'carrera_compras').pregunta);

  assert.strictEqual(traducirInterfaz('Un texto que nadie tradujo', 'pt'), 'Un texto que nadie tradujo');
});

test('el español no cambia', () => {
  for (const id of CAMPOS_DE_BRASIL) {
    const original = preguntaDe(id, 'promocao_br');
    assert.strictEqual(preguntaEnIdioma(original, id, 'es'), original, id + ' cambió en español');
  }
  assert.strictEqual(traducirInterfaz('Empezar', 'es'), 'Empezar');
  assert.strictEqual(traducirInterfaz('Empezar'), 'Empezar');
});

test('se ofrecen exactamente los dos idiomas de interfaz', () => {
  assert.deepStrictEqual(IDIOMAS_DE_INTERFAZ.map((i) => i.codigo), ['es', 'pt']);
  for (const idioma of IDIOMAS_DE_INTERFAZ) {
    assert.ok(idioma.nombre && idioma.bandera, idioma.codigo + ' no tiene nombre o etiqueta');
  }
});

test('las pantallas del recorrido tienen su traducción', () => {
  // Las cadenas que un KAM de Brasil lee sí o sí, de principio a fin.
  const imprescindibles = [
    'Genera los Términos y Condiciones de tu campaña', 'Empezar',
    '¿Esta campaña la puedo hacer aquí?', 'Sí', 'No',
    'Siguiente', 'Atrás', 'Tu T&C', 'Revisar y generar',
    'Revisa antes de generar', 'Generar T&C', 'Te falta:',
    'Esta campaña la redacta Legal', 'Volver al inicio',
    'Mis campañas', 'Ayuda', '¿Por qué te preguntamos esto?',
  ];
  for (const texto of imprescindibles) {
    assert.notStrictEqual(traducirInterfaz(texto, 'pt'), texto,
      'sin traducir al portugués: "' + texto + '"');
  }
});
