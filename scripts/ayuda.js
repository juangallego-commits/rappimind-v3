'use strict';

/**
 * Genera docs/CONTENIDO_AYUDA.md desde src/core/ayuda.js.
 * La fuente única es el código: lo que revisa Juan es lo que ve el comercial.
 *
 * Uso: npm run ayuda
 */

const { rutaDesdeRaiz, escribirTexto } = require('./lib/archivos');
const {
  AVISO_AZAR, CONTACTOS, PASOS_SQUARESPACE, SI_ALGO_SALE_MAL, PREGUNTAS_FRECUENTES,
} = require('../src/core/ayuda.js');

function main() {
  const l = [];

  l.push('# Contenido de la pantalla de Ayuda', '');
  l.push('Generado por `npm run ayuda` desde `src/core/ayuda.js`. **No lo edites a mano.**', '');

  l.push('## 1. Aviso sobre azar', '');
  if (AVISO_AZAR.borrador) {
    l.push('> **BORRADOR PENDIENTE DE TU REVISIÓN, JUAN.**');
    l.push('> Esto es contenido legal y sale en la primera pantalla de Ayuda.');
    l.push('> Está escrito con la formulación más conservadora: ante la duda, consultar.', '');
  }
  l.push('**' + AVISO_AZAR.titulo + '**', '');
  l.push(AVISO_AZAR.entrada, '');
  for (const parrafo of AVISO_AZAR.porQue) l.push(parrafo, '');

  l.push('### Sirven para esta herramienta', '');
  for (const item of AVISO_AZAR.validas) l.push('- ' + item);
  l.push('');
  l.push('### No sirven: las redacta Legal', '');
  for (const item of AVISO_AZAR.noValidas) l.push('- ' + item);
  l.push('');
  l.push('### Casos de frontera: consúltalo igual', '');
  for (const item of AVISO_AZAR.frontera) l.push('- ' + item);
  l.push('');
  l.push('**La regla simple.** ' + AVISO_AZAR.regla, '');

  l.push('## 2. Guía de Squarespace', '');
  l.push('Las capturas van donde dicen los marcadores. Todavía no existen.', '');
  PASOS_SQUARESPACE.forEach((paso, i) => {
    l.push((i + 1) + '. ' + paso.hace);
    l.push('   Deberías ver: ' + paso.ve);
    l.push('   `[CAPTURA ' + (i + 1) + ']`', '');
  });

  l.push('### Si algo sale mal', '');
  l.push('| Problema | Qué hacer |', '|---|---|');
  for (const caso of SI_ALGO_SALE_MAL) l.push('| ' + caso.problema + ' | ' + caso.solucion + ' |');
  l.push('');

  l.push('## 3. Contactos', '');
  l.push('Sin Dave: Anna pidió expresamente quitarlo.', '');
  l.push('**Los correos están pendientes: no los inventé. Complétalos tú.**', '');
  l.push('| Quién | Para qué | Correo |', '|---|---|---|');
  for (const contacto of CONTACTOS) {
    l.push('| ' + contacto.nombre + ' | ' + contacto.para + ' | ' + contacto.correo + ' |');
  }
  l.push('');

  l.push('## 4. Canal de ayuda', '');
  l.push('El enlace sale de la propiedad de script `CANAL_AYUDA_URL`. Si no está');
  l.push('configurada, la pantalla lo dice en vez de mostrar un enlace roto.', '');

  l.push('## 5. Preguntas frecuentes', '');
  for (const item of PREGUNTAS_FRECUENTES) {
    l.push('**' + item.pregunta + '**', '');
    l.push(item.respuesta, '');
  }

  escribirTexto(rutaDesdeRaiz('docs', 'CONTENIDO_AYUDA.md'), l.join('\n'));
  console.log('docs/CONTENIDO_AYUDA.md generado: ' + l.length + ' líneas.');
}

main();
