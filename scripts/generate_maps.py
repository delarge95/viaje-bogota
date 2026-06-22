#!/usr/bin/env python3
"""Generate visual maps for the Bogotá travel guide PDF.
Maps show routes from Calle 94 base to key destinations, grouped by zone.
"""
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyArrowPatch, Circle, Rectangle, FancyBboxPatch
from matplotlib.lines import Line2D
import os

# Use default matplotlib fonts (works for Spanish text without CJK needs)
plt.rcParams['font.sans-serif'] = ['DejaVu Sans', 'Liberation Sans', 'sans-serif']
plt.rcParams['axes.unicode_minus'] = False

OUTPUT_DIR = "/home/z/my-project/scripts/maps"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Color palette matching the PDF
COLORS = {
    'bg': '#FAF6F0',
    'text': '#1F2937',
    'accent': '#C2410C',
    'secondary': '#166534',
    'warning': '#B45309',
    'danger': '#991B1B',
    'muted': '#6B7280',
    'soft': '#FED7AA',
    'soft_green': '#BBF7D0',
    'soft_yellow': '#FEF3C7',
    'soft_red': '#FEE2E2',
}

# Bogotá key locations (approximate coordinates in km from city center,
# using a simplified grid where Calle 94 is north, La Candelaria is south-east)
# Format: (name, x_km_from_center, y_km_from_center, color, type)
LOCATIONS = {
    'Calle 94\n(Alojamiento)': (0, 8.5, COLORS['accent'], 'base'),
    'Aeropuerto\nEl Dorado': (-7.5, 5, COLORS['muted'], 'transport'),
    'Universidad\nNacional': (-2, 2, COLORS['secondary'], 'culture'),
    'Parque\nSimón Bolívar': (-3, 3, COLORS['secondary'], 'park'),
    'Jardín\nBotánico': (-3.5, 3.5, COLORS['secondary'], 'park'),
    'Paloquemao': (-1.5, 0.5, COLORS['warning'], 'market'),
    'Cementerio\nCentral': (-0.5, 0, COLORS['muted'], 'culture'),
    'La Candelaria\n(Museo Oro,\nPlanetario)': (1, -1.5, COLORS['accent'], 'culture'),
    'Monserrate': (2, -2, COLORS['secondary'], 'park'),
    'Cinemateca': (0.5, -1, COLORS['accent'], 'culture'),
    'Vitto\n(Zona G)': (0.5, 5.5, COLORS['accent'], 'food'),
    'Chigüiro\nParrilla Bar': (-4, 3.5, COLORS['accent'], 'food'),
    'Edelweiss\n(Cajicá)': (-15, 14, COLORS['warning'], 'food'),
    'Estación\nUsaquén (Tren)': (4, 10, COLORS['muted'], 'transport'),
    'CC Gran\nEstación (Tren)': (-3, 0, COLORS['muted'], 'transport'),
    'Zona T /\nAndino': (1, 7, COLORS['accent'], 'shopping'),
    'Parque\nde la 93': (0.5, 8, COLORS['secondary'], 'park'),
}

