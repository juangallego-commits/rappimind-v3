'use strict';

/**
 * Los casos de pruebas/casos_base.json contra el motor completo.
 *
 * Criterio de aceptación 1: los que deben pasar pasan y los que deben fallar
 * fallan con el error esperado.
 */

const test = require('node:test');
const assert = require('node:assert');

const { rutaDesdeRaiz, leerJson, leerTexto, listarArchivos, existe } = require('../scripts/lib/archivos');
const { cargarModelos } = require('../scripts/lib/modelos');
const { normalizarParaComparar, textoPlano } = require('../src/core/texto.js');
const { generarTexto } = require('../src/core/generar.js');

const { casos } = leerJson(rutaDesdeRaiz('pruebas', 'casos_base.json'));
const { paises } = leerJson(rutaDesdeRaiz('data', 'paises.json'));
const modelos = cargarModelos();

const generan = casos.filter((caso) => caso.esperado.resultado === 'genera');
const fallan = casos.filter((caso) => caso.esperado.resultado === 'falla');

/**
 * Rappi Travel todavía no tiene política de datos propia en data/paises.json:
 * es un dato que Juan debe conseguir con Legal Travel, y mientras falte la
 * herramienta no genera. Las pruebas usan valores de prueba, para poder probar
 * todo lo demás. Cuando el dato real entre, esta función sobra.
 */
const DATOS_DE_PRUEBA_DE_TRAVEL = {
  travel_politica_privacidad: 'la Política de Tratamiento de Datos Personales de Prueba',
  travel_url_privacidad: 'https://ejemplo.travel.rappi.com.co/privacidad',
};

function paisDelCaso(caso) {
  const pais = paises.find((p) => p.codigo === caso.entrada.pais);
  if (String(caso.id).indexOf('TV') !== 0) return pais;
  return Object.assign({}, pais, DATOS_DE_PRUEBA_DE_TRAVEL);
}

function correr(caso) {
  const pais = paisDelCaso(caso);
  return generarTexto(caso.entrada, pais, modelos, {
    fechaReferencia: caso.fecha_referencia,
    usuarioEnEquipo: caso.usuario_en_equipo === true,
  });
}

function salidaEsperada(caso) {
  return normalizarParaComparar(leerTexto(rutaDesdeRaiz('pruebas', 'salidas_esperadas', caso.id + '.txt')));
}

test('hay veinticinco casos, doce que generan y trece que fallan', () => {
  assert.strictEqual(casos.length, 25);
  assert.strictEqual(generan.length, 12);
  assert.strictEqual(fallan.length, 13);

  // Los catorce de Rappi Travel: siete que generan y siete que fallan.
  const deTravel = casos.filter((caso) => String(caso.id).indexOf('TV') === 0);
  assert.strictEqual(deTravel.length, 14);
  assert.strictEqual(deTravel.filter((c) => c.esperado.resultado === 'genera').length, 7);
});

for (const caso of generan) {
  test(caso.id + ' genera exactamente la salida esperada', () => {
    const resultado = correr(caso);
    assert.deepStrictEqual(resultado.errores, [], caso.id + ' no debería tener errores');
    assert.ok(resultado.valido);
    assert.strictEqual(normalizarParaComparar(resultado.texto), salidaEsperada(caso));
  });

  test(caso.id + ' contiene los textos que exige el caso', () => {
    // Se busca sobre el texto plano: los fragmentos del caso describen lo que
    // el documento dice, sin las marcas de negrita.
    const plano = textoPlano(correr(caso).texto);
    for (const fragmento of caso.esperado.contiene) {
      assert.ok(plano.indexOf(fragmento) !== -1, caso.id + ' no contiene: ' + fragmento);
    }
  });
}

for (const caso of fallan) {
  test(caso.id + ' falla con el error esperado y no produce texto', () => {
    const resultado = correr(caso);
    assert.ok(!resultado.valido, caso.id + ' debería fallar');
    assert.strictEqual(resultado.texto, '', caso.id + ' no debería producir texto');

    const campos = Array.from(new Set(resultado.errores.map((e) => e.campo))).sort();
    assert.deepStrictEqual(campos, caso.esperado.errores.slice().sort());
  });

  test(caso.id + ' explica cada error en lenguaje claro', () => {
    for (const error of correr(caso).errores) {
      assert.ok(error.mensaje && error.mensaje.length > 10, 'mensaje muy corto en ' + error.campo);
      assert.ok(/[.!?]$/.test(error.mensaje), 'el mensaje de ' + error.campo + ' no termina en punto');
    }
  });
}

test('ningún documento generado conserva marcas sin resolver', () => {
  for (const caso of generan) {
    const texto = correr(caso).texto;
    assert.ok(texto.indexOf('{{') === -1 && texto.indexOf('}}') === -1, caso.id + ' dejó llaves');
    assert.ok(texto.indexOf('[[') === -1 && texto.indexOf(']]') === -1, caso.id + ' dejó corchetes');
    assert.ok(texto.indexOf('%%') === -1, caso.id + ' dejó un comentario');
  }
});

test('ningún documento generado tiene tablas', () => {
  // Regla 5: solo párrafos y viñetas; el sitio de publicación no muestra tablas.
  for (const caso of generan) {
    assert.ok(correr(caso).texto.indexOf('|') === -1, caso.id + ' parece traer una tabla');
  }
});

test('no sobran ni faltan archivos en salidas_esperadas', () => {
  const archivos = listarArchivos(rutaDesdeRaiz('pruebas', 'salidas_esperadas'), '.txt').map((n) => n.replace(/\.txt$/, ''));
  assert.deepStrictEqual(archivos.sort(), generan.map((caso) => caso.id).sort());
  for (const caso of fallan) {
    assert.ok(!existe(rutaDesdeRaiz('pruebas', 'salidas_esperadas', caso.id + '.txt')), caso.id + ' no debería tener salida esperada');
  }
});
