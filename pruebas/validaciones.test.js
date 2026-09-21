'use strict';

/** Reglas de acceso por país y validaciones cruzadas. */

const test = require('node:test');
const assert = require('node:assert');

const { rutaDesdeRaiz, leerJson } = require('../scripts/lib/archivos');
const { validarSolicitud, validarPais, validarTipo } = require('../src/core/validaciones.js');

const { paises } = leerJson(rutaDesdeRaiz('data', 'paises.json'));
const CO = paises.find((p) => p.codigo === 'CO');
const MX = paises.find((p) => p.codigo === 'MX');
const BR = paises.find((p) => p.codigo === 'BR');
// Desde el 20 de septiembre de 2026 no queda ningún país en piloto, así que el
// país en piloto de las pruebas se construye aquí, como ya se hacía con el
// bloqueado. La regla es de la validación, no de qué país esté en piloto hoy.
const EC = paises.find((p) => p.codigo === 'EC');
const EN_PILOTO = Object.assign({}, EC, { estado: 'piloto' });

/** Una solicitud de Cashback CO válida, para ir rompiéndola de a un campo. */
function solicitudBase(cambios) {
  const base = {
    pais: 'CO',
    negocio: 'rappi',
    tipo: 'cashback',
    tienda: 'Tienda de Prueba',
    alcance: 'Nacional',
    ciudades: '',
    segmento: 'todos',
    metodoPago: 'todos',
    declaracion: true,
    fechaInicio: '2026-09-20',
    horaInicio: '00:00',
    fechaFin: '2026-09-21',
    horaFin: '23:59',
    organizadorRazonSocial: 'Organizador de Prueba S.A.S.',
    organizadorId: '900111222-1',
    porcentaje: 20,
    tope: 20000,
    presupuesto: 1000000,
    maxPedidos: 1,
    sinLimite: false,
    carga: 'inmediata',
    vigencia: 'dias',
    diasVigencia: 30,
    redencion: 'tienda',
    tiendaTurbo: 'sin_turbo',
  };
  return Object.assign(base, cambios || {});
}

const CONTEXTO = { fechaReferencia: '2026-09-16', usuarioEnEquipo: false };

function campos(entrada, pais, contexto) {
  const resultado = validarSolicitud(entrada, pais || CO, contexto || CONTEXTO);
  return Array.from(new Set(resultado.errores.map((e) => e.campo))).sort();
}

test('la solicitud base es válida', () => {
  assert.deepStrictEqual(campos(solicitudBase()), []);
});

test('un país en piloto no aparece para quien no está en el equipo', () => {
  assert.ok(validarPais(EN_PILOTO, false));
  assert.strictEqual(validarPais(EN_PILOTO, true), null);
});

test('Ecuador y Costa Rica ya son activos: los ve cualquier comercial', () => {
  // Juan los sacó de piloto el 20 de septiembre, con el separador de miles
  // confirmado: Ecuador con coma, Costa Rica con punto.
  for (const codigo of ['EC', 'CR']) {
    const pais = paises.find((p) => p.codigo === codigo);
    assert.strictEqual(pais.estado, 'activo', codigo);
    assert.strictEqual(validarPais(pais, false), null, codigo);
  }
});

test('un país bloqueado no genera para nadie', () => {
  // Hoy ningún país está bloqueado, así que el bloqueado se construye aquí: la
  // regla es de la validación, no de qué país esté cerrado hoy.
  const bloqueado = Object.assign({}, BR, { estado: 'bloqueado' });
  assert.ok(validarPais(bloqueado, false));
  assert.ok(validarPais(bloqueado, true));
});

test('Brasil ya es activo: lo ve cualquier comercial', () => {
  // Juan lo sacó de piloto el 18 de septiembre, con la excepción de Rappi como
  // quien concede la promoción ya autorizada y anotada en CLAUDE.md.
  assert.strictEqual(BR.estado, 'activo');
  assert.strictEqual(validarPais(BR, false), null);
  assert.strictEqual(validarPais(BR, true), null);
});

