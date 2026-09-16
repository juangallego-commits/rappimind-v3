'use strict';

/** Las piezas del render, una por una, con modelos mínimos hechos a mano. */

const test = require('node:test');
const assert = require('node:assert');

const {
  renderizar,
  expandirInclusiones,
  quitarComentarios,
  expandirTiendas,
  resolverOpcionales,
  reemplazarPlaceholders,
  numerarClausulas,
  senalesDeTextoRoto,
} = require('../src/core/motor.js');

const { rutaDesdeRaiz, leerJson } = require('../scripts/lib/archivos');

const CO = leerJson(rutaDesdeRaiz('data', 'paises.json')).paises.find((p) => p.codigo === 'CO');

test('expandirInclusiones mete el bloque en su lugar', () => {
  const salida = expandirInclusiones('antes\n[[INCLUIR:saludo]]\ndespués', { saludo: 'hola\n' });
  assert.strictEqual(salida.texto, 'antes\nhola\ndespués');
  assert.deepStrictEqual(salida.faltantes, []);
});

test('expandirInclusiones reporta un bloque que no existe', () => {
  const salida = expandirInclusiones('[[INCLUIR:fantasma]]', {});
  assert.deepStrictEqual(salida.faltantes, ['fantasma']);
});

test('expandirInclusiones ignora los retornos de carro del modelo', () => {
  const salida = expandirInclusiones('antes\r\n[[INCLUIR:saludo]]\r\ndespués', { saludo: 'hola\r\n' });
  assert.strictEqual(salida.texto, 'antes\nhola\ndespués');
});

test('quitarComentarios borra las líneas que empiezan con %%', () => {
  assert.strictEqual(quitarComentarios('%% versión 3.0\ntexto\n%% otra'), 'texto');
});

test('los bloques opcionales se conservan solo si el campo tiene valor', () => {
  const modelo = 'a[[?X]] con X[[/?]]b';
  assert.strictEqual(resolverOpcionales(modelo, { X: 'algo' }), 'a con Xb');
  assert.strictEqual(resolverOpcionales(modelo, { X: '' }), 'ab');
});

test('el bloque de tiendas se repite una vez por tienda', () => {
  const modelo = '[[#TIENDAS]]\n• {{TIENDA_MARCA}}: {{TIENDA_CIUDADES}}\n[[/TIENDAS]]';
  const tiendas = [
    { marca: 'Uno', razonSocial: 'Uno S.A.S.', id: '900777888-2', ciudades: 'Bogotá, Medellín', presupuesto: 1000 },
    { marca: 'Dos', razonSocial: 'Dos S.A.S.', id: '901222333-9', nacional: true, presupuesto: 2000 },
  ];
  const salida = expandirTiendas(modelo, tiendas, CO);
  assert.strictEqual(salida, '• Uno: Bogotá y Medellín\n• Dos: cobertura nacional');
});

test('un placeholder sin valor se reporta y no deja marca', () => {
  const salida = reemplazarPlaceholders('hola {{NOMBRE}} y {{OTRO}}', { NOMBRE: 'Juan' });
  assert.strictEqual(salida.texto, 'hola Juan y ');
  assert.deepStrictEqual(salida.vacios, ['OTRO']);
});

test('las cláusulas se numeran después de quitar los bloques vacíos', () => {
  const salida = numerarClausulas('§ Uno. Texto uno.\n\n§ Dos. Texto dos.');
  assert.strictEqual(salida, '**1. Uno.** Texto uno.\n**2. Dos.** Texto dos.');
});

test('una cláusula que solo trae título no duplica el punto', () => {
  assert.strictEqual(numerarClausulas('§ Topes y límites.'), '**1. Topes y límites.**');
});

test('las líneas vacías desaparecen del documento final', () => {
  assert.strictEqual(numerarClausulas('uno\n\n\ndos'), 'uno\ndos');
});

test('la red de seguridad detecta las frases rotas', () => {
  assert.deepStrictEqual(senalesDeTextoRoto('texto limpio.'), []);
  assert.ok(senalesDeTextoRoto('un valor , vacío').length > 0);
  assert.ok(senalesDeTextoRoto('un valor .').length > 0);
  assert.ok(senalesDeTextoRoto('frase ()').length > 0);
  assert.ok(senalesDeTextoRoto('dos  espacios').length > 0);
  assert.ok(senalesDeTextoRoto('coma, .').length > 0);
  assert.ok(senalesDeTextoRoto('punto.. doble').length > 0);
});

test('los puntos suspensivos no se confunden con dos puntos seguidos', () => {
  assert.deepStrictEqual(senalesDeTextoRoto('esto sigue...'), []);
});

test('la red de seguridad mira el texto sin negritas', () => {
  // "**algo** ." está roto aunque las marcas de negrita queden en el medio.
  assert.ok(senalesDeTextoRoto('**algo** .').length > 0);
});

test('renderizar avisa cuando el modelo no existe', () => {
  const salida = renderizar('inventado', {}, CO, { modelos: {}, bloques: {} });
  assert.strictEqual(salida.texto, '');
  assert.strictEqual(salida.errores.length, 1);
});

test('renderizar bloquea cuando un dato obligatorio queda vacío', () => {
  const modelos = { modelos: { prueba: '§ Vigencia. Empieza el {{FECHA_INICIO}}.' }, bloques: {} };
  const salida = renderizar('prueba', { tipo: 'cashback' }, CO, modelos);
  assert.ok(salida.errores.length > 0);
  assert.ok(salida.placeholdersVacios.indexOf('FECHA_INICIO') !== -1);
});
