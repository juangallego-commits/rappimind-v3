'use strict';

/**
 * La publicacion de los T&C sin Squarespace.
 *
 * RappiMind escribe el T&C de cada campana como un archivo propio en un bucket
 * de Google Cloud Storage, y una sola pagina de promos.rappi.com (/tyc, con el
 * bloque de src/visor/visor.js) lo muestra en el enlace de la campana:
 *
 *   promos.rappi.com/tyc?co/farmatodo-20-cashback-20-oct-2026
 *
 * Aqui vive lo que habla con Google: subir, leer y guardar el resultado en el
 * Sheet. Lo que se decide sin Google (el enlace, el archivo, las versiones) esta
 * en src/core/publicacion_web.js. Tres momentos publican:
 *
 *   - generar (Api.js): la version 1, en el momento en que se genera.
 *   - ampliarCampana (Api.js): la version nueva, en el mismo enlace.
 *   - la revision de cada hora (RevisionDePublicacion.js): lo que no se pudo
 *     publicar, o lo que dejo de estar, se vuelve a publicar.
 *
 * Las reglas de esta frontera, por lo que puede salir mal:
 *
 *   - Nada aqui lanza por un problema de Cloud Storage: generar o ampliar ya
 *     dejo el documento y la fila, y un bucket caido no puede tumbar eso. La
 *     fila queda en "sin_publicar" y la revision de cada hora reintenta.
 *   - Se publica fuera del bloqueo del script: si Cloud Storage tarda, nadie
 *     mas se queda esperando para generar.
 *   - Reintentar no inventa texto: rehace el T&C con el motor y solo lo publica
 *     si es identico al Google Doc que recibio el comercial.
 *   - Nunca se pisa un archivo de otra solicitud.
 *   - Lo que escribe o lee con la cuenta de quien despliega termina en "_".
 *     google.script.run deja llamar desde el navegador cualquier funcion global
 *     que no termine asi, y la web app corre como quien la despliega: sin el
 *     "_", cualquier cuenta @rappi.com podria publicar un texto propio en
 *     promos.rappi.com/tyc desde la consola. Solo se llaman desde el navegador
 *     generar, ampliarCampana, retirarPublicacion y revisarPublicacion, que
 *     revisan quien pide.
 */

/** La configuracion de la publicacion web, desde las propiedades del script. */
function configuracionWeb() {
  return configuracionDePublicacionWeb({
    bucket: leerPropiedad(PROPIEDADES.PUBLICACION_BUCKET),
    carpeta: leerPropiedad(PROPIEDADES.PUBLICACION_CARPETA),
    visor: leerPropiedad(PROPIEDADES.PUBLICACION_VISOR),
    paises: leerPropiedad(PROPIEDADES.PUBLICACION_PAISES),
  });
}

function mensajeDeError(error) {
  return String(error && error.message ? error.message : error);
}

/** Sube un objeto con sus metadatos. Nunca lanza: { ok, codigo, detalle }. */
function subirObjetoWeb_(config, nombre, contenido, cache) {
  var limite = 'rappimind-' + Utilities.getUuid();
  try {
    var respuesta = UrlFetchApp.fetch(urlDeSubidaWeb(config), {
      method: 'post',
      contentType: 'multipart/related; boundary=' + limite,
      payload: cuerpoDeSubidaWeb({ name: nombre, contentType: 'application/json', cacheControl: cache }, contenido, limite),
      headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() },
      muteHttpExceptions: true,
    });
    var codigo = respuesta.getResponseCode();
    return { ok: codigo === 200, codigo: codigo, detalle: problemaDeCloudStorage(config, codigo, respuesta.getContentText()) };
  } catch (error) {
    return { ok: false, codigo: 0, detalle: 'No pudimos conectarnos con Cloud Storage: ' + mensajeDeError(error) };
  }
}

/** Lee un objeto con la cuenta de RappiMind, sin cache. Nunca lanza. */
function leerObjetoWebPrivado_(config, nombre) {
  try {
    var respuesta = UrlFetchApp.fetch(urlDeLecturaPrivadaWeb(config, nombre), {
      headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() },
      muteHttpExceptions: true,
    });
    return { codigo: respuesta.getResponseCode(), cuerpo: respuesta.getContentText() };
  } catch (error) {
    return { falla: mensajeDeError(error) };
  }
}

