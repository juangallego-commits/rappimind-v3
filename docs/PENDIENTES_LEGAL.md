# Pendientes de revisión legal (punto de control A)

Revisar con los textos de `pruebas/salidas_esperadas/`.

El motor ya reproduce esos textos exactamente. Para verlos salir del motor y no
del archivo: `npm run previsualizar CB01` (o CB02, CC01, CD01, MX01). Al
implementar la sección 5 no apareció ningún error en los textos de Legal: todo
lo que hay que confirmar es lo que ya está en esta lista.

## Cashback: cambios frente al modelo aprobado de julio
1. El rol de Rappi pasó a la cláusula 1 (antes estaba al final), para que "Rappi" quede definido antes de usarse.
2. Se agregó la frase: los términos con mayúscula inicial tienen el significado de los T&C de Uso de la Plataforma.
3. La tienda queda nombrada y definida en la cláusula de Cobertura ("Jumbo MT (en adelante, la Tienda Participante)"). Antes el documento nunca decía el nombre de la tienda.
4. "Beneficio" se define en la cláusula de Mecánica y antes solo se usa en minúscula.
5. Se quitaron los asteriscos impresos y el doble punto.
6. Nueva frase opcional de compra mínima.
7. El organizador responde por "el beneficio o premio" (redacción común con Carrera).

## Textos nuevos o ajustados
1. Medios de pago: se agregó en "Todos" y "RappiCard" que los pedidos pagados con Créditos no son válidos (antes solo estaba en "excepto efectivo").
2. Segmentos nuevos: Nuevos usuarios y Usuarios reactivados (con días sin compra).
3. Condiciones opcionales: "solo Turbo" y "solo consumo en el local".
4. Nombres de las secciones para la redención (`data/secciones.json`). En las 1.184
   solicitudes reales aparece una sección **Express** que no está en el archivo, y no
   aparecen **Farmacia** ni **Tiendas especializadas**, que sí están. No toqué
   `data/`: decide tú cuál es la lista correcta. Ver `docs/HALLAZGOS_SOLICITUDES.md`.

## Carrera de Compras
El kit no tenía el .docx v2 de julio. El modelo v3 se armó desde el v1 más las decisiones de julio. Si tienes el v2, compáralo.
1. Organizador: ya no dice "(en adelante, Rappi)".
2. Productos participantes: nueva frase según tres opciones (todos, una marca, productos específicos).
3. Desempate: ahora es una oración que dice quién gana.
4. Premio: "Cada ganador recibirá…" cuando hay varios ganadores.
5. Cláusula de impuestos genérica (nueva).
6. Frase de datos para la entrega cuando entrega el Organizador (nueva).
7. Ley aplicable: igual a Cashback (se quitó la conciliación del v1).

## Cashback Day
1. El máximo de pedidos hoy aplica a toda la campaña. Confirmar si debe ser por tienda.

## Países
1. Por confirmar en las pruebas de cada país: separador de miles, término de días, texto de hora local y texto de derechos de datos.
2. Chile: autoridad de datos (la agencia nueva entra con la Ley 21.719).
3. México: confirmar que abre el link de T&C de Créditos (el enlace dice "terminos-ycondiciones").

## Fuera del alcance de v3, con demanda real
1. **Rappi Travel** es el 12% de las solicitudes (138 de 1.184) y v3 no lo cubre. Hoy
   la interfaz lo manda al formulario de Legal. Confirmar si eso es lo que quieres o
   si Travel entra en una versión siguiente.
2. Descuentos que no son cashback (porcentaje de descuento, cupones, 2x1, combos,
   obsequios) son 319 de 711 promociones y tampoco están en v3.