test('un país activo genera para cualquiera', () => {
  assert.strictEqual(validarPais(CO, false), null);
});

test('el tipo debe estar habilitado para el país', () => {
  assert.strictEqual(validarTipo('cashback', MX), null);
  assert.ok(validarTipo('carrera_compras', MX), 'Carrera no está habilitada en México');
  assert.ok(validarTipo('inventado', CO));
});

test('si el país no está disponible no se revisa nada más', () => {
  const resultado = validarSolicitud({ pais: 'EC', tipo: 'cashback' }, EN_PILOTO, CONTEXTO);
  assert.strictEqual(resultado.errores.length, 1);
  assert.strictEqual(resultado.errores[0].campo, 'pais');
});

test('la campaña no puede terminar antes de empezar', () => {
  assert.deepStrictEqual(campos(solicitudBase({ fechaFin: '2026-09-19' })), ['fechaFin']);
});

test('la campaña no puede empezar en una fecha que ya pasó', () => {
  assert.deepStrictEqual(campos(solicitudBase({ fechaInicio: '2026-09-15', fechaFin: '2026-09-16' })), ['fechaInicio']);
});

test('empezar hoy sí está permitido', () => {
  assert.deepStrictEqual(campos(solicitudBase({ fechaInicio: '2026-09-16' })), []);
});

test('el tope no puede ser mayor que el presupuesto', () => {
  assert.deepStrictEqual(campos(solicitudBase({ tope: 2000000 })), ['tope']);
});

test('el tope y el presupuesto deben ser mayores que cero', () => {
  assert.deepStrictEqual(campos(solicitudBase({ tope: 0 })), ['tope']);
  assert.deepStrictEqual(campos(solicitudBase({ presupuesto: 0 })), ['presupuesto']);
});

test('la fecha límite de redención debe ser posterior al fin', () => {
  const entrada = solicitudBase({ vigencia: 'fecha', diasVigencia: null, fechaFinRedencion: '2026-09-21' });
  assert.deepStrictEqual(campos(entrada), ['fechaFinRedencion']);
});

test('las ciudades son obligatorias cuando el alcance no es nacional', () => {
  assert.deepStrictEqual(campos(solicitudBase({ alcance: 'Ciudades', ciudades: '' })), ['ciudades']);
  assert.deepStrictEqual(campos(solicitudBase({ alcance: 'Ciudades', ciudades: 'Bogotá' })), []);
});

test('los días sin compra solo se piden para usuarios reactivados', () => {
  assert.deepStrictEqual(campos(solicitudBase({ segmento: 'reactivados' })), ['diasSinCompra']);
  assert.deepStrictEqual(campos(solicitudBase({ segmento: 'reactivados', diasSinCompra: 60 })), []);
  assert.deepStrictEqual(campos(solicitudBase({ segmento: 'nuevos' })), []);
});

test('sin límite de pedidos deja de exigir el máximo', () => {
  assert.deepStrictEqual(campos(solicitudBase({ maxPedidos: null })), ['maxPedidos']);
  assert.deepStrictEqual(campos(solicitudBase({ maxPedidos: null, sinLimite: true })), []);
});

test('el porcentaje tiene que estar entre 1 y 100', () => {
  assert.deepStrictEqual(campos(solicitudBase({ porcentaje: 101 })), ['porcentaje']);
  assert.deepStrictEqual(campos(solicitudBase({ porcentaje: 100 })), []);
});

test('hay que marcar la declaración', () => {
  assert.deepStrictEqual(campos(solicitudBase({ declaracion: false })), ['declaracion']);
});