/** Lee un objeto como lo leeria cualquier persona, sin iniciar sesion. Nunca lanza. */
function leerObjetoWebPublico_(config, nombre) {
  try {
    var respuesta = UrlFetchApp.fetch(urlPublicaDelObjetoWeb(config, nombre), {
      muteHttpExceptions: true,
      followRedirects: true,
    });
    return { codigo: respuesta.getResponseCode(), cuerpo: respuesta.getContentText() };
  } catch (error) {
    return { falla: mensajeDeError(error) };
  }
}

/**
 * Publica una version del T&C de una campana y la lee de vuelta.
 *
 * datos: { id, codigoPais, idioma, titulo, fechaInicio, fechaFin, texto, version, direccion }
 *
 * Escribe dos archivos con el mismo contenido: el de la version (co/x/v2.json),
 * que no cambia nunca y queda como constancia, y el vigente (co/x.json), que es
 * el que abre el enlace. Despues lee el de la version sin iniciar sesion: asi
 * se comprueba lo que va a ver la gente. El de la version y no el vigente,
 * porque Google puede tener el vigente en cache hasta un minuto con el texto
 * anterior, y eso no es una diferencia.
 *
 * Devuelve un resultado de verificacion (src/core/publicacion.js): 'verificado'
 * si quedo publicado e identico, o 'sin_publicar' con lo que fallo.
 */
function publicarVersionWeb_(config, datos) {
  if (!config.activa) return resultadoDeVerificacion('sin_publicar', config.problema);

  var nombreVigente = nombreDelObjetoWeb(config, datos.codigoPais, datos.direccion);
  var nombreVersion = nombreDelObjetoWeb(config, datos.codigoPais, datos.direccion, datos.version);
  if (!nombreVigente || !nombreVersion) {
    return resultadoDeVerificacion('sin_publicar', 'La dirección "' + datos.direccion + '" no sirve para un enlace web.');
  }

  // Lo que ya habia en el enlace: sus versiones se conservan, y si es de otra
  // solicitud no se toca.
  var anterior = leerObjetoWebPrivado_(config, nombreVigente);
  var versionesAnteriores = [];
  if (!anterior.falla && anterior.codigo === 200) {
    var previo = null;
    try {
      previo = JSON.parse(anterior.cuerpo);
    } catch (error) {
      previo = null;
    }
    if (previo && previo.id && datos.id && previo.id !== datos.id) {
      return resultadoDeVerificacion('sin_publicar',
        'En esa dirección ya hay un T&C de otra solicitud (' + previo.id + '). RappiMind no lo reemplaza.');
    }
    versionesAnteriores = versionesDelArchivoWeb(previo);
  } else if (anterior.falla || anterior.codigo !== 404) {
    return resultadoDeVerificacion('sin_publicar', anterior.falla
      ? 'No pudimos conectarnos con Cloud Storage: ' + anterior.falla
      : problemaDeCloudStorage(config, anterior.codigo, anterior.cuerpo));
  }

  var contenido = jsonEnAscii(documentoWeb({
    id: datos.id,
    codigoPais: datos.codigoPais,
    idioma: datos.idioma,
    titulo: datos.titulo,
    fechaInicio: datos.fechaInicio,
    fechaFin: datos.fechaFin,
    texto: datos.texto,
    version: datos.version,
    publicado: ahoraTexto(),
    versionesAnteriores: versionesAnteriores,
  }));

  var subida = subirObjetoWeb_(config, nombreVersion, contenido, CACHE_DE_UNA_VERSION);
  if (subida.ok) subida = subirObjetoWeb_(config, nombreVigente, contenido, CACHE_DEL_VIGENTE);
  if (!subida.ok) return resultadoDeVerificacion('sin_publicar', subida.detalle);

  var respuesta = leerObjetoWebPublico_(config, nombreVersion);
  if (!respuesta.falla && (respuesta.codigo === 403 || respuesta.codigo === 404)) {
    return resultadoDeVerificacion('sin_publicar',
      'El archivo quedó en el bucket, pero no se puede leer en público: el bucket necesita lectura pública (allUsers).');
  }
  var lectura = leerRespuestaDelArchivoWeb(respuesta);
  if (lectura.listo) {
    // Se escribio pero no se pudo leer de vuelta. Queda para la proxima hora,
    // que lo vuelve a leer: no es lo mismo que no haberlo escrito.
    return resultadoDeVerificacion('sin_verificar', lectura.resultado.detalle);
  }
  return veredictoDeLaPublicacion(esperadoDesdeTexto(datos.texto, { titulo: datos.titulo }), lectura.evento);
}

