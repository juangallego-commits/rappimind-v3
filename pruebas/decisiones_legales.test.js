'use strict';

/**
 * Las decisiones de Legal que cambian una frase según lo que responde el comercial.
 *
 * Vienen de la respuesta al encargo 01 (`docs/encargos/respuestas/01-legal.md`).
 * Los casos dorados de `casos_base.json` fijan el texto de una combinación cada
 * uno; lo que se protege aquí es lo otro: que la frase cambie cuando tiene que
 * cambiar y se quede igual cuando no. Esa es la parte que un caso dorado no ve.
 */

const test = require('node:test');
const assert = require('node:assert');

const { calcularDerivados } = require('../src/core/derivados.js');
const { calcularDerivadosTravel } = require('../src/core/derivados_travel.js');
const { paisDesdeFila } = require('../src/core/paises.js');
const { rutaDesdeRaiz, leerJson } = require('../scripts/lib/archivos');

const PAISES = leerJson(rutaDesdeRaiz('data', 'paises.json')).paises.map(paisDesdeFila);
const porCodigo = (codigo) => PAISES.filter((p) => p.codigo === codigo)[0];
const CO = porCodigo('CO');

function cashback(extra) {
  return calcularDerivados(Object.assign({ tipo: 'cashback', segmento: 'todos' }, extra), CO);
}

function travel(extra) {
  return calcularDerivadosTravel(
    Object.assign({ tipo: 'cashback_travel', formaBeneficio: 'porcentaje' }, extra), CO, {});
}

// --- Decisión 18: la verificación de elegibilidad -----------------------------

/**
 * "Verificamos antes de acreditar" y "acreditamos de manera inmediata" no
 * pueden ser ciertas a la vez, y una contradicción impresa se resuelve a favor
 * del usuario: acreditación inmediata y sin verificación. Con carga inmediata,
 * la verificación pasa a ser posterior y con reversión.
 */
test('con carga inmediata la verificación es posterior y con reversión', () => {
  const frase = cashback({ carga: 'inmediata' }).TEXTO_VERIFICACION;
  assert.ok(frase.indexOf('después de acreditar el Beneficio') !== -1, frase);
  assert.ok(frase.indexOf('descontar o revocar los Créditos acreditados') !== -1, frase);
  assert.ok(frase.indexOf('antes de acreditar') === -1, 'quedó la contradicción: ' + frase);
});

test('con carga al día siguiente o en una fecha, la verificación sigue siendo previa', () => {
  for (const carga of ['dia_siguiente', 'fecha']) {
    const frase = cashback({ carga: carga, fechaCarga: '2026-10-01' }).TEXTO_VERIFICACION;
    assert.ok(frase.indexOf('antes de acreditar el Beneficio') !== -1, carga + ': ' + frase);
    assert.ok(frase.indexOf('los Créditos no serán acreditados') !== -1, carga + ': ' + frase);
  }
});

test('en Travel la verificación cambia con la carga al confirmarse la reserva', () => {
  const alConfirmarse = travel({ carga: 'al_confirmarse' }).TEXTO_VERIFICACION_TRAVEL;
  assert.ok(alConfirmarse.indexOf('Rappi Travel podrá verificar') !== -1, alConfirmarse);
  assert.ok(alConfirmarse.indexOf('después de acreditar el Beneficio') !== -1, alConfirmarse);

  const enDias = travel({ carga: 'dias_habiles', diasCarga: 10 }).TEXTO_VERIFICACION_TRAVEL;
  assert.ok(enDias.indexOf('se reserva el derecho de verificar') !== -1, enDias);
  assert.ok(enDias.indexOf('antes de acreditar el Beneficio') !== -1, enDias);
});

test('la verificación nunca sale vacía en un documento que la pide', () => {
  // Va dentro del bloque compartido acreditacion, que usan cashback,
  // cashback_day y cashback_eta. Si se queda sin valor, el documento no se
  // genera y el comercial no entiende por qué.
  for (const carga of ['inmediata', 'dia_siguiente', 'fecha']) {
    assert.ok(cashback({ carga: carga }).TEXTO_VERIFICACION, 'sin frase con carga ' + carga);
  }
});

// --- Decisión 35: los días de "reactivados" ----------------------------------

