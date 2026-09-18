'use strict';

/**
 * El catálogo de leyendas de piezas publicitarias.
 *
 * Las 55 leyendas salen de la respuesta del encargo 03, sección 9.2, y están en
 * `modelos/leyendas/`. El texto es de Legal: aquí solo se comprueba que el
 * catálogo se lea bien, que cada leyenda diga de dónde salió y que nadie haya
 * reescrito una frase por el camino.
 */

const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

const { cargarLeyendas, CARPETA_LEYENDAS } = require('../scripts/lib/modelos');
const {
  cargarCatalogo,
  leyendaDesdeTexto,
  categoriasDelPais,
  complementosQueAplican,
  leyendasDeLaCampana,
  aplicarRecorte,
  nivelesDeRecorte,
  armarLeyenda,
  textoDeComplementos,
  TIPOS_DE_PIEZA,
  FORMAS_DE_ELEGIR,
} = require('../src/core/leyendas.js');
const { rutaDesdeRaiz, leerTexto } = require('../scripts/lib/archivos');

const TEXTOS = cargarLeyendas();
const CATALOGO = cargarCatalogo(TEXTOS);
const TODAS = Object.keys(CATALOGO).map((id) => CATALOGO[id]);

test('el catálogo trae las 55 leyendas de la respuesta', () => {
  assert.strictEqual(Object.keys(CATALOGO).length, 55);
});

test('el nombre del archivo es el identificador de la leyenda', () => {
  // Si se separan, buscar una leyenda por su identificador deja de encontrar su
  // archivo, y el catálogo se llena de parejas que no son.
  for (const archivo of fs.readdirSync(CARPETA_LEYENDAS)) {
    const id = archivo.replace(/\.md$/, '');
    assert.ok(CATALOGO[id], archivo + ' no produjo una leyenda con ese identificador');
  }
});

/**
 * El texto legal no se toca.
 *
 * Esta es la prueba que importa de verdad: compara letra por letra el cuerpo de
 * cada archivo de `modelos/leyendas/` con el bloque de la respuesta de Claude
 * chat. Si alguien "mejora" una frase, arregla una tilde o quita un espacio, se
 * cae aquí. La regla 3 de CLAUDE.md dice que el texto legal es de Legal, y una
 * regla que nadie vigila se rompe sola.
 */
test('el texto de cada leyenda es el de la respuesta, letra por letra', () => {
  const respuesta = leerTexto(rutaDesdeRaiz('docs', 'encargos', 'respuestas', '03-leyendas.md'));
  const seccion = respuesta.slice(
    respuesta.indexOf('## 9.2 PARA EL REPOSITORIO'),
    respuesta.indexOf('## 9.3 Las tres listas')
  );

  const bloques = seccion.match(/```\n%% id: [\s\S]*?\n```/g) || [];
  assert.strictEqual(bloques.length, 55, 'la respuesta ya no trae 55 bloques');

  for (const bloque of bloques) {
    const crudo = bloque.replace(/^```\n/, '').replace(/\n```$/, '');
    const deLaRespuesta = leyendaDesdeTexto(crudo);
    const delRepositorio = CATALOGO[deLaRespuesta.id];
    assert.ok(delRepositorio, 'falta en el repositorio: ' + deLaRespuesta.id);
    assert.strictEqual(delRepositorio.cuerpo, deLaRespuesta.cuerpo,
      'el texto de ' + deLaRespuesta.id + ' ya no es el de la respuesta');
    assert.strictEqual(delRepositorio.largo_max, deLaRespuesta.largo_max, deLaRespuesta.id);
    assert.deepStrictEqual(delRepositorio.tipo_pieza, deLaRespuesta.tipo_pieza, deLaRespuesta.id);
    assert.deepStrictEqual(delRepositorio.pais, deLaRespuesta.pais, deLaRespuesta.id);
  }
});

test('cada leyenda dice de dónde salió y cuánto puede medir', () => {
  for (const leyenda of TODAS) {
    assert.ok(leyenda.origen.length > 0, leyenda.id + ' no dice su origen');
    assert.ok(leyenda.largo_max > 0, leyenda.id + ' no dice su largo máximo');
    assert.ok(leyenda.pais.length > 0, leyenda.id + ' no dice a qué país aplica');
    assert.ok(leyenda.tipo_pieza.length > 0, leyenda.id + ' no dice en qué pieza va');
    assert.ok(leyenda.cuerpo.length > 0, leyenda.id + ' quedó sin texto');
    assert.ok(leyenda.fuente.indexOf('03-leyendas.md') !== -1, leyenda.id + ' no dice su fuente');
  }
});

