# Medición del logotipo Rappi para la barra superior

Medido el 21 de septiembre de 2026 sobre `docs/diseno/assets/logo/` y sobre el
`dist/` construido a las 21:20. Cierra lo que pide el agente ASSET de la ronda 2:
dejar el logotipo lo más liviano posible y medirlo.

Todo lo que aparece como número está medido con `stat -c%s`, con
`base64 -w0 archivo | wc -c` y con `gzip -9`. Donde algo es deducido, lo dice.

## 0. La respuesta corta

**Archivo elegido: `docs/diseno/assets/logo/rappi-logo-web-224.png`.**

| | Hoy, `rappi-logo-220.png` | Elegido, `rappi-logo-web-224.png` |
|---|---|---|
| Dimensiones | 220 x 94 | 224 x 96 |
| Formato | PNG 8 bits por canal, RGBA | PNG de paleta, 82 entradas, con `tRNS` |
| En disco | 27.653 B, 27,00 KiB | **4.271 B, 4,17 KiB** |
| **En base64** | 36.872 B, **36,00 KiB** | **5.696 B, 5,56 KiB** |
| base64 pasado por gzip | 24.052 B | 4.302 B |
| Lo que le suma a la página comprimida | **+10,10%** | **+2,13%** |

**84,6% menos de base64** con la misma resolución, y sin diferencia visible a los
tamaños en que se va a usar. Verificado con los ojos, sección 6.

## 1. Los tres PNG de origen

Medidos con Pillow 12.3.0, instalado con `pip install pillow` como indicaba el encargo.

| Archivo | Dimensiones | Modo | Alfa | Colores RGBA distintos | Niveles de alfa | En disco |
|---|---|---|---|---|---|---|
| `rappi-logo.png` | 1584 x 680 | RGBA 8 bits | sí, 53,39% de los píxeles son transparentes puros | 2.172 | 23 | 337.856 B, 329,93 KiB |
| `rappi-logo-440.png` | 440 x 189 | RGBA 8 bits | sí | 4.282 | 256 | 64.842 B, 63,32 KiB |
| `rappi-logo-220.png` | 220 x 94 | RGBA 8 bits | sí | 2.547 | 255 | 27.653 B, 27,00 KiB |

Los tres son el mismo dibujo. Los dos pequeños son reducciones del grande, y por eso
tienen más colores distintos que el original: el remuestreo inventa tonos intermedios.
El de 1584 tiene solo 23 niveles de alfa porque viene del vector, con el borde apenas
suavizado.

Ninguno está optimizado: los tres guardan los cuatro canales a 8 bits aunque el
dibujo no los necesite. Ahí está toda la grasa.

### El dibujo es un degradado lineal, y eso importa

Ajustando el color de los 491.205 píxeles opacos del original contra su posición:

- El canal rojo vale 255 en todos, siempre.
- Verde y azul son función lineal de `x` e `y`: **error medio de 0,95 sobre 255, error
  máximo de 12,6**. O sea que es un degradado lineal ligeramente inclinado.
- Las esquinas del degradado son, redondeando: arriba a la izquierda `#FF4A18`,
  arriba a la derecha `#FF044C`, abajo a la izquierda `#FF6802`, abajo a la derecha
  `#FF2235`.

Esto explica por qué la paleta funciona tan bien (el dibujo tiene muy poca
información de color) y también abre la alternativa de la sección 5.

## 2. Qué resolución hace falta de verdad

La barra superior lo va a mostrar a unos 19px de alto. El panel de inicio, quizá más.
El ancho sale de la proporción del original, 1584 dividido 680, que es 2,3294:

| Alto en CSS | 1x | 2x | 3x |
|---|---|---|---|
| 19px, la barra | 45 x 19 | 90 x 38 | 134 x 57 |
| 38px, el panel | 89 x 38 | 178 x 76 | 266 x 114 |
| 48px | 112 x 48 | 224 x 96 | 336 x 144 |

**224 x 96 cubre 48px a doble densidad y 32px a triple.** Es la medida elegida.
Su proporción es 2,3333, que se desvía 0,17% de la del original: a 19px de alto
son 0,07px de ancho, invisible.

## 3. Cada paso, medido

Todo partiendo de `rappi-logo.png` de 1584 x 680, reducido con Lanczos, guardado con
`optimize=True` y pasado después por oxipng nivel 6 con `strip=safe` (`pip install
pyoxipng`). La columna que manda es la de base64, que es como viaja dentro del HTML
de Apps Script.

| Variante a 224 x 96 | En disco | En base64 | PSNR contra el remuestreo exacto |
|---|---|---|---|
| RGBA 8 bits, sin cuantizar | 16.628 B | 22.172 B, 21,65 KiB | referencia |
| Aplanado sobre blanco, paleta 256, sin alfa | 9.015 B | 12.020 B, 11,74 KiB | |
| Paleta adaptativa 256 con alfa | **4.271 B** | **5.696 B, 5,56 KiB** | 38,6 dB |
| Paleta adaptativa 64 con alfa | 4.164 B | 5.552 B, 5,42 KiB | 38,3 dB |
| Paleta adaptativa 32 con alfa | 3.680 B | 4.908 B, 4,79 KiB | 35,9 dB |
| WebP sin pérdida | 13.528 B | 18.040 B, 17,62 KiB | |
| WebP calidad 90 | 10.250 B | 13.668 B, 13,35 KiB | |
| WebP calidad 80 | 8.932 B | 11.912 B, 11,63 KiB | |
| WebP calidad 70 | 8.274 B | 11.032 B, 10,77 KiB | |

