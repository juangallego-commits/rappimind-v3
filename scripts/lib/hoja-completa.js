'use strict';

/**
 * La hoja de estilos completa: los tokens mas src/client/estilos.css.
 *
 * POR QUE EXISTE ESTE ARCHIVO
 *
 * Los tokens de identidad viven repartidos en cinco archivos de
 * src/client/tokens/, y el ultimo pisa a los anteriores a proposito. La forma
 * natural de juntarlos en CSS es @import, y ahi esta la trampa: Apps Script
 * sirve la hoja embebida dentro de un solo <style> en el HTML, asi que un
 * @import apunta a una ruta que del lado del usuario no existe. No lanza
 * ningun error. El navegador se queda sin esos valores, cada var() cae a su
 * valor por defecto, y la aplicacion sale despintada sin que nada falle. Es
 * exactamente el modo de falla que describe la skill frontera-apps-script:
 * el dato no llega y el sintoma aparece lejos de la causa.
 *
 * Por eso no hay ningun @import: la concatenacion se hace aqui, y este es el
 * UNICO sitio donde el orden esta escrito. Lo usan los cuatro que sirven la
 * hoja, para que no puedan discrepar:
 *
 *   scripts/build.js        arma dist/Estilos.html, que es lo que ve Apps Script
 *   scripts/demo.js         lo hereda de dist/Estilos.html
 *   scripts/front.js        arma docs/FRONT_ACTUAL.html
 *   pruebas/estilos.test.js comprueba que toda variable usada este definida
 *
 * Que las pruebas lean por aqui no es comodidad: es la red. Si alguien agrega
 * un archivo de tokens y se olvida de ponerlo en ORDEN, la prueba
 * "toda variable de estilo que se usa esta definida" lo dice por su nombre,
 * en vez de que los valores se pierdan en silencio en produccion.
 *
 * LAS FUENTES
 *
 * Por lo mismo, un url() relativo a un woff2 del repositorio tampoco sobrevive
 * a Apps Script. Al construir dist/ se incrusta el archivo en base64 dentro de
 * la propia hoja. Si el woff2 no esta donde dice, esto se cae con un mensaje
 * claro; servir una url() que nadie puede resolver seria peor, porque la
 * tipografia de marca desapareceria sin aviso.
 */

const fs = require('fs');
const path = require('path');
const { rutaDesdeRaiz, leerTexto } = require('./archivos');

/**
 * El orden de concatenacion, y no es indiferente.
 *
 * Los cuatro primeros son los tokens de RappiAds, derivados del Rappi Brand
 * Book 2026. rappimind.css va el ULTIMO de los tokens porque es la capa de
 * aplicacion y tiene que poder pisar a los de marca. estilos.css va al final
 * de todo porque es quien los usa.
 */
const ORDEN = [
  'tokens/fonts.css',
  'tokens/colors.css',
  'tokens/typography.css',
  'tokens/spacing.css',
  'tokens/rappimind.css',
  'estilos.css',
];

/** Tipos de archivo de letra que se saben incrustar, por extension. */
const TIPOS_DE_LETRA = { '.woff2': 'font/woff2', '.woff': 'font/woff' };

/**
 * Reemplaza cada url() relativa a un archivo de letra por su base64.
 *
 * `desde` es la carpeta a la que son relativas esas rutas, o sea la del
 * archivo de tokens que las escribio.
 */
function incrustarLetras(css, desde) {
  return css.replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g, (entero, comilla, ruta) => {
    const extension = path.extname(ruta).toLowerCase();
    const tipo = TIPOS_DE_LETRA[extension];
    if (!tipo) return entero;

    const absoluta = path.resolve(desde, ruta);
    if (!fs.existsSync(absoluta)) {
      throw new Error(
        'La hoja de estilos pide la letra "' + ruta + '" y no esta en ' + absoluta + '. ' +
        'Apps Script no sirve archivos del repositorio, asi que ese archivo tiene que ' +
        'existir para poder incrustarlo en base64. Si la cara ya no se usa, quita su ' +
        '@font-face de src/client/tokens/fonts.css.'
      );
    }
    return 'url(data:' + tipo + ';base64,' + fs.readFileSync(absoluta).toString('base64') + ')';
  });
}

/**
 * Devuelve la hoja entera, ya concatenada.
 *
 * Con `incrustarFuentes` en true, las url() de letras se sustituyen por el
 * base64 del archivo. Eso es lo que hace falta para Apps Script; para las
 * pruebas y para docs/FRONT_ACTUAL.html no, porque ahi solo interesa el texto
 * de las reglas y el base64 pesaria treinta veces mas que el resto.
 */
function hojaCompleta(opciones) {
  const incrustarFuentes = Boolean(opciones && opciones.incrustarFuentes);
  const partes = [];

  for (const relativa of ORDEN) {
    const ruta = rutaDesdeRaiz('src', 'client', relativa);
    let css = leerTexto(ruta);
    if (incrustarFuentes) css = incrustarLetras(css, path.dirname(ruta));
    partes.push('/* ' + path.posix.join('src/client', relativa) + ' */\n' + css.trim());
  }

  return partes.join('\n\n') + '\n';
}

module.exports = { hojaCompleta, incrustarLetras, ORDEN };
