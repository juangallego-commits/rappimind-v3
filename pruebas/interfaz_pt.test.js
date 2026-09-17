'use strict';

/**
 * La interfaz en portugués.
 *
 * Son dos idiomas distintos y conviene no confundirlos:
 *
 *   - El del **documento** sale del país y no se elige. Un T&C de Brasil va en
 *     portugués siempre.
 *   - El de la **interfaz** lo elige quien llena el formulario, con el botón de
 *     abajo a la derecha.
 *
 * Lo que se protege aquí: que las preguntas que un KAM de Brasil recorre de
 * verdad estén todas traducidas, que la traducción llegue de verdad a la
 * pantalla (una clave que no coincide con el código es una traducción muerta),
 * que lo que es de Brasil no se cuele en las campañas de otros países, y que el
 * español no cambie.
 */

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const { ESQUEMAS } = require('../src/core/esquemas.js');
const { preguntaDe } = require('../src/core/preguntas.js');
const { preguntaEnIdioma, PREGUNTAS_PT, traduccionPara } = require('../src/core/preguntas_pt.js');
const { traducirInterfaz, IDIOMAS_DE_INTERFAZ, TEXTOS_PT } = require('../src/core/textos_interfaz.js');
const { validarSolicitud } = require('../src/core/validaciones.js');
const { paisDesdeFila } = require('../src/core/paises.js');
const { rutaDesdeRaiz, leerJson } = require('../scripts/lib/archivos');

const PAISES = leerJson(rutaDesdeRaiz('data', 'paises.json')).paises;
const BRASIL = paisDesdeFila(PAISES.find((p) => p.codigo === 'BR'));
const COLOMBIA = paisDesdeFila(PAISES.find((p) => p.codigo === 'CO'));

/** Los campos que un comercial de Brasil ve de verdad. */
const CAMPOS_DE_BRASIL = ESQUEMAS.promocao_br.campos
  .filter((campo) => preguntaDe(campo.id, 'promocao_br').pregunta)
  .map((campo) => campo.id);

/** Todo el código fuente que el navegador recibe, como texto. */
function fuentesDelCliente() {
  const carpetas = [
    path.join(__dirname, '..', 'src', 'client', 'js'),
    path.join(__dirname, '..', 'src', 'core'),
  ];
  const archivos = [];
  for (const carpeta of carpetas) {
    for (const nombre of fs.readdirSync(carpeta)) {
      if (nombre.endsWith('.js')) archivos.push({ nombre, texto: fs.readFileSync(path.join(carpeta, nombre), 'utf8') });
    }
  }
  return archivos;
}

test('todas las preguntas que ve un KAM de Brasil están en portugués', () => {
  const sinTraducir = CAMPOS_DE_BRASIL.filter((id) => !PREGUNTAS_PT[id]);
  assert.deepStrictEqual(sinTraducir, [],
    'faltan por traducir: ' + sinTraducir.join(', '));
});

test('cada pregunta traducida trae enunciado, ayuda y porqué, y el mensaje de vacío si el español lo tiene', () => {
  for (const id of CAMPOS_DE_BRASIL) {
    const pt = traduccionPara(PREGUNTAS_PT[id], 'promocao_br');
    const es = preguntaDe(id, 'promocao_br');
    assert.ok(pt.pregunta, id + ' no tiene enunciado en portugués');
    assert.ok(pt.ayuda, id + ' no tiene ayuda en portugués');
    assert.ok(pt.porQue, id + ' no explica por qué se pregunta');
    if (es.errores && es.errores.vacio) {
      assert.ok(pt.errores && pt.errores.vacio, id + ' no dice qué pasa si se deja vacío');
    }
  }
});

test('las opciones traducidas cubren todas las del español', () => {
  for (const id of CAMPOS_DE_BRASIL) {
    const enEspanol = preguntaDe(id, 'promocao_br');
    const pt = traduccionPara(PREGUNTAS_PT[id], 'promocao_br');
    if (!enEspanol.opciones) continue;
    assert.ok(pt.opciones, id + ' tiene opciones en español y ninguna en portugués');
    for (const opcion of enEspanol.opciones) {
      assert.ok(pt.opciones[opcion.valor],
        id + ': la opción "' + opcion.valor + '" no está traducida');
    }
  }
});

