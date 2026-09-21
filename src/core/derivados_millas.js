'use strict';

/**
 * Derivados de la mecanica de millas.
 *
 * Los textos salen de las dos piezas publicadas de millas y no se reescriben
 * aqui: el texto legal es de Legal (regla 3 de CLAUDE.md).
 *
 *   docs/piezas_publicadas/travel-millas-lifemiles-tours-civitatis.md
 *   docs/piezas_publicadas/rappi-millas-lifemiles-muss-tanga-turbo.md
 *
 * Cada funcion dice de que clausula de que pieza sale su texto. Lo que no sale
 * de una pieza publicada esta anotado en docs/PENDIENTES_LEGAL.md.
 *
 * Este archivo es uno solo para las dos verticales a proposito. La mecanica es
 * la misma en Rappi Travel y en la Plataforma Rappi; lo que cambia es la
 * entidad que opera el canal, las clausulas de plataforma y el reparto de
 * responsabilidad, y eso ya lo resuelve el esqueleto de cada vertical. Si un
 * texto tuviera que partirse en dos aqui, se parte por vertical con
 * `esDeTravel`, nunca por campana.
 *
 * Marca ORACION: devuelve oracion completa (mayuscula inicial y punto final).
 * Marca FRAGMENTO: se inserta dentro de otra frase (sin mayuscula ni punto).
 */

/* En Node las dependencias se cargan con require; en Apps Script ya son globales. */
if (typeof module !== 'undefined' && typeof require === 'function') {
  var moduloNumerosMillas = require('./numeros.js');
  var numeroEnLetras = moduloNumerosMillas.numeroEnLetras;
  var letrasYCifra = moduloNumerosMillas.letrasYCifra;
  var enFemenino = moduloNumerosMillas.enFemenino;
  var formatearMiles = moduloNumerosMillas.formatearMiles;
  var montoConMoneda = moduloNumerosMillas.montoConMoneda;

  var listaY = require('./fechas.js').listaY;
  var separarPorComas = require('./fechas.js').separarPorComas;

  var terminoDeDias = require('./texto.js').terminoDeDias;

  var esquemaDe = require('./esquemas.js').esquemaDe;
}

// --- Ayudas ----------------------------------------------------------------

function tieneValorMillas(valor) {
  if (valor === null || valor === undefined) return false;
  if (Object.prototype.toString.call(valor) === '[object Array]') return valor.length > 0;
  return String(valor).trim() !== '';
}

/** true si el tipo de campana es de Rappi Travel. */
function esDeTravelMillas(entrada) {
  var esquema = esquemaDe((entrada || {}).tipo);
  return !!(esquema && esquema.esDeTravel);
}

/**
 * Cantidad de Millas en letras y cifra: "cuatrocientas (400)".
 *
 * Milla es femenino, asi que va "cuatrocientas" y no "cuatrocientos", como en
 * las dos piezas publicadas. Y la cifra lleva el separador de miles del pais,
 * porque una bolsa de campana se escribe "148.000" y no "148000".
 */
function millasEnLetras(cantidad, pais) {
  var entero = Math.trunc(Number(cantidad));
  var separador = (pais && pais.separador_miles) || '.';
  return enFemenino(numeroEnLetras(entero)) + ' (' + formatearMiles(entero, separador) + ')';
}

/** "Milla" o "Millas", segun la cantidad. */
function palabraMillas(cantidad) {
  return Math.trunc(Number(cantidad)) === 1 ? 'Milla' : 'Millas';
}

/** La cantidad con su sustantivo: "cuatrocientas (400) Millas". */
function millasConSustantivo(cantidad, pais) {
  return millasEnLetras(cantidad, pais) + ' ' + palabraMillas(cantidad);
}

/** Las marcas entre comillas, con "la marca" o "las marcas" delante. */
function frasePorMarcas(marcas) {
  var entrecomilladas = [];
  for (var i = 0; i < marcas.length; i++) entrecomilladas.push('“' + marcas[i] + '”');
  var articulo = entrecomilladas.length === 1 ? 'la marca' : 'las marcas';
  return articulo + ' ' + listaY(entrecomilladas);
}

// --- Textos por opcion -----------------------------------------------------

