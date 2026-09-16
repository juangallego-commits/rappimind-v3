'use strict';

/**
 * Puente con el servidor.
 *
 * En Apps Script llama con google.script.run. En la demostracion estatica llama
 * al servidor simulado, que usa el mismo motor dentro del navegador. El resto de
 * la interfaz no sabe cual de los dos esta corriendo.
 */

var RM = window.RM;

function hayAppsScript() {
  return typeof google !== 'undefined' && google.script && google.script.run;
}

function hayServidorSimulado() {
  return !!RM.servidorSimulado;
}

/** Llama a una funcion del servidor. Siempre devuelve una promesa. */
function llamar(nombre) {
  var argumentos = Array.prototype.slice.call(arguments, 1);

  if (hayAppsScript()) {
    return new Promise(function (resolver, rechazar) {
      var corredor = google.script.run
        .withSuccessHandler(resolver)
        .withFailureHandler(function (error) {
          rechazar(new Error(error && error.message ? error.message : String(error)));
        });
      corredor[nombre].apply(corredor, argumentos);
    });
  }

  if (hayServidorSimulado()) {
    return new Promise(function (resolver, rechazar) {
      // Un retardo corto para que se vea el estado de carga, como en la vida real.
      setTimeout(function () {
        try {
          resolver(RM.servidorSimulado[nombre].apply(null, argumentos));
        } catch (error) {
          rechazar(error);
        }
      }, 120);
    });
  }

  return Promise.reject(new Error('No hay servidor disponible.'));
}

RM.servidor = {
  llamar: llamar,
  hayAppsScript: hayAppsScript,
  hayServidorSimulado: hayServidorSimulado,
};
