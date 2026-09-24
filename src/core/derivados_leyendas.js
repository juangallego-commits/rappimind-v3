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
  var formatearMiles = moduloNumerosLey.formatearMiles;

  var moduloFechasLey = require('./fechas.js');
  var formatearFecha = moduloFechasLey.formatearFecha;
  var formatearHora = moduloFechasLey.formatearHora;
  var partesDeFecha = moduloFechasLey.partesDeFecha;
  var listaY = moduloFechasLey.listaY;
  var separarPorComas = moduloFechasLey.separarPorComas;

  var moduloTextoLey = require('./texto.js');
  var tieneValor = moduloTextoLey.tieneValor;
  var tiendaDelCashback = moduloTextoLey.tiendaDelCashback;
  var incluyeTurbo = moduloTextoLey.incluyeTurbo;
  var direccionDeCampana = require('./nombres.js').direccionDeCampana;
  var SECCIONES_EXCLUIBLES_ETA = require('./derivados_eta.js').SECCIONES_EXCLUIBLES_ETA;
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
  if (!tieneValor(valor)) return '';
  var entero = Math.trunc(Number(valor));
  if (!isFinite(entero)) return '';
  return (pais.moneda_simbolo || '') + formatearMiles(entero, pais.separador_miles || '.');
}

/** FRAGMENTO: el porcentaje en cifra. "99%". */
function cifraDePorcentaje(valor) {
  if (!tieneValor(valor)) return '';
  return String(Number(valor)) + '%';
}

// --- La vigencia -----------------------------------------------------------

function esDiaCompleto(horaInicio, horaFin) {
  return (!tieneValor(horaInicio) || horaInicio === HORA_DE_ARRANQUE) &&
    (!tieneValor(horaFin) || horaFin === HORA_DE_CIERRE);
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
  var fin = tieneValor(entrada.fechaFin) ? entrada.fechaFin : entrada.fechaInicio;
  if (!tieneValor(inicio)) return '';

  var horaInicio = entrada.horaInicio;
  var horaFin = entrada.horaFin;
  var todoElDia = esDiaCompleto(horaInicio, horaFin);

  if (inicio === fin) {
    if (todoElDia) return 'el ' + formatearFecha(inicio);
    return 'el ' + formatearFecha(inicio) +
      ' entre las ' + formatearHora(horaInicio) + ' y las ' + formatearHora(horaFin);
  }

  if (!todoElDia) {
    return 'desde las ' + formatearHora(horaInicio) + ' del ' + formatearFecha(inicio) +
      ' hasta las ' + formatearHora(horaFin) + ' del ' + formatearFecha(fin);
  }

  return 'del ' + fechaAbreviadaContra(inicio, fin) + ' al ' + formatearFecha(fin);
}

/**
 * La primera fecha de un rango, sin repetir lo que la segunda ya dice.
 *
 * "del 9 al 13 de septiembre de 2026" dentro del mismo mes; "del 28 de
 * septiembre al 2 de octubre de 2026" entre meses; y con el ano cuando cambia.
 */
function fechaAbreviadaContra(inicio, fin) {
  var a = partesDeFecha(inicio);
  var b = partesDeFecha(fin);
  if (!a || !b) return formatearFecha(inicio);

  var completa = formatearFecha(inicio);
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
    for (var i = 0; i < SECCIONES_EXCLUIBLES_ETA.length; i++) {
      for (var e = 0; e < elegidas.length; e++) {
        if (elegidas[e] === SECCIONES_EXCLUIBLES_ETA[i].valor) {
          nombres.push(SECCIONES_EXCLUIBLES_ETA[i].nombre);
          break;
        }
      }
    }
    if (nombres.length === 0) return 'en cualquier sección de Rappi habilitada para Créditos';
    return 'en Rappi, excepto en ' + listaY(nombres);
  }
  if (entrada.redencion === 'tienda') {
    return tieneValor(valores.TIENDA) ? 'en ' + valores.TIENDA : '';
  }
  if (entrada.redencion === 'general') return 'en cualquier sección de Rappi habilitada para Créditos';
  /*
   * Las secciones, con sus nombres entre comillas como en el documento.
   *
   * Hasta el 20 de septiembre de 2026 esto devolvia cadena vacia y la campana se
   * quedaba sin leyenda, porque la respuesta del encargo 03 no dio frase corta
   * (insumo 5 de la lista 3) y aqui no se inventa una. Juan la escribio ese dia
   * (punto C3) y desde entonces esas campanas entregan sus cinco leyendas como
   * las demas.
   */
  if (entrada.redencion === 'secciones') {
    var secciones = entrada.secciones || [];
    if (secciones.length === 0) return '';
    var entrecomilladas = [];
    for (var s = 0; s < secciones.length; s++) entrecomilladas.push('“' + secciones[s] + '”');
    var articulo = entrecomilladas.length === 1 ? 'en la sección ' : 'en las secciones ';
    return articulo + listaY(entrecomilladas) + ' de Rappi';
  }
  return '';
}

