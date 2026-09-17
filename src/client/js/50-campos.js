'use strict';

/**
 * Dibuja UNA pregunta con todo lo que exige el estandar:
 * la pregunta, la ayuda con ejemplo, el "por que te preguntamos esto",
 * el control, "Asi queda en tu T&C" con la frase real y la validacion en vivo.
 *
 * Los textos salen de src/core/preguntas.js. Aqui no se inventa ninguno.
 */

var RM = window.RM;
var crear = RM.util.crear;
var vaciar = RM.util.vaciar;
var estado = RM.estado;

/** Envuelve los terminos del glosario en el texto de una ayuda. */
function conGlosario(texto) {
  var contenedor = crear('span');
  var terminos = Object.keys(GLOSARIO).sort(function (a, b) { return b.length - a.length; });
  var patron = new RegExp('\\b(' + terminos.map(function (t) {
    return t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }).join('|') + ')\\b', 'g');

  var ultimo = 0;
  var encontrado;
  while ((encontrado = patron.exec(texto)) !== null) {
    if (encontrado.index > ultimo) {
      contenedor.appendChild(document.createTextNode(texto.slice(ultimo, encontrado.index)));
    }
    contenedor.appendChild(botonDeGlosario(encontrado[1]));
    ultimo = encontrado.index + encontrado[1].length;
  }
  if (ultimo < texto.length) contenedor.appendChild(document.createTextNode(texto.slice(ultimo)));
  return contenedor;
}

function botonDeGlosario(termino) {
  var boton = crear('button', {
    clase: 'glosario',
    type: 'button',
    texto: termino,
    'aria-describedby': 'glosario-panel',
    onclick: function (evento) {
      evento.preventDefault();
      mostrarGlosario(boton, termino);
    },
  });
  boton.addEventListener('mouseenter', function () { mostrarGlosario(boton, termino); });
  boton.addEventListener('mouseleave', ocultarGlosario);
  boton.addEventListener('focus', function () { mostrarGlosario(boton, termino); });
  boton.addEventListener('blur', ocultarGlosario);
  return boton;
}

var panelDeGlosario = null;

function mostrarGlosario(anclaje, termino) {
  ocultarGlosario();
  panelDeGlosario = crear('div', { clase: 'glosario-panel', id: 'glosario-panel', role: 'tooltip' }, [
    crear('strong', { texto: termino }),
    document.createTextNode(GLOSARIO[termino]),
  ]);
  document.body.appendChild(panelDeGlosario);

  var caja = anclaje.getBoundingClientRect();
  var ancho = panelDeGlosario.offsetWidth;
  var izquierda = Math.min(Math.max(8, caja.left), window.innerWidth - ancho - 8);
  panelDeGlosario.style.left = izquierda + 'px';
  panelDeGlosario.style.top = (window.scrollY + caja.bottom + 8) + 'px';
}

function ocultarGlosario() {
  if (panelDeGlosario && panelDeGlosario.parentNode) panelDeGlosario.parentNode.removeChild(panelDeGlosario);
  panelDeGlosario = null;
}

document.addEventListener('click', function (evento) {
  if (panelDeGlosario && !evento.target.classList.contains('glosario')) ocultarGlosario();
});

/** "Así queda en tu T&C": la frase real que produce el motor con lo respondido. */
function asiQueda(campoId, pais) {
  var pregunta = RM.estado.pregunta(campoId);
  if (!pregunta || !pregunta.placeholders || pregunta.placeholders.length === 0) return null;

  var valores = calcularDerivados(estado.entrada(), pais);
  var frases = [];
  for (var i = 0; i < pregunta.placeholders.length; i++) {
    var valor = valores[pregunta.placeholders[i]];
    if (valor && frases.indexOf(valor) === -1) frases.push(valor);
  }
  if (frases.length === 0) return null;

  return crear('div', { clase: 'asi-queda' }, [
    crear('span', { clase: 'etiqueta', texto: 'Así queda en tu T&C:' }),
    crear('span', { clase: 'frase', texto: frases.join(' ') }),
  ]);
}

// --- Controles ---------------------------------------------------------------

function controlTexto(campo, pregunta, alCambiar) {
  var valor = estado.entrada()[campo.id];
  var entradaTexto = crear('input', {
    type: 'text',
    id: 'campo-' + campo.id,
    value: valor === undefined || valor === null ? '' : String(valor),
    placeholder: pregunta.ejemplo || '',
    maxlength: campo.maximo || 200,
    autocomplete: 'off',
  });
  entradaTexto.addEventListener('input', function () { alCambiar(entradaTexto.value); });

  var caja = crear('div', { clase: 'campo-caja' }, [entradaTexto]);

  if (pregunta.sugerencias) {
    var sugerencias = crear('div', { clase: 'sugerencias' });
    for (var i = 0; i < pregunta.sugerencias.length; i++) {
      (function (ciudad) {
        sugerencias.appendChild(crear('button', {
          clase: 'sugerencia', type: 'button', texto: ciudad,
          onclick: function () {
            var actual = entradaTexto.value.trim();
            var partes = actual ? actual.split(',').map(function (c) { return c.trim(); }).filter(Boolean) : [];
            if (partes.indexOf(ciudad) === -1) partes.push(ciudad);
            entradaTexto.value = partes.join(', ');
            alCambiar(entradaTexto.value);
          },
        }));
      })(pregunta.sugerencias[i]);
    }
    return crear('div', {}, [caja, sugerencias]);
  }
  return caja;
}

