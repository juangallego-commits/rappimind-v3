'use strict';

/**
 * Estructura intermedia del documento.
 *
 * Convierte el texto final del motor en una lista de bloques con formato, sin
 * saber nada de Google. El adaptador de Apps Script (src/server/Documento.js)
 * solo traduce esta estructura a llamadas de DocumentApp.
 *
 * Asi la parte dificil (que es texto, que va en negrita, que es vineta) se
 * prueba entera en Node y el adaptador queda tan simple que casi no puede fallar.
 *
 * Bloques: { tipo, partes } donde tipo es titulo, subtitulo, clausula, parrafo
 * o vineta, y partes es [{ texto, negrita }].
 */

if (typeof module !== 'undefined' && typeof require === 'function') {
  var moduloTextoDoc = require('./texto.js');
  var normalizarTexto = moduloTextoDoc.normalizarTexto;
}

/**
 * Parte un texto con marcas ** en tramos con y sin negrita.
 * "a **b** c" -> [{texto:'a ',negrita:false},{texto:'b',negrita:true},{texto:' c',negrita:false}]
 * Un ** sin cerrar se trata como texto normal, para no perder contenido.
 */
function partirEnNegritas(linea) {
  var tramos = String(linea).split('**');
  var partes = [];

  // Con un numero par de marcas queda un tramo impar: el reparto alterna bien.
  var marcasImpares = tramos.length % 2 === 0;

  for (var i = 0; i < tramos.length; i++) {
    var texto = tramos[i];
    if (!texto) continue;
    var negrita = i % 2 === 1;
    if (marcasImpares && i === tramos.length - 1) negrita = false;
    partes.push({ texto: texto, negrita: negrita });
  }

  if (partes.length === 0) partes.push({ texto: '', negrita: false });
  return partes;
}

/** Une tramos contiguos con el mismo formato. */
function unirPartesIguales(partes) {
  var unidas = [];
  for (var i = 0; i < partes.length; i++) {
    var ultima = unidas[unidas.length - 1];
    if (ultima && ultima.negrita === partes[i].negrita) {
      ultima.texto += partes[i].texto;
    } else {
      unidas.push({ texto: partes[i].texto, negrita: partes[i].negrita });
    }
  }
  return unidas;
}

/**
 * Texto final del motor -> lista de bloques.
 * No inventa ni reordena nada: cada linea no vacia produce exactamente un bloque.
 */
function estructuraDelDocumento(texto) {
  var lineas = normalizarTexto(texto).split('\n');
  var bloques = [];

  for (var i = 0; i < lineas.length; i++) {
    var linea = lineas[i];
    if (!linea.trim()) continue;

    var tipo = 'parrafo';
    var contenido = linea;

    if (linea.indexOf('## ') === 0) {
      tipo = 'subtitulo';
      contenido = linea.slice(3);
    } else if (linea.indexOf('# ') === 0) {
      tipo = 'titulo';
      contenido = linea.slice(2);
    } else if (linea.indexOf('• ') === 0) {
      tipo = 'vineta';
      contenido = linea.slice(2);
    } else if (/^\*\*\d+\.\s/.test(linea)) {
      // Clausula numerada: "**1. Titulo.** resto".
      tipo = 'clausula';
    }

    bloques.push({ tipo: tipo, partes: unirPartesIguales(partirEnNegritas(contenido)) });
  }

  return bloques;
}

/** El texto plano de un bloque, sin formato. Sirve para probar y para el correo. */
function textoDelBloque(bloque) {
  var texto = '';
  for (var i = 0; i < bloque.partes.length; i++) {
    texto += bloque.partes[i].texto;
  }
  return texto;
}

/** Titulo del documento: "T&C · {campana} · {pais} · {id}". */
function tituloDelDocumento(nombreCampana, nombrePais, id) {
  return 'T&C · ' + nombreCampana + ' · ' + nombrePais + ' · ' + id;
}

/** Identificador de solicitud con la forma RM-AAAAMMDD-NNNN. */
function identificadorDeSolicitud(fechaIso, consecutivo) {
  var compacta = String(fechaIso || '').replace(/-/g, '');
  var numero = String(Math.trunc(Number(consecutivo) || 0));
  while (numero.length < 4) numero = '0' + numero;
  return 'RM-' + compacta + '-' + numero;
}

if (typeof module !== 'undefined') {
  module.exports = {
    estructuraDelDocumento: estructuraDelDocumento,
    partirEnNegritas: partirEnNegritas,
    textoDelBloque: textoDelBloque,
    tituloDelDocumento: tituloDelDocumento,
    identificadorDeSolicitud: identificadorDeSolicitud,
  };
}
