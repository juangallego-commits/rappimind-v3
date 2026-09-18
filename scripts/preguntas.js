'use strict';

/**
 * Genera docs/PREGUNTAS_KAM.md a partir de src/core/preguntas.js.
 *
 * La fuente única son las preguntas del código: así el documento que revisa Juan
 * y lo que ve el comercial no se pueden separar.
 *
 * Uso: npm run preguntas
 */

const { rutaDesdeRaiz, escribirTexto } = require('./lib/archivos');
const { PASOS, PREGUNTAS, GLOSARIO, NOMBRE_DEL_HUECO } = require('../src/core/preguntas.js');
const { ESQUEMAS, camposVisibles } = require('../src/core/esquemas.js');

function lista(valores) {
  return valores.join(', ');
}

function ficha(campoId, campo) {
  const pregunta = PREGUNTAS[campoId];
  const lineas = [];

  if (!pregunta || !pregunta.pregunta) {
    lineas.push('### ' + campoId, '');
    lineas.push('No tiene pregunta propia: se responde dentro de **' + (pregunta && pregunta.respondidoPor) + '**.', '');
    return lineas;
  }

  lineas.push('### ' + pregunta.pregunta, '');
  lineas.push('> ' + pregunta.ayuda, '');
  lineas.push('**Por qué te preguntamos esto.** ' + pregunta.porQue, '');

  const detalles = [];
  detalles.push('| | |', '|---|---|');
  detalles.push('| Campo interno | `' + campoId + '` |');
  detalles.push('| Paso | ' + (PASOS.find((p) => p.id === pregunta.paso) || {}).nombre + ' |');
  detalles.push('| Tipo de control | ' + (campo ? campo.tipo : 'repetible') + ' |');
  detalles.push('| Obligatorio | ' + (pregunta.opcional ? 'no' : 'sí, cuando se ve') + ' |');
  if (pregunta.porDefecto !== undefined) detalles.push('| Valor por defecto | ' + pregunta.porDefecto + ' |');
  if (pregunta.ejemplo) detalles.push('| Ejemplo | ' + pregunta.ejemplo + ' |');
  detalles.push('| Avanza sola | ' + (pregunta.avanzaSola ? 'sí' : 'no') + ' |');
  if (pregunta.placeholders && pregunta.placeholders.length) {
    detalles.push('| Llena en el documento | ' + lista(pregunta.placeholders.map((x) => '`' + x + '`')) + ' |');
  }
  lineas.push(...detalles, '');

  if (pregunta.opciones) {
    lineas.push('**Opciones** (' + (pregunta.multiple ? 'casillas, se pueden marcar varias' : 'botones grandes, una sola') + '):', '');
    for (const opcion of pregunta.opciones) {
      lineas.push('- **' + opcion.etiqueta + '**: ' + (opcion.nota || ''));
    }
    lineas.push('');
  }

  if (pregunta.sugerencias) {
    lineas.push('**Sugerencias clicables:** ' + lista(pregunta.sugerencias), '');
  }

  const errores = Object.keys(pregunta.errores || {});
  if (errores.length) {
    lineas.push('**Mensajes de validación:**', '');
    for (const llave of errores) {
      lineas.push('- `' + llave + '`: ' + pregunta.errores[llave]);
    }
    lineas.push('');
  }

  if (pregunta.confirmacion) {
    lineas.push('**Al validar bien** muestra el valor formateado seguido de "' + pregunta.confirmacion + '".', '');
  }
  if (pregunta.aviso) {
    lineas.push('**Aviso:** ' + pregunta.aviso, '');
  }
  if (pregunta.razonDeshabilitado) {
    lineas.push('**Opción deshabilitada:** se muestra con la razón visible: "' + pregunta.razonDeshabilitado + '"', '');
  }
  if (pregunta.camposPorTienda) {
    lineas.push('**Campos de cada fila:**', '');
    for (const llave of Object.keys(pregunta.camposPorTienda)) {
      const sub = pregunta.camposPorTienda[llave];
      lineas.push('- **' + sub.pregunta + '**: ' + sub.ayuda + (sub.ejemplo ? ' Ejemplo: ' + sub.ejemplo : ''));
    }
    lineas.push('');
  }

  return lineas;
}

