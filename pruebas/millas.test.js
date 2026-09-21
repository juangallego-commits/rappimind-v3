'use strict';

/**
 * La mecánica de millas, en las dos verticales.
 *
 * Los dos casos dorados (MI01 y MI02) protegen carácter por carácter las dos
 * campañas publicadas, pero solo cubren una combinación de respuestas cada uno.
 * Aquí se recorren todas las combinaciones de la mecánica en los dos tipos,
 * porque lo que se quiere probar es justamente que la mecánica es una sola: si
 * un cambio solo cuadra en una vertical, esta prueba lo dice.
 *
 * Genera el documento de verdad, no llama a la función suelta. Una frase mal
 * pegada está bien formada y mal escrita, y eso solo se ve en el texto final.
 */

const test = require('node:test');
const assert = require('node:assert');

const { rutaDesdeRaiz, leerJson } = require('../scripts/lib/archivos');
const { cargarModelos } = require('../scripts/lib/modelos');
const { generarTexto } = require('../src/core/generar.js');
const { textoPlano } = require('../src/core/texto.js');
const { validarMillas } = require('../src/core/validaciones.js');
const { ESQUEMAS } = require('../src/core/esquemas.js');
const { FILTRO_DE_TRAVEL } = require('../src/core/ayuda.js');
const { solicitud } = require('./dobles/solicitudes.js');

const { paises } = leerJson(rutaDesdeRaiz('data', 'paises.json'));
const modelos = cargarModelos();
const CO = paises.filter((p) => p.codigo === 'CO')[0];
const FECHA = '2026-09-16';

const TIPOS = ['millas', 'millas_travel'];

/** Lo mínimo que hay que responder para que la mecánica quede completa. */
function base(extra) {
  return Object.assign({
    programaLealtad: 'LifeMiles',
    vinculacionPrograma: 'afiliado',
    formaMillas: 'por_orden',
    millasPorOrden: 400,
    acumulableMillas: 'si',
    limitePorUsuario: 4,
    sinLimitePorUsuario: false,
    acreditacionMillas: 'programa',
  }, extra || {});
}

function documento(tipo, respuestas) {
  const salida = generarTexto(solicitud('CO', tipo, base(respuestas)), CO, modelos, {
    fechaReferencia: FECHA,
    usuarioEnEquipo: true,
  });
  assert.ok(salida.valido, tipo + ' no generó: ' +
    salida.errores.map((e) => e.campo + ' ' + e.mensaje).join(' | '));
  return textoPlano(salida.texto);
}

test('los dos tipos de millas existen y comparten la misma mecánica', () => {
  for (const tipo of TIPOS) {
    assert.ok(ESQUEMAS[tipo], 'falta el tipo ' + tipo);
    assert.ok(ESQUEMAS[tipo].esDeMillas, tipo + ' no está marcado como de millas');
  }
  assert.ok(ESQUEMAS.millas_travel.esDeTravel, 'millas_travel tiene que ser de Rappi Travel');
  assert.ok(!ESQUEMAS.millas.esDeTravel, 'millas tiene que ser de la Plataforma Rappi');

  // Los campos propios de la mecánica son exactamente los mismos en las dos.
  const propios = ['programaLealtad', 'vinculacionPrograma', 'formaMillas', 'millasPorOrden',
    'millasPorFraccion', 'valorFraccion', 'fraccionEsDolar', 'acumulableMillas',
    'limitePorUsuario', 'sinLimitePorUsuario', 'topeMillasUsuario', 'bolsaMillas',
    'maxOrdenes', 'acreditacionMillas', 'diasAcreditacion'];
  for (const tipo of TIPOS) {
    const ids = ESQUEMAS[tipo].campos.map((campo) => campo.id);
    for (const propio of propios) {
      assert.ok(ids.indexOf(propio) !== -1, tipo + ' no pregunta ' + propio);
    }
  }
});

