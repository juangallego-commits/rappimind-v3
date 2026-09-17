'use strict';

/**
 * El idioma del documento.
 *
 * Lo que se protege aquí es doble. Que Brasil salga en portugués, y sobre todo
 * que Colombia no se mueva ni un carácter: los textos de Colombia están
 * aprobados por Legal y una campaña de Brasil no puede cambiarlos.
 */

const test = require('node:test');
const assert = require('node:assert');

const { fijarIdioma, idiomaActivo, conElIdiomaDe, hayIdioma } = require('../src/core/idiomas.js');
const { formatearFecha, formatearHora, formatearFechaDelPais, formatearHoraDelPais, listaY } = require('../src/core/fechas.js');
const {
  numeroEnLetras, letrasYCifra, letrasYCifraFemenino,
  porcentajeEnLetras, cantidadCreditos, montoConMoneda,
} = require('../src/core/numeros.js');
const { paisDesdeFila } = require('../src/core/paises.js');
const { rutaDesdeRaiz, leerJson } = require('../scripts/lib/archivos');

const PAISES = leerJson(rutaDesdeRaiz('data', 'paises.json')).paises;
const COLOMBIA = paisDesdeFila(PAISES.find((p) => p.codigo === 'CO'));
const BRASIL = paisDesdeFila(PAISES.find((p) => p.codigo === 'BR'));

/* Cada prueba arranca en español, que es el idioma por defecto. */
test.beforeEach(() => { fijarIdioma('es'); });
test.afterEach(() => { fijarIdioma('es'); });

test('sin fijar nada, el idioma es español', () => {
  assert.strictEqual(idiomaActivo(), 'es');
  assert.strictEqual(formatearFecha('2026-09-17'), '17 de septiembre de 2026');
});

test('un idioma que no existe cae en español, no rompe el documento', () => {
  assert.strictEqual(hayIdioma('fr'), false);
  fijarIdioma('fr');
  assert.strictEqual(idiomaActivo(), 'es');
  assert.strictEqual(formatearFecha('2026-09-17'), '17 de septiembre de 2026');
});

test('las fechas y las listas salen en el idioma del país', () => {
  conElIdiomaDe(BRASIL, () => {
    assert.strictEqual(formatearFecha('2026-09-17'), '17 de setembro de 2026');
    assert.strictEqual(formatearFecha('2026-03-01'), '1 de março de 2026');
    assert.strictEqual(listaY(['Bogotá', 'Medellín', 'Cali']), 'Bogotá, Medellín e Cali');
  });
  assert.strictEqual(formatearFecha('2026-09-17'), '17 de septiembre de 2026');
  assert.strictEqual(listaY(['Bogotá', 'Medellín', 'Cali']), 'Bogotá, Medellín y Cali');
});

test('Brasil escribe la hora en veinticuatro horas', () => {
  assert.strictEqual(formatearHora('09:00'), '9:00 a. m.');
  assert.strictEqual(formatearHora('23:59'), '11:59 p. m.');

  conElIdiomaDe(BRASIL, () => {
    // Tal como va en los cuatro T&C aprobados que mandó Legal Brasil.
    assert.strictEqual(formatearHora('00:01'), '00:01');
    assert.strictEqual(formatearHora('23:59'), '23:59');
    assert.strictEqual(formatearHora('09:00'), '09:00');
    assert.strictEqual(formatearHora('18:30'), '18:30');
  });
});

test('los números en letras siguen las reglas del portugués', () => {
  conElIdiomaDe(BRASIL, () => {
    assert.strictEqual(numeroEnLetras(100), 'cem');
    assert.strictEqual(numeroEnLetras(101), 'cento e um');
    assert.strictEqual(numeroEnLetras(250), 'duzentos e cinquenta');
    // La "e" del último tramo: con cien exactos sí, con un número suelto no.
    assert.strictEqual(numeroEnLetras(1500), 'mil e quinhentos');
    assert.strictEqual(numeroEnLetras(1250), 'mil duzentos e cinquenta');
    assert.strictEqual(numeroEnLetras(2001), 'dois mil e um');
    assert.strictEqual(numeroEnLetras(15000000), 'quinze milhões');
    assert.strictEqual(numeroEnLetras(1200000), 'um milhão e duzentos mil');

    // En portugués no hay apócope: es "um", nunca "un".
    assert.strictEqual(letrasYCifra(1), 'um (1)');
    assert.strictEqual(letrasYCifra(21), 'vinte e um (21)');
    // Y el femenino concuerda en el uno, el dos y las centenas.
    assert.strictEqual(letrasYCifraFemenino(1), 'uma (1)');
    assert.strictEqual(letrasYCifraFemenino(2), 'duas (2)');
    assert.strictEqual(letrasYCifraFemenino(250), 'duzentas e cinquenta (250)');
  });
});

