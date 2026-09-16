'use strict';

/**
 * Validacion de la solicitud antes de generar.
 *
 * Bloquea la generacion (seccion 4.3). Cada error trae el campo y un mensaje
 * en lenguaje claro: que pasó y cómo se arregla.
 *
 * El orden importa. Si el pais no esta disponible para quien pide, no tiene
 * sentido revisar el resto: se devuelve solo ese error.
 */

if (typeof module !== 'undefined' && typeof require === 'function') {
  var moduloEsquemas = require('./esquemas.js');
  var esquemaDe = moduloEsquemas.esquemaDe;
  var camposVisibles = moduloEsquemas.camposVisibles;
  var resolverAtributo = moduloEsquemas.resolverAtributo;

  var moduloFechas = require('./fechas.js');
  var comoNumeroFecha = moduloFechas.comoNumeroFecha;
  var comoNumeroFechaHora = moduloFechas.comoNumeroFechaHora;
  var partesDeFecha = moduloFechas.partesDeFecha;
  var partesDeHora = moduloFechas.partesDeHora;

  var moduloIdentificaciones = require('./identificaciones.js');
  var validarIdentificacion = moduloIdentificaciones.validarIdentificacion;
}

function error(campo, mensaje) {
  return { campo: campo, mensaje: mensaje };
}

function estaVacio(valor) {
  if (valor === null || valor === undefined || valor === '') return true;
  if (typeof valor === 'boolean') return valor === false;
  if (Object.prototype.toString.call(valor) === '[object Array]') return valor.length === 0;
  return false;
}

/** El pais esta disponible para quien pide (seccion 4.3, punto 6). */
function validarPais(pais, usuarioEnEquipo) {
  if (!pais) {
    return error('pais', 'No reconocemos ese país. Elige uno de la lista.');
  }
  if (pais.estado === 'bloqueado') {
    return error('pais', 'Todavía no generamos documentos para ' + pais.nombre + '. Escríbele a Legal.');
  }
  if (pais.estado === 'piloto' && !usuarioEnEquipo) {
    return error('pais', pais.nombre + ' está en piloto. Pídele a Legal que te agregue al equipo de pruebas.');
  }
  return null;
}

/** El tipo de campana existe y esta habilitado para el pais (punto 7). */
function validarTipo(tipo, pais) {
  var esquema = esquemaDe(tipo);
  if (!esquema) {
    return error('tipo', 'No reconocemos ese tipo de campaña. Elige uno de la lista.');
  }
  var habilitados = pais.modelos || [];
  for (var i = 0; i < habilitados.length; i++) {
    if (habilitados[i] === esquema.modelo) return null;
  }
  return error('tipo', 'El tipo "' + esquema.nombre + '" todavía no está habilitado para ' + pais.nombre + '.');
}

/** Campos obligatorios visibles que quedaron vacios. */
function validarObligatorios(entrada, esquema) {
  var errores = [];
  var visibles = camposVisibles(esquema.id, entrada);

  for (var i = 0; i < visibles.length; i++) {
    var campo = visibles[i];
    // Los repetibles se revisan aparte, con su minimo y su maximo.
    if (campo.tipo === 'repetible') continue;
    if (!resolverAtributo(campo.obligatorio, entrada, false)) continue;

    if (estaVacio(entrada[campo.id])) {
      errores.push(error(campo.id, 'Falta ' + campo.etiqueta.toLowerCase() + '.'));
    }
  }
  return errores;
}

/** Rangos, formatos de fecha y hora, y largo de los textos. */
function validarFormatos(entrada, esquema) {
  var errores = [];
  var visibles = camposVisibles(esquema.id, entrada);

  for (var i = 0; i < visibles.length; i++) {
    var campo = visibles[i];
    var valor = entrada[campo.id];
    if (estaVacio(valor)) continue;

    if (campo.tipo === 'numero') {
      var numero = Number(valor);
      if (isNaN(numero)) {
        errores.push(error(campo.id, campo.etiqueta + ' debe ser un número.'));
      } else if (campo.minimo !== undefined && numero < campo.minimo) {
        errores.push(error(campo.id, campo.etiqueta + ' debe ser al menos ' + campo.minimo + '.'));
      } else if (campo.maximo !== undefined && numero > campo.maximo) {
        errores.push(error(campo.id, campo.etiqueta + ' no puede pasar de ' + campo.maximo + '.'));
      }
    } else if (campo.tipo === 'fecha' && !partesDeFecha(valor)) {
      errores.push(error(campo.id, campo.etiqueta + ' no es una fecha válida.'));
    } else if (campo.tipo === 'hora' && !partesDeHora(valor)) {
      errores.push(error(campo.id, campo.etiqueta + ' no es una hora válida.'));
    } else if (campo.tipo === 'texto' && campo.maximo !== undefined && String(valor).length > campo.maximo) {
      errores.push(error(campo.id, campo.etiqueta + ' no puede pasar de ' + campo.maximo + ' caracteres.'));
    }
  }
  return errores;
}