test('cada combinación de la mecánica genera documento en las dos verticales', () => {
  const formas = [
    { formaMillas: 'por_orden', millasPorOrden: 400 },
    { formaMillas: 'por_fraccion', millasPorFraccion: 6, valorFraccion: 3500, fraccionEsDolar: true },
    { formaMillas: 'por_fraccion', millasPorFraccion: 1, valorFraccion: 1000, fraccionEsDolar: false },
  ];
  const vinculaciones = ['afiliado', 'enrolado_preferido'];
  const acreditaciones = [
    { acreditacionMillas: 'programa' },
    { acreditacionMillas: 'dias_calendario', diasAcreditacion: 5 },
    { acreditacionMillas: 'dias_calendario', diasAcreditacion: 1 },
  ];
  const acumulables = ['si', 'no'];

  let cuantos = 0;
  for (const tipo of TIPOS) {
    for (const forma of formas) {
      for (const vinculacion of vinculaciones) {
        for (const acreditacion of acreditaciones) {
          for (const acumulable of acumulables) {
            const texto = documento(tipo, Object.assign({}, forma, acreditacion, {
              vinculacionPrograma: vinculacion,
              acumulableMillas: acumulable,
            }));
            assert.ok(texto.indexOf('LifeMiles') !== -1, tipo + ' perdió el programa de lealtad');
            assert.ok(texto.indexOf('Millas') !== -1, tipo + ' perdió las Millas');
            cuantos += 1;
          }
        }
      }
    }
  }
  assert.strictEqual(cuantos, 2 * 3 * 2 * 3 * 2);
});

test('un día de acreditación y una milla no salen en plural', () => {
  for (const tipo of TIPOS) {
    const texto = documento(tipo, {
      acreditacionMillas: 'dias_calendario',
      diasAcreditacion: 1,
      formaMillas: 'por_orden',
      millasPorOrden: 1,
      limitePorUsuario: 1,
    });
    assert.ok(texto.indexOf('un (1) día calendario') !== -1, tipo + ': ' + texto);
    assert.strictEqual(texto.indexOf('un (1) días calendario'), -1, tipo + ' dejó el plural');
    assert.ok(texto.indexOf('una (1) Milla del programa') !== -1, tipo + ': falta la milla en singular');
    assert.ok(texto.indexOf('una (1) orden válida') !== -1, tipo + ': falta la orden en singular');
  }
});

test('las Millas van en femenino, que es como las escriben las dos piezas', () => {
  const texto = documento('millas', { formaMillas: 'por_orden', millasPorOrden: 400, bolsaMillas: 148000, maxOrdenes: 370 });
  assert.ok(texto.indexOf('cuatrocientas (400) Millas') !== -1, texto);
  assert.ok(texto.indexOf('ciento cuarenta y ocho mil (148.000) Millas') !== -1, texto);
  assert.ok(texto.indexOf('trescientas setenta (370) órdenes válidas') !== -1, texto);
  assert.strictEqual(texto.indexOf('cuatrocientos (400)'), -1, 'las Millas salieron en masculino');
});

test('cada vertical nombra su entidad, y nunca la de la otra', () => {
  const rappi = documento('millas', {});
  assert.ok(rappi.indexOf('Rappi S.A.S.') !== -1, 'la vertical de delivery no nombra a Rappi S.A.S.');
  assert.strictEqual(rappi.indexOf('Travel Moustache'), -1, 'se coló la agencia de viajes en un documento de delivery');
  assert.strictEqual(rappi.indexOf('Sistemas Rappi Travel'), -1, 'se colaron los Sistemas Rappi Travel');

  const travel = documento('millas_travel', {});
  assert.ok(travel.indexOf('Travel Moustache S.A.S.') !== -1, 'la vertical de viajes no nombra a Travel Moustache');
  assert.ok(travel.indexOf('Registro Nacional de Turismo') !== -1, 'falta el RNT');
});

