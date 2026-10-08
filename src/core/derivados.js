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
  var calcularDerivadosDescuento = require('./derivados_descuento.js').calcularDerivadosDescuento;
  var calcularDerivadosBr = require('./derivados_br.js').calcularDerivadosBr;
  var moduloEta = require('./derivados_eta.js');
  var calcularDerivadosEta = moduloEta.calcularDerivadosEta;
  var textoSeccionesExcluidas = moduloEta.textoSeccionesExcluidas;
  var conElIdiomaDe = require('./idiomas.js').conElIdiomaDe;
  var moduloTextoDerivados = require('./texto.js');
  var tieneValor = moduloTextoDerivados.tieneValor;
  var tiendaDelCashback = moduloTextoDerivados.tiendaDelCashback;
  var terminoDeDias = moduloTextoDerivados.terminoDeDias;
  var tiendasDeLaCarrera = moduloTextoDerivados.tiendasDeLaCarrera;
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

/*
 * En cual de las dos tiendas de la marca se gana el cashback.
 *
 * Va en la clausula "Tienda y productos participantes", detras de la frase que
 * ya tiene. Antes esto era "El Beneficio aplica unicamente para pedidos
 * realizados a traves de Turbo", en Mecanica y beneficio, y no resolvia el caso
 * real: muchas marcas tienen dos tiendas en la app, la normal y la de Turbo, y
 * el documento no decia en cual contaba el pedido. Juan escribio estas tres
 * frases el 20 de septiembre de 2026.
 *
 * "No tiene tienda en Turbo" no imprime nada: no hay nada que aclarar.
 */
var TEXTO_TIENDA_TURBO_POR_OPCION = {
  normal: 'El Beneficio aplica únicamente para pedidos realizados en la Tienda Participante por fuera del botón “Turbo” de la Plataforma Rappi. Los pedidos realizados en la Tienda Participante dentro del botón “Turbo” no generan el Beneficio.',
  turbo: 'El Beneficio aplica únicamente para pedidos realizados en la Tienda Participante dentro del botón “Turbo” de la Plataforma Rappi. Los pedidos realizados en la Tienda Participante por fuera de ese botón no generan el Beneficio.',
  ambas: 'El Beneficio aplica para pedidos realizados en la Tienda Participante, tanto dentro como por fuera del botón “Turbo” de la Plataforma Rappi.',
};

/*
 * En cual de sus tiendas cuentan los pedidos de la Carrera, tienda por tienda.
 *
 * Las frases del Cashback hablan del "Beneficio", que en la Carrera no existe,
 * asi que estas son propias. Tres frases de la revision de la Carrera de
 * Compras (K1.b), aprobadas por Juan el 8 de octubre de 2026. "No tiene tienda
 * en Turbo" no imprime nada.
 *
 * {referencia} es "la Tienda Participante" con una tienda y el nombre de la
 * tienda, en negrilla, con varias.
 */
var TEXTO_TIENDA_TURBO_CARRERA_POR_OPCION = {
  normal: 'En {referencia}, solo suman al acumulado los pedidos realizados por fuera del botón “Turbo” de la Plataforma Rappi.',
  turbo: 'En {referencia}, solo suman al acumulado los pedidos realizados dentro del botón “Turbo” de la Plataforma Rappi.',
  ambas: 'En {referencia}, suman al acumulado los pedidos realizados tanto dentro como por fuera del botón “Turbo” de la Plataforma Rappi.',
};

/*
 * Lo mismo, dentro de cada vineta de "Tiendas participantes" del Multitienda.
 *
 * FRAGMENTO: se pega detras del nombre de la marca, sin punto final, porque la
 * vineta no lo lleva.
 */
/*
 * Medicamentos, fitoterapeuticos y productos con nicotina, solo en Colombia.
 *
 * Desde el 20 de septiembre de 2026 no se hacen campanas sobre esos productos.
 * La pieza y el formulario lo dicen antes, pero el documento tiene que dejarlo
 * escrito: una tienda de la campana puede venderlos igual, y sin la frase el
 * usuario podria reclamar el beneficio sobre ellos.
 *
 * Fundamento: para el tabaco y la nicotina, la Ley 1335 de 2009 y la Ley 2354
 * de 2024; para medicamentos y fitoterapeuticos, una regla de Legal CO mas
 * estricta que el Playbook Farmacias. En los demas paises no sale: lo deciden
 * sus abogados en la prueba.
 */
var TEXTO_EXCLUSION_SALUD_POR_TIPO = {
  cashback: 'Se excluyen del Beneficio los medicamentos, los productos fitoterapéuticos, los cigarrillos, los productos de tabaco calentado, los vapeadores y los demás productos con nicotina.',
  cashback_day: 'Se excluyen del Beneficio los medicamentos, los productos fitoterapéuticos, los cigarrillos, los productos de tabaco calentado, los vapeadores y los demás productos con nicotina.',
  // En la Carrera va como vineta, dentro de la lista de lo que no suma.
  carrera_compras: '• Las compras de medicamentos, productos fitoterapéuticos, cigarrillos, productos de tabaco calentado, vapeadores y demás productos con nicotina.',
};

var PAISES_CON_EXCLUSION_DE_SALUD = ['CO'];

