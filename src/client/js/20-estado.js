'use strict';

/**
 * El estado de la aplicacion y el borrador guardado en el navegador.
 *
 * El borrador evita que se pierda lo escrito si se cierra la pestana. Puede
 * fallar (modo privado, almacenamiento lleno, permisos), asi que cada lectura y
 * cada escritura estan protegidas y la aplicacion funciona igual sin el.
 */

var RM = window.RM;

var LLAVE_BORRADOR = 'rappimind-v3-borrador';
var VERSION_BORRADOR = 3;

var estado = {
  pantalla: 'inicio',
  configuracion: null,
  entrada: {},
  pasoActual: 0,
  campoAbierto: null,
  filtroRespondido: false,
  filtroDeTravelRespondido: false,
  motivoDeLegal: null,
  // De donde salio hacia la pantalla de Legal, para poder volver a esa misma
  // pregunta con "Cambiar mi respuesta". Sin esto, el unico camino de vuelta
  // era el inicio, y perder todo lo respondido por una respuesta mal marcada.
  volverDeLegal: null,
  // Cuál de los T&C que Legal ya publicó está mirando. Null = la lista entera.
  tycGenericoElegido: null,
  // El filtro de seis preguntas que va antes de la lista de T&C generales, y
  // cuál de ellos resaltar cuando el filtro ya dijo cuál sirve.
  filtroDeGenerales: {},
  resaltarGenericos: null,
  // Por qué volvió a la lista de tipos desde el filtro de los generales.
  motivoDeLosTipos: null,
  errores: {},
  // Qué preguntas respondió de verdad el comercial. Un valor por defecto NO
  // cuenta como respuesta: la pregunta se muestra igual, con la opción ya
  // marcada, para que nadie se salte una decisión sin verla.
  respondidas: {},
  ultimoTextoVistaPrevia: '',
  resultado: null,
  historial: [],
  borradorDisponible: false,
};

function entrada() {
  return estado.entrada;
}

function fijar(campo, valor) {
  estado.entrada[campo] = valor;
  guardarBorrador();
}

function fijarVarios(cambios) {
  for (var llave in cambios) {
    if (Object.prototype.hasOwnProperty.call(cambios, llave)) estado.entrada[llave] = cambios[llave];
  }
  guardarBorrador();
}

/**
 * Deja el formulario como nuevo.
 *
 * OJO: esto NO guarda el borrador. Si lo guardara, arrancar la aplicación
 * pisaría el borrador de la sesión anterior antes de que la pantalla de inicio
 * alcanzara a leerlo, y la función de no perder lo escrito no serviría de nada.
 * El borrador se guarda cuando el comercial responde algo, que es cuando hay
 * algo que perder.
 */
function reiniciarFormulario(base, yaRespondidas) {
  estado.entrada = base || {};
  estado.respondidas = yaRespondidas || {};
  estado.pasoActual = 0;
  estado.campoAbierto = null;
  estado.errores = {};
  estado.filtroRespondido = false;
  estado.filtroDeTravelRespondido = false;
  estado.motivoDeLegal = null;
  estado.volverDeLegal = null;
  estado.tycGenericoElegido = null;
  estado.filtroDeGenerales = {};
  estado.resaltarGenericos = null;
  estado.motivoDeLosTipos = null;
  estado.resultado = null;
  estado.ultimoTextoVistaPrevia = '';
}

// --- Borrador ---------------------------------------------------------------

function almacenamientoDisponible() {
  try {
    var prueba = '__rm__';
    window.localStorage.setItem(prueba, '1');
    window.localStorage.removeItem(prueba);
    return true;
  } catch (error) {
    return false;
  }
}

function guardarBorrador() {
  if (!almacenamientoDisponible()) return false;
  try {
    window.localStorage.setItem(LLAVE_BORRADOR, JSON.stringify({
      version: VERSION_BORRADOR,
      guardado: new Date().toISOString(),
      entrada: estado.entrada,
      respondidas: estado.respondidas,
      pasoActual: estado.pasoActual,
    }));
    return true;
  } catch (error) {
    // Almacenamiento lleno o bloqueado. No se avisa en cada tecla: se sigue.
    return false;
  }
}

function leerBorrador() {
  if (!almacenamientoDisponible()) return null;
  try {
    var crudo = window.localStorage.getItem(LLAVE_BORRADOR);
    if (!crudo) return null;

    var guardado = JSON.parse(crudo);
    if (!guardado || guardado.version !== VERSION_BORRADOR) {
      borrarBorrador();
      return null;
    }
    if (!guardado.entrada || !guardado.entrada.tipo) return null;
    return guardado;
  } catch (error) {
    borrarBorrador();
    return null;
  }
}