/**
 * Las vinetas de la vinculacion al programa de lealtad.
 *
 * Las dos piezas piden cosas distintas y las dos estan publicadas: Civitatis
 * (clausula III) pide estar afiliado con cuenta activa, y la de Turbo
 * (clausula VI) pide estar enrolado dentro de la Plataforma Rappi y tener el
 * programa seleccionado como preferido de acumulacion. La pregunta deja elegir
 * cual, sin inventar una tercera.
 */
function textoVinculacionMillas(entrada) {
  var programa = String(entrada.programaLealtad || '').trim();
  if (!programa) return '';

  if (entrada.vinculacionPrograma === 'afiliado') {
    return '• Encontrarse afiliado y tener una cuenta activa en el programa de lealtad **' + programa + '**.';
  }
  if (entrada.vinculacionPrograma === 'enrolado_preferido') {
    return (
      '• Estar vinculado (enrolado) al programa de lealtad **' + programa + '** dentro de la Plataforma Rappi.\n' +
      '• Tener a **' + programa + '** seleccionado como su programa preferido de acumulación dentro de la Plataforma Rappi.'
    );
  }
  return '';
}

/**
 * ORACION: la mecanica y el beneficio, en una sola frase.
 *
 * "Por orden" sale de la clausula VII de la pieza de Turbo y "por fraccion" de
 * las clausulas IV y V de la de Civitatis. El minimo de compra va dentro de la
 * frase solo en la Plataforma Rappi, porque en Rappi Travel ya sale en la
 * clausula de condiciones de los Productos Participantes y saldria dos veces.
 */
function textoBeneficioMillas(entrada, pais) {
  var programa = String(entrada.programaLealtad || '').trim();
  if (!programa) return '';

  var esTravel = esDeTravelMillas(entrada);
  var donde = esTravel
    ? 'a través de los Sistemas Rappi Travel'
    : 'a través de la Tienda Participante en la Plataforma Rappi';

  var conMinimo = !esTravel && !entrada.sinCompraMinima && tieneValorMillas(entrada.compraMinima);
  var minimo = conMinimo ? montoConMoneda(entrada.compraMinima, pais) : '';

  if (entrada.formaMillas === 'por_orden') {
    if (!tieneValorMillas(entrada.millasPorOrden)) return '';
    return (
      'Los Usuarios/Consumidores Participantes que, durante la vigencia de la Campaña, realicen órdenes válidas ' +
      donde + ' que incluyan Productos Participantes' +
      (conMinimo ? ', y cumplan con un valor mínimo de compra de **' + minimo + '**' : '') +
      ', recibirán **' + millasConSustantivo(entrada.millasPorOrden, pais) + '** del programa **' + programa +
      '** (en adelante, el “Beneficio”) por cada orden válida.'
    );
  }

  if (entrada.formaMillas === 'por_fraccion') {
    if (!tieneValorMillas(entrada.millasPorFraccion) || !tieneValorMillas(entrada.valorFraccion)) return '';
    return (
      'Los Usuarios/Consumidores Participantes que, durante la vigencia de la Campaña, compren Productos ' +
      'Participantes ' + donde +
      (conMinimo ? ', por un valor igual o superior a **' + minimo + '**,' : ',') +
      ' recibirán **' + millasConSustantivo(entrada.millasPorFraccion, pais) + '** del programa **' + programa +
      '** (en adelante, el “Beneficio”) por cada fracción de **' + montoConMoneda(entrada.valorFraccion, pais) +
      '** gastados en su ' + (esTravel ? 'reserva' : 'orden') + '.'
    );
  }
  return '';
}

/** ORACION: sobre que valor se calculan las Millas. Civitatis, clausula V. */
function textoBaseMillas(entrada) {
  if (!entrada.formaMillas) return '';
  return 'El cálculo de las Millas se realizará sobre el valor neto pagado por los Productos Participantes.';
}

/**
 * ORACION: de donde sale el valor de la fraccion. Civitatis, nota de la
 * clausula V. Solo cuando la campana lo declara, porque no toda fraccion
 * corresponde a un dolar.
 */
