'use strict';

/**
 * Traduce un fallo de Google a lo que el comercial tiene que hacer.
 *
 * Cuando algo revienta del otro lado de google.script.run, la interfaz recibe
 * el mensaje crudo de Apps Script. Está en inglés y habla de Google, no de la
 * campaña. Lo que el comercial leía, tal cual, era esto:
 *
 *   No pudimos generar el documento: Lock timeout: another process was holding
 *   the lock for too long.
 *   No pudimos cargar tu historial: Service invoked too many times for one day:
 *   spreadsheets.
 *
 * Los dos son recuperables y ninguno de los dos dice cómo. El primero se
 * arregla esperando diez segundos, y el segundo no se arregla hoy pero sí
 * mañana. Un mensaje que no distingue esas dos cosas deja al comercial
 * escribiéndole a Legal, que es justo lo que esta herramienta evita.
 *
 * Esta función vive en src/core porque es la frontera del transporte, no una
 * pantalla: se aplica una sola vez, en RM.servidor.llamar, y con eso quedan
 * cubiertos los nueve sitios de la interfaz que muestran un fallo. Un arreglo
 * por pantalla se olvida en la siguiente.
 *
 * El texto original no se pierde: va dentro del mensaje cuando la falla no se
 * reconoce, y queda en `error.detalle` siempre.
 */

/*
 * Los patrones se escriben sobre el texto en inglés de Apps Script, que es el
 * que llega, y también sobre el español por si Google lo localiza. Nunca se
 * adivina: lo que no coincide con ninguno se entrega con su texto al lado.
 */
var FALLAS_CONOCIDAS = [
  {
    nombre: 'bloqueo',
    patron: /lock timeout|could not obtain lock|no se pudo obtener el bloqueo|lockservice/i,
    mensaje: 'Otra persona está generando un documento en este mismo momento. ' +
      'Espera unos segundos y vuelve a darle al botón: no se perdió nada de lo que respondiste.',
  },
  {
    nombre: 'cuota',
    patron: /too many times for one day|service invoked too many|quota|límite diario|limite diario/i,
    mensaje: 'Google no deja hacer más operaciones por hoy. Mañana vuelve a funcionar solo. ' +
      'Si lo necesitas hoy, avísale a Juan por #tyc-rappi.',
  },
  {
    nombre: 'permiso',
    patron: /permission|do not have access|no tienes permiso|unauthorized|access denied/i,
    mensaje: 'Tu cuenta no tiene permiso sobre la carpeta de Drive donde va el documento. ' +
      'Pídele acceso a Juan por #tyc-rappi y vuelve a intentarlo.',
  },
  {
    nombre: 'tiempo',
    patron: /exceeded maximum execution time|timed out|timeout|se agotó el tiempo/i,
    mensaje: 'Google tardó demasiado en responder y cortó la operación. ' +
      'Vuelve a intentarlo: lo que respondiste sigue ahí.',
  },
  {
    nombre: 'conexion',
    patron: /failed to fetch|network|networkerror|conexión|sin conexion|offline/i,
    mensaje: 'Se cortó la conexión antes de terminar. Revisa tu internet y vuelve a intentarlo.',
  },
  {
    nombre: 'sesion',
    patron: /moved temporarily|sign in|iniciar sesión|authorization is required|autorización/i,
    mensaje: 'Se cerró tu sesión de Google. Recarga la página, entra otra vez con tu cuenta ' +
      '@rappi.com y vuelve a intentarlo.',
  },
];

/** El texto crudo del fallo, venga como Error, como texto o como objeto. */
function textoDelFallo(crudo) {
  if (!crudo) return '';
  if (typeof crudo === 'string') return crudo;
  if (crudo.message) return String(crudo.message);
  return String(crudo);
}

/**
 * Devuelve el mensaje que se le muestra al comercial.
 *
 * Si la falla no se reconoce, se dice que no fue culpa del formulario y se
 * entrega el texto de Google entre paréntesis, para que pueda copiárselo a
 * Juan. Esconderlo sería peor: sin ese texto nadie puede diagnosticar nada.
 */
function mensajeDeFalla(crudo) {
  var texto = textoDelFallo(crudo).trim();
  if (!texto) {
    return 'Algo falló y no llegó el motivo. Vuelve a intentarlo y, si sigue pasando, ' +
      'avísale a Juan por #tyc-rappi.';
  }
  for (var i = 0; i < FALLAS_CONOCIDAS.length; i++) {
    if (FALLAS_CONOCIDAS[i].patron.test(texto)) return FALLAS_CONOCIDAS[i].mensaje;
  }
  return 'Algo falló del lado de Google, no en lo que respondiste. Vuelve a intentarlo y, ' +
    'si sigue pasando, cópiale esto a Juan por #tyc-rappi: ' + texto;
}

/** El nombre de la falla reconocida, o '' si no se reconoció. Para el registro. */
function claseDeFalla(crudo) {
  var texto = textoDelFallo(crudo);
  for (var i = 0; i < FALLAS_CONOCIDAS.length; i++) {
    if (FALLAS_CONOCIDAS[i].patron.test(texto)) return FALLAS_CONOCIDAS[i].nombre;
  }
  return '';
}

if (typeof module !== 'undefined') {
  module.exports = {
    mensajeDeFalla: mensajeDeFalla,
    claseDeFalla: claseDeFalla,
    textoDelFallo: textoDelFallo,
    FALLAS_CONOCIDAS: FALLAS_CONOCIDAS,
  };
}
