# Prototipo en Python usado por Legal para validar la especificación y los modelos (16 sep 2026).
# La implementación real va en JavaScript (src/core). Úsalo solo como referencia de comportamiento esperado.
# Nota: el prototipo usa BASE fijo; ajústalo a la ruta del repo si lo quieres correr.
import json, re, datetime
BASE='/home/claude/kit/rappimind_v3'
UNI=['cero','uno','dos','tres','cuatro','cinco','seis','siete','ocho','nueve','diez','once','doce','trece','catorce','quince','dieciséis','diecisiete','dieciocho','diecinueve','veinte','veintiuno','veintidós','veintitrés','veinticuatro','veinticinco','veintiséis','veintisiete','veintiocho','veintinueve']
DEC={30:'treinta',40:'cuarenta',50:'cincuenta',60:'sesenta',70:'setenta',80:'ochenta',90:'noventa'}
CEN={100:'ciento',200:'doscientos',300:'trescientos',400:'cuatrocientos',500:'quinientos',600:'seiscientos',700:'setecientos',800:'ochocientos',900:'novecientos'}
def _0_999(n):
    if n<30: return UNI[n]
    if n<100:
        d,u=divmod(n,10); return DEC[d*10]+('' if u==0 else ' y '+UNI[u])
    if n==100: return 'cien'
    c,r=divmod(n,100); return CEN[c*100]+('' if r==0 else ' '+_0_999(r))
def apocopar(t):
    t=re.sub(r'veintiuno$','veintiún',t); t=re.sub(r'(?<![a-z])uno$','un',t); return t
def letras(n, apocope=False):
    if n==0: return 'cero'
    partes=[]
    mill,resto=divmod(n,1_000_000)
    miles,uni=divmod(resto,1000)
    if mill:
        partes.append('un millón' if mill==1 else apocopar(letras(mill))+' millones')
    if miles:
        partes.append('mil' if miles==1 else apocopar(_0_999(miles))+' mil')
    if uni:
        partes.append(_0_999(uni))
    t=' '.join(partes)
    return apocopar(t) if apocope else t
def fmt(n, sep): 
    s=f"{int(n):,}"; return s.replace(',', sep)
def cantidad_creditos(n, pais):
    l=letras(n, apocope=True)
    de=' de' if re.search(r'(millón|millones)$', l) else ''
    return f"{l} ({fmt(n,pais['separador_miles'])}){de} Créditos"
MESES=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']
def fecha(s):
    d=datetime.date.fromisoformat(s); return f"{d.day} de {MESES[d.month-1]} de {d.year}"
def hora(s):
    h,m=map(int,s.split(':')); suf='a. m.' if h<12 else 'p. m.'; hh=h%12 or 12; return f"{hh}:{m:02d} {suf}"
def lista_y(xs):
    xs=[x.strip() for x in xs if x.strip()]
    return xs[0] if len(xs)==1 else ', '.join(xs[:-1])+' y '+xs[-1]
def fmt_id(pais, raw):
    t=pais['tipo_id_organizador']
    if pais['codigo']=='CO':
        num,dv=raw.replace('.','').split('-'); return f"NIT {int(num):,}".replace(',','.')+f"-{dv}"
    return f"{t} {raw}"
