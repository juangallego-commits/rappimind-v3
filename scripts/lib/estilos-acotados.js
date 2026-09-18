'use strict';

/**
 * Acota la hoja de estilos de la app a un marco.
 *
 * docs/FRONT_ACTUAL.html pega treinta y tantas pantallas de verdad en un mismo
 * documento. Si se pegara `src/client/estilos.css` tal cual, las reglas que
 * hablan de `body`, de `*` o de `h1` pintarian tambien el documento que las
 * rodea, y las que estan dentro de `@media (max-width: 900px)` volverian
 * celulares a todas las pantallas cuando la ventana se angosta.
 *
 * Aqui se reescribe la hoja para que:
 *   - cada regla solo valga dentro del marco (`.rm-pantalla`),
 *   - las reglas de celular valgan solo en los marcos de celular
 *     (`.rm-pantalla.rm-celular`), sin depender del ancho de la ventana,
 *   - lo que estaba clavado a la ventana (`position: fixed`, `100vh`) quede
 *     clavado al marco, que es la ventana de esa pantalla.
 *
 * Lo que no se entiende no se adivina: una consulta de ancho que no este en
 * SUFIJOS_POR_ANCHO revienta el build. Una hoja de estilos nueva tiene que
 * pasar por aqui a proposito, no colarse.
 */

/** Consultas de ancho conocidas y a que clase de marco corresponden. */
const SUFIJOS_POR_ANCHO = {
  '(max-width:900px)': '.rm-celular',
};

/** Reparte una lista de selectores en las comas de primer nivel. */
function partirSelectores(lista) {
  const partes = [];
  let actual = '';
  let parentesis = 0;
  let corchetes = 0;
  let comilla = '';

  for (let i = 0; i < lista.length; i++) {
    const c = lista[i];
    if (comilla) {
      actual += c;
      if (c === comilla && lista[i - 1] !== '\\') comilla = '';
      continue;
    }
    if (c === '"' || c === "'") { comilla = c; actual += c; continue; }
    if (c === '(') parentesis++;
    if (c === ')') parentesis--;
    if (c === '[') corchetes++;
    if (c === ']') corchetes--;
    if (c === ',' && parentesis === 0 && corchetes === 0) { partes.push(actual); actual = ''; continue; }
    actual += c;
  }
  if (actual.trim()) partes.push(actual);
  return partes;
}

/**
 * Acota un selector suelto al marco.
 *
 * `html` y `body` son el marco (no hay otro elemento que haga ese papel).
 * `:root` se queda como esta: ahi viven las variables de color y de espaciado,
 * y el documento que rodea las pantallas usa las mismas.
 */
function acotarSelector(selector, marco) {
  const limpio = selector.trim();
  if (limpio === ':root') return ':root';
  if (limpio === 'html' || limpio === 'body') return marco;
  if (limpio === '*') return marco + ', ' + marco + ' *';
  if (limpio.indexOf('*') === 0) return marco + ' ' + limpio;
  return marco + ' ' + limpio;
}

