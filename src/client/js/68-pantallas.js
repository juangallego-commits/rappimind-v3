'use strict';

/** Historial, Ayuda y Administración. */

var RM = window.RM;
var crear = RM.util.crear;
var estado = RM.estado;
var E = estado.estado;

// --- Historial ---------------------------------------------------------------

function pantallaHistorial(raiz) {
  var contenido = crear('div', { clase: 'pagina' }, [
    crear('h1', { texto: 'Tus campañas' }),
    crear('p', {
      clase: 'pregunta-ayuda',
      texto: 'Todas las campañas que has generado, con su documento y su estado. Sirve para tres cosas: abrir otra vez un documento que ya generaste, marcar una campaña como publicada cuando ya la subiste a Squarespace, y arrancar una campaña nueva copiando los datos de una anterior con "Usar como base".',
    }),
  ]);

  var buscador = crear('input', {
    clase: 'buscador', type: 'search', placeholder: 'Busca por nombre, tienda o país', 'aria-label': 'Buscar en tu historial',
  });
  buscador.addEventListener('input', RM.util.conRetraso(function () { cargar(buscador.value); }, 250));

  contenido.appendChild(crear('div', { clase: 'pregunta' }, [
    crear('div', { clase: 'campo-caja' }, [buscador]),
  ]));

  var destino = crear('div', {});
  contenido.appendChild(destino);
  raiz.appendChild(contenido);

  function cargar(busqueda) {
    RM.util.vaciar(destino);
    destino.appendChild(crear('p', { clase: 'pregunta-ayuda', texto: estado.T('Cargando...') }));

    RM.servidor.llamar('historial', busqueda || '').then(function (respuesta) {
      RM.util.vaciar(destino);

      // Si el servidor no devuelve una lista, se dice que pasó en vez de
      // reventar con un error que no le sirve a nadie.
      if (!respuesta || typeof respuesta.length !== 'number') {
        destino.appendChild(crear('p', {
          clase: 'mensaje-error',
          texto: 'El servidor no devolvió tu historial. Vuelve a cargar la página y, si sigue igual, avísale a Legal por el canal de ayuda.',
        }));
        return;
      }
      var filas = respuesta;

      if (filas.length === 0) {
        destino.appendChild(crear('p', { clase: 'pregunta-ayuda', texto: busqueda ? 'No encontramos ninguna campaña con eso.' : 'Todavía no has generado ninguna campaña.' }));
        return;
      }

      var tabla = crear('table', { clase: 'tabla' });
      tabla.appendChild(crear('thead', {}, [
        crear('tr', {}, [
          crear('th', { texto: estado.T('Campaña') }),
          crear('th', { texto: 'País' }),
          crear('th', { texto: 'Fecha' }),
          crear('th', { texto: 'Estado' }),
          crear('th', { texto: '' }),
        ]),
      ]));

      var cuerpo = crear('tbody');
      for (var i = 0; i < filas.length; i++) {
        (function (fila) {
          var publicado = String(fila.estado) === 'publicado';
          cuerpo.appendChild(crear('tr', {}, [
            crear('td', {}, [
              crear('strong', { texto: fila.nombre_campana || '(sin nombre)' }),
              fila.tienda ? crear('small', { clase: 'pregunta-ayuda', texto: ' ' + fila.tienda }) : null,
            ]),
            crear('td', { texto: fila.pais || '' }),
            crear('td', { texto: String(fila.fecha || '').slice(0, 10) }),
            crear('td', {}, [
              crear('span', { clase: 'estado ' + (publicado ? 'estado-publicado' : 'estado-generado') }, [
                crear('span', { clase: 'punto' }),
                document.createTextNode(publicado ? 'Publicado' : 'Generado'),
              ]),
            ]),
            crear('td', {}, [
              fila.link_doc ? crear('a', { clase: 'boton-texto', href: fila.link_doc, target: '_blank', rel: 'noopener', texto: 'Abrir' }) : null,
              document.createTextNode(' '),
              crear('button', {
                clase: 'boton-texto', type: 'button', texto: 'Usar como base',
                onclick: function () { usarComoBase(fila.id); },
              }),
              botonDeAmpliar(fila, destino),
            ]),
          ]));
        })(filas[i]);
      }
      tabla.appendChild(cuerpo);
      destino.appendChild(crear('div', { clase: 'envoltorio-tabla' }, [tabla]));
    }).catch(function (error) {
      RM.util.vaciar(destino);
      destino.appendChild(crear('p', { clase: 'mensaje-error', texto: 'No pudimos cargar tu historial: ' + error.message }));
    });
  }

  cargar('');
}

