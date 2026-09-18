'use strict';

/**
 * Concordancia de número: qué dice el documento cuando la respuesta es 1.
 *
 * Ninguno de los treinta y dos casos dorados responde 1 a la vigencia de los
 * Créditos, a las noches mínimas, a las unidades ni a los días de carga, así
 * que estas frases salían en plural con el número uno y nadie lo veía:
 *
 *   "tendrán una vigencia de un (1) días calendario contados a partir de su carga"
 *   "la reserva de hotel debe ser de una (1) noches o más"
 *   "hasta agotar las una (1) unidades con descuento"
 *
 * La red de seguridad del motor tampoco las ve, porque no hay ningún signo
 * roto: la frase está bien formada y mal escrita. Solo se ve generando el
 * documento y leyéndolo.
 *
 * Estas pruebas generan el documento de verdad, no llaman a la función suelta.
 */

const test = require('node:test');
const assert = require('node:assert');

const { rutaDesdeRaiz, leerJson } = require('../scripts/lib/archivos');
const { cargarModelos } = require('../scripts/lib/modelos');
const { generarTexto } = require('../src/core/generar.js');
const { textoPlano, terminoDeDias } = require('../src/core/texto.js');
const { ESQUEMAS, camposVisibles } = require('../src/core/esquemas.js');
const { solicitud } = require('./dobles/solicitudes.js');

const { paises } = leerJson(rutaDesdeRaiz('data', 'paises.json'));
const modelos = cargarModelos();
const FECHA = '2026-09-16';

function documento(codigoPais, tipo, respuestas) {
  const pais = paises.find((p) => p.codigo === codigoPais);
  const salida = generarTexto(solicitud(codigoPais, tipo, respuestas), pais, modelos, {
    fechaReferencia: FECHA,
    usuarioEnEquipo: true,
  });
  assert.ok(salida.valido, 'no generó: ' + salida.errores.map((e) => e.campo + ' ' + e.mensaje).join(' | '));
  return textoPlano(salida.texto);
}

test('el término de días del país se pone en singular cuando es uno', () => {
  assert.strictEqual(terminoDeDias({ termino_dias: 'días calendario' }, 1), 'día calendario');
  assert.strictEqual(terminoDeDias({ termino_dias: 'días naturales' }, 1), 'día natural');
  assert.strictEqual(terminoDeDias({ termino_dias: 'días corridos' }, 1), 'día corrido');
  // Brasil escribe "dias" sin tilde, y la regla es la misma.
  assert.strictEqual(terminoDeDias({ termino_dias: 'dias corridos' }, 1), 'dia corrido');

  // Con cualquier otra cantidad no se toca ni una letra.
  assert.strictEqual(terminoDeDias({ termino_dias: 'días calendario' }, 2), 'días calendario');
  assert.strictEqual(terminoDeDias({ termino_dias: 'días calendario' }, 30), 'días calendario');
  assert.strictEqual(terminoDeDias({ termino_dias: '' }, 1), '');
  assert.strictEqual(terminoDeDias(null, 1), '');
});

test('un día de vigencia de los Créditos no sale en plural, en ningún país', () => {
  const esperado = {
    CO: 'un (1) día calendario contado a partir de su carga',
    MX: 'un (1) día natural contado a partir de su carga',
    AR: 'un (1) día corrido contado a partir de su carga',
  };
  Object.keys(esperado).forEach((codigo) => {
    const texto = documento(codigo, 'cashback', { vigencia: 'dias', diasVigencia: 1 });
    assert.ok(texto.includes('tendrán una vigencia de ' + esperado[codigo]),
      codigo + ': no encontré "' + esperado[codigo] + '"');
    assert.ok(!/\(1\) días/.test(texto), codigo + ': quedó "(1) días" en el documento');
  });
});

test('con más de un día, la frase de la vigencia queda exactamente igual que antes', () => {
  const texto = documento('CO', 'cashback', { vigencia: 'dias', diasVigencia: 30 });
  assert.ok(texto.includes('tendrán una vigencia de treinta (30) días calendario contados a partir de su carga'));
});

test('un día sin comprar no sale como "durante los un (1) días calendario"', () => {
  const texto = documento('CO', 'cashback', { segmento: 'reactivados', diasSinCompra: 1 });
  assert.ok(texto.includes('durante un (1) día calendario anterior al inicio de la Campaña'), texto.slice(0, 0) || 'falta la frase en singular');
  assert.ok(!texto.includes('durante los un (1)'));

  const varios = documento('CO', 'cashback', { segmento: 'reactivados', diasSinCompra: 60 });
  assert.ok(varios.includes('durante los sesenta (60) días calendario anteriores al inicio de la Campaña'));
});

test('Rappi Travel: una noche, un día de anticipación y un día de alquiler', () => {
  const noche = documento('CO', 'cashback_travel', { nochesMinimas: 1, categorias: ['Hoteles'] });
  assert.ok(noche.includes('La reserva de hotel debe ser de una (1) noche o más.'));

  const anticipacion = documento('CO', 'cashback_travel', { anticipacionDias: 1, categorias: ['Vuelos'] });
  assert.ok(anticipacion.includes('con al menos un (1) día calendario de anticipación'));

  // El mínimo y el máximo de alquiler pueden ser el mismo número: la validación
  // solo impide que el mínimo sea mayor. Antes salía "entre un (1) y un (1) días".
  const alquiler = documento('CO', 'cashback_travel', {
    categorias: ['Autos'], diasAlquilerMinimo: 1, diasAlquilerMaximo: 1,
  });
  assert.ok(alquiler.includes('El alquiler de auto debe ser de un (1) día.'));
  assert.ok(!alquiler.includes('entre un (1) y un (1)'));

  const rango = documento('CO', 'cashback_travel', {
    categorias: ['Autos'], diasAlquilerMinimo: 2, diasAlquilerMaximo: 7,
  });
  assert.ok(rango.includes('El alquiler de auto debe ser de entre dos (2) y siete (7) días.'));
});

