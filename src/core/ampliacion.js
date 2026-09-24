'use strict';

/**
 * Ampliar una campana que ya empezo.
 *
 * El principio, decidido por Juan: una campana que ya arranco no cambia sus
 * condiciones, porque pudo haber ordenes hechas con ellas. Lo unico que se
 * puede hacer es darle mas: mas dias, mas presupuesto, mas ordenes o mas
 * unidades. Nunca menos, y nunca otra cosa.
 *
 * La herramienta no sabe si hubo ordenes, asi que usa la hora: si ya paso la
 * hora de inicio, asume que las hubo.
 *
 * Cada ampliacion deja una nota al final del documento, con su fecha. El
 * comercial reemplaza el texto en el mismo enlace de Squarespace, porque el
 * enlace ya esta publicado y la gente ya lo tiene.
 *
 * Ver docs/INVESTIGACION_TRAVEL.md, seccion 6, y docs/MODELO_BASE_TRAVEL.md,
 * seccion 9.
 */

/* En Node las dependencias se cargan con require; en Apps Script ya son globales. */
if (typeof module !== 'undefined' && typeof require === 'function') {
  var moduloFechas = require('./fechas.js');
  var comoNumeroFechaHora = moduloFechas.comoNumeroFechaHora;
  var comoNumeroFecha = moduloFechas.comoNumeroFecha;
  var formatearFecha = moduloFechas.formatearFecha;
  var fechaFinDeLaCampana = require('./validaciones.js').fechaFinDeLaCampana;
  var esquemaDe = require('./esquemas.js').esquemaDe;
}

/** Los cuatro numeros que se pueden ampliar, y como se llaman en pantalla. */
var CAMPOS_AMPLIABLES = [
  { id: 'presupuesto', nombre: 'el presupuesto' },
  { id: 'maxOrdenes', nombre: 'el máximo de órdenes' },
  { id: 'unidades', nombre: 'las unidades con descuento' },
];

/**
 * En que momento esta la campana.
 *
 * Devuelve 'no_empezada', 'en_curso' o 'terminada'. Sin fechas devuelve
 * 'no_empezada', que es lo conservador: deja editar.
 */
function momentoDeLaCampana(entrada, ahoraIso, ahoraHora) {
  var datos = entrada || {};
  var ahora = comoNumeroFechaHora(ahoraIso, ahoraHora || '00:00');
  if (ahora === null) return 'no_empezada';

  var inicio = comoNumeroFechaHora(datos.fechaInicio, datos.horaInicio || '00:00');
  /*
   * fechaFinDeLaCampana y no datos.fechaFin: un tipo que no pregunta la fecha
   * de fin termina el dia que empieza. El cashback por ETA es de un solo dia,
   * asi que leyendo el dato en crudo esa campana no terminaba nunca y se
   * ofrecia ampliarla anos despues. validaciones.js ya lo habia resuelto y
   * aqui no se habia propagado.
   */
  var fin = comoNumeroFechaHora(fechaFinDeLaCampana(datos, esquemaDe(datos.tipo)), datos.horaFin || '23:59');

  if (inicio !== null && ahora < inicio) return 'no_empezada';
  if (fin !== null && ahora > fin) return 'terminada';
  return 'en_curso';
}

/**
 * Si se puede ofrecer el boton de ampliar, y por que no.
 *
 * solicitud: la fila del Sheet, con link_publicado.
 * entrada: las respuestas guardadas.
 */
function puedeAmpliar(solicitud, entrada, ahoraIso, ahoraHora) {
  var fila = solicitud || {};

  if (!String(fila.link_publicado || '').trim()) {
    return {
      puede: false,
      motivo: 'Esta campaña todavía no está publicada. Ampliar solo tiene sentido cuando ya hay un enlace que la gente puede estar viendo.',
    };
  }

  var momento = momentoDeLaCampana(entrada, ahoraIso, ahoraHora);
  if (momento === 'no_empezada') {
    return {
      puede: false,
      momento: momento,
      motivo: 'La campaña todavía no arranca, así que puedes cambiar lo que necesites y generar otra vez. No hace falta ampliarla.',
    };
  }
  if (momento === 'terminada') {
    return {
      puede: false,
      momento: momento,
      motivo: 'La campaña ya terminó. Una campaña terminada no se reabre: crea una nueva con "Usar como base", que queda con su propio enlace.',
    };
  }
  return { puede: true, momento: momento, motivo: '' };
}

/** true si el valor nuevo es un numero mayor que el viejo. */
function esAumento(valorNuevo, valorViejo) {
  var nuevo = Number(valorNuevo);
  var viejo = Number(valorViejo);
  if (!isFinite(nuevo) || nuevo <= 0) return false;
  if (!isFinite(viejo) || viejo <= 0) return true;
  return nuevo > viejo;
}

/**
 * Revisa una ampliacion. Solo deja mover la fecha de fin hacia adelante y
 * subir los numeros; cualquier otra cosa se rechaza con su razon.
 *
 * cambios: { fechaFin, horaFin, presupuesto, maxOrdenes, unidades }
 * Devuelve { valido, errores, cambios } con solo los cambios que aplican.
 */
