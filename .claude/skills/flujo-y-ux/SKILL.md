---
name: flujo-y-ux
description: El recorrido completo del comercial en RappiMind v3, pantalla por pantalla, y las reglas de producto y experiencia que lo sostienen. Úsala SIEMPRE que toques algo que el usuario ve o recorre: cualquier archivo de src/client/, una pregunta de src/core/preguntas.js, un esquema de src/core/esquemas.js, el filtro de entrada, la lista de tipos de campaña, el resumen, la pantalla de Legal, el historial o la ayuda. Actívala también cuando agregues una pregunta, un tipo de campaña, un país o una bifurcación nueva, cuando muevas o elimines una pregunta, y cuando el síntoma sea "no me salen opciones", "me pregunta dos veces lo mismo", "se saltó una pregunta", "se fue al resumen vacío", "no puedo elegir X", "me manda a Legal sin razón" o "esto ya lo había respondido". Y siempre que Juan describa lo que vio en pantalla: ahí estás actuando como experto de producto, no solo de código.
---

# El flujo de RappiMind v3

Antes de tocar una pantalla, ten claro para quién es. La persona del otro lado
es un comercial (CAM o KAM) que quiere lanzar una promoción esta semana. No es
abogado, no quiere serlo, y cada pregunta que no entiende es una razón para
cerrar la pestaña y escribirle a Legal, que es exactamente lo que esta
herramienta existe para evitar.

Eso da la vara de medir de cualquier cambio: **¿esto acerca al comercial a
publicar su T&C sin escribirle a Legal, o lo aleja?**

## El recorrido, de una mirada

```
inicio
  └─ Empezar ──► filtro (2 preguntas generales)
                   ├─ algún sí ──► legal
                   └─ todo no ──► pasos
                                    │  paso "Campaña": país ► negocio ► tipo
                                    │
                                    ├─ negocio = travel, país sin Travel ──► legal
                                    ├─ negocio = travel ──► filtroTravel (9 preguntas)
                                    │                         ├─ algún sí ──► legal
                                    │                         └─ todo no ──► pasos (en "tipo")
                                    │
                                    └─ elegido el tipo: los pasos del tipo,
                                       una pregunta a la vez, con el documento
                                       llenándose al lado
                                          └─ última pregunta ──► resumen
                                                                   └─ Generar ──► listo
                                                                                    ├─ país que publica solo: ya
                                                                                    │  quedó publicado en su enlace
                                                                                    │  (promos.rappi.com/tyc?co/...)
                                                                                    └─ los demás: publicar en
                                                                                       Squarespace, y RappiMind revisa
                                                                                       la página sola, cada hora
historial ("Mis campañas")
  ├─ Usar como base ──► pasos con las respuestas copiadas y las fechas en blanco
  ├─ Ampliar ──► solo si está publicada y en curso
  └─ Retirar ──► solo si la publicó RappiMind y no ha arrancado
```

`references/recorrido.md` tiene el detalle pantalla por pantalla: qué se
pregunta, a dónde sale cada respuesta y qué estado deja. Léelo antes de mover
una pregunta de sitio o de agregar una bifurcación.

## Las reglas de experiencia, y por qué existen

**Una pregunta a la vez, y las respondidas quedan a la vista.** El comercial ve
una sola pregunta abierta; arriba quedan las ya respondidas en una línea, con
"Cambiar". Un formulario largo de veinte campos se abandona; veinte preguntas
cortas no. Si agregas una pregunta, tiene que caber en ese molde: enunciado
corto, ayuda de una línea, y opciones cuando se pueda.

**Toda pregunta dice por qué se pregunta.** `PREGUNTAS` tiene `ayuda` y
`porQue` porque la pregunta legal que no se explica se responde al azar, y una
respuesta al azar sale impresa en un documento que se publica. Una pregunta sin
`porQue` es una pregunta a medio hacer.

**El documento se llena mientras responde.** La columna de la derecha (y la hoja
deslizable en celular) es la promesa central del producto: lo que ves es lo que
sale. Si un cambio deja de refrescarla, el producto pierde su argumento. Toda
respuesta pasa por `flujo.refrescarDocumento()`.

