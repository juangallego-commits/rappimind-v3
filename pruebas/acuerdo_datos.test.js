'use strict';

/**
 * El acuerdo de transferencia de datos.
 *
 * Rappi no le puede pasar al Organizador el nombre, la dirección y el documento
 * del ganador de una Carrera sin un acuerdo firmado con esa marca. Es la
 * decisión 36 (i) de la respuesta del encargo 01, y llegó con todo: el enunciado,
 * las dos opciones, el circuito de nueve pasos de Colombia y los modelos de cada
 * país.
 *
 * Las dos reglas que vigila este archivo:
 *
 *   1. La pregunta sale exactamente cuando hay datos que transferir, que es la
 *      misma condición con la que el documento imprime la cláusula de datos. Si
 *      las dos se separan, o se pregunta de más o se transfiere sin avisar.
 *   2. No bloquea el T&C. Los datos salen después del concurso, así que un
 *      comercial que todavía no tiene el acuerdo genera su documento igual y lo
 *      que recibe es el camino para firmarlo.
 */

const test = require('node:test');
const assert = require('node:assert');

const { camposVisibles } = require('../src/core/esquemas.js');
const { PREGUNTAS } = require('../src/core/preguntas.js');
const { validarSolicitud } = require('../src/core/validaciones.js');
const { generarTexto } = require('../src/core/generar.js');
const { calcularDerivados } = require('../src/core/derivados.js');
const { cargarModelos } = require('../scripts/lib/modelos');

const PAISES = require('../data/paises.json').paises;
const CO = PAISES.filter((p) => p.codigo === 'CO')[0];
const MODELOS = cargarModelos();
const CONTEXTO = { fechaReferencia: '2026-09-16', usuarioEnEquipo: true };
const CC03 = require('./casos_base.json').casos.filter((c) => c.id === 'CC03')[0].entrada;

const camposDelPremio = (entrada) =>
  camposVisibles('carrera_compras', entrada).filter((c) => c.paso === 'premio').map((c) => c.id);

test('la pregunta sale solo con premio físico que entrega el Organizador', () => {
  const con = (cambios) => camposDelPremio(Object.assign({}, CC03, cambios)).indexOf('acuerdoDatos') !== -1;

  assert.strictEqual(con({}), true, 'físico y lo entrega el Organizador: sí se pregunta');
  assert.strictEqual(con({ entregaPor: 'rappi' }), false, 'si entrega Rappi no hay a quién transferirle nada');
  assert.strictEqual(con({ tipoPremio: 'creditos', creditosPremio: 500000 }), false,
    'los Créditos los acredita Rappi: no hay datos que transferir');
});

test('la pregunta y la cláusula salen con la misma condición', () => {
  // Si se separan, la herramienta pregunta por un acuerdo que el documento no
  // necesita, o transfiere datos sin haber preguntado nunca.
  for (const cambios of [
    {},
    { entregaPor: 'rappi' },
    { tipoPremio: 'creditos', creditosPremio: 500000 },
    { tipoPremio: 'creditos', creditosPremio: 500000, entregaPor: 'rappi' },
  ]) {
    const entrada = Object.assign({}, CC03, cambios);
    const sePregunta = camposDelPremio(entrada).indexOf('acuerdoDatos') !== -1;
    const seTransfiere = !!calcularDerivados(entrada, CO).TEXTO_DATOS_ENTREGA;
    assert.strictEqual(sePregunta, seTransfiere,
      JSON.stringify(cambios) + ': se pregunta ' + sePregunta + ' y se transfiere ' + seTransfiere);
  }
});

test('no responderla no bloquea el documento', () => {
  // Es la razón por la que la pregunta existe y no es un filtro: los datos del
  // ganador salen semanas después, cuando el concurso ya terminó.
  for (const respuesta of [undefined, '', 'no_o_no_se', 'firmado']) {
    const entrada = Object.assign({}, CC03, { acuerdoDatos: respuesta });
    assert.deepStrictEqual(validarSolicitud(entrada, CO, CONTEXTO).errores, [], String(respuesta));
    assert.strictEqual(generarTexto(entrada, CO, MODELOS, CONTEXTO).valido, true, String(respuesta));
  }
});

test('la respuesta no cambia una coma del documento', () => {
  // Lo que se firma es un contrato entre Rappi y la marca, no algo que el
  // usuario deba leer en el T&C.
  const textos = ['firmado', 'no_o_no_se', undefined].map((respuesta) =>
    generarTexto(Object.assign({}, CC03, { acuerdoDatos: respuesta }), CO, MODELOS, CONTEXTO).texto);
  assert.strictEqual(textos[0], textos[1]);
  assert.strictEqual(textos[1], textos[2]);
});

