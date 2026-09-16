'use strict';

/**
 * npm run previsualizar: imprime el texto final de cada caso de
 * pruebas/casos_base.json, y para los que deben fallar muestra los errores.
 *
 * Es la forma rapida de ver, sin desplegar nada, que sale hoy del motor.
 */

const { rutaDesdeRaiz, leerJson } = require('./lib/archivos');
const { cargarModelos } = require('./lib/modelos');
const { generarTexto } = require('../src/core/generar.js');

function main() {
  const soloCaso = process.argv[2];
  const { casos } = leerJson(rutaDesdeRaiz('pruebas', 'casos_base.json'));
  const { paises } = leerJson(rutaDesdeRaiz('data', 'paises.json'));
  const modelos = cargarModelos();

  const seleccionados = soloCaso ? casos.filter((caso) => caso.id === soloCaso) : casos;
  if (seleccionados.length === 0) {
    console.error('No hay ningún caso con id "' + soloCaso + '".');
    process.exit(1);
  }

  for (const caso of seleccionados) {
    const pais = paises.find((p) => p.codigo === caso.entrada.pais);
    const resultado = generarTexto(caso.entrada, pais, modelos, {
      fechaReferencia: caso.fecha_referencia,
      usuarioEnEquipo: caso.usuario_en_equipo === true,
    });

    console.log('='.repeat(72));
    console.log(caso.id + ' · ' + caso.descripcion);
    console.log('país: ' + caso.entrada.pais + ' · tipo: ' + caso.entrada.tipo + ' · esperado: ' + caso.esperado.resultado);
    console.log('='.repeat(72));

    if (resultado.valido) {
      console.log(resultado.texto);
    } else {
      console.log('No genera. Errores:');
      for (const error of resultado.errores) {
        console.log('  - [' + error.campo + '] ' + error.mensaje);
      }
    }
    console.log('');
  }
}

main();
