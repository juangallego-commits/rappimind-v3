'use strict';

/**
 * Envio del correo. El contenido lo arma src/core/correo.js, que es puro.
 */

function enviarCorreoDeGeneracion(destinatario, datos) {
  if (!destinatario) return false;

  var mensaje = correoDeGeneracion(datos);
  var opciones = {
    to: destinatario,
    subject: mensaje.asunto,
    htmlBody: mensaje.html,
    body: mensaje.texto,
    name: 'RappiMind',
  };

  var copia = leerPropiedad(PROPIEDADES.CORREO_COPIA_LEGAL);
  if (copia) opciones.cc = copia;

  try {
    MailApp.sendEmail(opciones);
    return true;
  } catch (error) {
    registrar('correo_fallido', String(error));
    return false;
  }
}

if (typeof module !== 'undefined') {
  module.exports = { enviarCorreoDeGeneracion: enviarCorreoDeGeneracion };
}
