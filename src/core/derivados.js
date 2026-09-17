'use strict';

/**
 * Derivados: convierte los hechos del formulario en los valores que entran a
 * los modelos.
 *
 * Regla 3 de CLAUDE.md: el texto legal es de Legal. Las frases de este archivo
 * salen de la seccion 5 de docs/ESPECIFICACION_V3.md y no se reescriben aqui.
 *
 * Marca ORACION: devuelve oracion completa (mayuscula inicial y punto final).
 * Marca FRAGMENTO: se inserta dentro de otra frase (sin mayuscula ni punto).
 */

/* En Node las dependencias se cargan con require; en Apps Script ya son globales. */
if (typeof module !== 'undefined' && typeof require === 'function') {
  var moduloNumeros = require('./numeros.js');
  var numeroEnLetras = moduloNumeros.numeroEnLetras;
  var letrasYCifra = moduloNumeros.letrasYCifra;
  var cantidadCreditos = moduloNumeros.cantidadCreditos;
  var montoConMoneda = moduloNumeros.montoConMoneda;
  var porcentajeEnLetras = moduloNumeros.porcentajeEnLetras;

  var moduloFechas = require('./fechas.js');
  var formatearFecha = moduloFechas.formatearFecha;
  var formatearHora = moduloFechas.formatearHora;
  var listaY = moduloFechas.listaY;
  var separarPorComas = moduloFechas.separarPorComas;

  var moduloIdentificaciones = require('./identificaciones.js');
  var validarIdentificacion = moduloIdentificaciones.validarIdentificacion;

  var nombreDeCampana = require('./nombres.js').nombreDeCampana;
  var moduloEsquemas2 = require('./esquemas.js');
  var esquemaDe = moduloEsquemas2.esquemaDe;

  var calcularDerivadosTravel = require('./derivados_travel.js').calcularDerivadosTravel;
  var calcularDerivadosBr = require('./derivados_br.js').calcularDerivadosBr;
  var calcularDerivadosEta = require('./derivados_eta.js').calcularDerivadosEta;
  var conElIdiomaDe = require('./idiomas.js').conElIdiomaDe;
  var tieneValor = require('./texto.js').tieneValor;
}

// --- Textos fijos de Legal -------------------------------------------------

var TEXTO_SEGMENTO_POR_OPCION = {
  todos: 'Pueden participar todos los Usuarios/Consumidores de la Plataforma Rappi que sean mayores de edad.',
  pro: 'Pueden participar los Usuarios/Consumidores que tengan activa la suscripción RappiPro y/o RappiPro Black.',
  nuevos: 'Pueden participar únicamente los Usuarios/Consumidores mayores de edad que realicen su primer pedido en la Plataforma Rappi durante la vigencia de la Campaña.',
};

var TEXTO_METODO_PAGO_POR_OPCION = {
  todos: 'Campaña válida para pedidos pagados con cualquiera de los medios de pago habilitados en la Plataforma Rappi. Los pedidos pagados total o parcialmente con Créditos no son válidos para la Campaña.',
  sin_efectivo: 'Campaña válida para pedidos pagados con todos los medios de pago habilitados en la Plataforma Rappi, excepto efectivo. Los pedidos pagados en efectivo, o total o parcialmente con Créditos, no son válidos para la Campaña.',
  rappicard: 'Campaña válida únicamente para pedidos pagados con RappiCard. Los pedidos pagados total o parcialmente con Créditos no son válidos para la Campaña.',
};

var TEXTO_CONDICION_POR_OPCION = {
  turbo: 'El Beneficio aplica únicamente para pedidos realizados a través de Turbo.',
  consumo_local: 'El Beneficio aplica únicamente para pedidos realizados bajo la modalidad de consumo en el local disponible en la Plataforma Rappi.',
};

var TEXTO_CARGA_POR_OPCION = {
  inmediata: 'de manera inmediata una vez finalizada la orden',
  dia_siguiente: 'al día siguiente de la finalización de la orden',
};

var TEXTO_LUGAR_REDENCION_POR_OPCION = {
  tienda: 'Los Créditos podrán redimirse únicamente en la Tienda Participante donde se originó el Beneficio, dentro del Territorio.',
  general: 'Los Créditos podrán redimirse en cualquier sección de la Plataforma Rappi habilitada para el uso de Créditos, dentro del Territorio.',
};

var CRITERIO_GANADOR_POR_OPCION = {
  mayor_valor: 'el mayor valor total en compras de Productos Participantes',
  mas_pedidos: 'el mayor número de pedidos válidos con Productos Participantes',
};

