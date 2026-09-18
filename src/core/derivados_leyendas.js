'use strict';

/**
 * Los marcadores cortos de las leyendas de piezas publicitarias.
 *
 * Ninguno agrega una pregunta: todos salen de los mismos hechos que llenan el
 * documento, asi que la leyenda y el T&C no se pueden contradecir. Eso es lo que
 * hace que valga la pena que los arme la herramienta y no una persona.
 *
 * Por que existen y no se reusan los del documento: los del documento son
 * oraciones largas. {{TEXTO_MINIMO_COMPRA}} pasa de 150 caracteres y
 * {{TOPE}} imprime "veinticinco mil (25.000) Creditos". En una letra pequena de
 * 620 caracteres no caben, y en una push de 70 menos.
 *
 * Las frases son de la seccion 7B.1 de docs/encargos/respuestas/03-leyendas.md,
 * copiadas tal cual. Regla 3 de CLAUDE.md: aqui no se redacta. Donde la
 * respuesta no dio frase, el marcador queda vacio y la leyenda no se entrega,
 * que es lo mismo que hace el documento cuando le falta un dato.
 */

/* En Node las dependencias se cargan con require; en Apps Script ya son globales. */
if (typeof module !== 'undefined' && typeof require === 'function') {
  var moduloNumerosLey = require('./numeros.js');
  var formatearMilesLey = moduloNumerosLey.formatearMiles;

  var moduloFechasLey = require('./fechas.js');
  var formatearFechaLey = moduloFechasLey.formatearFecha;
  var formatearHoraLey = moduloFechasLey.formatearHora;
  var partesDeFechaLey = moduloFechasLey.partesDeFecha;
  var listaYLey = moduloFechasLey.listaY;
  var separarPorComasLey = moduloFechasLey.separarPorComas;

  var tieneValorLey = require('./texto.js').tieneValor;
  var direccionDeCampanaLey = require('./nombres.js').direccionDeCampana;
  var SECCIONES_EXCLUIBLES_ETA_LEY = require('./derivados_eta.js').SECCIONES_EXCLUIBLES_ETA;
}

/** Donde vive el T&C publicado. La ruta del pais sale de la fila del pais. */
var SITIO_DE_PUBLICACION = 'https://promos.rappi.com/';

/**
 * Las horas que no se escriben.
 *
 * "Las horas se omiten cuando son 12:00 a. m. y 11:59 p. m." (seccion 7B.1). Son
 * las de una campana que corre el dia entero, y ponerlas solo gasta caracteres.
 */
var HORA_DE_ARRANQUE = '00:00';
var HORA_DE_CIERRE = '23:59';

// --- Cifras ----------------------------------------------------------------

/** FRAGMENTO: un monto como se escribe en una pieza. "$25.000". */
function cifraDeMonto(valor, pais) {
  if (!tieneValorLey(valor)) return '';
  var entero = Math.trunc(Number(valor));
  if (!isFinite(entero)) return '';
  return (pais.moneda_simbolo || '') + formatearMilesLey(entero, pais.separador_miles || '.');
}

/** FRAGMENTO: el porcentaje en cifra. "99%". */
function cifraDePorcentaje(valor) {
  if (!tieneValorLey(valor)) return '';
  return String(Number(valor)) + '%';
}

// --- La vigencia -----------------------------------------------------------

function esDiaCompleto(horaInicio, horaFin) {
  return (!tieneValorLey(horaInicio) || horaInicio === HORA_DE_ARRANQUE) &&
    (!tieneValorLey(horaFin) || horaFin === HORA_DE_CIERRE);
}

/**
 * FRAGMENTO: cuando vale la campana, en la forma corta de las piezas.
 *
 * Seis formas, segun si es un dia o varios y si lleva horas. La fecha larga
 * ("del 09 al 13 de septiembre de 2026") solo es exacta cuando la campana dura
 * lo mismo que los Creditos, asi que aqui se escribe la vigencia de la campana y
 * la de los Creditos va aparte, en TEXTO_CREDITOS_CORTO.
 */
