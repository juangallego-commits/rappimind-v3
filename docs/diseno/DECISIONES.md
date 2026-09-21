# Decisiones de diseño · estados

Lo que el prototipo de 8 pantallas no cubría. Cada punto es una decisión cerrada
con su valor exacto, para que no haya que inventarla en las 38 pantallas restantes.

La referencia visual es **RappiMind Estados.dc.html**: cada estado está ahí
renderizado y con su valor al lado. Los tokens están en `tokens/rappimind.css`.

---

## Cambio que afecta a lo ya entregado

**El campo con valor pasa de borde neón a borde tinta `#0A0A0A`.**

En el prototipo el campo lleno llevaba borde neón. No funciona: el error también
es neón, así que "lleno" y "mal" se veían igual. El neón queda reservado para el
error. Es el único punto donde la especificación nueva contradice al prototipo.

---

## 1 · Campos

| Estado | Borde | Fondo | Texto | Extra |
|---|---|---|---|---|
| Vacío | 1.5px `rgba(10,10,10,.18)` | `#FFF` | placeholder `#8A8A8A` | — |
| Con valor | 1.5px `#0A0A0A` | `#FFF` | `#0A0A0A` | — |
| Con foco | 1.5px `#0A0A0A` | `#FFF` | `#0A0A0A` | anillo `0 0 0 3px rgba(255,37,38,.30)` |
| Con error | **2px** `#FF2526` | `#FFF` | `#0A0A0A` | mensaje debajo, `#FF2526`, 13.5px/700 |
| Deshabilitado | 1.5px `rgba(10,10,10,.10)` | `#F4F5F6` | `#6B6B6B` | `cursor: not-allowed` |

Radio 12px en todos. El error sube a 2px para que se distinga del borde tinta
del campo lleno sin depender solo del color.

**El deshabilitado nunca se hace con `opacity`.** Bajar la opacidad arrastra el
texto por debajo del contraste mínimo. `#6B6B6B` sobre `#F4F5F6` da 5.3:1.

## 2 · Opciones

| Estado | Fondo | Borde | Indicador |
|---|---|---|---|
| Sin elegir | `#FFF` | 1.5px `rgba(10,10,10,.12)` | círculo 20px, borde `rgba(10,10,10,.28)` |
| Elegida | `rgba(255,37,38,.045)` | 1.5px `#FF2526` | relleno con el gradiente + `inset 0 0 0 4px #fff` |
| Con foco | `#FFF` | 1.5px `rgba(10,10,10,.12)` | anillo `0 0 0 3px rgba(255,37,38,.30)` |
| No disponible | `#F4F5F6` | 1.5px `rgba(10,10,10,.10)` | círculo con borde `rgba(10,10,10,.18)` |

La elegida además lleva `box-shadow: 0 4px 16px rgba(255,37,38,.12)`.
Transición 200ms ease.

**La opción no disponible no se oculta.** Se muestra apagada, con el título en
`#595959`, la nota explicando por qué, y un chip blanco con borde y texto
`#595959` que dice el motivo ("No disponible", "Próximamente"). Ocultarla hace
que el usuario la busque; mostrarla apagada cierra la pregunta.

## 3 · Barra de progreso — respuesta a (a)

**Ni segunda fila ni etiquetas truncadas.** Las etiquetas por paso se caen y el
nombre del paso actual pasa a la línea que ya existe encima
("Paso 7 de 9 · Participantes"). La barra se queda siempre en una fila.

La regla, completa:

> Las etiquetas se muestran si hay **6 pasos o menos** y cada segmento mide
> **88px o más**. Si falla cualquiera de las dos condiciones, se caen **todas a
> la vez**: nunca algunas sí y otras no.

Por qué así:

- La segunda fila rompe la lectura de la barra como una sola pieza y cambia la
  altura del encabezado según el tipo de campaña.
- Truncar produce etiquetas como "Partici…" que no informan y sí ensucian.
- El nombre del paso actual es el único que el usuario necesita en todo momento,
  y ya está en la línea de arriba. Los demás no aportan mientras no estén activos.
- Escala a cualquier N sin tocar nada.

Valores: barra de 4px, radio total, gap 5px.
Paso hecho `#0A0A0A` · actual gradiente · pendiente `rgba(10,10,10,.12)`.
Etiqueta 11.5px, peso 800 en el actual y 600 en el resto.

## 4 · Avisos — respuesta a (b)

Los tres niveles se distinguen por **estructura**, no por color de borde. Cada
uno tiene una forma distinta, así que se reconocen aunque se vean en blanco y
negro, y ninguno necesita más de un pastel.