/**
 * El boton de ampliar una campana en curso.
 *
 * Solo aparece cuando la campana esta publicada y corriendo. Una campana que ya
 * arranco no cambia sus condiciones: lo unico que se puede es darle mas dias,
 * mas presupuesto, mas ordenes o mas unidades. Ver src/core/ampliacion.js.
 */
function botonDeAmpliar(fila, destino) {
  var entrada = datosDeLaFila(fila);
  if (!entrada) return null;

  var hoy = E.configuracion.hoy || RM.util.hoyEnElNavegador();
  var estado = puedeAmpliar(fila, entrada, hoy, RM.util.horaEnElNavegador());
  if (!estado.puede) return null;

  return crear('button', {
    clase: 'boton-texto', type: 'button', texto: 'Ampliar',
    onclick: function () { abrirAmpliacion(fila, entrada, destino); },
  });
}

/** Las respuestas guardadas de una fila del historial, o null. */
function datosDeLaFila(fila) {
  try {
    return JSON.parse(fila.datos_json || '{}');
  } catch (error) {
    return null;
  }
}

/** El formulario de ampliacion, debajo de la tabla. */
function abrirAmpliacion(fila, entrada, destino) {
  var viejo = document.getElementById('caja-ampliacion');
  if (viejo) viejo.parentNode.removeChild(viejo);

  var caja = crear('div', { clase: 'ficha', id: 'caja-ampliacion' });
  var seccion = crear('div', { clase: 'ficha-seccion' }, [
    crear('h3', { texto: 'Ampliar ' + (fila.nombre_campana || fila.id) }),
    crear('p', {
      clase: 'pregunta-ayuda',
      texto: 'Esta campaña ya arrancó, así que solo se le puede dar más: más días, más presupuesto, más órdenes o más unidades. Nunca menos, porque cambiaría las condiciones de quien ya compró.',
    }),
  ]);

  var controles = {};
  function campoDeAmpliacion(id, etiqueta, tipo, valorActual) {
    var control = crear('input', { type: tipo, id: 'ampliar-' + id, 'aria-label': etiqueta });
    controles[id] = control;
    seccion.appendChild(crear('div', { clase: 'pregunta' }, [
      crear('label', { clase: 'copiable-etiqueta', for: 'ampliar-' + id, texto: etiqueta }),
      crear('div', { clase: 'campo-caja' }, [control]),
      crear('p', { clase: 'pregunta-ayuda', texto: 'Ahora dice: ' + (valorActual === null || valorActual === undefined || valorActual === '' ? 'sin valor' : valorActual) }),
    ]));
  }

  campoDeAmpliacion('fechaFin', 'Nueva fecha de fin', 'date', entrada.fechaFin);
  if (entrada.presupuesto) campoDeAmpliacion('presupuesto', 'Nuevo presupuesto', 'text', entrada.presupuesto);
  if (entrada.maxOrdenes) campoDeAmpliacion('maxOrdenes', 'Nuevo máximo de órdenes', 'text', entrada.maxOrdenes);
  if (entrada.unidades) campoDeAmpliacion('unidades', 'Nuevas unidades con descuento', 'text', entrada.unidades);

  var mensaje = crear('p', { clase: 'pregunta-ayuda', texto: 'Llena solo lo que quieras ampliar y deja el resto vacío.' });
  var guardar = crear('button', { clase: 'boton', type: 'button', texto: 'Ampliar la campaña' });

  guardar.addEventListener('click', function () {
    var cambios = {};
    for (var id in controles) {
      if (!Object.prototype.hasOwnProperty.call(controles, id)) continue;
      var valor = String(controles[id].value || '').trim();
      if (valor) cambios[id] = id === 'fechaFin' ? valor : Number(RM.util.soloDigitos(valor));
    }

    guardar.disabled = true;
    guardar.textContent = 'Ampliando...';
    RM.servidor.llamar('ampliarCampana', fila.id, cambios).then(function (respuesta) {
      guardar.disabled = false;
      guardar.textContent = 'Ampliar la campaña';
      if (!respuesta || !respuesta.valido) {
        mensaje.className = 'mensaje-error';
        mensaje.textContent = respuesta && respuesta.errores ? respuesta.errores[0].mensaje : 'No pudimos ampliar la campaña.';
        return;
      }
      RM.util.vaciar(seccion);
      seccion.appendChild(crear('h3', { texto: 'Listo: versión ' + respuesta.version }));
      seccion.appendChild(crear('p', {
        texto: 'Abre el documento nuevo, cópialo completo y reemplaza el texto en la misma página de Squarespace. El enlace no cambia: la gente ya lo tiene.',
      }));
      if (respuesta.linkPublicado) {
        seccion.appendChild(RM.util.paraCopiar('La página que hay que actualizar', respuesta.linkPublicado, ''));
      }
      seccion.appendChild(crear('div', { clase: 'fila-botones' }, [
        crear('a', { clase: 'boton', href: respuesta.linkDoc, target: '_blank', rel: 'noopener' }, [
          document.createTextNode('Abrir el documento nuevo'), RM.util.icono('abrir', 16),
        ]),
      ]));
    }).catch(function (error) {
      guardar.disabled = false;
      guardar.textContent = 'Ampliar la campaña';
      mensaje.className = 'mensaje-error';
      mensaje.textContent = 'No pudimos ampliar la campaña: ' + error.message;
    });
  });

  seccion.appendChild(mensaje);
  seccion.appendChild(crear('div', { clase: 'fila-botones' }, [guardar]));
  caja.appendChild(seccion);
  destino.appendChild(caja);
  caja.scrollIntoView({ block: 'nearest' });
}

