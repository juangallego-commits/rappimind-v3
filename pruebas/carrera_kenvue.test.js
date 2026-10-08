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
  assert.ok(varias.includes('Los pedidos de Productos Participantes realizados en cualquiera de las Tiendas Participantes suman a un mismo acumulado por participante.'));
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

// --- K9: el premio pasa al siguiente del ranking, con requisitos y con final ---------------

test('K9: la viñeta de Aceptación dice lo que el informe aprobó, con los números del KAM', () => {
  const texto = documento({ intentosContacto: 3, diasDesierto: 30, plazoConfirmacion: 8 });
  assert.ok(texto.includes(
    '• Aceptación: el ganador deberá aceptar el premio, confirmar sus datos y su dirección de entrega cuando corresponda, ' +
    'y acreditar su identidad y su mayoría de edad con su documento de identidad, dentro de un plazo de ocho (8) días hábiles a partir de la notificación. ' +
    'Al aceptar el premio, el ganador declara que cumple los requisitos para participar y que no se encuentra en ninguno de los casos de la cláusula “Quiénes no pueden participar”. ' +
    'Si Rappi no logra contactarlo después de al menos tres (3) intentos realizados en días hábiles distintos, o si no acepta el premio, no confirma sus datos o no acredita su identidad dentro de ese plazo, ' +
    'perderá el derecho al premio, y este se asignará al siguiente participante del ranking que cumpla los requisitos de la Campaña, de forma sucesiva y con el mismo plazo para aceptarlo. ' +
    'Si dentro de los treinta (30) días calendario siguientes a la fecha de notificación indicada en esta cláusula ningún participante acepta el premio, este se declarará desierto.'
  ), texto.slice(texto.indexOf('Aceptación'), texto.indexOf('Aceptación') + 1500));
  assert.ok(!texto.includes('intentos razonables') && !texto.includes('podrá asignarse'));
});

test('K9: los intentos de contacto con uno y con varios', () => {
  const co = pais('CO');
  const con = (intentosContacto) => calcularDerivados(carrera({ intentosContacto }), co).TEXTO_INTENTOS_CONTACTO;
  assert.strictEqual(con(1), 'al menos un (1) intento de contacto');
  assert.strictEqual(con(2), 'al menos dos (2) intentos realizados en días hábiles distintos');
  assert.strictEqual(con(3), 'al menos tres (3) intentos realizados en días hábiles distintos');
  assert.strictEqual(con(5), 'al menos cinco (5) intentos realizados en días hábiles distintos');

  const uno = documento({ intentosContacto: 1 });
  assert.ok(uno.includes('Si Rappi no logra contactarlo después de al menos un (1) intento de contacto, o si no acepta'));
});

test('K9: los días para declarar desierto llevan el término de días de cada país', () => {
  const dias = (codigoPais, n) => calcularDerivados(carrera({ diasDesierto: n }, codigoPais), pais(codigoPais)).DIAS_DESIERTO;
  assert.strictEqual(dias('CO', 30), 'treinta (30) días calendario');
  assert.strictEqual(dias('MX', 30), 'treinta (30) días naturales');
  assert.strictEqual(dias('AR', 30), 'treinta (30) días corridos');
  assert.strictEqual(dias('CO', 15), 'quince (15) días calendario');
  assert.strictEqual(dias('MX', 90), 'noventa (90) días naturales');

  // El documento de México no trae nada colombiano en la viñeta nueva.
  const mx = documento({ diasDesierto: 45 }, 'MX');
  assert.ok(mx.includes('Si dentro de los cuarenta y cinco (45) días naturales siguientes a la fecha de notificación'));
  assert.ok(!/días calendario/.test(mx.slice(mx.indexOf('Aceptación'), mx.indexOf('Aceptación') + 1800)));
});

test('K9: las dos preguntas nuevas son obligatorias y tienen su rango', () => {
  const co = pais('CO');
  const errores = (cambios) => validarSolicitud(carrera(cambios), co, CONTEXTO).errores.map((e) => e.campo + ': ' + e.mensaje);
  const sin = carrera({});
  delete sin.intentosContacto;
  delete sin.diasDesierto;
  const faltan = validarSolicitud(sin, co, CONTEXTO).errores.map((e) => e.campo);
  assert.ok(faltan.includes('intentosContacto') && faltan.includes('diasDesierto'), faltan.join(','));

  assert.ok(errores({ intentosContacto: 0 }).some((e) => e.startsWith('intentosContacto')));
  assert.ok(errores({ intentosContacto: 6 }).some((e) => e.startsWith('intentosContacto: Los intentos de contacto van de 1 a 5.')));
  assert.ok(errores({ diasDesierto: 14 }).some((e) => e.startsWith('diasDesierto: El plazo para declarar desierto el premio va de 15 a 90 días.')));
  assert.ok(errores({ diasDesierto: 91 }).some((e) => e.startsWith('diasDesierto')));
  assert.ok(!errores({ intentosContacto: 5, diasDesierto: 90 }).some((e) => /^(intentosContacto|diasDesierto)/.test(e)));
});

