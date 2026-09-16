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

  var separarPorComas = moduloFechas.separarPorComas;
  var travelDisponible = require('./paises.js').travelDisponible;
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

// --- Rappi Travel ----------------------------------------------------------

/** Solo los digitos de una identificacion, para comparar sin formato. */
function soloDigitosDeId(valor) {
  return String(valor === null || valor === undefined ? '' : valor).replace(/[^0-9]/g, '');
}

/** El NIT sin su digito de verificacion. */
function nitSinVerificacion(valor) {
  var digitos = soloDigitosDeId(valor);
  return digitos.length > 9 ? digitos.slice(0, 9) : digitos;
}

/** Texto en minusculas y sin tildes, para comparar nombres de empresas. */
function comoClaveDeNombre(texto) {
  var original = String(texto === null || texto === undefined ? '' : texto).toLowerCase();
  var con = 'áàäâãéèëêíìïîóòöôõúùüûñç';
  var sin = 'aaaaaeeeeiiiiooooouuuunc';
  var salida = '';
  for (var i = 0; i < original.length; i++) {
    var posicion = con.indexOf(original.charAt(i));
    salida += posicion === -1 ? original.charAt(i) : sin.charAt(posicion);
  }
  return salida;
}

/** Nombres que nunca pueden ser el Organizador de una campana de Travel. */
var NOMBRES_PROHIBIDOS_DE_TRAVEL = ['rappi', 'travel moustache', 'travel mustache'];

var MENSAJE_ORGANIZADOR_DE_TRAVEL =
  'Rappi Travel nunca es el Organizador. Escribe la empresa dueña de la marca que paga el beneficio. ' +
  'Si la campaña la paga Rappi Travel, la redacta Legal.';

/**
 * El Organizador de una campana de Travel no puede ser Rappi ni Travel Moustache.
 *
 * Es la regla 1 de CLAUDE.md llevada a Travel: el Organizador es siempre quien
 * pone la plata, y que Rappi Travel opere la mecanica no lo vuelve organizador.
 */
function validarOrganizadorDeTravel(entrada, pais) {
  var errores = [];

  var nombre = comoClaveDeNombre(entrada.organizadorRazonSocial);
  for (var i = 0; i < NOMBRES_PROHIBIDOS_DE_TRAVEL.length; i++) {
    if (nombre.indexOf(NOMBRES_PROHIBIDOS_DE_TRAVEL[i]) !== -1) {
      errores.push(error('organizadorRazonSocial', MENSAJE_ORGANIZADOR_DE_TRAVEL));
      break;
    }
  }

  var nitDado = nitSinVerificacion(entrada.organizadorId);
  var prohibidos = [nitSinVerificacion(pais && pais.id_fiscal), nitSinVerificacion(pais && pais.travel_id_fiscal)];
  if (nitDado && prohibidos.indexOf(nitDado) !== -1) {
    errores.push(error('organizadorId', MENSAJE_ORGANIZADOR_DE_TRAVEL));
  }
  return errores;
}