function borrarBorrador() {
  try {
    window.localStorage.removeItem(LLAVE_BORRADOR);
  } catch (error) {
    // Nada que hacer.
  }
}

/* --- El idioma de la interfaz ---------------------------------------------
 *
 * No es el idioma del documento. El documento sale en el idioma del pais y eso
 * no se elige, porque dejarlo elegir seria dejar publicar un T&C brasileno en
 * espanol. Esto es otra cosa: en que idioma lee el formulario quien lo llena.
 *
 * Es una preferencia de esa persona, asi que vive en su navegador. Si el
 * navegador no deja guardar, se pierde al recargar y no pasa nada mas.
 */
var LLAVE_IDIOMA = 'rappimind.idioma';

function idiomaInterfaz() {
  if (estado.idiomaInterfaz) return estado.idiomaInterfaz;
  try {
    var guardado = window.localStorage.getItem(LLAVE_IDIOMA);
    if (guardado === 'pt' || guardado === 'es') { estado.idiomaInterfaz = guardado; return guardado; }
  } catch (error) { /* sin almacenamiento, se queda en espanol */ }
  estado.idiomaInterfaz = 'es';
  return 'es';
}

function fijarIdiomaInterfaz(codigo) {
  estado.idiomaInterfaz = codigo === 'pt' ? 'pt' : 'es';
  try {
    window.localStorage.setItem(LLAVE_IDIOMA, estado.idiomaInterfaz);
  } catch (error) { /* sin almacenamiento, dura lo que dure la pestana */ }
  return estado.idiomaInterfaz;
}

/** Traduce un texto de la interfaz al idioma elegido. */
function T(texto) {
  return traducirInterfaz(texto, idiomaInterfaz());
}

/**
 * El nombre de un pais como se lee en la pantalla.
 *
 * Aparte de T() porque no sale del diccionario de la interfaz: el nombre viene
 * de la fila del pais y en el documento se imprime siempre en espanol. Lo que
 * cambia es solo lo que se ve. Punto F2.
 */
function nombreDePais(nombre) {
  return nombreDePaisEnIdioma(nombre, idiomaInterfaz());
}

/**
 * La pregunta de un campo, en la variante del tipo de campana elegido.
 *
 * Existe porque el mecanismo de variantes estaba construido y probado en Node,
 * pero la interfaz llamaba a preguntaDe() sin el tipo, asi que nunca se veia:
 * en el cashback por ETA, que es de una sola ciudad, la pantalla seguia
 * preguntando "En que ciudades?" en plural.
 *
 * Toda pantalla que muestre el texto de una pregunta pasa por aqui.
 */
function pregunta(campoId) {
  // El tipo va dos veces a proposito: la variante en espanol y la variante en
  // el otro idioma se eligen por separado. Sin el segundo, la interfaz en
  // portugues preguntaba "em reais" para un tope en pesos.
  var texto = preguntaEnIdioma(preguntaDe(campoId, entrada().tipo), campoId, idiomaInterfaz(), entrada().tipo);
  // Y al final los datos del pais, despues de elegir idioma y variante, para
  // que "{ID_FISCAL}" se convierta en RFC o en RUT tambien cuando la interfaz
  // esta en portugues. Sin esto la pregunta del Organizador decia "NIT" en los
  // nueve paises.
  return conDatosDelPais(texto, paisDeLaEntrada());
}

/** La fila del pais elegido, o null mientras todavia no hay pais. */
function paisDeLaEntrada() {
  if (!estado.configuracion || !estado.configuracion.paises) return null;
  return paisPorCodigo(estado.configuracion.paises, entrada().pais);
}

RM.estado = {
  estado: estado,
  pregunta: pregunta,
  paisDeLaEntrada: paisDeLaEntrada,
  T: T,
  nombreDePais: nombreDePais,
  idiomaInterfaz: idiomaInterfaz,
  fijarIdiomaInterfaz: fijarIdiomaInterfaz,
  entrada: entrada,
  fijar: fijar,
  fijarVarios: fijarVarios,
  reiniciarFormulario: reiniciarFormulario,
  guardarBorrador: guardarBorrador,
  leerBorrador: leerBorrador,
  borrarBorrador: borrarBorrador,
  almacenamientoDisponible: almacenamientoDisponible,
};
