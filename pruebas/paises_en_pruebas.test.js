'use strict';

/**
 * El aviso de que un país está en pruebas.
 *
 * Empezaron siendo ocho países en piloto, con valores legales que propuso la
 * herramienta por analogía con Colombia y que no había confirmado nadie. El
 * encargo 01 los confirmó con la ley de cada país y el 18 de septiembre seis
 * salieron a activo. Quedan Ecuador y Costa Rica, que siguen sin decir si
 * escriben los miles con punto o con coma.
 *
 * El aviso existe para que un abogado que entra a probar sepa qué está mirando:
 * si no, lee el documento, le parece bien, y confirma algo que nadie escribió.
 */

const test = require('node:test');
const assert = require('node:assert');

const { paisDesdeFila, datosPorConfirmar, paisEnPruebas, NOMBRE_DEL_DATO } = require('../src/core/paises.js');
const { rutaDesdeRaiz, leerJson } = require('../scripts/lib/archivos');

const PAISES = leerJson(rutaDesdeRaiz('data', 'paises.json')).paises.map(paisDesdeFila);
const porCodigo = (codigo) => PAISES.filter((p) => p.codigo === codigo)[0];

test('solo Ecuador y Costa Rica siguen en pruebas', () => {
  assert.strictEqual(paisEnPruebas(porCodigo('CO')), false);
  const enPruebas = PAISES.filter(paisEnPruebas).map((p) => p.codigo);
  assert.deepStrictEqual(enPruebas.sort(), ['CR', 'EC']);
});

test('los seis que salieron de piloto no llevan el aviso de pruebas', () => {
  // El 18 de septiembre Juan sacó de piloto a México, Perú, Argentina, Chile,
  // Uruguay y Brasil. Con eso desaparece el aviso de "no publiques todavía" y
  // el país lo ve cualquier comercial, no solo el equipo de pruebas.
  for (const codigo of ['MX', 'PE', 'AR', 'CL', 'UY', 'BR']) {
    assert.strictEqual(porCodigo(codigo).estado, 'activo', codigo);
    assert.strictEqual(paisEnPruebas(porCodigo(codigo)), false, codigo);
  }
  assert.deepStrictEqual(datosPorConfirmar(porCodigo('MX')), [],
    'México ya tiene sus cuatro datos confirmados');
  assert.ok(datosPorConfirmar(porCodigo('EC')).length > 0,
    'Ecuador todavía no dice cómo escribe los miles');
});

test('un país en pruebas lo sigue estando aunque no le falte ningún dato', () => {
  // Estar en piloto no depende de la lista de datos por confirmar: depende de
  // la columna estado. Un país con la lista vacía y estado piloto sigue
  // llevando el aviso.
  const sinPendientes = Object.assign({}, porCodigo('EC'), { por_confirmar_en_pruebas: [] });
  assert.strictEqual(paisEnPruebas(sinPendientes), true);
  assert.deepStrictEqual(datosPorConfirmar(sinPendientes), []);
});

test('lo que falta se dice en palabras, no con el nombre de la columna', () => {
  for (const codigo of ['EC', 'CR']) {
    const faltantes = datosPorConfirmar(porCodigo(codigo));
    for (const texto of faltantes) {
      assert.ok(texto.indexOf('_') === -1, 'salió el nombre técnico de la columna: ' + texto);
      assert.ok(texto.length > 12, 'demasiado corto para entenderse: ' + texto);
    }
  }
  // Ecuador y Costa Rica son los dos que siguen sin decir cómo escriben los miles.
  assert.ok(datosPorConfirmar(porCodigo('EC')).indexOf('cómo se separan los miles en un monto') !== -1);
  assert.ok(datosPorConfirmar(porCodigo('CR')).indexOf('cómo se separan los miles en un monto') !== -1);
});

/**
 * Un dato confirmado sale de la lista.
 *
 * La respuesta del encargo 01 confirmó, con la ley de cada país, los cuatro
 * datos que ocho países tenían pendientes. Juan decidió el 18 de septiembre no
 * pedir además el visto bueno del abogado de cada país, así que la lista de un
 * país que ya tiene todo confirmado queda vacía. El aviso de que el país está
 * en pruebas no depende de esa lista: depende del estado, que solo Juan cambia
 * en el Sheet.
 */
test('un dato confirmado sale de la lista de pendientes', () => {
  // Colombia ya estaba activo y no le falta nada.
  assert.deepStrictEqual(porCodigo('CO').por_confirmar_en_pruebas, []);

  // Nadie pide ya el visto bueno del abogado local.
  for (const pais of PAISES) {
    assert.strictEqual((pais.por_confirmar_en_pruebas || []).indexOf('visto_bueno_legal_local'), -1,
      pais.nombre + ' todavía pide el visto bueno local, que Juan decidió no pedir');
  }

  // Y los cuatro datos que todos tenían pendientes ya no aparecen, salvo el
  // separador de miles de Ecuador y Costa Rica, que sigue sin dato.
  for (const pais of PAISES) {
    const pendientes = pais.por_confirmar_en_pruebas || [];
    for (const llave of ['termino_dias', 'texto_hora_local', 'texto_derechos_datos']) {
      assert.strictEqual(pendientes.indexOf(llave), -1,
        pais.nombre + ' sigue marcando ' + llave + ', que el encargo 01 confirmó');
    }
  }
  assert.deepStrictEqual(porCodigo('EC').por_confirmar_en_pruebas, ['separador_miles']);
  assert.deepStrictEqual(porCodigo('CR').por_confirmar_en_pruebas, ['separador_miles']);
});

