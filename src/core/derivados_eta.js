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

/** Las secciones que se pueden excluir de la redencion, con su nombre impreso. */
var SECCIONES_EXCLUIBLES_ETA = [
  { valor: 'travel', nombre: 'Rappi Travel' },
  { valor: 'soat', nombre: 'SOAT' },
  { valor: 'atm', nombre: 'Cajero ATM' },
  { valor: 'favor', nombre: 'Rappi Favor' },
];

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
function textoRedencionEta(entrada) {
  var base = 'Se aclara que los Créditos otorgados podrán ser utilizados o redimidos en cualquier sección de la Plataforma Rappi';
  var elegidas = entrada.exclusionesEta || [];
  if (elegidas.length === 0) return base + '.';

  var nombres = [];
  for (var i = 0; i < SECCIONES_EXCLUIBLES_ETA.length; i++) {
    for (var e = 0; e < elegidas.length; e++) {
      if (elegidas[e] === SECCIONES_EXCLUIBLES_ETA[i].valor) { nombres.push(SECCIONES_EXCLUIBLES_ETA[i].nombre); break; }
    }
  }
  if (nombres.length === 0) return base + '.';
  return base + ', a excepción de ' + listaY(nombres) + '.';
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
    TEXTO_LIMITE_ORDENES: textoLimiteOrdenes(entrada),
    // Va dentro de la clausula de vigencia y redencion de Creditos, que es
    // donde la ponen los demas modelos. En los documentos publicados estaba
    // suelta entre las restricciones. Ver docs/MEJORAS_ETA.md.
    TEXTO_LUGAR_REDENCION: textoRedencionEta(entrada),
    MODALIDAD_TURBO: MODALIDAD_TURBO_POR_DEFECTO,
    PRESUPUESTO: presupuestoEta(entrada, pais),
  };
}

if (typeof module !== 'undefined') {
  module.exports = {
    MODALIDAD_TURBO_POR_DEFECTO: MODALIDAD_TURBO_POR_DEFECTO,
    SECCIONES_EXCLUIBLES_ETA: SECCIONES_EXCLUIBLES_ETA,
    calcularDerivadosEta: calcularDerivadosEta,
  };
}
