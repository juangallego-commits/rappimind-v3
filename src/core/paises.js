'use strict';

/**
 * Normalizacion de la configuracion por pais.
 *
 * Los paises viven en data/paises.json (semilla) y en la pestana Paises del
 * Sheet, donde una lista se guarda como texto separado por comas. Este archivo
 * convierte entre las dos formas y decide que paises ve cada persona.
 */

if (typeof module !== 'undefined' && typeof require === 'function') {
  var moduloTablas = require('./tablas.js');
  var comoBooleano = moduloTablas.comoBooleano;
}

var ESTADOS = ['activo', 'piloto', 'bloqueado'];

/** Columnas que en el Sheet son una lista separada por comas. */
var COLUMNAS_DE_LISTA = ['modelos', 'por_confirmar_en_pruebas'];

function comoLista(valor) {
  if (Object.prototype.toString.call(valor) === '[object Array]') return valor;
  var partes = String(valor === null || valor === undefined ? '' : valor).split(',');
  var limpias = [];
  for (var i = 0; i < partes.length; i++) {
    var parte = partes[i].trim();
    if (parte) limpias.push(parte);
  }
  return limpias;
}

/** Fila del Sheet -> pais utilizable por el motor. */
function paisDesdeFila(fila) {
  var pais = {};
  for (var llave in fila) {
    if (!Object.prototype.hasOwnProperty.call(fila, llave)) continue;
    if (llave === '_fila') continue;
    pais[llave] = fila[llave];
  }

  for (var i = 0; i < COLUMNAS_DE_LISTA.length; i++) {
    var columna = COLUMNAS_DE_LISTA[i];
    pais[columna] = comoLista(pais[columna]);
  }

  pais.codigo = String(pais.codigo || '').trim().toUpperCase();
  pais.estado = String(pais.estado || '').trim().toLowerCase();
  if (ESTADOS.indexOf(pais.estado) === -1) pais.estado = 'bloqueado';

  pais._fila = fila._fila;
  return pais;
}

/** Pais -> fila del Sheet, con las listas convertidas a texto. */
function paisComoFila(pais) {
  var fila = {};
  for (var llave in pais) {
    if (!Object.prototype.hasOwnProperty.call(pais, llave)) continue;
    if (llave === '_fila') continue;
    var valor = pais[llave];
    fila[llave] = Object.prototype.toString.call(valor) === '[object Array]' ? valor.join(', ') : valor;
  }
  return fila;
}

function paisPorCodigo(paises, codigo) {
  var buscado = String(codigo || '').trim().toUpperCase();
  for (var i = 0; i < paises.length; i++) {
    if (String(paises[i].codigo).toUpperCase() === buscado) return paises[i];
  }
  return null;
}

/**
 * Los paises que puede elegir quien pide: los activos siempre, y los de piloto
 * solo si esta en el equipo. Los bloqueados no aparecen nunca.
 */
function paisesDisponibles(paises, usuarioEnEquipo) {
  var disponibles = [];
  for (var i = 0; i < paises.length; i++) {
    var pais = paises[i];
    if (pais.estado === 'activo') disponibles.push(pais);
    else if (pais.estado === 'piloto' && usuarioEnEquipo) disponibles.push(pais);
  }
  return disponibles;
}

/** Los tipos de campana habilitados para un pais, en el orden del catalogo. */
function tiposDelPais(pais, catalogoDeTipos) {
  var habilitados = [];
  var modelos = pais && pais.modelos ? pais.modelos : [];
  for (var i = 0; i < catalogoDeTipos.length; i++) {
    var tipo = catalogoDeTipos[i];
    for (var m = 0; m < modelos.length; m++) {
      if (modelos[m] === tipo.modelo) {
        habilitados.push(tipo);
        break;
      }
    }
  }
  return habilitados;
}

/** Fila de Equipo -> miembro. */
function miembroDesdeFila(fila) {
  return {
    email: String(fila.email || '').trim().toLowerCase(),
    nombre: String(fila.nombre || '').trim(),
    rol: String(fila.rol || 'comercial').trim().toLowerCase(),
    pais: String(fila.pais || '').trim().toUpperCase(),
    activo: comoBooleano(fila.activo),
    _fila: fila._fila,
  };
}

/** Busca a alguien en el equipo por correo. Devuelve null si no esta o no esta activo. */
function miembroPorCorreo(equipo, correo) {
  var buscado = String(correo || '').trim().toLowerCase();
  for (var i = 0; i < equipo.length; i++) {
    if (equipo[i].email === buscado && equipo[i].activo) return equipo[i];
  }
  return null;
}

/**
 * Rol efectivo de quien pide. Quien no esta en el equipo es comercial.
 * Roles: comercial, pruebas, legal, admin.
 */
function rolDe(equipo, correo) {
  var miembro = miembroPorCorreo(equipo, correo);
  return miembro ? miembro.rol : 'comercial';
}

/** Solo pruebas, legal y admin pueden generar en paises en piloto. */
function puedeVerPiloto(rol) {
  return rol === 'pruebas' || rol === 'legal' || rol === 'admin';
}

if (typeof module !== 'undefined') {
  module.exports = {
    ESTADOS: ESTADOS,
    paisDesdeFila: paisDesdeFila,
    paisComoFila: paisComoFila,
    paisPorCodigo: paisPorCodigo,
    paisesDisponibles: paisesDisponibles,
    tiposDelPais: tiposDelPais,
    miembroDesdeFila: miembroDesdeFila,
    miembroPorCorreo: miembroPorCorreo,
    rolDe: rolDe,
    puedeVerPiloto: puedeVerPiloto,
    comoLista: comoLista,
  };
}