function main() {
  const lineas = [];

  lineas.push('# Las preguntas que ve el comercial', '');
  lineas.push('Generado por `npm run preguntas` desde `src/core/preguntas.js`. **No lo edites a mano:**');
  lineas.push('cambia la pregunta en el código y vuelve a generarlo, así lo que revisas y lo que ve');
  lineas.push('el comercial nunca se separan.', '');
  lineas.push('El objetivo es que un KAM en su primer día genere un T&C correcto en menos de');
  lineas.push('cinco minutos sin preguntarle a nadie.', '');
  lineas.push('## El estándar que cumple cada pregunta', '');
  lineas.push('1. Pregunta directa, en tú, máximo 10 palabras. Nunca el nombre interno del campo.');
  lineas.push('2. Una línea de ayuda con un ejemplo concreto.');
  lineas.push('3. Un enlace "Por qué te preguntamos esto" con dos líneas de explicación.');
  lineas.push('4. Debajo del campo, "Así queda en tu T&C:" con la frase real que produce el motor.');
  lineas.push('5. Validación en vivo que dice qué pasó y cómo se arregla. Nunca "campo inválido".');
  lineas.push('6. Valor por defecto cuando el caso mayoritario es claro y no tiene riesgo.');
  lineas.push('7. Botones grandes con una línea de explicación cuando son pocas opciones;');
  lineas.push('   casillas cuando se pueden marcar varias.', '');
  lineas.push('Los ejemplos y los valores por defecto salen de `docs/HALLAZGOS_SOLICITUDES.md`,');
  lineas.push('el análisis de 1.184 solicitudes reales.', '');

  lineas.push('## Glosario', '');
  lineas.push('Estos términos llevan subrayado punteado en la interfaz. Al pasar el cursor o');
  lineas.push('tocar, aparece la definición.', '');
  lineas.push('| Término | Qué es |', '|---|---|');
  for (const termino of Object.keys(GLOSARIO)) {
    lineas.push('| **' + termino + '** | ' + GLOSARIO[termino] + ' |');
  }
  lineas.push('');

  for (const tipoId of Object.keys(ESQUEMAS)) {
    const esquema = ESQUEMAS[tipoId];
    lineas.push('---', '');
    lineas.push('# ' + esquema.nombre, '');
    lineas.push(esquema.descripcion, '');

    lineas.push('## Filtro de entrada', '');
    lineas.push('Antes del formulario. Si responde **sí** a cualquiera, no se genera: se muestra');
    lineas.push('la pantalla "Esta campaña la redacta Legal" con la razón y el enlace al');
    lineas.push('formulario manual.', '');
    for (const preguntaFiltro of esquema.filtroDeEntrada) {
      lineas.push('- ' + preguntaFiltro);
    }
    lineas.push('');

    // Todos los campos, con las visibilidades abiertas, agrupados por paso.
    const porPaso = {};
    for (const campo of esquema.campos) {
      if (!porPaso[campo.paso]) porPaso[campo.paso] = [];
      porPaso[campo.paso].push(campo);
    }

    for (const paso of PASOS) {
      if (!porPaso[paso.id]) continue;
      lineas.push('## Paso: ' + paso.nombre, '');
      for (const campo of porPaso[paso.id]) {
        lineas.push(...ficha(campo.id, campo));
      }
    }
  }

  lineas.push('---', '');
  lineas.push('## Los espacios en blanco del documento', '');
  lineas.push('Mientras falta un dato, la vista previa muestra un espacio gris con el nombre de');
  lineas.push('la pregunta que lo llena. Estos son los nombres:', '');
  lineas.push('| En el modelo | Dice en pantalla |', '|---|---|');
  for (const llave of Object.keys(NOMBRE_DEL_HUECO)) {
    lineas.push('| `' + llave + '` | ' + NOMBRE_DEL_HUECO[llave] + ' |');
  }
  lineas.push('');

  escribirTexto(rutaDesdeRaiz('docs', 'PREGUNTAS_KAM.md'), lineas.join('\n'));
  console.log('docs/PREGUNTAS_KAM.md generado: ' + lineas.length + ' líneas.');
}

// `ficha` la reusa scripts/revision.js para el cuadernillo de tandas: la
// pregunta se describe en un solo sitio, y los dos documentos no se separan.
module.exports = { ficha, main };

if (require.main === module) main();
