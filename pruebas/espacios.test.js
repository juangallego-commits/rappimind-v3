'use strict';

/**
 * Los espacios de sobra en las respuestas del comercial.
 *
 * El defecto: una razón social con dos espacios ("Masterfoods Colombia  Ltda.")
 * pasaba la revisión de la pantalla, el comercial tocaba Generar y la red de
 * seguridad del motor lo frenaba con "El texto quedó roto: hay dos espacios
 * seguidos". El mensaje no decía en cuál pregunta, y dos espacios no se ven en
 * pantalla, así que no había cómo arreglarlo. Pasaba con todo campo de texto
 * libre, de todos los tipos y de todos los países.
 *
 * El arreglo está en el borde (limpiarEspacios), no en el motor: la red del
 * motor se queda como está para atrapar un doble espacio que NO venga de una
 * respuesta, y esa parte también se prueba aquí.
 */

const test = require('node:test');
const assert = require('node:assert');
const path = require('node:path');

const { rutaDesdeRaiz, leerJson } = require('../scripts/lib/archivos');
const { limpiarEspacios } = require('../src/core/texto.js');
const { esquemaDe } = require('../src/core/esquemas.js');
const { generarTexto } = require('../src/core/generar.js');
const { renderizar } = require('../src/core/motor.js');
const { cargarModelos } = require('../scripts/lib/modelos');
const { solicitud } = require('./dobles/solicitudes.js');
const { levantarEntorno, solicitudValida } = require('./dobles/entorno.js');

const modelos = cargarModelos();
const { paises } = leerJson(rutaDesdeRaiz('data', 'paises.json'));
const pais = (codigo) => paises.find((p) => p.codigo === codigo);
const CONTEXTO = { fechaReferencia: '2026-09-16', usuarioEnEquipo: true };

// --- la función ----------------------------------------------------------------

test('junta los espacios de adentro y quita los de las puntas', () => {
  assert.strictEqual(limpiarEspacios('Masterfoods  Colombia   Ltda.'), 'Masterfoods Colombia Ltda.');
  assert.strictEqual(limpiarEspacios('  Mars  '), 'Mars');
  assert.strictEqual(limpiarEspacios('Mars Incorporated'), 'Mars Incorporated');
});

test('también los que trae un texto pegado: tabulaciones, saltos y espacios duros', () => {
  assert.strictEqual(limpiarEspacios('Effem\t\tColombia'), 'Effem Colombia');
  assert.strictEqual(limpiarEspacios('Effem\nColombia'), 'Effem Colombia');
  assert.strictEqual(limpiarEspacios('Effem  Colombia'), 'Effem Colombia');
  assert.strictEqual(limpiarEspacios('Effem  Colombia'), 'Effem Colombia');
});

test('recorre las filas de tiendas y productos, a cualquier profundidad', () => {
  const sucia = {
    tienda: 'Mars  Inc',
    tiendas: [{ nombre: ' Éxito  Express ', id: 123 }, { nombre: 'Jumbo' }],
    anidado: { lista: ['a  b', ['c   d']] },
  };
  assert.deepStrictEqual(limpiarEspacios(sucia), {
    tienda: 'Mars Inc',
    tiendas: [{ nombre: 'Éxito Express', id: 123 }, { nombre: 'Jumbo' }],
    anidado: { lista: ['a b', ['c d']] },
  });
});

test('lo que no es texto pasa intacto', () => {
  assert.strictEqual(limpiarEspacios(20), 20);
  assert.strictEqual(limpiarEspacios(0), 0);
  assert.strictEqual(limpiarEspacios(true), true);
  assert.strictEqual(limpiarEspacios(false), false);
  assert.strictEqual(limpiarEspacios(null), null);
  assert.strictEqual(limpiarEspacios(undefined), undefined);
  const fecha = new Date(2026, 8, 17);
  assert.strictEqual(limpiarEspacios(fecha), fecha, 'una fecha no se vuelve un objeto vacío');
  assert.deepStrictEqual(limpiarEspacios({ n: null, b: false, v: '' }), { n: null, b: false, v: '' });
});

test('devuelve una copia: no toca lo que escribió el comercial', () => {
  // El formulario necesita su valor tal cual, o al teclear "Mars " el espacio
  // desaparecería antes de poder escribir "Incorporated".
  const original = { tienda: 'Mars  ', tiendas: [{ nombre: 'a  b' }] };
  const limpia = limpiarEspacios(original);
  assert.deepStrictEqual(original, { tienda: 'Mars  ', tiendas: [{ nombre: 'a  b' }] });
  assert.notStrictEqual(limpia, original);
  assert.notStrictEqual(limpia.tiendas, original.tiendas);
});

test('limpiar dos veces da lo mismo que limpiar una', () => {
  const una = limpiarEspacios({ a: ' x   y ', b: [' p  q '] });
  assert.deepStrictEqual(limpiarEspacios(una), una);
});