function usarComoBase(id) {
  RM.servidor.llamar('datosDeSolicitud', id).then(function (respuesta) {
    if (!respuesta.valido) {
      RM.app.mostrarError(respuesta.errores[0].mensaje);
      return;
    }
    var base = respuesta.entrada;
    // Las fechas no se copian: casi nunca sirven para la campaña nueva.
    base.fechaInicio = '';
    base.fechaFin = '';
    base.fechaCarga = '';
    base.fechaFinRedencion = '';
    base.fechaNotificacion = '';
    base.declaracion = false;

    estado.reiniciarFormulario(base);
    E.filtroRespondido = true;
    RM.app.ir('pasos');
  }).catch(function (error) {
    RM.app.mostrarError('No pudimos abrir esa campaña: ' + error.message);
  });
}

// --- Ayuda -------------------------------------------------------------------

function listaSimple(items, clase) {
  var lista = crear('ul', { clase: clase || '' });
  for (var i = 0; i < items.length; i++) lista.appendChild(crear('li', { texto: items[i] }));
  return lista;
}

/** Quién tiene usuario de Squarespace, país por país, y el canal de Legal. */
function fichaDeAccesos() {
  var ficha = crear('div', { clase: 'ficha' });

  for (var codigo in ACCESOS_SQUARESPACE) {
    if (!Object.prototype.hasOwnProperty.call(ACCESOS_SQUARESPACE, codigo)) continue;
    (function (accesos, codigoDePais) {
      var seccion = crear('div', { clase: 'ficha-seccion' }, [
        crear('h3', { texto: nombreDelPais(codigoDePais) }),
      ]);

      var grupos = [
        { titulo: 'Cashback y descuentos', personas: accesos.cashback || [], nota: '' },
        { titulo: 'Concursos', personas: accesos.concursos || [], nota: accesos.notaConcursos || '' },
      ];

      for (var g = 0; g < grupos.length; g++) {
        seccion.appendChild(crear('p', { clase: 'copiable-etiqueta', texto: grupos[g].titulo }));
        if (grupos[g].personas.length > 0) {
          var lista = crear('ul');
          for (var i = 0; i < grupos[g].personas.length; i++) {
            lista.appendChild(crear('li', { texto: grupos[g].personas[i].nombre + ' · ' + grupos[g].personas[i].correo }));
          }
          seccion.appendChild(lista);
        } else {
          seccion.appendChild(crear('p', { clase: 'pregunta-ayuda', texto: grupos[g].nota || 'Todavía no hay nadie asignado. Pídelo por el canal.' }));
        }
      }
      ficha.appendChild(seccion);
    })(ACCESOS_SQUARESPACE[codigo], codigo);
  }

  ficha.appendChild(crear('div', { clase: 'ficha-seccion' }, [
    crear('h3', { texto: 'Los demás países' }),
    crear('p', { clase: 'pregunta-ayuda', texto: 'Todavía no tenemos la lista. Pide la publicación por el canal de Legal.' }),
    crear('p', {}, [
      document.createTextNode(CANAL_TC.para + ' '),
      crear('a', { href: CANAL_TC.url, target: '_blank', rel: 'noopener', texto: CANAL_TC.nombre }),
    ]),
  ]));
  return ficha;
}

