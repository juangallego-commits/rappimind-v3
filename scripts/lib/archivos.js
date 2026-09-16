'use strict';

/**
 * Utilidades de archivos para el build y las pruebas.
 *
 * Todo se hace con Node (nada de comandos del sistema) para que funcione
 * igual en Windows, macOS y Linux.
 *
 * Al leer siempre se quitan la marca BOM y los retornos de carro, de modo que
 * un archivo guardado en Windows y el mismo archivo guardado en Linux
 * produzcan exactamente el mismo texto.
 */

const fs = require('fs');
const path = require('path');

const RAIZ = path.resolve(__dirname, '..', '..');

function rutaDesdeRaiz(...partes) {
  return path.join(RAIZ, ...partes);
}

/** Lee un archivo de texto normalizando BOM y finales de linea a \n. */
function leerTexto(ruta) {
  let texto = fs.readFileSync(ruta, 'utf8');
  if (texto.charCodeAt(0) === 0xfeff) texto = texto.slice(1);
  return texto.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

/** Lee y parsea un JSON con la misma normalizacion. */
function leerJson(ruta) {
  return JSON.parse(leerTexto(ruta));
}

/** Escribe texto siempre con finales de linea \n. */
function escribirTexto(ruta, texto) {
  asegurarCarpeta(path.dirname(ruta));
  fs.writeFileSync(ruta, String(texto).replace(/\r\n/g, '\n').replace(/\r/g, '\n'), 'utf8');
}

function asegurarCarpeta(ruta) {
  fs.mkdirSync(ruta, { recursive: true });
}

/** Borra una carpeta completa si existe. Reemplaza a "rm -rf". */
function borrarCarpeta(ruta) {
  fs.rmSync(ruta, { recursive: true, force: true });
}

/** Copia un archivo creando la carpeta destino si hace falta. Reemplaza a "cp". */
function copiarArchivo(origen, destino) {
  asegurarCarpeta(path.dirname(destino));
  fs.copyFileSync(origen, destino);
}

/** Lista archivos de una carpeta filtrando por extension. No recursivo. */
function listarArchivos(carpeta, extension) {
  if (!fs.existsSync(carpeta)) return [];
  return fs
    .readdirSync(carpeta, { withFileTypes: true })
    .filter((entrada) => entrada.isFile())
    .map((entrada) => entrada.name)
    .filter((nombre) => !extension || nombre.endsWith(extension))
    .sort();
}

function existe(ruta) {
  return fs.existsSync(ruta);
}

module.exports = {
  RAIZ,
  rutaDesdeRaiz,
  leerTexto,
  leerJson,
  escribirTexto,
  asegurarCarpeta,
  borrarCarpeta,
  copiarArchivo,
  listarArchivos,
  existe,
};
