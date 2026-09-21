'use strict';

/**
 * Derivados de Rappi Travel.
 *
 * Los textos salen de docs/MODELO_BASE_TRAVEL.md, seccion 5, y no se reescriben
 * aqui: el texto legal es de Legal (regla 3 de CLAUDE.md). Cada uno lleva su
 * origen y su estado en ese documento.
 *
 * Marca ORACION: devuelve oracion completa (mayuscula inicial y punto final).
 * Marca FRAGMENTO: se inserta dentro de otra frase (sin mayuscula ni punto).
 *
 * Travel va aparte de derivados.js a proposito: los textos de delivery no
 * cambian, y un archivo separado hace imposible tocarlos sin querer.
 */

/* En Node las dependencias se cargan con require; en Apps Script ya son globales. */
if (typeof module !== 'undefined' && typeof require === 'function') {
  var moduloNumeros = require('./numeros.js');
  var numeroEnLetras = moduloNumeros.numeroEnLetras;
  var letrasYCifra = moduloNumeros.letrasYCifra;
  var cantidadCreditos = moduloNumeros.cantidadCreditos;
  var montoConMoneda = moduloNumeros.montoConMoneda;
  var porcentajeEnLetras = moduloNumeros.porcentajeEnLetras;
  var formatearMiles = moduloNumeros.formatearMiles;
  var letrasYCifraFemenino = moduloNumeros.letrasYCifraFemenino;

  var moduloFechas = require('./fechas.js');
  var formatearFecha = moduloFechas.formatearFecha;
  var formatearHora = moduloFechas.formatearHora;
  var listaY = moduloFechas.listaY;
  var separarPorComas = moduloFechas.separarPorComas;

  var terminoDeDias = require('./texto.js').terminoDeDias;

  var moduloEsquemas = require('./esquemas.js');
  var categoriasDe = moduloEsquemas.categoriasDe;
  var hayAereasDeTravel = moduloEsquemas.hayAereasDeTravel;

  if (typeof CATEGORIAS_TRAVEL === 'undefined') {
    var CATEGORIAS_TRAVEL = require('../../data/categorias_travel.json');
  }
}

// --- Textos fijos de Legal -------------------------------------------------

var TEXTO_SEGMENTO_TRAVEL_POR_OPCION = {
  todos: 'Pueden participar todos los Usuarios/Consumidores de la Plataforma Rappi que sean mayores de edad.',
  pro: 'Pueden participar los Usuarios/Consumidores que tengan activa la suscripción RappiPro y/o RappiPro Black.',
  pro_black: 'Pueden participar únicamente los Usuarios/Consumidores que tengan activa la suscripción RappiPro Black.',
  pro_o_rappicard: 'Pueden participar los Usuarios/Consumidores que tengan activa la suscripción RappiPro y/o RappiPro Black, así como los que paguen la orden con su tarjeta RappiCard.',
  sin_pro: 'Pueden participar únicamente los Usuarios/Consumidores que no tengan activa la suscripción RappiPro ni RappiPro Black.',
  primera_compra: 'Pueden participar únicamente los Usuarios/Consumidores que realicen su primera compra en los Sistemas Rappi Travel durante la vigencia de la Campaña.',
};

var TEXTO_METODO_PAGO_TRAVEL_POR_OPCION = {
  digitales: 'Campaña válida para órdenes pagadas con cualquier medio de pago digital habilitado en los Sistemas Rappi Travel, excepto efectivo. No se obtendrá el Beneficio respecto de órdenes pagadas parcial o totalmente con Créditos de la Plataforma.',
  rappicard: 'Campaña válida únicamente para órdenes pagadas en su totalidad con RappiCard. No se obtendrá el Beneficio respecto de órdenes pagadas parcial o totalmente con Créditos de la Plataforma.',
};

var TEXTO_VISIBILIDAD_POR_OPCION = {
  inicio: 'la página de inicio de los Sistemas Rappi Travel',
  etiqueta: 'la etiqueta de cada Producto Participante',
  precio_tachado: 'el precio tachado del flujo de compra',
};

// --- Ayudas ----------------------------------------------------------------

function tieneValorTravel(valor) {
  if (valor === null || valor === undefined) return false;
  if (Object.prototype.toString.call(valor) === '[object Array]') return valor.length > 0;
  return String(valor).trim() !== '';
}

/** Las categorias entre comillas, con "la categoria" o "las categorias" delante. */
function frasePorCategorias(categorias) {
  var entrecomilladas = [];
  for (var i = 0; i < categorias.length; i++) entrecomilladas.push('“' + categorias[i] + '”');
  var articulo = entrecomilladas.length === 1 ? 'la categoría' : 'las categorías';
  return articulo + ' ' + listaY(entrecomilladas);
}

/** true si estan marcadas las ocho categorias de la app. */
function sonTodasLasCategorias(categorias, pais) {
  var todas = (CATEGORIAS_TRAVEL || {})[(pais && pais.codigo) || 'CO'] || [];
  return todas.length > 0 && categorias.length === todas.length;
}

