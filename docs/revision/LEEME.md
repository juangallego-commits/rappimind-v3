# La revisión del front, con Claude chat

Este paquete existe para revisar el front de RappiMind pantalla por pantalla y
caso por caso, con Claude chat, y que lo que salga se pueda aplicar sin volver a
escribirlo a mano.

Generado el 2026-09-21 desde el commit `15c48ac`, con el
texto de 46 pantallas sacado de la aplicación tal como se lee.

## Por qué en tandas y no en un solo archivo

`docs/FRONT_ACTUAL.html` es el front entero en un archivo, y sirve para verlo: se
abre con doble clic y ahí están las 46 pantallas, una debajo de
otra, con los estilos de verdad. Para revisarlo con Claude chat, sin embargo, ese
archivo solo tiene un problema, y es que pesa: unas noventa mil fichas de contexto,
la mitad de las cuales son etiquetas y estilos que no aportan nada a una revisión
de copy. Cabe en una conversación, pero deja poco aire para pensar, y una revisión
de 46 pantallas con poco aire vuelve con quince observaciones
generales en vez de las doscientas concretas que necesitamos.

Por eso el front va partido en 7 tandas. Cada tanda es una
conversación aparte, con su pedazo del producto y nada más, y con toda la ventana
libre para revisar de verdad.

## Las 7 tandas

| # | Archivo | De qué va | Qué trae |
|---|---|---|---|
| 1 | `tanda-1-la-entrada.md` | La entrada: donde el comercial decide si esto le sirve | 11 pantallas, 7 fotos |
| 2 | `tanda-2-cashback.md` | El Cashback, pregunta por pregunta | 18 pantallas, 4 fotos |
| 3 | `tanda-3-el-cierre.md` | El cierre: revisar, generar y publicar | 7 pantallas, 5 fotos |
| 4 | `tanda-4-otros-tipos.md` | Los otros tipos de campaña de Rappi | 3 pantallas, 17 preguntas, 2 fotos |
| 5 | `tanda-5-travel.md` | Rappi Travel: los dos tipos, y las preguntas que nadie ha revisado | 41 preguntas |
| 6 | `tanda-6-brasil.md` | Brasil y la interfaz en portugués | 4 pantallas, 2 preguntas, 1 foto, el diccionario del portugués |
| 7 | `tanda-7-celular-y-fallas.md` | El celular, los errores y los límites | 3 pantallas, 2 fotos, los mensajes de error |

El orden importa: la tanda 1 es la que más devuelve, porque son las pantallas
donde el comercial decide si se queda. Si solo hay tiempo para tres, que sean la
1, la 2 y la 3.

## Cómo se hace cada tanda

1. Abre una **conversación nueva** en Claude chat. Nueva de verdad, una por tanda:
   si se hacen dos en la misma, la segunda hereda el cansancio de la primera.
2. Pega el contenido de **`PROMPT.md`**, desde la línea que dice dónde empieza
   hasta el final. Es el mismo para todas las tandas.
3. Pega debajo el contenido de la tanda, por ejemplo `tanda-1-la-entrada.md`.
   Todo en el mismo mensaje.
4. Adjunta, en ese mismo mensaje, las fotos que la propia tanda te lista. Están
   en `docs/revision/capturas/` y son una por forma de pantalla, nunca más de
   nueve por tanda. Claude chat lee imágenes pero no dibuja HTML, así que son lo
   único que le deja juzgar el aire, la jerarquía y el tamaño de los botones. Si
   no las adjuntas, la revisión igual funciona: el texto va completo en la tanda.
5. Cuando responda, si se quedó a mitad, dile "sigue". Si se quedó sin espacio,
   pídele que continúe en otro mensaje.
6. Copia la respuesta **entera, tal cual**, y guárdala en
   `docs/revision/respuestas/tanda-N.md`. Sin resumir y sin recortar: de ahí salen
   los cambios.

## Cómo subir la respuesta sin tocar la terminal

1. En GitHub, con el repositorio abierto: **Add file**, luego **Create new file**.
2. Escribe la ruta completa en la casilla del nombre, por ejemplo
   `docs/revision/respuestas/tanda-1.md`. Al escribir las barras, GitHub crea las
   carpetas solo.
3. Pega, baja hasta **Commit changes** y confirma.

Si la respuesta llegó en dos o tres tandas de mensajes, van todas en el mismo
archivo, una detrás de otra y en orden. Mejor que sobre a que falte.

## Qué pasa después

Cada respuesta se trabaja en una sesión de Claude Code. La regla que las gobierna
a todas es la de siempre: **lo que Claude chat recomiende sin dar el texto exacto
no lo redacta Claude Code**. Si es texto de producto, se propone y lo apruebas tú.
Si es texto legal, se anota en `docs/PENDIENTES_LEGAL.md` y lo decides tú.

Y una advertencia que vale la pena repetir: Claude chat va a proponer mejoras de
redacción para frases que son legales y no de producto. Esas no se aplican aunque
suenen mejor. El prompt se lo dice, pero conviene mirarlo al revisar la respuesta.

## Cómo se regenera

```
NODE_PATH=/opt/node22/lib/node_modules \
PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers npm run front   # recorre, y deja el texto y las fotos
npm run revision                                          # arma las tandas, sin navegador
```

El primero necesita un navegador y tarda un par de minutos. El segundo es
instantáneo, así que las tandas se pueden reordenar y reescribir sin volver a
recorrer la aplicación.
