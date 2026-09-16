'use strict';

/**
 * Levanta el entorno de Apps Script dentro de Node.
 *
 * En Apps Script todos los archivos comparten un solo ámbito global. Aquí se
 * reproduce eso: se cargan src/core y src/server y se publican sus funciones en
 * globalThis, junto con las constantes que normalmente genera el build
 * (MODELOS, PAISES_SEMILLA, SECCIONES) y los dobles de las APIs de Google.
 */

const path = require('path');
const { instalarDobles, desinstalarDobles } = require('./google.js');
const { rutaDesdeRaiz, leerJson } = require('../../scripts/lib/archivos');
const { cargarModelos, versionDelModelo } = require('../../scripts/lib/modelos');

const ARCHIVOS_CORE = [
  'texto', 'numeros', 'fechas', 'identificaciones', 'tablas', 'paises',
  'documento', 'correo', 'derivados', 'esquemas', 'validaciones', 'motor', 'generar',
];

const ARCHIVOS_SERVIDOR = ['Config', 'Datos', 'AdaptadorDocumento', 'EnvioCorreo', 'Setup', 'Api'];

/** Lo que el build deja en dist/Modelos.js. */
function constanteDeModelos() {
  const { modelos, bloques } = cargarModelos();
  const versiones = {};
  for (const nombre of Object.keys(modelos)) versiones[nombre] = versionDelModelo(modelos[nombre]);
  return { versiones, modelos, bloques };
}

function publicarEnGlobal(ruta) {
  const resuelta = require.resolve(ruta);
  delete require.cache[resuelta];
  const exportados = require(resuelta);
  for (const llave of Object.keys(exportados)) globalThis[llave] = exportados[llave];
  return exportados;
}

/**
 * opciones: { correo, ahora, propiedades }
 * Devuelve el mundo falso, para inspeccionar lo que quedó escrito.
 */
function levantarEntorno(opciones) {
  const mundo = instalarDobles(opciones);

  globalThis.MODELOS = constanteDeModelos();
  globalThis.PAISES_SEMILLA = leerJson(rutaDesdeRaiz('data', 'paises.json')).paises;
  globalThis.SECCIONES = leerJson(rutaDesdeRaiz('data', 'secciones.json'));

  for (const nombre of ARCHIVOS_CORE) {
    publicarEnGlobal(path.join(__dirname, '..', '..', 'src', 'core', nombre + '.js'));
  }
  for (const nombre of ARCHIVOS_SERVIDOR) {
    publicarEnGlobal(path.join(__dirname, '..', '..', 'src', 'server', nombre + '.js'));
  }

  return mundo;
}

function bajarEntorno() {
  desinstalarDobles();
}

/** Una solicitud de Cashback CO válida, para las pruebas del servidor. */
function solicitudValida(cambios) {
  return Object.assign({
    pais: 'CO',
    tipo: 'cashback',
    nombreCampana: 'Campaña de prueba',
    tienda: 'Tienda de Prueba',
    alcance: 'Nacional',
    ciudades: '',
    segmento: 'todos',
    metodoPago: 'todos',
    declaracion: true,
    fechaInicio: '2026-09-20',
    horaInicio: '00:00',
    fechaFin: '2026-09-21',
    horaFin: '23:59',
    organizadorRazonSocial: 'Organizador de Prueba S.A.S.',
    organizadorId: '900111222-1',
    porcentaje: 20,
    tope: 20000,
    presupuesto: 1000000,
    maxPedidos: 1,
    sinLimite: false,
    carga: 'inmediata',
    vigencia: 'dias',
    diasVigencia: 30,
    redencion: 'tienda',
    condiciones: [],
  }, cambios || {});
}

module.exports = { levantarEntorno, bajarEntorno, solicitudValida };
