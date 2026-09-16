'use strict';

/**
 * Build de RappiMind v3: arma dist/ con lo que sube clasp.
 *
 * Todo se hace con Node, sin comandos del sistema, para que corra igual en
 * Windows y en el runner de GitHub Actions. Todo lo que se escribe sale con
 * finales de linea \n.
 *
 * Pasos (especificacion, seccion 2):
 *   1. Copia src/core/*.js y src/server/*.js a dist/.
 *   2. Convierte modelos/**\/*.md en dist/Modelos.js y data/*.json en
 *      dist/PaisesSemilla.js y dist/Secciones.js.
 *   3. Arma dist/Index.html, dist/Estilos.html, dist/App.html y
 *      dist/MotorCliente.html (este ultimo envuelve src/core para la vista
 *      previa en el navegador).
 *   4. Copia appsscript.json a dist/.
 */

const path = require('path');
const {
  rutaDesdeRaiz,
  leerTexto,
  leerJson,
  escribirTexto,
  borrarCarpeta,
  asegurarCarpeta,
  copiarArchivo,
  listarArchivos,
  existe,
} = require('./lib/archivos');
const { cargarModelos, versionDelModelo } = require('./lib/modelos');

const DIST = rutaDesdeRaiz('dist');
const AVISO = '// Archivo generado por scripts/build.js. No editar a mano.';

function encabezado(origen) {
  return [AVISO, '// Fuente: ' + origen, ''].join('\n');
}

/** Serializa un valor como literal JavaScript legible para Apps Script. */
function comoLiteral(valor) {
  return JSON.stringify(valor, null, 2);
}

/**
 * Apps Script no distingue mayusculas en los nombres de archivo: dist/motor.js
 * y dist/Motor.js serian el mismo archivo y uno pisaria al otro sin avisar.
 */
function revisarColisionesDeNombre(copiados) {
  const vistos = {};
  for (const relativa of copiados) {
    const nombre = relativa.split('/').pop().toLowerCase();
    if (vistos[nombre]) {
      throw new Error(
        'Dos archivos se llaman igual salvo por mayusculas: ' + vistos[nombre] + ' y ' + relativa +
        '. En Apps Script uno pisaria al otro.'
      );
    }
    vistos[nombre] = relativa;
  }
}

function copiarCodigoFuente() {
  const copiados = [];
  for (const carpeta of ['core', 'server']) {
    const origen = rutaDesdeRaiz('src', carpeta);
    for (const archivo of listarArchivos(origen, '.js')) {
      copiarArchivo(path.join(origen, archivo), path.join(DIST, archivo));
      copiados.push(carpeta + '/' + archivo);
    }
  }
  revisarColisionesDeNombre(copiados);
  return copiados;
}

function generarModelos() {
  const { modelos, bloques } = cargarModelos();

  const versiones = {};
  for (const [nombre, texto] of Object.entries(modelos)) {
    versiones[nombre] = versionDelModelo(texto);
  }

  const contenido = [
    encabezado('modelos/*.md y modelos/bloques/*.md'),
    '// Los textos legales son la fuente de verdad de Legal. No se editan aqui.',
    '',
    'var MODELOS = {',
    '  versiones: ' + indentar(comoLiteral(versiones), 2) + ',',
    '  modelos: ' + indentar(comoLiteral(modelos), 2) + ',',
    '  bloques: ' + indentar(comoLiteral(bloques), 2) + ',',
    '};',
    '',
    "if (typeof module !== 'undefined') { module.exports = { MODELOS: MODELOS }; }",
    '',
  ].join('\n');

  escribirTexto(path.join(DIST, 'Modelos.js'), contenido);
  return { modelos: Object.keys(modelos).length, bloques: Object.keys(bloques).length };
}

/** Reindenta un literal JSON multilinea para que encaje dentro del objeto. */
function indentar(texto, espacios) {
  const relleno = ' '.repeat(espacios);
  return texto
    .split('\n')
    .map((linea, indice) => (indice === 0 ? linea : relleno + linea))
    .join('\n');
}

function generarDatos() {
  const paises = leerJson(rutaDesdeRaiz('data', 'paises.json'));
  escribirTexto(
    path.join(DIST, 'PaisesSemilla.js'),
    [
      encabezado('data/paises.json'),
      'var PAISES_SEMILLA = ' + comoLiteral(paises.paises) + ';',
      'var PAISES_VERSION = ' + comoLiteral(paises.version || '') + ';',
      '',
      "if (typeof module !== 'undefined') { module.exports = { PAISES_SEMILLA: PAISES_SEMILLA, PAISES_VERSION: PAISES_VERSION }; }",
      '',
    ].join('\n')
  );

  const categoriasTravel = leerJson(rutaDesdeRaiz('data', 'categorias_travel.json'));
  escribirTexto(
    path.join(DIST, 'CategoriasTravel.js'),
    [
      encabezado('data/categorias_travel.json'),
      'var CATEGORIAS_TRAVEL = ' + comoLiteral(categoriasTravel) + ';',
      '',
      "if (typeof module !== 'undefined') { module.exports = { CATEGORIAS_TRAVEL: CATEGORIAS_TRAVEL }; }",
      '',
    ].join('\n')
  );

  const secciones = leerJson(rutaDesdeRaiz('data', 'secciones.json'));
  escribirTexto(
    path.join(DIST, 'Secciones.js'),
    [
      encabezado('data/secciones.json'),
      'var SECCIONES = ' + comoLiteral(secciones) + ';',
      '',
      "if (typeof module !== 'undefined') { module.exports = { SECCIONES: SECCIONES }; }",
      '',
    ].join('\n')
  );

  return { paises: paises.paises.length };
}

