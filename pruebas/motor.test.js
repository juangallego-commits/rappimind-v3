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

// --- Vista previa en vivo ---------------------------------------------------

const { renderizarVistaPrevia, tramosDeVistaPrevia, MARCA_HUECO } = require('../src/core/motor.js');
const { cargarModelos: cargar } = require('../scripts/lib/modelos');
const { nombreDelHueco } = require('../src/core/preguntas.js');
const { leerJson: leer, rutaDesdeRaiz: raiz } = require('../scripts/lib/archivos');

const modelosReales = cargar();
const casosBase = leer(raiz('pruebas', 'casos_base.json')).casos;

test('la vista previa marca un hueco por cada dato que falta', () => {
  const resultado = renderizarVistaPrevia('cashback', { tipo: 'cashback', alcance: 'Nacional' }, CO, modelosReales);
  assert.ok(resultado.huecos.length > 5);
  assert.ok(resultado.huecos.indexOf('ORGANIZADOR') !== -1);
  assert.ok(resultado.texto.indexOf(MARCA_HUECO) !== -1);
});

test('cada hueco se puede nombrar en palabras del comercial', () => {
  const resultado = renderizarVistaPrevia('cashback', { tipo: 'cashback', alcance: 'Nacional' }, CO, modelosReales);
  for (const hueco of resultado.huecos) {
    const nombre = nombreDelHueco(hueco);
    assert.ok(nombre && nombre.indexOf('_') === -1, hueco + ' no tiene un nombre legible');
  }
});

test('con el formulario completo la vista previa es idéntica al documento final', () => {
  for (const caso of casosBase.filter((c) => c.esperado.resultado === 'genera')) {
    const pais = leer(raiz('data', 'paises.json')).paises.find((p) => p.codigo === caso.entrada.pais);
    const modelo = { cashback: 'cashback', carrera_compras: 'carrera_compras', cashback_day: 'cashback_day' }[caso.entrada.tipo];

    const vista = renderizarVistaPrevia(modelo, caso.entrada, pais, modelosReales);
    const final = renderizar(modelo, caso.entrada, pais, modelosReales);

    assert.deepStrictEqual(vista.huecos, [], caso.id + ' tiene huecos estando completo');
    assert.strictEqual(vista.texto, final.texto, caso.id + ': la vista previa no coincide con el documento');
  }
});

test('la marca de hueco nunca sobrevive al documento final', () => {
  for (const caso of casosBase.filter((c) => c.esperado.resultado === 'genera')) {
    const pais = leer(raiz('data', 'paises.json')).paises.find((p) => p.codigo === caso.entrada.pais);
    const modelo = { cashback: 'cashback', carrera_compras: 'carrera_compras', cashback_day: 'cashback_day' }[caso.entrada.tipo];
    assert.strictEqual(renderizar(modelo, caso.entrada, pais, modelosReales).texto.indexOf(MARCA_HUECO), -1);
  }
});

test('tramosDeVistaPrevia separa texto y huecos', () => {
  const linea = 'antes ' + MARCA_HUECO + 'PORCENTAJE' + MARCA_HUECO + ' después';
  assert.deepStrictEqual(tramosDeVistaPrevia(linea), [
    { tipo: 'texto', valor: 'antes ' },
    { tipo: 'hueco', valor: 'PORCENTAJE' },
    { tipo: 'texto', valor: ' después' },
  ]);
});

test('un Cashback Day sin tiendas anuncia que faltan', () => {
  const resultado = renderizarVistaPrevia('cashback_day', { tipo: 'cashback_day', tiendas: [] }, CO, modelosReales);
  assert.ok(resultado.huecos.indexOf('TIENDA_MARCA') !== -1);
  assert.strictEqual(resultado.texto.indexOf('[[#TIENDAS]]'), -1, 'quedó el marcador del bloque repetible');
});

/*
 * La palabra "undefined" dentro del documento.
 *
 * El caso real: la pestaña Paises se creó antes de que existiera una columna,
 * así que esa llave no llega en el objeto del país y el valor cruza como
 * undefined. formatearMiles lo concatenaba dentro de String.replace y el T&C
 * salía diciendo "un millón (1undefined000undefined000) de Créditos", con el
 * documento dado por bueno y ya creado en Drive.
 *
 * La red de seguridad miraba espacios y paréntesis, no las palabras que deja
 * JavaScript cuando un dato no existe. Ahora las mira: es la frontera donde
 * toca, porque cualquier dato ausente del Sheet acaba pasando por aquí.
 */
test('la red de seguridad caza lo que deja JavaScript cuando un dato no existe', () => {
  const casos = [
    ['un millón (1undefined000) de Créditos', 'la palabra undefined'],
    ['vigente hasta null', 'la palabra null'],
    ['un tope de NaN Créditos', 'la palabra NaN'],
    ['el organizador [object Object] responde', 'un objeto sin convertir'],
  ];
  for (const [texto, nombre] of casos) {
    assert.ok(senalesDeTextoRoto(texto).indexOf(nombre) !== -1,
      'se coló en el documento: ' + texto);
  }
});

test('las palabras corrientes que se parecen no disparan la señal', () => {
  // "nulo" y "anular" son palabras normales de un texto legal, y NAN en
  // mayúsculas puede ser parte de una razón social.
  const limpios = [
    'la Campaña se podrá anular por caso fortuito',
    'el premio es nulo si la orden se cancela',
    'COMERCIALIZADORA NAN S.A.S. responde por el Beneficio',
  ];
  for (const texto of limpios) {
    assert.deepStrictEqual(senalesDeTextoRoto(texto), [],
      'señal falsa en un texto correcto: ' + texto);
  }
});
