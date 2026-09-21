# Medición de fuentes y del peso servido

Números medidos el 21 de septiembre de 2026 sobre `dist/` recién construido y sobre
los archivos de `docs/diseno/assets/`. Cierra la pregunta abierta de la decisión 99
(`docs/DECISIONES.md`, línea 1257).

Nada de esto es una estimación salvo donde dice explícitamente que lo es.

## 1. Qué se hizo

`pyftsubset` de fonttools 4.65.0, con brotli disponible. El comando es el de
`docs/diseno/README.md`, líneas 61 a 67, sin cambios:

```bash
for f in assets/fonts/PPObjectSans-*.?tf; do
  pyftsubset "$f" \
    --unicodes="U+0000-00FF,U+0100-017F,U+2000-206F,U+20A0-20BF,U+2122" \
    --layout-features="kern,liga" \
    --flavor=woff2 \
    --output-file="${f%.*}.woff2"
done
```

Los cuatro `.woff2` quedaron en `docs/diseno/assets/fonts/`. Los originales siguen
ahí, intactos. No se tocó nada fuera de `docs/diseno/`.

## 2. Los cuatro pesos, medidos

| Peso | Archivo de origen | Formato | Original | woff2 recortado | En base64 | Reducción |
|---|---|---|---|---|---|---|
| 400 Regular | `PPObjectSans-Regular.otf` | OTF, contornos CFF | 56.348 B · 55,0 KiB | 19.892 B · 19,4 KiB | 26.524 B · 25,9 KiB | 64,7% menos |
| 500 Medium | `PPObjectSans-Medium.ttf` | TTF, contornos glyf | 165.572 B · 161,7 KiB | 29.236 B · 28,6 KiB | 38.984 B · 38,1 KiB | 82,3% menos |
| 700 Bold | `PPObjectSans-Bold.otf` | OTF, contornos CFF | 63.064 B · 61,6 KiB | 21.136 B · 20,6 KiB | 28.184 B · 27,5 KiB | 66,5% menos |
| 900 Heavy | `PPObjectSans-Heavy.otf` | OTF, contornos CFF | 63.900 B · 62,4 KiB | 21.692 B · 21,2 KiB | 28.924 B · 28,2 KiB | 66,1% menos |
| **Total** | | | **348.884 B · 340,7 KiB** | **91.956 B · 89,8 KiB** | **122.616 B · 119,7 KiB** | **73,6% menos** |

**El base64 crece exactamente 33,34%** sobre el woff2 (122.616 dividido 91.956).
No es aproximado: es la aritmética de codificar 3 bytes en 4, más el relleno.

El README acertó en sus dos predicciones: el Medium quedó muy por debajo de 50 KB
(28,6 KiB, era el peor con diferencia porque venía sin comprimir) y el conjunto
cayó dentro del rango de 80 a 120 KB que anticipó.

### El base64 no se comprime, y eso es lo que decide todo

| Peso | woff2 crudo | base64 | base64 pasado por gzip |
|---|---|---|---|
| 400 Regular | 19.892 B | 26.524 B | 20.073 B |
| 500 Medium | 29.236 B | 38.984 B | 29.509 B |
| 700 Bold | 21.136 B | 28.184 B | 21.328 B |
| 900 Heavy | 21.692 B | 28.924 B | 21.884 B |
| **Total** | **91.956 B** | **122.616 B** | **92.794 B** |

gzip recupera el sobrecosto del base64 y nada más: queda 0,9% por encima del woff2
crudo. El woff2 ya viene comprimido con brotli por dentro, así que **no hay más
compresión que sacarle**. Los 89,8 KiB de fuente viajan enteros, siempre.

## 3. Qué deja fuera el recorte, verificado contra los textos reales

Cada peso pasó de 487 glifos a 310, y de 443 caracteres mapeados a 309. Los 134 que
se van son cirílico completo, flechas, signos matemáticos, la ligadura ff y
diacríticos sueltos.

