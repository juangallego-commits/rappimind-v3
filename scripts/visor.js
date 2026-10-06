'use strict';

/**
 * Arma el bloque de código que se pega una sola vez en la página /tyc de
 * promos.rappi.com, con el bucket donde RappiMind publica los T&C.
 *
 *   npm run visor -- --bucket NOMBRE_DEL_BUCKET [--carpeta tyc]
 *
 * Escribe docs/VISOR_SQUARESPACE.html, que no se versiona: sale del bucket y
 * se rearma con este comando (decisión 134).
 *
 * El bloque sale en ASCII puro (las tildes como á o &#225;), para que
 * ningún editor ni ningún copiar y pegar le cambie la codificación.
 */

const { rutaDesdeRaiz, leerTexto, escribirTexto } = require('./lib/archivos');
const W = require('../src/core/publicacion_web.js');
const { TEXTOS_DEL_VISOR } = require('../src/visor/visor.js');

const CORTE = '/* --- SOLO PARA LAS PRUEBAS';
const SALIDA = rutaDesdeRaiz('docs', 'VISOR_SQUARESPACE.html');

/**
 * El código del visor sin el bloque de exportación para las pruebas y sin
 * comentarios: la explicación vive en src/visor/visor.js, y en Squarespace
 * solo queda una cabecera que dice qué es y de dónde sale.
 *
 * Quita los comentarios de bloque y las líneas que son solo un comentario. El
 * visor no tiene "/*" dentro de un texto ni comentarios al final de una línea
 * de código; una prueba corre el bloque armado para comprobar que sigue sano.
 */
function codigoDelVisor() {
  const fuente = leerTexto(rutaDesdeRaiz('src', 'visor', 'visor.js'));
  const corte = fuente.indexOf(CORTE);
  if (corte === -1) throw new Error('src/visor/visor.js perdió la marca desde donde se corta el bloque de las pruebas.');
  return fuente.slice(0, corte)
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n')
    .filter((linea) => !/^\s*\/\//.test(linea))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^\s+|\s+$/g, '');
}

function enAsciiParaJs(texto) {
  return texto.replace(/[\u007f-￿]/g, (c) => '\\u' + ('0000' + c.charCodeAt(0).toString(16)).slice(-4));
}

function enAsciiParaHtml(texto) {
  return texto.replace(/[\u007f-￿]/g, (c) => '&#' + c.charCodeAt(0) + ';');
}

/** https://storage.googleapis.com/BUCKET/CARPETA/ */
function baseDelVisor(config) {
  return W.urlPublicaDelObjetoWeb(config, config.carpeta + '/');
}

/** El bloque completo para pegar en Squarespace. */
function bloqueParaSquarespace(config) {
  const html = [
    '<div id="rappimind-tyc" aria-live="polite"><p>' + TEXTOS_DEL_VISOR.es.cargando + '</p></div>',
    '<noscript>',
    '<p>Para ver los términos y condiciones, activa JavaScript en tu navegador.</p>',
    '<p>Para ver os termos e condições, ative o JavaScript no seu navegador.</p>',
    '</noscript>',
    '<style>',
    '#rappimind-tyc .rappimind-tyc-centrado { text-align: center; }',
    '#rappimind-tyc .rappimind-tyc-aviso { border: 1px solid; border-radius: 8px; padding: 12px 16px; margin: 0 0 24px; }',
    '#rappimind-tyc .rappimind-tyc-boton { cursor: pointer; }',
    '</style>',
  ].join('\n');

  const script = [
    '<script>',
    '/* RappiMind: visor de los T&C de promos.rappi.com. No se edita a mano: se arma con',
    '   npm run visor (scripts/visor.js) desde src/visor/visor.js. */',
    '(function () {',
    codigoDelVisor(),
    '',
    'iniciarVisor(window, ' + JSON.stringify({ base: baseDelVisor(config) }) + ');',
    '})();',
    '</script>',
  ].join('\n');

  return enAsciiParaHtml(html) + '\n' + enAsciiParaJs(script) + '\n';
}

function leerArgumentos(argumentos) {
  const valores = {};
  for (let i = 0; i < argumentos.length; i++) {
    if (argumentos[i] === '--bucket') valores.bucket = argumentos[++i];
    else if (argumentos[i] === '--carpeta') valores.carpeta = argumentos[++i];
  }
  return valores;
}

function principal() {
  const config = W.configuracionDePublicacionWeb(leerArgumentos(process.argv.slice(2)));
  if (!config.activa) {
    console.error(config.problema);
    console.error('Uso: npm run visor -- --bucket NOMBRE_DEL_BUCKET [--carpeta tyc]');
    process.exitCode = 1;
    return;
  }

  escribirTexto(SALIDA, bloqueParaSquarespace(config));
  console.log('Listo: docs/VISOR_SQUARESPACE.html');
  console.log('');
  console.log('Lee los archivos de ' + baseDelVisor(config));
  console.log('Se pega una sola vez, en un bloque de código de la página ' + config.visor + ',');
  console.log('con "Mostrar código fuente" apagado. La guía completa está en docs/PUBLICACION_WEB.md.');
}

if (require.main === module) principal();

module.exports = { CORTE, codigoDelVisor, baseDelVisor, bloqueParaSquarespace };
