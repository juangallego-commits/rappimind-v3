'use strict';

/**
 * docs/FRONT_ACTUAL.html: el front congelado, pantalla por pantalla.
 *
 * El archivo se sube como contexto a Claude chat, asi que tiene que cumplir
 * tres cosas: que se vea como la aplicacion (de eso se encarga la hoja de
 * estilos acotada), que no lleve JavaScript, y que el texto que se lee sea el
 * de la interfaz y no una descripcion.
 *
 * Generarlo necesita un navegador, que no es dependencia del proyecto, asi que
 * aqui se prueba lo que si se puede probar sin el: el acotado de la hoja de
 * estilos, la tabla de pantallas, y el archivo que quedo en el repositorio.
 */

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const { acotarEstilos } = require('../scripts/lib/estilos-acotados');
const { PARTES, fichasDePantalla, SALIDA } = require('../scripts/front');
const { escapar } = require('../scripts/lib/front-documento');

const RAIZ = path.join(__dirname, '..');
const ESTILOS = fs.readFileSync(path.join(RAIZ, 'src', 'client', 'estilos.css'), 'utf8');
const MARCO = '.rm-pantalla';

/*
 * docs/FRONT_ACTUAL.html ya no se versiona.
 *
 * Son 586 KB generados, y junto con el resto de lo generado hacian que el
 * repositorio no se pudiera leer de una sola vez. Lo escribe `npm run front`
 * cuando hace falta. Las pruebas que lo leen se saltan solas si no esta, y
 * dicen con que comando aparece, que es mejor que fallar como si el codigo
 * estuviera roto. Ver la decision 124.
 */
const SIN_ARCHIVO = fs.existsSync(SALIDA)
  ? false
  : 'no esta docs/FRONT_ACTUAL.html, que ya no se versiona: corre `npm run front`';

// --- El acotado de la hoja de estilos ---------------------------------------

test('body y html se vuelven el marco, y * cuenta tambien el marco', () => {
  const salida = acotarEstilos('html, body { height: 100%; }\n* { box-sizing: border-box; }', MARCO);
  assert.ok(salida.indexOf('.rm-pantalla { height: 100%; }') !== -1, salida);
  assert.ok(salida.indexOf('.rm-pantalla, .rm-pantalla * { box-sizing: border-box; }') !== -1, salida);
});