function textoExclusionDeSalud(entrada, pais) {
  var codigo = String((pais || {}).codigo || '').toUpperCase();
  if (PAISES_CON_EXCLUSION_DE_SALUD.indexOf(codigo) === -1) return '';
  return TEXTO_EXCLUSION_SALUD_POR_TIPO[entrada.tipo] || '';
}

var SUFIJO_TIENDA_TURBO = {
  normal: ', solo en su tienda por fuera del botón “Turbo”',
  turbo: ', solo en su tienda dentro del botón “Turbo”',
  ambas: ', tanto dentro como por fuera del botón “Turbo”',
};

var TEXTO_CARGA_POR_OPCION = {
  inmediata: 'de manera inmediata una vez finalizada la orden',
  dia_siguiente: 'al día siguiente de la finalización de la orden',
};

/*
 * La verificacion de elegibilidad, segun cuando se cargan los Creditos.
 *
 * Con carga inmediata, "verificar antes de acreditar" y "acreditar de manera
 * inmediata" son dos frases que no pueden ser ciertas a la vez, y esa
 * contradiccion impresa se resuelve a favor del usuario: acreditacion
 * inmediata y sin verificacion. Por eso, cuando la carga es inmediata, la
 * verificacion pasa a ser posterior y con reversion. Decision 18 de Legal, en
 * docs/encargos/respuestas/01-legal.md.
 */
var TEXTO_VERIFICACION_ANTES =
  'Rappi se reserva el derecho de verificar la elegibilidad de cada pedido antes de acreditar el Beneficio; ' +
  'si la verificación determina que el pedido no cumple las condiciones de la Campaña, los Créditos no serán ' +
  'acreditados y se te informará a través de la Plataforma Rappi.';

var TEXTO_VERIFICACION_DESPUES =
  'Rappi podrá verificar la elegibilidad de cada pedido después de acreditar el Beneficio; ' +
  'si la verificación determina que el pedido no cumple las condiciones de la Campaña, Rappi podrá descontar ' +
  'o revocar los Créditos acreditados y te lo informará a través de la Plataforma Rappi.';

var TEXTO_LUGAR_REDENCION_POR_OPCION = {
  tienda: 'Los Créditos podrán redimirse únicamente en la Tienda Participante donde se originó el Beneficio, dentro del Territorio.',
  general: 'Los Créditos podrán redimirse en cualquier sección de la Plataforma Rappi habilitada para el uso de Créditos, dentro del Territorio.',
};

/* El cierre de la oracion de "en cualquier parte" cuando hay secciones fuera. */
var REDENCION_GENERAL_SIN_EXCLUSIONES =
  'Los Créditos podrán redimirse en cualquier sección de la Plataforma Rappi habilitada para el uso de Créditos, dentro del Territorio';

var CRITERIO_GANADOR_POR_OPCION = {
  mayor_valor: 'el mayor valor total en compras de Productos Participantes',
  mas_pedidos: 'el mayor número de Pedidos Válidos con Productos Participantes',
};

/*
 * El desempate de la Carrera.
 *
 * H4 de la revision (Kenvue), aprobado el 8 de octubre de 2026. Tres arreglos:
 * dos de los tres desempates no decian "de Productos Participantes" y se podian
 * leer como todos los pedidos y compras del participante en la Plataforma; si el
 * empate persistia despues del desempate no habia regla, y resolverlo entonces
 * seria discrecional o, peor, al azar; y "fecha y hora de su ultimo pedido" no
 * decia si de hecho o de entrega. Cuenta la entrega, que es cuando el pedido
 * empieza a sumar. El segundo desempate es quien llego primero: el registro
 * llega al segundo, asi que no necesita un tercero.
 */
var TEXTO_DESEMPATE_POR_OPCION = {
  primero: 'En caso de empate, ganará el participante que haya alcanzado primero el resultado empatado, según la fecha y hora de entrega de su último Pedido Válido registradas en la Plataforma Rappi.',
  mas_pedidos: 'En caso de empate, ganará el participante con el mayor número de Pedidos Válidos con Productos Participantes durante la vigencia. Si el empate persiste, ganará el participante que haya alcanzado primero el resultado empatado, según la fecha y hora de entrega de su último Pedido Válido registradas en la Plataforma Rappi.',
  mayor_valor: 'En caso de empate, ganará el participante con el mayor valor total en compras de Productos Participantes durante la vigencia. Si el empate persiste, ganará el participante que haya alcanzado primero el resultado empatado, según la fecha y hora de entrega de su último Pedido Válido registradas en la Plataforma Rappi.',
};

/*
 * Lo que Rappi hace en la Carrera, dicho "por cuenta del Organizador".
 *
 * El bloque organizador decia que Rappi actua "unicamente como plataforma y
 * como medio de difusion", y en la Carrera el mismo documento dice que Rappi
 * arma el ranking, verifica la elegibilidad, contacta a los ganadores y, a
 * veces, entrega el premio: una contradiccion sobre el papel de Rappi es el
 * hilo del que tiraria una autoridad para decir que es coorganizador. La
 * regla 1 de CLAUDE.md dice que operar la mecanica no vuelve a Rappi
 * organizador; el documento lo dice asi, con "por cuenta del Organizador".
 * H2 de la revision de la Carrera (Kenvue), aprobado el 8 de octubre de 2026.
 *
 * FRAGMENTO: va pegado a "medio de difusion de la Campana", por eso arranca con
 * la coma. Solo la Carrera lo llena; en los demas modelos el marcador queda
 * vacio y el bloque sale igual que antes.
 */
