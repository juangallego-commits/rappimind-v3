# Para revisar, Juan

Trabajé solo toda la noche. Esto es lo que quedó y lo que necesito de ti.

## 1. Qué hice, en diez líneas

1. **Bloque 1, el motor.** `src/core` completo: render, derivados, validaciones, esquemas, números en letras, fechas e identificaciones de los 8 países.
2. Los 5 casos que deben generar producen un texto **idéntico carácter por carácter** a `pruebas/salidas_esperadas/`, y los 6 que deben fallar fallan en los campos exactos que declara `casos_base.json`.
3. **Bloque 2, el servidor.** `setup()` idempotente, documento en la carpeta del país, compartido como lector, correo con marca, fila en Solicitudes, historial por rol, publicación y administración.
4. Todo el servidor se prueba en Node con dobles de las APIs de Google. Mañana solo queda verificar que Google acepte las llamadas de verdad.
5. **Bloque 3, la interfaz.** Preguntas simples a la izquierda, el T&C escribiéndose solo a la derecha, con los huecos grises de lo que falta.
6. Los tres tipos de campaña completos, con historial, ayuda y administración.
7. **Modo demostración**: sin `SHEET_ID` no crea nada, avisa en pantalla y muestra el texto que habría salido.
8. `demo/index.html`: un solo archivo que abres con doble clic, con el motor real dentro.
9. **18 capturas** de la aplicación corriendo de verdad en un navegador, escritorio y celular.
10. **196 pruebas en verde.** Leí el Sheet real de 1.184 solicitudes y de ahí salieron los valores por defecto.

## 2. Lo que tienes que hacer tú, en orden

### a. Correr `setup()` (2 minutos)

1. Abre el proyecto de Apps Script: **https://script.google.com/home/projects/1SvulJfC_m8LWfkgxhiliDi2o0WCCetlxdb4HVIjFWak0tYQwEC6vSI_B/edit**
2. En el desplegable de funciones, arriba, elige **`setup`**.
3. Clic en **Ejecutar**.
4. Google te va a pedir permisos la primera vez: **Revisar permisos**, elige tu cuenta, **Avanzado**, **Ir a RappiMind v3 (no seguro)**, **Permitir**. Es tu propio script, por eso sale ese aviso.
5. Abre el **Registro de ejecución** (abajo). Ahí sale el `sheetId` y el `carpetaId`. Guárdalos por si acaso.

Si lo corres dos veces no pasa nada: está hecho para eso y no pisa datos.

### b. Completar las propiedades del script (3 minutos)

1. En el proyecto, ícono de engranaje a la izquierda: **Configuración del proyecto**.
2. Abajo, **Propiedades de la secuencia de comandos**, **Editar propiedades**.
3. Verás `SHEET_ID` y `CARPETA_RAIZ_ID` ya puestas por `setup()`. **Agrega propiedad** para cada una de estas:

| Propiedad | Qué poner |
|---|---|
| `URL_FORMULARIO_LEGAL` | El enlace del formulario manual de Legal |
| `CANAL_AYUDA_URL` | El enlace del canal de Slack de ayuda |
| `CORREO_COPIA_LEGAL` | Tu correo, si quieres copia de cada documento (opcional) |
| `CORREOS_ADMIN` | Los correos de Anna y Paula, separados por comas |

4. **Guardar secuencia de comandos**.
5. Vuelve a correr **`setup`** para que Anna y Paula queden como administradoras.

### c. Abrir la aplicación (1 minuto)

**https://script.google.com/a/macros/rappi.com/s/AKfycbwvu6ciiAzvvYFVrOznWnMp952cGe4jXTnM4Ek9MbPdyBlWDBz6fVwVeEO7QvmXx7c/exec**

Si ves el aviso naranja de "Modo demostración", es que `setup()` no corrió o no guardó `SHEET_ID`. Vuelve al paso a.

### d. Pendiente de anoche