test('los días sin comprar se nombran con el término de cada país', () => {
  const entrada = { tipo: 'cashback', segmento: 'reactivados', diasSinCompra: 30, carga: 'dia_siguiente' };
  assert.ok(calcularDerivados(entrada, CO).TEXTO_SEGMENTO.indexOf('treinta (30) días calendario') !== -1);
  assert.ok(calcularDerivados(entrada, porCodigo('MX')).TEXTO_SEGMENTO.indexOf('treinta (30) días naturales') !== -1);
  assert.ok(calcularDerivados(entrada, porCodigo('AR')).TEXTO_SEGMENTO.indexOf('treinta (30) días corridos') !== -1);

  // "días" a secas dejaba discutir si eran hábiles a quien quedó por fuera por
  // pocos días.
  const co = calcularDerivados(entrada, CO).TEXTO_SEGMENTO;
  assert.ok(!/\(30\) días anteriores/.test(co), 'volvió el "días" sin término del país: ' + co);
});

// --- Decisión 22: la base de cálculo de Travel -------------------------------

test('el cashback de Travel se calcula sin impuestos, tasas ni contribuciones', () => {
  const frase = travel({ categorias: ['Vuelos'] }).TEXTO_BASE_CALCULO_TRAVEL;
  assert.ok(frase.indexOf('antes de impuestos, tasas y contribuciones') !== -1, frase);
  assert.ok(frase.indexOf('el IVA, las tasas aeroportuarias') !== -1, frase);
});

test('con Asistencia marcada se sigue quitando la exclusión de seguros de viaje', () => {
  const conAsistencia = travel({ categorias: ['Vuelos', 'Asistencia'] }).TEXTO_BASE_CALCULO_TRAVEL;
  assert.ok(conAsistencia.indexOf('asistencias o seguros de viaje') === -1, conAsistencia);
  assert.ok(conAsistencia.indexOf('antes de impuestos, tasas y contribuciones') !== -1, conAsistencia);
});

test('el ejemplo del tope habla del valor que cuenta, no del valor pagado', () => {
  const frase = travel({ categorias: ['Vuelos'], porcentaje: 10, tope: 100000 }).TEXTO_EJEMPLO_TOPE_TRAVEL;
  assert.ok(frase.indexOf('el valor que cuenta para el cálculo del Beneficio') !== -1, frase);
  assert.ok(frase.indexOf('si es menor, recibirás el 10% de ese valor') !== -1, frase);
  // Si el ejemplo dijera "el valor pagado", le prometería el tope a quien paga
  // el umbral con impuestos incluidos aunque su tarifa sin impuestos no llegue.
  assert.ok(frase.indexOf('el valor pagado debe ser') === -1, frase);
});

// --- Decisión 43: el ámbito, según las categorías marcadas -------------------

test('una campaña solo de vuelos no habla de servicios, y al revés', () => {
  assert.strictEqual(travel({ categorias: ['Vuelos'], ambito: 'nacional' }).TEXTO_AMBITO_TRAVEL,
    'Aplica únicamente para vuelos con origen y destino en la República de Colombia.');
  assert.strictEqual(travel({ categorias: ['Vuelos'], ambito: 'internacional' }).TEXTO_AMBITO_TRAVEL,
    'Aplica únicamente para vuelos con origen o destino fuera de la República de Colombia.');
  assert.strictEqual(travel({ categorias: ['Hoteles', 'Autos'], ambito: 'nacional' }).TEXTO_AMBITO_TRAVEL,
    'Aplica únicamente para servicios que se presten en la República de Colombia.');
  assert.strictEqual(travel({ categorias: ['Hoteles'], ambito: 'internacional' }).TEXTO_AMBITO_TRAVEL,
    'Aplica únicamente para servicios que se presten fuera de la República de Colombia.');
});

test('con vuelos y otras categorías juntas se queda la frase completa', () => {
  const mezcla = travel({ categorias: ['Vuelos', 'Hoteles'], ambito: 'nacional' }).TEXTO_AMBITO_TRAVEL;
  assert.ok(mezcla.indexOf('vuelos con origen y destino') !== -1, mezcla);
  assert.ok(mezcla.indexOf('servicios que se presten') !== -1, mezcla);

  // Un Paquete lleva vuelo y alojamiento: acortar la frase perdería una de las
  // dos cosas, así que va la completa, que nombra las dos.
  const paquetes = travel({ categorias: ['Paquetes'], ambito: 'nacional' }).TEXTO_AMBITO_TRAVEL;
  assert.strictEqual(paquetes, mezcla);
});

test('sin ámbito elegido no se dice nada del ámbito', () => {
  assert.strictEqual(travel({ categorias: ['Vuelos'] }).TEXTO_AMBITO_TRAVEL, '');
  assert.strictEqual(travel({ categorias: ['Vuelos'], ambito: 'ambos' }).TEXTO_AMBITO_TRAVEL, '');
});

// --- Decisión 30: el ETA no se paga si el retraso es del usuario -------------