/** Las categorias de la app que NO estan en la lista. */
function categoriasRestantes(categorias, pais) {
  var todas = (CATEGORIAS_TRAVEL || {})[(pais && pais.codigo) || 'CO'] || [];
  var fuera = [];
  for (var i = 0; i < todas.length; i++) {
    if (categorias.indexOf(todas[i]) === -1) fuera.push(todas[i]);
  }
  return fuera;
}

// --- Textos por opcion -----------------------------------------------------

/** ORACION: quien puede participar. */
function textoSegmentoTravel(entrada) {
  return TEXTO_SEGMENTO_TRAVEL_POR_OPCION[entrada.segmento] || '';
}

/* La frase que solo tiene sentido cuando el beneficio son Creditos. */
var EXCLUSION_DE_PAGOS_CON_CREDITOS =
  ' No se obtendrá el Beneficio respecto de órdenes pagadas parcial o totalmente con Créditos de la Plataforma.';

/**
 * ORACION: enciende la clausula del precio anunciado.
 *
 * No escribe el texto, que vive en modelos/bloques/travel_precio_anunciado.md:
 * solo dice si la clausula va o no. El texto es el mismo siempre, y el unico
 * caso en que no va es cuando la pieza no anuncia ningun precio.
 *
 * El que anuncia un precio que no es el valor final no llega hasta aqui: lo
 * para validarTravel y va a Legal, porque eso no se arregla con una clausula.
 */
function textoPrecioAnunciado(entrada) {
  return entrada.anunciaPrecio === 'si' ? 'si' : '';
}

/**
 * La frase de un emisor concreto lleva su nombre adentro, asi que se arma en vez
 * de estar escrita. Es el unico medio de pago que necesita un dato del
 * comercial: los otros dos son siempre la misma frase.
 */
function textoMetodoPagoDeEmisor(nombre) {
  var limpio = String(nombre === null || nombre === undefined ? '' : nombre).trim();
  if (!limpio) return '';
  return 'Campaña válida únicamente para órdenes pagadas en su totalidad con ' + limpio +
    '. No se obtendrá el Beneficio respecto de órdenes pagadas parcial o totalmente con ' +
    'Créditos de la Plataforma, ni con cualquier otro medio de pago.';
}

/**
 * ORACION: con que se paga.
 *
 * En los descuentos esa frase sale. Venia de los cashback, donde evita montar un
 * beneficio promocional sobre otro: el usuario no gana Creditos pagando con
 * Creditos. En un descuento el beneficio no son Creditos, es un precio mas bajo,
 * asi que la frase excluia pagos sin ninguna razon. Juan lo decidio el 20 de
 * septiembre de 2026 (punto D8); en cashback_travel se queda.
 */
function textoMetodoPagoTravel(entrada) {
  var texto = entrada.metodoPago === 'emisor'
    ? textoMetodoPagoDeEmisor(entrada.nombreMedioPago)
    : (TEXTO_METODO_PAGO_TRAVEL_POR_OPCION[entrada.metodoPago] || '');
  if (!texto) return '';
  if (entrada.tipo === 'descuento_travel') {
    return texto.replace(EXCLUSION_DE_PAGOS_CON_CREDITOS, '');
  }
  return texto;
}

/** ORACION: que productos participan. */
function textoProductosTravel(entrada, pais) {
  var categorias = categoriasDe(entrada);
  if (categorias.length === 0) return '';

  var donde = sonTodasLasCategorias(categorias, pais) ? 'todas las categorías' : frasePorCategorias(categorias);
  var marca = String(entrada.marcaAliado || '').trim();
  var deLaMarca = marca ? 'de **' + marca + '** ' : '';

  return (
    'Participan exclusivamente las compras de productos ' + deLaMarca + 'en ' + donde +
    ' de los Sistemas Rappi Travel, realizadas durante la vigencia de la Campaña (en adelante, los “Productos Participantes”).'
  );
}

/**
 * ORACION: nacionales, internacionales o los dos. Vacio cuando son los dos.
 *
 * La frase se parte segun las categorias marcadas (decision 43 de Legal): una
 * campana de hoteles que habla de vuelos confunde sobre que compra aplica.
 * Solo se acorta cuando no hay duda: "solo vuelos" es la categoria Vuelos y
 * nada mas, y "sin vuelos" es que no haya ninguna categoria aerea. Un Paquete
 * lleva vuelo y alojamiento, asi que cae en la frase completa, que es la
 * aprobada y la que nombra las dos cosas.
 */
function textoAmbitoTravel(entrada, pais) {
  var paisLegal = (pais && pais.pais_legal) || '';
  if (entrada.ambito !== 'nacional' && entrada.ambito !== 'internacional') return '';

  var marcadas = categoriasDe(entrada);
  var soloVuelos = marcadas.length === 1 && marcadas[0] === 'Vuelos';
  var sinVuelos = marcadas.length > 0 && !hayAereasDeTravel(entrada);

  if (entrada.ambito === 'nacional') {
    if (soloVuelos) return 'Aplica únicamente para vuelos con origen y destino en ' + paisLegal + '.';
    if (sinVuelos) return 'Aplica únicamente para servicios que se presten en ' + paisLegal + '.';
    return 'Aplica únicamente para vuelos con origen y destino en ' + paisLegal +
      ' y para servicios que se presten en ' + paisLegal + '.';
  }

  if (soloVuelos) return 'Aplica únicamente para vuelos con origen o destino fuera de ' + paisLegal + '.';
  if (sinVuelos) return 'Aplica únicamente para servicios que se presten fuera de ' + paisLegal + '.';
  return 'Aplica únicamente para vuelos con origen o destino fuera de ' + paisLegal +
    ' y para servicios que se presten fuera de ' + paisLegal + '.';
}

