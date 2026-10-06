'use strict';

/**
 * La publicacion en Squarespace: lo que se decide sin Google.
 *
 * Por que la herramienta no publica sola. Squarespace no tiene API para crear
 * paginas, entradas ni eventos: las que documenta son de comercio y contactos.
 * Y su politica de uso (Acceptable Use Policy, actualizada el 24 de febrero de
 * 2020) prohibe entrar al servicio por medios distintos a sus interfaces
 * publicas (punto 1.6) y manejarlo con credenciales compartidas (punto 1.8).
 * Un robot con el usuario de alguien es las dos cosas, y la sancion que se
 * reserva Squarespace es suspender la cuenta o el sitio: promos.rappi.com
 * entero, con los T&C de todos los paises. Ver docs/DECISIONES.md.
 *
 * Lo que si hace, y vive aqui:
 *
 *   1. Deja el texto listo para pegar, con sus negrillas y vinetas, para que
 *      nadie tenga que abrir el documento ni arreglar el formato a mano.
 *   2. Despues lee la pagina publica y comprueba que el texto quedo identico
 *      al documento generado. Para leerla usa el JSON que Squarespace
 *      documenta para ver los datos de cualquier pagina de un sitio
 *      (`?format=json`). Solo lee, solo promos.rappi.com, y pocas veces.
 *
 * El servidor (src/server/Publicacion.js) baja la pagina y abre el documento;
 * estas funciones deciden. Asi todo lo que importa se prueba en Node.
 */

if (typeof module !== 'undefined' && typeof require === 'function') {
  var moduloDocumentoPub = require('./documento.js');
  var estructuraDelDocumento = moduloDocumentoPub.estructuraDelDocumento;
  var textoDelBloque = moduloDocumentoPub.textoDelBloque;
  var escaparHtml = require('./correo.js').escaparHtml;
  var validarLinkPublicado = require('./validaciones.js').validarLinkPublicado;
  var PREFIJO_PUBLICACION = require('./validaciones.js').PREFIJO_PUBLICACION;
  var formatearFecha = require('./fechas.js').formatearFecha;
}

/**
 * Lo que puede salir de una revision.
 *
 *   verificado       la pagina existe y su texto es identico al documento.
 *   con_diferencias  la pagina existe, pero su texto no es el del documento.
 *   no_publicado     la pagina todavia no existe en esa direccion.
 *   retirado         estuvo publicada y ya no abre, con la campana vigente.
 *   sin_verificar    no se pudo leer (Squarespace fallo, o el documento).
 *   sin_enlace       no se sabe donde buscarla: falta el enlace publicado.
 */
var ESTADOS_DE_VERIFICACION = [
  'verificado', 'con_diferencias', 'no_publicado', 'retirado', 'sin_verificar', 'sin_enlace',
];

/** Cuantas revisiones caben en una corrida automatica, con holgura de tiempo. */
var REVISIONES_POR_CORRIDA = 40;

/**
 * Durante cuantos dias despues de generar se revisa cada hora. Pasado eso, una
 * vez al dia: una campana que nadie publico en tres dias no necesita que se le
 * toque la puerta 24 veces diarias hasta que termine.
 */
var DIAS_DE_REVISION_FRECUENTE = 3;

// --- Del HTML de Squarespace a texto -----------------------------------------

/** Las entidades que Squarespace y los editores de texto escriben de verdad. */
var ENTIDADES_HTML = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: '\'', nbsp: ' ',
  ldquo: '“', rdquo: '”', lsquo: '‘', rsquo: '’',
  laquo: '«', raquo: '»', hellip: '…', ndash: '–', mdash: '—',
  iquest: '¿', iexcl: '¡', middot: '·', bull: '•', deg: '°',
  ordm: 'º', ordf: 'ª', euro: '€', reg: '®', copy: '©', trade: '™',
  aacute: 'á', eacute: 'é', iacute: 'í', oacute: 'ó', uacute: 'ú',
  Aacute: 'Á', Eacute: 'É', Iacute: 'Í', Oacute: 'Ó', Uacute: 'Ú',
  ntilde: 'ñ', Ntilde: 'Ñ', uuml: 'ü', Uuml: 'Ü', ccedil: 'ç', Ccedil: 'Ç',
  atilde: 'ã', otilde: 'õ', Atilde: 'Ã', Otilde: 'Õ',
  acirc: 'â', ecirc: 'ê', ocirc: 'ô', Acirc: 'Â', Ecirc: 'Ê', Ocirc: 'Ô',
  agrave: 'à', Agrave: 'À',
};

