'use strict';

/** Borra dist/ con Node, sin depender de rm ni de del. */

const { rutaDesdeRaiz, borrarCarpeta } = require('./lib/archivos');

const DIST = rutaDesdeRaiz('dist');
borrarCarpeta(DIST);
console.log('Carpeta dist/ borrada.');