def draw_map(ax, locations_to_show, routes=None, title="", subtitle="", 
             show_legend=True, focus_box=None):
    """Draw a map with locations and optional routes."""
    ax.set_facecolor(COLORS['bg'])
    
    # Draw grid lines (Bogotá street grid feel)
    for i in range(-20, 25, 2):
        ax.axvline(i, color='#E5E7EB', linewidth=0.3, alpha=0.5, zorder=0)
        ax.axhline(i, color='#E5E7EB', linewidth=0.3, alpha=0.5, zorder=0)
    
    # Draw routes first (so they go under markers)
    if routes:
        for route in routes:
            start_name, end_name, color, style = route
            if start_name in locations_to_show and end_name in locations_to_show:
                sx, sy = locations_to_show[start_name][0], locations_to_show[start_name][1]
                ex, ey = locations_to_show[end_name][0], locations_to_show[end_name][1]
                ax.annotate('', xy=(ex, ey), xytext=(sx, sy),
                           arrowprops=dict(arrowstyle='->', color=color,
                                          lw=2, ls=style,
                                          connectionstyle='arc3,rad=0.1'),
                           zorder=2)
    
    # Draw markers
    for name, (x, y, color, type_) in locations_to_show.items():
        if type_ == 'base':
            # Star for accommodation
            ax.plot(x, y, marker='*', markersize=24, color=color, 
                   markeredgecolor='white', markeredgewidth=1.5, zorder=5)
        elif type_ == 'transport':
            # Square for transport
            ax.plot(x, y, marker='s', markersize=14, color=color,
                   markeredgecolor='white', markeredgewidth=1.2, zorder=5)
        elif type_ == 'park':
            # Triangle for parks/nature
            ax.plot(x, y, marker='^', markersize=14, color=color,
                   markeredgecolor='white', markeredgewidth=1.2, zorder=5)
        elif type_ == 'food':
            # Diamond for food
            ax.plot(x, y, marker='D', markersize=12, color=color,
                   markeredgecolor='white', markeredgewidth=1.2, zorder=5)
        elif type_ == 'market':
            # Pentagon for market
            ax.plot(x, y, marker='p', markersize=14, color=color,
                   markeredgecolor='white', markeredgewidth=1.2, zorder=5)
        elif type_ == 'shopping':
            # Circle for shopping
            ax.plot(x, y, marker='o', markersize=12, color=color,
                   markeredgecolor='white', markeredgewidth=1.2, zorder=5)
        else:
            # Circle for culture
            ax.plot(x, y, marker='o', markersize=12, color=color,
                   markeredgecolor='white', markeredgewidth=1.2, zorder=5)
        
        # Label
        ax.annotate(name, (x, y), xytext=(0, -20), textcoords='offset points',
                   fontsize=7, ha='center', color=COLORS['text'], weight='bold',
                   bbox=dict(boxstyle='round,pad=0.2', facecolor='white', 
                            edgecolor=color, linewidth=0.5, alpha=0.9))
    
    # Title and subtitle
    ax.set_title(title, fontsize=14, weight='bold', color=COLORS['text'], pad=15)
    if subtitle:
        ax.text(0.5, 1.02, subtitle, transform=ax.transAxes, ha='center',
               fontsize=9, color=COLORS['muted'], style='italic')
    
    # Legend
    if show_legend:
        legend_elements = [
            Line2D([0], [0], marker='*', color='w', markerfacecolor=COLORS['accent'],
                  markersize=14, label='Alojamiento', markeredgecolor='white'),
            Line2D([0], [0], marker='o', color='w', markerfacecolor=COLORS['accent'],
                  markersize=10, label='Cultura', markeredgecolor='white'),
            Line2D([0], [0], marker='^', color='w', markerfacecolor=COLORS['secondary'],
                  markersize=10, label='Naturaleza', markeredgecolor='white'),
            Line2D([0], [0], marker='D', color='w', markerfacecolor=COLORS['accent'],
                  markersize=10, label='Restaurantes', markeredgecolor='white'),
            Line2D([0], [0], marker='p', color='w', markerfacecolor=COLORS['warning'],
                  markersize=10, label='Mercado', markeredgecolor='white'),
            Line2D([0], [0], marker='s', color='w', markerfacecolor=COLORS['muted'],
                  markersize=10, label='Transporte', markeredgecolor='white'),
        ]
        ax.legend(handles=legend_elements, loc='lower right', fontsize=7,
                 framealpha=0.95, edgecolor=COLORS['muted'])
    
    ax.set_aspect('equal')
    ax.tick_params(labelsize=7, colors=COLORS['muted'])
    
    if focus_box:
        x1, y1, x2, y2 = focus_box
        rect = Rectangle((x1, y1), x2-x1, y2-y1, linewidth=2,
                        edgecolor=COLORS['accent'], facecolor='none',
                        linestyle='--', alpha=0.5, zorder=1)
        ax.add_patch(rect)


