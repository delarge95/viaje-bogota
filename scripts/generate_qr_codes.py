#!/usr/bin/env python3
"""Generate QR codes for all official websites in the Bogotá travel guide."""
import qrcode
import os

OUTPUT_DIR = "/home/z/my-project/scripts/qr_codes"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Sites: (filename, url, label)
SITES = [
    # Sitios culturales
    ("planetario", "https://www.planetariodebogota.gov.co/", "Planetario de Bogotá"),
    ("planetario_programacion", "https://planetariodebogota.gov.co/programate", "Planetario - Programación"),
    ("tuboleta_planetario", "https://www.tuboleta.com/es/venue/planetario-de-bogota", "Tuboleta - Planetario"),
    ("cinemateca", "https://cinematecadebogota.gov.co/", "Cinemateca de Bogotá"),
    ("jardin_botanico", "https://www.jbb.gov.co/", "Jardín Botánico"),
    ("jardin_botanico_mapa", "https://jbb.gov.co/mapa", "JBB - Mapa"),
    ("monserrat", "https://monserrate.co/es", "Monserrate"),
    ("monserrate_tarifas", "https://monserrate.co/es/horarios-y-tarifas", "Monserrate - Tarifas"),
    ("museo_oro", "https://www.banrepcultural.org/bogota/museo-del-oro", "Museo del Oro"),
    ("museo_oro_visita", "https://www.banrepcultural.org/bogota/museo-del-oro/programa-tu-visita", "Museo Oro - Programa visita"),
    ("parque_simon_bolivar", "https://www.idrd.gov.co/parques-y-escenarios/parque-simon-bolivar", "Parque Simón Bolívar"),
    ("cementerio_idpc", "https://idpc.gov.co/", "IDPC - Cementerio"),
    ("etnias_andantes", "https://www.etniasandantes.com/product-page/tour-cementerio-central", "Etnias Andantes"),
    ("plan_bogota", "https://planbogota.bogotadc.travel/", "Plan Bogotá"),
    # Universidad Nacional
    ("unal_bogota", "https://bogota.unal.edu.co", "UNAL Bogotá"),
    ("unal_patrimonio", "https://patrimoniocultural.bogota.unal.edu.co/calendario", "UNAL - Calendario cultural"),
    ("unal_movilidad", "https://movilidad.unal.edu.co/preguntas-frecuentes.html", "UNAL - Movilidad"),
    ("unal_bienestar", "https://bienestar.bogota.unal.edu.co", "UNAL - Bienestar"),
    # Restaurantes
    ("vitto_web", "https://vittoresto.com", "Vitto - Web"),
    ("vitto_menu", "https://vittoresto.com/assets/carta_pdf/carta_menu_vitto.pdf", "Vitto - Menú PDF"),
    ("vitto_instagram", "https://www.instagram.com/vitto_bogota/", "Vitto - Instagram"),
    ("puerta_falsa", "https://www.instagram.com/lapuertafalsa1816/", "La Puerta Falsa"),
    ("puerta_catedral", "https://www.instagram.com/lapuertadelacatedral/", "La Puerta de la Catedral"),
    ("edelweiss", "https://www.instagram.com/edelweisscajica/", "Edelweiss Cajicá"),
    ("chiguiro_parrilla", "https://www.instagram.com/chiguiroparrillabar/", "Chigüiro Parrilla Bar"),
    ("chiguire_53", "https://www.instagram.com/chiguire53/", "Asadero Chigüire 53"),
    ("andres_carne", "https://www.andrescarnederes.com", "Andrés Carne de Res"),
    ("paloquemao", "https://plazadepaloquemao.com", "Paloquemao"),
    ("paloquemao_instagram", "https://www.instagram.com/plazadepaloquemao/", "Paloquemao Instagram"),
    # Transporte
    ("transmilenio", "https://www.transmilenio.gov.co", "TransMilenio"),
    ("tullave", "https://www.tullaveplus.gov.co", "TuLlave"),
    ("buscador_rutas", "https://buscador-rutas.transmilenio.gov.co", "Buscador rutas TM"),
    ("turistren", "https://turistren.com.co/planifica-tu-viaje", "Turistren"),
    ("tuboleta_tren", "https://www.tuboleta.com/es/eventos/viaje-en-tren-zipaquira-0", "Tuboleta - Tren"),
    ("cabify", "https://cabify.com/co/tarifas/bogota", "Cabify Bogotá"),
    ("taxis_libres", "https://www.taxislibres.com.co", "Taxis Libres"),
    ("aeropuerto_eldorado", "https://eldorado.aero/servicios/taxis", "Aeropuerto El Dorado"),
    ("ciclovia", "https://www.idrd.gov.co/ciclovia/mapa-de-la-ciclovia", "Ciclovía - Mapa"),
    ("pico_placa", "https://www.movilidadbogota.gov.co/pico-y-placa", "Pico y Placa"),
    # Tourism
    ("visit_bogota", "https://visitbogota.co", "Visit Bogotá"),
    ("bogota_gov", "https://www.bogota.gov.co", "Bogotá.gov.co"),
]

def generate_qr(filename, url, label):
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=10,
        border=2,
    )
    qr.add_data(url)
    qr.make(fit=True)
    img = qr.make_image(fill_color="#1F2937", back_color="#FAF6F0")
    filepath = os.path.join(OUTPUT_DIR, f"{filename}.png")
    img.save(filepath)
    print(f"✓ {filename}.png ({label})")

print(f"Generando {len(SITES)} códigos QR en {OUTPUT_DIR}...")
for fname, url, label in SITES:
    generate_qr(fname, url, label)
print(f"\nTotal: {len(SITES)} QR codes generados.")
