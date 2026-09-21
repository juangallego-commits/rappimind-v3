'use strict';

/**
 * El estándar "para dummies" de cada pregunta, verificado automáticamente.
 *
 * Esto no es decoración: si alguien agrega un campo y le pone una pregunta con
 * el nombre interno, o un mensaje de error que dice "campo inválido", la suite
 * se cae. Es lo que mantiene la interfaz entendible con el tiempo.
 */

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const { PREGUNTAS, PASOS, GLOSARIO, NOMBRE_DEL_HUECO, nombreDelHueco, preguntaDe } = require("../src/core/preguntas.js");
const { ESQUEMAS } = require('../src/core/esquemas.js');
const { cargarModelos } = require('../scripts/lib/modelos');
const { calcularDerivados } = require('../src/core/derivados.js');
const { rutaDesdeRaiz, leerJson } = require('../scripts/lib/archivos');

/** Preguntas con texto visible. Las que se responden dentro de otra no cuentan. */
function preguntasVisibles() {
  return Object.keys(PREGUNTAS).filter((id) => PREGUNTAS[id].pregunta);
}

function palabras(texto) {
  return texto.trim().split(/\s+/).filter(Boolean);
}

test('todo campo de todo esquema tiene pregunta, o se responde dentro de otra', () => {
  for (const tipoId of Object.keys(ESQUEMAS)) {
    for (const campo of ESQUEMAS[tipoId].campos) {
      const pregunta = preguntaDe(campo.id, tipoId);
      assert.ok(pregunta, 'el campo ' + campo.id + ' (' + tipoId + ') no tiene pregunta');
      assert.ok(
        pregunta.pregunta || pregunta.respondidoPor,
        campo.id + ' no tiene texto ni dice dentro de qué pregunta se responde'
      );
    }
  }
});

test('cada pregunta tiene máximo 10 palabras', () => {
  for (const id of preguntasVisibles()) {
    const cuantas = palabras(PREGUNTAS[id].pregunta).length;
    assert.ok(cuantas <= 10, id + ' tiene ' + cuantas + ' palabras: "' + PREGUNTAS[id].pregunta + '"');
  }
});

test('ninguna pregunta muestra el nombre interno del campo', () => {
  // Los nombres internos que delatan al programador son los de varias palabras
  // (organizadorRazonSocial, maxPedidos). Los de una sola palabra como "tipo",
  // "tienda" o "país" son español normal y tienen que poder usarse.
  const nombresInternos = Object.keys(PREGUNTAS).filter((id) => /[A-Z]/.test(id));

  for (const id of preguntasVisibles()) {
    const texto = PREGUNTAS[id].pregunta.toLowerCase();
    for (const interno of nombresInternos) {
      assert.ok(texto.indexOf(interno.toLowerCase()) === -1, id + ' menciona el nombre interno ' + interno);
    }
  }
});

test('las preguntas hablan de tú, nunca de usted', () => {
  const deUsted = /\busted\b|\bsu[s]? (campaña|pedido|cuenta)\b/i;
  for (const id of preguntasVisibles()) {
    const pregunta = PREGUNTAS[id];
    assert.ok(!deUsted.test(pregunta.pregunta), id + ' trata de usted en la pregunta');
    assert.ok(!deUsted.test(pregunta.ayuda || ''), id + ' trata de usted en la ayuda');
  }
});

test('cada pregunta es una pregunta, salvo las casillas de confirmación', () => {
  for (const id of preguntasVisibles()) {
    const texto = PREGUNTAS[id].pregunta;
    const esPregunta = texto.indexOf('¿') !== -1 && texto.trim().slice(-1) === '?';
    // Las casillas de confirmación son instrucciones, no preguntas.
    const esInstruccion = ['declaracion', 'aliadoAprobo', 'declaracionPiezas'].indexOf(id) !== -1;
    assert.ok(esPregunta || esInstruccion, id + ' no está redactada como pregunta: "' + texto + '"');
  }
});