Se comparó el subset contra **147 archivos** de `modelos/`, `src/client/`,
`src/core/`, `data/paises.json`, `dist/App.html` y `dist/MotorCliente.html`: 153
caracteres distintos en total, de los cuales **dos no están cubiertos**:

- **U+FEFF**, marca invisible en `src/client/js/68-pantallas.js`. No se dibuja, no
  importa.
- **U+20A1, el símbolo ₡ del colón de Costa Rica**, en `data/paises.json` línea 289.
  Costa Rica está en estado activo. **Tampoco está en el OTF original**, así que no
  es culpa del recorte: PP Object Sans no trae ese símbolo. Hoy tampoco lo trae Lato,
  así que el problema ya existe y no es una regresión del rebrand. Se vería un ₡ en
  otra tipografía en medio de una cifra en las pantallas de Costa Rica.

PP Object Sans tampoco trae `ª` ni `º`, los ordinales del portugués. La aplicación
no los usa hoy en ningún archivo, pero conviene que Legal lo sepa antes de que un
texto de Brasil los incorpore.

## 4. El HTML servido hoy: los 710 KB están desactualizados

`docs/PARA_EL_DISENO.md` línea 156 dice 710 KB. Medido contra `dist/`, construido a
las 17:04 sobre fuentes de las 16:50, o sea al día:

| Pieza | Lo que dice el documento | Medido en `dist/` | Diferencia |
|---|---|---|---|
| `MotorCliente.html` | 533 KB | 629.319 B · 614,6 KiB | +81,6 KiB |
| `App.html` | 155 KB | 214.419 B · 209,4 KiB | +54,4 KiB |
| `Estilos.html` | 21 KB | 22.347 B · 21,8 KiB | +0,8 KiB |
| `Index.html` | 1 KB | 827 B · 0,8 KiB | 0,2 KiB menos |
| **Total** | **710 KB** | **846,5 KiB** | **+136,5 KiB, o sea 19,2% más** |

La página que arma `Index.html` con los tres `incluir` resueltos pesa **866.833 B,
846,5 KiB**. Comprimida con gzip nivel 9 queda en **221.078 B, 215,9 KiB**; con
brotli de calidad 5, en 197.681 B, 193,0 KiB.

O sea que el peso real de partida ya es 19,2% mayor que el que está escrito. Conviene
corregir la sección 7 de `PARA_EL_DISENO.md` en algún momento de esta ronda.

## 5. Cuánto crecería, medido variante por variante

Se insertó el base64 de verdad en la página armada y se volvió a medir. No es regla
de tres.

| Variante | Sin comprimir | Crecimiento | Con gzip | Crecimiento |
|---|---|---|---|---|
| Hoy, sin tocar nada | 846,5 KiB | | 215,9 KiB | |
| Los 4 pesos | 966,4 KiB | +14,16% | 308,5 KiB | **+42,88%** |
| Los 4 pesos más `rappi-logo-220.png` | 1.002,4 KiB | +18,41% | 331,8 KiB | **+53,69%** |
| 3 pesos, 500 700 900 | 940,4 KiB | +11,10% | 288,2 KiB | +33,49% |
| 2 pesos, 500 900 | 912,9 KiB | +7,84% | 267,8 KiB | +24,02% |
| Solo el 900 Heavy | 874,8 KiB | +3,34% | 238,4 KiB | **+10,42%** |
| Solo el logo, sin fuentes | 882,6 KiB | +4,26% | 240,6 KiB | +11,45% |

**La columna que manda es la comprimida.** Sin comprimir, los 119,7 KiB de fuente se
pierden dentro de 846 KiB y parecen un 14%. Comprimida, la aplicación de hoy baja a
215,9 KiB porque es JavaScript repetitivo y gzip lo aplasta cuatro a uno, mientras
que la fuente no baja nada. Sobre lo que de verdad viaja, la familia completa **es un
43% más de descarga en cada carga**, y con el logo un 54%.

