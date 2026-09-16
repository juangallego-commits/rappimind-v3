# Qué piden de verdad los comerciales

Análisis de las 1.184 solicitudes reales del formulario actual de Legal Colombia,
entre el 9 de julio de 2024 y el 15 de septiembre de 2026.

El Sheet se leyó **solo en lectura** y no se copió al repositorio. Ningún nombre,
correo ni teléfono salió de ahí: las columnas de solicitante, responsable de Rappi
y responsable legal se excluyeron del análisis. Los nombres de tienda de los
ejemplos de esta página son inventados.

Esto es lo que fija los valores por defecto de la interfaz. La regla es simple:
**el caso mayoritario se tiene que resolver sin escribir nada.**

## Qué tan dominante es cada cosa

| Dato | Realidad | Qué hace la interfaz |
|---|---|---|
| País | 1.160 de 1.163 son Colombia | Colombia preseleccionada |
| Tipo | Cashback es el 55% de las promociones | Cashback primero y preseleccionado |
| Duración de un Cashback | Un solo día en el 73% | La fecha de fin se autocompleta igual a la de inicio |
| Duración de una Carrera | Mediana de 22 días | Se propone un mes |
| Máximo de pedidos | 1 en el 51% | "Una sola vez" preseleccionado |
| Redención | Solo en la tienda en 271 de 396 | "Solo en esta tienda" preseleccionado |
| Carga de Créditos | Al día siguiente en 222; inmediata en 89 | "Al día siguiente" preseleccionado |
| Cobertura | Nacional en cerca del 60% | Nacional preseleccionado |
| Segmento | Todos 355; Pro y Pro Black 300 | Pro y Pro Black en segundo lugar |
| Método de pago | Todos en 397 | "Todos" preseleccionado |

## Valores típicos, para los ejemplos de cada campo

- **Porcentaje**: 99% domina (62 de 121), luego 50%, 30%, 20% y 10%. El 99% siempre
  viene con tope.
- **Tope por pedido**: 25.000 en más de la mitad de los casos. Luego 50.000, 30.000
  y 20.000.
- **Presupuesto**: mediana 15.000.000. Rango habitual de 5 a 40 millones.
- **Compra mínima**: solo el 15% la exige. Cuando la exige, 100.000 es lo más común.
- **Vigencia de los Créditos**: mediana de 6 días cuando se expresa en días; 5, 7 y
  30 son los valores repetidos. La mayoría la expresa como rango de fechas.
- **Nombre de campaña**: mediana de 24 caracteres, percentil 90 en 42. El patrón es
  porcentaje más "cashback" más marca.

Estos valores van en la **ayuda** de cada campo, no precargados. Precargar un
porcentaje o un tope invita a dejarlo como está sin pensarlo, y eso es
exactamente el error que esta herramienta debe evitar.

La excepción son las opciones de lista donde existe un caso mayoritario claro y
sin riesgo (una sola vez, solo en esta tienda, al día siguiente, nacional): ahí sí
se preselecciona, porque el comercial siempre ve la opción elegida y puede cambiarla.

## Los errores que comete hoy la gente, y cómo los mata la interfaz

1. **El porcentaje no se responde.** El 69% de los cashback escribe "NA" en el campo
   de porcentaje y lo mete dentro del nombre de la campaña. 64 ponen varios
   porcentajes y 48 ponen rangos del tipo "desde 10% hasta 50%".
   → Campo numérico entero obligatorio, sin texto libre. Varios porcentajes o un
   rango es otra campaña, y hay que decirlo ahí mismo.
2. **"NA" por todas partes.** Mínimo de compra con NA en 335 de 396; condiciones
   adicionales con NA en 343 de 396.
   → Ningún campo opcional es texto libre. Casilla o lista con opción explícita.
3. **494 formatos distintos de horario**, desde "0:00-23:59" hasta "11am a 9.30pm" y
   "Todo el día".
   → Selectores de hora con 00:00 y 23:59 por defecto. Sin texto libre.
4. **243 y 329 redacciones distintas** para la vigencia y el momento de carga.
   → Listas cerradas.
5. **246 redacciones distintas de la cobertura.**
   → Nacional o ciudades, con Bogotá, Cali, Medellín, Cúcuta, Bucaramanga y
   Barranquilla como sugerencias clicables.
6. **78 solicitudes listan tres o más tiendas dentro de un campo de texto**, una llega
   a 93 marcas, y 51 tienen el campo de tienda con más de 60 caracteres porque meten
   la lista completa ahí.
   → Esto confirma el componente repetible de Cashback Day. El máximo de 60 tiendas
   es realista y no hay que bajarlo.
7. **El 8% pide la campaña con fecha de inicio ya pasada** y el 27% envía con dos días
   o menos de antelación. La mediana de antelación es de 5 días.
   → Se permite hoy, se avisa cuando faltan menos de 48 horas y se bloquea el pasado
   explicando que los T&C se publican antes de que arranque la campaña.

## Lo que confirma el filtro de entrada

- 34 de 148 solicitudes (23%) declaran que el aliado o el maker tiene sus propios T&C.
- 23 mencionan sorteo, rifa o azar.
- En concursos, 108 de 339 premios son boletas, conciertos, festivales o experiencias,
  y solo 20 mencionan Créditos.

O sea que el filtro va a desviar a Legal una parte grande de los concursos. Por eso
la pantalla "Esta campaña la redacta Legal" no puede sentirse un castigo: explica por
qué y lleva al formulario con un clic.

## Lo que queda fuera del alcance de v3

**Rappi Travel es el 12% de la demanda** (138 de 1.184) y no está en v3. Necesita una
salida explícita hacia Legal, no un error genérico.

## Para Juan

- El 413 de las solicitudes están marcadas como publicadas y hay 421 enlaces a
  promos.rappi.com guardados. El paso de pegar el enlace publicado refleja el
  proceso real.
- En las solicitudes reales aparece una sección **Express** que no está en
  `data/secciones.json`, y no aparecen **Farmacia** ni **Tiendas especializadas**,
  que sí están en el archivo. Anotado en `docs/PENDIENTES_LEGAL.md`.