test('cada pregunta trae una ayuda de una sola línea con contenido', () => {
  for (const id of preguntasVisibles()) {
    const ayuda = PREGUNTAS[id].ayuda;
    assert.ok(ayuda && ayuda.length > 20, id + ' no tiene ayuda suficiente');
    assert.ok(ayuda.indexOf('\n') === -1, id + ' tiene una ayuda de varias líneas');
    assert.ok(/[.!?]$/.test(ayuda.trim()), id + ' tiene una ayuda que no termina en punto');
  }
});

test('cada pregunta explica por qué se pregunta', () => {
  for (const id of preguntasVisibles()) {
    const porQue = PREGUNTAS[id].porQue;
    assert.ok(porQue && porQue.length > 50, id + ' no explica por qué se pregunta');
    assert.ok(/[.!?]$/.test(porQue.trim()), id + ' tiene un "por qué" que no termina en punto');
  }
});

test('ningún mensaje de error dice "inválido" ni "error"', () => {
  const prohibido = /inv[aá]lid|campo requerido|error en el campo|valor no permitido/i;
  for (const id of Object.keys(PREGUNTAS)) {
    const errores = PREGUNTAS[id].errores || {};
    for (const llave of Object.keys(errores)) {
      assert.ok(!prohibido.test(errores[llave]), id + '.' + llave + ' usa jerga: "' + errores[llave] + '"');
    }
  }
});

test('cada mensaje de error dice qué pasó y termina en punto', () => {
  for (const id of Object.keys(PREGUNTAS)) {
    const errores = PREGUNTAS[id].errores || {};
    for (const llave of Object.keys(errores)) {
      const mensaje = errores[llave];
      assert.ok(mensaje.length > 15, id + '.' + llave + ' es demasiado corto: "' + mensaje + '"');
      assert.ok(/[.!?]$/.test(mensaje.trim()), id + '.' + llave + ' no termina en punto');
    }
  }
});

test('cada campo obligatorio tiene un mensaje para cuando está vacío', () => {
  for (const tipoId of Object.keys(ESQUEMAS)) {
    for (const campo of ESQUEMAS[tipoId].campos) {
      const pregunta = PREGUNTAS[campo.id];
      if (!pregunta.pregunta || pregunta.opcional) continue;
      if (campo.tipo === 'repetible') {
        assert.ok(pregunta.errores.minimo, campo.id + ' no dice qué pasa si la lista está vacía');
        continue;
      }
      assert.ok(pregunta.errores.vacio, campo.id + ' no tiene mensaje para cuando está vacío');
    }
  }
});

test('cada opción trae etiqueta y una línea de explicación', () => {
  for (const id of Object.keys(PREGUNTAS)) {
    const opciones = PREGUNTAS[id].opciones;
    if (!opciones) continue;
    for (const opcion of opciones) {
      assert.ok(opcion.valor, id + ' tiene una opción sin valor');
      assert.ok(opcion.etiqueta && opcion.etiqueta.length > 2, id + ' tiene una opción sin etiqueta');
      assert.ok(opcion.nota && opcion.nota.length > 8, id + ': la opción "' + opcion.etiqueta + '" no explica nada');
      assert.ok(
        opcion.etiqueta !== opcion.etiqueta.toUpperCase() || opcion.etiqueta.length < 4,
        id + ' tiene una etiqueta en mayúsculas sostenidas'
      );
    }
  }
});

test('las opciones de la pregunta coinciden con las del esquema', () => {
  const equivalencias = {
    // "¿Cuántas veces puede ganar?" reúne maxPedidos y sinLimite en una sola pregunta.
    maxPedidos: ['una', 'varias', 'sin_limite'],
  };
  for (const tipoId of Object.keys(ESQUEMAS)) {
    for (const campo of ESQUEMAS[tipoId].campos) {
      // La variante del tipo manda: un mismo campo puede tener opciones
      // distintas en delivery y en Travel.
      const pregunta = preguntaDe(campo.id, tipoId);
      if (!campo.opciones || !pregunta.opciones) continue;
      const delEsquema = campo.opciones.map((o) => o.valor).sort();
      const deLaPregunta = pregunta.opciones.map((o) => o.valor).sort();
      const esperadas = equivalencias[campo.id] ? equivalencias[campo.id].slice().sort() : delEsquema;
      assert.deepStrictEqual(deLaPregunta, esperadas, campo.id + ' tiene opciones distintas a las del esquema');
    }
  }
});

