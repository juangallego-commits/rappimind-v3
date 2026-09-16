'use strict';

/**
 * El build tiene que dejar dist/ listo para clasp: los archivos que espera
 * Apps Script, los textos legales embebidos y nada de retornos de carro.
 */

const test = require('node:test');
const assert = require('node:assert');
const path = require('path');

const { rutaDesdeRaiz, leerTexto, listarArchivos, existe } = require('../scripts/lib/archivos');
const { cargarModelos } = require('../scripts/lib/modelos');
const { tieneRetornoDeCarro, normalizarTexto } = require('../src/core/texto.js');
const { construir, DIST } = require('../scripts/build.js');

/** Lo que debe quedar en dist/: el codigo de src/ mas lo que genera el build. */
function archivosEsperados() {
  const codigo = listarArchivos(rutaDesdeRaiz('src', 'core'), '.js').concat(
    listarArchivos(rutaDesdeRaiz('src', 'server'), '.js')
  );
  const generados = [
    'App.html',
    'Estilos.html',
    'Index.html',
    'Modelos.js',
    'MotorCliente.html',
    'PaisesSemilla.js',
    'Secciones.js',
    'appsscript.json',
  ];
  return codigo.concat(generados).sort();
}

test.before(() => {
  construir();
});

test('dist/ queda con los archivos que sube clasp', () => {
  assert.deepStrictEqual(listarArchivos(DIST).sort(), archivosEsperados());
});

test('el manifiesto llega a dist/ con la web app configurada', () => {
  const manifiesto = JSON.parse(leerTexto(path.join(DIST, 'appsscript.json')));
  assert.strictEqual(manifiesto.runtimeVersion, 'V8');
  assert.strictEqual(manifiesto.webapp.executeAs, 'USER_DEPLOYING');
  assert.strictEqual(manifiesto.webapp.access, 'DOMAIN');
});

test('Modelos.js conserva el texto legal exacto', () => {
  delete require.cache[require.resolve(path.join(DIST, 'Modelos.js'))];
  const { MODELOS } = require(path.join(DIST, 'Modelos.js'));
  const { modelos, bloques } = cargarModelos();

  assert.deepStrictEqual(Object.keys(MODELOS.modelos).sort(), Object.keys(modelos).sort());
  assert.deepStrictEqual(Object.keys(MODELOS.bloques).sort(), Object.keys(bloques).sort());

  for (const [nombre, texto] of Object.entries(modelos)) {
    assert.strictEqual(MODELOS.modelos[nombre], normalizarTexto(texto), 'cambio el texto del modelo ' + nombre);
  }
  for (const [nombre, texto] of Object.entries(bloques)) {
    assert.strictEqual(MODELOS.bloques[nombre], normalizarTexto(texto), 'cambio el texto del bloque ' + nombre);
  }
});

test('PaisesSemilla.js trae los nueve paises', () => {
  delete require.cache[require.resolve(path.join(DIST, 'PaisesSemilla.js'))];
  const { PAISES_SEMILLA } = require(path.join(DIST, 'PaisesSemilla.js'));
  assert.strictEqual(PAISES_SEMILLA.length, 9);
  assert.ok(PAISES_SEMILLA.some((pais) => pais.codigo === 'CO'));
});

test('ningun archivo generado queda con retornos de carro', () => {
  for (const archivo of listarArchivos(DIST)) {
    assert.ok(!tieneRetornoDeCarro(leerTexto(path.join(DIST, archivo))), 'quedo un \\r en dist/' + archivo);
  }
});

test('MotorCliente.html lleva el motor al navegador', () => {
  const contenido = leerTexto(path.join(DIST, 'MotorCliente.html'));
  assert.ok(contenido.startsWith('<!--'));
  assert.ok(contenido.includes('<script>'));
  assert.ok(contenido.includes('function normalizarTexto'));
});

test('el build es repetible: correrlo dos veces deja lo mismo', () => {
  const antes = listarArchivos(DIST).map((archivo) => [archivo, leerTexto(path.join(DIST, archivo))]);
  construir();
  const despues = listarArchivos(DIST).map((archivo) => [archivo, leerTexto(path.join(DIST, archivo))]);
  assert.deepStrictEqual(despues, antes);
});

test('.clasp.json apunta a dist/', () => {
  assert.ok(existe(rutaDesdeRaiz('.clasp.json')));
  const clasp = JSON.parse(leerTexto(rutaDesdeRaiz('.clasp.json')));
  assert.strictEqual(clasp.rootDir, 'dist');
});
