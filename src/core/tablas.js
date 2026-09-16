'use strict';

/**
 * Lectura y escritura de tablas: la parte del Sheet que no necesita Google.
 *
 * El servidor pide un rango a SpreadsheetApp y le pasa el arreglo a estas
 * funciones. Asi la logica de las pestanas se prueba entera en Node y el
 * codigo que toca el Sheet queda reducido a leer y escribir un rectangulo.
 */

/** Normaliza un encabezado para comparar: sin espacios sobrantes. */
function normalizarEncabezado(valor) {
  return String(valor === null || valor === undefined ? '' : valor).trim();
}

/**
 * Valores de una pestana (primera fila = encabezados) -> lista de objetos.
 * Las filas totalmente vacias se descartan.
 */
function filasComoObjetos(valores) {
  if (!valores || valores.length < 2) return [];

  var encabezados = [];
  for (var c = 0; c < valores[0].length; c++) {
    encabezados.push(normalizarEncabezado(valores[0][c]));
  }

  var objetos = [];
  for (var f = 1; f < valores.length; f++) {
    var fila = valores[f];
    var objeto = {};
    var tieneAlgo = false;

    for (var i = 0; i < encabezados.length; i++) {
      if (!encabezados[i]) continue;
      var valor = fila[i];
      objeto[encabezados[i]] = valor === undefined ? '' : valor;
      if (valor !== '' && valor !== null && valor !== undefined) tieneAlgo = true;
    }

    if (tieneAlgo) {
      objeto._fila = f + 1; // numero de fila real en el Sheet
      objetos.push(objeto);
    }
  }
  return objetos;
}

/** Objeto -> fila en el orden de los encabezados. Lo que falta queda vacio. */
function objetoComoFila(objeto, encabezados) {
  var fila = [];
  for (var i = 0; i < encabezados.length; i++) {
    var llave = encabezados[i];
    var valor = Object.prototype.hasOwnProperty.call(objeto, llave) ? objeto[llave] : '';
    fila.push(valor === null || valor === undefined ? '' : valor);
  }
  return fila;
}

/** Lee un valor de verdad escrito en el Sheet: si, true, TRUE, 1, x. */
function comoBooleano(valor) {
  if (valor === true) return true;
  if (valor === false || valor === null || valor === undefined) return false;
  var texto = String(valor).trim().toLowerCase();
  return texto === 'si' || texto === 'sí' || texto === 'true' || texto === '1' || texto === 'x';
}

/**
 * Siguiente consecutivo del dia para los identificadores RM-AAAAMMDD-NNNN.
 * Solo cuenta los del mismo dia, asi el numero vuelve a 1 cada manana.
 */
function siguienteConsecutivo(identificadores, fechaIso) {
  var prefijo = 'RM-' + String(fechaIso || '').replace(/-/g, '') + '-';
  var mayor = 0;

  for (var i = 0; i < identificadores.length; i++) {
    var id = String(identificadores[i] || '');
    if (id.indexOf(prefijo) !== 0) continue;
    var numero = parseInt(id.slice(prefijo.length), 10);
    if (!isNaN(numero) && numero > mayor) mayor = numero;
  }
  return mayor + 1;
}

/**
 * Filtra solicitudes por lo que puede ver quien pregunta.
 * comercial y pruebas ven las suyas; legal ve las de su pais; admin ve todo.
 */
function solicitudesVisibles(solicitudes, correo, rol, paisDelUsuario) {
  var visibles = [];
  var correoNormalizado = String(correo || '').trim().toLowerCase();

  for (var i = 0; i < solicitudes.length; i++) {
    var solicitud = solicitudes[i];
    var propia = String(solicitud.email || '').trim().toLowerCase() === correoNormalizado;

    if (rol === 'admin' || propia) {
      visibles.push(solicitud);
    } else if (rol === 'legal' && solicitud.pais === paisDelUsuario) {
      visibles.push(solicitud);
    }
  }
  return visibles;
}

/** Busca texto en los campos visibles de una solicitud. */
function buscarEnSolicitudes(solicitudes, texto) {
  var buscado = String(texto || '').trim().toLowerCase();
  if (!buscado) return solicitudes;

  var encontradas = [];
  var campos = ['id', 'nombre_campana', 'tienda', 'organizador', 'pais', 'tipo', 'estado'];

  for (var i = 0; i < solicitudes.length; i++) {
    for (var c = 0; c < campos.length; c++) {
      var valor = String(solicitudes[i][campos[c]] || '').toLowerCase();
      if (valor.indexOf(buscado) !== -1) {
        encontradas.push(solicitudes[i]);
        break;
      }
    }
  }
  return encontradas;
}

/** Arma un CSV con separador de coma y comillas donde hace falta. */
function comoCsv(objetos, encabezados) {
  function escapar(valor) {
    var texto = valor === null || valor === undefined ? '' : String(valor);
    if (/[",\n]/.test(texto)) return '"' + texto.replace(/"/g, '""') + '"';
    return texto;
  }

  var lineas = [encabezados.map(escapar).join(',')];
  for (var i = 0; i < objetos.length; i++) {
    lineas.push(objetoComoFila(objetos[i], encabezados).map(escapar).join(','));
  }
  return lineas.join('\n');
}

if (typeof module !== 'undefined') {
  module.exports = {
    filasComoObjetos: filasComoObjetos,
    objetoComoFila: objetoComoFila,
    comoBooleano: comoBooleano,
    siguienteConsecutivo: siguienteConsecutivo,
    solicitudesVisibles: solicitudesVisibles,
    buscarEnSolicitudes: buscarEnSolicitudes,
    comoCsv: comoCsv,
  };
}
