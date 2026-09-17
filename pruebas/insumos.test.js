'use strict';

/**
 * Los insumos legales (modelos, bloques y configuracion por pais) tienen que
 * poder leerse completos y sin sorpresas antes de que exista el motor.
 */

const test = require('node:test');
const assert = require('node:assert');

const { rutaDesdeRaiz, leerJson, leerTexto, listarArchivos, existe } = require('../scripts/lib/archivos');
const { cargarModelos, versionDelModelo, inclusionesDe } = require('../scripts/lib/modelos');
const { tieneRetornoDeCarro } = require('../src/core/texto.js');

const { modelos, bloques } = cargarModelos();
const paises = leerJson(rutaDesdeRaiz('data', 'paises.json'));

test('estan los siete modelos de campana', () => {
  assert.deepStrictEqual(
    Object.keys(modelos).sort(),
    ['carrera_compras', 'cashback', 'cashback_day', 'cashback_eta', 'cashback_travel', 'descuento_travel', 'promocao_br']
  );
});

test('cada modelo declara su version en la primera linea', () => {
  for (const [nombre, texto] of Object.entries(modelos)) {
    assert.ok(versionDelModelo(texto), 'el modelo ' + nombre + ' no declara version');
  }
});

test('los modelos y los bloques se leen sin retornos de carro', () => {
  for (const [nombre, texto] of Object.entries({ ...modelos, ...bloques })) {
    assert.ok(!tieneRetornoDeCarro(texto), 'quedo un \\r en ' + nombre);
  }
});

test('cada [[INCLUIR:nombre]] apunta a un bloque que existe', () => {
  for (const [nombre, texto] of Object.entries({ ...modelos, ...bloques })) {
    for (const incluido of inclusionesDe(texto)) {
      assert.ok(
        Object.prototype.hasOwnProperty.call(bloques, incluido),
        nombre + ' incluye el bloque inexistente "' + incluido + '"'
      );
    }
  }
});

test('no hay bloques huerfanos', () => {
  const usados = new Set();
  for (const texto of Object.values({ ...modelos, ...bloques })) {
    for (const incluido of inclusionesDe(texto)) usados.add(incluido);
  }
  const huerfanos = Object.keys(bloques).filter((nombre) => !usados.has(nombre));
  assert.deepStrictEqual(huerfanos, [], 'bloques que nadie incluye: ' + huerfanos.join(', '));
});

test('paises.json trae los nueve paises con estado valido', () => {
  assert.strictEqual(paises.paises.length, 9);
  const estados = ['activo', 'piloto', 'bloqueado'];
  for (const pais of paises.paises) {
    assert.ok(pais.codigo, 'un pais no tiene codigo');
    assert.ok(estados.includes(pais.estado), pais.codigo + ' tiene estado invalido: ' + pais.estado);
  }
});

test('cada modelo habilitado por pais existe en modelos/', () => {
  for (const pais of paises.paises) {
    for (const nombre of pais.modelos || []) {
      assert.ok(
        Object.prototype.hasOwnProperty.call(modelos, nombre),
        pais.codigo + ' habilita el modelo inexistente "' + nombre + '"'
      );
    }
  }
});

test('las salidas esperadas se leen sin retornos de carro', () => {
  const archivos = listarArchivos(rutaDesdeRaiz('pruebas', 'salidas_esperadas'), '.txt');
  assert.ok(archivos.length > 0, 'no hay salidas esperadas');
  for (const archivo of archivos) {
    const texto = leerTexto(rutaDesdeRaiz('pruebas', 'salidas_esperadas', archivo));
    assert.ok(!tieneRetornoDeCarro(texto), 'quedo un \\r en ' + archivo);
    assert.ok(texto.trim().length > 0, archivo + ' esta vacio');
  }
});

test('el prototipo de referencia sigue disponible', () => {
  assert.ok(existe(rutaDesdeRaiz('docs', 'referencia', 'motor_prototipo.py')));
});