test('Rappi Travel: un día para cargar los Créditos', () => {
  const uno = documento('CO', 'cashback_travel', { carga: 'dias_calendario', diasCarga: 1 });
  assert.ok(uno.includes('dentro de un (1) día calendario siguiente a la finalización de la Campaña'));

  const varios = documento('CO', 'cashback_travel', { carga: 'dias_calendario', diasCarga: 5 });
  assert.ok(varios.includes('dentro de los cinco (5) días calendario siguientes a la finalización de la Campaña'));
});

test('Descuento Travel: una sola unidad con descuento', () => {
  const una = documento('CO', 'descuento_travel', { sinUnidades: false, unidades: 1 });
  assert.ok(una.includes('hasta agotar la única unidad con descuento'));
  assert.ok(una.includes('La Campaña cuenta con una (1) unidad con descuento. Una vez agotada,'));
  assert.ok(!una.includes('una (1) unidades'));

  const varias = documento('CO', 'descuento_travel', { sinUnidades: false, unidades: 100 });
  assert.ok(varias.includes('hasta agotar las cien (100) unidades con descuento'));
  assert.ok(varias.includes('La Campaña cuenta con cien (100) unidades con descuento. Una vez agotadas,'));
});

test('Descuento Travel: el descuento máximo que aplica a un solo producto', () => {
  const uno = documento('CO', 'descuento_travel', {
    formaDescuento: 'variable', porcentajeMin: 5, porcentajeMax: 40, productosConMaximo: 1,
  });
  // "un (1)" solo va delante de un sustantivo; aquí la cifra va sola.
  assert.ok(uno.includes('aplica a uno (1) de los Productos Participantes.'));

  const varios = documento('CO', 'descuento_travel', {
    formaDescuento: 'variable', porcentajeMin: 5, porcentajeMax: 40, productosConMaximo: 3,
  });
  assert.ok(varios.includes('aplica a tres (3) de los Productos Participantes.'));
});

/*
 * El barrido: responde 1 a cada pregunta numérica de cada tipo en cada país y
 * revisa que no quede ninguna cifra 1 pegada a un sustantivo en plural.
 *
 * Es la prueba que habría cazado los ocho defectos de arriba sin que nadie
 * tuviera que sospechar de un campo en concreto.
 */
const PALABRAS_SINGULARES_CON_S = ['mes', 'país', 'análisis', 'más', 'menos', 'después',
  'través', 'interés', 'pues', 'tres', 'dos', 'seis', 'gratis', 'lunes', 'martes',
  'miércoles', 'jueves', 'viernes'];

/*
 * La única excepción conocida, y está en el texto de Legal, no en el motor:
 * modelos/carrera_compras.md dice "dentro de los {{PLAZO_CONFIRMACION}}
 * siguientes", con el artículo y el adjetivo en plural dentro de la cláusula.
 * Con un plazo de un día hábil sale "dentro de los un (1) día hábil
 * siguientes". Arreglarlo es cambiar la cláusula, así que está en
 * docs/PARA_DECIDIR.md y lo decide Juan.
 */
const PENDIENTE_DE_JUAN = /dentro de los un \(1\) día hábil siguientes/;

test('ninguna pregunta numérica deja una cifra 1 pegada a un plural', () => {
  const rotas = [];
  paises.forEach((pais) => {
    (pais.modelos || []).forEach((tipo) => {
      const esquema = ESQUEMAS[tipo];
      if (!esquema) return;
      esquema.campos.filter((c) => c.tipo === 'numero').forEach((campo) => {
        const respuestas = {};
        respuestas[campo.id] = 1;
        if (campo.id === 'presupuesto') respuestas.tope = 1;
        const entrada = solicitud(pais.codigo, tipo, respuestas);
        if (!camposVisibles(tipo, entrada).some((c) => c.id === campo.id)) return;
        const salida = generarTexto(entrada, pais, modelos, { fechaReferencia: FECHA, usuarioEnEquipo: true });
        if (!salida.valido) return; // la validación ya lo frena: no hay documento que revisar
        const plano = textoPlano(salida.texto).replace(PENDIENTE_DE_JUAN, '');
        const patron = /\b(un|una) \(1\) ([a-záéíóúñ]+s)\b/g;
        let encontrado = patron.exec(plano);
        while (encontrado !== null) {
          if (PALABRAS_SINGULARES_CON_S.indexOf(encontrado[2]) === -1) {
            rotas.push(pais.codigo + ' ' + tipo + ' ' + campo.id + '=1: "' + encontrado[0] + '"');
          }
          encontrado = patron.exec(plano);
        }
        if (/\b(los|las) (un|una) \(1\)/.test(plano)) {
          rotas.push(pais.codigo + ' ' + tipo + ' ' + campo.id + '=1: artículo en plural con la cifra 1');
        }
      });
    });
  });
  assert.deepStrictEqual(rotas, [], 'frases en plural con el número uno:\n' + rotas.join('\n'));
});