function decodificarEntidadesHtml(texto) {
  return String(texto || '').replace(/&(#[xX][0-9a-fA-F]+|#\d+|[a-zA-Z]+);/g, function (todo, cuerpo) {
    if (cuerpo.charAt(0) === '#') {
      var hexadecimal = cuerpo.charAt(1) === 'x' || cuerpo.charAt(1) === 'X';
      var codigo = hexadecimal ? parseInt(cuerpo.slice(2), 16) : parseInt(cuerpo.slice(1), 10);
      if (!isFinite(codigo) || codigo <= 0 || codigo > 0x10FFFF) return todo;
      return String.fromCodePoint(codigo);
    }
    return Object.prototype.hasOwnProperty.call(ENTIDADES_HTML, cuerpo) ? ENTIDADES_HTML[cuerpo] : todo;
  });
}

/*
 * Las etiquetas que parten el texto en renglones. Las demas (negrilla, enlace,
 * span) se quitan sin dejar espacio: "“<strong>Créditos</strong>”" es
 * “Créditos”, no “ Créditos ”. Un lector que metiera un espacio por cada
 * etiqueta veria diferencias que en la pantalla no existen.
 */
var ETIQUETAS_QUE_PARTEN = /<\/?(p|div|li|ul|ol|h[1-6]|br|tr|td|th|table|section|article|blockquote|header|footer|figure|figcaption|pre|hr)\b[^>]*>/gi;

/** El cuerpo HTML de un evento, como lo leeria una persona: un bloque por renglon. */
function textoDeHtmlPublicado(html) {
  var sinCodigo = String(html || '')
    .replace(/<!--[\s\S]*?-->/g, '\n')
    .replace(/<(script|style|noscript|template)\b[\s\S]*?<\/\1>/gi, '\n')
    .replace(ETIQUETAS_QUE_PARTEN, '\n')
    .replace(/<[^>]*>/g, '');
  return decodificarEntidadesHtml(sinCodigo);
}

// --- Texto comparable ----------------------------------------------------------

/*
 * Lo que no cambia lo que se lee y si cambia los caracteres: espacios duros,
 * caracteres invisibles que arrastra un pegado, la marca de vineta (en el
 * documento es formato; pegada como texto plano llega como un caracter) y los
 * ** del motor. Todo lo demas cuenta: una coma, una tilde, una mayuscula o una
 * comilla distinta es una diferencia, porque es texto legal.
 */
var CARACTERES_INVISIBLES = /[​‌‍⁠﻿­]/g;
var ESPACIOS_DUROS = /[   ]/g;
var MARCA_DE_VINETA = /^\s*[•●◦▪▫■□‣⁃∙·*-]\s+/;
var MARCA_DE_TITULO_DEL_MOTOR = /^#{1,2}\s+/;

/** Un texto (del motor, del documento o de la pagina) listo para comparar. */
function textoComparable(texto) {
  var lineas = String(texto === null || texto === undefined ? '' : texto)
    .replace(CARACTERES_INVISIBLES, '')
    .replace(ESPACIOS_DUROS, ' ')
    .replace(/\*\*/g, '')
    .split(/\r\n|\r|\n/);

  var limpias = [];
  for (var i = 0; i < lineas.length; i++) {
    var linea = lineas[i]
      .replace(MARCA_DE_TITULO_DEL_MOTOR, '')
      .replace(MARCA_DE_VINETA, '')
      .replace(/\s+/g, ' ')
      .trim();
    if (linea) limpias.push(linea);
  }
  return limpias.join(' ');
}

function palabrasDe(texto) {
  return texto ? String(texto).split(' ') : [];
}

function primerasPalabras(palabras, cuantas) {
  if (palabras.length <= cuantas) return palabras.join(' ');
  return palabras.slice(0, cuantas).join(' ') + '…';
}

function ultimasPalabras(palabras, cuantas) {
  if (palabras.length <= cuantas) return palabras.join(' ');
  return '…' + palabras.slice(palabras.length - cuantas).join(' ');
}

// --- Lo esperado -------------------------------------------------------------

/*
 * Lo esperado tiene dos partes. La cabecera son los renglones centrados del
 * principio ("TÉRMINOS Y CONDICIONES" y el nombre en mayusculas): el evento ya
 * lleva el nombre como titulo y hay quien no la pega, asi que puede faltar. El
 * cuerpo es todo lo demas y tiene que estar completo, igual y sin nada de mas.
 */