test('toda regla de la hoja real queda dentro del marco', () => {
  const salida = acotarEstilos(ESTILOS, MARCO);
  const sinComentarios = salida.replace(/\/\*[\s\S]*?\*\//g, '');
  const bloques = sinComentarios.split('}');
  const sueltas = [];
  for (const bloque of bloques) {
    const selector = bloque.split('{')[0].trim();
    if (!selector || bloque.indexOf('{') === -1) continue;
    if (selector === ':root' || selector.indexOf('@') === 0) continue;
    // Dentro de @media y @keyframes los porcentajes no son selectores.
    if (/^\d+%$/.test(selector) || selector === 'from' || selector === 'to') continue;
    if (selector.indexOf(MARCO) === -1) sueltas.push(selector);
  }
  assert.deepStrictEqual(sueltas, [], 'reglas que se escapan del marco: ' + sueltas.join(' / '));
});

test('lo clavado a la ventana se clava al marco', () => {
  const salida = acotarEstilos(ESTILOS, MARCO);
  assert.strictEqual((salida.match(/position:\s*fixed/g) || []).length, 0);
  assert.strictEqual((salida.match(/position:\s*sticky/g) || []).length, 0);
  // Las unidades de ventana pasan a variables del marco: si quedara un vh, la
  // hoja del documento mediria contra la ventana de quien lee el documento.
  assert.strictEqual((salida.match(/\d+v[hw]\b/g) || []).length, 0);
  assert.ok(salida.indexOf('var(--rm-alto-ventana)') !== -1);
});

test('las reglas de celular valen por clase, no por el ancho de la ventana', () => {
  const salida = acotarEstilos(ESTILOS, MARCO);
  assert.ok(salida.indexOf('.rm-pantalla.rm-celular .columna-documento') !== -1, 'no hay reglas de celular acotadas');
  assert.strictEqual((salida.match(/@media[^{]*width/g) || []).length, 0,
    'quedo una consulta de ancho: en una ventana angosta las pantallas de escritorio se verian como celular');
});

test('una consulta de ancho desconocida revienta el build en vez de colarse', () => {
  assert.throws(
    () => acotarEstilos('@media (min-width: 1600px) { .hoja { padding: 0; } }', MARCO),
    /SUFIJOS_POR_ANCHO/
  );
});

test('las animaciones se quedan como estan', () => {
  const salida = acotarEstilos('@keyframes destello { 0% { background: red; } 100% { background: blue; } }', MARCO);
  assert.ok(salida.indexOf('@keyframes destello') !== -1);
  assert.strictEqual(salida.indexOf('.rm-pantalla 0%'), -1, 'un porcentaje no es un selector');
});

// --- La tabla de pantallas ---------------------------------------------------

test('cada pantalla tiene ficha completa y ancla propia', () => {
  const fichas = fichasDePantalla();
  assert.ok(fichas.length >= 40, 'muy pocas pantallas: ' + fichas.length);

  const ids = fichas.map((f) => f.id);
  const anclas = fichas.map((f) => f.ancla);
  assert.strictEqual(new Set(ids).size, ids.length, 'hay identificadores repetidos');
  assert.strictEqual(new Set(anclas).size, anclas.length, 'hay anclas repetidas');

  for (const ficha of fichas) {
    assert.ok(ficha.queHace, ficha.id + ' no dice qué hace el comercial ahí');
    assert.ok(ficha.pantalla, ficha.id + ' no dice en qué pantalla vive');
    assert.ok(['escritorio', 'celular'].indexOf(ficha.ventana) !== -1, ficha.id + ' tiene una ventana rara');
    assert.ok(['es', 'pt'].indexOf(ficha.idioma) !== -1, ficha.id + ' tiene un idioma raro');
  }
  for (const parte of PARTES) {
    assert.ok(parte.entrada, 'la parte "' + parte.titulo + '" no tiene entrada');
  }
});

// --- El archivo que quedo en el repositorio ---------------------------------

test('el archivo no lleva JavaScript y trae todas las pantallas', { skip: SIN_ARCHIVO }, () => {
  const html = fs.readFileSync(SALIDA, 'utf8');
  const fichas = fichasDePantalla();

  assert.strictEqual((html.match(/<script/gi) || []).length, 0,
    'el archivo de contexto tiene que ser HTML inerte');
  assert.strictEqual((html.match(/ on[a-z]+="/g) || []).length, 0,
    'quedó un manejador de eventos en el HTML');

  for (const ficha of fichas) {
    assert.ok(html.indexOf('id="' + ficha.ancla + '"') !== -1, 'falta el ancla de ' + ficha.id);
    assert.ok(html.indexOf(escapar(ficha.titulo)) !== -1, 'falta el título de ' + ficha.id);
  }
  const marcos = (html.match(/class="rm-pantalla/g) || []).length;
  assert.strictEqual(marcos, fichas.length, 'hay ' + marcos + ' marcos para ' + fichas.length + ' pantallas');
  assert.strictEqual(html.indexOf('no se pudo alcanzar'), -1,
    'alguna pantalla no se alcanzó en el último recorrido: vuelve a correr `npm run front`');
});

test('el pie de página sale en las 48 pantallas, y en portugués donde toca', { skip: SIN_ARCHIVO }, () => {
  const html = fs.readFileSync(SALIDA, 'utf8');
  const fichas = fichasDePantalla();

  // Juan lo pidió así: "abajo de TODAS las pantallas". Y es fácil de perder sin
  // que nada falle, porque una pantalla nueva que se pinte por otro camino
  // simplemente sale sin pie, igual de bonita.
  const pies = (html.match(/class="pie"/g) || []).length;
  assert.strictEqual(pies, fichas.length,
    'hay ' + pies + ' pies para ' + fichas.length + ' pantallas: alguna se está pintando sin él');

  // Y las dos mitades del texto, cada una en su idioma. Las claves del
  // diccionario son el literal en español carácter por carácter, así que si
  // alguien retoca el texto de una y no la otra, el portugués cae al español
  // sin avisar y esta cuenta lo dice.
  const enEspanol = (html.match(/Hecho con amor/g) || []).length;
  const enPortugues = (html.match(/Feito com amor/g) || []).length;
  assert.strictEqual(enEspanol + enPortugues, fichas.length,
    'el texto del pie no cuadra: ' + enEspanol + ' en español y ' + enPortugues + ' en portugués para ' + fichas.length + ' pantallas');
  assert.ok(enPortugues > 0, 'ninguna pantalla trae el pie en portugués, y hay tres en portugués');
  assert.ok(html.indexOf('pelo time do Jurídico') !== -1,
    'falta la segunda mitad del pie en portugués: quedó la primera traducida y la otra no');
});

test('el aviso de la demostración no se cuela, y la hoja de estilos va completa', { skip: SIN_ARCHIVO }, () => {
  const html = fs.readFileSync(SALIDA, 'utf8');
  // La portada explica que el aviso se quitó, así que la frase existe ahí. Lo
  // que no puede pasar es que se cuele dentro de una pantalla.
  const desdeLaPrimeraPantalla = html.slice(html.indexOf('class="rm-pantalla'));
  assert.strictEqual(desdeLaPrimeraPantalla.indexOf('Modo demostración'), -1,
    'el aviso de la demostración se coló en una pantalla, y no existe en la herramienta real');

  // El anexo A es la fuente literal. Si esto falla, es que el front cambió y el
  // archivo se quedó viejo: hay que volver a correr `npm run front`.
  const trozo = ESTILOS.slice(0, 200).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  assert.ok(html.indexOf(trozo) !== -1, 'el anexo A no trae src/client/estilos.css literal');
});

test('el texto de la interfaz está literal, no descrito', { skip: SIN_ARCHIVO }, () => {
  const html = fs.readFileSync(SALIDA, 'utf8');
  // Una frase de cada sitio donde vive un texto: la portada, una pregunta, la
  // ayuda de una pregunta, un tipo de campaña y la pantalla de Legal.
  for (const frase of [
    'Genera los Términos y Condiciones de tu campaña',
    '¿Esta campaña la puedo hacer aquí?',
    '¿Qué porcentaje del pedido se devuelve en Créditos?',
    'Cashback Multitienda',
    'No es un problema ni una negativa',
    'Ya es el criterio del ganador',
  ]) {
    assert.ok(html.indexOf(frase) !== -1, 'falta el texto literal de la interfaz: ' + frase);
  }
});
