'use strict';

/**
 * Los textos del Descuento y del Cupon.
 *
 * Vive aparte de derivados.js por la misma razon que Travel y Brasil: son dos
 * modelos nuevos, habilitados fuera de Colombia, y una campana de Mexico no
 * puede mover una frase que Legal CO ya tiene aprobada para el Cashback.
 *
 * Los dos tipos comparten casi todo. Lo unico que el Cupon tiene y el Descuento
 * no es la clausula de activacion: el descuento se aplica solo, el cupon lo
 * activa el Usuario/Consumidor.
 *
 * Marca ORACION: devuelve oracion completa (mayuscula inicial y punto final).
 * Marca FRAGMENTO: se inserta dentro de otra frase (sin mayuscula ni punto).
 */

/* En Node las dependencias se cargan con require; en Apps Script ya son globales. */
if (typeof module !== 'undefined' && typeof require === 'function') {
  var moduloNumerosDescuento = require('./numeros.js');
  var montoConMoneda = moduloNumerosDescuento.montoConMoneda;
  var porcentajeEnLetras = moduloNumerosDescuento.porcentajeEnLetras;
  var letrasYCifra = moduloNumerosDescuento.letrasYCifra;
  var formatearMiles = moduloNumerosDescuento.formatearMiles;

  var tieneValor = require('./texto.js').tieneValor;
}

/**
 * Las cinco formas que puede tomar el beneficio.
 *
 * Las dos primeras rebajan el precio de los productos; las tres ultimas quitan
 * un cargo del pedido. La distincion no es de forma: decide sobre que se
 * calcula el beneficio, y por eso cada una trae su propia frase de base de
 * calculo. Un documento que diga "sin incluir el costo de envio" en una campana
 * cuyo beneficio es justamente el envio se contradice solo.
 *
 * Las tres ultimas son las mismas que Legal Brasil tiene aprobadas en los
 * cuatro T&C de septiembre de 2026 (frete gratis, taxa de servico, las dos
 * juntas). Aqui van en espanol porque es el mismo caso de negocio.
 */
var FORMAS_DEL_DESCUENTO = [
  { valor: 'porcentaje', llevaPorcentaje: true, llevaTope: true },
  // Con monto fijo el tope ya es el monto, y la tarifa de servicio no lleva
  // tope en ninguno de los documentos aprobados. El envio si: es el caso que
  // Legal Brasil ya tiene escrito ("o frete gratis esta limitado a R$20,00").
  { valor: 'monto', llevaMonto: true, llevaTope: false },
  { valor: 'envio', llevaTope: true, esDeCargo: true },
  { valor: 'tarifa_servicio', llevaTope: false },
  { valor: 'envio_y_tarifa', llevaTope: true, esDeCargo: true },
];

function formaDelDescuento(valor) {
  for (var i = 0; i < FORMAS_DEL_DESCUENTO.length; i++) {
    if (FORMAS_DEL_DESCUENTO[i].valor === valor) return FORMAS_DEL_DESCUENTO[i];
  }
  return null;
}

/** Si esta forma del beneficio admite un tope por pedido. */
function admiteTopeDeDescuento(entrada) {
  var forma = formaDelDescuento(entrada.formaDelDescuento);
  return !!forma && !!forma.llevaTope;
}

/*
 * La base de calculo, una por forma del beneficio.
 *
 * Sale de la clausula de mecanica de modelos/cashback.md ("El valor sobre el
 * cual se calcula el Beneficio corresponde exclusivamente al precio de los
 * productos adquiridos, sin incluir el costo de envio, la tarifa de servicio ni
 * las propinas"), dicha para cada una de las cinco formas.
 */
var TEXTO_BASE_POR_FORMA = {
  porcentaje: 'El Beneficio se calcula exclusivamente sobre el precio de los Productos Participantes, sin incluir el costo de envío, la tarifa de servicio ni las propinas.',
  monto: 'El Beneficio se calcula exclusivamente sobre el precio de los Productos Participantes, sin incluir el costo de envío, la tarifa de servicio ni las propinas.',
  envio: 'El Beneficio cubre únicamente el costo de envío del pedido; el precio de los productos, la tarifa de servicio y las propinas se pagan íntegramente.',
  tarifa_servicio: 'El Beneficio cubre únicamente la tarifa de servicio del pedido; el precio de los productos, el costo de envío y las propinas se pagan íntegramente.',
  envio_y_tarifa: 'El Beneficio cubre únicamente el costo de envío y la tarifa de servicio del pedido; el precio de los productos y las propinas se pagan íntegramente.',
};