/** Vigencia: fin posterior al inicio y nada anterior a la fecha de referencia. */
function validarVigencia(entrada, fechaReferencia) {
  var errores = [];

  var inicio = comoNumeroFechaHora(entrada.fechaInicio, entrada.horaInicio);
  var fin = comoNumeroFechaHora(entrada.fechaFin, entrada.horaFin);
  if (inicio !== null && fin !== null && fin <= inicio) {
    errores.push(error('fechaFin', 'La campaña no puede terminar antes de empezar. Revisa la fecha y la hora de fin.'));
  }

  var hoy = comoNumeroFecha(fechaReferencia);
  var dia = comoNumeroFecha(entrada.fechaInicio);
  if (hoy !== null && dia !== null && dia < hoy) {
    errores.push(error('fechaInicio', 'La campaña no puede empezar en una fecha que ya pasó.'));
  }
  return errores;
}

/** Identificacion del organizador, con el algoritmo del pais. */
function validarOrganizador(entrada, pais) {
  if (estaVacio(entrada.organizadorId)) return [];
  var revision = validarIdentificacion(pais.codigo, entrada.organizadorId);
  return revision.valido ? [] : [error('organizadorId', revision.mensaje)];
}

/** Cruces propios del Cashback. */
function validarCashback(entrada) {
  var errores = [];
  var tope = Number(entrada.tope);
  var presupuesto = Number(entrada.presupuesto);

  if (entrada.tope !== null && entrada.tope !== undefined && entrada.tope !== '' && tope <= 0) {
    errores.push(error('tope', 'El tope por pedido debe ser mayor que cero.'));
  }
  if (entrada.presupuesto !== null && entrada.presupuesto !== undefined && entrada.presupuesto !== '' && presupuesto <= 0) {
    errores.push(error('presupuesto', 'El presupuesto debe ser mayor que cero.'));
  }
  if (tope > 0 && presupuesto > 0 && tope > presupuesto) {
    errores.push(error('tope', 'El tope por pedido no puede ser mayor que el presupuesto total.'));
  }
  return errores;
}

/** Cruces de los Creditos: carga y redencion frente a la vigencia. */
function validarCreditos(entrada) {
  var errores = [];
  var inicio = comoNumeroFecha(entrada.fechaInicio);
  var fin = comoNumeroFecha(entrada.fechaFin);

  if (entrada.carga === 'fecha') {
    var carga = comoNumeroFecha(entrada.fechaCarga);
    if (carga !== null && inicio !== null && carga < inicio) {
      errores.push(error('fechaCarga', 'La fecha de carga no puede ser anterior al inicio de la campaña.'));
    }
  }

  if (entrada.vigencia === 'fecha') {
    var redencion = comoNumeroFecha(entrada.fechaFinRedencion);
    if (redencion !== null && fin !== null && redencion <= fin) {
      errores.push(error('fechaFinRedencion', 'La fecha límite de redención debe ser posterior al fin de la campaña.'));
    }
  }
  return errores;
}

/** Cruces de la Carrera de Compras. */
function validarCarrera(entrada) {
  var errores = [];

  if (entrada.desempate && entrada.desempate === entrada.criterioGanador) {
    errores.push(error('desempate', 'El desempate no puede ser el mismo criterio con el que se define el ganador. Elige otro.'));
  }

  var fin = comoNumeroFecha(entrada.fechaFin);
  var notificacion = comoNumeroFecha(entrada.fechaNotificacion);
  if (fin !== null && notificacion !== null && notificacion <= fin) {
    errores.push(error('fechaNotificacion', 'La fecha de notificación debe ser posterior al fin de la campaña.'));
  }
  return errores;
}