test('toda llave de error en portugués existe en español, si no es una traducción muerta', () => {
  // tope.rango, compraMinima.vacio y maxPedidos.cantidad estuvieron traducidas
  // y nunca se mostraron: en español esas llaves se llaman cero, cero y cuantas.
  const muertas = [];
  for (const id of Object.keys(PREGUNTAS_PT)) {
    const tipos = [null].concat(Object.keys(PREGUNTAS_PT[id].variantes || {}));
    for (const tipo of tipos) {
      const es = preguntaDe(id, tipo || undefined);
      const pt = traduccionPara(PREGUNTAS_PT[id], tipo);
      assert.ok(es, id + ' está traducida pero no existe en español');
      for (const llave of Object.keys(pt.errores || {})) {
        if (!es.errores || !es.errores[llave]) muertas.push(id + '.' + llave + (tipo ? ' (' + tipo + ')' : ''));
      }
      for (const valor of Object.keys(pt.opciones || {})) {
        if (!(es.opciones || []).some((o) => o.valor === valor)) muertas.push(id + '.opciones.' + valor);
      }
    }
  }
  assert.deepStrictEqual(muertas, [], 'traducciones que nunca se muestran: ' + muertas.join(', '));
});

test('lo que es de Brasil no se cuela en las campañas de otros países', () => {
  // La traducción se aplicaba por campo sin mirar el tipo: con la interfaz en
  // portugués, un cashback de Colombia preguntaba "Qual é o teto do benefício,
  // em reais?" para un tope en pesos.
  const deBrasil = /reais|parceiro|desconto/i;
  for (const tipo of ['cashback', 'cashback_eta', 'carrera_compras', 'cashback_day']) {
    for (const campo of ESQUEMAS[tipo].campos) {
      const pt = preguntaEnIdioma(preguntaDe(campo.id, tipo), campo.id, 'pt', tipo);
      if (!pt || !pt.pregunta) continue;
      for (const texto of [pt.pregunta, pt.ayuda, pt.porQue]) {
        assert.ok(!deBrasil.test(texto || ''), tipo + '.' + campo.id + ' en portugués habla de Brasil: "' + texto + '"');
      }
    }
  }
  // Y en Brasil sí se lee lo de Brasil.
  assert.strictEqual(preguntaEnIdioma(preguntaDe('tienda', 'promocao_br'), 'tienda', 'pt', 'promocao_br').pregunta,
    'Em qual parceiro a campanha vale?');
  assert.strictEqual(preguntaEnIdioma(preguntaDe('tope', 'promocao_br'), 'tope', 'pt', 'promocao_br').pregunta,
    'Qual é o teto do benefício, em reais?');
});

test('la ayuda de la hora de inicio no contradice el valor por defecto', () => {
  // Decía "Os documentos aprovados começam às 00:01" y el campo venía en 00:00.
  const porDefecto = preguntaDe('horaInicio', 'promocao_br').porDefecto;
  const ayuda = preguntaEnIdioma(preguntaDe('horaInicio', 'promocao_br'), 'horaInicio', 'pt', 'promocao_br').ayuda;
  assert.ok(ayuda.indexOf(porDefecto) !== -1, 'la ayuda en portugués no menciona el valor por defecto ' + porDefecto + ': "' + ayuda + '"');
});

