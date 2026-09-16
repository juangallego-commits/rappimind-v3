'use strict';

/**
 * Punto de entrada del motor: valida y, solo si todo esta bien, renderiza.
 *
 * Es lo unico que necesita llamar el servidor (Apps Script) o la vista previa
 * del navegador. Si algo falta, devuelve la lista de errores y ningun texto:
 * el documento no se crea a medias.
 */

if (typeof module !== 'undefined' && typeof require === 'function') {
  var moduloEsquemas = require('./esquemas.js');
  var esquemaDe = moduloEsquemas.esquemaDe;

  var moduloValidaciones = require('./validaciones.js');
  var validarSolicitud = moduloValidaciones.validarSolicitud;

  var moduloMotor = require('./motor.js');
  var renderizar = moduloMotor.renderizar;
}

/**
 * entrada   hechos del formulario
 * pais      fila de data/paises.json
 * modelos   { modelos, bloques } (en Apps Script, la constante MODELOS)
 * contexto  { fechaReferencia, usuarioEnEquipo }
 *
 * Devuelve { valido, errores: [{campo, mensaje}], texto }.
 */
function generarTexto(entrada, pais, modelos, contexto) {
  var revision = validarSolicitud(entrada, pais, contexto);
  if (!revision.valido) {
    return { valido: false, errores: revision.errores, texto: '' };
  }

  var esquema = esquemaDe(entrada.tipo);
  var render = renderizar(esquema.modelo, entrada, pais, modelos);

  if (render.errores.length > 0) {
    var errores = [];
    for (var i = 0; i < render.errores.length; i++) {
      errores.push({ campo: 'documento', mensaje: render.errores[i] });
    }
    return { valido: false, errores: errores, texto: '' };
  }

  return { valido: true, errores: [], texto: render.texto };
}

if (typeof module !== 'undefined') {
  module.exports = { generarTexto: generarTexto };
}