/** El nombre del país tal como lo trae el servidor, o su código. */
function nombreDelPais(codigo) {
  var paises = E.configuracion.paises || [];
  for (var i = 0; i < paises.length; i++) {
    if (paises[i].codigo === codigo) return paises[i].nombre;
  }
  return codigo;
}

function pantallaAyuda(raiz) {
  var contenido = crear('div', { clase: 'pagina pagina-angosta' }, [
    crear('h1', { texto: estado.T('Ayuda') }),
  ]);

  // 1. El aviso de azar, primero y destacado.
  var aviso = crear('div', { clase: 'aviso aviso-serio' }, [
    crear('h3', { texto: AVISO_AZAR.titulo }),
    crear('p', { texto: AVISO_AZAR.entrada }),
  ]);
  if (AVISO_AZAR.borrador) {
    aviso.appendChild(crear('p', {
      clase: 'pregunta-ayuda',
      texto: 'Si algo de esta página no coincide con lo que ves en la herramienta, avísanos por el canal.',
    }));
  }
  contenido.appendChild(aviso);

  for (var i = 0; i < AVISO_AZAR.porQue.length; i++) {
    contenido.appendChild(crear('p', { texto: AVISO_AZAR.porQue[i] }));
  }

  contenido.appendChild(crear('h3', { texto: 'Sirven para esta herramienta' }));
  contenido.appendChild(listaSimple(AVISO_AZAR.validas));
  contenido.appendChild(crear('h3', { texto: 'No sirven: las redacta Legal' }));
  contenido.appendChild(listaSimple(AVISO_AZAR.noValidas));
  contenido.appendChild(crear('h3', { texto: 'Consúltalo igual' }));
  contenido.appendChild(listaSimple(AVISO_AZAR.frontera));
  contenido.appendChild(crear('div', { clase: 'aviso' }, [crear('p', { texto: AVISO_AZAR.regla })]));

  // 2. Guía de Squarespace. Es la misma lista que la pantalla final, para que
  // las dos digan exactamente lo mismo.
  contenido.appendChild(crear('h2', { texto: 'Publicar en Squarespace' }));
  contenido.appendChild(crear('p', {
    clase: 'pregunta-ayuda',
    texto: 'Cuando generes una campaña, al final te damos el título y la dirección ya armados, listos para copiar. Esto es el paso a paso.',
  }));

  var pasos = crear('ol', { clase: 'pasos-publicar' });
  for (var s = 0; s < PASOS_SQUARESPACE.length; s++) {
    pasos.appendChild(crear('li', {}, [
      crear('p', { texto: PASOS_SQUARESPACE[s].hace }),
      crear('p', { clase: 'pregunta-ayuda', texto: 'Deberías ver: ' + PASOS_SQUARESPACE[s].ve }),
    ]));
  }
  contenido.appendChild(pasos);

  contenido.appendChild(crear('h3', { texto: estado.T('¿Quién puede publicar?') }));
  contenido.appendChild(crear('p', {
    texto: 'No todo el mundo tiene usuario de Squarespace: la cuenta la tienen unas pocas personas por país. Si no eres una de ellas, pásales el documento y la dirección que te dio la herramienta, o pídelo por el canal.',
  }));
  contenido.appendChild(fichaDeAccesos());

  contenido.appendChild(crear('h3', { texto: 'Si algo sale mal' }));
  var problemas = crear('dl', {});
  for (var p = 0; p < SI_ALGO_SALE_MAL.length; p++) {
    problemas.appendChild(crear('dt', { texto: SI_ALGO_SALE_MAL[p].problema }));
    problemas.appendChild(crear('dd', { texto: SI_ALGO_SALE_MAL[p].solucion }));
  }
  contenido.appendChild(crear('div', { clase: 'ficha' }, [crear('div', { clase: 'ficha-seccion' }, [problemas])]));

  // 3. Canal de ayuda.
  contenido.appendChild(crear('h2', { texto: 'Canal de ayuda' }));
  if (E.configuracion.urlCanalAyuda) {
    contenido.appendChild(crear('p', {}, [
      document.createTextNode('Si te trabaste con algo de la herramienta, escríbenos en '),
      crear('a', { href: E.configuracion.urlCanalAyuda, target: '_blank', rel: 'noopener', texto: 'el canal de ayuda' }),
      document.createTextNode('. Ahí respondemos dudas de uso, no consultas legales.'),
    ]));
  } else {
    contenido.appendChild(crear('p', { clase: 'pregunta-ayuda', texto: 'Falta configurar el canal de ayuda en las propiedades del script (CANAL_AYUDA_URL).' }));
  }

  // 4. Contactos.
  contenido.appendChild(crear('h2', { texto: 'A quién buscar' }));
  var contactos = crear('div', { clase: 'ficha' });
  for (var c = 0; c < CONTACTOS.length; c++) {
    contactos.appendChild(crear('div', { clase: 'ficha-seccion' }, [
      crear('h3', { texto: CONTACTOS[c].nombre }),
      crear('p', { clase: 'pregunta-ayuda', texto: CONTACTOS[c].para }),
      crear('p', {
        clase: 'pregunta-ayuda',
        // Sin correo se dice donde buscarlo, en vez de ensenar un hueco en una
        // pantalla que van a leer los equipos legales de todos los paises.
        texto: CONTACTOS[c].correo || 'Escríbele por el canal de Legal.',
      }),
    ]));
  }
  contenido.appendChild(contactos);

  // 5. Preguntas frecuentes.
  contenido.appendChild(crear('h2', { texto: 'Preguntas frecuentes' }));
  for (var f = 0; f < PREGUNTAS_FRECUENTES.length; f++) {
    contenido.appendChild(crear('details', { clase: 'por-que' }, [
      crear('summary', { texto: PREGUNTAS_FRECUENTES[f].pregunta }),
      crear('p', { texto: PREGUNTAS_FRECUENTES[f].respuesta }),
    ]));
  }

  raiz.appendChild(contenido);
}

