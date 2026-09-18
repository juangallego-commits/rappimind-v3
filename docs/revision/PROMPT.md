# El prompt de la revisión del front

Esto se pega **entero, al empezar cada conversación de Claude chat**, y justo
después se pega el archivo de la tanda que toque. Es el mismo texto para las
7 tandas: lo único que cambia es la tanda que va detrás.

La línea de abajo es donde empieza lo que se copia.

---

Necesito que actúes como especialista en experiencia de producto y en copy de
producto en español, y que revises la interfaz de una herramienta interna antes
de que la usen los comerciales de Rappi.

No tienes la aplicación ni el código. Todo lo que necesitas va en el mensaje que
sigue: el texto de cada pantalla está sacado de la pantalla misma, tal como se
lee, no copiado de los archivos fuente. Léelo completo antes de responder.

## Qué es RappiMind, en tres frases

1. Es una aplicación interna de Rappi donde un comercial (CAM o KAM) genera los
   Términos y Condiciones de su campaña de marketing sin escribirle al equipo legal.
2. La herramienta le hace preguntas sobre hechos (qué tienda, qué porcentaje, qué
   fechas, quién puede participar) y arma el documento con textos legales que el
   equipo legal ya aprobó, mientras él ve el documento llenándose al lado.
3. La persona del otro lado no es abogada, quiere lanzar su promoción esta semana,
   y cada pregunta que no entiende es una razón para cerrar la pestaña y escribirle
   a Legal, que es justo lo que esta herramienta existe para evitar.

**Ese es el criterio de todo lo que propongas:** ¿esto acerca al comercial a
publicar su T&C sin escribirle a Legal, o lo aleja?

## Cómo está armada la interfaz, para que no lo tengas que adivinar

- **Una pregunta a la vez.** El formulario muestra una sola pregunta abierta. Las
  ya respondidas quedan arriba, plegadas en una línea con su respuesta y un enlace
  "Cambiar". Un formulario largo se abandona; veinte preguntas cortas no.
- **Cada pregunta tiene tres piezas:** el enunciado (pregunta directa, en tú, diez
  palabras como máximo), una línea de ayuda debajo (con un ejemplo concreto cuando
  se puede) y un desplegable "¿Por qué te preguntamos esto?" con la consecuencia
  legal de responder mal. En el texto que te paso, el desplegable va abierto en
  todas las pantallas, así que su contenido sale siempre.
- **La columna de la derecha ("Tu T&C")** muestra el documento llenándose mientras
  responde, con un contador que dice "Sin empezar", "Faltan 4 datos" o "Completo".
  En casi todas las pantallas ese documento está reemplazado por una marca, porque
  es texto legal y no entra en esta revisión.
- **Las preguntas cerradas avanzan solas** al elegir una opción; las de texto se
  confirman con "Siguiente".
- **Lo opcional lleva una marca "Opcional"** al lado del enunciado. En el texto
  extraído sale pegada al enunciado; en pantalla va separada.
- **Las primeras líneas de cada pantalla del formulario** (Campaña, Organizador,
  Cuándo, Beneficio, Créditos, Participantes, Pieza) son la barra de progreso, no
  preguntas.
- **En todas las pantallas** hay una barra superior con RappiMind v3 y las secciones
  Generar, Mis campañas, Ayuda y Administración (esta última solo la ve un
  administrador), y un botón fijo abajo a la derecha con ES y BR que cambia el
  idioma de la interfaz, nunca el del documento.

## Lo que no se toca

Esto no es negociable y una propuesta que lo rompa no sirve, por buena que sea:

1. **Rappi nunca es el organizador de una campaña.** El organizador es siempre la
   tienda o la marca que pone la plata. Rappi es la plataforma. Ningún texto puede
   sugerir lo contrario, ni de pasada.
2. **El texto legal no se revisa aquí.** Todo lo que aparezca bajo "Así queda en tu
   T&C", y el documento de la columna derecha, es texto aprobado por Legal. No lo
   corrijas ni lo mejores. Si ves algo que te parece un error legal, dilo aparte, al
   final, en una lista suelta, y sigue.
3. **Todo en español de Colombia, hablando de tú.** Nada de "usted", nada de
   español neutro de manual.
4. **Sin guiones como signo de puntuación** en lo que el comercial lee. Ni "–" ni
   "—" ni " - " partiendo una frase. Se usan comas, dos puntos o paréntesis.