/**
 * FRAGMENTO: el presupuesto dentro del anuncio, solo donde la ley lo pide.
 *
 * Vacio en todos los paises menos Peru. El articulo 14 del Codigo de Proteccion
 * y Defensa del Consumidor pide que el anuncio de una promocion diga su duracion
 * y las unidades disponibles, asi que alla la frase pasa de "o hasta agotar el
 * presupuesto disponible." a "o hasta agotar el presupuesto disponible de
 * {cifra}.". Juan lo decidio el 20 de septiembre de 2026 (punto C4).
 */
function textoPresupuestoCorto(entrada, pais) {
  if (!pais || pais.codigo !== 'PE') return '';
  var cifra = cifraDeMonto(entrada.presupuesto, pais);
  return cifra ? 'de ' + cifra : '';
}

/** FRAGMENTO: hasta cuando se pueden gastar los Creditos, en corto. */
function cuandoSeRedimen(entrada) {
  var cargaEnFecha = entrada.carga === 'fecha' && tieneValor(entrada.fechaCarga);

  if (entrada.vigencia === 'dias') {
    if (!tieneValor(entrada.diasVigencia)) return '';
    var dias = 'durante ' + Math.trunc(Number(entrada.diasVigencia)) + ' días';
    return cargaEnFecha
      ? dias + ' desde el ' + formatearFecha(entrada.fechaCarga)
      : dias + ' desde que los recibes';
  }

  if (entrada.vigencia === 'fecha') {
    if (!tieneValor(entrada.fechaFinRedencion)) return '';
    return cargaEnFecha
      ? 'del ' + fechaAbreviadaContra(entrada.fechaCarga, entrada.fechaFinRedencion) +
        ' al ' + formatearFecha(entrada.fechaFinRedencion)
      : 'hasta el ' + formatearFecha(entrada.fechaFinRedencion);
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
  var maximo = tieneValor(entrada.maxPedidos) ? entrada.maxPedidos : entrada.maxOrdenes;
  if (!tieneValor(maximo)) return '';

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
  var ciudades = separarPorComas(entrada.ciudades);
  if (ciudades.length === 0) return '';
  return 'Aplica solo en ' + listaY(ciudades) + '.';
}

/** ORACION opcional: a quien le sirve la campana. */
function textoSegmentoCorto(entrada, pais) {
  if (entrada.segmento === 'pro') {
    if (!tieneValor(pais.url_tc_pro)) return '';
    return 'Para acceder debes tener tu membresía Pro o Pro Black activa: ' + pais.url_tc_pro + '.';
  }
  if (entrada.segmento === 'nuevos') {
    return 'Solo para usuarios que hagan su primer pedido en Rappi durante la campaña.';
  }
  if (entrada.segmento === 'reactivados') {
    if (!tieneValor(entrada.diasSinCompra)) return '';
    return 'Solo para usuarios sin pedidos en Rappi en los ' + Math.trunc(Number(entrada.diasSinCompra)) +
      ' días anteriores al inicio de la campaña.';
  }
  return '';
}

/*
 * Los tres datos de la letra pequena de un descuento con T&C general.
 *
 * Legal los dejo especificados en la tabla 7B.2 de
 * docs/encargos/respuestas/03-leyendas.md, con su redaccion, y se quedaron sin
 * escribir: por eso leyenda_descuento_co existia en el catalogo y no la podia
 * armar nadie. Los textos son los del PLAYBOOK SSL y del PLAYBOOK LEGAL CO,
 * copiados, no redactados aqui.
 */

/**
 * ORACION: las existencias. Es obligatoria en la leyenda, no va entre
 * corchetes, asi que siempre dice algo: el numero cuando el comercial lo sabe y
 * "Hasta agotar existencias." cuando no.
 *
 * "10.000 unidades disponibles." / "1 unidad disponible." / "Hasta agotar
 * existencias." Las tres salen del PLAYBOOK SSL, diapositiva 1, punto 5, y de
 * las piezas reales 1 y 2.
 */
function textoExistencias(entrada, pais) {
  if (!tieneValor(entrada.unidadesDisponibles)) return 'Hasta agotar existencias.';
  var unidades = Math.trunc(Number(entrada.unidadesDisponibles));
  if (!isFinite(unidades) || unidades <= 0) return 'Hasta agotar existencias.';
  if (unidades === 1) return '1 unidad disponible.';
  return formatearMiles(unidades, (pais && pais.separador_miles) || '.') + ' unidades disponibles.';
}

/**
 * ORACION opcional: el maximo por usuario.
 *
 * "Maximo 1 unidad por usuario." / "Maximo 6 unidades por usuario."
 * PLAYBOOK LEGAL CO, diapositiva 4 ("maximo 6 unidades por orden o usuario") y
 * PIEZA REAL 2 ("1 und. por usuario"). La forma que se imprime es la que Juan
 * cerro el 20 de septiembre de 2026 y que la pantalla ya le pedia al comercial
 * que escribiera a mano.
 */
function textoUnidades(entrada) {
  if (!tieneValor(entrada.maxPorUsuario)) return '';
  var maximo = Math.trunc(Number(entrada.maxPorUsuario));
  if (!isFinite(maximo) || maximo <= 0) return '';
  if (maximo === 1) return 'Máximo 1 unidad por usuario.';
  return 'Máximo ' + maximo + ' unidades por usuario.';
}

/**
 * ORACION opcional: el rango, cuando el descuento no es uno solo.
 *
 * "Ofertas desde 10% hasta 40%." u "Ofertas entre $10.000 hasta $40.000.",
 * segun si el rango va en porcentaje o en dinero. Las dos formas son las del
 * PLAYBOOK SSL, diapositiva 1, copiadas tal cual, incluido el "entre ... hasta"
 * del segundo, que suena raro y no se corrige aqui: el texto es de Legal.
 * Anotado en docs/PENDIENTES_LEGAL.md por si lo quieren cambiar.
 */
function textoRango(entrada, pais) {
  var desde = entrada.rangoDesde;
  var hasta = entrada.rangoHasta;
  if (!tieneValor(desde) || !tieneValor(hasta)) return '';

  if (entrada.rangoEn === 'dinero') {
    var montoDesde = cifraDeMonto(desde, pais);
    var montoHasta = cifraDeMonto(hasta, pais);
    if (!montoDesde || !montoHasta) return '';
    return 'Ofertas entre ' + montoDesde + ' hasta ' + montoHasta + '.';
  }

  var porDesde = cifraDePorcentaje(desde);
  var porHasta = cifraDePorcentaje(hasta);
  if (!porDesde || !porHasta) return '';
  return 'Ofertas desde ' + porDesde + ' hasta ' + porHasta + '.';
}

/** ORACION opcional: el medio de pago, solo cuando restringe. */
function textoPagoCorto(entrada) {
  if (entrada.metodoPago === 'sin_efectivo') return 'Válido con cualquier medio de pago excepto efectivo.';
  if (entrada.metodoPago === 'rappicard') return 'Válido solo para pagos con RappiCard.';
  return '';
}

/**
 * ORACION opcional: en cual de las dos tiendas de la marca vale.
 *
 * Solo hay frase cuando la respuesta restringe. "En las dos" y "No tiene tienda
 * en Turbo" no dicen nada en la pieza, porque no hay nada que el usuario tenga
 * que saber antes de pedir.
 */
function frasePorTienda(cual) {
  if (cual === 'normal') return 'No aplica en pedidos por Turbo.';
  if (cual === 'turbo') return 'Válido solo en pedidos por Turbo.';
  return '';
}

function textoCondicionesCorto(entrada) {
  if (entrada.tipo === 'cashback_day') return textoCondicionesCortoMultitienda(entrada);
  return frasePorTienda(tiendaDelCashback(entrada));
}

/**
 * Lo mismo, con varias tiendas.
 *
 * Si todas dicen lo mismo va la frase de siempre. Si se mezclan, la pieza no
 * puede afirmar nada general y remite a los terminos, que es donde cada marca
 * tiene su propia vineta.
 *
 * Se comparan las frases, no las respuestas: "En las dos" y "No tiene tienda en
 * Turbo" no restringen nada, asi que una campana con unas y otras no tiene por
 * que mandar a nadie a leer los terminos.
 */
function textoCondicionesCortoMultitienda(entrada) {
  var tiendas = entrada.tiendas || [];
  if (tiendas.length === 0) return '';

  var primera = frasePorTienda(tiendaDelCashback(tiendas[0]));
  for (var i = 1; i < tiendas.length; i++) {
    if (frasePorTienda(tiendaDelCashback(tiendas[i])) !== primera) {
      return 'Revisa en los términos en qué tienda aplica cada marca.';
    }
  }
  return primera;
}

/** Si la campana es de Turbo, para saber si se pega la leyenda de Turbo. */
function esDeTurbo(entrada) {
  /*
   * El ETA no, aunque corra sobre Turbo.
   *
   * El complemento de Turbo termina en "*El tiempo de entrega es estimado y
   * depende de condiciones climaticas y de trafico", y en una campana de ETA eso
   * contradice la clausula donde Rappi se obliga a cumplir el ETA exhibido: la
   * pieza diria que el tiempo es un estimado y el documento que es una promesa.
   * Juan lo decidio el 20 de septiembre de 2026 (punto C5, pregunta 6 del
   * encargo 03). El aviso sigue valiendo en piezas que mencionan tiempos sin
   * garantizarlos, que son las de Turbo a secas.
   *
   * Las tres leyendas del ETA ya traen "Aplican terminos y condiciones Turbo"
   * escrito en su propio cuerpo, asi que no se pierde nada al no pegarlo.
   */
  if (entrada.tipo === 'cashback_eta') return false;

  // En el Multitienda cada marca responde por su cuenta: basta con que una
  // incluya Turbo para que la pieza lleve el complemento.
  if (entrada.tipo === 'cashback_day') {
    var tiendas = entrada.tiendas || [];
    for (var i = 0; i < tiendas.length; i++) {
      if (incluyeTurbo(tiendas[i])) return true;
    }
    return false;
  }
  return incluyeTurbo(entrada);
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
    // La marca que solo participa con su tienda de Turbo se nombra asi en la
    // pieza, que es como el usuario la encuentra en la app.
    if (tiendaDelCashback(tienda) === 'turbo') nombre += ' Turbo';
    if (tienda.nacional) {
      nombre += ' (todo el país)';
    } else {
      var ciudades = separarPorComas(tienda.ciudades);
      if (ciudades.length > 0) nombre += ' (' + listaY(ciudades) + ')';
    }
    nombres.push(nombre);
  }

  var lista = listaY(nombres);
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
  var cuantos = tieneValor(entrada.numeroGanadores) ? Math.trunc(Number(entrada.numeroGanadores)) : 1;

  if (entrada.criterioGanador === 'mayor_valor') {
    if (cuantos === 1) return 'Gana el usuario con el mayor valor en compras de los productos participantes.';
    return 'Ganan los ' + cuantos + ' usuarios con el mayor valor en compras de los productos participantes.';
  }

  /*
   * El otro criterio: gana quien haga mas pedidos.
   *
   * Hasta el 20 de septiembre de 2026 esta rama devolvia cadena vacia y la
   * Carrera que se ganaba por numero de pedidos se quedaba sin leyenda. Juan
   * escribio la frase ese dia (punto C3).
   */
  if (entrada.criterioGanador === 'mas_pedidos') {
    if (cuantos === 1) return 'Gana el usuario con el mayor número de pedidos válidos con productos participantes.';
    return 'Ganan los ' + cuantos + ' usuarios con el mayor número de pedidos válidos con productos participantes.';
  }

  return '';
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
  if (entrada.sinUnidades || !tieneValor(entrada.unidades)) return '';
  return 'las ' + Math.trunc(Number(entrada.unidades)) + ' unidades con descuento';
}

