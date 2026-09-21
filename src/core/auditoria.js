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
function etiquetaDeOpcion(campo, valor, tipo) {
  // Con el tipo, porque una misma pregunta puede tener opciones distintas en
  // cada tipo de campana. Sin el, el metodo de pago de una campana quedaba
  // guardado como "sin_efectivo" en vez de lo que el comercial leyo.
  var pregunta = campo && campo.id ? preguntaDe(campo.id, tipo) : null;
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
function valorLegible(campo, valor, tipo) {
  if (valor === null || valor === undefined || valor === '') return '';

  if (campo.tipo === 'casilla') return valor ? 'Sí' : 'No';
  if (campo.tipo === 'numero') return typeof valor === 'number' ? valor : Number(valor);

  // El tipo de campana se guarda con su nombre, no con su identificador: quien
  // audita el Sheet quiere leer "15 minutos o Cashback", no "cashback_eta".
  if (campo.id === 'tipo') {
    var esquemaDelTipo = esquemaDe(valor);
    return esquemaDelTipo ? esquemaDelTipo.nombre : String(valor);
  }

  if (campo.tipo === 'casillas' || Object.prototype.toString.call(valor) === '[object Array]') {
    var lista = [];
    for (var i = 0; i < valor.length; i++) lista.push(etiquetaDeOpcion(campo, valor[i], tipo));
    return lista.join(', ');
  }

  // Las opciones pueden venir del esquema o de la pregunta. Mirar solo el
  // esquema dejaba en crudo todo campo que reusara una pregunta con opciones.
  var preguntaDelCampo = preguntaDe(campo.id, tipo);
  if (campo.opciones || (preguntaDelCampo && preguntaDelCampo.opciones)) {
    return etiquetaDeOpcion(campo, valor, tipo);
  }
  return String(valor);
}

/**
 * Las tiendas de un Cashback Multitienda, una por linea.
 *
 * Los nombres de los campos son los de CAMPOS_POR_TIENDA. Estuvieron escritos
 * con los del Cashback de una tienda (tienda, organizadorRazonSocial,
 * organizadorId), que en una fila de esta lista no existen, asi que la columna
 * del Sheet guardaba " ·  · " por cada tienda: la auditoria se quedaba sin el
 * dato y nadie se enteraba, porque no lanzaba ningun error.
 */
function tiendasLegibles(tiendas) {
  var lista = tiendas || [];
  var lineas = [];
  for (var i = 0; i < lista.length; i++) {
    var t = lista[i] || {};
    var partes = [t.marca || '', t.razonSocial || '', t.id || ''];
    partes.push(t.nacional ? 'cobertura nacional' : (t.ciudades || ''));
    if (t.presupuesto) partes.push('presupuesto ' + t.presupuesto);
    if (t.tiendaTurbo) partes.push(t.tiendaTurbo);
    lineas.push(partes.join(' · '));
  }
  return lineas.join('\n');
}

/** Los productos participantes de la Carrera, uno por linea. */
function productosLegibles(productos) {
  var lista = productos || [];
  var lineas = [];
  for (var i = 0; i < lista.length; i++) {
    var producto = lista[i] || {};
    lineas.push(String(producto.nombre || '') + ' · EAN ' + String(producto.ean || ''));
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
    fila[PREFIJO_RESPUESTA + campo.id] = valorLegible(campo, datos[campo.id], datos.tipo);
  }

  if (esquema.camposPorTienda) {
    fila[PREFIJO_RESPUESTA + 'tiendas'] = tiendasLegibles(datos.tiendas);
  }
  if (esquema.camposPorProducto) {
    fila[PREFIJO_RESPUESTA + 'productosDetalle'] = productosLegibles(datos.productosDetalle);
  }
  return fila;
}

if (typeof module !== 'undefined') {
  module.exports = {
    PREFIJO_RESPUESTA: PREFIJO_RESPUESTA,
    columnasDeRespuestas: columnasDeRespuestas,
    valorLegible: valorLegible,
    tiendasLegibles: tiendasLegibles,
    productosLegibles: productosLegibles,
    respuestasParaElSheet: respuestasParaElSheet,
  };
}