test('los mensajes de validación salen en el idioma de la interfaz', () => {
  const contexto = { fechaReferencia: '2026-09-17', usuarioEnEquipo: true, idioma: 'pt' };
  const entrada = {
    pais: 'BR', negocio: 'rappi', tipo: 'promocao_br', tienda: '',
    fechaInicio: '2026-01-01', horaInicio: '00:00', fechaFin: '2025-12-31', horaFin: '23:59',
    beneficioBr: 'desconto', porcentaje: 500, tope: 0, maxPedidos: 0,
    metodosPagoBr: ['visa'], declaracion: true,
  };
  const porCampo = {};
  for (const error of validarSolicitud(entrada, BRASIL, contexto).errores) porCampo[error.campo] = error.mensaje;

  assert.strictEqual(porCampo.tienda, 'Escreva o parceiro em que a campanha vale.');
  assert.strictEqual(porCampo.fechaInicio, 'Essa data já passou. Os T&C se publicam antes de a campanha começar, então escolha hoje ou um dia futuro.');
  assert.strictEqual(porCampo.fechaFin, 'A campanha não pode terminar antes de começar. Revise a data e a hora de término.');
  assert.strictEqual(porCampo.porcentaje, 'A porcentagem vai de 1 a 100.');
  assert.strictEqual(porCampo.tope, 'O teto precisa ser maior que zero.');
  assert.strictEqual(porCampo.maxPedidos, 'Precisa ser pelo menos um pedido.');

  // Sin idioma, o en español, los mismos errores salen en español.
  const enEspanol = {};
  for (const error of validarSolicitud(entrada, BRASIL, { fechaReferencia: '2026-09-17', usuarioEnEquipo: true }).errores) {
    enEspanol[error.campo] = error.mensaje;
  }
  assert.strictEqual(enEspanol.tienda, 'Escribe el parceiro donde aplica la campaña.');
  assert.strictEqual(enEspanol.tope, 'El tope tiene que ser mayor que cero.');
});

test('lo que no está traducido sale en español, no vacío ni roto', () => {
  // Un KAM de Brasil no ve las preguntas de Carrera de Compras, así que no están
  // traducidas. Si alguna vez llega a una, tiene que leer algo.
  const sinTraducir = preguntaEnIdioma(preguntaDe('criterioGanador', 'carrera_compras'), 'criterioGanador', 'pt', 'carrera_compras');
  assert.ok(sinTraducir.pregunta, 'una pregunta sin traducir se quedó sin enunciado');
  assert.strictEqual(sinTraducir.pregunta, preguntaDe('criterioGanador', 'carrera_compras').pregunta);

  assert.strictEqual(traducirInterfaz('Un texto que nadie tradujo', 'pt'), 'Un texto que nadie tradujo');
});

test('el español no cambia', () => {
  for (const id of CAMPOS_DE_BRASIL) {
    const original = preguntaDe(id, 'promocao_br');
    assert.strictEqual(preguntaEnIdioma(original, id, 'es', 'promocao_br'), original, id + ' cambió en español');
  }
  assert.strictEqual(traducirInterfaz('Empezar', 'es'), 'Empezar');
  assert.strictEqual(traducirInterfaz('Empezar'), 'Empezar');

  const enEspanol = {};
  const entrada = { pais: 'CO', negocio: 'rappi', tipo: 'cashback', tienda: '' };
  for (const error of validarSolicitud(entrada, COLOMBIA, { fechaReferencia: '2026-09-17' }).errores) enEspanol[error.campo] = error.mensaje;
  assert.strictEqual(enEspanol.tienda, 'Escribe la tienda donde aplica la campaña.');
});

test('se ofrecen exactamente los dos idiomas de interfaz', () => {
  assert.deepStrictEqual(IDIOMAS_DE_INTERFAZ.map((i) => i.codigo), ['es', 'pt']);
  for (const idioma of IDIOMAS_DE_INTERFAZ) {
    assert.ok(idioma.nombre && idioma.bandera, idioma.codigo + ' no tiene nombre o etiqueta');
  }
});

test('las pantallas del recorrido tienen su traducción', () => {
  // Las cadenas que un KAM de Brasil lee sí o sí, de principio a fin.
  const imprescindibles = [
    'Genera los Términos y Condiciones de tu campaña', 'Empezar',
    '¿Esta campaña la puedo hacer aquí?', 'Sí', 'No',
    'Las dinámicas con azar necesitan permiso previo de la autoridad. Legal tiene que revisarlas antes de lanzarlas.',
    'Siguiente', 'Atrás', 'Tu T&C', 'Revisar y generar', 'Cambiar', 'Opcional',
    'Así queda en tu T&C:', '¿Por qué te preguntamos esto?', 'Paso {n} de {m}',
    'Disponible.', 'En piloto: solo para el equipo de pruebas.',
    'Sin límite', 'Una sola vez', 'Varias veces', '{n} veces', 'Confirmado',
    'Revisa antes de generar', 'Generar T&C', 'Te falta:', 'Elige el país de la campaña.',
    ' está en pruebas: no publiques este documento todavía',
    'Tu T&C está listo', 'Lo que vas a pegar en Squarespace', 'Título del evento', 'Hacer otra campaña',
    'Esta campaña la redacta Legal', 'Volver al inicio',
    'Mis campañas', 'Ayuda', 'Idioma de la interfaz',
  ];
  for (const texto of imprescindibles) {
    assert.ok(Object.prototype.hasOwnProperty.call(TEXTOS_PT, texto),
      'sin traducir al portugués: "' + texto + '"');
  }
});