# ===== MAP 1: GENERAL OVERVIEW OF BOGOTÁ =====
fig, ax = plt.subplots(figsize=(12, 9), constrained_layout=True)
draw_map(ax, LOCATIONS,
         title='Mapa General · Bogotá',
         subtitle='Principales sitios del itinerario 15-22 julio 2026',
         show_legend=True)
ax.set_xlim(-20, 8)
ax.set_ylim(-4, 16)
ax.set_xlabel('Kilómetros (aprox, eje oriente-occidente)', fontsize=8, color=COLORS['muted'])
ax.set_ylabel('Kilómetros (aprox, eje norte-sur)', fontsize=8, color=COLORS['muted'])
ax.grid(True, alpha=0.3, linewidth=0.3)
plt.savefig(f'{OUTPUT_DIR}/mapa_general_bogota.png', dpi=200, 
            facecolor=COLORS['bg'], edgecolor='none')
plt.close()
print("✓ mapa_general_bogota.png")


# ===== MAP 2: DÍA 1 - LLEGADA + UNAL =====
fig, ax = plt.subplots(figsize=(10, 7), constrained_layout=True)
day1_locs = {k: LOCATIONS[k] for k in [
    'Calle 94\n(Alojamiento)', 'Aeropuerto\nEl Dorado',
    'Universidad\nNacional', 'Parque\nSimón Bolívar'
]}
day1_routes = [
    ('Aeropuerto\nEl Dorado', 'Calle 94\n(Alojamiento)', COLORS['muted'], '-'),
    ('Calle 94\n(Alojamiento)', 'Universidad\nNacional', COLORS['accent'], '--'),
]
draw_map(ax, day1_locs, day1_routes,
         title='Día 1 · Miércoles 15 · Llegada + UNAL',
         subtitle='Aeropuerto → Calle 94 → Universidad Nacional (TM troncal B → E)',
         show_legend=False)
ax.set_xlim(-9, 3)
ax.set_ylim(0, 10)
plt.savefig(f'{OUTPUT_DIR}/mapa_dia1_unal.png', dpi=200,
            facecolor=COLORS['bg'], edgecolor='none')
plt.close()
print("✓ mapa_dia1_unal.png")


# ===== MAP 3: DÍA 2 - LA CANDALIA + MUSEO ORO + PLANETARIO =====
fig, ax = plt.subplots(figsize=(10, 7), constrained_layout=True)
day2_locs = {k: LOCATIONS[k] for k in [
    'Calle 94\n(Alojamiento)', 'La Candelaria\n(Museo Oro,\nPlanetario)',
    'Monserrate', 'Cinemateca'
]}
day2_routes = [
    ('Calle 94\n(Alojamiento)', 'La Candelaria\n(Museo Oro,\nPlanetario)', COLORS['accent'], '--'),
    ('La Candelaria\n(Museo Oro,\nPlanetario)', 'Monserrate', COLORS['secondary'], '-'),
    ('La Candelaria\n(Museo Oro,\nPlanetario)', 'Cinemateca', COLORS['accent'], '-'),
]
draw_map(ax, day2_locs, day2_routes,
         title='Día 2 · Jueves 16 · La Candelaria Cultural',
         subtitle='Monserrate + Museo del Oro + Planetario + Cinemateca',
         show_legend=False)
ax.set_xlim(-2, 5)
ax.set_ylim(-4, 10)
plt.savefig(f'{OUTPUT_DIR}/mapa_dia2_candelaria.png', dpi=200,
            facecolor=COLORS['bg'], edgecolor='none')
plt.close()
print("✓ mapa_dia2_candelaria.png")