// --- Administración ----------------------------------------------------------

function pantallaAdmin(raiz) {
  var contenido = crear('div', { clase: 'pagina' }, [crear('h1', { texto: estado.T('Administración') })]);
  var destino = crear('div', {});
  contenido.appendChild(destino);
  raiz.appendChild(contenido);

  destino.appendChild(crear('p', { clase: 'pregunta-ayuda', texto: estado.T('Cargando...') }));

  RM.servidor.llamar('adminEstado').then(function (datos) {
    RM.util.vaciar(destino);
    destino.appendChild(seccionPaises(datos));
    destino.appendChild(seccionEquipo(datos));
    destino.appendChild(seccionSolicitudes());
  }).catch(function (error) {
    RM.util.vaciar(destino);
    destino.appendChild(crear('p', { clase: 'mensaje-error', texto: error.message }));
  });
}

function seccionPaises(datos) {
  var tabla = crear('table', { clase: 'tabla' }, [
    crear('thead', {}, [crear('tr', {}, [
      crear('th', { texto: 'País' }), crear('th', { texto: 'Tipos habilitados' }), crear('th', { texto: 'Estado' }),
    ])]),
  ]);
  var cuerpo = crear('tbody');

  for (var i = 0; i < datos.paises.length; i++) {
    (function (pais) {
      var selector = crear('select', { 'aria-label': 'Estado de ' + pais.nombre });
      for (var e = 0; e < datos.estados.length; e++) {
        selector.appendChild(crear('option', {
          value: datos.estados[e], texto: datos.estados[e], selected: pais.estado === datos.estados[e],
        }));
      }
      selector.addEventListener('change', function () {
        RM.servidor.llamar('adminGuardarEstadoDePais', pais.codigo, selector.value).then(function (respuesta) {
          RM.util.anunciar(respuesta.valido ? pais.nombre + ' quedó en ' + selector.value : respuesta.errores[0].mensaje);
        });
      });
      cuerpo.appendChild(crear('tr', {}, [
        crear('td', { texto: pais.codigo + ' · ' + pais.nombre }),
        crear('td', { texto: (pais.modelos || []).join(', ') || 'ninguno' }),
        crear('td', {}, [selector]),
      ]));
    })(datos.paises[i]);
  }
  tabla.appendChild(cuerpo);

  return crear('section', {}, [
    crear('h2', { texto: 'Países' }),
    crear('p', { clase: 'pregunta-ayuda', texto: 'Activo lo ve cualquiera. Piloto solo lo ve el equipo de pruebas. Bloqueado no lo ve nadie.' }),
    crear('div', { clase: 'envoltorio-tabla' }, [tabla]),
  ]);
}

