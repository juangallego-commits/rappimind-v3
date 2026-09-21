'use strict';

/**
 * La pregunta de la categoría del producto.
 *
 * Es la única pregunta nueva que le cuesta algo al comercial, y solo sirve para
 * la leyenda de la pieza publicitaria: no cambia una coma del T&C. De ahí las
 * dos reglas que vigila este archivo. Que aparezca solo donde hay algo que
 * imprimir, y que no bloquee nunca el documento.
 */

const test = require('node:test');
const assert = require('node:assert');

const { usarCatalogo } = require('../src/core/leyendas.js');
const { cargarLeyendas, cargarModelos } = require('../scripts/lib/modelos');

// El catálogo, igual que en Apps Script y en el navegador. Va antes de cargar
// los esquemas, porque la visibilidad de la pregunta sale de él.
usarCatalogo(cargarLeyendas());

const { camposVisibles } = require('../src/core/esquemas.js');
const {
  categoriaPideRegistro,
  categoriaPideInvima,
  CATEGORIAS_CON_REGISTRO,
} = require('../src/core/leyendas.js');
const { PREGUNTAS, PASOS } = require('../src/core/preguntas.js');
const { validarSolicitud } = require('../src/core/validaciones.js');
const { generarTexto, generarLeyendasDeLaCampana } = require('../src/core/generar.js');
const { categoriasDeProducto } = require('../src/core/leyendas.js');

const PAISES = require('../data/paises.json').paises;
const CO = PAISES.filter((p) => p.codigo === 'CO')[0];
const MX = PAISES.filter((p) => p.codigo === 'MX')[0];
const MODELOS = cargarModelos();
const CONTEXTO = { fechaReferencia: '2026-09-16', usuarioEnEquipo: true };

function campanaBase(cambios) {
  return Object.assign({
    pais: 'CO', negocio: 'rappi', tipo: 'cashback', tienda: 'El Corral',
    alcance: 'Nacional', ciudades: '', segmento: 'todos', metodoPago: 'todos',
    compraMinima: null, declaracion: true,
    fechaInicio: '2026-09-20', horaInicio: '00:00', fechaFin: '2026-09-21', horaFin: '23:59',
    organizadorRazonSocial: 'El Corral S.A.S.', organizadorId: '900111222-1',
    porcentaje: 20, tope: 25000, presupuesto: 15000000, maxPedidos: 1, sinLimite: false,
    carga: 'dia_siguiente', vigencia: 'dias', diasVigencia: 7,
    redencion: 'tienda', tiendaTurbo: 'sin_turbo', categoriaProducto: 'ninguna',
  }, cambios || {});
}

const camposDePieza = (entrada) =>
  camposVisibles(entrada.tipo, entrada).filter((c) => c.paso === 'pieza').map((c) => c.id);

test('el paso de la pieza existe y va justo antes de revisar', () => {
  const ids = PASOS.map((p) => p.id);
  assert.strictEqual(ids[ids.indexOf('pieza') + 1], 'confirmacion');
});

test('la pregunta solo aparece donde hay una leyenda que darle', () => {
  // Hacen falta las dos cosas: una leyenda de campaña donde pegar el
  // complemento, y complementos de categoría que ofrecer.
  //
  // Desde el 20 de septiembre de 2026 (punto C4) los ocho países en español
  // tienen leyenda de campaña del cashback, así que la pregunta ya aparece en
  // los seis que además tienen categorías, y no solo en Colombia.
  for (const codigo of ['CO', 'MX', 'PE', 'AR', 'CL', 'EC']) {
    assert.deepStrictEqual(camposDePieza({ pais: codigo, tipo: 'cashback' }), ['categoriaProducto'],
      codigo + ' no ofrece la pregunta de la categoría');
  }

  // Uruguay y Costa Rica tienen leyenda de campaña pero ninguna advertencia de
  // categoría en el catálogo: preguntarlo sería pedir un dato que no se usa.
  for (const codigo of ['UY', 'CR']) {
    assert.deepStrictEqual(camposDePieza({ pais: codigo, tipo: 'cashback' }), [],
      codigo + ' pregunta la categoría sin tener ninguna que ofrecer');
  }

  // Brasil no: sus leyendas se escriben en portugués sobre sus propios modelos.
  assert.deepStrictEqual(camposDePieza({ pais: 'BR', tipo: 'promocao_br' }), []);
});

