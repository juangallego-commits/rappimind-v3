'use strict';

/**
 * Lo que llama la interfaz con google.script.run.
 *
 * Reglas de esta capa:
 *   1. Se verifica el dominio en cada entrada. No se confia en el cliente.
 *   2. Se vuelve a validar en el servidor aunque el navegador ya haya validado.
 *   3. En modo demostracion no se crea nada: se devuelve el texto final.
 */

/** Todo endpoint empieza por aqui. Devuelve quien pide y que puede hacer. */
function contextoDeQuienPide() {
  var correo = correoDelUsuario();
  if (!correoEsDelDominio(correo)) {
    if (enModoDemostracion()) {
      // En demostración no hay cuenta ni documentos: se deja pasar para probar.
      correo = correo || 'demostracion@rappi.com';
    } else {
      throw new Error('Esta herramienta es solo para cuentas @rappi.com.');
    }
  }

  var equipo = leerEquipo();
  // En demostración se usa el rol de pruebas para poder ver también los países
  // en piloto. No se genera ningún documento, así que no hay riesgo legal.
  var rol = enModoDemostracion() ? 'pruebas' : rolDe(equipo, correo);
  var miembro = miembroPorCorreo(equipo, correo);

  return {
    correo: correo,
    rol: rol,
    pais: miembro ? miembro.pais : '',
    enEquipo: puedeVerPiloto(rol),
    demostracion: enModoDemostracion(),
  };
}

/** Catálogo de tipos sin funciones, listo para viajar al navegador. */
function catalogoDeTipos() {
  var catalogo = [];
  for (var id in ESQUEMAS) {
    if (!Object.prototype.hasOwnProperty.call(ESQUEMAS, id)) continue;
    catalogo.push({
      id: ESQUEMAS[id].id,
      nombre: ESQUEMAS[id].nombre,
      descripcion: ESQUEMAS[id].descripcion,
      modelo: ESQUEMAS[id].modelo,
      filtroDeEntrada: ESQUEMAS[id].filtroDeEntrada,
      esDeTravel: !!ESQUEMAS[id].esDeTravel,
    });
  }
  return catalogo;
}

/** Todo lo que la interfaz necesita al abrir. */
function estadoInicial() {
  var quien = contextoDeQuienPide();
  var paises = leerPaises();

  return {
    correo: quien.correo,
    rol: quien.rol,
    demostracion: quien.demostracion,
    paises: filasPlanas(paisesDisponibles(paises, quien.enEquipo)),
    tipos: catalogoDeTipos(),
    secciones: typeof SECCIONES !== 'undefined' ? SECCIONES : {},
    versionesDeModelo: MODELOS.versiones,
    urlFormularioLegal: leerPropiedad(PROPIEDADES.URL_FORMULARIO_LEGAL),
    urlCanalAyuda: leerPropiedad(PROPIEDADES.CANAL_AYUDA_URL),
    hoy: enModoDemostracion() ? '' : hoyIso(),
  };
}

/** Valida y renderiza sin crear nada. La verdad la tiene el servidor. */
function previsualizar(entrada) {
  var quien = contextoDeQuienPide();
  var pais = paisPorCodigo(leerPaises(), entrada && entrada.pais);

  var resultado = generarTexto(entrada || {}, pais, MODELOS, {
    fechaReferencia: enModoDemostracion() ? entrada.fechaReferencia : hoyIso(),
    usuarioEnEquipo: quien.enEquipo,
  });

  return { valido: resultado.valido, errores: resultado.errores, texto: resultado.texto };
}

/**
 * Genera de verdad: documento, carpeta del pais, correo y fila en Solicitudes.
 * En modo demostracion devuelve el texto y no toca nada.
 */