test('cada dato que un país marca por confirmar tiene su nombre en palabras', () => {
  const sinNombre = [];
  for (const pais of PAISES) {
    for (const llave of pais.por_confirmar_en_pruebas || []) {
      if (!NOMBRE_DEL_DATO[llave]) sinNombre.push(pais.codigo + '.' + llave);
    }
  }
  assert.deepStrictEqual(sinNombre, [], 'sin nombre legible: ' + sinNombre.join(', '));
});

test('un país sin nada marcado no genera aviso vacío', () => {
  const limpio = Object.assign({}, porCodigo('MX'), { por_confirmar_en_pruebas: [] });
  assert.deepStrictEqual(datosPorConfirmar(limpio), []);
  assert.deepStrictEqual(datosPorConfirmar(null), []);
  assert.strictEqual(paisEnPruebas(null), false);
});

/**
 * Una nota interna dentro de un dato que se imprime.
 *
 * La fila de Brasil tenía la autoridad de datos escrita como "a Autoridade
 * Nacional de Proteção de Dados (ANPD) (confirmar)". Ese valor va tal cual a la
 * cláusula de datos personales, así que un T&C publicado habría salido con la
 * palabra "(confirmar)" adentro. No llegó a pasar porque el modelo brasileño no
 * usa ese bloque, pero bastaba con que alguien se lo agregara.
 */
test('un dato del país con una nota interna no deja generar', () => {
  const { validarSolicitud } = require('../src/core/validaciones.js');
  const opciones = { fechaReferencia: '2026-08-01', usuarioEnEquipo: true };
  const colombia = porCodigo('CO');

  const entrada = {
    pais: 'CO', negocio: 'rappi', tipo: 'cashback', tienda: 'El Corral',
    alcance: 'Nacional', organizadorRazonSocial: 'El Corral S.A.S.', organizadorId: '900111222-1',
    fechaInicio: '2026-09-20', fechaFin: '2026-09-20', horaInicio: '00:00', horaFin: '23:59',
    segmento: 'todos', metodoPago: 'todos', porcentaje: 20, tope: 25000, presupuesto: 15000000,
    maxPedidos: 1, carga: 'dia_siguiente', vigencia: 'dias', diasVigencia: 7,
    redencion: 'tienda', declaracion: true,
  };

  assert.deepStrictEqual(validarSolicitud(entrada, colombia, opciones).errores, [],
    'el caso sano no debería fallar');

  // Las variantes naturales de la misma nota se le escapaban: "[confirmar]",
  // "(a confirmar)", "(revisar con Legal)", "TBD", "(?)".
  for (const nota of ['(confirmar)', '(revisar)', '(pendiente)', 'TODO', '???', '[confirmar]', '(a confirmar)',
    '(sin confirmar)', '(por definir)', '(revisar con Legal)', 'TBD', 'FIXME', '(?)', '??', '{{ANPD}}', '[[ANPD]]']) {
    const sucio = Object.assign({}, colombia, {
      autoridad_datos: 'la Superintendencia de Industria y Comercio ' + nota,
    });
    const revision = validarSolicitud(entrada, sucio, opciones);
    assert.strictEqual(revision.valido, false, 'no se quejó con la nota ' + nota);
    assert.ok(revision.errores[0].mensaje.indexOf('nota interna') !== -1, revision.errores[0].mensaje);
  }
});

test('ningún país trae hoy una nota interna en un dato que se imprime', () => {
  const { validarSolicitud } = require('../src/core/validaciones.js');
  for (const pais of PAISES) {
    const revision = validarSolicitud({ pais: pais.codigo, tipo: 'cashback' }, pais,
      { fechaReferencia: '2026-08-01', usuarioEnEquipo: true });
    const anotaciones = revision.errores.filter((e) => e.mensaje.indexOf('nota interna') !== -1);
    assert.deepStrictEqual(anotaciones, [], pais.nombre + ': ' + JSON.stringify(anotaciones));
  }
});


test('las palabras normales de un valor legal no se confunden con una nota', () => {
  // "todo el territorio", "(SIC)" o "Ley 1480 de 2011 (Estatuto del Consumidor)"
  // son texto legal legítimo: la marca TODO solo cuenta en mayúsculas y las
  // palabras de nota solo entre paréntesis o corchetes.
  const { tieneMarcaDeAnotacion } = require('../src/core/validaciones.js');
  for (const valor of [
    'todo el territorio nacional de la República de Colombia',
    'la Superintendencia de Industria y Comercio (SIC)',
    'Ley 1480 de 2011 (Estatuto del Consumidor)',
    'puedes revisar la política en la Plataforma',
    'Instituto Federal de Telecomunicaciones (IFT), pendiente de nada',
  ]) {
    assert.strictEqual(tieneMarcaDeAnotacion(valor), false, 'se confundió con: ' + valor);
  }
  for (const valor of ['la ANPD (a confirmar)', 'la ANPD [confirmar]', 'PROCON (?)', 'TBD', 'SENACON (revisar con Legal)']) {
    assert.strictEqual(tieneMarcaDeAnotacion(valor), true, 'no cazó: ' + valor);
  }
});
