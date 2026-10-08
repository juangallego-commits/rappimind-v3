'use strict';

/**
 * La revisión de la Carrera de Compras (campaña Skindays de Kenvue).
 *
 * Informe: docs/revisiones/2026-09-29_carrera_compras_kenvue.md. Decisiones de
 * Juan del 8 de octubre de 2026. Cada bloque de pruebas lleva el código del
 * punto del informe que cuida (K1, H2, K9...).
 *
 * Se prueba el documento generado de verdad, no la función suelta: un derivado
 * que devuelve lo que le piden pasa igual con la frase rota puesta.
 */

const test = require('node:test');
const assert = require('node:assert');

const { rutaDesdeRaiz, leerJson } = require('../scripts/lib/archivos');
const { cargarModelos } = require('../scripts/lib/modelos');
const { generarTexto } = require('../src/core/generar.js');
const { calcularDerivados } = require('../src/core/derivados.js');
const { textoPlano, tiendasDeLaCarrera } = require('../src/core/texto.js');
const { validarSolicitud, parecenVariasTiendas } = require('../src/core/validaciones.js');
const { nombreDeCampana } = require('../src/core/nombres.js');
const { esquemaDe } = require('../src/core/esquemas.js');
const { respuestasParaElSheet, tiendaParaElSheet, tiendasCarreraLegibles } = require('../src/core/auditoria.js');
const { paraUsarComoBase } = require('../src/core/ampliacion.js');
const { solicitud } = require('./dobles/solicitudes.js');

const modelos = cargarModelos();
const { paises } = leerJson(rutaDesdeRaiz('data', 'paises.json'));
const pais = (codigo) => paises.find((p) => p.codigo === codigo);
const CONTEXTO = { fechaReferencia: '2026-09-16', usuarioEnEquipo: true };

/** Una Carrera de Colombia completa, con las respuestas que se quieran pisar. */
function carrera(respuestas, codigoPais) {
  return solicitud(codigoPais || 'CO', 'carrera_compras', respuestas);
}

function documento(respuestas, codigoPais) {
  const salida = generarTexto(carrera(respuestas, codigoPais), pais(codigoPais || 'CO'), modelos, CONTEXTO);
  assert.ok(salida.valido, 'no generó: ' + JSON.stringify(salida.errores));
  return textoPlano(salida.texto);
}

const EXITO_Y_CARULLA = [
  { nombre: 'Éxito', tiendaTurbo: 'normal' },
  { nombre: 'Carulla', tiendaTurbo: 'turbo' },
];
const TRES_TIENDAS = [
  { nombre: 'Éxito', tiendaTurbo: 'normal' },
  { nombre: 'Carulla', tiendaTurbo: 'ambas' },
  { nombre: 'Surtimax', tiendaTurbo: 'sin_turbo' },
];

// --- K1.a: una o varias Tiendas Participantes, con un solo ranking ---------------

test('K1.a: con una tienda, la cláusula de Cobertura sale como la del bloque compartido', () => {
  const texto = documento({ tiendasCarrera: [{ nombre: 'Carulla', tiendaTurbo: 'sin_turbo' }] });
  assert.ok(texto.includes(
    '2. Cobertura. La Campaña es válida exclusivamente en el territorio nacional de la República de Colombia ' +
    '(en adelante, el “Territorio”), dentro de las zonas de cobertura de Carulla ' +
    '(en adelante, la “Tienda Participante”) en la Plataforma Rappi. ' +
    'La disponibilidad puede variar según tu ubicación y los horarios de operación de la Tienda Participante.'
  ), texto.slice(0, 1500));
});

test('K1.a: con varias tiendas, la Cobertura las nombra y define a cada una y a todas', () => {
  const texto = documento({ tiendasCarrera: TRES_TIENDAS });
  assert.ok(texto.includes(
    'dentro de las zonas de cobertura de las tiendas Éxito, Carulla y Surtimax ' +
    '(en adelante, cada una, una “Tienda Participante” y, en conjunto, las “Tiendas Participantes”) en la Plataforma Rappi. ' +
    'La disponibilidad puede variar según tu ubicación y los horarios de operación de las Tiendas Participantes.'
  ), texto.slice(0, 1500));
});

