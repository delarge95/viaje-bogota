#!/usr/bin/env python3
"""Generate improved visual maps for the Bogotá travel guide PDF v3.
Maps now show:
- Real street grid of Bogotá (Carreras and Calles)
- Main avenues (NQS, Autopista Norte, Calle 26, Cra 7, Av Chile)
- Multiple routes with intermediate stops
- Zone labels (Chicó, Zona G, Teusaquillo, La Candelaria)
- Distance and time annotations
"""
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyArrowPatch, Circle, Rectangle, FancyBboxPatch, Polygon
from matplotlib.lines import Line2D
import numpy as np
import os

plt.rcParams['font.sans-serif'] = ['DejaVu Sans', 'Liberation Sans', 'sans-serif']
plt.rcParams['axes.unicode_minus'] = False

OUTPUT_DIR = "/home/z/my-project/scripts/maps_v3"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Color palette
C = {
    'bg': '#FAF6F0',
    'paper': '#FFFFFF',
    'text': '#1F2937',
    'text_soft': '#4B5563',
    'text_light': '#6B7280',
    'accent': '#C2410C',
    'accent_soft': '#FED7AA',
    'accent_bg': '#FFF7ED',
    'secondary': '#166534',
    'secondary_soft': '#BBF7D0',
    'warning': '#B45309',
    'warning_bg': '#FEF3C7',
    'danger': '#991B1B',
    'danger_bg': '#FEE2E2',
    'street': '#D1D5DB',
    'street_major': '#9CA3AF',
    'water': '#BFDBFE',
    'park': '#D1FAE5',
    'muted': '#6B7280',
}


def setup_bogota_grid(ax, x_range=(-12, 12), y_range=(-6, 18)):
    """Draw Bogotá's street grid (Carreras = vertical, Calles = horizontal)."""
    ax.set_facecolor(C['bg'])
    
    # Calles (horizontal lines, every 10 streets = 1 km approx)
    for y in range(y_range[0], y_range[1] + 1, 1):
        lw = 1.2 if y % 5 == 0 else 0.4
        color = C['street_major'] if y % 10 == 0 else C['street']
        ax.axhline(y, color=color, linewidth=lw, alpha=0.5, zorder=1)
        if y % 10 == 0:
            ax.text(x_range[1] - 0.3, y + 0.1, f'Cl {y*10 if y >= 0 else (y*10)}',
                   fontsize=6, color=C['muted'], ha='right', alpha=0.7, zorder=1)
    
    # Carreras (vertical lines)
    for x in range(x_range[0], x_range[1] + 1, 1):
        lw = 1.2 if x % 5 == 0 else 0.4
        color = C['street_major'] if x % 10 == 0 else C['street']
        ax.axvline(x, color=color, linewidth=lw, alpha=0.5, zorder=1)
        if x % 10 == 0 and x_range[0] <= x <= x_range[1]:
            ax.text(x + 0.1, y_range[1] - 0.3, f'Cra {x*10 if x >= 0 else (x*10)}',
                   fontsize=6, color=C['muted'], ha='left', alpha=0.7, zorder=1)
    
    # Main avenues (thicker highlighted lines)
    # Av. NQS (Carrera 30 area, runs N-S diagonally in west)
    ax.plot([-3, -3.5, -3.8, -4, -4.2], [10, 5, 0, -2, -4], 
           color=C['warning'], linewidth=3, alpha=0.6, zorder=2, solid_capstyle='round')
    ax.text(-4.5, 3, 'Av. NQS', fontsize=8, color=C['warning'], weight='bold',
           rotation=-75, alpha=0.9, zorder=3)
    
    # Autopista Norte (Cra 16 area, runs N-S in north)
    ax.plot([0.2, 0.1, 0, -0.1, -0.2], [11, 8, 5, 2, 0],
           color=C['accent'], linewidth=3, alpha=0.6, zorder=2, solid_capstyle='round')
    ax.text(0.5, 7, 'Autopista\nNorte', fontsize=7, color=C['accent'], weight='bold',
           alpha=0.9, zorder=3)
    
    # Calle 26 (Av El Dorado, runs E-W)
    ax.plot([-10, -5, 0, 5, 8], [0.5, 0.3, 0, -0.2, -0.5],
           color=C['warning'], linewidth=3, alpha=0.6, zorder=2, solid_capstyle='round')
    ax.text(-7, 1, 'Av. El Dorado (Cl 26)', fontsize=7, color=C['warning'], weight='bold',
           alpha=0.9, zorder=3)
    
    # Calle 80
    ax.plot([-5, 0, 5], [3, 3, 3],
           color=C['street_major'], linewidth=2, alpha=0.5, zorder=2)
    ax.text(2, 3.2, 'Cl 80', fontsize=7, color=C['muted'], alpha=0.8, zorder=3)
    
    # Calle 100 (Calle 94 area)
    ax.plot([-3, 0, 4, 7], [8.5, 8.5, 8.5, 8.5],
           color=C['accent'], linewidth=2.5, alpha=0.7, zorder=2)
    ax.text(2, 8.7, 'Cl 94-100', fontsize=7, color=C['accent'], weight='bold',
           alpha=0.9, zorder=3)
    
    # Calle 63 (JBB area)
    ax.plot([-4, -2, 0], [3.5, 3.5, 3.5],
           color=C['secondary'], linewidth=2, alpha=0.6, zorder=2)
    ax.text(-3.5, 3.7, 'Cl 63 (JBB)', fontsize=7, color=C['secondary'], weight='bold',
           alpha=0.8, zorder=3)
    
    # Carrera 7 (centro histórico, runs diagonally)
    ax.plot([1, 0.8, 0.5, 0, -0.5, -1, -1.5], [10, 7, 4, 0, -1, -2, -3],
           color=C['secondary'], linewidth=2.5, alpha=0.6, zorder=2)
    ax.text(-0.5, 4, 'Cra 7', fontsize=7, color=C['secondary'], weight='bold',
           rotation=-20, alpha=0.9, zorder=3)


