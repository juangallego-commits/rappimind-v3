# Prompt para Claude Code

Pégalo tal cual en Claude Code, con el repo de RappiMind abierto. Ajusta las rutas si tu estructura cambió.

---

Vamos a aplicar la identidad de marca de Rappi al front de RappiMind v3. **Es un cambio de piel, no de producto.**

## Antes de empezar: de dónde salió esto y qué tiene de raro

Lee esto completo antes de tocar un archivo. Es la parte más importante del prompt.

Un diseñador hizo un prototipo de la nueva identidad. **Ese prototipo no se construyó sobre el código real del front.** Se construyó sobre `FRONT_ACTUAL.html`, que es el archivo que genera `npm run front`: una foto estática del DOM, sin JavaScript, de la versión que existía en ese momento. El diseñador nunca tuvo acceso a `src/client/`, ni a la lógica, ni a los modelos, ni al código de Apps Script.

O sea: **tú tienes la versión real y actual del front, y el diseñador no la tuvo.** Es muy probable que el código haya cambiado desde esa foto — preguntas nuevas, campos renombrados, pantallas agregadas, refactors de la hoja de estilos.

De eso se derivan tres reglas:

1. **La fuente de verdad del código es el repo, no el prototipo.** El prototipo es la fuente de verdad del *diseño*.
2. **No copies ni una línea del prototipo.** Está escrito con estilos inline y un runtime de prototipado que no existe en este proyecto. Su HTML no sirve como código.
3. **Tu trabajo es entender la decisión de diseño detrás de cada cosa y volver a tomarla sobre el código de verdad.** Si el prototipo pinta seis pasos y el código actual tiene siete, el resultado correcto tiene siete pasos con el estilo nuevo, no seis. Si el prototipo muestra una pregunta que ya no existe, se ignora. Si el código tiene una pantalla que el prototipo no cubre, la resuelves aplicando las mismas reglas y me la muestras.

### Lo primero que quiero que hagas

Antes de proponer cualquier cambio, hazme un diff conceptual:

- Corre `npm run front` para generar la foto de **hoy**.
- Compárala con lo que cubre el prototipo (`RappiMind Identidad.dc.html`) y con la especificación de `README.md`.
- Dime, en lista: qué pantallas, preguntas o campos existen hoy y no están en el prototipo; qué aparece en el prototipo y ya no existe; y qué clases o variables de `estilos.css` cambiaron de nombre o de estructura desde entonces.

Ese inventario es el punto de partida. No empieces a estilar sin él.

### Cómo leer el prototipo

Para cada cosa que veas ahí, pregúntate cuál era la intención, no cuál era el píxel. Las intenciones son estas:

| Lo que ves en el prototipo | La decisión de diseño detrás | Cómo se aplica al código real |
|---|---|---|
| Franja de gradiente de 3px arriba | Es la firma de marca de la app. Una sola por pantalla, siempre pegada al borde superior de la ventana | Va en la barra superior, sea cual sea el markup que la barra tenga hoy |
| Botones en píldora con gradiente | Toda acción primaria es píldora con gradiente; toda secundaria es píldora con borde | Se aplica a **todos** los botones que existan hoy, incluidos los que el prototipo no muestra |
| Huecos beige con subrayado punteado | Todo dato que falta en el documento se ve igual, sin importar cuántos huecos haya hoy | Regla sobre la clase de hueco existente, no un listado de huecos |
| Barra de 4px por paso | El progreso se lee como barras, no como subrayados. El paso actual lleva el gradiente | Si hoy hay más o menos pasos, la regla se mantiene |
| Paneles pastel en lugar de avisos con borde izquierdo | La marca no usa el borde-izquierda de color. Informativo en celeste, pendiente en beige | Se aplica a todos los avisos del código, no solo a los del prototipo |
| Panel grande con gradiente | Reservado para "momentos": inicio, documento listo, advertencia de azar. Nada más | Si hoy hay otras pantallas de cierre, decide conmigo si califican como momento |
| Una sola familia tipográfica | Se elimina el par Poppins + Lato en toda la app | Barrido completo de la hoja, no solo de las pantallas del prototipo |

Cuando dudes entre ser fiel al prototipo y ser fiel al código actual, **gana el código actual y me preguntas**.