test('el porcentaje y el monto usan las palabras del país', () => {
  assert.strictEqual(porcentajeEnLetras(50), 'cincuenta por ciento (50%)');
  assert.strictEqual(porcentajeEnLetras(100), 'cien por ciento (100%)');

  conElIdiomaDe(BRASIL, () => {
    assert.strictEqual(porcentajeEnLetras(50), 'cinquenta por cento (50%)');
    assert.strictEqual(porcentajeEnLetras(100), 'cem por cento (100%)');
    // La cifra primero y las letras entre paréntesis, como en los T&C aprobados.
    assert.strictEqual(montoConMoneda(50000, BRASIL), 'R$50.000,00 (cinquenta mil reais)');
    assert.strictEqual(montoConMoneda(300, BRASIL), 'R$300,00 (trezentos reais)');
    assert.strictEqual(cantidadCreditos(30000, BRASIL), 'trinta mil (30.000) Créditos');
    // El "de" antes del sustantivo cuando el número termina en millón.
    assert.strictEqual(cantidadCreditos(12000000, BRASIL), 'doze milhões (12.000.000) de Créditos');
  });
});

test('el idioma vuelve a español aunque el documento reviente a mitad', () => {
  assert.throws(() => {
    conElIdiomaDe(BRASIL, () => { throw new Error('se cayó generando'); });
  });
  // Sin el try/finally, el siguiente documento saldría con los meses en portugués.
  assert.strictEqual(idiomaActivo(), 'es');
  assert.strictEqual(formatearFecha('2026-09-17'), '17 de septiembre de 2026');
});

test('Colombia no cambia por haber generado antes un documento de Brasil', () => {
  const antes = {
    fecha: formatearFecha('2026-09-17'),
    hora: formatearHora('23:59'),
    monto: montoConMoneda(50000, COLOMBIA),
    creditos: cantidadCreditos(12000000, COLOMBIA),
    porcentaje: porcentajeEnLetras(99),
    lista: listaY(['Bogotá', 'Cali']),
  };

  conElIdiomaDe(BRASIL, () => {
    formatearFecha('2026-09-17');
    cantidadCreditos(12000000, BRASIL);
  });

  assert.deepStrictEqual({
    fecha: formatearFecha('2026-09-17'),
    hora: formatearHora('23:59'),
    monto: montoConMoneda(50000, COLOMBIA),
    creditos: cantidadCreditos(12000000, COLOMBIA),
    porcentaje: porcentajeEnLetras(99),
    lista: listaY(['Bogotá', 'Cali']),
  }, antes);
});

test('las respuestas plegadas y el resumen escriben la fecha como el país, no como el idioma activo', () => {
  // Fuera del documento el idioma activo es español, y un KAM de Brasil veía
  // "1 de octubre de 2026" y "12:00 a. m." arriba de un T&C que decía
  // "1 de outubro de 2026 às 00:00".
  assert.strictEqual(formatearFechaDelPais('2026-10-01', BRASIL), '1 de outubro de 2026');
  assert.strictEqual(formatearHoraDelPais('00:00', BRASIL), '00:00');
  assert.strictEqual(formatearFechaDelPais('2026-10-01', COLOMBIA), '1 de octubre de 2026');
  assert.strictEqual(formatearHoraDelPais('00:00', COLOMBIA), '12:00 a. m.');
  // Y no deja el idioma cambiado para el siguiente que pregunte.
  assert.strictEqual(idiomaActivo(), 'es');
  assert.strictEqual(formatearFecha('2026-10-01'), '1 de octubre de 2026');
});

test('la lista de tiendas de un Cashback Multitienda también sale en el idioma del país', () => {
  // expandirTiendas corría después de que calcularDerivados devolvía el idioma
  // a español: en un país en portugués cada tienda habría dicho "doce millones
  // (12.000.000) de Créditos" y "Rio, Sao Paulo y Curitiba".
  const { renderizar } = require('../src/core/motor.js');
  const { cargarModelos } = require('../scripts/lib/modelos.js');
  const enPortugues = Object.assign({}, COLOMBIA, { idioma: 'pt' });
  const resultado = renderizar('cashback_day', {
    pais: 'CO', negocio: 'rappi', tipo: 'cashback_day',
    fechaInicio: '2026-10-01', horaInicio: '00:00', fechaFin: '2026-10-01', horaFin: '23:59',
    porcentaje: 20, tope: 20000, maxPedidos: 1, carga: 'dia_siguiente', vigencia: 'dias', diasVigencia: 30,
    redencion: 'tienda', segmento: 'todos', metodoPago: 'todos', declaracion: true,
    tiendas: [
      { marca: 'Petz', razonSocial: 'Petz S.A.', id: '900111222-1', ciudades: 'Rio, Sao Paulo, Curitiba', presupuesto: 12000000 },
      { marca: 'Raia', razonSocial: 'Raia S.A.', id: '900777888-2', ciudades: '', nacional: true, presupuesto: 5000000 },
    ],
  }, enPortugues, cargarModelos());
  assert.ok(resultado.texto.indexOf('Sao Paulo e Curitiba') !== -1, resultado.texto);
  assert.ok(resultado.texto.indexOf('milhões') !== -1, resultado.texto);
  assert.ok(resultado.texto.indexOf('millones') === -1 && resultado.texto.indexOf('Sao Paulo y Curitiba') === -1);
  assert.strictEqual(idiomaActivo(), 'es');
});