# ===== MAP 4: DÍA 3 - JARDÍN BOTÁNICO + CHIGÜIRO =====
fig, ax = plt.subplots(figsize=(10, 7), constrained_layout=True)
day3_locs = {k: LOCATIONS[k] for k in [
    'Calle 94\n(Alojamiento)', 'Jardín\nBotánico',
    'Parque\nSimón Bolívar', 'Chigüiro\nParrilla Bar'
]}
day3_routes = [
    ('Calle 94\n(Alojamiento)', 'Jardín\nBotánico', COLORS['secondary'], '--'),
    ('Jardín\nBotánico', 'Parque\nSimón Bolívar', COLORS['secondary'], '-'),
    ('Parque\nSimón Bolívar', 'Chigüiro\nParrilla Bar', COLORS['accent'], '-'),
]
draw_map(ax, day3_locs, day3_routes,
         title='Día 2/4 · Jardín Botánico + Parque Simón Bolívar + Chigüiro',
         subtitle='Plan naturaleza + comida llanera (zona occidental)',
         show_legend=False)
ax.set_xlim(-6, 3)
ax.set_ylim(2, 10)
plt.savefig(f'{OUTPUT_DIR}/mapa_jbb_chiguiro.png', dpi=200,
            facecolor=COLORS['bg'], edgecolor='none')
plt.close()
print("✓ mapa_jbb_chiguiro.png")


# ===== MAP 5: DÍA 5 - PALOQUEMAO + PLANETARIO =====
fig, ax = plt.subplots(figsize=(10, 7), constrained_layout=True)
day5_locs = {k: LOCATIONS[k] for k in [
    'Calle 94\n(Alojamiento)', 'Paloquemao',
    'Cementerio\nCentral', 'La Candelaria\n(Museo Oro,\nPlanetario)'
]}
day5_routes = [
    ('Calle 94\n(Alojamiento)', 'Paloquemao', COLORS['warning'], '-'),
    ('Paloquemao', 'La Candelaria\n(Museo Oro,\nPlanetario)', COLORS['accent'], '--'),
    ('Paloquemao', 'Cementerio\nCentral', COLORS['muted'], '-'),
]
draw_map(ax, day5_locs, day5_routes,
         title='Día 5 · Domingo 19 · Paloquemao + Centro Cultural',
         subtitle='Mañana: mercado con Huevito · Tarde: Museo Oro (gratis) + Planetario',
         show_legend=False)
ax.set_xlim(-3, 4)
ax.set_ylim(-3, 10)
plt.savefig(f'{OUTPUT_DIR}/mapa_dia5_paloquemao.png', dpi=200,
            facecolor=COLORS['bg'], edgecolor='none')
plt.close()
print("✓ mapa_dia5_paloquemao.png")


# ===== MAP 6: TREN DE LA SABANA =====
fig, ax = plt.subplots(figsize=(11, 6), constrained_layout=True)
tren_locs = {
    'Calle 94\n(Alojamiento)': (0, 8.5, COLORS['accent'], 'base'),
    'CC Gran\nEstación (Tren)': (-3, 0, COLORS['muted'], 'transport'),
    'Estación\nUsaquén (Tren)': (4, 10, COLORS['muted'], 'transport'),
    'Edelweiss\n(Cajicá)': (-15, 14, COLORS['warning'], 'food'),
    'Zipaquirá\n(Catedral Sal)': (-18, 17, COLORS['accent'], 'culture'),
}
tren_routes = [
    ('Calle 94\n(Alojamiento)', 'CC Gran\nEstación (Tren)', COLORS['muted'], '--'),
    ('Calle 94\n(Alojamiento)', 'Estación\nUsaquén (Tren)', COLORS['secondary'], '--'),
    ('CC Gran\nEstación (Tren)', 'Estación\nUsaquén (Tren)', COLORS['muted'], '-'),
    ('Estación\nUsaquén (Tren)', 'Edelweiss\n(Cajicá)', COLORS['warning'], '-'),
    ('Edelweiss\n(Cajicá)', 'Zipaquirá\n(Catedral Sal)', COLORS['accent'], '-'),
]
draw_map(ax, tren_locs, tren_routes,
         title='Tren de la Sabana + Salida a Cajicá/Zipaquirá',
         subtitle='Tren sale 8:45am CC Gran Estación · 9:15am Estación Usaquén · Llega 10:45am Zipaquirá',
         show_legend=False)