test('cada complemento dice cómo se elige, y con un identificador estable', () => {
  for (const leyenda of TODAS) {
    if (leyenda.tipo_pieza.indexOf('complemento') === -1) continue;
    if (!leyenda.categoria) continue;
    assert.ok(leyenda.categoria_id, leyenda.id + ' no tiene identificador de categoría');
    assert.ok(FORMAS_DE_ELEGIR.indexOf(leyenda.se_elige_en) !== -1,
      leyenda.id + ' se elige de una forma que no existe: ' + leyenda.se_elige_en);
  }
});

test('un país solo ofrece las categorías que tiene leyenda para imprimir', () => {
  // Las opciones salen del catálogo, no de una lista escrita a mano: una
  // categoría sin leyenda no se puede elegir, porque no tendría nada que decir.
  const colombia = categoriasDelPais(CATALOGO, 'CO').map((c) => c.valor);
  assert.deepStrictEqual(colombia.slice().sort(), [
    'bebidas_sin_alcohol', 'cigarrillos', 'fitoterapeutico_pfm', 'fitoterapeutico_pft',
    'licores', 'medicamento', 'medicamentos_varios', 'suplementos', 'vapeadores', 'vapeadores_pmi',
  ]);

  const mexico = categoriasDelPais(CATALOGO, 'MX').map((c) => c.valor);
  assert.deepStrictEqual(mexico.slice().sort(),
    ['alimentos', 'bebidas_sin_alcohol', 'bolsas_nicotina', 'licores', 'medicamentos']);

  // Chile solo tiene licores; Uruguay, Costa Rica y Brasil no tienen ninguna.
  assert.deepStrictEqual(categoriasDelPais(CATALOGO, 'CL').map((c) => c.valor), ['licores']);
  assert.deepStrictEqual(categoriasDelPais(CATALOGO, 'UY'), []);
  assert.deepStrictEqual(categoriasDelPais(CATALOGO, 'BR'), []);
});

test('cada categoría trae su etiqueta en palabras, no el identificador', () => {
  for (const codigo of ['CO', 'MX', 'PE', 'AR', 'CL', 'EC']) {
    for (const opcion of categoriasDelPais(CATALOGO, codigo)) {
      assert.ok(opcion.etiqueta && opcion.etiqueta.indexOf('_') === -1,
        codigo + '.' + opcion.valor + ' salió con el nombre técnico: ' + opcion.etiqueta);
    }
  }
});

test('Turbo no se pregunta: sale de lo que el comercial ya respondió', () => {
  const conTurbo = complementosQueAplican(CATALOGO, 'CO', 'ninguna', true).map((l) => l.id);
  assert.deepStrictEqual(conTurbo, ['leyenda_turbo_co']);

  const sinTurbo = complementosQueAplican(CATALOGO, 'CO', 'ninguna', false);
  assert.deepStrictEqual(sinTurbo, []);

  // Y cada país pega el suyo, no el de Colombia.
  assert.deepStrictEqual(complementosQueAplican(CATALOGO, 'MX', '', true).map((l) => l.id), ['leyenda_turbo_mx']);
});

test('Turbo va antes que la categoría, como dice el catálogo', () => {
  const dos = complementosQueAplican(CATALOGO, 'CO', 'licores', true).map((l) => l.id);
  assert.deepStrictEqual(dos, ['leyenda_turbo_co', 'leyenda_licores_co']);
});

test('una categoría que este país no tiene no pega nada de otro país', () => {
  // Colombia no tiene "alimentos", que es de México. Pegar el de México sería
  // imprimir una advertencia de otra ley en la pieza equivocada.
  assert.deepStrictEqual(complementosQueAplican(CATALOGO, 'CO', 'alimentos', false), []);
});

