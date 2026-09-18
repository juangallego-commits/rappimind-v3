'use strict';

/**
 * Carga los textos legales de modelos/ para el build, la previsualizacion y
 * las pruebas. Es la unica puerta de entrada a modelos/ desde Node: asi el
 * tratamiento de finales de linea y comentarios es el mismo en todas partes.
 *
 * El contenido no se interpreta aqui. Interpretarlo es trabajo del motor
 * (src/core), que corre igual en Node y en Apps Script.
 */

const { rutaDesdeRaiz, leerTexto, listarArchivos } = require('./archivos');

const CARPETA_MODELOS = rutaDesdeRaiz('modelos');
const CARPETA_BLOQUES = rutaDesdeRaiz('modelos', 'bloques');
const CARPETA_LEYENDAS = rutaDesdeRaiz('modelos', 'leyendas');

function nombreDe(archivo) {
  return archivo.replace(/\.md$/, '');
}

/**
 * Devuelve { modelos: {nombre: texto}, bloques: {nombre: texto} }.
 * Los textos ya vienen sin BOM y con finales de linea \n.
 */
function cargarModelos() {
  const modelos = {};
  for (const archivo of listarArchivos(CARPETA_MODELOS, '.md')) {
    modelos[nombreDe(archivo)] = leerTexto(rutaDesdeRaiz('modelos', archivo));
  }

  const bloques = {};
  for (const archivo of listarArchivos(CARPETA_BLOQUES, '.md')) {
    bloques[nombreDe(archivo)] = leerTexto(rutaDesdeRaiz('modelos', 'bloques', archivo));
  }

  return { modelos, bloques };
}

/**
 * Los textos de modelos/leyendas/, tal cual, en { id: texto }.
 *
 * Van aparte de cargarModelos porque no son documentos: no se incluyen unos a
 * otros, no se numeran clausulas y tienen largo maximo. Quien los interpreta es
 * src/core/leyendas.js, que corre igual en Node, en Apps Script y en el
 * navegador.
 */
function cargarLeyendas() {
  const leyendas = {};
  for (const archivo of listarArchivos(CARPETA_LEYENDAS, '.md')) {
    leyendas[nombreDe(archivo)] = leerTexto(rutaDesdeRaiz('modelos', 'leyendas', archivo));
  }
  return leyendas;
}

/** Version declarada en la primera linea de comentario del modelo. */
function versionDelModelo(texto) {
  const primera = texto.split('\n')[0] || '';
  if (!primera.startsWith('%%')) return '';
  const encontrado = primera.match(/versi[oó]n\s+([\w.]+)/i);
  return encontrado ? encontrado[1] : '';
}

/** Nombres de bloque referenciados con [[INCLUIR:nombre]] dentro de un texto. */
function inclusionesDe(texto) {
  const nombres = [];
  const patron = /\[\[INCLUIR:([^\]]+)\]\]/g;
  let encontrado;
  while ((encontrado = patron.exec(texto)) !== null) {
    nombres.push(encontrado[1].trim());
  }
  return nombres;
}

module.exports = {
  cargarModelos,
  cargarLeyendas,
  versionDelModelo,
  inclusionesDe,
  CARPETA_MODELOS,
  CARPETA_BLOQUES,
  CARPETA_LEYENDAS,
};