test('K1.a: los cinco derivados de las tiendas, con una, dos y tres', () => {
  const co = pais('CO');
  const con = (tiendasCarrera) => calcularDerivados(carrera({ tiendasCarrera }), co);

  const una = con([{ nombre: 'Carulla', tiendaTurbo: 'sin_turbo' }]);
  assert.strictEqual(una.TEXTO_TIENDAS_PARTICIPANTES, '**Carulla** (en adelante, la “Tienda Participante”)');
  assert.strictEqual(una.LA_TIENDA, 'la Tienda Participante');
  assert.strictEqual(una.EN_LA_TIENDA, 'en la Tienda Participante');
  assert.strictEqual(una.TEXTO_ACUMULADO_TIENDAS, '');
  assert.strictEqual(una.TEXTO_TIENDA_TURBO, '');

  const dos = con(EXITO_Y_CARULLA);
  assert.strictEqual(dos.TEXTO_TIENDAS_PARTICIPANTES,
    'las tiendas **Éxito** y **Carulla** (en adelante, cada una, una “Tienda Participante” y, en conjunto, las “Tiendas Participantes”)');
  assert.strictEqual(dos.LA_TIENDA, 'las Tiendas Participantes');
  assert.strictEqual(dos.EN_LA_TIENDA, 'en cualquiera de las Tiendas Participantes');
  assert.strictEqual(dos.TEXTO_ACUMULADO_TIENDAS,
    'Los pedidos de Productos Participantes realizados en cualquiera de las Tiendas Participantes suman a un mismo acumulado por participante.');

  const tres = con(TRES_TIENDAS);
  assert.strictEqual(tres.TEXTO_TIENDAS_PARTICIPANTES,
    'las tiendas **Éxito**, **Carulla** y **Surtimax** (en adelante, cada una, una “Tienda Participante” y, en conjunto, las “Tiendas Participantes”)');
});

test('K1.a: la primera viñeta de la Mecánica y el párrafo del acumulado hablan de las tiendas', () => {
  const una = documento({ tiendasCarrera: [{ nombre: 'Carulla', tiendaTurbo: 'sin_turbo' }] });
  assert.ok(una.includes('• Realizar uno o más pedidos de Productos Participantes en la Tienda Participante a través de la Plataforma Rappi durante la vigencia de la Campaña.'));
  assert.ok(!una.includes('suman a un mismo acumulado'), 'con una tienda no hay frase del acumulado');

  const varias = documento({ tiendasCarrera: EXITO_Y_CARULLA });
  assert.ok(varias.includes('• Realizar uno o más pedidos de Productos Participantes en cualquiera de las Tiendas Participantes a través de la Plataforma Rappi durante la vigencia de la Campaña.'));
  assert.ok(varias.includes('no suman al acumulado. Los pedidos de Productos Participantes realizados en cualquiera de las Tiendas Participantes suman a un mismo acumulado por participante.'));
});

test('K1.a: la frase de los productos usa la forma de una o de varias tiendas', () => {
  const casos = [
    [{ productos: 'todos' },
      (t) => `todos los productos del catálogo de ${t} en la Plataforma Rappi`],
    [{ productos: 'marca', makerMarca: 'NEUTROGENA' },
      (t, en) => `únicamente los productos de la marca NEUTROGENA disponibles ${en} a través de la Plataforma Rappi`],
    [{ productos: 'especificos', productosDetalle: [{ nombre: 'Crema', ean: '7702001008285' }] },
      (t) => `únicamente los siguientes productos de ${t}, identificados con su nombre y su código de barras EAN`],
  ];
  for (const [respuestas, frase] of casos) {
    const una = documento(Object.assign({ tiendasCarrera: [{ nombre: 'Carulla', tiendaTurbo: 'sin_turbo' }] }, respuestas));
    assert.ok(una.includes(frase('la Tienda Participante', 'en la Tienda Participante')), 'una: ' + JSON.stringify(respuestas));
    const varias = documento(Object.assign({ tiendasCarrera: EXITO_Y_CARULLA }, respuestas));
    assert.ok(varias.includes(frase('las Tiendas Participantes', 'en cualquiera de las Tiendas Participantes')), 'varias: ' + JSON.stringify(respuestas));
  }
});

