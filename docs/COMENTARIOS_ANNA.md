# Comentarios de Anna: qué se hizo con cada uno

Los once puntos, con qué cambió, dónde está en el código y en qué captura se ve.

Estado: **los once resueltos.** Dos necesitan algo tuyo antes de cerrarse del
todo, y está dicho en cada uno.

---

## 1. Paso 3 "Publica los T&Cs", con su texto

**Qué cambió.** La pantalla de inicio muestra tres pasos. El tercero se llama
exactamente "Publica los T&Cs" y dice, palabra por palabra:

> En 2 minutos recibirás un email con el documento generado y listo para publicar
> en Squarespace. Recuerda seguir las instrucciones para asegurar que los T&Cs
> queden publicados exitosamente.

**Dónde.** `src/client/js/60-flujo.js`, función `pantallaInicio`.

**Captura.** `docs/capturas/01-inicio.png`

---

## 2. "Consumo en el local" separado de dónde se gastan los Créditos

**Qué cambió.** Eran dos cosas mezcladas y ahora son dos preguntas distintas, en
pasos distintos.

- **"¿Dónde puede gastar los Créditos?"** está en el paso de los Créditos y
  responde dónde se redime el saldo: solo en esta tienda, en ciertas secciones o
  en cualquier parte de Rappi.
- **"¿Aplica solo en algún caso especial?"** está en el paso del beneficio y es
  una casilla: "Solo para consumo en el local", explicada como *el usuario come
  en el restaurante, no pide domicilio*.

**Dónde.** `src/core/preguntas.js`, campos `redencion` y `condiciones`.

**Captura.** `docs/capturas/06-porcentaje-y-documento.png` (paso del beneficio) y
`docs/capturas/09-resumen-completo.png` (las dos por separado en el resumen).

---

## 3. Casillas cuando las opciones no son excluyentes

**Qué cambió.** Las preguntas donde se puede marcar más de una cosa usan casillas
de verdad, no botones de opción única. Son dos: las condiciones especiales
("Solo Turbo", "Solo consumo en el local") y las secciones donde se redimen los
Créditos.

Todo lo demás son botones grandes de una sola elección, cada uno con una línea
que explica qué significa.

**Dónde.** `src/client/js/50-campos.js`, funciones `controlCasillas` y
`controlOpciones`. La marca `multiple: true` en `src/core/preguntas.js` decide
cuál se usa.

---

## 4. El botón Generar deshabilitado hasta completar

**Qué cambió.** En el resumen, "Generar T&C" está deshabilitado **y se ve
deshabilitado**: gris, sin color de acción, con el cursor de no permitido. No es
un botón que parece activo y luego regaña.

Debajo aparece la lista **"Te falta:"** con cada cosa que falta, en las mismas
palabras del mensaje de error de esa pregunta. No dice "complete los campos
obligatorios": dice qué falta y cómo se arregla.

**Dónde.** `src/client/js/66-resumen.js`, funciones `loQueFalta` y
`pantallaResumen`. El botón se deshabilita con el mismo `validarSolicitud` que
usa el servidor, así que nunca se habilita por error.

**Capturas.** `docs/capturas/08-resumen-con-faltantes.png` y
`docs/capturas/09-resumen-completo.png`

---

## 5. Aviso destacado sobre azar, con ejemplos

**Qué cambió.** Es lo primero de la pantalla de Ayuda, en un bloque destacado.
Dice que ante cualquier duda hay que confirmar con el equipo legal del país
**antes de lanzar**, no después.

Incluye por qué importa, ejemplos de dinámicas que sí sirven, ejemplos que no
(sorteo, rifa, raspa y gana, ruleta, premio al pedido número N) y casos de
frontera que hay que consultar igual. Cierra con una regla simple: *si dos
personas hacen exactamente lo mismo y una puede ganar y la otra no, hay azar*.

**Pendiente tuyo.** Todo ese bloque está marcado en pantalla como **borrador
pendiente de tu revisión**, porque es contenido legal y no es mío. Lo escribí con
la formulación más conservadora posible.

**Dónde.** `src/core/ayuda.js`, constante `AVISO_AZAR`. El texto completo para
revisar está en `docs/CONTENIDO_AYUDA.md`.

**Captura.** `docs/capturas/11-ayuda.png`

---

## 6. Sin Dave: Paula, Anna y Juan