test('las dos condicionales solo salen con su categoría', () => {
  assert.deepStrictEqual(camposDePieza({ pais: 'CO', tipo: 'cashback', categoriaProducto: 'licores' }),
    ['categoriaProducto']);
  assert.deepStrictEqual(camposDePieza({ pais: 'CO', tipo: 'cashback', categoriaProducto: 'medicamento' }),
    ['categoriaProducto', 'registroSanitario', 'notificacionInvima']);
  assert.deepStrictEqual(camposDePieza({ pais: 'CO', tipo: 'cashback', categoriaProducto: 'medicamentos_varios' }),
    ['categoriaProducto', 'registroSanitario', 'notificacionInvima']);
  // Los fitoterapéuticos llevan registro pero no notificación ante el INVIMA.
  assert.deepStrictEqual(camposDePieza({ pais: 'CO', tipo: 'cashback', categoriaProducto: 'fitoterapeutico_pfm' }),
    ['categoriaProducto', 'registroSanitario']);
});

test('cada categoría que pide registro existe en el catálogo', () => {
  // Si alguien renombra una categoría en modelos/leyendas/ y no toca esta
  // lista, la pregunta del registro sanitario deja de aparecer y la pieza de un
  // medicamento sale sin su número, sin que nada se queje.
  const delCatalogo = categoriasDeProducto('CO').map((c) => c.valor);
  for (const categoria of CATEGORIAS_CON_REGISTRO) {
    assert.ok(delCatalogo.indexOf(categoria) !== -1,
      categoria + ' pide registro sanitario pero no existe en el catálogo de Colombia');
  }
  assert.strictEqual(categoriaPideRegistro('licores'), false);
  assert.strictEqual(categoriaPideInvima('fitoterapeutico_pfm'), false);
  assert.strictEqual(categoriaPideInvima('medicamento'), true);
});

test('la pregunta se ve opcional, porque el T&C no la necesita', () => {
  // Regla de la skill: lo opcional se ve opcional. Si pareciera obligatoria, un
  // comercial que no sabe la categoría inventaría una.
  assert.strictEqual(PREGUNTAS.categoriaProducto.opcional, true);
  assert.strictEqual(PREGUNTAS.registroSanitario.opcional, true);
  assert.strictEqual(PREGUNTAS.notificacionInvima.opcional, true);
});

test('"Ninguna" viene por defecto, pero no cuenta como respondida', () => {
  assert.strictEqual(PREGUNTAS.categoriaProducto.porDefecto, 'ninguna');
});

test('ninguna pregunta de la pieza bloquea el documento', () => {
  // Es la regla que la separa de todo lo demás: el T&C no usa ni la categoría
  // ni el registro sanitario, así que quien solo quiere su documento lo tiene.
  for (const entrada of [
    campanaBase({ categoriaProducto: '' }),
    campanaBase({ categoriaProducto: 'medicamento' }),
    campanaBase({ categoriaProducto: 'medicamento', registroSanitario: '' }),
  ]) {
    assert.deepStrictEqual(validarSolicitud(entrada, CO, CONTEXTO).errores, [],
      JSON.stringify(entrada.categoriaProducto));
    assert.strictEqual(generarTexto(entrada, CO, MODELOS, CONTEXTO).valido, true);
  }
});

test('sin registro sanitario no hay leyenda, y se dice por qué', () => {
  // Al revés que el documento: la pieza de un medicamento no se puede publicar
  // sin el registro (Legal CO, diapositiva 10). La leyenda lo lleva en un
  // bloque opcional, así que sin este aviso desaparecería en silencio.
  const sinRegistro = generarLeyendasDeLaCampana(
    campanaBase({ categoriaProducto: 'medicamento' }), CO, cargarLeyendas(),
    { nombreCampana: 'Campaña de prueba' });
  assert.strictEqual(sinRegistro.hay, false);
  assert.ok(sinRegistro.faltantes.join(' ').indexOf('registro sanitario') !== -1,
    sinRegistro.faltantes.join(' | '));

  const conRegistro = generarLeyendasDeLaCampana(
    campanaBase({ categoriaProducto: 'medicamento', registroSanitario: 'INVIMA 2020M-0012345' }),
    CO, cargarLeyendas(), { nombreCampana: 'Campaña de prueba' });
  assert.strictEqual(conRegistro.hay, true);
  assert.deepStrictEqual(conRegistro.errores, [], conRegistro.errores.join(' | '));
  const letra = conRegistro.leyendas.filter((l) => l.formato === 'letra_pequena')[0].texto;
  assert.ok(letra.indexOf('Registro sanitario No. INVIMA 2020M-0012345.') !== -1, letra);
  // Sin número de notificación, esa frase no sale, y la leyenda no queda rota.
  assert.strictEqual(letra.indexOf('Notificación ante el INVIMA'), -1, letra);
});