Traducido a segundos, esto sí es aritmética, no medición: a 400 kbps, que es una
señal mala de verdad, la carga pasa de 4,42 a 6,80 segundos con los cuatro pesos y
el logo. A 1,5 Mbps, de 1,18 a 1,81 segundos.

### Lo que no se pudo medir desde aquí

No tengo forma de comprobar con qué cabeceras responde el despliegue real de Apps
Script, porque esta ronda no despliega. Las cifras comprimidas asumen gzip, que es lo
que sirve la infraestructura de Google para HTML. Si sirviera brotli, el HTML de hoy
bajaría algo más y **el base64 seguiría igual**, con lo cual el porcentaje de
crecimiento sería todavía peor, no mejor.

Lo que sí es propiedad conocida de Apps Script y sostiene toda la recomendación: el
HTML lo genera `doGet` en cada petición, no es un archivo estático y no se cachea. Los
119,7 KiB de base64 se pagan **cada vez que un comercial abre la herramienta**, todos
los días.

## 6. Logos y lockup en base64

| Archivo | Original | En base64 | base64 con gzip |
|---|---|---|---|
| `logo/rappi-logo-220.png` | 27.653 B · 27,0 KiB | **36.872 B · 36,0 KiB** | 24.052 B |
| `logo/rappi-logo-440.png` | 64.842 B · 63,3 KiB | 86.456 B · 84,4 KiB | 61.479 B |
| `logo/rappi-logo.png` | 337.856 B · 330,0 KiB | 450.476 B · 439,9 KiB | 339.177 B |
| `logo/rappi-bigote-400.png` | 51.705 B · 50,5 KiB | 68.940 B · 67,3 KiB | 48.280 B |
| `lockup/favicon.svg` | 8.428 B · 8,2 KiB | 11.240 B · 11,0 KiB | |
| `lockup/favicon.png` | 55.500 B · 54,2 KiB | 74.000 B · 72,3 KiB | |
| `lockup/lockup-blanco.svg` | 9.581 B · 9,4 KiB | 12.776 B · 12,5 KiB | |
| `lockup/lockup-gradiente.svg` | 9.603 B · 9,4 KiB | 12.804 B · 12,5 KiB | |
| `lockup/lockup-oscuro.svg` | 9.606 B · 9,4 KiB | 12.808 B · 12,5 KiB | |

Notas medidas:

- El logo de 220 px cuesta **+11,45% de la descarga comprimida** él solo, más que
  cualquier peso de fuente individual. Un PNG ya está comprimido, así que se comporta
  igual que el woff2: gzip no le saca nada.
- **Los SVG del lockup son la ganga de todo el paquete.** 12,5 KiB en base64, y
  además son texto, así que gzip sí los comprime. Si el lockup puede ir en SVG en vez
  de PNG, el logo de 36,0 KiB deja de hacer falta. La advertencia del README, líneas
  117 a 121, es que el SVG del lockup referencia `../logo/rappi-logo-440.png` por ruta
  relativa y no carga dentro de un `<img>`. Insertado en línea en el HTML sí funciona,
  que es justamente como tendría que entrar aquí, pero entonces habría que resolver
  esa referencia al PNG.
- El favicon en SVG cuesta 11,0 KiB y en PNG 72,3 KiB. Si se pone favicon, que sea el
  SVG.

## 7. Las dos alternativas, también medidas

No son estimaciones: se descargaron los archivos de Google Fonts y se pesaron.

### Lo que la aplicación descarga hoy

`src/client/Index.html` línea 11 pide Lato 400 y 700 más Poppins 500 y 600. Son cuatro
archivos estáticos distintos por subconjunto:

| Familia y peso | latin | latin-ext |
|---|---|---|
| Lato 400 | 23.580 B | 5.612 B |
| Lato 700 | 23.040 B | 5.552 B |
| Poppins 500 | 7.748 B | 5.484 B |
| Poppins 600 | 8.000 B | 5.524 B |
| **Total** | **62.368 B · 60,9 KiB** | 22.172 B · 21,7 KiB |