Tres cosas que salieron al revés de lo esperado y conviene dejar escritas:

1. **Aplanar sobre blanco es peor que conservar el alfa**, más del doble de peso.
   Suena contradictorio, pero el 53,39% de los píxeles son transparentes puros y con
   alfa colapsan todos al mismo índice de paleta, que el filtro de PNG comprime casi
   a nada. Aplanados sobre blanco siguen siendo un color más que codificar.
2. **Bajar de 256 a 64 colores casi no ahorra**, 107 B en disco. La razón es que el
   cuantizador octree de Pillow se queda en **82 entradas** aunque le pidan 256, así
   que pedir 256 y pedir 128 dan exactamente el mismo archivo. Pedir 64 obliga a
   recortar de verdad y apenas gana peso a cambio de perder calidad. Se eligió 256.
3. **La paleta con alfa tampoco mejora con trama ni con k medias.** El octree de
   Pillow ignora los parámetros `dither` y `kmeans`, comprobado: los tres archivos
   salen byte a byte iguales. Se probó también una paleta propia con k medias de
   131 colores: sube a 43,1 dB pero cuesta 9.024 B en base64, un 58% más.

**WebP pierde por goleada.** Su mejor versión sin pérdida pesa **más del triple** que
el PNG de paleta, y hasta con pérdida de calidad 70 sigue pesando el doble. WebP está
pensado para fotografía, y esto es un dibujo plano con grandes zonas del mismo color,
que es justo donde el PNG con paleta gana.

Sobre si el navegador lo aguantaría, que es la otra mitad de la pregunta: la aplicación
de Apps Script se abre dentro de un iframe del navegador normal del comercial, así que
WebP funcionaría sin respaldo en cualquier Chrome, Edge, Safari o Firefox de los
últimos cinco años. **Pero da igual, porque aquí WebP es más pesado.** No hay que
decidir nada sobre respaldos.

### Qué se le quitó al archivo

El elegido tiene exactamente cinco trozos: `IHDR`, `PLTE` de 246 B, `tRNS` de 82 B,
`IDAT` de 3.862 B e `IEND`. El original traía además `pHYs`, `sRGB`, `gAMA` y un
`tEXt` con "Software". Quitar `sRGB` y `gAMA` **no corrió el color**: se comprobó
poniendo el original y el elegido uno encima del otro en Chrome, sección 6.

## 4. Lo que le cuesta a la página, medido sobre el dist de hoy

No es regla de tres. Se armó `dist/Index.html` resolviendo los tres `incluir` y se le
insertó el base64 de verdad.

| | Sin comprimir | Con gzip nivel 9 |
|---|---|---|
| La página de hoy | 908.671 B, 887,4 KiB | 246.169 B, 240,4 KiB |
| Con `rappi-logo-220.png` incrustado | 945.609 B, +4,07% | 271.037 B, **+10,10%** |
| Con `rappi-logo-web-224.png` incrustado | 914.433 B, +0,63% | 251.404 B, **+2,13%** |

La columna comprimida es la que manda, por lo mismo que decía
`MEDICION_FUENTES.md` sección 5: la aplicación es JavaScript repetitivo que gzip
aplasta cuatro a uno, mientras que el base64 de una imagen ya comprimida no baja nada.

El agente ASSETS de la ronda 1 midió +11,45% para el logo de 220 sobre la página de
entonces. Hoy da +10,10% sobre la misma imagen, porque la página de partida creció
(ahora incrusta PP Object Sans Heavy). Es el mismo resultado, medido sobre una base
distinta.

**La ganancia real: el logotipo pasa de costar más que cualquier peso de tipografía
a costar menos de la quinta parte de lo que costaba.**

## 5. La alternativa que no se eligió, con sus números

Como el color es un degradado lineal casi exacto (sección 1), se puede guardar **solo
la silueta** como máscara en gris de 8 bits y pintar el degradado desde CSS con
`linear-gradient` más `mask-image`. Medido:

| | En disco | En base64 |
|---|---|---|
| Máscara gris 8 bits, 224 x 96 | 5.528 B | 7.372 B, 7,20 KiB |
| Máscara reducida a 16 niveles, 224 x 96 | 2.569 B | 3.428 B, 3,35 KiB |

Ventajas reales: el degradado sale perfecto, sin el escalonado de la sección 6, y
recolorear el logotipo en blanco para un fondo oscuro sería una línea de CSS en vez de
un segundo archivo.