/** La lista de tiendas del Cashback Day. */
function validarTiendas(entrada, pais, esquema) {
  var errores = [];
  var tiendas = entrada.tiendas || [];
  var definicion = null;

  for (var i = 0; i < esquema.campos.length; i++) {
    if (esquema.campos[i].id === 'tiendas') definicion = esquema.campos[i];
  }
  var minimo = definicion && definicion.minimo !== undefined ? definicion.minimo : 2;
  var maximo = definicion && definicion.maximo !== undefined ? definicion.maximo : 60;

  if (tiendas.length < minimo) {
    errores.push(error('tiendas', 'Agrega al menos ' + minimo + ' tiendas participantes.'));
    return errores;
  }
  if (tiendas.length > maximo) {
    errores.push(error('tiendas', 'No puedes agregar más de ' + maximo + ' tiendas.'));
    return errores;
  }

  var vistos = {};
  for (var t = 0; t < tiendas.length; t++) {
    var tienda = tiendas[t];
    var fila = t + 1;

    for (var c = 0; c < esquema.camposPorTienda.length; c++) {
      var campo = esquema.camposPorTienda[c];
      if (!resolverAtributo(campo.obligatorio, tienda, false)) continue;
      if (estaVacio(tienda[campo.id])) {
        errores.push(error('tiendas', 'Tienda ' + fila + ': falta ' + campo.etiqueta.toLowerCase() + '.'));
      }
    }

    if (!estaVacio(tienda.id)) {
      var revision = validarIdentificacion(pais.codigo, tienda.id);
      if (!revision.valido) {
        errores.push(error('tiendas', 'Tienda ' + fila + ': ' + revision.mensaje));
      } else if (vistos[revision.formateado]) {
        errores.push(error('tiendas', 'Tienda ' + fila + ': esa identificación ya está en la tienda ' + vistos[revision.formateado] + '.'));
      } else {
        vistos[revision.formateado] = fila;
      }
    }
  }
  return errores;
}

var PREFIJO_PUBLICACION = 'https://promos.rappi.com/';

/**
 * El link publicado tiene que vivir en promos.rappi.com. Cualquier otro sitio
 * significa que el T&C no quedo donde la campana lo va a referenciar.
 */
function validarLinkPublicado(url) {
  var texto = String(url || '').trim();
  if (!texto) {
    return { valido: false, mensaje: 'Pega el enlace de la página publicada.' };
  }
  if (texto.indexOf(PREFIJO_PUBLICACION) !== 0) {
    return { valido: false, mensaje: 'El enlace debe empezar por ' + PREFIJO_PUBLICACION + '. Copia la dirección de la página ya publicada en Squarespace.' };
  }
  if (texto.length <= PREFIJO_PUBLICACION.length) {
    return { valido: false, mensaje: 'Falta la parte final del enlace, después de ' + PREFIJO_PUBLICACION + '.' };
  }
  return { valido: true, mensaje: '', url: texto };
}

/**
 * Valida la solicitud completa.
 *
 * contexto: { fechaReferencia, usuarioEnEquipo }
 * Devuelve { valido, errores: [{campo, mensaje}] }.
 */
function validarSolicitud(entrada, pais, contexto) {
  var opciones = contexto || {};
  var errorPais = validarPais(pais, !!opciones.usuarioEnEquipo);
  if (errorPais) return { valido: false, errores: [errorPais] };

  var errorTipo = validarTipo(entrada.tipo, pais);
  if (errorTipo) return { valido: false, errores: [errorTipo] };

  var esquema = esquemaDe(entrada.tipo);
  var errores = [];

  errores = errores.concat(validarObligatorios(entrada, esquema));
  errores = errores.concat(validarFormatos(entrada, esquema));
  errores = errores.concat(validarVigencia(entrada, opciones.fechaReferencia));
  errores = errores.concat(validarOrganizador(entrada, pais));
  errores = errores.concat(validarCreditos(entrada));

  if (entrada.tipo === 'cashback') {
    errores = errores.concat(validarCashback(entrada));
  }
  if (entrada.tipo === 'carrera_compras') {
    errores = errores.concat(validarCarrera(entrada));
  }
  if (entrada.tipo === 'cashback_day') {
    errores = errores.concat(validarTiendas(entrada, pais, esquema));
  }

  return { valido: errores.length === 0, errores: errores };
}

if (typeof module !== 'undefined') {
  module.exports = {
    validarSolicitud: validarSolicitud,
    validarLinkPublicado: validarLinkPublicado,
    PREFIJO_PUBLICACION: PREFIJO_PUBLICACION,
    validarPais: validarPais,
    validarTipo: validarTipo,
    validarObligatorios: validarObligatorios,
    validarVigencia: validarVigencia,
    validarTiendas: validarTiendas,
    estaVacio: estaVacio,
  };
}