test('la pregunta se ve opcional y tiene sus dos opciones', () => {
  const pregunta = PREGUNTAS.acuerdoDatos;
  assert.strictEqual(pregunta.opcional, true);
  assert.deepStrictEqual(pregunta.opciones.map((o) => o.valor), ['firmado', 'no_o_no_se']);
  assert.ok(pregunta.pregunta.indexOf('acuerdo de transferencia de datos') !== -1);
  assert.ok(pregunta.porQue.indexOf('autoridad de datos personales') !== -1);
});

test('el circuito de Colombia está entero, con sus diez pasos', () => {
  // Llegó como una lista de pasos y tiene que seguir siéndolo: es lo que el
  // comercial va a ir haciendo uno por uno.
  const panel = PREGUNTAS.acuerdoDatos.panel;
  assert.strictEqual(panel.pasosCO.length, 10);
  assert.ok(panel.tituloCO.indexOf('una sola vez al año por marca') !== -1, panel.tituloCO);
  assert.ok(panel.primeroCO.indexOf('en verde en la tabla de acuerdos marco') !== -1, panel.primeroCO);

  // Los cuatro hitos que un comercial no se puede saltar.
  const todo = panel.pasosCO.join(' ');
  for (const hito of [
    'Orden de Transferencia',
    'certificado de supresión',
    'ni Producto ni Data te pueden entregar los datos',
    'operador logístico',
  ]) {
    assert.ok(todo.indexOf(hito) !== -1, 'el circuito ya no menciona: ' + hito);
  }
});

test('el panel de los demás países nombra el país y no habla de la tabla', () => {
  const panel = PREGUNTAS.acuerdoDatos.panel;
  assert.ok(panel.conModelo.indexOf('{país}') !== -1, panel.conModelo);
  assert.ok(panel.sinModelo.indexOf('{país}') !== -1, panel.sinModelo);
  // La tabla de acuerdos marco es de Colombia: fuera de allí no existe.
  assert.strictEqual(panel.conModelo.indexOf('tabla de acuerdos marco'), -1);
  assert.strictEqual(panel.sinModelo.indexOf('tabla de acuerdos marco'), -1);
  assert.strictEqual(PREGUNTAS.acuerdoDatos.notaFirmadoCO.indexOf('tabla de acuerdos marco') !== -1, true);
});

test('cada país trae el enlace de su modelo, o lo deja vacío a propósito', () => {
  const porCodigo = (codigo) => PAISES.filter((p) => p.codigo === codigo)[0];

  // Seis países tienen modelo en la carpeta de Legal.
  for (const codigo of ['CO', 'MX', 'AR', 'UY', 'PE', 'EC']) {
    const url = porCodigo(codigo).url_acuerdo_datos;
    assert.ok(url && url.indexOf('https://') === 0, codigo + ' no tiene enlace del acuerdo: ' + url);
  }
  // Chile y Costa Rica no lo tienen, y por eso su panel manda a Legal. Brasil
  // no entrega premios físicos.
  for (const codigo of ['CL', 'CR', 'BR']) {
    assert.strictEqual(porCodigo(codigo).url_acuerdo_datos, '', codigo + ' aparece con enlace y no debería');
  }
});

test('los enlaces son los de la respuesta del encargo 01, letra por letra', () => {
  // La misma idea de las leyendas: un enlace que alguien "arregla" a mano manda
  // al comercial a un documento que no es el que Legal aprobó.
  const { leerTexto, rutaDesdeRaiz } = require('../scripts/lib/archivos');
  const respuesta = leerTexto(rutaDesdeRaiz('docs', 'encargos', 'respuestas', '01-legal.md'));

  const declarados = {};
  const patron = /^([A-Z]{2})\.url_acuerdo_datos = "([^"]*)"/gm;
  let encontrado;
  while ((encontrado = patron.exec(respuesta)) !== null) declarados[encontrado[1]] = encontrado[2];

  assert.ok(Object.keys(declarados).length >= 6, 'la respuesta ya no declara los enlaces');
  for (const codigo of Object.keys(declarados)) {
    const pais = PAISES.filter((p) => p.codigo === codigo)[0];
    assert.strictEqual(pais.url_acuerdo_datos, declarados[codigo],
      codigo + ': el enlace del repositorio ya no es el de la respuesta');
  }
});

test('la columna del acuerdo existe en la pestaña Paises', () => {
  // Frontera 3: sin la columna, el enlace no llega al navegador y el panel de un
  // país que sí tiene modelo sale sin su botón.
  const { PESTANAS } = require('../src/server/Config.js');
  assert.ok(PESTANAS.Paises.indexOf('url_acuerdo_datos') !== -1);
});