/** Envuelve un archivo de texto dentro de una etiqueta HTML. */
function envolver(etiqueta, cuerpo, comentario) {
  return ['<!-- ' + comentario + ' -->', '<' + etiqueta + '>', cuerpo, '</' + etiqueta + '>', ''].join('\n');
}

function generarHtml() {
  // Index.html se copia tal cual: es la plantilla que evalua Apps Script.
  copiarArchivo(rutaDesdeRaiz('src', 'client', 'Index.html'), path.join(DIST, 'Index.html'));

  escribirTexto(
    path.join(DIST, 'Estilos.html'),
    envolver('style', leerTexto(rutaDesdeRaiz('src', 'client', 'estilos.css')), 'Generado desde src/client/estilos.css')
  );

  // La interfaz vive en varios archivos, que se concatenan en orden alfabetico.
  // Los prefijos numericos de src/client/js/ fijan ese orden.
  //
  // Cada archivo se envuelve en una funcion que se llama sola. Sin eso, todos
  // compartirian un unico ambito y dos archivos que declaren `var estado`
  // terminarian pisandose entre si, con errores dificiles de encontrar. Se
  // comunican por window.RM, asi que el aislamiento no les quita nada.
  var interfaz = listarArchivos(rutaDesdeRaiz('src', 'client', 'js'), '.js')
    .map(function (archivo) {
      return [
        '// --- src/client/js/' + archivo + ' ---',
        '(function () {',
        leerTexto(rutaDesdeRaiz('src', 'client', 'js', archivo)),
        '})();',
      ].join('\n');
    })
    .join('\n');

  escribirTexto(
    path.join(DIST, 'App.html'),
    envolver('script', interfaz, 'Generado desde src/client/js/*.js')
  );

  // MotorCliente.html lleva el motor al navegador para la vista previa en vivo.
  //
  // OJO: tiene que llevar TAMBIEN los textos legales y los paises. Los archivos
  // Modelos.js, PaisesSemilla.js y Secciones.js que quedan sueltos en dist/ son
  // de Apps Script, o sea del servidor: el navegador nunca los recibe. Sin
  // ellos, MODELOS queda sin definir en el navegador, la vista previa revienta
  // y la pantalla se queda a medio pintar.
  const partesDelMotor = [];

  for (const generado of ['Modelos.js', 'PaisesSemilla.js', 'Secciones.js', 'CategoriasTravel.js']) {
    partesDelMotor.push('// --- ' + generado + ' ---', leerTexto(path.join(DIST, generado)));
  }

  for (const archivo of listarArchivos(rutaDesdeRaiz('src', 'core'), '.js')) {
    partesDelMotor.push('// --- src/core/' + archivo + ' ---', leerTexto(rutaDesdeRaiz('src', 'core', archivo)));
  }

  escribirTexto(
    path.join(DIST, 'MotorCliente.html'),
    envolver(
      'script',
      partesDelMotor.join('\n'),
      'Generado desde src/core/*.js y los datos, para la vista previa en el navegador'
    )
  );
}

function copiarManifiesto() {
  copiarArchivo(rutaDesdeRaiz('appsscript.json'), path.join(DIST, 'appsscript.json'));
}

function construir() {
  const faltantes = ['src/client/Index.html', 'src/client/estilos.css', 'appsscript.json'].filter(
    (relativa) => !existe(rutaDesdeRaiz(...relativa.split('/')))
  );
  if (listarArchivos(rutaDesdeRaiz('src', 'client', 'js'), '.js').length === 0) {
    throw new Error('No hay archivos de interfaz en src/client/js/.');
  }
  if (faltantes.length) {
    throw new Error('Faltan archivos para construir dist/: ' + faltantes.join(', '));
  }

  borrarCarpeta(DIST);
  asegurarCarpeta(DIST);

  const copiados = copiarCodigoFuente();
  const conteoModelos = generarModelos();
  const conteoDatos = generarDatos();
  generarHtml();
  copiarManifiesto();

  console.log('Build listo en dist/');
  console.log('  codigo copiado  : ' + copiados.length + ' archivos (' + copiados.join(', ') + ')');
  console.log('  modelos         : ' + conteoModelos.modelos + ' modelos, ' + conteoModelos.bloques + ' bloques');
  console.log('  paises          : ' + conteoDatos.paises);
  console.log('  archivos en dist: ' + listarArchivos(DIST).join(', '));
}

if (require.main === module) {
  try {
    construir();
  } catch (error) {
    console.error('El build fallo: ' + error.message);
    process.exit(1);
  }
}

module.exports = { construir, DIST };
