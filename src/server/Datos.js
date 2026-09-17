'use strict';

/**
 * Acceso al Sheet y a Drive.
 *
 * Todo lo que piensa vive en src/core (tablas.js y paises.js). Aqui solo se lee
 * y se escribe un rectangulo de celdas, para que la parte fragil sea minima y
 * el resto se pueda probar en Node.
 */

function abrirBase() {
  var id = leerPropiedad(PROPIEDADES.SHEET_ID);
  if (!id) throw new Error('Todavía no se ha corrido setup(): falta SHEET_ID.');
  return SpreadsheetApp.openById(id);
}

function hojaPorNombre(nombre) {
  var hoja = abrirBase().getSheetByName(nombre);
  if (!hoja) throw new Error('Falta la pestaña "' + nombre + '". Corre setup() otra vez.');
  return hoja;
}

/** Todas las filas de una pestana como objetos. */
function objetosDe(nombre) {
  return filasComoObjetos(hojaPorNombre(nombre).getDataRange().getValues());
}

/**
 * Los encabezados que tiene la hoja de verdad, no los que deberia tener.
 *
 * Si falta alguno de los esperados se agrega al final, en ese momento. Nunca se
 * mueve ni se borra uno que ya este: mover una columna con datos adentro
 * desalinearia todo el historico.
 *
 * Esto existe para que agregar una columna no dependa de que alguien se acuerde
 * de correr setup(). Una hoja vieja y una nueva escriben igual de bien.
 */
function encabezadosDeLaHoja(hoja, nombre) {
  var esperados = encabezadosDe(nombre);
  if (hoja.getLastRow() === 0) {
    hoja.getRange(1, 1, 1, esperados.length).setValues([esperados]);
    hoja.setFrozenRows(1);
    return esperados.slice();
  }

  var actuales = [];
  var crudos = hoja.getRange(1, 1, 1, hoja.getLastColumn()).getValues()[0];
  for (var i = 0; i < crudos.length; i++) actuales.push(String(crudos[i] === null || crudos[i] === undefined ? '' : crudos[i]).trim());

  var faltantes = [];
  for (var e = 0; e < esperados.length; e++) {
    if (actuales.indexOf(esperados[e]) === -1) faltantes.push(esperados[e]);
  }
  if (faltantes.length > 0) {
    hoja.getRange(1, actuales.length + 1, 1, faltantes.length).setValues([faltantes]);
    actuales = actuales.concat(faltantes);
  }
  return actuales;
}

/** Agrega una fila respetando el orden de los encabezados de la hoja. */
function agregarFila(nombre, objeto) {
  var hoja = hojaPorNombre(nombre);
  hoja.appendRow(objetoComoFila(objeto, encabezadosDeLaHoja(hoja, nombre)));
}

/** Escribe columnas sueltas de una fila que ya existe. */
function actualizarFila(nombre, numeroFila, cambios) {
  var hoja = hojaPorNombre(nombre);
  var encabezados = encabezadosDeLaHoja(hoja, nombre);

  for (var llave in cambios) {
    if (!Object.prototype.hasOwnProperty.call(cambios, llave)) continue;
    var columna = encabezados.indexOf(llave);
    if (columna === -1) continue;
    hoja.getRange(numeroFila, columna + 1).setValue(cambios[llave]);
  }
}

/** Paises: del Sheet, o de la semilla en modo demostracion. */
function leerPaises() {
  if (enModoDemostracion()) {
    var semilla = [];
    for (var i = 0; i < PAISES_SEMILLA.length; i++) {
      semilla.push(paisDesdeFila(PAISES_SEMILLA[i]));
    }
    return semilla;
  }

  var filas = objetosDe('Paises');
  var paises = [];
  for (var f = 0; f < filas.length; f++) {
    paises.push(paisDesdeFila(filas[f]));
  }
  return paises;
}

/** Equipo: vacio en modo demostracion. */
function leerEquipo() {
  if (enModoDemostracion()) return [];

  var filas = objetosDe('Equipo');
  var equipo = [];
  for (var f = 0; f < filas.length; f++) {
    equipo.push(miembroDesdeFila(filas[f]));
  }
  return equipo;
}

function leerSolicitudes() {
  if (enModoDemostracion()) return [];
  return objetosDe('Solicitudes');
}

/** Deja constancia de lo que pasa. Nunca tumba la operacion principal. */
function registrar(accion, detalle) {
  if (enModoDemostracion()) return;
  try {
    agregarFila('Registro', {
      fecha: ahoraTexto(),
      email: correoDelUsuario(),
      accion: accion,
      detalle: typeof detalle === 'string' ? detalle : JSON.stringify(detalle),
    });
  } catch (error) {
    // El registro es util, no critico.
  }
}

/** Subcarpeta del pais dentro de la carpeta raiz. Se crea si no existe. */
function carpetaDelPais(codigoPais, nombrePais) {
  var raizId = leerPropiedad(PROPIEDADES.CARPETA_RAIZ_ID);
  if (!raizId) throw new Error('Todavía no se ha corrido setup(): falta CARPETA_RAIZ_ID.');

  var raiz = DriveApp.getFolderById(raizId);
  var nombre = codigoPais + ' · ' + nombrePais;

  var existentes = raiz.getFoldersByName(nombre);
  if (existentes.hasNext()) return existentes.next();
  return raiz.createFolder(nombre);
}

if (typeof module !== 'undefined') {
  module.exports = {
    abrirBase: abrirBase,
    hojaPorNombre: hojaPorNombre,
    objetosDe: objetosDe,
    encabezadosDeLaHoja: encabezadosDeLaHoja,
    agregarFila: agregarFila,
    actualizarFila: actualizarFila,
    leerPaises: leerPaises,
    leerEquipo: leerEquipo,
    leerSolicitudes: leerSolicitudes,
    registrar: registrar,
    carpetaDelPais: carpetaDelPais,
  };
}