/** ORACION: los destinos, si la campana los limita. */
function textoDestinosTravel(entrada) {
  var destinos = separarPorComas(entrada.destinos);
  if (destinos.length === 0) return '';
  return 'Aplica únicamente para los siguientes destinos: ' + listaY(destinos) + '.';
}

/** ORACION: que hoteles participan. */
function textoHotelesTravel(entrada) {
  if (entrada.hotelesModo === 'etiqueta') {
    return 'En las categorías de alojamiento, participan únicamente los hoteles identificados con la etiqueta de la Campaña en los Sistemas Rappi Travel.';
  }
  if (entrada.hotelesModo !== 'algunos') return '';

  var hoteles = separarPorComas(entrada.hotelesLista);
  if (hoteles.length === 0) return '';
  return 'En las categorías de alojamiento, participan únicamente los siguientes hoteles: ' + listaY(hoteles) + '.';
}

/**
 * Las vinetas de la clausula de condiciones, en el orden del modelo base.
 * Cada una es una ORACION. Devuelve una lista, que el motor convierte en
 * vinetas.
 */
function vinetasDeCondicionesTravel(entrada, pais) {
  var vinetas = [];
  var aerolinea = String(entrada.aerolinea || '').trim();

  if (aerolinea && entrada.soloOperados) {
    vinetas.push(
      'Los vuelos deben ser operados directamente por **' + aerolinea +
      '**. Quedan excluidos los vuelos operados por aerolíneas aliadas bajo acuerdos de código compartido y las rutas operadas por otras compañías aéreas.'
    );
  } else if (aerolinea) {
    vinetas.push('Los vuelos deben ser de **' + aerolinea + '**.');
  }

  if (entrada.trayecto === 'ida_y_regreso') {
    vinetas.push('La compra debe ser de vuelos de ida y regreso. No aplica para compras solo de ida ni para itinerarios con varios destinos.');
  } else if (entrada.trayecto === 'solo_ida') {
    vinetas.push('La compra debe ser de vuelos solo de ida.');
  }

  if (entrada.ambasFechasDentro) {
    vinetas.push('En las compras de ida y regreso, las fechas de los dos trayectos deben estar dentro del periodo de viaje de la Campaña; de lo contrario, el Beneficio no aplica para ninguno de los dos trayectos.');
  }

  var clases = separarPorComas(entrada.clasesExcluidas);
  if (clases.length > 0) {
    vinetas.push('No aplica para las clases tarifarias ' + listaY(clases) + '.');
  }

  if (entrada.soloOrigenPais) {
    vinetas.push('Los vuelos deben tener origen en ' + ((pais && pais.pais_legal) || '') + '.');
  }

  if (tieneValorTravel(entrada.anticipacionDias)) {
    // Con un solo dia salia "al menos un (1) dias calendario de anticipacion".
    var diasAnticipacion = Number(entrada.anticipacionDias);
    vinetas.push(
      'La compra debe hacerse con al menos ' + letrasYCifra(diasAnticipacion) +
      (diasAnticipacion === 1 ? ' día calendario' : ' días calendario') +
      ' de anticipación a la fecha de salida.'
    );
  }

  if (tieneValorTravel(entrada.periodoViajeInicio) && tieneValorTravel(entrada.periodoViajeFin)) {
    vinetas.push(
      'El viaje o el uso del servicio debe realizarse entre el ' + formatearFecha(entrada.periodoViajeInicio) +
      ' y el ' + formatearFecha(entrada.periodoViajeFin) + '.'
    );
  }

  var excluidas = separarPorComas(entrada.fechasExcluidas);
  if (excluidas.length > 0) {
    var enLetras = [];
    for (var f = 0; f < excluidas.length; f++) {
      var comoFecha = formatearFecha(excluidas[f]);
      enLetras.push(comoFecha || excluidas[f]);
    }
    vinetas.push('No aplica para viajes o servicios en las siguientes fechas: ' + listaY(enLetras) + '.');
  }

  if (tieneValorTravel(entrada.nochesMinimas)) {
    // Con una sola noche salia "debe ser de una (1) noches o mas".
    var noches = Number(entrada.nochesMinimas);
    vinetas.push('La reserva de hotel debe ser de ' + letrasYCifraFemenino(noches) +
      (noches === 1 ? ' noche' : ' noches') + ' o más.');
  }

  if (tieneValorTravel(entrada.diasAlquilerMinimo) && tieneValorTravel(entrada.diasAlquilerMaximo)) {
    // El minimo y el maximo pueden ser el mismo numero: la validacion solo
    // impide que el minimo sea mayor. Con los dos en 1 salia "entre un (1) y
    // un (1) dias", que repite el numero y ademas lo deja en plural.
    var alquilerMinimo = Number(entrada.diasAlquilerMinimo);
    var alquilerMaximo = Number(entrada.diasAlquilerMaximo);
    if (alquilerMinimo === alquilerMaximo) {
      vinetas.push('El alquiler de auto debe ser de ' + letrasYCifra(alquilerMinimo) +
        (alquilerMinimo === 1 ? ' día.' : ' días.'));
    } else {
      vinetas.push(
        'El alquiler de auto debe ser de entre ' + letrasYCifra(alquilerMinimo) +
        ' y ' + letrasYCifra(alquilerMaximo) + ' días.'
      );
    }
  }

  if (!entrada.sinCompraMinima && tieneValorTravel(entrada.compraMinima)) {
    vinetas.push('El valor pagado por la orden debe ser igual o superior a **' + montoConMoneda(entrada.compraMinima, pais) + '**.');
  }

  return vinetas;
}