test('K9: avisa, sin bloquear, si el plazo para declarar desierto es menor que tres veces el de aceptar', () => {
  const { avisoDeDiasDesierto } = require('../src/core/validaciones.js');
  const frase = 'Con ese plazo casi no alcanza a pasar el premio al siguiente del ranking.';
  assert.strictEqual(avisoDeDiasDesierto({ plazoConfirmacion: 8, diasDesierto: 20 }), frase);
  assert.strictEqual(avisoDeDiasDesierto({ plazoConfirmacion: 8, diasDesierto: 24 }), '');
  assert.strictEqual(avisoDeDiasDesierto({ plazoConfirmacion: 5, diasDesierto: 30 }), '');
  assert.strictEqual(avisoDeDiasDesierto({ plazoConfirmacion: 5 }), '');

  // No es un error: la campaña con ese plazo genera igual.
  const salida = generarTexto(carrera({ plazoConfirmacion: 10, diasDesierto: 20 }), pais('CO'), modelos, CONTEXTO);
  assert.ok(salida.valido, JSON.stringify(salida.errores));
});

// --- H8: quien participa es el titular de la cuenta ---------------------------------

test('H8: el participante es titular de la cuenta y hace los pedidos desde ella', () => {
  const texto = documento({});
  assert.ok(texto.includes('• Ser titular de una cuenta activa en la Plataforma Rappi y realizar los pedidos desde esa cuenta.'));
  assert.ok(!texto.includes('• Tener una cuenta activa en la Plataforma Rappi.'));
  // En México la viñeta no cambia de país: es la misma, no trae nada colombiano.
  assert.ok(documento({}, 'MX').includes('• Ser titular de una cuenta activa en la Plataforma Rappi y realizar los pedidos desde esa cuenta.'));
});

// --- K8 y H13: cómo se avisa al ganador ---------------------------------------------

test('K8 y H13: el aviso nombra la cuenta en la Plataforma Rappi, y la llamada se confirma por escrito', () => {
  const aviso = (medioNotificacion) => documento({ medioNotificacion });
  assert.ok(aviso('correo').includes(
    'mediante el correo electrónico registrado en la cuenta del ganador en la Plataforma Rappi, a más tardar el'));
  assert.ok(aviso('llamada').includes(
    'mediante una llamada telefónica al número registrado en la cuenta del ganador en la Plataforma Rappi, ' +
    'que se confirmará por escrito al correo electrónico registrado en esa cuenta, a más tardar el'));
  // La notificación dentro de la Plataforma no cambia.
  assert.ok(aviso('plataforma').includes('mediante una notificación dentro de la Plataforma Rappi, a más tardar el'));
});

// --- K11 y H10: modificar un concurso ya iniciado ---------------------------------------

test('K11 y H10: la Carrera lleva su propio bloque de modificaciones', () => {
  const texto = documento({});
  assert.ok(texto.includes(
    'Modificaciones. El Organizador, de común acuerdo con Rappi, podrá modificar los presentes Términos y Condiciones siempre que se cumplan las siguientes condiciones:'));
  assert.ok(texto.includes('• Las modificaciones no afectarán los premios ya asignados con anterioridad a la modificación.'));
  assert.ok(texto.includes('• Una vez iniciada la vigencia, no se reducirán el premio ni el número de ganadores, no se retirarán Productos Participantes ni Tiendas Participantes, ' +
    'no se agregarán requisitos para participar o para sumar al acumulado, no se cambiará el criterio del ranking y no se anticipará la fecha de finalización de la Campaña.'));
  assert.ok(texto.includes('Si las modificaciones implican un cambio sustancial en las condiciones de la Campaña, Rappi hará esfuerzos razonables para informarte a través de los canales disponibles en la Plataforma Rappi.'));
  // La voz sigue siendo de tú, como el resto del documento.
  assert.ok(texto.includes('menos favorables para ti'));
  assert.ok(!texto.includes('como la reducción del beneficio o del premio'));
  assertSinRestos(texto, 'carrera');
});

test('K11 y H10: el bloque nuevo es solo de la Carrera y el compartido no cambia', () => {
  const { inclusionesDe } = require('../scripts/lib/modelos');
  const quienes = (bloque) => Object.keys(modelos.modelos).filter((m) => inclusionesDe(modelos.modelos[m]).includes(bloque)).sort();
  assert.deepStrictEqual(quienes('modificaciones_concurso'), ['carrera_compras']);
  assert.deepStrictEqual(quienes('modificaciones'), ['cashback', 'cashback_day', 'cupon', 'descuento']);

  const viejo = 'Rappi podrá modificar los presentes Términos y Condiciones siempre que se cumplan las siguientes condiciones:';
  for (const [codigoPais, tipo] of [['CO', 'cashback'], ['CO', 'cashback_day'], ['MX', 'descuento'], ['MX', 'cupon']]) {
    const salida = generarTexto(solicitud(codigoPais, tipo, {}), pais(codigoPais), modelos, CONTEXTO);
    assert.ok(salida.valido, tipo);
    const plano = textoPlano(salida.texto);
    assert.ok(plano.includes(viejo), tipo);
    assert.ok(plano.includes('como la reducción del beneficio o del premio, la modificación de los comercios o productos participantes o la anticipación de la fecha de finalización'), tipo);
  }
});

// --- H5: un pedido entregado de manera parcial suma por lo entregado ----------------------

