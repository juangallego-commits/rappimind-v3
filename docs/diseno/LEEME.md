# Insumos del cambio de identidad

Aquí van las piezas del nuevo estilo, tal como salieron de donde se hicieron.
Esta carpeta es material de referencia, no código: nada de lo que está aquí se
sube a Apps Script ni entra en el build.

Las reglas de producto no cambian. Lo que se cambia es la pintura: color,
tipografía, espaciado, radios, sombras y la forma de los componentes. El
recorrido, las preguntas, los textos y el documento generado se quedan como
están. Lo que no se puede tocar está en `docs/PARA_EL_DISENO.md`.

## Cómo subir los archivos

Arrástralos aquí con el nombre que ya tengan y ponles un prefijo para que se
agrupen solos:

| Prefijo | Qué es | Cuánto manda |
|---|---|---|
| `rappi-` | El template original del equipo de diseño de Rappi | Manda en color y tipografía: es la marca, sin interpretación |
| `sistema-` | El Design System: tokens, escala tipográfica, espaciado, radios, componentes | Manda en las reglas, y es lo que cubre las pantallas que nadie dibujó |
| `pantalla-` | Los ejemplos del flujo ya diseñados, en HTML y CSS | Manda en los valores exactos de lo que sí está dibujado |
| `prompt-` | El prompt con que se generó el diseño | No sirve para regenerar, sirve para entender la intención |

Si dos fuentes se contradicen, gana la de más arriba de la tabla, salvo en un
caso: si el ejemplo dibujado se ve distinto de lo que dice el sistema, gana el
ejemplo y hay que corregir el token.

## Qué formatos sirven

Sirven HTML, CSS, JSON de tokens, Markdown y texto plano. De ahí se leen los
valores literales.

Sirven a medias PDF, PNG y presentaciones de marca: valen como referencia
visual, pero los colores y los tamaños no se sacan de una imagen, se sacan del
código. Si lo único que hay es una imagen, lo digo y decidimos.

No sirve un archivo de Figma suelto. Si el original vive en Figma, hace falta
un export de tokens o el enlace.

## Qué se hace con esto

Al llegar los archivos, antes de tocar una línea de `src/client/`, sale un
análisis con seis cosas:

1. Los 44 tokens de hoy contra los nuevos: cuáles cambian de valor, cuáles se
   agregan y cuáles sobran.
2. Cuántas de las 46 pantallas quedan cubiertas por un ejemplo y cuántas hay
   que deducir.
3. Los estados que ningún ejemplo dibuja. Son unos diecisiete en la hoja actual
   (campo en error, opción elegida, opción vencida, paso hecho, hoja vacía y
   los demás) y son donde se cuela el criterio de quien programa en lugar del
   de quien diseñó.
4. El contraste de cada par de colores que lleve texto encima, medido contra
   WCAG AA. Hoy hay dos naranjas justamente por esto y está explicado en
   `docs/DISENO.md`.
5. Lo que Apps Script no va a cargar: tipografías que no estén en Google Fonts
   y cualquier recurso que no venga por HTTPS.
6. Lo que obligaría a tocar el JavaScript de la interfaz, que es la única parte
   con riesgo de mover el flujo.

Con eso se arma el plan y se decide. Nada se implementa antes.

## Inventario

Una línea por archivo, escrita a mano al subirlo. Si algo no está aquí, no se
sabe qué es.

| Archivo | Qué es | De dónde salió |
|---|---|---|
| | | |