/** FRAGMENTO: en que consiste el beneficio del cashback. */
function textoBeneficioTravel(entrada, pais) {
  if (entrada.formaBeneficio === 'monto_fijo') {
    if (!tieneValorTravel(entrada.montoFijo)) return '';
    return '**' + cantidadCreditos(entrada.montoFijo, pais) + '** por cada orden que cumpla las condiciones de la Campaña';
  }

  if (!tieneValorTravel(entrada.porcentaje)) return '';
  var porcentaje = '**' + porcentajeEnLetras(entrada.porcentaje) + '**';

  if (entrada.sinTope) return 'el ' + porcentaje + ' del valor pagado por tu orden, sin un tope por orden';
  if (!tieneValorTravel(entrada.tope)) return '';
  return 'el ' + porcentaje + ' del valor pagado por tu orden, sin que puedas recibir más de **' +
    cantidadCreditos(entrada.tope, pais) + '** por orden';
}

/** ORACION: sobre que valor se calcula el cashback. */
function textoBaseCalculoTravel(entrada) {
  if (entrada.formaBeneficio !== 'porcentaje') return '';

  var conAsistencia = categoriasDe(entrada).indexOf('Asistencia') !== -1;
  var excluidos = conAsistencia
    ? 'sin incluir cargos por servicio ni otros servicios adicionales'
    : 'sin incluir cargos por servicio, asistencias o seguros de viaje ni otros servicios adicionales';

  return 'El Beneficio aplica únicamente sobre el valor pagado con dinero real por la tarifa o la reserva de los ' +
    'Productos Participantes, antes de impuestos, tasas y contribuciones, ' + excluidos + '. ' +
    'No hacen parte de la base de cálculo el IVA, las tasas aeroportuarias ni ningún otro impuesto, tasa o ' +
    'contribución incluido en el precio total.';
}

/**
 * ORACION: el ejemplo del tope, en cifras.
 *
 * Existe por el reclamo de agosto de 2025: una etiqueta prometia 250.000 de
 * cashback sin la palabra "hasta" y la usuaria reclamo publicidad enganosa.
 */
function textoEjemploTopeTravel(entrada, pais) {
  if (entrada.formaBeneficio !== 'porcentaje' || entrada.sinTope) return '';
  if (!tieneValorTravel(entrada.tope) || !tieneValorTravel(entrada.porcentaje)) return '';

  var porcentaje = Number(entrada.porcentaje);
  var tope = Number(entrada.tope);
  if (!isFinite(porcentaje) || porcentaje <= 0 || !isFinite(tope) || tope <= 0) return '';

  var umbral = Math.ceil(tope * 100 / porcentaje);
  // Cifras sin letras: es un ejemplo para leer rapido, no una clausula.
  return (
    'Por ejemplo, para recibir el máximo de ' + formatearMiles(tope, pais.separador_miles) +
    ' Créditos en una orden, el valor que cuenta para el cálculo del Beneficio debe ser de al menos ' +
    pais.moneda_simbolo + formatearMiles(umbral, pais.separador_miles) +
    '; si es menor, recibirás el ' + porcentaje + '% de ese valor.'
  );
}

/** FRAGMENTO: cuantas ordenes con beneficio puede tener cada persona. */
function textoLimiteOrdenesTravel(entrada) {
  if (entrada.sinLimitePorUsuario) return 'no hay un límite de órdenes por Usuario/Consumidor.';
  if (!tieneValorTravel(entrada.limitePorUsuario)) return '';

  var cuantas = Number(entrada.limitePorUsuario);
  var enPalabras = cuantas === 1 ? 'en una (1) orden' : 'hasta en ' + letrasYCifraFemenino(cuantas) + ' órdenes';
  return 'cada Usuario/Consumidor podrá recibir el Beneficio ' + enPalabras + ' durante la vigencia de la Campaña.';
}

/** FRAGMENTO: que agota la campana antes de la fecha de fin. */
function textoAgotamientoVigenciaTravel(entrada, pais) {
  if (entrada.tipo === 'descuento_travel') {
    if (entrada.sinUnidades || !tieneValorTravel(entrada.unidades)) return '';
    // Con una sola unidad salia "hasta agotar las una (1) unidades con descuento".
    if (Number(entrada.unidades) === 1) return 'la única unidad con descuento';
    return 'las ' + letrasYCifraFemenino(entrada.unidades) + ' unidades con descuento';
  }

  if (!tieneValorTravel(entrada.presupuesto)) return '';
  var presupuesto = 'el presupuesto disponible de **' + cantidadCreditos(entrada.presupuesto, pais) + '**';
  if (entrada.sinMaxOrdenes || !tieneValorTravel(entrada.maxOrdenes)) return presupuesto;
  return presupuesto + ' o el máximo de ' + letrasYCifraFemenino(entrada.maxOrdenes) + ' órdenes con Beneficio';
}

