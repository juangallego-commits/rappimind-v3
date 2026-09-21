# Auditoría de contraste de la paleta nueva

Medida contra WCAG 2.1 el 21 de septiembre de 2026, sobre los valores reales de
`docs/diseno/tokens/`.

Se reproduce con `npm run contraste`. El script lee los tokens, así que aquí no
hay ningún número escrito a mano: si un token cambia, la medición cambia con él.
Lo único escrito a mano es qué va encima de qué, que eso no se puede deducir de
un archivo de tokens.

**De veintiocho pares medidos, veintitrés llegan.** Cuatro no llegan y están
exentos por razones que el script explica. **Seis hay que arreglar.**

---

## Los seis que hay que arreglar

### 1. El anillo de foco. Este es el grave

`--rm-anillo` usa `rgba(255,37,38,.45)`, que compuesto sobre papel da **1.99:1**.
`--rm-anillo-campo` usa `.30` y da **1.57:1**. WCAG pide 3:1 para un indicador de
foco, medido contra lo que tiene al lado.

Importa más que los otros cinco por dos razones. La primera es que el foco
visible es lo que permite recorrer la aplicación con el teclado, y la segunda es
que `docs/PARA_EL_DISENO.md` lo lista entre lo que no se puede tocar. El anillo
de hoy es `3px solid var(--naranja-marca)`, o sea `#FF441F`, que da 3.44:1 y sí
cumple. Bajarlo a 1.99 sería una regresión sobre algo que ya estaba bien.

> **Arreglo: el neón sólido.** `#FF2526` da **3.79:1**, mejor que el de hoy. Si se
> quiere conservar la forma de halo suave, el alfa mínimo que llega a 3:1 es
> **.75**, no .45.

### 2. El mensaje de error

`--rm-aviso-error-color` es `#FF2526` y da **3.79:1** sobre papel, **3.47:1**
sobre niebla. Va a 13.5px en peso 700, y el umbral de texto grande de WCAG
empieza en 18.66px en negrita, así que le toca 4.5:1.

> **Arreglo: `#D91F20`.** Es el mismo neón al 85% de brillo. Da **5.04:1** sobre
> papel y **4.53:1** sobre niebla. A ojo se lee como el mismo rojo.
>
> El `#FF2526` se queda para el borde del campo en error y para el anillo, donde
> el mínimo es 3:1 y lo pasa. Hacen falta dos tokens: `--rm-neon` para lo que no
> lleva texto y `--rm-neon-texto` para lo que sí. Es el mismo patrón que hoy
> tienen `--naranja-marca` y `--naranja-accion`.

### 3. El texto del marcador de posición

`--rm-placeholder` es `#8A8A8A` y da **3.45:1** sobre papel y **3.16:1** sobre
niebla. Un marcador de posición es texto y le toca 4.5:1.

> **Arreglo: `#707070`.** Da 4.95:1 sobre papel y 4.54:1 sobre niebla, que son los
> dos fondos donde aparece.

### 4. El borde del campo vacío

`--rm-campo-vacio` apunta a `--rm-borde-control`, que es `rgba(10,10,10,.18)` y da
**1.5:1**. WCAG pide 3:1 para el contorno de un control, que es lo que le dice a
alguien dónde empieza y dónde termina un campo.

> **Arreglo: subir el alfa a `.44`**, que da 3.07:1 sobre papel y 3.01:1 sobre
> niebla. Es un cambio visible: los campos se van a ver bastante más marcados que
> en el prototipo.
>
> La alternativa, si ese peso visual no gusta, es darle al campo un fondo que lo
> separe de la página por sí solo y dejar el borde como adorno. Esa decisión es
> de diseño, no técnica.

### 5. El subrayado punteado del hueco

`--rm-hueco-subrayado` usa `rgba(255,37,38,.6)` sobre beige y da **2.32:1**. Es la
señal de que falta un dato, o sea lo que sostiene la promesa central del producto.

> **Arreglo: alfa `.84`**, que da 3.03:1. O el `#D91F20` sólido del punto 2, que
> da 4.5:1 y reutiliza un token que de todos modos hay que crear.

### 6. El texto secundario del design system

`--color-muted` es `rgba(10,10,10,.55)` y da **4.42:1** sobre papel. No llega por
poco, pero no llega.

> **Arreglo: `.57`**, que pasa sobre los cinco fondos de la paleta. A ojo no se
> nota.
>
> Ojo: `rappimind.css` ya define `--rm-texto-2` en `#595959`, que da 7:1 y sí
> cumple. Si la interfaz usa siempre el token de RappiMind y nunca el del design
> system, este punto no aplica. Hay que verificarlo al hacer el mapeo de tokens,
> no darlo por sentado.

---

## Los cuatro que no llegan y están bien así

El script los marca como `nota`, no como falla, y explica cada uno:

| Par | Razón | Por qué se acepta |
|---|---|---|
| Blanco sobre el gradiente al 0% | 2.58:1 | La decisión 80 recorta el gradiente del botón al 17%, así que esa parada no lleva texto encima |
| Borde del control deshabilitado | 1.23:1 | WCAG exime explícitamente los componentes inactivos |
| Barra del paso pendiente | 1.3:1 | Es el carril vacío de la barra. Lo que comunica el avance es el paso hecho, el actual y la línea de texto de encima |
| Borde de la píldora de "Vencido" | 1.57:1 | Es una etiqueta, no un control, y su significado lo carga su propio texto |

---

## Dos comentarios de `rappimind.css` que hay que corregir

No cambian ninguna decisión, pero si alguien los lee y ajusta un color creyendo
que tiene margen, se equivoca.

| Comentario | Dice | Es |
|---|---|---|
| `--rm-texto-2: #595959` | 7.0:1 sobre blanco | 7:1 exacto. Correcto |
| `--rm-texto-off: #6B6B6B` | 5.3:1 sobre `#F4F5F6` | **4.88:1**. Pasa, pero con menos margen del que dice |

---

## Cómo se usa esto

Al cerrar cada fase de la implementación, `npm run contraste`. Devuelve 0 si todo
lo que tiene que llegar llega, y 1 con la lista de lo que no. El agente de
auditoría de contraste de `docs/PROMPT_IDENTIDAD.md` lo corre como primera
medida, y después busca los pares que la lista todavía no cubre.

Si aparece un par nuevo, se agrega a `PARES` en `scripts/contraste.js` con su
mínimo, y si se acepta por debajo del mínimo se le pone la `nota` que explica por
qué. Un par sin nota que no llegue es una falla.