def draw_route(ax, points, color, style='-', label=None, label_pos=0.5, time_min=None):
    """Draw a route through multiple points with optional label."""
    xs = [p[0] for p in points]
    ys = [p[1] for p in points]
    ax.plot(xs, ys, color=color, linewidth=2.5, linestyle=style, alpha=0.85,
           zorder=4, solid_capstyle='round', solid_joinstyle='round')
    
    # Add direction arrows at intermediate points
    for i in range(1, len(points)):
        if i < len(points) - 0:
            mid_x = (xs[i-1] + xs[i]) / 2
            mid_y = (ys[i-1] + ys[i]) / 2
            dx = xs[i] - xs[i-1]
            dy = ys[i] - ys[i-1]
            ax.annotate('', xy=(mid_x + dx*0.1, mid_y + dy*0.1),
                       xytext=(mid_x - dx*0.1, mid_y - dy*0.1),
                       arrowprops=dict(arrowstyle='->', color=color, lw=1.5),
                       zorder=5)
    
    if label:
        idx = int(len(points) * label_pos)
        if idx >= len(points):
            idx = len(points) // 2
        ax.text(points[idx][0], points[idx][1] + 0.4, label,
               fontsize=7, color=color, weight='bold', ha='center',
               bbox=dict(boxstyle='round,pad=0.2', facecolor='white',
                        edgecolor=color, linewidth=0.8, alpha=0.95), zorder=6)
    
    if time_min:
        idx = int(len(points) * label_pos)
        if idx >= len(points):
            idx = len(points) // 2
        ax.text(points[idx][0], points[idx][1] - 0.5, f'~{time_min} min',
               fontsize=6.5, color=color, ha='center', style='italic',
               bbox=dict(boxstyle='round,pad=0.15', facecolor='white',
                        edgecolor=color, linewidth=0.5, alpha=0.9), zorder=6)


def draw_marker(ax, x, y, name, color, type_='culture', label_offset=(0, -0.6)):
    """Draw a marker with label."""
    markers = {
        'base': ('*', 22),
        'transport': ('s', 12),
        'park': ('^', 12),
        'food': ('D', 11),
        'market': ('p', 13),
        'shopping': ('o', 11),
        'culture': ('o', 11),
    }
    m, s = markers.get(type_, ('o', 11))
    ax.plot(x, y, marker=m, markersize=s, color=color,
           markeredgecolor='white', markeredgewidth=1.5, zorder=7)
    ax.annotate(name, (x, y), xytext=label_offset, textcoords='offset points',
               fontsize=7, ha='center', color=C['text'], weight='bold',
               bbox=dict(boxstyle='round,pad=0.25', facecolor='white',
                        edgecolor=color, linewidth=0.8, alpha=0.95), zorder=8)


def draw_zone(ax, x, y, w, h, label, color):
    """Draw a translucent zone with label."""
    rect = FancyBboxPatch((x, y), w, h, boxstyle='round,pad=0.05',
                         facecolor=color, edgecolor=color, linewidth=1.5,
                         alpha=0.15, zorder=1)
    ax.add_patch(rect)
    ax.text(x + w/2, y + h - 0.2, label, fontsize=8, color=color, weight='bold',
           ha='center', alpha=0.8, zorder=2, style='italic')


