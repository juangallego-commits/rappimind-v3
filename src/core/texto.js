'use strict';

/**
 * Normalizacion de texto del motor.
 *
 * Vive en src/core porque la usan por igual Node (pruebas), Apps Script
 * (generacion del documento) y el navegador (vista previa en vivo).
 *
 * Los modelos y las salidas esperadas se editan en Windows, macOS y Linux. El
 * motor ignora los retornos de carro y la marca BOM para que el texto generado
 * sea identico en los tres sistemas, sin depender de la configuracion de git
 * de quien edite el archivo.
 *
 * Sin import ni require: en Apps Script estas funciones son globales.
 */

/** Quita la marca BOM y convierte \r\n y \r sueltos en \n. */
/**
 * Si un dato viene con algo adentro. Una lista vacia no cuenta.
 *
 * Esta aqui, una sola vez, porque estuvo definida tres veces (en derivados.js,
 * derivados_br.js y derivados_eta.js) con dos criterios distintos para las
 * listas. En Apps Script y en el navegador la ultima definicion pisa a las
 * otras, asi que el mismo dato se evaluaba distinto en Node y en produccion.
 */
function tieneValor(valor) {
  if (valor === null || valor === undefined || valor === '') return false;
  if (Object.prototype.toString.call(valor) === '[object Array]') return valor.length > 0;
  return true;
}

function normalizarTexto(texto) {
  if (texto === null || texto === undefined) return '';
  var limpio = String(texto);
  if (limpio.charCodeAt(0) === 0xfeff) limpio = limpio.slice(1);
  return limpio.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

/** Separa en lineas despues de normalizar. */
function lineasDe(texto) {
  return normalizarTexto(texto).split('\n');
}

/** Quita espacios y tabulaciones al final de cada linea. */
function recortarFinalDeLinea(texto) {
  return lineasDe(texto)
    .map(function (linea) {
      return linea.replace(/[ \t]+$/, '');
    })
    .join('\n');
}

/**
 * Normalizacion usada para comparar el texto generado contra una salida
 * esperada: sin \r, sin espacios al final de linea y sin lineas en blanco al
 * principio ni al final.
 */
function normalizarParaComparar(texto) {
  return recortarFinalDeLinea(texto).replace(/^\n+/, '').replace(/\n+$/, '');
}

/**
 * El documento sin sus marcas de formato: lo que el documento dice, no como
 * se ve. Se usa para buscar frases y para la red de seguridad, donde un "**"
 * en medio no debe esconder un espacio de mas ni una frase rota.
 */
function textoPlano(texto) {
  return normalizarTexto(texto).replace(/\*\*/g, '');
}

/**
 * El termino de dias del pais, en singular cuando la cantidad es uno.
 *
 * La columna termino_dias de la pestana Paises guarda siempre el plural
 * ("dias calendario", "dias naturales", "dias corridos", "dias corridos" en
 * Brasil), porque es como aparece en las clausulas. Cuando la respuesta del
 * comercial es 1, ese plural sale pegado a la cifra y el documento publica
 * "una vigencia de un (1) dias calendario".
 *
 * Paso de verdad: la vigencia de los Creditos admite 1 dia (la pregunta acepta
 * de 1 a 365) y ningun caso dorado usaba ese valor, asi que ninguna prueba lo
 * veia. La red de seguridad del motor tampoco, porque la frase no tiene ningun
 * signo roto: solo esta mal escrita.
 *
 * No se reescribe el texto de Legal: se pone en singular la misma palabra que
 * Legal escribio. La regla es mecanica, sobre cada palabra del termino: lo que
 * termina en "es" pierde el "es" (naturales a natural), lo que termina en "s"
 * pierde la "s" (dias a dia, corridos a corrido) y lo demas se queda igual
 * (calendario). Si alguien escribe otro termino en el Sheet, lo peor que pasa
 * es que se quede como estaba.
 */
function terminoDeDias(pais, cantidad) {
  var termino = (pais && pais.termino_dias) || '';
  if (Number(cantidad) !== 1) return termino;
  return termino
    .split(' ')
    .map(function (palabra) {
      if (/es$/.test(palabra)) return palabra.slice(0, -2);
      if (/s$/.test(palabra)) return palabra.slice(0, -1);
      return palabra;
    })
    .join(' ');
}

/** true si el texto trae algun retorno de carro. */
function tieneRetornoDeCarro(texto) {
  return String(texto === null || texto === undefined ? '' : texto).indexOf('\r') !== -1;
}

/**
 * En que pedidos se gana el beneficio, como una sola respuesta.
 *
 * Hasta el 20 de septiembre de 2026 esto eran dos casillas que se podian marcar
 * a la vez, y el documento salia con dos "unicamente" que no pueden ser ciertos
 * los dos: uno decia que solo por Turbo y el otro que solo consumiendo en el
 * local. Juan lo convirtio en una sola eleccion (punto D2).
 *
 * Las campanas guardadas antes de ese dia tienen una lista, asi que esto lee las
 * dos formas. Sin esto, "Usar como base" sobre una campana vieja recorreria una
 * cadena letra por letra.
 */
function condicionDePedido(entrada) {
  var valor = (entrada || {}).condiciones;
  if (Object.prototype.toString.call(valor) === '[object Array]') {
    return valor.length > 0 ? String(valor[0]) : 'cualquiera';
  }
  var texto = String(valor === null || valor === undefined ? '' : valor).trim();
  return texto || 'cualquiera';
}

if (typeof module !== 'undefined') {
  module.exports = {
    tieneValor: tieneValor,
    condicionDePedido: condicionDePedido,
    normalizarTexto: normalizarTexto,
    lineasDe: lineasDe,
    recortarFinalDeLinea: recortarFinalDeLinea,
    normalizarParaComparar: normalizarParaComparar,
    textoPlano: textoPlano,
    terminoDeDias: terminoDeDias,
    tieneRetornoDeCarro: tieneRetornoDeCarro,
  };
}
