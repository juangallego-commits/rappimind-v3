# Brasil: qué traen los cuatro T&C aprobados

Análisis de los cuatro documentos que mandó Legal Brasil el 17 de septiembre de
2026, descritos por ellos como "los que más les piden":

1. `Legal BR · T&C · Desconto % OFF`
2. `Legal BR · T&C · Frete Grátis`
3. `Legal BR · T&C · Taxa de serviço mínimo de compra`
4. `Legal BR · T&C · Taxa de serviço e entrega grátis`

Los textos no se tocaron ni se tradujeron. Esto es solo el mapa de lo que hay.

## El hallazgo principal: no son cuatro modelos, es uno

Los cuatro documentos son **la misma estructura, palabra por palabra**, con un
solo tramo que cambia: qué recibe el usuario. Las trece cláusulas de
"CONDIÇÕES GERAIS DA PROMOÇÃO" son idénticas en los cuatro.

Eso significa **un modelo con cuatro formas del beneficio**, no cuatro modelos.
Es bastante menos trabajo que los cinco de Colombia.

## La estructura, tramo por tramo

| Tramo | Qué es |
|---|---|
| Título | `TERMOS E CONDIÇÕES DA CAMPANHA <nombre>` |
| Apertura | Un párrafo que describe el beneficio, el socio y la condición |
| Definición | "Usuário" para fines deste T&C, fija en los cuatro |
| REGRAS PRINCIPAIS | Nueve viñetas, de las que cuatro cambian |
| CONDIÇÕES GERAIS | Trece párrafos, idénticos en los cuatro |
| Cierre | "Consulte nossos Termos de Uso...", con sus dos enlaces a `legal.rappi.com/brazil/`, y "São Paulo/SP" en los cuatro |

## Las cuatro formas del beneficio

| Forma | Qué recibe el usuario | Lleva mínimo de compra | Lleva tope |
|---|---|---|---|
| Desconto % OFF | Hasta X% de descuento en el pedido | Sí (R$300 en el ejemplo) | Sí, en reales (R$60) |
| Frete Grátis | El envío sin costo | Sí (R$120 en el ejemplo) | Sí, el valor máximo del envío |
| Taxa de serviço | La tarifa de servicio sin costo | Sí (R$80 en el ejemplo) | No aparece |
| Taxa de serviço e frete grátis | Las dos cosas | No, en este no hay mínimo | No aparece |

Ninguno de los cuatro entrega **Créditos**: son descuentos directos y exenciones
de tarifa. Es un mecanismo distinto al Cashback de Colombia, y por eso no
aparecen ni la Billetera ni la vigencia de los Créditos ni la carga.

## Lo que tendría que responder el comercial

Todo esto sale de los cuatro documentos, ningún dato es inventado:

- **El socio** (Petz, Drogasmil, Raia, Ri Happy): texto libre, como la tienda en Colombia.
- **La forma del beneficio**: una de las cuatro de la tabla.
- **El porcentaje**, solo en Desconto % OFF.
- **El tope en reales**, cuando la forma lo lleva.
- **El mínimo de compra en reales**, opcional: la campaña de taxa de serviço e
  frete grátis no lo tiene.
- **Fecha y hora de inicio y de fin.** Los cuatro arrancan a las `00:01` y
  terminan a las `23:59`, escritas así, con cero inicial y dos puntos. Desde el
  20 de septiembre de 2026 el formulario de Brasil arranca en `00:01` por
  defecto (punto B3).
- **El límite de pedidos por usuario**: un número, o "não há limite", que es
  como lo dice el documento de taxa de serviço e frete grátis.
- **Los medios de pago**: una lista que cambia entre documentos. Aparecen
  Dinheiro, Paypal, RappiPay, Cartão de crédito Visa, Cartão de crédito
  Mastercard y Voucher Refeição. En uno de los cuatro no está Dinheiro.
- **La cobertura**: los cuatro dicen todo el territorio brasileño. No hay
  ninguno por ciudades.

## La comparación contra lo que sale hoy

Se hizo el 20 de septiembre de 2026, línea por línea, contra los casos dorados
BR01 a BR04. La única diferencia de fondo era el orden de la cifra y las letras,
y se corrigió ese día (punto B3). Lo demás, y los dos datos de esta página que
estaban mal leídos, están en `docs/CORRECCIONES_BRASIL.md`.

Dos cosas siguen esperando a los abogados de Brasil, que las miran cuando
prueben la herramienta: el "São Paulo/SP" del cierre, que está en los cuatro
aprobados y el modelo no imprime, y la lectura de los textos del formulario en
portugués (punto E2).

## Lo que ya quedó listo del lado técnico

La maquinaria de idioma ya corre: los meses en portugués, la hora con cero
inicial, la conjunción "e" de las listas y los números en letras con las reglas
del portugués, incluido el "e" del último tramo ("mil e quinhentos" pero "mil
duzentos e cinquenta") y la concordancia femenina.

Lo que falta para generar el primer documento de Brasil es el modelo en sí, y
ese depende de las decisiones legales que están en `docs/PENDIENTES_LEGAL.md`,
sección "Brasil".