/** FRAGMENTO: en que consiste el Beneficio. Cierra la frase "El Beneficio consiste en ...". */
function textoBeneficioDescuento(entrada, pais) {
  var forma = formaDelDescuento(entrada.formaDelDescuento);
  if (!forma) return '';

  if (forma.valor === 'porcentaje') {
    if (!tieneValor(entrada.porcentaje)) return '';
    return 'un descuento del **' + porcentajeEnLetras(entrada.porcentaje) +
      '** sobre el precio de los Productos Participantes';
  }
  if (forma.valor === 'monto') {
    if (!tieneValor(entrada.montoDescuento)) return '';
    return 'un descuento de **' + montoConMoneda(entrada.montoDescuento, pais) +
      '** sobre el precio de los Productos Participantes';
  }
  if (forma.valor === 'envio') return 'la exoneración del costo de envío del pedido';
  if (forma.valor === 'tarifa_servicio') return 'la exoneración de la tarifa de servicio del pedido';
  return 'la exoneración del costo de envío y de la tarifa de servicio del pedido';
}

/** ORACION: sobre que se calcula el Beneficio. */
function textoBaseDescuento(entrada) {
  return TEXTO_BASE_POR_FORMA[entrada.formaDelDescuento] || '';
}

/**
 * ORACION: que productos participan.
 *
 * Mismo reparto que en la Carrera de Compras (todos, los de una marca o una
 * lista con codigo de barras), porque el problema es el mismo: si el documento
 * no dice cuales son los Productos Participantes, el usuario reclama el
 * descuento sobre cualquier cosa del catalogo.
 */
function textoProductosDescuento(entrada) {
  if (entrada.productos === 'todos') {
    return 'La Campaña aplica para todos los productos del catálogo de la Tienda Participante en la Plataforma Rappi (en adelante, los “Productos Participantes”).';
  }
  if (entrada.productos === 'marca') {
    var marca = String(entrada.makerMarca || '').trim();
    if (!marca) return '';
    return 'La Campaña aplica únicamente para los productos de la marca ' + marca +
      ' disponibles en la Tienda Participante a través de la Plataforma Rappi (en adelante, los “Productos Participantes”).';
  }
  if (entrada.productos !== 'especificos') return '';

  /*
   * Con nombre y codigo de barras, igual que en la Carrera. Va en vinnetas y no
   * en tabla: el sitio donde se publica no muestra tablas (regla 5).
   */
  var productos = entrada.productosDetalle || [];
  if (productos.length === 0) return '';

  var lineas = ['La Campaña aplica únicamente para los siguientes productos de la Tienda Participante, ' +
    'identificados con su nombre y su código de barras EAN (en adelante, los “Productos Participantes”):'];
  for (var i = 0; i < productos.length; i++) {
    var nombre = String((productos[i] || {}).nombre || '').trim();
    var ean = String((productos[i] || {}).ean || '').replace(/\D/g, '');
    // Un producto a medias deja la vinneta rota: mejor un hueco entero, que el
    // motor anuncia, que una lista con una linea sin nombre o sin EAN.
    if (!nombre || !ean) return '';
    lineas.push('• ' + nombre + ' (EAN ' + ean + ')');
  }
  lineas.push('Solo dan derecho al Beneficio las unidades cuyo código EAN coincida con alguno de los anteriores.');
  return lineas.join('\n');
}

/**
 * ORACION, opcional: el tope por pedido, dentro de su vinneta.
 *
 * Cuando el Beneficio es un cargo del pedido (el envio, o el envio y la tarifa)
 * la frase dice ademas quien paga lo que pase del tope. Sin eso, un usuario con
 * un envio de mas que el tope podria entender que la campana se lo cubre entero
 * o que no le cubre nada. Es la misma aclaracion del documento aprobado de
 * Frete Gratis de Brasil, en espanol.
 */
function textoTopeDescuento(entrada, pais) {
  var forma = formaDelDescuento(entrada.formaDelDescuento);
  if (!forma || !forma.llevaTope || !tieneValor(entrada.tope)) return '';

  var frase = 'el Beneficio máximo por cada pedido es de **' + montoConMoneda(entrada.tope, pais) + '**';
  if (forma.esDeCargo) {
    return frase + '; el valor que exceda ese monto lo asume el Usuario/Consumidor.';
  }
  return frase + '.';
}

/**
 * "mil (1.000)": las letras y la cifra, con el separador de miles del pais.
 *
 * letrasYCifra() escribe la cifra sin separador, que es lo correcto para un
 * numero pequeno ("un (1) pedido", "veintiun (21) participantes"). Aqui las
 * unidades de una campana llegan a cinco cifras, y "(25000)" al lado de un
 * "$25.000" del mismo documento se lee como un descuido.
 */
function unidadesEnLetras(cantidad, pais) {
  var letras = letrasYCifra(cantidad);
  return letras.replace(/\((\d+)\)$/, function (todo, cifra) {
    return '(' + formatearMiles(cifra, pais.separador_miles) + ')';
  });
}

/** FRAGMENTO, opcional: que se agota antes de la fecha de fin. */
function textoAgotamiento(entrada) {
  if (entrada.agotamiento === 'presupuesto') return 'el presupuesto disponible';
  if (entrada.agotamiento === 'unidades') return 'las unidades disponibles';
  return '';
}