test('el nombre de la campaña lo arma la herramienta, no el comercial', () => {
  // Ya no hay campo de texto libre: lo que el comercial mande en nombreCampana
  // se ignora, y el nombre sale de la tienda, el porcentaje y el día de inicio.
  const { nombreDeCampana } = require('../src/core/nombres.js');
  const { esquemaDe } = require('../src/core/esquemas.js');

  assert.deepStrictEqual(campos(solicitudBase({ nombreCampana: 'x'.repeat(81) })), []);
  assert.strictEqual(
    nombreDeCampana({ tipo: 'cashback', tienda: 'El Corral', porcentaje: 50, fechaInicio: '2026-09-20' }, esquemaDe('cashback')),
    'El Corral · 50% Cashback · 20 sep 2026'
  );
});

test('el Cashback Day exige al menos dos tiendas y no permite ID repetido', () => {
  function day(tiendas) {
    return solicitudBase({
      tipo: 'cashback_day',
      tiendas: tiendas,
      presupuesto: null,
      organizadorRazonSocial: undefined,
      organizadorId: undefined,
      tienda: undefined,
      alcance: undefined,
    });
  }
  const una = { marca: 'Uno', razonSocial: 'Uno S.A.S.', id: '900777888-2', ciudades: 'Bogotá', presupuesto: 1000, tiendaTurbo: 'normal' };
  const otra = { marca: 'Dos', razonSocial: 'Dos S.A.S.', id: '901222333-9', nacional: true, presupuesto: 2000, tiendaTurbo: 'sin_turbo' };

  assert.deepStrictEqual(campos(day([])), ['tiendas']);
  assert.deepStrictEqual(campos(day([una])), ['tiendas']);
  assert.deepStrictEqual(campos(day([una, otra])), []);
  assert.deepStrictEqual(campos(day([una, Object.assign({}, otra, { id: '900777888-2' })])), ['tiendas']);
});

test('el Cashback Day no pide organizador', () => {
  const entrada = solicitudBase({
    tipo: 'cashback_day',
    presupuesto: null,
    tiendas: [
      { marca: 'Uno', razonSocial: 'Uno S.A.S.', id: '900777888-2', ciudades: 'Bogotá', presupuesto: 1000, tiendaTurbo: 'normal' },
      { marca: 'Dos', razonSocial: 'Dos S.A.S.', id: '901222333-9', nacional: true, presupuesto: 2000, tiendaTurbo: 'sin_turbo' },
    ],
  });
  delete entrada.organizadorRazonSocial;
  delete entrada.organizadorId;
  assert.deepStrictEqual(campos(entrada), []);
});

test('cada error trae campo y mensaje', () => {
  const resultado = validarSolicitud(solicitudBase({ presupuesto: null }), CO, CONTEXTO);
  assert.ok(!resultado.valido);
  for (const error of resultado.errores) {
    assert.ok(error.campo, 'un error sin campo');
    assert.ok(error.mensaje, 'un error sin mensaje');
  }
});

test('los mensajes de rango, orden y fecha pasada son los escritos para cada pregunta', () => {
  // Cada pregunta trae sus mensajes en errores (pasado, orden, cero...) y solo
  // se usaba errores.vacio: el resto se armaba a mano y en genérico.
  function mensajeDe(cambios, campo, contexto) {
    const resultado = validarSolicitud(solicitudBase(cambios), CO, contexto || CONTEXTO);
    const error = resultado.errores.filter((e) => e.campo === campo)[0];
    return error ? error.mensaje : null;
  }
  assert.strictEqual(mensajeDe({ fechaInicio: '2026-09-01', fechaFin: '2026-09-02' }, 'fechaInicio'),
    'Esa fecha ya pasó. Los T&C se publican antes de que la campaña empiece, así que elige hoy o un día futuro.');
  assert.strictEqual(mensajeDe({ fechaFin: '2026-09-19' }, 'fechaFin'),
    'La campaña no puede terminar antes de empezar. Revisa la fecha y la hora de fin.');
  assert.strictEqual(mensajeDe({ tope: 0 }, 'tope'), 'El tope tiene que ser mayor que cero.');
  assert.strictEqual(mensajeDe({ tope: 2000000 }, 'tope'),
    'El tope por pedido es mayor que el presupuesto total. Con eso, el primer pedido se lleva toda la campaña. Revisa los dos números.');
  assert.strictEqual(mensajeDe({ porcentaje: 101 }, 'porcentaje'),
    'El porcentaje va de 1 a 100. Si necesitas varios porcentajes o un rango, eso es otra campaña: escríbele a Legal.');
  assert.strictEqual(mensajeDe({ vigencia: 'fecha', fechaFinRedencion: '2026-09-21' }, 'fechaFinRedencion'),
    'Los Créditos tienen que vencerse después de que termine la campaña. Si no, quien compre el último día no alcanza a usarlos.');
});