// --- el documento --------------------------------------------------------------

/** Un doble espacio en cada campo de texto libre del tipo, de a uno. */
function conDobleEspacio(codigoPais, tipo, campo, valor) {
  return generarTexto(solicitud(codigoPais, tipo, { [campo]: valor }), pais(codigoPais), modelos, CONTEXTO);
}

test('la Carrera de Compras de Colombia genera con dobles espacios en la tienda y en la razón social', () => {
  // El caso que vio Juan: Mars Incorporated, Carrera de Compras, Colombia.
  for (const campo of ['tienda', 'organizadorRazonSocial']) {
    const salida = conDobleEspacio('CO', 'carrera_compras', campo, 'Masterfoods  Colombia Ltda. – Effem  Colombia Ltda.');
    assert.ok(salida.valido, campo + ': ' + JSON.stringify(salida.errores));
    assert.ok(!/ {2}/.test(salida.texto), campo + ': quedó un doble espacio en el documento');
    assert.ok(salida.texto.includes('Masterfoods Colombia Ltda. – Effem Colombia Ltda.'),
      campo + ': el nombre no quedó con un solo espacio');
  }
});

test('lo mismo con los espacios al principio y al final, y con los duros de un texto pegado', () => {
  for (const valor of ['  Mars Incorporated', 'Mars Incorporated  ', 'Mars  Incorporated']) {
    const salida = conDobleEspacio('CO', 'carrera_compras', 'tienda', valor);
    assert.ok(salida.valido, JSON.stringify(valor) + ': ' + JSON.stringify(salida.errores));
    assert.ok(salida.texto.includes('Mars Incorporated'), JSON.stringify(valor));
    assert.ok(!/ {2}| /.test(salida.texto), JSON.stringify(valor) + ' dejó un espacio raro en el documento');
  }
});

test('no hay país ni tipo donde un doble espacio en un campo de texto bloquee la generación', () => {
  // La medición que destapó el defecto: 71 de 72 combinaciones fallaban. Aquí
  // se recorren todas las que tienen una base válida.
  const { ESQUEMAS, camposVisibles } = require('../src/core/esquemas.js');
  let probados = 0;
  for (const p of paises) {
    if (p.estado === 'bloqueado') continue;
    for (const tipo of Object.keys(ESQUEMAS)) {
      let base;
      try { base = solicitud(p.codigo, tipo, {}); } catch (e) { continue; }
      if (!generarTexto(base, p, modelos, CONTEXTO).valido) continue;

      for (const campo of camposVisibles(tipo, base)) {
        const valor = base[campo.id];
        if (campo.tipo !== 'texto' || typeof valor !== 'string') continue;
        const salida = generarTexto(solicitud(p.codigo, tipo, { [campo.id]: valor + '  y  otra  cosa' }), p, modelos, CONTEXTO);
        assert.ok(salida.valido, p.codigo + ' ' + tipo + ' ' + campo.id + ': ' + JSON.stringify(salida.errores));
        assert.ok(!/ {2}/.test(salida.texto), p.codigo + ' ' + tipo + ' ' + campo.id + ': doble espacio en el documento');
        probados += 1;
      }
    }
  }
  assert.ok(probados >= 40, 'la prueba casi no probó nada: ' + probados);
});

test('las filas de tiendas también se limpian, y el error de un campo sigue señalando su pregunta', () => {
  const base = solicitud('CO', 'cashback_day', {});
  const tiendas = base.tiendas.map((t, i) => (i === 0 ? Object.assign({}, t, { marca: 'Éxito  Express', razonSocial: 'Almacenes  Éxito S.A.' }) : t));
  const salida = generarTexto(Object.assign({}, base, { tiendas }), pais('CO'), modelos, CONTEXTO);
  assert.ok(salida.valido, JSON.stringify(salida.errores));
  assert.ok(!/ {2}/.test(salida.texto));
  assert.ok(salida.texto.includes('Éxito Express'));
});

test('un campo que solo tiene espacios sigue siendo un campo vacío', () => {
  // Limpiar no puede esconder lo que falta: "   " queda en "" y se pide igual.
  const salida = conDobleEspacio('CO', 'carrera_compras', 'tienda', '     ');
  assert.ok(!salida.valido);
  assert.ok(salida.errores.some((e) => e.campo === 'tienda'), JSON.stringify(salida.errores));
});

test('la limpieza no esconde una respuesta mala: el código de un cupón con espacio sigue rechazado', () => {
  // El cupón no está habilitado en Colombia: se prueba donde sí lo está.
  const salida = conDobleEspacio('MX', 'cupon', 'codigoCupon', 'RAPPI  30');
  assert.ok(!salida.valido);
  assert.ok(salida.errores.some((e) => e.campo === 'codigoCupon'), JSON.stringify(salida.errores));
});