test('hoy solo Colombia tiene leyenda de campaña', () => {
  // La respuesta lo dice en la sección 7A: para los demás países el SSL solo da
  // recetas. El punto 9 de la 7E manda esas piezas a Legal del país.
  const deColombia = leyendasDeLaCampana(CATALOGO, 'CO', 'cashback').map((x) => x.formato);
  assert.deepStrictEqual(deColombia, ['texto_apoyo', 'letra_pequena', 'banner_corto', 'exterior', 'push_sms']);

  for (const codigo of ['MX', 'PE', 'AR', 'CL', 'EC', 'UY', 'CR', 'BR']) {
    assert.deepStrictEqual(leyendasDeLaCampana(CATALOGO, codigo, 'cashback'), [],
      codigo + ' no debería tener leyenda de campaña todavía');
  }
});

test('cada tipo de campaña de Colombia trae los formatos que le tocan', () => {
  const formatos = (tipo) => leyendasDeLaCampana(CATALOGO, 'CO', tipo).map((x) => x.formato);
  assert.deepStrictEqual(formatos('cashback_day'), ['texto_apoyo', 'letra_pequena', 'banner_corto', 'exterior', 'push_sms']);
  assert.deepStrictEqual(formatos('cashback_eta'), ['texto_apoyo', 'letra_pequena', 'banner_corto', 'push_sms']);
  // Carrera y Travel no llevan texto de apoyo ni push: una sola leyenda sirve
  // para letra pequeña y banner.
  assert.deepStrictEqual(formatos('carrera_compras'), ['letra_pequena', 'banner_corto']);
  assert.deepStrictEqual(formatos('cashback_travel'), ['letra_pequena', 'banner_corto']);
  assert.deepStrictEqual(formatos('descuento_travel'), ['letra_pequena', 'banner_corto']);
});

test('el texto de apoyo del cashback sirve también para el Cashback Multitienda', () => {
  const uno = leyendasDeLaCampana(CATALOGO, 'CO', 'cashback')[0].leyenda.id;
  const otro = leyendasDeLaCampana(CATALOGO, 'CO', 'cashback_day')[0].leyenda.id;
  assert.strictEqual(uno, 'leyenda_cashback_apoyo_co');
  assert.strictEqual(otro, 'leyenda_cashback_apoyo_co');
});

// --- El recorte ------------------------------------------------------------

test('el nivel 0 no quita nada y cada nivel quita el suyo y los anteriores', () => {
  const texto = 'Base.[[R1]] Uno.[[/R]][[R2]] Dos.[[/R]][[R3]] Tres.[[/R]]';
  assert.strictEqual(aplicarRecorte(texto, 0), 'Base. Uno. Dos. Tres.');
  assert.strictEqual(aplicarRecorte(texto, 1), 'Base. Dos. Tres.');
  assert.strictEqual(aplicarRecorte(texto, 2), 'Base. Tres.');
  assert.strictEqual(aplicarRecorte(texto, 3), 'Base.');
  assert.deepStrictEqual(nivelesDeRecorte(texto), [1, 2, 3]);
});

test('lo que no está marcado nunca sale, por mucho que no quepa', () => {
  const leyenda = {
    id: 'prueba', largo_max: 10, cuerpo: 'Esto es el mínimo irreductible y no cabe.[[R1]] Esto sí sale.[[/R]]',
  };
  const armada = armarLeyenda(leyenda, {});
  assert.strictEqual(armada.texto, 'Esto es el mínimo irreductible y no cabe.');
  assert.strictEqual(armada.cabe, false, 'debería avisar que no cabe');
  assert.strictEqual(armada.nivel, 1, 'debería haber usado el último nivel');
  assert.deepStrictEqual(armada.errores, [], 'no caber no es un error de texto');
});

test('si con el nivel 0 ya cabe, no se recorta nada', () => {
  const leyenda = { id: 'prueba', largo_max: 300, cuerpo: 'Corta.[[R1]] Y esto también.[[/R]]' };
  const armada = armarLeyenda(leyenda, {});
  assert.strictEqual(armada.texto, 'Corta. Y esto también.');
  assert.strictEqual(armada.nivel, 0);
  assert.strictEqual(armada.recortada, false);
  assert.strictEqual(armada.cabe, true);
});

