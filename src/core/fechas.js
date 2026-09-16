'use strict';

/**
 * Fechas, horas y listas en espanol.
 *
 * Las fechas se manejan como texto ISO (AAAA-MM-DD) y nunca como objetos Date:
 * asi no dependen de la zona horaria del servidor ni del navegador, que es la
 * causa clasica de que un documento salga con un dia de diferencia.
 */

var MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

/** Descompone una fecha ISO. Devuelve null si no tiene forma valida. */
function partesDeFecha(iso) {
  var encontrado = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || '').trim());
  if (!encontrado) return null;
  var anio = Number(encontrado[1]);
  var mes = Number(encontrado[2]);
  var dia = Number(encontrado[3]);
  if (mes < 1 || mes > 12 || dia < 1 || dia > 31) return null;
  // Rechaza 31 de abril o 30 de febrero.
  var diasPorMes = [31, esBisiesto(anio) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (dia > diasPorMes[mes - 1]) return null;
  return { anio: anio, mes: mes, dia: dia };
}

function esBisiesto(anio) {
  return (anio % 4 === 0 && anio % 100 !== 0) || anio % 400 === 0;
}

/** "2026-09-17" -> "17 de septiembre de 2026". */
function formatearFecha(iso) {
  var p = partesDeFecha(iso);
  if (!p) return '';
  return p.dia + ' de ' + MESES[p.mes - 1] + ' de ' + p.anio;
}

/** Descompone una hora HH:MM. Devuelve null si no es valida. */
function partesDeHora(texto) {
  var encontrado = /^(\d{1,2}):(\d{2})$/.exec(String(texto || '').trim());
  if (!encontrado) return null;
  var hora = Number(encontrado[1]);
  var minuto = Number(encontrado[2]);
  if (hora > 23 || minuto > 59) return null;
  return { hora: hora, minuto: minuto };
}

/** "09:00" -> "9:00 a. m."; "23:59" -> "11:59 p. m."; "12:00" -> "12:00 p. m.". */
function formatearHora(texto) {
  var p = partesDeHora(texto);
  if (!p) return '';
  var sufijo = p.hora < 12 ? 'a. m.' : 'p. m.';
  var hora12 = p.hora % 12 || 12;
  return hora12 + ':' + (p.minuto < 10 ? '0' + p.minuto : String(p.minuto)) + ' ' + sufijo;
}

/** Comparable para ordenar y comparar fechas ISO sin usar Date. */
function comoNumeroFecha(iso) {
  var p = partesDeFecha(iso);
  if (!p) return null;
  return p.anio * 10000 + p.mes * 100 + p.dia;
}

/** Comparable para fecha + hora juntas. */
function comoNumeroFechaHora(iso, hora) {
  var f = comoNumeroFecha(iso);
  var h = partesDeHora(hora);
  if (f === null || !h) return null;
  return f * 10000 + h.hora * 100 + h.minuto;
}

/** "a", "a y b", "a, b y c". */
function listaY(elementos) {
  var limpios = [];
  for (var i = 0; i < elementos.length; i++) {
    var elemento = String(elementos[i]).trim();
    if (elemento) limpios.push(elemento);
  }
  if (limpios.length === 0) return '';
  if (limpios.length === 1) return limpios[0];
  return limpios.slice(0, -1).join(', ') + ' y ' + limpios[limpios.length - 1];
}

/** Separa un texto con comas en una lista limpia. */
function separarPorComas(texto) {
  var partes = String(texto || '').split(',');
  var limpias = [];
  for (var i = 0; i < partes.length; i++) {
    var parte = partes[i].trim();
    if (parte) limpias.push(parte);
  }
  return limpias;
}

if (typeof module !== 'undefined') {
  module.exports = {
    MESES: MESES,
    partesDeFecha: partesDeFecha,
    partesDeHora: partesDeHora,
    formatearFecha: formatearFecha,
    formatearHora: formatearHora,
    comoNumeroFecha: comoNumeroFecha,
    comoNumeroFechaHora: comoNumeroFechaHora,
    listaY: listaY,
    separarPorComas: separarPorComas,
  };
}