var TEXTO_DESEMPATE_POR_OPCION = {
  primero: 'En caso de empate, ganará el participante que haya alcanzado primero el resultado empatado, según la fecha y hora de su último pedido válido.',
  mas_pedidos: 'En caso de empate, ganará el participante con el mayor número de pedidos válidos durante la vigencia.',
  mayor_valor: 'En caso de empate, ganará el participante con el mayor valor total en compras durante la vigencia.',
};

var TEXTO_ENTREGA_POR_OPCION = {
  organizador: 'La entrega del premio estará a cargo exclusivamente del Organizador, quien coordinará directamente con el ganador las condiciones de tiempo, modo y lugar de entrega, siendo el único responsable de la misma.',
  rappi: 'La entrega del premio será gestionada por Rappi en su calidad de operador logístico y por cuenta del Organizador, quien conserva la calidad de responsable del premio; Rappi coordinará con el ganador las condiciones de tiempo, modo y lugar de entrega.',
};

var MEDIO_NOTIFICACION_POR_OPCION = {
  correo: 'el correo electrónico registrado en la cuenta del ganador',
  llamada: 'una llamada telefónica al número registrado en la cuenta del ganador',
  plataforma: 'una notificación dentro de la Plataforma Rappi',
};

/** Llaves de paises.json que entran al documento tal cual. */
var VALORES_DEL_PAIS = {
  ENTIDAD_LEGAL: 'entidad_legal',
  ID_FISCAL: 'id_fiscal',
  DOMICILIO_LEGAL: 'domicilio_legal',
  PAIS_LEGAL: 'pais_legal',
  LEY_APLICABLE: 'ley_aplicable',
  JURISDICCION: 'jurisdiccion',
  ENTIDAD_VIGILANCIA: 'entidad_vigilancia',
  AUTORIDAD_DATOS: 'autoridad_datos',
  URL_TC_PLATAFORMA: 'url_tc_plataforma',
  URL_PRIVACIDAD: 'url_privacidad',
  URL_TC_CREDITOS: 'url_tc_creditos',
  URL_TC_TURBO: 'url_tc_turbo',
  POLITICA_PRIVACIDAD: 'politica_privacidad',
  TEXTO_DERECHOS_DATOS: 'texto_derechos_datos',
  EDAD_MINIMA: 'edad_minima',
  TEXTO_PERSONA: 'texto_persona',
  TEXTO_HORA_LOCAL: 'texto_hora_local',
};

// --- Ayudas ----------------------------------------------------------------

/** FRAGMENTO: territorio de la campana. */
function textoTerritorio(entrada, pais) {
  if (entrada.alcance === 'Nacional') {
    return 'el territorio nacional de ' + pais.pais_legal;
  }
  var ciudades = separarPorComas(entrada.ciudades);
  if (ciudades.length === 0) return '';
  var encabezado = ciudades.length === 1 ? 'la ciudad de ' + ciudades[0] : 'las ciudades de ' + listaY(ciudades);
  return encabezado + ', en ' + pais.pais_legal;
}

/** ORACION: quien puede participar. */
function textoSegmento(entrada) {
  if (entrada.segmento === 'reactivados') {
    var dias = Number(entrada.diasSinCompra);
    if (!dias) return '';
    return (
      'Pueden participar únicamente los Usuarios/Consumidores mayores de edad que no hayan realizado pedidos ' +
      'en la Plataforma Rappi durante los ' + letrasYCifra(dias) + ' días anteriores al inicio de la Campaña.'
    );
  }
  return TEXTO_SEGMENTO_POR_OPCION[entrada.segmento] || '';
}

/** ORACION: maximo de pedidos con beneficio. */
function textoLimitePedidos(entrada) {
  if (entrada.sinLimite) {
    return 'La Campaña no establece un número máximo de pedidos con Beneficio por Usuario/Consumidor, sin perjuicio del presupuesto disponible.';
  }
  var maximo = Number(entrada.maxPedidos);
  if (!maximo) return '';
  var sustantivo = maximo === 1 ? 'pedido' : 'pedidos';
  return (
    'Puedes obtener el Beneficio en un máximo de ' + letrasYCifra(maximo) + ' ' + sustantivo +
    ' durante la vigencia de la Campaña; los pedidos adicionales no generarán el Beneficio y se procesarán como pedidos regulares.'
  );
}