test('una leyenda con un hueco es un error, no una leyenda corta', () => {
  // Misma regla que el documento: si falta un dato, no se entrega.
  const leyenda = { id: 'prueba', largo_max: 300, cuerpo: 'Válido {{FALTA_ESTE}}.' };
  const armada = armarLeyenda(leyenda, {});
  assert.ok(armada.errores.length > 0);
  assert.ok(armada.errores[0].indexOf('FALTA_ESTE') !== -1, armada.errores[0]);
});

test('el motor de leyendas caza una frase rota igual que el de documentos', () => {
  const leyenda = { id: 'prueba', largo_max: 300, cuerpo: 'Uno .. dos ,tres ( ).' };
  const armada = armarLeyenda(leyenda, {});
  const texto = armada.errores.join(' | ');
  assert.ok(texto.indexOf('dos puntos seguidos') !== -1, texto);
  assert.ok(texto.indexOf('paréntesis vacío') !== -1, texto);
});

test('un bloque opcional desaparece entero cuando su dato está vacío', () => {
  const leyenda = { id: 'prueba', largo_max: 300, cuerpo: 'Base.[[?ALGO]] Con {{ALGO}}.[[/?]] Fin.' };
  assert.strictEqual(armarLeyenda(leyenda, {}).texto, 'Base. Fin.');
  assert.strictEqual(armarLeyenda(leyenda, { ALGO: 'x' }).texto, 'Base. Con x. Fin.');
});

test('los complementos se unen con un espacio y nadie les agrega puntuación', () => {
  // Las de Chile y Perú vienen del SSL sin punto final, a propósito.
  const unidos = textoDeComplementos(
    [CATALOGO.leyenda_licores_cl, CATALOGO.leyenda_licores_pe], {}
  );
  assert.deepStrictEqual(unidos.errores, []);
  assert.strictEqual(
    unidos.texto,
    CATALOGO.leyenda_licores_cl.cuerpo + ' ' + CATALOGO.leyenda_licores_pe.cuerpo
  );
});

test('un complemento sin datos nuevos cabe en su propio largo máximo', () => {
  // El largo máximo de un complemento es su propio largo, redondeado hacia
  // arriba. Los que piden un dato (registro sanitario, marca del anunciante) se
  // miden aparte, porque el dato cambia el largo.
  const conDatos = ['REGISTRO_SANITARIO', 'NOTIFICACION_INVIMA', 'MARCA_ANUNCIANTE',
    'RAZON_SOCIAL_ANUNCIANTE', 'REGISTRO_MINCETUR', 'URL_PORTAL_MARCA', 'URL_TC_MARCA',
    'URL_TC_CAMPANA', 'URL_TC_TURBO', 'URL_TC_PRO', 'CODIGO_PROMOCIONAL', 'TEXTO_COMPLEMENTOS'];

  for (const leyenda of TODAS) {
    if (leyenda.tipo_pieza.indexOf('complemento') === -1) continue;
    if (conDatos.some((marca) => leyenda.cuerpo.indexOf('{{' + marca + '}}') !== -1)) continue;
    const armada = armarLeyenda(leyenda, {});
    assert.deepStrictEqual(armada.errores, [], leyenda.id + ': ' + armada.errores.join(' | '));
    assert.ok(armada.cabe, leyenda.id + ' mide ' + armada.largo + ' y su máximo es ' + armada.largo_max);
  }
});

test('los cinco formatos de pieza tienen nombre en palabras', () => {
  for (const formato of TIPOS_DE_PIEZA) {
    assert.ok(formato.id && formato.nombre, JSON.stringify(formato));
    assert.ok(formato.nombre.indexOf('_') === -1, formato.nombre);
  }
});

test('el catálogo llega al navegador, no solo al servidor', () => {
  // Frontera 2: los .js sueltos de dist/ son de Apps Script. Si el catálogo no
  // entra dentro de MotorCliente.html, la pantalla final se queda sin leyendas
  // y revienta a mitad del clic.
  const motor = path.join(rutaDesdeRaiz('dist'), 'MotorCliente.html');
  if (!fs.existsSync(motor)) return; // sin build, no hay nada que revisar
  const html = leerTexto(motor);
  assert.ok(html.indexOf('var LEYENDAS = ') !== -1, 'MotorCliente.html no lleva el catálogo de leyendas');
  assert.ok(html.indexOf('leyenda_cashback_letra_pequena_co') !== -1, 'el catálogo llegó vacío al navegador');
});