// --- lo que salió de la revisión crítica del 17 de septiembre ---------------

/** Una campaña de cashback por ETA válida, como la publicada de Bogotá. */
function solicitudEta(cambios) {
  return Object.assign({
    pais: 'CO', negocio: 'rappi', tipo: 'cashback_eta', ciudades: 'Bogotá',
    fechaInicio: '2026-09-20', horaInicio: '11:00', horaFin: '15:00',
    etaMinutos: 15, porcentaje: 100, tope: 100000, presupuesto: 37000000,
    maxPedidos: 1, sinLimite: false, carga: 'dia_siguiente', vigencia: 'dias', diasVigencia: 7,
    exclusionesEta: ['travel', 'soat', 'atm', 'favor'], metodoPago: 'sin_efectivo', declaracion: true,
    alcanceTurbo: 'restaurantes',
  }, cambios || {});
}

test('un tipo de un solo día termina el día que empieza, y el error va a la hora de fin', () => {
  // El cashback por ETA no pregunta la fecha de fin. La vigencia leía
  // entrada.fechaFin, un dato que la interfaz fijaba una vez y nunca
  // actualizaba: al cambiar el día, el resumen decía "la campaña no puede
  // terminar antes de empezar" y no había ninguna pregunta donde arreglarlo.
  const viejo = validarSolicitud(solicitudEta({ fechaFin: '2026-09-10' }), CO, CONTEXTO);
  assert.deepStrictEqual(viejo.errores, [], 'una fecha de fin vieja y ajena al tipo no puede tumbar nada');

  const alReves = validarSolicitud(solicitudEta({ horaInicio: '15:00', horaFin: '11:00' }), CO, CONTEXTO);
  assert.deepStrictEqual(alReves.errores.map((e) => e.campo), ['horaFin']);
  assert.strictEqual(alReves.errores[0].mensaje,
    'La hora de fin tiene que ser después de la de inicio: la campaña es de un solo día.');
});

test('en un tipo de un solo día la redención se compara con ese día', () => {
  const resultado = validarSolicitud(solicitudEta({
    vigencia: 'fecha', diasVigencia: null, fechaFinRedencion: '2026-09-19', fechaFin: '2026-09-10',
  }), CO, CONTEXTO);
  assert.deepStrictEqual(resultado.errores.map((e) => e.campo), ['fechaFinRedencion']);
});

test('todo error apunta a una pregunta que el tipo hace', () => {
  // Un error en un campo que el formulario no muestra es un callejón sin
  // salida: el resumen dice que falta algo y no hay dónde arreglarlo.
  const { esquemaDe, tieneCampo } = require('../src/core/esquemas.js');
  const rotas = [
    solicitudEta({ horaInicio: '15:00', horaFin: '11:00', fechaFin: '2026-09-10', ciudades: 'Bogotá, Medellín', maxPedidos: null, tope: 0 }),
    solicitudBase({ fechaFin: '2026-09-19', tope: 0, porcentaje: 101 }),
  ];
  for (const entrada of rotas) {
    const esquema = esquemaDe(entrada.tipo);
    const errores = validarSolicitud(entrada, CO, CONTEXTO).errores;
    assert.ok(errores.length > 0, 'el caso roto no falló');
    for (const error of errores) {
      assert.ok(tieneCampo(esquema, error.campo),
        entrada.tipo + ': el error apunta a "' + error.campo + '", que el tipo no pregunta');
    }
  }
});

