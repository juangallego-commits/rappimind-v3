'use strict';

/**
 * La lista de tiendas de la Carrera de Compras.
 *
 * Hasta el 8 de octubre de 2026 la Carrera tenía una sola pregunta de tienda,
 * y el comercial de la campaña de Kenvue escribió "Turbo y Éxito" en ella: el
 * documento declaró como Tienda Participante algo que no es una tienda y no
 * dijo si las compras de las dos se suman. En una Carrera es normal fijar uno o
 * más comercios donde suman las compras (K1.a de la revisión), así que son una
 * lista: una fila por tienda, cada una con su respuesta de Turbo, y un solo
 * ranking para todas.
 *
 * Mismo patrón que la lista de tiendas de Turbo del ETA, con una diferencia:
 * cada fila tiene dos preguntas, y un nombre que parece dos tiendas se frena
 * con un aviso y un botón para confirmar que es una sola (hay marcas con "y" en
 * el nombre). La misma revisión corre en el servidor, en validaciones.js.
 */

var RM = window.RM;
var crear = RM.util.crear;
var estado = RM.estado;

function tiendas() {
  if (!estado.entrada().tiendasCarrera) estado.fijar('tiendasCarrera', []);
  return estado.entrada().tiendasCarrera;
}

/** Una tienda nueva arranca sin respuesta de Turbo: cada marca tiene la suya. */
function tiendaVacia() {
  return { nombre: '', tiendaTurbo: '', unaSola: false };
}

function textosDeLaTienda() {
  return estado.pregunta('tiendasCarrera').camposPorTienda;
}

/** Revisa una fila y devuelve los problemas, campo por campo. */
function revisarTienda(tienda, indice, todas) {
  var problemas = {};
  var errores = estado.pregunta('tiendasCarrera').errores;
  var nombre = String(tienda.nombre || '').trim();

  if (nombre) {
    // La misma tienda dos veces la nombra dos veces en la cláusula.
    var llave = sinTildes(nombre).toLowerCase();
    for (var i = 0; i < todas.length; i++) {
      if (i === indice) continue;
      if (sinTildes(String(todas[i].nombre || '').trim()).toLowerCase() === llave) {
        problemas.nombre = errores.repetido;
        break;
      }
    }
    if (!problemas.nombre && !tienda.unaSola && parecenVariasTiendas(nombre)) problemas.varias = errores.varias;
  }
  if (!tienda.tiendaTurbo) problemas.tiendaTurbo = errores.turbo;
  return problemas;
}

function filaDeTienda(tienda, indice, alCambiar) {
  var textos = textosDeLaTienda();
  var problemas = revisarTienda(tienda, indice, tiendas());

  var fila = crear('div', { clase: 'ficha-seccion', 'data-tienda-carrera': String(indice) }, [
    crear('div', { clase: 'ficha-encabezado' }, [
      crear('h3', { texto: 'Tienda ' + (indice + 1) + (tienda.nombre ? ': ' + tienda.nombre : '') }),
      crear('button', {
        clase: 'boton-texto', type: 'button', texto: estado.T('Quitar'),
        onclick: function () {
          var lista = tiendas().slice();
          lista.splice(indice, 1);
          estado.fijar('tiendasCarrera', lista);
          alCambiar();
        },
      }),
    ]),
  ]);

  var control = crear('input', {
    type: 'text',
    value: tienda.nombre || '',
    placeholder: textos.nombre.ejemplo || '',
    'aria-label': textos.nombre.pregunta + ' ' + (indice + 1),
  });
  control.addEventListener('input', function () {
    var lista = tiendas().slice();
    lista[indice].nombre = control.value;
    // Otro nombre es otra pregunta: la confirmación de "es una sola" era del anterior.
    lista[indice].unaSola = false;
    estado.fijar('tiendasCarrera', lista);
    RM.flujo.refrescarDocumento();
  });
  control.addEventListener('blur', alCambiar);

  fila.appendChild(crear('label', { clase: 'campo' }, [
    crear('p', { clase: 'pregunta-ayuda', texto: textos.nombre.pregunta + '. ' + textos.nombre.ayuda }),
    crear('div', { clase: 'campo-caja' }, [control]),
    problemas.nombre ? crear('p', { clase: 'mensaje-error', texto: problemas.nombre }) : null,
  ]));

  if (problemas.varias) {
    fila.appendChild(crear('div', { clase: 'aviso' }, [
      crear('p', { texto: problemas.varias }),
      crear('div', { clase: 'fila-botones' }, [
        crear('button', {
          clase: 'boton boton-secundario', type: 'button', texto: estado.T('Es una sola tienda, se llama así'),
          onclick: function () {
            var lista = tiendas().slice();
            lista[indice].unaSola = true;
            estado.fijar('tiendasCarrera', lista);
            alCambiar();
          },
        }),
      ]),
    ]));
  }

  var opciones = textos.tiendaTurbo.opciones;
  var seleccion = crear('select', {
    'aria-label': textos.tiendaTurbo.pregunta + ' de la tienda ' + (indice + 1),
  });
  seleccion.appendChild(crear('option', { value: '', texto: estado.T('Elige una') }));
  for (var i = 0; i < opciones.length; i++) {
    seleccion.appendChild(crear('option', { value: opciones[i].valor, texto: opciones[i].etiqueta }));
  }
  seleccion.value = tienda.tiendaTurbo || '';
  seleccion.addEventListener('change', function () {
    var lista = tiendas().slice();
    lista[indice].tiendaTurbo = seleccion.value;
    estado.fijar('tiendasCarrera', lista);
    RM.flujo.refrescarDocumento();
    alCambiar();
  });

  fila.appendChild(crear('label', { clase: 'campo' }, [
    crear('p', { clase: 'pregunta-ayuda', texto: textos.tiendaTurbo.pregunta + '. ' + textos.tiendaTurbo.ayuda }),
    crear('div', { clase: 'campo-caja' }, [seleccion]),
    problemas.tiendaTurbo && tienda.nombre ? crear('p', { clase: 'mensaje-error', texto: problemas.tiendaTurbo }) : null,
  ]));
  return fila;
}

function dibujar(alCambiar) {
  var pregunta = estado.pregunta('tiendasCarrera');
  // Con una fila lista para escribir: la Carrera siempre tiene al menos una.
  if (tiendas().length === 0) estado.fijar('tiendasCarrera', [tiendaVacia()]);
  var lista = tiendas();

  var bloque = crear('div', { clase: 'pregunta' }, [
    crear('h2', { clase: 'pregunta-titulo', texto: pregunta.pregunta }),
    crear('p', { clase: 'pregunta-ayuda', texto: pregunta.ayuda }),
  ]);

  for (var i = 0; i < lista.length; i++) {
    bloque.appendChild(filaDeTienda(lista[i], i, alCambiar));
  }

  bloque.appendChild(crear('div', { clase: 'fila-botones' }, [
    crear('button', {
      clase: 'boton boton-secundario', type: 'button', texto: estado.T('Agregar tienda'),
      onclick: function () {
        estado.fijar('tiendasCarrera', tiendas().concat([tiendaVacia()]));
        alCambiar();
      },
    }),
  ]));

  bloque.appendChild(crear('details', { clase: 'por-que' }, [
    crear('summary', { texto: estado.T('¿Por qué te preguntamos esto?') }),
    crear('p', { texto: pregunta.porQue }),
  ]));
  return bloque;
}

RM.tiendasCarrera = {
  dibujar: dibujar,
};
