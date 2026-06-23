#!/usr/bin/env python3
"""Generate the new dayPlans block with StepType and transportAlternatives."""
import json

# Each step now has 'type' field and transportAlternatives for long routes
# StepType: 'movilidad' | 'actividad' | 'compra' | 'comida' | 'espera' | 'info'

days = [
  {
    "day": 1,
    "date": "15 julio 2026",
    "weekday": "Miércoles",
    "title": "Llegada + Universidad Nacional (Nacho)",
    "subtitle": "Aeropuerto → Calle 94 → Tarde en campus + Parkway",
    "estimatedCost": "$165-235k + taxi $35-50k",
    "plan": [
      {"id": "d1-1", "time": "10:00 AM", "type": "info", "placeId": "aeropuerto", "activity": "Llegada Aeropuerto El Dorado. Migración, maletas.", "notes": "Taxi oficial aeropuerto disponible en terminal."},
      {"id": "d1-2", "time": "10:00-10:40", "type": "movilidad", "fromPlaceId": "aeropuerto", "toPlaceId": "alojamiento", "isMovement": True, "activity": "Traslado Aeropuerto → Alojamiento Calle 94",
       "transportAlternatives": [
         {"id": "d1-2-taxi", "mode": "Taxi", "label": "Taxi oficial aeropuerto", "duration": "25-40 min", "cost": "$35.000-50.000", "notes": "Tiquete con precio exacto. Recomendado con maletas.", "isRecommended": True},
         {"id": "d1-2-uber", "mode": "Uber", "label": "Uber / Cabify", "duration": "25-40 min", "cost": "$30.000-45.000", "notes": "Caminar a Av. El Dorado para pedirlo (restricción dentro del aeropuerto)."},
         {"id": "d1-2-tm", "mode": "TM", "label": "TransMilenio M86/K86", "duration": "60-90 min", "cost": "$3.550 c/u", "notes": "Con transbordo. Incómodo con maletas."}
       ]},
      {"id": "d1-3", "time": "10:40-11:30", "type": "actividad", "placeId": "alojamiento", "activity": "Check-in, dejar maletas, cambio de ropa."},
      {"id": "d1-4", "time": "11:30-12:00", "type": "compra", "placeId": "alojamiento", "activity": "Comprar tarjeta TuLlave personalizada en estación Calle 100-Marketmedios. 2× $8.000 + $20.000 recarga = $56.000. Llevar pasaporte.", "notes": "Estación a 600m del alojamiento (puente peatonal Calle 94)."},
      {"id": "d1-5", "time": "12:00-12:50", "type": "movilidad", "fromPlaceId": "alojamiento", "toPlaceId": "unal", "isMovement": True, "activity": "TransMilenio Calle 94 → Universidad Nacional",
       "transportAlternatives": [
         {"id": "d1-5-tm", "mode": "TM", "label": "TransMilenio (troncal B→E)", "duration": "40-55 min", "cost": "$3.550 c/u", "notes": "TM Calle 100 (B) → transbordo Av. El Dorado o Salitre El Greco → troncal E (NQS) → estación Universidad Nacional.", "isRecommended": True},
         {"id": "d1-5-uber", "mode": "Uber", "label": "Uber / Cabify", "duration": "25-35 min", "cost": "$18.000-25.000", "notes": "Directo, más rápido pero más caro."}
       ]},
      {"id": "d1-6", "time": "1:00-2:00 PM", "type": "comida", "placeId": "unal", "activity": "Almuerzo: Comedor 'Chucho León' (reabrió sep-2025, preguntar portería externos) o buffet Calle 44 #15-14 (~$11k c/u)."},
      {"id": "d1-7", "time": "2:00-5:00", "type": "actividad", "placeId": "unal", "activity": "Recorrido arquitectónico campus: Plaza Che → Auditorio León de Greiff → Museo Arquitectura Leopoldo Rother → Residencias Bloques 1-3 → Edificio Posgrados Salmona → Biblioteca Central."},
      {"id": "d1-8", "time": "5:00-5:20", "type": "movilidad", "fromPlaceId": "unal", "toPlaceId": "parkway", "isMovement": True, "activity": "Caminata UNAL → Parkway",
       "transportMode": "Caminata", "transportDuration": "15 min", "transportCost": "$0", "transportNotes": "Salir por portería Cra 45, caminar por Calle 45 hasta Cra 24 (Parkway). Alameda arbolada."},
      {"id": "d1-9", "time": "5:00-7:00", "type": "comida", "placeId": "parkway", "activity": "Cena en Parkway: Matrona, Oliveto, Casa Obrador (económico), KoronKo."},
      {"id": "d1-10", "time": "7:30-8:30", "type": "movilidad", "fromPlaceId": "parkway", "toPlaceId": "alojamiento", "isMovement": True, "activity": "Regreso Parkway → Calle 94",
       "transportAlternatives": [
         {"id": "d1-10-tm", "mode": "TM", "label": "TransMilenio", "duration": "40-55 min", "cost": "$3.550 c/u", "notes": "TM estación Universidad Nacional → Calle 100.", "isRecommended": True},
         {"id": "d1-10-uber", "mode": "Uber", "label": "Uber / Cabify", "duration": "25 min", "cost": "$18.000-25.000", "notes": "Más directo de noche."}
       ]},
    ]
  },
  {
    "day": 2,
    "date": "16 julio 2026",
    "weekday": "Jueves",
    "title": "La Candelaria: Ajiaco, Changua, Cementerio, Planetario",
    "subtitle": "Día cultural completo en centro histórico",
    "estimatedCost": "$90-180k",
    "plan": [
      {"id": "d2-1", "time": "7:30 AM", "type": "info", "placeId": "alojamiento", "activity": "Salida Calle 94."},
      {"id": "d2-2", "time": "7:30-8:30", "type": "movilidad", "fromPlaceId": "alojamiento", "toPlaceId": "la-puerta-falsa", "isMovement": True, "activity": "Calle 94 → La Candelaria",
       "transportAlternatives": [
         {"id": "d2-2-tm", "mode": "TM", "label": "TransMilenio (troncal B→A)", "duration": "45-60 min", "cost": "$3.550 c/u", "notes": "TM Calle 100 (B) → transbordo → troncal A (Caracas) → estación Las Aguas. 5 min a pie.", "isRecommended": True},
         {"id": "d2-2-uber", "mode": "Uber", "label": "Uber / Cabify", "duration": "35-50 min", "cost": "$25.000-35.000", "notes": "Directo, evita transbordos."}
       ]},
      {"id": "d2-3", "time": "8:30-9:30", "type": "comida", "placeId": "la-puerta-falsa", "activity": "Desayuno La Puerta Falsa: Changua + chocolate + tamal. ~$25k 2 pers. Sin reserva, fila 15-45 min."},
      {"id": "d2-4", "time": "9:30-11:30", "type": "actividad", "placeId": "la-puerta-falsa", "activity": "Caminata La Candelaria: Plaza de Bolívar, Catedral, Casa de Nariño (exterior), callejones históricos."},
      {"id": "d2-5", "time": "11:30-12:00", "type": "movilidad", "fromPlaceId": "la-puerta-falsa", "toPlaceId": "cementerio", "isMovement": True, "activity": "La Candelaria → Cementerio Central",
       "transportAlternatives": [
         {"id": "d2-5-uber", "mode": "Uber", "label": "Uber / Cabify", "duration": "8 min", "cost": "$8.000-12.000", "notes": "Más rápido.", "isRecommended": True},
         {"id": "d2-5-caminata", "mode": "Caminata", "label": "Caminata", "duration": "25 min", "cost": "$0", "notes": "Por La Carrera 10 hacia el sur."},
         {"id": "d2-5-tm", "mode": "TM", "label": "TransMilenio", "duration": "15 min", "cost": "$3.550 c/u", "notes": "Estación Las Aguas → CAD o Paloquemao."}
       ]},
      {"id": "d2-6", "time": "11:30-12:30", "type": "actividad", "placeId": "cementerio", "activity": "Visita Cementerio Central. Diurna GRATUITA (Monumento Nacional)."},
      {"id": "d2-7", "time": "12:30-1:00", "type": "movilidad", "fromPlaceId": "cementerio", "toPlaceId": "la-puerta-falsa", "isMovement": True, "activity": "Cementerio → La Candelaria",
       "transportAlternatives": [
         {"id": "d2-7-uber", "mode": "Uber", "label": "Uber", "duration": "8 min", "cost": "$8.000-12.000", "isRecommended": True},
         {"id": "d2-7-caminata", "mode": "Caminata", "label": "Caminata", "duration": "25 min", "cost": "$0"}
       ]},
      {"id": "d2-8", "time": "1:00-2:30 PM", "type": "comida", "placeId": "la-puerta-falsa", "activity": "Almuerzo ajiaco La Puerta Falsa o La Puerta de la Catedral. $38-40k c/u."},
      {"id": "d2-9", "time": "2:30-2:40", "type": "movilidad", "fromPlaceId": "la-puerta-falsa", "toPlaceId": "museo-oro", "isMovement": True, "activity": "Caminata La Puerta Falsa → Museo del Oro",
       "transportMode": "Caminata", "transportDuration": "10-15 min", "transportCost": "$0", "transportNotes": "Por Plaza de Bolívar. Cl 11 #6-50 → Cra 6 #15-88."},
      {"id": "d2-10", "time": "2:30-5:00", "type": "actividad", "placeId": "museo-oro", "activity": "Museo del Oro. Jueves $5.000 c/u. 2-3 horas. Casilleros piso 2."},
      {"id": "d2-11", "time": "5:00-6:00", "type": "espera", "placeId": "museo-oro", "activity": "Pausa café: Café San Alberto o Juan Valdez La Candelaria."},
      {"id": "d2-12", "time": "5:30-5:45", "type": "movilidad", "fromPlaceId": "museo-oro", "toPlaceId": "planetario", "isMovement": True, "activity": "Caminata Museo Oro → Planetario",
       "transportMode": "Caminata", "transportDuration": "10-15 min", "transportCost": "$0", "transportNotes": "Por Parque de la Independencia."},
      {"id": "d2-13", "time": "6:00-7:30", "type": "actividad", "placeId": "planetario", "activity": "Planetario. Jueves show láser Pink Floyd 6pm (verificar cartelera julio 2026)."},
      {"id": "d2-14", "time": "8:00-9:00", "type": "movilidad", "fromPlaceId": "planetario", "toPlaceId": "alojamiento", "isMovement": True, "activity": "Regreso Planetario → Calle 94",
       "transportAlternatives": [
         {"id": "d2-14-tm", "mode": "TM", "label": "TransMilenio", "duration": "50-60 min", "cost": "$3.550 c/u", "isRecommended": True},
         {"id": "d2-14-uber", "mode": "Uber", "label": "Uber / Cabify", "duration": "35-50 min", "cost": "$25.000-35.000"}
       ]},
    ],
    "alternatives": [
      {"label": "Si llueve o prefieres indoors", "description": "Cinemateca + Centro Cultural GGM + La Candelaria", "placeIds": ["cinemateca"]},
    ]
  },
  {
    "day": 3,
    "date": "17 julio 2026",
    "weekday": "Viernes",
    "title": "Cita Médica + Planes Compatibles",
    "subtitle": "Mañana tranquila, exámenes oftalmológicos, tarde con pupilas dilatadas",
    "isRestriccionMedica": True,
    "estimatedCost": "$80-140k",
    "plan": [
      {"id": "d3-1", "time": "7:30-8:30 AM", "type": "comida", "placeId": "alojamiento", "activity": "Desayuno ligero cercano: Juan Valdez, Pan Pa' Ya, Atlanta Pastry."},
      {"id": "d3-2", "time": "9:00-12:00", "type": "actividad", "placeId": "alojamiento", "activity": "Cita oftalmológica en clínica cerca de Calle 98. Llevar gafas de sol."},
      {"id": "d3-3", "time": "12:00-12:15", "type": "movilidad", "fromPlaceId": "alojamiento", "toPlaceId": "vitto", "isMovement": True, "activity": "Calle 94 → Zona G (Vitto)",
       "transportAlternatives": [
         {"id": "d3-3-uber", "mode": "Uber", "label": "Uber / Cabify", "duration": "10-15 min", "cost": "$12.000-18.000", "isRecommended": True},
         {"id": "d3-3-caminata", "mode": "Caminata", "label": "Caminata", "duration": "25 min", "cost": "$0", "notes": "Por Calle 94 → Cra 11 → Calle 69."}
       ]},
      {"id": "d3-4", "time": "12:30-1:30 PM", "type": "comida", "placeId": "vitto", "activity": "Almuerzo Zona G: Vitto, Prudencia, Mesa Franca. Evitar restaurantes oscuros."},
      {"id": "d3-5", "time": "1:30-2:00", "type": "movilidad", "fromPlaceId": "vitto", "toPlaceId": "parque-sb", "isMovement": True, "activity": "Zona G → Parque Simón Bolívar",
       "transportAlternatives": [
         {"id": "d3-5-uber", "mode": "Uber", "label": "Uber / Cabify", "duration": "20-30 min", "cost": "$15.000-22.000", "isRecommended": True},
         {"id": "d3-5-tm", "mode": "TM", "label": "TransMilenio", "duration": "40-55 min", "cost": "$3.550 c/u", "notes": "Calle 85 → Salitre El Greco + caminata."}
       ]},
      {"id": "d3-6", "time": "2:00-5:00", "type": "actividad", "placeId": "parque-sb", "activity": "Parque Simón Bolívar (sombras, aire libre, gratuito). Compatible con pupilas dilatadas."},
      {"id": "d3-7", "time": "5:00-6:00", "type": "movilidad", "fromPlaceId": "parque-sb", "toPlaceId": "parque-93", "isMovement": True, "activity": "Parque SB → Parque 93",
       "transportAlternatives": [
         {"id": "d3-7-uber", "mode": "Uber", "label": "Uber / Cabify", "duration": "20-25 min", "cost": "$15.000-22.000", "isRecommended": True},
         {"id": "d3-7-tm", "mode": "TM", "label": "TransMilenio", "duration": "35-45 min", "cost": "$3.550 c/u"}
       ]},
      {"id": "d3-8", "time": "5:00-6:00", "type": "espera", "placeId": "parque-93", "activity": "Café o merienda: Juan Valdez, Café Velvet, Hommus."},
      {"id": "d3-9", "time": "6:30-6:45", "type": "movilidad", "fromPlaceId": "parque-93", "toPlaceId": "vitto", "isMovement": True, "activity": "Parque 93 → Vitto",
       "transportAlternatives": [
         {"id": "d3-9-uber", "mode": "Uber", "label": "Uber", "duration": "10-15 min", "cost": "$12.000-18.000", "isRecommended": True},
         {"id": "d3-9-caminata", "mode": "Caminata", "label": "Caminata", "duration": "20 min", "cost": "$0"}
       ]},
      {"id": "d3-10", "time": "7:00-9:30", "type": "comida", "placeId": "vitto", "activity": "Cena Vitto (Zona G). WhatsApp +57 310 309 9727."},
      {"id": "d3-11", "time": "9:30-10:00", "type": "movilidad", "fromPlaceId": "vitto", "toPlaceId": "alojamiento", "isMovement": True, "activity": "Regreso Vitto → Calle 94",
       "transportAlternatives": [
         {"id": "d3-11-uber", "mode": "Uber", "label": "Uber", "duration": "10-15 min", "cost": "$12.000-18.000", "isRecommended": True},
         {"id": "d3-11-caminata", "mode": "Caminata", "label": "Caminata", "duration": "25 min", "cost": "$0"}
       ]},
    ]
  },
  {
    "day": 4,
    "date": "18 julio 2026",
    "weekday": "Sábado",
    "title": "Día Libre: JBB + Chigüiro + Parque Simón Bolívar",
    "subtitle": "Plan eco recomendado · Naturaleza + comida llanera",
    "estimatedCost": "$80-260k",
    "plan": [
      {"id": "d4-1", "time": "8:30 AM", "type": "info", "placeId": "alojamiento", "activity": "Salida Calle 94."},
      {"id": "d4-2", "time": "8:30-9:00", "type": "movilidad", "fromPlaceId": "alojamiento", "toPlaceId": "jbb", "isMovement": True, "activity": "Calle 94 → Jardín Botánico",
       "transportAlternatives": [
         {"id": "d4-2-uber", "mode": "Uber", "label": "Uber / Cabify", "duration": "20-30 min", "cost": "$15.000-22.000", "isRecommended": True},
         {"id": "d4-2-tm", "mode": "TM", "label": "TransMilenio + caminata", "duration": "40-55 min", "cost": "$3.550 c/u", "notes": "Calle 100 → Avenida Chile + 10 min a pie."}
       ]},
      {"id": "d4-3", "time": "9:00-11:30", "type": "actividad", "placeId": "jbb", "activity": "Jardín Botánico. Entrada nacional 2× $6.600 = $13.200. Combo Tropicario opcional."},
      {"id": "d4-4", "time": "11:30-11:40", "type": "movilidad", "fromPlaceId": "jbb", "toPlaceId": "parque-sb", "isMovement": True, "activity": "Caminata JBB → Parque Simón Bolívar",
       "transportMode": "Caminata", "transportDuration": "5-10 min", "transportCost": "$0", "transportNotes": "Son adyacentes."},
      {"id": "d4-5", "time": "11:30-1:30 PM", "type": "actividad", "placeId": "parque-sb", "activity": "Parque Simón Bolívar (gratis). Lago, Biblioteca Virgilio Barco (Salmona)."},
      {"id": "d4-6", "time": "1:30-1:40", "type": "movilidad", "fromPlaceId": "parque-sb", "toPlaceId": "chiguiro-parrilla", "isMovement": True, "activity": "Parque SB → Chigüiro Parrilla Bar",
       "transportAlternatives": [
         {"id": "d4-6-uber", "mode": "Uber", "label": "Uber", "duration": "5-10 min", "cost": "$8.000-12.000", "isRecommended": True},
         {"id": "d4-6-caminata", "mode": "Caminata", "label": "Caminata", "duration": "20 min", "cost": "$0"}
       ]},
      {"id": "d4-7", "time": "2:00-4:00", "type": "comida", "placeId": "chiguiro-parrilla", "activity": "Almuerzo Chigüiro Parrilla Bar. Chigüiro $43.200 c/u."},
      {"id": "d4-8", "time": "4:00-4:30", "type": "movilidad", "fromPlaceId": "chiguiro-parrilla", "toPlaceId": "alojamiento", "isMovement": True, "activity": "Regreso Chigüiro → Calle 94",
       "transportAlternatives": [
         {"id": "d4-8-uber", "mode": "Uber", "label": "Uber", "duration": "15-20 min", "cost": "$15.000-20.000", "isRecommended": True},
         {"id": "d4-8-tm", "mode": "TM", "label": "TransMilenio", "duration": "35-45 min", "cost": "$3.550 c/u"}
       ]},
      {"id": "d4-9", "time": "5:00-8:00", "type": "comida", "placeId": "parque-93", "activity": "Cena en La 93."},
    ],
    "alternatives": [
      {"label": "Opción A · Cultural clásica", "description": "Monserrate + La Candelaria + Museo del Oro", "placeIds": ["monserrate", "la-puerta-falsa", "museo-oro"]},
      {"label": "Opción C · Tren de la Sabana", "description": "Zipaquirá: Catedral de Sal (8:45am-5:15pm, $238k 2pers)", "placeIds": ["cc-gran-estacion", "estacion-usaquen"]},
    ]
  },
  {
    "day": 5,
    "date": "19 julio 2026",
    "weekday": "Domingo",
    "title": "Paloquemao + Planetario + Museo del Oro (con Huevito)",
    "subtitle": "Mañana con Huevito en carro · Tarde cultural",
    "estimatedCost": "$160-295k",
    "plan": [
      {"id": "d5-1", "time": "7:00 AM", "type": "info", "placeId": "alojamiento", "activity": "Salida Calle 94 con Huevito en carro."},
      {"id": "d5-2", "time": "7:00-7:30", "type": "movilidad", "fromPlaceId": "alojamiento", "toPlaceId": "paloquemao", "isMovement": True, "activity": "Carro con Huevito Calle 94 → Paloquemao",
       "transportMode": "Carro", "transportDuration": "25-35 min", "transportCost": "Parqueo $5-10k", "transportNotes": "Av. Calle 94 → Av. NQS sur → Av. Calle 19. Pico y placa NO aplica domingos."},
      {"id": "d5-3", "time": "7:30-8:00", "type": "info", "placeId": "paloquemao", "activity": "Llegada Paloquemao. Parqueo propio ($5-10k). Entrada libre."},
      {"id": "d5-4", "time": "8:00-9:00", "type": "comida", "placeId": "paloquemao", "activity": "Desayuno en mercado: caldo de costilla, chocolate con tamal, jugo natural."},
      {"id": "d5-5", "time": "9:00-11:00", "type": "actividad", "placeId": "paloquemao", "activity": "Recorrido mercado: frutas exóticas, Mercado de Flores, Especias para Colombia (Local 81102)."},
      {"id": "d5-6", "time": "11:00-11:10", "type": "movilidad", "fromPlaceId": "paloquemao", "toPlaceId": "lechoneria-dona-rosalba", "isMovement": True, "activity": "Caminata dentro de Paloquemao → Lechonería Doña Rosalba",
       "transportMode": "Caminata", "transportDuration": "2 min", "transportCost": "$0", "transportNotes": "Local 80228 dentro de la plaza."},
      {"id": "d5-7", "time": "11:00-1:00", "type": "comida", "placeId": "lechoneria-dona-rosalba", "activity": "Lechona tolimense Doña Rosalba, frutas, flores, especias. Presupuesto 2 pers: $100-210k."},
      {"id": "d5-8", "time": "1:30 PM", "type": "info", "placeId": "paloquemao", "activity": "Salida Paloquemao (asumir cierre 2:30pm conservador)."},
      {"id": "d5-9", "time": "1:30-1:50", "type": "movilidad", "fromPlaceId": "paloquemao", "toPlaceId": "museo-oro", "isMovement": True, "activity": "Carro con Huevito Paloquemao → Museo del Oro",
       "transportMode": "Carro", "transportDuration": "15-20 min", "transportCost": "Incluido (Huevito)", "transportNotes": "Sin tráfico domingo."},
      {"id": "d5-10", "time": "2:00-4:30", "type": "actividad", "placeId": "museo-oro", "activity": "Museo del Oro. DOMINGO GRATIS. Cierre 5pm."},
      {"id": "d5-11", "time": "4:30-4:40", "type": "movilidad", "fromPlaceId": "museo-oro", "toPlaceId": "la-puerta-falsa", "isMovement": True, "activity": "Caminata Museo Oro → La Puerta Falsa",
       "transportMode": "Caminata", "transportDuration": "10 min", "transportCost": "$0", "transportNotes": "Por Plaza de Bolívar."},
      {"id": "d5-12", "time": "4:30-6:00", "type": "comida", "placeId": "la-puerta-falsa", "activity": "Onces en La Puerta Falsa (domingo 7am-6pm, chocolate $9-17k)."},
      {"id": "d5-13", "time": "5:45-6:00", "type": "movilidad", "fromPlaceId": "la-puerta-falsa", "toPlaceId": "planetario", "isMovement": True, "activity": "Caminata La Puerta Falsa → Planetario",
       "transportMode": "Caminata", "transportDuration": "10-15 min", "transportCost": "$0"},
      {"id": "d5-14", "time": "6:00-7:30", "type": "actividad", "placeId": "planetario", "activity": "Planetario show láser (verificar cartelera julio 2026)."},
      {"id": "d5-15", "time": "8:00-9:00", "type": "movilidad", "fromPlaceId": "planetario", "toPlaceId": "alojamiento", "isMovement": True, "activity": "Regreso Planetario → Calle 94",
       "transportAlternatives": [
         {"id": "d5-15-tm", "mode": "TM", "label": "TransMilenio", "duration": "50-60 min", "cost": "$3.550 c/u", "isRecommended": True},
         {"id": "d5-15-uber", "mode": "Uber", "label": "Uber / Cabify", "duration": "35-50 min", "cost": "$25.000-35.000"}
       ]},
    ]
  },
  {
    "day": 6,
    "date": "20 julio 2026",
    "weekday": "Lunes",
    "title": "Día de la Independencia · Descanso con 6 Opciones",
    "subtitle": "Feriado nacional: Museo del Oro CIERRA, otros abren",
    "isFeriado": True,
    "estimatedCost": "$40-180k",
    "plan": [
      {"id": "d6-1", "time": "7:30 AM", "type": "info", "placeId": "alojamiento", "activity": "Plan A recomendado: Monserrate temprano + Parque 93"},
      {"id": "d6-2", "time": "7:30-8:15", "type": "movilidad", "fromPlaceId": "alojamiento", "toPlaceId": "monserrate", "isMovement": True, "activity": "Calle 94 → Monserrate (base teleférico)",
       "transportAlternatives": [
         {"id": "d6-2-uber", "mode": "Uber", "label": "Uber / Cabify", "duration": "35-45 min", "cost": "$25.000-35.000", "isRecommended": True},
         {"id": "d6-2-tm", "mode": "TM", "label": "TransMilenio + caminata", "duration": "50-60 min", "cost": "$3.550 c/u", "notes": "Estación Las Aguas + 15 min a pie cuesta arriba."}
       ]},
      {"id": "d6-3", "time": "8:30-11:00", "type": "actividad", "placeId": "monserrate", "activity": "Monserrate. Festivos 6:30am-5pm. Teleférico $35.000 c/u."},
      {"id": "d6-4", "time": "11:00-11:15", "type": "movilidad", "fromPlaceId": "monserrate", "toPlaceId": "alt-casa-santa-clara", "isMovement": True, "activity": "Caminata cima → Casa Santa Clara",
       "transportMode": "Caminata", "transportDuration": "5 min", "transportCost": "$0", "transportNotes": "En la cima, junto a la iglesia."},
      {"id": "d6-5", "time": "12:00-2:00", "type": "comida", "placeId": "alt-casa-santa-clara", "activity": "Almuerzo Casa Santa Clara (cima Monserrate)."},
      {"id": "d6-6", "time": "2:30-3:15", "type": "movilidad", "fromPlaceId": "monserrate", "toPlaceId": "parque-93", "isMovement": True, "activity": "Monserrate → Parque 93",
       "transportAlternatives": [
         {"id": "d6-6-uber", "mode": "Uber", "label": "Uber / Cabify", "duration": "35-45 min", "cost": "$25.000-35.000", "isRecommended": True},
         {"id": "d6-6-tm", "mode": "TM", "label": "TransMilenio", "duration": "55-65 min", "cost": "$3.550 c/u"}
       ]},
      {"id": "d6-7", "time": "3:00-6:00", "type": "espera", "placeId": "parque-93", "activity": "Tarde tranquila Parque de la 93. Café, descanso."},
    ],
    "alternatives": [
      {"label": "Plan B · Naturaleza", "description": "Parque Simón Bolívar + Jardín Botánico (ambos abren festivos)", "placeIds": ["parque-sb", "jbb"]},
      {"label": "Plan C · Salida de Bogotá", "description": "Edelweiss Cajicá + Andrés Carne de Res Chía (ambos abren festivos)", "placeIds": ["edelweiss", "andres-chia"]},
      {"label": "Plan D · Cultural alternativo", "description": "Caminata La Candelaria + La Puerta Falsa (Museo Oro CIERRA)", "placeIds": ["la-puerta-falsa"]},
      {"label": "Plan E · Descanso", "description": "Día relax alojamiento + cena Zona T (Andrés D.C.)", "placeIds": ["alt-andres-dc"]},
    ]
  },
  {
    "day": 7,
    "date": "21 julio 2026",
    "weekday": "Martes",
    "title": "Edelweiss (almuerzo) + Vitto (cena) + Taquería Huevito",
    "subtitle": "Día de cierre gastronómico + encuentros sociales",
    "estimatedCost": "$200-380k",
    "plan": [
      {"id": "d7-1", "time": "10:00 AM", "type": "info", "placeId": "alojamiento", "activity": "Reserva Edelweiss WhatsApp +57 311 541 1241. Confirmar horario."},
      {"id": "d7-2", "time": "11:00-12:00", "type": "movilidad", "fromPlaceId": "alojamiento", "toPlaceId": "edelweiss", "isMovement": True, "activity": "Calle 94 → Edelweiss (Cajicá)",
       "transportAlternatives": [
         {"id": "d7-2-uber", "mode": "Uber", "label": "Uber / Cabify", "duration": "45-60 min", "cost": "$80.000-120.000", "isRecommended": True},
         {"id": "d7-2-bus", "mode": "Carro", "label": "Bus Sotracausán", "duration": "90 min", "cost": "$8.000-12.000 c/u", "notes": "Desde Portal del Norte. Más económico pero lento."},
         {"id": "d7-2-tren", "mode": "Tren", "label": "Tren de la Sabana (sáb/dom)", "duration": "60 min", "cost": "$119.000 c/u", "notes": "Solo disponible fin de semana."}
       ]},
      {"id": "d7-3", "time": "12:00-2:30", "type": "comida", "placeId": "edelweiss", "activity": "Almuerzo Edelweiss: codillo, salchichas, sauerkraut, pretzel, strudel."},
      {"id": "d7-4", "time": "2:30-3:30", "type": "movilidad", "fromPlaceId": "edelweiss", "toPlaceId": "alojamiento", "isMovement": True, "activity": "Regreso Edelweiss → Calle 94",
       "transportAlternatives": [
         {"id": "d7-4-uber", "mode": "Uber", "label": "Uber / Cabify", "duration": "45-60 min", "cost": "$80.000-120.000", "isRecommended": True},
         {"id": "d7-4-bus", "mode": "Carro", "label": "Bus Sotracausán", "duration": "90 min", "cost": "$8.000-12.000 c/u"}
       ]},
      {"id": "d7-5", "time": "6:30-7:30", "type": "comida", "placeId": "taqueria-huevito", "activity": "Taquería de Huevito (Cl 90 c/ Cra 11, 5 min caminando). Encuentro con amigos."},
      {"id": "d7-6", "time": "7:30-7:45", "type": "movilidad", "fromPlaceId": "taqueria-huevito", "toPlaceId": "vitto", "isMovement": True, "activity": "Taquería Huevito → Vitto",
       "transportAlternatives": [
         {"id": "d7-6-uber", "mode": "Uber", "label": "Uber", "duration": "10-15 min", "cost": "$12.000-18.000", "isRecommended": True},
         {"id": "d7-6-caminata", "mode": "Caminata", "label": "Caminata", "duration": "25 min", "cost": "$0"}
       ]},
      {"id": "d7-7", "time": "8:00-10:30", "type": "comida", "placeId": "vitto", "activity": "Cena Vitto (Zona G). WhatsApp +57 310 309 9727."},
      {"id": "d7-8", "time": "10:30-10:45", "type": "movilidad", "fromPlaceId": "vitto", "toPlaceId": "alojamiento", "isMovement": True, "activity": "Regreso Vitto → Calle 94",
       "transportAlternatives": [
         {"id": "d7-8-uber", "mode": "Uber", "label": "Uber", "duration": "10-15 min", "cost": "$12.000-18.000", "isRecommended": True},
         {"id": "d7-8-caminata", "mode": "Caminata", "label": "Caminata", "duration": "25 min", "cost": "$0"}
       ]},
    ],
    "alternatives": [
      {"label": "Si NO van a Edelweiss", "description": "Mañana Museo del Oro (reabre martes) + Cinemateca + encuentros amigos", "placeIds": ["museo-oro", "cinemateca"]},
    ]
  },
  {
    "day": 8,
    "date": "22 julio 2026",
    "weekday": "Miércoles",
    "title": "Salida · Vuelo de Regreso (5:00 a.m.)",
    "subtitle": "Traslado al aeropuerto El Dorado",
    "estimatedCost": "$60-95k",
    "plan": [
      {"id": "d8-1", "time": "3:30 AM", "type": "espera", "placeId": "alojamiento", "activity": "Despertador. Ducha, revisión maletas, checkout."},
      {"id": "d8-2", "time": "4:00 AM", "type": "info", "placeId": "alojamiento", "activity": "Taxi en puerta. Taxis Libres WhatsApp +57 310 2111111 (reservar martes 21)."},
      {"id": "d8-3", "time": "4:00-4:40", "type": "movilidad", "fromPlaceId": "alojamiento", "toPlaceId": "aeropuerto", "isMovement": True, "activity": "Taxi Calle 94 → Aeropuerto (madrugada)",
       "transportAlternatives": [
         {"id": "d8-3-taxi", "mode": "Taxi", "label": "Taxi oficial (reservado)", "duration": "25-40 min", "cost": "$35.000-50.000", "notes": "TM NO opera antes de 4am. Reservar con 24h anticipación.", "isRecommended": True},
         {"id": "d8-3-uber", "mode": "Uber", "label": "Uber / Cabify", "duration": "25-40 min", "cost": "$30.000-45.000", "notes": "Disponibilidad limitada de madrugada."}
       ]},
      {"id": "d8-4", "time": "4:40 AM", "type": "info", "placeId": "aeropuerto", "activity": "Llegada Aeropuerto El Dorado. Check-in 3h antes del vuelo."},
      {"id": "d8-5", "time": "5:00 AM", "type": "info", "placeId": "aeropuerto", "activity": "Vuelo de regreso. Fin del viaje."},
    ]
  }
]

