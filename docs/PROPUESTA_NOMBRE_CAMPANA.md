> **Decidido por Juan el 16 de septiembre y ya implementado.** Este documento queda
> como la explicación de por qué el nombre funciona así. Lo que se hizo está al final.

# Propuesta: cómo se llaman las campañas

Para Juan. Dos decisiones pendientes, las dos salen de tu revisión del 16 de septiembre.
Nada de esto está implementado todavía: dime cuál quieres y lo armo.

## 1. El nombre de la campaña

### El problema, con el caso real

El primer T&C que generaste se llama **"99% de Cashback el Corral 20/09"**. El documento
dice, en la cláusula 6, **cincuenta por ciento (50%)**, y en la cláusula 3 que la vigencia
es el **17 de septiembre**. El nombre no coincide con el articulado en ninguno de los dos
datos.

Eso no es un descuido del usuario: es lo que pasa cuando el nombre es texto libre y los
números viven en otra parte. Y ese nombre es el título de la página en Squarespace, o sea
lo primero que lee el usuario. Con la cláusula 12 del propio documento ("en caso de
discrepancia se aplicará la condición más favorable para ti"), un título que diga 99%
cuando el beneficio es 50% es un problema que se puede reclamar.

### La propuesta

El comercial deja de escribir el nombre. El sistema lo arma con datos que ya dio:

```
El Corral · 50% Cashback · Sep 2026
El Corral · 50% Cashback · Sep 2026 · Día del Padre
Pollo Dorado · Carrera de Compras · Oct 2026
Cashback Multitienda · Sep 2026 · Semana del Pollo
```

Las partes:

1. **La tienda**, tal como la escribió (en el Cashback Day no hay una sola tienda, así que
   esa parte se salta).
2. **El beneficio**, armado con el mismo número que va en la cláusula. Si pone 50, el
   título dice 50%. Nunca pueden decir cosas distintas, porque salen del mismo dato.
3. **Mes y año** de la fecha de inicio. No el día: si mueve la fecha, el nombre no queda
   mintiendo.
4. **Una etiqueta corta, opcional**, para distinguir dos campañas de la misma tienda en el
   mismo mes. Máximo 30 caracteres, sin el signo de porcentaje y sin cifras de plata, que
   son justo lo que genera contradicciones.

Y abajo del título ya queda el identificador que genera el sistema, del estilo
`RM-20260916-0001`, que sirve para buscar la campaña exacta.

### Qué ganas

- El título no puede contradecir el articulado, porque sale del articulado.
- Todas las campañas se llaman igual de estructuradas, así que se buscan por tienda, por
  tipo o por mes.
- El comercial escribe menos: de un campo libre pasa a uno opcional de dos palabras.

### Qué pierdes

- Se acaban los nombres con gracia. Si marketing quiere algo más vistoso para la pieza
  publicitaria, lo puede hacer: la pieza y el T&C son documentos distintos.
- Las campañas que ya existen tienen nombres viejos. No se tocan.

### Lo que necesito de ti

- ¿Va con el porcentaje adentro del título (recomendado) o sin ningún número?
- ¿Mes y año, o solo año?
- La etiqueta opcional: ¿la dejamos, o la quitamos y que el identificador haga el trabajo
  de distinguir?

## 2. El nombre del tipo "Cashback Day"

Tienes razón: no es obligatorio que sea el mismo día, así que el nombre promete algo que
el modelo no exige. Opciones:

| Nombre | Qué dice | Comentario |
|---|---|---|
| **Cashback Multitienda** | Varias tiendas en una sola campaña | **Recomendado.** Dice exactamente lo que lo distingue del Cashback normal, y no dice nada del calendario. |
| Cashback de Varias Tiendas | Lo mismo, más largo | Más claro para quien nunca lo ha usado, pero pesa en la pantalla. |
| Jornada de Cashback | Varias tiendas en una temporada comercial | Sigue sonando a un solo día. |
| Cashback Conjunto | Varias tiendas que se juntan | Corto, pero no se entiende solo. |

Cambiar el nombre que se ve en pantalla es un cambio de una línea y no toca nada legal.
El identificador interno (`cashback_day`) y el archivo del modelo se quedan como están,
para no romper las solicitudes ya guardadas.

Dime cuál y lo cambio.


## Lo que quedó implementado

Juan decidió: porcentaje adentro del título, día de inicio, mes y año, sin etiqueta
libre, y nombres que nunca se repiten. Y **Cashback Multitienda** para el tercer tipo.

Así quedó:

```
El Corral · 50% Cashback · 20 sep 2026
Carulla · Carrera de Compras · 5 oct 2026
Cashback Multitienda · 24 sep 2026
```

- La pregunta "¿Cómo se llama tu campaña?" **ya no existe**. El nombre lo arma
  `src/core/nombres.js` con la tienda, el porcentaje y el día de inicio, todos datos
  que el comercial ya dio.
- El porcentaje del título sale del mismo dato que alimenta la cláusula, así que no
  pueden decir cosas distintas. Hay una prueba que lo exige.
- **Dos campañas nunca se llaman igual.** Al generar, el servidor mira los nombres que
  ya existen y, si el nombre está tomado, le agrega un consecutivo: `· 2`, `· 3`. Como
  el nombre va adentro del articulado, el documento se vuelve a armar con el nombre
  definitivo.
- La comparación ignora mayúsculas y tildes, porque "El Corral" y "el corral" son la
  misma campaña para quien busca.
- De ese mismo nombre sale la dirección de Squarespace: `el-corral-50-cashback-20-sep-2026`.
  El título y el enlace se buscan con las mismas palabras.
- El identificador interno del tipo (`cashback_day`) y el archivo del modelo no se
  tocaron, para no romper las solicitudes ya guardadas. Solo cambió el nombre que se ve.

### Lo único que vale la pena mirar

En la Carrera de Compras el nombre va **adentro** de una cláusula, no solo en el
título: *"la campaña promocional denominada 'Carulla · Carrera de Compras · 5 oct
2026'"*. Se lee un poco raro para un documento legal. Se puede dejar así, que es lo
correcto porque es el nombre oficial de la campaña, o pedirle a Legal una redacción
distinta para esa frase. Anotado en `docs/PENDIENTES_LEGAL.md`.
