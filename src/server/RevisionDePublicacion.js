'use strict';

/**
 * La revision de lo publicado en Squarespace.
 *
 * RappiMind no publica: Squarespace no tiene API para crear eventos y su
 * politica de uso prohibe los robots y las credenciales compartidas (ver
 * src/core/publicacion.js y docs/DECISIONES.md). Lo que hace es leer la pagina
 * publica de cada campana y compararla con su documento, en tres momentos:
 *
 *   - cuando el comercial toca "Revisar ahora" (revisarPublicacion);
 *   - cuando pega un enlace a mano (marcarPublicado, en Api.js);
 *   - sola, cada hora, con un disparador (revisarPublicacionesPendientes).
 *
 * Si la pagina es identica, la campana queda publicada sin que nadie vuelva a
 * pegar nada. Si tiene diferencias o la quitaron, se avisa por correo.
 *
 * Este archivo no se llama Publicacion.js a proposito: Apps Script no
 * distingue mayusculas en los nombres, y pisaria a src/core/publicacion.js.
 */

/** La funcion que corre el disparador. Se nombra una sola vez. */
var FUNCION_DE_LA_REVISION = 'revisarPublicacionesPendientes';

/** Una corrida automatica para antes de los seis minutos que da Apps Script. */
var TIEMPO_MAXIMO_DE_LA_CORRIDA = 270000;

/** Baja el JSON de la pagina. Nunca lanza: un fallo de red es un resultado. */
function leerPaginaPublicada(enlace) {
  var url = urlDeLecturaDeSquarespace(enlace);
  if (!url) return { falla: 'El enlace no es de promos.rappi.com.' };
  try {
    var respuesta = UrlFetchApp.fetch(url, {
      muteHttpExceptions: true,
      followRedirects: true,
      headers: { Accept: 'application/json' },
    });
    return { codigo: respuesta.getResponseCode(), cuerpo: respuesta.getContentText() };
  } catch (error) {
    return { falla: String(error && error.message ? error.message : error) };
  }
}

/**
 * Lo esperado: el documento que recibio el comercial, leido del Google Doc.
 * Devuelve null si no se puede abrir; la revision queda "sin verificar".
 */
function esperadoDeLaSolicitud(solicitud) {
  var idDocumento = idDeDocumentoDeGoogle(solicitud.link_doc);
  if (!idDocumento) return null;
  try {
    return esperadoDesdeParrafos(parrafosDelDocumento(idDocumento), {
      titulo: solicitud.nombre_campana,
      fechaInicio: solicitud.fecha_inicio,
      fechaFin: solicitud.fecha_fin,
    });
  } catch (error) {
    registrar('verificar_documento_fallido', solicitud.id + ' · ' + String(error));
    return null;
  }
}

/**
 * Las columnas de la revision, antes de escribirlas.
 *
 * encabezadosDeLaHoja las agrega solas, pero si dos ejecuciones las agregan a
 * la vez quedan repetidas. Generar lo hace con el bloqueo puesto; aqui tambien,
 * y por poco tiempo, para no frenar a nadie que este generando.
 */
function asegurarColumnasDeLaRevision() {
  var bloqueo = LockService.getScriptLock();
  if (!bloqueo.tryLock(5000)) return;
  try {
    encabezadosDeLaHoja(hojaPorNombre('Solicitudes'), 'Solicitudes');
  } finally {
    bloqueo.releaseLock();
  }
}

/** Le escribe a quien genero la campana, y a Legal si hay algo que mirar. */
function avisarDeLaVerificacion(solicitud, resultado, enlace) {
  var mensaje = correoDeVerificacion({
    estado: resultado.estado,
    nombreCampana: solicitud.nombre_campana,
    id: solicitud.id,
    enlace: enlace,
    linkDoc: solicitud.link_doc,
    detalle: resultado.detalle,
    avisos: resultado.avisos,
  });
  return enviarCorreoDeVerificacion(String(solicitud.email || ''), mensaje, resultado.estado !== 'verificado');
}

/**
 * Revisa una solicitud y deja el resultado en el Sheet.
 *
 * solicitud: la fila ya plana (filasPlanas), con su _fila.
 * Devuelve lo que la pantalla necesita, sin fechas de verdad (frontera 1).
 */
