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

  var moduloDeLeyendas = require('./leyendas.js');
  var cargarCatalogo = moduloDeLeyendas.cargarCatalogo;
  var leyendasDeLaPieza = moduloDeLeyendas.leyendasDeLaPieza;
  var armarLeyenda = moduloDeLeyendas.armarLeyenda;
  var comoLeyendas = moduloDeLeyendas.comoLeyendas;
  var moduloDerivadosLeyendas = require('./derivados_leyendas.js');
  var calcularDerivadosDeLeyendas = moduloDerivadosLeyendas.calcularDerivadosDeLeyendas;
  var calcularDerivados = require('./derivados.js').calcularDerivados;
  var conElIdiomaDe = require('./idiomas.js').conElIdiomaDe;
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

/*
 * La letra pequeña de una pieza cuando el T&C es uno de los generales.
 *
 * Legal escribió tres leyendas para este camino (la letra pequeña, el
 * complemento de la membresía Pro y la del push) y las marcó con el tipo de
 * campaña `descuento_tyc_general`. Ese tipo no es ninguno de ESQUEMAS, a
 * propósito: aquí no se genera documento. Pero es un tipo de LEYENDA, y por eso
 * el catálogo lo nombra.
 *
 * Durante un tiempo las tres estuvieron escritas, aprobadas y muertas: este
 * camino no llamaba nunca al motor de leyendas, así que el comercial se llevaba
 * el enlace y tenía que escribir la letra pequeña de memoria.
 */
var TIPO_DE_LEYENDA_GENERAL = 'descuento_tyc_general';

/*
 * Los T&C generales a los que NO se les puede poner esta letra pequeña.
 *
 * La leyenda dice "El descuento no incluye tarifa de servicio y costo de
 * envío", y esa frase es obligatoria: no va entre corchetes. En una campaña de
 * Envío Gratis o de Tarifa de Servicio Gratis, la pieza le estaría negando al
 * usuario justo lo que la campaña le promete. Y en las dos de la membresía, el
 * descuento es sobre el valor de la suscripción, donde no hay ni envío ni
 * tarifa de servicio de los que hablar.
 *
 * En esos cuatro casos no se ofrece nada y se dice por qué, en vez de armar una
 * leyenda que se contradice. Anotado en docs/PENDIENTES_LEGAL.md por si Legal
 * quiere escribir una para ellos.
 */
var SIN_LETRA_PEQUENA = {
  envio_gratis: 'La leyenda aprobada dice que el descuento no incluye el costo de envío, y esta campaña regala justo el envío. Puesta en la pieza, le estaría quitando al usuario lo que la campaña le promete.',
  tarifa_servicio_gratis: 'La leyenda aprobada dice que el descuento no incluye la tarifa de servicio, y esta campaña regala justo esa tarifa. Puesta en la pieza, se contradiría sola.',
  descuento_membresia_pro: 'Aquí el descuento es sobre el valor de la suscripción, no sobre un pedido, así que la leyenda de descuentos hablaría de envíos y tarifas que en esta campaña no existen. En su lugar sale el texto de la membresía, que es el que Legal aprobó para estas piezas.',
  cupones_membresia_pro_black: 'Aquí el descuento es sobre el valor de la suscripción, no sobre un pedido, así que la leyenda de descuentos hablaría de envíos y tarifas que en esta campaña no existen. En su lugar sale el texto de la membresía, que es el que Legal aprobó para estas piezas.',
  codigo_descuento_eventos_externos: 'El descuento se da por fuera de Rappi, en el canal del externo, así que la leyenda de descuentos de la plataforma no describe esta campaña.',
};

/*
 * Los T&C generales cuya campana es SOBRE la membresia Pro.
 *
 * No llevan la letra pequena de descuentos, pero si el texto de la membresia,
 * que es justo el que explica que incluye: leyenda_membresia_pro_co. Es la
 * pieza que le habla a quien va a comprarla.
 */
var SOBRE_LA_MEMBRESIA_PRO = ['descuento_membresia_pro', 'cupones_membresia_pro_black'];

function esSobreLaMembresiaPro(tyc) {
  return SOBRE_LA_MEMBRESIA_PRO.indexOf(String((tyc && tyc.id) || '')) !== -1;
}

/** El complemento ya elegido, armado solo, para entregarlo como la pieza. */
function textoDelComplemento(catalogo, ids, pais) {
  if (!ids || ids.length === 0) return null;
  var leyendas = comoLeyendas(catalogo);
  for (var i = 0; i < leyendas.length; i++) {
    if (leyendas[i].id !== ids[0]) continue;
    var armada = armarLeyenda(leyendas[i], { URL_TC_PRO: (pais && pais.url_tc_pro) || '' });
    armada.formato = 'letra_pequena';
    armada.nombre = 'Texto de la membresía';
    return armada;
  }
  return null;
}

