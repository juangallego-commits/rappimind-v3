'use strict';

/**
 * npm run previsualizar: imprime el texto final de cada caso de
 * pruebas/casos_base.json.
 *
 * El motor de render llega en el Bloque 1. Mientras tanto este comando resume
 * los casos cargados, que es lo que permite verificar que los insumos se leen
 * bien en cualquier sistema operativo.
 */

const { rutaDesdeRaiz, leerJson, leerTexto, existe } = require('./lib/archivos');
const { cargarModelos } = require('./lib/modelos');

function main() {
  const { casos } = leerJson(rutaDesdeRaiz('pruebas', 'casos_base.json'));
  const { modelos, bloques } = cargarModelos();

  console.log('Modelos: ' + Object.keys(modelos).join(', '));
  console.log('Bloques: ' + Object.keys(bloques).length);
  console.log('Casos: ' + casos.length);
  console.log('');

  for (const caso of casos) {
    const esperada = rutaDesdeRaiz('pruebas', 'salidas_esperadas', caso.id + '.txt');
    const generaDocumento = existe(esperada);

    console.log('--- ' + caso.id + ' · ' + caso.descripcion + ' ---');
    console.log('pais: ' + caso.entrada.pais + ' · tipo: ' + caso.entrada.tipo);

    if (generaDocumento) {
      const texto = leerTexto(esperada);
      console.log('salida esperada: ' + texto.split('\n').length + ' lineas');
      console.log('El motor llega en el Bloque 1; por ahora se muestra la salida esperada.');
      console.log('');
      console.log(texto);
    } else {
      console.log('Este caso debe fallar la validacion (no tiene salida esperada).');
    }
    console.log('');
  }
}

main();