test('el modelo del ETA deja a salvo las causas del usuario y la fuerza mayor', () => {
  const { cargarModelos } = require('../scripts/lib/modelos');
  const eta = cargarModelos().modelos.cashback_eta;
  assert.ok(eta.indexOf('Rappi se obliga a cumplir con el ETA exhibido dentro de la Plataforma Rappi.') !== -1);
  assert.ok(eta.indexOf('No habrá lugar al Beneficio cuando el retraso se deba a causas que te sean imputables') !== -1);
  assert.ok(eta.indexOf('ni cuando obedezca a fuerza mayor o caso fortuito') !== -1);
});

// --- D5: las secciones donde los Créditos no aplican -------------------------

/**
 * Juan confirmó que estos Créditos casi nunca aplican a RappiFavor, al Cajero
 * ATM ni a Rappi Travel, y hasta el 20 de septiembre de 2026 eso estaba dicho
 * en la ayuda del formulario y no en el documento. Una exclusión que no está en
 * el T&C no se le puede oponer al usuario: si la app le rechaza los Créditos en
 * RappiFavor, reclama con el documento en la mano.
 */
test('la oración de las exclusiones es la que Juan aprobó, letra por letra', () => {
  const { textoLugarRedencion } = require('../src/core/derivados.js');
  const { leerJson, rutaDesdeRaiz } = require('../scripts/lib/archivos');
  const paises = leerJson(rutaDesdeRaiz('data', 'paises.json')).paises;
  const CO = paises.filter((p) => p.codigo === 'CO')[0];
  const MX = paises.filter((p) => p.codigo === 'MX')[0];
  const LAS_CUATRO = ['travel', 'soat', 'atm', 'favor'];

  assert.strictEqual(
    textoLugarRedencion({ redencion: 'general', exclusionesRedencion: LAS_CUATRO }, CO),
    'Los Créditos podrán redimirse en cualquier sección de la Plataforma Rappi habilitada para el uso de Créditos, dentro del Territorio, a excepción de las secciones “Rappi Travel”, “SOAT”, “Cajero ATM” y “RappiFavor”.');

  // El SOAT es colombiano: fuera de Colombia ni se ofrece ni se imprime.
  assert.strictEqual(
    textoLugarRedencion({ redencion: 'general', exclusionesRedencion: LAS_CUATRO }, MX),
    'Los Créditos podrán redimirse en cualquier sección de la Plataforma Rappi habilitada para el uso de Créditos, dentro del Territorio, a excepción de las secciones “Rappi Travel”, “Cajero ATM” y “RappiFavor”.');

  // Con una sola, la frase concuerda en singular.
  assert.strictEqual(
    textoLugarRedencion({ redencion: 'general', exclusionesRedencion: ['soat'] }, CO),
    'Los Créditos podrán redimirse en cualquier sección de la Plataforma Rappi habilitada para el uso de Créditos, dentro del Territorio, a excepción de la sección “SOAT”.');

  // Sin ninguna marcada, queda la oración de antes, palabra por palabra.
  assert.strictEqual(
    textoLugarRedencion({ redencion: 'general', exclusionesRedencion: [] }, CO),
    'Los Créditos podrán redimirse en cualquier sección de la Plataforma Rappi habilitada para el uso de Créditos, dentro del Territorio.');
});

test('las casillas de las exclusiones vienen marcadas, y el SOAT solo en Colombia', () => {
  const { PREGUNTAS } = require('../src/core/preguntas.js');
  const { seccionesExcluiblesDe } = require('../src/core/derivados_eta.js');

  assert.deepStrictEqual(PREGUNTAS.exclusionesRedencion.porDefecto, ['travel', 'soat', 'atm', 'favor'],
    'las casillas ya no vienen marcadas de entrada');
  assert.deepStrictEqual(seccionesExcluiblesDe('CO').map((s) => s.nombre),
    ['Rappi Travel', 'SOAT', 'Cajero ATM', 'RappiFavor']);
  for (const codigo of ['MX', 'PE', 'AR', 'CL', 'EC', 'UY', 'CR']) {
    assert.deepStrictEqual(seccionesExcluiblesDe(codigo).map((s) => s.nombre),
      ['Rappi Travel', 'Cajero ATM', 'RappiFavor'], codigo);
  }
});