function generar(entrada) {
  var quien = contextoDeQuienPide();
  var paises = leerPaises();
  var pais = paisPorCodigo(paises, entrada && entrada.pais);

  var resultado = generarTexto(entrada || {}, pais, MODELOS, {
    fechaReferencia: enModoDemostracion() ? entrada.fechaReferencia : hoyIso(),
    usuarioEnEquipo: quien.enEquipo,
  });

  if (!resultado.valido) {
    return { valido: false, errores: resultado.errores };
  }

  if (quien.demostracion) {
    return {
      valido: true,
      demostracion: true,
      texto: resultado.texto,
      mensaje: 'Modo demostración: no se creó ningún documento.',
    };
  }

  var bloqueo = LockService.getScriptLock();
  bloqueo.waitLock(30000);

  try {
    var hoy = hoyIso();
    var solicitudes = leerSolicitudes();
    var identificadores = [];
    for (var i = 0; i < solicitudes.length; i++) identificadores.push(solicitudes[i].id);

    var id = identificadorDeSolicitud(hoy, siguienteConsecutivo(identificadores, hoy));

    // El nombre sale de las respuestas, no de un campo de texto. Dos campanas
    // nunca se pueden llamar igual: si el nombre ya existe se le pone un
    // consecutivo y el documento se vuelve a armar con ese nombre, porque el
    // nombre va adentro del articulado.
    var nombresUsados = [];
    for (var n = 0; n < solicitudes.length; n++) nombresUsados.push(solicitudes[n].nombre_campana);

    var esquema = esquemaDe(entrada.tipo);
    entrada.sufijoNombre = sufijoLibreDeNombre(nombreDeCampana(entrada, esquema, pais), nombresUsados);
    if (entrada.sufijoNombre > 1) {
      resultado = generarTexto(entrada, pais, MODELOS, {
        fechaReferencia: hoyIso(),
        usuarioEnEquipo: quien.enEquipo,
      });
      if (!resultado.valido) return { valido: false, errores: resultado.errores };
    }

    var nombreCampana = nombreDeCampana(entrada, esquema, pais);
    var direccion = direccionDeCampana(nombreCampana);
    var titulo = tituloDelDocumento(nombreCampana, pais.nombre, id);
    var carpeta = carpetaDelPais(pais.codigo, pais.nombre);

    var documento = crearDocumento(titulo, estructuraDelDocumento(resultado.texto), carpeta, quien.correo);

    agregarFila('Solicitudes', unirObjetos({
      id: id,
      fecha: ahoraTexto(),
      email: quien.correo,
      pais: pais.codigo,
      tipo: entrada.tipo,
      version_modelo: MODELOS.versiones[esquema.modelo] || '',
      nombre_campana: nombreCampana,
      direccion_sugerida: direccion,
      tienda: entrada.tienda || '',
      organizador: entrada.organizadorRazonSocial || '',
      id_organizador: entrada.organizadorId || '',
      fecha_inicio: entrada.fechaInicio || '',
      fecha_fin: entrada.fechaFin || '',
      link_doc: documento.url,
      estado: 'generado',
      link_publicado: '',
      fecha_publicacion: '',
      datos_json: JSON.stringify(entrada),
    }, respuestasParaElSheet(entrada)));

    enviarCorreoDeGeneracion(quien.correo, {
      nombreCampana: nombreCampana,
      pais: pais.nombre,
      id: id,
      linkDoc: documento.url,
      urlApp: ScriptApp.getService().getUrl(),
      urlAyuda: leerPropiedad(PROPIEDADES.CANAL_AYUDA_URL),
    });

    registrar('generar', id + ' · ' + pais.codigo + ' · ' + entrada.tipo);

    return {
      valido: true,
      id: id,
      linkDoc: documento.url,
      titulo: titulo,
      nombreCampana: nombreCampana,
      direccionSugerida: direccion,
      pais: pais.codigo,
    };
  } finally {
    bloqueo.releaseLock();
  }
}