/** ORACION opcional: el aviso de condiciones de viaje. */
function textoCondicionesViaje(entrada) {
  var hayCondiciones = tieneValor(entrada.periodoViajeInicio) ||
    tieneValor(entrada.anticipacionDias) ||
    tieneValor(entrada.nochesMinimas) ||
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
  if (tieneValor(enlacePublicado)) return String(enlacePublicado).trim();
  if (!tieneValor(pais.ruta_promos) || !tieneValor(nombreCampana)) return '';
  var direccion = direccionDeCampana(nombreCampana);
  if (!direccion) return '';
  return SITIO_DE_PUBLICACION + pais.ruta_promos + '/' + direccion;
}

/**
 * Marcadores que hoy no se pueden llenar, y por que.
 *
 * No es un defecto: es una decision que falta. Una leyenda que solo depende de
 * uno de estos se entrega como pendiente, con su razon, en vez de salir rota o
 * de tumbar las otras cuatro.
 *
 * URL_CORTA estuvo aqui hasta que Juan decidio, el 18 de septiembre, que el
 * enlace tiene que ser el mismo en todas partes: no hay enlace corto y no lo va
 * a haber. Hoy lo que hay son los enlaces que un pais todavia no tiene.
 *
 * Desde el 20 de septiembre de 2026 (punto C4) las leyendas de campana del
 * cashback sirven tambien en Mexico, Peru, Argentina, Chile, Ecuador, Uruguay y
 * Costa Rica. Ninguno de esos siete tiene todavia ruta de publicacion, asi que
 * los dos formatos que empiezan por el enlace del T&C no se pueden armar. En vez
 * de entregarlos con un hueco, o de tumbar con ellos a los otros tres, cada uno
 * sale como "todavia no" con el nombre de lo que falta: es un dato de la fila
 * del pais, no codigo, y el dia que alguien lo escriba se desbloquean solos.
 */