function revisarYGuardar(solicitud, enlace) {
  var lectura = leerRespuestaDeSquarespace(leerPaginaPublicada(enlace));
  var resultado = lectura.listo
    ? lectura.resultado
    : veredictoDeLaPublicacion(esperadoDeLaSolicitud(solicitud), lectura.evento);

  var anterior = String(solicitud.verificacion || '');
  resultado = conElEstadoAnterior(resultado, anterior);

  var ahora = ahoraTexto();
  var cambios = {
    verificacion: resultado.estado,
    fecha_verificacion: ahora,
    detalle_verificacion: detalleParaGuardar(resultado),
  };

  // Identica: queda publicada, con el enlace que se reviso. Con diferencias no:
  // la pagina existe, pero lo que esta ahi no es el T&C que se aprobo.
  var recienPublicada = false;
  if (resultado.estado === 'verificado') {
    if (String(solicitud.estado || '') !== 'publicado') {
      cambios.estado = 'publicado';
      cambios.fecha_publicacion = ahora;
      recienPublicada = true;
    }
    if (!String(solicitud.link_publicado || '').trim()) cambios.link_publicado = enlace;
  }

  actualizarFila('Solicitudes', solicitud._fila, cambios);

  // En el Registro queda cada cambio de estado, no cada revision: una fila por
  // hora y por campana taparia lo que de verdad paso.
  if (anterior !== resultado.estado) {
    registrar('verificar', solicitud.id + ' · ' + (anterior || 'sin revisar') + ' -> ' + resultado.estado + ' · ' + enlace);
  }
  if (hayQueAvisarDeLaVerificacion(anterior, resultado.estado)) avisarDeLaVerificacion(solicitud, resultado, enlace);

  return {
    verificacion: {
      estado: resultado.estado,
      detalle: resultado.detalle,
      avisos: resultado.avisos || [],
      enlace: enlace,
      fecha: ahora,
    },
    estado: cambios.estado || String(solicitud.estado || ''),
    linkPublicado: cambios.link_publicado || String(solicitud.link_publicado || ''),
    recienPublicada: recienPublicada,
    cambio: anterior !== resultado.estado,
  };
}

/** La fila de una solicitud por su identificador, ya plana. null si no esta. */
function solicitudPlanaPorId(id) {
  var solicitudes = leerSolicitudes();
  for (var i = 0; i < solicitudes.length; i++) {
    if (solicitudes[i].id === id) return filasPlanas([solicitudes[i]])[0];
  }
  return null;
}

/** Las leyendas rehechas con el enlace publicado. null si no se pueden armar. */
function leyendasConElEnlace(solicitud, enlace) {
  try {
    var pais = paisPorCodigo(leerPaises(), solicitud.pais);
    if (!pais) return null;
    return generarLeyendasDeLaCampana(JSON.parse(solicitud.datos_json || '{}'), pais, LEYENDAS, {
      nombreCampana: solicitud.nombre_campana,
      enlacePublicado: enlace,
    });
  } catch (error) {
    // Una solicitud vieja puede no tener datos_json legible: lo que no hay es
    // leyenda que rehacer, y la revision sigue valiendo.
    return null;
  }
}

/**
 * "Revisar ahora", desde la pantalla final o desde Mis campanas.
 *
 * Revisa el enlace pegado y, si no hay, la direccion que la herramienta
 * propuso. Es la misma revision de la corrida automatica, con el mismo correo
 * si el estado cambia.
 */
function revisarPublicacion(id) {
  var quien = contextoDeQuienPide();
  if (quien.demostracion) {
    return {
      valido: true,
      demostracion: true,
      verificacion: {
        estado: 'sin_verificar',
        detalle: 'En la demostración no se revisa Squarespace.',
        avisos: [], enlace: '', fecha: '',
      },
    };
  }

  var solicitud = solicitudPlanaPorId(id);
  if (!solicitud) return { valido: false, errores: [{ campo: 'id', mensaje: 'No encontramos esa solicitud.' }] };

  var propia = String(solicitud.email).toLowerCase() === quien.correo;
  if (!propia && quien.rol !== 'admin' && quien.rol !== 'legal') {
    return { valido: false, errores: [{ campo: 'id', mensaje: 'Esa solicitud no es tuya.' }] };
  }

  var pais = paisPorCodigo(leerPaises(), solicitud.pais);
  var enlace = enlaceParaRevisar(solicitud, pais ? pais.ruta_promos : '');
  if (!enlace) {
    return {
      valido: true,
      id: id,
      verificacion: {
        estado: 'sin_enlace',
        detalle: 'Todavía no sabemos en qué dirección quedó publicada. Pega el enlace de la página publicada.',
        avisos: [], enlace: '', fecha: '',
      },
    };
  }

  asegurarColumnasDeLaRevision();
  var revision = revisarYGuardar(solicitud, enlace);
  return {
    valido: true,
    id: id,
    verificacion: revision.verificacion,
    estado: revision.estado,
    linkPublicado: revision.linkPublicado,
    leyendas: revision.recienPublicada ? leyendasConElEnlace(solicitud, revision.linkPublicado) : null,
  };
}