/** FRAGMENTO: cuando se cargan los Creditos. */
function textoCarga(entrada) {
  var fijo = TEXTO_CARGA_POR_OPCION[entrada.carga];
  if (fijo) return fijo;
  if (entrada.carga === 'fecha' && entrada.fechaCarga) {
    return 'el ' + formatearFecha(entrada.fechaCarga);
  }
  return '';
}

/** FRAGMENTO: hasta cuando sirven los Creditos. */
function textoVigenciaCreditos(entrada, pais) {
  if (entrada.vigencia === 'dias') {
    var dias = Number(entrada.diasVigencia);
    if (!dias) return '';
    return 'tendrán una vigencia de ' + letrasYCifra(dias) + ' ' + pais.termino_dias + ' contados a partir de su carga';
  }
  if (entrada.vigencia === 'fecha' && entrada.fechaFinRedencion) {
    return 'podrán redimirse hasta las 11:59 p. m. del ' + formatearFecha(entrada.fechaFinRedencion);
  }
  return '';
}

/** ORACION: donde se pueden redimir los Creditos. */
function textoLugarRedencion(entrada) {
  var fijo = TEXTO_LUGAR_REDENCION_POR_OPCION[entrada.redencion];
  if (fijo) return fijo;
  if (entrada.redencion !== 'secciones') return '';

  var secciones = entrada.secciones || [];
  if (secciones.length === 0) return '';
  var entrecomilladas = [];
  for (var i = 0; i < secciones.length; i++) {
    entrecomilladas.push('“' + secciones[i] + '”');
  }
  var articulo = entrecomilladas.length === 1 ? 'la sección' : 'las secciones';
  return (
    'Los Créditos podrán redimirse en cualquier tienda de ' + articulo + ' ' + listaY(entrecomilladas) +
    ' de la Plataforma Rappi, dentro del Territorio.'
  );
}

/** ORACION: que productos participan en la Carrera. */
function textoProductos(entrada) {
  if (entrada.productos === 'todos') {
    return 'Participan en el concurso todos los productos del catálogo de la Tienda Participante en la Plataforma Rappi (en adelante, los “Productos Participantes”).';
  }
  if (entrada.productos === 'marca') {
    return (
      'Participan en el concurso únicamente los productos de la marca ' + (entrada.makerMarca || '') +
      ' disponibles en la Tienda Participante a través de la Plataforma Rappi (en adelante, los “Productos Participantes”).'
    );
  }
  if (entrada.productos === 'especificos') {
    return (
      'Participan en el concurso únicamente los siguientes productos de la Tienda Participante ' +
      '(en adelante, los “Productos Participantes”): ' + (entrada.productosLista || '') + '.'
    );
  }
  return '';
}

/** Derivados propios de la Carrera de Compras. */
function derivadosCarrera(entrada, pais, valores) {
  valores.TEXTO_PRODUCTOS = textoProductos(entrada);
  valores.CRITERIO_GANADOR = CRITERIO_GANADOR_POR_OPCION[entrada.criterioGanador] || '';
  valores.TEXTO_DESEMPATE = TEXTO_DESEMPATE_POR_OPCION[entrada.desempate] || '';

  var ganadores = Number(entrada.numeroGanadores);
  valores.FRASE_GANADORES = !ganadores
    ? ''
    : ganadores === 1
      ? 'Resultará ganador el participante que ocupe la primera posición del ranking.'
      : 'Resultarán ganadores los ' + letrasYCifra(ganadores) + ' participantes que ocupen las primeras posiciones del ranking.';

  var quien = ganadores > 1 ? 'Cada ganador' : 'El ganador';
  if (entrada.tipoPremio === 'creditos' && tieneValor(entrada.creditosPremio)) {
    valores.LISTA_PREMIOS = quien + ' recibirá ' + cantidadCreditos(entrada.creditosPremio, pais) + ', que serán acreditados en su Billetera de Créditos.';
    valores.TEXTO_NATURALEZA_PREMIO =
      'El premio consiste en Créditos acreditados en la Billetera de Créditos de la Plataforma Rappi, los cuales son intangibles, ' +
      'no constituyen dinero en efectivo, no son transferibles a terceros y se rigen por los Términos y Condiciones de Funcionamiento ' +
      'de los Créditos de la Plataforma Rappi, disponibles en: ' + pais.url_tc_creditos + '.';
  } else if (entrada.tipoPremio === 'fisico' && tieneValor(entrada.descripcionPremio)) {
    valores.LISTA_PREMIOS = quien + ' recibirá el siguiente premio: ' + entrada.descripcionPremio + '.';
    valores.TEXTO_NATURALEZA_PREMIO =
      'El premio consiste en un bien de carácter físico, cuya existencia, calidad, garantía y entrega son responsabilidad exclusiva ' +
      'del Organizador. Rappi no fabrica, comercializa ni garantiza dicho bien.';
  }

  valores.TEXTO_ENTREGA = TEXTO_ENTREGA_POR_OPCION[entrada.entregaPor] || '';
  // Solo se comparten datos cuando entrega el Organizador.
  valores.TEXTO_DATOS_ENTREGA =
    entrada.entregaPor === 'organizador'
      ? 'Para la entrega del premio, Rappi podrá compartir con el Organizador únicamente los datos de contacto del ganador que sean estrictamente necesarios para ese fin, previa autorización del ganador.'
      : '';

  valores.MEDIO_NOTIFICACION = MEDIO_NOTIFICACION_POR_OPCION[entrada.medioNotificacion] || '';
  valores.FECHA_NOTIFICACION = entrada.fechaNotificacion ? formatearFecha(entrada.fechaNotificacion) : '';

  var plazo = Number(entrada.plazoConfirmacion);
  valores.PLAZO_CONFIRMACION = plazo ? letrasYCifra(plazo) + ' ' + (plazo === 1 ? 'día hábil' : 'días hábiles') : '';

  valores.TEXTO_UMBRAL = tieneValor(entrada.compraMinima)
    ? 'Únicamente contabilizarán para el concurso los pedidos cuyo valor sea igual o superior a ' + montoConMoneda(entrada.compraMinima, pais) + '.'
    : 'No se exige un valor mínimo de compra por pedido para participar en la Campaña.';
}

