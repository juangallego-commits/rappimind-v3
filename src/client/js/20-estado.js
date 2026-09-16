'use strict';

/**
 * El estado de la aplicacion y el borrador guardado en el navegador.
 *
 * El borrador evita que se pierda lo escrito si se cierra la pestana. Puede
 * fallar (modo privado, almacenamiento lleno, permisos), asi que cada lectura y
 * cada escritura estan protegidas y la aplicacion funciona igual sin el.
 */

var RM = window.RM;

var LLAVE_BORRADOR = 'rappimind-v3-borrador';
var VERSION_BORRADOR = 3;

var estado = {
  pantalla: 'inicio',
  configuracion: null,
  entrada: {},
  pasoActual: 0,
  campoAbierto: null,
  filtroRespondido: false,
  motivoDeLegal: null,
  errores: {},
  // Qué preguntas respondió de verdad el comercial. Un valor por defecto NO
  // cuenta como respuesta: la pregunta se muestra igual, con la opción ya
  // marcada, para que nadie se salte una decisión sin verla.
  respondidas: {},
  ultimoTextoVistaPrevia: '',
  resultado: null,
  historial: [],
  borradorDisponible: false,
};

function entrada() {
  return estado.entrada;
}

function fijar(campo, valor) {
  estado.entrada[campo] = valor;
  guardarBorrador();
}

function fijarVarios(cambios) {
  for (var llave in cambios) {
    if (Object.prototype.hasOwnProperty.call(cambios, llave)) estado.entrada[llave] = cambios[llave];
  }
  guardarBorrador();
}

/**
 * Deja el formulario como nuevo.
 *
 * OJO: esto NO guarda el borrador. Si lo guardara, arrancar la aplicación
 * pisaría el borrador de la sesión anterior antes de que la pantalla de inicio
 * alcanzara a leerlo, y la función de no perder lo escrito no serviría de nada.
 * El borrador se guarda cuando el comercial responde algo, que es cuando hay
 * algo que perder.
 */
function reiniciarFormulario(base, yaRespondidas) {
  estado.entrada = base || {};
  estado.respondidas = yaRespondidas || {};
  estado.pasoActual = 0;
  estado.campoAbierto = null;
  estado.errores = {};
  estado.filtroRespondido = false;
  estado.motivoDeLegal = null;
  estado.resultado = null;
  estado.ultimoTextoVistaPrevia = '';
}

// --- Borrador ---------------------------------------------------------------

function almacenamientoDisponible() {
  try {
    var prueba = '__rm__';
    window.localStorage.setItem(prueba, '1');
    window.localStorage.removeItem(prueba);
    return true;
  } catch (error) {
    return false;
  }
}

function guardarBorrador() {
  if (!almacenamientoDisponible()) return false;
  try {
    window.localStorage.setItem(LLAVE_BORRADOR, JSON.stringify({
      version: VERSION_BORRADOR,
      guardado: new Date().toISOString(),
      entrada: estado.entrada,
      respondidas: estado.respondidas,
      pasoActual: estado.pasoActual,
    }));
    return true;
  } catch (error) {
    // Almacenamiento lleno o bloqueado. No se avisa en cada tecla: se sigue.
    return false;
  }
}

function leerBorrador() {
  if (!almacenamientoDisponible()) return null;
  try {
    var crudo = window.localStorage.getItem(LLAVE_BORRADOR);
    if (!crudo) return null;

    var guardado = JSON.parse(crudo);
    if (!guardado || guardado.version !== VERSION_BORRADOR) {
      borrarBorrador();
      return null;
    }
    if (!guardado.entrada || !guardado.entrada.tipo) return null;
    return guardado;
  } catch (error) {
    borrarBorrador();
    return null;
  }
}

function borrarBorrador() {
  try {
    window.localStorage.removeItem(LLAVE_BORRADOR);
  } catch (error) {
    // Nada que hacer.
  }
}

RM.estado = {
  estado: estado,
  entrada: entrada,
  fijar: fijar,
  fijarVarios: fijarVarios,
  reiniciarFormulario: reiniciarFormulario,
  guardarBorrador: guardarBorrador,
  leerBorrador: leerBorrador,
  borrarBorrador: borrarBorrador,
  almacenamientoDisponible: almacenamientoDisponible,
};
