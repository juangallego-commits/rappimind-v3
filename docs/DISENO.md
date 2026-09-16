# Sistema visual de RappiMind v3

Para quien implemente: los tokens de la última sección son los nombres exactos que
usa `src/client/estilos.css`.

## La idea: el documento es una hoja de papel

La pantalla tiene dos cosas y una sola protagonista.

A la izquierda, las preguntas, sobre el fondo gris de la página. Sin tarjetas, sin
sombras, separadas por líneas de un pixel. Deliberadamente sobrias.

A la derecha, **una hoja de papel blanca** con una sombra suave y un borde apenas
visible. Es el único elemento elevado de toda la aplicación. No es una tarjeta más:
es el documento, y se lee como papel.

Lo que hace que esto no parezca una plantilla es cómo se comporta esa hoja. El T&C
empieza escrito, con **espacios en blanco subrayados en gris** donde falta un dato,
como un formulario de llenar los espacios. Cada espacio dice qué pregunta lo llena:
"el porcentaje", "el tope por pedido". Cuando el comercial responde, el espacio se
rellena con la frase legal de verdad y **destella un instante en naranja**, y la hoja
se desplaza hasta ahí.

El comercial nunca se pregunta para qué sirve lo que está escribiendo, porque lo ve
convertirse en el documento mientras lo escribe. Esa es toda la idea. Nada más en la
interfaz compite con ella.

## Paleta

Seis colores con nombre, más tres de estado. Los contrastes están calculados contra
Papel `#FFFFFF` y Niebla `#F4F6F8`, con la fórmula de luminancia relativa de WCAG.

| Nombre | Hex | Para qué | Contraste |
|---|---|---|---|
| **Naranja Rappi** | `#FF441F` | La marca. Acento, resaltado del documento, corona, anillo de foco, la línea del paso activo. | 3.44:1 sobre Papel |
| **Naranja acción** | `#D32F0F` | Botones primarios y enlaces. | 5.02:1 con texto blanco |
| **Tinta** | `#16181D` | Texto principal y el cuerpo del documento. | 17.76:1 sobre Papel |
| **Gris lápiz** | `#5D626D` | Ayudas, texto secundario, etiquetas. | 6.12:1 sobre Papel |
| **Papel** | `#FFFFFF` | La hoja del documento y las superficies. | fondo |
| **Niebla** | `#F4F6F8` | Fondo de la página. Gris frío, nunca crema. | fondo |

| Estado | Hex | Para qué | Contraste |
|---|---|---|---|
| Verde confirma | `#0B7A52` | "NIT 900.111.222-1 válido" | 5.36:1 sobre Papel |
| Rojo alerta | `#C4320A` | Errores de validación | 5.52:1 sobre Papel |
| Rubor | `#FFEDE8` | Fondo del destello y de los avisos | Tinta encima da 15.67:1 |

Auxiliares: Borde `#E2E6EB` para líneas decorativas, y Borde de control `#767E8C`
para el contorno de campos y botones, que llega a 4.09:1 y cumple el mínimo de 3:1
que WCAG pide para los bordes de un control.

### Por qué hay dos naranjas

Esto es lo único que me tomé la libertad de ajustar, y es por accesibilidad.

**Texto blanco sobre el naranja Rappi `#FF441F` da 3.44:1 y no pasa AA**, que exige
4.5:1 para texto normal. Un botón primario naranja con texto blanco sería ilegible
para bastante gente y no cumpliría la regla de contraste accesible que pediste.

La salida es no forzarlo: `#FF441F` se queda como **color de marca y de acento**,
donde 3:1 es suficiente porque no lleva texto encima (bordes, el destello, la corona,
el anillo de foco, la línea del paso activo). Para lo que sí lleva texto encima
(botones y enlaces) se usa `#D32F0F`, el mismo tono un paso más profundo, que da
5.02:1 con blanco. Uno al lado del otro se leen como el mismo naranja.