test('cada paso referenciado existe', () => {
  const ids = PASOS.map((p) => p.id);
  for (const id of Object.keys(PREGUNTAS)) {
    assert.ok(ids.indexOf(PREGUNTAS[id].paso) !== -1, id + ' apunta al paso inexistente ' + PREGUNTAS[id].paso);
  }
});

test('el glosario cubre los términos que pidió Juan', () => {
  for (const termino of ['Organizador', 'Tienda Participante', 'Créditos', 'Tope', 'Presupuesto', 'Vigencia', 'Maker']) {
    assert.ok(GLOSARIO[termino], 'falta el término ' + termino + ' en el glosario');
    assert.ok(GLOSARIO[termino].length > 40, termino + ' está definido de forma demasiado corta');
  }
});

test('el glosario no usa jerga legal', () => {
  const jerga = /\bpersona jurídica\b|\bstipul|\bconforme a lo dispuesto\b|\ben virtud de\b/i;
  for (const termino of Object.keys(GLOSARIO)) {
    assert.ok(!jerga.test(GLOSARIO[termino]), termino + ' usa jerga legal');
  }
});

test('todo placeholder de los modelos tiene nombre para el espacio en blanco', () => {
  const { modelos, bloques } = cargarModelos();
  const { paises } = leerJson(rutaDesdeRaiz('data', 'paises.json'));

  // Los valores que salen del país nunca son un hueco: siempre tienen valor.
  const delPais = Object.keys(calcularDerivados({}, paises[0])).filter((llave) => {
    return ['ENTIDAD_LEGAL', 'PAIS_LEGAL', 'LEY_APLICABLE', 'JURISDICCION', 'ENTIDAD_VIGILANCIA',
      'AUTORIDAD_DATOS', 'URL_TC_PLATAFORMA', 'URL_PRIVACIDAD', 'URL_TC_CREDITOS', 'POLITICA_PRIVACIDAD',
      'TEXTO_DERECHOS_DATOS', 'EDAD_MINIMA', 'TEXTO_PERSONA', 'TEXTO_HORA_LOCAL'].indexOf(llave) !== -1;
  });

  const usados = new Set();
  for (const texto of Object.values(Object.assign({}, modelos, bloques))) {
    const patron = /\{\{(\w+)\}\}/g;
    let encontrado;
    while ((encontrado = patron.exec(texto)) !== null) usados.add(encontrado[1]);
  }

  for (const placeholder of usados) {
    if (delPais.indexOf(placeholder) !== -1) continue;
    assert.ok(NOMBRE_DEL_HUECO[placeholder], 'el placeholder ' + placeholder + ' no tiene nombre para el hueco');
  }
});

test('el nombre del hueco nunca muestra el placeholder crudo', () => {
  for (const placeholder of Object.keys(NOMBRE_DEL_HUECO)) {
    const nombre = nombreDelHueco(placeholder);
    assert.ok(nombre.indexOf('_') === -1, placeholder + ' devuelve un nombre con guion bajo');
    assert.ok(nombre === nombre.toLowerCase() || /Créditos|NIT/.test(nombre), placeholder + ' devuelve un nombre con mayúsculas raras');
  }
});

test('los valores por defecto coinciden con los del esquema', () => {
  for (const tipoId of Object.keys(ESQUEMAS)) {
    for (const campo of ESQUEMAS[tipoId].campos) {
      if (campo.porDefecto === undefined) continue;
      const pregunta = PREGUNTAS[campo.id];
      if (pregunta.porDefecto === undefined) continue;
      assert.strictEqual(
        String(pregunta.porDefecto), String(campo.porDefecto),
        campo.id + ': el valor por defecto de la pregunta no coincide con el del esquema'
      );
    }
  }
});

