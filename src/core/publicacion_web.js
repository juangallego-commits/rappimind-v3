'use strict';

/**
 * La publicacion de los T&C sin Squarespace: lo que se decide sin Google.
 *
 * Hasta el 5 de octubre de 2026 cada campana era un evento de Squarespace que
 * alguien creaba a mano y donde pegaba el texto. Squarespace no tiene API para
 * crear eventos y su politica prohibe los robots (decision 139), asi que ese
 * paso no se podia automatizar ahi adentro.
 *
 * Lo que cambia: el texto de cada campana vive en un archivo propio de Rappi,
 * en un bucket de Google Cloud Storage, y una sola pagina de promos.rappi.com
 * (`/tyc`, creada una vez, con un bloque de codigo) lo muestra. Cada campana
 * sigue teniendo su propio T&C y su propio enlace:
 *
 *   promos.rappi.com/tyc?co/farmatodo-20-cashback-20-oct-2026
 *
 * El final del enlace (`co/farmatodo-...`) dice que archivo leer. RappiMind lo
 * escribe sola al generar, y en cada ampliacion escribe la version nueva en el
 * mismo enlace y guarda las anteriores con su fecha.
 *
 * El archivo lleva el documento como bloques de texto, nunca como HTML: el visor
 * (src/visor/visor.js) los pinta con textContent. Asi, ni con el bucket
 * comprometido se le puede meter codigo a promos.rappi.com.
 *
 * Todo lo de aqui es puro. Subir y leer el archivo lo hace
 * src/server/PublicadorWeb.js.
 */

if (typeof module !== 'undefined' && typeof require === 'function') {
  var estructuraDelDocumento = require('./documento.js').estructuraDelDocumento;
  var PREFIJO_PUBLICACION = require('./validaciones.js').PREFIJO_PUBLICACION;
  var formatearFecha = require('./fechas.js').formatearFecha;
  var resultadoDeVerificacion = require('./publicacion.js').resultadoDeVerificacion;
}

/** La pagina de Squarespace que muestra los T&C, si Juan no dice otra. */
var VISOR_PREDETERMINADO = 'https://promos.rappi.com/tyc';

/** La carpeta del bucket donde viven los archivos, si Juan no dice otra. */
var CARPETA_PREDETERMINADA = 'tyc';

/** El formato del archivo. Si un dia cambia, el visor sabe que leer. */
var FORMATO_DEL_ARCHIVO_WEB = 1;

/*
 * Lo que la revision busca en la pagina /tyc para saber que el visor sigue ahi.
 * Solo existe dentro del <script> del visor (src/visor/visor.js): si Squarespace
 * dejara de correr el codigo del bloque, o alguien lo borrara, desaparece.
 */
var MARCA_DEL_VISOR = 'rappimind-tyc-visor';

/*
 * Cuanto tiempo puede guardar un navegador el archivo vigente antes de volver a
 * pedirlo. Cloud Storage pone una hora si no se dice nada, y una ampliacion
 * tardaria eso en verse. Las versiones viejas no cambian nunca: pueden guardarse
 * mucho tiempo.
 */
var CACHE_DEL_VIGENTE = 'public, max-age=60';
var CACHE_DE_UNA_VERSION = 'public, max-age=86400';

var PATRON_DEL_CODIGO = /^[a-z]{2}$/;
var PATRON_DE_LA_DIRECCION = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
var PATRON_DEL_BUCKET = /^[a-z0-9][a-z0-9._-]{1,220}[a-z0-9]$/;
var PATRON_DE_LA_CARPETA = /^[a-z0-9][a-z0-9_-]*(?:\/[a-z0-9][a-z0-9_-]*)*$/;

// --- La configuracion -----------------------------------------------------------

