'use strict';

/**
 * Configuracion del proyecto: propiedades del script, constantes y modo demostracion.
 *
 * Nada de logica de negocio aqui. Solo lee y escribe propiedades y expone
 * nombres fijos, para que el resto del servidor no tenga literales sueltos.
 */

var NOMBRE_DE_LA_BASE = 'RappiMind v3 · Base';
var NOMBRE_DE_LA_CARPETA = 'RappiMind v3';

/** Propiedades del script. Las dos primeras las crea setup(); el resto las pone Juan. */
var PROPIEDADES = {
  SHEET_ID: 'SHEET_ID',
  CARPETA_RAIZ_ID: 'CARPETA_RAIZ_ID',
  URL_FORMULARIO_LEGAL: 'URL_FORMULARIO_LEGAL',
  CANAL_AYUDA_URL: 'CANAL_AYUDA_URL',
  CORREO_COPIA_LEGAL: 'CORREO_COPIA_LEGAL',
  CORREOS_ADMIN: 'CORREOS_ADMIN',
};

/** Pestanas de la base y sus encabezados, en orden. */
var PESTANAS = {
  Paises: [
    'codigo', 'nombre', 'estado', 'idioma', 'modelos', 'entidad_legal', 'id_fiscal',
    'domicilio_legal', 'pais_legal', 'ley_aplicable', 'jurisdiccion', 'entidad_vigilancia',
    'autoridad_datos', 'url_tc_plataforma', 'url_privacidad', 'url_tc_creditos',
    'moneda_nombre', 'politica_privacidad', 'edad_minima', 'tipo_id_organizador',
    'moneda_simbolo', 'separador_miles', 'termino_dias', 'texto_persona',
    'texto_hora_local', 'texto_derechos_datos', 'por_confirmar_en_pruebas',
    // Rappi Travel tiene su propia entidad legal, su RNT y su politica de
    // datos. Van planas, una por columna, porque la pestana es una tabla.
    'travel_entidad', 'travel_id_fiscal', 'travel_rnt', 'travel_rnt_vence',
    'travel_url_sitio', 'travel_url_tc', 'travel_politica_privacidad',
    'travel_url_privacidad', 'travel_entidad_vigilancia',
  ],
  Equipo: ['email', 'nombre', 'rol', 'pais', 'activo'],
  Solicitudes: [
    'id', 'fecha', 'email', 'pais', 'tipo', 'version_modelo', 'nombre_campana',
    'direccion_sugerida', 'tienda',
    'organizador', 'id_organizador', 'fecha_inicio', 'fecha_fin', 'link_doc', 'estado',
    'link_publicado', 'fecha_publicacion', 'datos_json',
  ],
  Registro: ['fecha', 'email', 'accion', 'detalle'],
};

/**
 * Los encabezados de una pestana.
 *
 * Solicitudes lleva ademas una columna por respuesta, para poder auditar sin
 * abrir el JSON. Se calcula aqui y no en PESTANAS porque sale de los esquemas,
 * y en Apps Script no hay forma segura de saber que archivo se carga primero.
 */
function encabezadosDe(nombre) {
  if (nombre !== 'Solicitudes') return PESTANAS[nombre];
  return PESTANAS.Solicitudes.concat(columnasDeRespuestas());
}

var DOMINIO_PERMITIDO = 'rappi.com';

function propiedades() {
  return PropertiesService.getScriptProperties();
}

function leerPropiedad(nombre) {
  var valor = propiedades().getProperty(nombre);
  return valor === null || valor === undefined ? '' : String(valor).trim();
}

function guardarPropiedad(nombre, valor) {
  propiedades().setProperty(nombre, String(valor === null || valor === undefined ? '' : valor));
}

/**
 * Sin SHEET_ID la app corre en modo demostracion: usa los paises de data/,
 * avisa en pantalla y muestra el texto final en vez de crear el documento.
 */
function enModoDemostracion() {
  return !leerPropiedad(PROPIEDADES.SHEET_ID);
}

/** Correo de quien abre la app. Cadena vacia si Google no lo entrega. */
function correoDelUsuario() {
  try {
    return String(Session.getActiveUser().getEmail() || '').trim().toLowerCase();
  } catch (error) {
    return '';
  }
}

/** Solo se atiende a cuentas del dominio. */
function correoEsDelDominio(correo) {
  return /@rappi\.com$/i.test(String(correo || '').trim());
}

/** Fecha de hoy en AAAA-MM-DD, en la zona horaria del proyecto. */
function hoyIso(zonaHoraria) {
  var zona = zonaHoraria || Session.getScriptTimeZone();
  return Utilities.formatDate(new Date(), zona, 'yyyy-MM-dd');
}

/** Marca de tiempo legible para el Registro. */
function ahoraTexto(zonaHoraria) {
  var zona = zonaHoraria || Session.getScriptTimeZone();
  return Utilities.formatDate(new Date(), zona, 'yyyy-MM-dd HH:mm:ss');
}

/** Hora de ahora en HH:MM. La usa la ampliacion, que depende de la hora. */
function horaAhora(zonaHoraria) {
  var zona = zonaHoraria || Session.getScriptTimeZone();
  return Utilities.formatDate(new Date(), zona, 'HH:mm');
}

/** Correos que setup() deja como administradores. */
function correosAdministradores() {
  var lista = leerPropiedad(PROPIEDADES.CORREOS_ADMIN)
    .split(',')
    .map(function (correo) { return correo.trim().toLowerCase(); })
    .filter(function (correo) { return correo.length > 0; });

  // Quien despliega siempre queda como administrador: sin eso nadie podria entrar.
  var propietario = '';
  try {
    propietario = String(Session.getEffectiveUser().getEmail() || '').trim().toLowerCase();
  } catch (error) {
    propietario = '';
  }
  if (propietario && lista.indexOf(propietario) === -1) lista.push(propietario);

  return lista;
}

if (typeof module !== 'undefined') {
  module.exports = {
    NOMBRE_DE_LA_BASE: NOMBRE_DE_LA_BASE,
    NOMBRE_DE_LA_CARPETA: NOMBRE_DE_LA_CARPETA,
    PROPIEDADES: PROPIEDADES,
    PESTANAS: PESTANAS,
    encabezadosDe: encabezadosDe,
    DOMINIO_PERMITIDO: DOMINIO_PERMITIDO,
    leerPropiedad: leerPropiedad,
    guardarPropiedad: guardarPropiedad,
    enModoDemostracion: enModoDemostracion,
    correoDelUsuario: correoDelUsuario,
    correoEsDelDominio: correoEsDelDominio,
    hoyIso: hoyIso,
    horaAhora: horaAhora,
    ahoraTexto: ahoraTexto,
    correosAdministradores: correosAdministradores,
  };
}