ax.set_xlim(-22, 8)
ax.set_ylim(-2, 20)
# Add annotations for the train route
ax.annotate('TREN\n8:45 → 10:45', xy=(-7, 5), fontsize=8, ha='center',
           color=COLORS['accent'], weight='bold',
           bbox=dict(boxstyle='round,pad=0.3', facecolor=COLORS['soft'],
                    edgecolor=COLORS['accent']))
plt.savefig(f'{OUTPUT_DIR}/mapa_tren_sabana.png', dpi=200,
            facecolor=COLORS['bg'], edgecolor='none')
plt.close()
print("✓ mapa_tren_sabana.png")


# ===== MAP 7: ZONA NORTE - CALLE 94 + ALOJAMIENTO =====
fig, ax = plt.subplots(figsize=(10, 7), constrained_layout=True)
norte_locs = {k: LOCATIONS[k] for k in [
    'Calle 94\n(Alojamiento)', 'Parque\nde la 93',
    'Vitto\n(Zona G)', 'Zona T /\nAndino', 'Estación\nUsaquén (Tren)'
]}
norte_routes = [
    ('Calle 94\n(Alojamiento)', 'Parque\nde la 93', COLORS['secondary'], '-'),
    ('Calle 94\n(Alojamiento)', 'Vitto\n(Zona G)', COLORS['accent'], '--'),
    ('Calle 94\n(Alojamiento)', 'Zona T /\nAndino', COLORS['accent'], '--'),
    ('Calle 94\n(Alojamiento)', 'Estación\nUsaquén (Tren)', COLORS['muted'], '--'),
]
draw_map(ax, norte_locs, norte_routes,
         title='Zona Norte · Base Calle 94 / Chicó',
         subtitle='Caminatas y trayectos cortos desde el alojamiento',
         show_legend=False)
ax.set_xlim(-1, 7)
ax.set_ylim(4, 12)
plt.savefig(f'{OUTPUT_DIR}/mapa_zona_norte.png', dpi=200,
            facecolor=COLORS['bg'], edgecolor='none')
plt.close()
print("✓ mapa_zona_norte.png")


# ===== MAP 8: PLAN ECONÓMICO OPTIMIZADO =====
fig, ax = plt.subplots(figsize=(12, 8), constrained_layout=True)
economico_locs = {k: LOCATIONS[k] for k in [
    'Calle 94\n(Alojamiento)', 'Universidad\nNacional',
    'La Candelaria\n(Museo Oro,\nPlanetario)', 'Cementerio\nCentral',
    'Jardín\nBotánico', 'Paloquemao', 'Chigüiro\nParrilla Bar',
    'Vitto\n(Zona G)'
]}
economico_routes = [
    ('Calle 94\n(Alojamiento)', 'Universidad\nNacional', COLORS['accent'], '--'),
    ('Calle 94\n(Alojamiento)', 'La Candelaria\n(Museo Oro,\nPlanetario)', COLORS['accent'], '--'),
    ('Calle 94\n(Alojamiento)', 'Jardín\nBotánico', COLORS['secondary'], '--'),
    ('Calle 94\n(Alojamiento)', 'Paloquemao', COLORS['warning'], '-'),
    ('Calle 94\n(Alojamiento)', 'Vitto\n(Zona G)', COLORS['accent'], '--'),
]
draw_map(ax, economico_locs, economico_routes,
         title='Plan Económico · Rutas Optimizadas (< $2M COP)',
         subtitle='8 planes principales · prioridad TransMilenio · minimizar Uber',
         show_legend=True)