// --- K1.b: Turbo, tienda por tienda ---------------------------------------------

test('K1.b: la frase de Turbo de cada opción, con una tienda y con tres', () => {
  const co = pais('CO');
  const turbo = (tiendasCarrera) => calcularDerivados(carrera({ tiendasCarrera }), co).TEXTO_TIENDA_TURBO;

  assert.strictEqual(turbo([{ nombre: 'Éxito', tiendaTurbo: 'normal' }]),
    'En la Tienda Participante, solo suman al acumulado los pedidos realizados por fuera del botón “Turbo” de la Plataforma Rappi.');
  assert.strictEqual(turbo([{ nombre: 'Éxito', tiendaTurbo: 'turbo' }]),
    'En la Tienda Participante, solo suman al acumulado los pedidos realizados dentro del botón “Turbo” de la Plataforma Rappi.');
  assert.strictEqual(turbo([{ nombre: 'Éxito', tiendaTurbo: 'ambas' }]),
    'En la Tienda Participante, suman al acumulado los pedidos realizados tanto dentro como por fuera del botón “Turbo” de la Plataforma Rappi.');
  assert.strictEqual(turbo([{ nombre: 'Éxito', tiendaTurbo: 'sin_turbo' }]), '');

  assert.strictEqual(turbo(TRES_TIENDAS),
    'En **Éxito**, solo suman al acumulado los pedidos realizados por fuera del botón “Turbo” de la Plataforma Rappi. ' +
    'En **Carulla**, suman al acumulado los pedidos realizados tanto dentro como por fuera del botón “Turbo” de la Plataforma Rappi.');
  assert.strictEqual(turbo([
    { nombre: 'Éxito', tiendaTurbo: 'turbo' }, { nombre: 'Jumbo', tiendaTurbo: 'sin_turbo' }, { nombre: 'Metro', tiendaTurbo: 'normal' },
  ]),
  'En **Éxito**, solo suman al acumulado los pedidos realizados dentro del botón “Turbo” de la Plataforma Rappi. ' +
  'En **Metro**, solo suman al acumulado los pedidos realizados por fuera del botón “Turbo” de la Plataforma Rappi.');
});

test('K1.b: así queda la cláusula de Productos participantes en la campaña de Kenvue', () => {
  const texto = documento({ tiendasCarrera: EXITO_Y_CARULLA, productos: 'marca', makerMarca: 'NEUTROGENA®' });
  assert.ok(texto.includes(
    'En Éxito, solo suman al acumulado los pedidos realizados por fuera del botón “Turbo” de la Plataforma Rappi. ' +
    'En Carulla, solo suman al acumulado los pedidos realizados dentro del botón “Turbo” de la Plataforma Rappi. ' +
    'Los Productos Participantes son ofrecidos y comercializados directamente por las Tiendas Participantes, y no por Rappi.'
  ), texto.slice(0, 3000));
  const clausula = texto.split('\n').filter((l) => l.startsWith('6. Productos participantes.'))[0];
  assert.ok(clausula && !clausula.includes('Aliados Comerciales'), 'la cláusula 6 ya no menciona a los Aliados Comerciales');
});

test('K1.b: sin respuesta de Turbo la cláusula no deja espacios sobrantes', () => {
  const texto = documento({ tiendasCarrera: [{ nombre: 'Carulla', tiendaTurbo: 'sin_turbo' }] });
  assert.ok(texto.includes('(en adelante, los “Productos Participantes”). Los Productos Participantes son ofrecidos y comercializados directamente por la Tienda Participante, y no por Rappi.'));
  assert.ok(!/ {2}| \./.test(texto));
});