function textoVigenciaCorta(entrada) {
  var inicio = entrada.fechaInicio;
  var fin = tieneValorLey(entrada.fechaFin) ? entrada.fechaFin : entrada.fechaInicio;
  if (!tieneValorLey(inicio)) return '';

  var horaInicio = entrada.horaInicio;
  var horaFin = entrada.horaFin;
  var todoElDia = esDiaCompleto(horaInicio, horaFin);

  if (inicio === fin) {
    if (todoElDia) return 'el ' + formatearFechaLey(inicio);
    return 'el ' + formatearFechaLey(inicio) +
      ' entre las ' + formatearHoraLey(horaInicio) + ' y las ' + formatearHoraLey(horaFin);
  }

  if (!todoElDia) {
    return 'desde las ' + formatearHoraLey(horaInicio) + ' del ' + formatearFechaLey(inicio) +
      ' hasta las ' + formatearHoraLey(horaFin) + ' del ' + formatearFechaLey(fin);
  }

  return 'del ' + fechaAbreviadaContra(inicio, fin) + ' al ' + formatearFechaLey(fin);
}

/**
 * La primera fecha de un rango, sin repetir lo que la segunda ya dice.
 *
 * "del 9 al 13 de septiembre de 2026" dentro del mismo mes; "del 28 de
 * septiembre al 2 de octubre de 2026" entre meses; y con el ano cuando cambia.
 */
function fechaAbreviadaContra(inicio, fin) {
  var a = partesDeFechaLey(inicio);
  var b = partesDeFechaLey(fin);
  if (!a || !b) return formatearFechaLey(inicio);

  var completa = formatearFechaLey(inicio);
  if (a.anio !== b.anio) return completa;
  if (a.mes !== b.mes) return completa.replace(/ de \d+$/, '');
  return String(a.dia);
}

// --- Los Creditos ----------------------------------------------------------

/** FRAGMENTO: donde se pueden gastar los Creditos, en corto. */
function dondeSeRedimen(entrada, valores) {
  if (entrada.tipo === 'cashback_day') return 'en la misma tienda del pedido';
  if (entrada.tipo === 'cashback_eta') {
    var nombres = [];
    var elegidas = entrada.exclusionesEta || [];
    for (var i = 0; i < SECCIONES_EXCLUIBLES_ETA_LEY.length; i++) {
      for (var e = 0; e < elegidas.length; e++) {
        if (elegidas[e] === SECCIONES_EXCLUIBLES_ETA_LEY[i].valor) {
          nombres.push(SECCIONES_EXCLUIBLES_ETA_LEY[i].nombre);
          break;
        }
      }
    }
    if (nombres.length === 0) return 'en cualquier sección de Rappi habilitada para Créditos';
    return 'en Rappi, excepto en ' + listaYLey(nombres);
  }
  if (entrada.redencion === 'tienda') {
    return tieneValorLey(valores.TIENDA) ? 'en ' + valores.TIENDA : '';
  }
  if (entrada.redencion === 'general') return 'en cualquier sección de Rappi habilitada para Créditos';
  // "secciones" no tiene frase corta aprobada: es el insumo 5 de la lista 3 de
  // la respuesta. Sin frase, la leyenda no se entrega. No se inventa aqui.
  return '';
}

/** FRAGMENTO: hasta cuando se pueden gastar los Creditos, en corto. */
function cuandoSeRedimen(entrada) {
  var cargaEnFecha = entrada.carga === 'fecha' && tieneValorLey(entrada.fechaCarga);

  if (entrada.vigencia === 'dias') {
    if (!tieneValorLey(entrada.diasVigencia)) return '';
    var dias = 'durante ' + Math.trunc(Number(entrada.diasVigencia)) + ' días';
    return cargaEnFecha
      ? dias + ' desde el ' + formatearFechaLey(entrada.fechaCarga)
      : dias + ' desde que los recibes';
  }

  if (entrada.vigencia === 'fecha') {
    if (!tieneValorLey(entrada.fechaFinRedencion)) return '';
    return cargaEnFecha
      ? 'del ' + fechaAbreviadaContra(entrada.fechaCarga, entrada.fechaFinRedencion) +
        ' al ' + formatearFechaLey(entrada.fechaFinRedencion)
      : 'hasta el ' + formatearFechaLey(entrada.fechaFinRedencion);
  }
  return '';
}

/** FRAGMENTO: "para redimir {donde} {cuando}". Vacio si falta cualquiera. */
function textoCreditosCorto(entrada, valores) {
  var donde = dondeSeRedimen(entrada, valores);
  var cuando = cuandoSeRedimen(entrada);
  if (!donde || !cuando) return '';
  return 'para redimir ' + donde + ' ' + cuando;
}