test('H5: la cancelación parcial ya no saca el pedido entero del acumulado', () => {
  const texto = documento({});
  assert.ok(texto.includes('• Recibir los pedidos de manera exitosa.\n'));
  assert.ok(!texto.includes('sin cancelaciones totales ni parciales'));
  assert.ok(texto.includes(
    'El concurso consiste en acumular el mayor valor total en compras de Productos Participantes durante la vigencia de la Campaña. ' +
    'Los pedidos cancelados en su totalidad, ya sea por el Usuario/Consumidor, por el Aliado Comercial o por el Repartidor Independiente, no suman al acumulado. ' +
    'Si un pedido se entrega de manera parcial, suma al acumulado solo por los Productos Participantes efectivamente entregados y pagados, y cuenta como pedido siempre que incluya al menos uno de ellos.'));
  assert.ok(texto.includes('• Los pedidos cancelados en su totalidad, los productos devueltos y los pedidos que no se entreguen por cualquier causa.'));
  assert.ok(!texto.includes('cancelados total o parcialmente'));
  assertSinRestos(texto, 'carrera');
});

test('H5: con varias tiendas la frase del acumulado va después de la del pedido parcial', () => {
  const texto = documento({ tiendasCarrera: EXITO_Y_CARULLA });
  assert.ok(texto.includes('y cuenta como pedido siempre que incluya al menos uno de ellos. Los pedidos de Productos Participantes realizados en cualquiera de las Tiendas Participantes suman a un mismo acumulado por participante.'));
  assertSinRestos(texto, 'varias tiendas');
});

// --- H7: Pedido Válido definido, y la verificación descuenta en vez de descartar ---------------------

test('H7: "Pedidos Válidos" se define al final de la Mecánica y el criterio de más pedidos lo usa', () => {
  const texto = documento({ criterioGanador: 'mas_pedidos', desempate: 'mayor_valor' });
  assert.ok(texto.includes('Para efectos del concurso, se entiende por “Pedidos Válidos” los pedidos que cumplan las condiciones de esta cláusula y no estén comprendidos en la cláusula de exclusiones.'));
  assert.ok(texto.includes('acumular el mayor número de Pedidos Válidos con Productos Participantes durante la vigencia de la Campaña.'));
  assert.ok(!texto.includes('pedidos válidos'), 'quedó "pedidos válidos" en minúscula');
  // La definición va después del párrafo del acumulado, dentro de la misma cláusula.
  assert.ok(texto.indexOf('se entiende por “Pedidos Válidos”') > texto.indexOf('Selección de ganadores') - 600);
  assert.ok(texto.indexOf('se entiende por “Pedidos Válidos”') < texto.indexOf('Selección de ganadores'));
});

test('H7: la verificación descuenta el pedido inválido y reserva la descalificación para quien no cumple o comete fraude', () => {
  const uno = documento({ numeroGanadores: 1 });
  assert.ok(uno.includes(
    'Antes de declarar al ganador, Rappi verificará la elegibilidad de cada participante y de cada pedido. ' +
    'Los pedidos que no sean Pedidos Válidos se descontarán del acumulado y el ranking se recalculará. ' +
    'Si la verificación determina que un participante no cumple los requisitos para participar o incurrió en alguna de las conductas de la cláusula de fraude, abuso y descalificación, ' +
    'no será considerado ganador y se le informará a través de la Plataforma Rappi. ' +
    'En todos los casos en que un participante no sea declarado ganador o pierda el derecho al premio, ocupará su lugar el siguiente participante del ranking que cumpla los requisitos de la Campaña.'));
  assert.ok(!uno.includes('o sus pedidos no cumplen las condiciones de la Campaña'));

  const varios = documento({ numeroGanadores: 3 });
  assert.ok(varios.includes('Antes de declarar a los ganadores, Rappi verificará'));
});

// --- H4: el desempate dice de qué, qué pasa si persiste y qué hora cuenta ----------------------

test('H4: los tres desempates dicen "de Productos Participantes", cierran el empate y cuentan la entrega', () => {
  const persiste = 'Si el empate persiste, ganará el participante que haya alcanzado primero el resultado empatado, según la fecha y hora de entrega de su último Pedido Válido registradas en la Plataforma Rappi.';
  const primero = 'En caso de empate, ganará el participante que haya alcanzado primero el resultado empatado, según la fecha y hora de entrega de su último Pedido Válido registradas en la Plataforma Rappi.';

  const porPedidos = documento({ criterioGanador: 'mayor_valor', desempate: 'mas_pedidos' });
  assert.ok(porPedidos.includes('En caso de empate, ganará el participante con el mayor número de Pedidos Válidos con Productos Participantes durante la vigencia. ' + persiste));

  const porValor = documento({ criterioGanador: 'mas_pedidos', desempate: 'mayor_valor' });
  assert.ok(porValor.includes('En caso de empate, ganará el participante con el mayor valor total en compras de Productos Participantes durante la vigencia. ' + persiste));

  const alFinal = documento({ criterioGanador: 'mayor_valor', desempate: 'primero' });
  assert.ok(alFinal.includes(primero));

  for (const texto of [porPedidos, porValor, alFinal]) {
    assert.ok(!texto.includes('último pedido válido'), 'quedó "pedido válido" en minúscula');
    assert.ok(!texto.includes('durante la vigencia.') || texto.includes('Productos Participantes durante la vigencia.'));
    assertSinRestos(texto, 'desempate');
  }
});