El navegador solo pide `latin-ext` si la página usa caracteres de ese rango. Se revisó:
de los 153 caracteres que aparecen en los textos de la aplicación, **el único fuera del
rango latin es el ₡ de Costa Rica**. O sea que hoy se descargan 60,9 KiB de fuente, y
los 21,7 KiB de latin-ext solo en las pantallas de Costa Rica.

Cabeceras medidas en `fonts.gstatic.com`: `cache-control: public, max-age=31536000`,
un año. El CSS de `fonts.googleapis.com`: `private, max-age=86400`, un día.
**Esos 60,9 KiB se pagan una vez por navegador, no en cada carga.**

### Archivo, el respaldo que propone la decisión 99

Archivo está en Google Fonts como **fuente variable**: los cuatro pesos 400, 500, 700
y 900 salen del mismo archivo. Se comprobó por hash, los cuatro `@font-face` apuntan a
la misma URL.

| Subconjunto | Tamaño | Lo necesita la aplicación |
|---|---|---|
| latin | 34.928 B · 34,1 KiB | sí, siempre |
| latin-ext | 32.608 B · 31,8 KiB | solo por el ₡ de Costa Rica |

**Archivo con los cuatro pesos cuesta 34,1 KiB**, contra los 60,9 KiB que cuesta hoy
la pareja Lato más Poppins. Cambiar a Archivo **aligera la carga actual en 26,8 KiB**,
no la encarece. Y su `latin-ext` sí trae el U+20A1, o sea que de paso arregla el ₡ de
Costa Rica, cosa que PP Object Sans no puede hacer porque no tiene ese glifo.

## 8. Recomendación para la decisión 99

### El criterio, antes de la conclusión

1. **Lo que cuenta es el byte comprimido por carga, no el byte en disco.** Apps Script
   genera el HTML en cada petición y no lo cachea. Google Fonts entrega sus archivos
   con un año de caché, medido. Un kilobyte embebido en el HTML se paga todos los días;
   un kilobyte en Google Fonts se paga una vez.
2. **El base64 es la única parte de la carga que no se puede comprimir.** El resto de
   la aplicación baja cuatro a uno con gzip. La fuente no baja. Por eso pesa el triple
   de lo que parece en la tabla sin comprimir.
3. **La marca se reconoce en el peso Heavy, no en el cuerpo de texto.** En el prototipo
   `RappiMind Estados.dc.html` los pesos aparecen 107 veces el 500, 101 veces el 900,
   55 veces el 800, 42 veces el 700 y 9 veces el 600. El 900 es el de los titulares, el
   display y el lockup: es donde un comercial ve que esto es Rappi. El 500 a 17 px es
   cuerpo de texto, y ahí nadie distingue Object Sans de Archivo.
4. **La carga ya era el problema antes de tocar la tipografía.** `PARA_EL_DISENO.md`
   sección 7 lo dice, y además va a crecer: el catálogo de leyendas son 32 KB solo con
   Colombia y faltan ocho países. Un cambio de piel no debería ser lo que empeora eso.

### Lo que recomiendo: un subconjunto de un solo peso

**Embeber solo PP Object Sans Heavy 900 en base64, y tomar 400, 500 y 700 de Archivo
desde Google Fonts, con PP Object Sans primero en la pila para los cuatro.**

Lo que cuesta, todo medido:

| | HTML comprimido | Fuentes externas | Primera visita | Visitas siguientes |
|---|---|---|---|---|
| Hoy, Lato más Poppins | 215,9 KiB | 60,9 KiB | 276,8 KiB | 215,9 KiB |
| **Recomendado, Heavy embebido más Archivo** | 238,4 KiB | 34,1 KiB | **272,5 KiB** | 238,4 KiB |
| Familia completa embebida | 308,5 KiB | 0 | 308,5 KiB | 308,5 KiB |
| Solo Archivo, sin embeber nada | 215,9 KiB | 34,1 KiB | 250,0 KiB | 215,9 KiB |