/** Valores de una tienda del Cashback Day. */
function valoresDeTienda(tienda, pais) {
  var identificacion = validarIdentificacion(pais.codigo, tienda.id);
  return {
    TIENDA_MARCA: tienda.marca || '',
    TIENDA_RAZON_SOCIAL: tienda.razonSocial || '',
    TIENDA_ID: identificacion.valido ? identificacion.formateado : '',
    TIENDA_CIUDADES: tienda.nacional ? 'cobertura nacional' : listaY(separarPorComas(tienda.ciudades)),
    TIENDA_PRESUPUESTO: tieneValor(tienda.presupuesto) ? cantidadCreditos(tienda.presupuesto, pais) : '',
  };
}

/**
 * Calcula todos los valores del documento a partir de la entrada y del pais.
 * No valida: validar es trabajo de validaciones.js.
 *
 * Este es el unico sitio donde se enciende el idioma. Todo lo que sale impreso
 * pasa por aqui, asi que basta con fijar el idioma del pais al entrar y
 * devolverlo a espanol al salir: no hay que pasarle el idioma a cada una de las
 * cincuenta y cuatro llamadas a fechas y numeros que hay aqui dentro.
 */
function calcularDerivados(entrada, pais) {
  return conElIdiomaDe(pais, function () {
    return calcularDerivadosEnElIdiomaDelPais(entrada, pais);
  });
}