/** Los datos del archivo de una fila del Sheet ya plana, con el texto que se va a publicar. */
function datosWebDeLaSolicitud(solicitud, ruta, texto, version, pais) {
  return {
    id: solicitud.id,
    codigoPais: solicitud.pais,
    idioma: pais && pais.idioma,
    titulo: solicitud.nombre_campana,
    fechaInicio: solicitud.fecha_inicio,
    fechaFin: solicitud.fecha_fin,
    texto: texto,
    version: version,
    direccion: ruta.direccion,
  };
}

/**
 * El texto para volver a publicar una campana que no quedo publicada.
 *
 * Se rehace con el motor, con la fecha en que se armo (fechaParaRehacerElTexto),
 * y solo sirve si es identico al Google Doc que recibio el comercial. Si los
 * modelos cambiaron desde entonces, o alguien edito el documento, no se publica
 * nada: eso lo tiene que mirar Legal.
 *
 * Devuelve { ok, texto } o { ok: false, detalle }.
 */
function textoParaVolverAPublicar_(solicitud, pais) {
  var entrada;
  try {
    entrada = JSON.parse(solicitud.datos_json || '{}');
  } catch (error) {
    return { ok: false, detalle: 'Los datos guardados de esta campaña no se pueden leer, así que RappiMind no puede rehacer su texto.' };
  }

  var resultado = generarTexto(entrada, pais, MODELOS, {
    fechaReferencia: fechaParaRehacerElTexto(solicitud, entrada) || hoyIso(),
    usuarioEnEquipo: true,
    ampliacion: versionDeLaEntrada(entrada) > 1,
  });
  if (!resultado.valido) {
    return { ok: false, detalle: 'RappiMind ya no puede rehacer el texto de esta campaña con los modelos de hoy. Legal tiene que revisarla.' };
  }

  var esperado = esperadoDeLaSolicitud_(solicitud);
  if (!esperado) return { ok: false, detalle: 'No pudimos abrir el documento de la campaña para compararlo antes de publicar.' };

  var comparacion = compararConLoPublicado(esperado, textoDeLosBloquesWeb(bloquesParaLaWeb(resultado.texto)));
  if (!comparacion.identico) {
    return {
      ok: false,
      detalle: 'El texto que RappiMind volvería a publicar no es idéntico al documento: ' + describirDiferencia(comparacion.diferencia) +
        ' No se publicó nada; Legal tiene que revisarlo.',
    };
  }
  return { ok: true, texto: resultado.texto, version: versionDeLaEntrada(entrada) };
}

/**
 * Vuelve a publicar una fila: rehace el texto, lo compara con el documento y
 * publica. Si lo logra, queda en el Registro por que hubo que reponerlo: un
 * archivo que desaparece del bucket no es normal, y alguien lo va a preguntar.
 */
function volverAPublicarWeb_(solicitud, ruta, config, motivo) {
  var pais = paisPorCodigo(leerPaises(), solicitud.pais);
  if (!pais) return resultadoDeVerificacion('sin_publicar', 'No encontramos el país de esta campaña.');
  var texto = textoParaVolverAPublicar_(solicitud, pais);
  if (!texto.ok) return resultadoDeVerificacion('sin_publicar', texto.detalle);
  var resultado = publicarVersionWeb_(config, datosWebDeLaSolicitud(solicitud, ruta, texto.texto, texto.version, pais));
  if (resultado.estado === 'verificado') registrar('publicar_web_repuesto', solicitud.id + ' · versión ' + texto.version + ' · ' + motivo);
  return resultado;
}

/** La version que deberia mostrar el enlace, segun las ampliaciones guardadas. */
function versionEsperadaDeLaFila(solicitud) {
  try {
    return versionDeLaEntrada(JSON.parse(solicitud.datos_json || '{}'));
  } catch (error) {
    return 1;
  }
}

/**
 * Revisa lo que muestra el enlace de una campana publicada por RappiMind y, si
 * falta, lo vuelve a publicar.
 *
 *   - El archivo no esta (404, o 403: sin permiso de listar, Cloud Storage
 *     contesta 403 por un archivo que no existe): se vuelve a publicar.
 *   - Esta, pero es una version anterior a la de la fila (una ampliacion cuya
 *     subida fallo): se publica la que va.
 *   - Esta y es la que va: se compara con el documento, como en Squarespace.
 *   - Dice que se retiro: queda retirada. Nunca se vuelve a publicar sola.
 *   - No se pudo leer: "sin verificar", y se mira en la proxima hora.
 */
