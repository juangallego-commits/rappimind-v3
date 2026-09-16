# Rappi Travel: cómo lo armamos

Para Juan. Rappi Travel es el 12% de la demanda real (138 de 1.184 solicitudes) y hoy
RappiMind lo manda entero al formulario de Legal. Vale la pena meterlo.

## Mi recomendación sobre quién hace qué

Partirlo en dos, y no porque quiera quedarme con la parte buena, sino porque son
trabajos distintos:

**Claude chat hace la investigación.** Ahí es donde tú puedes pegar veinte ejemplos,
links de Slack, PDFs y capturas sin que se vuelva un problema. El resultado no es un
modelo: es un **informe** que dice qué tipos de campaña de Travel existen de verdad, qué
cambia entre uno y otro, y qué cláusulas nuevas hacen falta.

**Yo convierto ese informe en modelos que funcionan.** Los modelos de `modelos/` no son
texto suelto: llevan marcadores `{{ }}`, bloques `[[INCLUIR:nombre]]` y condicionales
`[[?VALOR]]...[[/?]]`, y cada uno necesita su esquema de preguntas, sus validaciones,
sus derivados y sus casos de prueba con la salida esperada exacta. Yo puedo correr
`npm test` y confirmar que no queda un solo marcador sin llenar ni una frase rota.
Claude chat no puede: te va a dar un texto que se ve bien y que al pasarlo al motor se
rompe en sitios que nadie va a revisar.

Si prefieres que lo haga todo yo, también sirve: pásame los ejemplos y los links y yo
hago las dos partes. Solo que en chat vas a poder pegar mucho más material de golpe.

## El prompt para Claude chat

Cópialo tal cual y después pega tus ejemplos.

---

Eres mi copiloto legal para Rappi. Soy Juan Camilo Gallego, abogado de Rappi Colombia y
dueño de los Términos y Condiciones de campañas promocionales.

Estamos construyendo RappiMind, una herramienta interna donde los comerciales generan
los T&C de sus campañas a partir de modelos aprobados por Legal, sin escribirle a Legal.
Hoy cubre tres tipos: Cashback de una tienda, Carrera de Compras y Cashback Multitienda.
Rappi Travel queda fuera y es el 12% de la demanda, así que lo quiero meter.

**Tu trabajo en esta conversación es de investigación, no de redacción final.** Lo que
necesito de ti es un informe que después le paso a otro Claude, que es el que escribe
los modelos dentro del repositorio y los prueba. No me entregues un T&C terminado.

Te voy a ir pegando ejemplos de T&C de Travel ya publicados, hilos de Slack con lo que
piden los comerciales, y lo que se me ocurra que sirva. Léelo todo antes de concluir
nada, y si algo te falta, pídemelo en vez de suponerlo.

Cuando tengas material suficiente, entrégame esto, en este orden:

**1. Los tipos de campaña que existen de verdad.** No los que se podrían inventar: los
que aparecen en los ejemplos. Para cada uno, en una frase, qué le ofrece al usuario.
Agrúpalos: si dos son el mismo documento con un número distinto, son un tipo, no dos. Mi
meta son dos o tres tipos, no ocho.

**2. Para cada tipo, qué datos tiene que dar el comercial.** Una lista de hechos
concretos: fechas, porcentajes, topes, nombres, destinos, aerolíneas, lo que sea. Para
cada dato: cómo se llama, de qué tipo es (texto, número, fecha, una opción entre varias),
si es obligatorio y de qué depende. Regla dura: el comercial solo entrega **hechos**,
nunca texto legal. Si un dato te obliga a que el comercial redacte una frase, ese dato
está mal pensado y hay que convertirlo en una lista de opciones.

**3. Qué cambia frente a un Cashback normal.** Esta es la parte que más me sirve.
Concretamente:
   - ¿Quién es el Organizador en un Travel? En una campaña normal es la tienda o la
     marca que pone la plata, y Rappi nunca es el organizador. ¿En Travel es la
     aerolínea, el hotel, la agencia, el consolidador?
   - ¿Con qué entidad legal de Rappi se firma? Travel suele tener una entidad y un
     registro distintos de los del delivery. Dime cuál aparece en los ejemplos, por país.
   - ¿Hay obligaciones de agencia de viajes, registro de turismo o intermediación que un
     T&C de delivery no tiene?
   - ¿El beneficio son Créditos de Rappi, o es un descuento sobre la tarifa, o un
     reembolso? No es lo mismo y la cláusula cambia entera.
   - ¿Qué pasa con cancelaciones, cambios de vuelo y reembolsos? Un pedido de comida no
     se cancela tres meses después; un tiquete sí.
   - ¿Hay condiciones del proveedor (aerolínea, hotel) que se tengan que reflejar?

**4. Las cláusulas nuevas.** Las que un T&C de Travel necesita y un Cashback no tiene.
Para cada una: cómo se llamaría, qué dice en dos líneas, y de qué ejemplo la sacaste.
Marca cuáles crees que son obligatorias por ley y cuáles son costumbre.

**5. Lo que no puedes concluir.** Una lista franca de lo que los ejemplos no te
permitieron resolver, con la pregunta exacta que tendría que hacerle yo a Legal Travel o
al equipo comercial. Prefiero cinco preguntas buenas que una suposición.

**6. Qué mandar a revisión manual.** Los casos de Travel que **no** deberían pasar por
una herramienta automática y tienen que ir a un abogado: sorteos, premios atados a un
evento con fecha, cualquier cosa con azar, lo que se te ocurra. Con la razón.

Reglas que no se negocian, y aplican también a Travel:

- **Rappi nunca es el organizador.** El organizador es siempre quien fondea. Que Rappi
  opere la mecánica o gestione la entrega no lo vuelve organizador. Si un ejemplo dice
  lo contrario, señálamelo: es un error que hay que corregir, no un precedente.
- **El texto legal es de Legal.** No "mejores" las cláusulas de los ejemplos. Si crees
  que una está mal, dímelo aparte, marcado como observación.
- **Cero ambigüedad.** Si un dato puede quedar vacío y dejar la frase coja, es un
  problema de diseño y quiero que me lo digas.
- Todo en español, y en los textos visibles no uses guiones como signo de puntuación.

Empieza confirmándome que entendiste, dime qué material necesitas de mí para arrancar, y
espera a que te lo pase. No arranques a redactar todavía.

---

## Lo que yo hago después

Cuando me pases ese informe, yo armo:

- `modelos/travel_*.md` con los bloques que se reusan del Cashback, en el formato del
  motor.
- El esquema en `src/core/esquemas.js`: campos, visibilidad y obligatoriedad.
- Las preguntas en `src/core/preguntas.js`, con su ayuda y su porqué.
- Los derivados y las validaciones que hagan falta.
- Los casos en `pruebas/casos_base.json` con su salida esperada exacta.
- El filtro de entrada, para que lo que no encaje siga yendo a Legal.

Y te entrego el texto generado de cada caso para que lo revises antes de que nadie lo
publique.
