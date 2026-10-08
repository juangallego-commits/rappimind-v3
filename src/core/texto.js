'use strict';

/**
 * Normalizacion de texto del motor.
 *
 * Vive en src/core porque la usan por igual Node (pruebas), Apps Script
 * (generacion del documento) y el navegador (vista previa en vivo).
 *
 * Los modelos y las salidas esperadas se editan en Windows, macOS y Linux. El
 * motor ignora los retornos de carro y la marca BOM para que el texto generado
 * sea identico en los tres sistemas, sin depender de la configuracion de git
 * de quien edite el archivo.
 *
 * Sin import ni require: en Apps Script estas funciones son globales.
 */

/** Quita la marca BOM y convierte \r\n y \r sueltos en \n. */
/**
 * Si un dato viene con algo adentro. Una lista vacia no cuenta.
 *
 * Esta aqui, una sola vez, porque estuvo definida tres veces (en derivados.js,
 * derivados_br.js y derivados_eta.js) con dos criterios distintos para las
 * listas. En Apps Script y en el navegador la ultima definicion pisa a las
 * otras, asi que el mismo dato se evaluaba distinto en Node y en produccion.
 */
function tieneValor(valor) {
  if (valor === null || valor === undefined || valor === '') return false;
  if (Object.prototype.toString.call(valor) === '[object Array]') return valor.length > 0;
  return true;
}

/**
 * Las respuestas del comercial, sin los espacios de sobra.
 *
 * Devuelve una copia: junta en uno solo cada tramo de espacios, tabulaciones,
 * saltos de linea y espacios duros (los que trae un texto pegado desde Word,
 * Excel o una pagina web), y quita los del principio y del final. Recorre
 * listas y objetos, porque las tiendas y los productos viajan como filas.
 * Numeros, casillas y vacios pasan intactos.
 *
 * Paso de verdad: el comercial escribia "Masterfoods Colombia  Ltda" con dos
 * espacios, o los traia pegados de otro documento. La pantalla de revision lo
 * dejaba pasar (en HTML los espacios dobles no se ven, y la revision de datos
 * no mira la forma del texto), el comercial tocaba Generar, y la red de
 * seguridad del motor lo frenaba con "El texto quedo roto: hay dos espacios
 * seguidos", sin decir en cual pregunta y sobre un error que no se alcanza a
 * ver. Pasaba con cada campo de texto libre de cada tipo de campana y de cada
 * pais.
 *
 * No es cosmetico ni decide nada por el comercial: dos espacios no son un dato
 * distinto de uno. Por eso se arregla aqui, en el borde, y la red del motor se
 * queda como esta para atrapar lo que no venga de una respuesta.
 */
function limpiarEspacios(valor) {
  if (typeof valor === 'string') return valor.replace(/\s+/g, ' ').trim();
  if (Object.prototype.toString.call(valor) === '[object Array]') {
    var lista = [];
    for (var i = 0; i < valor.length; i++) lista.push(limpiarEspacios(valor[i]));
    return lista;
  }
  // Solo objetos corrientes: una fecha o cualquier otro objeto con forma propia
  // pasa tal cual en vez de volverse un {} vacio.
  if (Object.prototype.toString.call(valor) === '[object Object]') {
    var copia = {};
    for (var llave in valor) {
      if (Object.prototype.hasOwnProperty.call(valor, llave)) copia[llave] = limpiarEspacios(valor[llave]);
    }
    return copia;
  }
  return valor;
}