function revisarArchivoWeb_(solicitud, enlace, config) {
  if (!config.activa) return resultadoDeVerificacion('sin_verificar', config.problema);
  var ruta = rutaDesdeEnlaceWeb(config, enlace);
  if (!ruta) return resultadoDeVerificacion('sin_verificar', 'El enlace guardado no es un enlace de la página de los T&C.');

  var respuesta = leerObjetoWebPublico_(config, nombreDelObjetoWeb(config, ruta.codigo, ruta.direccion));
  if (!respuesta.falla && (respuesta.codigo === 404 || respuesta.codigo === 403)) {
    return volverAPublicarWeb_(solicitud, ruta, config, String(solicitud.verificacion || '') === 'sin_publicar'
      ? 'no se había podido publicar' : 'el archivo no estaba en el bucket');
  }

  var lectura = leerRespuestaDelArchivoWeb(respuesta);
  if (lectura.listo) return lectura.resultado;

  var esperada = versionEsperadaDeLaFila(solicitud);
  if (lectura.evento.version < esperada) {
    return volverAPublicarWeb_(solicitud, ruta, config, 'el enlace mostraba la versión ' + lectura.evento.version + ' y va la ' + esperada);
  }
  return veredictoDeLaPublicacion(esperadoDeLaSolicitud_(solicitud), lectura.evento);
}

/**
 * Guarda en la fila lo que paso con la publicacion web y avisa si toca.
 *
 * solicitud: la fila ya plana, con su _fila. opciones.avisar en false cuando
 * el correo de la generacion ya lo cuenta.
 */
function guardarPublicacionWeb_(solicitud, enlace, resultado, opciones) {
  var anterior = String(solicitud.verificacion || '');
  var ahora = ahoraTexto();
  var cambios = {
    verificacion: resultado.estado,
    fecha_verificacion: ahora,
    detalle_verificacion: detalleParaGuardar(resultado),
  };
  if (String(solicitud.link_publicado || '') !== enlace) cambios.link_publicado = enlace;

  var recienPublicada = false;
  if (resultado.estado === 'verificado' && String(solicitud.estado || '') !== 'publicado') {
    cambios.estado = 'publicado';
    cambios.fecha_publicacion = ahora;
    recienPublicada = true;
  }

  actualizarFila('Solicitudes', solicitud._fila, cambios);

  if (anterior !== resultado.estado) {
    registrar('publicar_web', solicitud.id + ' · ' + (anterior || 'sin publicar') + ' -> ' + resultado.estado + ' · ' + enlace +
      (resultado.estado === 'verificado' ? '' : ' · ' + resultado.detalle));
  }
  if (!(opciones && opciones.avisar === false) && hayQueAvisarDeLaPublicacionWeb(anterior, resultado.estado)) {
    enviarCorreoDeVerificacion_(String(solicitud.email || ''), correoDeVerificacion({
      estado: resultado.estado,
      origen: 'web',
      nombreCampana: solicitud.nombre_campana,
      id: solicitud.id,
      enlace: enlace,
      linkDoc: solicitud.link_doc,
      detalle: resultado.detalle,
      avisos: resultado.avisos,
    }), resultado.estado !== 'verificado');
  }

  return {
    verificacion: {
      estado: resultado.estado,
      detalle: resultado.detalle,
      avisos: resultado.avisos || [],
      enlace: enlace,
      fecha: ahora,
    },
    estado: cambios.estado || String(solicitud.estado || ''),
    linkPublicado: enlace,
    recienPublicada: recienPublicada,
    cambio: anterior !== resultado.estado,
  };
}

/** La revision de cada hora y "Revisar ahora", para una campana publicada por RappiMind. */
function revisarYGuardarWeb_(solicitud, enlace, config) {
  var resultado;
  try {
    resultado = revisarArchivoWeb_(solicitud, enlace, config);
  } catch (error) {
    // Un documento que no abre o un modelo que revienta no puede tumbar la
    // corrida: queda "sin verificar" y se mira en la proxima hora.
    registrar('publicar_web_fallido', solicitud.id + ' · ' + mensajeDeError(error));
    resultado = resultadoDeVerificacion('sin_verificar', 'No pudimos revisar la publicación. Volvemos a intentarlo en la próxima revisión.');
  }
  return guardarPublicacionWeb_(solicitud, enlace, resultado);
}

/**
 * Publica una campana recien generada o ampliada, con el texto que se acaba de
 * generar, y guarda el resultado en su fila.
 *
 * Nunca lanza: si algo falla, la fila queda en "sin_publicar" y la revision de
 * cada hora reintenta. Devuelve lo que la pantalla final necesita.
 */
