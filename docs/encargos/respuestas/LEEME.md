# Las respuestas de Claude chat

Aquí vive, tal cual llegó, lo que Claude chat respondió a cada encargo de
`docs/encargos/`. No se resumen, no se editan y no se recortan: son el insumo
del que salen los cambios, y en el caso del encargo 01 son además el registro
de unas decisiones legales que tomó el dueño legal del producto.

## Cómo se llaman

| Archivo | De qué encargo viene |
|---|---|
| `01-legal.md` | `docs/encargos/01-revision-legal.md`, las 49 preguntas |
| `02-interfaz.md` | `docs/encargos/02-revision-interfaz.md`, las 33 pantallas |
| `03-leyendas.md` | `docs/encargos/03-leyendas.md`, el catálogo de leyendas |

Si una respuesta llegó en varios mensajes, van todos en el mismo archivo, uno
detrás de otro y en orden. Mejor que sobre a que falte.

## Cómo las sube Juan, sin tocar la terminal

1. En la conversación de Claude chat, copiar la respuesta entera.
2. En GitHub, con el repositorio abierto: **Add file**, luego **Create new file**.
3. Escribir la ruta completa en la casilla del nombre, por ejemplo
   `docs/encargos/respuestas/01-legal.md`. Al escribir las barras, GitHub crea
   las carpetas solo.
4. Pegar, bajar hasta **Commit changes** y confirmar sobre `main`.

Si la respuesta llega en dos o tres tandas, se puede subir la primera y después
editar el archivo con el lápiz para pegar el resto.

## Qué pasa después

Cada respuesta se trabaja en su propia sesión de Claude Code. Qué hacer con
cada una está escrito en `docs/PROMPT_SIGUIENTE_SESION.md`, con la regla que las
gobierna a todas: lo que Claude chat recomiende sin dar el texto exacto no lo
redacta Claude Code, se anota en `docs/PENDIENTES_LEGAL.md` y lo decide Juan.

La del encargo 03 no se construye sin hablarlo antes: trae propuestas que no
vienen de ningún playbook ni de ninguna pieza publicada, y esas las aprueba Juan
una por una.