**Ir a Legal no es un castigo.** La pantalla `legal` dice siempre qué caso es el
que un abogado tiene que mirar y ofrece el formulario. Nunca la dejes sin razón
concreta (`E.motivoDeLegal`): "tu campaña necesita revisión" no le sirve a nadie.
Y nunca mandes a Legal algo que la herramienta sí sabe hacer: eso es devolverle
el trabajo a Juan.

**Ofrecer algo que no se puede dar es peor que no ofrecerlo.** Si Rappi Travel
no está habilitado en el país, elegirlo va a `legal` con esa razón exacta. Un
camino que arranca y muere cinco preguntas después es la peor versión.

**Una pregunta que ya no aplica desaparece, no se muestra bloqueada.**
`camposVisibles()` decide qué se ve según el tipo y las respuestas. Bloquear una
opción con una razón visible (`opcionesDeshabilitadas`) es la excepción, para
cuando el comercial necesita entender por qué no puede: el desempate no puede
ser el mismo criterio del ganador.

**Lo opcional se ve opcional.** Si un dato no es obligatorio, dilo en la
pregunta. Juan pidió expresamente que el mínimo de compra se pudiera dejar en
blanco; una pregunta que parece obligatoria y no lo es hace inventar datos.

**Preseleccionar no es responder.** Colombia viene marcada porque es casi todas
las solicitudes, pero la pregunta se muestra igual. `tieneRespuesta()` mira
`E.respondidas`, no el valor: un valor por defecto que se salta la pregunta es un
dato que nadie confirmó.

**Cambiar de rama nunca deja a nadie varado.** Cambiar el negocio borra el tipo;
cambiar el país borra el tipo. Lo que se borra se vuelve a preguntar, y el
asistente queda abierto en esa pregunta (`E.campoAbierto`), no en el vacío.
Cuando el filtro de Travel termina, vuelve a `pasos` abierto en `tipo`, porque
la pregunta del negocio ya está respondida y reabrirla parece que no hubiera
pasado nada.

**Todo en español, y sin guiones como signo de puntuación** en lo que el
usuario lee. Es regla de `CLAUDE.md`, y se cuela con facilidad en un texto nuevo
de pantalla.

## La regla que nació de un defecto real

**Cuando una pregunta se mueve, se va de donde estaba en el mismo cambio.**

El filtro general preguntaba "¿Es una campaña de Rappi Travel?" y mandaba a
Legal. Después se agregó la pregunta de negocio (Rappi o Rappi Travel) dentro
del paso de Campaña, que es donde debía estar. Pero la vieja se quedó ahí. El
resultado: nadie podía llegar nunca a los tipos de Travel, porque el filtro los
sacaba antes. La funcionalidad estaba completa y probada, y era inalcanzable.

Ninguna prueba lo vio, porque cada mitad era correcta por separado. Lo vio Juan,
en una captura.

De ahí la costumbre: antes de dar por hecha una pregunta nueva, **busca el mismo
concepto en todo el flujo** (`grep` por la palabra en `src/client/js/` y
`src/core/preguntas.js`, `src/core/ayuda.js`) y confirma que solo se pregunta en
un sitio. Lo mismo al revés: si borras una pregunta, revisa quién dependía de
su respuesta.

## La otra regla que nació de un defecto real

**Un mecanismo que la interfaz no llama es un mecanismo que no existe.**

`preguntaDe(campo, tipo)` permite que una misma pregunta se lea distinto en cada
tipo de campaña: la tienda es "el parceiro" en Brasil, y la cobertura es "¿en qué
ciudad?" en singular cuando el tipo es de una sola ciudad. El mecanismo estaba
construido, exportado y probado en Node.

Y no se veía en ninguna pantalla, porque toda la interfaz llamaba a
`preguntaDe(campo)` **sin el tipo**. Las pruebas pasaban, las variantes existían,
y el comercial seguía leyendo el texto genérico.

