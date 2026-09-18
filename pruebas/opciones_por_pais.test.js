'use strict';

/**
 * Opciones que solo se pueden ofrecer donde hay con qué cumplirlas.
 *
 * "Ofrecer algo que no se puede dar es peor que no ofrecerlo" es una regla de
 * la skill de flujo, y la herramienta ya la aplica en dos sitios: Rappi Travel
 * no se ofrece donde el país no lo tiene habilitado, y la tarjeta de los T&C
 * publicados no se dibuja donde no hay ninguno.
 *
 * Faltaba un tercero, y salió en esta revisión: "En ciertas secciones de
 * Rappi". Los nombres de las secciones tienen que ser los de la app, porque el
 * documento los imprime entre comillas, y `data/secciones.json` solo tiene la
 * lista de Colombia. En México, Perú, Argentina, Chile y Uruguay, que están
 * activos, el comercial podía elegir esa opción y quedaba delante de una
 * pregunta sin una sola casilla que marcar, con una validación que le pedía
 * marcar al menos una: imposible de cumplir, y sin más salida que adivinar que
 * había que volver atrás y cambiar la respuesta anterior.
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

test('hoy solo Colombia tiene la lista de secciones de la app', () => {
  /*
   * Si esto cambia es una buena noticia: quiere decir que alguien dio la lista
   * de otro país. Entonces hay que quitar ese país de aquí, y de paso la opción
   * se desbloquea sola.
   */
  const conLista = Object.keys(SECCIONES).filter((k) => k !== 'nota' && (SECCIONES[k] || []).length > 0);
  assert.deepStrictEqual(conLista.sort(), ['CO'],
    'cambió la lista de países con secciones: ' + conLista.join(', '));
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

test('todo país activo que ofrece la redención tiene secciones, o la opción queda bloqueada', () => {
  /*
   * La lista de los que hoy quedan con la opción bloqueada. Está escrita a
   * propósito: si mañana entra un país nuevo sin lista de secciones, esta
   * prueba lo nombra y alguien decide, en vez de que el comercial lo descubra
   * delante de una pregunta vacía.
   */
  const bloqueados = [];
  paises.forEach((pais) => {
    const ofrece = (pais.modelos || []).some((tipo) => {
      const esquema = ESQUEMAS[tipo];
      return esquema && esquema.campos.some((campo) => campo.id === 'secciones');
    });
    if (!ofrece) return;
    if ((SECCIONES[pais.codigo] || []).length === 0) bloqueados.push(pais.codigo);
  });
  assert.deepStrictEqual(bloqueados.sort(), ['AR', 'CL', 'CR', 'EC', 'MX', 'PE', 'UY'],
    'cambió la lista de países sin secciones: ' + bloqueados.join(', '));
});