test('el cashback por ETA es de una sola ciudad', () => {
  // Los chips de ciudades heredados del cashback dejaban agregar dos, y el
  // documento salía "en la ciudad de Bogotá, Medellín".
  const resultado = validarSolicitud(solicitudEta({ ciudades: 'Bogotá, Medellín' }), CO, CONTEXTO);
  assert.deepStrictEqual(resultado.errores.map((e) => e.campo), ['ciudades']);
  assert.ok(resultado.errores[0].mensaje.indexOf('una sola ciudad') !== -1, resultado.errores[0].mensaje);
});

test('"varias veces" sin el número no pasa, ni en ETA ni en Brasil', () => {
  // "¿Cuántas veces?" dejaba elegir "Varias órdenes" y seguir sin escribir
  // cuántas: maxPedidos quedaba vacío, sinLimite en falso, y el documento
  // salía con "un máximo de  órdenes".
  const eta = validarSolicitud(solicitudEta({ maxPedidos: null, sinLimite: false }), CO, CONTEXTO);
  assert.deepStrictEqual(eta.errores.map((e) => e.campo), ['maxPedidos']);

  const { casos } = leerJson(rutaDesdeRaiz('pruebas', 'casos_base.json'));
  const br01 = casos.find((c) => c.id === 'BR01');
  const brasil = validarSolicitud(Object.assign({}, br01.entrada, { maxPedidos: null, sinLimite: false }), BR,
    { fechaReferencia: '2026-09-17', usuarioEnEquipo: true });
  assert.deepStrictEqual(brasil.errores.map((e) => e.campo), ['maxPedidos']);
});

test('un modelo en español no se genera en un país que escribe en otro idioma', () => {
  // Solo se revisaba la dirección modelo → país. Un modelo en español
  // habilitado en Brasil habría salido mezclado: "vinte por cento" y "horário
  // de Brasília" dentro de un articulado en español, sin un solo error.
  const { validarIdiomaDelPais } = require('../src/core/validaciones.js');
  const { esquemaDe } = require('../src/core/esquemas.js');

  const error = validarIdiomaDelPais(esquemaDe('cashback'), BR);
  assert.ok(error, 'no se quejó');
  assert.ok(error.mensaje.indexOf('portugués') !== -1, error.mensaje);
  assert.strictEqual(validarIdiomaDelPais(esquemaDe('cashback'), CO), null);
  assert.strictEqual(validarIdiomaDelPais(esquemaDe('promocao_br'), BR), null);

  const brasilConCashback = Object.assign({}, BR, { modelos: BR.modelos.concat(['cashback']), texto_derechos_datos: 'x' });
  const resultado = validarSolicitud(solicitudBase({ pais: 'BR' }), brasilConCashback,
    { fechaReferencia: '2026-09-16', usuarioEnEquipo: true });
  assert.strictEqual(resultado.valido, false);
  assert.strictEqual(resultado.errores[0].campo, 'tipo');
});

test('al ampliar, una fecha de inicio que ya pasó no es un error', () => {
  // Ampliar rearma el documento completo. Sin esta excepción, solo funcionaba
  // el mismo día del inicio.
  const pasada = solicitudBase({ fechaInicio: '2026-09-10', fechaFin: '2026-09-30' });
  assert.deepStrictEqual(validarSolicitud(pasada, CO, CONTEXTO).errores.map((e) => e.campo), ['fechaInicio']);
  assert.deepStrictEqual(validarSolicitud(pasada, CO, Object.assign({ ampliacion: true }, CONTEXTO)).errores, []);
});
