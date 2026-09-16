'use strict';

/**
 * Validación del identificador tributario por país.
 * La especificación dice que los algoritmos ya se verificaron contra los
 * identificadores reales de las sociedades Rappi: esta prueba lo sostiene.
 */

const test = require('node:test');
const assert = require('node:assert');

const { rutaDesdeRaiz, leerJson } = require('../scripts/lib/archivos');
const { validarIdentificacion } = require('../src/core/identificaciones.js');

const { paises } = leerJson(rutaDesdeRaiz('data', 'paises.json'));

/** Quita el prefijo del tipo ("NIT 900..." -> "900..."). */
function numeroDe(pais) {
  const prefijo = pais.tipo_id_organizador || '';
  const corte = pais.id_fiscal.toLowerCase().indexOf(prefijo.toLowerCase());
  return pais.id_fiscal.slice(corte + prefijo.length).trim();
}

test('los identificadores reales de las sociedades Rappi son válidos', () => {
  for (const pais of paises) {
    if (pais.estado === 'bloqueado') continue;
    const revision = validarIdentificacion(pais.codigo, numeroDe(pais));
    assert.ok(revision.valido, pais.codigo + ' (' + pais.id_fiscal + ') debería ser válido: ' + revision.mensaje);
  }
});

test('NIT de Colombia: dígito de verificación y formato', () => {
  const bueno = validarIdentificacion('CO', '900111222-1');
  assert.ok(bueno.valido);
  assert.strictEqual(bueno.formateado, 'NIT 900.111.222-1');

  assert.strictEqual(validarIdentificacion('CO', '900.111.222-1').formateado, 'NIT 900.111.222-1');
  assert.ok(!validarIdentificacion('CO', '900111222-5').valido);
  assert.ok(!validarIdentificacion('CO', '90011122-1').valido);
});

test('RFC de México: persona moral y persona física', () => {
  const moral = validarIdentificacion('MX', 'PRU200101AB5');
  assert.ok(moral.valido);
  assert.strictEqual(moral.formateado, 'RFC PRU200101AB5');
  assert.ok(!validarIdentificacion('MX', 'PRU200101AB9').valido);
  assert.ok(!validarIdentificacion('MX', 'PRU2001').valido);
});

test('cada país rechaza un identificador con el dígito cambiado', () => {
  const alterados = {
    PE: '20602985970',
    AR: '30-71580389-2',
    CL: '76.837.223-4',
    UY: '218175850018',
  };
  for (const codigo of Object.keys(alterados)) {
    assert.ok(!validarIdentificacion(codigo, alterados[codigo]).valido, codigo + ' debería rechazar ' + alterados[codigo]);
  }
});

test('Costa Rica valida el formato, que es lo único que tiene', () => {
  assert.ok(validarIdentificacion('CR', '3-101-768820').valido);
  assert.ok(!validarIdentificacion('CR', '3-101-76882').valido);
});

test('un identificador vacío nunca es válido', () => {
  for (const codigo of ['CO', 'MX', 'PE', 'AR', 'CL', 'EC', 'UY', 'CR']) {
    assert.ok(!validarIdentificacion(codigo, '').valido, codigo + ' aceptó un valor vacío');
  }
});
