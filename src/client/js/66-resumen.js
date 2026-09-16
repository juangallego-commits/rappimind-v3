'use strict';

/**
 * El resumen antes de generar, y la pantalla final.
 *
 * El boton "Generar T&C" esta deshabilitado, y se ve deshabilitado, hasta que
 * no falte nada. Debajo, la lista "Te falta" dice exactamente que.
 */

var RM = window.RM;
var crear = RM.util.crear;
var estado = RM.estado;
var E = estado.estado;
var flujo = RM.flujo;

var PASOS_SQUARESPACE = [
  { texto: 'Abre el documento y léelo completo. Es el texto que vas a publicar tal cual.', ve: 'El documento con el nombre de tu campaña.' },
  { texto: 'Selecciona todo el contenido del documento y cópialo.', ve: 'Todo el texto resaltado.' },
  { texto: 'Entra a Squarespace y crea una página nueva dentro de promos.rappi.com.', ve: 'El editor de la página en blanco.' },
  { texto: 'Pega el contenido y revisa que los títulos y las viñetas se vean bien.', ve: 'El texto con sus cláusulas numeradas.' },
  { texto: 'Publica la página y copia el enlace de la barra del navegador.', ve: 'Un enlace que empieza por https://promos.rappi.com/' },
  { texto: 'Vuelve aquí, pega el enlace y marca la campaña como publicada.', ve: 'La campaña en verde en tu historial.' },
];

function seccionesDelResumen() {
  var entrada = estado.entrada();
  var pasos = flujo.pasosDelTipo(entrada);
  var secciones = [];

  for (var i = 0; i < pasos.length; i++) {
    var campos = flujo.camposDelPaso(entrada, pasos[i].id);
    var filas = [];
    for (var c = 0; c < campos.length; c++) {
      var campo = campos[c];
      if (campo.id === 'declaracion') continue;
      var pregunta = preguntaDe(campo.id);
      filas.push({ campo: campo, etiqueta: pregunta.pregunta, valor: RM.pasos.comoTexto(campo) });
    }
    if (filas.length > 0) secciones.push({ paso: pasos[i], indice: i, filas: filas });
  }
  return secciones;
}

/** Lo que falta, en palabras del comercial. */
function loQueFalta() {
  var pais = flujo.paisElegido();
  if (!pais) return ['Elige el país de la campaña.'];

  var revision = validarSolicitud(estado.entrada(), pais, {
    fechaReferencia: E.configuracion.hoy || RM.util.hoyEnElNavegador(),
    usuarioEnEquipo: puedeVerPiloto(E.configuracion.rol),
  });
  return revision.errores.map(function (error) { return error.mensaje; });
}

