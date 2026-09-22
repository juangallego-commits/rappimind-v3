'use strict';

/**
 * docs/revision/: el paquete con el que se revisa el front en Claude chat.
 *
 * Lo que se prueba aqui es que el paquete este completo y cuadrado, porque lo
 * que se rompe en un paquete de revision se rompe callado: una pantalla que no
 * quedo en ninguna tanda no se revisa nunca y nadie se entera, y un campo mal
 * mapeado hace que debajo de una pregunta salgan los errores de otra.
 *
 * Armarlo necesita un navegador, que no es dependencia del proyecto. Aqui se
 * prueba lo que si se puede probar sin el: la tabla de tandas, el mapeo de
 * campos y los archivos que quedaron en el repositorio.
 */

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const { TANDAS, FUERA_DE_REVISION, CAMPOS_DE_LA_PANTALLA, CARPETA } = require('../scripts/revision');
const { fichasDePantalla } = require('../scripts/front');
const { PREGUNTAS } = require('../src/core/preguntas.js');
const { ESQUEMAS } = require('../src/core/esquemas.js');

const PANTALLAS = path.join(CARPETA, 'pantallas.json');

/*
 * docs/revision/ ya no se versiona.
 *
 * Son 322 KB que salen de `npm run front` y `npm run revision`, y que se
 * rearman cuando se va a hacer una tanda. Las pruebas que leen el paquete se
 * saltan solas si no esta. Lo que sigue corriendo siempre es la tabla de
 * tandas, que es la parte que de verdad se puede romper al mover una pantalla.
 * Ver la decision 124.
 */
const SIN_PAQUETE = fs.existsSync(PANTALLAS)
  ? false
  : 'no esta docs/revision/, que ya no se versiona: corre `npm run front` y luego `npm run revision`';

// --- La tabla de tandas ------------------------------------------------------

test('cada tanda dice de qué va y qué hay que mirar', () => {
  assert.ok(TANDAS.length >= 5, 'muy pocas tandas: ' + TANDAS.length);
  const ids = TANDAS.map((tanda) => tanda.id);
  assert.strictEqual(new Set(ids).size, ids.length, 'hay tandas con el mismo id');

  for (const tanda of TANDAS) {
    assert.ok(tanda.titulo, tanda.id + ' no tiene título');
    assert.ok(tanda.deQueVa, tanda.id + ' no dice de qué va');
    assert.ok(tanda.mirar && tanda.mirar.length >= 3,
      tanda.id + ' no dice qué hay que mirar: sin eso la revisión vuelve en prosa');
    assert.ok((tanda.pantallas || []).length || (tanda.preguntasDe || []).length,
      tanda.id + ' no lleva ni pantallas ni preguntas');
  }
});

test('las tandas piden pantallas que existen, y ninguna va dos veces', () => {
  const fichas = fichasDePantalla();
  const existentes = new Set(fichas.map((ficha) => ficha.id));
  const vistas = new Set();

  for (const tanda of TANDAS) {
    for (const id of tanda.pantallas || []) {
      assert.ok(existentes.has(id), 'la tanda "' + tanda.id + '" pide la pantalla "' + id + '", que no existe');
      assert.ok(!vistas.has(id), 'la pantalla "' + id + '" está en dos tandas');
      vistas.add(id);
    }
  }
});

test('ninguna pantalla se queda fuera sin que alguien lo haya decidido', () => {
  const vistas = new Set();
  for (const tanda of TANDAS) for (const id of tanda.pantallas || []) vistas.add(id);

  const sueltas = fichasDePantalla()
    .filter((ficha) => !vistas.has(ficha.id) && !FUERA_DE_REVISION[ficha.id])
    .map((ficha) => ficha.id);
  assert.deepStrictEqual(sueltas, [],
    'estas pantallas no se revisarían nunca y nadie se enteraría. Ponlas en una tanda, ' +
    'o en FUERA_DE_REVISION con el motivo: ' + sueltas.join(', '));
});

test('lo que se deja fuera existe y dice por qué', () => {
  const existentes = new Set(fichasDePantalla().map((ficha) => ficha.id));
  const enTandas = new Set();
  for (const tanda of TANDAS) for (const id of tanda.pantallas || []) enTandas.add(id);

  for (const id of Object.keys(FUERA_DE_REVISION)) {
    assert.ok(existentes.has(id),
      'FUERA_DE_REVISION habla de la pantalla "' + id + '", que ya no existe');
    assert.ok(!enTandas.has(id),
      'la pantalla "' + id + '" está a la vez fuera de revisión y dentro de una tanda');
    // Un motivo de tres palabras no es un motivo: dentro de seis meses nadie va
    // a saber si fue una decision o un descuido.
    assert.ok(FUERA_DE_REVISION[id].length > 30,
      'la pantalla "' + id + '" queda fuera sin un motivo que se entienda');
  }
});

test('los siete tipos de campaña quedan cubiertos', () => {
  // Cashback va por su recorrido de pantallas; los demas, por sus preguntas
  // propias. Un tipo que no esta en ninguna tanda es un tipo que nadie revisa.
  const cubiertos = new Set(['cashback']);
  for (const tanda of TANDAS) for (const tipo of tanda.preguntasDe || []) cubiertos.add(tipo);

  const fuera = Object.keys(ESQUEMAS).filter((tipo) => !cubiertos.has(tipo));
  assert.deepStrictEqual(fuera, [], 'tipos de campaña sin revisar: ' + fuera.join(', '));
});

