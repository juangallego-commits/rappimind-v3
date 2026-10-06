'use strict';

/**
 * El visor de la página /tyc (src/visor/visor.js) y el bloque que se pega en
 * Squarespace (scripts/visor.js).
 *
 * El visor corre en el navegador de cualquier usuario de Rappi, así que aquí se
 * prueba contra un documento falso que revienta si alguien usa innerHTML,
 * document.write o un atributo on...: el texto del archivo nunca puede
 * convertirse en HTML.
 *
 * Lo que se protege:
 *
 *   - Que el visor lea el enlace igual que RappiMind (rutaDesdeBusquedaWeb).
 *   - Que muestre exactamente lo que antes se pegaba en el evento de
 *     Squarespace (htmlParaSquarespace), caso por caso.
 *   - Que reintente lo pasajero, diga lo que pasó y deje reintentar.
 *   - Que el bloque armado para Squarespace corra solo, sin dejar nada suelto
 *     en la página, y que la revisión de cada hora lo reconozca.
 */

const test = require('node:test');
const assert = require('node:assert');
const vm = require('node:vm');

const { rutaDesdeRaiz, leerJson } = require('../scripts/lib/archivos');
const { cargarModelos } = require('../scripts/lib/modelos');
const { generarTexto } = require('../src/core/generar.js');
const { htmlParaSquarespace } = require('../src/core/publicacion.js');
const { escaparHtml } = require('../src/core/correo.js');
const W = require('../src/core/publicacion_web.js');
const V = require('../src/visor/visor.js');
const { bloqueParaSquarespace, baseDelVisor } = require('../scripts/visor.js');

const { paises } = leerJson(rutaDesdeRaiz('data', 'paises.json'));
const { casos } = leerJson(rutaDesdeRaiz('pruebas', 'casos_base.json'));
const modelos = cargarModelos();

const CONFIG = W.configuracionDePublicacionWeb({ bucket: 'tyc-rappi' });
const BASE = baseDelVisor(CONFIG);
const DIRECCION = 'jumbo-mt-50-cashback-17-sep-2026';
const URL_VIGENTE = BASE + 'co/' + DIRECCION + '.json';

function textoDeCaso(caso) {
  const pais = paises.find((p) => p.codigo === caso.entrada.pais);
  return generarTexto(caso.entrada, pais, modelos, {
    fechaReferencia: caso.fecha_referencia,
    usuarioEnEquipo: caso.usuario_en_equipo === true,
  });
}

const CB01 = textoDeCaso(casos.find((c) => c.id === 'CB01')).texto;

function archivo(datos) {
  return { codigo: 200, cuerpo: W.jsonEnAscii(W.documentoWeb(Object.assign({
    id: 'RM-20261005-0001', codigoPais: 'CO', titulo: 'Jumbo MT · 50% Cashback · 17 sep 2026',
    fechaInicio: '2026-09-17', fechaFin: '2026-09-17', texto: CB01, version: 1, publicado: '2026-10-05 23:40:00',
  }, datos))) };
}

// --- Un navegador falso ------------------------------------------------------------

class Nodo {
  constructor(documento, tipo, nombre, texto) {
    this.ownerDocument = documento;
    this.nodeType = tipo;
    this.nodeName = nombre;
    this.childNodes = [];
    this.parentNode = null;
    this.atributos = {};
    this.className = '';
    this.data = texto;
    this.onclick = null;
  }

  get firstChild() { return this.childNodes[0] || null; }

  appendChild(hijo) {
    if (hijo.parentNode) hijo.parentNode.removeChild(hijo);
    hijo.parentNode = this;
    this.childNodes.push(hijo);
    return hijo;
  }

  removeChild(hijo) {
    const i = this.childNodes.indexOf(hijo);
    if (i === -1) throw new Error('No es hijo de este nodo.');
    this.childNodes.splice(i, 1);
    hijo.parentNode = null;
    return hijo;
  }

  setAttribute(nombre, valor) {
    if (/^on/i.test(nombre)) throw new Error('El visor no pone manejadores como atributo: ' + nombre);
    this.atributos[nombre] = String(valor);
  }

  getAttribute(nombre) {
    return Object.prototype.hasOwnProperty.call(this.atributos, nombre) ? this.atributos[nombre] : null;
  }

  get textContent() {
    return this.nodeType === 3 ? this.data : this.childNodes.map((h) => h.textContent).join('');
  }

