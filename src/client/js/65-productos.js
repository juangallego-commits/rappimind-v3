'use strict';

/**
 * La lista de productos participantes de la Carrera de Compras.
 *
 * Era un campo de texto libre ("Productos separados por comas") y es uno de los
 * pocos que quedaban. Dos productos que se llaman parecido dejaban el documento
 * sin decir cual suma al concurso: el EAN lo decide sin discusion. Juan lo
 * cerro el 20 de septiembre de 2026 (punto D4).
 *
 * Mismo patron que la lista de tiendas del Multitienda, con dos diferencias:
 * cada fila tiene dos campos en vez de seis, y el EAN se revisa entero, con su
 * digito de control, para que un numero mal copiado del empaque no salga
 * impreso.
 */

var RM = window.RM;
var crear = RM.util.crear;
var estado = RM.estado;

function productos() {
  if (!estado.entrada().productosDetalle) estado.fijar('productosDetalle', []);
  return estado.entrada().productosDetalle;
}

function productoVacio() {
  return { nombre: '', ean: '' };
}

/** Revisa una fila y devuelve los problemas, campo por campo. */
function revisarProducto(producto, indice, todos) {
  var problemas = {};
  var textos = estado.pregunta('productosDetalle');

  if (!producto.nombre) problemas.nombre = 'Falta el nombre de este producto.';

  if (!producto.ean) {
    problemas.ean = 'Falta el EAN de este producto.';
    return problemas;
  }

  var revision = validarEan(producto.ean);
  if (!revision.valido) {
    problemas.ean = revision.mensaje;
    return problemas;
  }

  // El mismo EAN dos veces es el mismo producto contado dos veces.
  for (var i = 0; i < todos.length; i++) {
    if (i === indice || !todos[i].ean) continue;
    var otro = validarEan(todos[i].ean);
    if (otro.valido && otro.formateado === revision.formateado) {
      problemas.ean = textos.errores.repetido;
      break;
    }
  }
  return problemas;
}

function filaDeProducto(producto, indice, alCambiar) {
  var textos = estado.pregunta('productosDetalle').camposPorProducto;
  var problemas = revisarProducto(producto, indice, productos());

  var fila = crear('div', { clase: 'ficha-seccion', 'data-producto': String(indice) }, [
    crear('div', { clase: 'ficha-encabezado' }, [
      crear('h3', { texto: 'Producto ' + (indice + 1) + (producto.nombre ? ': ' + producto.nombre : '') }),
      crear('button', {
        clase: 'boton-texto', type: 'button', texto: estado.T('Quitar'),
        onclick: function () {
          var lista = productos().slice();
          lista.splice(indice, 1);
          estado.fijar('productosDetalle', lista);
          alCambiar();
        },
      }),
    ]),
  ]);

  function campoTexto(llave) {
    var control = crear('input', {
      type: 'text',
      value: producto[llave] || '',
      placeholder: textos[llave].ejemplo || '',
      'aria-label': textos[llave].pregunta + ' del producto ' + (indice + 1),
    });
    control.addEventListener('input', function () {
      var lista = productos().slice();
      lista[indice][llave] = control.value;
      estado.fijar('productosDetalle', lista);
      RM.flujo.refrescarDocumento();
    });
    control.addEventListener('blur', alCambiar);

    return crear('label', { clase: 'campo' }, [
      crear('p', { clase: 'pregunta-ayuda', texto: textos[llave].pregunta + '. ' + textos[llave].ayuda }),
      crear('div', { clase: 'campo-caja' }, [control]),
      problemas[llave] ? crear('p', { clase: 'mensaje-error', texto: problemas[llave] }) : null,
    ]);
  }

  fila.appendChild(campoTexto('nombre'));
  fila.appendChild(campoTexto('ean'));
  return fila;
}

/** Pegar desde Excel: una fila por producto, nombre y EAN. */
function bloqueDePegar(alCambiar) {
  var area = crear('textarea', {
    rows: '4',
    placeholder: 'Galletas Lunaria clásicas\t7702001008285',
    'aria-label': 'Pegar productos desde una hoja de cálculo',
  });
  var resultado = crear('div', {});

  function procesar() {
    var lineas = area.value.split('\n').map(function (l) { return l.trim(); }).filter(Boolean);
    if (lineas.length === 0) return;

    var nuevos = [];
    var rechazadas = [];
    for (var i = 0; i < lineas.length; i++) {
      var celdas = lineas[i].split(/\t|;/).map(function (c) { return c.trim(); });
      if (celdas.length === 1) celdas = lineas[i].split(/\s{2,}/).map(function (c) { return c.trim(); });
      if (celdas.length < 2) { rechazadas.push('Fila ' + (i + 1) + ': necesita el nombre y el EAN.'); continue; }
      var producto = productoVacio();
      producto.nombre = celdas[0] || '';
      producto.ean = celdas[1] || '';
      nuevos.push(producto);
    }

    var lista = productos().slice().filter(function (p) { return p.nombre || p.ean; });
    estado.fijar('productosDetalle', lista.concat(nuevos));
    area.value = '';

    RM.util.vaciar(resultado);
    resultado.appendChild(crear('p', {
      clase: 'mensaje-ok',
      texto: nuevos.length + (nuevos.length === 1 ? ' producto agregado.' : ' productos agregados.') +
        ' Revisa que cada uno haya quedado bien.',
    }));
    for (var r = 0; r < rechazadas.length; r++) {
      resultado.appendChild(crear('p', { clase: 'mensaje-error', texto: rechazadas[r] }));
    }
    alCambiar();
  }

  return crear('details', { clase: 'por-que' }, [
    crear('summary', { texto: estado.T('Pegar desde una hoja de cálculo') }),
    crear('p', { clase: 'pregunta-ayuda', texto: 'Una fila por producto: el nombre y el EAN, separados por tabulación.' }),
    area,
    crear('div', { clase: 'fila-botones' }, [
      crear('button', { clase: 'boton boton-secundario', type: 'button', texto: estado.T('Agregar los pegados'), onclick: procesar }),
    ]),
    resultado,
  ]);
}

function dibujar(alCambiar) {
  var pregunta = estado.pregunta('productosDetalle');
  var lista = productos();

  var bloque = crear('div', { clase: 'pregunta' }, [
    crear('h2', { clase: 'pregunta-titulo', texto: pregunta.pregunta }),
    crear('p', { clase: 'pregunta-ayuda', texto: pregunta.ayuda }),
  ]);

  if (lista.length === 0) {
    bloque.appendChild(crear('p', { clase: 'pregunta-ayuda', texto: 'Todavía no has agregado ningún producto.' }));
  }
  for (var i = 0; i < lista.length; i++) {
    bloque.appendChild(filaDeProducto(lista[i], i, alCambiar));
  }

  bloque.appendChild(crear('div', { clase: 'fila-botones' }, [
    crear('button', {
      clase: 'boton boton-secundario', type: 'button', texto: estado.T('Agregar producto'),
      onclick: function () {
        estado.fijar('productosDetalle', productos().concat([productoVacio()]));
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

RM.productos = {
  dibujar: dibujar,
};
