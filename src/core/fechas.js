'use strict';

/**
 * Fechas, horas y listas, en el idioma del pais.
 *
 * Las fechas se manejan como texto ISO (AAAA-MM-DD) y nunca como objetos Date:
 * asi no dependen de la zona horaria del servidor ni del navegador, que es la
 * causa clasica de que un documento salga con un dia de diferencia.
 */

/* En Node las dependencias se cargan con require; en Apps Script ya son globales. */
if (typeof module !== 'undefined' && typeof require === 'function') {
  var textosDelIdioma = require('./idiomas.js').textosDelIdioma;
  var conElIdiomaDe = require('./idiomas.js').conElIdiomaDe;
}

/* Se conserva por compatibilidad: los meses de verdad salen del idioma activo. */
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

/** "2026-09-17" -> "17 de septiembre de 2026", o "17 de setembro de 2026". */
function formatearFecha(iso) {
  var p = partesDeFecha(iso);
  if (!p) return '';
  return p.dia + ' de ' + textosDelIdioma().meses[p.mes - 1] + ' de ' + p.anio;
}

/**
 * La fecha y la hora como las escribe el pais de la campana, fuera del documento.
 *
 * El idioma se enciende solo mientras se calcula el documento. Fuera de ahi
 * (las respuestas plegadas y el resumen) todo salia en espanol, y un KAM de
 * Brasil veia "1 de octubre de 2026" y "12:00 a. m." arriba de un documento que
 * decia "1 de outubro de 2026 às 00:00".
 */
function formatearFechaDelPais(iso, pais) {
  return conElIdiomaDe(pais, function () { return formatearFecha(iso); });
}

function formatearHoraDelPais(texto, pais) {
  return conElIdiomaDe(pais, function () { return formatearHora(texto); });
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

/**
 * La hora como la escribe cada pais.
 *
 * En espanol, reloj de doce horas: "09:00" -> "9:00 a. m."; "23:59" -> "11:59 p. m.".
 * En portugues, reloj de veinticuatro con cero inicial: "00:01" -> "00:01";
 * "23:59" -> "23:59". Asi va en los T&C aprobados de Brasil.
 */
function formatearHora(texto) {
  var p = partesDeHora(texto);
  if (!p) return '';
  var idioma = textosDelIdioma();
  var minutos = p.minuto < 10 ? '0' + p.minuto : String(p.minuto);

  if (idioma.reloj === 24) {
    var horas = p.hora < 10 ? '0' + p.hora : String(p.hora);
    return horas + idioma.separadorDeHora + minutos;
  }

  var sufijo = p.hora < 12 ? idioma.sufijoAntesDelMediodia : idioma.sufijoDespuesDelMediodia;
  var hora12 = p.hora % 12 || 12;
  return hora12 + ':' + minutos + ' ' + sufijo;
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

/** "a", "a y b", "a, b y c". En portugues la conjuncion es "e". */
function listaY(elementos) {
  var limpios = [];
  for (var i = 0; i < elementos.length; i++) {
    var elemento = String(elementos[i]).trim();
    if (elemento) limpios.push(elemento);
  }
  if (limpios.length === 0) return '';
  if (limpios.length === 1) return limpios[0];
  return limpios.slice(0, -1).join(', ') + ' ' + textosDelIdioma().conjuncionDeLista + ' ' + limpios[limpios.length - 1];
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
    formatearFechaDelPais: formatearFechaDelPais,
    formatearHoraDelPais: formatearHoraDelPais,
    comoNumeroFecha: comoNumeroFecha,
    comoNumeroFechaHora: comoNumeroFechaHora,
    listaY: listaY,
    separarPorComas: separarPorComas,
  };
}