function pantallaResumen(raiz) {
  var faltantes = loQueFalta();
  var completo = faltantes.length === 0;

  var columna = crear('div', { clase: 'columna-preguntas' }, [
    crear('h1', { texto: 'Revisa antes de generar' }),
    crear('p', { clase: 'pregunta-ayuda', texto: 'Este es el resumen de lo que respondiste. Puedes cambiar cualquier cosa antes de generar el documento.' }),
  ]);

  var ficha = crear('div', { clase: 'ficha' });
  var secciones = seccionesDelResumen();

  for (var s = 0; s < secciones.length; s++) {
    (function (seccion) {
      var lista = crear('dl');
      for (var f = 0; f < seccion.filas.length; f++) {
        lista.appendChild(crear('dt', { texto: seccion.filas[f].etiqueta }));
        lista.appendChild(crear('dd', { texto: seccion.filas[f].valor || 'Falta' }));
      }
      ficha.appendChild(crear('div', { clase: 'ficha-seccion' }, [
        crear('div', { clase: 'ficha-encabezado' }, [
          crear('h3', { texto: seccion.paso.nombre }),
          crear('button', {
            clase: 'boton-texto', type: 'button', texto: 'Editar',
            onclick: function () {
              E.pasoActual = seccion.indice;
              E.campoAbierto = seccion.filas[0].campo.id;
              RM.app.ir('pasos');
            },
          }),
        ]),
        lista,
      ]));
    })(secciones[s]);
  }
  columna.appendChild(ficha);

  // Declaración.
  var declaracion = crear('input', { type: 'checkbox', id: 'declaracion', checked: !!estado.entrada().declaracion });
  declaracion.addEventListener('change', function () {
    estado.fijar('declaracion', declaracion.checked);
    RM.app.dibujar();
  });
  columna.appendChild(crear('div', { clase: 'pregunta' }, [
    crear('label', { clase: 'casilla' }, [
      declaracion,
      crear('span', {}, [
        document.createTextNode(preguntaDe('declaracion').ayuda),
        crear('small', { texto: preguntaDe('declaracion').porQue }),
      ]),
    ]),
  ]));

  if (!completo) {
    var listaFalta = crear('ul', { clase: 'te-falta' });
    for (var i = 0; i < faltantes.length; i++) listaFalta.appendChild(crear('li', { texto: faltantes[i] }));
    columna.appendChild(crear('div', {}, [
      crear('h3', { texto: 'Te falta:' }),
      listaFalta,
    ]));
  }

  var boton = crear('button', {
    clase: 'boton', type: 'button', texto: 'Generar T&C',
    disabled: !completo,
    onclick: function () { generar(boton); },
  });

  columna.appendChild(crear('div', { clase: 'fila-botones' }, [
    crear('button', {
      clase: 'boton boton-secundario', type: 'button', texto: 'Atrás',
      onclick: function () { RM.app.ir('pasos'); },
    }),
    boton,
  ]));

  raiz.appendChild(crear('div', { clase: 'pagina' }, [
    crear('div', { clase: 'dos-columnas' }, [columna, RM.pasos.columnaDocumento()]),
  ]));
  RM.app.agregarHojaDeCelular(raiz);
  flujo.refrescarDocumento();
}

function generar(boton) {
  boton.disabled = true;
  boton.textContent = 'Generando...';
  RM.util.anunciar('Generando el documento.');

  RM.servidor.llamar('generar', estado.entrada()).then(function (resultado) {
    if (!resultado.valido) {
      boton.disabled = false;
      boton.textContent = 'Generar T&C';
      RM.app.mostrarError(resultado.errores.map(function (e) { return e.mensaje; }).join(' '));
      return;
    }
    E.resultado = resultado;
    estado.borrarBorrador();
    RM.app.ir('listo');
  }).catch(function (error) {
    boton.disabled = false;
    boton.textContent = 'Generar T&C';
    RM.app.mostrarError('No pudimos generar el documento: ' + error.message);
  });
}

// --- Pantalla final ----------------------------------------------------------

