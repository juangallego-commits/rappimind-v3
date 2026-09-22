# Revisión legal global · la ronda de pruebas internas

Todo lo de la apertura a los equipos legales de los nueve países: el mensaje del
canal, la hoja de feedback y qué se hace con lo que llegue.

Fecha de apertura: 21 de septiembre de 2026.
**Fecha límite para comentarios: viernes 25 de septiembre de 2026, 6:00 p.m. hora
de Colombia.**

---

## 1. El mensaje de Slack

Canal: **#legalglobal** (privado, `G0180NDSKDX`).

Van dos mensajes, como los escribe Juan: el del canal es el título y todo el
contenido va en el hilo. Las menciones de los abogados de cada país y el `cc`
final los pone Juan.

### Mensaje del canal (el título)

```
RappiMind, pruebas con todos los paises
```

### Primer mensaje del hilo

```
hola teaaam! como estan?

Les presento RappiMind, la herramienta que armamos desde Legal Colombia para que
los comerciales generen solos los T&Cs de sus campañas, sin escribirnos. El
comercial responde hechos (la tienda, las fechas, el porcentaje, el tope, el
presupuesto) y el documento se arma con los modelos que ya aprobamos nosotros. Si
falta un dato, no genera. Cero redaccion de su lado y cero solicitudes del
nuestro.

Solo en Colombia llevamos 1.184 solicitudes de T&Cs en poco mas de un año. La
idea es que eso deje de pasar por una persona.

Ya esta lista para pruebas internas y los necesito a ustedes antes de abrirsela a
comercial.

Que hay hoy:
1. Nueve paises: Colombia, Mexico, Peru, Argentina, Chile, Ecuador, Uruguay,
   Costa Rica y Brasil.
2. Siete tipos de campaña. Colombia tiene seis (Cashback, Cashback Multitienda,
   Carrera de Compras, los dos de Rappi Travel y el de "15 minutos o cashback"
   del boton Turbo). Los demas paises arrancan con Cashback, que es el 55% de la
   demanda real.
3. Brasil tiene modelo propio, con las cuatro formas que nos paso su equipo:
   desconto % OFF, frete gratis, taxa de serviço y taxa mas frete. La interfaz se
   pone en portugues con un boton.
4. Ademas arma las leyendas de las piezas publicitarias: 55 hoy, por pais y por
   categoria (licores, apuestas, Turbo, Mundial y las demas).

OJO con esto, que es lo importante: los datos legales de cada pais (la sociedad,
la jurisdiccion, la autoridad de consumo, los derechos sobre datos personales,
como se llaman los dias, el separador de miles) los propuso la herramienta por
analogia y los confirme yo desde aca. Nadie mejor que ustedes para decirme que
esta mal en su pais. Generen, lean, pero no publiquen nada todavia.
```

### Segundo mensaje del hilo

```
Lo que necesito de ustedes, y la fecha:

ETA viernes 25 de septiembre, 6pm hora Colombia. Lo que llegue despues entra en
la siguiente ronda.

1. Entren, generen dos o tres campañas de su pais con datos inventados y lean el
   documento completo. Con eso solo ya van a ver lo que esta mal.
2. Dejenme el feedback en este sheet: LINK_DEL_SHEET
   Tiene una hoja de LEEME que explica como usarlo, no se la salten. Lo minimo
   que necesito son tres cosas: los hallazgos, los datos legales de su pais y
   quien necesita acceso a Squarespace.
3. Lo de Squarespace: hoy los T&Cs se publican a mano ahi y eso lo hacen una o
   dos personas por pais. En la pestaña 6 me dicen quien es el KAM o la persona
   de su pais que necesita usuario. Maca nos ayuda creando los accesos. Ojo que
   dar acceso a Squarespace es dar la llave del sitio legal, asi que cada nombre
   tiene que venir aprobado por ustedes.
4. Si alguien mas de su equipo quiere probar, me lo dejan en la pestaña 7 y lo
   doy de alta.

Un par de cosas que todavia NO hace, para que no las busquen:
• No publica sola en Squarespace. Genera el documento y ustedes lo pegan.
• No cubre sorteos, rifas ni nada con azar. Eso sigue llegando a Legal y la
  herramienta lo desvia sola con un formulario.
• Descuentos y cupones: en Colombia ya no genera documento, entrega el enlace del
  T&C general que ya publicamos (son catorce). En los demas paises todavia no: si
  tienen T&C generales publicados, mandenmelos y los metemos igual.

El link de la herramienta se los paso por interno, para no dejarlo abierto en el
canal.

El lunes les respondo fila por fila lo que dejaron en el sheet, con que se aplica
y que no.

Me cuentan como la ven!

cc
```

### Antes de mandarlo