function calcularDerivadosEnElIdiomaDelPais(entrada, pais) {
  var valores = {};

  // El nombre no lo escribe nadie: sale de las respuestas, asi que el titulo
  // del documento no puede contradecir el articulado. Ver src/core/nombres.js.
  valores.NOMBRE_CAMPANA = nombreDeCampana(entrada, esquemaDe(entrada.tipo));
  valores.NOMBRE_CAMPANA_MAYUS = valores.NOMBRE_CAMPANA.toUpperCase();
  valores.TIENDA = entrada.tienda || '';
  valores.TEXTO_TERRITORIO = textoTerritorio(entrada, pais);

  valores.FECHA_INICIO = entrada.fechaInicio ? formatearFecha(entrada.fechaInicio) : '';
  valores.FECHA_FIN = entrada.fechaFin ? formatearFecha(entrada.fechaFin) : '';
  valores.HORA_INICIO = entrada.horaInicio ? formatearHora(entrada.horaInicio) : '';
  valores.HORA_FIN = entrada.horaFin ? formatearHora(entrada.horaFin) : '';

  valores.ORGANIZADOR = entrada.organizadorRazonSocial || '';
  if (tieneValor(entrada.organizadorId)) {
    var identificacion = validarIdentificacion(pais.codigo, entrada.organizadorId);
    valores.ID_ORGANIZADOR = identificacion.valido ? identificacion.formateado : '';
  } else {
    valores.ID_ORGANIZADOR = '';
  }

  valores.TEXTO_SEGMENTO = textoSegmento(entrada);
  valores.TEXTO_METODO_PAGO = TEXTO_METODO_PAGO_POR_OPCION[entrada.metodoPago] || '';

  valores.TEXTO_MINIMO_COMPRA = tieneValor(entrada.compraMinima)
    ? 'Para acceder al Beneficio, el valor de los productos de tu pedido deberá ser igual o superior a ' +
      montoConMoneda(entrada.compraMinima, pais) +
      ', sin incluir el costo de envío, la tarifa de servicio ni las propinas.'
    : '';

  valores.TEXTO_LIMITE_PEDIDOS = textoLimitePedidos(entrada);

  var condiciones = entrada.condiciones || [];
  var frases = [];
  for (var i = 0; i < condiciones.length; i++) {
    var frase = TEXTO_CONDICION_POR_OPCION[condiciones[i]];
    if (frase) frases.push(frase);
  }
  valores.TEXTO_CONDICIONES = frases.join(' ');

  if (tieneValor(entrada.porcentaje)) valores.PORCENTAJE = porcentajeEnLetras(entrada.porcentaje);
  if (tieneValor(entrada.tope)) valores.TOPE = cantidadCreditos(entrada.tope, pais);
  if (tieneValor(entrada.presupuesto)) valores.PRESUPUESTO = cantidadCreditos(entrada.presupuesto, pais);

  if (tieneValor(entrada.carga)) valores.TEXTO_CARGA = textoCarga(entrada);
  if (tieneValor(entrada.vigencia)) valores.TEXTO_VIGENCIA_CREDITOS = textoVigenciaCreditos(entrada, pais);
  if (tieneValor(entrada.redencion)) valores.TEXTO_LUGAR_REDENCION = textoLugarRedencion(entrada);

  if (entrada.tipo === 'carrera_compras') {
    derivadosCarrera(entrada, pais, valores);
  }

  for (var placeholder in VALORES_DEL_PAIS) {
    if (Object.prototype.hasOwnProperty.call(VALORES_DEL_PAIS, placeholder)) {
      valores[placeholder] = pais[VALORES_DEL_PAIS[placeholder]] || '';
    }
  }

  // Rappi Travel tiene su propia entidad, sus propios textos y su propio
  // archivo. Se agregan encima, sin tocar nada de delivery.
  var esquemaActual = esquemaDe(entrada.tipo);
  if (esquemaActual && esquemaActual.esDeTravel) {
    var deTravel = calcularDerivadosTravel(entrada, pais);
    for (var llaveTravel in deTravel) {
      if (Object.prototype.hasOwnProperty.call(deTravel, llaveTravel)) valores[llaveTravel] = deTravel[llaveTravel];
    }
  }

  // El cashback por ETA no tiene aliado ni tienda unica: participan todas las
  // tiendas Turbo de una ciudad y el presupuesto lo pone Rappi.
  if (esquemaActual && esquemaActual.esPorEta) {
    var deEta = calcularDerivadosEta(entrada, pais);
    for (var llaveEta in deEta) {
      if (Object.prototype.hasOwnProperty.call(deEta, llaveEta)) valores[llaveEta] = deEta[llaveEta];
    }
  }

  // Brasil tiene su propio modelo y sus propios textos, en portugues y con su
  // excepcion sobre el organizador. Mismo patron que Travel: encima, sin tocar
  // nada de delivery.
  if (esquemaActual && esquemaActual.esDeBrasil) {
    var deBrasil = calcularDerivadosBr(entrada, pais);
    for (var llaveBr in deBrasil) {
      if (Object.prototype.hasOwnProperty.call(deBrasil, llaveBr)) valores[llaveBr] = deBrasil[llaveBr];
    }
  }

  return valores;
}

if (typeof module !== 'undefined') {
  module.exports = {
    calcularDerivados: calcularDerivados,
    valoresDeTienda: valoresDeTienda,
    textoTerritorio: textoTerritorio,
    textoSegmento: textoSegmento,
    textoLimitePedidos: textoLimitePedidos,
    textoLugarRedencion: textoLugarRedencion,
    textoProductos: textoProductos,
    TEXTO_SEGMENTO_POR_OPCION: TEXTO_SEGMENTO_POR_OPCION,
    TEXTO_METODO_PAGO_POR_OPCION: TEXTO_METODO_PAGO_POR_OPCION,
    TEXTO_CONDICION_POR_OPCION: TEXTO_CONDICION_POR_OPCION,
  };
}
