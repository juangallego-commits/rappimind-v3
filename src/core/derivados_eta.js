'use strict';

/**
 * Los textos del cashback por incumplimiento del ETA.
 *
 * Base: los T&C publicados de Bogota (16/09/2026) y Barranquilla (1/09/2026).
 * Son el mismo documento con la ciudad, la fecha, las horas y el presupuesto
 * cambiados.
 *
 * Lo que este tipo tiene de distinto: el beneficio no se gana comprando, se
 * gana cuando Rappi no cumple el tiempo que prometio. Por eso no hay aliado que
 * fondee ni tienda unica, y por eso el documento habla de todas las tiendas
 * Turbo de una ciudad.
 *
 * Las mejoras frente a los documentos publicados estan en docs/MEJORAS_ETA.md.
 */

/* En Node las dependencias se cargan con require; en Apps Script ya son globales. */
if (typeof module !== 'undefined' && typeof require === 'function') {
  var moduloNumeros = require('./numeros.js');
  var letrasYCifra = moduloNumeros.letrasYCifra;
  var letrasYCifraFemenino = moduloNumeros.letrasYCifraFemenino;
  var cantidadCreditos = moduloNumeros.cantidadCreditos;

  var listaY = require('./fechas.js').listaY;
  var tieneValor = require('./texto.js').tieneValor;
}

/** La modalidad del boton Turbo. Los dos documentos publicados usan esta. */
var MODALIDAD_TURBO_POR_DEFECTO = 'Turbo Restaurantes';

/**
 * Las secciones que se pueden excluir de la redencion, con su nombre impreso.
 *
 * Empezaron siendo solo del ETA y desde el 20 de septiembre de 2026 (punto D5)
 * las usa tambien el Cashback cuando los Creditos se pueden gastar en cualquier
 * parte de Rappi. El nombre de la llave se queda por la frontera del Sheet: la
 * columna exclusiones_eta ya existe y mover una columna desalinea el historico.
 *
 * "RappiFavor" va junto, que es como lo escriben los T&C publicados de Rappi en
 * Colombia, Ecuador y Costa Rica.
 *
 * El SOAT es colombiano, asi que fuera de Colombia no se ofrece ni se imprime.
 */
var SECCIONES_EXCLUIBLES_ETA = [
  { valor: 'travel', nombre: 'Rappi Travel', nota: 'Vuelos, hoteles, autos y paquetes.' },
  { valor: 'soat', nombre: 'SOAT', soloEn: 'CO', nota: 'El seguro obligatorio de vehículos.' },
  { valor: 'atm', nombre: 'Cajero ATM', nota: 'El retiro de efectivo.' },
  { valor: 'favor', nombre: 'RappiFavor', nota: 'Los mandados y diligencias.' },
];

/** Las que se pueden ofrecer e imprimir en este pais. */
function seccionesExcluiblesDe(codigoPais) {
  var lista = [];
  for (var i = 0; i < SECCIONES_EXCLUIBLES_ETA.length; i++) {
    var seccion = SECCIONES_EXCLUIBLES_ETA[i];
    if (seccion.soloEn && seccion.soloEn !== codigoPais) continue;
    lista.push(seccion);
  }
  return lista;
}

/**
 * FRAGMENTO: las secciones excluidas, entrecomilladas y en orden.
 *
 * "las secciones “Rappi Travel”, “SOAT”, “Cajero ATM” y “RappiFavor”". Con una
 * sola marcada concuerda en singular: "la seccion “SOAT”".
 */
function textoSeccionesExcluidas(elegidas, codigoPais) {
  var disponibles = seccionesExcluiblesDe(codigoPais);
  var marcadas = elegidas || [];
  var entrecomilladas = [];
  for (var i = 0; i < disponibles.length; i++) {
    for (var e = 0; e < marcadas.length; e++) {
      if (marcadas[e] === disponibles[i].valor) {
        entrecomilladas.push('“' + disponibles[i].nombre + '”');
        break;
      }
    }
  }
  if (entrecomilladas.length === 0) return '';
  var articulo = entrecomilladas.length === 1 ? 'la sección ' : 'las secciones ';
  return articulo + listaY(entrecomilladas);
}

/**
 * FRAGMENTO: el tiempo prometido, en letras y cifra.
 * "quince (15) minutos". Un minuto concuerda en singular.
 */
function textoEta(entrada) {
  if (!tieneValor(entrada.etaMinutos)) return '';
  var minutos = Math.trunc(Number(entrada.etaMinutos));
  return letrasYCifra(minutos) + (minutos === 1 ? ' minuto' : ' minutos');
}

/** FRAGMENTO: la ciudad, como va dentro de la frase del territorio. */
function textoCiudadEta(entrada) {
  var ciudad = String(entrada.ciudades || '').trim();
  return ciudad ? 'la ciudad de ' + ciudad : '';
}

