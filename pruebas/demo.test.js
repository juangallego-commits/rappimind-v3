'use strict';

/**
 * La demostración es lo que se usa para revisar y para sacar las capturas, así
 * que lo que muestra tiene que ser lo mismo que muestra producción.
 */

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

test('el servidor simulado arma el nombre de la campaña con el país, como Api.js', () => {
  // Sin el país, el título para Squarespace de una campaña de Brasil decía
  // "1 oct 2026" mientras el documento de al lado decía "1 OUT 2026".
  const demo = fs.readFileSync(path.join(__dirname, '..', 'scripts', 'demo.js'), 'utf8');
  const llamadas = demo.match(/nombreDeCampana\([^)]*\)/g) || [];
  assert.ok(llamadas.length > 0, 'la demo no arma el nombre de la campaña');
  for (const llamada of llamadas) {
    assert.ok(/,\s*pais\)$/.test(llamada), 'la demo arma el nombre sin el país: ' + llamada);
  }
});

test('todo lo que la interfaz le pide al servidor existe en el servidor simulado', () => {
  // La carga masiva de personas se agregó a Api.js y no a la demostración:
  // "Agregar a todos" reventaba con "Cannot read properties of undefined".
  const demo = fs.readFileSync(path.join(__dirname, '..', 'scripts', 'demo.js'), 'utf8');
  const simulado = demo.slice(demo.indexOf('SERVIDOR_SIMULADO'));
  const definidas = new Set((simulado.match(/^    (\w+): function/gm) || []).map((l) => l.trim().split(':')[0]));

  const carpeta = path.join(__dirname, '..', 'src', 'client', 'js');
  const pedidas = new Set();
  for (const archivo of fs.readdirSync(carpeta)) {
    const texto = fs.readFileSync(path.join(carpeta, archivo), 'utf8');
    const patron = /llamar\('(\w+)'/g;
    let encontrado;
    while ((encontrado = patron.exec(texto)) !== null) pedidas.add(encontrado[1]);
  }
  assert.ok(pedidas.size >= 10, 'encontré muy pocas llamadas: ' + Array.from(pedidas).join(', '));
  const faltan = Array.from(pedidas).filter((n) => !definidas.has(n));
  assert.deepStrictEqual(faltan, [], 'la demo no simula: ' + faltan.join(', '));
});

// --- la paridad con el servidor de verdad -----------------------------------

test('la demostración entrega la misma configuración que el servidor', () => {
  // scripts/demo.js tiene su propio estadoInicial, que imita el de
  // src/server/Api.js. Son dos sitios describiendo lo mismo, y se
  // desincronizan: el 21 de septiembre de 2026 se agregó categoriasTravel al
  // servidor y la demostración se quedó sin él, así que la pregunta de las
  // categorías de Travel seguía saliendo vacía justo donde Juan la probaba.
  const fuenteApi = fs.readFileSync(path.join(__dirname, '..', 'src', 'server', 'Api.js'), 'utf8');
  const fuenteDemo = fs.readFileSync(path.join(__dirname, '..', 'scripts', 'demo.js'), 'utf8');

  const llavesDe = (fuente, desde) => {
    const inicio = fuente.indexOf(desde);
    assert.ok(inicio !== -1, 'no encontré "' + desde + '"');
    const trozo = fuente.slice(inicio, inicio + 2000);
    const llaves = [];
    for (const linea of trozo.split('\n')) {
      const coincide = linea.match(/^\s{4,}([a-zA-Z][a-zA-Z0-9]*):\s/);
      if (coincide) llaves.push(coincide[1]);
      if (llaves.length && /^\s*\};?\s*$/.test(linea)) break;
    }
    return llaves.sort();
  };

  const delServidor = llavesDe(fuenteApi, 'function estadoInicial()');
  const deLaDemo = llavesDe(fuenteDemo, 'estadoInicial: function ()');

  const faltan = delServidor.filter((llave) => deLaDemo.indexOf(llave) === -1);
  assert.deepStrictEqual(faltan, [],
    'la demostración no entrega lo que el servidor sí, así que estas pantallas se ven bien en ' +
    'producción y rotas en la demostración (o al revés): ' + faltan.join(', '));

  const sobran = deLaDemo.filter((llave) => delServidor.indexOf(llave) === -1);
  assert.deepStrictEqual(sobran, [],
    'la demostración entrega algo que el servidor no: ' + sobran.join(', '));
});