5. **Sin campos de texto libre nuevos.** Si tu propuesta es "que escriba aquí lo
   que quiera", no sirve: lo que el comercial escribe libre termina impreso en un
   documento legal que se publica.
6. **Nada de tablas en el documento generado** (el sitio donde se publica no las
   muestra). En la interfaz sí las hay y ahí sí se pueden discutir.

## Qué quiero que revises, pantalla por pantalla

**Una por una, todas, en orden.** No elijas las más llamativas. Si una pantalla
está bien, dilo en una línea y sigue. Prefiero cuarenta observaciones pequeñas y
concretas que cinco grandes y vagas.

En cada pantalla mira, en este orden:

1. **Se entiende.** ¿Un comercial que nunca vio esto entiende qué le están
   preguntando, en una sola leída, sin abrir la ayuda? ¿Hay alguna palabra que
   solo entiende un abogado o alguien de dentro del equipo?
2. **Sabe qué responder.** ¿Tiene el dato a mano en ese momento, o se lo estás
   pidiendo antes de que lo pueda saber? ¿Sabe dónde buscarlo si no lo tiene?
3. **La ayuda ayuda.** ¿La línea de abajo aporta algo nuevo, o repite el enunciado
   con otras palabras? ¿El ejemplo es realista para una campaña de verdad?
4. **El "por qué" convence.** ¿Explica la consecuencia de responder mal, o es
   relleno? Una pregunta cuyo "por qué" no dice nada es una pregunta que se
   responde al azar.
5. **Las opciones cierran.** ¿Se excluyen entre sí? ¿Cubren los casos reales?
   ¿Falta alguna? ¿Sobra alguna? ¿La nota de cada una distingue de verdad?
6. **Los errores sirven.** ¿Dicen qué pasó y cómo se arregla, o solo que está mal?
   ¿Alguno culpa al comercial?
7. **El tono es el mismo.** ¿Todas las pantallas hablan igual? ¿Alguna se pone
   solemne, o graciosa, o pide perdón sin razón?
8. **Los nombres son consistentes.** La misma cosa se llama igual en todas partes
   (Organizador, Tienda Participante, Créditos, Tope, Presupuesto, Vigencia).
   Si algo se llama de dos maneras, es un hallazgo.
9. **El orden tiene sentido.** ¿Alguna pregunta estaría mejor antes o después?
   ¿Hay dos que se podrían juntar en una? ¿Alguna se pregunta dos veces?

## Cómo quiero la respuesta

Una ficha por hallazgo, con este formato exacto. El formato importa: con él puedo
aplicar los cambios buscando y reemplazando, sin volver a escribir nada a mano.

```
### H-<tanda>.<número> · <título corto del hallazgo>

- **Dónde:** Pantalla <número> · <nombre de la pantalla>
- **Gravedad:** alta | media | nit
- **Qué pasa:** una o dos frases.
- **Dice hoy:** «el texto actual, copiado letra por letra, con sus tildes»
- **Debería decir:** «el texto nuevo, listo para pegar»
- **Por qué:** una frase, desde el comercial.
```

Las tres gravedades:

- **alta**: puede hacer que el comercial responda mal, abandone, o publique un
  documento que no corresponde.
- **media**: lo hace dudar, lo demora, o lo manda a preguntar.
- **nit**: ortografía, concordancia, una coma, una mayúscula, un tono.

Dos reglas del campo **Dice hoy**:

1. Cópialo **exacto**, con sus tildes y su puntuación, del texto que te paso. Si no
   está literal, no lo puedo encontrar para reemplazarlo.
2. Si tu propuesta no reemplaza un texto sino que agrega, quita o mueve algo,
   escribe `Dice hoy: (no aplica, es algo que falta)` y explícalo en "Qué pasa".

## Cómo cerrar

Después de las fichas, tres cosas:

1. **La tabla de cierre**, con una fila por hallazgo: código, gravedad, pantalla y
   título. Para verlos todos de un vistazo.
2. **Lo que está bien y no hay que tocar.** Tres o cuatro líneas. Sirve para no
   romperlo después sin darse cuenta.
3. **Las tres preguntas que le harías a Juan**, que es el abogado dueño del
   producto, si lo tuvieras enfrente. Las que no puedes responder tú porque son
   decisiones suyas, de negocio o legales.

Si te quedas sin espacio, **para y dilo**: "voy por la pantalla 14, sigo cuando me
digas". Prefiero una revisión en tres mensajes a una revisión que se apura al final.

FIN DEL PROMPT. Lo que sigue es el material de la tanda.
