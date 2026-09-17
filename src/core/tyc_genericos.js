'use strict';

/**
 * Los T&C generales que Legal ya publico.
 *
 * En Colombia hay campanas para las que NO hay que generar nada: descuentos,
 * cupones, envio gratis y tarifa de servicio gratis ya tienen T&C publicados
 * por Legal, con su enlace fijo. El comercial solo tiene que poner ese enlace
 * en la pieza.
 *
 * Es casi la mitad de la demanda real: los descuentos que no son cashback son
 * 319 de 711 promociones (docs/PENDIENTES_LEGAL.md). Hasta hoy la herramienta
 * no los cubria y esa gente terminaba escribiendole a Legal para pedir algo que
 * ya existia.
 *
 * Aqui no se redacta ni se corrige nada: los textos salen tal cual de
 * data/tyc_genericos.json, que es la transcripcion del Excel de Legal.
 *
 * En Apps Script TYC_GENERICOS es global: lo genera el build desde
 * data/tyc_genericos.json. En Node se carga el JSON directamente.
 */
if (typeof module !== 'undefined' && typeof require === 'function' && typeof TYC_GENERICOS === 'undefined') {
  var TYC_GENERICOS = require('../../data/tyc_genericos.json');
}

if (typeof module !== 'undefined' && typeof require === 'function') {
  var moduloDeFechas = require('./fechas.js');
  var formatearFecha = moduloDeFechas.formatearFecha;
  var comoNumeroFecha = moduloDeFechas.comoNumeroFecha;
}

/** Los T&C generales publicados para un pais, en el orden del Excel. */
function tycGenericosDelPais(codigoPais) {
  if (typeof TYC_GENERICOS === 'undefined' || !TYC_GENERICOS) return [];
  var porPais = TYC_GENERICOS.paises || {};
  return porPais[String(codigoPais || '').trim().toUpperCase()] || [];
}

/** Si este pais tiene algun T&C general publicado. Hoy solo Colombia. */
function hayTycGenericos(codigoPais) {
  return tycGenericosDelPais(codigoPais).length > 0;
}

/**
 * Los T&C generales que hoy se pueden usar: los vigentes.
 *
 * Catorce de los quince vencen el 31 de diciembre de 2026 y el otro el 31 de
 * octubre. Si nadie actualiza la lista, el 1 de enero de 2027 la tarjeta
 * seguia diciendo "Buena noticia: Legal ya publico los T&C" y detras habia
 * quince botones grises que no respondian al clic. Con esto, quien dibuja la
 * pantalla puede decir la verdad: que vencieron y que hay que escribirle a
 * Legal.
 */
function tycGenericosUsables(codigoPais, hoyIso) {
  var lista = tycGenericosDelPais(codigoPais);
  var usables = [];
  for (var i = 0; i < lista.length; i++) {
    if (estadoDeTycGenerico(lista[i], hoyIso).usable) usables.push(lista[i]);
  }
  return usables;
}

function hayTycGenericosUsables(codigoPais, hoyIso) {
  return tycGenericosUsables(codigoPais, hoyIso).length > 0;
}

function tycGenericoPorId(codigoPais, id) {
  var lista = tycGenericosDelPais(codigoPais);
  for (var i = 0; i < lista.length; i++) {
    if (lista[i].id === id) return lista[i];
  }
  return null;
}

/**
 * En que estado esta la vigencia de un T&C general, hoy.
 *
 * Importa porque un T&C vencido sigue estando en la lista de Legal: la Tarifa
 * de Servicio Gratis vence el 31 de octubre de 2026 y las demas el 31 de
 * diciembre. Ofrecer el enlace de uno vencido como si nada seria mandar a
 * publicar una pieza respaldada por un documento que ya no rige.
 *
 * Devuelve { estado, usable, mensaje, vigencia }. El estado es un
 * identificador interno; lo que se lee en pantalla es mensaje y vigencia.
 */
function estadoDeTycGenerico(tyc, hoyIso) {
  var inicio = comoNumeroFecha(tyc && tyc.vigenciaInicio);
  var fin = comoNumeroFecha(tyc && tyc.vigenciaFin);
  var hoy = comoNumeroFecha(hoyIso);

  var vigencia = vigenciaEnPalabras(tyc);

  // Sin fechas no se puede afirmar nada, y afirmar de menos es mejor que
  // afirmar de mas: se ofrece, pero diciendo que la vigencia no consta.
  if (inicio === null || fin === null) {
    return {
      estado: 'sin_vigencia',
      usable: true,
      vigencia: vigencia,
      mensaje: 'La lista de Legal no dice hasta cuándo rige este T&C. Confírmalo con Legal antes de publicar la pieza.',
    };
  }

  if (hoy === null) {
    return { estado: 'vigente', usable: true, vigencia: vigencia, mensaje: '' };
  }

  if (hoy < inicio) {
    return {
      estado: 'aun_no_arranca',
      usable: false,
      vigencia: vigencia,
      mensaje: 'Todavía no está vigente: arranca el ' + formatearFecha(tyc.vigenciaInicio) +
        '. Si tu campaña sale antes, escríbele a Legal.',
    };
  }

  if (hoy > fin) {
    return {
      estado: 'vencido',
      usable: false,
      vigencia: vigencia,
      mensaje: 'Venció el ' + formatearFecha(tyc.vigenciaFin) +
        '. No lo uses todavía: escríbele a Legal para que publique la versión nueva.',
    };
  }

  return { estado: 'vigente', usable: true, vigencia: vigencia, mensaje: '' };
}

/** "Del 1 de enero de 2026 al 31 de diciembre de 2026." */
function vigenciaEnPalabras(tyc) {
  var inicio = formatearFecha(tyc && tyc.vigenciaInicio);
  var fin = formatearFecha(tyc && tyc.vigenciaFin);
  if (!inicio && !fin) return 'Vigencia sin confirmar.';
  if (!fin) return 'Desde el ' + inicio + '.';
  if (!inicio) return 'Hasta el ' + fin + '.';
  return 'Del ' + inicio + ' al ' + fin + '.';
}

/**
 * Para que sirve un T&C general, en palabras.
 *
 * Dos filas del Excel de Legal llegaron sin descripcion (las de los cupones).
 * No se inventa una: se dice que falta, porque un comercial que lee una
 * descripcion inventada publica una pieza creyendo que esta cubierta.
 */
function descripcionDeTycGenerico(tyc) {
  var texto = String((tyc && tyc.paraQue) || '').trim();
  if (texto) return texto;
  return 'La lista de Legal no dice para qué sirve este T&C. Confírmalo con Legal antes de publicar la pieza.';
}

if (typeof module !== 'undefined') {
  module.exports = {
    tycGenericosDelPais: tycGenericosDelPais,
    hayTycGenericos: hayTycGenericos,
    tycGenericosUsables: tycGenericosUsables,
    hayTycGenericosUsables: hayTycGenericosUsables,
    tycGenericoPorId: tycGenericoPorId,
    estadoDeTycGenerico: estadoDeTycGenerico,
    vigenciaEnPalabras: vigenciaEnPalabras,
    descripcionDeTycGenerico: descripcionDeTycGenerico,
  };
}