Por eso el texto de una pregunta se pide siempre con `estado.pregunta(campoId)`,
que pone el tipo actual por ti. Si escribes `preguntaDe(` en un archivo de
`src/client/`, párate a pensar: casi siempre es un error.

La lección general: cuando agregues un mecanismo que cambia lo que el comercial
lee, **ábrelo en la demostración y compruébalo con los ojos** antes de darlo por
hecho. Una prueba en Node confirma que el mecanismo funciona, no que alguien lo
esté usando.

## Las trampas del motor del asistente

El asistente no es un formulario: es una máquina de estado que se redibuja
entera. Tres cosas se rompen callado ahí.

**Recalcular, no reusar.** Elegir el país o el tipo cambia qué pasos existen y
qué preguntas se ven. Por eso `avanzar()` y `retroceder()` llaman a
`situacionActual()` en vez de usar las listas con que se dibujó la pantalla
anterior, y vuelven a buscar la pregunta por su identificador, no por su índice.

**Una sola lista de preguntas por situación.** Las tres preguntas de arranque
(país, negocio, tipo) viven en `camposDeArranque()`, una sola vez. Estuvieron
escritas dos veces, una con la pregunta del negocio y otra sin ella, y como una
lista dibujaba y la otra decidía a dónde ir, "Siguiente" se saltaba el negocio.
Si dos sitios describen las mismas preguntas, se van a desincronizar.

**Quien navega lo dice.** `alResponder()` devuelve `true` cuando ya cambió de
pantalla, y quien lo llama respeta ese `true` y no hace nada más. Sin eso, el
control de opciones llamaba a `avanzar()` encima de una pantalla que ya no
existía, el paso se quedaba sin preguntas y `avanzar()` lo leyó como "ya
terminó": al resumen, en blanco.

## Antes de dar por terminado un cambio de flujo

1. **Recorre el camino completo en la demostración**, no solo la pantalla que
   tocaste. `npm run demo` y luego `scripts/recorrer-flujo.js` de esta skill,
   que hace el recorrido entero y revisa los invariantes de arriba. Si tocaste
   algo que un KAM de Brasil ve, también `scripts/recorrer-en-portugues.js`.
   Y para verlo sin abrir la app, `scripts/capturar-pantallas.js` deja 33
   capturas y un `textos.json` con el texto literal de cada pantalla en
   `docs/capturas/revision/`. Esa carpeta **no se versiona**, a propósito: una
   captura guardada es de la versión de hace tres semanas, no de la que corre
   hoy. Córrelo cuando las necesites y bórralas cuando termines.
2. **Recorre también el camino que no tocaste.** El defecto del filtro de Travel
   rompió Rappi Travel arreglando otra cosa. Si tocaste el negocio, prueba
   Rappi. Si tocaste Travel, prueba Colombia y México.
3. **`npm test`**, siempre, antes de cualquier push.
4. **Cuéntalo en la pantalla de Ayuda** si el cambio altera lo que el comercial
   tiene que hacer. La ayuda que no cuenta el flujo actual estorba más de lo que
   sirve.
5. **Dilo en español de Juan.** Cuando le reportes, describe lo que va a ver,
   no el nombre de la función.

## Lo que no se negocia (de `CLAUDE.md`)

- **Rappi nunca es el organizador**, ni Rappi Travel. Ninguna pregunta puede
  sugerir lo contrario.
- **El texto legal es de Legal.** No redactes cláusulas. Un problema legal se
  anota en `docs/PENDIENTES_LEGAL.md`.
- **Sin texto libre legal en el formulario.** Los únicos campos libres son los
  de la especificación: nombres, razones sociales, ciudades, la descripción de
  un premio físico y la lista de productos.
- **Si falta un dato, no se genera.** Cero `{{ }}`, cero `[[ ]]`, cero frases
  rotas.

## La otra skill

`frontera-apps-script` cubre los cuatro cruces donde un dato cambia de mundo
(servidor a navegador, build a navegador, el Sheet y los nombres de archivo).
Si el síntoma es "la pantalla salió vacía" o "no salen las opciones", puede ser
de flujo o de frontera: empieza por la frontera, que falla más callado.