/** ORACION: el limite de toda la campana. */
function textoLimiteCampanaTravel(entrada, pais) {
  if (entrada.tipo === 'descuento_travel') {
    if (entrada.sinUnidades || !tieneValorTravel(entrada.unidades)) return '';
    // Con una sola unidad salia "cuenta con una (1) unidades ... Una vez agotadas".
    if (Number(entrada.unidades) === 1) {
      return 'La Campaña cuenta con una (1) unidad con descuento. Una vez agotada, la Campaña finalizará ' +
        'automáticamente, aunque no haya terminado su vigencia.';
    }
    return 'La Campaña cuenta con ' + letrasYCifraFemenino(entrada.unidades) +
      ' unidades con descuento. Una vez agotadas, la Campaña finalizará automáticamente, aunque no haya terminado su vigencia.';
  }

  if (!tieneValorTravel(entrada.presupuesto)) return '';
  var presupuesto = '**' + cantidadCreditos(entrada.presupuesto, pais) + '**';

  if (entrada.sinMaxOrdenes || !tieneValorTravel(entrada.maxOrdenes)) {
    return 'La Campaña tiene un presupuesto total de ' + presupuesto +
      '. Una vez agotado, la Campaña finalizará automáticamente, aunque no haya terminado su vigencia.';
  }
  return 'La Campaña tiene un presupuesto total de ' + presupuesto + ' y un máximo de ' +
    letrasYCifraFemenino(entrada.maxOrdenes) +
    ' órdenes con Beneficio. Cuando se agote cualquiera de los dos, la Campaña finalizará automáticamente, aunque no haya terminado su vigencia.';
}

/** FRAGMENTO: como cuenta una compra de ida y regreso. */
function textoConteoIdaRegresoTravel(entrada) {
  if (!hayAereasDeTravel(entrada) || entrada.trayecto === 'solo_ida') return '';
  if (entrada.conteoIdaRegreso === 'por_trayecto') {
    return 'en una compra de ida y regreso, cada trayecto cuenta como una (1) orden, y el Beneficio se calcula sobre el valor pagado por cada trayecto.';
  }
  if (entrada.conteoIdaRegreso === 'una_orden') {
    return 'una compra de ida y regreso cuenta como una (1) orden, y el Beneficio se calcula sobre el valor total pagado por la compra.';
  }
  return '';
}

/** FRAGMENTO: cuando llegan los Creditos. */
function textoCargaTravel(entrada) {
  if (entrada.carga === 'al_confirmarse') return 'una vez se confirme la emisión de tu reserva';
  if (!tieneValorTravel(entrada.diasCarga)) return '';

  // Con un solo dia salia "dentro de los un (1) dias calendario siguientes".
  var diasCarga = Number(entrada.diasCarga);
  var variosDiasCarga = diasCarga !== 1;
  var articuloCarga = variosDiasCarga ? 'los ' : '';
  if (entrada.carga === 'dias_calendario') {
    return 'dentro de ' + articuloCarga + letrasYCifra(diasCarga) +
      (variosDiasCarga ? ' días calendario siguientes' : ' día calendario siguiente') +
      ' a la finalización de la Campaña, siempre que tu reserva esté confirmada';
  }
  if (entrada.carga === 'dias_habiles') {
    return 'dentro de ' + articuloCarga + letrasYCifra(diasCarga) +
      (variosDiasCarga ? ' días hábiles siguientes' : ' día hábil siguiente') +
      ' a la finalización de la Campaña, siempre que tu reserva esté confirmada';
  }
  return '';
}

/*
 * La verificacion de elegibilidad de Travel, segun cuando llegan los Creditos.
 *
 * Mismo caso que en delivery (decision 18): con carga al confirmarse la
 * reserva, "verificar antes de acreditar" contradice a "acreditar al
 * confirmarse", y la contradiccion impresa se lee a favor del usuario.
 */
var TEXTO_VERIFICACION_TRAVEL_ANTES =
  'Rappi Travel se reserva el derecho de verificar la elegibilidad de cada orden antes de acreditar el Beneficio; ' +
  'si la verificación determina que la orden no cumple las condiciones de la Campaña, los Créditos no serán ' +
  'acreditados y se te informará a través de la Plataforma Rappi.';

var TEXTO_VERIFICACION_TRAVEL_DESPUES =
  'Rappi Travel podrá verificar la elegibilidad de cada orden después de acreditar el Beneficio; ' +
  'si la verificación determina que la orden no cumple las condiciones de la Campaña, Rappi Travel podrá ' +
  'descontar o revocar los Créditos acreditados y te lo informará a través de la Plataforma Rappi.';

