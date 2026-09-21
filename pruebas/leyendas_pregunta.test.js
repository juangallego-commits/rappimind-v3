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
const { categoriaProhibida, categoriaQueBloquea } = require('../src/core/leyendas.js');
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

test('la categoría es la única pregunta del paso de la pieza', () => {
  // Eran tres. El registro sanitario y la notificación ante el INVIMA se fueron
  // el 20 de septiembre de 2026 con las cuatro categorías que los pedían: en
  // Colombia ya no se hacen campañas sobre medicamentos ni fitoterapéuticos.
  assert.deepStrictEqual(camposDePieza({ pais: 'CO', tipo: 'cashback', categoriaProducto: 'licores' }),
    ['categoriaProducto']);
  assert.strictEqual(PREGUNTAS.registroSanitario, undefined);
  assert.strictEqual(PREGUNTAS.notificacionInvima, undefined);
});

test('las siete categorías de medicamentos y nicotina ya no se ofrecen en Colombia', () => {
  const delCatalogo = categoriasDeProducto('CO').map((c) => c.valor);
  for (const categoria of ['cigarrillos', 'vapeadores', 'vapeadores_pmi', 'medicamento',
    'medicamentos_varios', 'fitoterapeutico_pfm', 'fitoterapeutico_pft']) {
    assert.strictEqual(delCatalogo.indexOf(categoria), -1,
      categoria + ' volvió a la lista de Colombia');
  }

  // En su lugar va una sola opción, la que no deja seguir.
  assert.strictEqual(delCatalogo[delCatalogo.length - 1], 'medicamentos_y_nicotina');
  assert.strictEqual(categoriaQueBloquea('CO'), 'medicamentos_y_nicotina');

  // Y en los demás países no cambia nada: lo deciden sus abogados en la prueba.
  assert.strictEqual(categoriaQueBloquea('MX'), '');
  assert.ok(categoriasDeProducto('MX').map((c) => c.valor).indexOf('medicamentos') !== -1);
});

test('elegir esa categoría no deja generar, y dice por qué', () => {
  const entrada = campanaBase({ categoriaProducto: 'medicamentos_y_nicotina' });
  const revision = validarSolicitud(entrada, CO, CONTEXTO);
  assert.strictEqual(revision.valido, false);
  assert.strictEqual(revision.errores[0].campo, 'categoriaProducto');
  assert.strictEqual(revision.errores[0].mensaje, PREGUNTAS.categoriaProducto.errores.prohibida);
  assert.ok(revision.errores[0].mensaje.indexOf('#tyc-rappi') !== -1);

  // En México la misma respuesta no existe, así que no bloquea nada.
  assert.strictEqual(categoriaProhibida('MX', 'medicamentos_y_nicotina'), false);
  assert.strictEqual(categoriaProhibida('CO', 'licores'), false);
});

test('la advertencia de la pantalla de tipos dice lo mismo que el bloqueo', () => {
  // Las dos salen de preguntas.js para que no se separen: si una cambia y la
  // otra no, el comercial lee dos reglas distintas.
  const aviso = PREGUNTAS.categoriaProducto.avisoDeTipos;
  for (const palabra of ['medicamentos', 'fitoterapéuticos', 'cigarrillos', 'tabaco calentado',
    'vapeadores', 'nicotina']) {
    assert.ok(aviso.indexOf(palabra) !== -1, 'el aviso no nombra ' + palabra);
    assert.ok(PREGUNTAS.categoriaProducto.errores.prohibida.indexOf(palabra) !== -1,
      'el bloqueo no nombra ' + palabra);
  }

  const fs = require('node:fs');
  const path = require('node:path');
  const pasos = fs.readFileSync(path.join(__dirname, '..', 'src', 'client', 'js', '62-pasos.js'), 'utf8');
  assert.ok(pasos.indexOf('avisoDeCategoriasProhibidas') !== -1,
    'la pantalla de tipos ya no muestra la advertencia');
});