// --- Lo que el comercial ya respondio --------------------------------------

/**
 * ORACION: el maximo de pedidos por persona.
 *
 * En el ETA y en Travel se cuentan ordenes, no pedidos, porque asi lo dicen sus
 * modelos.
 */
function textoLimiteCorto(entrada) {
  var enOrdenes = entrada.tipo === 'cashback_eta' ||
    entrada.tipo === 'cashback_travel' || entrada.tipo === 'descuento_travel';
  var singular = enOrdenes ? 'orden' : 'pedido';
  var plural = enOrdenes ? 'órdenes' : 'pedidos';

  if (entrada.sinLimite || entrada.sinMaxOrdenes) {
    return 'Sin límite de ' + plural + ' por usuario.';
  }
  var maximo = tieneValorLey(entrada.maxPedidos) ? entrada.maxPedidos : entrada.maxOrdenes;
  if (!tieneValorLey(maximo)) return '';

  var cantidad = Math.trunc(Number(maximo));
  if (cantidad === 1) {
    return enOrdenes
      ? 'Válido en una sola orden por usuario.'
      : 'Válido en un solo ' + singular + ' por usuario.';
  }
  return 'Válido hasta en ' + cantidad + ' ' + plural + ' por usuario.';
}

/** ORACION opcional: las ciudades. Nacional no dice nada. */
function textoTerritorioCorto(entrada) {
  if (entrada.alcance !== 'Ciudades') return '';
  var ciudades = separarPorComasLey(entrada.ciudades);
  if (ciudades.length === 0) return '';
  return 'Aplica solo en ' + listaYLey(ciudades) + '.';
}

/** ORACION opcional: a quien le sirve la campana. */
function textoSegmentoCorto(entrada, pais) {
  if (entrada.segmento === 'pro') {
    if (!tieneValorLey(pais.url_tc_pro)) return '';
    return 'Para acceder debes tener tu membresía Pro o Pro Black activa: ' + pais.url_tc_pro + '.';
  }
  if (entrada.segmento === 'nuevos') {
    return 'Solo para usuarios que hagan su primer pedido en Rappi durante la campaña.';
  }
  if (entrada.segmento === 'reactivados') {
    if (!tieneValorLey(entrada.diasSinCompra)) return '';
    return 'Solo para usuarios sin pedidos en Rappi en los ' + Math.trunc(Number(entrada.diasSinCompra)) +
      ' días anteriores al inicio de la campaña.';
  }
  return '';
}

/** ORACION opcional: el medio de pago, solo cuando restringe. */
function textoPagoCorto(entrada) {
  if (entrada.metodoPago === 'sin_efectivo') return 'Válido con cualquier medio de pago excepto efectivo.';
  if (entrada.metodoPago === 'rappicard') return 'Válido solo para pagos con RappiCard.';
  return '';
}

/**
 * ORACION opcional: en que pedidos se gana.
 *
 * El consumo en el local depende de como se llame esa modalidad dentro de la
 * app, que es el insumo 3 de la lista 3 de la respuesta y sigue vacio en
 * data/paises.json. Sin nombre no hay frase, y sin frase no se entrega.
 */
function textoCondicionesCorto(entrada, pais) {
  var condiciones = entrada.condiciones || [];
  for (var i = 0; i < condiciones.length; i++) {
    if (condiciones[i] === 'turbo') return 'Válido solo en pedidos por Turbo.';
  }
  for (var c = 0; c < condiciones.length; c++) {
    if (condiciones[c] === 'consumo_local') {
      if (!tieneValorLey(pais.nombre_modalidad_local)) return '';
      return 'Válido solo en pedidos por “' + pais.nombre_modalidad_local + '”.';
    }
  }
  return '';
}

/** Si la campana es de Turbo, para saber si se pega la leyenda de Turbo. */
function esDeTurbo(entrada) {
  if (entrada.tipo === 'cashback_eta') return true;
  var condiciones = entrada.condiciones || [];
  for (var i = 0; i < condiciones.length; i++) {
    if (condiciones[i] === 'turbo') return true;
  }
  return false;
}

// --- Cashback Multitienda --------------------------------------------------

/** ORACION opcional: solo el Multitienda avisa que son varias tiendas. */
function textoTiendasSeleccionadas(entrada) {
  return entrada.tipo === 'cashback_day' ? 'En tiendas seleccionadas.' : '';
}

