'use strict';

/**
 * Numeros en letras, montos y cantidades de Creditos.
 *
 * Corre igual en Node (pruebas), Apps Script (generacion) y el navegador
 * (vista previa). Sin require ni import: en Apps Script son funciones globales.
 *
 * El comportamiento esperado esta fijado por docs/referencia/motor_prototipo.py,
 * que es el prototipo con el que Legal valido los modelos.
 */

var UNIDADES = [
  'cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve',
  'diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete',
  'dieciocho', 'diecinueve', 'veinte', 'veintiuno', 'veintidós', 'veintitrés',
  'veinticuatro', 'veinticinco', 'veintiséis', 'veintisiete', 'veintiocho', 'veintinueve',
];

var DECENAS = {
  30: 'treinta',
  40: 'cuarenta',
  50: 'cincuenta',
  60: 'sesenta',
  70: 'setenta',
  80: 'ochenta',
  90: 'noventa',
};

var CENTENAS = {
  100: 'ciento',
  200: 'doscientos',
  300: 'trescientos',
  400: 'cuatrocientos',
  500: 'quinientos',
  600: 'seiscientos',
  700: 'setecientos',
  800: 'ochocientos',
  900: 'novecientos',
};

/** Numeros de 0 a 999 en letras. */
function letrasHasta999(n) {
  if (n < 30) return UNIDADES[n];
  if (n < 100) {
    var decena = Math.floor(n / 10) * 10;
    var unidad = n % 10;
    return DECENAS[decena] + (unidad === 0 ? '' : ' y ' + UNIDADES[unidad]);
  }
  if (n === 100) return 'cien';
  var centena = Math.floor(n / 100) * 100;
  var resto = n % 100;
  return CENTENAS[centena] + (resto === 0 ? '' : ' ' + letrasHasta999(resto));
}

/**
 * Apocope ante sustantivo masculino y ante "mil":
 * uno -> un, veintiuno -> veintiún, treinta y uno -> treinta y un.
 * Solo aplica al final del texto, que es donde queda el sustantivo despues.
 */
function apocopar(texto) {
  var t = String(texto);
  if (/veintiuno$/.test(t)) return t.replace(/veintiuno$/, 'veintiún');
  if (/uno$/.test(t)) {
    // No se toca una palabra que solo termine en "uno" siendo parte de otra
    // (por ejemplo "veintiuno" ya quedo resuelto arriba).
    var anterior = t.charAt(t.length - 4);
    if (!/[a-záéíóúñ]/.test(anterior)) return t.replace(/uno$/, 'un');
  }
  return t;
}

/**
 * Numero en letras hasta 999.999.999.999.
 * Con apocope true devuelve la forma que va pegada a un sustantivo masculino.
 */
function numeroEnLetras(n, apocope) {
  var entero = Math.trunc(Number(n));
  if (entero === 0) return 'cero';

  var partes = [];
  var millones = Math.floor(entero / 1000000);
  var resto = entero % 1000000;
  var miles = Math.floor(resto / 1000);
  var unidades = resto % 1000;

  if (millones) {
    partes.push(millones === 1 ? 'un millón' : apocopar(numeroEnLetras(millones)) + ' millones');
  }
  if (miles) {
    // "mil", nunca "un mil".
    partes.push(miles === 1 ? 'mil' : apocopar(letrasHasta999(miles)) + ' mil');
  }
  if (unidades) {
    partes.push(letrasHasta999(unidades));
  }

  var texto = partes.join(' ');
  return apocope ? apocopar(texto) : texto;
}

/**
 * Forma "letras (cifra)" que precede a un sustantivo masculino:
 * "un (1)", "veintiún (21)", "treinta y un (31)".
 * Quien llama agrega el sustantivo: letrasYCifra(1) + ' pedido'.
 */
function letrasYCifra(n) {
  var entero = Math.trunc(Number(n));
  return numeroEnLetras(entero, true) + ' (' + entero + ')';
}

/** Entero con el separador de miles del pais. */
function formatearMiles(n, separador) {
  var entero = String(Math.trunc(Math.abs(Number(n))));
  var conSeparador = entero.replace(/\B(?=(\d{3})+(?!\d))/g, separador);
  return Number(n) < 0 ? '-' + conSeparador : conSeparador;
}

/**
 * Cantidad de Creditos: "treinta mil (30.000) Créditos".
 * Lleva "de" antes de Créditos cuando las letras terminan en millón o millones:
 * "doce millones (12.000.000) de Créditos".
 */
function cantidadCreditos(n, pais) {
  var letras = numeroEnLetras(n, true);
  var de = /(millón|millones)$/.test(letras) ? ' de' : '';
  return letras + ' (' + formatearMiles(n, pais.separador_miles) + ')' + de + ' Créditos';
}

/** Monto con moneda: "cincuenta mil pesos M/Cte. ($50.000)". */
function montoConMoneda(n, pais) {
  return (
    numeroEnLetras(n) +
    ' ' +
    pais.moneda_nombre +
    ' (' +
    pais.moneda_simbolo +
    formatearMiles(n, pais.separador_miles) +
    ')'
  );
}

/**
 * Porcentaje: "cincuenta por ciento (50%)", "cien por ciento (100%)".
 * No hay apocope ante "por ciento": "veintiuno por ciento (21%)".
 */
function porcentajeEnLetras(p) {
  var entero = Math.trunc(Number(p));
  var letras = entero === 100 ? 'cien' : numeroEnLetras(entero);
  return letras + ' por ciento (' + entero + '%)';
}

if (typeof module !== 'undefined') {
  module.exports = {
    letrasHasta999: letrasHasta999,
    apocopar: apocopar,
    numeroEnLetras: numeroEnLetras,
    letrasYCifra: letrasYCifra,
    formatearMiles: formatearMiles,
    cantidadCreditos: cantidadCreditos,
    montoConMoneda: montoConMoneda,
    porcentajeEnLetras: porcentajeEnLetras,
  };
}
