'use strict';

/**
 * Numeros en letras, montos y cantidades de Creditos.
 *
 * Corre igual en Node (pruebas), Apps Script (generacion) y el navegador
 * (vista previa). Sin require ni import: en Apps Script son funciones globales.
 *
 * El comportamiento esperado esta fijado por docs/referencia/motor_prototipo.py,
 * que es el prototipo con el que Legal valido los modelos.
 *
 * El espanol vive aqui entero. Cuando el idioma activo es otro, estas funciones
 * delegan en el archivo de ese idioma (numeros_pt.js) sin tocar una sola letra
 * de lo de abajo: los textos de Colombia no se pueden mover ni un caracter por
 * una campana de Brasil.
 */

/* En Node las dependencias se cargan con require; en Apps Script ya son globales. */
if (typeof module !== 'undefined' && typeof require === 'function') {
  var moduloIdiomas = require('./idiomas.js');
  var idiomaActivo = moduloIdiomas.idiomaActivo;
  var textosDelIdioma = moduloIdiomas.textosDelIdioma;

  var moduloPt = require('./numeros_pt.js');
  var numeroEnLetrasPt = moduloPt.numeroEnLetrasPt;
  var enFemeninoPt = moduloPt.enFemeninoPt;
  var letrasYCifraPt = moduloPt.letrasYCifraPt;
  var letrasYCifraFemeninoPt = moduloPt.letrasYCifraFemeninoPt;
}

/* Hasta aqui llega la escritura en letras. Mas alla, ver numeroEnLetras. */
var MAYOR_NUMERO_EN_LETRAS = 999999999999;

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
  /*
   * Pasado el techo se devuelve vacio, y el motor lo reporta como un dato que
   * falta. Antes se repetia la palabra: un billon salia "un millon millones" y
   * 1e21 "mil millones millones millones (1e+21)", con el documento dado por
   * bueno. Vale para los dos idiomas: el portugues decia "um milhao milhoes".
   *
   * Quien avisa de verdad es la revision numerica, que rechaza el numero con
   * un mensaje que el comercial entiende. Esto es la red de abajo.
   */
  if (Math.trunc(Number(n)) > MAYOR_NUMERO_EN_LETRAS) return '';

  // En portugues no hay apocope: "um" va igual solo que ante sustantivo.
  if (idiomaActivo() === 'pt') return numeroEnLetrasPt(n);

  var entero = Math.trunc(Number(n));
  if (!isFinite(entero) || entero < 0) return '';
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
  if (idiomaActivo() === 'pt') return letrasYCifraPt(n);
  var entero = Math.trunc(Number(n));
  return numeroEnLetras(entero, true) + ' (' + entero + ')';
}

/**
 * La forma femenina de un numero escrito en letras.
 *
 * "doscientos ordenes" esta mal: son "doscientas ordenes". Igual con unidades y
 * noches. Los modelos de delivery hablan de pedidos y Creditos, que son
 * masculinos, asi que esto nacio con Rappi Travel, donde aparecen ordenes,
 * unidades y noches.
 *
 * Solo cambian las centenas y el uno, y nunca "mil" ni "millones", que no
 * tienen femenino. Esta funcion no toca el texto masculino: se pide aparte.
 */
function enFemenino(texto) {
  if (idiomaActivo() === 'pt') return enFemeninoPt(texto);

  var t = String(texto);
  // Las centenas concuerdan aunque lleven decenas detras: "doscientas treinta".
  // "quinientos" no lleva la silaba "cien", asi que va aparte.
  t = t.replace(/quinientos/g, 'quinientas');
  t = t.replace(/(dos|tres|cuatro|seis|sete|ocho|nove)cientos/g, '$1cientas');
  // El uno concuerda al final, que es donde queda pegado al sustantivo.
  t = t.replace(/veintiuno$/, 'veintiuna');
  t = t.replace(/(^|\s)uno$/, '$1una');
  return t;
}

/**
 * Forma "letras (cifra)" que precede a un sustantivo femenino:
 * "una (1) orden", "doscientas (200) ordenes".
 */
function letrasYCifraFemenino(n) {
  if (idiomaActivo() === 'pt') return letrasYCifraFemeninoPt(n);
  var entero = Math.trunc(Number(n));
  return enFemenino(numeroEnLetras(entero)) + ' (' + entero + ')';
}