test('el ETA nombra sus exclusiones con la misma forma que el Cashback', () => {
  // Punto D5: las secciones entre comillas, y "Rappi Favor" pasa a "RappiFavor",
  // que es como lo escriben los T&C publicados de Rappi en Colombia, Ecuador y
  // Costa Rica.
  const { cargarModelos } = require('../scripts/lib/modelos');
  const { leerTexto, rutaDesdeRaiz } = require('../scripts/lib/archivos');
  const eta = leerTexto(rutaDesdeRaiz('pruebas', 'salidas_esperadas', 'ETA01.txt'));
  assert.ok(eta.indexOf('a excepción de las secciones “Rappi Travel”, “SOAT”, “Cajero ATM” y “RappiFavor”.') !== -1,
    'el documento del ETA no trae la forma nueva');
  assert.strictEqual(eta.indexOf('Rappi Favor'), -1, 'quedó "Rappi Favor" separado en el documento');
  assert.ok(cargarModelos, 'la carga de modelos sigue existiendo');
});

// --- D7 y D8: Rappi Travel ---------------------------------------------------

test('la marca del aliado es obligatoria en los dos tipos de Travel', () => {
  // Punto D7. Cuando se dejaba vacía, el nombre de la campaña quedaba con la
  // razón social adentro ("OPERADOR DE PRUEBA S.A.S. · 50% CASHBACK TRAVEL ·
  // 15 OCT 2026"), y ese nombre va en el título del documento.
  const { ESQUEMAS } = require('../src/core/esquemas.js');
  const { PREGUNTAS } = require('../src/core/preguntas.js');

  for (const tipo of ['cashback_travel', 'descuento_travel']) {
    const campo = ESQUEMAS[tipo].campos.filter((c) => c.id === 'marcaAliado')[0];
    assert.ok(campo, tipo + ' ya no pregunta la marca');
    assert.strictEqual(campo.obligatorio, true, tipo + ': la marca volvió a ser opcional');
  }
  assert.strictEqual(PREGUNTAS.marcaAliado.opcional, undefined, 'la pregunta sigue marcada como opcional');
  assert.strictEqual(PREGUNTAS.marcaAliado.errores.vacio,
    'Escribe la marca. Sin ella, el nombre de la campaña quedaría con la razón social.');
});

test('el descuento de Travel no excluye las órdenes pagadas con Créditos', () => {
  /*
   * Punto D8. La frase venía de los cashback, donde evita montar un beneficio
   * promocional sobre otro: el usuario no gana Créditos pagando con Créditos.
   * En un descuento el beneficio no son Créditos, es un precio más bajo, así
   * que la frase excluía pagos sin ninguna razón. En cashback_travel se queda.
   */
  const { textoMetodoPagoTravel } = require('../src/core/derivados_travel.js');
  const CON_CREDITOS = 'pagadas parcial o totalmente con Créditos';

  for (const metodoPago of ['digitales', 'rappicard']) {
    const conCashback = textoMetodoPagoTravel({ tipo: 'cashback_travel', metodoPago });
    const conDescuento = textoMetodoPagoTravel({ tipo: 'descuento_travel', metodoPago });

    assert.ok(conCashback.indexOf(CON_CREDITOS) !== -1,
      'el cashback de Travel perdió la exclusión: ' + conCashback);
    assert.strictEqual(conDescuento.indexOf(CON_CREDITOS), -1,
      'el descuento de Travel sigue excluyendo los pagos con Créditos: ' + conDescuento);

    // Y lo que queda sigue siendo una oración entera, sin nada colgando.
    assert.ok(/\.$/.test(conDescuento), 'la oración quedó rota: ' + conDescuento);
  }
});

// --- F1 y F8: lo que el comercial ve -----------------------------------------

test('la opción del operador logístico se llama igual en los dos sitios', () => {
  // Punto F1. El circuito de Colombia del acuerdo de datos manda a cambiar la
  // respuesta a "Rappi, como operador logístico", con coma. La etiqueta que el
  // comercial lee ya la tenía; la copia del esquema decía otra cosa.
  const { ESQUEMAS } = require('../src/core/esquemas.js');
  const { PREGUNTAS } = require('../src/core/preguntas.js');

  const delEsquema = ESQUEMAS.carrera_compras.campos
    .filter((c) => c.id === 'entregaPor')[0].opciones
    .filter((o) => o.valor === 'rappi')[0];
  const deLaPregunta = PREGUNTAS.entregaPor.opciones.filter((o) => o.valor === 'rappi')[0];

  assert.strictEqual(deLaPregunta.etiqueta, 'Rappi, como operador logístico');
  assert.strictEqual(delEsquema.etiqueta, deLaPregunta.etiqueta,
    'las dos copias de la etiqueta se desincronizaron');
  assert.strictEqual(delEsquema.valor, 'rappi', 'cambió el valor interno, que no se tocaba');
});