// --- H6: devoluciones y reversiones después de armado el ranking -------------------------------------

test('H6: lo que se devuelve o se reversa después del ranking se recalcula', () => {
  const texto = documento({});
  assert.ok(texto.includes(
    'ocupará su lugar el siguiente participante del ranking que cumpla los requisitos de la Campaña. ' +
    'Si antes de la entrega del premio se cancela o se devuelve un pedido que sumó al acumulado de un ganador, o se reversa su pago, ' +
    'el acumulado se recalculará y, si el participante deja de ocupar una posición ganadora, perderá el derecho al premio.'));
  assertSinRestos(texto, 'carrera');
});

// --- H12: el premio físico tiene plazo, costo y lugar de entrega ------------------------------------

test('H12: el premio físico dice cuánto tarda, que no cuesta y dónde se entrega', () => {
  const fisico = { tipoPremio: 'fisico', descripcionPremio: 'Una máscara facial', valorPremio: 1599900 };
  const frase = (dias) => 'El premio se entregará sin costo para el ganador, en la dirección que confirme dentro del Territorio, a más tardar dentro de los ' + dias + ' días hábiles siguientes a su aceptación.';

  for (const [n, letras] of [[2, 'dos (2)'], [15, 'quince (15)'], [30, 'treinta (30)']]) {
    for (const entregaPor of ['rappi', 'organizador']) {
      const texto = documento(Object.assign({ entregaPor, plazoEntrega: n }, fisico));
      assert.ok(texto.includes(frase(letras)), entregaPor + ' ' + n);
      // Va en la misma viñeta de Entrega, detrás de la frase de quién entrega.
      const viñeta = texto.split('\n').filter((l) => l.startsWith('• Entrega:'))[0];
      assert.ok(viñeta.endsWith(frase(letras)), viñeta);
      assertSinRestos(texto, entregaPor + ' ' + n);
    }
  }
});

test('H12: el plazo de entrega va de 2 a 30 días hábiles, y con uno no se genera una frase rota', () => {
  const co = pais('CO');
  const errores = (plazoEntrega) => validarSolicitud(carrera({ plazoEntrega }), co, CONTEXTO).errores
    .filter((e) => e.campo === 'plazoEntrega').map((e) => e.mensaje);
  assert.deepStrictEqual(errores(15), []);
  assert.deepStrictEqual(errores(2), []);
  assert.deepStrictEqual(errores(30), []);
  const rango = 'El plazo va de 2 a 30 días hábiles. Si la marca necesita más de 30, la campaña va a Legal.';
  assert.deepStrictEqual(errores(1), [rango]);
  assert.deepStrictEqual(errores(31), [rango]);
  assert.deepStrictEqual(errores(0), [rango]);

  const sin = carrera({});
  delete sin.plazoEntrega;
  assert.ok(validarSolicitud(sin, co, CONTEXTO).errores.some((e) => e.campo === 'plazoEntrega'));
});

// --- H11: el premio en Créditos se gasta, vale hasta cuándo y se acredita en un plazo ------------------

const CREDITOS = { tipoPremio: 'creditos', creditosPremio: 500000, vigencia: 'dias', diasVigencia: 30, redencion: 'general', plazoEntrega: 10 };

test('H11: el premio en Créditos no se canjea por dinero, pero sí se gasta en la Plataforma', () => {
  const creditos = documento(CREDITOS);
  assert.ok(creditos.includes('El premio es personal e intransferible y no podrá canjearse por dinero en efectivo. La Campaña tiene'));
  assert.ok(!creditos.includes('ni por otros bienes o servicios'));

  const fisico = documento({ tipoPremio: 'fisico', descripcionPremio: 'Una bicicleta', valorPremio: 1200000, entregaPor: 'organizador' });
  assert.ok(fisico.includes('El premio es personal e intransferible y no podrá canjearse por dinero en efectivo ni por otros bienes o servicios. La Campaña tiene'));
});

test('H11: la naturaleza de los Créditos dice hasta cuándo valen y dónde se gastan', () => {
  const porDias = documento(CREDITOS);
  assert.ok(porDias.includes('disponibles en: https://legal.rappi.com.co/colombia/terminos-y-condiciones-funcionamiento-de-los-creditos-de-la-plataforma-rappi-2/. ' +
    'Los Créditos del premio tendrán una vigencia de treinta (30) días calendario contados a partir de su carga. ' +
    'Los Créditos podrán redimirse en cualquier sección de la Plataforma Rappi habilitada para el uso de Créditos, dentro del Territorio.'));

  const porFecha = documento(Object.assign({}, CREDITOS, { vigencia: 'fecha', fechaFinRedencion: '2026-12-31', redencion: 'secciones', secciones: ['Restaurantes'] }));
  assert.ok(porFecha.includes('Los Créditos del premio podrán redimirse hasta las 11:59 p. m. del 31 de diciembre de 2026. ' +
    'Los Créditos podrán redimirse en cualquier tienda de la sección “Restaurantes” de la Plataforma Rappi, dentro del Territorio.'));

  const conExclusiones = documento(Object.assign({}, CREDITOS, { exclusionesRedencion: ['travel', 'atm'] }));
  assert.ok(conExclusiones.includes('a excepción de'), 'las secciones excluidas se nombran');
  assertSinRestos(porDias, 'dias');
  assertSinRestos(porFecha, 'fecha');
});