test('la pregunta se ve opcional, porque el T&C no la necesita', () => {
  // Regla de la skill: lo opcional se ve opcional. Si pareciera obligatoria, un
  // comercial que no sabe la categoría inventaría una.
  assert.strictEqual(PREGUNTAS.categoriaProducto.opcional, true);
});

test('"Ninguna" viene por defecto, pero no cuenta como respondida', () => {
  assert.strictEqual(PREGUNTAS.categoriaProducto.porDefecto, 'ninguna');
});

test('ninguna pregunta de la pieza bloquea el documento', () => {
  // Es la regla que la separa de todo lo demás: el T&C no usa ni la categoría
  // ni el registro sanitario, así que quien solo quiere su documento lo tiene.
  for (const entrada of [
    campanaBase({ categoriaProducto: '' }),
    campanaBase({ categoriaProducto: 'licores' }),
    campanaBase({ categoriaProducto: 'suplementos' }),
  ]) {
    assert.deepStrictEqual(validarSolicitud(entrada, CO, CONTEXTO).errores, [],
      JSON.stringify(entrada.categoriaProducto));
    assert.strictEqual(generarTexto(entrada, CO, MODELOS, CONTEXTO).valido, true);
  }
});

test('las opciones que ve el comercial traen un adelanto de lo que se imprime', () => {
  // Decían todas lo mismo debajo y no se podía elegir con criterio. La que no
  // deja seguir no imprime nada, así que no tiene adelanto que mostrar.
  const opciones = categoriasDeProducto('CO').filter((o) => !o.bloquea);
  const adelantos = opciones.map((o) => o.adelanto);
  assert.strictEqual(new Set(adelantos).size, adelantos.length, 'hay dos adelantos iguales');
  for (const opcion of opciones) {
    assert.ok(opcion.adelanto.length > 20, opcion.valor + ': adelanto demasiado corto');
    assert.strictEqual(/\{\{|\[\[/.test(opcion.adelanto), false, opcion.valor + ': ' + opcion.adelanto);
  }
  assert.ok(opciones.filter((o) => o.valor === 'licores')[0].adelanto
    .indexOf('El exceso de alcohol es perjudicial para la salud') === 0);
});

test('las opciones se ordenan por lo que se lee, no por el identificador', () => {
  // La que no deja seguir va al final, fuera del orden: no es un producto más.
  const opciones = categoriasDeProducto('CO');
  const etiquetas = opciones.filter((o) => !o.bloquea).map((o) => o.etiqueta);
  const ordenadas = etiquetas.slice().sort((a, b) => a.localeCompare(b, 'es'));
  assert.deepStrictEqual(etiquetas, ordenadas);
  assert.strictEqual(opciones[opciones.length - 1].bloquea, true);
});

test('la categoría de un país no se cuela en otro', () => {
  assert.strictEqual(categoriasDeProducto('MX').filter((o) => o.valor === 'alimentos').length, 1);
  assert.strictEqual(categoriasDeProducto('CO').filter((o) => o.valor === 'alimentos').length, 0);
  assert.deepStrictEqual(categoriasDeProducto('BR'), []);
});

test('la pregunta está traducida al portugués', () => {
  // Un KAM de Brasil no la ve hoy, pero quien deje la interfaz en portugués y
  // arme una campaña de Colombia sí. La regla es que no se mezclen idiomas.
  const { PREGUNTAS_PT } = require('../src/core/preguntas_pt.js');
  assert.ok(PREGUNTAS_PT.categoriaProducto);
  assert.ok(PREGUNTAS_PT.categoriaProducto.pregunta && PREGUNTAS_PT.categoriaProducto.ayuda &&
    PREGUNTAS_PT.categoriaProducto.porQue);
});

test('el documento de una campaña con categoría sale igual que sin ella', () => {
  // La prueba de que la pregunta no toca el T&C: mismo texto, letra por letra.
  const sin = generarTexto(campanaBase(), CO, MODELOS, CONTEXTO);
  const con = generarTexto(
    campanaBase({ categoriaProducto: 'licores' }), CO, MODELOS, CONTEXTO);
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