/** Las reglas propias de los dos tipos de Travel. Seccion 10 del modelo base. */
function validarTravel(entrada, pais, fechaReferencia) {
  var errores = [];
  var esDescuento = entrada.tipo === 'descuento_travel';

  errores = errores.concat(validarOrganizadorDeTravel(entrada, pais));

  // Si el aliado pide algo que el formulario no cubre, el documento se queda
  // corto: eso lo redacta Legal.
  if (entrada.otraCondicion === 'si') {
    errores.push(error('otraCondicion', 'El aliado pide una condición que este documento no cubre. Esta campaña la redacta Legal.'));
  }

  // Periodo de viaje.
  var viajeInicio = comoNumeroFecha(entrada.periodoViajeInicio);
  var viajeFin = comoNumeroFecha(entrada.periodoViajeFin);
  if (viajeInicio !== null && viajeFin !== null && viajeFin < viajeInicio) {
    errores.push(error('periodoViajeFin', 'El periodo de viaje no puede terminar antes de empezar.'));
  }

  var excluidas = separarPorComas(entrada.fechasExcluidas);
  for (var f = 0; f < excluidas.length; f++) {
    var excluida = comoNumeroFecha(excluidas[f]);
    if (excluida === null) {
      errores.push(error('fechasExcluidas', 'Las fechas excluidas van en formato año-mes-día, separadas por comas. Revisa "' + excluidas[f] + '".'));
      break;
    }
    if (viajeInicio !== null && viajeFin !== null && (excluida < viajeInicio || excluida > viajeFin)) {
      errores.push(error('fechasExcluidas', 'Las fechas excluidas tienen que estar dentro del periodo de viaje. Revisa "' + excluidas[f] + '".'));
      break;
    }
  }

  // Clases tarifarias: una letra cada una, sin repetir.
  var clases = separarPorComas(entrada.clasesExcluidas);
  var vistas = {};
  for (var c = 0; c < clases.length; c++) {
    var clase = String(clases[c]).toUpperCase();
    if (!/^[A-Z]$/.test(clase)) {
      errores.push(error('clasesExcluidas', 'Cada clase tarifaria es una sola letra, separada por comas. Revisa "' + clases[c] + '".'));
      break;
    }
    if (vistas[clase]) {
      errores.push(error('clasesExcluidas', 'La clase tarifaria "' + clase + '" está repetida.'));
      break;
    }
    vistas[clase] = true;
  }

  // Dias de alquiler.
  var minimoDias = Number(entrada.diasAlquilerMinimo);
  var maximoDias = Number(entrada.diasAlquilerMaximo);
  if (isFinite(minimoDias) && minimoDias > 0 && isFinite(maximoDias) && maximoDias > 0 && minimoDias > maximoDias) {
    errores.push(error('diasAlquilerMaximo', 'El mínimo de días de alquiler no puede ser mayor que el máximo.'));
  }

  // El medio de pago de "Pro o RappiCard" no puede excluir a quien paga con
  // otra cosa: el segmento ya dice que RappiCard es una via de entrada.
  if (entrada.segmento === 'pro_o_rappicard' && entrada.metodoPago !== 'digitales') {
    errores.push(error('metodoPago', 'Si pueden participar quienes pagan con RappiCard, el medio de pago tiene que ser "digitales, excepto efectivo". Si no, el documento se contradice.'));
  }

  // La primera comunicacion nunca puede haber salido ya: el T&C se publica antes.
  var hoy = comoNumeroFecha(fechaReferencia);
  var primera = comoNumeroFecha(entrada.fechaPrimeraComunicacion);
  if (hoy !== null && primera !== null && primera < hoy) {
    errores.push(error('fechaPrimeraComunicacion', 'La primera comunicación no puede ser una fecha que ya pasó: el T&C se publica antes de que salga la primera pieza.'));
  }

  if (esDescuento) {
    errores = errores.concat(validarDescuentoTravel(entrada));
  } else {
    errores = errores.concat(validarCashbackTravel(entrada));
  }
  return errores;
}

/** Reglas del cashback_travel: montos, ordenes y redencion. */
function validarCashbackTravel(entrada) {
  var errores = [];
  var presupuesto = Number(entrada.presupuesto);

  if (entrada.formaBeneficio === 'porcentaje' && !entrada.sinTope) {
    var tope = Number(entrada.tope);
    if (isFinite(tope) && tope > 0 && isFinite(presupuesto) && presupuesto > 0 && tope > presupuesto) {
      errores.push(error('tope', 'El tope por orden es mayor que el presupuesto total. Con eso, la primera orden se lleva toda la campaña. Revisa los dos números.'));
    }
  }
  if (entrada.formaBeneficio === 'monto_fijo') {
    var monto = Number(entrada.montoFijo);
    if (isFinite(monto) && monto > 0 && isFinite(presupuesto) && presupuesto > 0 && monto > presupuesto) {
      errores.push(error('montoFijo', 'Los Créditos por orden son más que el presupuesto total. Revisa los dos números.'));
    }
  }

  var porUsuario = Number(entrada.limitePorUsuario);
  var deLaCampana = Number(entrada.maxOrdenes);
  if (!entrada.sinMaxOrdenes && isFinite(porUsuario) && porUsuario > 0 && isFinite(deLaCampana) && deLaCampana > 0 && deLaCampana < porUsuario) {
    errores.push(error('maxOrdenes', 'El máximo de órdenes de la campaña es menor que el máximo por persona. Una sola persona agotaría la campaña.'));
  }

  if (entrada.redencion === 'categorias') {
    var elegidas = entrada.categoriasRedencion || [];
    if (elegidas.length === 0) {
      errores.push(error('categoriasRedencion', 'Marca al menos una categoría donde se puedan usar los Créditos.'));
    }
  }
  return errores;
}