test('H11: la acreditación de los Créditos tiene su plazo, sin "una vez aceptado el premio"', () => {
  const texto = documento(CREDITOS);
  assert.ok(texto.includes('• Entrega: Los Créditos serán acreditados por Rappi en la Billetera de Créditos del ganador, por cuenta del Organizador, a más tardar dentro de los diez (10) días hábiles siguientes a la aceptación del premio.'));
  assert.ok(!texto.includes('una vez aceptado el premio'));
  assert.ok(!texto.includes('sin costo para el ganador'), 'la frase del premio físico no sale con Créditos');
});

test('H11: el México de la Carrera en Créditos no trae nada colombiano', () => {
  const texto = documento(CREDITOS, 'MX');
  const viñetaDeEntrega = texto.split('\n').filter((l) => l.startsWith('• Entrega:'))[0];
  assert.ok(viñetaDeEntrega.includes('diez (10) días hábiles'));
  assert.ok(texto.includes('tendrán una vigencia de treinta (30) días naturales contados a partir de su carga'));
  assert.ok(!/días calendario/.test(texto));
});

test('H11: con Créditos se piden vigencia, lugar y plazo; con premio físico no se piden', () => {
  const co = pais('CO');
  const faltan = (respuestas, borrar) => {
    const entrada = carrera(respuestas);
    borrar.forEach((c) => delete entrada[c]);
    return validarSolicitud(entrada, co, CONTEXTO).errores.map((e) => e.campo);
  };
  const sinNada = faltan(CREDITOS, ['vigencia', 'diasVigencia', 'redencion', 'plazoEntrega']);
  assert.ok(sinNada.includes('vigencia') && sinNada.includes('redencion') && sinNada.includes('plazoEntrega'), sinNada.join(','));

  // Con premio físico, una vigencia vieja de antes de cambiar el premio no estorba.
  const fisico = { tipoPremio: 'fisico', descripcionPremio: 'Una bicicleta', valorPremio: 1200000, entregaPor: 'organizador' };
  const viejo = validarSolicitud(carrera(Object.assign({ vigencia: 'fecha', fechaFinRedencion: '2026-10-02', redencion: 'tienda' }, fisico)), co, CONTEXTO);
  assert.ok(viejo.valido, JSON.stringify(viejo.errores));

  // Y con Créditos, la fecha límite sigue teniendo que ser posterior al fin de la campaña.
  const temprano = validarSolicitud(carrera(Object.assign({}, CREDITOS, { vigencia: 'fecha', fechaFinRedencion: '2026-10-02' })), co, CONTEXTO);
  assert.ok(temprano.errores.some((e) => e.campo === 'fechaFinRedencion'), JSON.stringify(temprano.errores));
});

test('H11: la redención del premio no ofrece "solo en la tienda"', () => {
  const { preguntaDe } = require('../src/core/preguntas.js');
  const { esquemaDe: esquema } = require('../src/core/esquemas.js');
  assert.deepStrictEqual(preguntaDe('redencion', 'carrera_compras').opciones.map((o) => o.valor), ['secciones', 'general']);
  const campo = esquema('carrera_compras').campos.filter((c) => c.id === 'redencion')[0];
  assert.deepStrictEqual(campo.opciones.map((o) => o.valor), ['secciones', 'general']);
  // El Cashback conserva sus tres opciones.
  assert.deepStrictEqual(preguntaDe('redencion', 'cashback').opciones.map((o) => o.valor), ['tienda', 'secciones', 'general']);
});

// --- K5 y K7: cuántos ganadores y cuántos premios hay ---------------------------------------------------

test('K5 y K7: el documento dice cuántos ganadores y premios hay, con uno y con varios', () => {
  const co = pais('CO');
  const derivados = (numeroGanadores) => calcularDerivados(carrera({ numeroGanadores }), co);

  assert.strictEqual(derivados(1).GANADOR_OBJETO, 'al ganador');
  assert.strictEqual(derivados(3).GANADOR_OBJETO, 'a los ganadores');
  assert.strictEqual(derivados(1).A_CADA_GANADOR, 'al ganador');
  assert.strictEqual(derivados(3).A_CADA_GANADOR, 'a cada ganador');
  assert.strictEqual(derivados(1).TEXTO_CANTIDAD_PREMIOS, 'La Campaña tiene un (1) solo ganador y entrega un (1) solo premio.');
  assert.strictEqual(derivados(3).TEXTO_CANTIDAD_PREMIOS, 'La Campaña tiene tres (3) ganadores y entrega tres (3) premios iguales, uno para cada ganador.');
  assert.strictEqual(derivados(101).TEXTO_CANTIDAD_PREMIOS, 'La Campaña tiene ciento un (101) ganadores y entrega ciento un (101) premios iguales, uno para cada ganador.');
  assert.strictEqual(derivados(500).TEXTO_CANTIDAD_PREMIOS, 'La Campaña tiene quinientos (500) ganadores y entrega quinientos (500) premios iguales, uno para cada ganador.');
});