/** Las solicitudes que puede ver quien pide, con busqueda opcional. */
function historial(busqueda) {
  var quien = contextoDeQuienPide();
  var visibles = solicitudesVisibles(leerSolicitudes(), quien.correo, quien.rol, quien.pais);
  // filasPlanas y no las filas crudas: una fecha del Sheet no cruza a
  // google.script.run y el navegador recibiria null. Ver src/core/tablas.js.
  return filasPlanas(buscarEnSolicitudes(visibles, busqueda).reverse());
}

/** Guarda el link publicado y pasa la solicitud a publicada. */
function marcarPublicado(id, url) {
  var quien = contextoDeQuienPide();
  var revision = validarLinkPublicado(url);
  if (!revision.valido) return { valido: false, errores: [{ campo: 'linkPublicado', mensaje: revision.mensaje }] };

  var solicitudes = leerSolicitudes();
  var solicitud = null;
  for (var i = 0; i < solicitudes.length; i++) {
    if (solicitudes[i].id === id) solicitud = solicitudes[i];
  }
  if (!solicitud) {
    return { valido: false, errores: [{ campo: 'id', mensaje: 'No encontramos esa solicitud.' }] };
  }

  var propia = String(solicitud.email).toLowerCase() === quien.correo;
  if (!propia && quien.rol !== 'admin' && quien.rol !== 'legal') {
    return { valido: false, errores: [{ campo: 'id', mensaje: 'Esa solicitud no es tuya.' }] };
  }

  actualizarFila('Solicitudes', solicitud._fila, {
    link_publicado: revision.url,
    fecha_publicacion: ahoraTexto(),
    estado: 'publicado',
  });
  registrar('publicar', id + ' · ' + revision.url);

  return { valido: true, id: id, linkPublicado: revision.url };
}

/**
 * Amplia una campana en curso: mas dias, mas presupuesto, mas ordenes o mas
 * unidades. Nunca menos, y nunca otra cosa.
 *
 * Genera un documento nuevo con la nota de modificacion al final y deja el
 * mismo enlace publicado: el comercial reemplaza el texto en Squarespace, en la
 * misma pagina, porque la gente ya la tiene. Ver src/core/ampliacion.js.
 */
function ampliarCampana(id, cambios) {
  var quien = contextoDeQuienPide();
  if (quien.demostracion) {
    return { valido: false, errores: [{ campo: 'id', mensaje: 'En modo demostración no hay campañas guardadas que ampliar.' }] };
  }

  var solicitudes = leerSolicitudes();
  var solicitud = null;
  for (var i = 0; i < solicitudes.length; i++) {
    if (solicitudes[i].id === id) solicitud = solicitudes[i];
  }
  if (!solicitud) return { valido: false, errores: [{ campo: 'id', mensaje: 'No encontramos esa solicitud.' }] };

  var propia = String(solicitud.email).toLowerCase() === quien.correo;
  if (!propia && quien.rol !== 'admin' && quien.rol !== 'legal') {
    return { valido: false, errores: [{ campo: 'id', mensaje: 'Esa solicitud no es tuya.' }] };
  }

  var entrada;
  try {
    entrada = JSON.parse(solicitud.datos_json || '{}');
  } catch (error) {
    return { valido: false, errores: [{ campo: 'id', mensaje: 'Los datos guardados de esa solicitud no se pueden leer.' }] };
  }

  var disponible = puedeAmpliar(solicitud, entrada, hoyIso(), horaAhora());
  if (!disponible.puede) return { valido: false, errores: [{ campo: 'id', mensaje: disponible.motivo }] };

  var revision = validarAmpliacion(entrada, cambios, hoyIso(), horaAhora());
  if (!revision.valido) return { valido: false, errores: revision.errores };

  var ampliada = aplicarAmpliacion(entrada, revision.cambios, hoyIso());
  var pais = paisPorCodigo(leerPaises(), ampliada.pais);
  var resultado = generarTexto(ampliada, pais, MODELOS, {
    fechaReferencia: hoyIso(),
    usuarioEnEquipo: quien.enEquipo,
  });
  if (!resultado.valido) return { valido: false, errores: resultado.errores };

  var bloqueo = LockService.getScriptLock();
  bloqueo.waitLock(30000);

  try {
    var version = ampliada.modificaciones.length + 1;
    var titulo = tituloDelDocumento(solicitud.nombre_campana, pais.nombre, id) + ' · versión ' + version;
    var carpeta = carpetaDelPais(pais.codigo, pais.nombre);
    var documento = crearDocumento(titulo, estructuraDelDocumento(resultado.texto), carpeta, quien.correo);

    var fila = unirObjetos({
      link_doc: documento.url,
      datos_json: JSON.stringify(ampliada),
      fecha_fin: ampliada.fechaFin || '',
    }, respuestasParaElSheet(ampliada));
    actualizarFila('Solicitudes', solicitud._fila, fila);

    registrar('ampliar', id + ' · versión ' + version + ' · ' + JSON.stringify(revision.cambios));

    return {
      valido: true,
      id: id,
      version: version,
      linkDoc: documento.url,
      linkPublicado: solicitud.link_publicado,
      titulo: titulo,
      cambios: revision.cambios,
    };
  } finally {
    bloqueo.releaseLock();
  }
}