function seccionEquipo(datos) {
  var tabla = crear('table', { clase: 'tabla' }, [
    crear('thead', {}, [crear('tr', {}, [
      crear('th', { texto: 'Correo' }), crear('th', { texto: 'Nombre' }),
      crear('th', { texto: 'Rol' }), crear('th', { texto: 'País' }), crear('th', { texto: 'Activo' }),
    ])]),
  ]);
  var cuerpo = crear('tbody');
  for (var i = 0; i < datos.equipo.length; i++) {
    var miembro = datos.equipo[i];
    cuerpo.appendChild(crear('tr', {}, [
      crear('td', { texto: miembro.email }),
      crear('td', { texto: miembro.nombre || '' }),
      crear('td', { texto: miembro.rol }),
      crear('td', { texto: miembro.pais || '' }),
      crear('td', { texto: miembro.activo ? 'Sí' : 'No' }),
    ]));
  }
  tabla.appendChild(cuerpo);

  var correo = crear('input', { type: 'text', placeholder: 'alguien@rappi.com', 'aria-label': 'Correo' });
  var nombre = crear('input', { type: 'text', placeholder: 'Nombre', 'aria-label': 'Nombre' });
  var pais = crear('input', { type: 'text', placeholder: 'CO', 'aria-label': 'País' });
  var rol = crear('select', { 'aria-label': 'Rol' });
  for (var r = 0; r < datos.roles.length; r++) {
    rol.appendChild(crear('option', { value: datos.roles[r], texto: datos.roles[r] }));
  }
  var mensaje = crear('p', { clase: 'pregunta-ayuda' });

  return crear('section', {}, [
    crear('h2', { texto: 'Equipo' }),
    crear('div', { clase: 'envoltorio-tabla' }, [tabla]),
    crear('h3', { texto: 'Agregar o actualizar' }),
    crear('div', { clase: 'fila-botones' }, [correo, nombre, rol, pais,
      crear('button', {
        clase: 'boton', type: 'button', texto: 'Guardar',
        onclick: function () {
          RM.servidor.llamar('adminGuardarMiembro', {
            email: correo.value, nombre: nombre.value, rol: rol.value, pais: pais.value, activo: true,
          }).then(function (respuesta) {
            if (!respuesta.valido) {
              mensaje.className = 'mensaje-error';
              mensaje.textContent = respuesta.errores[0].mensaje;
              return;
            }
            RM.app.ir('admin');
          });
        },
      }),
    ]),
    mensaje,
    seccionCargaMasiva(datos),
  ]);
}

