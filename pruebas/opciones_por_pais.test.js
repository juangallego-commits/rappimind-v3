'use strict';

/**
 * Opciones que solo se pueden ofrecer donde hay con qué cumplirlas.
 *
 * "Ofrecer algo que no se puede dar es peor que no ofrecerlo" es una regla de
 * la skill de flujo, y la herramienta ya la aplica en dos sitios: Rappi Travel
 * no se ofrece donde el país no lo tiene habilitado, y la tarjeta de los T&C
 * publicados no se dibuja donde no hay ninguno.
 *
 * Faltaba un tercero, y salió en la revisión general: "En ciertas secciones de
 * Rappi". Los nombres de las secciones tienen que ser los de la app, porque el
 * documento los imprime entre comillas, y `data/secciones.json` solo tenía la
 * lista de Colombia. En México, Perú, Argentina, Chile y Uruguay, que están
 * activos, el comercial podía elegir esa opción y quedaba delante de una
 * pregunta sin una sola casilla que marcar, con una validación que le pedía
 * marcar al menos una: imposible de cumplir, y sin más salida que adivinar que
 * había que volver atrás y cambiar la respuesta anterior.
 *
 * El 20 de septiembre de 2026 Juan confirmó que las secciones se llaman igual
 * en todos los países, así que la lista pasó a ser una sola y hoy no queda
 * ningún país bloqueado. El mecanismo del bloqueo se queda, porque un país con
 * lista propia vacía vuelve a necesitarlo.
 */

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const { rutaDesdeRaiz, leerJson } = require('../scripts/lib/archivos');
const { ESQUEMAS } = require('../src/core/esquemas.js');
const { preguntaDe } = require('../src/core/preguntas.js');

const { paises } = leerJson(rutaDesdeRaiz('data', 'paises.json'));
const SECCIONES = leerJson(rutaDesdeRaiz('data', 'secciones.json'));
const { seccionesDePais } = require('../src/core/paises.js');

test('la lista de secciones de la app es una sola, común a todos los países', () => {
  /*
   * Juan confirmó el 20 de septiembre de 2026 que las secciones se llaman igual
   * en todos los países, así que la lista vive una sola vez. Si alguien le pone
   * lista propia a un país, esta prueba lo nombra: el documento imprime esos
   * nombres entre comillas y una lista propia equivocada se publica.
   */
  assert.deepStrictEqual(SECCIONES.comun,
    ['Restaurantes', 'Turbo', 'Supermercados', 'CPGs', 'Turbo Restaurantes'],
    'cambió la lista común de secciones');
  const conListaPropia = Object.keys(SECCIONES.paises || {});
  assert.deepStrictEqual(conListaPropia.sort(), [],
    'un país tiene lista propia de secciones: ' + conListaPropia.join(', '));
});

test('todos los países resuelven la misma lista, y ninguno se queda sin ella', () => {
  paises.forEach((pais) => {
    assert.deepStrictEqual(seccionesDePais(pais.codigo, SECCIONES), SECCIONES.comun,
      pais.codigo + ' no resuelve la lista común');
  });
});

test('la razón de por qué no se puede elegir está escrita y nombra al país', () => {
  const pregunta = preguntaDe('redencion', 'cashback');
  assert.ok(pregunta.razonSinSecciones, 'falta razonSinSecciones en la pregunta de la redención');
  assert.ok(pregunta.razonSinSecciones.indexOf('{pais}') !== -1,
    'la razón tiene que nombrar al país, con el marcador {pais}');
  // Marcador y no una palabra del idioma: la lección de la decisión 3 del
  // encargo de portugués, donde corregir una tilde borró el número.
  assert.ok(!/México|Colombia/.test(pregunta.razonSinSecciones),
    'la razón trae un país escrito a mano');
});

test('la interfaz usa esa razón, y no se le olvida en ningún país sin lista', () => {
  const pasos = fs.readFileSync(path.join(__dirname, '..', 'src', 'client', 'js', '62-pasos.js'), 'utf8');
  const desde = pasos.indexOf('function opcionesDeshabilitadas(campo)');
  assert.ok(desde !== -1);
  const cuerpo = pasos.slice(desde, pasos.indexOf('\n}\n', desde));
  assert.ok(cuerpo.indexOf("campo.id === 'redencion'") !== -1,
    'opcionesDeshabilitadas ya no mira la pregunta de la redención');
  assert.ok(cuerpo.indexOf('razonSinSecciones') !== -1, 'ya no se usa la razón escrita');
  assert.ok(cuerpo.indexOf("replace('{pais}'") !== -1, 'el nombre del país no se sustituye');
});

test('ningún país activo que ofrece la redención se queda con la opción bloqueada', () => {
  /*
   * Hasta el 20 de septiembre de 2026 aquí había siete países: AR, CL, CR, EC,
   * MX, PE y UY. Hoy no queda ninguno. Si mañana entra un país nuevo con lista
   * propia vacía, esta prueba lo nombra y alguien decide, en vez de que el
   * comercial lo descubra delante de una pregunta sin una casilla que marcar.
   */
  const bloqueados = [];
  paises.forEach((pais) => {
    const ofrece = (pais.modelos || []).some((tipo) => {
      const esquema = ESQUEMAS[tipo];
      return esquema && esquema.campos.some((campo) => campo.id === 'secciones');
    });
    if (!ofrece) return;
    if (seccionesDePais(pais.codigo, SECCIONES).length === 0) bloqueados.push(pais.codigo);
  });
  assert.deepStrictEqual(bloqueados.sort(), [],
    'quedaron países sin secciones: ' + bloqueados.join(', '));
});