/** ORACION: como se verifica la elegibilidad de la orden. */
function textoVerificacionTravel(entrada) {
  return entrada.carga === 'al_confirmarse' ? TEXTO_VERIFICACION_TRAVEL_DESPUES : TEXTO_VERIFICACION_TRAVEL_ANTES;
}

/** ORACION: donde se pueden gastar los Creditos. */
function textoRedencionTravel(entrada, pais) {
  if (entrada.redencion === 'travel_y_plataforma') {
    return 'Los Créditos podrán redimirse en cualquier categoría de los Sistemas Rappi Travel y en cualquier sección de la Plataforma Rappi habilitada para el uso de Créditos.';
  }
  if (entrada.redencion === 'todo_travel') {
    return 'Los Créditos podrán redimirse en cualquier categoría de los Sistemas Rappi Travel.';
  }
  if (entrada.redencion !== 'categorias') return '';

  var elegidas = (entrada.categoriasRedencion || []);
  if (elegidas.length === 0) return '';
  if (sonTodasLasCategorias(elegidas, pais)) {
    return 'Los Créditos podrán redimirse en cualquier categoría de los Sistemas Rappi Travel.';
  }

  var fuera = categoriasRestantes(elegidas, pais);
  return 'Los Créditos podrán redimirse únicamente en ' + frasePorCategorias(elegidas) +
    ' de los Sistemas Rappi Travel y no podrán usarse en ' + frasePorCategorias(fuera) + '.';
}

/** FRAGMENTO: en que consiste el descuento. */
function textoDescuentoTravel(entrada) {
  if (!tieneValorTravel(entrada.porcentaje)) return '';
  if (entrada.formaDescuento === 'fijo') {
    return 'un descuento del **' + porcentajeEnLetras(entrada.porcentaje) + '**';
  }
  if (!tieneValorTravel(entrada.porcentajeMinimo)) return '';
  // "segun el Producto Participante" va al final de la frase, no aqui: en medio
  // partia la oracion ("...segun el Producto Participante sobre el valor de la
  // tarifa..."). Son las mismas palabras del modelo base, en otro orden.
  return 'un descuento de entre el **' + porcentajeEnLetras(entrada.porcentajeMinimo) +
    '** y el **' + porcentajeEnLetras(entrada.porcentaje) + '**';
}

/**
 * ORACION: a cuantos productos llega el descuento maximo.
 *
 * La SIC admite anunciar un rango de descuento siempre que se diga a cuantos
 * productos aplica el maximo. Sin esta frase, "hasta 40%" es enganoso.
 */
function textoMaximoDisponibleTravel(entrada) {
  if (entrada.formaDescuento !== 'variable') return '';
  if (!tieneValorTravel(entrada.productosConMaximo) || !tieneValorTravel(entrada.porcentaje)) return '';
  // "un (1)" solo va delante de un sustantivo. Aqui la cifra va sola, asi que
  // con un producto se escribe "uno (1) de los Productos Participantes".
  var conMaximo = Number(entrada.productosConMaximo);
  return 'El descuento máximo del **' + porcentajeEnLetras(entrada.porcentaje) + '** aplica a ' +
    (conMaximo === 1 ? 'uno (1)' : letrasYCifra(conMaximo)) + ' de los Productos Participantes.';
}

/** FRAGMENTO: donde ve el usuario el descuento. */
function textoVisibilidadTravel(entrada) {
  var marcadas = entrada.visibilidad || [];
  var textos = [];
  var orden = ['inicio', 'etiqueta', 'precio_tachado'];
  for (var i = 0; i < orden.length; i++) {
    if (marcadas.indexOf(orden[i]) !== -1) textos.push(TEXTO_VISIBILIDAD_POR_OPCION[orden[i]]);
  }
  return textos.length === 0 ? '' : listaY(textos);
}

/** ORACION: el descuento de una asistencia no cubre el vuelo con el que se compra. */
function textoAsistenciaTravel(entrada) {
  var categorias = categoriasDe(entrada);
  if (categorias.length !== 1 || categorias[0] !== 'Asistencia') return '';
  return 'El descuento aplica únicamente sobre el valor de la asistencia al viajero y no sobre el valor de los vuelos o paquetes con los que se compre.';
}

/** FRAGMENTO: la vigencia de los Creditos. En Travel siempre es por dias. */
function textoVigenciaCreditosTravel(entrada, pais) {
  if (!tieneValorTravel(entrada.diasVigencia)) return '';
  // Con un solo dia salia "un (1) dias calendario contados a partir de su carga".
  var diasVigenciaTravel = Number(entrada.diasVigencia);
  var conTermino = pais && pais.termino_dias ? pais : { termino_dias: 'días calendario' };
  return 'tendrán una vigencia de ' + letrasYCifra(diasVigenciaTravel) + ' ' +
    terminoDeDias(conTermino, diasVigenciaTravel) + (diasVigenciaTravel === 1 ? ' contado' : ' contados') +
    ' a partir de su carga';
}

/**
 * Parrafo opcional para cuando los Creditos se pueden usar fuera de Travel.
 *
 * PENDIENTE (R2 de docs/MODELO_BASE_TRAVEL.md): Travel Moustache otorga estos
 * Creditos, asi que su uso dentro de Travel se rige por este documento. Si se
 * gastan en el resto de la Plataforma, mandan los T&C de Creditos de Rappi.
 */
