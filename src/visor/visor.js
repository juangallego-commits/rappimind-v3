'use strict';

/**
 * El visor de los T&C que publica RappiMind.
 *
 * Vive una sola vez en la pagina /tyc de promos.rappi.com, dentro de un bloque
 * de codigo de Squarespace. `npm run visor -- --bucket NOMBRE` arma el bloque
 * listo para pegar (scripts/visor.js). Lee lo que va despues del "?" del enlace
 * (co/farmatodo-...), trae de Cloud Storage el archivo de esa campana y lo pinta.
 *
 * Reglas que no se negocian:
 *
 *   - Nunca usa innerHTML ni nada que interprete HTML: todo se pinta con
 *     createElement y createTextNode. El archivo lo escribe RappiMind, pero si
 *     alguien llegara a escribir en el bucket, lo peor que puede hacer es
 *     cambiar un texto; nunca correr codigo en promos.rappi.com.
 *   - No depende de nada de afuera: ni librerias ni la interfaz de RappiMind.
 *   - ES5 y XMLHttpRequest, para los navegadores viejos de algunos telefonos.
 *
 * MARCA solo existe dentro de este script. La revision de cada hora la busca en
 * la pagina /tyc: si Squarespace dejara de correr el bloque, o alguien lo
 * borrara, deja de encontrarla y avisa (estadoDelVisor, src/core/publicacion_web.js).
 *
 * Lo que este archivo lee del enlace tiene que ser lo mismo que lee
 * rutaDesdeBusquedaWeb en src/core/publicacion_web.js: hay una prueba que los
 * compara (pruebas/visor.test.js).
 */

var MARCA = 'rappimind-tyc-visor';
var FORMATO_QUE_LEE = 1;
var ID_DEL_CONTENEDOR = 'rappimind-tyc';
var PATRON_DE_LA_RUTA = /^([a-z]{2})\/([a-z0-9]+(?:-[a-z0-9]+)*)(?:\/v([1-9][0-9]{0,2}))?$/;

/* Tres intentos: de una vez, a los 2 segundos y a los 6. */
var ESPERAS_ENTRE_INTENTOS = [0, 2000, 6000];
var TIEMPO_MAXIMO_DEL_PEDIDO = 15000;

var TEXTOS_DEL_VISOR = {
  es: {
    cargando: 'Cargando los términos y condiciones...',
    noExiste: 'No encontramos estos términos y condiciones. Revisa que el enlace esté completo.',
    error: 'No pudimos cargar los términos y condiciones. Revisa tu conexión e intenta de nuevo.',
    reintentar: 'Intentar de nuevo',
    retirados: 'Estos términos y condiciones fueron retirados.',
    retiradosEl: 'Estos términos y condiciones fueron retirados el {fecha}.',
    versionAnterior: 'Esta es una versión anterior de estos términos y condiciones{publicada}.',
    versionNumero: 'Estás viendo la versión {version} de estos términos y condiciones{publicada}.',
    publicadaEl: ', publicada el {fecha}',
    verVigente: 'Ver la versión vigente',
    meses: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre',
      'octubre', 'noviembre', 'diciembre'],
  },
  pt: {
    cargando: 'Carregando os termos e condições...',
    noExiste: 'Não encontramos estes termos e condições. Confira se o link está completo.',
    error: 'Não conseguimos carregar os termos e condições. Verifique sua conexão e tente de novo.',
    reintentar: 'Tentar de novo',
    retirados: 'Estes termos e condições foram retirados.',
    retiradosEl: 'Estes termos e condições foram retirados em {fecha}.',
    versionAnterior: 'Esta é uma versão anterior destes termos e condições{publicada}.',
    versionNumero: 'Você está vendo a versão {version} destes termos e condições{publicada}.',
    publicadaEl: ', publicada em {fecha}',
    verVigente: 'Ver a versão vigente',
    meses: ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro',
      'outubro', 'novembro', 'dezembro'],
  },
};

// --- El enlace ---------------------------------------------------------------------

/**
 * { codigo, direccion, version } a partir de location.search, o null.
 * Tolera lo que se le pega a un enlace en el camino (&utm_source=..., un "="
 * al final, la barra como %2F, mayusculas).
 */