## Contexto del repo

- El front vive en `src/client/`. La hoja de estilos completa es `src/client/estilos.css` y está construida sobre variables CSS en `:root` (`--naranja-marca`, `--tinta`, `--niebla`, `--e1..--e8`, `--r-control`, etc.).
- El sistema de diseño actual está documentado en `docs/DISENO.md`.
- El texto legal vive en `modelos/`.
- `npm run front` genera `FRONT_ACTUAL.html`, la foto del DOM real pantalla por pantalla.
- El front se sirve desde Google Apps Script (`HtmlService`), así que todo tiene que funcionar en un solo archivo, sin bundler y sin dependencias de npm en runtime.

## Lo que NO se toca

Esto es una regla dura. Si un cambio de estilo te obliga a tocar algo de esta lista, para y pregúntame:

- La estructura del DOM, los nombres de clase, los `id` y los `data-campo`.
- El orden y el texto de las preguntas, las ayudas, los "¿Por qué te preguntamos esto?" y los mensajes de error.
- El flujo: filtro de entrada → 6 pasos → resumen → listo, con el T&C llenándose a medida que se responde.
- Las plantillas legales de `modelos/` y el texto de las 20 cláusulas.
- La lógica de huecos (`.falta[data-hueco]`), el contador de datos faltantes y el destello del dato que acaba de cambiar.
- Accesibilidad: foco visible en todo control, `aria-*` existentes, contraste mínimo 4.5:1 en texto de cuerpo.

## Lo que sí cambia

Reescribe **solo** `:root` y las reglas visuales de `src/client/estilos.css`. Nada de estilos nuevos en el JS ni estilos inline.

### 1. Tipografía

Una sola familia en toda la app. Elimina el par Poppins + Lato.

```css
--titulos: 'PP Object Sans', 'Archivo', system-ui, sans-serif;
--cuerpo:  'PP Object Sans', 'Archivo', system-ui, sans-serif;
```

- Pesos: 400 para el texto legal del documento, 500 para cuerpo y descripciones, 700 para etiquetas y subtítulos, **900 para todos los títulos y cifras**.
- Títulos con `letter-spacing: -0.04em`; cuerpo normal.
- PP Object Sans no está en Google Fonts. Carga Archivo desde Google Fonts como respaldo y deja PP Object Sans primero en la pila, para que cuando tengamos la fuente servida entre sola. No metas un tercer tipo.

### 2. Color: reemplazo de tokens

El neón de Rappi (`#FF7A4D → #FF2526 → #FF4583`) **se usa siempre como gradiente, nunca como color plano de fondo**. La única excepción son los textos de acento y los anillos de foco, que usan `#FF2526`.

```css
:root {
  --grad-neon: linear-gradient(135deg, #FF7A4D 0%, #FF2526 55%, #FF4583 100%);
  --neon: #FF2526;

  --tinta: #0A0A0A;            /* antes #16181d */
  --gris-lapiz: rgba(10,10,10,.55);  /* antes #5d626d */
  --papel: #FFFFFF;
  --niebla: #F4F5F6;           /* antes #f4f6f8 */
  --borde: rgba(10,10,10,.10); /* antes #e2e6eb */
  --borde-control: rgba(10,10,10,.18);

  --beige:   #FFF0DD;   /* pendientes, huecos, chips */
  --celeste: #D9F1FF;   /* explicaciones y calculadoras */
  --lavanda: #F4F0FC;   /* marca de "Opcional" */

  --r-control: 12px;
  --r-panel: 14px;
  --r-hoja: 16px;
  --r-pill: 9999px;

  --sombra-sm: 0 1px 4px rgba(10,10,10,.08);
  --sombra-md: 0 4px 16px rgba(10,10,10,.10);

  --t-rapido: 200ms;
  --t-destello: 900ms;
}
```

Reglas de uso de la paleta secundaria: un pastel por pieza. Nunca dos pasteles juntos sin el neón presente. Texto negro sobre pastel, blanco sobre gradiente.

`--verde-confirma` y `--rojo-alerta` se quedan **solo** para mensajes de validación de campo. El verde no está en la paleta de marca, así que no lo uses para nada decorativo ni para estados de "publicado" en el historial: ahí va una píldora con el gradiente.