def legend(ax, loc='lower right'):
    """Add legend with marker types."""
    legend_elements = [
        Line2D([0], [0], marker='*', color='w', markerfacecolor=C['accent'],
              markersize=15, label='Alojamiento', markeredgecolor='white'),
        Line2D([0], [0], marker='o', color='w', markerfacecolor=C['accent'],
              markersize=10, label='Cultura', markeredgecolor='white'),
        Line2D([0], [0], marker='^', color='w', markerfacecolor=C['secondary'],
              markersize=10, label='Naturaleza', markeredgecolor='white'),
        Line2D([0], [0], marker='D', color='w', markerfacecolor=C['accent'],
              markersize=10, label='Restaurantes', markeredgecolor='white'),
        Line2D([0], [0], marker='p', color='w', markerfacecolor=C['warning'],
              markersize=10, label='Mercado', markeredgecolor='white'),
        Line2D([0], [0], marker='s', color='w', markerfacecolor=C['muted'],
              markersize=10, label='Transporte', markeredgecolor='white'),
        Line2D([0], [0], color=C['accent'], linewidth=2.5, label='Ruta principal'),
        Line2D([0], [0], color=C['accent'], linewidth=2.5, linestyle='--', label='Ruta alternativa'),
    ]
    ax.legend(handles=legend_elements, loc=loc, fontsize=7,
             framealpha=0.95, edgecolor=C['muted'])


# ===== MAP 1: GENERAL OVERVIEW (mejorado con zonas) =====
fig, ax = plt.subplots(figsize=(13, 9), constrained_layout=True)
setup_bogota_grid(ax, x_range=(-12, 8), y_range=(-6, 16))

# Zones
draw_zone(ax, -1, 7, 3, 3, 'CHICÓ / ZONA T', C['accent'])
draw_zone(ax, -1, 4.5, 3, 2, 'ZONA G', C['accent'])
draw_zone(ax, -4.5, 2, 4, 4, 'TEUSAQUILLO', C['secondary'])
draw_zone(ax, -1, -2.5, 4, 2.5, 'LA CANDELARIA', C['accent'])
draw_zone(ax, -3, -1, 1.5, 2, 'PALOQUEMAO', C['warning'])

# Markers
draw_marker(ax, 0, 8.5, 'Calle 94\n(Alojamiento)', C['accent'], 'base', (0, -16))
draw_marker(ax, -7, 5, 'Aeropuerto\nEl Dorado', C['muted'], 'transport', (0, -14))
draw_marker(ax, -2, 3.5, 'Universidad\nNacional', C['secondary'], 'culture', (-20, 6))
draw_marker(ax, -3, 3.5, 'Jardín\nBotánico', C['secondary'], 'park', (15, -10))
draw_marker(ax, -3.5, 4, 'Parque\nSimón Bolívar', C['secondary'], 'park', (0, 12))
draw_marker(ax, -1.5, 0.5, 'Paloquemao', C['warning'], 'market', (0, 12))
draw_marker(ax, 0, -1, 'Cementerio\nCentral', C['muted'], 'culture', (15, 0))
draw_marker(ax, 1, -1.5, 'La Candelaria\n(Museo Oro,\nPlanetario)', C['accent'], 'culture', (0, -20))
draw_marker(ax, 2, -2.5, 'Monserrate', C['secondary'], 'park', (15, 0))
draw_marker(ax, 0.5, 5.5, 'Vitto (Zona G)', C['accent'], 'food', (15, 5))
draw_marker(ax, -4, 3.5, 'Chigüiro\nParrilla Bar', C['accent'], 'food', (0, -15))
draw_marker(ax, -15, 14, 'Edelweiss\n(Cajicá)', C['warning'], 'food', (0, -12))
draw_marker(ax, 4, 10, 'Estación\nUsaquén', C['muted'], 'transport', (0, -14))
draw_marker(ax, 1, 7, 'Zona T /\nAndino', C['accent'], 'shopping', (15, 0))

ax.set_title('Mapa General · Bogotá · Zonas y Principales Sitios',
            fontsize=14, weight='bold', color=C['text'], pad=15)
ax.text(0.5, 1.02, 'Cuadrícula de Calles (Cra verticales, Cl horizontales) · Avenidas principales resaltadas',
       transform=ax.transAxes, ha='center', fontsize=9,
       color=C['muted'], style='italic')
legend(ax, 'lower right')
ax.set_xlim(-12, 8)
ax.set_ylim(-6, 16)
ax.set_aspect('equal')
ax.set_xlabel('Occidente  ←  Kilómetros (Carreras)  →  Oriente', fontsize=8, color=C['muted'])
ax.set_ylabel('Sur  ←  Kilómetros (Calles)  →  Norte', fontsize=8, color=C['muted'])
plt.savefig(f'{OUTPUT_DIR}/01_mapa_general.png', dpi=200,
           facecolor=C['bg'], edgecolor='none')
plt.close()
print("✓ 01_mapa_general.png")


# ===== MAP 2: DÍA 1 - LLEGADA + UNAL (con ruta TM detallada) =====
fig, ax = plt.subplots(figsize=(11, 8), constrained_layout=True)
setup_bogota_grid(ax, x_range=(-9, 4), y_range=(0, 11))

# Ruta detallada con paradas
route1 = [(-7, 5), (-3, 7), (0, 8.5)]  # Aeropuerto → Calle 94
draw_route(ax, route1, C['muted'], '-', 'Taxi', 0.5, time_min=30)