# Generate TypeScript
lines = ["export const dayPlans: DayPlan[] = ["]
for day in days:
    lines.append("  {")
    lines.append(f"    day: {day['day']},")
    lines.append(f"    date: '{day['date']}',")
    lines.append(f"    weekday: '{day['weekday']}',")
    lines.append(f"    title: '{day['title']}',")
    lines.append(f"    subtitle: '{day['subtitle']}',")
    if day.get('isFeriado'):
        lines.append("    isFeriado: true,")
    if day.get('isRestriccionMedica'):
        lines.append("    isRestriccionMedica: true,")
    lines.append("    plan: [")
    for step in day['plan']:
        parts = [f"      {{ id: '{step['id']}', time: '{step['time']}', type: '{step['type']}'"]
        if 'placeId' in step:
            parts.append(f", placeId: '{step['placeId']}'")
        if 'fromPlaceId' in step:
            parts.append(f", fromPlaceId: '{step['fromPlaceId']}'")
        if 'toPlaceId' in step:
            parts.append(f", toPlaceId: '{step['toPlaceId']}'")
        if 'isMovement' in step and step['isMovement']:
            parts.append(", isMovement: true")
        if 'transportMode' in step:
            parts.append(f", transportMode: '{step['transportMode']}'")
            parts.append(f", transportDuration: '{step['transportDuration']}'")
            parts.append(f", transportCost: '{step['transportCost']}'")
            if 'transportNotes' in step:
                # Escape single quotes in notes
                tn = step['transportNotes'].replace("'", "\\'")
                parts.append(f", transportNotes: '{tn}'")
        if 'transportAlternatives' in step:
            parts.append(", transportAlternatives: [")
            for alt in step['transportAlternatives']:
                alt_parts = [f"        {{ id: '{alt['id']}', mode: '{alt['mode']}', label: '{alt['label']}', duration: '{alt['duration']}', cost: '{alt['cost']}'"]
                if 'notes' in alt:
                    an = alt['notes'].replace("'", "\\'")
                    alt_parts.append(f", notes: '{an}'")
                if alt.get('isRecommended'):
                    alt_parts.append(", isRecommended: true")
                alt_parts.append(" }")
                parts.append("".join(alt_parts) + ",")
            parts.append("      ]")
        # activity - escape quotes
        act = step['activity'].replace("'", "\\'")
        parts.append(f", activity: '{act}'")
        if 'notes' in step:
            n = step['notes'].replace("'", "\\'")
            parts.append(f", notes: '{n}'")
        parts.append(" },")
        lines.append("".join(parts))
    lines.append("    ],")
    if 'alternatives' in day:
        lines.append("    alternatives: [")
        for alt in day['alternatives']:
            desc = alt['description'].replace("'", "\\'")
            label = alt['label'].replace("'", "\\'")
            pids = ", ".join([f"'{p}'" for p in alt['placeIds']])
            lines.append(f"      {{ label: '{label}', description: '{desc}', placeIds: [{pids}] }},")
        lines.append("    ],")
    lines.append(f"    estimatedCost: '{day['estimatedCost']}',")
    lines.append("  },")
lines.append("];")
lines.append("")

result = "\n".join(lines)

with open('/tmp/new_dayplans.ts', 'w', encoding='utf-8') as f:
    f.write(result)

print(f"Generated {len(lines)} lines for {len(days)} days")
print(f"File: /tmp/new_dayplans.ts")