function publicarAlGenerar_(id, texto, version, config, opciones) {
  var solicitud = solicitudPlanaPorId_(id);
  if (!solicitud) return null;
  var pais = paisPorCodigo(leerPaises(), solicitud.pais);
  var enlace = enlaceWebDeLaCampana(config, solicitud.pais, solicitud.direccion_sugerida);
  var ruta = rutaDesdeEnlaceWeb(config, enlace);
  if (!ruta) return null;

  var resultado;
  try {
    resultado = publicarVersionWeb_(config, datosWebDeLaSolicitud(solicitud, ruta, texto, version, pais));
  } catch (error) {
    registrar('publicar_web_fallido', id + ' · ' + mensajeDeError(error));
    resultado = resultadoDeVerificacion('sin_publicar', 'No pudimos publicar: ' + mensajeDeError(error));
  }
  var guardado = guardarPublicacionWeb_(solicitud, enlace, resultado, opciones);
  return {
    modo: 'web',
    estado: resultado.estado,
    detalle: resultado.detalle,
    enlace: enlace,
    version: version,
    fecha: guardado.verificacion.fecha,
  };
}

/**
 * Retira el T&C de una campana publicada por RappiMind: el enlace queda diciendo
 * que se retiro, y las versiones se quedan en el bucket como constancia.
 * Devuelve { ok } o { ok: false, detalle }.
 */
function retirarArchivoWeb_(config, solicitud, ruta) {
  var nombre = nombreDelObjetoWeb(config, ruta.codigo, ruta.direccion);
  var anterior = leerObjetoWebPrivado_(config, nombre);
  var previo = {};
  if (!anterior.falla && anterior.codigo === 200) {
    try {
      previo = JSON.parse(anterior.cuerpo) || {};
    } catch (error) {
      previo = {};
    }
    if (previo.id && previo.id !== solicitud.id) {
      return { ok: false, detalle: 'En esa dirección hay un T&C de otra solicitud (' + previo.id + '). RappiMind no lo toca.' };
    }
  } else if (anterior.falla || anterior.codigo !== 404) {
    return { ok: false, detalle: anterior.falla
      ? 'No pudimos conectarnos con Cloud Storage: ' + anterior.falla
      : problemaDeCloudStorage(config, anterior.codigo, anterior.cuerpo) };
  }

  var retirado = documentoWebRetirado(previo, {
    id: solicitud.id, codigoPais: solicitud.pais, titulo: solicitud.nombre_campana, fecha: ahoraTexto(),
  });
  var subida = subirObjetoWeb_(config, nombre, jsonEnAscii(retirado), CACHE_DEL_VIGENTE);
  return subida.ok ? { ok: true } : { ok: false, detalle: subida.detalle };
}

// --- La pagina /tyc ---------------------------------------------------------------------

/** A quien se le avisa de la pagina /tyc: Legal y, si no hay, los administradores. */
function destinatariosDeLasAlertas() {
  var legal = leerPropiedad(PROPIEDADES.CORREO_COPIA_LEGAL);
  if (legal) return legal;
  return correosAdministradores().join(',');
}

/**
 * Revisa que la pagina /tyc siga en pie y avisa cuando cambia.
 *
 * Es el unico punto del que dependen todos los enlaces nuevos. Un fallo de red
 * no cambia nada: solo cuenta lo que se pudo leer.
 *
 * opciones.soloLeer: dice lo que encontro sin guardarlo ni avisar. Lo usa
 * prepararPublicacionWeb, que no puede tocar el estado guardado: si lo
 * guardara sin avisar, la corrida de cada hora ya no veria el cambio y nadie se
 * enteraria de que la pagina esta caida.
 */