route2 = [(0, 8.5), (0.1, 5), (-1, 3), (-2, 3.5)]  # Calle 94 → UNAL vía TM
draw_route(ax, route2, C['accent'], '--', 'TM B→E', 0.4, time_min=50)

# Markers
draw_marker(ax, -7, 5, 'Aeropuerto\nEl Dorado', C['muted'], 'transport', (-25, 0))
draw_marker(ax, 0, 8.5, 'Calle 94\n(Alojamiento)', C['accent'], 'base', (0, -16))
draw_marker(ax, -2, 3.5, 'Universidad\nNacional', C['secondary'], 'culture', (-25, 5))

# TM Stations intermediate
ax.plot(0.1, 5, marker='s', markersize=8, color=C['accent'],
       markeredgecolor='white', markeredgewidth=1, zorder=7)
ax.annotate('Estación\nCalle 100\n(Marketmedios)', (0.1, 5), xytext=(15, 5),
           textcoords='offset points', fontsize=6, color=C['accent'], weight='bold',
           bbox=dict(boxstyle='round,pad=0.2', facecolor='white',
                    edgecolor=C['accent'], linewidth=0.5, alpha=0.9), zorder=8)

ax.plot(-1, 3, marker='s', markersize=8, color=C['accent'],
       markeredgecolor='white', markeredgewidth=1, zorder=7)
ax.annotate('Transbordo\nAv. El Dorado', (-1, 3), xytext=(-50, -15),
           textcoords='offset points', fontsize=6, color=C['accent'], weight='bold',
           bbox=dict(boxstyle='round,pad=0.2', facecolor='white',
                    edgecolor=C['accent'], linewidth=0.5, alpha=0.9), zorder=8)

ax.plot(-2, 3.5, marker='s', markersize=8, color=C['accent'],
       markeredgecolor='white', markeredgewidth=1, zorder=7)
ax.annotate('Estación\nU. Nacional', (-2, 3.5), xytext=(-50, 10),
           textcoords='offset points', fontsize=6, color=C['accent'], weight='bold',
           bbox=dict(boxstyle='round,pad=0.2', facecolor='white',
                    edgecolor=C['accent'], linewidth=0.5, alpha=0.9), zorder=8)

# Parkway zone
draw_zone(ax, -1.5, 2, 2, 1.5, 'PARKWAY', C['secondary'])

ax.set_title('Día 1 · Miércoles 15 · Llegada + Universidad Nacional',
            fontsize=13, weight='bold', color=C['text'], pad=15)
ax.text(0.5, 1.02, 'Aeropuerto → Calle 94 (taxi $35-50k) → UNAL (TM troncal B→E, $3.550 c/u)',
       transform=ax.transAxes, ha='center', fontsize=9,
       color=C['muted'], style='italic')
ax.set_xlim(-9, 4)
ax.set_ylim(0, 11)
ax.set_aspect('equal')
plt.savefig(f'{OUTPUT_DIR}/02_dia1_unal.png', dpi=200,
           facecolor=C['bg'], edgecolor='none')
plt.close()
print("✓ 02_dia1_unal.png")


# ===== MAP 3: DÍA 2 - LA CANDALARIA (con ruta y paradas) =====
fig, ax = plt.subplots(figsize=(11, 8), constrained_layout=True)
setup_bogota_grid(ax, x_range=(-3, 5), y_range=(-4, 11))

# Ruta detallada
route = [(0, 8.5), (0.5, 5), (1, 0), (1, -1.5)]  # Calle 94 → La Candelaria
draw_route(ax, route, C['accent'], '--', 'TM B→A', 0.4, time_min=55)

# Sub-route within Candelaria
route_candelaria = [(1, -1.5), (1.2, -1.8), (2, -2), (2, -2.5)]  # Candelaria → Monserrate
draw_route(ax, route_candelaria, C['secondary'], '-', 'Caminata', 0.5, time_min=15)

# Markers
draw_marker(ax, 0, 8.5, 'Calle 94\n(Alojamiento)', C['accent'], 'base', (-15, 0))
draw_marker(ax, 1, -1.5, 'La Candelaria\n(Museo Oro,\nPlanetario)', C['accent'], 'culture', (0, -22))
draw_marker(ax, 2, -2.5, 'Monserrate', C['secondary'], 'park', (15, 0))
draw_marker(ax, 0.5, -1, 'Cinemateca', C['accent'], 'culture', (-30, 0))
draw_marker(ax, 0, -1, 'Cementerio\nCentral', C['muted'], 'culture', (-25, 5))

# Zona Candelaria
draw_zone(ax, 0.3, -2.5, 2.5, 1.5, 'LA CANDELARIA', C['accent'])

# Walking arrows
ax.annotate('10 min\ncaminando', xy=(1.5, -2), fontsize=7, color=C['secondary'],
           ha='center', weight='bold',
           bbox=dict(boxstyle='round,pad=0.2', facecolor='white',
                    edgecolor=C['secondary'], linewidth=0.5), zorder=6)

