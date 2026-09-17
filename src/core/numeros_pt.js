'use strict';

/**
 * Numeros en letras en portugues de Brasil.
 *
 * Vive aparte de numeros.js a proposito. Los numeros en espanol estan fijados
 * por docs/referencia/motor_prototipo.py, que es el prototipo con el que Legal
 * valido los modelos de Colombia, y esos textos no se pueden mover ni un
 * caracter. Mezclar los dos idiomas en las mismas funciones habria puesto en
 * riesgo mil ciento ochenta y cuatro documentos por una campana de Brasil.
 *
 * Esto es ortografia, no texto legal: cuanto vale un numero escrito en letras
 * no lo decide un abogado. Lo que si decide Legal Brasil es como se llama el
 * saldo de la Billetera y como se escribe la hora en un T&C, y eso esta anotado
 * en docs/PENDIENTES_LEGAL.md.
 */

var UNIDADES_PT = [
  'zero', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove',
  'dez', 'onze', 'doze', 'treze', 'catorze', 'quinze', 'dezesseis', 'dezessete',
  'dezoito', 'dezenove',
];

var DEZENAS_PT = {
  20: 'vinte',
  30: 'trinta',
  40: 'quarenta',
  50: 'cinquenta',
  60: 'sessenta',
  70: 'setenta',
  80: 'oitenta',
  90: 'noventa',
};

var CENTENAS_PT = {
  100: 'cento',
  200: 'duzentos',
  300: 'trezentos',
  400: 'quatrocentos',
  500: 'quinhentos',
  600: 'seiscentos',
  700: 'setecentos',
  800: 'oitocentos',
  900: 'novecentos',
};

/**
 * Numeros de 0 a 999 en letras.
 *
 * En portugues la "e" va entre todos los tramos: duzentos e trinta e um. Y cien
 * exacto es "cem"; con algo detras es "cento e ...".
 */
function letrasHasta999Pt(n) {
  if (n < 20) return UNIDADES_PT[n];
  if (n < 100) {
    var dezena = Math.floor(n / 10) * 10;
    var unidade = n % 10;
    return DEZENAS_PT[dezena] + (unidade === 0 ? '' : ' e ' + UNIDADES_PT[unidade]);
  }
  if (n === 100) return 'cem';
  var centena = Math.floor(n / 100) * 100;
  var resto = n % 100;
  return CENTENAS_PT[centena] + (resto === 0 ? '' : ' e ' + letrasHasta999Pt(resto));
}

/**
 * Si el ultimo tramo se une con "e" o solo con un espacio.
 *
 * La regla del portugues: lleva "e" cuando el tramo final es menor que cien o
 * es una centena redonda. Por eso "mil e quinhentos" pero "mil duzentos e
 * cinquenta", y "dois mil e um" pero "dois mil trezentos e vinte".
 */
function seUneConE(valorDelUltimoTramo) {
  if (valorDelUltimoTramo === 0) return false;
  if (valorDelUltimoTramo < 100) return true;
  return valorDelUltimoTramo % 100 === 0;
}

/** Numero en letras hasta 999.999.999.999. */
function numeroEnLetrasPt(n) {
  var entero = Math.trunc(Number(n));
  if (entero === 0) return 'zero';

  var milhoes = Math.floor(entero / 1000000);
  var resto = entero % 1000000;
  var milhares = Math.floor(resto / 1000);
  var unidades = resto % 1000;

  var partes = [];
  if (milhoes) {
    partes.push(milhoes === 1 ? 'um milhão' : numeroEnLetrasPt(milhoes) + ' milhões');
  }
  if (milhares) {
    // "mil", nunca "um mil".
    partes.push(milhares === 1 ? 'mil' : letrasHasta999Pt(milhares) + ' mil');
  }
  if (unidades) partes.push(letrasHasta999Pt(unidades));

  if (partes.length === 1) return partes[0];

  // La "e" solo decide el ultimo empalme, y la decide el valor de ese ultimo
  // tramo: "um milhão e duzentos mil" pero "um milhão duzentos e cinquenta mil".
  var valorDelUltimo = unidades || milhares;
  var union = seUneConE(valorDelUltimo) ? ' e ' : ' ';

  var cabeza = partes.slice(0, -1).join(' ');
  return cabeza + union + partes[partes.length - 1];
}

/**
 * La forma femenina de un numero escrito en letras.
 *
 * En portugues concuerdan el uno, el dos y las centenas de doscientos para
 * arriba: uma, duas, duzentas. Mil y milhões no tienen femenino.
 */
function enFemeninoPt(texto) {
  var t = String(texto);
  t = t.replace(/quinhentos/g, 'quinhentas');
  t = t.replace(/(duz|trez|quatroc|seisc|setec|oitoc|novec)entos/g, '$1entas');
  t = t.replace(/(^|\s)dois$/, '$1duas');
  t = t.replace(/(^|\s)um$/, '$1uma');
  return t;
}

/** "duzentos e cinquenta (250)". Quien llama agrega el sustantivo. */
function letrasYCifraPt(n) {
  var entero = Math.trunc(Number(n));
  return numeroEnLetrasPt(entero) + ' (' + entero + ')';
}

/** "duzentas e cinquenta (250)", para un sustantivo femenino. */
function letrasYCifraFemeninoPt(n) {
  var entero = Math.trunc(Number(n));
  return enFemeninoPt(numeroEnLetrasPt(entero)) + ' (' + entero + ')';
}

if (typeof module !== 'undefined') {
  module.exports = {
    letrasHasta999Pt: letrasHasta999Pt,
    numeroEnLetrasPt: numeroEnLetrasPt,
    enFemeninoPt: enFemeninoPt,
    letrasYCifraPt: letrasYCifraPt,
    letrasYCifraFemeninoPt: letrasYCifraFemeninoPt,
  };
}
