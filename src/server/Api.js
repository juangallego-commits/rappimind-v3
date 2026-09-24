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
    // Las categorias de Rappi Travel salen del catalogo, no del esquema,
    // porque cambian por pais y tienen que coincidir letra por letra con los
    // nombres de la app: en el documento van entre comillas.
    //
    // Sin esta linea la pregunta "¿Que categorias de Travel participan?" se
    // dibujaba con cero casillas y el comercial no podia avanzar: el campo es
    // obligatorio y no habia nada que marcar. Rappi Travel entero quedaba
    // muerto ahi. Lo vio Juan el 21 de septiembre de 2026, probando el
    // formulario.
    categoriasTravel: typeof CATEGORIAS_TRAVEL !== 'undefined' ? CATEGORIAS_TRAVEL : {},
    versionesDeModelo: MODELOS.versiones,
    urlFormularioLegal: leerPropiedad(PROPIEDADES.URL_FORMULARIO_LEGAL),
    urlCanalAyuda: leerPropiedad(PROPIEDADES.CANAL_AYUDA_URL),
    hoy: enModoDemostracion() ? '' : hoyIso(),
  };
}

/** Valida y renderiza sin crear nada. La verdad la tiene el servidor. */
function previsualizar(entrada) {
  var quien = contextoDeQuienPide();
  // Una solicitud nueva nunca trae modificaciones: si un borrador viejo las
  // arrastra, no se imprimen.
  entrada = sinRastroDeAmpliacion(entrada || {});
  var pais = paisPorCodigo(leerPaises(), entrada.pais);

  var resultado = generarTexto(entrada, pais, MODELOS, {
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
  entrada = sinRastroDeAmpliacion(entrada || {});
  var paises = leerPaises();
  var pais = paisPorCodigo(paises, entrada.pais);

  var resultado = generarTexto(entrada, pais, MODELOS, {
    fechaReferencia: enModoDemostracion() ? entrada.fechaReferencia : hoyIso(),
    usuarioEnEquipo: quien.enEquipo,
  });

  if (!resultado.valido) {
    return { valido: false, errores: resultado.errores };
  }

  if (quien.demostracion) {
    var esquemaDemo = esquemaDe(entrada.tipo);
    return {
      valido: true,
      demostracion: true,
      texto: resultado.texto,
      mensaje: 'Modo demostración: no se creó ningún documento.',
      leyendas: generarLeyendasDeLaCampana(entrada, pais, LEYENDAS, {
        nombreCampana: nombreDeCampana(entrada, esquemaDemo, pais),
      }),
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

    /*
     * Desde aqui el documento ya existe en Drive. Si algo se cae despues, hay
     * que quitarlo: el consecutivo y el nombre salen del Sheet, y si en el
     * Sheet no quedo nada, la siguiente generacion crea otro documento con el
     * mismo identificador y el mismo titulo. Comprobado: dos Docs identicos,
     * RM-20260916-0001 los dos, en la misma carpeta del pais.
     */
    try {
      escribirLaSolicitud(id, documento, {
        quien: quien, pais: pais, esquema: esquema, entrada: entrada,
        nombreCampana: nombreCampana, direccion: direccion,
      });
    } catch (error) {
      descartarDocumento(documento.id);
      registrar('generar_fallido', id + ' · ' + String(error));
      throw error;
    }

    registrar('generar', id + ' · ' + pais.codigo + ' · ' + entrada.tipo);

    return {
      valido: true,
      id: id,
      linkDoc: documento.url,
      titulo: titulo,
      nombreCampana: nombreCampana,
      direccionSugerida: direccion,
      pais: pais.codigo,
      // Las leyendas de las piezas, con el enlace previsto. Salen aqui y no en
      // otra llamada porque el comercial las necesita en el mismo momento en
      // que se lleva el documento, y una llamada mas es una pantalla que se
      // puede quedar a medio pintar.
      leyendas: generarLeyendasDeLaCampana(entrada, pais, LEYENDAS, { nombreCampana: nombreCampana }),
    };
  } finally {
    bloqueo.releaseLock();
  }
}

/** La fila del Sheet y el correo, que es lo que va despues de crear el Doc. */
function escribirLaSolicitud(id, documento, datos) {
  var quien = datos.quien;
  var pais = datos.pais;
  var esquema = datos.esquema;
  var entrada = datos.entrada;

  agregarFila('Solicitudes', unirObjetos({
    id: id,
    fecha: ahoraTexto(),
    email: quien.correo,
    pais: pais.codigo,
    tipo: entrada.tipo,
    version_modelo: MODELOS.versiones[esquema.modelo] || '',
    nombre_campana: datos.nombreCampana,
    direccion_sugerida: datos.direccion,
    // Solo lo que el tipo pregunta: una tienda que quedo de otro tipo no es
    // de esta campana, y un tipo de un solo dia termina el dia que empieza.
    tienda: tieneCampo(esquema, 'tienda') ? (entrada.tienda || '') : '',
    organizador: entrada.organizadorRazonSocial || '',
    id_organizador: entrada.organizadorId || '',
    fecha_inicio: entrada.fechaInicio || '',
    fecha_fin: fechaFinDeLaCampana(entrada, esquema) || '',
    link_doc: documento.url,
    estado: 'generado',
    link_publicado: '',
    fecha_publicacion: '',
    datos_json: JSON.stringify(entrada),
  }, respuestasParaElSheet(entrada)));

  enviarCorreoDeGeneracion(quien.correo, {
    nombreCampana: datos.nombreCampana,
    pais: pais.nombre,
    id: id,
    linkDoc: documento.url,
    urlApp: ScriptApp.getService().getUrl(),
    urlAyuda: leerPropiedad(PROPIEDADES.CANAL_AYUDA_URL),
  });
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

  // Paso 3 del camino 4: se comparan las leyendas contra el enlace real. Si es
  // distinto al previsto, se rehacen y el comercial tiene que cambiar el arte.
  var leyendas = null;
  try {
    var entradaGuardada = JSON.parse(solicitud.datos_json || '{}');
    var paisDeLaSolicitud = paisPorCodigo(leerPaises(), solicitud.pais);
    if (paisDeLaSolicitud) {
      leyendas = generarLeyendasDeLaCampana(entradaGuardada, paisDeLaSolicitud, LEYENDAS, {
        nombreCampana: solicitud.nombre_campana,
        enlacePublicado: revision.url,
      });
    }
  } catch (error) {
    // Una solicitud vieja puede no tener datos_json legible. Marcarla como
    // publicada sigue funcionando: lo que no hay es leyenda que rehacer.
    leyendas = null;
  }

  return { valido: true, id: id, linkPublicado: revision.url, leyendas: leyendas };
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
  // ampliacion: la campana ya arranco, asi que su inicio en el pasado no es
  // un error. Sin esto, ampliar solo funcionaba el primer dia.
  var resultado = generarTexto(ampliada, pais, MODELOS, {
    fechaReferencia: hoyIso(),
    usuarioEnEquipo: quien.enEquipo,
    ampliacion: true,
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
    // Igual que al generar: si el Sheet se cae aqui, el documento de la version
    // nueva se queda en la carpeta del pais sin que ninguna fila lo nombre, y
    // la de la campana sigue apuntando a la version anterior.
    try {
      actualizarFila('Solicitudes', solicitud._fila, fila);
    } catch (error) {
      descartarDocumento(documento.id);
      registrar('ampliar_fallido', id + ' · ' + String(error));
      throw error;
    }

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
      // Sin la nota de la ampliacion vieja ni su consecutivo: la campana nueva
      // arranca limpia, en version 1.
      return { valido: true, entrada: sinRastroDeAmpliacion(JSON.parse(visibles[i].datos_json || '{}')) };
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
  var rol = String(miembro.rol || 'comercial').trim().toLowerCase();
  if (ROLES.indexOf(rol) === -1) {
    return { valido: false, errores: [{ campo: 'rol', mensaje: 'Ese rol no existe.' }] };
  }
  var pais = String(miembro.pais || '').trim().toUpperCase();
  var errorPais = errorDePaisDeMiembro(pais);
  if (errorPais) return errorPais;

  // Se busca sin filtrar por activo: reactivar a alguien actualiza su fila, no
  // agrega otra con el mismo correo.
  var existente = filaDeMiembro(leerEquipo(), correo);
  var fila = {
    email: correo,
    nombre: miembro.nombre || '',
    rol: rol,
    pais: pais,
    activo: miembro.activo === false ? 'no' : 'sí',
  };

  if (existente) actualizarFila('Equipo', existente._fila, fila);
  else agregarFila('Equipo', fila);

  registrar('admin_equipo', correo + ' -> ' + fila.rol);
  return { valido: true };
}

/**
 * El pais de un miembro es opcional, pero si viene tiene que existir.
 *
 * El historial compara el pais del miembro con el de cada solicitud: un legal
 * con "MZ" o con el pais vacio no veia ninguna campana y nadie se enteraba.
 */
function errorDePaisDeMiembro(pais) {
  if (!pais) return null;
  if (paisPorCodigo(leerPaises(), pais)) return null;
  return {
    valido: false,
    errores: [{
      campo: 'pais',
      mensaje: 'No encontramos el país "' + pais + '". Escribe el código de dos letras de la pestaña Paises, como CO o MX, o déjalo vacío.',
    }],
  };
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

  var codigoPais = String(pais || '').trim().toUpperCase();
  var errorPais = errorDePaisDeMiembro(codigoPais);
  if (errorPais) return errorPais;

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

    var fila = filaDeMiembro(equipo, correo);
    if (fila && fila.activo) { yaEstaban.push(correo); continue; }

    // Quien estaba con activo en "no" vuelve a entrar con el rol pedido, en su
    // misma fila. Para el equipo era como si no estuviera.
    var datos = { email: correo, nombre: fila ? fila.nombre : '', rol: rol, pais: codigoPais, activo: 'sí' };
    if (fila) actualizarFila('Equipo', fila._fila, datos);
    else agregarFila('Equipo', datos);
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
  // filasPlanas y no las filas crudas, igual que historial() y adminSolicitudes():
  // Google Sheets convierte sola la celda "2026-09-17" en fecha, y el CSV la
  // escribia como "Thu Sep 17 2026 00:00:00 GMT+0000" mientras la pantalla
  // decia "2026-09-17". El mismo dato con dos caras segun donde se mirara.
  return comoCsv(filasPlanas(buscarEnSolicitudes(leerSolicitudes(), busqueda)), columnas);
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