ax.set_title('Día 2 · Jueves 16 · La Candelaria Cultural',
            fontsize=13, weight='bold', color=C['text'], pad=15)
ax.text(0.5, 1.02, 'Monserrate + Cementerio + Museo del Oro + Planetario (todo a 10-15 min caminando)',
       transform=ax.transAxes, ha='center', fontsize=9,
       color=C['muted'], style='italic')
ax.set_xlim(-3, 5)
ax.set_ylim(-4, 11)
ax.set_aspect('equal')
plt.savefig(f'{OUTPUT_DIR}/03_dia2_candelaria.png', dpi=200,
           facecolor=C['bg'], edgecolor='none')
plt.close()
print("✓ 03_dia2_candelaria.png")


# ===== MAP 4: JBB + CHIGÜIRO + PARQUE SB (con ruta) =====
fig, ax = plt.subplots(figsize=(11, 8), constrained_layout=True)
setup_bogota_grid(ax, x_range=(-7, 4), y_range=(1, 11))

# Ruta
route = [(0, 8.5), (-1, 6), (-3, 4), (-3.5, 3.5), (-4, 3.5)]  # Calle 94 → JBB → Chigüiro
draw_route(ax, route, C['secondary'], '--', 'TM E + 10min pie', 0.4, time_min=40)

# Sub-route JBB → Parque SB (caminata)
route_park = [(-3, 3.5), (-3.2, 4)]  # JBB → Parque SB
draw_route(ax, route_park, C['secondary'], '-', '5 min pie', 0.5, time_min=5)

# Sub-route Parque SB → Chigüiro
route_chiguiro = [(-3.5, 4), (-4, 3.5)]  # Parque SB → Chigüiro
draw_route(ax, route_chiguiro, C['accent'], '-', 'Taxi 5min', 0.5, time_min=5)

# Markers
draw_marker(ax, 0, 8.5, 'Calle 94\n(Alojamiento)', C['accent'], 'base', (15, 0))
draw_marker(ax, -3, 3.5, 'Jardín\nBotánico', C['secondary'], 'park', (-25, -10))
draw_marker(ax, -3.5, 4, 'Parque\nSimón Bolívar', C['secondary'], 'park', (15, 5))
draw_marker(ax, -4, 3.5, 'Chigüiro\nParrilla Bar', C['accent'], 'food', (0, -14))

# Zonas
draw_zone(ax, -4.5, 3, 2.5, 2, 'PARQUE SIMÓN\nBOLÍVAR', C['secondary'])
draw_zone(ax, -4.5, 2.5, 1, 0.8, 'JBB', C['secondary'])

ax.set_title('Jardín Botánico + Parque Simón Bolívar + Chigüiro',
            fontsize=13, weight='bold', color=C['text'], pad=15)
ax.text(0.5, 1.02, 'Plan naturaleza + comida llanera (todo en zona occidental, desplazamientos cortos)',
       transform=ax.transAxes, ha='center', fontsize=9,
       color=C['muted'], style='italic')
ax.set_xlim(-7, 4)
ax.set_ylim(1, 11)
ax.set_aspect('equal')
plt.savefig(f'{OUTPUT_DIR}/04_jbb_chiguiro.png', dpi=200,
           facecolor=C['bg'], edgecolor='none')
plt.close()
print("✓ 04_jbb_chiguiro.png")


# ===== MAP 5: DÍA 5 - PALOQUEMAO + CANDELARIA =====
fig, ax = plt.subplots(figsize=(11, 8), constrained_layout=True)
setup_bogota_grid(ax, x_range=(-4, 5), y_range=(-4, 11))

# Ruta mañana con Huevito
route1 = [(0, 8.5), (-1, 5), (-1.5, 0.5)]  # Calle 94 → Paloquemao
draw_route(ax, route1, C['warning'], '-', 'Carro Huevito', 0.5, time_min=30)

# Ruta tarde Paloquemao → Candelaria
route2 = [(-1.5, 0.5), (-0.5, 0), (1, -1.5)]  # Paloquemao → Candelaria
draw_route(ax, route2, C['accent'], '-', 'Carro/TM', 0.5, time_min=20)

# Markers
draw_marker(ax, 0, 8.5, 'Calle 94\n(Alojamiento)', C['accent'], 'base', (15, 0))
draw_marker(ax, -1.5, 0.5, 'Paloquemao', C['warning'], 'market', (-25, 0))
draw_marker(ax, 0, -1, 'Cementerio\nCentral', C['muted'], 'culture', (-25, 5))
draw_marker(ax, 1, -1.5, 'Museo Oro\n+ Planetario', C['accent'], 'culture', (15, 0))

# Zonas
draw_zone(ax, -2, -0.5, 1.5, 1.5, 'PALOQUEMAO', C['warning'])
draw_zone(ax, 0.3, -2.5, 2, 1.5, 'LA CANDELARIA', C['accent'])