function textoCreditosFueraDeTravel(entrada, pais) {
  if (entrada.redencion !== 'travel_y_plataforma') return '';
  return 'Cuando uses estos Créditos por fuera de los Sistemas Rappi Travel, su uso se regirá además por los Términos y Condiciones de Funcionamiento de los Créditos de la Plataforma Rappi, disponibles en: ' +
    ((pais && pais.url_tc_creditos) || '') + '.';
}

/**
 * Los valores de Travel que entran a los modelos.
 *
 * Se llaman igual que en docs/MODELO_BASE_TRAVEL.md. Los valores comunes con
 * delivery (fechas, horas, territorio, pais) los pone calcularDerivados.
 */
function calcularDerivadosTravel(entrada, pais) {
  var valores = {};
  var datos = entrada || {};
  var p = pais || {};

  // Datos de la entidad de Travel, que no son los de Rappi S.A.S.
  valores.ENTIDAD_TRAVEL = p.travel_entidad || '';
  valores.ID_FISCAL_TRAVEL = p.travel_id_fiscal || '';
  valores.RNT_TRAVEL = p.travel_rnt || '';
  valores.URL_SITIO_TRAVEL = p.travel_url_sitio || '';
  valores.URL_TC_TRAVEL = p.travel_url_tc || '';
  valores.POLITICA_PRIVACIDAD_TRAVEL = p.travel_politica_privacidad || '';
  valores.URL_PRIVACIDAD_TRAVEL = p.travel_url_privacidad || '';
  valores.ENTIDAD_VIGILANCIA_TRAVEL = p.travel_entidad_vigilancia || '';

  // Una campana de Travel cubre todo el pais: no hay pregunta de ciudades,
  // porque un vuelo o un hotel no dependen de la cobertura del domicilio.
  valores.TEXTO_TERRITORIO = 'el territorio nacional de ' + (p.pais_legal || '');

  valores.TEXTO_SEGMENTO_TRAVEL = textoSegmentoTravel(datos);
  valores.TEXTO_METODO_PAGO_TRAVEL = textoMetodoPagoTravel(datos);
  valores.TEXTO_PRECIO_ANUNCIADO = textoPrecioAnunciado(datos);
  valores.TEXTO_PRODUCTOS_TRAVEL = textoProductosTravel(datos, p);
  valores.TEXTO_AMBITO_TRAVEL = textoAmbitoTravel(datos, p);
  valores.TEXTO_DESTINOS_TRAVEL = textoDestinosTravel(datos);
  valores.TEXTO_HOTELES_TRAVEL = textoHotelesTravel(datos);

  var vinetas = vinetasDeCondicionesTravel(datos, p);
  valores.TEXTO_CONDICIONES_TRAVEL = vinetas.length === 0 ? '' : '• ' + vinetas.join('\n• ');

  valores.TEXTO_BENEFICIO_TRAVEL = textoBeneficioTravel(datos, p);
  valores.TEXTO_BASE_CALCULO_TRAVEL = textoBaseCalculoTravel(datos);
  valores.TEXTO_EJEMPLO_TOPE_TRAVEL = textoEjemploTopeTravel(datos, p);
  valores.TEXTO_LIMITE_ORDENES_TRAVEL = textoLimiteOrdenesTravel(datos);
  valores.TEXTO_AGOTAMIENTO_VIGENCIA_TRAVEL = textoAgotamientoVigenciaTravel(datos, p);
  valores.TEXTO_LIMITE_CAMPANA_TRAVEL = textoLimiteCampanaTravel(datos, p);
  valores.TEXTO_CONTEO_IDA_REGRESO_TRAVEL = textoConteoIdaRegresoTravel(datos);
  valores.TEXTO_CARGA_TRAVEL = textoCargaTravel(datos);
  valores.TEXTO_VERIFICACION_TRAVEL = textoVerificacionTravel(datos);
  valores.TEXTO_REDENCION_TRAVEL = textoRedencionTravel(datos, p);
  valores.TEXTO_DESCUENTO_TRAVEL = textoDescuentoTravel(datos);
  valores.TEXTO_SEGUN_PRODUCTO_TRAVEL = datos.formaDescuento === 'variable' ? ', según el Producto Participante' : '';
  valores.TEXTO_MAXIMO_DISPONIBLE_TRAVEL = textoMaximoDisponibleTravel(datos);
  valores.TEXTO_VISIBILIDAD_TRAVEL = textoVisibilidadTravel(datos);
  valores.TEXTO_ASISTENCIA_TRAVEL = textoAsistenciaTravel(datos);

  valores.TEXTO_VIGENCIA_CREDITOS = textoVigenciaCreditosTravel(datos, p);
  valores.TEXTO_CREDITOS_FUERA_DE_TRAVEL = textoCreditosFueraDeTravel(datos, p);

  // El tope solo aparece en la clausula de topes cuando la campana lo tiene.
  if (datos.formaBeneficio === 'porcentaje' && !datos.sinTope && tieneValorTravel(datos.tope)) {
    valores.TOPE_TRAVEL = cantidadCreditos(datos.tope, p);
  }

  // Tres palabras que cambian entre los dos tipos, para no duplicar el bloque.
  var esDescuento = datos.tipo === 'descuento_travel';
  valores.VERBO_BENEFICIO_TRAVEL = esDescuento ? 'aplicar' : 'acreditar';
  valores.TEXTO_RESPONSABILIDAD_TRAVEL = esDescuento
    ? 'la correcta aplicación del descuento conforme a las condiciones de la Campaña'
    : 'la correcta acreditación de los Créditos conforme a las condiciones de la Campaña';
  valores.TEXTO_YA_OTORGADO_TRAVEL = esDescuento
    ? 'los descuentos ya aplicados'
    : 'los Beneficios ya acreditados';

  valores.TEXTO_NOTAS_DE_MODIFICACION = textoNotasDeModificacion(datos, p);

  return valores;
}