function rutaDeLaBusqueda(busqueda) {
  var texto = String(busqueda || '').replace(/^\?/, '').split(/[&#?=]/)[0];
  try {
    texto = decodeURIComponent(texto);
  } catch (error) {
    return null;
  }
  texto = texto.split(/[&#?=]/)[0].replace(/^\s+|\s+$/g, '').toLowerCase().replace(/\/+$/, '');
  var partes = PATRON_DE_LA_RUTA.exec(texto);
  if (!partes) return null;
  return { codigo: partes[1], direccion: partes[2], version: partes[3] ? Number(partes[3]) : 0 };
}

/** La direccion del archivo: base + co/farmatodo-....json, o .../v2.json. */
function urlDelArchivo(base, ruta, version) {
  return base + ruta.codigo + '/' + ruta.direccion + (version ? '/v' + version : '') + '.json';
}

/** El enlace a la version vigente, relativo a la misma pagina. */
function enlaceDeLaVigente(ruta) {
  return '?' + ruta.codigo + '/' + ruta.direccion;
}

function idiomaDelVisor(codigo, idiomaDelArchivo) {
  if (idiomaDelArchivo === 'es' || idiomaDelArchivo === 'pt') return idiomaDelArchivo;
  return codigo === 'br' ? 'pt' : 'es';
}

/** "2026-10-05 23:40:00" a "5 de octubre de 2026". Vacio si no es una fecha. */
function fechaLegibleDelVisor(fecha, idioma) {
  var partes = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(fecha || ''));
  if (!partes) return '';
  var mes = Number(partes[2]);
  var dia = Number(partes[3]);
  if (mes < 1 || mes > 12 || dia < 1 || dia > 31) return '';
  return dia + ' de ' + TEXTOS_DEL_VISOR[idioma].meses[mes - 1] + ' de ' + partes[1];
}

function conDatos(plantilla, datos) {
  return plantilla.replace(/\{(\w+)\}/g, function (todo, llave) {
    return Object.prototype.hasOwnProperty.call(datos, llave) ? String(datos[llave]) : todo;
  });
}

// --- El archivo --------------------------------------------------------------------

/**
 * Lo que dice una respuesta: { tipo, datos, reintentable }.
 * tipo: 'documento', 'retirado', 'no_existe' o 'error'.
 *
 * Un 403 tambien es "no existe": sin permiso de listar el bucket, que es como
 * se configura, Cloud Storage contesta 403 en vez de 404 por un archivo que no esta.
 */
function leerRespuestaDelVisor(respuesta) {
  if (!respuesta || respuesta.falla) return { tipo: 'error', reintentable: true };
  var codigo = Number(respuesta.codigo);
  if (codigo === 404 || codigo === 403 || codigo === 410) return { tipo: 'no_existe' };
  if (codigo !== 200) {
    return { tipo: 'error', reintentable: !codigo || codigo === 408 || codigo === 429 || codigo >= 500 };
  }

  var datos;
  try {
    datos = JSON.parse(String(respuesta.cuerpo || ''));
  } catch (error) {
    return { tipo: 'error', reintentable: false };
  }
  if (!datos || typeof datos !== 'object' || datos.formato !== FORMATO_QUE_LEE) {
    return { tipo: 'error', reintentable: false };
  }
  if (datos.retirado === true) return { tipo: 'retirado', datos: datos };
  if (Object.prototype.toString.call(datos.bloques) !== '[object Array]') {
    return { tipo: 'error', reintentable: false };
  }
  return { tipo: 'documento', datos: datos };
}

function pedirArchivo(ventana, url, listo) {
  var terminado = false;
  function terminar(respuesta) {
    if (terminado) return;
    terminado = true;
    listo(respuesta);
  }
  try {
    var pedido = new ventana.XMLHttpRequest();
    pedido.open('GET', url, true);
    pedido.timeout = TIEMPO_MAXIMO_DEL_PEDIDO;
    pedido.onload = function () { terminar({ codigo: pedido.status, cuerpo: pedido.responseText }); };
    pedido.onerror = function () { terminar({ falla: 'red' }); };
    pedido.ontimeout = function () { terminar({ falla: 'tiempo' }); };
    pedido.send();
  } catch (error) {
    terminar({ falla: 'red' });
  }
}

/** Pide el archivo y reintenta lo que puede ser pasajero (la red, un 5xx). */
function pedirConReintentos(ventana, url, listo) {
  var intento = 0;
  function pedir() {
    pedirArchivo(ventana, url, function (respuesta) {
      var lectura = leerRespuestaDelVisor(respuesta);
      if (lectura.tipo === 'error' && lectura.reintentable && intento + 1 < ESPERAS_ENTRE_INTENTOS.length) {
        intento += 1;
        ventana.setTimeout(pedir, ESPERAS_ENTRE_INTENTOS[intento]);
        return;
      }
      listo(lectura);
    });
  }
  pedir();
}

// --- La pagina ---------------------------------------------------------------------

function vaciar(nodo) {
  while (nodo.firstChild) nodo.removeChild(nodo.firstChild);
}

function elemento(documento, etiqueta, clase, texto) {
  var nodo = documento.createElement(etiqueta);
  if (clase) nodo.className = clase;
  if (texto !== undefined) nodo.appendChild(documento.createTextNode(String(texto)));
  return nodo;
}

/** Solo partes con texto, y el texto siempre como texto. */
function partesDelBloque(bloque) {
  var salida = [];
  var lista = Object.prototype.toString.call(bloque.partes) === '[object Array]' ? bloque.partes : [];
  for (var i = 0; i < lista.length; i++) {
    var parte = lista[i];
    if (!parte || typeof parte.texto !== 'string' || !parte.texto) continue;
    salida.push({ texto: parte.texto, negrita: parte.negrita === true });
  }
  return salida;
}

function agregarPartes(documento, destino, partes) {
  for (var i = 0; i < partes.length; i++) {
    if (partes[i].negrita) destino.appendChild(elemento(documento, 'strong', '', partes[i].texto));
    else destino.appendChild(documento.createTextNode(partes[i].texto));
  }
}

/**
 * Los bloques del documento con la misma forma que tenian los eventos de
 * Squarespace: titulos centrados y en negrilla, clausulas y parrafos con sus
 * negrillas, y las vinetas seguidas en una sola lista.
 */
function pintarBloques(documento, contenedor, bloques) {
  var lista = null;
  for (var i = 0; i < bloques.length; i++) {
    var bloque = bloques[i];
    if (!bloque || typeof bloque !== 'object') continue;
    var partes = partesDelBloque(bloque);
    if (!partes.length) continue;

    if (bloque.tipo === 'vineta') {
      if (!lista) {
        lista = elemento(documento, 'ul');
        contenedor.appendChild(lista);
      }
      var item = elemento(documento, 'li');
      agregarPartes(documento, item, partes);
      lista.appendChild(item);
      continue;
    }
    lista = null;

    var parrafo;
    if (bloque.tipo === 'titulo' || bloque.tipo === 'subtitulo') {
      var texto = '';
      for (var p = 0; p < partes.length; p++) texto += partes[p].texto;
      parrafo = elemento(documento, 'p', 'rappimind-tyc-centrado');
      parrafo.appendChild(elemento(documento, 'strong', '', texto));
    } else {
      parrafo = elemento(documento, 'p');
      agregarPartes(documento, parrafo, partes);
    }
    contenedor.appendChild(parrafo);
  }
}

function mostrarMensaje(documento, contenedor, idioma, clave) {
  vaciar(contenedor);
  contenedor.setAttribute('lang', idioma);
  contenedor.appendChild(elemento(documento, 'p', 'rappimind-tyc-aviso', TEXTOS_DEL_VISOR[idioma][clave]));
}

/** El aviso de una version que no es la vigente, o null si no hace falta. */
function avisoDeVersion(documento, ruta, datos, vigente, idioma) {
  var textos = TEXTOS_DEL_VISOR[idioma];
  var fecha = fechaLegibleDelVisor(datos.publicado, idioma);
  var publicada = fecha ? conDatos(textos.publicadaEl, { fecha: fecha }) : '';
  if (vigente && vigente.tipo === 'documento' && Number(vigente.datos.version) === ruta.version) return null;

  var aviso = elemento(documento, 'p', 'rappimind-tyc-aviso');
  if (vigente && (vigente.tipo === 'documento' || vigente.tipo === 'retirado')) {
    aviso.appendChild(documento.createTextNode(conDatos(textos.versionAnterior, { publicada: publicada })));
    if (vigente.tipo === 'retirado') {
      var retiro = fechaLegibleDelVisor(vigente.datos.retiradoEl, idioma);
      aviso.appendChild(documento.createTextNode(' ' + (retiro ? conDatos(textos.retiradosEl, { fecha: retiro }) : textos.retirados)));
    } else {
      aviso.appendChild(documento.createTextNode(' '));
      var enlace = elemento(documento, 'a', '', textos.verVigente);
      enlace.setAttribute('href', enlaceDeLaVigente(ruta));
      aviso.appendChild(enlace);
    }
    return aviso;
  }
  aviso.appendChild(documento.createTextNode(conDatos(textos.versionNumero, { version: ruta.version, publicada: publicada })));
  return aviso;
}

function pintarLectura(ventana, contenedor, base, ruta, lectura, vigente) {
  var documento = ventana.document;
  var idioma = idiomaDelVisor(ruta.codigo, lectura.datos && lectura.datos.idioma);
  var textos = TEXTOS_DEL_VISOR[idioma];

  if (lectura.tipo === 'no_existe') {
    mostrarMensaje(documento, contenedor, idioma, 'noExiste');
    return;
  }
  if (lectura.tipo === 'error') {
    mostrarMensaje(documento, contenedor, idioma, 'error');
    var boton = elemento(documento, 'button', 'rappimind-tyc-boton', textos.reintentar);
    boton.setAttribute('type', 'button');
    boton.onclick = function () { cargarRuta(ventana, contenedor, base, ruta); };
    contenedor.appendChild(boton);
    return;
  }

  var datos = lectura.datos;
  vaciar(contenedor);
  contenedor.setAttribute('lang', idioma);
  if (typeof datos.titulo === 'string' && datos.titulo) {
    contenedor.appendChild(elemento(documento, 'h1', '', datos.titulo));
    try {
      documento.title = datos.titulo;
    } catch (error) {
      // Un titulo que no se puede poner no impide leer el T&C.
    }
  }

  if (lectura.tipo === 'retirado') {
    var fecha = fechaLegibleDelVisor(datos.retiradoEl, idioma);
    contenedor.appendChild(elemento(documento, 'p', 'rappimind-tyc-aviso',
      fecha ? conDatos(textos.retiradosEl, { fecha: fecha }) : textos.retirados));
    return;
  }

  if (ruta.version) {
    var aviso = avisoDeVersion(documento, ruta, datos, vigente, idioma);
    if (aviso) contenedor.appendChild(aviso);
  }
  pintarBloques(documento, contenedor, datos.bloques);
}

/** Trae el archivo de la ruta (y, si es una version, tambien el vigente) y lo pinta. */
function cargarRuta(ventana, contenedor, base, ruta) {
  mostrarMensaje(ventana.document, contenedor, idiomaDelVisor(ruta.codigo, ''), 'cargando');

  var pendientes = ruta.version ? 2 : 1;
  var lectura = null;
  var vigente = null;
  function cuandoLleguen() {
    pendientes -= 1;
    if (pendientes === 0) pintarLectura(ventana, contenedor, base, ruta, lectura, vigente);
  }
  pedirConReintentos(ventana, urlDelArchivo(base, ruta, ruta.version), function (respuesta) {
    lectura = respuesta;
    cuandoLleguen();
  });
  if (ruta.version) {
    pedirConReintentos(ventana, urlDelArchivo(base, ruta, 0), function (respuesta) {
      vigente = respuesta;
      cuandoLleguen();
    });
  }
}

/** configuracion: { base: 'https://storage.googleapis.com/BUCKET/CARPETA/' } */
function iniciarVisor(ventana, configuracion) {
  var contenedor = ventana.document.getElementById(ID_DEL_CONTENEDOR);
  if (!contenedor) return;
  contenedor.setAttribute('data-visor', MARCA);

  var base = String(configuracion && configuracion.base || '');
  var ruta = rutaDeLaBusqueda(ventana.location && ventana.location.search);
  if (!ruta || !/^https:\/\/[^?#]+\/$/.test(base)) {
    mostrarMensaje(ventana.document, contenedor, idiomaDelVisor(ruta && ruta.codigo, ''), 'noExiste');
    return;
  }
  cargarRuta(ventana, contenedor, base, ruta);
}

/* --- SOLO PARA LAS PRUEBAS: scripts/visor.js corta el bloque desde aqui --- */
if (typeof module !== 'undefined') {
  module.exports = {
    MARCA: MARCA,
    ID_DEL_CONTENEDOR: ID_DEL_CONTENEDOR,
    TEXTOS_DEL_VISOR: TEXTOS_DEL_VISOR,
    ESPERAS_ENTRE_INTENTOS: ESPERAS_ENTRE_INTENTOS,
    rutaDeLaBusqueda: rutaDeLaBusqueda,
    urlDelArchivo: urlDelArchivo,
    fechaLegibleDelVisor: fechaLegibleDelVisor,
    leerRespuestaDelVisor: leerRespuestaDelVisor,
    iniciarVisor: iniciarVisor,
  };
}
