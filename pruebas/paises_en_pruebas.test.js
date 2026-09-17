'use strict';

/**
 * El aviso de que un país está en pruebas.
 *
 * Ocho países están en piloto con valores legales que propuso la herramienta por
 * analogía con Colombia y que no ha confirmado nadie. Cuando los equipos legales
 * de esos países entren a probar, tienen que saber qué están mirando: si no, un
 * abogado lee el documento, le parece bien, y confirma algo que nadie escribió.
 */

const test = require('node:test');
const assert = require('node:assert');

const { paisDesdeFila, datosPorConfirmar, paisEnPruebas, NOMBRE_DEL_DATO } = require('../src/core/paises.js');
const { rutaDesdeRaiz, leerJson } = require('../scripts/lib/archivos');

const PAISES = leerJson(rutaDesdeRaiz('data', 'paises.json')).paises.map(paisDesdeFila);
const porCodigo = (codigo) => PAISES.filter((p) => p.codigo === codigo)[0];

test('Colombia no está en pruebas y los demás sí', () => {
  assert.strictEqual(paisEnPruebas(porCodigo('CO')), false);
  const enPruebas = PAISES.filter(paisEnPruebas).map((p) => p.codigo);
  assert.deepStrictEqual(enPruebas.sort(), ['AR', 'BR', 'CL', 'CR', 'EC', 'MX', 'PE', 'UY']);
});

test('cada país en pruebas dice qué tiene sin confirmar', () => {
  for (const pais of PAISES.filter(paisEnPruebas)) {
    const faltantes = datosPorConfirmar(pais);
    assert.ok(faltantes.length > 0, pais.nombre + ' está en piloto y no dice qué le falta confirmar');
  }
});

test('lo que falta se dice en palabras, no con el nombre de la columna', () => {
  const faltantes = datosPorConfirmar(porCodigo('MX'));
  for (const texto of faltantes) {
    assert.ok(texto.indexOf('_') === -1, 'salió el nombre técnico de la columna: ' + texto);
    assert.ok(texto.length > 12, 'demasiado corto para entenderse: ' + texto);
  }
  assert.ok(faltantes.indexOf('los derechos del titular sobre sus datos personales') !== -1, faltantes.join(' | '));
});

test('cada dato que un país marca por confirmar tiene su nombre en palabras', () => {
  const sinNombre = [];
  for (const pais of PAISES) {
    for (const llave of pais.por_confirmar_en_pruebas || []) {
      if (!NOMBRE_DEL_DATO[llave]) sinNombre.push(pais.codigo + '.' + llave);
    }
  }
  assert.deepStrictEqual(sinNombre, [], 'sin nombre legible: ' + sinNombre.join(', '));
});

test('un país sin nada marcado no genera aviso vacío', () => {
  const limpio = Object.assign({}, porCodigo('MX'), { por_confirmar_en_pruebas: [] });
  assert.deepStrictEqual(datosPorConfirmar(limpio), []);
  assert.deepStrictEqual(datosPorConfirmar(null), []);
  assert.strictEqual(paisEnPruebas(null), false);
});
