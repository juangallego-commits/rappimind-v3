'use strict';

/**
 * Claves duplicadas dentro de un mismo objeto.
 *
 * En JavaScript, escribir dos veces la misma clave no es un error: la última
 * gana y la primera desaparece sin decir nada. Ha pasado tres veces en este
 * proyecto y las tres se vieron tarde:
 *
 *   1. `formaBeneficio` se definió para Brasil sobre la que ya existía para
 *      Travel, así que la de Brasil nunca existió.
 *   2. `porcentaje`, `tope` y `compraMinima` quedaron con dos bloques
 *      `variantes`, y el segundo borró las variantes de Brasil y del ETA. El
 *      resultado: en una campaña brasileña, que no da Créditos, la pantalla
 *      seguía preguntando cuántos Créditos devuelves.
 *
 * Esta prueba lee los archivos como texto, no como módulos, porque para cuando
 * Node los carga la clave duplicada ya se perdió.
 */

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const CARPETA = path.join(__dirname, '..', 'src', 'core');
const CLIENTE = path.join(__dirname, '..', 'src', 'client', 'js');

/** Las claves de primer nivel de cada objeto literal, con su línea. */
function clavesRepetidas(texto, sangria) {
  const patron = new RegExp('^ {' + sangria + '}(\\w+):', 'gm');
  const vistas = {};
  const repetidas = [];
  let encontrado;
  while ((encontrado = patron.exec(texto)) !== null) {
    const clave = encontrado[1];
    const linea = texto.slice(0, encontrado.index).split('\n').length;
    if (vistas[clave]) repetidas.push(clave + ' (líneas ' + vistas[clave] + ' y ' + linea + ')');
    else vistas[clave] = linea;
  }
  return repetidas;
}

test('ninguna pregunta está definida dos veces', () => {
  const texto = fs.readFileSync(path.join(CARPETA, 'preguntas.js'), 'utf8');
  const desde = texto.indexOf('var PREGUNTAS = {');
  assert.ok(desde !== -1, 'no encontré PREGUNTAS');

  // Las preguntas son las claves con dos espacios de sangría seguidas de p({.
  const soloPreguntas = texto.slice(desde).match(/^ {2}\w+: p\(\{/gm) || [];
  const nombres = soloPreguntas.map((l) => l.trim().split(':')[0]);
  const vistas = {};
  const repetidas = [];
  for (const nombre of nombres) {
    if (vistas[nombre]) repetidas.push(nombre);
    vistas[nombre] = true;
  }
  assert.deepStrictEqual(repetidas, [], 'preguntas definidas dos veces: ' + repetidas.join(', '));
});

test('ninguna pregunta tiene dos bloques de variantes', () => {
  const texto = fs.readFileSync(path.join(CARPETA, 'preguntas.js'), 'utf8');
  const problemas = [];

  // Cada pregunta va desde "  nombre: p({" hasta el siguiente "  }),".
  const patron = /^ {2}(\w+): p\(\{$/gm;
  let encontrado;
  while ((encontrado = patron.exec(texto)) !== null) {
    const desde = encontrado.index;
    const hasta = texto.indexOf('\n  }),', desde);
    const cuerpo = texto.slice(desde, hasta === -1 ? texto.length : hasta);
    const cuantos = (cuerpo.match(/^ {4}variantes: \{$/gm) || []).length;
    if (cuantos > 1) problemas.push(encontrado[1] + ' tiene ' + cuantos + ' bloques de variantes');
  }
  assert.deepStrictEqual(problemas, [], problemas.join(' | '));
});

test('ningún esquema está definido dos veces', () => {
  const texto = fs.readFileSync(path.join(CARPETA, 'esquemas.js'), 'utf8');
  const desde = texto.indexOf('var ESQUEMAS = {');
  const hasta = texto.indexOf('\n};', desde);
  const repetidas = clavesRepetidas(texto.slice(desde, hasta), 2);
  assert.deepStrictEqual(repetidas, [], 'tipos definidos dos veces: ' + repetidas.join(', '));
});

test('cada variante apunta a un tipo que existe', () => {
  const { PREGUNTAS } = require('../src/core/preguntas.js');
  const { ESQUEMAS } = require('../src/core/esquemas.js');

  for (const id of Object.keys(PREGUNTAS)) {
    const variantes = PREGUNTAS[id].variantes;
    if (!variantes) continue;
    for (const tipo of Object.keys(variantes)) {
      assert.ok(ESQUEMAS[tipo], id + ' tiene una variante para "' + tipo + '", que no es un tipo de campaña');
    }
  }
});

/** Las claves entre comillas simples de un diccionario, con su línea. */
function clavesEntreComillasRepetidas(texto) {
  const patron = /^ {2}'((?:[^'\\]|\\.)*)':/gm;
  const vistas = {};
  const repetidas = [];
  let encontrado;
  while ((encontrado = patron.exec(texto)) !== null) {
    const clave = encontrado[1];
    const linea = texto.slice(0, encontrado.index).split('\n').length;
    if (vistas[clave]) repetidas.push('"' + clave + '" (líneas ' + vistas[clave] + ' y ' + linea + ')');
    else vistas[clave] = linea;
  }
  return repetidas;
}

test('el diccionario en portugués no repite ninguna clave', () => {
  const texto = fs.readFileSync(path.join(CARPETA, 'textos_interfaz.js'), 'utf8');
  const desde = texto.indexOf('var TEXTOS_PT = {');
  const hasta = texto.indexOf('\n};', desde);
  assert.ok(desde !== -1 && hasta !== -1, 'no encontré TEXTOS_PT');
  const repetidas = clavesEntreComillasRepetidas(texto.slice(desde, hasta));
  assert.deepStrictEqual(repetidas, [], 'claves repetidas en TEXTOS_PT: ' + repetidas.join(', '));
});

test('ninguna pregunta en portugués está definida dos veces', () => {
  const texto = fs.readFileSync(path.join(CARPETA, 'preguntas_pt.js'), 'utf8');
  const desde = texto.indexOf('var PREGUNTAS_PT = {');
  const hasta = texto.indexOf('\n};', desde);
  assert.ok(desde !== -1 && hasta !== -1, 'no encontré PREGUNTAS_PT');
  const repetidas = clavesRepetidas(texto.slice(desde, hasta), 2);
  assert.deepStrictEqual(repetidas, [], 'preguntas repetidas en PREGUNTAS_PT: ' + repetidas.join(', '));
});

/**
 * Quita comentarios y el contenido de las cadenas, dejando las llaves y los
 * `var` en su sitio, para poder contar ámbitos sin un analizador de verdad.
 */
function sinCadenasNiComentarios(texto) {
  return texto
    .replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, ' '))
    .replace(/\/\/[^\n]*/g, '')
    .replace(/'(?:[^'\\\n]|\\.)*'/g, "''")
    .replace(/"(?:[^"\\\n]|\\.)*"/g, '""');
}