# Time annotations
ax.text(-1.5, 2.5, 'MANANA 7:00-8:00\nMercado con Huevito', fontsize=8,
       color=C['warning'], weight='bold', ha='center',
       bbox=dict(boxstyle='round,pad=0.3', facecolor=C['warning_bg'],
                edgecolor=C['warning'], linewidth=1), zorder=6)

ax.text(0.5, -3.5, 'TARDE 2:00-7:30 PM\nMuseo Oro (gratis) + Planetario', fontsize=8,
       color=C['accent'], weight='bold', ha='center',
       bbox=dict(boxstyle='round,pad=0.3', facecolor=C['accent_bg'],
                edgecolor=C['accent'], linewidth=1), zorder=6)

ax.set_title('Día 5 · Domingo 19 · Paloquemao + La Candelaria',
            fontsize=13, weight='bold', color=C['text'], pad=15)
ax.text(0.5, 1.02, 'Mañana: mercado con Huevito en carro · Tarde: Museo Oro (gratis domingo) + Planetario láser',
       transform=ax.transAxes, ha='center', fontsize=9,
       color=C['muted'], style='italic')
ax.set_xlim(-4, 5)
ax.set_ylim(-4, 11)
ax.set_aspect('equal')
plt.savefig(f'{OUTPUT_DIR}/05_dia5_paloquemao.png', dpi=200,
           facecolor=C['bg'], edgecolor='none')
plt.close()
print("✓ 05_dia5_paloquemao.png")


# ===== MAP 6: TREN DE LA SABANA =====
fig, ax = plt.subplots(figsize=(12, 7), constrained_layout=True)
setup_bogota_grid(ax, x_range=(-22, 8), y_range=(-2, 20))

# Ruta tren
route = [(-3, 0), (0, 8.5), (4, 10), (-15, 14), (-18, 17)]  # Gran Estación → Calle 94 → Usaquén → Cajicá → Zipaquirá
# Actually train goes: Gran Estación → Usaquén → Cajicá → Zipaquirá
route = [(-3, 0), (4, 10), (-15, 14), (-18, 17)]
draw_route(ax, route, C['accent'], '-', 'TREN', 0.3, time_min=120)

# Sub-routes
route_taxi1 = [(0, 8.5), (4, 10)]  # Calle 94 → Usaquén (taxi)
draw_route(ax, route_taxi1, C['muted'], '--', 'Taxi', 0.5, time_min=15)

route_taxi2 = [(0, 8.5), (-3, 0)]  # Calle 94 → Gran Estación (taxi)
draw_route(ax, route_taxi2, C['muted'], '--', 'Taxi', 0.5, time_min=30)

# Markers
draw_marker(ax, 0, 8.5, 'Calle 94\n(Alojamiento)', C['accent'], 'base', (0, -16))
draw_marker(ax, -3, 0, 'CC Gran\nEstación', C['muted'], 'transport', (0, -14))
draw_marker(ax, 4, 10, 'Estación\nUsaquén', C['muted'], 'transport', (0, -14))
draw_marker(ax, -15, 14, 'Edelweiss\n(Cajicá)', C['warning'], 'food', (0, -14))
draw_marker(ax, -18, 17, 'Zipaquirá\n(Catedral Sal)', C['accent'], 'culture', (0, -16))

# Time annotations along the route
ax.text(0, 5, 'TREN\n9:15 AM →\n10:00 AM', fontsize=7, color=C['accent'],
       weight='bold', ha='center',
       bbox=dict(boxstyle='round,pad=0.3', facecolor=C['accent_bg'],
                edgecolor=C['accent'], linewidth=0.8), zorder=6)

ax.text(-7, 12, 'TREN\n10:00 AM\n(para Cajicá)', fontsize=7, color=C['accent'],
       weight='bold', ha='center',
       bbox=dict(boxstyle='round,pad=0.3', facecolor=C['accent_bg'],
                edgecolor=C['accent'], linewidth=0.8), zorder=6)

ax.text(-16, 15.5, 'TREN\n10:45 AM\nllega Zipaquirá', fontsize=7, color=C['accent'],
       weight='bold', ha='center',
       bbox=dict(boxstyle='round,pad=0.3', facecolor=C['accent_bg'],
                edgecolor=C['accent'], linewidth=0.8), zorder=6)

ax.set_title('Tren de la Sabana + Salida a Cajicá/Zipaquirá',
            fontsize=13, weight='bold', color=C['text'], pad=15)
ax.text(0.5, 1.02, 'Tren: 8:45 AM Gran Estación · 9:15 AM Usaquén · 10:00 AM Cajicá · 10:45 AM Zipaquirá',
       transform=ax.transAxes, ha='center', fontsize=9,
       color=C['muted'], style='italic')
ax.set_xlim(-22, 8)
ax.set_ylim(-2, 20)
ax.set_aspect('equal')
plt.savefig(f'{OUTPUT_DIR}/06_tren_sabana.png', dpi=200,
           facecolor=C['bg'], edgecolor='none')
plt.close()
print("✓ 06_tren_sabana.png")