/** Los datos de una solicitud para reusarla como base. */
function datosDeSolicitud(id) {
  var quien = contextoDeQuienPide();
  var visibles = solicitudesVisibles(leerSolicitudes(), quien.correo, quien.rol, quien.pais);
  for (var i = 0; i < visibles.length; i++) {
    if (visibles[i].id !== id) continue;
    try {
      return { valido: true, entrada: JSON.parse(visibles[i].datos_json || '{}') };
    } catch (error) {
      return { valido: false, errores: [{ campo: 'id', mensaje: 'Los datos guardados de esa solicitud no se pueden leer.' }] };
    }
  }
  return { valido: false, errores: [{ campo: 'id', mensaje: 'No encontramos esa solicitud.' }] };
}

// --- Administracion --------------------------------------------------------

function exigirAdministrador() {
  var quien = contextoDeQuienPide();
  if (quien.rol !== 'admin') throw new Error('Solo los administradores pueden entrar aquí.');
  return quien;
}

function adminEstado() {
  exigirAdministrador();
  return {
    paises: filasPlanas(leerPaises()),
    equipo: filasPlanas(leerEquipo()),
    estados: ESTADOS,
    roles: ROLES,
  };
}

function adminGuardarEstadoDePais(codigo, estado) {
  exigirAdministrador();
  if (ESTADOS.indexOf(estado) === -1) {
    return { valido: false, errores: [{ campo: 'estado', mensaje: 'Ese estado no existe.' }] };
  }
  var pais = paisPorCodigo(leerPaises(), codigo);
  if (!pais) return { valido: false, errores: [{ campo: 'codigo', mensaje: 'No encontramos ese país.' }] };

  actualizarFila('Paises', pais._fila, { estado: estado });
  registrar('admin_pais', codigo + ' -> ' + estado);
  return { valido: true };
}

function adminGuardarMiembro(miembro) {
  exigirAdministrador();
  var correo = String(miembro && miembro.email || '').trim().toLowerCase();
  if (!correoEsDelDominio(correo)) {
    return { valido: false, errores: [{ campo: 'email', mensaje: 'El correo debe ser @rappi.com.' }] };
  }

  var existente = miembroPorCorreo(leerEquipo(), correo);
  var fila = {
    email: correo,
    nombre: miembro.nombre || '',
    rol: miembro.rol || 'comercial',
    pais: String(miembro.pais || '').toUpperCase(),
    activo: miembro.activo === false ? 'no' : 'sí',
  };

  if (existente) actualizarFila('Equipo', existente._fila, fila);
  else agregarFila('Equipo', fila);

  registrar('admin_equipo', correo + ' -> ' + fila.rol);
  return { valido: true };
}