// --- El mapeo de campos ------------------------------------------------------

test('cada pantalla apunta a campos que existen', () => {
  const existentes = new Set(fichasDePantalla().map((ficha) => ficha.id));
  for (const pantallaId of Object.keys(CAMPOS_DE_LA_PANTALLA)) {
    assert.ok(existentes.has(pantallaId),
      'CAMPOS_DE_LA_PANTALLA habla de la pantalla "' + pantallaId + '", que ya no existe');
    for (const campoId of CAMPOS_DE_LA_PANTALLA[pantallaId]) {
      assert.ok(PREGUNTAS[campoId],
        'la pantalla "' + pantallaId + '" apunta al campo "' + campoId + '", que no está en PREGUNTAS');
    }
  }
});

// --- Lo que quedo en el repositorio -----------------------------------------

test('el recorrido no guarda capturas', () => {
  // Las fotos las toma Juan de la aplicacion cuando va a hacer la tanda, no
  // las genera el recorrido: asi son de la version que corre ese dia. Si vuelve
  // a aparecer la carpeta, es que alguien revivio el codigo que las tomaba.
  assert.ok(!fs.existsSync(path.join(CARPETA, 'capturas')),
    'volvió docs/revision/capturas: las fotos las toma Juan, no el recorrido');
});

test('el paquete generado queda completo', { skip: SIN_PAQUETE }, () => {
  for (const archivo of ['pantallas.json', 'PROMPT.md', 'LEEME.md']) {
    assert.ok(fs.existsSync(path.join(CARPETA, archivo)),
      'falta docs/revision/' + archivo + ': corre `npm run front` y luego `npm run revision`');
  }
  for (let numero = 1; numero <= TANDAS.length; numero += 1) {
    const nombre = 'tanda-' + numero + '-' + TANDAS[numero - 1].id + '.md';
    assert.ok(fs.existsSync(path.join(CARPETA, nombre)), 'falta docs/revision/' + nombre);
  }
});

test('el texto de las pantallas es el de la aplicación, no una descripción', { skip: SIN_PAQUETE }, () => {
  const datos = JSON.parse(fs.readFileSync(PANTALLAS, 'utf8'));
  assert.ok(datos.pantallas.length >= 40, 'muy pocas pantallas: ' + datos.pantallas.length);

  for (const pantalla of datos.pantallas) {
    assert.ok(pantalla.texto && pantalla.texto.trim().length > 20,
      pantalla.id + ' se quedó sin texto');
    assert.ok(pantalla.queHace, pantalla.id + ' no dice qué hace el comercial ahí');
  }

  // Una frase de cada sitio donde vive un texto, buscada en el conjunto: si
  // alguna falta, el recorrido se quedo viejo.
  const todo = datos.pantallas.map((pantalla) => pantalla.texto).join('\n');
  for (const frase of [
    'Genera los Términos y Condiciones de tu campaña',
    '¿Esta campaña la puedo hacer aquí?',
    '¿Qué porcentaje del pedido se devuelve en Créditos?',
    'Cashback Multitienda',
  ]) {
    assert.ok(todo.indexOf(frase) !== -1, 'falta el texto literal de la interfaz: ' + frase);
  }
});

test('las tandas no arrastran el documento legal entero', { skip: SIN_PAQUETE }, () => {
  // El texto legal no entra en esta revision, y son veinticinco mil caracteres
  // que en una tanda se llevarian el aire de doce pantallas.
  for (let numero = 1; numero <= TANDAS.length; numero += 1) {
    const nombre = 'tanda-' + numero + '-' + TANDAS[numero - 1].id + '.md';
    const texto = fs.readFileSync(path.join(CARPETA, nombre), 'utf8');
    const clausulas = (texto.match(/^\d+\. [A-ZÁÉÍÓÚÑ][a-záéíóúñ]+ (y|de|del) /gm) || []).length;
    assert.ok(clausulas <= 2, nombre + ' trae ' + clausulas + ' cláusulas del documento legal');
    assert.ok(texto.length < 60 * 1024,
      nombre + ' pesa ' + Math.round(texto.length / 1024) + ' KB: una tanda tan grande se revisa por encima');
  }
});

test('el prompt trae las reglas que no se pueden romper', { skip: SIN_PAQUETE }, () => {
  const prompt = fs.readFileSync(path.join(CARPETA, 'PROMPT.md'), 'utf8');
  for (const regla of [
    'Rappi nunca es el organizador',
    'El texto legal no se revisa aquí',
    'Sin guiones como signo de puntuación',
    'Sin campos de texto libre nuevos',
  ]) {
    assert.ok(prompt.indexOf(regla) !== -1, 'el prompt no dice: ' + regla);
  }
  // El formato de respuesta es lo que hace que la revision se pueda aplicar
  // buscando y reemplazando, en vez de volver a escribirla a mano.
  for (const pieza of ['**Dónde:**', '**Gravedad:**', '**Dice hoy:**', '**Debería decir:**']) {
    assert.ok(prompt.indexOf(pieza) !== -1, 'el formato de respuesta no pide: ' + pieza);
  }
});
