'use strict';

/**
 * El nombre de la campana y la direccion con la que se publica.
 *
 * Nadie los escribe a mano. Los dos salen de las respuestas que ya dio el
 * comercial, y por eso no pueden contradecir el articulado.
 *
 * El caso que obligo a esto: una campana se llamo "99% de Cashback El Corral
 * 20/09" y la clausula decia cincuenta por ciento (50%) con vigencia el 17 de
 * septiembre. Como el documento dice que en caso de discrepancia se aplica la
 * condicion mas favorable para el usuario, un titulo que promete 99% obliga a
 * pagar 99%.
 *
 * Forma del nombre (decidida por Juan el 16 de septiembre):
 *
 *   Tienda · Porcentaje y tipo · Dia de inicio
 *   El Corral · 50% Cashback · 20 sep 2026
 *   Pollo Dorado · Carrera de Compras · 20 sep 2026
 *   Cashback Multitienda · 20 sep 2026
 *
 * Sin etiqueta libre. Dos campanas nunca se pueden llamar igual: cuando el
 * nombre ya existe se le agrega un consecutivo.
 */

/* En Node las dependencias se cargan con require; en Apps Script ya son globales. */
if (typeof module !== 'undefined' && typeof require === 'function') {
  var moduloIdiomas = require('./idiomas.js');
  var textosDelIdioma = moduloIdiomas.textosDelIdioma;
  var conElIdiomaDe = moduloIdiomas.conElIdiomaDe;
  var partesDeFecha = require('./fechas.js').partesDeFecha;
  var modalidadTurbo = require('./derivados_eta.js').modalidadTurbo;
  var tiendaDelCashback = require('./texto.js').tiendaDelCashback;
}

var SEPARADOR_NOMBRE = ' · ';

/** Meses cortos para el nombre. En el documento van completos, no aqui. */
/* Se conserva por compatibilidad: los meses de verdad salen del idioma activo. */
var MESES_CORTOS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

/**
 * "2026-09-20" -> "20 sep 2026", o "20 set 2026" en Brasil.
 *
 * El nombre va impreso como titulo del documento, asi que tiene que estar en el
 * mismo idioma que el articulado. Un titulo que diga "1 oct" sobre un texto que
 * dice "1 de outubro" se lee como un descuido.
 */
function fechaCortaDeNombre(iso) {
  var partes = partesDeFecha(iso);
  if (!partes) return '';
  var cortos = textosDelIdioma().mesesCortos || MESES_CORTOS;
  return partes.dia + ' ' + cortos[partes.mes - 1] + ' ' + partes.anio;
}

/**
 * El tramo que describe el beneficio. Lleva el porcentaje cuando la campana
 * tiene uno solo, porque sale del mismo dato que alimenta la clausula y por eso
 * nunca puede decir algo distinto. El Cashback Multitienda no lo lleva: ahi
 * cada tienda tiene su propio porcentaje.
 */
