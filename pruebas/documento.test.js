'use strict';

/** Las piezas puras del Bloque 2: estructura del Doc, tablas, países y correo. */

const test = require('node:test');
const assert = require('node:assert');

const { rutaDesdeRaiz, leerJson } = require('../scripts/lib/archivos');
const { cargarModelos } = require('../scripts/lib/modelos');
const { generarTexto } = require('../src/core/generar.js');
const {
  estructuraDelDocumento,
  partirEnNegritas,
  textoDelBloque,
  tituloDelDocumento,
  identificadorDeSolicitud,
} = require('../src/core/documento.js');
const {
  filasComoObjetos, objetoComoFila, comoBooleano, siguienteConsecutivo,
  solicitudesVisibles, buscarEnSolicitudes, comoCsv,
} = require('../src/core/tablas.js');
const {
  paisDesdeFila, paisComoFila, paisesDisponibles, tiposDelPais, rolDe, miembroDesdeFila,
} = require('../src/core/paises.js');
const { correoDeGeneracion, escaparHtml, urlSegura } = require('../src/core/correo.js');
const { ESQUEMAS } = require('../src/core/esquemas.js');

const { paises } = leerJson(rutaDesdeRaiz('data', 'paises.json'));
const { casos } = leerJson(rutaDesdeRaiz('pruebas', 'casos_base.json'));
const modelos = cargarModelos();

function textoDeCaso(id) {
  const caso = casos.find((c) => c.id === id);
  const pais = paises.find((p) => p.codigo === caso.entrada.pais);
  const resultado = generarTexto(caso.entrada, pais, modelos, {
    fechaReferencia: caso.fecha_referencia,
    usuarioEnEquipo: caso.usuario_en_equipo === true,
  });
  assert.ok(resultado.valido, id + ' debería generar');
  return resultado.texto;
}

// --- Estructura del documento ---------------------------------------------

test('partirEnNegritas separa los tramos con y sin negrita', () => {
  assert.deepStrictEqual(partirEnNegritas('a **b** c'), [
    { texto: 'a ', negrita: false },
    { texto: 'b', negrita: true },
    { texto: ' c', negrita: false },
  ]);
});

test('un ** sin cerrar no pierde texto', () => {
  const partes = partirEnNegritas('a **b');
  assert.strictEqual(partes.map((p) => p.texto).join(''), 'a b');
  assert.ok(partes.every((p) => p.negrita === false));
});

test('cada línea del texto produce exactamente un bloque', () => {
  const texto = textoDeCaso('CB01');
  const estructura = estructuraDelDocumento(texto);
  assert.strictEqual(estructura.length, texto.split('\n').filter((l) => l.trim()).length);
});

test('los tipos de bloque se reconocen', () => {
  const estructura = estructuraDelDocumento(textoDeCaso('CB01'));
  const tipos = estructura.map((b) => b.tipo);
  assert.strictEqual(tipos[0], 'titulo');
  assert.strictEqual(tipos[1], 'subtitulo');
  assert.ok(tipos.indexOf('clausula') !== -1);
  assert.ok(tipos.indexOf('vineta') !== -1);
  assert.ok(tipos.indexOf('parrafo') !== -1);
});

