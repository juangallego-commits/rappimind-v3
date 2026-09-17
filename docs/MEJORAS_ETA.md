# 15 minutos o Cashback: qué cambió frente a los documentos publicados

Base: los T&C publicados de **Bogotá (16/09/2026)** y **Barranquilla
(1/09/2026)**. Los dos son el mismo documento con la ciudad, la fecha, las horas
y el presupuesto cambiados.

Juan pidió meter en el modelo lo que viera como oportunidad de mejora. Esto es
todo lo que cambió, para que nada quede corregido a escondidas. El articulado de
fondo no se tocó: las cláusulas dicen lo mismo, en el mismo orden.

---

## 1. Faltaba la cláusula de tratamiento de datos personales

**Es la más importante de la lista.** Ninguno de los dos documentos publicados
tiene cláusula de datos personales, ni menciona la política de privacidad, ni
nombra a la autoridad de protección de datos. Es el único modelo de todo el
repositorio al que le falta, y es una campaña publicada en Colombia donde el
usuario entrega datos para recibir Créditos.

El modelo ahora incluye el bloque `datos`, el mismo que usan Cashback, Carrera
de Compras y Cashback Multitienda: nombra a Rappi S.A.S. como responsable, cita
la Política de Tratamiento de Datos Personales con su enlace, enumera los
derechos del titular y nombra a la Superintendencia de Industria y Comercio.

Si hay una razón para que no estuviera, dímela y la saco.

## 2. Rappi no estaba identificada

Los documentos publicados nunca dicen quién es "Rappi". La primera frase decía
"Por medio del presente documento se dan a conocer los términos y condiciones",
en impersonal, y de ahí en adelante se habla de Rappi sin haberla definido.

Ahora abre así: "Por medio del presente documento **Rappi S.A.S.**, identificada
con **NIT 900.843.898-9** y domiciliada en Bogotá D.C. (en adelante, "Rappi"),
da a conocer los términos y condiciones...". Los tres datos salen de la fila de
Colombia del Sheet, así que no hay que escribirlos.

## 3. El presupuesto iba solo en cifra, y uno tenía decimales

- **Bogotá:** "un valor total máximo de 37.000.000 de Créditos".
- **Barranquilla:** "un valor total máximo de **95.087.585,10** de Créditos".

Dos cosas. La primera es que ese es el único número del documento que no va en
letras y cifra: el ETA, el porcentaje, el tope y el máximo de órdenes sí van
("quince (15) minutos", "cien mil (100.000) Créditos"). La segunda es que los
Créditos son puntos y no se fraccionan, así que 95.087.585**,10** Créditos no
existe como cantidad; se ve que el número salió tal cual de una hoja de cálculo
de presupuesto.

Ahora sale "**treinta y siete millones (37.000.000) de Créditos**", con el mismo
formato que el resto del documento, y la parte decimal se descarta.

## 4. La redención estaba suelta entre las restricciones

La frase "los Créditos otorgados podrán ser utilizados/redimidos en cualquier
sección de la Plataforma Rappi, a excepción de..." estaba como una viñeta más
dentro de "Condiciones y Restricciones", lejos de la cláusula que habla de la
vigencia de los Créditos.

Ahora va dentro de "Vigencia y redención de los Créditos", que es donde la ponen
todos los demás modelos, y se dice una sola vez.

Además, las cuatro secciones excluidas (Rappi Travel, SOAT, Cajero ATM y Rappi
Favor) dejaron de ser texto fijo: son una pregunta con casillas. Si mañana hay
que excluir una más, se marca, no se reescribe el modelo.

## 5. La cláusula de seguridad vial decía algo incómodo

- **Antes:** "Rappi no promueve que los repartidores excedan los límites de
  velocidad. La velocidad de entrega **es determinada por la gestión del
  restaurante**."
- **Después:** "Rappi no promueve que los repartidores independientes excedan
  los límites de velocidad **ni que infrinjan las normas de tránsito**. La
  velocidad de entrega **depende de la gestión de la Tienda Participante y de
  las condiciones de la vía**."

Dos motivos. "Es determinada por la gestión del restaurante" convive mal con la
cláusula de dos párrafos antes, donde **Rappi se obliga a cumplir el ETA**: si
el tiempo lo determina el restaurante, la obligación de Rappi queda en el aire.
Y decir que la velocidad depende también de las condiciones de la vía es más
cierto y protege mejor, porque el trayecto no lo controla ni el restaurante.

## 6. Limpieza de forma

- "tasa de servicio" pasó a "**tarifa** de servicio", que es como lo llaman el
  resto de los modelos y la propia app.
- "Turbo Restaurantes" quedó como un valor con nombre propio en el código, para
  que el día que haya otra modalidad (Turbo Mercados, por ejemplo) se cambie en
  un solo sitio.
- El título del documento se arma solo: "Turbo Restaurantes Bogotá · 15 minutos
  o 100% Cashback · 16 sep 2026". Los publicados lo escribían a mano como
  "15 MINUTOS O 100% CASHBACK TURBO RESTAURANTES BOGOTÁ 16/09/2026", y un título
  escrito a mano puede contradecir el articulado.

---

## Lo que NO toqué, y quiero preguntarte

### Este modelo no tiene organizador aliado

La regla 1 del proyecto dice que Rappi nunca es el organizador y que el
organizador es siempre la tienda o la marca que fondea. En este modelo **no hay
ninguna de las dos**: participan todas las tiendas Turbo de una ciudad, el
presupuesto lo pone Rappi, y la cláusula del beneficio dice literalmente "Rappi
se obliga a cumplir con el ETA exhibido dentro de la Plataforma Rappi".

Mi lectura es que **no choca con la regla**, y por eso no lo anoté como una
segunda excepción: el documento nunca usa la palabra "Organizador", y lo que
Rappi promete aquí no es una promoción de un tercero, sino su propio tiempo de
entrega. Eso es una garantía de servicio, que es otra figura.

Pero la decisión es tuya. Si prefieres que quede escrita como excepción, igual
que Brasil, lo hago en un minuto.

### "Rappi se obliga a cumplir con el ETA"

Es una obligación de resultado escrita en un documento publicado, y el remedio
por incumplirla está tasado (el 100% del valor de los productos, con tope). No
la toqué porque es exactamente lo que la campaña quiere decir, pero la dejo
señalada por si conviene matizarla con las causas que no dependen de Rappi.

### La hora de las campañas publicadas

Bogotá escribía "11:00 a.m." y Barranquilla "07:00 a.m.". El motor las escribe
"11:00 a. m." y "7:00 a. m.", que es el formato del resto de los documentos de
Colombia. Es cosmético, pero conviene que lo sepas antes de comparar.