/** ORACION, opcional: el limite de la Campana, dentro de su vinneta. */
function textoLimiteCampana(entrada, pais) {
  if (entrada.agotamiento === 'presupuesto') {
    if (!tieneValor(entrada.presupuesto)) return '';
    return 'la Campaña tiene un presupuesto total de **' + montoConMoneda(entrada.presupuesto, pais) +
      '**. Una vez agotado, la Campaña finalizará automáticamente, aunque no haya terminado su vigencia.';
  }
  if (entrada.agotamiento === 'unidades') {
    var unidades = Math.trunc(Number(entrada.unidadesDisponibles));
    if (!isFinite(unidades) || unidades < 1) return '';
    // "un (1) pedidos con Beneficio" se lee como un descuido en un documento
    // que se publica; con uno solo la frase va entera en singular.
    var sustantivo = unidades === 1 ? 'pedido con Beneficio' : 'pedidos con Beneficio';
    var verbo = unidades === 1 ? 'Una vez agotado' : 'Una vez agotados';
    return 'la Campaña cuenta con **' + unidadesEnLetras(unidades, pais) + '** ' + sustantivo +
      '. ' + verbo + ', la Campaña finalizará automáticamente, aunque no haya terminado su vigencia.';
  }
  return '';
}

/**
 * ORACION: como se activa el cupon.
 *
 * Dos formas reales: un codigo que el usuario escribe, y el cupon que toma
 * desde la seccion "Cupones" de la aplicacion. La diferencia importa porque el
 * documento tiene que decir exactamente que hay que hacer: un usuario que no
 * activo el cupon no recibe el Beneficio y reclama con el T&C en la mano.
 */
function textoActivacionCupon(entrada) {
  if (entrada.activacionCupon === 'codigo') {
    var codigo = codigoDeCupon(entrada);
    if (!codigo) return '';
    return 'Para acceder al Beneficio debes ingresar el código **' + codigo +
      '** en la sección “Cupones” de la Plataforma Rappi antes de confirmar el pedido.';
  }
  if (entrada.activacionCupon === 'seccion') {
    return 'Para acceder al Beneficio debes activar el cupón de la Campaña en la sección “Cupones” ' +
      'de la Plataforma Rappi antes de confirmar el pedido.';
  }
  return '';
}

/**
 * FRAGMENTO, opcional: hasta cuando dura el cupon, aparte de la fecha.
 *
 * Solo cuando la campana tiene con que acabarse antes. Sin esto, un cupon que
 * termina en la fecha de fin decia "mientras queden unidades disponibles" sin
 * que hubiera ninguna unidad declarada en el documento, y esa frase publicada
 * deja discutir cuando se acabo la campana.
 */
function textoMientrasQuede(entrada) {
  if (entrada.agotamiento === 'unidades') return 'y mientras queden unidades disponibles';
  if (entrada.agotamiento === 'presupuesto') return 'y mientras haya presupuesto disponible';
  return '';
}

/**
 * El codigo del cupon, en mayusculas y sin espacios.
 *
 * Va impreso, asi que se normaliza aqui y no en la pantalla: un codigo escrito
 * "jumbo 30" y otro "JUMBO30" son el mismo en la aplicacion y tienen que salir
 * iguales en el documento.
 */
function codigoDeCupon(entrada) {
  return String(entrada.codigoCupon || '').trim().toUpperCase().replace(/\s+/g, '');
}

/** Todos los valores del Descuento y del Cupon. Se agregan encima de los comunes. */
function calcularDerivadosDescuento(entrada, pais) {
  var valores = {
    TEXTO_PRODUCTOS_DESCUENTO: textoProductosDescuento(entrada),
    TEXTO_BENEFICIO_DESCUENTO: textoBeneficioDescuento(entrada, pais),
    TEXTO_BASE_DESCUENTO: textoBaseDescuento(entrada),
    TEXTO_TOPE_DESCUENTO: textoTopeDescuento(entrada, pais),
    TEXTO_AGOTAMIENTO: textoAgotamiento(entrada),
    TEXTO_LIMITE_CAMPANA: textoLimiteCampana(entrada, pais),
  };

  if (entrada.tipo === 'cupon') {
    valores.TEXTO_ACTIVACION_CUPON = textoActivacionCupon(entrada);
    valores.TEXTO_MIENTRAS_QUEDE = textoMientrasQuede(entrada);
    valores.CODIGO_CUPON = codigoDeCupon(entrada);
  }
  return valores;
}

if (typeof module !== 'undefined') {
  module.exports = {
    FORMAS_DEL_DESCUENTO: FORMAS_DEL_DESCUENTO,
    formaDelDescuento: formaDelDescuento,
    admiteTopeDeDescuento: admiteTopeDeDescuento,
    textoProductosDescuento: textoProductosDescuento,
    textoBeneficioDescuento: textoBeneficioDescuento,
    textoLimiteCampana: textoLimiteCampana,
    unidadesEnLetras: unidadesEnLetras,
    textoActivacionCupon: textoActivacionCupon,
    textoMientrasQuede: textoMientrasQuede,
    codigoDeCupon: codigoDeCupon,
    calcularDerivadosDescuento: calcularDerivadosDescuento,
  };
}