La variable **`ID_DESPLIEGUE`** en GitHub, Settings > Secrets and variables > Actions > Variables:
`AKfycbwvu6ciiAzvvYFVrOznWnMp952cGe4jXTnM4Ek9MbPdyBlWDBz6fVwVeEO7QvmXx7c`

## 3. Recorrido de diez minutos

Antes de tocar la web app, **abre `demo/index.html` con doble clic**: es la
aplicación completa sin tocar nada de producción. Sirve para que veas la interfaz
en un minuto.

Después, en la web app de verdad:

| Paso | Qué haces | Qué debería pasar |
|---|---|---|
| 1 | Abres la URL | La pantalla de inicio, con los tres pasos. El tercero dice "Publica los T&Cs" |
| 2 | **Empezar** | Cuatro preguntas de sí o no. Responde **No** a todas |
| 3 | País | Colombia ya viene marcada. **Siguiente** |
| 4 | Tipo | **Cashback** |
| 5 | Nombre | `99% Cashback Pollo Dorado`. Mira la hoja de la derecha: el título ya cambió |
| 6 | Tienda | `Pollo Dorado`. Fíjate en los huecos grises que dicen qué falta |
| 7 | Organizador | `Alimentos del Norte S.A.S.` y NIT `900111222-1`. Debe decir **NIT 900.111.222-1 válido** en verde |
| 8 | Prueba a romperlo | Cambia el último dígito a `900111222-5`. Debe explicar el dígito de verificación, no decir "campo inválido" |
| 9 | Fechas | Pon una fecha de inicio. La de fin se autocompleta igual: el 73% de los cashback duran un día |
| 10 | Porcentaje | `99`. Debajo del campo: **noventa y nueve por ciento (99%)** |
| 11 | Tope | `25000`. Aparece la calculadora: un pedido de $100.000 recibe $25.000 |
| 12 | Presupuesto | Pon `20000`, menos que el tope. Debe avisarte que el primer pedido se lleva la campaña. Corrígelo a `20000000` |
| 13 | El resto | Sigue hasta el final. Cada pregunta trae "¿Por qué te preguntamos esto?" |
| 14 | Resumen | Todo por secciones, con **Editar** en cada una. El botón Generar está **gris** y abajo dice **"Te falta: marca la casilla"** |
| 15 | Declaración | Márcala. El botón se pone naranja |
| 16 | **Generar T&C** | En unos segundos: "Tu T&C está listo" |
| 17 | Abre el documento | Debe estar en la carpeta **CO · Colombia**, compartido contigo como lector |
| 18 | Tu correo | Debe haber llegado el correo con el enlace y los pasos |
| 19 | Link publicado | Pega `https://otro.com/x`: debe rechazarlo. Pega uno de `promos.rappi.com`: debe aceptarlo |
| 20 | Mis campañas | Tu campaña, en verde, como publicada |
| 21 | En el celular | Abre la misma URL. Abajo hay un botón fijo: **Ver cómo va mi T&C** |

**Lo que de verdad quiero que mires** es el paso 5 al 12: que el documento se
escriba solo mientras respondes. Esa es la idea de toda la interfaz.

## 4. Qué revisar, y en qué orden

1. **`docs/PENDIENTES_LEGAL.md`** primero. Es lo único que bloquea de verdad.
2. **Los 3 textos del punto de control A** que te pasé por chat.
3. **`docs/CONTENIDO_AYUDA.md`**, sobre todo el bloque de azar. Está marcado como borrador porque es contenido legal y no es mío.
4. **`docs/PREGUNTAS_KAM.md`**: las 44 preguntas tal como las ve el comercial.
5. **`docs/COMENTARIOS_ANNA.md`**: los once puntos, con dónde quedó cada uno.
   Borrado el 21 de septiembre de 2026: los once estaban resueltos.
6. **`docs/capturas/`**: 18 capturas de la aplicación funcionando. Borradas el
   mismo día. Se sacan de la aplicación cuando hacen falta.
