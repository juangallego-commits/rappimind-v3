# Ronda 3: las auditorías del cambio de identidad

Los informes de los auditores de `docs/PROMPT_IDENTIDAD.md`, ronda 3, corridos
sobre el resultado de las ocho fases. Se guardan tal como los entregaron, con
sus hallazgos y su evidencia, porque son el material que lee el revisor de la
ronda 4 y porque cada arreglo posterior se justifica contra uno de ellos.

Lo que dice "medido" se midió en el navegador o con el script; lo que dice
"deducido" es lectura de código.

---

## CONTRASTE

**14 hallazgos**: 1 roto, 2 serio, 4 menor, 7 nota

La primera pregunta del encargo se contesta rápido y en verde: npm run contraste devuelve 0 de verdad y mide los tokens que se sirven, no los de la entrega. Lo comprobé apuntando una copia del script a docs/diseno/tokens/, donde la misma lista falla en tres pares y después revienta. Los seis arreglos están donde tienen que estar. La segunda pregunta es la que trae carga. Buscando los pares que la lista no cubre apareció un defecto real de accesibilidad, no una sospecha: la píldora "Publicado" del historial lleva letra blanca de 13px sobre el gradiente completo, y en ningún punto de esa píldora el blanco llega a los 4.5 que pide el texto normal. Medido va de 2.34 a 3.79, y el máximo de todo el tramo del gradiente es 3.79, así que no hay dónde esconderse: no es cuestión de afinar el tono. PARES mide los estados generado, borrador y vencido, y justo el único que lleva gradiente se quedó fuera de la lista. Lo que hizo posible que pasara vale más que el defecto mismo, y es el segundo hallazgo: la nota del par "blanco sobre el gradiente al 0%" afirma que esa parada no lleva texto porque la decisión 98 recorta el gradiente. Eso vale para el botón primario y para nada más. Hay tres reglas que pintan blanco sobre el gradiente sin recortar, y con la nota redactada en general ninguna de las tres se mide. El mismo patrón se repite en pequeño con la píldora de vencido, cuya nota dice "es una etiqueta" y cuyo token ahora también pinta el asa de la hoja del celular, que no es una etiqueta. La lección para la ronda 4 es una sola: una nota escrita para un uso deja de ser cierta en cuanto el token consigue un segundo uso, y hoy no hay nada que avise. El tercero es chico pero es una falla de texto de verdad: el enlace a #tyc-rappi dentro del panel celeste da 4.31 donde pide 4.5. Se arregla oscureciendo el neón de texto de #D91F20 a #D41D1E, que mejora los cinco sitios donde ese token ya vive y no empeora ninguno. Lo que sí aguanta, y lo digo con números porque el encargo pedía dudarlo, es el botón primario. Medí los catorce tamaños distintos que salen en las 46 pantallas, del más angosto al de 260px, tomando el pixel real debajo de las letras: el peor punto va de 3.40 a 3.20, y el piso teórico del tramo recortado entero es 3.00. La decisión 98 se sostiene en todo el recorrido del gradiente, no solo en el arranque, y el par que la vigila apunta al peor punto, que es lo correcto. El resto son once anotaciones de durabilidad: pares que hoy llegan pero que nadie mide, medidas tomadas contra papel cuando el fondo de página es niebla, un color crudo que quedó fuera de los tokens, y dos cosas de fontanería que importan más de lo que parecen. Una, que scripts/contraste.js lee los tokens en orden alfabético en vez de pedirle el orden a scripts/lib/hoja-completa.js, que es el archivo que dice ser el único sitio donde ese orden está escrito; hoy no hay colisión entre los 170 tokens, pero rappimind.css existe precisamente para pisar a los demás. Y dos, que npm run contraste no lo corre nadie: no está en npm test, ni en push.js, ni hay prueba que lo importe. Todo el trabajo de esta ronda lo sostiene que alguien se acuerde de escribir el comando. En resumen: uno roto, dos serios, cuatro menores y el resto anotaciones. Nada de esto se arregla desde aquí, que era la regla, y la decisión sobre la píldora Publicado no es técnica sino de Juan, porque el gradiente es hoy lo único que distingue publicado de generado en una lista larga.

### [roto] La píldora "Publicado" del historial lleva letra blanca de 13px sobre el gradiente COMPLETO. Es texto normal, así que le toca 4.5:1, y en ningún punto de esa píldora el blanco llega. Es el único par de la paleta que hoy falla de verdad, y la lista PARES no lo mide: mide "estado generado", "estado borrador" y "estado vencido", y justo el que lleva gradiente se quedó fuera.

