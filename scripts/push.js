'use strict';

/**
 * npm run push: build + clasp push.
 *
 * Se hace desde Node (no encadenando comandos del shell) para que funcione
 * igual en Windows y en Linux, y para poder avisar con un mensaje claro cuando
 * falta el scriptId o las credenciales de clasp.
 *
 * CLAUDE.md: antes de cada push hay que correr npm test y mostrarle el
 * resultado a Juan.
 */

const { spawnSync } = require('child_process');
const { rutaDesdeRaiz, leerJson, existe } = require('./lib/archivos');
const { construir } = require('./build');

function scriptIdConfigurado() {
  const ruta = rutaDesdeRaiz('.clasp.json');
  if (!existe(ruta)) return '';
  try {
    return String(leerJson(ruta).scriptId || '').trim();
  } catch (error) {
    return '';
  }
}

function main() {
  const scriptId = scriptIdConfigurado();
  if (!scriptId) {
    console.error('Falta el scriptId en .clasp.json.');
    console.error('Pega el ID del proyecto de Apps Script y vuelve a intentar.');
    process.exit(1);
  }

  construir();

  console.log('');
  console.log('Subiendo dist/ al proyecto de Apps Script...');

  // shell: true para que en Windows se resuelva clasp.cmd.
  const resultado = spawnSync('clasp', ['push', '--force'], { stdio: 'inherit', shell: true });

  if (resultado.error) {
    console.error('No se pudo ejecutar clasp: ' + resultado.error.message);
    console.error('Instalalo con: npm install -g @google/clasp');
    process.exit(1);
  }

  process.exit(resultado.status === null ? 1 : resultado.status);
}

main();
