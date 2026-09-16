'use strict';

/**
 * Interfaz de RappiMind v3.
 *
 * Bloque 0: solo pide el estado del despliegue y lo muestra. El formulario por
 * pasos y la vista previa en vivo llegan en los bloques 2 y 3.
 */

(function () {
  var estado = document.getElementById('estado');
  var detalle = document.getElementById('detalle');

  function fila(termino, valor) {
    var dt = document.createElement('dt');
    dt.textContent = termino;
    var dd = document.createElement('dd');
    dd.textContent = valor;
    detalle.appendChild(dt);
    detalle.appendChild(dd);
  }

  function alRecibir(datos) {
    estado.textContent = 'El despliegue responde.';
    fila('Tu correo', datos.correo);
    fila('Bloque', String(datos.bloque));
    fila('Modelos cargados', String(datos.modelos));
    fila('Bloques de cláusulas', String(datos.bloques));
    fila('Países configurados', String(datos.paises));
    detalle.hidden = false;
  }

  function alFallar(error) {
    estado.className = 'ayuda error';
    estado.textContent = 'No se pudo leer el estado: ' + error.message;
  }

  google.script.run.withSuccessHandler(alRecibir).withFailureHandler(alFallar).estadoDelDespliegue();
})();