Si prefieres el naranja exacto en los botones, la alternativa que sí cumple es texto
Tinta sobre `#FF441F` (5.16:1). Se ve menos convencional para un botón primario, pero
es tu marca y es tu decisión. Está anotado para mañana.

## Tipografía

**Poppins** 600 para títulos, botones y la marca. **Lato** 400 y 700 para todo lo
demás, incluido el cuerpo del documento.

| Uso | Familia | Tamaño | Interlineado |
|---|---|---|---|
| Título de pantalla | Poppins 600 | 28px (23px en celular) | 1.2 |
| Pregunta | Poppins 600 | 21px (19px en celular) | 1.3 |
| Título de sección | Poppins 600 | 17px | 1.35 |
| Cuerpo y campos | Lato 400 | 16px | 1.55 |
| Ayuda de una línea | Lato 400 | 14px | 1.5 |
| Documento | Lato 400 | 15px | 1.65 |
| Etiqueta pequeña | Lato 700 | 13px | 1.4 |

Nunca en mayúsculas sostenidas. Las etiquetas se distinguen por peso y color, no por
gritar.

## Espaciado y radios

Escala de espaciado en múltiplos de 4: `4, 8, 12, 16, 24, 32, 48, 64`. Nada fuera de
esa escala.

Radios: `6px` para campos y botones, `10px` para paneles, `14px` para la hoja del
documento y las hojas deslizables. Un radio por tamaño de cosa, no uno por capricho.

## Componentes

Para cada uno: reposo, cursor encima, foco de teclado, deshabilitado y error.

**Botón primario.** Fondo Naranja acción, texto blanco, Poppins 600, 13px de alto
interno, radio 6. Encima: `#B82A0C`. Foco: anillo de 3px Naranja Rappi con 2px de
separación. Deshabilitado: fondo `#E2E6EB`, texto `#767E8C`, cursor no permitido, y
**se ve deshabilitado de verdad**, no solo se comporta así. Sin flecha al final del
texto: el botón dice lo que pasa ("Generar T&C", "Guardar link publicado").

**Botón secundario.** Fondo transparente, borde 1px Borde de control, texto Tinta.
Encima: fondo Niebla. Mismo anillo de foco.

**Campo de texto.** Borde 1px Borde de control, radio 6, 12px de padding, fondo
Papel. Foco: borde Naranja Rappi más anillo de 3px. Error: borde Rojo alerta y el
mensaje debajo en Rojo alerta. Válido: una marca de verificación verde a la derecha
y el texto confirmando en Verde confirma.

**Campo numérico con moneda.** El símbolo va dentro del campo, a la izquierda, en
Gris lápiz. Debajo, siempre, la línea "Así queda en tu T&C:" con la frase real.

**Grupo de opciones grandes.** Cada opción es un bloque del ancho completo con borde
1px, radio 6, el título en Poppins 600 y una línea de explicación en Gris lápiz
debajo. La elegida lleva borde Naranja Rappi de 2px y fondo Rubor. Se navega con las
flechas del teclado. Una opción deshabilitada (como el desempate igual al criterio
del ganador) va con opacidad 0.5 y **la razón visible**, no escondida.

**Casillas.** Cuadro de 20px, borde Borde de control, radio 4. Marcada: fondo Naranja
acción con un visto blanco en SVG. Se usan cuando las opciones no son excluyentes.

**Barra de progreso por pasos.** Una fila de nombres de paso con una línea de 2px
debajo. El paso hecho lleva la línea en Naranja acción, el actual en Naranja Rappi y
con el nombre en Tinta, y el que falta en Borde con el nombre en Gris lápiz. Sin
números dentro de círculos.

**Aviso.** Fondo Rubor, una barra de 3px a la izquierda en Naranja Rappi, texto
Tinta. Sin icono decorativo. El aviso legal de azar usa el mismo patrón pero con el
título en Poppins 600.

**Glosario.** El término va con subrayado punteado y `cursor: help`. Al pasar el
cursor o tocar, aparece un panel de 260px con fondo Tinta y texto blanco, radio 6.
En celular se abre al tocar y se cierra al tocar fuera. Funciona con teclado.