function controlNumero(campo, pregunta, alCambiar, pais) {
  var valor = estado.entrada()[campo.id];
  var esMonto = !!pregunta.moneda;
  var separador = (pais && pais.separador_miles) || '.';

  var entradaNumero = crear('input', {
    type: 'text',
    inputmode: 'numeric',
    id: 'campo-' + campo.id,
    value: valor === null || valor === undefined || valor === '' ? '' : (esMonto ? RM.util.conSeparadorDeMiles(valor, separador) : String(valor)),
    placeholder: pregunta.ejemplo ? (esMonto ? RM.util.conSeparadorDeMiles(pregunta.ejemplo, separador) : pregunta.ejemplo) : '',
    autocomplete: 'off',
  });

  entradaNumero.addEventListener('input', function () {
    var digitos = RM.util.soloDigitos(entradaNumero.value);
    if (esMonto) {
      var posicion = entradaNumero.value.length - entradaNumero.selectionStart;
      entradaNumero.value = RM.util.conSeparadorDeMiles(digitos, separador);
      entradaNumero.selectionStart = entradaNumero.selectionEnd = Math.max(0, entradaNumero.value.length - posicion);
    } else {
      entradaNumero.value = digitos;
    }
    alCambiar(digitos === '' ? null : Number(digitos));
  });

  var caja = crear('div', { clase: 'campo-caja' + (esMonto ? ' con-moneda' : '') }, [
    esMonto ? crear('span', { clase: 'simbolo-moneda', texto: (pais && pais.moneda_simbolo) || '$' }) : null,
    entradaNumero,
  ]);
  return caja;
}

function controlFechaUHora(campo, alCambiar) {
  var valor = estado.entrada()[campo.id];
  var control = crear('input', {
    type: campo.tipo === 'fecha' ? 'date' : 'time',
    id: 'campo-' + campo.id,
    value: valor || '',
  });
  control.addEventListener('change', function () { alCambiar(control.value); });
  return crear('div', { clase: 'campo-caja' }, [control]);
}

/** Botones grandes con una línea de explicación. */
function controlOpciones(campo, pregunta, alElegir, deshabilitadas) {
  var elegido = estado.entrada()[campo.id];
  var grupo = crear('div', { clase: 'opciones', role: 'radiogroup', 'aria-labelledby': 'pregunta-' + campo.id });

  var opciones = pregunta.opciones || campo.opciones || [];
  for (var i = 0; i < opciones.length; i++) {
    (function (opcion, indice) {
      var razon = deshabilitadas ? deshabilitadas[opcion.valor] : null;
      var boton = crear('button', {
        clase: 'opcion', type: 'button', role: 'radio',
        'aria-checked': String(elegido === opcion.valor),
        'aria-pressed': String(elegido === opcion.valor),
        disabled: !!razon,
        onclick: function () { if (!razon) alElegir(opcion.valor); },
      }, [
        crear('span', { clase: 'opcion-titulo', texto: opcion.etiqueta }),
        crear('span', { clase: 'opcion-nota', texto: razon || opcion.nota || '' }),
      ]);

      boton.addEventListener('keydown', function (evento) {
        if (evento.key !== 'ArrowDown' && evento.key !== 'ArrowUp') return;
        evento.preventDefault();
        var hermanos = grupo.querySelectorAll('.opcion:not([disabled])');
        var actual = Array.prototype.indexOf.call(hermanos, boton);
        var siguiente = evento.key === 'ArrowDown' ? actual + 1 : actual - 1;
        if (hermanos[siguiente]) hermanos[siguiente].focus();
      });

      grupo.appendChild(boton);
    })(opciones[i], i);
  }
  return grupo;
}

/** Casillas: cuando se pueden marcar varias. */
function controlCasillas(campo, pregunta, opciones, alCambiar) {
  var marcadas = estado.entrada()[campo.id] || [];
  var grupo = crear('fieldset', { clase: 'casillas' });

  for (var i = 0; i < opciones.length; i++) {
    (function (opcion) {
      var casilla = crear('input', {
        type: 'checkbox',
        value: opcion.valor,
        checked: marcadas.indexOf(opcion.valor) !== -1,
      });
      casilla.addEventListener('change', function () {
        var actuales = (estado.entrada()[campo.id] || []).slice();
        var posicion = actuales.indexOf(opcion.valor);
        if (casilla.checked && posicion === -1) actuales.push(opcion.valor);
        if (!casilla.checked && posicion !== -1) actuales.splice(posicion, 1);
        alCambiar(actuales);
      });

      grupo.appendChild(crear('label', { clase: 'casilla' }, [
        casilla,
        crear('span', {}, [
          document.createTextNode(opcion.etiqueta),
          opcion.nota ? crear('small', { texto: opcion.nota }) : null,
        ]),
      ]));
    })(opciones[i]);
  }
  return grupo;
}