/**
 * ORACION mas vinnetas: las tiendas de Turbo que participan, una por una.
 *
 * Antes la clausula decia "todas las tiendas virtuales bajo la modalidad
 * “Turbo Restaurantes” … habilitadas en la ciudad de Bogota", y despues que el
 * listado seria "el que se encuentre visible y disponible … al momento de
 * realizar la orden". Juan corrigio que Turbo no es una modalidad: son tiendas
 * por zona, con nombre propio (Turbo Calleja, Turbo Chico, Turbo Laureles), y
 * el 21 de septiembre de 2026 (punto D1) eligio que el documento las liste.
 *
 * Por eso la segunda frase ya no puede decir quien participa: dos frases que
 * dicen cosas distintas sobre eso es lo que un usuario lee a su favor. Se queda
 * hablando solo de disponibilidad.
 *
 * Una tienda sin nombre deja la vinneta rota, asi que se devuelve vacio entero
 * y el motor anuncia el hueco, igual que en la lista de productos de la
 * Carrera.
 */
function textoTiendasEta(entrada) {
  var tiendas = entrada.tiendasEta || [];
  var ciudad = textoCiudadEta(entrada);
  if (tiendas.length === 0 || !ciudad) return '';

  var lineas = ['Participarán únicamente las siguientes tiendas virtuales del botón “Turbo” ' +
    'al interior de la Plataforma Rappi, habilitadas en ' + ciudad + ' durante la vigencia de la Campaña:'];
  for (var i = 0; i < tiendas.length; i++) {
    var nombre = String((tiendas[i] || {}).nombre || '').trim();
    if (!nombre) return '';
    lineas.push('• ' + nombre);
  }
  lineas.push('La disponibilidad de cada Tienda Participante podrá variar en función de la ' +
    'operación de cada Aliado Comercial.');
  return lineas.join('\n');
}

/**
 * ORACION: el maximo de ordenes por persona.
 *
 * Va en femenino porque en este modelo se cuentan ordenes, no pedidos:
 * "una (1) orden", "doscientas (200) ordenes".
 */
function textoLimiteOrdenes(entrada) {
  if (entrada.sinLimite) {
    return 'No hay límite de órdenes por Usuario/Consumidor durante la vigencia de la Campaña.';
  }
  if (!tieneValor(entrada.maxPedidos)) return '';

  var cantidad = Math.trunc(Number(entrada.maxPedidos));
  var sustantivo = cantidad === 1 ? 'orden' : 'órdenes';
  return 'Máximo ' + letrasYCifraFemenino(cantidad) + ' ' + sustantivo +
    ' por Usuario/Consumidor durante toda la vigencia de la Campaña.';
}

/**
 * ORACION: donde se pueden redimir los Creditos.
 *
 * Sin exclusiones la frase no puede quedar con un "a excepcion de" colgando, asi
 * que se dice entera de otra forma.
 */
function textoRedencionEta(entrada, pais) {
  var base = 'Se aclara que los Créditos otorgados podrán ser utilizados o redimidos en cualquier sección de la Plataforma Rappi';
  var excluidas = textoSeccionesExcluidas(entrada.exclusionesEta, pais ? pais.codigo : 'CO');
  if (!excluidas) return base + '.';
  return base + ', a excepción de ' + excluidas + '.';
}

/**
 * El presupuesto de este modelo, en letras y cifra.
 *
 * Los documentos publicados lo escribian solo en cifra ("37.000.000 de
 * Creditos"), mientras que el resto de numeros del mismo documento si van en
 * letras y cifra. Uno de los dos llego a decir "95.087.585,10 de Creditos", con
 * decimales, que para unos puntos que no se fraccionan no tiene sentido.
 * Ver docs/MEJORAS_ETA.md.
 */
function presupuestoEta(entrada, pais) {
  if (!tieneValor(entrada.presupuesto)) return '';
  return cantidadCreditos(Math.trunc(Number(entrada.presupuesto)), pais);
}

/** Todos los valores del modelo del ETA. Se agregan encima de los comunes. */
function calcularDerivadosEta(entrada, pais) {
  return {
    TEXTO_ETA: textoEta(entrada),
    TEXTO_CIUDAD_ETA: textoCiudadEta(entrada),
    TEXTO_TIENDAS_ETA: textoTiendasEta(entrada),
    TEXTO_LIMITE_ORDENES: textoLimiteOrdenes(entrada),
    // Va dentro de la clausula de vigencia y redencion de Creditos, que es
    // donde la ponen los demas modelos. En los documentos publicados estaba
    // suelta entre las restricciones. Ver docs/MEJORAS_ETA.md.
    TEXTO_LUGAR_REDENCION: textoRedencionEta(entrada, pais),
    MODALIDAD_TURBO: MODALIDAD_TURBO_POR_DEFECTO,
    PRESUPUESTO: presupuestoEta(entrada, pais),
  };
}

if (typeof module !== 'undefined') {
  module.exports = {
    MODALIDAD_TURBO_POR_DEFECTO: MODALIDAD_TURBO_POR_DEFECTO,
    SECCIONES_EXCLUIBLES_ETA: SECCIONES_EXCLUIBLES_ETA,
    seccionesExcluiblesDe: seccionesExcluiblesDe,
    textoSeccionesExcluidas: textoSeccionesExcluidas,
    textoTiendasEta: textoTiendasEta,
    calcularDerivadosEta: calcularDerivadosEta,
  };
}