  set innerHTML(valor) { throw new Error('El visor no puede usar innerHTML.'); }
  get innerHTML() { throw new Error('El visor no puede usar innerHTML.'); }
  set outerHTML(valor) { throw new Error('El visor no puede usar outerHTML.'); }
  insertAdjacentHTML() { throw new Error('El visor no puede usar insertAdjacentHTML.'); }

  /** Los elementos de abajo con esa etiqueta, en orden. */
  todos(etiqueta) {
    const salida = [];
    for (const hijo of this.childNodes) {
      if (hijo.nodeType !== 1) continue;
      if (hijo.nodeName === etiqueta) salida.push(hijo);
      salida.push(...hijo.todos(etiqueta));
    }
    return salida;
  }
}

function crearVentana(busqueda, respuestas) {
  const cola = [];
  const pedidos = [];
  const esperas = [];
  const documento = {
    title: 'TyC',
    createElement: (etiqueta) => new Nodo(documento, 1, String(etiqueta).toUpperCase()),
    createTextNode: (texto) => new Nodo(documento, 3, '#text', String(texto)),
    getElementById: (id) => (id === 'rappimind-tyc' ? contenedor : null),
    write() { throw new Error('El visor no puede usar document.write.'); },
  };
  const contenedor = documento.createElement('div');

  class PedidoFalso {
    open(metodo, url) {
      this.metodo = metodo;
      this.url = url;
    }

    send() {
      pedidos.push(this.url);
      const guion = respuestas[this.url];
      const respuesta = Array.isArray(guion) ? (guion.length > 1 ? guion.shift() : guion[0]) : (guion || { codigo: 404, cuerpo: '' });
      cola.push(() => {
        if (respuesta.falla === 'tiempo') this.ontimeout();
        else if (respuesta.falla) this.onerror();
        else {
          this.status = respuesta.codigo;
          this.responseText = respuesta.cuerpo;
          this.onload();
        }
      });
    }
  }

  const ventana = {
    document: documento,
    location: { search: busqueda },
    XMLHttpRequest: PedidoFalso,
    setTimeout(funcion, espera) {
      esperas.push(espera);
      cola.push(funcion);
    },
  };
  return {
    ventana, documento, contenedor, pedidos, esperas,
    correr() {
      let vueltas = 0;
      while (cola.length) {
        if (++vueltas > 200) throw new Error('El visor no termina de cargar.');
        cola.shift()();
      }
    },
  };
}

function abrir(busqueda, respuestas) {
  const navegador = crearVentana(busqueda, respuestas);
  V.iniciarVisor(navegador.ventana, { base: BASE });
  navegador.correr();
  return navegador;
}

/** El cuerpo pintado, como el HTML que antes se pegaba en el evento. */
function comoHtml(nodo) {
  if (nodo.nodeType === 3) return escaparHtml(nodo.data);
  const etiqueta = nodo.nodeName.toLowerCase();
  const adentro = nodo.childNodes.map(comoHtml).join('');
  if (etiqueta === 'p' && nodo.className === 'rappimind-tyc-centrado') return '<p style="text-align:center">' + adentro + '</p>';
  return '<' + etiqueta + '>' + adentro + '</' + etiqueta + '>';
}

function cuerpoPintado(contenedor) {
  return contenedor.childNodes.filter((n) => n.nodeName !== 'H1' && n.className !== 'rappimind-tyc-aviso').map(comoHtml).join('');
}

function aviso(contenedor) {
  const nodo = contenedor.childNodes.find((n) => n.className === 'rappimind-tyc-aviso');
  return nodo ? nodo.textContent : '';
}

// --- El enlace ---------------------------------------------------------------------

test('el visor lee el enlace igual que RappiMind', () => {
  const busquedas = [
    '?co/' + DIRECCION, '?co/' + DIRECCION + '&utm_source=push', '?co/' + DIRECCION + '?fbclid=1',
    '?co%2F' + DIRECCION + '=', '?CO/Jumbo-MT', '?co/' + DIRECCION + '/', '?co/' + DIRECCION + '/v2',
    '?br/pao-de-acucar-10-cashback', '', '?', '?co', '?co/', '?co/../x', '?co/x/v0', '?co/x/v1000',
    '?col/x', '?co/x%E0%A4%A', '?co/x y', '?co/x_y', '?co/x--y', '?co/-x',
  ];
  for (const busqueda of busquedas) {
    assert.deepStrictEqual(V.rutaDeLaBusqueda(busqueda), W.rutaDesdeBusquedaWeb(busqueda), busqueda);
  }
  assert.deepStrictEqual(V.rutaDeLaBusqueda('?co/x/v2'), { codigo: 'co', direccion: 'x', version: 2 });
});

