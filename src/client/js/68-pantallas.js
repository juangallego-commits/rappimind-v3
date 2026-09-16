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
  ]);

  var buscador = crear('input', {
    type: 'search', placeholder: 'Busca por nombre, tienda o país', 'aria-label': 'Buscar en tu historial',
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
    destino.appendChild(crear('p', { clase: 'pregunta-ayuda', texto: 'Cargando...' }));

    RM.servidor.llamar('historial', busqueda || '').then(function (filas) {
      RM.util.vaciar(destino);

      if (filas.length === 0) {
        destino.appendChild(crear('p', { clase: 'pregunta-ayuda', texto: busqueda ? 'No encontramos ninguna campaña con eso.' : 'Todavía no has generado ninguna campaña.' }));
        return;
      }

      var tabla = crear('table', { clase: 'tabla' });
      tabla.appendChild(crear('thead', {}, [
        crear('tr', {}, [
          crear('th', { texto: 'Campaña' }),
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
    base.nombreCampana = (base.nombreCampana || '') + ' (copia)';

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

function pantallaAyuda(raiz) {
  var contenido = crear('div', { clase: 'pagina pagina-angosta' }, [
    crear('h1', { texto: 'Ayuda' }),
  ]);

  // 1. El aviso de azar, primero y destacado.
  var aviso = crear('div', { clase: 'aviso aviso-serio' }, [
    crear('h3', { texto: AVISO_AZAR.titulo }),
    crear('p', { texto: AVISO_AZAR.entrada }),
  ]);
  if (AVISO_AZAR.borrador) {
    aviso.appendChild(crear('p', {
      clase: 'pregunta-ayuda',
      texto: 'Borrador pendiente de revisión de Juan Camilo Gallego.',
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

  // 2. Guía de Squarespace.
  contenido.appendChild(crear('h2', { texto: 'Publicar en Squarespace' }));
  var pasos = crear('ol', { clase: 'pasos-publicar' });
  for (var s = 0; s < PASOS_SQUARESPACE.length; s++) {
    pasos.appendChild(crear('li', {}, [
      crear('p', { texto: PASOS_SQUARESPACE[s].hace }),
      crear('p', { clase: 'pregunta-ayuda', texto: 'Deberías ver: ' + PASOS_SQUARESPACE[s].ve }),
      crear('div', { clase: 'captura', texto: '[CAPTURA ' + (s + 1) + ']' }),
    ]));
  }
  contenido.appendChild(pasos);

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
      crear('p', { clase: 'pregunta-ayuda', texto: CONTACTOS[c].correo }),
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
  var contenido = crear('div', { clase: 'pagina' }, [crear('h1', { texto: 'Administración' })]);
  var destino = crear('div', {});
  contenido.appendChild(destino);
  raiz.appendChild(contenido);

  destino.appendChild(crear('p', { clase: 'pregunta-ayuda', texto: 'Cargando...' }));

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
          crear('th', { texto: 'Id' }), crear('th', { texto: 'Campaña' }), crear('th', { texto: 'Quién' }),
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
