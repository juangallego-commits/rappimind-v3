# Las respuestas de la revisión del front

Aquí vive, tal cual llegó, lo que Claude chat respondió a cada tanda de
`docs/revision/`. No se resumen, no se editan y no se recortan: son el insumo
del que salen los cambios de la interfaz.

## Cómo se llaman

| Archivo | De qué tanda viene |
|---|---|
| `tanda-1.md` | `tanda-1-la-entrada.md`, las 11 pantallas de la entrada |
| `tanda-2.md` | `tanda-2-cashback.md`, las 18 preguntas del Cashback |
| `tanda-3.md` | `tanda-3-el-cierre.md`, el resumen, la publicación y la ayuda |
| `tanda-4.md` | `tanda-4-otros-tipos.md`, Multitienda, Carrera y 15 minutos |
| `tanda-5.md` | `tanda-5-travel.md`, las 41 preguntas de Rappi Travel |
| `tanda-6.md` | `tanda-6-brasil.md`, Brasil y el portugués |
| `tanda-7.md` | `tanda-7-celular-y-fallas.md`, el celular y los errores |

Si una respuesta llegó en varios mensajes, van todos en el mismo archivo, uno
detrás de otro y en orden. Mejor que sobre a que falte.

## Cómo las sube Juan, sin tocar la terminal

1. En la conversación de Claude chat, copiar la respuesta entera.
2. En GitHub, con el repositorio abierto: **Add file**, luego **Create new file**.
3. Escribir la ruta completa en la casilla del nombre, por ejemplo
   `docs/revision/respuestas/tanda-1.md`. Al escribir las barras, GitHub crea
   las carpetas solo.
4. Pegar, bajar hasta **Commit changes** y confirmar sobre `main`.

Si la respuesta llega en dos o tres tandas, se puede subir la primera y después
editar el archivo con el lápiz para pegar el resto.

## Qué pasa después

Cada respuesta se trabaja en una sesión de Claude Code, con la regla de siempre:
**lo que Claude chat recomiende sin dar el texto exacto no lo redacta Claude
Code.** Si es texto de producto, se propone y lo aprueba Juan. Si es texto
legal, se anota en `docs/PENDIENTES_LEGAL.md` y lo decide Juan.

Los hallazgos vienen con un código (`H-2.07`) y con el texto de hoy copiado
letra por letra, así que se aplican buscando y reemplazando. Un hallazgo cuyo
"Dice hoy" no aparezca literal en el código es un hallazgo que hay que mirar a
mano: casi siempre significa que Claude chat lo parafraseó, y entonces la
propuesta puede estar apuntando a otra cosa.