var PENDIENTES_POR_MARCADOR = {
  URL_TC_CAMPANA: 'Falta la ruta con la que se publican los T&C de este país, así que todavía no hay enlace de la campaña',
  URL_TC_TURBO: 'Falta el enlace de los términos de Turbo de este país',
  URL_TC_PRO: 'Falta el enlace de los términos de RappiPro de este país',
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

  if (entrada.segmento === 'pro' && !tieneValor(pais.url_tc_pro)) {
    faltantes.push('el enlace de los términos de RappiPro de este país');
  }


  return faltantes;
}

/*
 * Lo que la pieza tiene que llevar y la leyenda no puede decir.
 *
 * Son reglas del arte, no texto legal: un icono es una imagen, y un titular lo
 * escribe el disenador. La herramienta no las puede imprimir, asi que las dice.
 * Salen de las respuestas de Juan del 20 de septiembre de 2026 a las preguntas
 * 7, 18 y 22 del encargo 03 (punto C5).
 *
 * Solo Colombia: las tres salen del SSL y del Playbook Legal CO. En los demas
 * paises lo deciden sus abogados en la prueba.
 */
var REGLA_ICONO_MAS_18 = 'La pieza lleva el ícono +18, también si la bebida es 0.0%: el requisito es para licores y cervezas, sin distinguir.';
var REGLA_TITULAR_DE_TURBO = 'Si el titular habla del tiempo de entrega, dice “en minutos*”, con asterisco, no un número. Un número de minutos solo va en las campañas de “15 minutos o Cashback”.';
var REGLA_AWARENESS = 'Si la pieza muestra un precio o un porcentaje, no es awareness: lleva esta leyenda completa, no la corta de awareness.';