- **Dónde**: src/client/estilos.css:752 y 758 (.estado con font-size 13px y font-weight 800, y .estado-publicado), src/client/tokens/rappimind.css:111 y 112 (--rm-estado-publicado-bg = var(--rm-grad), fg #FFFFFF). La lista que no lo cubre: scripts/contraste.js:128 a 130.
- **Cómo se supo**: medido
- **Evidencia**: Playwright sobre docs/FRONT_ACTUAL.html, con el texto puesto en transparente para que cada pixel del recorte fuera fondo puro. La píldora mide 78x26px. Bajo la caja del texto (x 11 a 67, y 7 a 18) el peor pixel es rgb(255,94,64) = 3.03:1 y el mejor rgb(255,37,40) = 3.79:1. En el interior de la píldora, quitando el borde antialiasado, el peor es rgb(255,135,120) = 2.34:1. El máximo teórico de todo el tramo del gradiente contra blanco es 3.79:1, así que no hay ningún punto donde esa letra llegue a 4.5. A 13px y peso 800 no aplica el umbral de texto grande de WCAG, que empieza en 18.66px en negrita.
- **Arreglo propuesto**: Es decisión de Juan, no técnica, porque toca la única señal que distingue Publicado de Generado. Dos salidas medidas: (a) fondo plano --rm-neon-presionado #A81718, que da 7.5:1 con blanco y deja Publicado siendo el único estado con acento fuerte; (b) mantener el gradiente y bajar el texto a tinta, que da 4.99:1 sobre el punto más claro, aunque el brand book manda blanco sobre neón. El gradiente de hover no sirve de salida: su punto más claro con blanco da 3.37:1, sigue por debajo de 4.5. Sea cual sea, agregar el par a PARES como { que: 'letra de la pildora Publicado', frente: '--rm-estado-publicado-fg', fondo: '--color-neon-orange', min: 4.5 }, que es la parada más clara del gradiente.

### [serio] La nota del par "blanco sobre el gradiente al 0%" ya no dice la verdad, y es justo lo que dejó pasar el defecto de arriba. La nota afirma que esa parada no lleva texto porque la decisión 98 recorta el gradiente del botón al 17%. Eso vale para el botón primario y para nada más: hay tres sitios que pintan blanco sobre el gradiente SIN recortar, y uno de ellos es la píldora Publicado.

- **Dónde**: scripts/contraste.js:122 y 123 (el par y su nota). Los tres sitios que la contradicen: src/client/estilos.css:515 (.mensaje-ok svg, background var(--gradiente) con color var(--papel)), 563 (.opcion elegida::before, background var(--gradiente) rodeado de un anillo blanco de 4px) y 758 (.estado-publicado).
- **Cómo se supo**: medido
- **Evidencia**: El recorte del botón sí existe y sí funciona: --rm-grad-boton arranca en #FF6041 (rappimind.css:72). Pero --rm-grad (rappimind.css:62) arranca en #FF7A4D, que con blanco da 2.58:1, y ese es el que usan las tres reglas de arriba. Medido en el navegador: el icono blanco de .mensaje-ok da 3.11:1 en su peor pixel y el disco de la opción elegida va de 3.09:1 a 3.79:1 contra su anillo blanco. La píldora, 2.34:1.
- **Arreglo propuesto**: Acotar la nota a lo que de verdad cubre: "el botón primario recorta el gradiente al 17%, así que esta parada no lleva SU texto", y agregar un par por cada uno de los otros tres usos, con su mínimo propio (3 para los dos objetos gráficos, 4.5 para la píldora). Mientras la nota siga redactada en general, cualquier pieza nueva que ponga blanco sobre --rm-grad pasa sin que nadie la mida.

### [serio] El enlace a #tyc-rappi dentro del panel celeste da 4.31:1 y le toca 4.5. Es el único par de texto de las 46 pantallas que no llega. PARES mide --rm-aviso-error-color sobre papel y sobre niebla, pero nunca sobre el celeste del panel informativo, y ahí es donde cae.

- **Dónde**: src/client/js/66-resumen.js:212 (el enlace) dentro del panel creado en src/client/js/66-resumen.js:187 con clase 'aviso'. El color sale de src/client/estilos.css:118 (a { color: var(--neon-texto) }) y el fondo de src/client/tokens/rappimind.css:104 (--rm-aviso-info-bg #D9F1FF). Pares que no lo cubren: scripts/contraste.js:117 y 118.
- **Cómo se supo**: medido
- **Evidencia**: Recorrido de las 46 pantallas de docs/FRONT_ACTUAL.html con Playwright, midiendo color y fondo efectivo de los 205 pares de texto distintos que hay. Salió uno solo por debajo: rgb(217,31,32) sobre rgb(217,241,255) a 14.5px peso 500 = 4.31:1, ruta div > div.aviso > p > a, texto "#tyc-rappi". El mismo enlace sobre papel da 5.04:1 y sobre niebla 4.62:1, por eso pasó desapercibido.
- **Arreglo propuesto**: Oscurecer --rm-neon-texto de #D91F20 a #D41D1E. Medido: celeste 4.50, papel 5.26, niebla 4.82, beige 4.70, y blanco encima 5.26, o sea que mejora los cinco sitios donde ese token ya se usa (mensaje de error, enlaces, subrayado del hueco, número del paso de publicar y el selector de idioma activo) y ninguno empeora. Y agregar el par 'enlace sobre el panel informativo' a PARES, porque hoy un pastel nuevo con texto de acento encima entra sin medirse.

### [menor] La barra del paso ACTUAL no está en PARES y da 2.36:1 contra el fondo de página. El carril del paso pendiente sí está, con nota; el paso hecho también. El único segmento que no se mide es precisamente el que dice dónde estás.

- **Dónde**: src/client/estilos.css:368 (.progreso .actual button::before, background var(--paso-actual)) y 897 (la versión de celular, .progreso-linea::before). El token: src/client/tokens/rappimind.css:93 (--rm-paso-actual = var(--rm-grad)). Pares vecinos que sí existen: scripts/contraste.js:161 y 162.
- **Cómo se supo**: medido
- **Evidencia**: Recorte de la barra en el navegador: el peor pixel del interior contra la niebla de página da 2.12:1 y el mejor 3.47:1. La cuenta pura sobre las paradas del gradiente confirma el rango: #FF7A4D sobre #F4F5F6 = 2.36:1, #FF2526 = 3.47:1, #FF4583 = 2.99:1. Dos de las tres paradas quedan por debajo de 3.
- **Arreglo propuesto**: Agregar el par con mínimo 3. Si se acepta por debajo, la nota está escrita a mano en la hoja y es razonable: el paso actual también va en tinta y peso 800 (estilos.css:370) y encima está la línea "Paso 7 de 9 · Participantes" (estilos.css:337), así que el color no es el único portador. Pero eso tiene que quedar escrito en PARES como está escrito para el carril pendiente, no sobrentendido.

### [menor] La nota "WCAG exime los componentes inactivos" cubre el borde del campo deshabilitado, pero ese mismo token pinta el borde de .opcion-vencida, que a propósito NO va con disabled para que siga recibiendo foco. Un control que sí es operable no está exento, y ahí el borde da 1.24:1. Encima su fondo es niebla, igual que el fondo de página, así que la tarjeta se queda sin ningún límite visible.

- **Dónde**: src/client/estilos.css:596 a 599 (.opcion-vencida, background var(--rm-opcion-off-bg) que es niebla y border-color var(--campo-off-borde)); el comentario que explica por qué no lleva disabled está en las líneas 592 a 595. El token: src/client/tokens/rappimind.css:84 (--rm-campo-off-borde = var(--rm-linea), rgba(10,10,10,.10)). La nota que no lo alcanza: scripts/contraste.js:145 y 146.
- **Cómo se supo**: deducido
- **Evidencia**: Cuenta sobre los tokens con la misma matemática de scripts/contraste.js: rgba(10,10,10,.10) sobre #FFFFFF da 1.24:1 y sobre #F4F5F6 da 1.23:1. El fondo de página es niebla (estilos.css:94) y el de la opción vencida también es niebla, o sea 1.00:1 entre la tarjeta y la página. No lo pude medir en el navegador porque ninguna de las 46 pantallas congeladas dibuja una opción vencida (está en el texto del anexo de la hoja, no como elemento).
- **Arreglo propuesto**: Agregar el par 'borde de la opcion vencida' con mínimo 3 y sin la nota de inactivo, que no aplica. Para resolverlo sin tocar producto, el borde de esa tarjeta puede quedarse en --rm-borde-opcion o subir a --rm-borde-secundario; con la niebla de fondo hace falta llegar a 3:1 o dejar escrito que lo que identifica el control es el texto.

### [menor] Siete pares de PARES miden contra #FFFFFF cosas que en pantalla no están sobre papel. El fondo de página es niebla, y la tarjeta de la opción elegida ni siquiera es papel: su tinte es translúcido y compone sobre la niebla. El informe imprime un margen mayor que el real.

- **Dónde**: scripts/contraste.js:133 a 136 (los cuatro bordes de campo y opción), 161 y 162 (las barras de progreso) y 165 (la píldora de vencido), todos con fondo '#FFFFFF'. El fondo real de página: src/client/estilos.css:94 (body background var(--niebla)). El tinte que pisa al papel: src/client/estilos.css:560 (.opcion elegida, background var(--rm-opcion-sel-bg), que es rgba y borra el var(--papel) de la línea 545).
- **Cómo se supo**: medido
- **Evidencia**: Leído del navegador: el fondo calculado de una opción elegida es rgb(244,236,237), no blanco, porque rgba(255,37,38,.045) compone sobre la niebla de página. Con eso, 'borde de la opcion elegida' no es 3.79:1 sino 3.47:1, y 'borde del campo vacio' sobre niebla es 3.01:1 en vez de 3.07:1. Ninguno cambia de veredicto hoy, pero tres de ellos quedan a dos centésimas del mínimo.
- **Arreglo propuesto**: Duplicar esos pares con el fondo que de verdad les toca, como ya se hace con el texto, que se mide sobre papel y sobre niebla. Con 3.00 y 3.01 de margen real, cualquier retoque futuro del alfa los cruza sin aviso.

### [menor] El visto blanco de "Así queda" va sobre el gradiente sin recortar y pasa por once centésimas. Es un objeto gráfico que comunica información, le toca 3:1, y nadie lo mide.

- **Dónde**: src/client/estilos.css:513 a 516 (.mensaje-ok svg, background var(--gradiente), color var(--papel), 18px con 3px de relleno).
- **Cómo se supo**: medido
- **Evidencia**: Recorte del icono en el navegador, sin el borde antialiasado: el peor pixel donde vive el trazo es rgb(255,89,62) = 3.11:1 y el mejor rgb(255,39,39) = 3.77:1. La esquina superior izquierda del círculo, que queda debajo del relleno, es #FF7A4D = 2.58:1. Basta agrandar el icono o mover el trazo un par de pixeles hacia la esquina para bajar de 3.
- **Arreglo propuesto**: Agregar el par con mínimo 3 usando --color-neon-orange como fondo, que es el peor caso de ese círculo, y no la parada del 55%. Si se quiere margen, el círculo puede llevar --rm-grad-boton en vez de --rm-grad, que es el mismo gradiente ya recortado y arranca en 3.00:1.

### [nota] El asa de la hoja deslizable del celular usa --rm-estado-vencido-borde, cuya nota en PARES dice "es una etiqueta, no un control, y su significado lo carga el texto". El asa no es una etiqueta ni tiene texto. Da 1.57:1. Está bien que no se mida, pero por otra razón, y esa razón no está escrita.

- **Dónde**: src/client/estilos.css:791 (.asa, background var(--rm-estado-vencido-borde)). El token y su otra vida: src/client/tokens/rappimind.css:117 y src/client/estilos.css:760. La nota: scripts/contraste.js:165 y 166.
- **Cómo se supo**: medido
- **Evidencia**: Estilo calculado leído en el navegador: fondo rgba(10,10,10,0.2) sobre un padre rgb(255,255,255), que da 1.57:1. Es exento porque el asa es decorativa: cerrar la hoja tiene tres caminos con nombre propio, un botón "Cerrar" (src/client/js/70-app.js:76), el clic en la cortina (70-app.js:97) y la tecla Escape (70-app.js:98 a 100), así que el asa no es la única forma de entender ni de operar la hoja.
- **Arreglo propuesto**: Agregar el par 'asa de la hoja deslizable' con su propia nota, que es distinta de la de la píldora: es un adorno de arrastre y la hoja se cierra por botón, cortina y Escape. Un token con dos usos y una sola nota escrita para uno de ellos es el patrón que ya falló en el hallazgo del gradiente.

### [nota] Trece pares más que la lista no cubre y que hoy sí llegan. Ninguno es un defecto ahora mismo; se anotan porque son los que se rompen en silencio la próxima vez que se mueva un token.

- **Dónde**: src/client/estilos.css: 630 (panel del glosario, papel sobre tinta, 19.8:1), 930 (botón flotante, papel sobre tinta, 19.8:1), 812 (selector de idioma activo, papel sobre --neon-texto, 5.04:1), 171 (subrayado del enlace de la sección actual, --neon sobre papel, 3.79:1), 726 (viñeta de "te falta", --neon sobre niebla, 3.47:1), 615 (borde de la píldora de sugerencia, 3.07:1 sobre papel y 3.01:1 sobre niebla), 552 (marca redonda de la opción sin elegir, 3.07:1), 563 (disco de la opción elegida contra su anillo blanco, de 3.09:1 a 3.79:1 medido), 406 a 413 (borde de "opcional", 1.66:1, es etiqueta y su texto la carga), 544 (borde de la opción sin elegir, 1.30:1, lo identifica la marca redonda), 224 y 864 (las reglas de gradiente del aviso serio y del panel de momento sobre beige, de 2.30:1 a 3.38:1, decorativas), 279 (gradiente de hover del botón, sin recortar, peor punto 3.37:1 medido), 947 (contorno --neon del destello en movimiento reducido).
- **Cómo se supo**: medido
- **Evidencia**: Los de texto y los dos de gradiente salen de Playwright sobre docs/FRONT_ACTUAL.html. Los de borde salen de la cuenta sobre los tokens con las funciones que exporta scripts/contraste.js, así que usan la misma matemática que el informe. El gradiente de hover lo medí pintando una caja del tamaño exacto del botón real, 112x40 y 260x40: peor punto rgb(232,95,57) = 3.43:1 y rgb(232,97,58) = 3.39:1. Pasa, pero conviene notar que hover sustituye el gradiente recortado de la decisión 98 por uno completo desde el 0%, y solo se salva porque el gradiente de hover ya es más oscuro.
- **Arreglo propuesto**: Agregarlos a PARES con su mínimo, y con nota donde se acepte por debajo (opcional, borde de opción, reglas decorativas). El de hover merece además una línea en el comentario de la decisión 98, porque hoy el razonamiento del recorte está escrito solo para el estado de reposo.

### [nota] npm run contraste no lo corre nadie automáticamente. No está en npm test, ni en scripts/push.js, ni hay ninguna prueba de pruebas/ que requiera scripts/contraste.js. Los seis arreglos de la auditoría los cuida únicamente que alguien se acuerde de escribir el comando.

- **Dónde**: package.json:13 ("test": "node --test pruebas/**/*.test.js") y package.json:17 ("contraste"). scripts/push.js:10 solo menciona npm test en un comentario.
- **Cómo se supo**: medido
- **Evidencia**: npm test corre 678 pruebas, todas en verde, y ninguna toca el contraste: grep de "contraste" en pruebas/ no devuelve nada. En cambio la hoja sí tiene red para otras cosas, por ejemplo la prueba de que toda variable usada está definida y la de que la familia de display solo se usa en peso 900.
- **Arreglo propuesto**: Una prueba de pruebas/ que importe PARES de scripts/contraste.js y falle si algún par sin nota no llega, igual que la prueba que ya cuida las variables. Así el guardián vive dentro de la puerta que CLAUDE.md obliga a cruzar antes de cada push, y no al lado de ella.

### [nota] scripts/contraste.js lee los cinco archivos de tokens en orden alfabético, no en el orden en que se sirven. Es el quinto consumidor del orden de concatenación y el único que no lo pide a scripts/lib/hoja-completa.js, que en su propio comentario dice ser el único sitio donde ese orden está escrito.

- **Dónde**: scripts/contraste.js:33 a 43 (leerTokens, que recorre listarArchivos), scripts/lib/archivos.js:66 a 74 (listarArchivos ordena alfabéticamente) frente a scripts/lib/hoja-completa.js, constante ORDEN.
- **Cómo se supo**: deducido
- **Evidencia**: El orden que se sirve es fonts, colors, typography, spacing, rappimind, con rappimind al final para que pueda pisar a los de marca. El alfabético es colors, fonts, rappimind, spacing, typography, o sea que rappimind se lee TERCERO y spacing y typography lo pisarían. Hoy no hay daño: revisé los 170 tokens de src/client/tokens/ y ninguno está definido en más de un archivo. Pero rappimind.css está escrito justo para poder pisar, así que la colisión es cuestión de tiempo, y cuando llegue el informe medirá un valor que el navegador no usa.
- **Arreglo propuesto**: Que leerTokens pida el orden a hoja-completa.js en vez de a la lista alfabética de la carpeta, o que al menos recorra la constante ORDEN. Es el mismo modo de falla de la skill frontera-apps-script: el dato no llega y el síntoma aparece lejos de la causa.

### [nota] El comentario del token de neón de texto dice 4.53:1 sobre niebla y el valor real es 4.62:1. No cambia ningún veredicto, pero es el número con el que alguien va a decidir si puede oscurecerlo o no.

- **Dónde**: src/client/tokens/rappimind.css:61 (--rm-neon-texto: #D91F20; comentario "5.04:1 sobre papel, 4.53:1 sobre niebla").
- **Cómo se supo**: medido
- **Evidencia**: npm run contraste imprime "mensaje de error sobre niebla 4.62:1", que es exactamente ese par. Los otros comentarios de valores del archivo sí coinciden: el borde de control 3.07 y 3.01, el marcador 4.95 y 4.54, el subrayado del hueco 4.5.
- **Arreglo propuesto**: Corregir el comentario a 4.62:1. Si además se adopta el #D41D1E del hallazgo del enlace celeste, hay que reescribir los cuatro números de esa línea.

### [nota] Queda un color crudo en la hoja, fuera de todo token. La fase 1 subió a token los seis que había; este no está entre ellos porque la sombra va hacia arriba y ningún token la cubría.

- **Dónde**: src/client/estilos.css:785 (.hoja-deslizable, box-shadow: 0 -8px 32px rgba(10, 10, 10, 0.13)).
- **Cómo se supo**: medido
- **Evidencia**: Barrido de todas las declaraciones con color de src/client/estilos.css: es el único valor de color escrito a mano en las 948 líneas. Los demás van por var(). El rgb ya es el de la tinta nueva, así que no está despintado, pero un cambio de marca que mueva la tinta lo deja atrás.
- **Arreglo propuesto**: Subirlo a token en src/client/tokens/rappimind.css junto a --rm-sombra-flotante, por ejemplo --rm-sombra-hoja-celular. No es un asunto de contraste, es de que el rebrand no deje huérfanos.

### [nota] Lo que sí aguanta: el botón primario cumple en TODO el recorrido del gradiente, no solo en el arranque. Lo verifiqué porque el encargo pedía dudar de ese punto.

- **Dónde**: src/client/estilos.css:269 a 278 (.boton, 19px peso 700 sobre var(--gradiente-boton)), src/client/tokens/rappimind.css:65 a 72 (el gradiente recortado al 17%), scripts/contraste.js:143 (el par que lo vigila).
- **Cómo se supo**: medido
- **Evidencia**: Medí los catorce tamaños distintos de botón primario que aparecen en las 46 pantallas, del más angosto (107x40) al más ancho (260x40), tomando el pixel real debajo de la caja del texto con el texto puesto en transparente. El peor punto va de 3.40:1 en los angostos a 3.20:1 en "Ir al formulario de Legal", que es el más ancho, y el mejor es 3.79:1 en todos. El piso teórico del tramo recortado entero es 3.00:1 en el 0% (#FF6041) y 3.27:1 en el 100% (#FF4583), así que ningún ancho puede bajar de 3.00. La decisión 98 se sostiene y el par que la vigila apunta al punto correcto, que es el peor.
- **Arreglo propuesto**: Nada que arreglar. Vale la pena anotar en el comentario de la decisión 98 que el piso no está solo en el arranque sino en todo el tramo, y que quien mueva el recorte o el tamaño de letra tiene las dos cuentas atadas.

**Lo que revisó**

- npm run contraste: confirmado que devuelve código de salida 0 de verdad (corrido sin tubería, $? = 0) y que lee los tokens de PRODUCCIÓN. La prueba: scripts/contraste.js:27 apunta a src/client/tokens/, y al correr una copia idéntica del script apuntada a docs/diseno/tokens/ la misma lista devuelve tres FALLA (marcador 3.45 y 3.16, --color-muted 4.42) y después revienta con "var() circular en --rm-neon-texto", porque la entrega no tiene ese token. O sea que los seis arreglos viven solo en producción y el informe los está midiendo.
- src/client/estilos.css entera, las 948 líneas, con un barrido mecánico de toda declaración que lleve color, background, border-color, outline, box-shadow o accent-color, y el cruce de cada una contra los 35 pares de PARES.
- Los cinco archivos de src/client/tokens/, los 170 tokens, incluido el chequeo de si alguno está definido en más de un archivo (ninguno lo está).
- Auditoría de contraste de texto en el navegador sobre las 46 pantallas de docs/FRONT_ACTUAL.html con Playwright: 205 combinaciones distintas de color sobre fondo efectivo, con el fondo compuesto subiendo por los ancestros y el mínimo elegido según tamaño y peso reales. Un solo par de texto por debajo, el enlace del panel celeste.
- Medición por pixel del gradiente, con el texto puesto en transparente para que cada pixel del recorte fuera fondo puro: los catorce tamaños de botón primario, la píldora Publicado, el icono de mensaje-ok, el disco de la opción elegida, la barra del paso actual, la regla del aviso serio y el gradiente de hover pintado en una caja del tamaño del botón real.
- Las cuatro notas de PARES, una por una, contra los sitios donde de verdad se usa cada token: dos siguen mereciéndola tal como está (el borde del control deshabilitado en los campos, el carril del paso pendiente) y dos se quedaron cortas (la del gradiente al 0% y la de la píldora de vencido).
- npm test: 678 pruebas, todas en verde. Y la comprobación de que ninguna prueba ni scripts/push.js corren el contraste.
- Los ocho mensajes de commit de 52d1b20 a 26faff9, docs/DECISIONES.md 98 a 111, docs/diseno/AUDITORIA_CONTRASTE.md y scripts/lib/hoja-completa.js.

**Lo que no pudo revisar**

- Cinco piezas no las dibuja ninguna de las 46 pantallas congeladas, así que solo las pude medir por cuenta sobre los tokens y no en pantalla: .opcion-vencida, .estado-vencido, .estado-borrador, .sugerencia y .glosario-panel. Las cuatro primeras aparecen en el texto del anexo de la hoja, que es lo que hace que un grep las encuentre, pero no existen como elemento. El panel del glosario solo nace al pasar el mouse y docs/FRONT_ACTUAL.html no lleva JavaScript.
- Los estados de interacción no los pude tomar del documento congelado: hover, active y focus-visible. El hover del botón lo medí pintando su gradiente en una caja del tamaño exacto del botón real; el anillo de foco lo calculé sobre los tokens contra los cinco fondos donde aparece de verdad, incluido el celeste, que da 3.24:1.
- No corrí npm run front, npm run demo ni npm run build, como manda el encargo, así que todo lo del navegador sale de los artefactos ya generados. Si docs/FRONT_ACTUAL.html quedara atrasado respecto de src/client/estilos.css, mis mediciones de pantalla se moverían; comprobé que el archivo es de las 18:02 y la hoja de las 17:37, o sea posterior.
- No abrí demo/index.html: usé docs/FRONT_ACTUAL.html porque trae las 46 pantallas de una vez y con la hoja real acotada a cada marco. Si alguna pantalla se ve distinta en la demostración, no lo sabría.
- No toqué nada. Ni un archivo de src/, pruebas/, scripts/ ni docs/. Todo lo que escribí vive en el scratchpad.

---

## ACCESIBILIDAD

**15 hallazgos**: 2 serio, 8 menor, 5 nota

La ronda no rompió el contrato de accesibilidad: las 48 pantallas tienen exactamente un h1, la región #anuncios sigue intacta y recibe el título, el foco se entrega al h1 al cambiar de pantalla y se suprime el anillo solo para quien llega con el ratón, ninguna opacity comunica ya un estado deshabilitado, el texto apagado se sigue leyendo entre 4.88:1 y 6.42:1, y no hay ni un guion usado como signo de puntuación en el texto visible. El anillo de foco sale a 3px sólido #FF2526 con offset 2px en 1303 paradas de tabulador medidas, y en la barra de progreso NO queda cortado por el overflow: hidden, cosa que era la sospecha principal. Lo que sí encontré, y no lo cubre ninguna prueba, son dos defectos serios y una lista de menores. El grave de verdad es el blanco de clic de la barra de progreso: el mensaje del commit de la fase 4 afirma que el botón "conserva su nombre y su tamaño de blanco", y medido en el navegador el nombre sí se conserva pero el blanco se quedó en 78.28 por 4.00 px, cuando antes de la ronda medía unos 32px de alto. El segundo es que en celular el anillo de foco de la barra superior queda recortado a cero por un overflow de la navegación. Y hay tres títulos más en caja alta que nadie había nombrado, uno de ellos de 54 caracteres y dos oraciones.

### [serio] El blanco de clic de cada botón de la barra de progreso se quedó en 4px de alto cuando las etiquetas se caen, que es el caso normal del Cashback de Colombia (7 pasos) y del Cashback Travel (9). El mensaje del commit de la fase 4 afirma lo contrario: dice que con la sangría el botón conserva su nombre y su tamaño de blanco. El nombre sí lo conserva; el blanco no. Antes de la ronda el botón medía unos 32px de alto, porque llevaba padding de 8px arriba y abajo más una línea de texto de 13px.

- **Dónde**: src/client/estilos.css:360 (regla 351 a 361), con el valor en src/client/tokens/rappimind.css:95
- **Cómo se supo**: medido
- **Evidencia**: Playwright sobre demo/index.html, Cashback Colombia, ventana 1440 por 1000: los siete botones de .progreso miden 78.28 por 4.00 px, con textIndent -9999px, overflow hidden y height 4px. Los siete conservan su nombre accesible en el árbol de accesibilidad (Campaña, Organizador, Cuándo, Beneficio, Créditos, Participantes, Pieza) y el del paso actual y los ya hechos siguen siendo alcanzables con el tabulador, con tabIndex 0. El anillo de foco sale entero y NO lo recorta nada: lo comprobé con captura. Con 4 pasos y etiquetas visibles el mismo botón mide 26.9px de alto, así que el problema es solo el caso de etiquetas caídas. Para ser justo: el criterio 2.5.8 de WCAG 2.2 se salva por su excepción de separación, porque los centros de dos segmentos vecinos quedan a 90.3px y el blanco enfocable más cercano está a 177px por debajo y a 225.5px por encima. No es un incumplimiento formal, pero 4px es un blanco que no se acierta con el ratón y menos con un dedo.
- **Arreglo propuesto**: Darle al botón un alto de blanco que no dependa de si la etiqueta se ve: por ejemplo padding-bottom en el botón, o mover el height: var(--paso-alto) al ::before y dejar que el botón crezca. La barra puede seguir viéndose de 4px sin que el blanco mida 4px. Y corregir la afirmación del mensaje de commit en docs/PROGRESO.md, porque ahora mismo dice que esto se comprobó y no es así.

### [serio] En celular el anillo de foco de los cuatro enlaces de la barra superior queda recortado por completo arriba y abajo. La navegación se declara con overflow-x: auto, y como el otro eje queda en visible, el navegador lo sube a auto también: recorta en los dos ejes. La altura de la caja de la navegación es exactamente la del botón, así que no hay ni un pixel de holgura para un anillo que necesita cinco (2px de offset más 3px de grosor).

- **Dónde**: src/client/estilos.css:903 a 906
- **Cómo se supo**: medido
- **Evidencia**: Medido en la demostración viva a 390 por 844: la caja de .barra-superior nav mide 31px de alto, cada .enlace-nav mide 31px, y la holgura arriba y abajo de los cuatro botones es 0.0 exacta; overflowX y overflowY salen los dos en auto. El anillo computa bien (3px, offset 2px, :focus-visible verdadero), simplemente no se ve. Se repite en las tres pantallas de celular de FRONT_ACTUAL (p46, p47 y p48), donde además los botones que quedan fuera del carril horizontal dan holgura negativa a la derecha (Ayuda, -29.7). La regla es la misma que antes de la ronda, así que es un defecto heredado, no una regresión, pero sigue vivo y ninguna prueba lo mira.
- **Arreglo propuesto**: Darle a la navegación 5px de relleno vertical y restárselos a la barra, o cambiar el anillo por un box-shadow interior en los controles que viven dentro de un carril que recorta. Lo primero es más limpio y no toca el contrato del anillo.

### [menor] Hay tres títulos más que salen en caja alta además del que ya está abierto a decisión de Juan. El peor mide 54 caracteres y son dos oraciones completas, con el punto en medio, a 11.5px con espaciado de letra. La regla que los pone en mayúsculas es la del aviso serio, y se aplica a todos sus h3 sin distinguir entre una etiqueta corta y una frase.

- **Dónde**: src/client/estilos.css:227 a 230; los títulos en src/client/js/66-resumen.js:378, src/client/js/63-tyc-genericos.js:403 y src/client/js/70-app.js:281
- **Cómo se supo**: medido
- **Evidencia**: Inyecté los cuatro títulos en un .aviso-serio real de la pantalla de Ayuda y medí el resultado: los cuatro salen con textTransform uppercase, 11.5px, peso 900 y espaciado 0.92px. Son: "La leyenda cambió. Cambia el arte antes de publicarlo." (54 caracteres, dos oraciones), "Antes de usar este enlace, confirma con Legal" (45), "No pudimos abrir RappiMind" (26) y el ya conocido "Antes de lanzar: ¿tu dinámica tiene azar?" (41). En los cuatro el textContent del DOM queda intacto, así que el lector de pantalla lee el original: eso sí está comprobado. El barrido de las 48 pantallas confirma que lo único en caja alta ahí son etiquetas cortas (Opcional, y las cabeceras de tabla Campaña, País, Fecha, Estado, Rol, Activo, Id, Quién, Tipo, Correo, Nombre y Tipos habilitados), más el de la Ayuda.
- **Arreglo propuesto**: Decisión de Juan, no técnica. Si la caja alta es la marca del nivel serio, entonces esos tres textos tendrían que ser etiquetas cortas y la frase larga bajar al párrafo. La otra salida es dejar la caja alta solo cuando el h3 sea corto, pero eso no se puede expresar en CSS y obligaría a tocar el JavaScript, que esta ronda prohibía.

### [menor] El botón primario deshabilitado se quedó sin ninguna frontera visible: su relleno es exactamente el color de la página y su borde pasó a transparente. Solo flota el texto gris. Antes de la ronda el relleno era var(--borde), que al menos dibujaba una píldora algo más oscura que el fondo.

- **Dónde**: src/client/estilos.css:284 a 287
- **Cómo se supo**: medido
- **Evidencia**: En la pantalla del resumen con algo pendiente (p23 de FRONT_ACTUAL), el botón "Generar T&C" deshabilitado mide 146 por 40, con relleno rgb(244,245,246) sobre un fondo de padre rgb(244,245,246): 1.00:1 exactos, y borde rgba(0,0,0,0), o sea 1.00:1 también. El texto sí se lee, 4.88:1. WCAG exime los componentes inactivos, así que no es un incumplimiento, pero el botón deja de parecer un botón.
- **Arreglo propuesto**: Devolverle un borde: border-color: var(--borde-control) o el relleno a un gris que no sea el de la página. Es una línea y no toca el JavaScript.

### [menor] La sombra nueva de la hoja deslizable del celular se derrama sobre TODAS las pantallas de escritorio. La hoja va fija abajo y desplazada hacia abajo su propio alto, así que su borde superior cae exactamente en el borde inferior de la ventana; la sombra apunta hacia arriba, con lo que pinta una banda gris de unos 35px a lo ancho del pie de cada pantalla. No se vio en la revisión porque el instrumento de capturas esconde .hoja-deslizable a propósito.

- **Dónde**: src/client/estilos.css:785
- **Cómo se supo**: medido
- **Evidencia**: Ventana de 1440 por 900, formulario de Cashback: la caja de .hoja-deslizable da top 900 (el borde exacto de la ventana), alto 774, transform translateY(774px), visibility visible, boxShadow rgba(10,10,10,0.13) 0px -8px 32px. Comparé la captura del pie de página con la sombra y con la sombra anulada, píxel a píxel: a y=860 no hay diferencia, a y=875 el fondo pasa de 244,245,246 a 240,241,242, a y=885 a 233,234,235 y a y=895 a 225,226,227. Son diecinueve niveles de diferencia en el borde, visibles como una mancha.
- **Arreglo propuesto**: Meter la sombra dentro de la consulta de celular, junto al resto de reglas de la hoja deslizable, o darle box-shadow: none cuando no lleva la clase abierta.

### [menor] La línea del paso, que la fase 5 hizo visible también en escritorio, lleva role="progressbar" sin nombre accesible. ARIA pide nombre de autor para ese rol. Antes solo se veía en celular; ahora se anuncia en las 37 pantallas de formulario.

- **Dónde**: src/client/js/62-pasos.js:397 a 404, y la regla que lo destapa en escritorio en src/client/estilos.css:337
- **Cómo se supo**: medido
- **Evidencia**: Árbol de accesibilidad de Chromium sobre la demostración: nodo progressbar con nombre "" y valor 1. El elemento trae aria-valuenow, aria-valuemin y aria-valuemax pero ni aria-label ni aria-valuetext. El texto de alrededor ("Paso 1 de 7 · Campaña") da el contexto, así que la información no se pierde, pero el elemento sale sin nombrar.
- **Arreglo propuesto**: Un aria-label en el span de .progreso-linea, o quitarle el role si la línea es puramente decorativa y el texto de al lado ya lo dice todo. Es una línea de JavaScript, así que es para después de esta ronda.

### [menor] En modo de colores forzados (contraste alto de Windows) la barra de progreso desaparece entera. La fase 4 cambió unos bordes por rellenos y gradientes, y los rellenos y los gradientes son justo lo que ese modo descarta. Antes de la ronda los pasos se distinguían con border-bottom: 2px solid, que en colores forzados sobrevive.

- **Dónde**: src/client/estilos.css:362 a 370
- **Cómo se supo**: medido
- **Evidencia**: Chromium con forcedColors: active sobre demo/index.html, Cashback Colombia: el ::before del paso actual queda con backgroundImage none y backgroundColor rgba(255,255,255,0), y los seis pendientes con rgba(255,255,255,0.12), que sobre blanco no se ve. La captura de esa zona no muestra barra ninguna entre "Paso 1 de 7 · Campaña" y el título. Lo atenúa que la fase 5 dejó esa línea de texto visible en escritorio, así que la información no se pierde, solo el dibujo.
- **Arreglo propuesto**: Añadir un borde al ::before, o una regla @media (forced-colors: active) que le ponga background: CanvasText al paso hecho y al actual. No se puede dejar solo en el gradiente.

### [menor] En colores forzados el aviso informativo y el aviso serio quedan idénticos, lo que contradice la afirmación del commit de la fase 6 de que la diferencia "se reconoce en blanco y negro". En escala de grises sí se distinguen; en contraste alto no, porque desaparecen los dos fondos y también la regla de gradiente de arriba, que está hecha con background-image. Y dos de las siete llamadas a .aviso-serio no emiten h3, así que ahí tampoco queda el título en caja alta como último rastro.

- **Dónde**: src/client/estilos.css:211 a 230; las dos llamadas sin h3 en src/client/js/63-tyc-genericos.js:384 y src/client/js/70-app.js:143
- **Cómo se supo**: medido
- **Evidencia**: Con forcedColors: active sobre FRONT_ACTUAL, .aviso da fondo rgb(255,255,255), borde 0px; .aviso-serio da fondo rgb(255,255,255), borde 0px y backgroundImage "none, none", o sea que la regla superior se fue. Sin colores forzados los mismos dos dan rgb(217,241,255) y rgb(255,240,221) con el gradiente presente.
- **Arreglo propuesto**: Una regla @media (forced-colors: active) que le dé al aviso serio un borde superior de 3px en CanvasText, que es lo que la especificación quería decir con regla de arriba y además sobrevive. El borde izquierdo de color sigue prohibido; el superior no lo es.

### [menor] La opción deshabilitada y la opción vencida se quedaron con un relleno idéntico al fondo de página, así que la tarjeta se disuelve y solo queda un borde al 10% de alfa. Es exactamente el problema que la fase 7 sí arregló para la marca de "Opcional", con el argumento de que un chip niebla sobre niebla desaparece, y que no se aplicó aquí.

- **Dónde**: src/client/estilos.css:574 a 577 y 596 a 599 (el arreglo equivalente que sí se hizo está en 403 a 412)
- **Cómo se supo**: medido
- **Evidencia**: En la pantalla p38 de FRONT_ACTUAL la opción deshabilitada "Quien gastó más" da relleno rgb(244,245,246) sobre fondo de padre rgb(244,245,246), 1.00:1, y borde rgba(10,10,10,0.1) contra ese fondo, 1.23:1. El texto sí se lee: el título a 6.42:1 y la nota a 4.88:1, y la opacity es 1, que es lo que la ronda quería. npm run contraste ya lo anota como nota exenta por componente inactivo, pero la exención de WCAG no quita que la tarjeta se vuelva invisible.
- **Arreglo propuesto**: Subirle el alfa al borde de la opción apagada, o darle un relleno que no sea el mismo niebla del fondo. Hoy la única diferencia entre una opción no elegible y el papel de la página es una línea que no se ve.

### [menor] El selector de idioma lleva un anillo de foco de 2px, no de 3px. Es el único control de toda la aplicación que se sale del contrato del anillo. El valor viene de antes de la ronda, pero la ronda repintó esa regla y no lo ajustó.

- **Dónde**: src/client/estilos.css:813
- **Cómo se supo**: medido
- **Evidencia**: Los dos botones ES y BR dan outline 2px solid rgb(255,37,38) con offset 2px, en la demostración viva y en las tres pantallas de celular de FRONT_ACTUAL (p46, p47, p48), donde el zoom del marco es 1 y el valor sale sin escalar. Todos los demás controles medidos en las 1303 paradas de tabulador dan 3px. Con 3.79:1 sobre papel el color cumple, así que lo que falla es la consistencia y la visibilidad de un control que vive flotando sobre el contenido.
- **Arreglo propuesto**: Borrar la declaración de outline de esa regla y dejar que herede la global de la línea 120. Ojo con pruebas/estilos.test.js, que afirma literalmente cosas de esa regla.

### [nota] La hoja deslizable del celular sigue en el árbol de accesibilidad y en el orden del tabulador cuando se navega en escritorio, aunque esté fuera de pantalla, y además se anuncia como diálogo modal permanente. Es de antes de la ronda y es JavaScript, que esta ronda no podía tocar, pero conviene que quede dicho porque ninguna prueba lo mira.

- **Dónde**: src/client/js/70-app.js:70 a 77, con la regla que la desplaza en src/client/estilos.css:781 a 790
- **Cómo se supo**: medido
- **Evidencia**: En escritorio a 1440 por 1000 el elemento sale con display flex, visibility visible, role dialog, aria-modal true, sin aria-hidden ni inert, y con un botón "Cerrar" de tabIndex 0 dentro. El recorrido con tabulador lo alcanza: el registro del formulario incluye dos .hoja (la de la columna, 620 por 840, y la del cajón, 1440 por 746) y luego el "Cerrar". El botón flotante sí queda fuera, porque en escritorio va con display: none.
- **Arreglo propuesto**: Dejar la hoja deslizable con inert, o con display: none, mientras no lleve la clase abierta. Son dos líneas y quitan de en medio tres paradas de tabulador y un modal fantasma.

### [nota] Seis grupos de opciones salen con role="radiogroup" y sin nombre accesible en las 48 pantallas. Los otros veintiocho sí lo llevan. Es de antes de la ronda y es JavaScript.

- **Dónde**: src/client/js/62-pasos.js:664 y 737
- **Cómo se supo**: medido
- **Evidencia**: Conteo sobre el HTML de las 48 pantallas de docs/FRONT_ACTUAL.html: seis coincidencias de role="radiogroup" sin aria-label ni aria-labelledby, contra veintiocho que sí lo traen. El árbol de accesibilidad de la demostración confirma un nodo de grupo con nombre vacío.
- **Arreglo propuesto**: Copiar el patrón que ya usa src/client/js/50-campos.js:184, que enlaza el grupo con el id del titular de la pregunta con aria-labelledby.

### [nota] La opción vencida no la dibuja ninguna pantalla hoy, así que ese estado no está en las 48 congeladas y nadie lo ha visto pintado. Los catorce T&C generales de Colombia vencen el 31 de diciembre de 2026 y hoy es 21 de septiembre, con lo que todos salen usables.

- **Dónde**: data/tyc_genericos.json (vigenciaFin 2026-12-31 en todas las entradas), con el estilo en src/client/estilos.css:596 a 605
- **Cómo se supo**: medido
- **Evidencia**: Busqué .opcion-vencida en docs/FRONT_ACTUAL.html: las diez coincidencias son de la hoja de estilos, ninguna del DOM de una pantalla. Recorrí el camino real hasta la lista de T&C generales en la demostración y salieron cero. Lo comprobé inyectando la clase y el aria-disabled a una opción real: ahí sí sale correcto, anillo de 3px sólido #FF2526 con offset 2px, opacity 1, fondo rgb(244,245,246), cursor not-allowed, tabIndex 0 y disabled false, con la nota de vencimiento en rgb(217,31,32). O sea que el estado está bien escrito, pero está sin ver.
- **Arreglo propuesto**: Agregar una pantalla con un T&C vencido al recorrido de docs/FRONT_ACTUAL.html, adelantando la fecha del recorrido o sembrando una entrada vencida, para que el estado entre en la foto y alguien lo mire.

### [nota] El botón del glosario apunta con aria-describedby a un id que solo existe mientras el panel está abierto. El resto del tiempo la referencia cuelga de la nada. De antes de la ronda y es JavaScript.

- **Dónde**: src/client/js/50-campos.js:42, con el panel que se crea y se destruye en 59 y 74
- **Cómo se supo**: medido
- **Evidencia**: En la demostración medí un botón .glosario con aria-describedby="glosario-panel" mientras document.querySelector('.glosario-panel') devolvía null. El anillo de foco de esos botones sí es el correcto: 3px sólido #FF2526 con offset 2px en las dieciséis apariciones que recorrió el tabulador en FRONT_ACTUAL.
- **Arreglo propuesto**: Dejar el panel siempre en el DOM y esconderlo con hidden, en vez de crearlo y borrarlo. De paso resolvería que el panel no se puede recorrer con el puntero, que es lo que pide el criterio 1.4.13.

### [nota] Los cinco archivos de tokens que ahora se sirven traen comentarios en inglés, y dos de ellos usan la raya como signo de puntuación. La regla 8 de CLAUDE.md pide todo en español. Son archivos nuevos bajo src/ y sus comentarios viajan enteros dentro de dist/Estilos.html.

- **Dónde**: src/client/tokens/spacing.css:28 y src/client/tokens/typography.css:7 y 17
- **Cómo se supo**: medido
- **Evidencia**: Barrido de rayas sobre todo el material: las tres únicas apariciones de raya en src/ son esas, y las tres están dentro de comentarios en inglés ("120px — standard slide/page margin", "Email only — Jornada Sans not available", "Display — dominante, cover headlines"). En cambio en los literales de cadena de src/, data/ y modelos/ no hay ni una raya ni un guion medio, y en el texto literal de las 48 pantallas los únicos guiones son de identificadores: NIT 900.111.222-1, ext-v.reina@rappi.com, #tyc-rappi, RM-20260921-0001 y la dirección farmatodo-20-cashback-1-oct-2026. Ninguno es puntuación.
- **Arreglo propuesto**: Traducir esos comentarios o anotar la excepción en docs/DECISIONES.md, diciendo que la entrega de RappiAds se sirve tal como llegó salvo los seis arreglos de contraste. Hoy la excepción está escrita para los valores, no para el idioma de los comentarios.

**Lo que revisó**

- Recorrido con tabulador de las 48 pantallas de docs/FRONT_ACTUAL.html con Playwright: 1399 paradas registradas, 1303 dentro de una pantalla, con grosor, estilo, color y offset del anillo, coincidencia de :focus-visible y holgura contra cada ancestro que recorta. Resultado en el scratchpad, foco-front.json
- Barra de progreso medida en la demostración viva (Cashback Colombia, 7 pasos): tamaño de cada botón, text-indent, overflow, disabled, aria-current y tabIndex; nombre accesible de los siete botones leído del árbol de accesibilidad de Chromium
- Barra de progreso con etiquetas visibles: Promoção Brasil (4 pasos) a siete anchos de ventana, de 1440 a 920, midiendo alto del botón, ancho de segmento y si alguna etiqueta se corta
- Captura del anillo de foco sobre un segmento de 4px para comprobar a ojo que no lo recorta nada
- Vista de celular a 390 por 844: barra superior, botón flotante, selector de idioma, .progreso y .progreso-linea
- Conteo de h1 por pantalla en las 48 pantallas y listado de todo elemento con text-transform: uppercase y su texto propio
- Foco al título con clic real de ratón y con clic sintético, para separar el caso :focus-visible del que no lo es
- Opción vencida sintetizada en el navegador (hoy no la produce ningún dato): anillo, opacity, fondo, borde, cursor, tabIndex y color de la nota
- Todos los controles deshabilitados de las 48 pantallas, con contraste de relleno contra su fondo, de texto contra relleno y de borde contra fondo
- Barrido de guiones: el texto literal de las 48 pantallas de docs/revision/pantallas.json y todos los literales de cadena de src/, data/ y modelos/, buscando guion, guion medio y raya entre palabras
- Los cuatro títulos de .aviso-serio renderizados de verdad en el navegador, midiendo text-transform, tamaño, peso, espaciado y el textContent que lee el lector de pantalla
- Modo de colores forzados (forced-colors: active) sobre la demostración y sobre FRONT_ACTUAL: barra de progreso, los dos niveles de aviso, las píldoras de estado, la hoja y el hueco
- Sombra de .hoja-deslizable en escritorio: posición de la caja, y comparación de píxeles fila por fila con la sombra puesta y quitada
- npm test (678 pruebas, todas verdes) y npm run contraste (verde), los dos de solo lectura
- Lectura completa de src/client/estilos.css, los cinco archivos de src/client/tokens/, scripts/lib/hoja-completa.js, pruebas/interfaz_accesible.test.js y los mensajes de los ocho commits, más el diff contra 8f783b9 de cada regla en cuestión

**Lo que no pudo revisar**

- Apps Script de verdad. Todo se midió contra demo/index.html y docs/FRONT_ACTUAL.html. Que dist/Estilos.html sirva lo mismo es del auditor de frontera.
- Lectores de pantalla reales. Medí el árbol de accesibilidad de Chromium, que es de dónde salen los nombres accesibles, pero no cómo pronuncian NVDA, JAWS o VoiceOver un texto con text-transform: uppercase. Ahí la caja alta es criterio de Juan, no medición mía.
- Un teléfono de verdad. El celular se midió con una ventana de 390 por 844 en Chromium, no con un dedo sobre una pantalla táctil.
- Las pantallas que no existen hoy. La opción vencida no la produce ningún dato (los catorce T&C generales de Colombia vencen el 31 de diciembre de 2026 y hoy es 21 de septiembre), así que no está en ninguna de las 48 pantallas congeladas y la medí inyectando la clase a mano.
- El historial con filas. En la demostración sale vacío; las filas con sus botones solo pude medirlas en la foto de FRONT_ACTUAL.
- Los avisos serios que solo aparecen en caminos raros (leyenda que cambió, enlace pendiente de Legal, error global). Los títulos los medí inyectándolos en un .aviso-serio real, no llegando a esas pantallas.

---

## COBERTURA

**18 hallazgos**: 4 serio, 7 menor, 7 nota

El cambio de identidad llegó a casi todo, pero las pantallas que el prototipo no cubría acumulan los defectos reales, y tres de ellos son visibles a simple vista en las pantallas que más importan. El peor es el panel de momento: sale partido en dos rectángulos beige con un escalón de 156px en p01, p25 y p43, o sea en el inicio, en el inicio en portugués y en la pantalla que celebra que el T&C quedó listo. La fase 8 comprobó que el selector acertaba las pantallas, pero no que el resultado pareciera un solo panel. El segundo es que un campo con un dato mal escrito ya no se pinta de rojo: la regla del campo lleno le gana en especificidad a la del error, así que la decisión de la fase 3, que separaba lleno de mal, queda anulada justo en el caso que de verdad ocurre. El tercero es que el botón primario deshabilitado tiene exactamente el mismo color que el fondo de página, 1.00:1 medido, y se lee como una etiqueta gris en p23, que es la pantalla donde el comercial necesita ver que hay un botón esperando. Aparte de las pantallas, el cambio no llegó al correo: src/core/correo.js conserva los cuatro valores exactos de la paleta anterior más Lato, y es el único artefacto que sale de la herramienta. Eso fue consecuencia del propio encargo, que prohibió tocar src/core/, así que es decisión de Juan y no un descuido. De las cuatro clases que la ronda 1 señaló, .progreso-cuenta se cubrió con una regla que no cambia nada, .nota y .pagina-seccion siguen sin regla y sí se notan, y .preguntas-filtro sigue sin regla pero no se nota porque sus hijos la sostienen. El resto son coherencias que se fueron acumulando fase a fase: ocho pesos de letra fuera de la escala de cuatro que la propia fase 2 fijó, el nombre del paso repetido en siete pantallas, y las notas de las opciones en negrita por heredar el peso del botón. La paleta está limpia: barrí los 4300 elementos de las 48 pantallas y el único color huérfano que queda en la hoja es una sombra cruda en la línea 785. Ninguno de estos hallazgos mueve contenido ni preguntas, así que la vara de textos.json seguiría saliendo como salió.

### [serio] El panel de momento sale partido en dos rectángulos beige. El h1 y la bajada comparten fondo para simular un solo panel, pero la bajada lleva max-width 46ch y el h1 no, así que en escritorio el panel mide 712px arriba y 556px abajo: sobra un escalón de 156px a la derecha, y la esquina inferior derecha se redondea en el aire en vez de en el borde del panel. Afecta a las tres pantallas de momento de escritorio: p01 (inicio), p25 (Tu T&C está listo) y p43 (inicio en portugués). En celular (p46) coincide por casualidad, porque el ancho de la columna ya es menor que el tope.

- **Dónde**: src/client/estilos.css:873 (max-width: 46ch de la bajada) contra src/client/estilos.css:848 a 857 (el h1, sin tope)
- **Cómo se supo**: medido
- **Evidencia**: Playwright contra docs/FRONT_ACTUAL.html, dividiendo el zoom 0.78 del marco: en p01, p25 y p43 el h1 da w=712 izq=506 der=1218 y la bajada da w=556 izq=506 der=1062, las dos con background rgb(255,240,221) y radios 20/20/0/0 y 0/0/20/20. Reproducido a escala 1 a 1 con la hoja concatenada en el orden de scripts/lib/hoja-completa.js: h1 244..956, bajada 244..800. La captura muestra el escalón. Con Archivo cargada de verdad el escalón crece, porque 46ch de Archivo a 19px mide menos que 556px.
- **Arreglo propuesto**: Quitar max-width de la regla del panel y poner el tope de medida en el texto, no en la superficie: por ejemplo dejar el max-width en un elemento interno, o subir el mismo tope al h1 para que las dos mitades midan igual. La decisión de si se recorta el panel o se ensancha la línea es de diseño.

### [serio] El campo en error no se pinta de rojo. La regla del campo con valor tiene más especificidad que la del error, así que un campo lleno y mal validado, que es el único caso que de verdad ocurre, sale con borde tinta igual que un campo bien lleno. El único rojo que queda es el mensaje de abajo. Esto anula la decisión de la fase 3, que separaba el campo lleno (1.5px tinta) del campo en error (2px neón).

- **Dónde**: src/client/estilos.css:483 a 485 gana a src/client/estilos.css:504 a 506
- **Cómo se supo**: medido
- **Evidencia**: En p39 (el error en vivo del NIT) el input dentro de .campo-error da borderColor rgb(10,10,10). Reproducido a escala 1 a 1 con la hoja concatenada: campo con valor y .campo-error da rgb(10,10,10) 2px; campo vacío y .campo-error da rgb(255,37,38) 2px; campo de fecha y .campo-error da rgb(255,37,38). La especificidad es (0,3,1) para input:not():not():not() contra (0,1,1) para .campo-error input, así que el color del error pierde y solo pasa el grosor.
- **Arreglo propuesto**: Subir la especificidad de la regla de error a la del selector de campo lleno, por ejemplo .campo-error input:not([type=date]):not([type=time]), o escribirla después con la misma forma negada. No hace falta tocar el JavaScript.

### [serio] El botón primario deshabilitado desaparece como botón. Su fondo es niebla y el fondo de página también es niebla, y el borde se pone transparente, así que no queda ni superficie ni contorno: se lee como una etiqueta gris suelta al lado del botón Atrás, que sí es una píldora con borde. Pasa en p23, el resumen con algo pendiente, que es justo la pantalla donde el comercial necesita entender que el botón existe y está esperando.

- **Dónde**: src/client/estilos.css:285 (background: var(--niebla)) contra src/client/estilos.css:94 (body background: var(--niebla))
- **Cómo se supo**: medido
- **Evidencia**: En p23 el .boton[disabled] da backgroundColor rgb(244,245,246) y borderColor rgba(0,0,0,0); el .rm-pantalla da backgroundColor rgb(244,245,246). Contraste de la superficie contra el fondo: 1.00:1 exactos. Antes del cambio el deshabilitado usaba var(--borde) #e2e6eb sobre niebla #f4f6f8, que daba 1.16:1, poco pero algo. La captura a escala 1 a 1 lo muestra al lado de Atrás. La letra sí cumple: #6B6B6B sobre #F4F5F6 da 4.88:1.
- **Arreglo propuesto**: Darle al deshabilitado una superficie distinta del fondo de página (por ejemplo papel con borde de línea, o un gris un paso por debajo de niebla) y dejarle un borde visible. Y agregar el par superficie deshabilitada contra fondo de página a PARES en scripts/contraste.js, que hoy no lo mide.

### [serio] El correo que envía la herramienta sigue con la paleta y la tipografía anteriores, completas. Es el único artefacto que sale de RappiMind y hoy queda visiblemente de otra marca que la aplicación. Lleva los cuatro valores exactos del :root viejo.

- **Dónde**: src/core/correo.js:29 a 32, :63, :77 a 81
- **Cómo se supo**: medido
- **Evidencia**: correo.js declara NARANJA #FF441F, TINTA #16181D, GRIS #5D626D y BORDE #E3E5EA. Los tres primeros son literalmente --naranja-marca, --tinta y --gris-lapiz del :root anterior al cambio (git show 52d1b20^:src/client/estilos.css, líneas 9, 12 y 13). Además la línea 81 fija font-family Lato, que la fase 2 quitó de la aplicación, la 63 usa font-weight 600, que la fase 2 quitó de la hoja, y las 77 y 78 pintan el fondo #F7F8FA. Confirmado también en el artefacto construido: dist/MotorCliente.html:1705.
- **Arreglo propuesto**: Es decisión de Juan, porque el encargo prohibió tocar src/core/. Conviene decidir si el correo entra en el cambio de identidad: los tokens ya tienen lo que hace falta (--color-email-text, --email-title-size, --email-body-size y --email-cta-size en src/client/tokens/typography.css y colors.css) y hoy nada los usa.

### [menor] En la ampliación de una campaña, un campo vacío se pinta como campo lleno. La regla del campo con valor usa :not(:placeholder-shown), y se midió contra las preguntas de src/client/js/50-campos.js, que siempre ponen el atributo placeholder. Los campos de la ampliación se crean sin placeholder, así que coinciden siempre. El resultado es que en p41 el campo Nuevo presupuesto sale con borde tinta estando vacío, justo debajo de un texto que dice Llena solo lo que quieras ampliar y deja el resto vacío.

- **Dónde**: src/client/estilos.css:483 y src/client/js/68-pantallas.js:154
- **Cómo se supo**: medido
- **Evidencia**: Recorrí todos los input y textarea de las 48 pantallas buscando valor vacío con borde rgb(10,10,10). Sale exactamente uno: p41, input type=text, placeholder null, etiqueta Nuevo presupuesto. En la misma pantalla el campo de fecha vacío sí da rgba(10,10,10,0.44). El mismo campoDeAmpliacion crea hasta tres campos así (presupuesto, maxOrdenes, unidades), aunque la pantalla congelada solo muestra uno.
- **Arreglo propuesto**: Excluir esos campos por tipo o por un selector propio en la hoja, o pedir permiso para que campoDeAmpliacion ponga placeholder="" como hace crear() en 50-campos.js. Lo segundo es una línea de JavaScript y lo prohibía la ronda, así que conviene preguntar.

### [menor] El nombre del paso actual sale dos veces, una encima de la otra. La línea Paso n de m, Nombre se hizo visible en escritorio para cubrir el caso en que las etiquetas de la barra se caen. Cuando no se caen, el nombre queda repetido a unos 20px de distancia. Pasa en 7 de las 31 pantallas con barra de progreso.

- **Dónde**: src/client/estilos.css:336 a 341 (.progreso-compacto, siempre visible) contra src/client/estilos.css:373 en adelante (las etiquetas que solo caen con más de seis pasos o segmentos cortos)
- **Cómo se supo**: medido
- **Evidencia**: Recorrido de las 31 pantallas con barra comparando el texto del .progreso-compacto con el del botón .actual: coinciden y las etiquetas están visibles (text-indent 0px) en p03, p04, p05, p30, p34, p37 y p45. Ejemplos: p37 muestra Paso 1 de 5, Campaña y debajo la etiqueta Campaña con segmento de 114px; p45 muestra Etapa 1 de 1, Campanha y debajo Campanha. En las 24 restantes las etiquetas están caídas y no hay repetición.
- **Arreglo propuesto**: Ocultar el nombre del .progreso-compacto (no la cuenta) cuando las etiquetas están visibles, con las mismas condiciones de @container y :has() que ya deciden la caída. O al revés, dejar solo uno de los dos. Es decisión de diseño.

### [menor] Quedan ocho declaraciones de peso fuera de la escala de la marca. La fase 2 dejó la hoja en 400, 500, 700 y 900 y convirtió los nueve pesos 600 sueltos. Las fases 4, 5, 6 y 7 metieron siete pesos 800 y un 600 nuevo. Como Archivo se carga variable de 400 a 900 (src/client/Index.html:21), esos pesos se renderizan de verdad, no se ajustan al más cercano: la hoja tiene hoy seis pesos en uso en vez de cuatro.

- **Dónde**: src/client/estilos.css:353 (600), y 370, 410, 567, 734, 754, 823 y 931 (800)
- **Cómo se supo**: medido
- **Evidencia**: Recuento sobre la hoja: 16 declaraciones en 700, 7 en 800, 3 en 900, 3 en 500 y 1 en 600. Rastreo por commit: 31cdc95 agregó el 600 de la línea 353 y el 800 de la 370, f329c79 el 800 de la 567, 53409df el de la 754 y ea2d71a los cuatro restantes. Medido en el navegador: en p32 el .opcion-titulo computa 800 y el .pregunta-titulo de la misma familia computa 700; en p37 la etiqueta del paso actual computa 800 y sus vecinas 600. La escala de cuatro pesos está escrita en src/client/tokens/typography.css:12 a 15 (--weight-regular 400, medium 500, bold 700, heavy 900), y ningún token cubre 600 ni 800.
- **Arreglo propuesto**: Bajar los siete 800 a 700 y el 600 a 500, o declarar en DECISIONES que la escala de la aplicación admite 600 y 800 y agregarlos como tokens. Hoy no hay ninguna de las dos cosas escrita.

### [menor] La clase .pagina-seccion sigue sin ninguna regla en la hoja, y se nota. Envuelve la sección El texto legal de tus piezas de la pantalla final y no tiene margen ni relleno, así que su h2 arranca pegado al bloque anterior con cero pixeles de separación, mientras las otras secciones de la misma pantalla se separan 24px.

- **Dónde**: src/client/js/66-resumen.js:346, sin regla en src/client/estilos.css
- **Cómo se supo**: medido
- **Evidencia**: Comprobado que no existe ninguna regla .pagina-seccion en la hoja. En p25 la distancia del borde inferior del bloque anterior al borde superior del .pagina-seccion es 0px, y también 0px hasta su h2. La distancia del .pagina-seccion a la sección siguiente es 24px, y la de Cuando ya esté publicado a su pregunta es 8px. Los valores están divididos por el zoom 0.78 del marco.
- **Arreglo propuesto**: Darle a .pagina-seccion el mismo margen superior que llevan las otras secciones de la pantalla final. Es una regla nueva en la hoja, sin tocar JavaScript.

### [menor] La clase .nota sigue sin regla, y el párrafo sale más grande y más oscuro que la ayuda de su propia sección, pegado al botón de arriba. Es la nota del panel del acuerdo de transferencia de datos, la p40.

- **Dónde**: src/client/js/62-pasos.js:289, sin regla en src/client/estilos.css
- **Cómo se supo**: medido
- **Evidencia**: En p40 el p.nota computa font-size 14.5px, font-weight 500, color rgb(10,10,10) y margin 0px arriba y abajo, con separación 0px respecto de la .fila-botones anterior. La .pregunta-ayuda de la misma pantalla, que cumple el mismo papel de texto secundario, computa 14px, 500, rgb(89,89,89) y margin-bottom 12px.
- **Arreglo propuesto**: Darle a .nota el mismo tratamiento que a .pregunta-ayuda: color gris lápiz, 14px y un margen superior. Una regla en la hoja.

### [menor] La regla de un solo pastel por pieza no llega a dos pantallas. En p33 hay tres paneles informativos celestes seguidos, ninguno atenuado, y ocupan cerca de la mitad de la pantalla. En p25 hay cinco avisos: dos celestes, dos beiges y uno blanco, o sea que tres piezas del mismo nivel informativo se ven con dos pieles distintas en la misma pantalla. El selector solo atenúa un informativo que venga DESPUÉS de un serio y como hermano, y en p25 los dos celestes van antes.

- **Dónde**: src/client/estilos.css:243 a 245
- **Cómo se supo**: medido
- **Evidencia**: Recuento de fondos calculados por pantalla: p33 tiene 3 avisos, los 3 con rgb(217,241,255); p25 tiene 5 avisos, 2 con rgb(217,241,255), 2 con rgb(255,240,221) y 1 con rgb(255,255,255). En p25 el que queda blanco es Además, en el arte, que es el único que va después de los dos serios. El propio comentario de la hoja (líneas 232 a 242) anticipa el límite, pero no se comprobó contra una pantalla con cinco avisos.
- **Arreglo propuesto**: Decidir con Juan qué se hace en p33 y p25: o se acepta el límite y se documenta con estas dos pantallas como ejemplo, o se marca desde el JavaScript cuál es el aviso principal, que es lo que el comentario dice que haría falta.

### [menor] Las notas de las opciones salen en peso 700 porque heredan el peso del botón que las contiene, mientras el resto del texto secundario de la aplicación va en 500. .opcion-nota no declara peso propio. Se nota sobre todo en p32, donde hay 14 tarjetas con hasta cuatro notas cada una y la pantalla entera queda en negrita, y en p33.

- **Dónde**: src/client/estilos.css:568 (.opcion-nota, sin font-weight) heredando de src/client/estilos.css:113 (h3, button, .opcion-titulo en 700)
- **Cómo se supo**: medido
- **Evidencia**: En p32 el .opcion-nota computa font-weight 700 a 13.5px y el .opcion-titulo de la misma tarjeta computa 800 a 16px. En la misma pantalla la .pregunta-ayuda computa 500 y el .casilla small computa 500. Antes del cambio el selector de la línea 113 ponía 600, así que las notas pasaron de 600 a 700 sin que nadie lo pidiera.
- **Arreglo propuesto**: Declarar font-weight 500 en .opcion-nota, que es el peso de cuerpo de la marca y el que usa el resto del texto secundario.

### [nota] La clase .preguntas-filtro sigue sin regla, pero no se nota: los bloques .pregunta que contiene traen su propio relleno y su línea separadora, así que el filtro de T&C generales de p31 se ve igual que cualquier lista de preguntas. Queda anotado para cerrar el punto de la ronda 1, no porque haya que arreglarlo.

- **Dónde**: src/client/js/63-tyc-genericos.js:114, sin regla en src/client/estilos.css
- **Cómo se supo**: medido
- **Evidencia**: En p31 el div.preguntas-filtro computa display block, margin 0px y padding 0px, y sus seis hijos .pregunta computan padding 24px 0px con línea inferior. La separación con el bloque anterior es 12px y con la fila de botones 24px, que es lo mismo que en las demás pantallas.
- **Arreglo propuesto**: Ninguno necesario. Si se quiere que la cobertura de clases quede cerrada, basta una regla vacía documentada o quitar la clase del JavaScript en otra ronda.

### [nota] La regla que se agregó para .progreso-cuenta no cambia nada en pantalla: repite el color que el elemento ya hereda de su padre. Importa porque deja la clase marcada como cubierta en una futura revisión cuando en realidad el render es idéntico a antes.

- **Dónde**: src/client/estilos.css:342
- **Cómo se supo**: medido
- **Evidencia**: El span.progreso-cuenta cuelga siempre de .progreso-compacto (src/client/js/62-pasos.js:394 dentro del bloque de la línea 390). En el navegador, el padre computa color rgb(89,89,89) y el hijo computa rgb(89,89,89), que es lo que ya da la línea 339. Aparece en 31 pantallas, todas iguales.
- **Arreglo propuesto**: O quitar la regla, o darle lo que de verdad la distinga, si la intención era que la cuenta se viera más apagada que el nombre del paso.

### [nota] La regla del campo en error no cubre textarea, ni en color ni en grosor. Hoy no se alcanza porque ningún textarea vive dentro de un bloque .campo-error, pero el día que una lista pegada desde Excel se valide con el patrón normal, el error no se verá.

- **Dónde**: src/client/estilos.css:504
- **Cómo se supo**: medido
- **Evidencia**: Reproducido a escala 1 a 1: un textarea con valor dentro de .campo-error da borderColor rgb(10,10,10) y borderWidth 1px, o sea ni el rojo ni los 2px. El selector de la línea 504 nombra input y select, no textarea, aunque la regla base de la línea 455 sí lo incluye. Los textarea de hoy (src/client/js/64-tiendas.js:179 y el pegado masivo de administración) muestran su error con un .mensaje-error hermano, no con .campo-error.
- **Arreglo propuesto**: Agregar textarea al selector de la línea 504, para que la regla diga lo mismo que la regla base.

### [nota] En p41 los dos enlaces de acción de una fila del historial salen pegados y se leen como una sola palabra: Usar como baseAmpliar. El JavaScript pone un espacio entre Abrir y Usar como base, pero no entre Usar como base y Ampliar, y .boton-texto no tiene relleno horizontal ni separación.

- **Dónde**: src/client/js/68-pantallas.js:92 y src/client/estilos.css:301
- **Cómo se supo**: medido
- **Evidencia**: En la captura de p41 se lee Usar como baseAmpliar en una sola línea subrayada. En el JavaScript, la línea 87 inserta un nodo de texto con un espacio antes del botón Usar como base y la 92 llama a botonDeAmpliar sin separador. .boton-texto computa padding 4px 0px. Esto es anterior al cambio de identidad: el mismo relleno estaba en la hoja de 52d1b20^ línea 174. El subrayado, que ya existía, lo hace más evidente.
- **Arreglo propuesto**: Poner la celda de acciones en flex con un hueco, desde la hoja, sin tocar el JavaScript.

### [nota] En las tres vistas de celular, dos de las cuatro entradas del menú superior quedan fuera de la vista y nada indica que la barra se desplaza. La barra tiene overflow-x auto y la barra de desplazamiento está oculta a propósito, así que Ayuda y Administración solo se alcanzan arrastrando a ciegas.

- **Dónde**: src/client/estilos.css:903 a 907
- **Cómo se supo**: medido
- **Evidencia**: En p46, p47 y p48 el marco mide 390px y la barra no desborda la página (scrollWidth igual a clientWidth), pero Ayuda termina en 518px y Administración en 685px, las dos más allá del borde derecho. El nav computa overflow-x auto y la regla de la línea 907 oculta la barra de desplazamiento de WebKit. Esto es anterior al cambio de identidad; el paso de Lato a Archivo y de peso 600 a 700 en .enlace-nav ensancha las entradas, así que lo empeora, aunque no pude medir cuánto sin reconstruir la hoja anterior.
- **Arreglo propuesto**: Agregar una señal de que hay más (un degradado de corte en el borde derecho) o revisar el tamaño de las entradas en celular. Es decisión de diseño.

### [nota] El botón secundario no da señal visible al pulsarlo con el dedo. Su relleno de hover y de pulsado es niebla, que es exactamente el fondo de página, así que lo único que se ve al pasar el ratón es que el borde se oscurece. Y la regla de :active solo cambia el relleno, no el borde: en un teléfono, donde :hover nunca ocurre, pulsar Atrás, Volver o Cerrar no produce ningún cambio.

- **Dónde**: src/client/estilos.css:294 y 295
- **Cómo se supo**: medido
- **Evidencia**: Medido a escala 1 a 1 con el ratón encima y esperando a que termine la transición de 200ms: en reposo el botón da background rgba(0,0,0,0) y borderColor rgba(10,10,10,0.44); con el ratón encima da rgb(244,245,246) y rgb(10,10,10); el fondo de página da rgb(244,245,246). O sea que el relleno de hover es idéntico al fondo. La parte de :active sin hover está deducida de la regla, no medida: la línea 295 declara solo background.
- **Arreglo propuesto**: Que :active cambie también el borde, o usar un relleno distinto del fondo de página. Lo primero es una palabra en la línea 295.

### [nota] Queda un color crudo en la hoja, el único fuera del :root. Es la sombra hacia arriba de la hoja deslizable del celular, que se escribió con rgba literal en vez de subir a token, que es justo lo que la ronda 1 hizo con las otras tres sombras.

- **Dónde**: src/client/estilos.css:785
- **Cómo se supo**: medido
- **Evidencia**: Barrido de toda la hoja fuera del :root buscando hex y rgb: sale una sola línea, box-shadow: 0 -8px 32px rgba(10, 10, 10, 0.13). Confirmado en el navegador: en p48 la .hoja-deslizable computa boxShadow rgba(10,10,10,0.13) 0px -8px 32px 0px. Entró en la fase 7 (ea2d71a). Los tres tokens de sombra existentes están en src/client/tokens/rappimind.css, sección SOMBRAS Y VELOS.
- **Arreglo propuesto**: Subirla a token en src/client/tokens/rappimind.css, junto a --rm-sombra-glosario y --rm-sombra-flotante, por la misma razón que las otras: que el día que la marca mueva la tinta, esta no se quede atrás.

**Lo que revisó**

- Las 48 pantallas de docs/FRONT_ACTUAL.html, ancla por ancla, cargadas en Chromium con Playwright y midiendo estilos calculados dentro de cada marco .rm-pantalla, descontando el zoom 0.78 del marco
- Las cuatro clases que la ronda 1 dejó señaladas: .progreso-cuenta ya tiene regla (src/client/estilos.css:342, aunque no cambia nada), y .nota, .preguntas-filtro y .pagina-seccion siguen sin ninguna
- Barrido completo de clases: 80 clases distintas en las 48 pantallas contra la hoja, buscando cuáles no tienen ninguna regla. Solo tres son de la aplicación; .rm-marca es del documento envolvente y sí tiene regla en scripts/lib/front-documento.js:176
- Barrido de colores huérfanos: todos los color, background-color, border-color, outline-color, fill y stroke de cada elemento de cada pantalla, contra la paleta de src/client/tokens/, y barrido de hex y rgb crudos fuera del :root de la hoja
- Barrido de tipografías: familias y pesos calculados en los 4300 elementos de las 48 pantallas, más el recuento de font-weight de la hoja y el rastreo por commit de dónde entró cada uno
- Consistencia entre pantallas: firma de estilo calculado por clase, comparando todas las variantes de una misma clase entre pantallas para encontrar la que se salió del patrón
- Las pantallas de más riesgo, una por una y con captura: Travel (p29, p30), Brasil y el selector de idioma (p43, p44, p45), la ampliación (p41), el acuerdo de datos (p40), la administración (p42), el error en vivo (p39), la opción bloqueada (p38), los T&C generales (p31, p32, p33) y las tres de celular (p46, p47, p48)
- Los estados que las pantallas congeladas no muestran, reproducidos a escala 1 a 1 en el scratchpad con la hoja concatenada en el orden real de scripts/lib/hoja-completa.js: campo lleno, campo vacío, campo en error con valor y sin valor, fecha en error, textarea en error, botón deshabilitado, botón secundario en reposo, con el ratón encima y pulsado
- La barra de progreso en las 31 pantallas que la tienen: número de pasos, ancho de segmento, si las etiquetas se caen y si el nombre del paso queda repetido
- El recuento de avisos por pantalla y el color que le toca a cada uno, para comprobar la regla de un solo pastel por pieza
- src/core/correo.js y src/server/, buscando dónde no llegó el cambio de identidad fuera de src/client/
- Los ocho mensajes de commit de las fases 1 a 8 más el de cierre, y los archivos de src/client/tokens/, docs/diseno/tokens/, scripts/lib/hoja-completa.js y las decisiones 98 a 111
- npm test (678 pruebas, todas verdes) y npm run contraste (verde). No escribí nada y no corrí front, demo ni build

**Lo que no pudo revisar**

- Las tipografías reales. En el navegador sin red no cargan ni Archivo (viene de Google Fonts) ni PP Object Sans, así que todo lo que digo de pesos y familias son valores calculados, no glifos dibujados. Los anchos de línea y los cortes de palabra de docs/FRONT_ACTUAL.html se moverán cuando Archivo cargue de verdad. Esto afecta a un número concreto: los 556px de la bajada del panel de momento salen de 46ch con la letra de respaldo; con Archivo el tope es menor y el escalón crece, así que el hallazgo queda del lado conservador
- El render dentro de Apps Script. No corrí clasp ni build, así que no comprobé que dist/Estilos.html se sirva igual que lo que medí. Eso es del auditor FRONTERA APPS SCRIPT
- El comportamiento táctil real de p46, p47 y p48. Medí :hover con ratón; la parte de :active sin :hover queda deducida de la regla
- Las pantallas con el documento ya lleno. Las 48 congeladas muestran la vista previa con el texto de marcador, así que no vi la hoja del documento con cláusulas de verdad, ni los huecos, ni el destello de lo que acaba de cambiar
- Los estados de foco de teclado pantalla por pantalla, que son del auditor ACCESIBILIDAD, y la medición de contraste de los pares nuevos, que es del auditor CONTRASTE. Solo anoto que npm run contraste no tiene ningún par para la superficie del control deshabilitado contra el fondo de página, que es donde encontré 1.00:1
- El correo renderizado en un cliente real. Leí el HTML que arma src/core/correo.js y comparé sus valores con el :root anterior al cambio, pero no lo abrí en Gmail
- Si el texto en español dentro de la interfaz en portugués de p45 (Mi campaña no es ninguna de estas y Te llevamos al formulario de Legal con el motivo) es un hueco de traducción o algo esperado. Es contenido, no piel, y el diff de textos.json lo daría por bueno porque no cambió con este trabajo

---

## FRONTERA

**8 hallazgos**: 2 serio, 2 menor, 4 nota

La frontera del build está bien cruzada en lo que importa para producción. Los cinco archivos de tokens se concatenan en el orden escrito, rappimind.css penúltimo y estilos.css al final; no queda ni un @import ni una url() sin resolver en dist/Estilos.html; el base64 de PP Object Sans Heavy decodifica byte a byte al woff2 del repositorio y, medido en el navegador, carga y se dibuja de verdad en el h1 a peso 900, sin arrastrar el cuerpo de texto a Heavy; y dist/ se reconstruye idéntico dos veces y coincide con lo que ya había. La hoja nueva tampoco rompió el acotador: las reglas de celular siguen valiendo solo en los marcos de celular, la consulta de contenedor mide el interior del marco y no la ventana del lector, y declarar container-type no tocó ningún elemento fijo, ningún z-index ni ningún sticky. Las otras tres fronteras están intactas: esta ronda no tocó src/server, src/core, data ni modelos, y MotorCliente.html sale byte a byte igual que antes del cambio. Hay dos cosas serias que arreglar antes de dar la ronda por buena, y ninguna de las dos la caza una prueba. La primera es que docs/FRONT_ACTUAL.html no carga la letra de la marca en ninguna de sus 48 pantallas, porque scripts/front.js:380 no incrusta las fuentes y la url() relativa apunta a una carpeta que no existe: producción y las capturas están bien, pero el documento navegable con el que se audita esta misma ronda enseña la tipografía equivocada, en silencio, y tres de los cinco auditores lo están mirando. La segunda es que la página servida creció el doble de lo predicho, +15,53% con gzip contra el +10,42% de la medición que cerró la decisión 100: la letra cuesta exactamente lo que se dijo, y la diferencia es que la hoja de estilos engordó 34,9 KiB de texto CSS, 24,0 KiB de ellos comentarios, que Apps Script vuelve a mandar en cada doGet. Quitar los comentarios al construir dist/, sin tocar las fuentes, deja la página a 1,4 KiB de lo predicho. Lo demás son cuatro huecos en la red y dos notas de limpieza: la puerta de contraste enumera la carpeta de tokens mientras el build usa una lista fija, y lo demostré poniendo un archivo nuevo que el build ignora y contraste sí mide; la prueba de url() relativas solo caza las que llevan dos puntos y una barra, justo el hueco por el que entraría el logo o el favicon; incrustarLetras corre sobre los comentarios; y los dos tokens que documentan los umbrales de la barra de progreso no los usa nadie. Nada de esto rompe hoy. Todo esto rompe callado el día que alguien agregue un archivo.

### [serio] docs/FRONT_ACTUAL.html no carga PP Object Sans: la letra de la marca no se ve en ninguna de las 48 pantallas del documento con el que se audita esta ronda. scripts/front.js llama a hojaCompleta() sin incrustarFuentes, así que la url() relativa del @font-face viaja tal cual; dentro de docs/ resuelve a rappimind-v3/assets/fonts/, que no existe. Producción no está afectada y las capturas tampoco, porque capturar-pantallas.js abre demo/index.html, que sí hereda dist/Estilos.html. El que miente es el documento navegable, justo el que recorren los auditores de COBERTURA y FIDELIDAD.

- **Dónde**: scripts/front.js:380 (resultado en docs/FRONT_ACTUAL.html:59 y 2273)
- **Cómo se supo**: medido
- **Evidencia**: Playwright sobre file://docs/FRONT_ACTUAL.html: document.fonts.check("900 40px PPObjectSans") devuelve false, la FontFace queda en estado "error" y el navegador registra la petición fallida file:///home/user/rappimind-v3/assets/fonts/PPObjectSans-Heavy.woff2 :: net::ERR_FILE_NOT_FOUND. grep: data:font aparece 1 vez en demo/index.html y en dist/Estilos.html, y 0 veces en docs/FRONT_ACTUAL.html. Sobre demo/index.html, en cambio, la misma medición da check true, estado "loaded", y un span de prueba a peso 900 mide 707px con PPObjectSans contra 680,06px con una familia inexistente, o sea que se aplica de verdad.
- **Arreglo propuesto**: Cambiar scripts/front.js:380 por hojaCompleta({ incrustarFuentes: true }). Cuesta 28.924 B sobre un archivo de 471 KB que solo se lee en local. El comentario de scripts/lib/hoja-completa.js:86 a 90 justifica no incrustar ahí porque "solo interesa el texto de las reglas", y eso dejó de ser cierto el día que FRONT_ACTUAL pasó a ser la prueba visual de un cambio de tipografía.

### [serio] El HTML servido creció más del doble de lo que predijo el agente ASSETS: +7,42% sin comprimir y +15,53% con gzip, contra el +3,34% y el +10,42% de la tabla. La letra cuesta exactamente lo predicho. Lo que no se predijo es que la hoja de estilos misma crecería 34,9 KiB de texto CSS, de los cuales 24,0 KiB son comentarios. Como Apps Script arma el HTML con doGet en cada petición y no lo cachea, eso se paga en cada carga, que es el criterio con el que Juan tomó la decisión 100.

- **Dónde**: docs/diseno/MEDICION_FUENTES.md:112 (la fila "Solo el 900 Heavy") contra dist/Estilos.html
- **Cómo se supo**: medido
- **Evidencia**: Reconstruí el commit anterior al cambio de identidad (git archive f5cb5a1 dentro del scratchpad, build propio) y resolví los tres incluir de Index.html en las dos versiones. Antes: 866.904 B, 846,6 KiB, gzip nivel 9 221.225 B, 216,0 KiB (la medición de ASSETS decía 866.833 B y 221.078 B, o sea que la base cuadra). Ahora: 931.203 B, 909,4 KiB, gzip 255.576 B, 249,6 KiB. Lo predicho era 874,8 KiB y 238,4 KiB. Desglose del crecimiento de 64.299 B: el base64 de la letra son 28.924 B y decodifica byte a byte al woff2 de 21.692 B (comprobado con Buffer.equals, firma wOF2); estilos.css pasó de 22.282 a 41.833 B; los cinco archivos de tokens suman 15.118 B nuevos; Index.html subió 488 B. Los comentarios CSS de la hoja servida son 24.593 B, el 43% del texto. MotorCliente.html y App.html quedaron idénticos byte a byte, 629.319 y 214.419 B, lo que confirma que no se tocó src/client/js/.
- **Arreglo propuesto**: Quitar los comentarios CSS al generar dist/Estilos.html, en scripts/build.js:204 o dentro de hojaCompleta cuando incrustarFuentes es true, sin tocar las fuentes ni las pruebas ni FRONT_ACTUAL, que sí quieren leerlos. Lo medí: la página baja a 906.405 B y 245.573 B con gzip, o sea 239,8 KiB, a 1,4 KiB de lo que ASSETS predijo. Ahorra 24.798 B crudos y 10.003 B comprimidos en cada carga.

### [menor] El build y la puerta de contraste no miran la misma lista de tokens y pueden discrepar sin que nada lo diga. hoja-completa.js usa una lista fija de seis rutas; contraste.js enumera la carpeta con listarArchivos. Un archivo .css nuevo en src/client/tokens/ no viaja al navegador y sin embargo sí entra en la medición de contraste. La decisión 102 afirma que la prueba "toda variable de estilo que se usa está definida" lo caza, y solo lo caza en el caso en que estilos.css use una variable que defina el archivo olvidado.

- **Dónde**: scripts/lib/hoja-completa.js:45 (const ORDEN) contra scripts/contraste.js:33
- **Cómo se supo**: medido
- **Evidencia**: En una copia del repositorio en el scratchpad agregué src/client/tokens/zz-extra.css con :root { --rm-texto: #BBBBBB; }. Resultado: hojaCompleta() no incluye el archivo ni el valor; npm test sigue en 678 pruebas verdes y 0 fallas; npm run contraste se pone rojo con "texto principal sobre papel 1,92:1" y "texto principal sobre niebla 1,76:1" y devuelve 1. O sea que la puerta de calidad falla por un valor que ningún usuario va a ver nunca. Borré la copia al terminar.
- **Arreglo propuesto**: Que hojaCompleta liste la carpeta y afirme que el conjunto de archivos coincide con ORDEN, o una prueba en pruebas/estilos.test.js que compare listarArchivos(rutaDesdeRaiz('src','client','tokens'), '.css') contra ORDEN y falle nombrando el archivo que sobra o falta. Hoy la prueba solo comprueba que ORDEN tenga longitud 6 (pruebas/estilos.test.js:102), que es afirmar sobre la lista misma, no sobre el disco.

### [menor] La prueba que cuida las url() relativas en dist/Estilos.html solo caza las que llevan ../ . Una url('logo.png') o url('assets/logo/rappi-logo-220.png') pasa la prueba, y incrustarLetras solo sabe de .woff2 y .woff, así que la dejaría intacta. El resultado sería una ruta que del lado de Apps Script no existe, sin error y sin aviso, que es exactamente el modo de falla de la frontera 2. No es hipotético: la decisión 110 deja abierta la puerta al lockup y al favicon, y la 111 al bigote.

- **Dónde**: pruebas/build.test.js:250
- **Cómo se supo**: medido
- **Evidencia**: Corrí el regex de esa línea contra cuatro casos: url('../assets/fonts/x.woff2') lo caza, url('logo.png') no, url('assets/logo/rappi-logo-220.png') no, url(imagenes/bigote.png) no. Y incrustarLetras(".a{background:url('logo.png')}") devuelve la cadena sin tocar, confirmado con una comparación de igualdad.
- **Arreglo propuesto**: Cambiar el regex por uno que exija que toda url() del archivo empiece por data:, en vez de buscar el patrón ../ . Queda así: cualquier url() que no sea un data: es una url() sin resolver, sin importar cómo esté escrita. Y que incrustarLetras avise, en vez de callar, cuando encuentre una url() relativa cuya extensión no sabe incrustar.

### [nota] incrustarLetras corre sobre el CSS crudo, comentarios incluidos, así que un comentario que escriba una ruta de ejemplo a un .woff2 se llevaría los 28 KB de base64 dentro del comentario, en cada carga y para siempre. Hoy no pasa nada porque los dos url() que hay en comentarios están vacíos y el regex pide al menos un carácter dentro del paréntesis. En un repositorio cuyos comentarios hablan justamente de url() y de nombres de archivo de letra, el margen es estrecho.

- **Dónde**: scripts/lib/hoja-completa.js:66 (la llamada a css.replace), con los comentarios supervivientes en dist/Estilos.html:37 y 39
- **Cómo se supo**: medido
- **Evidencia**: grep sobre dist/Estilos.html: tres apariciones de url(, dos de ellas dentro del comentario largo de fonts.css (líneas 37 y 39) y una sola real, la de la línea 43 con el data:font/woff2. Las dos de comentario sobreviven porque el paréntesis está vacío, no porque el código las excluya.
- **Arreglo propuesto**: Sacar los comentarios antes de sustituir, o al menos no sustituir dentro de ellos. Si se adopta el arreglo del hallazgo del peso, que quita los comentarios al construir dist/, este queda resuelto de paso.

### [nota] Los dos tokens que documentan la regla de la barra de progreso no los usa nadie: los umbrales de verdad están escritos a mano en las cinco consultas de contenedor y en los :nth-child. Cambiar el token no cambia el comportamiento, y eso es una trampa silenciosa para quien venga después a ajustar la regla.

- **Dónde**: src/client/tokens/rappimind.css:96 y 97 (--rm-paso-min-etiqueta y --rm-paso-max-etiqueta), umbrales reales en src/client/estilos.css:374 a 388
- **Cómo se supo**: medido
- **Evidencia**: Auditoría propia de var() sobre dist/Estilos.html, que es lo que se sirve: 219 variables definidas, 126 usadas, y esos dos nombres entre los 94 que nadie referencia. La única variable usada y no definida es --avance, que la fija el JavaScript en línea (src/client/js/62-pasos.js:403), así que esa está bien.
- **Arreglo propuesto**: Dejarlos como comentario y no como token, o hacer que las consultas de contenedor los usen. Un token que no se puede cambiar es documentación disfrazada de configuración. Si se quedan, que el comentario diga que son descriptivos.

### [nota] Ochenta y nueve tokens de la capa de marca viajan al navegador en cada carga y no los usa la hoja: toda la familia --color-pro-*, --text-*, --space-*, --gap-*, --shadow-*, --inapp-*, --banner-*, --email-* y los de tracking. Son el catálogo de RappiAds completo, del que la aplicación usa una esquina. No rompe nada; pesa y confunde, porque parecen una API disponible y la hoja en realidad trabaja con los --rm-* y su capa de alias.

- **Dónde**: src/client/tokens/colors.css, src/client/tokens/typography.css y src/client/tokens/spacing.css (6.082 B entre los tres)
- **Cómo se supo**: medido
- **Evidencia**: Misma auditoría de var() sobre dist/Estilos.html: 94 variables definidas y no usadas, de las cuales 89 son de esos tres archivos. Las otras cinco son --rm-texto, --rm-anillo-color, --rm-aviso-error-color y los dos umbrales de la barra. Comprobé que las tres primeras no son un defecto de contraste: .mensaje-error usa var(--neon-texto) y el foco usa var(--neon), que resuelven al mismo valor que los tokens sin usar (#D91F20 y #FF2526), así que los arreglos 3 y 5 de la auditoría de contraste sí están aplicados, solo que por otro nombre.
- **Arreglo propuesto**: Decisión de Juan, no técnica. Si se quiere el catálogo entero como referencia, que se quede pero documentado en docs/diseno/tokens/ y fuera de lo que se sirve. Si se quiere aligerar, recortar colors.css, typography.css y spacing.css a lo que la hoja referencia de verdad.

### [nota] npm test reconstruye dist/ por su cuenta, en un test.before. La regla de esta ronda dice que solo un agente corre npm run build para que no se pisen, y a la vez autoriza npm test a todos, que hace lo mismo. No es un defecto del código, es un agujero en la regla de coordinación de la ronda.

- **Dónde**: pruebas/build.test.js:39 a 41
- **Cómo se supo**: medido
- **Evidencia**: construir() se importa en pruebas/build.test.js:15 y se llama en el test.before de la línea 40. Corrí npm test y después comparé los sha256 de los 47 archivos de dist/ contra la foto que tomé al empezar: idénticos, así que en esta ronda no hubo daño, pero la escritura ocurre.
- **Arreglo propuesto**: Nada en el código. Para la próxima ronda de auditores en paralelo, decir que npm test también escribe dist/, o construir en una carpeta temporal dentro de la prueba.

**Lo que revisó**

- Punto 1, el orden de concatenación. Pasa. dist/Estilos.html trae los seis marcadores en el orden correcto: fonts.css línea 3, colors.css 49, typography.css 124, spacing.css 193, rappimind.css 251 y estilos.css 392. Vale la pena saber, eso sí, que hoy el orden entre los tokens es inerte para los valores: comprobé con un script que ninguno de los 219 tokens se define dos veces, así que rappimind.css no pisa nada de marca en la práctica, porque usa su propio prefijo --rm-. La red sigue valiendo para el día en que sí se pisen.
- Punto 2, ningún @import y ninguna url() relativa sin resolver en dist/Estilos.html. Pasa. Cero @import en dist y cero en las fuentes de src/client/. La única url() real es la línea 43 con el data:font/woff2; las de las líneas 37 y 39 son texto de comentario con el paréntesis vacío.
- Punto 3, que la letra entre en base64 y cargue de verdad. Pasa en producción y falla en el documento de revisión. El base64 decodifica exactamente a los 21.692 bytes del woff2 del repositorio, con firma wOF2. En demo/index.html, que hereda dist/Estilos.html, document.fonts da la cara PPObjectSans/900/loaded, el h1 computa familia PPObjectSans a peso 900, y un span de prueba mide 707px contra los 680,06px de la familia de respaldo, o sea que se dibuja con ella y no solo se nombra. Además recorrí las 48 pantallas de FRONT_ACTUAL buscando cualquier elemento cuya familia computada incluya PPObjectSans con peso distinto de 900: cero. La trampa que describe la decisión 101 no saltó.
- Punto 4, que dist/ se reconstruya idéntico dos veces. Pasa. Hice el sha256 de los 47 archivos tres veces: la foto de cómo lo encontré, el primer build y el segundo. Los tres juegos son idénticos, lo que además confirma que el dist/ que había ya estaba al día con las fuentes.
- Punto 5, el peso del HTML servido. No cuadra con lo predicho, y está arriba como hallazgo con el desglose y la causa.
- Punto 6, que la hoja nueva no rompa scripts/lib/estilos-acotados.js. Pasa, y lo medí en el navegador, que es lo que no cubría ninguna prueba. Las reglas de celular valen solo en los marcos de celular y no dependen del ancho de la ventana del lector: con la ventana en 1600 y en 800, los marcos de escritorio mantienen .progreso en flex, .columna-documento en block, el h1 en 28px y el botón flotante en display none, mientras los marcos de celular dan .progreso none, .columna-documento none, h1 23px y el botón flotante en flex. El documento que rodea las pantallas no se contagia. La consulta de contenedor mide lo que tiene que medir: el contenedor da 620px de ancho de maquetación en los marcos de escritorio y 358px en los de celular, y ese 620 no cambia aunque el zoom del marco pase de 0,78 a 0,62 y a 0,4, o sea que mide el interior del marco y no la ventana del lector. Las etiquetas caen donde deben: con 7 pasos siempre, con 5 pasos a 620px se ven, con 7 pasos en celular a 358px no. Los umbrales 188, 288, 388, 488 y 588 cuadran con la aritmética declarada, porque --e3 es 12px (src/client/estilos.css:69).
- Efectos colaterales de declarar container-type, que es lo que nadie había mirado. container-type implica contención de maquetación, que convierte al elemento en bloque contenedor de los descendientes fijos y absolutos y le crea un contexto de apilamiento. Comprobé en las 48 pantallas que ninguno de los cuatro elementos con position fixed (.boton-flotante, .cortina, .hoja-deslizable, .selector-idioma) cuelga de .columna-preguntas ni de .pagina-angosta: los cuatro son hermanos de .pagina. Dentro de los 45 contenedores no hay ni un z-index ni un position sticky. El único absoluto de dentro es .simbolo-moneda, cuyo ancestro posicionado sigue siendo .campo-caja.con-moneda. Y el panel del glosario se cuelga de document.body (src/client/js/50-campos.js:63), fuera de todo contenedor.
- Punto 7, las otras tres fronteras. Ninguna se tocó sin querer. git diff 8f783b9..HEAD sobre src/server, src/core, data y modelos sale vacío, así que la frontera 1 (fechas y listas hacia el navegador) y la 3 (columnas del Sheet) quedan como estaban. La frontera 2 también: MotorCliente.html sale byte a byte idéntico al de antes del cambio. La frontera 4 aguanta: los archivos nuevos son .css y un .woff2 bajo src/client/, que no llegan a dist/, y revisarColisionesDeNombre corre dos veces en el build y pasa con los 47 archivos.
- npm test: 678 pruebas, 678 verdes, 0 fallas. npm run contraste: verde, devuelve 0, con cuatro pares anotados y justificados.
- Las pruebas que cuidan esta frontera, para ver dónde tienen hueco: pruebas/build.test.js:232 cubre el @import, el orden de las seis capas y la presencia del base64, y pruebas/estilos.test.js:98 y 114 cubren ORDEN y el @import sobre la hoja sin incrustar. Los dos huecos que encontré están arriba como hallazgos.

**Lo que no pudo revisar**

- Si el despliegue real de Apps Script sirve la página con gzip o con brotli, y con qué cabeceras. Las cifras comprimidas que doy asumen gzip nivel 9, igual que hizo ASSETS. Con brotli el HTML bajaría más y el base64 seguiría igual, así que el porcentaje de crecimiento sería peor, no mejor. Esta ronda no despliega.
- Si la política de seguridad de contenido del sandbox de Apps Script permite un @font-face con data: URI. Lo deduzco que sí porque el modo IFRAME sirve el HTML del usuario casi tal cual y la hoja va embebida en el mismo documento, pero no lo puedo comprobar sin un despliegue. Si lo bloqueara, la letra desaparecería en silencio en producción y en ningún otro sitio, que es el peor caso posible.
- La licencia de PP Object Sans. El punto 9.1 de docs/diseno/MEDICION_FUENTES.md lo dejó como pregunta abierta para Juan, y esta ronda incrustó la fuente en base64 sin que quede rastro de la respuesta: busqué en docs/PENDIENTES_LEGAL.md y en docs/PROGRESO.md y no hay nada. No es mi frontera, pero el build que acabo de auditar ya embarca el archivo completo, extraíble por cualquiera que abra la herramienta.
- Si Archivo carga de verdad desde Google Fonts. En este entorno la petición a fonts.googleapis.com muere con ERR_CERT_AUTHORITY_INVALID por el proxy, así que todo el cuerpo de texto que medí salió en la letra de respaldo del sistema. Lo que sí pude comprobar es que eso no arrastra a PP Object Sans a hacer de cuerpo, que era la trampa de la decisión 101.
- La demostración y el recorrido de pantallas en vivo. No corrí npm run demo ni npm run front, como pedía la ronda; medí sobre los artefactos ya generados, que comprobé que corresponden a las fuentes de hoy.

---