/**
 * Las notas de modificacion, al final del documento.
 *
 * Una campana que ya empezo no cambia sus condiciones en silencio: cada
 * ampliacion deja constancia con su fecha. Ver docs/MODELO_BASE_TRAVEL.md,
 * seccion 9.
 */
function textoNotasDeModificacion(entrada, pais) {
  var notas = entrada.modificaciones || [];
  if (notas.length === 0) return '';

  var esDescuento = entrada.tipo === 'descuento_travel';
  var cierre = esDescuento ? 'los descuentos ya aplicados se mantienen' : 'los Beneficios ya otorgados se mantienen';
  var parrafos = [];

  for (var i = 0; i < notas.length; i++) {
    var nota = notas[i] || {};
    var cambios = [];

    if (nota.fechaFin) {
      cambios.push('la vigencia de la Campaña se amplía hasta las ' + formatearHoraTravel(nota.horaFin) +
        ' del ' + formatearFecha(nota.fechaFin));
    }
    if (tieneValorTravel(nota.presupuesto)) {
      cambios.push('el presupuesto de la Campaña se amplía a **' + cantidadCreditos(nota.presupuesto, pais) + '**');
    }
    if (tieneValorTravel(nota.maxOrdenes)) {
      cambios.push('el máximo de órdenes con Beneficio se amplía a ' + letrasYCifraFemenino(nota.maxOrdenes));
    }
    if (tieneValorTravel(nota.unidades)) {
      cambios.push('las unidades con descuento se amplían a ' + letrasYCifraFemenino(nota.unidades));
    }
    if (cambios.length === 0) continue;

    parrafos.push(
      '**Modificación del ' + formatearFecha(nota.fecha) + '.** A partir de esta fecha, ' +
      listaY(cambios) + '. Las demás condiciones de la Campaña no cambian y ' + cierre + '.'
    );
  }
  return parrafos.join('\n');
}

/** La hora de una nota, con el formato del documento. */
function formatearHoraTravel(hora) {
  if (typeof formatearHora === 'function') return formatearHora(hora || '23:59');
  return String(hora || '23:59');
}

if (typeof module !== 'undefined') {
  module.exports = {
    TEXTO_SEGMENTO_TRAVEL_POR_OPCION: TEXTO_SEGMENTO_TRAVEL_POR_OPCION,
    TEXTO_METODO_PAGO_TRAVEL_POR_OPCION: TEXTO_METODO_PAGO_TRAVEL_POR_OPCION,
    TEXTO_VISIBILIDAD_POR_OPCION: TEXTO_VISIBILIDAD_POR_OPCION,
    textoSegmentoTravel: textoSegmentoTravel,
    textoMetodoPagoTravel: textoMetodoPagoTravel,
    textoPrecioAnunciado: textoPrecioAnunciado,
    textoProductosTravel: textoProductosTravel,
    textoAmbitoTravel: textoAmbitoTravel,
    textoDestinosTravel: textoDestinosTravel,
    textoHotelesTravel: textoHotelesTravel,
    vinetasDeCondicionesTravel: vinetasDeCondicionesTravel,
    textoBeneficioTravel: textoBeneficioTravel,
    textoBaseCalculoTravel: textoBaseCalculoTravel,
    textoEjemploTopeTravel: textoEjemploTopeTravel,
    textoLimiteOrdenesTravel: textoLimiteOrdenesTravel,
    textoAgotamientoVigenciaTravel: textoAgotamientoVigenciaTravel,
    textoLimiteCampanaTravel: textoLimiteCampanaTravel,
    textoConteoIdaRegresoTravel: textoConteoIdaRegresoTravel,
    textoCargaTravel: textoCargaTravel,
    textoRedencionTravel: textoRedencionTravel,
    textoDescuentoTravel: textoDescuentoTravel,
    textoMaximoDisponibleTravel: textoMaximoDisponibleTravel,
    textoVisibilidadTravel: textoVisibilidadTravel,
    textoAsistenciaTravel: textoAsistenciaTravel,
    textoVigenciaCreditosTravel: textoVigenciaCreditosTravel,
    textoCreditosFueraDeTravel: textoCreditosFueraDeTravel,
    textoNotasDeModificacion: textoNotasDeModificacion,
    calcularDerivadosTravel: calcularDerivadosTravel,
    sonTodasLasCategorias: sonTodasLasCategorias,
    categoriasRestantes: categoriasRestantes,
  };
}