test('K5 y K7: con un ganador, ninguna frase fija queda en plural', () => {
  const uno = documento({ numeroGanadores: 1 });
  assert.ok(uno.includes('El resultado del concurso se define exclusivamente con base en un criterio objetivo, medible y verificable de compras efectivamente realizadas durante la vigencia, y en ningún caso por sorteo, rifa, azar o cualquier otro mecanismo de suerte.'));
  assert.ok(uno.includes('La Campaña tiene un (1) solo ganador y entrega un (1) solo premio.'));
  assert.ok(uno.includes('Rappi contactará al ganador mediante'));
  assert.ok(uno.includes('Antes de declarar al ganador, Rappi'));
  assert.ok(uno.includes('Resultará ganador el participante que ocupe la primera posición del ranking.'));
  for (const plural of ['Los ganadores se determinan', 'a cada ganador mediante', 'a los ganadores, Rappi', 'La cantidad de premios es limitada']) {
    assert.ok(!uno.includes(plural), 'con un ganador no puede decir "' + plural + '"');
  }
});

test('K5 y K7: con varios ganadores el documento dice cuántos son', () => {
  const tres = documento({ numeroGanadores: 3 });
  assert.ok(tres.includes('La Campaña tiene tres (3) ganadores y entrega tres (3) premios iguales, uno para cada ganador.'));
  assert.ok(tres.includes('Rappi contactará a cada ganador mediante'));
  assert.ok(tres.includes('Antes de declarar a los ganadores, Rappi'));
  assert.ok(tres.includes('Resultarán ganadores los tres (3) participantes que ocupen las primeras posiciones del ranking.'));
  assert.ok(!tres.includes('La cantidad de premios es limitada y corresponde a la indicada en esta cláusula'));
  assertSinRestos(tres, 'tres');
});

// --- H20: el nombre comercial de la campaña ----------------------------------------------------------

test('H20: nombres que pasan y nombres que no, regla por regla', () => {
  const co = pais('CO');
  const errores = (nombreComercial) => validarSolicitud(carrera({ nombreComercial }), co, CONTEXTO).errores
    .filter((e) => e.campo === 'nombreComercial').map((e) => e.mensaje);

  // Pasan: opcional, con letras, con tildes y ñ, y con un año de cuatro cifras.
  for (const bueno of [undefined, '', '   ', 'Skindays', 'Mundial 2026', 'Día del Niño', 'Ñandú Fest', 'Black Friday 2025', 'Rappi2026', 'Johnson & Johnson']) {
    assert.deepStrictEqual(errores(bueno), [], JSON.stringify(bueno));
  }

  // Regla 1: entre 3 y 60 caracteres, una línea, sin emojis.
  const largo = 'El nombre tiene que tener entre 3 y 60 caracteres, en una sola línea.';
  assert.deepStrictEqual(errores('Sk'), [largo]);
  assert.deepStrictEqual(errores('S'.repeat(61)), [largo]);
  assert.deepStrictEqual(errores('S'.repeat(60)), []);
  assert.deepStrictEqual(errores('Skin\ndays'), [largo]);
  assert.deepStrictEqual(errores('Skindays 🎉'), [largo]);
  assert.deepStrictEqual(errores('Skindays ❤'), [largo]);

  // Regla 2: ni porcentajes, ni precios, ni cifras, salvo un año.
  const cifras = 'El nombre no puede llevar porcentajes, precios ni cifras, salvo el año. El beneficio lo dice el documento.';
  for (const malo of ['Skindays 50%', '3x2', 'Skindays $10', 'Skindays 10', 'Black Friday 1234', 'Mundial 20266', 'Skindays €5', '50 Skindays']) {
    assert.deepStrictEqual(errores(malo), [cifras], malo);
  }

  // Regla 3: sin palabras de azar, en español y en portugués.
  const azar = 'El nombre no puede hablar de sorteo, rifa, lotería, azar ni suerte. Esta campaña no es un juego de azar.';
  for (const malo of ['Gran Sorteo Skindays', 'Rifa', 'Lotería de Navidad', 'loteria', 'Buena suerte', 'Juego de azar', 'Sorteio de verão', 'Sorte grande', 'Sorteos Skin']) {
    assert.deepStrictEqual(errores(malo), [azar], malo);
  }
  // Una palabra que solo se parece no se frena.
  for (const bueno of ['Sortilegio', 'Rifael', 'Azares']) assert.deepStrictEqual(errores(bueno), [], bueno);

  // Regla 4: sin anotaciones internas.
  for (const malo of ['Skindays (confirmar)', 'Skindays ??', 'TODO Skindays', 'Skindays {{X}}', 'Skindays [[X]]']) {
    assert.ok(errores(malo).some((m) => m.includes('nota interna')), malo);
  }
});