# ===== MAP 7: ZONA NORTE - CALLE 94 + ALREDEDORES =====
fig, ax = plt.subplots(figsize=(11, 8), constrained_layout=True)
setup_bogota_grid(ax, x_range=(-2, 7), y_range=(4, 13))

# Zonas
draw_zone(ax, -0.5, 7.5, 2.5, 2.5, 'CHICÓ /\nZONA T', C['accent'])
draw_zone(ax, -0.5, 6.5, 2, 1, 'PARQUE\nDE LA 93', C['secondary'])
draw_zone(ax, 0, 5, 2, 1, 'ZONA G', C['accent'])

# Markers
draw_marker(ax, 0, 8.5, 'Calle 94\n(Alojamiento)', C['accent'], 'base', (0, -16))
draw_marker(ax, 0.5, 7.5, 'Parque\nde la 93', C['secondary'], 'park', (15, 5))
draw_marker(ax, 0.5, 5.5, 'Vitto (Zona G)', C['accent'], 'food', (15, 0))
draw_marker(ax, 1, 7, 'Zona T /\nAndino', C['accent'], 'shopping', (15, -5))
draw_marker(ax, 4, 10, 'Estación\nUsaquén', C['muted'], 'transport', (0, -14))
draw_marker(ax, 1, 7.5, 'Taquería\nHuevito\n(Cl 90 c/ Cra 11)', C['warning'], 'food', (-30, -25))
draw_marker(ax, 3, 9, 'Renata Tacos\n(Usaquén)', C['accent'], 'food', (0, -14))
draw_marker(ax, 1.5, 7, 'Insurgentes\n(Cl 93B)', C['accent'], 'food', (20, 5))

# Walking distance annotations
ax.text(0.3, 8, '5 min pie', fontsize=7, color=C['secondary'], weight='bold',
       bbox=dict(boxstyle='round,pad=0.2', facecolor='white',
                edgecolor=C['secondary'], linewidth=0.5), zorder=6)
ax.text(0.7, 6, '15 min pie', fontsize=7, color=C['secondary'], weight='bold',
       bbox=dict(boxstyle='round,pad=0.2', facecolor='white',
                edgecolor=C['secondary'], linewidth=0.5), zorder=6)

ax.set_title('Zona Norte · Base Calle 94 / Chicó',
            fontsize=13, weight='bold', color=C['text'], pad=15)
ax.text(0.5, 1.02, 'Caminatas desde el alojamiento: Parque 93 (5 min), Zona T (10 min), Vitto Zona G (15 min)',
       transform=ax.transAxes, ha='center', fontsize=9,
       color=C['muted'], style='italic')
ax.set_xlim(-2, 7)
ax.set_ylim(4, 13)
ax.set_aspect('equal')
plt.savefig(f'{OUTPUT_DIR}/07_zona_norte.png', dpi=200,
           facecolor=C['bg'], edgecolor='none')
plt.close()
print("✓ 07_zona_norte.png")


# ===== MAP 8: PLAN ECONÓMICO OPTIMIZADO =====
fig, ax = plt.subplots(figsize=(13, 8), constrained_layout=True)
setup_bogota_grid(ax, x_range=(-6, 4), y_range=(-3, 11))

# Rutas plan económico
route_unal = [(0, 8.5), (-2, 3.5)]  # → UNAL
draw_route(ax, route_unal, C['accent'], '--', 'TM 50min', 0.5, time_min=50)

route_candelaria = [(0, 8.5), (1, -1.5)]  # → Candelaria
draw_route(ax, route_candelaria, C['accent'], '--', 'TM 55min', 0.5, time_min=55)

route_jbb = [(0, 8.5), (-3, 3.5)]  # → JBB
draw_route(ax, route_jbb, C['secondary'], '--', 'TM 40min', 0.5, time_min=40)

route_paloquemao = [(0, 8.5), (-1.5, 0.5)]  # → Paloquemao (con Huevito)
draw_route(ax, route_paloquemao, C['warning'], '-', 'Carro Huevito\n30min', 0.5, time_min=30)

route_vitto = [(0, 8.5), (0.5, 5.5)]  # → Vitto
draw_route(ax, route_vitto, C['accent'], '--', 'Uber 15min', 0.5, time_min=15)

# Markers
draw_marker(ax, 0, 8.5, 'Calle 94\n(Alojamiento)', C['accent'], 'base', (0, -16))
draw_marker(ax, -2, 3.5, 'Universidad\nNacional', C['secondary'], 'culture', (-25, 5))
draw_marker(ax, 1, -1.5, 'La Candelaria\n(Cementerio,\nOro, Planetario)', C['accent'], 'culture', (0, -25))
draw_marker(ax, -3, 3.5, 'JBB + Chigüiro', C['secondary'], 'park', (-15, -10))
draw_marker(ax, -1.5, 0.5, 'Paloquemao\n+ lechona', C['warning'], 'market', (-25, -10))
draw_marker(ax, 0.5, 5.5, 'Vitto\n(Zona G)', C['accent'], 'food', (15, 0))