test('con notificación del INVIMA la leyenda la incluye', () => {
  const r = generarLeyendasDeLaCampana(
    campanaBase({
      categoriaProducto: 'medicamento',
      registroSanitario: 'INVIMA 2020M-0012345',
      notificacionInvima: '20251234567',
    }), CO, cargarLeyendas(), { nombreCampana: 'Campaña de prueba' });
  const letra = r.leyendas.filter((l) => l.formato === 'letra_pequena')[0].texto;
  assert.ok(letra.indexOf('Notificación ante el INVIMA No. 20251234567.') !== -1, letra);
});

test('las opciones que ve el comercial traen un adelanto de lo que se imprime', () => {
  // Las diez decían lo mismo debajo y no se podía elegir con criterio.
  const opciones = categoriasDeProducto('CO');
  const adelantos = opciones.map((o) => o.adelanto);
  assert.strictEqual(new Set(adelantos).size, adelantos.length, 'hay dos adelantos iguales');
  for (const opcion of opciones) {
    assert.ok(opcion.adelanto.length > 20, opcion.valor + ': adelanto demasiado corto');
    assert.strictEqual(/\{\{|\[\[/.test(opcion.adelanto), false, opcion.valor + ': ' + opcion.adelanto);
  }
  assert.ok(categoriasDeProducto('CO').filter((o) => o.valor === 'licores')[0].adelanto
    .indexOf('El exceso de alcohol es perjudicial para la salud') === 0);
});

test('las opciones se ordenan por lo que se lee, no por el identificador', () => {
  const etiquetas = categoriasDeProducto('CO').map((o) => o.etiqueta);
  const ordenadas = etiquetas.slice().sort((a, b) => a.localeCompare(b, 'es'));
  assert.deepStrictEqual(etiquetas, ordenadas);
});

test('la categoría de un país no se cuela en otro', () => {
  assert.strictEqual(categoriasDeProducto('MX').filter((o) => o.valor === 'alimentos').length, 1);
  assert.strictEqual(categoriasDeProducto('CO').filter((o) => o.valor === 'alimentos').length, 0);
  assert.deepStrictEqual(categoriasDeProducto('BR'), []);
});

test('la pregunta y sus condicionales están traducidas al portugués', () => {
  // Un KAM de Brasil no las ve hoy, pero quien deje la interfaz en portugués y
  // arme una campaña de Colombia sí. La regla es que no se mezclen idiomas.
  const { PREGUNTAS_PT } = require('../src/core/preguntas_pt.js');
  for (const id of ['categoriaProducto', 'registroSanitario', 'notificacionInvima']) {
    assert.ok(PREGUNTAS_PT[id], id + ' no está traducida');
    assert.ok(PREGUNTAS_PT[id].pregunta && PREGUNTAS_PT[id].ayuda && PREGUNTAS_PT[id].porQue, id);
  }
});

test('el documento de una campaña con categoría sale igual que sin ella', () => {
  // La prueba de que la pregunta no toca el T&C: mismo texto, letra por letra.
  const sin = generarTexto(campanaBase(), CO, MODELOS, CONTEXTO);
  const con = generarTexto(
    campanaBase({ categoriaProducto: 'licores', registroSanitario: 'X' }), CO, MODELOS, CONTEXTO);
  assert.strictEqual(sin.texto, con.texto);
});

test('la categoría sí cambia la leyenda, que es para lo que se pregunta', () => {
  const sin = generarLeyendasDeLaCampana(campanaBase(), CO, cargarLeyendas(), { nombreCampana: 'Prueba' });
  const con = generarLeyendasDeLaCampana(
    campanaBase({ categoriaProducto: 'licores' }), CO, cargarLeyendas(), { nombreCampana: 'Prueba' });
  const texto = (r) => r.leyendas.filter((l) => l.formato === 'letra_pequena')[0].texto;
  assert.notStrictEqual(texto(sin), texto(con));
  assert.ok(texto(con).indexOf('Ley 124 de 1994') !== -1, texto(con));
});