/**
 * La configuracion de la publicacion web, a partir de las propiedades del script.
 *
 * valores: { bucket, carpeta, visor, paises }. Sin bucket la publicacion web
 * esta apagada y RappiMind sigue con el camino de Squarespace de siempre: asi
 * el codigo puede llegar a produccion antes de que exista el bucket.
 *
 * paises: "CO, MX" o una lista. Vacio, publican solos los paises que hoy
 * publican en promos.rappi.com, que son los que tienen ruta_promos (decision 145).
 */
function configuracionDePublicacionWeb(valores) {
  var v = valores || {};
  var bucket = String(v.bucket || '').trim();
  var carpeta = String(v.carpeta || '').trim().replace(/^\/+/, '').replace(/\/+$/, '') || CARPETA_PREDETERMINADA;
  var visor = String(v.visor || '').trim().replace(/\/+$/, '') || VISOR_PREDETERMINADO;
  var paises = [];
  var lista = Object.prototype.toString.call(v.paises) === '[object Array]' ? v.paises : String(v.paises || '').split(/[\s,;]+/);
  for (var i = 0; i < lista.length; i++) {
    var codigo = String(lista[i] || '').trim().toUpperCase();
    if (codigo && paises.indexOf(codigo) === -1) paises.push(codigo);
  }

  var problema = '';
  if (!bucket) problema = 'Falta PUBLICACION_BUCKET: sin bucket, RappiMind no publica sola.';
  else if (!PATRON_DEL_BUCKET.test(bucket)) problema = 'El nombre del bucket "' + bucket + '" no es un nombre válido de Cloud Storage.';
  else if (!PATRON_DE_LA_CARPETA.test(carpeta)) problema = 'La carpeta "' + carpeta + '" solo puede llevar minúsculas, números, guiones y barras.';
  else if (visor.indexOf(PREFIJO_PUBLICACION) !== 0 || /[?#]/.test(visor) || visor.length <= PREFIJO_PUBLICACION.length) {
    problema = 'La página del visor tiene que ser una dirección de ' + PREFIJO_PUBLICACION + ' sin "?" ni "#".';
  }

  for (var p = 0; p < paises.length && !problema; p++) {
    if (!/^[A-Z]{2}$/.test(paises[p])) problema = 'En PUBLICACION_PAISES, "' + paises[p] + '" no es un código de país de dos letras.';
  }

  return { activa: !problema, bucket: bucket, carpeta: carpeta, visor: visor, paises: paises, problema: problema };
}

/**
 * Si esta campana se publica sola.
 *
 * Solo en un pais activo: uno en pruebas lleva el aviso de "no publiques" en
 * todas sus pantallas. Y solo en los paises que publican en promos.rappi.com:
 * los de la lista, o si no hay lista, los que tienen ruta_promos.
 */
function publicacionWebAplica(config, pais) {
  if (!config || !config.activa || !pais || pais.estado !== 'activo') return false;
  var codigo = String(pais.codigo || '').toUpperCase();
  if (config.paises && config.paises.length) return config.paises.indexOf(codigo) !== -1;
  return !!String(pais.ruta_promos || '').trim();
}

// --- El enlace y el archivo -------------------------------------------------------

/** "co/farmatodo-20-cashback-20-oct-2026", o "co/.../v2" para una version. Vacio si no es valida. */
function rutaWeb(codigoPais, direccion, version) {
  var codigo = String(codigoPais || '').trim().toLowerCase();
  var slug = String(direccion || '').trim();
  if (!PATRON_DEL_CODIGO.test(codigo) || !PATRON_DE_LA_DIRECCION.test(slug)) return '';
  var numero = Number(version || 0);
  if (numero && !(numero >= 1 && numero <= 999 && Math.floor(numero) === numero)) return '';
  return codigo + '/' + slug + (numero ? '/v' + numero : '');
}

/** El enlace publico de la campana: promos.rappi.com/tyc?co/farmatodo-... */
function enlaceWebDeLaCampana(config, codigoPais, direccion) {
  var ruta = rutaWeb(codigoPais, direccion);
  return config && config.activa && ruta ? config.visor + '?' + ruta : '';
}

/**
 * Lo que dice lo que va despues del "?" de un enlace del visor:
 * { codigo, direccion, version }, o null.
 *
 * Tolera lo que se le suele hacer a un enlace en el camino: lo que se le pega
 * al final (&utm_source=..., ?fbclid=..., #algo), un "=" que le agregan algunas
 * herramientas, la barra escrita como %2F y las mayusculas. El visor
 * (src/visor/visor.js) lee igual: hay una prueba que los compara.
 */
function rutaDesdeBusquedaWeb(busqueda) {
  var texto = String(busqueda || '').replace(/^\?/, '').split(/[&#?=]/)[0];
  try {
    texto = decodeURIComponent(texto);
  } catch (error) {
    return null;
  }
  texto = texto.split(/[&#?=]/)[0].replace(/^\s+|\s+$/g, '').toLowerCase().replace(/\/+$/, '');
  var partes = /^([a-z]{2})\/([a-z0-9]+(?:-[a-z0-9]+)*)(?:\/v([1-9][0-9]{0,2}))?$/.exec(texto);
  if (!partes) return null;
  return { codigo: partes[1], direccion: partes[2], version: partes[3] ? Number(partes[3]) : 0 };
}

/** Lo que dice un enlace del visor, o null si el enlace no es del visor. */
function rutaDesdeEnlaceWeb(config, enlace) {
  if (!config || !config.visor) return null;
  var texto = String(enlace || '').trim();
  var inicio = '';
  if (texto.indexOf(config.visor + '?') === 0) inicio = config.visor + '?';
  else if (texto.indexOf(config.visor + '/?') === 0) inicio = config.visor + '/?';
  if (!inicio) return null;
  return rutaDesdeBusquedaWeb(texto.slice(inicio.length));
}

function esEnlaceDelVisor(config, enlace) {
  return rutaDesdeEnlaceWeb(config, enlace) !== null;
}

/** El nombre del objeto en el bucket: tyc/co/farmatodo-....json, o .../v2.json. */
function nombreDelObjetoWeb(config, codigoPais, direccion, version) {
  var ruta = rutaWeb(codigoPais, direccion, version);
  return ruta ? config.carpeta + '/' + ruta + '.json' : '';
}

/**
 * La direccion publica del objeto, la que se lee sin iniciar sesion. Es la del
 * API XML de Cloud Storage: la documentacion de Google la indica para leer un
 * objeto publico de forma anonima, y es la que respeta el CORS del bucket.
 */
function urlPublicaDelObjetoWeb(config, nombre) {
  var partes = String(nombre || '').split('/');
  for (var i = 0; i < partes.length; i++) partes[i] = encodeURIComponent(partes[i]);
  return 'https://storage.googleapis.com/' + config.bucket + '/' + partes.join('/');
}

/**
 * La direccion para leer un objeto con la cuenta de RappiMind (API JSON). No
 * pasa por la cache publica: devuelve lo que hay escrito en este momento.
 */
function urlDeLecturaPrivadaWeb(config, nombre) {
  return 'https://storage.googleapis.com/storage/v1/b/' + encodeURIComponent(config.bucket) + '/o/' +
    encodeURIComponent(String(nombre || '')) + '?alt=media';
}

/** La direccion para subir un objeto con sus metadatos (API JSON, multipart). */
function urlDeSubidaWeb(config) {
  return 'https://storage.googleapis.com/upload/storage/v1/b/' + encodeURIComponent(config.bucket) + '/o?uploadType=multipart';
}

/**
 * JSON con todo lo que no es ASCII escrito como \\uXXXX.
 *
 * El texto legal lleva tildes, eñes y comillas tipográficas. Escritas asi, el
 * archivo es identico byte por byte venga de donde venga la codificacion de la
 * subida, y JSON.parse lo devuelve igual.
 */
function jsonEnAscii(valor) {
  return JSON.stringify(valor).replace(/[\u007f-\uffff]/g, function (caracter) {
    return '\\u' + ('0000' + caracter.charCodeAt(0).toString(16)).slice(-4);
  });
}

/** El cuerpo de una subida multipart: metadatos y contenido, en ASCII. */
function cuerpoDeSubidaWeb(metadatos, contenido, limite) {
  return '--' + limite + '\r\n' +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    jsonEnAscii(metadatos) + '\r\n' +
    '--' + limite + '\r\n' +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    contenido + '\r\n' +
    '--' + limite + '--';
}

/**
 * Lo que respondio Cloud Storage al subir o leer con la cuenta de RappiMind,
 * dicho para quien tiene que arreglarlo. Vacio si salio bien.
 */
function problemaDeCloudStorage(config, codigo, cuerpo) {
  var numero = Number(codigo);
  var texto = String(cuerpo || '');
  if (numero === 200) return '';
  if (numero === 401) {
    return 'Cloud Storage no aceptó la autorización de RappiMind. Hay que volver a autorizar el proyecto de Apps Script con el permiso de Cloud Storage.';
  }
  if (numero === 403) {
    if (/accessNotConfigured|has not been used|is disabled|SERVICE_DISABLED/i.test(texto)) {
      return 'La API de Cloud Storage no está habilitada en el proyecto de Google Cloud de RappiMind.';
    }
    return 'La cuenta con la que corre RappiMind no tiene permiso para escribir en el bucket "' + config.bucket + '".';
  }
  if (numero === 404) return 'El bucket "' + config.bucket + '" no existe, o la cuenta de RappiMind no lo puede ver.';
  if (numero === 429 || numero >= 500 || !numero) {
    return 'Cloud Storage no respondió bien (' + (numero || 'sin respuesta') + '). Se vuelve a intentar en la próxima revisión.';
  }
  return 'Cloud Storage respondió con un error (' + numero + ').';
}

/** La version que le toca a una campana: 1, y una mas por cada ampliacion. */
function versionDeLaEntrada(entrada) {
  var modificaciones = entrada && Object.prototype.toString.call(entrada.modificaciones) === '[object Array]' ? entrada.modificaciones : [];
  return modificaciones.length + 1;
}

/**
 * La fecha con la que se vuelve a armar el texto de una campana: la de su
 * ultima ampliacion, o la del dia en que se genero. Con la de hoy, una campana
 * generada ayer para empezar hoy no pasaria la validacion de "empieza en el
 * pasado", y el reintento nunca podria publicarla.
 */
function fechaParaRehacerElTexto(fila, entrada) {
  var modificaciones = entrada && Object.prototype.toString.call(entrada.modificaciones) === '[object Array]' ? entrada.modificaciones : [];
  if (modificaciones.length) {
    var ultima = String(modificaciones[modificaciones.length - 1] && modificaciones[modificaciones.length - 1].fecha || '').slice(0, 10);
    if (/^\d{4}-\d{2}-\d{2}$/.test(ultima)) return ultima;
  }
  var generada = String(fila && fila.fecha || '').slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(generada) ? generada : '';
}

/**
 * Si un cambio de estado de una campana publicada por RappiMind merece correo.
 *
 * Distinto del de Squarespace: aqui nadie tiene que ir a pegar nada, asi que no
 * se avisa cada paso. Se avisa cuando algo que estaba mal quedo bien (una
 * publicacion que se habia caido y RappiMind repuso), cuando lo publicado ya no
 * es el documento, y cuando un T&C que se veia dejo de verse y RappiMind no lo
 * pudo reponer. El primer intento, al generar, lo cuenta el correo de la
 * generacion.
 */
function hayQueAvisarDeLaPublicacionWeb(anterior, siguiente) {
  var antes = String(anterior || '');
  if (antes === siguiente) return false;
  if (siguiente === 'verificado') return antes === 'sin_publicar' || antes === 'con_diferencias' || antes === 'retirado' || antes === 'no_publicado';
  if (siguiente === 'con_diferencias') return true;
  if (siguiente === 'sin_publicar') return antes === 'verificado' || antes === 'con_diferencias';
  return false;
}

/** El texto de la prueba que publica prepararPublicacionWeb(), en la direccion zz/prueba-de-rappimind. */
var TEXTO_DE_LA_PRUEBA_WEB = '**Prueba.** Si ves este texto en promos.rappi.com, la página del visor ya muestra los T&C que publica RappiMind.';
var DIRECCION_DE_LA_PRUEBA_WEB = 'prueba-de-rappimind';
var CODIGO_DE_LA_PRUEBA_WEB = 'ZZ';

// --- El documento publicado ---------------------------------------------------------

/** Solo lo que el visor necesita de cada bloque, y como texto. */
function bloquesParaLaWeb(texto) {
  var bloques = estructuraDelDocumento(texto);
  var salida = [];
  for (var i = 0; i < bloques.length; i++) {
    var partes = [];
    for (var p = 0; p < bloques[i].partes.length; p++) {
      partes.push({ texto: String(bloques[i].partes[p].texto), negrita: !!bloques[i].partes[p].negrita });
    }
    salida.push({ tipo: bloques[i].tipo, partes: partes });
  }
  return salida;
}

/** Las versiones de un archivo ya publicado, para no perderlas al escribir otra. */
function versionesDelArchivoWeb(contenido) {
  try {
    var datos = typeof contenido === 'string' ? JSON.parse(contenido) : contenido;
    var lista = datos && Object.prototype.toString.call(datos.versiones) === '[object Array]' ? datos.versiones : [];
    var salida = [];
    for (var i = 0; i < lista.length; i++) {
      var version = Number(lista[i] && lista[i].version);
      if (version >= 1) salida.push({ version: version, publicado: String(lista[i].publicado || '') });
    }
    return salida;
  } catch (error) {
    return [];
  }
}

/**
 * El archivo de una campana, listo para subir.
 *
 * datos: { id, codigoPais, idioma, titulo, fechaInicio, fechaFin, texto, version,
 *          publicado, versionesAnteriores }
 *
 * `publicado` es "AAAA-MM-DD HH:MM:SS" en la hora de Bogota, que es la del
 * proyecto. Las versiones anteriores se conservan; una con el mismo numero se
 * reemplaza, porque es la misma version que se esta volviendo a escribir.
 */
function documentoWeb(datos) {
  var version = Number(datos.version) || 1;
  var versiones = [];
  var anteriores = datos.versionesAnteriores || [];
  for (var i = 0; i < anteriores.length; i++) {
    if (anteriores[i].version !== version) versiones.push(anteriores[i]);
  }
  versiones.push({ version: version, publicado: String(datos.publicado || '') });
  versiones.sort(function (a, b) { return a.version - b.version; });

  return {
    formato: FORMATO_DEL_ARCHIVO_WEB,
    id: String(datos.id || ''),
    pais: String(datos.codigoPais || '').toUpperCase(),
    idioma: datos.idioma === 'pt' ? 'pt' : 'es',
    titulo: String(datos.titulo || ''),
    vigencia: { inicio: String(datos.fechaInicio || '').slice(0, 10), fin: String(datos.fechaFin || '').slice(0, 10) },
    version: version,
    publicado: String(datos.publicado || ''),
    zona: 'America/Bogota',
    bloques: bloquesParaLaWeb(datos.texto),
    versiones: versiones,
  };
}

/**
 * Lo que queda en el enlace de una campana retirada. Las versiones se quedan en
 * el bucket, como constancia de lo que estuvo publicado.
 */
function documentoWebRetirado(anterior, datos) {
  var previo = anterior || {};
  return {
    formato: FORMATO_DEL_ARCHIVO_WEB,
    retirado: true,
    id: String(previo.id || datos.id || ''),
    pais: String(previo.pais || datos.codigoPais || '').toUpperCase(),
    idioma: previo.idioma === 'pt' ? 'pt' : 'es',
    titulo: String(previo.titulo || datos.titulo || ''),
    retiradoEl: String(datos.fecha || ''),
    versiones: versionesDelArchivoWeb(previo),
  };
}

/** El texto de los bloques, un renglon por bloque, para comparar con el documento. */
function textoDeLosBloquesWeb(bloques) {
  var lineas = [];
  var lista = bloques || [];
  for (var i = 0; i < lista.length; i++) {
    var texto = '';
    var partes = lista[i] && lista[i].partes ? lista[i].partes : [];
    for (var p = 0; p < partes.length; p++) texto += String(partes[p].texto || '');
    lineas.push(texto);
  }
  return lineas.join('\n');
}

// --- La revision del archivo publicado ---------------------------------------------

/**
 * Lo que dice la respuesta al leer el archivo publico, con la misma forma que
 * leerRespuestaDeSquarespace: { listo: true, resultado } o { listo: false, evento }.
 */
function leerRespuestaDelArchivoWeb(respuesta) {
  if (!respuesta || respuesta.falla) {
    return { listo: true, resultado: resultadoDeVerificacion('sin_verificar',
      'No pudimos leer el archivo publicado. Volvemos a intentarlo en la próxima revisión.') };
  }
  var codigo = Number(respuesta.codigo);
  if (codigo === 404 || codigo === 410) {
    return { listo: true, resultado: resultadoDeVerificacion('no_publicado',
      'El archivo de este T&C no está en el bucket.') };
  }
  if (codigo === 401 || codigo === 403) {
    return { listo: true, resultado: resultadoDeVerificacion('sin_verificar',
      'El archivo no se puede leer en público: revisa que el bucket tenga lectura pública.') };
  }
  if (codigo !== 200) {
    return { listo: true, resultado: resultadoDeVerificacion('sin_verificar',
      'Cloud Storage respondió con un error (' + (isFinite(codigo) ? codigo : 'sin código') + '). Volvemos a intentarlo en la próxima revisión.') };
  }

  var datos;
  try {
    datos = JSON.parse(String(respuesta.cuerpo || ''));
  } catch (error) {
    datos = null;
  }
  if (!datos || typeof datos !== 'object') {
    return { listo: true, resultado: resultadoDeVerificacion('sin_verificar', 'El archivo publicado no se puede leer.') };
  }
  if (datos.retirado) {
    return { listo: true, resultado: resultadoDeVerificacion('dado_de_baja',
      'Retirado' + (datos.retiradoEl ? ' el ' + datos.retiradoEl : '') + '. El enlace ya no muestra el T&C.') };
  }

  return {
    listo: false,
    evento: {
      ok: true,
      origen: 'web',
      titulo: String(datos.titulo || ''),
      cuerpoTexto: textoDeLosBloquesWeb(datos.bloques),
      urlCompleta: '',
      version: Number(datos.version) || 0,
      publicadoDesde: String(datos.publicado || ''),
      desfase: null,
    },
  };
}

/**
 * Si la pagina del visor sigue en pie: responde y trae el bloque de codigo.
 *
 * Es el unico punto del que dependen todos los enlaces nuevos: si alguien borra
 * la pagina /tyc o le quita el bloque, ningun T&C publicado por RappiMind se ve.
 */
function estadoDelVisor(respuesta) {
  if (!respuesta || respuesta.falla) {
    return { estado: 'sin_verificar', detalle: 'No pudimos abrir la página del visor.' };
  }
  var codigo = Number(respuesta.codigo);
  if (codigo !== 200) {
    return {
      estado: 'caido',
      detalle: 'La página del visor respondió ' + (isFinite(codigo) ? codigo : 'sin código') +
        ': los T&C publicados por RappiMind no se están viendo.',
    };
  }
  if (String(respuesta.cuerpo || '').indexOf(MARCA_DEL_VISOR) === -1) {
    return {
      estado: 'caido',
      detalle: 'La página del visor existe, pero ya no tiene el bloque de código de RappiMind: los T&C publicados no se están viendo.',
    };
  }
  return { estado: 'en_pie', detalle: 'La página del visor está en pie.' };
}

/** Lo que el comercial lee sobre una publicacion web, en una frase. */
function detalleDePublicacionWeb(version, publicado) {
  return 'Publicado por RappiMind' + (publicado ? ' el ' + publicado : '') + ', versión ' + (version || 1) + '.';
}

/** La fecha de un documento web como la lee una persona: "5 de octubre de 2026". */
function fechaLegibleDePublicacion(publicado) {
  return formatearFecha(String(publicado || '').slice(0, 10)) || '';
}

if (typeof module !== 'undefined') {
  module.exports = {
    VISOR_PREDETERMINADO: VISOR_PREDETERMINADO,
    CARPETA_PREDETERMINADA: CARPETA_PREDETERMINADA,
    FORMATO_DEL_ARCHIVO_WEB: FORMATO_DEL_ARCHIVO_WEB,
    MARCA_DEL_VISOR: MARCA_DEL_VISOR,
    CACHE_DEL_VIGENTE: CACHE_DEL_VIGENTE,
    CACHE_DE_UNA_VERSION: CACHE_DE_UNA_VERSION,
    configuracionDePublicacionWeb: configuracionDePublicacionWeb,
    publicacionWebAplica: publicacionWebAplica,
    rutaWeb: rutaWeb,
    enlaceWebDeLaCampana: enlaceWebDeLaCampana,
    rutaDesdeBusquedaWeb: rutaDesdeBusquedaWeb,
    rutaDesdeEnlaceWeb: rutaDesdeEnlaceWeb,
    esEnlaceDelVisor: esEnlaceDelVisor,
    nombreDelObjetoWeb: nombreDelObjetoWeb,
    urlPublicaDelObjetoWeb: urlPublicaDelObjetoWeb,
    urlDeLecturaPrivadaWeb: urlDeLecturaPrivadaWeb,
    urlDeSubidaWeb: urlDeSubidaWeb,
    problemaDeCloudStorage: problemaDeCloudStorage,
    versionDeLaEntrada: versionDeLaEntrada,
    fechaParaRehacerElTexto: fechaParaRehacerElTexto,
    hayQueAvisarDeLaPublicacionWeb: hayQueAvisarDeLaPublicacionWeb,
    TEXTO_DE_LA_PRUEBA_WEB: TEXTO_DE_LA_PRUEBA_WEB,
    DIRECCION_DE_LA_PRUEBA_WEB: DIRECCION_DE_LA_PRUEBA_WEB,
    CODIGO_DE_LA_PRUEBA_WEB: CODIGO_DE_LA_PRUEBA_WEB,
    jsonEnAscii: jsonEnAscii,
    cuerpoDeSubidaWeb: cuerpoDeSubidaWeb,
    bloquesParaLaWeb: bloquesParaLaWeb,
    versionesDelArchivoWeb: versionesDelArchivoWeb,
    documentoWeb: documentoWeb,
    documentoWebRetirado: documentoWebRetirado,
    textoDeLosBloquesWeb: textoDeLosBloquesWeb,
    leerRespuestaDelArchivoWeb: leerRespuestaDelArchivoWeb,
    estadoDelVisor: estadoDelVisor,
    detalleDePublicacionWeb: detalleDePublicacionWeb,
    fechaLegibleDePublicacion: fechaLegibleDePublicacion,
  };
}
