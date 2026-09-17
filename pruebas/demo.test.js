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