var TEXTO_ROL_OPERATIVO_POR_OPCION = {
  creditos: ', y, por cuenta del Organizador, como operador de la mecánica del concurso y de la acreditación del premio',
  organizador: ', y, por cuenta del Organizador, como operador de la mecánica del concurso',
  rappi: ', y, por cuenta del Organizador, como operador de la mecánica del concurso y de la entrega del premio',
};

/** FRAGMENTO: el papel operativo de Rappi en la Carrera, segun el premio y quien lo entrega. */
function textoRolOperativo(entrada) {
  if (entrada.tipoPremio === 'creditos') return TEXTO_ROL_OPERATIVO_POR_OPCION.creditos;
  if (entrada.tipoPremio === 'fisico') return TEXTO_ROL_OPERATIVO_POR_OPCION[entrada.entregaPor] || '';
  return '';
}

/** La naturaleza del premio fisico cuando lo entrega el Organizador. */
var TEXTO_NATURALEZA_FISICO_ENTREGA_ORGANIZADOR =
  'El premio consiste en un bien de carácter físico, cuya existencia, calidad, garantía y entrega son responsabilidad exclusiva ' +
  'del Organizador. Rappi no fabrica, comercializa ni garantiza dicho bien.';

/** La naturaleza del premio fisico cuando Rappi gestiona la entrega como operador logistico. */
var TEXTO_NATURALEZA_FISICO_ENTREGA_RAPPI =
  'El premio consiste en un bien de carácter físico, cuya existencia, calidad y garantía son responsabilidad exclusiva ' +
  'del Organizador. Rappi no fabrica, comercializa ni garantiza dicho bien, y gestiona su entrega únicamente como operador ' +
  'logístico por cuenta del Organizador, en los términos de la cláusula siguiente.';

var TEXTO_ENTREGA_POR_OPCION = {
  organizador: 'La entrega del premio estará a cargo exclusivamente del Organizador, quien coordinará directamente con el ganador las condiciones de tiempo, modo y lugar de entrega, siendo el único responsable de la misma.',
  rappi: 'La entrega del premio será gestionada por Rappi en su calidad de operador logístico y por cuenta del Organizador, quien conserva la calidad de responsable del premio; Rappi coordinará con el ganador las condiciones de tiempo, modo y lugar de entrega.',
};

/*
 * Como se avisa al ganador.
 *
 * K8 de la revision de la Carrera (Kenvue): "la cuenta del ganador" no decia de
 * que cuenta, asi que lleva "en la Plataforma Rappi", el termino que el
 * documento si define. H13: una llamada no deja soporte, y si el primer puesto
 * dice que nunca lo llamaron la duda se resuelve a su favor; por eso la llamada
 * se confirma siempre por escrito al correo de la cuenta. Aprobados por Juan el
 * 8 de octubre de 2026.
 */
