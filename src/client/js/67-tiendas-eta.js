'use strict';

/**
 * La lista de tiendas de Turbo del cashback por ETA.
 *
 * Hasta el 21 de septiembre de 2026 el documento decía "todas las tiendas
 * virtuales bajo la modalidad Turbo Restaurantes de la ciudad". Juan corrigió
 * que Turbo no es una modalidad: son tiendas por zona, con nombre propio, y
 * eligió que el T&C las nombre una por una (punto D1).
 *
 * Mismo patrón que la lista de productos de la Carrera, con una sola diferencia:
 * cada fila tiene un campo, el nombre, así que se dibuja como una línea y no
 * como una ficha.
 */

var RM = window.RM;
var crear = RM.util.crear;
var estado = RM.estado;

function tiendas() {
  if (!estado.entrada().tiendasEta) estado.fijar('tiendasEta', []);
  return estado.entrada().tiendasEta;
}

/** Revisa una fila y devuelve el problema, si lo hay. */
function problemaDe(tienda, indice, todas) {
  var nombre = String(tienda.nombre || '').trim();
  if (!nombre) return '';

  // La misma tienda dos veces la nombra dos veces en la cláusula.
  for (var i = 0; i < todas.length; i++) {
    if (i === indice) continue;
    if (String(todas[i].nombre || '').trim().toLowerCase() === nombre.toLowerCase()) {
      return estado.pregunta('tiendasEta').errores.repetido;
    }
  }
  return '';
}

function filaDeTienda(tienda, indice, alCambiar) {
  var textos = estado.pregunta('tiendasEta').camposPorTienda;
  var problema = problemaDe(tienda, indice, tiendas());

  var control = crear('input', {
    type: 'text',
    value: tienda.nombre || '',
    placeholder: textos.nombre.ejemplo || '',
    'aria-label': textos.nombre.pregunta + ' ' + (indice + 1),
  });
  control.addEventListener('input', function () {
    var lista = tiendas().slice();
    lista[indice].nombre = control.value;
    estado.fijar('tiendasEta', lista);
    RM.flujo.refrescarDocumento();
  });
  control.addEventListener('blur', alCambiar);

  return crear('div', { clase: 'campo', 'data-tienda-eta': String(indice) }, [
    crear('div', { clase: 'campo-caja' }, [
      control,
      crear('button', {
        clase: 'boton-texto', type: 'button', texto: estado.T('Quitar'),
        onclick: function () {
          var lista = tiendas().slice();
          lista.splice(indice, 1);
          estado.fijar('tiendasEta', lista);
          alCambiar();
        },
      }),
    ]),
    problema ? crear('p', { clase: 'mensaje-error', texto: problema }) : null,
  ]);
}

/** Pegar desde Excel: una tienda por fila. */
function bloqueDePegar(alCambiar) {
  var area = crear('textarea', {
    rows: '4',
    placeholder: 'Turbo Calleja\nTurbo Chico',
    'aria-label': 'Pegar tiendas desde una hoja de cálculo',
  });
  var resultado = crear('div', {});

  function procesar() {
    var lineas = area.value.split('\n').map(function (l) { return l.trim(); }).filter(Boolean);
    if (lineas.length === 0) return;

    var nuevas = lineas.map(function (linea) { return { nombre: linea }; });
    var lista = tiendas().slice().filter(function (t) { return String(t.nombre || '').trim(); });
    estado.fijar('tiendasEta', lista.concat(nuevas));
    area.value = '';

    RM.util.vaciar(resultado);
    resultado.appendChild(crear('p', {
      clase: 'mensaje-ok',
      texto: nuevas.length + (nuevas.length === 1 ? ' tienda agregada.' : ' tiendas agregadas.') +
        ' Revisa que cada una haya quedado bien.',
    }));
    alCambiar();
  }

  return crear('details', { clase: 'por-que' }, [
    crear('summary', { texto: estado.T('Pegar desde una hoja de cálculo') }),
    crear('p', { clase: 'pregunta-ayuda', texto: 'Una tienda por fila, con el nombre como sale en el botón Turbo.' }),
    area,
    crear('div', { clase: 'fila-botones' }, [
      crear('button', { clase: 'boton boton-secundario', type: 'button', texto: estado.T('Agregar las pegadas'), onclick: procesar }),
    ]),
    resultado,
  ]);
}

function dibujar(alCambiar) {
  var pregunta = estado.pregunta('tiendasEta');
  var lista = tiendas();

  var bloque = crear('div', { clase: 'pregunta' }, [
    crear('h2', { clase: 'pregunta-titulo', texto: pregunta.pregunta }),
    crear('p', { clase: 'pregunta-ayuda', texto: pregunta.ayuda }),
  ]);

  if (lista.length === 0) {
    bloque.appendChild(crear('p', { clase: 'pregunta-ayuda', texto: 'Todavía no has agregado ninguna tienda.' }));
  }
  for (var i = 0; i < lista.length; i++) {
    bloque.appendChild(filaDeTienda(lista[i], i, alCambiar));
  }

  bloque.appendChild(crear('div', { clase: 'fila-botones' }, [
    crear('button', {
      clase: 'boton boton-secundario', type: 'button', texto: estado.T('Agregar tienda'),
      onclick: function () {
        estado.fijar('tiendasEta', tiendas().concat([{ nombre: '' }]));
        alCambiar();
      },
    }),
  ]));
  bloque.appendChild(bloqueDePegar(alCambiar));

  bloque.appendChild(crear('details', { clase: 'por-que' }, [
    crear('summary', { texto: estado.T('¿Por qué te preguntamos esto?') }),
    crear('p', { texto: pregunta.porQue }),
  ]));
  return bloque;
}

RM.tiendasEta = {
  dibujar: dibujar,
};