function conDatosDeLaCampana(esperado, datos) {
  var extra = datos || {};
  esperado.titulo = String(extra.titulo || '');
  esperado.fechaInicio = String(extra.fechaInicio || '').slice(0, 10);
  esperado.fechaFin = String(extra.fechaFin || '').slice(0, 10);
  return esperado;
}

/** Desde el texto del motor (el mismo con que se arma el documento). */
function esperadoDesdeTexto(texto, datos) {
  var bloques = estructuraDelDocumento(texto);
  var cabecera = [];
  var cuerpo = [];
  for (var i = 0; i < bloques.length; i++) {
    var bloque = bloques[i];
    var esTitulo = bloque.tipo === 'titulo' || bloque.tipo === 'subtitulo';
    if (esTitulo && cuerpo.length === 0) cabecera.push(textoDelBloque(bloque));
    else cuerpo.push(textoDelBloque(bloque));
  }
  return conDatosDeLaCampana({ cabecera: cabecera, cuerpo: cuerpo }, datos);
}

/**
 * Desde los parrafos del Google Doc generado: [{ texto, centrado }].
 *
 * Es la fuente buena para revisar despues: el documento es lo que recibio el
 * comercial. Volver a armar el texto desde las respuestas no sirve, porque si
 * un modelo cambio despues de generar, el texto armado hoy ya no es el que se
 * publico, y la revision gritaria diferencias que nadie cometio.
 */
function esperadoDesdeParrafos(parrafos, datos) {
  var cabecera = [];
  var cuerpo = [];
  var lista = parrafos || [];
  for (var i = 0; i < lista.length; i++) {
    var texto = String(lista[i] && lista[i].texto || '');
    if (!texto.replace(/\s+/g, '')) continue;
    if (lista[i].centrado && cuerpo.length === 0) cabecera.push(texto);
    else cuerpo.push(texto);
  }
  return conDatosDeLaCampana({ cabecera: cabecera, cuerpo: cuerpo }, datos);
}

/** Las formas de la cabecera que se aceptan delante del cuerpo, sin mayusculas. */
function cabecerasAceptadas(cabecera) {
  var lineas = [];
  for (var i = 0; i < (cabecera || []).length; i++) {
    var linea = textoComparable(cabecera[i]);
    if (linea) lineas.push(linea);
  }
  // Toda, o solo algunos de sus renglones en el mismo orden: con dos renglones
  // son tres formas, con tres son siete. Ninguna cabecera tiene mas.
  var formas = [];
  var total = Math.pow(2, lineas.length);
  for (var mascara = 1; mascara < total; mascara++) {
    var partes = [];
    for (var j = 0; j < lineas.length; j++) {
      if (mascara & Math.pow(2, j)) partes.push(lineas[j]);
    }
    formas.push(partes.join(' ').toLowerCase());
  }
  return formas;
}

function esCabeceraAceptada(texto, cabecera) {
  return cabecerasAceptadas(cabecera).indexOf(String(texto).toLowerCase()) !== -1;
}

/**
 * Lo que sobra delante del cuerpo, sin la cabecera que si se acepta. Sin esto,
 * "Promoción exclusiva" pegado antes del titulo se reportaba como el titulo,
 * que es justo lo que si estaba bien.
 */
function sobranteSinCabecera(antes, cabecera) {
  var texto = String(antes);
  var minusculas = texto.toLowerCase();
  var formas = cabecerasAceptadas(cabecera).sort(function (a, b) { return b.length - a.length; });
  for (var i = 0; i < formas.length; i++) {
    var forma = formas[i];
    if (!forma || minusculas.length <= forma.length) continue;
    if (minusculas.slice(minusculas.length - forma.length - 1) === ' ' + forma) {
      return texto.slice(0, texto.length - forma.length - 1).trim();
    }
  }
  return texto;
}

// --- La comparacion ------------------------------------------------------------