test('las horas por defecto son las que pidió Juan', () => {
  assert.strictEqual(PREGUNTAS.horaInicio.porDefecto, '00:00');
  assert.strictEqual(PREGUNTAS.horaFin.porDefecto, '23:59');
  assert.strictEqual(PREGUNTAS.plazoConfirmacion.porDefecto, 5);
});

test('en Brasil la campaña arranca a las 00:01, y solo en Brasil', () => {
  // Los cuatro T&C aprobados de Brasil arrancan a las 00:01. Hasta el 20 de
  // septiembre de 2026 la ayuda lo contaba y el formulario dejaba 00:00, así
  // que cada documento brasileño salía con una hora distinta de la de los
  // aprobados. Punto B3.
  assert.strictEqual(preguntaDe('horaInicio', 'promocao_br').porDefecto, '00:01');
  for (const tipoId of Object.keys(ESQUEMAS)) {
    if (tipoId === 'promocao_br') continue;
    assert.strictEqual(
      preguntaDe('horaInicio', tipoId).porDefecto, '00:00',
      tipoId + ': la hora de Brasil se coló en otro tipo de campaña'
    );
  }
});

test('la interfaz aplica el valor por defecto del tipo, no solo el general', () => {
  // El mecanismo de variantes ya existió una vez sin que nadie lo llamara: las
  // variantes de texto estaban probadas en Node y la pantalla seguía mostrando
  // el texto genérico. Esta prueba mira que el cliente sí lo use.
  const pasos = fs.readFileSync(
    path.join(__dirname, '..', 'src', 'client', 'js', '62-pasos.js'), 'utf8'
  );
  assert.ok(
    /if \(campoId === 'tipo'\) aplicarValoresDelTipo\(valor\);/.test(pasos),
    'al elegir el tipo nadie aplica sus valores por defecto'
  );
});

test('ningún texto visible usa guiones como puntuación', () => {
  // Regla 8 de CLAUDE.md. Un guion entre espacios es puntuación; uno pegado a
  // letras o dentro de un número no lo es.
  const guionDePuntuacion = / [-–—] /;
  function revisar(texto, donde) {
    if (typeof texto !== 'string') return;
    assert.ok(!guionDePuntuacion.test(texto), donde + ' usa guion como puntuación: "' + texto + '"');
  }
  for (const id of Object.keys(PREGUNTAS)) {
    const pregunta = PREGUNTAS[id];
    revisar(pregunta.pregunta, id + '.pregunta');
    revisar(pregunta.ayuda, id + '.ayuda');
    revisar(pregunta.porQue, id + '.porQue');
    for (const llave of Object.keys(pregunta.errores || {})) revisar(pregunta.errores[llave], id + '.' + llave);
    for (const opcion of pregunta.opciones || []) {
      revisar(opcion.etiqueta, id + '.opcion.etiqueta');
      revisar(opcion.nota, id + '.opcion.nota');
    }
  }
  for (const termino of Object.keys(GLOSARIO)) revisar(GLOSARIO[termino], 'glosario.' + termino);
});

test('ningún texto visible usa emojis', () => {
  const emoji = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;
  for (const id of Object.keys(PREGUNTAS)) {
    const pregunta = PREGUNTAS[id];
    for (const texto of [pregunta.pregunta, pregunta.ayuda, pregunta.porQue]) {
      if (typeof texto === 'string') assert.ok(!emoji.test(texto), id + ' usa un emoji');
    }
  }
});

/**
 * El paso lo manda el esquema: es el que arma el asistente. preguntas.js tiene
 * que decir lo mismo, porque de ahi sale docs/PREGUNTAS_KAM.md y si no
 * coinciden el documento le dice al comercial que la pregunta esta en un paso
 * donde nunca la va a ver.
 */
test('el paso de cada pregunta coincide con el del esquema', () => {
  const { ESQUEMAS } = require('../src/core/esquemas.js');
  for (const tipo of Object.keys(ESQUEMAS)) {
    for (const campo of ESQUEMAS[tipo].campos) {
      const pregunta = preguntaDe(campo.id, tipo);
      if (!pregunta || !pregunta.paso) continue;
      assert.strictEqual(
        pregunta.paso, campo.paso,
        campo.id + ' esta en el paso ' + pregunta.paso + ' en preguntas.js y en ' + campo.paso + ' en el esquema ' + tipo
      );
    }
  }
});