/** Entero con el separador de miles del pais. */
function formatearMiles(n, separador) {
  var entero = String(Math.trunc(Math.abs(Number(n))));
  /*
   * Sin separador se agrupa igual, sin escribir nada entre los grupos.
   *
   * String.replace con undefined no falla: escribe la palabra "undefined" en
   * el hueco. Con la columna separador_miles ausente en una pestana Paises
   * vieja, el T&C salia con "(1undefined000undefined000)" adentro. El numero
   * sin agrupar se lee peor, pero se lee; la palabra no.
   */
  var marca = separador === null || separador === undefined ? '' : String(separador);
  var conSeparador = entero.replace(/\B(?=(\d{3})+(?!\d))/g, marca);
  return Number(n) < 0 ? '-' + conSeparador : conSeparador;
}

/**
 * Cantidad de Creditos: "treinta mil (30.000) Créditos".
 * Lleva "de" antes de Créditos cuando las letras terminan en millón o millones:
 * "doce millones (12.000.000) de Créditos".
 */
function cantidadCreditos(n, pais) {
  var idioma = textosDelIdioma();
  var letras = numeroEnLetras(n, true);
  var de = idioma.terminacionDeMillon.test(letras) ? ' ' + idioma.deAntesDelSustantivo : '';
  return letras + ' (' + formatearMiles(n, pais.separador_miles) + ')' + de + ' ' + idioma.creditos;
}

/**
 * Monto con moneda, en el orden que usa cada pais.
 *
 * Espanol: "cincuenta mil pesos M/Cte. ($50.000)", las letras primero.
 * Portugues: "R$300,00 (trezentos reais)", la cifra primero y las letras entre
 * parentesis, que es como lo escriben los cuatro T&C aprobados de Brasil.
 */
function montoConMoneda(n, pais) {
  var idioma = textosDelIdioma();
  var cifra = pais.moneda_simbolo + formatearMiles(n, pais.separador_miles) + (idioma.decimalesDelMonto || '');

  /*
   * "tres millones DE pesos", no "tres millones pesos".
   *
   * La regla es la misma que cantidadCreditos ya aplicaba para los Creditos, y
   * aqui faltaba. Solo se nota con un monto de millones redondos, que es por lo
   * que estuvo tanto tiempo sin verse: el unico monto grande de los casos
   * dorados era 1.200.000, que no termina en "millon" y no necesita el "de".
   * Salio al habilitar el Descuento, donde un presupuesto de 3.000.000 es un
   * numero de todos los dias. Anotado en docs/PENDIENTES_LEGAL.md.
   */
  var letras = numeroEnLetras(n);
  var moneda = (idioma.terminacionDeMillon.test(letras) ? idioma.deAntesDelSustantivo + ' ' : '') + pais.moneda_nombre;

  if (idioma.ordenDeLaCifra === 'cifra_primero') {
    return cifra + ' (' + letras + ' ' + moneda + ')';
  }
  return letras + ' ' + moneda + ' (' + cifra + ')';
}

/**
 * Porcentaje: "cincuenta por ciento (50%)", "cien por ciento (100%)".
 * No hay apocope ante "por ciento": "veintiuno por ciento (21%)".
 *
 * En portugues va al reves, "10% (dez por cento)", porque asi lo escriben los
 * cuatro T&C aprobados de Brasil. Juan lo cerro el 20 de septiembre de 2026
 * (punto B3), despues de compararlos con lo que salia impreso.
 */
function porcentajeEnLetras(p) {
  var idioma = textosDelIdioma();
  var entero = Math.trunc(Number(p));
  var esPt = idiomaActivo() === 'pt';
  var letras = (entero === 100 ? (esPt ? 'cem' : 'cien') : numeroEnLetras(entero)) + ' ' + idioma.porCiento;
  var cifra = entero + '%';

  if (idioma.ordenDeLaCifra === 'cifra_primero') return cifra + ' (' + letras + ')';
  return letras + ' (' + cifra + ')';
}

if (typeof module !== 'undefined') {
  module.exports = {
    letrasHasta999: letrasHasta999,
    apocopar: apocopar,
    numeroEnLetras: numeroEnLetras,
    letrasYCifra: letrasYCifra,
    enFemenino: enFemenino,
    letrasYCifraFemenino: letrasYCifraFemenino,
    formatearMiles: formatearMiles,
    cantidadCreditos: cantidadCreditos,
    montoConMoneda: montoConMoneda,
    porcentajeEnLetras: porcentajeEnLetras,
    MAYOR_NUMERO_EN_LETRAS: MAYOR_NUMERO_EN_LETRAS,
  };
}