test('el visor pide el mismo archivo que RappiMind escribe', () => {
  for (const version of [0, 1, 7]) {
    const ruta = { codigo: 'co', direccion: DIRECCION, version };
    assert.strictEqual(V.urlDelArchivo(BASE, ruta, version),
      W.urlPublicaDelObjetoWeb(CONFIG, W.nombreDelObjetoWeb(CONFIG, 'CO', DIRECCION, version)));
  }
});

test('un enlace sin campaña no pide nada y dice que no lo encontró', () => {
  for (const busqueda of ['', '?utm_source=push', '?co/../secreto']) {
    const { contenedor, pedidos } = abrir(busqueda, {});
    assert.deepStrictEqual(pedidos, [], busqueda);
    assert.strictEqual(aviso(contenedor), V.TEXTOS_DEL_VISOR.es.noExiste, busqueda);
  }
});

// --- El documento -------------------------------------------------------------------

test('muestra exactamente lo que antes se pegaba en el evento, caso por caso', () => {
  let revisados = 0;
  for (const caso of casos) {
    if (caso.esperado.resultado !== 'genera') continue;
    const resultado = textoDeCaso(caso);
    if (!resultado.valido) continue;
    const { contenedor } = abrir('?co/' + DIRECCION, { [URL_VIGENTE]: archivo({ texto: resultado.texto }) });
    assert.strictEqual(cuerpoPintado(contenedor), htmlParaSquarespace(resultado.texto).replace(/\n/g, ''), caso.id);
    revisados += 1;
  }
  assert.ok(revisados >= 30);
});

test('arriba va el nombre de la campaña, que también queda en la pestaña', () => {
  const { contenedor, documento, pedidos } = abrir('?co/' + DIRECCION + '&utm_source=push', { [URL_VIGENTE]: archivo({}) });
  assert.deepStrictEqual(pedidos, [URL_VIGENTE]);
  assert.strictEqual(contenedor.childNodes[0].nodeName, 'H1');
  assert.strictEqual(contenedor.childNodes[0].textContent, 'Jumbo MT · 50% Cashback · 17 sep 2026');
  assert.strictEqual(documento.title, 'Jumbo MT · 50% Cashback · 17 sep 2026');
  assert.strictEqual(contenedor.getAttribute('lang'), 'es');
  assert.strictEqual(aviso(contenedor), '', 'la versión vigente no lleva aviso');
});

test('un texto con etiquetas se muestra como texto, nunca como HTML', () => {
  const malicioso = '**1. Tienda.** <img src=x onerror=alert(1)> <script>alert(2)</script>';
  const { contenedor } = abrir('?co/' + DIRECCION, {
    [URL_VIGENTE]: archivo({ texto: malicioso, titulo: '<b>Título</b>' }),
  });
  assert.deepStrictEqual(contenedor.todos('IMG'), []);
  assert.deepStrictEqual(contenedor.todos('SCRIPT'), []);
  assert.strictEqual(contenedor.childNodes[0].textContent, '<b>Título</b>');
  assert.ok(contenedor.textContent.indexOf('<img src=x onerror=alert(1)>') !== -1);
});

test('un archivo con partes raras pinta solo el texto que entiende', () => {
  const raro = JSON.stringify({
    formato: 1, titulo: 7, bloques: [
      null, 'texto suelto', { tipo: 'parrafo', partes: [{ texto: 'Bien.' }, { texto: 3 }, { texto: { a: 1 } }, null] },
      { tipo: 'vineta', partes: 'no es una lista' }, { tipo: 'desconocido', partes: [{ texto: 'Como párrafo.', negrita: 'si' }] },
    ],
  });
  const { contenedor } = abrir('?co/' + DIRECCION, { [URL_VIGENTE]: { codigo: 200, cuerpo: raro } });
  assert.strictEqual(cuerpoPintado(contenedor), '<p>Bien.</p><p>Como párrafo.</p>');
  assert.deepStrictEqual(contenedor.todos('H1'), [], 'un título que no es texto no se pinta');
});