test('la estructura conserva todo el texto, sin marcas de formato', () => {
  for (const id of ['CB01', 'CB02', 'CC01', 'CD01', 'MX01']) {
    const texto = textoDeCaso(id);
    const reconstruido = estructuraDelDocumento(texto).map(textoDelBloque).join('|');
    const esperado = texto
      .replace(/\*\*/g, '')
      .split('\n')
      .map((l) => l.replace(/^#{1,2} /, '').replace(/^• /, ''))
      .join('|');
    assert.strictEqual(reconstruido, esperado, id + ' perdió o cambió texto');
  }
});

test('el título del documento sigue el formato de la especificación', () => {
  assert.strictEqual(
    tituloDelDocumento('Jumbo MT', 'Colombia', 'RM-20260916-0001'),
    'T&C · Jumbo MT · Colombia · RM-20260916-0001'
  );
});

test('el identificador tiene la forma RM-AAAAMMDD-NNNN', () => {
  assert.strictEqual(identificadorDeSolicitud('2026-09-16', 1), 'RM-20260916-0001');
  assert.strictEqual(identificadorDeSolicitud('2026-09-16', 42), 'RM-20260916-0042');
  assert.strictEqual(identificadorDeSolicitud('2026-09-16', 1234), 'RM-20260916-1234');
});

// --- Tablas ----------------------------------------------------------------

test('filasComoObjetos descarta las filas vacías y anota el número de fila', () => {
  const objetos = filasComoObjetos([['a', 'b'], ['1', '2'], ['', ''], ['3', '4']]);
  assert.strictEqual(objetos.length, 2);
  assert.strictEqual(objetos[0]._fila, 2);
  assert.strictEqual(objetos[1]._fila, 4);
});

test('objetoComoFila respeta el orden de los encabezados y rellena lo que falta', () => {
  assert.deepStrictEqual(objetoComoFila({ b: 2, a: 1 }, ['a', 'b', 'c']), [1, 2, '']);
});

test('comoBooleano entiende lo que se escribe de verdad en un Sheet', () => {
  for (const verdadero of [true, 'sí', 'si', 'TRUE', '1', 'x']) {
    assert.ok(comoBooleano(verdadero), String(verdadero) + ' debería ser verdadero');
  }
  for (const falso of [false, '', 'no', null, undefined, 'cualquier cosa']) {
    assert.ok(!comoBooleano(falso), String(falso) + ' debería ser falso');
  }
});

test('el consecutivo vuelve a uno cada día', () => {
  const ids = ['RM-20260916-0001', 'RM-20260916-0007', 'RM-20260915-0099'];
  assert.strictEqual(siguienteConsecutivo(ids, '2026-09-16'), 8);
  assert.strictEqual(siguienteConsecutivo(ids, '2026-09-17'), 1);
  assert.strictEqual(siguienteConsecutivo([], '2026-09-16'), 1);
});

test('cada rol ve lo que le corresponde', () => {
  const solicitudes = [
    { id: '1', email: 'a@rappi.com', pais: 'CO' },
    { id: '2', email: 'b@rappi.com', pais: 'CO' },
    { id: '3', email: 'c@rappi.com', pais: 'MX' },
  ];
  assert.strictEqual(solicitudesVisibles(solicitudes, 'a@rappi.com', 'comercial').length, 1);
  assert.strictEqual(solicitudesVisibles(solicitudes, 'a@rappi.com', 'legal', 'CO').length, 2);
  assert.strictEqual(solicitudesVisibles(solicitudes, 'z@rappi.com', 'admin').length, 3);
});

test('la búsqueda mira los campos visibles y no distingue mayúsculas', () => {
  const solicitudes = [{ id: '1', nombre_campana: 'Jumbo MT', pais: 'CO' }];
  assert.strictEqual(buscarEnSolicitudes(solicitudes, 'jumbo').length, 1);
  assert.strictEqual(buscarEnSolicitudes(solicitudes, 'CO').length, 1);
  assert.strictEqual(buscarEnSolicitudes(solicitudes, 'nada').length, 0);
  assert.strictEqual(buscarEnSolicitudes(solicitudes, '').length, 1);
});

test('el CSV escapa comas, comillas y saltos de línea', () => {
  const csv = comoCsv([{ a: 'con, coma', b: 'con "comillas"' }], ['a', 'b']);
  assert.strictEqual(csv, 'a,b\n"con, coma","con ""comillas"""');
});

// --- Países ----------------------------------------------------------------

test('paisDesdeFila convierte las listas y normaliza el estado', () => {
  const pais = paisDesdeFila({ codigo: 'co', estado: ' Activo ', modelos: 'cashback, cashback_day' });
  assert.strictEqual(pais.codigo, 'CO');
  assert.strictEqual(pais.estado, 'activo');
  assert.deepStrictEqual(pais.modelos, ['cashback', 'cashback_day']);
});

test('un estado desconocido se trata como bloqueado', () => {
  assert.strictEqual(paisDesdeFila({ codigo: 'XX', estado: 'lo que sea' }).estado, 'bloqueado');
  assert.strictEqual(paisDesdeFila({ codigo: 'XX' }).estado, 'bloqueado');
});

test('ir y volver entre fila y país no pierde nada', () => {
  const original = paisDesdeFila(paises[0]);
  const vuelta = paisDesdeFila(paisComoFila(original));
  assert.deepStrictEqual(vuelta.modelos, original.modelos);
  assert.strictEqual(vuelta.codigo, original.codigo);
  assert.strictEqual(vuelta.entidad_legal, original.entidad_legal);
});

test('los nueve países son activos: cualquier comercial los ve todos', () => {
  // El 20 de septiembre Ecuador y Costa Rica salieron de piloto, que eran los
  // dos últimos. Desde entonces un comercial ve los nueve.
  const paraTodos = paisesDisponibles(paises, false).map((p) => p.codigo);
  assert.deepStrictEqual(paraTodos.sort(), ['AR', 'BR', 'CL', 'CO', 'CR', 'EC', 'MX', 'PE', 'UY']);
  assert.deepStrictEqual(paisesDisponibles(paises, true).map((p) => p.codigo).sort(), paraTodos.sort());
});

test('un país en piloto sigue apareciendo solo para el equipo', () => {
  // Ya no hay ninguno, así que se construye: el mecanismo tiene que seguir
  // funcionando para el día en que entre un país nuevo.
  const conPiloto = paises.map((p) => (p.codigo === 'CR' ? Object.assign({}, p, { estado: 'piloto' }) : p));
  assert.strictEqual(paisesDisponibles(conPiloto, false).filter((p) => p.codigo === 'CR').length, 0);
  assert.strictEqual(paisesDisponibles(conPiloto, true).filter((p) => p.codigo === 'CR').length, 1);
  assert.ok(paisesDisponibles(conPiloto, true).every((p) => p.estado !== 'bloqueado'));
});

test('cada país solo ofrece los tipos que tiene habilitados', () => {
  const catalogo = Object.keys(ESQUEMAS).map((k) => ESQUEMAS[k]);
  const co = tiposDelPais(paises.find((p) => p.codigo === 'CO'), catalogo);
  const mx = tiposDelPais(paises.find((p) => p.codigo === 'MX'), catalogo);
  // Colombia tiene los de delivery, los dos de Rappi Travel y los dos de millas.
  assert.deepStrictEqual(
    co.map((t) => t.id).sort(),
    ['carrera_compras', 'cashback', 'cashback_day', 'cashback_eta', 'cashback_travel',
      'descuento_travel', 'millas', 'millas_travel']
  );
  assert.deepStrictEqual(mx.map((t) => t.id), ['cashback']);
});

test('quien no está en el equipo, o está inactivo, es comercial', () => {
  const equipo = [
    miembroDesdeFila({ email: 'A@Rappi.com', rol: 'Admin', activo: 'sí' }),
    miembroDesdeFila({ email: 'b@rappi.com', rol: 'legal', activo: 'no' }),
  ];
  assert.strictEqual(rolDe(equipo, 'a@rappi.com'), 'admin');
  assert.strictEqual(rolDe(equipo, 'b@rappi.com'), 'comercial');
  assert.strictEqual(rolDe(equipo, 'z@rappi.com'), 'comercial');
});

// --- Correo ----------------------------------------------------------------

test('el correo escapa el nombre de la campaña', () => {
  const mensaje = correoDeGeneracion({
    nombreCampana: '<script>alert(1)</script>',
    pais: 'Colombia',
    id: 'RM-20260916-0001',
    linkDoc: 'https://docs.google.com/document/d/abc/edit',
  });
  assert.ok(mensaje.html.indexOf('<script>') === -1);
  assert.ok(mensaje.html.indexOf('&lt;script&gt;') !== -1);
});

test('el correo solo acepta enlaces http y https', () => {
  assert.strictEqual(urlSegura('javascript:alert(1)'), '');
  assert.strictEqual(urlSegura('data:text/html,x'), '');
  assert.ok(urlSegura('https://docs.google.com/x').length > 0);
});

test('el correo trae el enlace, los pasos y el identificador', () => {
  const mensaje = correoDeGeneracion({
    nombreCampana: 'Jumbo MT',
    pais: 'Colombia',
    id: 'RM-20260916-0001',
    linkDoc: 'https://docs.google.com/document/d/abc/edit',
  });
  assert.ok(mensaje.html.indexOf('https://docs.google.com/document/d/abc/edit') !== -1);
  assert.ok(mensaje.html.indexOf('promos.rappi.com') !== -1);
  assert.ok(mensaje.html.indexOf('RM-20260916-0001') !== -1);
  assert.ok(mensaje.texto.indexOf('RM-20260916-0001') !== -1);
  assert.ok(mensaje.asunto.indexOf('Jumbo MT') !== -1);
});

test('escaparHtml cubre los cinco caracteres peligrosos', () => {
  assert.strictEqual(escaparHtml('<>&"\''), '&lt;&gt;&amp;&quot;&#39;');
});
