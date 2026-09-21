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
 * LAS FUENTES Y LAS IMAGENES
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

/**
 * Tipos de archivo que se saben incrustar, por extension.
 *
 * Las letras estaban desde el cambio de identidad. El png entro con el lockup:
 * el logotipo de Rappi es un logotipo de escritura y no se puede componer con
 * letra, asi que es la unica pieza del lockup que obliga a una imagen. Y una
 * imagen en Apps Script tiene el mismo problema que una letra: la ruta del
 * repositorio no existe del lado del usuario.
 */
const TIPOS_QUE_SE_INCRUSTAN = {
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
};

/**
 * Reemplaza cada url() relativa a un archivo conocido por su base64.
 *
 * `desde` es la carpeta a la que son relativas esas rutas, o sea la del
 * archivo que las escribio.
 */
function incrustarArchivos(css, desde) {
  return css.replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g, (entero, comilla, ruta) => {
    const extension = path.extname(ruta).toLowerCase();
    const tipo = TIPOS_QUE_SE_INCRUSTAN[extension];
    if (!tipo) return entero;

    const absoluta = path.resolve(desde, ruta);
    if (!fs.existsSync(absoluta)) {
      throw new Error(
        'La hoja de estilos pide "' + ruta + '" y no esta en ' + absoluta + '. ' +
        'Apps Script no sirve archivos del repositorio, asi que ese archivo tiene que ' +
        'existir para poder incrustarlo en base64. Si ya no se usa, quita la regla que ' +
        'lo pide.'
      );
    }
    return 'url(data:' + tipo + ';base64,' + fs.readFileSync(absoluta).toString('base64') + ')';
  });
}

/**
 * Quita los comentarios de CSS.
 *
 * Los comentarios de esta hoja son largos a proposito: cuentan que se rompio de
 * verdad en cada sitio. Pero Apps Script arma el HTML con doGet en cada
 * peticion y no lo cachea, asi que cada byte de comentario se descarga en cada
 * carga de la aplicacion, y son 24 KB. En la calle, con mala senal, eso son
 * segundos de "Cargando RappiMind".
 *
 * Se quitan SOLO en dist/. Las pruebas y docs/FRONT_ACTUAL.html siguen leyendo
 * la hoja entera, con sus comentarios, que es donde hacen falta.
 */
function quitarComentarios(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/[ \t]+$/gm, '')
    .replace(/\n{3,}/g, '\n\n');
}

/**
 * Devuelve la hoja entera, ya concatenada.
 *
 * Con `incrustarFuentes` en true, las url() de letras se sustituyen por el
 * base64 del archivo. Hace falta en los dos sitios que se MIRAN: dist/, porque
 * Apps Script no sirve archivos del repositorio, y docs/FRONT_ACTUAL.html,
 * porque su url() relativa resuelve fuera de docs/ y la letra de marca no
 * cargaba en ninguna de las 48 pantallas. Las pruebas no lo necesitan: ahi solo
 * interesa el texto de las reglas.
 *
 * Con `sinComentarios` en true se quitan los comentarios. Solo lo usa dist/.
 */
function hojaCompleta(opciones) {
  const incrustarFuentes = Boolean(opciones && opciones.incrustarFuentes);
  const sinComentarios = Boolean(opciones && opciones.sinComentarios);
  const partes = [];

  for (const relativa of ORDEN) {
    const ruta = rutaDesdeRaiz('src', 'client', relativa);
    let css = leerTexto(ruta);
    // Los comentarios se quitan ANTES de incrustar: el base64 de una letra no
    // puede contener "*/", porque el asterisco no esta en su alfabeto, pero el
    // orden correcto es quitar texto y despues meter datos, no al reves.
    if (sinComentarios) css = quitarComentarios(css);
    if (incrustarFuentes) css = incrustarArchivos(css, path.dirname(ruta));
    partes.push('/* ' + path.posix.join('src/client', relativa) + ' */\n' + css.trim());
  }

  return partes.join('\n\n') + '\n';
}

module.exports = { hojaCompleta, incrustarArchivos, quitarComentarios, ORDEN };