/** Donde empieza el cuerpo dentro de lo publicado, palabra por palabra. */
function inicioDelCuerpo(esperadas, publicadas, cabecera) {
  var largo = Math.min(6, esperadas.length);
  if (largo > 0) {
    for (var desde = 0; desde + largo <= publicadas.length; desde++) {
      var iguales = true;
      for (var k = 0; k < largo; k++) {
        if (esperadas[k] !== publicadas[desde + k]) { iguales = false; break; }
      }
      if (iguales) return desde;
    }
  }

  // El principio del cuerpo tampoco esta: si la pagina arranca con la
  // cabecera, la diferencia se busca despues de ella y no en el titulo.
  var formas = cabecerasAceptadas(cabecera).sort(function (a, b) { return b.length - a.length; });
  var comienzo = publicadas.join(' ').toLowerCase();
  for (var f = 0; f < formas.length; f++) {
    if (formas[f] && comienzo.indexOf(formas[f] + ' ') === 0) return palabrasDe(formas[f]).length;
  }
  return 0;
}

/**
 * Compara lo esperado con el texto de la pagina.
 *
 * Devuelve { identico: true } o { identico: false, diferencia: {...} } con la
 * primera diferencia y un poco de contexto, para que quien lea el aviso la
 * encuentre sin comparar a ojo diez paginas.
 */
function compararConLoPublicado(esperado, textoPublicado) {
  var cuerpo = textoComparable((esperado.cuerpo || []).join('\n'));
  var publicado = textoComparable(textoPublicado);

  if (!publicado) return { identico: false, diferencia: { tipo: 'vacio' } };

  var donde = cuerpo ? publicado.indexOf(cuerpo) : -1;
  if (donde !== -1) {
    var antes = publicado.slice(0, donde).trim();
    var despues = publicado.slice(donde + cuerpo.length).trim();
    if (despues) {
      return { identico: false, diferencia: { tipo: 'sobra_al_final', publicado: primerasPalabras(palabrasDe(despues), 12) } };
    }
    if (antes && !esCabeceraAceptada(antes, esperado.cabecera)) {
      var sobrante = sobranteSinCabecera(antes, esperado.cabecera);
      return { identico: false, diferencia: { tipo: 'sobra_al_principio', publicado: ultimasPalabras(palabrasDe(sobrante), 12) } };
    }
    return { identico: true };
  }

  var esperadas = palabrasDe(cuerpo);
  var publicadas = palabrasDe(publicado);
  var inicio = inicioDelCuerpo(esperadas, publicadas, esperado.cabecera);

  var i = 0;
  while (i < esperadas.length && inicio + i < publicadas.length && esperadas[i] === publicadas[inicio + i]) i++;

  if (i >= esperadas.length) {
    return { identico: false, diferencia: { tipo: 'sobra_al_final', publicado: primerasPalabras(publicadas.slice(inicio + i), 12) } };
  }
  if (inicio + i >= publicadas.length) {
    return {
      identico: false,
      diferencia: {
        tipo: 'falta_al_final',
        contexto: ultimasPalabras(esperadas.slice(0, i), 8),
        esperado: primerasPalabras(esperadas.slice(i), 12),
      },
    };
  }
  return {
    identico: false,
    diferencia: {
      tipo: 'distinto',
      contexto: ultimasPalabras(esperadas.slice(0, i), 8),
      esperado: primerasPalabras(esperadas.slice(i), 12),
      publicado: primerasPalabras(publicadas.slice(inicio + i), 12),
    },
  };
}

function entreComillas(texto) {
  return '“' + texto + '”';
}

/**
 * Una cita que cierra la frase. Si el fragmento citado ya termina en punto o
 * en puntos suspensivos, no se le pone otro punto despues de las comillas.
 */
function citaQueCierra(texto) {
  return entreComillas(texto) + (/[.…!?]$/.test(texto) ? '' : '.');
}

/** La diferencia en una frase que se entiende sin abrir nada. */
function describirDiferencia(diferencia) {
  var d = diferencia || {};
  if (d.tipo === 'vacio') return 'La página publicada no tiene texto.';
  if (d.tipo === 'sobra_al_final') {
    return 'La página tiene texto de más al final, que no está en el documento: ' + citaQueCierra(d.publicado);
  }
  if (d.tipo === 'sobra_al_principio') {
    return 'La página tiene texto de más antes del documento: ' + citaQueCierra(d.publicado);
  }
  if (d.tipo === 'falta_al_final') {
    var desde = d.contexto ? ', después de ' + entreComillas(d.contexto) : '';
    return 'A la página le falta el final del documento' + desde + ': no está ' + citaQueCierra(d.esperado);
  }
  var despues = d.contexto ? 'Después de ' + entreComillas(d.contexto) + ', el' : 'Desde el principio, el';
  return despues + ' documento dice ' + entreComillas(d.esperado) + ' y la página dice ' + citaQueCierra(d.publicado);
}

