'use strict';

/** El contenido de Ayuda, y los compromisos que adquirió con Anna. */

const test = require('node:test');
const assert = require('node:assert');

const {
  AVISO_AZAR, CONTACTOS, PASOS_SQUARESPACE, SI_ALGO_SALE_MAL, PREGUNTAS_FRECUENTES,
} = require('../src/core/ayuda.js');

test('el aviso de azar está marcado como borrador para revisión', () => {
  assert.strictEqual(AVISO_AZAR.borrador, true, 'es contenido legal: tiene que ir marcado');
});

test('el aviso de azar dice que hay que consultar ANTES de lanzar', () => {
  assert.ok(/antes de lanzarla/i.test(AVISO_AZAR.entrada));
  assert.ok(/consulta antes de lanzar/i.test(AVISO_AZAR.regla));
});

test('el aviso trae ejemplos válidos, no válidos y de frontera', () => {
  assert.ok(AVISO_AZAR.validas.length >= 3);
  assert.ok(AVISO_AZAR.noValidas.length >= 4);
  assert.ok(AVISO_AZAR.frontera.length >= 3);
});

test('los ejemplos no válidos cubren las mecánicas que nombró Juan', () => {
  const texto = AVISO_AZAR.noValidas.join(' ').toLowerCase();
  for (const mecanica of ['sorteo', 'rifa', 'raspa y gana', 'ruleta']) {
    assert.ok(texto.indexOf(mecanica) !== -1, 'falta el ejemplo de ' + mecanica);
  }
});

test('los contactos son los tres que pidió Anna, sin Dave', () => {
  const nombres = CONTACTOS.map((c) => c.nombre);
  assert.deepStrictEqual(nombres.sort(), ['Anna Habermann', 'Juan Camilo Gallego', 'Paula Barahona']);
  assert.ok(JSON.stringify(CONTACTOS).indexOf('Dave') === -1, 'Dave tenía que salir');
});

test('no se inventó ningún correo de nadie', () => {
  for (const contacto of CONTACTOS) {
    assert.ok(contacto.correo.indexOf('@') === -1, contacto.nombre + ' tiene un correo inventado');
    assert.ok(contacto.correo.indexOf('PENDIENTE') !== -1, contacto.nombre + ' debería quedar pendiente');
  }
});

test('la guía de Squarespace lleva al enlace de promos.rappi.com', () => {
  assert.ok(PASOS_SQUARESPACE.length >= 5);
  const texto = JSON.stringify(PASOS_SQUARESPACE);
  assert.ok(texto.indexOf('promos.rappi.com') !== -1);
  for (const paso of PASOS_SQUARESPACE) {
    assert.ok(paso.hace && paso.hace.length > 20, 'un paso no dice qué hacer');
    assert.ok(paso.ve && paso.ve.length > 10, 'un paso no dice qué se debería ver');
  }
});

test('se explica qué hacer cuando algo sale mal', () => {
  assert.ok(SI_ALGO_SALE_MAL.length >= 4);
  for (const caso of SI_ALGO_SALE_MAL) {
    assert.ok(caso.problema && caso.solucion, 'un caso está incompleto');
  }
});

test('hay al menos diez preguntas frecuentes, con respuestas útiles', () => {
  assert.ok(PREGUNTAS_FRECUENTES.length >= 10);
  for (const item of PREGUNTAS_FRECUENTES) {
    assert.ok(item.pregunta.length > 15, 'pregunta demasiado corta');
    assert.ok(item.respuesta.length > 60, 'respuesta demasiado corta: ' + item.pregunta);
    assert.ok(/[.!?]$/.test(item.respuesta.trim()), 'la respuesta no termina en punto: ' + item.pregunta);
  }
});

test('las preguntas frecuentes cubren las dudas reales de un KAM', () => {
  const texto = JSON.stringify(PREGUNTAS_FRECUENTES).toLowerCase();
  for (const tema of ['equivoqué', 'participar', 'presupuesto', 'nit', 'maker', 'travel']) {
    assert.ok(texto.indexOf(tema) !== -1, 'no se responde nada sobre ' + tema);
  }
});

test('la ayuda no usa guiones como puntuación ni emojis', () => {
  const todo = JSON.stringify([AVISO_AZAR, CONTACTOS, PASOS_SQUARESPACE, SI_ALGO_SALE_MAL, PREGUNTAS_FRECUENTES]);
  assert.ok(!/ [-–—] /.test(todo), 'hay un guion usado como puntuación');
  assert.ok(!/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(todo), 'hay un emoji');
});

test('la ayuda sostiene la regla de que Rappi nunca organiza', () => {
  const texto = JSON.stringify(PREGUNTAS_FRECUENTES);
  assert.ok(/Rappi no puede ser el organizador/i.test(texto), 'falta explicar por qué Rappi no organiza');
});