// --- K1.c: el bloque compartido ---------------------------------------------------

test('K1.c: Cashback, Descuento y Cupón ya no dicen "los Aliados Comerciales" en los horarios', () => {
  for (const [codigoPais, tipo] of [['CO', 'cashback'], ['MX', 'descuento'], ['MX', 'cupon']]) {
    const salida = generarTexto(solicitud(codigoPais, tipo, {}), pais(codigoPais), modelos, CONTEXTO);
    assert.ok(salida.valido, tipo + ': ' + JSON.stringify(salida.errores));
    assert.ok(textoPlano(salida.texto).includes('los horarios de operación de la Tienda Participante.'), tipo);
    assert.ok(!textoPlano(salida.texto).includes('los horarios de operación de los Aliados Comerciales'), tipo);
  }
});

// --- La revisión del formulario: Turbo y Éxito en una sola fila ---------------------

test('K1.a: "Turbo y Éxito" en una sola fila se frena, y se sigue si el comercial confirma que es una', () => {
  const entrada = carrera({ tiendasCarrera: [{ nombre: 'Turbo y Éxito', tiendaTurbo: 'ambas' }] });
  const frenada = validarSolicitud(entrada, pais('CO'), CONTEXTO);
  assert.strictEqual(frenada.valido, false);
  assert.ok(frenada.errores.some((e) => e.campo === 'tiendasCarrera' &&
    e.mensaje.includes('Parece que escribiste más de una tienda en la misma fila. Agrega cada tienda en su propia fila.')),
  JSON.stringify(frenada.errores));

  const confirmada = carrera({ tiendasCarrera: [{ nombre: 'Turbo y Éxito', tiendaTurbo: 'ambas', unaSola: true }] });
  const sigue = validarSolicitud(confirmada, pais('CO'), CONTEXTO);
  assert.ok(sigue.valido, JSON.stringify(sigue.errores));
});

test('K1.a: qué nombres parecen más de una tienda', () => {
  for (const parece of ['Turbo y Éxito', 'Éxito, Carulla', 'Éxito / Carulla', 'Éxito + Carulla', 'Carulla Turbo', 'Turbo Éxito', 'Éxito; Jumbo']) {
    assert.strictEqual(parecenVariasTiendas(parece), true, parece);
  }
  for (const sola of ['Éxito', 'Carulla', 'Pollo Dorado', 'Farmacias del Sol', "Domino's Pizza", 'Johnson & Johnson', 'Turbo']) {
    assert.strictEqual(parecenVariasTiendas(sola), false, sola);
  }
});

test('K1.a: la lista de tiendas se revisa entera', () => {
  const co = pais('CO');
  const errores = (tiendasCarrera) => validarSolicitud(carrera({ tiendasCarrera }), co, CONTEXTO).errores
    .filter((e) => e.campo === 'tiendasCarrera').map((e) => e.mensaje);

  assert.deepStrictEqual(errores([]), ['Agrega al menos una tienda.']);
  assert.deepStrictEqual(errores([{ nombre: '   ', tiendaTurbo: 'normal' }]), ['Agrega al menos una tienda.']);
  assert.ok(errores([{ nombre: 'Éxito', tiendaTurbo: '' }])[0].includes('Dinos en cuál de sus tiendas cuentan los pedidos.'));
  assert.ok(errores([{ nombre: 'Éxito', tiendaTurbo: 'otra' }])[0].includes('Dinos en cuál de sus tiendas'));
  assert.ok(errores([{ nombre: 'Éxito', tiendaTurbo: 'normal' }, { nombre: 'exito', tiendaTurbo: 'turbo' }])[0].includes('Esa tienda ya está en la lista.'));
  assert.ok(errores([{ nombre: 'Éxito', tiendaTurbo: 'normal' }, { nombre: '', tiendaTurbo: 'turbo' }])[0].includes('falta el nombre'));

  const once = [];
  for (let i = 1; i <= 11; i += 1) once.push({ nombre: 'Tienda ' + i, tiendaTurbo: 'normal' });
  assert.deepStrictEqual(errores(once), ['No puedes agregar más de 10 tiendas.']);
  assert.deepStrictEqual(errores(once.slice(0, 10)), []);
});