/** Si a este T&C general se le puede armar la letra pequeña, y por qué no. */
function sirveLaLetraPequena(tyc) {
  var id = String((tyc && tyc.id) || '');
  if (!id) return { sirve: false, porQue: 'Elige primero cuál de los T&C generales usa tu campaña.' };
  if (SIN_LETRA_PEQUENA[id]) return { sirve: false, porQue: SIN_LETRA_PEQUENA[id] };
  return { sirve: true, porQue: '' };
}

/**
 * Arma las leyendas de una campaña que usa un T&C general.
 *
 * tyc      la fila de data/tyc_genericos.json que eligió el comercial
 * datos    { fechaInicio, fechaFin, unidadesDisponibles, maxPorUsuario,
 *            rangoEn, rangoDesde, rangoHasta, soloPro, esDeTurbo, compraMinima }
 * pais     la fila del país
 * textos   el catálogo de modelos/leyendas/ (en Apps Script, LEYENDAS)
 *
 * Devuelve { hay, leyendas, complementos, faltan, porQue, errores }. Si falta
 * la vigencia no se arma nada: media leyenda es peor que ninguna, porque el
 * comercial la copiaría igual.
 */
function leyendasDelTycGeneral(tyc, datos, pais, textos) {
  var entrada = datos || {};
  var revision = sirveLaLetraPequena(tyc);

  // Una campana sobre la membresia no lleva la letra pequena de descuentos,
  // pero si el texto de la membresia: se arma igual, por ese camino.
  if (!revision.sirve && !esSobreLaMembresiaPro(tyc)) {
    return { hay: false, leyendas: [], complementos: [], faltan: [], porQue: revision.porQue, errores: [] };
  }
  // El texto de la membresia no habla de fechas, asi que no las pide. La letra
  // pequena de descuentos si: "Valido ..." es una de sus frases obligatorias.
  var faltan = [];
  if (!esSobreLaMembresiaPro(tyc) && !entrada.fechaInicio) faltan.push('desde cuándo vale la campaña');
  if (faltan.length > 0) {
    return { hay: false, leyendas: [], complementos: [], faltan: faltan, porQue: '', errores: [] };
  }

  /*
   * Se arma una entrada como la de cualquier campaña y se usa el mismo motor.
   * El segmento "pro" es el que ya produce la frase de la membresía activa, así
   * que la casilla de Pro enciende las dos cosas: esa frase y el complemento.
   */
  var comoCampana = {
    tipo: TIPO_DE_LEYENDA_GENERAL,
    pais: pais ? pais.codigo : '',
    fechaInicio: entrada.fechaInicio,
    fechaFin: entrada.fechaFin || entrada.fechaInicio,
    urlTycGeneral: tyc.enlace || '',
    unidadesDisponibles: entrada.unidadesDisponibles,
    maxPorUsuario: entrada.maxPorUsuario,
    rangoEn: entrada.rangoEn,
    rangoDesde: entrada.rangoDesde,
    rangoHasta: entrada.rangoHasta,
    compraMinima: entrada.compraMinima,
    segmento: entrada.soloPro ? 'pro' : '',
  };

  var sobreLaMembresia = esSobreLaMembresiaPro(tyc);

  var catalogo = cargarCatalogo(textos || {});
  var armadas = conElIdiomaDe(pais, function () {
    var valores = calcularDerivadosDeLeyendas(
      comoCampana, pais, calcularDerivados(comoCampana, pais), {}
    );
    return leyendasDeLaPieza(catalogo, pais.codigo, TIPO_DE_LEYENDA_GENERAL, valores, {
      categoria: 'ninguna',
      esDeTurbo: !!entrada.esDeTurbo,
      esDeMembresiaPro: sobreLaMembresia,
    });
  });

  // En una campana sobre la membresia, lo que se entrega es su texto, no la
  // letra pequena de descuentos, que hablaria de envios y tarifas que ahi no
  // existen. El motor ya lo puso en TEXTO_COMPLEMENTOS; aqui se entrega solo.
  var leyendas = sobreLaMembresia ? [] : armadas.leyendas;
  if (sobreLaMembresia) {
    var catalogoUsado = cargarCatalogo(textos || {});
    var soloElTexto = textoDelComplemento(catalogoUsado, armadas.complementos, pais);
    if (soloElTexto) leyendas = [soloElTexto];
  }

  return {
    hay: leyendas.length > 0,
    leyendas: leyendas,
    complementos: armadas.complementos,
    faltan: [],
    porQue: sobreLaMembresia ? revision.porQue : '',
    errores: armadas.errores,
  };
}

if (typeof module !== 'undefined') {
  module.exports = {
    TIPO_DE_LEYENDA_GENERAL: TIPO_DE_LEYENDA_GENERAL,
    sirveLaLetraPequena: sirveLaLetraPequena,
    leyendasDelTycGeneral: leyendasDelTycGeneral,
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