test('no cambia lo que ya salía bien: el documento de una solicitud limpia es el mismo', () => {
  const entrada = solicitud('CO', 'carrera_compras', {});
  const modelo = esquemaDe('carrera_compras').modelo;
  const antes = renderizar(modelo, entrada, pais('CO'), modelos);
  assert.deepStrictEqual(antes.errores, [], 'la base de la prueba debería generar sin errores');
  const despues = generarTexto(entrada, pais('CO'), modelos, CONTEXTO);
  assert.ok(despues.valido);
  assert.strictEqual(despues.texto, antes.texto);
});

// --- la red del motor se queda ---------------------------------------------------

test('la red del motor sigue frenando un doble espacio que no viene de una respuesta', () => {
  // Si un texto de modelos/ o un derivado dejara un doble espacio, tiene que
  // seguir frenándose: limpiar las respuestas no la debilita.
  const modelosRotos = {
    modelos: { roto: '§ Prueba. Esta frase  quedó con dos espacios.' },
    bloques: {},
  };
  const salida = renderizar('roto', {}, pais('CO'), modelosRotos);
  assert.ok(salida.errores.some((e) => /dos espacios seguidos/.test(e)), JSON.stringify(salida.errores));
});

// --- el servidor ---------------------------------------------------------------

test('el servidor genera, nombra y guarda con un solo espacio', () => {
  const mundo = levantarEntorno({});
  try {
    setup();
    const resultado = generar(solicitudValida({
      tienda: 'Mars   Incorporated',
      organizadorRazonSocial: 'Masterfoods  Colombia  Ltda.',
    }));

    assert.ok(resultado.valido, JSON.stringify(resultado.errores));
    // El nombre y el título van impresos y se vuelven el nombre del archivo en
    // Drive: tienen que salir con un solo espacio.
    assert.strictEqual(resultado.nombreCampana, 'Mars Incorporated · 20% Cashback · 20 sep 2026');
    assert.ok(!/ {2}/.test(resultado.titulo), resultado.titulo);

    // Y lo guardado es lo mismo que lo publicado, para que "Usar como base"
    // reabra la campaña como salió.
    const fila = leerSolicitudes()[0];
    const guardado = JSON.parse(fila.datos_json);
    assert.strictEqual(guardado.tienda, 'Mars Incorporated');
    assert.strictEqual(guardado.organizadorRazonSocial, 'Masterfoods Colombia Ltda.');
    assert.strictEqual(fila.resp_tienda, 'Mars Incorporated');
    assert.ok(mundo);
  } finally {
    require('./dobles/entorno.js').bajarEntorno();
  }
});

test('previsualizar también acepta los dobles espacios', () => {
  levantarEntorno({});
  try {
    setup();
    const salida = previsualizar(solicitudValida({ tienda: 'Mars   Incorporated' }));
    assert.ok(salida.valido, JSON.stringify(salida.errores));
    assert.ok(!/ {2}/.test(salida.texto));
  } finally {
    require('./dobles/entorno.js').bajarEntorno();
  }
});

// --- el navegador --------------------------------------------------------------

// Que limpiarEspacios llegue dentro de MotorCliente.html (frontera 2) se
// comprueba en pruebas/build.test.js, que es la que construye dist/. Aquí no se
// construye: las pruebas corren en paralelo y reconstruir dist/ desde dos
// archivos a la vez borra la carpeta mientras otra prueba la lee.

test('toda revisión, vista previa y envío del navegador usa la respuesta limpia', () => {
  // Una pantalla que se queda con estado.entrada() reabre el defecto: la
  // revisión diría "completo" y el servidor lo seguiría viendo distinto, o al
  // revés. Estos son los cinco sitios que miran la respuesta para decidir.
  const fs = require('node:fs');
  const cliente = path.join(__dirname, '..', 'src', 'client', 'js');
  const lee = (nombre) => fs.readFileSync(path.join(cliente, nombre), 'utf8');

  for (const [archivo, patron] of [
    ['60-flujo.js', /validarSolicitud\(\s*estado\.entrada(Limpia)?\(\)/],
    ['60-flujo.js', /renderizarVistaPrevia\([^)]*estado\.entrada(Limpia)?\(\)/],
    ['66-resumen.js', /validarSolicitud\(\s*estado\.entrada(Limpia)?\(\)/],
    ['66-resumen.js', /llamar\('generar',\s*estado\.entrada(Limpia)?\(\)/],
    ['50-campos.js', /calcularDerivados\(\s*estado\.entrada(Limpia)?\(\)/],
  ]) {
    const encontrado = patron.exec(lee(archivo));
    assert.ok(encontrado, archivo + ': no encontré ' + patron);
    assert.strictEqual(encontrado[1], 'Limpia', archivo + ' usa la respuesta cruda en ' + patron);
  }
});