function acotarListaDeSelectores(lista, marco) {
  const comentarios = (lista.match(/\/\*[\s\S]*?\*\//g) || []).join(' ');
  const acotados = [];
  for (const selector of partirSelectores(lista.replace(/\/\*[\s\S]*?\*\//g, ''))) {
    if (!selector.trim()) continue;
    const acotado = acotarSelector(selector, marco);
    // `html, body` son los dos el marco: sin esto la lista sale repetida.
    if (acotados.indexOf(acotado) === -1) acotados.push(acotado);
  }
  return (comentarios ? comentarios + ' ' : '') + acotados.join(', ');
}

/**
 * Lo que estaba clavado a la ventana del navegador se clava al marco.
 *
 * - `fixed` pasa a `absolute`: el selector de idioma, la hoja deslizable y la
 *   cortina tienen que quedarse dentro de su pantalla, no flotar sobre el
 *   documento entero.
 * - `sticky` pasa a `static`: la barra superior y la columna del documento se
 *   pegan cuando se hace scroll, y aqui no hay scroll dentro de la pantalla.
 *   Congeladas arriba es justo donde se ven al abrir la pantalla.
 * - `vh` y `vw` pasan a variables del marco, que son el alto y el ancho de la
 *   ventana de esa pantalla (1440 x 1000 en escritorio, 390 x 844 en celular).
 */
function ajustarDeclaraciones(cuerpo) {
  return cuerpo
    .replace(/position\s*:\s*fixed/g, 'position: absolute')
    .replace(/position\s*:\s*sticky/g, 'position: static')
    .replace(/(\d+(?:\.\d+)?)vh\b/g, (todo, numero) => 'calc(var(--rm-alto-ventana) * ' + Number(numero) / 100 + ')')
    .replace(/(\d+(?:\.\d+)?)vw\b/g, (todo, numero) => 'calc(var(--rm-ancho-ventana) * ' + Number(numero) / 100 + ')');
}

/** Lee un bloque { ... } que empieza en la llave de `desde`. Devuelve el cuerpo y donde termina. */
function leerBloque(css, desde) {
  let profundidad = 0;
  let comilla = '';
  for (let i = desde; i < css.length; i++) {
    const c = css[i];
    if (comilla) {
      if (c === comilla && css[i - 1] !== '\\') comilla = '';
      continue;
    }
    if (c === '"' || c === "'") { comilla = c; continue; }
    if (css.startsWith('/*', i)) { const fin = css.indexOf('*/', i + 2); i = fin === -1 ? css.length : fin + 1; continue; }
    if (c === '{') profundidad++;
    else if (c === '}') {
      profundidad--;
      if (profundidad === 0) return { cuerpo: css.slice(desde + 1, i), fin: i + 1 };
    }
  }
  throw new Error('La hoja de estilos tiene una llave sin cerrar.');
}

/**
 * Acota una hoja de estilos entera.
 *
 * marco: el selector del marco, `.rm-pantalla`.
 * Devuelve el CSS acotado. Revienta si aparece una consulta de ancho
 * desconocida.
 */
function acotarEstilos(css, marco) {
  let salida = '';
  let i = 0;

  while (i < css.length) {
    if (css.startsWith('/*', i)) {
      const fin = css.indexOf('*/', i + 2);
      const corte = fin === -1 ? css.length : fin + 2;
      salida += css.slice(i, corte);
      i = corte;
      continue;
    }
    if (/\s/.test(css[i])) { salida += css[i]; i++; continue; }

    // El prefacio: el selector de una regla, o la cabeza de una arroba.
    let j = i;
    let prefacio = '';
    while (j < css.length && css[j] !== '{' && css[j] !== ';') {
      if (css.startsWith('/*', j)) {
        const fin = css.indexOf('*/', j + 2);
        const corte = fin === -1 ? css.length : fin + 2;
        prefacio += css.slice(j, corte);
        j = corte;
        continue;
      }
      prefacio += css[j];
      j++;
    }

    if (j >= css.length) { salida += prefacio; break; }
    if (css[j] === ';') { salida += prefacio + ';'; i = j + 1; continue; }

    const bloque = leerBloque(css, j);
    const cabeza = prefacio.replace(/\/\*[\s\S]*?\*\//g, '').trim();

    if (cabeza.indexOf('@') === 0) {
      const arroba = cabeza.split(/\s|\(/)[0].toLowerCase();

      // Las animaciones y las tipografias se quedan como estan: sus bloques no
      // llevan selectores, llevan porcentajes y descriptores.
      if (arroba === '@keyframes' || arroba === '@-webkit-keyframes' || arroba === '@font-face') {
        salida += prefacio + '{' + bloque.cuerpo + '}';
        i = bloque.fin;
        continue;
      }

      if (arroba === '@media') {
        const condicion = cabeza.slice('@media'.length).trim();
        const normalizada = condicion.replace(/\s+/g, '');
        if (/width/.test(normalizada)) {
          const sufijo = SUFIJOS_POR_ANCHO[normalizada];
          if (!sufijo) {
            throw new Error(
              'No se como acotar la consulta de ancho "' + condicion + '". ' +
              'Agregala a SUFIJOS_POR_ANCHO en scripts/lib/estilos-acotados.js, ' +
              'con la clase de marco que le toca, y captura una pantalla de ese tamano.'
            );
          }
          // El ancho de la ventana lo dice la clase del marco, no la ventana
          // del que lee el documento.
          salida += '/* ' + condicion + ', acotado a ' + sufijo + ' */\n';
          salida += acotarEstilos(bloque.cuerpo, marco + sufijo);
          i = bloque.fin;
          continue;
        }
        salida += prefacio + '{\n' + acotarEstilos(bloque.cuerpo, marco) + '\n}';
        i = bloque.fin;
        continue;
      }

      if (arroba === '@supports') {
        salida += prefacio + '{\n' + acotarEstilos(bloque.cuerpo, marco) + '\n}';
        i = bloque.fin;
        continue;
      }

      throw new Error(
        'No se como acotar "' + cabeza + '". Revisa scripts/lib/estilos-acotados.js.'
      );
    }

    salida += acotarListaDeSelectores(prefacio, marco) + ' {' + ajustarDeclaraciones(bloque.cuerpo) + '}';
    i = bloque.fin;
  }

  return salida;
}

module.exports = { acotarEstilos, acotarSelector, partirSelectores, SUFIJOS_POR_ANCHO };