// --- Lo guardado antes sigue sirviendo --------------------------------------------

test('K1.a: una Carrera guardada con la tienda como texto se lee como una lista de una fila', () => {
  const guardada = carrera({});
  delete guardada.tiendasCarrera;
  guardada.tienda = 'Carulla';

  assert.deepStrictEqual(tiendasDeLaCarrera(guardada), [{ nombre: 'Carulla', tiendaTurbo: 'sin_turbo', unaSola: true }]);

  // Ampliar vuelve a validar y a generar el documento completo con lo guardado.
  const ampliada = generarTexto(guardada, pais('CO'), modelos, Object.assign({ ampliacion: true }, CONTEXTO));
  assert.ok(ampliada.valido, JSON.stringify(ampliada.errores));
  const texto = textoPlano(ampliada.texto);
  assert.ok(texto.includes('dentro de las zonas de cobertura de Carulla (en adelante, la “Tienda Participante”)'));
  assert.ok(!texto.includes('botón “Turbo”'), 'el documento de antes no decía nada de Turbo');

  // El historial muestra el nombre, y la columna del Sheet lo trae igual.
  const esquema = esquemaDe('carrera_compras');
  assert.strictEqual(tiendaParaElSheet(guardada, esquema), 'Carulla');
  assert.strictEqual(nombreDeCampana(guardada, esquema), 'Carulla · Carrera de Compras · 20 sep 2026'.replace('20 sep', '1 oct'));
});

test('K1.a: "Usar como base" abre una Carrera vieja con la tienda ya escrita y Turbo en blanco', () => {
  const base = paraUsarComoBase({ tipo: 'carrera_compras', tienda: 'Turbo y Éxito', sufijoNombre: 2 });
  assert.deepStrictEqual(base.tiendasCarrera, [{ nombre: 'Turbo y Éxito', tiendaTurbo: '', unaSola: false }]);
  assert.strictEqual(base.sufijoNombre, undefined);

  // Una Carrera nueva conserva su lista, y los demás tipos no se tocan.
  assert.deepStrictEqual(paraUsarComoBase({ tipo: 'carrera_compras', tiendasCarrera: EXITO_Y_CARULLA }).tiendasCarrera, EXITO_Y_CARULLA);
  assert.strictEqual(paraUsarComoBase({ tipo: 'cashback', tienda: 'Jumbo' }).tiendasCarrera, undefined);
});

// --- El nombre de registro, el Sheet y la auditoría ---------------------------------

test('K1.a: el nombre de registro con varias tiendas las nombra todas, y con una no cambia', () => {
  const esquema = esquemaDe('carrera_compras');
  const base = { tipo: 'carrera_compras', fechaInicio: '2026-10-15' };
  assert.strictEqual(nombreDeCampana(Object.assign({ tiendasCarrera: [{ nombre: 'Carulla' }] }, base), esquema),
    'Carulla · Carrera de Compras · 15 oct 2026');
  assert.strictEqual(nombreDeCampana(Object.assign({ tiendasCarrera: EXITO_Y_CARULLA }, base), esquema),
    'Éxito y Carulla · Carrera de Compras · 15 oct 2026');
  assert.strictEqual(nombreDeCampana(Object.assign({ tiendasCarrera: TRES_TIENDAS }, base), esquema),
    'Éxito, Carulla y Surtimax · Carrera de Compras · 15 oct 2026');
});