### 3. Componentes

- **Barra superior**: fondo blanco, y una franja de 3px con `--grad-neon` pegada al borde superior de la ventana. Es la firma de marca de la app. El logo de Rappi en PNG a 19px de alto, un divisor de 1px, y "Mind" en peso 900. La versión va en una píldora beige.
- **Navegación**: píldoras. La activa con fondo `--beige` y texto tinta; el resto transparente con texto `--gris-lapiz`. Quita el subrayado de 2px.
- **Botón primario**: `background: var(--grad-neon)`, texto blanco, `border-radius: var(--r-pill)`, peso 700. En hover oscurece el gradiente (no bajes la opacidad). Deshabilitado: gris plano sin gradiente.
- **Botón secundario**: transparente, borde de 1.5px `rgba(10,10,10,.22)`, píldora.
- **Tarjetas de opción**: radio 12px, borde 1.5px `--borde`. Seleccionada: borde `--neon`, fondo `rgba(255,37,38,.045)`, `box-shadow: var(--sombra-md)` y el indicador (radio o casilla) relleno con `--grad-neon`. Transición 200ms ease.
- **Campos**: radio 12px, borde 1.5px. Con valor, el borde pasa a `--neon`. El símbolo de moneda dentro del campo, a la izquierda.
- **Barra de progreso de los 6 pasos**: una barra de 4px por paso. Pasos hechos en tinta, el actual con `--grad-neon`, los pendientes en `rgba(10,10,10,.12)`. La etiqueta debajo, 11.5px, con `text-overflow: ellipsis` para que no se monte.
- **Hoja del documento**: blanca, radio 14px, `--sombra-sm`, cuerpo a 13px con `line-height: 1.7`. Título y subtítulo centrados, en 900.
- **Huecos (`.falta`)**: fondo `--beige`, peso 700, 11.5px, radio 5px, subrayado punteado `1.5px dotted rgba(255,37,38,.6)`, `white-space: nowrap`.
- **Contador de datos faltantes**: píldora beige mientras falte algo; cuando está completo, píldora con `--grad-neon` y texto blanco.
- **Avisos**: quita el borde-izquierda de color. Es un patrón que la marca no usa. Reemplázalo por un panel de radio 14px con fondo `--celeste` (informativo) o `--beige` (pendiente).
- **Pantallas de momento** — inicio, "Tu T&C está listo" y el bloque de azar de Ayuda — llevan un panel grande de radio 20px. El inicio en `--beige` con el bigote de Rappi al 10% de opacidad como marca de agua; el "listo" y el de azar con `--grad-neon` y texto blanco.

### 4. Movimiento

- Entrada de cada pregunta: `opacity 0→1` + `translateY(14px→0)`, 380–600ms, `cubic-bezier(.16,1,.3,1)`.
- Controles interactivos: 200ms ease.
- Destello del dato que acaba de cambiar en el documento: fondo `rgba(255,122,77,.45)` que se apaga a transparente en 900ms. Sin rebote.

## Assets

`assets/logo/rappi-logo.png` y `assets/logo/rappi-bigote.png` van en este bundle. Como el front se sirve por Apps Script, mételos como base64 en el HTML o súbelos a una URL estable de Rappi; no los referencies desde una ruta local del repo.

## Referencia visual

`RappiMind Identidad.dc.html` en este bundle es el prototipo aprobado, navegable, con las 8 pantallas principales. **Es una referencia de diseño, no código para copiar**: está escrito con estilos inline y un runtime de prototipado, y se construyó sobre una foto pasada del DOM, no sobre el código real. Lee de ahí los valores exactos (colores, radios, pesos, tamaños, transiciones) y trasládalos al sistema de variables CSS de `estilos.css`, que es donde viven de verdad.

`RappiMind Logo.dc.html` es la especificación de marca del lockup: corona + Mind + firma **By Legal** en píldora, con construcción, versiones, tamaños, reglas y usos incorrectos.

`README.md` tiene la especificación pantalla por pantalla, con medidas, colores y copy exactos.

## El logo