**No se eligió, por dos razones.** La máscara de 8 bits pesa 1,64 KiB más en base64
que el PNG de paleta, o sea que ni siquiera gana en peso salvo que se recorte a 16
niveles, y con 16 niveles el borde suavizado se escalona. Y sobre todo, si
`mask-image` fallara el logotipo desaparecería del todo, sin degradación elegante,
mientras que un `<img>` no tiene manera de fallar. Queda anotada por si algún día
hace falta el logotipo grande de verdad o en blanco.

## 6. La comprobación visual

Hecha con Playwright sobre Chromium, cargando los archivos reales en una página y
capturando el elemento `<img>` a densidad 1x y 2x.

**Lo que se ve:**

- **A 19px de alto, que es la barra, y a 38px, que es el panel: el elegido y el
  original son indistinguibles.** Se montó una barra superior de mentira con el fondo
  blanco real (`--rm-papel: #FFFFFF`, `docs/diseno/tokens/rappimind.css` línea 11), el
  divisor y la palabra Mind, una barra con cada versión, a 1x y a 2x. No se distinguen
  en ninguna de las cuatro capturas.
- **Ampliando 8 veces la captura de 19px a 2x**, tampoco: los bordes van píxel a píxel
  igual que el original.

**Dónde está el punto en que sí se nota**, que es lo que pedía el encargo:

| Alto en CSS | Qué se ve en el elegido |
|---|---|
| 19px | idéntico al original |
| 38px | idéntico al original |
| 56px | empiezan a insinuarse las bandas del degradado, hay que buscarlas |
| 80px | **las bandas se ven**, franjas diagonales sobre los trazos |

El límite práctico está **entre 48 y 56px de alto en CSS**. Por encima de eso, el
defecto no es la resolución sino la paleta: se reprodujo el mismo ensayo a 298 x 128 y
a 373 x 160 y las bandas siguen igual de visibles, porque vienen de tener 82 colores,
no de tener pocos píxeles. Para un logotipo de portada grande habría que volver al
RGBA sin cuantizar (22,17 KiB en base64, que todavía es un 40% menos que el
`rappi-logo-220.png` de hoy) o usar la máscara de la sección 5.

Medido, para acompañar lo que se ve: contra el original renderizado a 38px y 2x, el
elegido tiene diferencia máxima de 72 sobre 255 y solo **652 píxeles de 13.528, un
4,8%,** se apartan más de 16 niveles. El `rappi-logo-220.png` de hoy tiene 363
píxeles por encima de ese umbral, todos en el borde; los del elegido están repartidos
en las bandas del interior.

## 7. Cómo usarlo

```html
<img src="rappi-logo-web-224.png" alt="Rappi" width="44" height="19">
```

Conviene declarar las dos medidas para que no salte la maqueta mientras carga. A 19px
de alto el ancho natural es 44,33px. A otro tamaño, el ancho es el alto por 2,3333.

Va sobre el fondo blanco de la barra, sin filtros: `--rm-papel` es `#FFFFFF` y la
aplicación no tiene modo oscuro (se buscó `prefers-color-scheme` en
`src/client/estilos.css` y en `docs/diseno/tokens/`, no hay ninguno). Si algún día lo
hubiera, **no hace falta un segundo archivo**: los SVG del lockup ya resuelven el
logotipo en blanco con un `feColorMatrix`, y en CSS el equivalente sería
`filter: brightness(0) invert(1)`. Eso último es deducido, no está probado aquí.

`rappi-logo-220.png`, `rappi-logo-440.png` y `rappi-logo.png` se quedan donde están:
los SVG del lockup referencian el de 440 y el de 1584 es el maestro del que sale todo.

### Nota del 21 de septiembre, al montarlo de verdad

Dos cosas cambiaron respecto de lo que dice arriba, y las dos por razones que
salieron después de medir.

**El alto final es 24px, no 19.** Lo manda el manual del lockup: por debajo de 20px
de "Mind" la corona se cae, y "Mind" mide el 89% del alto del logotipo. A 19px de
logotipo, "Mind" quedaría en 17px. Está en la decisión 118. Todas las mediciones de
peso siguen valiendo: es el mismo archivo, y 224 x 96 cubre 24px hasta densidad 4x.

**Y no entra como `<img>`, sino como `background-image` de un `span`.** El ejemplo
de arriba es correcto en HTML normal y equivocado aquí. `scripts/lib/hoja-completa.js`
incrusta en base64 las `url()` de la hoja de estilos, no los `src` del HTML: un
`<img src="assets/logo/...">` apuntaría a una ruta del repositorio que del lado de
Apps Script no existe, y el logotipo desaparecería sin que nada fallara. Es la
frontera 2 de la skill `frontera-apps-script`, con el mismo modo de falla de siempre.

Como `background-image` no hace falta declarar `alt`: el nombre accesible lo pone
`aria-label="RappiMind"` en el contenedor `.marca`, que es lo que se lee, y las tres
piezas de dentro van `aria-hidden`. Y el alto y el ancho quedan fijos en la regla
(`56px x 24px`), así que tampoco salta la maqueta.
