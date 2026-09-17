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
  var fechaComoTexto = moduloTablas.fechaComoTexto;

  var moduloFechas = require('./fechas.js');
  var listaY = moduloFechas.listaY;
  var formatearFecha = moduloFechas.formatearFecha;
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

    // Google Sheets convierte sola en fecha una celda que diga 2027-03-31, y
    // travel_rnt_vence es una de esas. Comparada como texto, "Wed Mar 31 2027"
    // nunca es mayor que "2026-09-17", asi que el aviso de vencimiento del
    // Registro Nacional de Turismo no se disparaba nunca.
    pais[llave] = Object.prototype.toString.call(fila[llave]) === '[object Date]'
      ? fechaComoTexto(fila[llave])
      : fila[llave];
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

// --- Rappi Travel ----------------------------------------------------------

/**
 * Los tipos de campana de Rappi Travel.
 *
 * Travel tiene su propia entidad legal (Travel Moustache S.A.S.), su propio
 * Registro Nacional de Turismo y su propia politica de datos. Nada de eso se
 * hereda de la fila del pais, asi que un pais sin bloque travel no ofrece estos
 * tipos. Ver docs/INVESTIGACION_TRAVEL.md.
 */
var TIPOS_DE_TRAVEL = ['cashback_travel', 'descuento_travel'];

/** Los datos de Travel sin los cuales un T&C saldria incompleto. */
var DATOS_DE_TRAVEL_OBLIGATORIOS = [
  { llave: 'travel_entidad', nombre: 'la razón social de Rappi Travel' },
  { llave: 'travel_id_fiscal', nombre: 'el NIT de Rappi Travel' },
  { llave: 'travel_rnt', nombre: 'el número del Registro Nacional de Turismo' },
  { llave: 'travel_rnt_vence', nombre: 'la fecha de vencimiento del Registro Nacional de Turismo' },
  { llave: 'travel_url_sitio', nombre: 'la dirección del sitio de Rappi Travel' },
  { llave: 'travel_url_tc', nombre: 'el enlace a los T&C de los Sistemas Rappi Travel' },
  { llave: 'travel_politica_privacidad', nombre: 'el nombre de la política de datos de Rappi Travel' },
  { llave: 'travel_url_privacidad', nombre: 'el enlace a la política de datos de Rappi Travel' },
  { llave: 'travel_entidad_vigilancia', nombre: 'la entidad de vigilancia de Rappi Travel' },
];

function esTipoDeTravel(tipo) {
  return TIPOS_DE_TRAVEL.indexOf(String(tipo || '')) !== -1;
}

/**
 * Si el pais puede generar T&C de Travel hoy, y por que no.
 *
 * Mientras falte un dato o el RNT este vencido no se genera. Un T&C de agencia
 * de viajes sin RNT vigente no cumple la ley 300 de 1996, y uno sin politica de
 * datos deja al usuario sin saber quien trata sus datos ni como reclamarlos.
 *
 * Devuelve { disponible, motivo }.
 */
function travelDisponible(pais, hoyIso) {
  if (!pais) return { disponible: false, motivo: 'No encontramos el país de la campaña.' };

  var faltantes = [];
  for (var i = 0; i < DATOS_DE_TRAVEL_OBLIGATORIOS.length; i++) {
    var dato = DATOS_DE_TRAVEL_OBLIGATORIOS[i];
    if (!String(pais[dato.llave] === null || pais[dato.llave] === undefined ? '' : pais[dato.llave]).trim()) {
      faltantes.push(dato.nombre);
    }
  }
  if (faltantes.length > 0) {
    return {
      disponible: false,
      faltantes: faltantes,
      motivo: 'Rappi Travel todavía no está habilitado en ' + (pais.nombre || pais.codigo) +
        ': falta ' + listaY(faltantes) + '. Escríbele a Legal para que lo complete.',
    };
  }

  var vence = String(pais.travel_rnt_vence || '').trim();
  var hoy = String(hoyIso || '').trim();
  if (hoy && vence && hoy > vence) {
    return {
      disponible: false,
      vencido: true,
      motivo: 'El Registro Nacional de Turismo de Rappi Travel venció el ' + formatearFecha(vence) +
        '. No se pueden generar T&C de Travel hasta renovarlo. Escríbele a Legal.',
    };
  }
  return { disponible: true, motivo: '' };
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
    TIPOS_DE_TRAVEL: TIPOS_DE_TRAVEL,
    DATOS_DE_TRAVEL_OBLIGATORIOS: DATOS_DE_TRAVEL_OBLIGATORIOS,
    esTipoDeTravel: esTipoDeTravel,
    travelDisponible: travelDisponible,
  };
}