function controlCasillaUnica(campo, pregunta, alCambiar) {
  var casilla = crear('input', { type: 'checkbox', id: 'campo-' + campo.id, checked: !!estado.entrada()[campo.id] });
  casilla.addEventListener('change', function () { alCambiar(casilla.checked); });
  return crear('label', { clase: 'casilla' }, [casilla, crear('span', { texto: pregunta.ayuda })]);
}

/**
 * Dibuja una pregunta completa.
 *
 * opciones: { pais, error, confirmacion, deshabilitadas, alCambiar, alAvanzar }
 */
function dibujarPregunta(campo, config) {
  var pregunta = RM.estado.pregunta(campo.id);
  if (!pregunta || !pregunta.pregunta) return null;

  var bloque = crear('div', { clase: 'pregunta' + (config.error ? ' campo-error' : ''), 'data-campo': campo.id });

  var titulo = crear('h2', { clase: 'pregunta-titulo', id: 'pregunta-' + campo.id, texto: pregunta.pregunta });
  // Una pregunta opcional tiene que verse opcional. Sin esta marca el comercial
  // se queda atascado buscando que contestar.
  if (pregunta.opcional) {
    titulo.appendChild(crear('span', { clase: 'marca-opcional', texto: 'Opcional' }));
  }
  bloque.appendChild(titulo);
  bloque.appendChild(crear('p', { clase: 'pregunta-ayuda' }, [conGlosario(pregunta.ayuda)]));

  // Devuelve true cuando el cambio ya cambio de pantalla: en ese caso nadie
  // puede avanzar encima.
  function alCambiar(valor) {
    return config.alCambiar(campo.id, valor);
  }

  var control;
  if (campo.tipo === 'numero') control = controlNumero(campo, pregunta, alCambiar, config.pais);
  else if (campo.tipo === 'fecha' || campo.tipo === 'hora') control = controlFechaUHora(campo, alCambiar);
  else if (campo.tipo === 'lista' || campo.tipo === 'tarjetas') {
    control = controlOpciones(campo, pregunta, function (valor) {
      if (alCambiar(valor)) return;
      if (pregunta.avanzaSola && config.alAvanzar) config.alAvanzar();
    }, config.deshabilitadas);
  } else if (campo.tipo === 'casillas') {
    control = controlCasillas(campo, pregunta, config.opciones || pregunta.opciones || [], alCambiar);
  } else if (campo.tipo === 'casilla') {
    control = controlCasillaUnica(campo, pregunta, alCambiar);
  } else {
    control = controlTexto(campo, pregunta, alCambiar);
  }
  bloque.appendChild(control);

  if (config.error) {
    bloque.appendChild(crear('p', { clase: 'mensaje-error', role: 'alert' }, [
      RM.util.icono('alerta', 16), document.createTextNode(config.error),
    ]));
  } else if (config.confirmacion) {
    bloque.appendChild(crear('p', { clase: 'mensaje-ok' }, [
      RM.util.icono('visto', 16), document.createTextNode(config.confirmacion),
    ]));
  }

  if (config.aviso) {
    bloque.appendChild(crear('div', { clase: 'aviso', texto: config.aviso }));
  }

  var frase = asiQueda(campo.id, config.pais);
  if (frase) bloque.appendChild(frase);

  bloque.appendChild(crear('details', { clase: 'por-que' }, [
    crear('summary', { texto: RM.estado.T('¿Por qué te preguntamos esto?') }),
    crear('p', {}, [conGlosario(pregunta.porQue)]),
  ]));

  return bloque;
}

/** Una respuesta ya dada, en una línea, con el botón para cambiarla. */
function dibujarRespondida(campo, textoValor, alEditar) {
  var pregunta = RM.estado.pregunta(campo.id);
  return crear('div', { clase: 'ficha-seccion', 'data-campo': campo.id }, [
    crear('div', { clase: 'ficha-encabezado' }, [
      crear('h3', { texto: pregunta.pregunta }),
      crear('button', { clase: 'boton-texto', type: 'button', texto: 'Cambiar', onclick: alEditar }),
    ]),
    crear('p', { clase: 'pregunta-ayuda', texto: textoValor }),
  ]);
}

RM.campos = {
  dibujarPregunta: dibujarPregunta,
  dibujarRespondida: dibujarRespondida,
  conGlosario: conGlosario,
  asiQueda: asiQueda,
  ocultarGlosario: ocultarGlosario,
};
