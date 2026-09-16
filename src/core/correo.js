'use strict';

/**
 * Armado del correo que recibe el comercial cuando se genera el documento.
 *
 * Es una funcion pura: recibe datos y devuelve asunto, HTML y texto plano.
 * El envio vive en src/server/Correo.js. Asi el contenido se prueba en Node.
 *
 * Todo dato del usuario se escapa antes de entrar al HTML.
 */

/** Escapa lo que va dentro del HTML. Nunca se inserta texto del usuario sin esto. */
function escaparHtml(valor) {
  return String(valor === null || valor === undefined ? '' : valor)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Escapa lo que va dentro de un atributo href. Solo se aceptan http y https. */
function urlSegura(valor) {
  var texto = String(valor === null || valor === undefined ? '' : valor).trim();
  if (!/^https?:\/\//i.test(texto)) return '';
  return escaparHtml(texto);
}

var NARANJA = '#FF441F';
var TINTA = '#16181D';
var GRIS = '#5D626D';
var BORDE = '#E3E5EA';

var PASOS_PARA_PUBLICAR = [
  'Abre el documento y revisa que todo esté correcto.',
  'Copia el contenido y pégalo en una página nueva de Squarespace.',
  'Publica la página y copia el enlace, que empieza por https://promos.rappi.com/.',
  'Vuelve a RappiMind y pega ese enlace en tu campaña para marcarla como publicada.',
];

/**
 * datos: { nombreCampana, pais, id, linkDoc, urlApp, urlAyuda, urlFormularioLegal }
 * Devuelve { asunto, html, texto }.
 */
function correoDeGeneracion(datos) {
  var nombre = escaparHtml(datos.nombreCampana);
  var pais = escaparHtml(datos.pais);
  var id = escaparHtml(datos.id);
  var linkDoc = urlSegura(datos.linkDoc);
  var urlApp = urlSegura(datos.urlApp);
  var urlAyuda = urlSegura(datos.urlAyuda);

  var asunto = 'Tus T&C están listos · ' + String(datos.nombreCampana || '');

  var pasosHtml = '';
  for (var i = 0; i < PASOS_PARA_PUBLICAR.length; i++) {
    pasosHtml +=
      '<li style="margin:0 0 10px;color:' + TINTA + ';">' + escaparHtml(PASOS_PARA_PUBLICAR[i]) + '</li>';
  }

  var botonDoc = linkDoc
    ? '<a href="' + linkDoc + '" style="display:inline-block;background:' + NARANJA +
      ';color:#FFFFFF;text-decoration:none;font-weight:600;padding:13px 22px;border-radius:8px;">Abrir el documento</a>'
    : '';

  var pieAyuda = urlAyuda
    ? '<p style="margin:18px 0 0;color:' + GRIS + ';font-size:14px;">¿Dudas? Escríbenos en <a href="' +
      urlAyuda + '" style="color:' + NARANJA + ';">el canal de ayuda</a>.</p>'
    : '';

  var volver = urlApp
    ? '<p style="margin:10px 0 0;color:' + GRIS + ';font-size:14px;">Cuando publiques, vuelve a <a href="' +
      urlApp + '" style="color:' + NARANJA + ';">RappiMind</a> y pega el enlace.</p>'
    : '';

  var html =
    '<!DOCTYPE html><html lang="es"><body style="margin:0;padding:0;background:#F7F8FA;">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F7F8FA;padding:32px 12px;">' +
    '<tr><td align="center">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#FFFFFF;border:1px solid ' +
    BORDE + ';border-radius:14px;padding:32px;font-family:Lato,Helvetica,Arial,sans-serif;">' +
    '<tr><td>' +
    '<p style="margin:0 0 4px;color:' + NARANJA + ';font-weight:600;font-size:14px;">RappiMind</p>' +
    '<h1 style="margin:0 0 16px;font-size:24px;line-height:1.25;color:' + TINTA + ';">Tus T&amp;C están listos</h1>' +
    '<p style="margin:0 0 20px;color:' + TINTA + ';font-size:16px;line-height:1.5;">Generamos los Términos y Condiciones de <strong>' +
    nombre + '</strong> para ' + pais + '.</p>' +
    botonDoc +
    '<h2 style="margin:28px 0 10px;font-size:17px;color:' + TINTA + ';">Para publicarlos</h2>' +
    '<ol style="margin:0;padding-left:20px;font-size:15px;line-height:1.5;">' + pasosHtml + '</ol>' +
    volver +
    pieAyuda +
    '<p style="margin:24px 0 0;padding-top:16px;border-top:1px solid ' + BORDE + ';color:' + GRIS +
    ';font-size:13px;">Solicitud ' + id + '. Este documento lo generó RappiMind a partir de modelos aprobados por Legal.</p>' +
    '</td></tr></table></td></tr></table></body></html>';

  var lineas = [
    'Tus T&C están listos',
    '',
    'Generamos los Términos y Condiciones de ' + String(datos.nombreCampana || '') + ' para ' + String(datos.pais || '') + '.',
    '',
  ];
  if (datos.linkDoc) lineas.push('Documento: ' + String(datos.linkDoc), '');
  lineas.push('Para publicarlos:');
  for (var p = 0; p < PASOS_PARA_PUBLICAR.length; p++) {
    lineas.push('  ' + (p + 1) + '. ' + PASOS_PARA_PUBLICAR[p]);
  }
  lineas.push('', 'Solicitud ' + String(datos.id || '') + '.');

  return { asunto: asunto, html: html, texto: lineas.join('\n') };
}

if (typeof module !== 'undefined') {
  module.exports = {
    correoDeGeneracion: correoDeGeneracion,
    escaparHtml: escaparHtml,
    urlSegura: urlSegura,
    PASOS_PARA_PUBLICAR: PASOS_PARA_PUBLICAR,
  };
}