test('toda pregunta de una sola opción avanza sola', () => {
  // Elegir una de varias tarjetas es una respuesta inequívoca. "O que o usuário
  // ganha?" no avanzaba y, después de tres preguntas que sí lo hacían, parecía
  // que el clic no había registrado.
  const excepciones = ['maxPedidos']; // se maneja aparte, con su número.
  for (const id of Object.keys(PREGUNTAS)) {
    const pregunta = PREGUNTAS[id];
    if (!pregunta.opciones || pregunta.multiple || excepciones.indexOf(id) !== -1) continue;
    assert.ok(pregunta.avanzaSola, id + ' tiene opciones excluyentes y no avanza sola');
  }
});

test('lo que no es obligatorio en algún esquema se ve como opcional', () => {
  // Una pregunta que parece obligatoria y no lo es hace inventar datos. El tope
  // de Brasil no era obligatorio y no llevaba la marca "Opcional"; el mínimo de
  // compra, en la misma situación, sí.
  const excepciones = ['maxPedidos', 'sinLimite']; // "¿Cuántas veces?" reúne los dos.
  for (const tipoId of Object.keys(ESQUEMAS)) {
    for (const campo of ESQUEMAS[tipoId].campos) {
      if (campo.obligatorio !== false || campo.tipo === 'casilla' || excepciones.indexOf(campo.id) !== -1) continue;
      const pregunta = preguntaDe(campo.id, tipoId);
      if (!pregunta.pregunta) continue;
      assert.ok(pregunta.opcional, campo.id + ' (' + tipoId + ') no es obligatorio y no se muestra como opcional');
    }
  }
});

test('en Brasil, "Así queda en tu T&C" muestra lo que el documento brasileño lleva', () => {
  // "Así queda en tu T&C" muestra el valor de los placeholders de la pregunta.
  // Las variantes de Brasil heredaban los de Colombia (TOPE, TEXTO_MINIMO_COMPRA),
  // así que el KAM leía "sessenta (60) Créditos" en una campaña que no da
  // Créditos, y una cláusula entera en español que su documento no lleva.
  const modelos = cargarModelos();
  let texto = modelos.modelos[ESQUEMAS.promocao_br.modelo];
  // Una pasada de inclusiones basta: los bloques no incluyen otros bloques.
  texto = texto.replace(/\[\[INCLUIR:([\w-]+)\]\]/g, (todo, bloque) => modelos.bloques[bloque] || '');

  for (const campo of ESQUEMAS.promocao_br.campos) {
    const pregunta = preguntaDe(campo.id, 'promocao_br');
    if (!pregunta || !pregunta.placeholders || pregunta.placeholders.length === 0) continue;
    // País, negocio y tipo no llenan un hueco del documento: su "Así queda" es el país.
    if (['pais', 'negocio', 'tipo'].indexOf(campo.id) !== -1) continue;
    for (const placeholder of pregunta.placeholders) {
      assert.ok(texto.indexOf('{{' + placeholder + '}}') !== -1,
        campo.id + ' (promocao_br) promete {{' + placeholder + '}}, que el modelo brasileño no usa');
    }
  }
});

test('la ciudad del cashback por ETA es un campo de texto, sin los chips de ciudades', () => {
  // Los chips heredados del cashback dejaban agregar dos ciudades, y el
  // documento salía "en la ciudad de Bogotá, Medellín".
  assert.ok(preguntaDe('ciudades', 'cashback').sugerencias, 'el cashback sí sugiere ciudades');
  assert.ok(!preguntaDe('ciudades', 'cashback_eta').sugerencias, 'el ETA no debería sugerir ciudades');
  assert.ok(preguntaDe('ciudades', 'cashback_eta').errores.unaSola, 'falta el mensaje de una sola ciudad');
});