test('en Brasil el visor habla portugués', () => {
  const url = BASE + 'br/pao-de-acucar.json';
  const { contenedor } = abrir('?br/pao-de-acucar', { [url]: { codigo: 404, cuerpo: '' } });
  assert.strictEqual(contenedor.getAttribute('lang'), 'pt');
  assert.strictEqual(aviso(contenedor), V.TEXTOS_DEL_VISOR.pt.noExiste);
});

// --- Lo que puede salir mal -------------------------------------------------------------

test('un archivo que no está, o que Cloud Storage niega, es "no lo encontramos"', () => {
  for (const codigo of [404, 403]) {
    const { contenedor, pedidos } = abrir('?co/' + DIRECCION, { [URL_VIGENTE]: { codigo, cuerpo: '<Error/>' } });
    assert.strictEqual(pedidos.length, 1, 'no se reintenta: no va a aparecer');
    assert.strictEqual(aviso(contenedor), V.TEXTOS_DEL_VISOR.es.noExiste);
  }
});

test('lo pasajero se reintenta solo, y si se arregla se ve el T&C', () => {
  const { contenedor, pedidos, esperas } = abrir('?co/' + DIRECCION, {
    [URL_VIGENTE]: [{ falla: 'red' }, { codigo: 503, cuerpo: '' }, archivo({})],
  });
  assert.strictEqual(pedidos.length, 3);
  assert.deepStrictEqual(esperas, V.ESPERAS_ENTRE_INTENTOS.slice(1));
  assert.strictEqual(cuerpoPintado(contenedor), htmlParaSquarespace(CB01).replace(/\n/g, ''));
});

test('si no se arregla, lo dice y deja intentar de nuevo', () => {
  const navegador = abrir('?co/' + DIRECCION, { [URL_VIGENTE]: [{ falla: 'tiempo' }, { falla: 'red' }, { codigo: 500, cuerpo: '' }, archivo({})] });
  assert.strictEqual(navegador.pedidos.length, 3);
  assert.strictEqual(aviso(navegador.contenedor), V.TEXTOS_DEL_VISOR.es.error);
  const [boton] = navegador.contenedor.todos('BUTTON');
  assert.strictEqual(boton.textContent, 'Intentar de nuevo');

  boton.onclick();
  navegador.correr();
  assert.strictEqual(navegador.pedidos.length, 4);
  assert.strictEqual(navegador.contenedor.childNodes[0].textContent, 'Jumbo MT · 50% Cashback · 17 sep 2026');
});

test('un archivo dañado o de un formato que no conoce no se reintenta', () => {
  for (const cuerpo of ['{no es json', JSON.stringify({ formato: 2, bloques: [] }), JSON.stringify({ formato: 1 })]) {
    const { contenedor, pedidos } = abrir('?co/' + DIRECCION, { [URL_VIGENTE]: { codigo: 200, cuerpo } });
    assert.strictEqual(pedidos.length, 1, cuerpo);
    assert.strictEqual(aviso(contenedor), V.TEXTOS_DEL_VISOR.es.error, cuerpo);
  }
});

test('un T&C retirado lo dice, con la fecha', () => {
  const anterior = W.documentoWeb({ id: 'RM-1', codigoPais: 'CO', titulo: 'Jumbo', texto: CB01, version: 1, publicado: '2026-10-05 10:00:00' });
  const retirado = W.documentoWebRetirado(anterior, { fecha: '2026-10-06 09:00:00' });
  const { contenedor } = abrir('?co/' + DIRECCION, { [URL_VIGENTE]: { codigo: 200, cuerpo: W.jsonEnAscii(retirado) } });
  assert.strictEqual(contenedor.childNodes[0].textContent, 'Jumbo');
  assert.strictEqual(aviso(contenedor), 'Estos términos y condiciones fueron retirados el 6 de octubre de 2026.');
  assert.strictEqual(cuerpoPintado(contenedor), '', 'el texto retirado no se muestra');
});

// --- Las versiones ------------------------------------------------------------------

test('una versión anterior se muestra con su aviso y el enlace a la vigente', () => {
  const urlV1 = BASE + 'co/' + DIRECCION + '/v1.json';
  const { contenedor, pedidos } = abrir('?co/' + DIRECCION + '/v1', {
    [urlV1]: archivo({ version: 1, publicado: '2026-10-05 23:40:00' }),
    [URL_VIGENTE]: archivo({ version: 2, publicado: '2026-10-09 08:00:00' }),
  });
  assert.deepStrictEqual(pedidos.sort(), [URL_VIGENTE, urlV1].sort());
  assert.strictEqual(aviso(contenedor),
    'Esta es una versión anterior de estos términos y condiciones, publicada el 5 de octubre de 2026. Ver la versión vigente');
  const [enlace] = contenedor.todos('A');
  assert.strictEqual(enlace.getAttribute('href'), '?co/' + DIRECCION);
  assert.strictEqual(cuerpoPintado(contenedor), htmlParaSquarespace(CB01).replace(/\n/g, ''));
});

