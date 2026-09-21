'use strict';

/**
 * Los textos del cashback por incumplimiento del ETA.
 *
 * Base: los T&C publicados de Bogota (16/09/2026) y Barranquilla (1/09/2026).
 * Son el mismo documento con la ciudad, la fecha, las horas y el presupuesto
 * cambiados.
 *
 * Lo que este tipo tiene de distinto: el beneficio no se gana comprando, se
 * gana cuando Rappi no cumple el tiempo que prometio. Por eso no hay aliado que
 * fondee ni tienda unica, y por eso el documento habla de todas las tiendas
 * Turbo de una ciudad.
 *
 * Las mejoras frente a los documentos publicados estan en docs/MEJORAS_ETA.md.
 */

/* En Node las dependencias se cargan con require; en Apps Script ya son globales. */
if (typeof module !== 'undefined' && typeof require === 'function') {
  var moduloNumeros = require('./numeros.js');
  var letrasYCifra = moduloNumeros.letrasYCifra;
  var letrasYCifraFemenino = moduloNumeros.letrasYCifraFemenino;
  var cantidadCreditos = moduloNumeros.cantidadCreditos;

  var listaY = require('./fechas.js').listaY;
  var tieneValor = require('./texto.js').tieneValor;
}

/** La modalidad del boton Turbo. Los dos documentos publicados usan esta. */
var MODALIDAD_TURBO_POR_DEFECTO = 'Turbo Restaurantes';

/*
 * El nombre que el documento imprime para cada categoria del boton Turbo.
 *
 * Vive aqui y no en esquemas.js a proposito: las etiquetas del formulario y los
 * nombres que salen impresos en el T&C son dos cosas distintas, y cruzarlas con
 * un require entre archivos de src/core/ rompe en Apps Script, donde estos
 * archivos son globales y no hay require. La prueba
 * "las tres formas del ETA tienen su texto" cuida que las dos listas no se
 * separen.
 *
 * La tercera opcion, 'tiendas', no tiene categoria: nombra las tiendas.
 *
 * Turbo Carulla no entra aqui, a proposito. Es una marca comercial de dark
 * stores, no una seccion de la app como las otras dos, y llamarla "modalidad"
 * en el documento repetiria justo el error que Juan corrigio. Sus tiendas se
 * cuentan con los dedos de una mano por ciudad, tienen nombre propio y no
 * cambian de un dia para otro, asi que la forma que les sirve es la de
 * nombrarlas: Turbo Calleja, Turbo Chico, Turbo Laureles. Ver la decision 97.
 */
var MODALIDAD_POR_ALCANCE = {
  restaurantes: 'Turbo Restaurantes',
  turbo: 'Turbo',
};

/**
 * Las secciones que se pueden excluir de la redencion, con su nombre impreso.
 *
 * Empezaron siendo solo del ETA y desde el 20 de septiembre de 2026 (punto D5)
 * las usa tambien el Cashback cuando los Creditos se pueden gastar en cualquier
 * parte de Rappi. El nombre de la llave se queda por la frontera del Sheet: la
 * columna exclusiones_eta ya existe y mover una columna desalinea el historico.
 *
 * "RappiFavor" va junto, que es como lo escriben los T&C publicados de Rappi en
 * Colombia, Ecuador y Costa Rica.
 *
 * El SOAT es colombiano, asi que fuera de Colombia no se ofrece ni se imprime.
 */
var SECCIONES_EXCLUIBLES_ETA = [
  { valor: 'travel', nombre: 'Rappi Travel', nota: 'Vuelos, hoteles, autos y paquetes.' },
  { valor: 'soat', nombre: 'SOAT', soloEn: 'CO', nota: 'El seguro obligatorio de vehículos.' },
  { valor: 'atm', nombre: 'Cajero ATM', nota: 'El retiro de efectivo.' },
  { valor: 'favor', nombre: 'RappiFavor', nota: 'Los mandados y diligencias.' },
];

/** Las que se pueden ofrecer e imprimir en este pais. */
function seccionesExcluiblesDe(codigoPais) {
  var lista = [];
  for (var i = 0; i < SECCIONES_EXCLUIBLES_ETA.length; i++) {
    var seccion = SECCIONES_EXCLUIBLES_ETA[i];
    if (seccion.soloEn && seccion.soloEn !== codigoPais) continue;
    lista.push(seccion);
  }
  return lista;
}

/**
 * FRAGMENTO: las secciones excluidas, entrecomilladas y en orden.
 *
 * "las secciones “Rappi Travel”, “SOAT”, “Cajero ATM” y “RappiFavor”". Con una
 * sola marcada concuerda en singular: "la seccion “SOAT”".
 */