test('K1.a: la columna tienda de Solicitudes guarda los nombres separados por coma', () => {
  const esquema = esquemaDe('carrera_compras');
  const entrada = carrera({ tiendasCarrera: EXITO_Y_CARULLA });
  assert.strictEqual(tiendaParaElSheet(entrada, esquema), 'Éxito, Carulla');
  assert.strictEqual(tiendaParaElSheet({ tipo: 'cashback', tienda: 'Jumbo' }, esquemaDe('cashback')), 'Jumbo');
  assert.strictEqual(tiendaParaElSheet({ tipo: 'cashback_day', tienda: 'Viejo' }, esquemaDe('cashback_day')), '');

  // La respuesta legible no es "[object Object]".
  assert.strictEqual(tiendasCarreraLegibles(entrada), 'Éxito · Solo en la tienda normal\nCarulla · Solo en la tienda de Turbo');
  assert.strictEqual(respuestasParaElSheet(entrada).resp_tiendasCarrera, 'Éxito · Solo en la tienda normal\nCarulla · Solo en la tienda de Turbo');
});

// --- El servidor: lo que se guarda en Solicitudes ---------------------------------

test('K1.a: el servidor genera una Carrera con dos tiendas y guarda sus nombres en la columna tienda', () => {
  const { levantarEntorno, bajarEntorno } = require('./dobles/entorno.js');
  levantarEntorno({});
  try {
    setup();
    const resultado = generar(carrera({ tiendasCarrera: EXITO_Y_CARULLA }));
    assert.ok(resultado.valido, JSON.stringify(resultado.errores));
    assert.strictEqual(resultado.nombreCampana, 'Éxito y Carulla · Carrera de Compras · 1 oct 2026');

    const fila = leerSolicitudes()[0];
    assert.strictEqual(fila.tienda, 'Éxito, Carulla');
    assert.strictEqual(fila.resp_tiendasCarrera, 'Éxito · Solo en la tienda normal\nCarulla · Solo en la tienda de Turbo');
    // La respuesta cruda sigue siendo la lista, para poder regenerar el documento idéntico.
    assert.deepStrictEqual(JSON.parse(fila.datos_json).tiendasCarrera, EXITO_Y_CARULLA.map((t) => Object.assign({}, t)));

    // El historial no devuelve fechas ni listas aplanadas por error.
    const historia = historial('');
    assert.strictEqual(historia[0].tienda, 'Éxito, Carulla');

    // Y reabrirla con "Usar como base" devuelve la lista, no el texto.
    const base = datosDeSolicitud(fila.id);
    assert.ok(base.valido);
    assert.deepStrictEqual(base.entrada.tiendasCarrera.map((t) => t.nombre), ['Éxito', 'Carulla']);
  } finally {
    bajarEntorno();
  }
});

/** Un documento sin restos de marcadores vacíos: espacios dobles, espacios antes de signo o viñetas vacías. */
function assertSinRestos(texto, etiqueta) {
  assert.ok(!/ {2}/.test(texto), etiqueta + ': hay dos espacios seguidos');
  assert.ok(!/ [.,;:]/.test(texto), etiqueta + ': hay un espacio antes de un signo');
  assert.ok(!/^•\s*$/m.test(texto), etiqueta + ': hay una viñeta vacía');
  assert.ok(!texto.includes('{{') && !texto.includes('[['), etiqueta + ': quedó una marca sin resolver');
}

// --- H2: lo que Rappi hace en la Carrera, "por cuenta del Organizador" --------------

test('H2: el papel de Rappi en la Carrera según el premio y quién lo entrega', () => {
  const abre = 'actúa únicamente como plataforma de contacto e intermediación tecnológica y como medio de difusión de la Campaña';
  const cierra = '; Rappi no es el organizador de la Campaña.';
  const casos = [
    [{ tipoPremio: 'creditos', creditosPremio: 500000 },
      ', y, por cuenta del Organizador, como operador de la mecánica del concurso y de la acreditación del premio'],
    [{ tipoPremio: 'fisico', descripcionPremio: 'Una bicicleta', valorPremio: 1200000, entregaPor: 'organizador' },
      ', y, por cuenta del Organizador, como operador de la mecánica del concurso'],
    [{ tipoPremio: 'fisico', descripcionPremio: 'Una bicicleta', valorPremio: 1200000, entregaPor: 'rappi' },
      ', y, por cuenta del Organizador, como operador de la mecánica del concurso y de la entrega del premio'],
  ];
  for (const [respuestas, rol] of casos) {
    const texto = documento(respuestas);
    assert.ok(texto.includes(abre + rol + cierra), JSON.stringify(respuestas) + ': ' + texto.slice(0, 900));
    assertSinRestos(texto, JSON.stringify(respuestas));
  }
});