**Nivel 1 · Informativo.** Panel celeste `#D9F1FF`, radio 12px, padding 16/18px.
Sin título, sin adorno, texto plano 14.5px/500. Explica algo, no pide nada.

**Nivel 2 · Serio.** Panel beige `#FFF0DD`, radio 12px, con una regla de 3px con
el gradiente en el **borde superior** — no en el izquierdo — y un título en caja
alta 11.5px/900 sobre el texto. La regla arriba no es el patrón que prohíbe el
brand book, y el título es lo que le da el peso que el nivel necesita.

**Nivel 3 · Error de campo.** Sin panel y sin fondo. Vive pegado al campo: borde
de 2px en neón y el mensaje suelto debajo, `#FF2526`, 13.5px/700. Que no tenga
panel es justamente lo que lo separa de los otros dos.

**Si coinciden dos en la misma pantalla:** un solo pastel por pantalla. El de
mayor prioridad se queda con su color y el otro baja a tarjeta blanca con texto
tinta. Prioridad: error de campo > serio > informativo.

## 5 · Confirmación

El verde no está en la paleta. La confirmación se dice con el gradiente, que es
el "sí" de la marca, y con texto en tinta.

- **Campo confirmado:** borde tinta + línea debajo con un círculo de 16px relleno
  con el gradiente y un check blanco, seguido del texto en 13.5px/700 tinta.
- **Acción completada:** píldora negra efímera, 3 segundos, con el mismo círculo
  de gradiente. Nunca un panel: la confirmación no debe empujar el layout.

## 6 · La hoja del documento vacía

La hoja vacía **enseña el idioma del documento** antes de que haya datos: se ve
el título real "TÉRMINOS Y CONDICIONES" y los primeros huecos beige, así el
usuario reconoce el hueco cuando aparezca de verdad. Cierra con una línea en
`#595959`: "Responde la primera pregunta y el resto del documento aparece aquí."

- El contador dice **Sin empezar** en píldora `#F4F5F6` con texto `#595959`.
  No es beige: el beige significa "falta algo que ya deberías haber respondido".
- La hoja vacía lleva borde de 1px y **sin sombra**. La sombra entra cuando hay
  contenido real, y ese cambio marca que el documento arrancó.
- Nunca líneas grises de esqueleto. El documento se ve como documento desde el
  primer segundo.

## 7 · Botones

| | Primario | Secundario |
|---|---|---|
| Reposo | gradiente, texto `#FFF`, píldora, 700 | transparente, borde 1.5px `rgba(10,10,10,.22)` |
| Hover | `#E8623A → #D91F20 → #E03A72` | borde `#0A0A0A`, fondo `rgba(10,10,10,.04)` |
| Foco | anillo `0 0 0 2px #fff, 0 0 0 5px rgba(255,37,38,.45)` | igual |
| Activo | el gradiente del hover, sin desplazamiento ni escala | igual |
| Deshabilitado | fondo `#F4F5F6`, texto `#6B6B6B`, `not-allowed` | borde `rgba(10,10,10,.10)`, texto `#6B6B6B` |

El hover del primario **oscurece las tres paradas del gradiente**, no baja la
opacidad. Transición 200ms ease en `background` y `border-color`.

**El foco siempre visible, también con ratón.** Nada de `outline: none`. El
anillo usa neón al 45%, que se ve tanto sobre blanco como sobre beige, y lleva
2px de separación para no confundirse con el borde del propio control.

## 8 · Estados del historial — respuesta a (c)

El verde sale. Los estados se ordenan por **peso visual**, no por color
semántico: cuanto más avanzada la campaña, más presencia tiene la píldora.

| Estado | Píldora | Texto |
|---|---|---|
| Publicado | gradiente | `#FFFFFF` |
| Generado | `#FFF0DD` | `#0A0A0A` |
| Borrador | `#F4F5F6` | `#595959` |
| Vencido | transparente, borde 1.5px `rgba(10,10,10,.20)` | `#595959` |

Publicado es el único con gradiente, y por eso se encuentra de un vistazo en una
lista larga.

**Por qué no basta con cambiar el verde por otro color.** Con cuatro estados y un
solo acento disponible, diferenciarlos por matiz obligaría a inventar colores
fuera de la paleta. Diferenciarlos por peso — gradiente > beige > gris claro >
gris con línea — da cuatro niveles legibles usando solo lo que la marca ya
tiene, y sobrevive a que mañana haya un quinto estado.