// --- La respuesta de Squarespace -----------------------------------------------

/** Milisegundos de Squarespace a fecha AAAA-MM-DD, en la hora del sitio. */
function fechaDelSitio(milisegundos, desfase) {
  var numero = Number(milisegundos);
  if (!isFinite(numero) || numero <= 0 || desfase === null || !isFinite(desfase)) return '';
  return new Date(numero + desfase).toISOString().slice(0, 10);
}

/** Lo mismo con la hora: "2026-10-06 09:15", para dejar constancia. */
function fechaHoraDelSitio(milisegundos, desfase) {
  var numero = Number(milisegundos);
  if (!isFinite(numero) || numero <= 0 || desfase === null || !isFinite(desfase)) return '';
  return new Date(numero + desfase).toISOString().slice(0, 16).replace('T', ' ');
}

/**
 * El JSON de una pagina de Squarespace -> lo que importa del evento.
 *
 * Se lee a la defensiva: Squarespace avisa que la forma de este JSON puede
 * cambiar. Si cambia, la revision dice "no pudimos leer" y nunca "verificado".
 */
function leerEventoDeSquarespace(cuerpo) {
  var datos;
  try {
    datos = JSON.parse(String(cuerpo || ''));
  } catch (error) {
    return { ok: false, motivo: 'no_es_json' };
  }
  if (!datos || typeof datos !== 'object') return { ok: false, motivo: 'no_es_json' };

  var item = datos.item;
  if (!item || typeof item !== 'object') {
    return { ok: false, motivo: datos.collection ? 'es_una_lista' : 'sin_evento' };
  }

  var sitio = datos.website || {};
  var desfase = Number(sitio.timeZoneOffset);
  var estructura = item.structuredContent || {};

  return {
    ok: true,
    titulo: String(item.title || ''),
    cuerpoHtml: typeof item.body === 'string' ? item.body : '',
    urlCompleta: String(item.fullUrl || ''),
    inicio: item.startDate !== undefined ? item.startDate : estructura.startDate,
    fin: item.endDate !== undefined ? item.endDate : estructura.endDate,
    publicadoDesde: item.publishOn,
    desfase: sitio.timeZoneOffset !== undefined && isFinite(desfase) ? desfase : null,
  };
}

function resultadoDeVerificacion(estado, detalle, avisos, evento) {
  return {
    estado: estado,
    detalle: detalle,
    avisos: avisos || [],
    urlCompleta: evento ? evento.urlCompleta : '',
    publicadoDesde: evento ? fechaHoraDelSitio(evento.publicadoDesde, evento.desfase) : '',
  };
}

/**
 * Paso 1: lo que dice la respuesta, antes de abrir el documento.
 *
 * respuesta: { codigo, cuerpo } o { falla: 'texto' } si ni siquiera respondio.
 * Devuelve { listo: true, resultado } cuando ya hay veredicto, o
 * { listo: false, evento } cuando hay que comparar el texto.
 */
function leerRespuestaDeSquarespace(respuesta) {
  if (!respuesta || respuesta.falla) {
    return {
      listo: true,
      resultado: resultadoDeVerificacion('sin_verificar',
        'No pudimos abrir la página publicada. Volvemos a intentarlo en la próxima revisión.'),
    };
  }

  var codigo = Number(respuesta.codigo);
  if (codigo === 404 || codigo === 410) {
    return {
      listo: true,
      resultado: resultadoDeVerificacion('no_publicado',
        'Esa dirección todavía no existe: la página no se ha publicado o quedó con otra dirección.'),
    };
  }
  if (codigo === 401 || codigo === 403) {
    return {
      listo: true,
      resultado: resultadoDeVerificacion('sin_verificar',
        'La página pide contraseña o no deja entrar. Un T&C tiene que poder leerlo cualquier persona.'),
    };
  }
  if (codigo !== 200) {
    return {
      listo: true,
      resultado: resultadoDeVerificacion('sin_verificar',
        'Squarespace respondió con un error (' + (isFinite(codigo) ? codigo : 'sin código') + '). Volvemos a intentarlo en la próxima revisión.'),
    };
  }

  var evento = leerEventoDeSquarespace(respuesta.cuerpo);
  if (!evento.ok) {
    return {
      listo: true,
      resultado: resultadoDeVerificacion('sin_verificar', evento.motivo === 'es_una_lista'
        ? 'Ese enlace es la lista de eventos del país, no la página de esta campaña.'
        : 'No pudimos leer la página publicada. Revísala a mano.'),
    };
  }
  return { listo: false, evento: evento };
}