def derivados(e, pais):
    v={}
    v['NOMBRE_CAMPANA']=e.get('nombreCampana',''); v['NOMBRE_CAMPANA_MAYUS']=v['NOMBRE_CAMPANA'].upper()
    v['TIENDA']=e.get('tienda','')
    if e.get('alcance')=='Nacional': v['TEXTO_TERRITORIO']=f"el territorio nacional de {pais['pais_legal']}"
    else:
        cs=[c for c in e.get('ciudades','').split(',') if c.strip()]
        v['TEXTO_TERRITORIO']=(f"la ciudad de {cs[0].strip()}" if len(cs)==1 else f"las ciudades de {lista_y(cs)}")+f", en {pais['pais_legal']}"
    for k in ['Inicio','Fin']:
        v['FECHA_'+k.upper()]=fecha(e['fecha'+k]); v['HORA_'+k.upper()]=hora(e['hora'+k])
    v['TEXTO_HORA_LOCAL']=pais['texto_hora_local']
    if e.get('organizadorId'): v['ID_ORGANIZADOR']=fmt_id(pais,e['organizadorId'])
    v['ORGANIZADOR']=e.get('organizadorRazonSocial','')
    seg={'todos':'Pueden participar todos los Usuarios/Consumidores de la Plataforma Rappi que sean mayores de edad.',
         'pro':'Pueden participar los Usuarios/Consumidores que tengan activa la suscripción RappiPro y/o RappiPro Black.'}
    v['TEXTO_SEGMENTO']=seg[e['segmento']]
    mp={'todos':'Campaña válida para pedidos pagados con cualquiera de los medios de pago habilitados en la Plataforma Rappi. Los pedidos pagados total o parcialmente con Créditos no son válidos para la Campaña.',
        'sin_efectivo':'Campaña válida para pedidos pagados con todos los medios de pago habilitados en la Plataforma Rappi, excepto efectivo. Los pedidos pagados en efectivo, o total o parcialmente con Créditos, no son válidos para la Campaña.',
        'rappicard':'Campaña válida únicamente para pedidos pagados con RappiCard. Los pedidos pagados total o parcialmente con Créditos no son válidos para la Campaña.'}
    v['TEXTO_METODO_PAGO']=mp[e['metodoPago']]
    cm=e.get('compraMinima')
    monto=lambda n: f"{letras(n)} {pais['moneda_nombre']} ({pais['moneda_simbolo']}{fmt(n,pais['separador_miles'])})"
    v['TEXTO_MINIMO_COMPRA']=f"Para acceder al Beneficio, el valor de los productos de tu pedido deberá ser igual o superior a {monto(cm)}, sin incluir el costo de envío, la tarifa de servicio ni las propinas." if cm else ''
    if e.get('sinLimite'): v['TEXTO_LIMITE_PEDIDOS']='La Campaña no establece un número máximo de pedidos con Beneficio por Usuario/Consumidor, sin perjuicio del presupuesto disponible.'
    elif e.get('maxPedidos'):
        n=e['maxPedidos']; pal='pedido' if n==1 else 'pedidos'
        v['TEXTO_LIMITE_PEDIDOS']=f"Puedes obtener el Beneficio en un máximo de {letras(n,True)} ({n}) {pal} durante la vigencia de la Campaña; los pedidos adicionales no generarán el Beneficio y se procesarán como pedidos regulares."
    cond={'turbo':'El Beneficio aplica únicamente para pedidos realizados a través de Turbo.',
          'consumo_local':'El Beneficio aplica únicamente para pedidos realizados bajo la modalidad de consumo en el local disponible en la Plataforma Rappi.'}
    v['TEXTO_CONDICIONES']=' '.join(cond[c] for c in e.get('condiciones',[]))
    if 'porcentaje' in e: 
        p=e['porcentaje']; v['PORCENTAJE']=('cien' if p==100 else letras(p))+f" por ciento ({p}%)"
    if e.get('tope'): v['TOPE']=cantidad_creditos(e['tope'],pais)
    if e.get('presupuesto'): v['PRESUPUESTO']=cantidad_creditos(e['presupuesto'],pais)
    if 'carga' in e:
        v['TEXTO_CARGA']={'inmediata':'de manera inmediata una vez finalizada la orden','dia_siguiente':'al día siguiente de la finalización de la orden'}.get(e['carga']) or f"el {fecha(e['fechaCarga'])}"
    if e.get('vigencia')=='dias':
        n=e['diasVigencia']; v['TEXTO_VIGENCIA_CREDITOS']=f"tendrán una vigencia de {letras(n,True)} ({n}) {pais['termino_dias']} contados a partir de su carga"
    elif e.get('vigencia')=='fecha':
        v['TEXTO_VIGENCIA_CREDITOS']=f"podrán redimirse hasta las 11:59 p. m. del {fecha(e['fechaFinRedencion'])}"
    if 'redencion' in e:
        r=e['redencion']
        if r=='tienda': v['TEXTO_LUGAR_REDENCION']='Los Créditos podrán redimirse únicamente en la Tienda Participante donde se originó el Beneficio, dentro del Territorio.'
        elif r=='general': v['TEXTO_LUGAR_REDENCION']='Los Créditos podrán redimirse en cualquier sección de la Plataforma Rappi habilitada para el uso de Créditos, dentro del Territorio.'
        else:
            ss=[f"“{s}”" for s in e['secciones']]
            v['TEXTO_LUGAR_REDENCION']=f"Los Créditos podrán redimirse en cualquier tienda de {'la sección' if len(ss)==1 else 'las secciones'} {lista_y(ss)} de la Plataforma Rappi, dentro del Territorio."
    # Carrera
    if e.get('tipo')=='carrera_compras':
        pr=e['productos']
        v['TEXTO_PRODUCTOS']={'todos':'Participan en el concurso todos los productos del catálogo de la Tienda Participante en la Plataforma Rappi (en adelante, los “Productos Participantes”).',
            'marca':f"Participan en el concurso únicamente los productos de la marca {e.get('makerMarca','')} disponibles en la Tienda Participante a través de la Plataforma Rappi (en adelante, los “Productos Participantes”).",
            'especificos':f"Participan en el concurso únicamente los siguientes productos de la Tienda Participante (en adelante, los “Productos Participantes”): {e.get('productosLista','')}."}[pr]
        v['CRITERIO_GANADOR']={'mayor_valor':'el mayor valor total en compras de Productos Participantes','mas_pedidos':'el mayor número de pedidos válidos con Productos Participantes'}[e['criterioGanador']]
        n=e['numeroGanadores']
        v['FRASE_GANADORES']='Resultará ganador el participante que ocupe la primera posición del ranking.' if n==1 else f"Resultarán ganadores los {letras(n,True)} ({n}) participantes que ocupen las primeras posiciones del ranking."
        v['TEXTO_DESEMPATE']={'primero':'En caso de empate, ganará el participante que haya alcanzado primero el resultado empatado, según la fecha y hora de su último pedido válido.',
            'mas_pedidos':'En caso de empate, ganará el participante con el mayor número de pedidos válidos durante la vigencia.',
            'mayor_valor':'En caso de empate, ganará el participante con el mayor valor total en compras durante la vigencia.'}[e['desempate']]
        quien='Cada ganador' if n>1 else 'El ganador'
        if e['tipoPremio']=='creditos':
            v['LISTA_PREMIOS']=f"{quien} recibirá {cantidad_creditos(e['creditosPremio'],pais)}, que serán acreditados en su Billetera de Créditos."
            v['TEXTO_NATURALEZA_PREMIO']=f"El premio consiste en Créditos acreditados en la Billetera de Créditos de la Plataforma Rappi, los cuales son intangibles, no constituyen dinero en efectivo, no son transferibles a terceros y se rigen por los Términos y Condiciones de Funcionamiento de los Créditos de la Plataforma Rappi, disponibles en: {pais['url_tc_creditos']}."
        else:
            v['LISTA_PREMIOS']=f"{quien} recibirá el siguiente premio: {e['descripcionPremio']}."
            v['TEXTO_NATURALEZA_PREMIO']='El premio consiste en un bien de carácter físico, cuya existencia, calidad, garantía y entrega son responsabilidad exclusiva del Organizador. Rappi no fabrica, comercializa ni garantiza dicho bien.'
        if e['entregaPor']=='organizador':
            v['TEXTO_ENTREGA']='La entrega del premio estará a cargo exclusivamente del Organizador, quien coordinará directamente con el ganador las condiciones de tiempo, modo y lugar de entrega, siendo el único responsable de la misma.'
            v['TEXTO_DATOS_ENTREGA']='Para la entrega del premio, Rappi podrá compartir con el Organizador únicamente los datos de contacto del ganador que sean estrictamente necesarios para ese fin, previa autorización del ganador.'
        else:
            v['TEXTO_ENTREGA']='La entrega del premio será gestionada por Rappi en su calidad de operador logístico y por cuenta del Organizador, quien conserva la calidad de responsable del premio; Rappi coordinará con el ganador las condiciones de tiempo, modo y lugar de entrega.'
            v['TEXTO_DATOS_ENTREGA']=''
        v['MEDIO_NOTIFICACION']={'correo':'el correo electrónico registrado en la cuenta del ganador','llamada':'una llamada telefónica al número registrado en la cuenta del ganador','plataforma':'una notificación dentro de la Plataforma Rappi'}[e['medioNotificacion']]
        v['FECHA_NOTIFICACION']=fecha(e['fechaNotificacion'])
        pc=e['plazoConfirmacion']; v['PLAZO_CONFIRMACION']=f"{letras(pc,True)} ({pc}) {'día hábil' if pc==1 else 'días hábiles'}"
        v['TEXTO_UMBRAL']=(f"Únicamente contabilizarán para el concurso los pedidos cuyo valor sea igual o superior a {monto(cm)}." if cm else 'No se exige un valor mínimo de compra por pedido para participar en la Campaña.')
    # País
    for k,src in {'ENTIDAD_LEGAL':'entidad_legal','PAIS_LEGAL':'pais_legal','LEY_APLICABLE':'ley_aplicable','JURISDICCION':'jurisdiccion','ENTIDAD_VIGILANCIA':'entidad_vigilancia',
                  'AUTORIDAD_DATOS':'autoridad_datos','URL_TC_PLATAFORMA':'url_tc_plataforma','URL_PRIVACIDAD':'url_privacidad','URL_TC_CREDITOS':'url_tc_creditos',
                  'POLITICA_PRIVACIDAD':'politica_privacidad','TEXTO_DERECHOS_DATOS':'texto_derechos_datos','EDAD_MINIMA':'edad_minima','TEXTO_PERSONA':'texto_persona'}.items():
        v[k]=pais[src]
    return v