test('en las dos verticales el Organizador es el programa, y Rappi no responde', () => {
  // Regla 1 de CLAUDE.md, que en millas es lo que más pesa: quien acredita es
  // el programa, no Rappi, y las dos piezas publicadas lo dicen expresamente.
  for (const tipo of TIPOS) {
    const texto = documento(tipo, {});
    assert.ok(texto.indexOf('El Organizador asume total responsabilidad') !== -1,
      tipo + ' no dice que el Organizador responde');
    assert.ok(texto.indexOf('mantendrá indemne') !== -1, tipo + ' no tiene la indemnidad');
    assert.ok(/no es el organizador de la Campaña|no organiza/.test(texto),
      tipo + ' no dice que Rappi no organiza');
  }
});

test('el filtro de Travel ya no manda a Legal una campaña de millas', () => {
  const beneficio = FILTRO_DE_TRAVEL.filter((p) => p.id === 'beneficioDeTercero')[0];
  assert.ok(beneficio, 'desapareció la pregunta del beneficio de un tercero');
  assert.ok(beneficio.texto.indexOf('millas de un programa de lealtad') !== -1,
    'la pregunta no reconoce las millas como caso cubierto: ' + beneficio.texto);
  assert.strictEqual(beneficio.texto.indexOf('cupones, millas, eSIM'), -1,
    'volvió la lista vieja, que mandaba a Legal toda campaña de millas');
});

test('la bolsa y su equivalencia en órdenes tienen que cuadrar', () => {
  // La pieza de Turbo publica los dos números como dos caras del mismo: 148.000
  // Millas equivalentes a 370 órdenes de 400. Si no cuadran, el documento dice
  // las dos cosas a la vez y el motor no lo ve, porque las dos frases están bien
  // formadas.
  const cuadra = { formaMillas: 'por_orden', millasPorOrden: 400, bolsaMillas: 148000, maxOrdenes: 370 };
  assert.deepStrictEqual(validarMillas(cuadra), []);

  const noCuadra = Object.assign({}, cuadra, { maxOrdenes: 300 });
  const errores = validarMillas(noCuadra);
  assert.strictEqual(errores.length, 1, JSON.stringify(errores));
  assert.strictEqual(errores[0].campo, 'maxOrdenes');
  assert.ok(errores[0].mensaje.indexOf('120000') !== -1, errores[0].mensaje);
});

test('una bolsa que no alcanza ni para una orden se frena', () => {
  const errores = validarMillas({ formaMillas: 'por_orden', millasPorOrden: 400, bolsaMillas: 200 });
  assert.strictEqual(errores.length, 1, JSON.stringify(errores));
  assert.strictEqual(errores[0].campo, 'bolsaMillas');
});

test('el tope por persona no puede pasarse de la bolsa ni quedarse corto', () => {
  const pasado = validarMillas({ formaMillas: 'por_orden', millasPorOrden: 400, bolsaMillas: 4000, topeMillasUsuario: 5000 });
  assert.strictEqual(pasado.length, 1, JSON.stringify(pasado));
  assert.strictEqual(pasado[0].campo, 'topeMillasUsuario');

  const corto = validarMillas({ formaMillas: 'por_orden', millasPorOrden: 400, topeMillasUsuario: 300, limitePorUsuario: 2 });
  assert.strictEqual(corto.length, 1, JSON.stringify(corto));
  assert.strictEqual(corto[0].campo, 'topeMillasUsuario');
});

test('el nombre de la campaña dice las millas solo cuando el número significa eso', () => {
  const { nombreDeCampana } = require('../src/core/nombres.js');
  const porOrden = nombreDeCampana(
    { tienda: 'Turbo', formaMillas: 'por_orden', millasPorOrden: 400, fechaInicio: '2026-05-18' },
    ESQUEMAS.millas
  );
  assert.strictEqual(porOrden, 'Turbo · 400 Millas · 18 may 2026');

  // Por fracción, "6 Millas" suelto prometería algo distinto a lo que dice la
  // cláusula, que son 6 millas por cada fracción gastada.
  const porFraccion = nombreDeCampana(
    { marcaAliado: 'Civitatis', formaMillas: 'por_fraccion', millasPorFraccion: 6, valorFraccion: 3500, fechaInicio: '2026-09-23' },
    ESQUEMAS.millas_travel
  );
  assert.strictEqual(porFraccion, 'Civitatis · Millas Travel · 23 sep 2026');
});
