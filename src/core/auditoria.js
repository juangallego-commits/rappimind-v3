'use strict';

/**
 * Lo que se guarda en el Sheet para poder auditar una campana.
 *
 * La pestana Solicitudes tiene una columna por cada respuesta, con el valor
 * legible: "Solo en esta tienda", no "tienda". Asi se puede abrir el Sheet,
 * filtrar y ver que contesto cada comercial sin abrir nada mas.
 *
 * La columna datos_json sigue estando y guarda la respuesta cruda, tal cual
 * llego. Es la que permite volver a generar el documento identico. Las columnas
 * de aqui son para leer; datos_json es para reconstruir.
 */

/* En Node las dependencias se cargan con require; en Apps Script ya son globales. */
if (typeof module !== 'undefined' && typeof require === 'function') {
  var moduloEsquemas = require('./esquemas.js');
  var ESQUEMAS = moduloEsquemas.ESQUEMAS;
  var esquemaDe = moduloEsquemas.esquemaDe;
  var camposVisibles = moduloEsquemas.camposVisibles;

  var moduloPreguntas = require('./preguntas.js');
  var preguntaDe = moduloPreguntas.preguntaDe;
}

/** Prefijo de las columnas de respuesta. Evita chocar con id, pais o tipo. */
var PREFIJO_RESPUESTA = 'resp_';

/**
 * Las columnas de respuesta, en el orden en que se preguntan y sin repetir.
 *
 * Sale de los esquemas, no de una lista escrita a mano: agregar un campo nuevo
 * agrega su columna sola, y asi el Sheet no se queda atras sin que nadie lo note.
 */
function columnasDeRespuestas() {
  var vistos = {};
  var columnas = [];

  for (var tipo in ESQUEMAS) {
    if (!Object.prototype.hasOwnProperty.call(ESQUEMAS, tipo)) continue;
    var campos = ESQUEMAS[tipo].campos || [];
    for (var i = 0; i < campos.length; i++) {
      if (vistos[campos[i].id]) continue;
      vistos[campos[i].id] = true;
      columnas.push(PREFIJO_RESPUESTA + campos[i].id);
    }
  }

  // Las tiendas del Cashback Multitienda son una lista de fichas, no un campo
  // suelto: van juntas en una columna, una tienda por linea.
  if (!vistos.tiendas) columnas.push(PREFIJO_RESPUESTA + 'tiendas');
  return columnas;
}

/**
 * La etiqueta de una opcion, o el valor crudo si no la encuentra.
 *
 * Primero se busca en la pregunta, porque ahi estan las palabras que el
 * comercial leyo en pantalla, y la auditoria tiene que decir lo que el vio. El
 * esquema es el respaldo.
 */
function etiquetaDeOpcion(campo, valor) {
  var pregunta = campo && campo.id ? preguntaDe(campo.id) : null;
  var listas = [pregunta && pregunta.opciones, campo && campo.opciones];

  for (var l = 0; l < listas.length; l++) {
    var opciones = listas[l] || [];
    for (var i = 0; i < opciones.length; i++) {
      if (String(opciones[i].valor) === String(valor)) return opciones[i].etiqueta;
    }
  }
  return String(valor);
}

/** Un valor como se lee en el Sheet. Los numeros siguen siendo numeros. */
function valorLegible(campo, valor) {
  if (valor === null || valor === undefined || valor === '') return '';

  if (campo.tipo === 'casilla') return valor ? 'Sí' : 'No';
  if (campo.tipo === 'numero') return typeof valor === 'number' ? valor : Number(valor);

  if (campo.tipo === 'casillas' || Object.prototype.toString.call(valor) === '[object Array]') {
    var lista = [];
    for (var i = 0; i < valor.length; i++) lista.push(etiquetaDeOpcion(campo, valor[i]));
    return lista.join(', ');
  }

  if (campo.opciones) return etiquetaDeOpcion(campo, valor);
  return String(valor);
}

/** Las tiendas de un Cashback Multitienda, una por linea. */
function tiendasLegibles(tiendas) {
  var lista = tiendas || [];
  var lineas = [];
  for (var i = 0; i < lista.length; i++) {
    var t = lista[i] || {};
    var partes = [t.tienda || '', t.organizadorRazonSocial || '', t.organizadorId || ''];
    if (t.porcentaje) partes.push(t.porcentaje + '%');
    if (t.tope) partes.push('tope ' + t.tope);
    if (t.presupuesto) partes.push('presupuesto ' + t.presupuesto);
    lineas.push(partes.join(' · '));
  }
  return lineas.join('\n');
}

/**
 * Las respuestas de una solicitud, listas para escribir en el Sheet.
 *
 * Solo se llenan las columnas del tipo de campana que se generó. Las demas
 * quedan vacias, que es la verdad: esa pregunta no se hizo.
 */
function respuestasParaElSheet(entrada) {
  var datos = entrada || {};
  var fila = {};

  var esquema = esquemaDe(datos.tipo);
  if (!esquema) return fila;

  // Solo las preguntas que de verdad se le hicieron: un campo oculto puede
  // tener un valor viejo de antes de que el comercial cambiara una respuesta.
  var campos = camposVisibles(datos.tipo, datos);
  for (var i = 0; i < campos.length; i++) {
    var campo = campos[i];
    fila[PREFIJO_RESPUESTA + campo.id] = valorLegible(campo, datos[campo.id]);
  }

  if (esquema.camposPorTienda) {
    fila[PREFIJO_RESPUESTA + 'tiendas'] = tiendasLegibles(datos.tiendas);
  }
  return fila;
}

if (typeof module !== 'undefined') {
  module.exports = {
    PREFIJO_RESPUESTA: PREFIJO_RESPUESTA,
    columnasDeRespuestas: columnasDeRespuestas,
    valorLegible: valorLegible,
    tiendasLegibles: tiendasLegibles,
    respuestasParaElSheet: respuestasParaElSheet,
  };
}
