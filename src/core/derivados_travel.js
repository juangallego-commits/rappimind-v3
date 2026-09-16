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

/** ORACION: con que se paga. */
function textoMetodoPagoTravel(entrada) {
  return TEXTO_METODO_PAGO_TRAVEL_POR_OPCION[entrada.metodoPago] || '';
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

/** ORACION: nacionales, internacionales o los dos. Vacio cuando son los dos. */
function textoAmbitoTravel(entrada, pais) {
  var paisLegal = (pais && pais.pais_legal) || '';
  if (entrada.ambito === 'nacional') {
    return 'Aplica únicamente para vuelos con origen y destino en ' + paisLegal +
      ' y para servicios que se presten en ' + paisLegal + '.';
  }
  if (entrada.ambito === 'internacional') {
    return 'Aplica únicamente para vuelos con origen o destino fuera de ' + paisLegal +
      ' y para servicios que se presten fuera de ' + paisLegal + '.';
  }
  return '';
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
    vinetas.push(
      'La compra debe hacerse con al menos ' + letrasYCifra(entrada.anticipacionDias) +
      ' días calendario de anticipación a la fecha de salida.'
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
    vinetas.push('La reserva de hotel debe ser de ' + letrasYCifraFemenino(entrada.nochesMinimas) + ' noches o más.');
  }

  if (tieneValorTravel(entrada.diasAlquilerMinimo) && tieneValorTravel(entrada.diasAlquilerMaximo)) {
    vinetas.push(
      'El alquiler de auto debe ser de entre ' + letrasYCifra(entrada.diasAlquilerMinimo) +
      ' y ' + letrasYCifra(entrada.diasAlquilerMaximo) + ' días.'
    );
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

  return 'El Beneficio aplica únicamente sobre el valor pagado con dinero real por la tarifa o la reserva de los Productos Participantes, ' + excluidos + '.';
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
    ' Créditos en una orden, el valor pagado debe ser de al menos ' +
    pais.moneda_simbolo + formatearMiles(umbral, pais.separador_miles) +
    '; si pagas menos, recibirás el ' + porcentaje + '% de lo pagado.'
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

  if (entrada.carga === 'dias_calendario') {
    return 'dentro de los ' + letrasYCifra(entrada.diasCarga) +
      ' días calendario siguientes a la finalización de la Campaña, siempre que tu reserva esté confirmada';
  }
  if (entrada.carga === 'dias_habiles') {
    return 'dentro de los ' + letrasYCifra(entrada.diasCarga) +
      ' días hábiles siguientes a la finalización de la Campaña, siempre que tu reserva esté confirmada';
  }
  return '';
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
  return 'un descuento de entre el **' + porcentajeEnLetras(entrada.porcentajeMinimo) +
    '** y el **' + porcentajeEnLetras(entrada.porcentaje) + '**, según el Producto Participante';
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
  return 'El descuento máximo del **' + porcentajeEnLetras(entrada.porcentaje) + '** aplica a ' +
    letrasYCifra(entrada.productosConMaximo) + ' de los Productos Participantes.';
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
  return 'tendrán una vigencia de ' + letrasYCifra(entrada.diasVigencia) + ' ' +
    ((pais && pais.termino_dias) || 'días calendario') + ' contados a partir de su carga';
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
  valores.TEXTO_REDENCION_TRAVEL = textoRedencionTravel(datos, p);
  valores.TEXTO_DESCUENTO_TRAVEL = textoDescuentoTravel(datos);
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