function textoNotaFraccionMillas(entrada, pais) {
  if (entrada.formaMillas !== 'por_fraccion' || !entrada.fraccionEsDolar) return '';
  var moneda = String((pais && pais.moneda_nombre) || '').trim();
  if (!moneda) return '';
  // La moneda de Colombia se escribe "pesos M/Cte.", con punto propio. Sin esto
  // la frase terminaba en "pesos M/Cte.." y el motor la frenaba por dos puntos
  // seguidos, que es justo lo que esa red de seguridad existe para cazar.
  var cierre = moneda.charAt(moneda.length - 1) === '.' ? '' : '.';
  return 'El valor base de conversión corresponde a la equivalencia referencial de un dólar americano (USD $1) en ' +
    moneda + cierre;
}

/*
 * La pieza de Civitatis (clausula VII) dice que el Beneficio se calcula sobre
 * el valor pagado con dinero real, "excluyendo cualquier porcion de la compra
 * que haya sido pagada con Creditos de la Plataforma u otros cupones": la orden
 * si da millas, pero solo por la parte pagada en dinero. Los textos de medios
 * de pago que Legal ya tiene aprobados dicen otra cosa mas estricta: una orden
 * pagada parcialmente con Creditos no da beneficio ninguno.
 *
 * No son dos maneras de decir lo mismo, son dos reglas distintas, asi que el
 * modelo imprime la aprobada y la de Civitatis queda anotada para que Juan
 * decida (docs/PENDIENTES_LEGAL.md, M3). Poner las dos dejaba el documento
 * contradiciendose solo dentro de la misma clausula.
 */

/** FRAGMENTO: cuantas ordenes con Beneficio puede tener cada persona. Turbo, clausula VII. */
function textoLimiteOrdenesMillas(entrada) {
  if (entrada.sinLimitePorUsuario) {
    return 'la Campaña no establece un número máximo de órdenes con Beneficio por Usuario/Consumidor.';
  }
  if (!tieneValorMillas(entrada.limitePorUsuario)) return '';

  var cuantas = Math.trunc(Number(entrada.limitePorUsuario));
  // Con una sola orden salia "hasta por un maximo de una (1) ordenes validas".
  var enPalabras = enFemenino(numeroEnLetras(cuantas)) + ' (' + cuantas + ')' +
    (cuantas === 1 ? ' orden válida' : ' órdenes válidas');
  return 'cada Usuario/Consumidor podrá recibir el Beneficio hasta por un máximo de **' + enPalabras +
    '** durante la vigencia de la Campaña.';
}

/** FRAGMENTO: el tope de Millas por persona. Turbo, clausula IX. */
function textoTopeMillas(entrada, pais) {
  if (!tieneValorMillas(entrada.topeMillasUsuario)) return '';
  var programa = String(entrada.programaLealtad || '').trim();
  if (!programa) return '';
  return 'cada Usuario/Consumidor podrá recibir un máximo de **' +
    millasConSustantivo(entrada.topeMillasUsuario, pais) + '** del programa **' + programa +
    '** durante toda la vigencia de la Campaña.';
}

/**
 * FRAGMENTO: la bolsa que agota la Campana antes de la fecha de fin.
 * Turbo, clausula II. Aqui se definen las "Existencias", igual que en la pieza.
 */
function textoAgotamientoMillas(entrada, pais) {
  if (!tieneValorMillas(entrada.bolsaMillas)) return '';
  var texto = 'la bolsa total de Millas disponibles para la Campaña, ascendente a **' +
    millasConSustantivo(entrada.bolsaMillas, pais) + '**';

  if (tieneValorMillas(entrada.maxOrdenes)) {
    var ordenes = Math.trunc(Number(entrada.maxOrdenes));
    texto += ' equivalentes a **' + enFemenino(numeroEnLetras(ordenes)) + ' (' +
      formatearMiles(ordenes, (pais && pais.separador_miles) || '.') + ')' +
      (ordenes === 1 ? ' orden válida' : ' órdenes válidas') + '**';
  }
  return texto + ' (en adelante, las “Existencias”)';
}