test('H2: Cashback, Descuento y Cupón siguen diciendo lo mismo de Rappi', () => {
  const igual = 'actúa únicamente como plataforma de contacto e intermediación tecnológica y como medio de difusión de la Campaña; Rappi no es el organizador de la Campaña.';
  for (const [codigoPais, tipo] of [['CO', 'cashback'], ['MX', 'descuento'], ['MX', 'cupon']]) {
    const salida = generarTexto(solicitud(codigoPais, tipo, {}), pais(codigoPais), modelos, CONTEXTO);
    assert.ok(salida.valido, tipo);
    assert.ok(textoPlano(salida.texto).includes(igual), tipo);
  }
});

// --- H3: premio físico que entrega Rappi, sin cláusulas que se contradigan -------------

test('H3: la naturaleza del premio físico dice quién responde del bien y quién de la logística', () => {
  const fisico = { tipoPremio: 'fisico', descripcionPremio: 'Una máscara facial', valorPremio: 1599900 };

  const rappi = documento(Object.assign({ entregaPor: 'rappi' }, fisico));
  assert.ok(rappi.includes(
    'El premio consiste en un bien de carácter físico, cuya existencia, calidad y garantía son responsabilidad exclusiva del Organizador. ' +
    'Rappi no fabrica, comercializa ni garantiza dicho bien, y gestiona su entrega únicamente como operador logístico por cuenta del Organizador, en los términos de la cláusula siguiente.'));
  assert.ok(!rappi.includes('garantía y entrega son responsabilidad exclusiva del Organizador'),
    'la entrega que gestiona Rappi no puede ser "responsabilidad exclusiva del Organizador"');

  const organizador = documento(Object.assign({ entregaPor: 'organizador' }, fisico));
  assert.ok(organizador.includes(
    'El premio consiste en un bien de carácter físico, cuya existencia, calidad, garantía y entrega son responsabilidad exclusiva del Organizador. Rappi no fabrica, comercializa ni garantiza dicho bien.'));
  assert.ok(!organizador.includes('gestiona su entrega únicamente como operador logístico'));
});

test('H3: la cláusula de responsabilidades separa el bien del Organizador de la logística de Rappi', () => {
  const esperado =
    'La existencia, calidad, idoneidad y garantía del premio corresponden al Organizador, y Rappi no responde por ellas ni por la entrega del premio cuando esta esté a cargo del Organizador. ' +
    'Rappi es responsable de: (i) la aplicación del criterio de selección de ganadores con base en la información transaccional de la Plataforma Rappi; ' +
    '(ii) la publicación veraz y completa de los presentes Términos y Condiciones; ' +
    '(iii) la atención oportuna de tus peticiones, quejas y reclamos relacionados con la Campaña; ' +
    'y (iv) la acreditación del premio en Créditos o la gestión logística de la entrega del premio físico, cuando Rappi las realice por cuenta del Organizador.';
  for (const respuestas of [
    { tipoPremio: 'creditos', creditosPremio: 500000 },
    { tipoPremio: 'fisico', descripcionPremio: 'Una bicicleta', valorPremio: 1200000, entregaPor: 'rappi' },
    { tipoPremio: 'fisico', descripcionPremio: 'Una bicicleta', valorPremio: 1200000, entregaPor: 'organizador' },
  ]) {
    assert.ok(documento(respuestas).includes('Responsabilidades frente al premio. ' + esperado), JSON.stringify(respuestas));
  }
});