test('cada clave del diccionario aparece literal en el código, o es una traducción muerta', () => {
  // El diccionario está indexado por el texto en español. Un carácter de
  // diferencia entre la clave y el literal del código y la traducción no se
  // aplica, sin avisar. "Cambiar" estuvo traducido y se seguía viendo en
  // español porque el código no pasaba por T().
  const fuentes = fuentesDelCliente();
  const muertas = [];
  for (const clave of Object.keys(TEXTOS_PT)) {
    const literal = "'" + clave.replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'";
    const aparece = fuentes.some((f) => f.nombre !== 'textos_interfaz.js' && f.texto.indexOf(literal) !== -1);
    if (!aparece) muertas.push(clave);
  }
  assert.deepStrictEqual(muertas, [], 'claves que ningún archivo usa tal cual: ' + muertas.join(' | '));
});

test('ningún texto traducido se escribe en la pantalla sin pasar por T()', () => {
  // El caso real: preguntaDeCatalogo escribía texto: '¿Por qué te preguntamos
  // esto?' a mano, y en la pregunta del país y del tipo el desplegable seguía
  // en español mientras dibujarPregunta sí lo traducía.
  const carpeta = path.join(__dirname, '..', 'src', 'client', 'js');
  const problemas = [];
  for (const nombre of fs.readdirSync(carpeta)) {
    if (!nombre.endsWith('.js')) continue;
    const lineas = fs.readFileSync(path.join(carpeta, nombre), 'utf8').split('\n');
    for (let i = 0; i < lineas.length; i++) {
      // Solo las líneas que dibujan algo: un dato en una lista (como las
      // preguntas del filtro) se traduce después, al dibujarlo.
      if (lineas[i].indexOf('crear(') === -1 && lineas[i].indexOf('createTextNode(') === -1) continue;
      for (const clave of Object.keys(TEXTOS_PT)) {
        const literal = "'" + clave.replace(/'/g, "\\'") + "'";
        if (lineas[i].indexOf('texto: ' + literal) !== -1 || lineas[i].indexOf('createTextNode(' + literal + ')') !== -1) {
          problemas.push(nombre + ':' + (i + 1) + ' escribe ' + literal + ' sin T()');
        }
      }
    }
  }
  assert.deepStrictEqual(problemas, [], problemas.join('\n'));
});

test('los números van como marcador, no como una palabra del idioma', () => {
  // "Faltan varios datos" se traducía "Faltam varios dados" sin tilde, y ese
  // "varios" sin tilde era lo que el replace() buscaba para poner el número:
  // corregir la ortografía habría borrado el número.
  for (const clave of Object.keys(TEXTOS_PT)) {
    const marcadores = clave.match(/\{\w+\}/g) || [];
    for (const marcador of marcadores) {
      assert.ok(TEXTOS_PT[clave].indexOf(marcador) !== -1,
        'la traducción de "' + clave + '" perdió el marcador ' + marcador);
    }
    assert.ok(!/\b(varios|varias)\b/.test(TEXTOS_PT[clave]),
      'la traducción de "' + clave + '" lleva "varios" o "varias" sin tilde: "' + TEXTOS_PT[clave] + '"');
  }
  assert.strictEqual(traducirInterfaz('Faltan {n} datos', 'pt').replace('{n}', 3), 'Faltam 3 dados');
  assert.strictEqual(traducirInterfaz('Quedan {n} preguntas en este paso.', 'pt').replace('{n}', 2), 'Faltam 2 perguntas nesta etapa.');
});
