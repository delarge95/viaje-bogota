#!/usr/bin/env python3
"""Generate QR codes for alternative restaurants."""
import qrcode
import os

OUTPUT_DIR = "/home/z/my-project/scripts"
os.makedirs(OUTPUT_DIR, exist_ok=True)

SITES = [
    # Alemanes alternativos
    ("harald_qr", "https://www.degusta.com.co/bogota/restaurante/harald_100526.html", "Harald Degusta"),
    ("harald_ig_qr", "https://www.instagram.com/haraldbogota/", "Harald IG"),
    ("harald_maps_qr", "https://www.google.com/maps/search/?api=1&query=Restaurante+Aleman+Harald+Calle+116+70C-68+Bogota", "Harald Maps"),
    ("bruder_web_qr", "https://www.bruder.com.co", "Bruder web"),
    ("bruder_ig_qr", "https://www.instagram.com/bruder_cerveza/", "Bruder IG"),
    # Taquerías
    ("la_taqueria_web_qr", "https://www.lataqueria.com.co", "La Taqueria web"),
    ("la_taqueria_maps_qr", "https://www.google.com/maps/search/?api=1&query=La+Taqueria+Calle+93+11A-11+Bogota", "La Taqueria Maps"),
    ("renata_web_qr", "https://renatatacos.com", "Renata web"),
    ("renata_menu_qr", "http://renatatacos.com/menus/menu_renata.pdf", "Renata menu"),
    ("renata_ig_qr", "https://www.instagram.com/renatatacos/", "Renata IG"),
    ("insurgentes_web_qr", "https://insurgentes.com.co", "Insurgentes web"),
    ("insurgentes_ig_qr", "https://www.instagram.com/insurgentestacobar/", "Insurgentes IG"),
    # Lechonerías
    ("eltolimense_qr", "https://www.eltolimense.com", "El Tolimense"),
    ("ricalechona_qr", "https://www.ricalechona.com", "Rica Lechona"),
    ("ricalechona_ig_qr", "https://www.instagram.com/ricalechonatolimense/", "Rica Lechona IG"),
    # Chigüiro
    ("rancho_llanero_ig_qr", "https://www.instagram.com/asadero.rancho.llanero/", "Rancho Llanero IG"),
    ("rancho_llanero_maps_qr", "https://www.google.com/maps/search/?api=1&query=Rancho+Llanero+Gran+Estacion+Calle+6+26-99+Bogota", "Rancho Llanero Maps"),
    ("llanerada_ig_qr", "https://www.instagram.com/llanerada_carbon/", "Llanerada IG"),
    ("llanerada_maps_qr", "https://www.google.com/maps/search/?api=1&query=Llanerada+Carbon+Calle+72+68C-05+Bogota", "Llanerada Maps"),
    # Comida típica
    ("andres_dc_web_qr", "https://www.andrescarnederes.com/andres-dc", "Andres DC web"),
    ("andres_dc_maps_qr", "https://www.google.com/maps/search/?api=1&query=Andres+DC+Calle+82+11-15+Bogota", "Andres DC Maps"),
    ("casavieja_web_qr", "https://www.casavieja.com.co", "Casa Vieja web"),
    ("casavieja_ig_qr", "https://www.instagram.com/casaviejacolombia/", "Casa Vieja IG"),
    ("casavieja_maps_qr", "https://www.google.com/maps/search/?api=1&query=Casa+Vieja+Cra+6A+117-35+Usaquen+Bogota", "Casa Vieja Maps"),
    ("comp_criolla_web_qr", "https://companiacriolla.com", "Comp Criolla web"),
    ("casa_santa_clara_web_qr", "https://www.restaurantesmonserrate.com", "Casa Sta Clara web"),
    ("casa_santa_clara_ig_qr", "https://www.instagram.com/restaurantesmonserrate/", "Casa Sta Clara IG"),
]

def gen_qr(fname, url, label):
    qr = qrcode.QRCode(version=1, error_correction=qrcode.constants.ERROR_CORRECT_M, box_size=8, border=2)
    qr.add_data(url)
    qr.make(fit=True)
    img = qr.make_image(fill_color="#1F2937", back_color="#FAF6F0")
    img.save(os.path.join(OUTPUT_DIR, f"{fname}.png"))

print(f"Generando {len(SITES)} QR codes alternativos...")
for fname, url, label in SITES:
    gen_qr(fname, url, label)
    print(f"✓ {fname}.png")
print(f"\nTotal: {len(SITES)} QR codes generados.")