/**
 * Agrega varias personas de una sola vez, pegando sus correos.
 *
 * Existe para abrir la herramienta a los equipos legales de los demas paises:
 * un pais en piloto solo lo ve quien tenga rol legal, pruebas o admin, asi que
 * sin esto habia que agregar treinta personas de una en una.
 *
 * Acepta correos separados por comas, por punto y coma o por saltos de linea,
 * que es como llegan pegados de un chat o de un correo. Lo que ya existe se
 * deja como esta: si alguien ya es administrador, esto no lo degrada.
 */
function adminAgregarMiembros(texto, rol, pais) {
  exigirAdministrador();

  if (ROLES.indexOf(rol) === -1) {
    return { valido: false, errores: [{ campo: 'rol', mensaje: 'Ese rol no existe.' }] };
  }

  var correos = separarCorreos(texto);
  if (correos.length === 0) {
    return { valido: false, errores: [{ campo: 'correos', mensaje: 'Pega al menos un correo.' }] };
  }

  var equipo = leerEquipo();
  var agregados = [];
  var yaEstaban = [];
  var rechazados = [];

  for (var i = 0; i < correos.length; i++) {
    var correo = correos[i];
    if (!correoEsDelDominio(correo)) { rechazados.push(correo); continue; }
    if (miembroPorCorreo(equipo, correo)) { yaEstaban.push(correo); continue; }

    agregarFila('Equipo', {
      email: correo,
      nombre: '',
      rol: rol,
      pais: String(pais || '').toUpperCase(),
      activo: 'sí',
    });
    agregados.push(correo);
    // Se relee para que dos correos repetidos en el mismo pegado no entren dos veces.
    equipo = leerEquipo();
  }

  registrar('admin_equipo_masivo', agregados.length + ' agregados como ' + rol);
  return {
    valido: true,
    agregados: agregados,
    yaEstaban: yaEstaban,
    rechazados: rechazados,
  };
}

/** Correos pegados de cualquier forma: comas, punto y coma o saltos de linea. */
function separarCorreos(texto) {
  var partes = String(texto || '').split(/[,;\s]+/);
  var limpios = [];
  for (var i = 0; i < partes.length; i++) {
    var correo = partes[i].trim().toLowerCase();
    // Lo que viene pegado de un chat trae a veces picos o parentesis.
    correo = correo.replace(/^[<(\[]+/, '').replace(/[>)\]]+$/, '');
    if (correo && limpios.indexOf(correo) === -1) limpios.push(correo);
  }
  return limpios;
}

function adminSolicitudes(busqueda) {
  exigirAdministrador();
  return filasPlanas(buscarEnSolicitudes(leerSolicitudes(), busqueda).reverse());
}

function adminSolicitudesCsv(busqueda) {
  exigirAdministrador();
  var encabezados = encabezadosDe('Solicitudes');
  var columnas = [];
  for (var i = 0; i < encabezados.length; i++) {
    if (encabezados[i] !== 'datos_json') columnas.push(encabezados[i]);
  }
  return comoCsv(buscarEnSolicitudes(leerSolicitudes(), busqueda), columnas);
}

if (typeof module !== 'undefined') {
  module.exports = {
    contextoDeQuienPide: contextoDeQuienPide,
    catalogoDeTipos: catalogoDeTipos,
    estadoInicial: estadoInicial,
    previsualizar: previsualizar,
    generar: generar,
    historial: historial,
    marcarPublicado: marcarPublicado,
    ampliarCampana: ampliarCampana,
    datosDeSolicitud: datosDeSolicitud,
    adminEstado: adminEstado,
    adminGuardarEstadoDePais: adminGuardarEstadoDePais,
    adminGuardarMiembro: adminGuardarMiembro,
    adminAgregarMiembros: adminAgregarMiembros,
    separarCorreos: separarCorreos,
    adminSolicitudes: adminSolicitudes,
    adminSolicitudesCsv: adminSolicitudesCsv,
  };
}
