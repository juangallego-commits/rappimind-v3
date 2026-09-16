'use strict';

/**
 * Utilidades del navegador. Todo lo que no es logica de negocio.
 *
 * Regla de seguridad: cualquier dato del usuario entra al DOM como TEXTO, con
 * textContent o createTextNode. En este archivo no hay un solo innerHTML con
 * datos, y en el resto de la interfaz tampoco.
 */

var RM = window.RM || {};
window.RM = RM;

/** Crea un elemento. Los hijos de texto entran como texto, nunca como HTML. */
function crear(etiqueta, atributos, hijos) {
  var elemento = document.createElement(etiqueta);
  var propiedades = atributos || {};

  for (var llave in propiedades) {
    if (!Object.prototype.hasOwnProperty.call(propiedades, llave)) continue;
    var valor = propiedades[llave];
    if (valor === null || valor === undefined || valor === false) continue;

    if (llave === 'clase') elemento.className = valor;
    else if (llave === 'texto') elemento.textContent = valor;
    else if (llave === 'html') throw new Error('No se inserta HTML: usa texto.');
    else if (llave.indexOf('on') === 0 && typeof valor === 'function') {
      elemento.addEventListener(llave.slice(2), valor);
    } else if (valor === true) elemento.setAttribute(llave, '');
    else elemento.setAttribute(llave, valor);
  }

  var lista = hijos || [];
  for (var i = 0; i < lista.length; i++) {
    var hijo = lista[i];
    if (hijo === null || hijo === undefined || hijo === false) continue;
    elemento.appendChild(typeof hijo === 'string' ? document.createTextNode(hijo) : hijo);
  }
  return elemento;
}

function vaciar(elemento) {
  while (elemento.firstChild) elemento.removeChild(elemento.firstChild);
  return elemento;
}

function porId(id) {
  return document.getElementById(id);
}

/** Iconos: SVG de un solo trazo, nunca emojis. */
var TRAZOS = {
  visto: 'M4 10.5 L8 14.5 L16 5.5',
  abrir: 'M11 3h6v6M17 3l-8 8M14 12v5H3V6h5',
  buscar: 'M9 3a6 6 0 1 0 0 12A6 6 0 0 0 9 3zM13.5 13.5 17 17',
  volver: 'M9 4 4 10l5 6M4 10h12',
  documento: 'M5 2h7l3 3v13H5zM12 2v3h3',
  alerta: 'M10 3 18 17H2zM10 8v4M10 14.5v.5',
  descargar: 'M10 3v10M6 10l4 4 4-4M3 17h14',
};

function icono(nombre, tamano) {
  var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 20 20');
  svg.setAttribute('width', tamano || 18);
  svg.setAttribute('height', tamano || 18);
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '1.8');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');

  var trazo = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  trazo.setAttribute('d', TRAZOS[nombre] || TRAZOS.documento);
  svg.appendChild(trazo);
  return svg;
}

/** La corona de RappiMind, que a Anna le gustó. */
function corona() {
  var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 14');
  svg.setAttribute('class', 'corona');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');

  var trazo = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  trazo.setAttribute('d', 'M2 12.5 L2 4 L6.5 7.5 L12 1.5 L17.5 7.5 L22 4 L22 12.5 Z');
  trazo.setAttribute('fill', 'currentColor');
  trazo.setAttribute('stroke', 'currentColor');
  trazo.setAttribute('stroke-width', '1.6');
  trazo.setAttribute('stroke-linejoin', 'round');
  svg.appendChild(trazo);
  return svg;
}

/** Número con el separador de miles del país, mientras se escribe. */
function conSeparadorDeMiles(valor, separador) {
  var digitos = String(valor === null || valor === undefined ? '' : valor).replace(/\D/g, '');
  if (!digitos) return '';
  return digitos.replace(/\B(?=(\d{3})+(?!\d))/g, separador || '.');
}

function soloDigitos(texto) {
  return String(texto || '').replace(/\D/g, '');
}

/** Fecha de hoy en AAAA-MM-DD, según el reloj del navegador. */
function hoyEnElNavegador() {
  var ahora = new Date();
  var mes = String(ahora.getMonth() + 1);
  var dia = String(ahora.getDate());
  return ahora.getFullYear() + '-' + (mes.length < 2 ? '0' + mes : mes) + '-' + (dia.length < 2 ? '0' + dia : dia);
}

/** Días entre dos fechas ISO. Positivo si la segunda es posterior. */
function diasEntre(desdeIso, hastaIso) {
  var a = new Date(desdeIso + 'T00:00:00');
  var b = new Date(hastaIso + 'T00:00:00');
  return Math.round((b - a) / 86400000);
}

/** Espera a que el usuario deje de escribir. */
function conRetraso(fn, ms) {
  var temporizador = null;
  return function () {
    var argumentos = arguments;
    var contexto = this;
    if (temporizador) clearTimeout(temporizador);
    temporizador = setTimeout(function () { fn.apply(contexto, argumentos); }, ms || 220);
  };
}

function anunciar(mensaje) {
  var region = porId('anuncios');
  if (region) region.textContent = mensaje;
}

RM.util = {
  crear: crear,
  vaciar: vaciar,
  porId: porId,
  icono: icono,
  corona: corona,
  conSeparadorDeMiles: conSeparadorDeMiles,
  soloDigitos: soloDigitos,
  hoyEnElNavegador: hoyEnElNavegador,
  diasEntre: diasEntre,
  conRetraso: conRetraso,
  anunciar: anunciar,
};
