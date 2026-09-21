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

// Los pasos de Squarespace viven en src/core/ayuda.js, para que la pantalla
// final y la de Ayuda digan exactamente lo mismo.

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
      var pregunta = estado.pregunta(campo.id);
      filas.push({ campo: campo, etiqueta: pregunta.pregunta, valor: RM.pasos.comoTexto(campo) });
    }
    if (filas.length > 0) secciones.push({ paso: pasos[i], indice: i, filas: filas });
  }
  return secciones;
}

/** Lo que falta, en palabras del comercial. */
function loQueFalta() {
  var pais = flujo.paisElegido();
  if (!pais) return [estado.T('Elige el país de la campaña.')];

  var revision = validarSolicitud(estado.entrada(), pais, {
    fechaReferencia: E.configuracion.hoy || RM.util.hoyEnElNavegador(),
    usuarioEnEquipo: puedeVerPiloto(E.configuracion.rol),
    idioma: estado.idiomaInterfaz(),
  });
  return revision.errores.map(function (error) { return error.mensaje; });
}

function pantallaResumen(raiz) {
  var faltantes = loQueFalta();
  var completo = faltantes.length === 0;

  var columna = crear('div', { clase: 'columna-preguntas' }, [
    crear('h1', { texto: estado.T('Revisa antes de generar') }),
    crear('p', { clase: 'pregunta-ayuda', texto: estado.T('Este es el resumen de lo que respondiste. Puedes cambiar cualquier cosa antes de generar el documento.') }),
  ]);

  // El aviso se repite aqui a proposito: entre elegir el pais y llegar al
  // resumen pasan quince preguntas, y este es el momento en que de verdad se
  // decide publicar.
  var pais = flujo.paisElegido();
  if (paisEnPruebas(pais)) {
    // OJO: esta lista no se puede llamar `faltantes`. Se llamo asi, y como var
    // es de toda la funcion, pisaba la lista de arriba: en un pais en pruebas
    // "Te falta:" mostraba los datos legales por confirmar del pais en vez de
    // lo que le faltaba al comercial, que era marcar la casilla.
    var porConfirmar = datosPorConfirmar(pais);
    var aviso = crear('div', { clase: 'aviso' }, [
      crear('h3', { texto: pais.nombre + estado.T(' está en pruebas: no publiques este documento todavía') }),
      crear('p', {
        texto: estado.T('Genera el documento, léelo y dinos si los datos legales de tu país están bien. Los propuso la herramienta por analogía con Colombia y no los ha confirmado nadie.'),
      }),
    ]);
    if (porConfirmar.length > 0) {
      var listaPorConfirmar = crear('ul');
      for (var f = 0; f < porConfirmar.length; f++) listaPorConfirmar.appendChild(crear('li', { texto: porConfirmar[f] }));
      aviso.appendChild(listaPorConfirmar);
    }
    columna.appendChild(aviso);
  }

  var ficha = crear('div', { clase: 'ficha' });
  var secciones = seccionesDelResumen();

  for (var s = 0; s < secciones.length; s++) {
    (function (seccion) {
      var lista = crear('dl');
      for (var f = 0; f < seccion.filas.length; f++) {
        lista.appendChild(crear('dt', { texto: seccion.filas[f].etiqueta }));
        lista.appendChild(crear('dd', { texto: seccion.filas[f].valor || estado.T('Falta') }));
      }
      ficha.appendChild(crear('div', { clase: 'ficha-seccion' }, [
        crear('div', { clase: 'ficha-encabezado' }, [
          crear('h3', { texto: estado.T(seccion.paso.nombre) }),
          crear('button', {
            clase: 'boton-texto', type: 'button', texto: estado.T('Cambiar'),
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
        document.createTextNode(estado.pregunta('declaracion').ayuda),
        crear('small', { texto: estado.pregunta('declaracion').porQue }),
      ]),
    ]),
  ]));

  if (!completo) {
    var listaFalta = crear('ul', { clase: 'te-falta' });
    for (var i = 0; i < faltantes.length; i++) listaFalta.appendChild(crear('li', { texto: faltantes[i] }));
    columna.appendChild(crear('div', {}, [
      crear('h3', { texto: estado.T('Te falta:') }),
      listaFalta,
    ]));
  }

  var boton = crear('button', {
    clase: 'boton', type: 'button', texto: estado.T('Generar T&C'),
    disabled: !completo,
    onclick: function () { generar(boton); },
  });

  columna.appendChild(crear('div', { clase: 'fila-botones' }, [
    crear('button', {
      clase: 'boton boton-secundario', type: 'button', texto: estado.T('Atrás'),
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
  boton.textContent = estado.T('Generando...');
  RM.util.anunciar(estado.T('Generando el documento.'));

  RM.servidor.llamar('generar', estado.entrada()).then(function (resultado) {
    if (!resultado.valido) {
      boton.disabled = false;
      boton.textContent = estado.T('Generar T&C');
      RM.app.mostrarError(resultado.errores.map(function (e) { return e.mensaje; }).join(' '));
      return;
    }
    E.resultado = resultado;
    estado.borrarBorrador();
    RM.app.ir('listo');
  }).catch(function (error) {
    boton.disabled = false;
    boton.textContent = estado.T('Generar T&C');
    RM.app.mostrarError('No pudimos generar el documento: ' + error.message);
  });
}

/**
 * Quien puede publicar en Squarespace. No es todo el mundo: la cuenta la tienen
 * unas pocas personas por pais. Si el comercial no es una de ellas, el paso de
 * publicar no es suyo y tiene que pedirlo por el canal.
 */
function bloqueDeQuienPublica(codigoDePais, tipo) {
  var accesos = ACCESOS_SQUARESPACE[codigoDePais];
  var caja = crear('div', { clase: 'aviso' }, [crear('h3', { texto: estado.T('¿Quién puede publicar?') })]);

  var esConcurso = tipo === 'carrera_compras';
  var personas = accesos ? (esConcurso ? accesos.concursos : accesos.cashback) || [] : [];

  if (personas.length > 0) {
    caja.appendChild(crear('p', { texto: 'En tu país tienen usuario de Squarespace:' }));
    var lista = crear('ul');
    for (var i = 0; i < personas.length; i++) {
      lista.appendChild(crear('li', { texto: personas[i].nombre + ' · ' + personas[i].correo }));
    }
    caja.appendChild(lista);
    caja.appendChild(crear('p', {
      texto: 'Si no eres una de estas personas, pásales el documento, el título y la dirección que te dio RappiMind.',
    }));
  } else if (accesos && esConcurso && accesos.notaConcursos) {
    caja.appendChild(crear('p', { texto: accesos.notaConcursos }));
  } else {
    caja.appendChild(crear('p', {
      texto: 'Todavía no tenemos la lista de tu país. Pide la publicación en #tyc-rappi.',
    }));
  }

  caja.appendChild(crear('p', {}, [
    document.createTextNode(CANAL_TC.para + ' '),
    crear('a', { href: CANAL_TC.url, target: '_blank', rel: 'noopener', texto: CANAL_TC.nombre }),
  ]));
  return caja;
}

/**
 * Todo lo que el comercial necesita para publicar: que pegar, donde y quien
 * puede hacerlo. Se usa igual en la demostracion y en produccion.
 */
function bloqueDePublicacion(resultado) {
  var contenido = crear('div', {});
  // Lo que hay que pegar en Squarespace, listo para copiar. El titulo y la
  // direccion salen de las respuestas: escribirlos a mano es como el titulo
  // termino diciendo 99% cuando la clausula decia 50%.
  contenido.appendChild(crear('h2', { texto: estado.T('Lo que vas a pegar en Squarespace') }));
  var entrada = estado.entrada();

  contenido.appendChild(RM.util.paraCopiar(
    estado.T('Título del evento'),
    resultado.nombreCampana || '',
    estado.T('Va tal cual en el título del evento. No lo cambies: es el mismo nombre que quedó en el documento.')
  ));

  var pais = flujo.paisElegido();
  var rutaDelPais = (pais && pais.nombre ? pais.nombre : '').toLowerCase();
  contenido.appendChild(RM.util.paraCopiar(
    estado.T('Dirección del evento'),
    resultado.direccionSugerida || '',
    'Va en la pestaña Opciones, en "URL del evento". La parte de ' + rutaDelPais + ' la pone Squarespace sola: reemplaza solo lo que va después.'
  ));

  if (entrada.fechaInicio && entrada.fechaFin) {
    contenido.appendChild(crear('div', { clase: 'aviso' }, [
      crear('h3', { texto: estado.T('Las fechas del evento') }),
      crear('p', {
        texto: estado.T('Inicio: {inicio}. Fin: {fin}. Tienen que ser iguales a la vigencia del documento.')
          .replace('{inicio}', formatearFechaDelPais(entrada.fechaInicio, pais))
          .replace('{fin}', formatearFechaDelPais(entrada.fechaFin, pais)),
      }),
    ]));
  }

  contenido.appendChild(crear('h2', { texto: estado.T('Cómo publicarlo, paso a paso') }));
  var pasos = crear('ol', { clase: 'pasos-publicar' });
  for (var i = 0; i < PASOS_SQUARESPACE.length; i++) {
    pasos.appendChild(crear('li', {}, [
      crear('p', { texto: PASOS_SQUARESPACE[i].hace }),
      crear('p', { clase: 'pregunta-ayuda', texto: 'Deberías ver: ' + PASOS_SQUARESPACE[i].ve }),
    ]));
  }
  contenido.appendChild(pasos);
  contenido.appendChild(bloqueDeQuienPublica(resultado.pais || entrada.pais, entrada.tipo));

  return contenido;
}

/**
 * Las leyendas de las piezas publicitarias, una por formato.
 *
 * Es lo ultimo que se construyo del encargo 03 y lo unico que el comercial ve
 * de todo aquello. Hasta ahora este texto se lo pedia a Legal por correo; aqui
 * sale con el documento, ya lleno con los mismos datos, para que la pieza y el
 * T&C no se puedan contradecir.
 *
 * No se pregunta en que pieza va: se entregan las cuatro y el comercial copia la
 * que necesite (seccion 7B.4 de la respuesta).
 */
function bloqueDeLeyendas(leyendas) {
  if (!leyendas) return null;

  var caja = crear('div', { clase: 'pagina-seccion' }, [
    crear('h2', { texto: estado.T('El texto legal de tus piezas') }),
  ]);

  // Un pais sin leyenda aprobada, o una campana con algo que Legal no ha
  // definido. Se dice cual es el caso, como en la pantalla de Legal: un aviso
  // sin razon concreta no le sirve a nadie.
  if (!leyendas.hay) {
    var razones = (leyendas.faltantes || []).slice();
    var aviso = crear('div', { clase: 'aviso' }, [
      crear('h3', { texto: estado.T('Para esta campaña todavía no tenemos leyenda') }),
      crear('p', {
        texto: razones.length > 0
          ? estado.T('Nos falta que Legal defina esto, y sin eso la pieza saldría incompleta:')
          : estado.T('Todavía no hay leyenda aprobada para las piezas de este país. Escríbele a Legal de tu país con el enlace de tu T&C.'),
      }),
    ]);
    if (razones.length > 0) {
      var lista = crear('ul');
      for (var r = 0; r < razones.length; r++) lista.appendChild(crear('li', { texto: razones[r] }));
      aviso.appendChild(lista);
      aviso.appendChild(crear('p', { texto: estado.T('Escríbele a Legal con el enlace de tu T&C y te la damos.') }));
    }
    caja.appendChild(aviso);
    return caja;
  }

  // El estado del enlace. Mientras no este confirmado, la leyenda esta completa
  // pero el enlace todavia no existe: publicar la pieza antes que el T&C es el
  // unico riesgo que queda del camino 4.
  if (leyendas.enlaceCambio) {
    caja.appendChild(crear('div', { clase: 'aviso aviso-serio' }, [
      crear('h3', { texto: estado.T('La leyenda cambió. Cambia el arte antes de publicarlo.') }),
      crear('p', { texto: estado.T('El enlace que publicaste no es el que habíamos previsto, así que rehicimos las leyendas con el enlace real.') }),
    ]));
  } else if (leyendas.enlaceConfirmado) {
    caja.appendChild(crear('p', { clase: 'mensaje-ok', texto: estado.T('Enlace confirmado: estas leyendas ya llevan la dirección publicada.') }));
  } else {
    caja.appendChild(crear('p', {
      clase: 'pregunta-ayuda',
      texto: estado.T('Enlace por confirmar. Cuando publiques la página y pegues el enlace aquí abajo, comparamos y te avisamos si la leyenda cambia.'),
    }));
  }

  for (var i = 0; i < leyendas.leyendas.length; i++) {
    (function (leyenda) {
      var ayuda = leyenda.largo + ' de ' + leyenda.largo_max + ' caracteres.';
      // Decir "recortada para que quepa" encima de un aviso de que no cabe es
      // decir dos cosas distintas en la misma pantalla.
      if (leyenda.recortada) {
        ayuda += ' ' + (leyenda.cabe
          ? estado.T('Recortada para que quepa.')
          : estado.T('Recortada hasta el mínimo, y aun así se pasa.'));
      }
      caja.appendChild(RM.util.paraCopiar(estado.T(leyenda.nombre), leyenda.texto, ayuda));

      if (!leyenda.cabe) {
        // Con los números, no solo con el "no cabe": cuánto se pasa y cuánto de
        // eso se lo están comiendo los enlaces, que suelen ser la mitad.
        var porCuanto = estado.T('Se pasa por {n} caracteres.').replace('{n}', leyenda.sobra);
        if (leyenda.enlaces > 0) {
          porCuanto += ' ' + estado.T('Los enlaces ocupan {n} de los {total}.')
            .replace('{n}', leyenda.caracteresEnEnlaces).replace('{total}', leyenda.largo);
        }
        caja.appendChild(crear('div', { clase: 'aviso aviso-serio' }, [
          crear('p', { texto: porCuanto }),
          crear('p', {
            texto: estado.T('No hay nada más que se pueda quitar: todo lo que queda es obligatorio. Usa un formato más grande o escríbele a Legal antes de mandar a diseñar.'),
          }),
        ]));
      }
    })(leyendas.leyendas[i]);
  }

  // Los formatos que esperan una decision, con su razon. No son un error: la
  // push necesita el enlace corto, que todavia no existe.
  for (var p = 0; p < (leyendas.pendientes || []).length; p++) {
    (function (pendiente) {
      caja.appendChild(crear('div', { clase: 'aviso' }, [
        crear('h3', { texto: estado.T(pendiente.nombre) + estado.T(': todavía no') }),
        crear('p', { texto: pendiente.razones.join('. ') + '.' }),
      ]));
    })(leyendas.pendientes[p]);
  }

  return caja;
}

/**
 * El recordatorio del acuerdo de transferencia de datos en la pantalla final.
 *
 * La respuesta del encargo 01 pide que el aviso se repita aqui, y tiene razon:
 * entre el formulario y la entrega del premio pasan semanas, y para entonces el
 * comercial ya no se acuerda de que dijo "no se". Sin el acuerdo firmado, el dia
 * de la entrega ni Producto ni Data le pueden dar los datos del ganador.
 */
function avisoDeAcuerdoDeDatos() {
  if (estado.entrada().acuerdoDatos !== 'no_o_no_se') return null;

  var pais = flujo.paisElegido();
  var caja = crear('div', { clase: 'aviso' }, [
    crear('h3', { texto: estado.T('Te falta el acuerdo de transferencia de datos') }),
    crear('p', {
      texto: estado.T('Tu T&C ya está, pero sin ese acuerdo firmado no te van a poder entregar los datos del ganador el día de la entrega. Arranca el trámite ahora, que toma tiempo.'),
    }),
  ]);

  // El boton y su linea los arma RM.pasos, para que el texto viva en un solo
  // sitio: aqui y en la pregunta se ve exactamente lo mismo.
  var boton = RM.pasos.botonDelModeloDeAcuerdo(pais);
  if (boton) caja.appendChild(boton);
  return caja;
}

/**
 * Agrega un bloque solo si existe.
 *
 * appendChild(null) lanza una excepcion, y como esto corre a mitad de pintar la
 * pantalla final, lo que ve el comercial es "No pudimos generar el documento"
 * sobre un documento que si se genero. Paso con el aviso del acuerdo de datos,
 * que solo sale en Carrera: en un cashback devolvia null y tumbaba la pantalla.
 */
function agregarSiHay(destino, bloque) {
  if (bloque) destino.appendChild(bloque);
}

// --- Pantalla final ----------------------------------------------------------

function pantallaListo(raiz) {
  var resultado = E.resultado || {};
  var contenido = crear('div', { clase: 'pagina pagina-angosta' }, [
    crear('h1', { texto: estado.T('Tu T&C está listo') }),
    // En un pais en pruebas el aviso de "no publiques" tiene que estar en la
    // pantalla que explica como publicar, no solo en las de antes.
    RM.pasos.avisoDePaisEnPruebas(),
  ]);

  if (resultado.demostracion) {
    contenido.appendChild(crear('div', { clase: 'aviso' }, [
      crear('h3', { texto: estado.T('Modo demostración') }),
      crear('p', { texto: estado.T('No se creó ningún documento ni se envió ningún correo. Este es el texto que habría salido.') }),
    ]));
    var hoja = crear('div', { clase: 'hoja' });
    RM.documento.dibujar(hoja, resultado.texto, '');
    contenido.appendChild(hoja);
    contenido.appendChild(bloqueDePublicacion(resultado));
    agregarSiHay(contenido, avisoDeAcuerdoDeDatos());
    agregarSiHay(contenido, bloqueDeLeyendas(resultado.leyendas));
    contenido.appendChild(crear('div', { clase: 'fila-botones' }, [
      crear('button', {
        clase: 'boton boton-secundario', type: 'button', texto: estado.T('Hacer otra campaña'),
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
          document.createTextNode(estado.T('Abrir el documento')), RM.util.icono('abrir', 16),
        ])
      : null,
  ]));

  contenido.appendChild(bloqueDePublicacion(resultado));
  agregarSiHay(contenido, avisoDeAcuerdoDeDatos());

  // Las leyendas van aqui, entre como publicar y el campo del enlace: el
  // comercial las copia en el mismo momento en que se lleva el documento, y
  // justo debajo esta el campo que las confirma.
  var cajaDeLeyendas = bloqueDeLeyendas(resultado.leyendas);
  agregarSiHay(contenido, cajaDeLeyendas);

  // Link publicado.
  contenido.appendChild(crear('h2', { texto: estado.T('Cuando ya esté publicado') }));
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

        // Paso 3 del camino 4: con el enlace real, las leyendas se rehacen y
        // el bloque se cambia entero. Si el enlace resulto distinto, el aviso
        // rojo aparece ahi mismo, no en un correo que nadie abre.
        if (respuesta.leyendas && cajaDeLeyendas && cajaDeLeyendas.parentNode) {
          var rehecho = bloqueDeLeyendas(respuesta.leyendas);
          if (rehecho) {
            cajaDeLeyendas.parentNode.replaceChild(rehecho, cajaDeLeyendas);
            cajaDeLeyendas = rehecho;
            rehecho.scrollIntoView({ block: 'nearest' });
          }
        }
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
      clase: 'boton boton-secundario', type: 'button', texto: estado.T('Hacer otra campaña'),
      onclick: function () { estado.reiniciarFormulario({}); RM.app.ir('inicio'); },
    }),
    crear('button', {
      clase: 'boton boton-secundario', type: 'button', texto: estado.T('Ver mis campañas'),
      onclick: function () { RM.app.ir('historial'); },
    }),
  ]));

  raiz.appendChild(contenido);
}

RM.resumen = {
  pantallaResumen: pantallaResumen,
  pantallaListo: pantallaListo,
  loQueFalta: loQueFalta,
};