**Qué cambió.** La sección de contactos tiene a Paula Barahona, Anna Habermann y
Juan Camilo Gallego, cada uno con una línea de para qué buscarlo. Dave no
aparece por ningún lado, y hay una prueba automática que se cae si vuelve a
aparecer.

**Pendiente tuyo.** No inventé los correos. Están como `[PENDIENTE: correo]` para
que los completes.

**Dónde.** `src/core/ayuda.js`, constante `CONTACTOS`.
La prueba: `pruebas/ayuda.test.js`, "los contactos son los tres que pidió Anna,
sin Dave".

---

## 7. Canal de ayuda global, con enlace configurable

**Qué cambió.** La pantalla de Ayuda tiene su sección de canal de ayuda. El
enlace sale de la propiedad de script `CANAL_AYUDA_URL`, así que se cambia sin
tocar código. Si no está configurada, la pantalla lo dice en vez de mostrar un
enlace roto.

El mismo enlace va en el correo que recibe el comercial.

**Dónde.** `src/client/js/68-pantallas.js`, función `pantallaAyuda`.
La propiedad: `src/server/Config.js`, `PROPIEDADES.CANAL_AYUDA_URL`.

---

## 8. Guía de Squarespace con capturas

**Qué cambió.** Seis pasos numerados. Cada uno dice qué hacer y qué se debería
ver después, y trae un marcador `[CAPTURA 1]` a `[CAPTURA 6]` donde van las
imágenes. Además, una tabla de qué hacer si algo sale mal: el enlace no abre, el
texto se ve corrido, el enlace no es de promos.rappi.com.

La guía aparece en dos lugares: en la pantalla final, justo después de generar, y
en Ayuda, para consultarla cuando haga falta.

**Pendiente.** Las imágenes no existen todavía. Los marcadores están puestos y se
ven como recuadros punteados.

**Dónde.** `src/core/ayuda.js`, `PASOS_SQUARESPACE` y `SI_ALGO_SALE_MAL`.

**Captura.** `docs/capturas/10-listo.png`

---

## 9. Documentos siempre en la carpeta del país

**Qué cambió.** El documento se crea y se mueve a la subcarpeta del país dentro
de la carpeta de RappiMind. Nunca queda en una carpeta general ni en la raíz de
Drive. `setup()` crea una subcarpeta por país, y si alguna falta se crea en el
momento.

**Dónde.** `src/server/AdaptadorDocumento.js`, función `crearDocumento`.
La carpeta: `src/server/Datos.js`, función `carpetaDelPais`.

**Prueba.** `pruebas/servidor.test.js`, "el documento queda en la carpeta del
país, nunca en una general". Verifica que el archivo terminó en `CO · Colombia`.

---

## 10. Campo para el link publicado

**Qué cambió.** La pantalla final tiene el campo para pegar el enlace y el botón
"Marcar como publicado". El enlace tiene que empezar por
`https://promos.rappi.com/`; si no, el mensaje explica que la página quedó en
otro sitio y que tiene que estar dentro de promos.rappi.com.

Al guardarlo, la campaña pasa a "publicado" y se ve en verde en el historial.

**Dónde.** `src/client/js/66-resumen.js`, función `pantallaListo`.
La validación: `src/core/validaciones.js`, `validarLinkPublicado`.
El guardado: `src/server/Api.js`, `marcarPublicado`.

**Capturas.** `docs/capturas/10-listo.png` y `docs/capturas/12-historial.png`

---

## 11. La coronita

**Qué cambió.** Se quedó. Va sobre la "M" de RappiMind, pequeña, en naranja, como
si la palabra la llevara puesta. No es un logo aparte ni un adorno centrado: es
parte de la palabra, y por eso no se vuelve cursi. En pantallas pequeñas no se
quita, solo se reduce.

**Dónde.** `src/client/js/10-util.js`, función `corona` (un SVG de siete puntos).
La posición: `src/client/estilos.css`, clase `.marca .corona`.

**Captura.** Arriba a la izquierda en todas. Se ve grande en
`docs/capturas/01-inicio.png`.

---

## Lo que necesito de ti para cerrar los once

1. Revisar el bloque de azar del punto 5 (`docs/CONTENIDO_AYUDA.md`).
2. Los correos de Paula, Anna y el tuyo, del punto 6.
3. Las capturas de Squarespace del punto 8, cuando las tengas.
