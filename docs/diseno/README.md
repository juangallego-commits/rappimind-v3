# Traspaso · RappiAds + identidad RappiMind

Todo lo que faltaba para llevar el sistema de diseño a un repositorio de código.

---

## 1 · Los cuatro archivos de tokens

```
tokens/colors.css        2.2 KB   paleta neón, pasteles in-app, Turbo, Pro, neutros
tokens/fonts.css         0.6 KB   @font-face de PP Object Sans, 4 pesos
tokens/typography.css    2.2 KB   escala tipográfica, pesos, tracking
tokens/spacing.css       1.4 KB   escala de 4px, radios, sombras, dimensiones de formato
tokens/rappimind.css     ~5 KB    AÑADIDO. Capa de aplicación: estados, avisos, campaña
```

Son los que `styles.css` importa, verbatim del design system. `styles.css` va
también aquí para que el conjunto quede completo.

`tokens/rappimind.css` **no** viene del design system: lo escribí para este
traspaso. Cubre lo que el design system no define — estados de control, niveles
de aviso, estados de campaña — y se importa **después** de los otros cuatro.

## 2 · Fuentes

`assets/fonts/`, tal como están en el design system:

| Archivo | Peso | Formato | Tamaño | En base64 |
|---|---|---|---|---|
| PPObjectSans-Regular.otf | 400 | OpenType | **55 KB** | ~73 KB |
| PPObjectSans-Medium.ttf | 500 | TrueType | **162 KB** | ~216 KB |
| PPObjectSans-Bold.otf | 700 | OpenType | **62 KB** | ~82 KB |
| PPObjectSans-Heavy.otf | 900 | OpenType | **62 KB** | ~83 KB |
| **Total** | | | **341 KB** | **~454 KB** |

### Sobre el .woff2 que pediste

**No los tengo en .woff2 y no puedo convertirlos aquí**: la conversión necesita
un compilador de fuentes que no tengo a mano. Lo que sí puedo decirte es que
vale mucho la pena hacerlo, y cuánto vas a ganar.

En OTF/TTF sin comprimir, los cuatro pesos suman 341 KB, y en base64 crecen un
33% hasta ~454 KB incrustados en el HTML. WOFF2 comprime típicamente entre un 40
y un 50% sobre OTF, así que el conjunto debería caer a unos **170–200 KB**, y a
**~230–270 KB** ya en base64.

Dos cosas más antes de convertir:

- **El Medium en TTF pesa 162 KB, casi el triple que los otros tres.** No es que
  tenga más glifos: es que viene sin comprimir mientras los otros son CFF. Es el
  que más gana con la conversión; debería quedar por debajo de 50 KB.
- **Subsetea a latín + latín extendido antes de convertir.** La app es en
  español y portugués. Un subset `latin,latin-ext` recorta otro 30–60% sobre el
  WOFF2 completo. Con eso los cuatro pesos deberían caber en **80–120 KB**
  totales, que ya es razonable para embeber en Apps Script.

Con fonttools instalado:

```bash
pip install fonttools brotli
for f in assets/fonts/PPObjectSans-*.?tf; do
  pyftsubset "$f" \
    --unicodes="U+0000-00FF,U+0100-017F,U+2000-206F,U+20A0-20BF,U+2122" \
    --layout-features="kern,liga" \
    --flavor=woff2 \
    --output-file="${f%.*}.woff2"
done
```

Después actualiza `tokens/fonts.css` para que apunte a `.woff2` con
`format('woff2')`, o a las cadenas base64 si vas a embeber.

Si prefieres no convertir, **la ruta corta es cargar solo Regular y Heavy**
(117 KB, ~156 KB en base64) y dejar que Medium y Bold caigan al sintético del
navegador. Pierdes calidad en el peso 500, que es el del cuerpo de texto, así
que no lo recomiendo salvo que el presupuesto de bytes sea crítico.

## 3 · Logos

```
assets/logo/rappi-logo.png          1584×680   330 KB   original
assets/logo/rappi-logo-440.png       440×189    58 KB   AÑADIDO · para embeber
assets/logo/rappi-logo-220.png       220×94     ~20 KB  AÑADIDO · barra superior
assets/logo/rappi-bigote.png         652×205     68 KB  original
assets/logo/rappi-bigote-400.png     400×126    ~35 KB  AÑADIDO · marca de agua
```