/**
 * Agregar mucha gente de una sola vez, pegando sus correos.
 *
 * Nacio para abrir la herramienta a los equipos legales de los demas paises: un
 * pais en piloto solo lo ve quien tenga rol legal, pruebas o admin, y agregar a
 * treinta personas de una en una no lo hace nadie a las once de la noche.
 */
function seccionCargaMasiva(datos) {
  var correos = crear('textarea', {
    rows: '4',
    placeholder: 'ana@rappi.com, bruno@rappi.com\ncarla@rappi.com',
    'aria-label': 'Correos, separados por comas o por líneas',
  });

  var rol = crear('select', { 'aria-label': 'Rol para todos' });
  for (var r = 0; r < datos.roles.length; r++) {
    rol.appendChild(crear('option', {
      value: datos.roles[r], texto: datos.roles[r],
      // Legal es el que abre los países en piloto, que es para lo que existe esto.
      selected: datos.roles[r] === 'legal',
    }));
  }

  var pais = crear('input', { type: 'text', placeholder: 'CO', 'aria-label': 'País de todos, opcional' });
  var resultado = crear('div', {});
  var boton = crear('button', { clase: 'boton', type: 'button', texto: 'Agregar a todos' });

  boton.addEventListener('click', function () {
    boton.disabled = true;
    boton.textContent = 'Agregando...';
    RM.util.vaciar(resultado);

    RM.servidor.llamar('adminAgregarMiembros', correos.value, rol.value, pais.value).then(function (respuesta) {
      boton.disabled = false;
      boton.textContent = 'Agregar a todos';

      if (!respuesta.valido) {
        resultado.appendChild(crear('p', { clase: 'mensaje-error', texto: respuesta.errores[0].mensaje }));
        return;
      }

      var lineas = [];
      if (respuesta.agregados.length > 0) {
        lineas.push(respuesta.agregados.length + (respuesta.agregados.length === 1 ? ' persona agregada' : ' personas agregadas') + ' como ' + rol.value + '.');
      }
      if (respuesta.yaEstaban.length > 0) {
        lineas.push(respuesta.yaEstaban.length + (respuesta.yaEstaban.length === 1 ? ' ya estaba' : ' ya estaban') + ' en el equipo, no se tocó su rol: ' + respuesta.yaEstaban.join(', '));
      }
      if (respuesta.rechazados.length > 0) {
        lineas.push('Sin agregar, porque no son correos de Rappi: ' + respuesta.rechazados.join(', '));
      }
      if (lineas.length === 0) lineas.push('No había nada que agregar.');

      for (var i = 0; i < lineas.length; i++) {
        resultado.appendChild(crear('p', {
          clase: i === 0 && respuesta.agregados.length > 0 ? 'mensaje-ok' : 'pregunta-ayuda',
          texto: lineas[i],
        }));
      }
      correos.value = '';
      RM.util.anunciar(lineas[0]);
    }).catch(function (error) {
      boton.disabled = false;
      boton.textContent = 'Agregar a todos';
      resultado.appendChild(crear('p', { clase: 'mensaje-error', texto: 'No pudimos agregarlos: ' + error.message }));
    });
  });

  return crear('div', {}, [
    crear('h3', { texto: 'Agregar muchos de una vez' }),
    crear('p', {
      clase: 'pregunta-ayuda',
      texto: 'Pega los correos separados por comas o uno por línea. Quien ya esté en el equipo se deja como está, así que esto nunca le baja el rol a nadie. Con rol legal, la persona ve los países en piloto.',
    }),
    correos,
    crear('div', { clase: 'fila-botones' }, [rol, pais, boton]),
    resultado,
  ]);
}