/**
 * Un `var` declarado dos veces dentro de la misma función.
 *
 * En JavaScript `var` es de toda la función, no del bloque: el segundo `var`
 * no crea otra variable, reasigna la primera. En pantallaResumen había un
 * `var faltantes` con lo que le faltaba al comercial y, dentro de un `if`, otro
 * `var faltantes` con los datos por confirmar del país. En un país en pruebas
 * la lista "Te falta:" mostraba los datos del país en vez de la casilla que
 * faltaba marcar. Ninguna prueba lo vio, porque cada mitad era correcta.
 *
 * Se cuentan los ámbitos de función a mano: cada `function` abre uno con su
 * primera llave, y los `var` se anotan en el ámbito de función más cercano.
 */
function varsRepetidosPorFuncion(texto) {
  const limpio = sinCadenasNiComentarios(texto);
  const problemas = [];
  const pila = [{ esFuncion: true, vars: {}, nombre: '(archivo)' }];
  let funcionPendiente = null;

  const patron = /\bfunction\b\s*([A-Za-z_$][\w$]*)?|\bvar\s+([A-Za-z_$][\w$]*)|[{}]/g;
  let encontrado;
  while ((encontrado = patron.exec(limpio)) !== null) {
    const trozo = encontrado[0];
    if (trozo === '{') {
      pila.push({ esFuncion: funcionPendiente !== null, vars: {}, nombre: funcionPendiente || '' });
      funcionPendiente = null;
    } else if (trozo === '}') {
      if (pila.length > 1) pila.pop();
    } else if (trozo.indexOf('function') === 0) {
      funcionPendiente = encontrado[1] || '(anónima)';
    } else {
      const nombre = encontrado[2];
      let ambito = pila[pila.length - 1];
      for (let i = pila.length - 1; i >= 0; i--) {
        if (pila[i].esFuncion) { ambito = pila[i]; break; }
      }
      const linea = limpio.slice(0, encontrado.index).split('\n').length;
      if (ambito.vars[nombre]) problemas.push('var ' + nombre + ' en ' + ambito.nombre + ' (líneas ' + ambito.vars[nombre] + ' y ' + linea + ')');
      else ambito.vars[nombre] = linea;
    }
  }
  return problemas;
}

test('el detector de var repetido caza el caso del resumen', () => {
  const caso = [
    'function pantalla() {',
    '  var faltantes = loQueFalta();',
    "  if (enPruebas) { var faltantes = datosPorConfirmar(); var lista = crear('ul'); }",
    "  (function () { var lista = crear('dl'); })();",
    '}',
  ].join('\n');
  const problemas = varsRepetidosPorFuncion(caso);
  assert.strictEqual(problemas.length, 1, problemas.join(' | '));
  assert.ok(problemas[0].indexOf('var faltantes') === 0, problemas[0]);
});

test('ninguna función declara dos veces el mismo var', () => {
  const carpetas = [CLIENTE, CARPETA, path.join(__dirname, '..', 'src', 'server')];
  const problemas = [];
  for (const carpeta of carpetas) {
    for (const archivo of fs.readdirSync(carpeta)) {
      if (!archivo.endsWith('.js')) continue;
      const texto = fs.readFileSync(path.join(carpeta, archivo), 'utf8');
      for (const problema of varsRepetidosPorFuncion(texto)) problemas.push(archivo + ': ' + problema);
    }
  }
  assert.deepStrictEqual(problemas, [], problemas.join('\n'));
});
