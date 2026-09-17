'use strict';

/**
 * Cada archivo de src/client/js/ es su propio ámbito.
 *
 * El build envuelve cada archivo en una función anónima, para que dos
 * `var estado` no se pisen. La consecuencia es que una función declarada en un
 * archivo no existe en el siguiente, salvo que se exporte por `RM.algo`. Nada
 * avisa al escribir el código: el error solo sale en el navegador, al llegar a
 * esa pantalla ("avisoDePaisEnPruebas is not defined"), y pasó al poner el
 * aviso de país en pruebas en la pantalla final.
 */

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const CLIENTE = path.join(__dirname, '..', 'src', 'client', 'js');

function sinCadenasNiComentarios(texto) {
  return texto
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/'(?:[^'\\\n]|\\.)*'/g, "''")
    .replace(/"(?:[^"\\\n]|\\.)*"/g, '""')
    .replace(/\/\/[^\n]*/g, '');
}

/** Las funciones y variables que el archivo declara por su cuenta. */
function declaradasEn(texto) {
  const nombres = new Set();
  let encontrado;
  const funciones = /\bfunction\s+(\w+)\s*\(/g;
  while ((encontrado = funciones.exec(texto)) !== null) nombres.add(encontrado[1]);
  const variables = /\bvar\s+(\w+)/g;
  while ((encontrado = variables.exec(texto)) !== null) nombres.add(encontrado[1]);
  return nombres;
}

function funcionesDeNivelSuperior(texto) {
  const nombres = new Set();
  const patron = /^function\s+(\w+)\s*\(/gm;
  let encontrado;
  while ((encontrado = patron.exec(texto)) !== null) nombres.add(encontrado[1]);
  return nombres;
}

test('ningún archivo del cliente llama a una función que vive en otro archivo sin pasar por RM', () => {
  const archivos = fs.readdirSync(CLIENTE).filter((a) => a.endsWith('.js')).sort();
  const porArchivo = {};
  for (const archivo of archivos) {
    const limpio = sinCadenasNiComentarios(fs.readFileSync(path.join(CLIENTE, archivo), 'utf8'));
    porArchivo[archivo] = {
      limpio: limpio,
      exporta: funcionesDeNivelSuperior(limpio),
      declara: declaradasEn(limpio),
    };
  }
  assert.ok(archivos.length >= 10, 'encontré muy pocos archivos del cliente');

  const problemas = [];
  for (const archivo of archivos) {
    const propio = porArchivo[archivo];
    for (const otro of archivos) {
      if (otro === archivo) continue;
      for (const nombre of porArchivo[otro].exporta) {
        if (propio.declara.has(nombre)) continue;
        // Una llamada directa: el nombre y un paréntesis, sin un punto antes
        // (RM.pasos.nombre( es lo correcto y no cuenta).
        const llamada = new RegExp('(^|[^\\w.$])' + nombre + '\\s*\\(', 'm');
        if (llamada.test(propio.limpio)) {
          problemas.push(archivo + ' llama a ' + nombre + '(), que vive en ' + otro + ' y ahí no existe');
        }
      }
    }
  }
  assert.deepStrictEqual(problemas, [], problemas.join('\n'));
});