var CATEGORIAS_CON_MAS_18 = ['licores', 'bebidas_sin_alcohol'];

function reglasDelArte(entrada, pais) {
  if (String((pais || {}).codigo || '').toUpperCase() !== 'CO') return [];
  var reglas = [];

  if (CATEGORIAS_CON_MAS_18.indexOf(String(entrada.categoriaProducto || '')) !== -1) {
    reglas.push(REGLA_ICONO_MAS_18);
  }

  // En el ETA el numero de minutos si va, y es justo la promesa de la campana.
  if (esDeTurbo(entrada) && entrada.tipo !== 'cashback_eta') {
    reglas.push(REGLA_TITULAR_DE_TURBO);
  }

  reglas.push(REGLA_AWARENESS);
  return reglas;
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

  var urlDeLaCampana = urlDelTcDeLaCampana(entrada, pais, config.nombreCampana, config.enlacePublicado);

  var cortos = {
    URL_TC_CAMPANA: urlDeLaCampana,
    /*
     * Un solo enlace, el mismo en todas partes, y ninguno en push y SMS.
     *
     * La respuesta del encargo 03 proponia un enlace corto aparte para que la
     * leyenda de push cupiera en 70 caracteres. Juan lo descarto el 18 de
     * septiembre: el enlace tiene que ser el mismo en la letra pequena, en el
     * banner y en la push, porque dos direcciones para el mismo T&C es una que
     * alguien va a copiar mal.
     *
     * El 20 de septiembre cerro la otra mitad (punto C2): la leyenda de push y
     * SMS sale sin enlace, porque el enlace se comia 35 de los 70 caracteres del
     * formato y en la practica casi nunca lo ponen. El push lleva al usuario a
     * la campana dentro de la app, y ahi esta el enlace al T&C. Sin el, la
     * leyenda cabe siempre y desaparece un aviso rojo que salia en todas las
     * campanas.
     *
     * URL_CORTA se queda como marcador, apuntando a la misma direccion de
     * campana, porque ninguna leyenda lo usa hoy pero el catalogo es de Legal y
     * puede volver a usarlo.
     */
    URL_CORTA: urlDeLaCampana,
    URL_TC_PRO: pais.url_tc_pro || '',
    PORCENTAJE_CIFRA: cifraDePorcentaje(entrada.porcentaje),
    TOPE_CIFRA: cifraDeMonto(entrada.tope, pais),
    MINIMO_CIFRA: cifraDeMonto(entrada.compraMinima, pais),
    TEXTO_VIGENCIA_CORTA: textoVigenciaCorta(entrada),
    TEXTO_PRESUPUESTO_CORTO: textoPresupuestoCorto(entrada, pais),
    TEXTO_CREDITOS_CORTO: textoCreditosCorto(entrada, valores),
    TEXTO_LIMITE_CORTO: textoLimiteCorto(entrada),
    TEXTO_TERRITORIO_CORTO: textoTerritorioCorto(entrada),
    TEXTO_SEGMENTO_CORTO: textoSegmentoCorto(entrada, pais),
    // El enlace del T&C que Legal ya publico, para el camino de los generales.
    URL_TC_GENERAL: String(entrada.urlTycGeneral || '').trim(),
    TEXTO_EXISTENCIAS: textoExistencias(entrada, pais),
    TEXTO_UNIDADES: textoUnidades(entrada),
    TEXTO_RANGO: textoRango(entrada, pais),
    TEXTO_PAGO_CORTO: textoPagoCorto(entrada),
    TEXTO_CONDICIONES_CORTO: textoCondicionesCorto(entrada),
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
    cortos.ETA_CORTO = tieneValor(entrada.etaMinutos)
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
    textoPresupuestoCorto: textoPresupuestoCorto,
    dondeSeRedimen: dondeSeRedimen,
    textoPremioCorto: textoPremioCorto,
    textoBeneficioTravelCorto: textoBeneficioTravelCorto,
    textoDescuentoTravelCorto: textoDescuentoTravelCorto,
    esDeTurbo: esDeTurbo,
    reglasDelArte: reglasDelArte,
    cifraDeMonto: cifraDeMonto,
    cifraDePorcentaje: cifraDePorcentaje,
  };
}