function textoSeccionesExcluidas(elegidas, codigoPais) {
  var disponibles = seccionesExcluiblesDe(codigoPais);
  var marcadas = elegidas || [];
  var entrecomilladas = [];
  for (var i = 0; i < disponibles.length; i++) {
    for (var e = 0; e < marcadas.length; e++) {
      if (marcadas[e] === disponibles[i].valor) {
        entrecomilladas.push('“' + disponibles[i].nombre + '”');
        break;
      }
    }
  }
  if (entrecomilladas.length === 0) return '';
  var articulo = entrecomilladas.length === 1 ? 'la sección ' : 'las secciones ';
  return articulo + listaY(entrecomilladas);
}

/**
 * FRAGMENTO: el tiempo prometido, en letras y cifra.
 * "quince (15) minutos". Un minuto concuerda en singular.
 */
function textoEta(entrada) {
  if (!tieneValor(entrada.etaMinutos)) return '';
  var minutos = Math.trunc(Number(entrada.etaMinutos));
  return letrasYCifra(minutos) + (minutos === 1 ? ' minuto' : ' minutos');
}

/** FRAGMENTO: la ciudad, como va dentro de la frase del territorio. */
function textoCiudadEta(entrada) {
  var ciudad = String(entrada.ciudades || '').trim();
  return ciudad ? 'la ciudad de ' + ciudad : '';
}

/**
 * La categoria del boton Turbo en la que corre la campana, como se imprime.
 *
 * Por defecto "Turbo Restaurantes", que es lo que dicen los dos documentos
 * publicados y la pieza real de la campana de Bogota. Una campana de tiendas
 * concretas no nombra categoria: las nombra a ellas.
 */
function modalidadTurbo(entrada) {
  var elegida = MODALIDAD_POR_ALCANCE[entrada.alcanceTurbo];
  if (elegida) return elegida;
  return entrada.alcanceTurbo === 'tiendas' ? '' : MODALIDAD_TURBO_POR_DEFECTO;
}

/**
 * ORACION (o varias): quien participa, en la clausula de Tiendas Participantes.
 *
 * Tiene dos formas, y la historia de por que explica las dos.
 *
 * La decision 33 proponia una lista cerrada de dos categorias. Juan la corrigio
 * diciendo que son tiendas por zona con nombre propio (Turbo Calleja, Turbo
 * Chico), y el punto D1 hizo que el documento las listara siempre. El 21 de
 * septiembre de 2026 Juan aclaro que esa correccion era sobre las dark stores
 * tipo Turbo Carulla, que venden CPGs: las campanas de "15 minutos o Cashback"
 * corren normalmente en Turbo Restaurantes, donde estan las marcas. Listar esas
 * marcas serian decenas y cambiarian de un dia para otro, que es justo lo que
 * resolvia la segunda frase del texto aprobado.
 *
 * Asi que:
 *
 * - Categoria (Turbo Restaurantes o Turbo): el texto aprobado, palabra por
 *   palabra, con su segunda frase. Nombrar una categoria y decir que el listado
 *   es el que la app muestra no se contradice: es como se sabe quien participa.
 * - Tiendas concretas: la lista con nombre propio, y la segunda frase se queda
 *   hablando solo de disponibilidad, que es la forma que Juan eligio ese mismo
 *   dia. Ahi si habria contradiccion.
 *
 * Una tienda sin nombre, o sin ciudad, deja vacio el valor entero: el motor
 * anuncia el hueco y no se genera, igual que en la lista de productos.
 */
function textoTiendasEta(entrada) {
  var ciudad = textoCiudadEta(entrada);
  if (!ciudad) return '';

  if (entrada.alcanceTurbo !== 'tiendas') {
    var modalidad = modalidadTurbo(entrada);
    if (!modalidad) return '';
    return 'Participarán todas las tiendas virtuales bajo la modalidad “' + modalidad +
      '” al interior de la Plataforma Rappi que se encuentren habilitadas en ' + ciudad +
      ' durante la vigencia de la Campaña. El listado de Tiendas Participantes será el que se ' +
      'encuentre visible y disponible para el Usuario/Consumidor dentro del botón “Turbo” de la ' +
      'Plataforma Rappi al momento de realizar la orden, el cual podrá variar en función de la ' +
      'operación y disponibilidad de cada Aliado Comercial.';
  }

  var tiendas = entrada.tiendasEta || [];
  if (tiendas.length === 0) return '';

  var lineas = ['Participarán únicamente las siguientes tiendas virtuales del botón “Turbo” ' +
    'al interior de la Plataforma Rappi, habilitadas en ' + ciudad + ' durante la vigencia de la Campaña:'];
  for (var i = 0; i < tiendas.length; i++) {
    var nombre = String((tiendas[i] || {}).nombre || '').trim();
    if (!nombre) return '';
    lineas.push('• ' + nombre);
  }
  lineas.push('La disponibilidad de cada Tienda Participante podrá variar en función de la ' +
    'operación de cada Aliado Comercial.');
  return lineas.join('\n');
}