1. Subir la hoja a Drive y pegar el enlace en `LINK_DEL_SHEET`.
2. Poner las menciones de los abogados de cada país y el `cc`.
3. Confirmar el enlace de la web app. El último que quedó anotado es

   ```
   https://script.google.com/a/macros/rappi.com/s/AKfycbwvu6ciiAzvvYFVrOznWnMp952cGe4jXTnM4Ek9MbPdyBlWDBz6fVwVeEO7QvmXx7c/exec
   ```

   y es el del despliegue del 17 de septiembre. Si se volvió a desplegar, es otro:
   el bueno sale del despliegue vigente en el proyecto de Apps Script.

---

## 2. La hoja de feedback

Se arma con `python3 scripts/hoja_feedback.py <salida.xlsx>` y se sube a Drive,
que la convierte en Google Sheet con todo lo que trae: pestañas, listas
desplegables, fórmulas, filtros y la fila de cabecera congelada. Los datos salen
del repositorio, no están escritos a mano: `data/paises.json` y
`modelos/leyendas/`. Si cambia un valor, se vuelve a correr y la hoja sale al día.

| Pestaña | Para qué | Filas que ya trae |
|---|---|---|
| LÉEME | Cómo se usa, la fecha límite, las cinco reglas, la escala de severidad y lo que la herramienta no hace | |
| 1 Checklist | Una fila por país, con las cinco tareas y cómo va cada uno | 9 |
| 2 Hallazgos | Lo principal. Una fila por hallazgo, con qué dice hoy y qué debería decir | 2 ejemplos |
| 3 Datos de tu país | Los valores legales de `data/paises.json`, uno por fila, para confirmar o corregir | 194 |
| 4 Preguntas de Legal | Diez preguntas de fondo por país, de las que no se pueden contestar desde Colombia | 90 |
| 5 Leyendas | Las 55 leyendas con su texto impreso, para confirmar la de cada país | 55 |
| 6 Accesos Squarespace | Quién necesita usuario, con la aprobación del abogado del país y las columnas de Maca | 2 |
| 7 Accesos RappiMind | Quién más entra a probar y con qué rol | |
| 8 Cobertura | Qué campaña piden y la herramienta no hace, y el volumen real de cada país | 9 |
| 9 Resumen | Se llena solo con fórmulas: hallazgos por país y por severidad, datos por cambiar, accesos pedidos | 10 |
| Listas | Oculta. Es la fuente de los desplegables | |

Las columnas que empiezan con `[Juan]` y `[Maca]` van en gris: las llena quien
recibe, no quien reporta.

### Por qué está armada así

- **Una fila por hallazgo, con "qué dice hoy" y "qué debería decir".** Un
  comentario suelto no se puede aplicar a un modelo. Un texto exacto sí.
- **Los datos de cada país vienen ya escritos.** Pedirle a un abogado que liste
  de memoria los valores de su país es pedirle un trabajo que ya está hecho; lo
  que hace falta es que confirme o corrija. Por eso la columna del valor actual va
  en verde y no se edita.
- **Las leyendas traen su texto impreso.** Es la única forma de que alguien note
  que falta una advertencia obligatoria de su país.
- **Las preguntas de fondo están separadas de los hallazgos.** No son errores, son
  decisiones legales que dependen de la ley de cada país.

---

## 3. Los accesos a Squarespace

Es el cuadro que pidió el negocio y tiene una regla propia: **dar acceso a
Squarespace es dar acceso a publicar en el sitio legal de Rappi.** Por eso cada
fila lleva el nombre del abogado del país que aprueba, y Maca crea el usuario
solo cuando esa columna está llena.

Hoy solo Colombia tiene gente asignada, y está en `src/core/ayuda.js`:

- Cashback: Camilo Patiño y Valery Medina.
- Concursos: sin asignar. La herramienta manda a pedirlo por `#tyc-rappi`.

Cuando lleguen los nombres nuevos, entran a `ACCESOS_SQUARESPACE` en
`src/core/ayuda.js`, que es de donde salen la pantalla final y la de Ayuda.

---

## 4. Qué se hace con el feedback

1. **Lunes 28.** Leer la hoja completa y marcar cada fila en las columnas grises:
   Aceptado, Aplicado, No se aplica o Necesito hablarlo. Nada se queda sin
   respuesta, porque la próxima vez que se les pida algo se acuerdan.
2. **Los hallazgos aceptados** entran a `modelos/` o a `data/paises.json` según
   corresponda, con su prueba. Los de texto legal se anotan también en
   `docs/PENDIENTES_LEGAL.md`.
3. **Los datos de país corregidos** se escriben en `data/paises.json` y se agregan
   a `confirmaciones` con su nota, como se hizo con el encargo 01. La hoja del
   Sheet manda sobre la semilla: sin esa entrada, cambiar el archivo no mueve una
   fila que ya existe.
4. **Las leyendas nuevas** son archivos nuevos en `modelos/leyendas/`, con su
   cabecera completa.
5. **Responder en el hilo** con el resumen: cuántos hallazgos, cuántos se
   aplicaron y qué quedó abierto.