function tramoDeBeneficio(entrada, esquema) {
  var nombreDelTipo = esquema ? esquema.nombre : '';
  if (!nombreDelTipo) return '';
  var porcentaje = Number(entrada.porcentaje);
  var conPorcentaje = isFinite(porcentaje) && porcentaje > 0;

  // El cashback por ETA: el titulo dice los minutos y el porcentaje, que es lo
  // que el usuario ve prometido. Asi se llaman los documentos publicados.
  if (esquema.id === 'cashback_eta') {
    var minutos = Math.trunc(Number(entrada.etaMinutos));
    if (!isFinite(minutos) || minutos <= 0) return '';
    var promesa = minutos + (minutos === 1 ? ' minuto' : ' minutos');
    return conPorcentaje ? promesa + ' o ' + porcentaje + '% Cashback' : promesa + ' o Cashback';
  }

  // Brasil: el titulo dice el beneficio como lo nombran los documentos
  // aprobados ("10% OFF", "Frete gratis"), no el nombre del tipo. El Cupom lo
  // dice ademas delante, porque el usuario tiene que hacer algo para recibirlo.
  if (esquema.esDeBrasil) {
    var conCupom = esquema.id === 'cupom_br' ? 'Cupom ' : '';
    if (entrada.beneficioBr === 'desconto') return conPorcentaje ? conCupom + porcentaje + '% OFF' : conCupom + 'Desconto';
    if (entrada.beneficioBr === 'frete_gratis') return conCupom + 'Frete grátis';
    if (entrada.beneficioBr === 'taxa_servico') return conCupom + 'Taxa de serviço grátis';
    if (entrada.beneficioBr === 'taxa_e_frete') return conCupom + 'Taxa de serviço e frete grátis';
    return '';
  }

  /*
   * El Descuento y el Cupon.
   *
   * El titulo dice el porcentaje solo cuando la campana tiene uno, por la misma
   * razon que el Cashback: sale del mismo dato que alimenta la clausula, asi que
   * nunca puede prometer algo distinto. Con monto fijo no lo dice, porque un
   * numero suelto al lado del nombre se lee como porcentaje.
   */
  if (esquema.esDeDescuento) {
    var etiqueta = esquema.nombre;
    if (entrada.formaDelDescuento === 'porcentaje') return conPorcentaje ? porcentaje + '% ' + etiqueta : etiqueta;
    if (entrada.formaDelDescuento === 'envio') return etiqueta + ' de envío gratis';
    if (entrada.formaDelDescuento === 'tarifa_servicio') return etiqueta + ' de tarifa de servicio gratis';
    if (entrada.formaDelDescuento === 'envio_y_tarifa') return etiqueta + ' de envío y tarifa de servicio gratis';
    return etiqueta;
  }

  if (esquema.id === 'cashback') {
    return conPorcentaje ? porcentaje + '% ' + nombreDelTipo : nombreDelTipo;
  }

  // Cashback Travel con monto fijo no lleva porcentaje, porque no tiene.
  if (esquema.id === 'cashback_travel') {
    if (entrada.formaBeneficio !== 'porcentaje' || !conPorcentaje) return nombreDelTipo;
    return porcentaje + '% ' + nombreDelTipo;
  }

  // En el descuento variable el titulo dice "Hasta", que es lo que exige la
  // transparencia: un "40%" a secas prometeria ese porcentaje en todo.
  if (esquema.id === 'descuento_travel') {
    if (!conPorcentaje) return nombreDelTipo;
    var hasta = entrada.formaDescuento === 'variable' ? 'Hasta ' : '';
    return hasta + porcentaje + '% ' + nombreDelTipo;
  }

  return nombreDelTipo;
}

/**
 * El nombre de la campana.
 *
 * entrada.sufijoNombre, cuando viene, es el consecutivo que evita que dos
 * campanas se llamen igual. Lo pone el servidor al generar, nunca el comercial.
 *
 * Devuelve cadena vacia mientras falte algun dato: la vista previa lo muestra
 * como un hueco, igual que cualquier otro.
 */
function nombreDeCampana(entrada, esquema, pais) {
  // El nombre va impreso como titulo del documento y como nombre del archivo en
  // Drive, asi que tiene que estar en el mismo idioma que el articulado. Con
  // pais se arma en su idioma; sin pais, en espanol, que es el 99,7% de los
  // casos y lo que hacian todas las llamadas de antes.
  if (pais) {
    return conElIdiomaDe(pais, function () { return nombreDeCampanaEnElIdioma(entrada, esquema); });
  }
  return nombreDeCampanaEnElIdioma(entrada, esquema);
}

