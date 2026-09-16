'use strict';

/**
 * Coherencia de pruebas/casos_base.json: los casos que deben generar tienen su
 * salida esperada y los que deben fallar no la tienen.
 *
 * Cuando el motor este listo (Bloque 1) estas pruebas se amplian para comparar
 * el texto generado contra pruebas/salidas_esperadas/.
 */

const test = require('node:test');
const assert = require('node:assert');

const { rutaDesdeRaiz, leerJson, leerTexto, listarArchivos, existe } = require('../scripts/lib/archivos');
const { normalizarParaComparar } = require('../src/core/texto.js');

const { casos } = leerJson(rutaDesdeRaiz('pruebas', 'casos_base.json'));

const generan = casos.filter((caso) => caso.esperado.resultado === 'genera');
const fallan = casos.filter((caso) => caso.esperado.resultado === 'falla');

test('hay once casos y todos declaran un resultado conocido', () => {
  assert.strictEqual(casos.length, 11);
  assert.strictEqual(generan.length + fallan.length, casos.length);
});

test('los identificadores no se repiten', () => {
  const ids = casos.map((caso) => caso.id);
  assert.strictEqual(new Set(ids).size, ids.length);
});

test('cada caso trae id, descripcion y entrada con pais y tipo', () => {
  for (const caso of casos) {
    assert.ok(caso.id, 'un caso no tiene id');
    assert.ok(caso.descripcion, caso.id + ' no tiene descripcion');
    assert.ok(caso.entrada && caso.entrada.pais, caso.id + ' no tiene pais');
    assert.ok(caso.entrada.tipo, caso.id + ' no tiene tipo');
  }
});

test('cada caso que genera tiene su salida esperada', () => {
  for (const caso of generan) {
    const ruta = rutaDesdeRaiz('pruebas', 'salidas_esperadas', caso.id + '.txt');
    assert.ok(existe(ruta), 'falta pruebas/salidas_esperadas/' + caso.id + '.txt');
    assert.ok(normalizarParaComparar(leerTexto(ruta)).length > 0, caso.id + ' tiene salida esperada vacia');
  }
});

test('cada caso que falla declara los campos con error y no tiene salida esperada', () => {
  for (const caso of fallan) {
    assert.ok(Array.isArray(caso.esperado.errores), caso.id + ' no declara errores');
    assert.ok(caso.esperado.errores.length > 0, caso.id + ' declara una lista de errores vacia');
    assert.ok(
      !existe(rutaDesdeRaiz('pruebas', 'salidas_esperadas', caso.id + '.txt')),
      caso.id + ' debe fallar pero tiene salida esperada'
    );
  }
});

test('no sobran archivos en salidas_esperadas', () => {
  const archivos = listarArchivos(rutaDesdeRaiz('pruebas', 'salidas_esperadas'), '.txt').map((n) =>
    n.replace(/\.txt$/, '')
  );
  assert.deepStrictEqual(archivos.sort(), generan.map((caso) => caso.id).sort());
});

test('los textos que cada caso debe contener no estan vacios', () => {
  for (const caso of generan) {
    assert.ok(Array.isArray(caso.esperado.contiene), caso.id + ' no declara que debe contener');
    for (const fragmento of caso.esperado.contiene) {
      assert.ok(String(fragmento).trim().length > 0, caso.id + ' declara un fragmento vacio');
    }
  }
});