/** Lo que no cambia el veredicto pero conviene arreglar: titulo y fechas. */
function avisosDelEvento(esperado, evento) {
  var avisos = [];

  if (esperado.titulo && textoComparable(evento.titulo) !== textoComparable(esperado.titulo)) {
    avisos.push('El título del evento es ' + entreComillas(textoComparable(evento.titulo)) +
      ' y debería ser ' + entreComillas(textoComparable(esperado.titulo)) + '.');
  }

  var inicio = fechaDelSitio(evento.inicio, evento.desfase);
  if (esperado.fechaInicio && inicio && inicio !== esperado.fechaInicio) {
    avisos.push('El evento empieza el ' + formatearFecha(inicio) + ' y la campaña el ' + formatearFecha(esperado.fechaInicio) + '.');
  }
  var fin = fechaDelSitio(evento.fin, evento.desfase);
  if (esperado.fechaFin && fin && fin !== esperado.fechaFin) {
    avisos.push('El evento termina el ' + formatearFecha(fin) + ' y la campaña el ' + formatearFecha(esperado.fechaFin) + '.');
  }
  return avisos;
}

/** Paso 2: con el evento leido y lo esperado, el veredicto. */
function veredictoDeLaPublicacion(esperado, evento) {
  if (!esperado || !esperado.cuerpo || esperado.cuerpo.length === 0) {
    return resultadoDeVerificacion('sin_verificar', 'No pudimos leer el documento generado para comparar.', [], evento);
  }

  var avisos = avisosDelEvento(esperado, evento);
  var comparacion = compararConLoPublicado(esperado, textoDeHtmlPublicado(evento.cuerpoHtml));
  if (!comparacion.identico) {
    return resultadoDeVerificacion('con_diferencias', describirDiferencia(comparacion.diferencia), avisos, evento);
  }
  return resultadoDeVerificacion('verificado', 'El texto publicado es idéntico al documento generado.', avisos, evento);
}

/** Los dos pasos juntos, cuando lo esperado ya esta a mano. */
function verificarPublicacion(esperado, respuesta) {
  var lectura = leerRespuestaDeSquarespace(respuesta);
  if (lectura.listo) return lectura.resultado;
  return veredictoDeLaPublicacion(esperado, lectura.evento);
}

/**
 * El estado que queda, sabiendo el anterior.
 *
 * Una pagina que ya se habia visto y ahora no existe no es "no publicada": la
 * quitaron, y eso con la campana vigente es lo que hay que avisar.
 */
function estadoDeVerificacionSiguiente(anterior, nuevo) {
  var antes = String(anterior || '');
  if (nuevo === 'no_publicado' && (antes === 'verificado' || antes === 'con_diferencias' || antes === 'retirado')) {
    return 'retirado';
  }
  return nuevo;
}

/** El resultado de una revision, contado desde el estado que tenia la fila. */
function conElEstadoAnterior(resultado, anterior) {
  var estado = estadoDeVerificacionSiguiente(anterior, resultado.estado);
  if (estado === resultado.estado) return resultado;
  return {
    estado: estado,
    detalle: 'La página estaba publicada y esa dirección ya no existe. Mientras la campaña esté vigente, su T&C tiene que poder consultarse.',
    avisos: resultado.avisos || [],
    urlCompleta: resultado.urlCompleta || '',
    publicadoDesde: resultado.publicadoDesde || '',
  };
}

/**
 * Si el cambio merece un correo. Solo los cambios: el mismo estado dos horas
 * seguidas no vuelve a escribirle a nadie.
 */
function hayQueAvisarDeLaVerificacion(anterior, siguiente) {
  if (String(anterior || '') === siguiente) return false;
  return siguiente === 'verificado' || siguiente === 'con_diferencias' || siguiente === 'retirado';
}

/** Lo que queda escrito en la columna detalle_verificacion. */
function detalleParaGuardar(resultado) {
  var partes = [resultado.detalle];
  if (resultado.estado === 'verificado' && resultado.publicadoDesde) {
    partes.push('Publicado en Squarespace desde el ' + resultado.publicadoDesde + ' (hora del sitio).');
  }
  for (var i = 0; i < (resultado.avisos || []).length; i++) partes.push(resultado.avisos[i]);
  return partes.join(' ');
}

// --- Donde buscar ---------------------------------------------------------------

