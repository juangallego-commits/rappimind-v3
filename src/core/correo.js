'use strict';

/**
 * Armado del correo que recibe el comercial cuando se genera el documento.
 *
 * Es una funcion pura: recibe datos y devuelve asunto, HTML y texto plano.
 * El envio vive en src/server/Correo.js. Asi el contenido se prueba en Node.
 *
 * Todo dato del usuario se escapa antes de entrar al HTML.
 */

/** Escapa lo que va dentro del HTML. Nunca se inserta texto del usuario sin esto. */
function escaparHtml(valor) {
  return String(valor === null || valor === undefined ? '' : valor)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Escapa lo que va dentro de un atributo href. Solo se aceptan http y https. */
function urlSegura(valor) {
  var texto = String(valor === null || valor === undefined ? '' : valor).trim();
  if (!/^https?:\/\//i.test(texto)) return '';
  return escaparHtml(texto);
}

var NARANJA = '#FF441F';
var TINTA = '#16181D';
var GRIS = '#5D626D';
var BORDE = '#E3E5EA';

var PASOS_PARA_PUBLICAR = [
  'Abre el documento y revisa que todo esté correcto.',
  'Copia el contenido y pégalo en una página nueva de Squarespace.',
  'Publica la página y copia el enlace, que empieza por https://promos.rappi.com/.',
  'Vuelve a RappiMind y pega ese enlace en tu campaña. RappiMind revisa que el texto publicado sea idéntico al documento.',
];

/**
 * Los pasos cuando RappiMind ya sabe en que direccion va a quedar publicada.
 *
 * Desde el 5 de octubre de 2026 la herramienta revisa sola, cada hora, si la
 * pagina ya existe en esa direccion y si su texto es el del documento. Ahi el
 * comercial no tiene que volver a pegar nada: decirle que vuelva era decirle
 * que hiciera un trabajo que ya no hace falta.
 */
function pasosParaPublicar(enlacePrevisto) {
  if (!enlacePrevisto) return PASOS_PARA_PUBLICAR;
  return [
    PASOS_PARA_PUBLICAR[0],
    PASOS_PARA_PUBLICAR[1],
    'Publícala con esta dirección, tal cual: ' + enlacePrevisto + '.',
    'Listo: RappiMind revisa sola cada hora que el texto publicado sea idéntico al documento, marca tu campaña como publicada y te avisa por correo.',
  ];
}

/**
 * Lo que dice el correo de la generacion cuando RappiMind publica sola
 * (src/core/publicacion_web.js): ya no hay pasos que seguir, solo el enlace.
 * null si la campana va por Squarespace.
 */
function bloqueDePublicacionWeb(publicacion) {
  if (!publicacion || publicacion.modo !== 'web' || !urlSegura(publicacion.enlace)) return null;
  if (publicacion.estado === 'verificado') {
    return {
      titulo: 'Ya están publicados',
      lineas: [
        'RappiMind los publicó en su enlace definitivo y revisó que el texto publicado sea idéntico al documento.',
        'Usa este enlace en tus piezas. No tienes que entrar a Squarespace.',
      ],
    };
  }
  return {
    titulo: 'Los estamos publicando',
    lineas: [
      'RappiMind no alcanzó a terminar de publicarlos y lo vuelve a intentar sola cada hora. Te avisamos por correo cuando queden publicados.',
      'El enlace ya es el definitivo: puedes usarlo en tus piezas desde ya. No tienes que entrar a Squarespace.',
    ],
  };
}

function seccionWebHtml(web, enlace) {
  var parrafos = '';
  for (var i = 0; i < web.lineas.length; i++) {
    parrafos += '<p style="margin:0 0 10px;color:' + TINTA + ';font-size:15px;line-height:1.5;">' + escaparHtml(web.lineas[i]) + '</p>';
  }
  var seguro = urlSegura(enlace);
  return '<h2 style="margin:28px 0 10px;font-size:17px;color:' + TINTA + ';">' + escaparHtml(web.titulo) + '</h2>' +
    '<p style="margin:0 0 12px;font-size:15px;"><a href="' + seguro + '" style="color:' + NARANJA + ';font-weight:600;word-break:break-all;">' +
    escaparHtml(enlace) + '</a></p>' + parrafos;
}

/**
 * datos: { nombreCampana, pais, id, linkDoc, urlApp, urlAyuda, enlacePrevisto, publicacion }
 * publicacion: { modo: 'web', estado, enlace } cuando RappiMind publica sola.
 * Devuelve { asunto, html, texto }.
 */
function correoDeGeneracion(datos) {
  var nombre = escaparHtml(datos.nombreCampana);
  var pais = escaparHtml(datos.pais);
  var id = escaparHtml(datos.id);
  var linkDoc = urlSegura(datos.linkDoc);
  var urlApp = urlSegura(datos.urlApp);
  var urlAyuda = urlSegura(datos.urlAyuda);
  var enlacePrevisto = urlSegura(datos.enlacePrevisto) ? String(datos.enlacePrevisto).trim() : '';
  var pasos = pasosParaPublicar(enlacePrevisto);

  var web = bloqueDePublicacionWeb(datos.publicacion);
  var enlaceWeb = web ? String(datos.publicacion.enlace).trim() : '';

  var asunto = (web && datos.publicacion.estado === 'verificado' ? 'Tus T&C están publicados · ' : 'Tus T&C están listos · ') +
    String(datos.nombreCampana || '');

  var pasosHtml = '';
  for (var i = 0; i < pasos.length; i++) {
    pasosHtml +=
      '<li style="margin:0 0 10px;color:' + TINTA + ';">' + escaparHtml(pasos[i]) + '</li>';
  }

  var botonDoc = linkDoc
    ? '<a href="' + linkDoc + '" style="display:inline-block;background:' + NARANJA +
      ';color:#FFFFFF;text-decoration:none;font-weight:600;padding:13px 22px;border-radius:8px;">Abrir el documento</a>'
    : '';

  var pieAyuda = urlAyuda
    ? '<p style="margin:18px 0 0;color:' + GRIS + ';font-size:14px;">¿Dudas? Escríbenos en <a href="' +
      urlAyuda + '" style="color:' + NARANJA + ';">el canal de ayuda</a>.</p>'
    : '';

  // Con la direccion prevista no hay que volver: RappiMind la revisa sola.
  var volver = urlApp && !enlacePrevisto && !web
    ? '<p style="margin:10px 0 0;color:' + GRIS + ';font-size:14px;">Cuando publiques, vuelve a <a href="' +
      urlApp + '" style="color:' + NARANJA + ';">RappiMind</a> y pega el enlace.</p>'
    : '';

  var html =
    '<!DOCTYPE html><html lang="es"><body style="margin:0;padding:0;background:#F7F8FA;">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F7F8FA;padding:32px 12px;">' +
    '<tr><td align="center">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#FFFFFF;border:1px solid ' +
    BORDE + ';border-radius:14px;padding:32px;font-family:Lato,Helvetica,Arial,sans-serif;">' +
    '<tr><td>' +
    '<p style="margin:0 0 4px;color:' + NARANJA + ';font-weight:600;font-size:14px;">RappiMind</p>' +
    '<h1 style="margin:0 0 16px;font-size:24px;line-height:1.25;color:' + TINTA + ';">Tus T&amp;C están listos</h1>' +
    '<p style="margin:0 0 20px;color:' + TINTA + ';font-size:16px;line-height:1.5;">Generamos los Términos y Condiciones de <strong>' +
    nombre + '</strong> para ' + pais + '.</p>' +
    botonDoc +
    (web ? seccionWebHtml(web, enlaceWeb)
      : '<h2 style="margin:28px 0 10px;font-size:17px;color:' + TINTA + ';">Para publicarlos</h2>' +
        '<ol style="margin:0;padding-left:20px;font-size:15px;line-height:1.5;">' + pasosHtml + '</ol>') +
    volver +
    pieAyuda +
    '<p style="margin:24px 0 0;padding-top:16px;border-top:1px solid ' + BORDE + ';color:' + GRIS +
    ';font-size:13px;">Solicitud ' + id + '. Este documento lo generó RappiMind a partir de modelos aprobados por Legal.</p>' +
    '</td></tr></table></td></tr></table></body></html>';

  var lineas = [
    'Tus T&C están listos',
    '',
    'Generamos los Términos y Condiciones de ' + String(datos.nombreCampana || '') + ' para ' + String(datos.pais || '') + '.',
    '',
  ];
  if (datos.linkDoc) lineas.push('Documento: ' + String(datos.linkDoc), '');
  if (web) {
    lineas.push(web.titulo + ':', 'Enlace: ' + enlaceWeb);
    for (var w = 0; w < web.lineas.length; w++) lineas.push(web.lineas[w]);
  } else {
    lineas.push('Para publicarlos:');
    for (var p = 0; p < pasos.length; p++) {
      lineas.push('  ' + (p + 1) + '. ' + pasos[p]);
    }
  }
  lineas.push('', 'Solicitud ' + String(datos.id || '') + '.');

  return { asunto: asunto, html: html, texto: lineas.join('\n') };
}

/*
 * El correo de la revision de lo publicado.
 *
 * Sale solo cuando el estado cambia: la primera vez que la pagina queda
 * identica, cuando aparece una diferencia y cuando una pagina que estaba deja
 * de abrir con la campana vigente. El mismo estado dos horas seguidas no vuelve
 * a escribirle a nadie (hayQueAvisarDeLaVerificacion, src/core/publicacion.js).
 */
var CORREOS_DE_VERIFICACION = {
  verificado: {
    asunto: 'Tus T&C quedaron publicados',
    titulo: 'Tus T&C quedaron publicados',
    intro: 'RappiMind revisó la página publicada de {nombre} y el texto es idéntico al documento generado. Tu campaña ya quedó marcada como publicada.',
    queHacer: '',
  },
  con_diferencias: {
    asunto: 'Revisa tus T&C publicados',
    titulo: 'La página publicada no coincide con el documento',
    intro: 'RappiMind revisó la página publicada de {nombre} y su texto no es el del documento generado.',
    queHacer: 'Copia otra vez el texto desde RappiMind o desde el documento y reemplaza todo el cuerpo del evento en Squarespace, sin editarlo a mano. RappiMind vuelve a revisar sola en la próxima hora.',
  },
  retirado: {
    asunto: 'Tus T&C ya no están publicados',
    titulo: 'La página de tus T&C ya no abre',
    intro: 'La página de {nombre} ya no abre, y la campaña sigue vigente.',
    queHacer: 'Vuelve a publicarla en la misma dirección, para que el enlace de tus piezas siga funcionando. Si la quitaron a propósito, avísale a Legal en el canal.',
  },
};

/*
 * Los mismos correos para una campana que publico RappiMind. Aqui nadie tiene
 * que ir a Squarespace: lo que se cuenta es lo que paso y lo que RappiMind ya
 * esta haciendo (hayQueAvisarDeLaPublicacionWeb, src/core/publicacion_web.js).
 */
var CORREOS_DE_VERIFICACION_WEB = {
  verificado: {
    asunto: 'Tus T&C ya están publicados',
    titulo: 'Tus T&C ya están publicados',
    intro: 'RappiMind terminó de publicar los T&C de {nombre} y revisó que el texto publicado sea idéntico al documento generado.',
    queHacer: '',
  },
  con_diferencias: {
    asunto: 'Revisa tus T&C publicados',
    titulo: 'Lo publicado no coincide con el documento',
    intro: 'RappiMind revisó lo que muestra el enlace de {nombre} y no es el texto del documento generado.',
    queHacer: 'Escríbele a Legal en el canal de ayuda. RappiMind no reemplaza lo publicado por su cuenta, porque alguien tiene que revisar qué cambió: si el documento se editó después de generarlo, ese cambio no está aprobado.',
  },
  sin_publicar: {
    asunto: 'Tus T&C dejaron de verse',
    titulo: 'El enlace de tus T&C ya no muestra el texto',
    intro: 'El enlace de {nombre} dejó de mostrar sus T&C y RappiMind no los pudo volver a publicar.',
    queHacer: 'RappiMind lo vuelve a intentar sola cada hora. Si en unas horas sigue igual, escríbele a Legal en el canal de ayuda: mientras la campaña esté vigente, su T&C tiene que poder consultarse.',
  },
};

/**
 * datos: { estado, nombreCampana, id, enlace, linkDoc, detalle, avisos, origen }
 * Devuelve { asunto, html, texto }, o null si ese estado no lleva correo.
 */
function correoDeVerificacion(datos) {
  var textos = (datos.origen === 'web' ? CORREOS_DE_VERIFICACION_WEB : CORREOS_DE_VERIFICACION)[datos.estado];
  if (!textos) return null;

  var nombreTexto = String(datos.nombreCampana || '');
  var enlace = urlSegura(datos.enlace);
  var linkDoc = urlSegura(datos.linkDoc);
  var avisos = datos.avisos || [];
  var intro = escaparHtml(textos.intro).replace('{nombre}', '<strong>' + escaparHtml(nombreTexto) + '</strong>');

  var detalle = datos.detalle && datos.estado !== 'verificado'
    ? '<p style="margin:0 0 16px;padding:12px 14px;background:#FFF0DD;border-radius:8px;color:' + TINTA +
      ';font-size:15px;line-height:1.5;">' + escaparHtml(datos.detalle) + '</p>'
    : '';

  var listaDeAvisos = '';
  if (avisos.length > 0) {
    listaDeAvisos = '<p style="margin:0 0 6px;color:' + TINTA + ';font-size:15px;">Además, revisa esto en el evento:</p><ul style="margin:0 0 16px;padding-left:20px;font-size:15px;line-height:1.5;color:' + TINTA + ';">';
    for (var i = 0; i < avisos.length; i++) listaDeAvisos += '<li>' + escaparHtml(avisos[i]) + '</li>';
    listaDeAvisos += '</ul>';
  }

  var queHacer = textos.queHacer
    ? '<p style="margin:0 0 20px;color:' + TINTA + ';font-size:15px;line-height:1.5;"><strong>Qué hacer:</strong> ' + escaparHtml(textos.queHacer) + '</p>'
    : '';

  var botones = '';
  if (enlace) {
    botones += '<a href="' + enlace + '" style="display:inline-block;background:' + NARANJA +
      ';color:#FFFFFF;text-decoration:none;font-weight:600;padding:13px 22px;border-radius:8px;margin:0 8px 8px 0;">Abrir la página publicada</a>';
  }
  if (linkDoc) {
    botones += '<a href="' + linkDoc + '" style="display:inline-block;color:' + NARANJA +
      ';text-decoration:none;font-weight:600;padding:13px 4px;">Abrir el documento</a>';
  }

  var html =
    '<!DOCTYPE html><html lang="es"><body style="margin:0;padding:0;background:#F7F8FA;">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F7F8FA;padding:32px 12px;">' +
    '<tr><td align="center">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#FFFFFF;border:1px solid ' +
    BORDE + ';border-radius:14px;padding:32px;font-family:Lato,Helvetica,Arial,sans-serif;">' +
    '<tr><td>' +
    '<p style="margin:0 0 4px;color:' + NARANJA + ';font-weight:600;font-size:14px;">RappiMind</p>' +
    '<h1 style="margin:0 0 16px;font-size:24px;line-height:1.25;color:' + TINTA + ';">' + escaparHtml(textos.titulo) + '</h1>' +
    '<p style="margin:0 0 16px;color:' + TINTA + ';font-size:16px;line-height:1.5;">' + intro + '</p>' +
    detalle + listaDeAvisos + queHacer + botones +
    '<p style="margin:24px 0 0;padding-top:16px;border-top:1px solid ' + BORDE + ';color:' + GRIS +
    ';font-size:13px;">Solicitud ' + escaparHtml(datos.id) + '. RappiMind revisa cada hora la página publicada mientras la campaña está vigente.</p>' +
    '</td></tr></table></td></tr></table></body></html>';

  var lineas = [textos.titulo, '', textos.intro.replace('{nombre}', nombreTexto), ''];
  if (datos.detalle && datos.estado !== 'verificado') lineas.push(String(datos.detalle), '');
  if (avisos.length > 0) {
    lineas.push('Además, revisa esto en el evento:');
    for (var a = 0; a < avisos.length; a++) lineas.push('  ' + avisos[a]);
    lineas.push('');
  }
  if (textos.queHacer) lineas.push('Qué hacer: ' + textos.queHacer, '');
  if (datos.enlace) lineas.push('Página publicada: ' + String(datos.enlace));
  if (datos.linkDoc) lineas.push('Documento: ' + String(datos.linkDoc));
  lineas.push('', 'Solicitud ' + String(datos.id || '') + '.');

  return {
    asunto: textos.asunto + ' · ' + nombreTexto,
    html: html,
    texto: lineas.join('\n'),
  };
}

/*
 * El correo de la pagina /tyc, la que muestra todos los T&C que publica
 * RappiMind. Sale solo cuando cambia: cuando deja de mostrarlos y cuando
 * vuelve. Va a Legal, porque de esa pagina dependen todos los enlaces nuevos.
 */
var CORREOS_DEL_VISOR = {
  caido: {
    asunto: 'La página de los T&C no los está mostrando',
    titulo: 'La página de los T&C no los está mostrando',
    intro: 'RappiMind revisó {visor} y los T&C que publica no se están viendo.',
    queHacer: 'Revisa en Squarespace que la página siga publicada y que conserve, sin cambios, el bloque de código de RappiMind. Si lo borraron, hay que volver a pegarlo: docs/PUBLICACION_WEB.md dice cómo. RappiMind la vuelve a revisar cada hora.',
  },
  en_pie: {
    asunto: 'La página de los T&C volvió a funcionar',
    titulo: 'La página de los T&C volvió a funcionar',
    intro: 'RappiMind revisó {visor} y otra vez muestra los T&C que publica.',
    queHacer: '',
  },
};

/**
 * datos: { estado: 'caido' | 'en_pie', visor, detalle }
 * Devuelve { asunto, html, texto }, o null si ese estado no lleva correo.
 */
function correoDelVisor(datos) {
  var textos = CORREOS_DEL_VISOR[datos.estado];
  if (!textos) return null;
  var visor = String(datos.visor || '');
  var intro = escaparHtml(textos.intro).replace('{visor}', '<strong>' + escaparHtml(visor) + '</strong>');
  var detalle = datos.detalle && datos.estado === 'caido'
    ? '<p style="margin:0 0 16px;padding:12px 14px;background:#FFF0DD;border-radius:8px;color:' + TINTA +
      ';font-size:15px;line-height:1.5;">' + escaparHtml(datos.detalle) + '</p>'
    : '';
  var queHacer = textos.queHacer
    ? '<p style="margin:0 0 20px;color:' + TINTA + ';font-size:15px;line-height:1.5;"><strong>Qué hacer:</strong> ' + escaparHtml(textos.queHacer) + '</p>'
    : '';
  var enlace = urlSegura(visor);
  var boton = enlace
    ? '<a href="' + enlace + '" style="display:inline-block;background:' + NARANJA +
      ';color:#FFFFFF;text-decoration:none;font-weight:600;padding:13px 22px;border-radius:8px;">Abrir la página</a>'
    : '';

  var html =
    '<!DOCTYPE html><html lang="es"><body style="margin:0;padding:0;background:#F7F8FA;">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F7F8FA;padding:32px 12px;">' +
    '<tr><td align="center">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#FFFFFF;border:1px solid ' +
    BORDE + ';border-radius:14px;padding:32px;font-family:Lato,Helvetica,Arial,sans-serif;">' +
    '<tr><td>' +
    '<p style="margin:0 0 4px;color:' + NARANJA + ';font-weight:600;font-size:14px;">RappiMind</p>' +
    '<h1 style="margin:0 0 16px;font-size:24px;line-height:1.25;color:' + TINTA + ';">' + escaparHtml(textos.titulo) + '</h1>' +
    '<p style="margin:0 0 16px;color:' + TINTA + ';font-size:16px;line-height:1.5;">' + intro + '</p>' +
    detalle + queHacer + boton +
    '</td></tr></table></td></tr></table></body></html>';

  var lineas = [textos.titulo, '', textos.intro.replace('{visor}', visor), ''];
  if (datos.detalle && datos.estado === 'caido') lineas.push(String(datos.detalle), '');
  if (textos.queHacer) lineas.push('Qué hacer: ' + textos.queHacer, '');
  return { asunto: textos.asunto, html: html, texto: lineas.join('\n') };
}

if (typeof module !== 'undefined') {
  module.exports = {
    correoDelVisor: correoDelVisor,
    CORREOS_DE_VERIFICACION_WEB: CORREOS_DE_VERIFICACION_WEB,
    correoDeGeneracion: correoDeGeneracion,
    correoDeVerificacion: correoDeVerificacion,
    pasosParaPublicar: pasosParaPublicar,
    escaparHtml: escaparHtml,
    urlSegura: urlSegura,
    PASOS_PARA_PUBLICAR: PASOS_PARA_PUBLICAR,
  };
}