/** FRAGMENTO: que pasa cuando se agotan las Existencias. Turbo, clausula IX. */
function textoExistenciasMillas(entrada) {
  if (!tieneValorMillas(entrada.bolsaMillas)) return '';
  return 'la Campaña es válida hasta agotar las Existencias. Una vez agotadas, la Campaña finalizará ' +
    'automáticamente, aunque no haya terminado su vigencia.';
}

/** ORACION: cuando y quien acredita las Millas. */
function textoAcreditacionMillas(entrada, pais) {
  var programa = String(entrada.programaLealtad || '').trim();
  if (!programa) return '';

  // Civitatis, clausula VI.
  if (entrada.acreditacionMillas === 'dias_calendario') {
    if (!tieneValorMillas(entrada.diasAcreditacion)) return '';
    var dias = Math.trunc(Number(entrada.diasAcreditacion));
    // Con un solo dia salia "un (1) dias calendario despues".
    var conTermino = pais && pais.termino_dias ? pais : { termino_dias: 'días calendario' };
    return 'Las Millas serán acreditadas de forma automática a la cuenta del Usuario/Consumidor **' +
      letrasYCifra(dias) + ' ' + terminoDeDias(conTermino, dias) +
      '** después de haberse realizado y confirmado exitosamente la compra en la Plataforma.';
  }

  // Turbo, clausula VIII.
  if (entrada.acreditacionMillas === 'programa') {
    return 'El Beneficio será acreditado por el Organizador conforme a los tiempos y procesos internos del ' +
      'programa **' + programa + '**.';
  }
  return '';
}

/** ORACION: que pasa con las Millas cuando se cancela la compra. */
function textoReversionMillas(entrada) {
  if (esDeTravelMillas(entrada)) {
    // Civitatis, clausula VI.
    return 'En el evento en que el Usuario/Consumidor, o el Proveedor, cancele la reserva adquirida bajo esta ' +
      'Campaña, se revertirá de manera inmediata y automática la acreditación de las Millas correspondientes a ' +
      'dicha compra.';
  }
  return 'En el evento en que la orden realizada bajo esta Campaña sea cancelada o reembolsada, se revertirá de ' +
    'manera inmediata y automática la acreditación de las Millas correspondientes a dicha compra.';
}

/**
 * ORACION: si el Beneficio se junta con otras promociones.
 *
 * Las dos piezas dicen lo contrario entre si y las dos estan publicadas:
 * Civitatis (clausula VII) no lo hace acumulable con otras promociones de
 * acumulacion acelerada de millas, y la de Turbo (clausula IX) si lo hace
 * acumulable con las demas promociones de la Plataforma. Lo elige la campana.
 */
function textoAcumulableMillas(entrada) {
  if (entrada.acumulableMillas === 'no') {
    return 'El Beneficio obtenido en virtud de la presente Campaña no es acumulable con otras promociones de ' +
      'acumulación acelerada de Millas.';
  }
  if (entrada.acumulableMillas === 'si') {
    return 'El Beneficio obtenido en virtud de la presente Campaña sí es acumulable con otras promociones ' +
      'exhibidas en la Plataforma Rappi.';
  }
  return '';
}

/** ORACION: que productos participan. Solo en la Plataforma Rappi. Turbo, clausula V. */
function textoProductosMillas(entrada) {
  if (esDeTravelMillas(entrada)) return '';

  if (entrada.productos === 'todos') {
    return 'Participan todos los productos del catálogo de la Tienda Participante exhibidos en la Plataforma ' +
      'Rappi (en adelante, los “Productos Participantes”).';
  }
  if (entrada.productos === 'marca') {
    var marcas = separarPorComas(entrada.makerMarca);
    if (marcas.length === 0) return '';
    return 'Participan todos los productos de ' + frasePorMarcas(marcas) +
      ' exhibidos dentro de la Tienda Participante (en adelante, los “Productos Participantes”).';
  }
  if (entrada.productos === 'especificos') {
    var productos = separarPorComas(entrada.productosLista);
    if (productos.length === 0) return '';
    return 'Participan únicamente los siguientes productos de la Tienda Participante (en adelante, los ' +
      '“Productos Participantes”): ' + listaY(productos) + '.';
  }
  return '';
}

/**
 * ORACION: la Campana tambien se sujeta a los T&C del Boton Turbo.
 * Turbo, disposiciones finales.
 */