test('las tres preguntas que decidían a quién excluir arrancan sin marcar', () => {
  // Punto F8. Una respuesta que nadie leyó queda impresa, y después no se puede
  // excluir a nadie. Las tres siguen siendo obligatorias: no se genera sin ellas.
  const { PREGUNTAS } = require('../src/core/preguntas.js');
  const { ESQUEMAS } = require('../src/core/esquemas.js');

  for (const campoId of ['redencion', 'segmento', 'metodoPago']) {
    assert.strictEqual(PREGUNTAS[campoId].porDefecto, undefined,
      campoId + ' volvió a venir con una respuesta marcada');
    const campo = ESQUEMAS.cashback.campos.filter((c) => c.id === campoId)[0];
    assert.strictEqual(campo.obligatorio, true, campoId + ' dejó de ser obligatorio');
  }
});

// --- D2: en qué pedidos se gana el beneficio ---------------------------------

test('las condiciones del pedido son una sola elección, no dos casillas', () => {
  /*
   * Punto D2. Se podían marcar Turbo y consumo en el local a la vez, y el
   * documento salía con dos "únicamente" que no pueden ser ciertos los dos:
   * uno decía que solo por Turbo y el otro que solo consumiendo en el local.
   * Quien pidió a domicilio podía leer las dos a su favor.
   */
  const { ESQUEMAS } = require('../src/core/esquemas.js');
  const { PREGUNTAS } = require('../src/core/preguntas.js');

  const campo = ESQUEMAS.cashback.campos.filter((c) => c.id === 'condiciones')[0];
  assert.strictEqual(campo.tipo, 'lista', 'volvieron a ser casillas');
  assert.strictEqual(PREGUNTAS.condiciones.multiple, undefined, 'la pregunta volvió a admitir varias');
  assert.deepStrictEqual(PREGUNTAS.condiciones.opciones.map((o) => o.etiqueta),
    ['En cualquier pedido', 'Solo pedidos por Turbo', 'Solo consumo en el local']);
});

test('el documento imprime una sola condición, y ninguna con "En cualquier pedido"', () => {
  const { calcularDerivados } = require('../src/core/derivados.js');
  const { leerJson, rutaDesdeRaiz } = require('../scripts/lib/archivos');
  const CO = leerJson(rutaDesdeRaiz('data', 'paises.json')).paises.filter((p) => p.codigo === 'CO')[0];
  const con = (condiciones) => calcularDerivados({ tipo: 'cashback', condiciones: condiciones }, CO).TEXTO_CONDICIONES;

  assert.strictEqual(con('cualquiera'), '');
  assert.strictEqual(con('turbo'),
    'El Beneficio aplica únicamente para pedidos realizados a través de Turbo.');

  // Y una campaña guardada antes del 20 de septiembre de 2026 trae una lista.
  // "Usar como base" sobre una de esas tiene que seguir funcionando.
  assert.strictEqual(con(['turbo']), con('turbo'));
  assert.strictEqual(con([]), '');
  assert.strictEqual(con(undefined), '');

  // El caso que ya no puede pasar: las dos a la vez. De una lista vieja con las
  // dos se lee la primera, no se imprimen las dos frases incompatibles.
  const dosALaVez = con(['turbo', 'consumo_local']);
  assert.strictEqual(dosALaVez, con('turbo'));
  assert.strictEqual((dosALaVez.match(/únicamente/g) || []).length, 1,
    'volvieron los dos "únicamente" en la misma cláusula: ' + dosALaVez);
});

test('"Solo consumo en el local" no se ofrece mientras ningún país diga cómo se llama', () => {
  // El modelo cita ese nombre entre comillas, y hoy nombre_modalidad_local está
  // vacío en los nueve países. Ofrecer la opción sería un camino que arranca y
  // muere: la campaña se quedaría además sin ninguna de sus cinco leyendas.
  const { leerJson, rutaDesdeRaiz } = require('../scripts/lib/archivos');
  const paises = leerJson(rutaDesdeRaiz('data', 'paises.json')).paises;
  const conNombre = paises.filter((p) => String(p.nombre_modalidad_local || '').trim() !== '');
  assert.deepStrictEqual(conNombre.map((p) => p.codigo), [],
    'un país ya tiene nombre_modalidad_local: quita este recordatorio y revisa la opción');

  const fuente = require('node:fs').readFileSync(
    require('node:path').join(__dirname, '..', 'src', 'client', 'js', '62-pasos.js'), 'utf8');
  assert.ok(fuente.indexOf("campo.id === 'condiciones'") !== -1,
    'la interfaz ya no filtra las opciones de la condición del pedido');
  assert.ok(fuente.indexOf('nombre_modalidad_local') !== -1,
    'la interfaz ya no mira si el país tiene el nombre de la modalidad');
});