test('H20: con nombre comercial el articulado dice ese nombre, en el título y en la apertura', () => {
  const sin = documento({});
  const con = documento({ nombreComercial: 'Skindays' });
  assert.ok(con.includes('campaña promocional denominada “Skindays”'), con.slice(0, 600));
  assert.ok(con.startsWith('TÉRMINOS Y CONDICIONES\nSKINDAYS\n') || con.includes('SKINDAYS'));
  assert.ok(!con.includes('Carrera de Compras ·'), 'el nombre de registro no sale en el texto legal');

  // Sin nombre comercial sale el nombre de registro, como hoy.
  assert.ok(sin.includes('campaña promocional denominada “Texto de prueba · Carrera de Compras · 1 oct 2026”'));
  assert.ok(sin.includes('TEXTO DE PRUEBA · CARRERA DE COMPRAS · 1 OCT 2026'));
});

test('H20: con nombre comercial el consecutivo no llega al texto legal, y sin él sigue como hoy', () => {
  const entrada = (extra) => Object.assign(carrera({}), { sufijoNombre: 2 }, extra);
  const texto = (e) => textoPlano(generarTexto(e, pais('CO'), modelos, CONTEXTO).texto);

  assert.ok(texto(entrada({})).includes('Carrera de Compras · 1 oct 2026 · 2”'), 'sin nombre comercial el "· 2" sigue dentro del texto');
  const con = texto(entrada({ nombreComercial: 'Skindays' }));
  assert.ok(con.includes('denominada “Skindays”'));
  assert.ok(!/· 2/.test(con.split('\n').slice(0, 4).join('\n')), 'con nombre comercial el consecutivo no llega al texto legal');
});

test('H20: sirve en todos los tipos de campaña y en Brasil el documento sigue en portugués', () => {
  const { ESQUEMAS } = require('../src/core/esquemas.js');
  for (const tipo of Object.keys(ESQUEMAS)) {
    assert.ok(ESQUEMAS[tipo].campos.some((c) => c.id === 'nombreComercial' && c.obligatorio === false), tipo);
  }
  const br = generarTexto(solicitud('BR', 'promocao_br', { nombreComercial: 'Skindays' }), pais('BR'), modelos, CONTEXTO);
  assert.ok(br.valido, JSON.stringify(br.errores));
  assert.ok(textoPlano(br.texto).includes('campanha “Skindays”'));
  const cb = generarTexto(solicitud('CO', 'cashback', { nombreComercial: 'Skindays' }), pais('CO'), modelos, CONTEXTO);
  assert.ok(cb.valido, JSON.stringify(cb.errores));
  // El Cashback solo imprime el nombre en el título del documento.
  assert.ok(textoPlano(cb.texto).includes('SKINDAYS'));
  assert.ok(!textoPlano(cb.texto).includes('Jumbo · 20% Cashback'));
});

test('H20: el servidor guarda el nombre comercial y el título del Doc sigue saliendo del nombre de registro', () => {
  const { levantarEntorno, bajarEntorno } = require('./dobles/entorno.js');
  const mundo = levantarEntorno({});
  try {
    setup();
    const primera = generar(carrera({ tiendasCarrera: EXITO_Y_CARULLA, nombreComercial: 'Skindays' }));
    assert.ok(primera.valido, JSON.stringify(primera.errores));
    const segunda = generar(carrera({ tiendasCarrera: EXITO_Y_CARULLA, nombreComercial: 'Skindays' }));

    // El nombre de registro, el título, la dirección y el consecutivo no cambian por el nombre comercial.
    assert.strictEqual(primera.nombreCampana, 'Éxito y Carulla · Carrera de Compras · 1 oct 2026');
    assert.strictEqual(segunda.nombreCampana, 'Éxito y Carulla · Carrera de Compras · 1 oct 2026 · 2');
    assert.ok(primera.titulo.startsWith('T&C · Éxito y Carulla · Carrera de Compras · 1 oct 2026 · Colombia'), primera.titulo);
    assert.ok(segunda.titulo.includes('· 2 ·'), segunda.titulo);
    assert.ok(primera.direccionSugerida.includes('exito-y-carulla-carrera-de-compras'), primera.direccionSugerida);
    assert.ok(!primera.titulo.includes('Skindays') && !primera.direccionSugerida.includes('skindays'));

    // El articulado dice el nombre comercial, sin el consecutivo.
    const cuerpo = mundo.documentos[Object.keys(mundo.documentos)[1]].getBody();
    const textos = cuerpo.hijos.map((h) => h.getText()).join('\n');
    assert.ok(textos.includes('denominada “Skindays”'), textos.slice(0, 500));
    assert.ok(!/Carrera de Compras · 1 oct 2026 · 2/.test(textos));

    // La fila guarda el nombre comercial en su propia columna, al final.
    const fila = leerSolicitudes()[0];
    assert.strictEqual(fila.nombre_comercial, 'Skindays');
    assert.strictEqual(fila.resp_nombreComercial, 'Skindays');
    assert.strictEqual(fila.nombre_campana, 'Éxito y Carulla · Carrera de Compras · 1 oct 2026');

    // Y la campaña se encuentra por los dos nombres.
    assert.strictEqual(historial('skindays').length, 2);
    assert.strictEqual(historial('Éxito y Carulla').length, 2);
  } finally {
    bajarEntorno();
  }
});