/** La ruta de Squarespace de cada pais: { CO: 'colombia' }. */
function rutasDePublicacion(paises) {
  var rutas = {};
  for (var i = 0; i < (paises || []).length; i++) {
    var ruta = String(paises[i].ruta_promos || '').trim();
    if (paises[i].codigo && ruta) rutas[paises[i].codigo] = ruta;
  }
  return rutas;
}

/**
 * La direccion que hay que revisar: la que pego el comercial y, si no pego
 * ninguna, la que la herramienta le propuso. Esa es la que dicen los pasos de
 * Squarespace, asi que casi siempre es la buena y nadie tiene que volver a
 * pegar nada.
 */
function enlaceParaRevisar(fila, rutaDelPais) {
  var publicado = String(fila && fila.link_publicado || '').trim();
  if (publicado) return validarLinkPublicado(publicado).valido ? publicado : '';

  var direccion = String(fila && fila.direccion_sugerida || '').trim();
  var ruta = String(rutaDelPais || '').trim();
  if (!direccion || !ruta) return '';
  return PREFIJO_PUBLICACION + ruta + '/' + direccion;
}

/**
 * La direccion del JSON de esa pagina. Solo de promos.rappi.com: el servidor
 * no le pide nada a ningun otro sitio, venga de donde venga el enlace.
 */
function urlDeLecturaDeSquarespace(enlace) {
  var limpio = String(enlace || '').trim().split('#')[0];
  if (!validarLinkPublicado(limpio).valido) return '';
  return limpio + (limpio.indexOf('?') === -1 ? '?' : '&') + 'format=json';
}

/** El identificador de un Google Doc a partir de su enlace. */
function idDeDocumentoDeGoogle(enlace) {
  var encontrado = /\/document\/d\/([a-zA-Z0-9_-]+)/.exec(String(enlace || ''));
  return encontrado ? encontrado[1] : '';
}

function diasEntreFechas(desdeIso, hastaIso) {
  var a = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(desdeIso || ''));
  var b = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(hastaIso || ''));
  if (!a || !b) return 0;
  var uno = Date.UTC(Number(a[1]), Number(a[2]) - 1, Number(a[3]));
  var dos = Date.UTC(Number(b[1]), Number(b[2]) - 1, Number(b[3]));
  return Math.round((dos - uno) / 86400000);
}

/**
 * Que filas revisa la corrida automatica, y en que orden.
 *
 * filas: Solicitudes ya planas (filasPlanas), en el orden del Sheet.
 * Devuelve [{ fila, enlace }], primero las recientes sin verificar.
 *
 *   - Una campana que ya termino no se revisa: ya no hay nada que publicar.
 *   - Recien generada y sin verificar: cada corrida, que es cada hora.
 *   - Verificada, o con mas de tres dias sin publicarse: una vez al dia,
 *     mientras siga vigente. Asi se entera Legal si alguien la cambia o la
 *     quita en medio de la campana.
 */
function solicitudesPorRevisar(filas, rutasPorPais, hoyIso, maximo) {
  var hoy = String(hoyIso || '').slice(0, 10);
  var frecuentes = [];
  var diarias = [];
  var lista = filas || [];

  for (var i = lista.length - 1; i >= 0; i--) {
    var fila = lista[i] || {};
    if (!fila.id || !fila.link_doc) continue;

    var fin = String(fila.fecha_fin || '').slice(0, 10);
    if (fin && hoy && fin < hoy) continue;

    var enlace = enlaceParaRevisar(fila, rutasPorPais ? rutasPorPais[fila.pais] : '');
    if (!enlace) continue;

    var verificacion = String(fila.verificacion || '');
    var ultima = String(fila.fecha_verificacion || '').slice(0, 10);
    var generada = String(fila.fecha || '').slice(0, 10);
    var reciente = !generada || diasEntreFechas(generada, hoy) <= DIAS_DE_REVISION_FRECUENTE;

    if (verificacion !== 'verificado' && reciente) {
      frecuentes.push({ fila: fila, enlace: enlace });
    } else if (!ultima || ultima < hoy) {
      diarias.push({ fila: fila, enlace: enlace });
    }
  }

  var limite = maximo === undefined ? REVISIONES_POR_CORRIDA : maximo;
  return frecuentes.concat(diarias).slice(0, limite);
}

// --- Para mostrar --------------------------------------------------------------