ax.set_title('Plan Económico · Rutas Optimizadas (< $2M COP)',
            fontsize=13, weight='bold', color=C['text'], pad=15)
ax.text(0.5, 1.02, '8 planes principales · TransMilenio prioritario · minimizar Uber · agrupar por zona',
       transform=ax.transAxes, ha='center', fontsize=9,
       color=C['muted'], style='italic')
legend(ax, 'lower right')
ax.set_xlim(-6, 4)
ax.set_ylim(-3, 11)
ax.set_aspect('equal')
plt.savefig(f'{OUTPUT_DIR}/08_plan_economico.png', dpi=200,
           facecolor=C['bg'], edgecolor='none')
plt.close()
print("✓ 08_plan_economico.png")


# ===== MAP 9: TRANSMILENIO - LÍNEAS PRINCIPALES =====
fig, ax = plt.subplots(figsize=(12, 9), constrained_layout=True)
setup_bogota_grid(ax, x_range=(-9, 4), y_range=(-4, 11))

# Troncales (líneas gruesas de colores)
# B - Autopista Norte (Cra 16, vertical)
ax.plot([0.2, 0.1, 0, -0.1, -0.2], [10, 7, 4, 1, 0],
       color=C['accent'], linewidth=4, alpha=0.7, zorder=3, label='B - Autopista Norte')

# A - Caracas (Cra 14, vertical-diagonal)
ax.plot([1, 0.8, 0.5, 0, -0.5, -1, -1.5], [10, 7, 4, 0, -1, -2, -3],
       color=C['secondary'], linewidth=4, alpha=0.7, zorder=3, label='A - Caracas')

# E - NQS Central (diagonal oeste)
ax.plot([-3, -3.5, -3.8, -4, -4.2], [10, 5, 0, -2, -4],
       color=C['text'], linewidth=4, alpha=0.7, zorder=3, label='E - NQS Central')

# K - Av El Dorado (horizontal Cl 26)
ax.plot([-8, -5, -2, 0, 3], [0.5, 0.3, 0, -0.2, -0.5],
       color=C['warning'], linewidth=4, alpha=0.7, zorder=3, label='K - Av El Dorado')

# Estaciones TM principales (cuadrados grandes)
estaciones = [
    ('Calle 100\n(Marketmedios)', 0.1, 7, C['accent']),
    ('Calle 94\n(Alojamiento)', 0, 8.5, C['accent']),
    ('Avenida Chile', -1.5, 1.5, C['text']),
    ('Salitre\nEl Greco', -3, 0, C['warning']),
    ('Universidad\nNacional', -3.8, 0, C['text']),
    ('Las Aguas', 0, -0.5, C['secondary']),
    ('Museo del Oro', -0.5, -1.5, C['secondary']),
    ('CAD', -2, 0.3, C['warning']),
    ('Paloquemao', -3.8, -0.5, C['text']),
    ('Aeropuerto', -8, 0.5, C['warning']),
]
for name, x, y, color in estaciones:
    ax.plot(x, y, marker='s', markersize=10, color=color,
           markeredgecolor='white', markeredgewidth=1.5, zorder=7)
    ax.annotate(name, (x, y), xytext=(8, 0), textcoords='offset points',
               fontsize=6.5, color=C['text'], weight='bold',
               bbox=dict(boxstyle='round,pad=0.2', facecolor='white',
                        edgecolor=color, linewidth=0.8, alpha=0.95), zorder=8)

# Transbordo markers
ax.plot(-1.5, 1.5, marker='o', markersize=14, color='white',
       markeredgecolor=C['text'], markeredgewidth=2, zorder=6)
ax.text(-1.5, 1.5, '↻', fontsize=12, ha='center', va='center', color=C['text'], zorder=7)

ax.plot(-3, 0, marker='o', markersize=14, color='white',
       markeredgecolor=C['text'], markeredgewidth=2, zorder=6)
ax.text(-3, 0, '↻', fontsize=12, ha='center', va='center', color=C['text'], zorder=7)

ax.set_title('TransMilenio · Troncales Principales desde Calle 94',
            fontsize=14, weight='bold', color=C['text'], pad=15)
ax.text(0.5, 1.02, 'Líneas que conectan el alojamiento con los principales destinos · ↻ = estación de transbordo',
       transform=ax.transAxes, ha='center', fontsize=9,
       color=C['muted'], style='italic')
ax.legend(loc='lower right', fontsize=8, framealpha=0.95)
ax.set_xlim(-9, 4)
ax.set_ylim(-4, 11)
ax.set_aspect('equal')
plt.savefig(f'{OUTPUT_DIR}/09_transmilenio.png', dpi=200,
           facecolor=C['bg'], edgecolor='none')
plt.close()
print("✓ 09_transmilenio.png")


print(f"\nTotal: 9 mapas v3 generados en {OUTPUT_DIR}")