function textoTcTurboMillas(entrada, pais) {
  if (esDeTravelMillas(entrada) || !entrada.enTurbo) return '';
  var url = (pais && pais.url_tc_turbo) || '';
  if (!url) return '';
  return 'La Campaña se encuentra sujeta a los Términos y Condiciones del Botón Turbo, disponibles en: ' + url + '.';
}

/**
 * Los valores de millas que entran a los modelos.
 *
 * Los valores comunes con el resto del sistema (fechas, horas, territorio,
 * segmento, medio de pago) los pone calcularDerivados, que ademas resuelve
 * TEXTO_SEGMENTO_MILLAS y TEXTO_METODO_PAGO_MILLAS segun la vertical.
 */
function calcularDerivadosMillas(entrada, pais) {
  var valores = {};
  var datos = entrada || {};
  var p = pais || {};
  var esTravel = esDeTravelMillas(datos);

  valores.PROGRAMA_MILLAS = String(datos.programaLealtad || '').trim();

  // La entidad que opera el canal no es la misma en las dos verticales: los
  // domicilios los opera Rappi S.A.S. y los viajes Travel Moustache S.A.S.
  valores.ENTIDAD_MILLAS = esTravel ? (p.travel_entidad || '') : (p.entidad_legal || '');
  valores.NOMBRE_CANAL_MILLAS = esTravel ? 'Rappi Travel' : 'Rappi';
  valores.SISTEMAS_MILLAS = esTravel ? 'los Sistemas Rappi Travel' : 'la Plataforma Rappi';
  valores.POLITICA_PRIVACIDAD_MILLAS = esTravel ? (p.travel_politica_privacidad || '') : (p.politica_privacidad || '');
  valores.URL_PRIVACIDAD_MILLAS = esTravel ? (p.travel_url_privacidad || '') : (p.url_privacidad || '');

  valores.TEXTO_VINCULACION_MILLAS = textoVinculacionMillas(datos);
  valores.TEXTO_BENEFICIO_MILLAS = textoBeneficioMillas(datos, p);
  valores.TEXTO_BASE_MILLAS = textoBaseMillas(datos);
  valores.TEXTO_NOTA_FRACCION_MILLAS = textoNotaFraccionMillas(datos, p);
  valores.TEXTO_LIMITE_ORDENES_MILLAS = textoLimiteOrdenesMillas(datos);
  valores.TEXTO_TOPE_MILLAS = textoTopeMillas(datos, p);
  valores.TEXTO_AGOTAMIENTO_MILLAS = textoAgotamientoMillas(datos, p);
  valores.TEXTO_EXISTENCIAS_MILLAS = textoExistenciasMillas(datos);
  valores.TEXTO_ACREDITACION_MILLAS = textoAcreditacionMillas(datos, p);
  valores.TEXTO_REVERSION_MILLAS = textoReversionMillas(datos);
  valores.TEXTO_ACUMULABLE_MILLAS = textoAcumulableMillas(datos);
  valores.TEXTO_PRODUCTOS_MILLAS = textoProductosMillas(datos);
  valores.TEXTO_TC_TURBO = textoTcTurboMillas(datos, p);

  return valores;
}

if (typeof module !== 'undefined') {
  module.exports = {
    millasEnLetras: millasEnLetras,
    millasConSustantivo: millasConSustantivo,
    textoVinculacionMillas: textoVinculacionMillas,
    textoBeneficioMillas: textoBeneficioMillas,
    textoBaseMillas: textoBaseMillas,
    textoNotaFraccionMillas: textoNotaFraccionMillas,
    textoLimiteOrdenesMillas: textoLimiteOrdenesMillas,
    textoTopeMillas: textoTopeMillas,
    textoAgotamientoMillas: textoAgotamientoMillas,
    textoExistenciasMillas: textoExistenciasMillas,
    textoAcreditacionMillas: textoAcreditacionMillas,
    textoReversionMillas: textoReversionMillas,
    textoAcumulableMillas: textoAcumulableMillas,
    textoProductosMillas: textoProductosMillas,
    textoTcTurboMillas: textoTcTurboMillas,
    calcularDerivadosMillas: calcularDerivadosMillas,
  };
}