/**
 * La corrida automatica. La llama el disparador, cada hora.
 *
 * No pasa por contextoDeQuienPide: aqui no hay nadie pidiendo, corre como
 * quien instalo el disparador. Revisa lo que dice solicitudesPorRevisar, una
 * fila a la vez, y un fallo en una no tumba las demas.
 */
function revisarPublicacionesPendientes() {
  if (enModoDemostracion()) return { revisadas: 0, cambios: 0 };

  asegurarColumnasDeLaRevision();
  var paises = leerPaises();
  var lote = solicitudesPorRevisar(filasPlanas(leerSolicitudes()), rutasDePublicacion(paises), hoyIso(), REVISIONES_POR_CORRIDA);

  var inicio = Date.now();
  var revisadas = 0;
  var cambios = 0;
  for (var i = 0; i < lote.length; i++) {
    if (Date.now() - inicio > TIEMPO_MAXIMO_DE_LA_CORRIDA) break;
    try {
      var revision = revisarYGuardar(lote[i].fila, lote[i].enlace);
      revisadas += 1;
      if (revision.cambio) cambios += 1;
    } catch (error) {
      registrar('verificar_fallido', lote[i].fila.id + ' · ' + String(error));
    }
  }
  return { revisadas: revisadas, cambios: cambios, pendientes: lote.length - revisadas };
}

/**
 * Deja instalada la revision automatica, una sola vez.
 *
 * La corre setup(), y Juan tambien la puede correr a mano desde el editor de
 * Apps Script. Si ya estaba, no crea otra: dos disparadores revisarian dos
 * veces cada hora y mandarian dos correos por cada cambio.
 */
function instalarRevisionAutomatica() {
  var disparadores = ScriptApp.getProjectTriggers();
  var encontrados = 0;
  for (var i = 0; i < disparadores.length; i++) {
    if (disparadores[i].getHandlerFunction() !== FUNCION_DE_LA_REVISION) continue;
    encontrados += 1;
    if (encontrados > 1) ScriptApp.deleteTrigger(disparadores[i]);
  }
  if (encontrados > 0) return 'la revisión automática ya estaba instalada';

  ScriptApp.newTrigger(FUNCION_DE_LA_REVISION).timeBased().everyHours(1).create();
  return 'revisión automática instalada: corre cada hora';
}

/** El interruptor para apagarla, sin desplegar nada. */
function quitarRevisionAutomatica() {
  var disparadores = ScriptApp.getProjectTriggers();
  var quitados = 0;
  for (var i = 0; i < disparadores.length; i++) {
    if (disparadores[i].getHandlerFunction() !== FUNCION_DE_LA_REVISION) continue;
    ScriptApp.deleteTrigger(disparadores[i]);
    quitados += 1;
  }
  return quitados > 0 ? 'revisión automática apagada' : 'la revisión automática no estaba instalada';
}

if (typeof module !== 'undefined') {
  module.exports = {
    FUNCION_DE_LA_REVISION: FUNCION_DE_LA_REVISION,
    leerPaginaPublicada: leerPaginaPublicada,
    esperadoDeLaSolicitud: esperadoDeLaSolicitud,
    asegurarColumnasDeLaRevision: asegurarColumnasDeLaRevision,
    revisarYGuardar: revisarYGuardar,
    solicitudPlanaPorId: solicitudPlanaPorId,
    leyendasConElEnlace: leyendasConElEnlace,
    revisarPublicacion: revisarPublicacion,
    revisarPublicacionesPendientes: revisarPublicacionesPendientes,
    instalarRevisionAutomatica: instalarRevisionAutomatica,
    quitarRevisionAutomatica: quitarRevisionAutomatica,
  };
}