/** La etiqueta del estado en "Mis campanas". */
function etiquetaDePublicacion(fila) {
  var verificacion = String(fila && fila.verificacion || '');
  if (verificacion === 'verificado') return { texto: 'Publicado y verificado', clase: 'estado-publicado' };
  if (verificacion === 'con_diferencias') return { texto: 'Publicado con diferencias', clase: 'estado-alerta' };
  if (verificacion === 'retirado') return { texto: 'Ya no está publicado', clase: 'estado-alerta' };
  if (String(fila && fila.estado || '') === 'publicado') return { texto: 'Publicado', clase: 'estado-publicado' };
  return { texto: 'Generado', clase: 'estado-generado' };
}

// --- Lo que se pega en Squarespace ---------------------------------------------

function tramosComoHtml(partes) {
  var html = '';
  for (var i = 0; i < partes.length; i++) {
    var texto = escaparHtml(partes[i].texto);
    html += partes[i].negrita ? '<strong>' + texto + '</strong>' : texto;
  }
  return html;
}

/**
 * El documento como HTML para pegar en el cuerpo del evento.
 *
 * Solo parrafos, negrillas y vinetas, como el documento (regla 5: nada de
 * tablas). Se pega con su formato y Squarespace le aplica el estilo del sitio:
 * el paso de "Pegar sin formato" y de revisar las vinetas a ojo sobra.
 */
function htmlParaSquarespace(texto) {
  var bloques = estructuraDelDocumento(texto);
  var html = [];
  var enLista = false;

  for (var i = 0; i < bloques.length; i++) {
    var bloque = bloques[i];
    if (bloque.tipo === 'vineta') {
      if (!enLista) { html.push('<ul>'); enLista = true; }
      html.push('<li>' + tramosComoHtml(bloque.partes) + '</li>');
      continue;
    }
    if (enLista) { html.push('</ul>'); enLista = false; }

    if (bloque.tipo === 'titulo' || bloque.tipo === 'subtitulo') {
      html.push('<p style="text-align:center"><strong>' + escaparHtml(textoDelBloque(bloque)) + '</strong></p>');
    } else {
      html.push('<p>' + tramosComoHtml(bloque.partes) + '</p>');
    }
  }
  if (enLista) html.push('</ul>');
  return html.join('\n');
}

/** El mismo documento en texto plano, para donde no se pueda pegar con formato. */
function textoPlanoParaSquarespace(texto) {
  var bloques = estructuraDelDocumento(texto);
  var lineas = [];
  for (var i = 0; i < bloques.length; i++) {
    lineas.push((bloques[i].tipo === 'vineta' ? '• ' : '') + textoDelBloque(bloques[i]));
  }
  return lineas.join('\n');
}

if (typeof module !== 'undefined') {
  module.exports = {
    ESTADOS_DE_VERIFICACION: ESTADOS_DE_VERIFICACION,
    REVISIONES_POR_CORRIDA: REVISIONES_POR_CORRIDA,
    DIAS_DE_REVISION_FRECUENTE: DIAS_DE_REVISION_FRECUENTE,
    decodificarEntidadesHtml: decodificarEntidadesHtml,
    textoDeHtmlPublicado: textoDeHtmlPublicado,
    textoComparable: textoComparable,
    esperadoDesdeTexto: esperadoDesdeTexto,
    esperadoDesdeParrafos: esperadoDesdeParrafos,
    compararConLoPublicado: compararConLoPublicado,
    describirDiferencia: describirDiferencia,
    leerEventoDeSquarespace: leerEventoDeSquarespace,
    leerRespuestaDeSquarespace: leerRespuestaDeSquarespace,
    veredictoDeLaPublicacion: veredictoDeLaPublicacion,
    verificarPublicacion: verificarPublicacion,
    estadoDeVerificacionSiguiente: estadoDeVerificacionSiguiente,
    conElEstadoAnterior: conElEstadoAnterior,
    hayQueAvisarDeLaVerificacion: hayQueAvisarDeLaVerificacion,
    detalleParaGuardar: detalleParaGuardar,
    rutasDePublicacion: rutasDePublicacion,
    enlaceParaRevisar: enlaceParaRevisar,
    urlDeLecturaDeSquarespace: urlDeLecturaDeSquarespace,
    idDeDocumentoDeGoogle: idDeDocumentoDeGoogle,
    solicitudesPorRevisar: solicitudesPorRevisar,
    etiquetaDePublicacion: etiquetaDePublicacion,
    htmlParaSquarespace: htmlParaSquarespace,
    textoPlanoParaSquarespace: textoPlanoParaSquarespace,
  };
}