function validarAmpliacion(entrada, cambios, ahoraIso, ahoraHora) {
  var datos = entrada || {};
  var pedido = cambios || {};
  var errores = [];
  var aplicables = {};

  var estado = puedeAmpliar({ link_publicado: 'x' }, datos, ahoraIso, ahoraHora);
  if (!estado.puede) {
    return { valido: false, errores: [{ campo: 'id', mensaje: estado.motivo }], cambios: {} };
  }

  if (pedido.fechaFin) {
    var finViejo = comoNumeroFechaHora(datos.fechaFin, datos.horaFin || '23:59');
    var finNuevo = comoNumeroFechaHora(pedido.fechaFin, pedido.horaFin || datos.horaFin || '23:59');

    if (finNuevo === null) {
      errores.push({ campo: 'fechaFin', mensaje: 'Esa fecha de fin no tiene forma de fecha. Revísala.' });
    } else if (finViejo !== null && finNuevo <= finViejo) {
      errores.push({
        campo: 'fechaFin',
        mensaje: 'La vigencia solo se puede ampliar hacia adelante. Para terminar antes una campaña en curso, escríbele a Legal.',
      });
    } else {
      aplicables.fechaFin = pedido.fechaFin;
      aplicables.horaFin = pedido.horaFin || datos.horaFin || '23:59';
    }
  }

  for (var i = 0; i < CAMPOS_AMPLIABLES.length; i++) {
    var campo = CAMPOS_AMPLIABLES[i];
    if (pedido[campo.id] === null || pedido[campo.id] === undefined || pedido[campo.id] === '') continue;

    if (!esAumento(pedido[campo.id], datos[campo.id])) {
      errores.push({
        campo: campo.id,
        mensaje: 'Solo se puede subir ' + campo.nombre + ', nunca bajarlo. Bajarlo cambiaría las condiciones de quien ya compró.',
      });
      continue;
    }
    aplicables[campo.id] = Number(pedido[campo.id]);
  }

  var hayAlgo = false;
  for (var llave in aplicables) {
    if (Object.prototype.hasOwnProperty.call(aplicables, llave)) hayAlgo = true;
  }
  if (!hayAlgo && errores.length === 0) {
    errores.push({ campo: 'id', mensaje: 'No pediste ningún cambio. Escribe la fecha nueva, o el número nuevo, de lo que quieras ampliar.' });
  }

  return { valido: errores.length === 0, errores: errores, cambios: aplicables };
}

/**
 * Aplica la ampliacion a las respuestas guardadas y agrega la nota.
 *
 * No muta la entrada original: devuelve una copia. La nota la imprime el
 * modelo al final del documento, con su fecha.
 */
function aplicarAmpliacion(entrada, cambios, hoyIso) {
  var nueva = {};
  for (var llave in entrada) {
    if (Object.prototype.hasOwnProperty.call(entrada, llave)) nueva[llave] = entrada[llave];
  }

  var nota = { fecha: hoyIso };
  for (var campo in cambios) {
    if (!Object.prototype.hasOwnProperty.call(cambios, campo)) continue;
    nueva[campo] = cambios[campo];
    if (campo !== 'horaFin') nota[campo] = cambios[campo];
  }
  if (cambios.fechaFin) nota.horaFin = cambios.horaFin || nueva.horaFin;

  nueva.modificaciones = (entrada.modificaciones || []).slice();
  nueva.modificaciones.push(nota);
  return nueva;
}

/**
 * Las respuestas de una campana sin lo que le dejo una ampliacion.
 *
 * "Usar como base" devolvia datos_json tal cual, y despues de ampliar ese JSON
 * trae `modificaciones` (la nota que el modelo imprime al final del documento)
 * y `sufijoNombre` (el consecutivo del nombre). La campana nueva salia con la
 * nota de modificacion de la vieja adentro, y su primera ampliacion decia
 * "version 3". Tambien se aplica al generar, por si un borrador viejo la trae.
 */
function sinRastroDeAmpliacion(entrada) {
  var limpia = {};
  for (var llave in entrada) {
    if (!Object.prototype.hasOwnProperty.call(entrada, llave)) continue;
    if (llave === 'modificaciones' || llave === 'sufijoNombre') continue;
    limpia[llave] = entrada[llave];
  }
  return limpia;
}

/** Lo que el comercial lee en el historial cuando no puede ampliar. */
function textoDeAmpliacion(solicitud, entrada, ahoraIso, ahoraHora) {
  var estado = puedeAmpliar(solicitud, entrada, ahoraIso, ahoraHora);
  if (estado.puede) {
    return 'Esta campaña está en curso. Puedes ampliar la fecha de fin, el presupuesto, el máximo de órdenes o las unidades. Cualquier otro cambio necesita una campaña nueva.';
  }
  return estado.motivo;
}

if (typeof module !== 'undefined') {
  module.exports = {
    CAMPOS_AMPLIABLES: CAMPOS_AMPLIABLES,
    momentoDeLaCampana: momentoDeLaCampana,
    puedeAmpliar: puedeAmpliar,
    validarAmpliacion: validarAmpliacion,
    aplicarAmpliacion: aplicarAmpliacion,
    textoDeAmpliacion: textoDeAmpliacion,
    sinRastroDeAmpliacion: sinRastroDeAmpliacion,
  };
}