def tienda_vals(t, pais):
    return {'TIENDA_MARCA':t['marca'],'TIENDA_RAZON_SOCIAL':t['razonSocial'],'TIENDA_ID':fmt_id(pais,t['id']),
            'TIENDA_CIUDADES':'cobertura nacional' if t.get('nacional') else lista_y(t['ciudades'].split(',')),
            'TIENDA_PRESUPUESTO':cantidad_creditos(t['presupuesto'],pais)}
def render(modelo, e, pais):
    txt=open(f"{BASE}/modelos/{modelo}.md",encoding='utf-8').read()
    txt=re.sub(r'^\[\[INCLUIR:(\w+)\]\]$', lambda m: open(f"{BASE}/modelos/bloques/{m.group(1)}.md",encoding='utf-8').read().rstrip('\n'), txt, flags=re.M)
    txt='\n'.join(l for l in txt.split('\n') if not l.startswith('%%'))
    v=derivados(e,pais)
    def rep(m):
        cuerpo=m.group(1); out=[]
        for t in e.get('tiendas',[]):
            tv=tienda_vals(t,pais); out.append(re.sub(r'\{\{(TIENDA_\w+)\}\}', lambda x: tv[x.group(1)], cuerpo))
        return '\n'.join(out)
    txt=re.sub(r'^\[\[#TIENDAS\]\]\n(.*?)\n\[\[/TIENDAS\]\]$', rep, txt, flags=re.M|re.S)
    txt=re.sub(r'\[\[\?(\w+)\]\](.*?)\[\[/\?\]\]', lambda m: m.group(2) if v.get(m.group(1)) else '', txt, flags=re.S)
    faltan=set()
    def ph(m):
        k=m.group(1); val=v.get(k,'')
        if not val: faltan.add(k)
        return val
    txt=re.sub(r'\{\{(\w+)\}\}', ph, txt)
    lines=[l for l in txt.split('\n') if l.strip()]
    n=0; out=[]
    for l in lines:
        if l.startswith('§ '):
            n+=1; cuerpo=l[2:]
            if '. ' in cuerpo: titulo,_,resto=cuerpo.partition('. ')
            else: titulo,resto=cuerpo.rstrip('.'),''
            l=f"**{n}. {titulo}.** {resto}".rstrip()
        out.append(l)
    return '\n'.join(out), faltan
def banderas(t):
    plano=t.replace('**','')
    pats={'" ,"':' ,','" ."':r' \.','".." (no "...")':r'(?<!\.)\.\.(?!\.)','"()"':r'\(\s*\)','doble espacio':'  ','", ."':r', \.','{{ }}':r'\{\{|\}\}','[[ ]]':r'\[\[|\]\]'}
    return [k for k,p in pats.items() if re.search(p,plano)]