function seccionSolicitudes() {
  var buscador = crear('input', { type: 'search', placeholder: 'Busca por campaña, tienda o país', 'aria-label': 'Buscar solicitudes' });
  var destino = crear('div', {});

  function cargar() {
    RM.servidor.llamar('adminSolicitudes', buscador.value || '').then(function (filas) {
      RM.util.vaciar(destino);
      destino.appendChild(crear('p', { clase: 'pregunta-ayuda', texto: filas.length + (filas.length === 1 ? ' solicitud' : ' solicitudes') }));

      var tabla = crear('table', { clase: 'tabla' }, [
        crear('thead', {}, [crear('tr', {}, [
          crear('th', { texto: 'Id' }), crear('th', { texto: estado.T('Campaña') }), crear('th', { texto: 'Quién' }),
          crear('th', { texto: 'País' }), crear('th', { texto: 'Tipo' }), crear('th', { texto: 'Estado' }),
        ])]),
      ]);
      var cuerpo = crear('tbody');
      for (var i = 0; i < filas.length; i++) {
        var fila = filas[i];
        cuerpo.appendChild(crear('tr', {}, [
          crear('td', { texto: fila.id }),
          crear('td', { texto: fila.nombre_campana || '' }),
          crear('td', { texto: fila.email || '' }),
          crear('td', { texto: fila.pais || '' }),
          crear('td', { texto: fila.tipo || '' }),
          crear('td', { texto: fila.estado || '' }),
        ]));
      }
      tabla.appendChild(cuerpo);
      destino.appendChild(crear('div', { clase: 'envoltorio-tabla' }, [tabla]));
    });
  }

  buscador.addEventListener('input', RM.util.conRetraso(cargar, 250));
  cargar();

  return crear('section', {}, [
    crear('h2', { texto: 'Solicitudes' }),
    crear('div', { clase: 'fila-botones' }, [
      buscador,
      crear('button', {
        clase: 'boton boton-secundario', type: 'button', texto: 'Exportar a CSV',
        onclick: function () {
          RM.servidor.llamar('adminSolicitudesCsv', buscador.value || '').then(function (csv) {
            var enlace = document.createElement('a');
            enlace.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent('﻿' + csv);
            enlace.download = 'solicitudes-rappimind.csv';
            document.body.appendChild(enlace);
            enlace.click();
            document.body.removeChild(enlace);
          });
        },
      }),
    ]),
    destino,
  ]);
}

RM.pantallas = {
  pantallaHistorial: pantallaHistorial,
  pantallaAyuda: pantallaAyuda,
  pantallaAdmin: pantallaAdmin,
};
