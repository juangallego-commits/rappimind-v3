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

/** true si el texto trae algun retorno de carro. */
function tieneRetornoDeCarro(texto) {
  return String(texto === null || texto === undefined ? '' : texto).indexOf('\r') !== -1;
}

if (typeof module !== 'undefined') {
  module.exports = {
    tieneValor: tieneValor,
    normalizarTexto: normalizarTexto,
    lineasDe: lineasDe,
    recortarFinalDeLinea: recortarFinalDeLinea,
    normalizarParaComparar: normalizarParaComparar,
    textoPlano: textoPlano,
    tieneRetornoDeCarro: tieneRetornoDeCarro,
  };
}