/** Reglas del descuento_travel: porcentajes, asistencia y visibilidad. */
function validarDescuentoTravel(entrada) {
  var errores = [];

  if (entrada.formaDescuento === 'variable') {
    var minimo = Number(entrada.porcentajeMinimo);
    var maximo = Number(entrada.porcentaje);
    if (isFinite(minimo) && isFinite(maximo) && minimo >= maximo) {
      errores.push(error('porcentajeMinimo', 'El porcentaje mínimo tiene que ser menor que el máximo. Si son iguales, el descuento es fijo.'));
    }
  }

  // Una asistencia al viajero se compra junto con el vuelo o el paquete, y el
  // descuento solo cubre la asistencia. Mezclarla con otra categoria haria que
  // el documento no pueda decir sobre que aplica.
  var categorias = entrada.categorias || [];
  if (categorias.indexOf('Asistencia') !== -1 && categorias.length > 1) {
    errores.push(error('categorias', 'Si la campaña incluye "Asistencia", esa tiene que ser la única categoría. Para las demás, haz una campaña aparte.'));
  }

  if ((entrada.visibilidad || []).length === 0) {
    errores.push(error('visibilidad', 'Marca al menos un lugar donde el usuario vea el descuento.'));
  }
  return errores;
}

/**
 * Avisos de Travel: no bloquean, se muestran en el resumen.
 *
 * PENDIENTE (R17 de docs/MODELO_BASE_TRAVEL.md): Juan decide si alguno pasa a
 * ser un bloqueo.
 */
function avisosDeTravel(entrada) {
  var avisos = [];

  var dias = Number(entrada.diasVigencia);
  if (isFinite(dias) && dias > 0 && dias < 5) {
    avisos.push('Los Créditos duran menos de cinco días. En las campañas reales, una vigencia tan corta genera reclamos de usuarios que no alcanzan a usarlos.');
  }

  var primera = comoNumeroFecha(entrada.fechaPrimeraComunicacion);
  var inicio = comoNumeroFecha(entrada.fechaInicio);
  if (primera !== null && inicio !== null && primera < inicio) {
    avisos.push('La primera pieza sale antes de que arranque la campaña. Publica el T&C antes de esa fecha.');
  }
  return avisos;
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
  if (esquema && esquema.esDeTravel) {
    // Sin los datos de Travel del pais, o con el RNT vencido, no se genera.
    var estadoTravel = travelDisponible(pais, opciones.fechaReferencia);
    if (!estadoTravel.disponible) {
      return { valido: false, errores: [error('tipo', estadoTravel.motivo)] };
    }
    errores = errores.concat(validarTravel(entrada, pais, opciones.fechaReferencia));
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
    validarTravel: validarTravel,
    validarOrganizadorDeTravel: validarOrganizadorDeTravel,
    validarCashbackTravel: validarCashbackTravel,
    validarDescuentoTravel: validarDescuentoTravel,
    avisosDeTravel: avisosDeTravel,
    NOMBRES_PROHIBIDOS_DE_TRAVEL: NOMBRES_PROHIBIDOS_DE_TRAVEL,
    estaVacio: estaVacio,
  };
}