function nombreDeCampanaEnElIdioma(entrada, esquema) {
  var datos = entrada || {};
  var tramos = [];

  // El Cashback Multitienda no tiene una sola tienda, asi que arranca por el
  // tipo. En Travel la tienda es la marca aliada y, si no hay, el Organizador.
  var tienda = String(datos.tienda || datos.marcaAliado || '').trim();
  if (!tienda && esquema && esquema.esDeTravel) tienda = String(datos.organizadorRazonSocial || '').trim();
  // En el cashback por ETA no hay una tienda: hay una modalidad y una ciudad.
  // Y una tienda que quedo en la entrada de un tipo anterior no cuenta: el
  // titulo decia "El Corral · 15 minutos o 100% Cashback" sin que el ETA
  // preguntara nunca por El Corral.
  if (esquema && esquema.esPorEta) {
    var ciudad = String(datos.ciudades || '').trim();
    // La categoria la elige el comercial desde el 21 de septiembre de 2026: una
    // campana de Turbo no se puede titular "Turbo Restaurantes Bogota". Cuando
    // corre en unas tiendas concretas no hay categoria, asi que queda la ciudad.
    var categoria = modalidadTurbo(datos);
    tienda = ciudad ? (categoria ? categoria + ' ' + ciudad : ciudad) : '';
  }
  // Muchas marcas tienen dos tiendas en la app. Cuando el cashback se gana solo
  // en la de Turbo, el nombre lo dice: "El Corral Turbo". Juan lo decidio el 20
  // de septiembre de 2026, con la pregunta de en cual de sus tiendas aplica.
  if (tienda && esquema && esquema.id === 'cashback' && tiendaDelCashback(datos) === 'turbo') {
    tienda += ' Turbo';
  }
  if (tienda) tramos.push(tienda);

  var beneficio = tramoDeBeneficio(datos, esquema);
  if (!beneficio) return '';
  tramos.push(beneficio);

  var fecha = fechaCortaDeNombre(datos.fechaInicio);
  if (!fecha) return '';
  tramos.push(fecha);

  var sufijo = Number(datos.sufijoNombre);
  if (isFinite(sufijo) && sufijo > 1) tramos.push(String(sufijo));

  return tramos.join(SEPARADOR_NOMBRE);
}

/**
 * Quita las tildes. No se usa String.normalize porque Apps Script corre en un
 * motor viejo en algunos casos y esto tiene que dar igual en los dos lados.
 */
var LETRAS_CON_TILDE = 'áàäâãéèëêíìïîóòöôõúùüûñçÁÀÄÂÃÉÈËÊÍÌÏÎÓÒÖÔÕÚÙÜÛÑÇ';
var LETRAS_SIN_TILDE = 'aaaaaeeeeiiiiooooouuuuncAAAAAEEEEIIIIOOOOOUUUUNC';

function sinTildes(texto) {
  var salida = '';
  var original = String(texto || '');
  for (var i = 0; i < original.length; i++) {
    var posicion = LETRAS_CON_TILDE.indexOf(original.charAt(i));
    salida += posicion === -1 ? original.charAt(i) : LETRAS_SIN_TILDE.charAt(posicion);
  }
  return salida;
}

/**
 * La parte final de la direccion en Squarespace.
 *
 * "El Corral · 50% Cashback · 20 sep 2026" -> "el-corral-50-cashback-20-sep-2026"
 *
 * Sale del nombre, asi que la direccion y el titulo siempre hablan de la misma
 * campana y se pueden buscar con las mismas palabras.
 */
function direccionDeCampana(nombre) {
  return sinTildes(nombre)
    .toLowerCase()
    .replace(/%/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
    .replace(/-{2,}/g, '-');
}

/**
 * El consecutivo libre para un nombre, mirando los que ya existen.
 *
 * Devuelve 1 cuando el nombre esta libre, 2 para el segundo, y asi. La
 * comparacion ignora mayusculas y tildes, porque "El Corral" y "el corral" son
 * la misma campana para quien busca.
 */
function sufijoLibreDeNombre(nombreBase, nombresExistentes) {
  var usados = {};
  var lista = nombresExistentes || [];
  for (var i = 0; i < lista.length; i++) {
    usados[direccionDeCampana(lista[i])] = true;
  }

  var base = String(nombreBase || '').trim();
  if (!base) return 1;

  for (var sufijo = 1; sufijo <= 500; sufijo++) {
    var candidato = sufijo === 1 ? base : base + SEPARADOR_NOMBRE + sufijo;
    if (!usados[direccionDeCampana(candidato)]) return sufijo;
  }
  return 1;
}

if (typeof module !== 'undefined') {
  module.exports = {
    SEPARADOR_NOMBRE: SEPARADOR_NOMBRE,
    MESES_CORTOS: MESES_CORTOS,
    fechaCortaDeNombre: fechaCortaDeNombre,
    nombreDeCampana: nombreDeCampana,
    sinTildes: sinTildes,
    direccionDeCampana: direccionDeCampana,
    sufijoLibreDeNombre: sufijoLibreDeNombre,
  };
}