test('H20: una hoja vieja agrega nombre_comercial al final sin mover ninguna columna', () => {
  const { levantarEntorno, bajarEntorno } = require('./dobles/entorno.js');
  levantarEntorno({});
  try {
    setup();
    generar(carrera({ tiendasCarrera: EXITO_Y_CARULLA }));
    const sin = leerSolicitudes()[0];
    // Sin nombre comercial la columna existe y queda vacía; nada se movió de sitio.
    assert.strictEqual(sin.nombre_comercial, '');
    assert.strictEqual(sin.nombre_campana, 'Éxito y Carulla · Carrera de Compras · 1 oct 2026');
    assert.ok(sin.datos_json.length > 10);
  } finally {
    bajarEntorno();
  }
});

// --- H9: los empleados de la Tienda Participante tampoco participan --------------------------------------

test('H9: la inhabilidad incluye a los empleados de la Tienda Participante, una o varias', () => {
  const una = documento({ tiendasCarrera: [{ nombre: 'Carulla', tiendaTurbo: 'sin_turbo' }] });
  assert.ok(una.includes('• Los empleados, directivos, contratistas y colaboradores de Rappi, del Organizador y de la Tienda Participante, incluidas sus filiales, subsidiarias, sucursales, agencias de publicidad y demás proveedores logísticos o de ejecución de la Campaña.'));

  const varias = documento({ tiendasCarrera: EXITO_Y_CARULLA });
  assert.ok(varias.includes('• Los empleados, directivos, contratistas y colaboradores de Rappi, del Organizador y de las Tiendas Participantes, incluidas sus filiales'));
  assert.ok(!varias.includes('de Rappi y del Organizador, incluidas'));
  assertSinRestos(varias, 'varias');

  // Y el resto del bloque no cambia.
  assert.ok(varias.includes('• Sus cónyuges y compañeros o compañeras permanentes.'));
});

// --- H16: dos marcas en el campo de marca -------------------------------------------------------------

test('H16: una marca sale igual que antes, y varias salen en plural', () => {
  const frase = (makerMarca) => documento({ productos: 'marca', makerMarca });
  assert.ok(frase('Bimbo').includes('únicamente los productos de la marca Bimbo disponibles en la Tienda Participante a través de la Plataforma Rappi'));
  assert.ok(frase('NEUTROGENA®, LUBRIDERM®').includes('únicamente los productos de las marcas NEUTROGENA® y LUBRIDERM® disponibles en la Tienda Participante a través de la Plataforma Rappi'));
  assert.ok(frase('NEUTROGENA®, LUBRIDERM®, AVEENO®').includes('de las marcas NEUTROGENA®, LUBRIDERM® y AVEENO® disponibles'));
  // Comas de más y espacios de sobra no dejan huecos.
  assert.ok(frase(' Bimbo ,, Ramo ,').includes('de las marcas Bimbo y Ramo disponibles'));
  assert.ok(!frase('NEUTROGENA®, LUBRIDERM®').includes('de la marca NEUTROGENA® y'));
});

test('H16: la Carrera devuelve vacía la frase si la marca está vacía, como el Descuento', () => {
  const { textoProductos } = require('../src/core/derivados.js');
  const { textoProductosDescuento } = require('../src/core/derivados_descuento.js');
  assert.strictEqual(textoProductos({ productos: 'marca', makerMarca: '' }), '');
  assert.strictEqual(textoProductos({ productos: 'marca', makerMarca: ' , ' }), '');
  assert.strictEqual(textoProductosDescuento({ productos: 'marca', makerMarca: '' }), '');
});

test('H16: Descuento y Cupón dicen "de las marcas" cuando son varias', () => {
  for (const tipo of ['descuento', 'cupon']) {
    const una = generarTexto(solicitud('MX', tipo, { productos: 'marca', makerMarca: 'Bimbo' }), pais('MX'), modelos, CONTEXTO);
    const dos = generarTexto(solicitud('MX', tipo, { productos: 'marca', makerMarca: 'Bimbo, Marinela' }), pais('MX'), modelos, CONTEXTO);
    assert.ok(una.valido && dos.valido, tipo + ' ' + JSON.stringify(una.errores.concat(dos.errores)));
    assert.ok(textoPlano(una.texto).includes('únicamente para los productos de la marca Bimbo disponibles'), tipo);
    assert.ok(textoPlano(dos.texto).includes('únicamente para los productos de las marcas Bimbo y Marinela disponibles'), tipo);
  }
});

test('H16: el campo de marca avisa, sin frenar, si trae una "y" y ninguna coma', () => {
  const { avisoDeMarcas } = require('../src/core/validaciones.js');
  assert.strictEqual(avisoDeMarcas({ tipo: 'carrera_compras', makerMarca: 'NEUTROGENA y LUBRIDERM' }), '¿Son dos marcas? Sepáralas con coma.');
  assert.strictEqual(avisoDeMarcas({ tipo: 'carrera_compras', makerMarca: 'NEUTROGENA, LUBRIDERM' }), '');
  assert.strictEqual(avisoDeMarcas({ tipo: 'carrera_compras', makerMarca: 'Pollo Dorado' }), '');
  assert.strictEqual(avisoDeMarcas({ tipo: 'carrera_compras', makerMarca: 'Johnson y Johnson, Aveeno' }), '');
  // No frena: la campaña con "A y B" sigue generando.
  const salida = generarTexto(carrera({ productos: 'marca', makerMarca: 'Ramo y Marinela' }), pais('CO'), modelos, CONTEXTO);
  assert.ok(salida.valido);
});