/**
 * FRAGMENTO: las tiendas del Multitienda.
 *
 * Con mas de cinco tiendas, o con mas de 200 caracteres, la lista se cambia sola
 * por la remision a los terminos: una letra pequena con quince nombres no la lee
 * nadie y no cabe.
 */
function listaTiendasCorta(entrada) {
  var tiendas = entrada.tiendas || [];
  if (tiendas.length === 0) return '';

  var nombres = [];
  for (var i = 0; i < tiendas.length; i++) {
    var tienda = tiendas[i];
    var nombre = String(tienda.marca || '').trim();
    if (!nombre) return '';
    if (tienda.nacional) {
      nombre += ' (todo el país)';
    } else {
      var ciudades = separarPorComasLey(tienda.ciudades);
      if (ciudades.length > 0) nombre += ' (' + listaYLey(ciudades) + ')';
    }
    nombres.push(nombre);
  }

  var lista = listaYLey(nombres);
  if (tiendas.length > 5 || lista.length > 200) return 'las tiendas participantes que aparecen en los términos';
  return lista;
}

// --- Carrera de Compras ----------------------------------------------------

/**
 * ORACION: quien gana.
 *
 * Solo el criterio de mayor valor tiene frase corta aprobada. El de mas pedidos
 * es el insumo 4 de la lista 3 de la respuesta: falta la frase y no se escribe
 * aqui.
 */
function textoGanadoresCorto(entrada) {
  if (entrada.criterioGanador !== 'mayor_valor') return '';
  var cuantos = tieneValorLey(entrada.numeroGanadores) ? Math.trunc(Number(entrada.numeroGanadores)) : 1;
  if (cuantos === 1) return 'Gana el usuario con el mayor valor en compras de los productos participantes.';
  return 'Ganan los ' + cuantos + ' usuarios con el mayor valor en compras de los productos participantes.';
}

/** FRAGMENTO: el premio. */
function textoPremioCorto(entrada, pais) {
  if (entrada.tipoPremio === 'fisico') return String(entrada.descripcionPremio || '').trim();
  if (entrada.tipoPremio === 'creditos') {
    var cifra = cifraDeMonto(entrada.creditosPremio, pais);
    return cifra ? cifra + ' en Créditos' : '';
  }
  return '';
}

// --- Rappi Travel ----------------------------------------------------------

/** ORACION: el beneficio de un cashback de Travel. */
function textoBeneficioTravelCorto(entrada, pais) {
  if (entrada.formaBeneficio === 'monto_fijo') {
    var fijo = cifraDeMonto(entrada.montoFijo, pais);
    return fijo ? fijo + ' en Créditos por cada orden que cumpla las condiciones.' : '';
  }
  if (entrada.formaBeneficio !== 'porcentaje') return '';

  var porcentaje = cifraDePorcentaje(entrada.porcentaje);
  if (!porcentaje) return '';
  var base = 'Cashback del ' + porcentaje + ' del valor pagado por tu reserva';
  if (entrada.sinTope) return base + '.';

  var tope = cifraDeMonto(entrada.tope, pais);
  if (!tope) return '';
  return base + ', con un máximo de ' + tope + ' en Créditos por orden.';
}

/** FRAGMENTO: el descuento de Travel, fijo o variable. */
function textoDescuentoTravelCorto(entrada) {
  if (entrada.formaDescuento === 'fijo') {
    var fijo = cifraDePorcentaje(entrada.porcentaje);
    return fijo ? 'Descuento del ' + fijo : '';
  }
  if (entrada.formaDescuento === 'variable') {
    var desde = cifraDePorcentaje(entrada.porcentajeMinimo);
    var hasta = cifraDePorcentaje(entrada.porcentaje);
    return desde && hasta ? 'Descuento de entre ' + desde + ' y ' + hasta : '';
  }
  return '';
}

/** FRAGMENTO opcional: cuantas unidades hay con descuento. */
function textoUnidadesTravel(entrada) {
  if (entrada.sinUnidades || !tieneValorLey(entrada.unidades)) return '';
  return 'las ' + Math.trunc(Number(entrada.unidades)) + ' unidades con descuento';
}