7. **`docs/DISENO.md`**: la paleta y por qué hay dos naranjas.
8. **`docs/HALLAZGOS_SOLICITUDES.md`**: qué piden de verdad los comerciales.

## 5. Decisiones que necesito de ti

1. **El naranja de los botones.** Texto blanco sobre `#FF441F` da 3.44:1 y no pasa el mínimo de accesibilidad (4.5:1). Dejé `#FF441F` como color de marca y puse `#D32F0F` en los botones, que da 5.02:1. Si prefieres el naranja exacto, la alternativa que cumple es texto oscuro sobre `#FF441F`. Tu marca, tu decisión.
2. **Las secciones de `data/secciones.json`.** En las solicitudes reales aparece **Express**, que no está en el archivo, y no aparecen **Farmacia** ni **Tiendas especializadas**, que sí están. No toqué `data/`.
3. **Cashback Day: el máximo de pedidos.** Hoy aplica a toda la campaña, no por tienda. Es la opción conservadora. Confírmalo o cámbialo.
4. **Rappi Travel** es el 12% de las solicitudes (138 de 1.184) y v3 no lo cubre. Hoy la interfaz lo manda al formulario de Legal. ¿Es lo que quieres, o Travel entra en la siguiente versión?
5. **Los descuentos que no son cashback** (porcentaje de descuento, cupones, 2x1, combos, obsequios) son 319 de 711 promociones y tampoco están. Misma pregunta.
6. **Los correos de Anna y Paula**, para la pantalla de Ayuda y para `CORREOS_ADMIN`. No los inventé.

## 6. Qué quedó pendiente

- **Las capturas de Squarespace.** Los marcadores `[CAPTURA 1]` a `[CAPTURA 6]` están puestos y se ven como recuadros punteados. Faltan las imágenes.
- **Verificar en Google.** Todo el servidor está probado contra dobles de las APIs. Lo único que no se puede probar sin tu cuenta es que Google acepte las llamadas: crear el Doc, moverlo, compartirlo y mandar el correo. Eso es el recorrido de la sección 3.
- **El despliegue versionado.** No lo disparé, como pediste. Cuando quieras publicar los cambios de la noche: Actions > Pruebas y despliegue > Run workflow.
- **Pegar tiendas desde Excel.** Quedó hecho, en el Cashback Day, dentro de "Pegar varias tiendas desde Excel". No lo probé con un Excel real tuyo.

## 7. Lo que verifiqué en un navegador de verdad

Además de las 196 pruebas, recorrí la aplicación con un navegador sin interfaz y
comprobé lo que no se ve en una captura. Las once pasan:

- La opción de desempate igual al criterio del ganador queda deshabilitada, con
  la razón visible: "Ya es el criterio del ganador: nunca desempataría".
- El foco de teclado se ve: contorno sólido de 3px.
- Las flechas del teclado mueven entre las opciones.
- Un nombre de campaña con HTML dentro **no se ejecuta**: sale como texto en el
  documento. Probado con `<img src=x onerror=...>`.
- Con la preferencia de movimiento reducido del sistema, el destello no anima y
  el cambio se marca con un contorno fijo, para no perder la información.
- El borrador se ofrece al volver a abrir la pestaña.

Ahí encontré un error que las pruebas no veían: **el borrador se borraba en cada
arranque**, porque reiniciar el formulario lo sobrescribía antes de que la
pantalla de inicio lo leyera. No fallaba, simplemente nunca ofrecía nada.
Corregido.

## 8. Cómo verificar que no rompí nada

```
npm test                    196 pruebas
npm run previsualizar CB01  el texto de un caso, salido del motor
npm run demo                regenera demo/index.html
npm run docs                regenera PREGUNTAS_KAM.md y CONTENIDO_AYUDA.md
```

En GitHub, **Actions > Pruebas y despliegue**: cada push de la noche corrió las
pruebas y subió el código a Apps Script.