var MEDIO_NOTIFICACION_POR_OPCION = {
  correo: 'el correo electrónico registrado en la cuenta del ganador en la Plataforma Rappi',
  llamada: 'una llamada telefónica al número registrado en la cuenta del ganador en la Plataforma Rappi, que se confirmará por escrito al correo electrónico registrado en esa cuenta',
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
  // El grado de parentesco de la clausula de inhabilidades. Sale de la fila
  // porque el Codigo Civil de cada pais lo nombra distinto, y desde el 21 de
  // septiembre de 2026 el concurso ya no corre solo en Colombia.
  TEXTO_PARENTESCO: 'texto_parentesco',
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

/**
 * ORACION: quien puede participar.
 *
 * Los dias de "reactivados" se nombran con el termino del pais (calendario,
 * corridos, naturales) y no con "dias" a secas: quien quedo por fuera por poco
 * podia alegar que eran habiles. Decision 35 de Legal.
 */
function textoSegmento(entrada, pais) {
  if (entrada.segmento === 'reactivados') {
    var dias = Number(entrada.diasSinCompra);
    if (!dias) return '';
    // Con un solo dia salia "durante los un (1) dias calendario anteriores".
    var variosDias = dias !== 1;
    return (
      'Pueden participar únicamente los Usuarios/Consumidores mayores de edad que no hayan realizado pedidos ' +
      'en la Plataforma Rappi durante ' + (variosDias ? 'los ' : '') + letrasYCifra(dias) + ' ' +
      terminoDeDias(pais, dias) + (variosDias ? ' anteriores' : ' anterior') + ' al inicio de la Campaña.'
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

  // Decision 20 de la respuesta del encargo 01, confirmada por Juan el 18 de
  // septiembre: en el Cashback Multitienda el maximo se cuenta por cada tienda,
  // no por campana. Son varias tiendas en una misma jornada y cada una pone su
  // propio presupuesto, asi que un limite unico repartia mal el beneficio.
  if (entrada.tipo === 'cashback_day') {
    return (
      'Puedes obtener el Beneficio en un máximo de ' + letrasYCifra(maximo) + ' ' + sustantivo +
      ' por cada Tienda Participante durante la vigencia de la Campaña; los pedidos adicionales en esa misma tienda' +
      ' no generarán el Beneficio y se procesarán como pedidos regulares.'
    );
  }

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

/** ORACION: como se verifica la elegibilidad del pedido. */
function textoVerificacion(entrada) {
  return entrada.carga === 'inmediata' ? TEXTO_VERIFICACION_DESPUES : TEXTO_VERIFICACION_ANTES;
}

/** FRAGMENTO: hasta cuando sirven los Creditos. */
function textoVigenciaCreditos(entrada, pais) {
  if (entrada.vigencia === 'dias') {
    var dias = Number(entrada.diasVigencia);
    if (!dias) return '';
    // Con un solo dia salia "un (1) dias calendario contados a partir de su carga".
    return 'tendrán una vigencia de ' + letrasYCifra(dias) + ' ' + terminoDeDias(pais, dias) +
      (dias === 1 ? ' contado' : ' contados') + ' a partir de su carga';
  }
  if (entrada.vigencia === 'fecha' && entrada.fechaFinRedencion) {
    return 'podrán redimirse hasta las 11:59 p. m. del ' + formatearFecha(entrada.fechaFinRedencion);
  }
  return '';
}

/** ORACION: donde se pueden redimir los Creditos. */
function textoLugarRedencion(entrada, pais) {
  /*
   * "En cualquier parte de Rappi" casi nunca quiere decir en cualquier parte.
   *
   * Juan confirmo que estos Creditos no aplican a Rappi Travel, al SOAT, al
   * Cajero ATM ni a RappiFavor, y hasta el 20 de septiembre de 2026 eso estaba
   * dicho en la ayuda del formulario y no en el documento. Una exclusion que no
   * esta en el T&C no se le puede oponer al usuario: si la app le rechaza los
   * Creditos en RappiFavor, reclama con el documento en la mano. Punto D5.
   *
   * Las casillas vienen marcadas, asi que la oracion sale completa sin que nadie
   * haga nada. Sin ninguna marcada queda la de antes, palabra por palabra.
   */
  if (entrada.redencion === 'general') {
    var excluidas = textoSeccionesExcluidas(entrada.exclusionesRedencion, pais ? pais.codigo : 'CO');
    if (!excluidas) return TEXTO_LUGAR_REDENCION_POR_OPCION.general;
    return REDENCION_GENERAL_SIN_EXCLUSIONES + ', a excepción de ' + excluidas + '.';
  }

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

/** FRAGMENTO: "la Tienda Participante" o "las Tiendas Participantes". */
function laTiendaDeLaCarrera(entrada) {
  return tiendasDeLaCarrera(entrada).length > 1 ? 'las Tiendas Participantes' : 'la Tienda Participante';
}

/** FRAGMENTO: "en la Tienda Participante" o "en cualquiera de las Tiendas Participantes". */
function enLaTiendaDeLaCarrera(entrada) {
  return tiendasDeLaCarrera(entrada).length > 1
    ? 'en cualquiera de las Tiendas Participantes'
    : 'en la Tienda Participante';
}

/**
 * FRAGMENTO: las tiendas, con su nombre en negrilla y su definicion.
 *
 * Con una tienda sale letra por letra como el bloque cobertura_tienda de antes.
 * Sin ninguna tienda queda vacio y el motor anuncia el hueco.
 */
function textoTiendasParticipantes(entrada) {
  var tiendas = tiendasDeLaCarrera(entrada);
  if (tiendas.length === 0) return '';
  if (tiendas.length === 1) return '**' + tiendas[0].nombre + '** (en adelante, la “Tienda Participante”)';
  var nombres = [];
  for (var i = 0; i < tiendas.length; i++) nombres.push('**' + tiendas[i].nombre + '**');
  return 'las tiendas ' + listaY(nombres) +
    ' (en adelante, cada una, una “Tienda Participante” y, en conjunto, las “Tiendas Participantes”)';
}

/** ORACION: solo con varias tiendas, que todas suman a un mismo acumulado. Con una, vacio. */
function textoAcumuladoTiendas(entrada) {
  if (tiendasDeLaCarrera(entrada).length < 2) return '';
  return 'Los pedidos de Productos Participantes realizados en cualquiera de las Tiendas Participantes suman a un mismo acumulado por participante.';
}

/**
 * ORACION (una por tienda con respuesta, separadas por un espacio): en cual de
 * sus tiendas cuentan los pedidos. Vacio si ninguna tiene respuesta de Turbo.
 */
function textoTiendaTurboCarrera(entrada) {
  var tiendas = tiendasDeLaCarrera(entrada);
  var oraciones = [];
  for (var i = 0; i < tiendas.length; i++) {
    var frase = TEXTO_TIENDA_TURBO_CARRERA_POR_OPCION[tiendas[i].tiendaTurbo];
    if (!frase) continue;
    var referencia = tiendas.length > 1 ? '**' + tiendas[i].nombre + '**' : 'la Tienda Participante';
    oraciones.push(frase.replace('{referencia}', referencia));
  }
  return oraciones.join(' ');
}

/** ORACION: que productos participan en la Carrera. */
function textoProductos(entrada) {
  if (entrada.productos === 'todos') {
    return 'Participan en el concurso todos los productos del catálogo de ' + laTiendaDeLaCarrera(entrada) + ' en la Plataforma Rappi (en adelante, los “Productos Participantes”).';
  }
  if (entrada.productos === 'marca') {
    return (
      'Participan en el concurso únicamente los productos de la marca ' + (entrada.makerMarca || '') +
      ' disponibles ' + enLaTiendaDeLaCarrera(entrada) + ' a través de la Plataforma Rappi (en adelante, los “Productos Participantes”).'
    );
  }
  if (entrada.productos === 'especificos') {
    /*
     * Con nombre y codigo de barras desde el 20 de septiembre de 2026 (D4).
     * Antes era un campo de texto libre y dos productos que se llaman parecido
     * dejaban el documento sin decir cual suma al concurso.
     *
     * Va en vinnetas, no en tabla: el sitio donde se publica no muestra tablas.
     */
    var productos = entrada.productosDetalle || [];
    if (productos.length === 0) return '';

    var lineas = ['Participan en el concurso únicamente los siguientes productos de ' + laTiendaDeLaCarrera(entrada) + ', ' +
      'identificados con su nombre y su código de barras EAN (en adelante, los “Productos Participantes”):'];
    for (var i = 0; i < productos.length; i++) {
      var nombre = String((productos[i] || {}).nombre || '').trim();
      var ean = String((productos[i] || {}).ean || '').replace(/\D/g, '');
      // Un producto a medias deja la vinneta rota: mejor un hueco entero, que
      // el motor anuncia, que una lista con una linea sin nombre o sin EAN.
      if (!nombre || !ean) return '';
      lineas.push('• ' + nombre + ' (EAN ' + ean + ')');
    }
    lineas.push('Solo suman al acumulado las unidades cuyo código EAN coincida con alguno de los anteriores.');
    return lineas.join('\n');
  }
  return '';
}

/**
 * La frase del premio fisico, con su valor comercial cuando el pais lo pide.
 *
 * Los dos textos con valor son los de la decision 36 (ii) del encargo 01, que
 * Juan confirmo el 20 de septiembre de 2026 (punto D3). Decian "pesos M/Cte." y
 * "IVA incluido", que son de Colombia, y por eso la frase salia solo alli.
 *
 * Desde el 21 de septiembre de 2026 sale en todos los paises: la moneda ya venia
 * de la fila del pais y el impuesto tambien viene de ahi (IVA, IGV, ICMS). Un
 * pais sin impuesto escrito imprime la frase sin esa coletilla, entera y sin
 * comas sueltas, en vez de anunciar un impuesto que nadie confirmo.
 *
 * Con varios ganadores el total es el valor de un premio por el numero de
 * ganadores: es lo que el documento tiene que declarar, y calcularlo aqui evita
 * que alguien escriba dos numeros que no cuadren.
 */
function fraseDelPremioFisico(entrada, pais, ganadores) {
  var quien = ganadores > 1 ? 'Cada ganador' : 'El ganador';
  var descripcion = entrada.descripcionPremio;

  if (!tieneValor(entrada.valorPremio)) {
    return quien + ' recibirá el siguiente premio: ' + descripcion + '.';
  }

  var impuesto = String(pais.impuesto_indirecto || '').trim();
  var conImpuesto = impuesto ? ', ' + impuesto + ' incluido' : '';
  var unitario = montoConMoneda(entrada.valorPremio, pais);
  if (ganadores > 1) {
    var total = montoConMoneda(Number(entrada.valorPremio) * ganadores, pais);
    return 'Cada ganador recibirá el siguiente premio: ' + descripcion +
      ', con un valor comercial unitario de ' + unitario + conImpuesto + '. ' +
      'El valor comercial total de los premios de la Campaña es de ' + total + '.';
  }
  return 'El ganador recibirá el siguiente premio: ' + descripcion +
    ', con un valor comercial de ' + unitario + conImpuesto + '.';
}

/**
 * ORACION: lo que el premio puede y no puede canjearse.
 *
 * Con Creditos el premio no se canjea por dinero, pero si se gasta en bienes y
 * servicios de la Plataforma: ese es el uso de los Creditos. La frase de antes,
 * "ni por otros bienes o servicios", era falsa para ellos. H11 parte 1.
 */
function textoCanjeDelPremio(entrada) {
  if (entrada.tipoPremio === 'creditos') {
    return 'El premio es personal e intransferible y no podrá canjearse por dinero en efectivo.';
  }
  if (entrada.tipoPremio === 'fisico') {
    return 'El premio es personal e intransferible y no podrá canjearse por dinero en efectivo ni por otros bienes o servicios.';
  }
  return '';
}

/**
 * FRAGMENTO que se pega al final de la naturaleza del premio en Creditos: hasta
 * cuando valen y donde se gastan. Va con su espacio de separacion. Si falta
 * alguna de las dos respuestas no agrega nada, para no dejar una frase a medias
 * en la vista previa (la validacion no deja generar sin ellas). H11 parte 2.
 */
function textoVigenciaYLugarDelPremio(valores) {
  var vigencia = valores.TEXTO_VIGENCIA_CREDITOS;
  var lugar = valores.TEXTO_LUGAR_REDENCION;
  if (!vigencia || !lugar) return '';
  return ' Los Créditos del premio ' + vigencia + '. ' + lugar;
}

/**
 * ORACION: cuando se acreditan los Creditos del premio.
 *
 * El plazo sale de la pregunta plazoEntrega, que aplica a los dos tipos de
 * premio. Va de 2 a 30, asi que "dias habiles" va siempre en plural. H11 parte 2.
 */
function textoAcreditacionDelPremio(entrada) {
  var dias = Number(entrada.plazoEntrega);
  if (!dias || dias < 2) return '';
  return 'Los Créditos serán acreditados por Rappi en la Billetera de Créditos del ganador, por cuenta del Organizador, ' +
    'a más tardar dentro de los ' + letrasYCifra(dias) + ' días hábiles siguientes a la aceptación del premio.';
}

/**
 * ORACION: el plazo, el costo y el lugar de entrega del premio fisico.
 *
 * Solo con premio fisico. Con Creditos el plazo va dentro de TEXTO_ENTREGA, que
 * es donde cuenta (H11 parte 2). La pregunta va de 2 a 30 dias habiles, asi que
 * "dias habiles" va siempre en plural. Vacia si falta el plazo o el premio no
 * es fisico.
 */
function textoPlazoEntrega(entrada) {
  if (entrada.tipoPremio !== 'fisico') return '';
  var dias = Number(entrada.plazoEntrega);
  if (!dias || dias < 2) return '';
  return 'El premio se entregará sin costo para el ganador, en la dirección que confirme dentro del Territorio, ' +
    'a más tardar dentro de los ' + letrasYCifra(dias) + ' días hábiles siguientes a su aceptación.';
}

/**
 * FRAGMENTO: cuantas veces se intenta contactar al ganador.
 *
 * Con varios intentos, cada uno en un dia habil distinto: asi quedan separados
 * y no se cuentan tres llamadas seguidas como tres intentos. Vacio si el KAM no
 * lo ha respondido.
 */
function textoIntentosContacto(entrada) {
  var intentos = Number(entrada.intentosContacto);
  if (!intentos || intentos < 1) return '';
  if (intentos === 1) return 'al menos un (1) intento de contacto';
  return 'al menos ' + letrasYCifra(intentos) + ' intentos realizados en días hábiles distintos';
}

/**
 * FRAGMENTO: los dias para declarar desierto el premio, con el termino del pais.
 *
 * "treinta (30) dias calendario" en Colombia, "dias naturales" en Mexico y
 * "dias corridos" en Argentina: el termino sale de la fila del pais, como el de
 * la vigencia de los Creditos, porque la Carrera corre en los nueve paises.
 */
function diasDesierto(entrada, pais) {
  var dias = Number(entrada.diasDesierto);
  if (!dias || dias < 1) return '';
  return letrasYCifra(dias) + ' ' + terminoDeDias(pais, dias);
}

/**
 * FRAGMENTO: el objeto de "Antes de declarar ...", en singular o plural.
 *
 * La clausula de verificacion decia siempre "a los ganadores", tambien con un
 * solo ganador (K5 de la revision de la Carrera). Sin numero de ganadores sale
 * en plural, que es lo que decia el modelo.
 */
function ganadorObjeto(entrada) {
  return Number(entrada.numeroGanadores) === 1 ? 'al ganador' : 'a los ganadores';
}

/** Derivados propios de la Carrera de Compras. */
function derivadosCarrera(entrada, pais, valores) {
  valores.TEXTO_PRODUCTOS = textoProductos(entrada);
  valores.TEXTO_ROL_OPERATIVO = textoRolOperativo(entrada);
  valores.GANADOR_OBJETO = ganadorObjeto(entrada);
  // Las Tiendas Participantes (K1): una o varias, con un solo ranking.
  valores.TEXTO_TIENDAS_PARTICIPANTES = textoTiendasParticipantes(entrada);
  valores.LA_TIENDA = laTiendaDeLaCarrera(entrada);
  valores.EN_LA_TIENDA = enLaTiendaDeLaCarrera(entrada);
  valores.TEXTO_ACUMULADO_TIENDAS = textoAcumuladoTiendas(entrada);
  // Pisa la frase del Cashback: la Carrera no tiene Beneficio.
  valores.TEXTO_TIENDA_TURBO = textoTiendaTurboCarrera(entrada);
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
      'de los Créditos de la Plataforma Rappi, disponibles en: ' + pais.url_tc_creditos + '.' +
      textoVigenciaYLugarDelPremio(valores);
  } else if (entrada.tipoPremio === 'fisico' && tieneValor(entrada.descripcionPremio)) {
    valores.LISTA_PREMIOS = fraseDelPremioFisico(entrada, pais, ganadores);
    /*
     * Quien entrega cambia de quien es la entrega, no del bien.
     *
     * Con el premio fisico que entrega Rappi como operador logistico, la
     * naturaleza decia que la entrega era "responsabilidad exclusiva del
     * Organizador", la clausula de entrega que la gestionaba Rappi, y la de
     * responsabilidades que Rappi respondia por todo cuando la entrega estaba a
     * su cargo. Tres cosas distintas sobre quien responde. Ahora el bien
     * (existencia, calidad, garantia) es del Organizador y la logistica la
     * gestiona Rappi por su cuenta. H3 de la revision de la Carrera (Kenvue),
     * aprobado el 8 de octubre de 2026.
     */
    valores.TEXTO_NATURALEZA_PREMIO = entrada.entregaPor === 'rappi'
      ? TEXTO_NATURALEZA_FISICO_ENTREGA_RAPPI
      : TEXTO_NATURALEZA_FISICO_ENTREGA_ORGANIZADOR;
  }

  /*
   * La vinneta de entrega.
   *
   * Con premio fisico la escribe quien entrega. Con Creditos no se pregunta,
   * porque no hay nada que llevar: los acredita Rappi en la Billetera. La frase
   * es la que propuso la respuesta del encargo 01 en la falla (a) de la decision
   * 36, y que Juan aprobo el 18 de septiembre.
   */
  valores.TEXTO_ENTREGA = entrada.tipoPremio === 'creditos'
    ? textoAcreditacionDelPremio(entrada)
    : (TEXTO_ENTREGA_POR_OPCION[entrada.entregaPor] || '');
  valores.TEXTO_CANJE_PREMIO = textoCanjeDelPremio(entrada);

  /*
   * Los datos del ganador solo se transfieren cuando hay algo fisico que llevar
   * a una direccion y lo lleva el Organizador.
   *
   * Antes bastaba con que entregara el Organizador. Con premio en Creditos, que
   * Rappi acredita en la Billetera, el documento anunciaba una transferencia de
   * datos que nunca ocurre: el caso dorado CC01 la imprimia. Falla (a) de la
   * decision 36 de la respuesta del encargo 01.
   *
   * El texto es el DESPUES de la falla (b) de esa misma decision, copiado tal
   * cual. El anterior decia solo "datos de contacto", cuando el Anexo A del
   * Acuerdo Marco incluye tambien la direccion de entrega y el numero de
   * documento; dejaba la autorizacion para despues, cuando el acuerdo dice que
   * consta en el T&C de la campana; y no decia la finalidad, que la clausula
   * cuarta obliga a informar en el T&C.
   */
  valores.TEXTO_DATOS_ENTREGA =
    (entrada.tipoPremio === 'fisico' && entrada.entregaPor === 'organizador')
      ? 'Si resultas ganador, al aceptar el premio autorizas a Rappi para transferir al Organizador únicamente ' +
        'los datos estrictamente necesarios para entregártelo, que pueden ser tu nombre y apellidos, correo ' +
        'electrónico, número de teléfono celular, dirección de entrega y número de documento de identidad. ' +
        'El Organizador solo podrá usar esos datos para entregarte el premio, coordinar la entrega, verificar ' +
        'tu identidad al recibirlo y atender los reclamos sobre ella, y deberá suprimirlos una vez cumplida esa finalidad.'
      : '';

  valores.TEXTO_PLAZO_ENTREGA = textoPlazoEntrega(entrada, pais);

  valores.MEDIO_NOTIFICACION = MEDIO_NOTIFICACION_POR_OPCION[entrada.medioNotificacion] || '';
  valores.FECHA_NOTIFICACION = entrada.fechaNotificacion ? formatearFecha(entrada.fechaNotificacion) : '';

  valores.TEXTO_INTENTOS_CONTACTO = textoIntentosContacto(entrada);
  valores.DIAS_DESIERTO = diasDesierto(entrada, pais);

  var plazo = Number(entrada.plazoConfirmacion);
  valores.PLAZO_CONFIRMACION = plazo ? letrasYCifra(plazo) + ' ' + (plazo === 1 ? 'día hábil' : 'días hábiles') : '';

  valores.TEXTO_UMBRAL = tieneValor(entrada.compraMinima)
    ? 'Únicamente contabilizarán para el concurso los pedidos cuyo valor sea igual o superior a ' + montoConMoneda(entrada.compraMinima, pais) + '.'
    : 'No se exige un valor mínimo de compra por pedido para participar en la Campaña.';
}

/** Valores de una tienda del Cashback Day. */
function valoresDeTienda(tienda, pais) {
  // Una ficha a medias deja huecos, no tumba la vista previa. Es el mismo
  // criterio que ya usaban tiendasLegibles() y el resto de las listas.
  var datos = tienda || {};
  var identificacion = validarIdentificacion((pais || {}).codigo, datos.id);
  return {
    TIENDA_MARCA: datos.marca || '',
    TIENDA_RAZON_SOCIAL: datos.razonSocial || '',
    TIENDA_ID: identificacion.valido ? identificacion.formateado : '',
    TIENDA_CIUDADES: datos.nacional ? 'cobertura nacional' : listaY(separarPorComas(datos.ciudades)),
    TIENDA_PRESUPUESTO: tieneValor(datos.presupuesto) ? cantidadCreditos(datos.presupuesto, pais || {}) : '',
    TIENDA_TURBO: SUFIJO_TIENDA_TURBO[tiendaDelCashback(datos)] || '',
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
  /*
   * Sin pais se sigue, con los valores del pais vacios.
   *
   * La vista previa promete aguantar cualquier entrada parcial sin lanzar: es
   * lo que pinta la columna del documento mientras el comercial va
   * respondiendo, y ahi todavia falta casi todo. No era cierto: sin pais esto
   * reventaba con un TypeError en cinco sitios distintos, segun que dato del
   * pais tocara primero cada tipo.
   *
   * La pantalla hoy no llega, porque refrescarDocumento() comprueba el pais
   * antes de llamar. Pero esa guarda vive en el navegador y la promesa esta
   * escrita aqui, asi que la proteccion va donde se promete: un dato del pais
   * que falta se convierte en un hueco, que es lo que el motor ya sabe contar.
   */
  var datos = pais || {};
  return conElIdiomaDe(datos, function () {
    return calcularDerivadosEnElIdiomaDelPais(entrada || {}, datos);
  });
}

function calcularDerivadosEnElIdiomaDelPais(entrada, pais) {
  var valores = {};

  // El nombre no lo escribe nadie: sale de las respuestas, asi que el titulo
  // del documento no puede contradecir el articulado. Ver src/core/nombres.js.
  valores.NOMBRE_CAMPANA = nombreDeCampana(entrada, esquemaDe(entrada.tipo));
  valores.NOMBRE_CAMPANA_MAYUS = valores.NOMBRE_CAMPANA.toUpperCase();
  valores.TIENDA = entrada.tienda || '';
  if (entrada.tipo === 'carrera_compras') {
    // La Carrera ya no guarda la tienda como texto: son una o varias.
    var nombresDeTiendas = [];
    var tiendasDeLaLista = tiendasDeLaCarrera(entrada);
    for (var nt = 0; nt < tiendasDeLaLista.length; nt++) nombresDeTiendas.push(tiendasDeLaLista[nt].nombre);
    valores.TIENDA = listaY(nombresDeTiendas);
  }
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

  valores.TEXTO_SEGMENTO = textoSegmento(entrada, pais);
  valores.TEXTO_METODO_PAGO = TEXTO_METODO_PAGO_POR_OPCION[entrada.metodoPago] || '';

  valores.TEXTO_MINIMO_COMPRA = tieneValor(entrada.compraMinima)
    ? 'Para acceder al Beneficio, el valor de los productos de tu pedido deberá ser igual o superior a ' +
      montoConMoneda(entrada.compraMinima, pais) +
      ', sin incluir el costo de envío, la tarifa de servicio ni las propinas.'
    : '';

  valores.TEXTO_LIMITE_PEDIDOS = textoLimitePedidos(entrada);

  valores.TEXTO_TIENDA_TURBO = TEXTO_TIENDA_TURBO_POR_OPCION[tiendaDelCashback(entrada)] || '';
  valores.TEXTO_EXCLUSION_SALUD = textoExclusionDeSalud(entrada, pais);

  if (tieneValor(entrada.porcentaje)) valores.PORCENTAJE = porcentajeEnLetras(entrada.porcentaje);
  if (tieneValor(entrada.tope)) valores.TOPE = cantidadCreditos(entrada.tope, pais);
  if (tieneValor(entrada.presupuesto)) valores.PRESUPUESTO = cantidadCreditos(entrada.presupuesto, pais);

  if (tieneValor(entrada.carga)) {
    valores.TEXTO_CARGA = textoCarga(entrada);
    valores.TEXTO_VERIFICACION = textoVerificacion(entrada);
  }
  if (tieneValor(entrada.vigencia)) valores.TEXTO_VIGENCIA_CREDITOS = textoVigenciaCreditos(entrada, pais);
  if (tieneValor(entrada.redencion)) valores.TEXTO_LUGAR_REDENCION = textoLugarRedencion(entrada, pais);

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

  // El Descuento y el Cupon no dan Creditos: rebajan el precio o quitan un
  // cargo del pedido. Mismo patron que Travel: encima, sin tocar nada del
  // Cashback, que es el que Legal CO tiene aprobado.
  if (esquemaActual && esquemaActual.esDeDescuento) {
    var deDescuento = calcularDerivadosDescuento(entrada, pais);
    for (var llaveDescuento in deDescuento) {
      if (Object.prototype.hasOwnProperty.call(deDescuento, llaveDescuento)) {
        valores[llaveDescuento] = deDescuento[llaveDescuento];
      }
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
    textoRolOperativo: textoRolOperativo,
    textoPlazoEntrega: textoPlazoEntrega,
    textoCanjeDelPremio: textoCanjeDelPremio,
    textoAcreditacionDelPremio: textoAcreditacionDelPremio,
    TEXTO_DESEMPATE_POR_OPCION: TEXTO_DESEMPATE_POR_OPCION,
    ganadorObjeto: ganadorObjeto,
    textoIntentosContacto: textoIntentosContacto,
    diasDesierto: diasDesierto,
    TEXTO_NATURALEZA_FISICO_ENTREGA_ORGANIZADOR: TEXTO_NATURALEZA_FISICO_ENTREGA_ORGANIZADOR,
    TEXTO_NATURALEZA_FISICO_ENTREGA_RAPPI: TEXTO_NATURALEZA_FISICO_ENTREGA_RAPPI,
    textoTiendasParticipantes: textoTiendasParticipantes,
    textoAcumuladoTiendas: textoAcumuladoTiendas,
    textoTiendaTurboCarrera: textoTiendaTurboCarrera,
    laTiendaDeLaCarrera: laTiendaDeLaCarrera,
    enLaTiendaDeLaCarrera: enLaTiendaDeLaCarrera,
    TEXTO_TIENDA_TURBO_CARRERA_POR_OPCION: TEXTO_TIENDA_TURBO_CARRERA_POR_OPCION,
    TEXTO_SEGMENTO_POR_OPCION: TEXTO_SEGMENTO_POR_OPCION,
    TEXTO_METODO_PAGO_POR_OPCION: TEXTO_METODO_PAGO_POR_OPCION,
    TEXTO_TIENDA_TURBO_POR_OPCION: TEXTO_TIENDA_TURBO_POR_OPCION,
    SUFIJO_TIENDA_TURBO: SUFIJO_TIENDA_TURBO,
    textoExclusionDeSalud: textoExclusionDeSalud,
  };
}
