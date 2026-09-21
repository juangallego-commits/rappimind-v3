'use strict';

/**
 * La tabla de lo que cada pais imprime dentro de su documento.
 *
 * Juan la pidio el 20 de septiembre de 2026 junto con los casos dorados de
 * Peru, Argentina, Chile, Uruguay y Costa Rica (punto B1): poder leer de un
 * vistazo los valores de todos los paises, uno al lado del otro, es la unica
 * forma de ver que a uno le falta algo o que dos dicen cosas distintas de lo
 * mismo.
 *
 * Que columnas entran no esta escrito a mano: se mide. Se genera el documento
 * de cada pais y se mira que valores de su fila aparecen impresos. Asi, si
 * manana una clausula empieza a usar una columna nueva, la tabla la trae sola.
 *
 *   node scripts/tabla-paises.js
 */

const { rutaDesdeRaiz, leerJson, escribirTexto } = require('./lib/archivos');
const { cargarModelos } = require('./lib/modelos');
const { generarTexto } = require('../src/core/generar.js');

const { paises } = leerJson(rutaDesdeRaiz('data', 'paises.json'));
const { casos } = leerJson(rutaDesdeRaiz('pruebas', 'casos_base.json'));
const modelos = cargarModelos();

/* Las columnas que no son texto legal: no se imprimen, o identifican la fila. */
const NO_SON_TEXTO_DEL_DOCUMENTO = ['codigo', 'nombre', 'estado', 'idioma', 'modelos',
  'por_confirmar_en_pruebas', 'ruta_promos', 'nombre_modalidad_local', 'url_acuerdo_datos',
  'url_tc_turbo', 'url_tc_pro'];

/** Los casos dorados que generan un documento de país, uno por país. */
function documentoDeCadaPais() {
  const porPais = {};
  for (const caso of casos) {
    if (caso.esperado.resultado !== 'genera') continue;
    if (caso.entrada.tipo !== 'cashback') continue;
    const pais = paises.find((p) => p.codigo === caso.entrada.pais);
    if (!pais || porPais[pais.codigo]) continue;
    const salida = generarTexto(caso.entrada, pais, modelos, {
      fechaReferencia: caso.fecha_referencia, usuarioEnEquipo: true,
    });
    if (salida.valido) porPais[pais.codigo] = { caso: caso.id, texto: salida.texto };
  }
  return porPais;
}

function columnasQueSeImprimen(porPais) {
  const columnas = [];
  for (const pais of paises) {
    const doc = porPais[pais.codigo];
    if (!doc) continue;
    for (const llave of Object.keys(pais)) {
      if (NO_SON_TEXTO_DEL_DOCUMENTO.indexOf(llave) !== -1) continue;
      const valor = pais[llave];
      if (typeof valor !== 'string' || valor.trim() === '') continue;
      if (doc.texto.indexOf(valor) === -1) continue;
      if (columnas.indexOf(llave) === -1) columnas.push(llave);
    }
  }
  return columnas;
}

function armar() {
  const porPais = documentoDeCadaPais();
  const conDocumento = paises.filter((p) => porPais[p.codigo]);
  const sinDocumento = paises.filter((p) => !porPais[p.codigo]);
  const columnas = columnasQueSeImprimen(porPais);

  const lineas = [];
  lineas.push('# Lo que cada país imprime dentro de su documento');
  lineas.push('');
  lineas.push('Generado por `node scripts/tabla-paises.js`. No se edita a mano.');
  lineas.push('');
  lineas.push('Cada valor de esta tabla sale impreso en cada T&C que se publica en ese');
  lineas.push('país. Están aquí los ' + columnas.length + ' que se midieron generando el documento de cada uno:');
  lineas.push('no es una lista escrita a mano, así que si mañana una cláusula empieza a usar');
  lineas.push('una columna nueva, aparece sola.');
  lineas.push('');
  lineas.push('Los ' + conDocumento.length + ' países con documento guardado son los que tienen caso dorado: ');
  lineas.push(conDocumento.map((p) => porPais[p.codigo].caso).join(', ') + '.');
  lineas.push('Si alguien edita la pestaña Paises del Sheet o la semilla, `npm test` se cae y');
  lineas.push('dice qué línea cambió.');
  if (sinDocumento.length > 0) {
    lineas.push('');
    lineas.push('Sin caso dorado de cashback: ' + sinDocumento.map((p) => p.nombre).join(', ') +
      '. ' + (sinDocumento.length === 1 ? 'No usa' : 'No usan') + ' el modelo de cashback.');
  }

  for (const llave of columnas) {
    lineas.push('');
    lineas.push('## ' + llave);
    lineas.push('');
    for (const pais of conDocumento) {
      lineas.push('- **' + pais.nombre + '.** ' + pais[llave]);
    }
  }
  lineas.push('');
  return lineas.join('\n');
}

const texto = armar();
escribirTexto(rutaDesdeRaiz('docs', 'VALORES_POR_PAIS.md'), texto);
console.log('docs/VALORES_POR_PAIS.md generado: ' + texto.split('\n').length + ' líneas.');