function pantallaListo(raiz) {
  var resultado = E.resultado || {};
  var contenido = crear('div', { clase: 'pagina pagina-angosta' }, [
    crear('h1', { texto: 'Tu T&C está listo' }),
  ]);

  if (resultado.demostracion) {
    contenido.appendChild(crear('div', { clase: 'aviso' }, [
      crear('h3', { texto: 'Modo demostración' }),
      crear('p', { texto: 'No se creó ningún documento ni se envió ningún correo. Este es el texto que habría salido.' }),
    ]));
    var hoja = crear('div', { clase: 'hoja' });
    RM.documento.dibujar(hoja, resultado.texto, '');
    contenido.appendChild(hoja);
    contenido.appendChild(crear('div', { clase: 'fila-botones' }, [
      crear('button', {
        clase: 'boton boton-secundario', type: 'button', texto: 'Hacer otra campaña',
        onclick: function () { estado.reiniciarFormulario({}); RM.app.ir('inicio'); },
      }),
    ]));
    raiz.appendChild(contenido);
    return;
  }

  contenido.appendChild(crear('p', {
    clase: 'pregunta-ayuda',
    texto: 'Te mandamos el documento por correo. Solicitud ' + (resultado.id || '') + '.',
  }));

  contenido.appendChild(crear('div', { clase: 'fila-botones' }, [
    resultado.linkDoc
      ? crear('a', { clase: 'boton', href: resultado.linkDoc, target: '_blank', rel: 'noopener' }, [
          document.createTextNode('Abrir el documento'), RM.util.icono('abrir', 16),
        ])
      : null,
  ]));

  contenido.appendChild(crear('h2', { texto: 'Cómo publicarlo en Squarespace' }));
  var pasos = crear('ol', { clase: 'pasos-publicar' });
  for (var i = 0; i < PASOS_SQUARESPACE.length; i++) {
    pasos.appendChild(crear('li', {}, [
      crear('p', { texto: PASOS_SQUARESPACE[i].texto }),
      crear('p', { clase: 'pregunta-ayuda', texto: 'Deberías ver: ' + PASOS_SQUARESPACE[i].ve }),
      crear('div', { clase: 'captura', texto: '[CAPTURA ' + (i + 1) + ']' }),
    ]));
  }
  contenido.appendChild(pasos);

  // Link publicado.
  contenido.appendChild(crear('h2', { texto: 'Cuando ya esté publicado' }));
  var campo = crear('input', {
    type: 'text', id: 'link-publicado',
    placeholder: 'https://promos.rappi.com/',
    'aria-label': 'Enlace de la página publicada',
  });
  var mensaje = crear('p', { clase: 'pregunta-ayuda', texto: 'Pega el enlace de la página que publicaste.' });

  var guardar = crear('button', {
    clase: 'boton', type: 'button', texto: 'Marcar como publicado',
    onclick: function () {
      var revision = validarLinkPublicado(campo.value);
      if (!revision.valido) {
        mensaje.className = 'mensaje-error';
        mensaje.textContent = revision.mensaje;
        campo.focus();
        return;
      }
      guardar.disabled = true;
      guardar.textContent = 'Guardando...';
      RM.servidor.llamar('marcarPublicado', resultado.id, revision.url).then(function (respuesta) {
        guardar.disabled = false;
        guardar.textContent = 'Marcar como publicado';
        if (!respuesta.valido) {
          mensaje.className = 'mensaje-error';
          mensaje.textContent = respuesta.errores[0].mensaje;
          return;
        }
        mensaje.className = 'mensaje-ok';
        mensaje.textContent = 'Listo: tu campaña quedó marcada como publicada.';
        campo.disabled = true;
        guardar.disabled = true;
      }).catch(function (error) {
        guardar.disabled = false;
        guardar.textContent = 'Marcar como publicado';
        mensaje.className = 'mensaje-error';
        mensaje.textContent = 'No pudimos guardarlo: ' + error.message;
      });
    },
  });

  contenido.appendChild(crear('div', { clase: 'pregunta' }, [
    crear('div', { clase: 'campo-caja' }, [campo]),
    mensaje,
    crear('div', { clase: 'fila-botones' }, [guardar]),
  ]));

  contenido.appendChild(crear('div', { clase: 'fila-botones' }, [
    crear('button', {
      clase: 'boton boton-secundario', type: 'button', texto: 'Hacer otra campaña',
      onclick: function () { estado.reiniciarFormulario({}); RM.app.ir('inicio'); },
    }),
    crear('button', {
      clase: 'boton boton-secundario', type: 'button', texto: 'Ver mi historial',
      onclick: function () { RM.app.ir('historial'); },
    }),
  ]));

  raiz.appendChild(contenido);
}

RM.resumen = {
  pantallaResumen: pantallaResumen,
  pantallaListo: pantallaListo,
  loQueFalta: loQueFalta,
  PASOS_SQUARESPACE: PASOS_SQUARESPACE,
};