El original de 330 KB es demasiado para base64 en Apps Script: incrustado son
440 KB. En la barra superior el logotipo se usa a 17–19px de alto, así que
`rappi-logo-220.png` sobra y pesa una fracción. Los reducidos los generé yo a
partir del original, conservando la transparencia.

## 4 · Del proyecto de identidad

```
RappiMind Identidad.dc.html   prototipo navegable de las 8 pantallas
RappiMind Logo.dc.html        especificación del lockup
RappiMind Estados.dc.html     AÑADIDO · los estados que faltaban
README-identidad.md           especificación pantalla por pantalla
PROMPT-identidad.md           el prompt de implementación
support.js                    runtime de los .dc.html (necesario para abrirlos)
```

Los tres `.dc.html` necesitan `support.js` al lado y la carpeta `assets/` para
los logos. Son referencia de diseño, no código de producción.

## 5 · El lockup

```
assets/lockup/lockup-blanco.svg      + .png (3×, 711×363)
assets/lockup/lockup-beige.svg       + .png
assets/lockup/lockup-gradiente.svg   + .png
assets/lockup/lockup-oscuro.svg      + .png
assets/lockup/favicon.svg            + .png (256×256)
```

**SVG.** Geometría exacta, gradiente y corona en vectorial, `viewBox="0 0 203 88"`.
El logotipo de Rappi entra por referencia relativa a
`../logo/rappi-logo-440.png`, así que el SVG carga bien insertado inline en HTML
o vía `<object>`. **Dentro de un `<img>` no carga**: el navegador bloquea
recursos externos en SVG-como-imagen. Para ese caso usa el PNG.

**PNG a 3×.** Listos para pegar en cualquier parte, con la tipografía ya
resuelta. Es lo que conviene usar mientras no haya arte final.

### Qué falta para que el SVG sea autosuficiente

Dos cosas que no tengo:

1. **El logotipo de Rappi en vectorial.** Hoy solo existe como PNG en los
   assets. Con el trazado real, el `<image>` desaparece y el SVG pasa a pesar
   unos pocos KB y a funcionar en cualquier contexto.
2. **"Mind" y "By Legal" convertidos a trazos.** Van como `<text>` con
   `font-family: PP Object Sans`, así que dependen de que la fuente esté
   instalada; si no, caen a Archivo y el lockup cambia de forma.

Mientras tanto, los PNG cubren todos los usos reales.

## 6 · Las decisiones de diseño

`DECISIONES.md` responde las tres preguntas concretas y define los seis grupos
de estados, con valores exactos. La referencia visual es
`RappiMind Estados.dc.html`, donde cada estado está renderizado al lado de su valor.

Resumen de las tres respuestas:

**(a) Barra de progreso con 5–9 pasos.** Ni segunda fila ni truncado. Las
etiquetas por paso se caen y el nombre del paso actual queda en la línea que ya
existe encima. Se muestran las etiquetas solo si hay 6 pasos o menos **y** cada
segmento mide 88px o más; si falla cualquiera, se caen todas a la vez.

**(b) Los tres niveles de aviso.** Se distinguen por estructura, no por color de
borde: informativo es panel celeste sin título; serio es panel beige con una
regla de 3px en el borde **superior** y título en caja alta; el error de campo
no lleva panel, vive pegado al campo con borde de 2px en neón y el mensaje
suelto debajo. Un solo pastel por pantalla; si coinciden dos avisos, el de menor
prioridad baja a tarjeta blanca.

**(c) Estados del historial sin verde.** Se ordenan por peso visual:
Publicado lleva gradiente (el único), Generado beige, Borrador gris claro,
Vencido transparente con borde. Cuatro niveles legibles usando solo la paleta de
marca, y el sistema aguanta un quinto estado.

**Un cambio afecta a lo ya entregado:** el campo con valor pasa de borde neón a
borde tinta `#0A0A0A`. El neón queda reservado para el error, porque si "lleno"
y "mal" comparten color no se distinguen. Es el único punto donde la
especificación nueva contradice al prototipo.

---

## Orden de importación

```css
@import url("tokens/fonts.css");
@import url("tokens/colors.css");
@import url("tokens/typography.css");
@import url("tokens/spacing.css");
@import url("tokens/rappimind.css");  /* siempre el último */
```