**Hoja deslizable (celular).** Entra desde abajo, radio 14 arriba, fondo Papel, con
un asa de 36x4 en Borde. La abre el botón fijo "Ver cómo va mi T&C". Se cierra con
Escape, con el botón y tocando fuera.

## Movimiento

Solo como respuesta a algo que hizo el usuario:

- El destello del fragmento que acaba de cambiar: 900ms de fondo Rubor que se apaga.
- El desplazamiento de la hoja hasta esa frase: `scroll-behavior: smooth`.
- La apertura de una ayuda o del glosario: 160ms.
- La hoja deslizable del celular: 220ms.

Nada se mueve solo. Nada pulsa, nada rebota, nada aparece por aparecer.

Todo esto va dentro de `@media (prefers-reduce-motion: reduce)` con duración cero. El
destello se vuelve un borde estático que se queda hasta el siguiente cambio, para que
quien no puede ver animaciones tampoco pierda la información.

## Lo que no se hace

Esto es tan importante como lo anterior, y está en la lista porque es lo primero que
aparece cuando uno no piensa:

1. **Tarjetas idénticas con la misma sombra.** Hay una sola superficie elevada en toda
   la aplicación: la hoja del documento. Todo lo demás se separa con líneas de 1px.
2. **Etiquetas en mayúsculas sostenidas.** Ninguna.
3. **Flechas al final de los botones.** El texto del botón ya dice qué pasa.
4. **Degradados decorativos.** Todos los fondos son planos.
5. **Emojis como iconos.** Los iconos son SVG de un solo trazo, 20px, `currentColor`.

## La corona

Anna pidió conservarla. Va sobre la "M" de RappiMind, pequeña, en Naranja Rappi, como
si la palabra la llevara puesta. No es un logo aparte ni un adorno centrado: es parte
de la palabra, y por eso no se vuelve cursi.

```html
<svg class="corona" viewBox="0 0 24 14" aria-hidden="true" focusable="false">
  <path d="M2 12.5 L2 4 L6.5 7.5 L12 1.5 L17.5 7.5 L22 4 L22 12.5 Z"
        fill="currentColor" stroke="currentColor" stroke-width="1.6"
        stroke-linejoin="round"/>
</svg>
```

Se pinta con `color: var(--naranja-marca)` y se coloca con `position:absolute` sobre
la letra, a 14px de ancho. En pantallas muy pequeñas no se quita: se reduce a 11px.

## Tokens CSS

```css
:root {
  /* Paleta */
  --naranja-marca: #FF441F;
  --naranja-accion: #D32F0F;
  --naranja-presionado: #A82409;
  --tinta: #16181D;
  --gris-lapiz: #5D626D;
  --papel: #FFFFFF;
  --niebla: #F4F6F8;

  /* Estados */
  --verde-confirma: #0B7A52;
  --verde-palido: #E6F4EE;
  --rojo-alerta: #C4320A;
  --rojo-palido: #FDECE6;
  --rubor: #FFEDE8;

  /* Líneas */
  --borde: #E2E6EB;
  --borde-control: #767E8C;

  /* Tipografía */
  --titulos: 'Poppins', system-ui, sans-serif;
  --cuerpo: 'Lato', system-ui, sans-serif;

  /* Espaciado */
  --e1: 4px;  --e2: 8px;  --e3: 12px; --e4: 16px;
  --e5: 24px; --e6: 32px; --e7: 48px; --e8: 64px;

  /* Radios */
  --r-control: 6px;
  --r-panel: 10px;
  --r-hoja: 14px;

  /* Elevación: una sola, la del documento */
  --sombra-hoja: 0 1px 2px rgba(22, 24, 29, 0.05), 0 8px 24px rgba(22, 24, 29, 0.07);

  /* Movimiento */
  --t-rapido: 160ms;
  --t-hoja: 220ms;
  --t-destello: 900ms;
}
```