El lockup elegido es el **original con corona** más la firma **By Legal** en píldora, centrada debajo: logotipo de Rappi, divisor de 1px, "Mind" en Heavy con la corona en gradiente encima, y la píldora centrada respecto al conjunto — su eje cae en el divisor, entre el logotipo y "Mind", no colgada de "Mind". La píldora usa el gradiente y el radio total de los botones de la herramienta, para que la firma se lea como parte del sistema y no como un pie de página.

`RappiMind Logo.dc.html` es la especificación completa: construcción con medidas, las cuatro versiones de fondo, los cuatro tamaños con sus reducciones, las reglas de uso y los usos incorrectos. Es la única referencia de marca; no hay alternativas abiertas.

Reglas duras del lockup:

- El logotipo de Rappi se usa **siempre como asset original**. No se redibuja, no se recolorea, no se le cambia el tracking ni se le aplican sombras. Sobre gradiente y sobre oscuro va en blanco pleno.
- "Mind" va en PP Object Sans Heavy, tracking −0.045em. Nunca en otro peso ni en otra familia, nunca en rojo.
- La corona es **la misma silueta que ya existe en el front** (el `path` de `.marca .corona`), rellena con el gradiente a 135°. Nunca naranja plano, nunca en tinta. Sobre gradiente va blanca; sobre negro conserva el gradiente.
- **By Legal** se escribe con esas mayúsculas y minúsculas. Nunca "BY LEGAL", nunca "by legal". "By" en Medium con tracking .04em, "Legal" en Heavy con tracking .01em, mismo tamaño las dos.
- La firma va dentro de una **píldora de radio total con el gradiente**, texto blanco pleno, padding 6px arriba / 16px a los lados / 7px abajo a 13px de texto. Centrada respecto al lockup completo, a 13px de separación. Sobre fondo de gradiente la píldora **se invierte**: fondo blanco y texto `#FF2526`. Nunca con transparencia ni con esquinas.
- Medidas derivadas, con el logotipo a 38px de alto: gap 14px a cada lado del divisor; divisor de 1px × 34px, tinta al 16% sobre claro y blanco al 55% sobre gradiente; "Mind" a 34px; corona de 22×13px apoyada 3px a la derecha del borde izquierdo de "Mind" y 2px sobre su altura de mayúscula.
- Reducciones: la corona cae por debajo de 20px de "Mind"; la firma cae por debajo de 10px de texto (se omite, nunca se encoge); el mínimo absoluto del lockup es 13px de alto de logotipo.
- La firma **no va en la barra superior de la herramienta** (ahí el contexto ya es de Legal). Sí va en la portada del documento generado, el correo de entrega, presentaciones, el avatar del canal y firmas de correo.
- Fondos válidos: blanco, beige `#FFF0DD`, el gradiente y negro `#0A0A0A`. Sobre los demás pasteles de la paleta in-app, solo la versión sobre claro.
- Área de respeto: el alto del logotipo por cada lado. Nada entra ahí.

Ojo con una cosa: el lockup del bundle está armado con HTML y un SVG inline. Pídeme el archivo SVG limpio en sus cuatro versiones más el favicon antes de implementarlo. Y como el front se sirve por Apps Script, el logotipo va en base64 dentro del HTML o en una URL estable de Rappi; nunca desde una ruta local del repo.

## Cómo quiero que trabajes

1. El inventario de diferencias entre la foto de hoy y el prototipo, como está arriba. Eso primero.
2. Lee `src/client/estilos.css` y `docs/DISENO.md` y dime qué reglas rompe este cambio antes de tocar nada.
3. Propón el nuevo bloque `:root` y espera mi visto bueno.
4. Aplica el resto por secciones de la hoja, en commits separados: tipografía, color, botones y campos, progreso, documento, paneles de momento, lockup.
5. Después de cada sección corre `npm run front` y dime qué pantallas de `FRONT_ACTUAL.html` cambiaron de aspecto — incluidas las que el prototipo no cubría, que son las que más riesgo tienen de quedar a medias.
6. Al final verifica: contraste 4.5:1 en cuerpo, foco visible en todo control, cero clases nuevas en el JS, cero dependencias nuevas, y que el HTML generado siga cargando en Apps Script.

Si en cualquier punto el prototipo y el código real se contradicen, no elijas por tu cuenta: dime qué encontraste y qué recomiendas.