function normalizarTexto(texto) {
  if (texto === null || texto === undefined) return '';
  var limpio = String(texto);
  if (limpio.charCodeAt(0) === 0xfeff) limpio = limpio.slice(1);
  return limpio.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

/** Separa en lineas despues de normalizar. */
function lineasDe(texto) {
  return normalizarTexto(texto).split('\n');
}

/** Quita espacios y tabulaciones al final de cada linea. */
function recortarFinalDeLinea(texto) {
  return lineasDe(texto)
    .map(function (linea) {
      return linea.replace(/[ \t]+$/, '');
    })
    .join('\n');
}

/**
 * Normalizacion usada para comparar el texto generado contra una salida
 * esperada: sin \r, sin espacios al final de linea y sin lineas en blanco al
 * principio ni al final.
 */
function normalizarParaComparar(texto) {
  return recortarFinalDeLinea(texto).replace(/^\n+/, '').replace(/\n+$/, '');
}

/**
 * El documento sin sus marcas de formato: lo que el documento dice, no como
 * se ve. Se usa para buscar frases y para la red de seguridad, donde un "**"
 * en medio no debe esconder un espacio de mas ni una frase rota.
 */
function textoPlano(texto) {
  return normalizarTexto(texto).replace(/\*\*/g, '');
}

/**
 * El termino de dias del pais, en singular cuando la cantidad es uno.
 *
 * La columna termino_dias de la pestana Paises guarda siempre el plural
 * ("dias calendario", "dias naturales", "dias corridos", "dias corridos" en
 * Brasil), porque es como aparece en las clausulas. Cuando la respuesta del
 * comercial es 1, ese plural sale pegado a la cifra y el documento publica
 * "una vigencia de un (1) dias calendario".
 *
 * Paso de verdad: la vigencia de los Creditos admite 1 dia (la pregunta acepta
 * de 1 a 365) y ningun caso dorado usaba ese valor, asi que ninguna prueba lo
 * veia. La red de seguridad del motor tampoco, porque la frase no tiene ningun
 * signo roto: solo esta mal escrita.
 *
 * No se reescribe el texto de Legal: se pone en singular la misma palabra que
 * Legal escribio. La regla es mecanica, sobre cada palabra del termino: lo que
 * termina en "es" pierde el "es" (naturales a natural), lo que termina en "s"
 * pierde la "s" (dias a dia, corridos a corrido) y lo demas se queda igual
 * (calendario). Si alguien escribe otro termino en el Sheet, lo peor que pasa
 * es que se quede como estaba.
 */
function terminoDeDias(pais, cantidad) {
  var termino = (pais && pais.termino_dias) || '';
  if (Number(cantidad) !== 1) return termino;
  return termino
    .split(' ')
    .map(function (palabra) {
      if (/es$/.test(palabra)) return palabra.slice(0, -2);
      if (/s$/.test(palabra)) return palabra.slice(0, -1);
      return palabra;
    })
    .join(' ');
}

/** true si el texto trae algun retorno de carro. */
function tieneRetornoDeCarro(texto) {
  return String(texto === null || texto === undefined ? '' : texto).indexOf('\r') !== -1;
}

/**
 * En cual de las tiendas de la marca se gana el cashback.
 *
 * Muchas marcas tienen dos tiendas en la app: la normal y la de Turbo. Hasta el
 * 20 de septiembre de 2026 la pregunta era otra, "en que pedidos aplica el
 * beneficio", y el documento no decia en cual de las dos tiendas contaba el
 * pedido: el usuario podia reclamar el cashback en cualquiera de las dos. Juan
 * la reemplazo ese dia, y de paso quito "Solo consumo en el local", que en
 * Rappi no existe como modalidad (punto C3).
 *
 * Devuelve 'normal', 'turbo', 'ambas', 'sin_turbo', o cadena vacia si nadie ha
 * respondido todavia. Sirve igual para una campana entera (el Cashback) y para
 * una fila de la lista de tiendas (el Multitienda), porque las dos guardan la
 * respuesta con el mismo nombre.
 *
 * Lo guardado antes sigue sirviendo, que es lo que pidio Juan: una campana con
 * "Solo pedidos por Turbo" abre en "Solo en la tienda de Turbo", y una con "En
 * cualquier pedido" abre sin respuesta, para que el comercial elija. Las de
 * antes del punto D2 guardaron una lista, asi que tambien se lee esa forma.
 */
function tiendaDelCashback(entrada) {
  var datos = entrada || {};
  var elegida = String(datos.tiendaTurbo === null || datos.tiendaTurbo === undefined ? '' : datos.tiendaTurbo).trim();
  if (elegida) return elegida;

  var viejo = datos.condiciones;
  if (Object.prototype.toString.call(viejo) === '[object Array]') viejo = viejo.length > 0 ? viejo[0] : '';
  return String(viejo === null || viejo === undefined ? '' : viejo).trim() === 'turbo' ? 'turbo' : '';
}

/** true si la respuesta incluye la tienda de Turbo. */
function incluyeTurbo(entrada) {
  var cual = tiendaDelCashback(entrada);
  return cual === 'turbo' || cual === 'ambas';
}

/**
 * Las marcas que escribio el comercial en el campo de marca, una por coma.
 *
 * El campo era para una marca y el comercial de Kenvue escribio "NEUTROGENA® y
 * LUBRIDERM®": el documento decia "los productos de la marca NEUTROGENA® y
 * LUBRIDERM®", una frase rota. Ahora las marcas se separan por comas y el
 * documento dice "de la marca X" con una y "de las marcas X y Y" con varias.
 * H16 de la revision de la Carrera (Kenvue), 8 de octubre de 2026. Sirve igual
 * en Descuento y Cupon, que usan la misma frase.
 */
function marcasDeLaCampana(texto) {
  var partes = String(texto === null || texto === undefined ? '' : texto).split(',');
  var marcas = [];
  for (var i = 0; i < partes.length; i++) {
    var marca = partes[i].replace(/\s+/g, ' ').trim();
    if (marca) marcas.push(marca);
  }
  return marcas;
}

/**
 * Las tiendas donde suman las compras de una Carrera de Compras.
 *
 * Desde el 8 de octubre de 2026 (K1 de la revisión de la Carrera de Kenvue) la
 * Carrera acepta una o varias Tiendas Participantes con un solo ranking. Cada
 * fila trae el nombre y en cuál de sus tiendas cuentan los pedidos (la normal,
 * la de Turbo o las dos), y vive en entrada.tiendasCarrera.
 *
 * Lo guardado antes sigue sirviendo: una campaña con la tienda escrita como
 * texto en entrada.tienda se lee como una lista de una fila. No tenía respuesta
 * de Turbo, y el documento de entonces no decía nada de Turbo, así que se lee
 * como "No tiene tienda en Turbo", que no imprime nada. Sin esto, Ampliar y el
 * historial de toda Carrera ya generada se quedaban sin tienda.
 *
 * Una fila vacía no cuenta: la vista previa se pinta mientras se escribe.
 * unaSola es la confirmación de "es una sola tienda, se llama así" para un
 * nombre que parece dos; la tienda guardada como texto se da por confirmada.
 */
function tiendasDeLaCarrera(entrada) {
  var datos = entrada || {};
  var lista = datos.tiendasCarrera;
  var salida = [];

  if (Object.prototype.toString.call(lista) === '[object Array]') {
    for (var i = 0; i < lista.length; i++) {
      var fila = lista[i] || {};
      var nombre = String(fila.nombre === null || fila.nombre === undefined ? '' : fila.nombre).trim();
      if (!nombre) continue;
      salida.push({
        nombre: nombre,
        tiendaTurbo: String(fila.tiendaTurbo === null || fila.tiendaTurbo === undefined ? '' : fila.tiendaTurbo).trim(),
        unaSola: fila.unaSola === true,
      });
    }
    return salida;
  }

  var antigua = String(datos.tienda === null || datos.tienda === undefined ? '' : datos.tienda).trim();
  if (antigua) salida.push({ nombre: antigua, tiendaTurbo: 'sin_turbo', unaSola: true });
  return salida;
}

if (typeof module !== 'undefined') {
  module.exports = {
    tieneValor: tieneValor,
    limpiarEspacios: limpiarEspacios,
    tiendaDelCashback: tiendaDelCashback,
    tiendasDeLaCarrera: tiendasDeLaCarrera,
    marcasDeLaCampana: marcasDeLaCampana,
    incluyeTurbo: incluyeTurbo,
    normalizarTexto: normalizarTexto,
    lineasDe: lineasDe,
    recortarFinalDeLinea: recortarFinalDeLinea,
    normalizarParaComparar: normalizarParaComparar,
    textoPlano: textoPlano,
    terminoDeDias: terminoDeDias,
    tieneRetornoDeCarro: tieneRetornoDeCarro,
  };
}