/**
 * FRAGMENTO: la cola de la vinneta de condiciones que nombra la categoria.
 *
 * Con categoria, la vinneta dice lo mismo que el documento aprobado. Con
 * tiendas concretas no hay categoria que nombrar, asi que la vinneta cierra
 * despues de "Tiendas Participantes".
 */
function textoModalidadEnCondiciones(entrada) {
  var modalidad = modalidadTurbo(entrada);
  return modalidad ? ' identificadas con la modalidad “' + modalidad + '”' : '';
}

/**
 * ORACION: el maximo de ordenes por persona.
 *
 * Va en femenino porque en este modelo se cuentan ordenes, no pedidos:
 * "una (1) orden", "doscientas (200) ordenes".
 */
function textoLimiteOrdenes(entrada) {
  if (entrada.sinLimite) {
    return 'No hay límite de órdenes por Usuario/Consumidor durante la vigencia de la Campaña.';
  }
  if (!tieneValor(entrada.maxPedidos)) return '';

  var cantidad = Math.trunc(Number(entrada.maxPedidos));
  var sustantivo = cantidad === 1 ? 'orden' : 'órdenes';
  return 'Máximo ' + letrasYCifraFemenino(cantidad) + ' ' + sustantivo +
    ' por Usuario/Consumidor durante toda la vigencia de la Campaña.';
}

/**
 * ORACION: donde se pueden redimir los Creditos.
 *
 * Sin exclusiones la frase no puede quedar con un "a excepcion de" colgando, asi
 * que se dice entera de otra forma.
 */
function textoRedencionEta(entrada, pais) {
  var base = 'Se aclara que los Créditos otorgados podrán ser utilizados o redimidos en cualquier sección de la Plataforma Rappi';
  var excluidas = textoSeccionesExcluidas(entrada.exclusionesEta, pais ? pais.codigo : 'CO');
  if (!excluidas) return base + '.';
  return base + ', a excepción de ' + excluidas + '.';
}

/**
 * El presupuesto de este modelo, en letras y cifra.
 *
 * Los documentos publicados lo escribian solo en cifra ("37.000.000 de
 * Creditos"), mientras que el resto de numeros del mismo documento si van en
 * letras y cifra. Uno de los dos llego a decir "95.087.585,10 de Creditos", con
 * decimales, que para unos puntos que no se fraccionan no tiene sentido.
 * Ver docs/MEJORAS_ETA.md.
 */
function presupuestoEta(entrada, pais) {
  if (!tieneValor(entrada.presupuesto)) return '';
  return cantidadCreditos(Math.trunc(Number(entrada.presupuesto)), pais);
}

/** Todos los valores del modelo del ETA. Se agregan encima de los comunes. */
function calcularDerivadosEta(entrada, pais) {
  return {
    TEXTO_ETA: textoEta(entrada),
    TEXTO_CIUDAD_ETA: textoCiudadEta(entrada),
    TEXTO_TIENDAS_ETA: textoTiendasEta(entrada),
    TEXTO_LIMITE_ORDENES: textoLimiteOrdenes(entrada),
    // Va dentro de la clausula de vigencia y redencion de Creditos, que es
    // donde la ponen los demas modelos. En los documentos publicados estaba
    // suelta entre las restricciones. Ver docs/MEJORAS_ETA.md.
    TEXTO_LUGAR_REDENCION: textoRedencionEta(entrada, pais),
    MODALIDAD_TURBO: modalidadTurbo(entrada),
    TEXTO_MODALIDAD_CONDICIONES: textoModalidadEnCondiciones(entrada),
    PRESUPUESTO: presupuestoEta(entrada, pais),
  };
}

if (typeof module !== 'undefined') {
  module.exports = {
    MODALIDAD_TURBO_POR_DEFECTO: MODALIDAD_TURBO_POR_DEFECTO,
    MODALIDAD_POR_ALCANCE: MODALIDAD_POR_ALCANCE,
    SECCIONES_EXCLUIBLES_ETA: SECCIONES_EXCLUIBLES_ETA,
    seccionesExcluiblesDe: seccionesExcluiblesDe,
    textoSeccionesExcluidas: textoSeccionesExcluidas,
    textoTiendasEta: textoTiendasEta,
    modalidadTurbo: modalidadTurbo,
    calcularDerivadosEta: calcularDerivadosEta,
  };
}