/** ORACION opcional: el aviso de condiciones de viaje. */
function textoCondicionesViaje(entrada) {
  var hayCondiciones = tieneValorLey(entrada.periodoViajeInicio) ||
    tieneValorLey(entrada.anticipacionDias) ||
    tieneValorLey(entrada.nochesMinimas) ||
    (entrada.fechasExcluidas || []).length > 0;
  if (!hayCondiciones) return '';
  return 'Aplican condiciones de viaje, como fechas y anticipación mínima, descritas en los términos.';
}

// --- Los enlaces -----------------------------------------------------------

/**
 * La direccion donde va a quedar publicado el T&C de esta campana.
 *
 * Se arma al generar, con la misma regla que ya usa la herramienta para
 * proponerle la direccion a quien publica, asi que la leyenda sale completa el
 * mismo dia. Queda marcada "enlace por confirmar" hasta que el comercial pegue
 * el enlace publicado; si es distinto, manda el pegado. Es el camino 4 de la
 * seccion 6 de la respuesta, que Juan aprobo el 18 de septiembre.
 */
function urlDelTcDeLaCampana(entrada, pais, nombreCampana, enlacePublicado) {
  if (tieneValorLey(enlacePublicado)) return String(enlacePublicado).trim();
  if (!tieneValorLey(pais.ruta_promos) || !tieneValorLey(nombreCampana)) return '';
  var direccion = direccionDeCampanaLey(nombreCampana);
  if (!direccion) return '';
  return SITIO_DE_PUBLICACION + pais.ruta_promos + '/' + direccion;
}

/**
 * Marcadores que hoy no se pueden llenar, y por que.
 *
 * No es un defecto: es una decision que falta. Una leyenda que solo depende de
 * uno de estos se entrega como pendiente, con su razon, en vez de salir rota o
 * de tumbar las otras cuatro.
 */
var PENDIENTES_POR_MARCADOR = {
  URL_CORTA: 'falta el enlace corto. Juan aprobó que sea una dirección propia dentro de promos.rappi.com, pero todavía no está definida la forma exacta ni quién crea la página',
};

/**
 * Lo que le falta a esta campana para poder tener leyenda, en palabras.
 *
 * No es lo mismo que un dato que el comercial olvido: son casos donde la
 * respuesta del encargo 03 no dio frase corta y, por la regla 3 de CLAUDE.md,
 * aqui no se escribe una. Sin frase no se entrega la leyenda, porque callar una
 * restriccion en la pieza es peor que no dar la pieza: el minimo irreductible de
 * la seccion 7D incluye la condicion del pedido y el segmento.
 *
 * Cada uno de estos esta anotado en docs/PENDIENTES_LEGAL.md con su numero de
 * insumo de la lista 3 de la respuesta.
 */
function faltantesParaLaLeyenda(entrada, pais) {
  var faltantes = [];

  if (entrada.redencion === 'secciones') {
    faltantes.push('cómo se dice en una pieza que los Créditos solo sirven en ciertas secciones');
  }

  var condiciones = entrada.condiciones || [];
  for (var i = 0; i < condiciones.length; i++) {
    if (condiciones[i] === 'consumo_local' && !tieneValorLey(pais.nombre_modalidad_local)) {
      faltantes.push('cómo se llama dentro de la app la modalidad de consumo en el local');
    }
  }

  if (entrada.segmento === 'pro' && !tieneValorLey(pais.url_tc_pro)) {
    faltantes.push('el enlace de los términos de RappiPro de este país');
  }

  if (entrada.tipo === 'carrera_compras' && entrada.criterioGanador &&
      entrada.criterioGanador !== 'mayor_valor') {
    faltantes.push('cómo se dice en una pieza que gana quien haga más pedidos');
  }

  return faltantes;
}

/**
 * Todos los marcadores cortos de una campana.
 *
 * Se calculan encima de los derivados del documento, asi que donde las dos
 * versiones comparten nombre (TEXTO_CIUDAD_ETA) manda la corta: en la pieza dice
 * "Bogota" y en el documento "la ciudad de Bogota".
 */