test('si esa versión es la vigente no lleva aviso; si se retiró, lo dice', () => {
  const urlV2 = BASE + 'co/' + DIRECCION + '/v2.json';
  const vigente = abrir('?co/' + DIRECCION + '/v2', {
    [urlV2]: archivo({ version: 2 }), [URL_VIGENTE]: archivo({ version: 2 }),
  });
  assert.strictEqual(aviso(vigente.contenedor), '');

  const retirado = W.documentoWebRetirado({}, { fecha: '2026-10-06 09:00:00' });
  const despues = abrir('?co/' + DIRECCION + '/v2', {
    [urlV2]: archivo({ version: 2, publicado: '2026-10-05 23:40:00' }),
    [URL_VIGENTE]: { codigo: 200, cuerpo: W.jsonEnAscii(retirado) },
  });
  assert.strictEqual(aviso(despues.contenedor),
    'Esta es una versión anterior de estos términos y condiciones, publicada el 5 de octubre de 2026. ' +
    'Estos términos y condiciones fueron retirados el 6 de octubre de 2026.');
});

test('si la vigente no carga, la versión dice cuál es y de cuándo', () => {
  const urlV1 = BASE + 'co/' + DIRECCION + '/v1.json';
  const { contenedor } = abrir('?co/' + DIRECCION + '/v1', {
    [urlV1]: archivo({ version: 1, publicado: '2026-10-05 23:40:00' }),
    [URL_VIGENTE]: { falla: 'red' },
  });
  assert.strictEqual(aviso(contenedor),
    'Estás viendo la versión 1 de estos términos y condiciones, publicada el 5 de octubre de 2026.');
});

// --- El bloque para Squarespace ------------------------------------------------------------

const BLOQUE = bloqueParaSquarespace(CONFIG);
const SCRIPT = /<script>([\s\S]*)<\/script>/.exec(BLOQUE)[1];

test('el bloque sale en ASCII puro, para que nada le cambie la codificación', () => {
  assert.ok(/^[\x00-\x7e]*$/.test(BLOQUE));
  assert.ok(BLOQUE.indexOf('"base":"https://storage.googleapis.com/tyc-rappi/tyc/"') !== -1);
});

test('el bloque no trae nada que interprete HTML ni deje código suelto', () => {
  for (const prohibido of ['innerHTML', 'outerHTML', 'insertAdjacentHTML', 'document.write', 'eval(', 'Function(', 'module.exports']) {
    assert.strictEqual(SCRIPT.indexOf(prohibido), -1, prohibido);
  }
  assert.strictEqual(SCRIPT.indexOf('</'), -1, 'un "</" dentro del script lo cortaría antes de tiempo');
  assert.strictEqual(SCRIPT.indexOf('<!--'), -1);
});

test('el bloque armado corre solo y no deja nada en la página', () => {
  const navegador = crearVentana('?co/' + DIRECCION, { [URL_VIGENTE]: archivo({}) });
  const contexto = { window: navegador.ventana };
  vm.runInNewContext(SCRIPT, contexto);
  navegador.correr();
  assert.deepStrictEqual(Object.keys(contexto), ['window'], 'el visor no puede dejar variables globales');
  assert.strictEqual(cuerpoPintado(navegador.contenedor), htmlParaSquarespace(CB01).replace(/\n/g, ''));
});

test('la revisión de cada hora reconoce el bloque, y deja de hacerlo si le quitan el código', () => {
  const pagina = '<html><body><div class="sqs-block code-block">' + BLOQUE + '</div></body></html>';
  assert.strictEqual(W.estadoDelVisor({ codigo: 200, cuerpo: pagina }).estado, 'en_pie');
  assert.strictEqual(W.MARCA_DEL_VISOR, V.MARCA);
  const sinScript = pagina.replace(/<script>[\s\S]*<\/script>/, '');
  assert.strictEqual(W.estadoDelVisor({ codigo: 200, cuerpo: sinScript }).estado, 'caido');
});