ax.set_xlim(-6, 4)
ax.set_ylim(-3, 10)
plt.savefig(f'{OUTPUT_DIR}/mapa_plan_economico.png', dpi=200,
            facecolor=COLORS['bg'], edgecolor='none')
plt.close()
print("✓ mapa_plan_economico.png")


# ===== MAP 9: TRANSMILENIO - LÍNEAS PRINCIPALES =====
fig, ax = plt.subplots(figsize=(11, 9), constrained_layout=True)
ax.set_facecolor(COLORS['bg'])

# Draw simplified TransMilenio trunk lines
troncales = [
    # (name, points, color)
    ('B - Autopista Norte', [(0, 8.5), (0, 5), (0, 2), (0, 0)], '#C2410C'),  # Calle 94 to center
    ('A - Caracas', [(0, 0), (1, -1), (1, -2), (1, -3)], '#166534'),  # North to south
    ('E - NQS Central', [(0, 0), (-1, 1), (-2, 2), (-2, 3)], '#1F2937'),  # NQS
    ('K - Av El Dorado', [(0, 0), (-2, 0), (-3, 0), (-7, 0)], '#B45309'),  # To airport
    ('J - Eje Ambiental', [(0, 0), (0.5, -0.5), (1, -1), (1, -1.5)], '#991B1B'),  # To Candelaria
]

for name, points, color in troncales:
    xs = [p[0] for p in points]
    ys = [p[1] for p in points]
    ax.plot(xs, ys, color=color, linewidth=3, marker='o', markersize=6,
           markeredgecolor='white', markeredgewidth=1, label=name, alpha=0.8)

# Key stations
estaciones = {
    'Calle 100\n(Marketmedios)': (0, 7, '#C2410C'),
    'Calle 94\n(Alojamiento)': (0, 8.5, '#C2410C'),
    'Avenida Chile': (-1.5, 1.5, '#1F2937'),
    'Salitre\nEl Greco': (-3, 0, '#B45309'),
    'Universidad\nNacional': (-2, 2, '#1F2937'),
    'Las Aguas': (1, -1, '#166534'),
    'Museo del Oro': (1, -1.5, '#166534'),
    'CAD': (-1.5, 0, '#B45309'),
    'Paloquemao': (-1.5, 0.3, '#1F2937'),
    'Aeropuerto': (-7, 0, '#B45309'),
}
for name, (x, y, color) in estaciones.items():
    ax.plot(x, y, marker='s', markersize=10, color=color,
           markeredgecolor='white', markeredgewidth=1.2, zorder=5)
    ax.annotate(name, (x, y), xytext=(8, 0), textcoords='offset points',
               fontsize=7, color=COLORS['text'], weight='bold',
               bbox=dict(boxstyle='round,pad=0.2', facecolor='white',
                        edgecolor=color, linewidth=0.5, alpha=0.9))

ax.set_title('TransMilenio · Troncales Principales desde Calle 94',
            fontsize=14, weight='bold', color=COLORS['text'], pad=15)
ax.text(0.5, 1.02, 'Líneas que conectan el alojamiento con los principales destinos',
       transform=ax.transAxes, ha='center', fontsize=9,
       color=COLORS['muted'], style='italic')

ax.legend(loc='lower right', fontsize=8, framealpha=0.95)
ax.set_aspect('equal')
ax.set_xlim(-9, 4)
ax.set_ylim(-4, 10)
ax.grid(True, alpha=0.3, linewidth=0.3)
ax.tick_params(labelsize=7, colors=COLORS['muted'])
plt.savefig(f'{OUTPUT_DIR}/mapa_transmilenio.png', dpi=200,
           facecolor=COLORS['bg'], edgecolor='none')
plt.close()
print("✓ mapa_transmilenio.png")


print(f"\nTotal: 9 mapas generados en {OUTPUT_DIR}")