function calcularDerivadosDeLeyendas(entrada, pais, valoresDelDocumento, opciones) {
  var valores = valoresDelDocumento || {};
  var config = opciones || {};

  var cortos = {
    URL_TC_CAMPANA: urlDelTcDeLaCampana(entrada, pais, config.nombreCampana, config.enlacePublicado),
    URL_TC_PRO: pais.url_tc_pro || '',
    PORCENTAJE_CIFRA: cifraDePorcentaje(entrada.porcentaje),
    TOPE_CIFRA: cifraDeMonto(entrada.tope, pais),
    MINIMO_CIFRA: cifraDeMonto(entrada.compraMinima, pais),
    TEXTO_VIGENCIA_CORTA: textoVigenciaCorta(entrada),
    TEXTO_CREDITOS_CORTO: textoCreditosCorto(entrada, valores),
    TEXTO_LIMITE_CORTO: textoLimiteCorto(entrada),
    TEXTO_TERRITORIO_CORTO: textoTerritorioCorto(entrada),
    TEXTO_SEGMENTO_CORTO: textoSegmentoCorto(entrada, pais),
    TEXTO_PAGO_CORTO: textoPagoCorto(entrada),
    TEXTO_CONDICIONES_CORTO: textoCondicionesCorto(entrada, pais),
    TEXTO_TIENDAS_SELECCIONADAS: textoTiendasSeleccionadas(entrada),
    LISTA_TIENDAS_CORTA: listaTiendasCorta(entrada),
    TEXTO_GANADORES_CORTO: textoGanadoresCorto(entrada),
    TEXTO_PREMIO_CORTO: textoPremioCorto(entrada, pais),
    TEXTO_BENEFICIO_TRAVEL_CORTO: textoBeneficioTravelCorto(entrada, pais),
    TEXTO_DESCUENTO_TRAVEL_CORTO: textoDescuentoTravelCorto(entrada),
    TEXTO_UNIDADES_TRAVEL: textoUnidadesTravel(entrada),
    TEXTO_CONDICIONES_VIAJE: textoCondicionesViaje(entrada),
    REGISTRO_SANITARIO: String(entrada.registroSanitario || '').trim(),
    NOTIFICACION_INVIMA: String(entrada.notificacionInvima || '').trim(),
  };

  // En Rappi Travel no hay tienda: quien fondea es la marca aliada, y es la que
  // va en "Cashback ofrecido por". Sin esto la frase salia sin nombre.
  if (entrada.tipo === 'cashback_travel' || entrada.tipo === 'descuento_travel') {
    cortos.TIENDA = String(entrada.marcaAliado || '').trim() ||
      String(entrada.organizadorRazonSocial || '').trim();
  }

  // El tiempo prometido y la ciudad del ETA, en la forma corta de la pieza.
  if (entrada.tipo === 'cashback_eta') {
    cortos.ETA_CORTO = tieneValorLey(entrada.etaMinutos)
      ? Math.trunc(Number(entrada.etaMinutos)) + ' minutos'
      : '';
    cortos.TEXTO_CIUDAD_ETA = String(entrada.ciudades || '').trim();
  }

  var salida = {};
  for (var llave in valores) {
    if (Object.prototype.hasOwnProperty.call(valores, llave)) salida[llave] = valores[llave];
  }
  for (var corto in cortos) {
    if (Object.prototype.hasOwnProperty.call(cortos, corto)) salida[corto] = cortos[corto];
  }
  return salida;
}

if (typeof module !== 'undefined') {
  module.exports = {
    SITIO_DE_PUBLICACION: SITIO_DE_PUBLICACION,
    calcularDerivadosDeLeyendas: calcularDerivadosDeLeyendas,
    faltantesParaLaLeyenda: faltantesParaLaLeyenda,
    PENDIENTES_POR_MARCADOR: PENDIENTES_POR_MARCADOR,
    urlDelTcDeLaCampana: urlDelTcDeLaCampana,
    textoVigenciaCorta: textoVigenciaCorta,
    textoCreditosCorto: textoCreditosCorto,
    textoLimiteCorto: textoLimiteCorto,
    textoTerritorioCorto: textoTerritorioCorto,
    textoSegmentoCorto: textoSegmentoCorto,
    textoPagoCorto: textoPagoCorto,
    textoCondicionesCorto: textoCondicionesCorto,
    listaTiendasCorta: listaTiendasCorta,
    textoGanadoresCorto: textoGanadoresCorto,
    textoPremioCorto: textoPremioCorto,
    textoBeneficioTravelCorto: textoBeneficioTravelCorto,
    textoDescuentoTravelCorto: textoDescuentoTravelCorto,
    esDeTurbo: esDeTurbo,
    cifraDeMonto: cifraDeMonto,
    cifraDePorcentaje: cifraDePorcentaje,
  };
}
