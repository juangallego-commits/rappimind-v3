'use strict';

/**
 * El idioma del documento.
 *
 * Cada pais trae su idioma en la columna `idioma` del Sheet (es o pt). De ahi
 * salen las piezas de forma del documento: los meses, la hora, los conectores
 * de una lista y los numeros escritos en letras.
 *
 * Lo que NO sale de aqui es el texto legal. Las clausulas viven en `modelos/` y
 * las frases fijas en `derivados.js`, y las traduce Legal, nunca este archivo.
 * Aqui solo esta la maquinaria: "17 de setembro de 2026" y "duzentos e
 * cinquenta (250)".
 *
 * Como se usa: `calcularDerivados` fija el idioma del pais al empezar el
 * documento y lo devuelve a espanol al terminar. Las funciones de fechas.js y
 * numeros.js preguntan por el idioma activo, en vez de recibirlo en cada una de
 * sus cincuenta y cuatro llamadas. Si nadie lo fija, el idioma es espanol, que
 * es el 99,7% de las solicitudes reales.
 */

var IDIOMA_POR_DEFECTO = 'es';

var IDIOMAS = {
  es: {
    codigo: 'es',
    nombre: 'español',
    meses: [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
    ],
    // "17 de septiembre de 2026"
    formatoFecha: 'dia de mes de anio',
    // Reloj de doce horas con a. m. y p. m., como en los modelos aprobados.
    reloj: 12,
    sufijoAntesDelMediodia: 'a. m.',
    sufijoDespuesDelMediodia: 'p. m.',
    conjuncionDeLista: 'y',
    // El nombre del saldo de la Billetera, tal como va impreso.
    creditos: 'Créditos',
    porCiento: 'por ciento',
    // "cincuenta mil pesos M/Cte. ($50.000)": las letras primero.
    formatoMonto: 'letras_primero',
    mesesCortos: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'],
    // "doce millones (12.000.000) de Créditos"
    deAntesDelSustantivo: 'de',
    terminacionDeMillon: /(millón|millones)$/,
  },

  pt: {
    codigo: 'pt',
    nombre: 'portugués',
    meses: [
      'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
      'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
    ],
    // "17 de setembro de 2026", igual que en espanol.
    formatoFecha: 'dia de mes de anio',
    // Reloj de veinticuatro horas con dos puntos y cero inicial: 00:01, 23:59.
    // Asi va en los cuatro T&C aprobados que mando Legal Brasil, que mandan
    // sobre cualquier convencion tipografica.
    reloj: 24,
    separadorDeHora: ':',
    conjuncionDeLista: 'e',
    creditos: 'Créditos',
    porCiento: 'por cento',
    // "R$300,00 (trezentos reais)": la cifra primero y las letras entre
    // parentesis, como lo escriben los cuatro T&C aprobados de Brasil.
    formatoMonto: 'cifra_primero',
    decimalesDelMonto: ',00',
    mesesCortos: ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'],
    deAntesDelSustantivo: 'de',
    terminacionDeMillon: /(milhão|milhões)$/,
  },
};

/* El idioma que esta generando el documento en este momento. */
var IDIOMA_ACTIVO = IDIOMA_POR_DEFECTO;

function hayIdioma(codigo) {
  return Object.prototype.hasOwnProperty.call(IDIOMAS, String(codigo || '').trim().toLowerCase());
}

/** Fija el idioma y devuelve el que estaba, para poder restaurarlo. */
function fijarIdioma(codigo) {
  var anterior = IDIOMA_ACTIVO;
  var pedido = String(codigo || '').trim().toLowerCase();
  IDIOMA_ACTIVO = hayIdioma(pedido) ? pedido : IDIOMA_POR_DEFECTO;
  return anterior;
}

function idiomaActivo() {
  return IDIOMA_ACTIVO;
}

/** Las piezas del idioma que esta activo. */
function textosDelIdioma() {
  return IDIOMAS[IDIOMA_ACTIVO] || IDIOMAS[IDIOMA_POR_DEFECTO];
}

/**
 * Corre una funcion con el idioma de un pais y devuelve el idioma a como estaba,
 * pase lo que pase.
 *
 * El try/finally no es adorno: si generar un documento en portugues lanza un
 * error a mitad de camino, el siguiente documento saldria con los meses en
 * portugues y nadie entenderia por que.
 */
function conElIdiomaDe(pais, funcion) {
  var anterior = fijarIdioma(pais && pais.idioma ? pais.idioma : IDIOMA_POR_DEFECTO);
  try {
    return funcion();
  } finally {
    IDIOMA_ACTIVO = anterior;
  }
}

if (typeof module !== 'undefined') {
  module.exports = {
    IDIOMAS: IDIOMAS,
    IDIOMA_POR_DEFECTO: IDIOMA_POR_DEFECTO,
    hayIdioma: hayIdioma,
    fijarIdioma: fijarIdioma,
    idiomaActivo: idiomaActivo,
    textosDelIdioma: textosDelIdioma,
    conElIdiomaDe: conElIdiomaDe,
  };
}
