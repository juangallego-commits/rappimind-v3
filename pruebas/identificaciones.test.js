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

/*
 * Una persona natural comerciante organiza campanas con su NIT, que es su
 * cedula mas el digito. Hasta el 9 de noviembre de 2026 solo pasaban nueve
 * digitos y se rechazaba a cualquiera con cedula de diez o de ocho.
 */
test('NIT de Colombia: persona natural con cédula de diez o de ocho números', () => {
  for (const escrito of ['1020304050-8', '1.020.304.050-8', '1020304050 - 8', '10203040508']) {
    const revision = validarIdentificacion('CO', escrito);
    assert.ok(revision.valido, escrito + ' debería ser válido: ' + revision.mensaje);
    assert.strictEqual(revision.formateado, 'NIT 1.020.304.050-8');
  }
  const vieja = validarIdentificacion('CO', '79.123.456-0');
  assert.ok(vieja.valido, vieja.mensaje);
  assert.strictEqual(vieja.formateado, 'NIT 79.123.456-0');

  // El digito de verificacion sigue mandando con cualquier largo.
  const malo = validarIdentificacion('CO', '1020304050-3');
  assert.ok(!malo.valido);
  assert.match(malo.mensaje, /Para 1\.020\.304\.050 el dígito es 8/);
});

test('NIT de Colombia: sin el dígito, el mensaje dice cuál es', () => {
  // Quien escribe solo la cedula no deberia quedarse con una pista que apunta
  // a otro numero: el mensaje dice tambien el digito del numero completo.
  const revision = validarIdentificacion('CO', '1020304050');
  assert.ok(!revision.valido);
  assert.match(revision.mensaje, /para 1\.020\.304\.050 el dígito es 8/);
});

test('NIT de Colombia: largos imposibles se rechazan con el ejemplo', () => {
  for (const escrito of ['123-4', '12345678901-2', '900111222-X']) {
    const revision = validarIdentificacion('CO', escrito);
    assert.ok(!revision.valido, escrito);
    assert.match(revision.mensaje, /cédula más el dígito/);
  }
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