En la primera visita **la opción recomendada pesa 4,3 KiB menos que la aplicación de
hoy**. En las siguientes cuesta 22,5 KiB más por carga, un 10,4%, y a cambio todos los
titulares, el display y el lockup salen en la tipografía real de la marca.

La familia completa cuesta 92,6 KiB comprimidos en cada carga, un 42,9% más de
descarga, para siempre, y lo que compra con esos 70 KiB adicionales es que el cuerpo
de texto a 17 px sea Object Sans en vez de Archivo. Ese es el intercambio, dicho con
números: **70 KiB por carga a cambio de una diferencia que el comercial no va a ver**.

Si Juan decide que la marca manda sobre los bytes, la familia completa está lista y
medida y no hay nada que reprocharle a la decisión: solo hay que asumir que la
aplicación pasa de 215,9 a 308,5 KiB comprimidos por carga.

Si decide lo contrario, la ruta de solo Archivo es la más liviana de las tres y además
arregla el ₡ de Costa Rica.

Lo que **no** recomiendo es el punto intermedio de dos o tres pesos embebidos. Si falta
el 700, el navegador resuelve una petición de 700 hacia arriba y usa el 900, con lo
cual el botón primario de la decisión 98, que va a 19 px en peso 700, saldría en
Heavy y el cálculo de contraste de esa decisión dejaría de valer. Y si falta el 400,
se resuelve hacia el 500, que es inofensivo pero ahorra apenas 25,9 KiB. Los escalones
intermedios pagan casi todo el precio sin quedarse con todo el beneficio.

## 9. Tres cosas que necesito que resuelva Juan

1. **La licencia.** El bundle de `docs/diseno/` no trae archivo de licencia. Los
   metadatos del OTF dicen "Copyright (c) 2018 by Alexander Slobzheninov" y "Object
   Sans is a trademark of Alexander Slobzheninov". Embeber en base64 pone el archivo
   de fuente completo dentro del código de la página, de donde cualquiera que abra la
   herramienta lo puede extraer en un minuto. Que la aplicación sea interna y esté
   detrás del login de Google ayuda, pero la licencia de escritorio de una tipografía
   comercial no suele cubrir la incrustación web. Esto es de Legal y Juan es Legal.
2. **El ₡ de Costa Rica.** PP Object Sans no lo tiene y Lato tampoco, o sea que hoy ya
   se ve en otra tipografía dentro de la cifra. Con Archivo se arreglaría solo, al
   costo de descargar también `latin-ext`, 31,8 KiB, en las pantallas de Costa Rica.
   Con PP Object Sans no tiene arreglo posible sin editar la fuente.
3. **Los 710 KB de `PARA_EL_DISENO.md` línea 156 están desactualizados.** El número
   real hoy es 846,5 KiB. No lo corregí porque ese archivo no es mío en esta ronda.

## 10. Cómo reproducir cualquier número de aquí

```bash
which pyftsubset                                   # /usr/local/bin/pyftsubset
ls -l docs/diseno/assets/fonts/*.woff2             # los cuatro pesos recortados
base64 -w0 docs/diseno/assets/fonts/PPObjectSans-Medium.woff2 | wc -c   # 38984
base64 -w0 docs/diseno/assets/logo/rappi-logo-220.png | wc -c           # 36872
for f in dist/MotorCliente.html dist/App.html dist/Estilos.html dist/Index.html; do
  stat -c '%n %s' "$f"; done
```

El armado de la página servida y las variantes con base64 insertado se midieron con
un script de un solo uso en el scratchpad, resolviendo los tres `incluir` de
`dist/Index.html` y comprimiendo el resultado con gzip nivel 9.