function revisarVisorWeb_(config, opciones) {
  if (!config.activa) return null;
  var respuesta;
  try {
    var pagina = UrlFetchApp.fetch(config.visor, { muteHttpExceptions: true, followRedirects: true });
    respuesta = { codigo: pagina.getResponseCode(), cuerpo: pagina.getContentText() };
  } catch (error) {
    respuesta = { falla: mensajeDeError(error) };
  }

  var estado = estadoDelVisor(respuesta);
  if (estado.estado === 'sin_verificar' || (opciones && opciones.soloLeer)) return estado;

  var anterior = leerPropiedad(PROPIEDADES.VISOR_ESTADO);
  if (anterior === estado.estado) return estado;
  guardarPropiedad(PROPIEDADES.VISOR_ESTADO, estado.estado);
  registrar('visor', (anterior || 'sin revisar') + ' -> ' + estado.estado + ' · ' + estado.detalle);

  // La primera vez que se ve en pie no es noticia. Caerse si, y volver despues de caerse.
  if (estado.estado === 'caido' || anterior === 'caido') {
    var destinatarios = destinatariosDeLasAlertas();
    var mensaje = correoDelVisor({ estado: estado.estado, visor: config.visor, detalle: estado.detalle });
    if (destinatarios && mensaje) {
      try {
        MailApp.sendEmail({ to: destinatarios, subject: mensaje.asunto, htmlBody: mensaje.html, body: mensaje.texto, name: 'RappiMind' });
      } catch (error) {
        registrar('correo_fallido', String(error));
      }
    }
  }
  return estado;
}

/**
 * Para correr a mano desde el editor de Apps Script, una vez que TI creo el
 * bucket y Juan puso PUBLICACION_BUCKET.
 *
 * Publica una prueba en zz/prueba-de-rappimind, la lee como la leeria
 * cualquier persona y revisa la pagina /tyc. Devuelve (y deja en el registro de
 * ejecucion) lo que encontro y el enlace para abrir la prueba en el navegador:
 * si ahi se ve el texto de la prueba, todo el camino funciona, incluido el
 * permiso del bucket para promos.rappi.com.
 *
 * Solo para administradores: google.script.run deja llamar cualquier funcion
 * global desde el navegador, y esta escribe en el bucket con la cuenta de quien
 * despliega.
 */
function prepararPublicacionWeb() {
  exigirAdministrador();
  var config = configuracionWeb();
  var lineas = [];
  if (!config.activa) {
    lineas.push('La publicación web está apagada: ' + config.problema);
  } else {
    lineas.push('Bucket: ' + config.bucket + ' · carpeta: ' + config.carpeta + ' · página: ' + config.visor);
    lineas.push('Países que publican solos: ' + (config.paises.length ? config.paises.join(', ') : 'los que tienen ruta_promos'));

    var hoy = hoyIso();
    var prueba = publicarVersionWeb_(config, {
      id: 'prueba-de-rappimind',
      codigoPais: CODIGO_DE_LA_PRUEBA_WEB,
      idioma: 'es',
      titulo: 'Prueba de RappiMind',
      fechaInicio: hoy,
      fechaFin: hoy,
      texto: TEXTO_DE_LA_PRUEBA_WEB,
      version: 1,
      direccion: DIRECCION_DE_LA_PRUEBA_WEB,
    });
    lineas.push(prueba.estado === 'verificado'
      ? '1. La prueba quedó escrita en el bucket y se lee en público. Bien.'
      : '1. La prueba no quedó publicada: ' + prueba.detalle);

    var visor = revisarVisorWeb_(config, { soloLeer: true });
    lineas.push(visor.estado === 'en_pie'
      ? '2. La página ' + config.visor + ' tiene el bloque de RappiMind. Bien.'
      : '2. La página del visor no está lista: ' + visor.detalle);

    lineas.push('3. Abre en el navegador ' + enlaceWebDeLaCampana(config, CODIGO_DE_LA_PRUEBA_WEB, DIRECCION_DE_LA_PRUEBA_WEB) +
      ' y confirma que se ve el texto de la prueba. Si dice que no pudo cargarlos, falta el permiso del bucket para promos.rappi.com (CORS).');
  }
  var informe = lineas.join('\n');
  Logger.log(informe);
  registrar('preparar_publicacion_web', informe);
  return informe;
}

if (typeof module !== 'undefined') {
  module.exports = {
    configuracionWeb: configuracionWeb,
    subirObjetoWeb_: subirObjetoWeb_,
    leerObjetoWebPrivado_: leerObjetoWebPrivado_,
    leerObjetoWebPublico_: leerObjetoWebPublico_,
    publicarVersionWeb_: publicarVersionWeb_,
    textoParaVolverAPublicar_: textoParaVolverAPublicar_,
    revisarArchivoWeb_: revisarArchivoWeb_,
    guardarPublicacionWeb_: guardarPublicacionWeb_,
    revisarYGuardarWeb_: revisarYGuardarWeb_,
    publicarAlGenerar_: publicarAlGenerar_,
    retirarArchivoWeb_: retirarArchivoWeb_,
    revisarVisorWeb_: revisarVisorWeb_,
    prepararPublicacionWeb: prepararPublicacionWeb,
  };
}
