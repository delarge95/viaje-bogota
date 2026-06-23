// Bogotá Travel Guide - Master Data
// All data extracted from the Plan Maestro PDF v3
// 8 days, 25+ sites, restaurants with alternatives, transport, contacts

export type LatLng = [number, number];

export type PlaceCategory =
  | 'alojamiento'
  | 'cultura'
  | 'naturaleza'
  | 'restaurante'
  | 'mercado'
  | 'transporte'
  | 'compras';

export type RestaurantCategory =
  | 'aleman'
  | 'taqueria'
  | 'lechona'
  | 'chiguiro'
  | 'tipica'
  | 'italiana'
  | 'mercado';

export interface MenuItem {
  name: string;
  description: string;
  price: string;
}

export interface MenuSection {
  title: string;
  items: MenuItem[];
}

export interface Place {
  id: string;
  name: string;
  category: PlaceCategory;
  restaurantCategory?: RestaurantCategory;
  coords: LatLng;
  address: string;
  phone?: string;
  whatsapp?: string;
  web?: string;
  instagram?: string;
  hours?: string;
  notes?: string;
  priceRange?: string;
  rating?: { score: number; reviews: number; source: string };
  meetsCriteria?: boolean; // >1k reviews Google, >=4/5
  menu?: MenuSection[];
  images?: string[];
  isAlternative?: boolean;
  isBase?: boolean; // Alojamiento
  googleMapsUrl?: string;
}

export type TransportMode = 'TM' | 'SITP' | 'Uber' | 'Cabify' | 'Carro' | 'Caminata' | 'Tren' | 'Taxi' | 'Teleferico' | 'Espera' | 'Interno';

export type StepType = 'movilidad' | 'actividad' | 'compra' | 'comida' | 'espera' | 'info';

export interface TransportAlternative {
  id: string;
  mode: TransportMode;
  label: string;          // e.g. "TransMilenio", "Uber", "Caminata"
  duration: string;       // e.g. "45 min"
  cost: string;           // e.g. "$3.550 c/u" or "$25-35k"
  notes?: string;         // route tips
  isRecommended?: boolean; // default selection
}

export interface RouteSegment {
  from: string;
  to: string;
  mode: TransportMode;
  duration: string;
  cost: string;
  notes?: string;
}

export interface PlanStep {
  id: string;
  time: string;
  type: StepType;             // movilidad, actividad, compra, comida, espera, info
  placeId?: string;
  fromPlaceId?: string;
  toPlaceId?: string;
  transportMode?: TransportMode;
  transportDuration?: string;
  transportCost?: string;
  transportNotes?: string;
  // Alternativas de transporte paralelas (para trayectos largos)
  transportAlternatives?: TransportAlternative[];
  // Alternativa seleccionada (id del TransportAlternative)
  selectedTransportId?: string;
  activity: string;
  notes?: string;
  isMovement?: boolean;
}

export interface DayPlan {
  day: number;
  date: string;
  weekday: string;
  title: string;
  subtitle: string;
  isFeriado?: boolean;
  isRestriccionMedica?: boolean;
  plan: PlanStep[];
  alternatives?: {
    label: string;
    description: string;
    placeIds: string[];
  }[];
  estimatedCost: string;
}

export interface CustomPlan {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  basedOnDay?: number;
  steps: PlanStep[];
  estimatedCost?: string;
}

// ============ PLACES DATABASE ============
// Coords are approximate [lat, lng] for Bogotá

export const places: Place[] = [
  // === ALOJAMIENTO ===
  {
    id: 'alojamiento',
    name: 'Alojamiento Calle 94',
    category: 'alojamiento',
    isBase: true,
    coords: [4.6760, -74.0520],
    address: 'Calle 94 # 15, Chicó, Bogotá',
    notes: 'Base del viaje. Zona norte, cerca a Parque de la 93, Zona T, Andino. Estación TM más cercana: Calle 100 - Marketmedios (troncal B, 600m por puente peatonal).',
  },

  // === TRANSPORTE ===
  {
    id: 'aeropuerto',
    name: 'Aeropuerto El Dorado',
    category: 'transporte',
    coords: [4.7016, -74.1469],
    address: 'Av. El Dorado, Bogotá',
    notes: 'Llegada mié 15 10am, salida mié 22 5am. Taxi oficial $35-50k. Uber $30-45k (caminar a Av El Dorado). TM M86/K86 $3.550 (con transbordo).',
    web: 'https://eldorado.aero',
  },
  {
    id: 'estacion-usaquen',
    name: 'Estación Usaquén (Tren)',
    category: 'transporte',
    coords: [4.6929, -74.0300],
    address: 'Av. Cra 9 #110-08, Bogotá',
    notes: 'Estación del Tren de la Sabana. Salida 9:15 AM sáb/dom/festivos. Más cercana a Calle 94 (15-20 min Uber $12-18k).',
    web: 'https://turistren.com.co',
  },
  {
    id: 'cc-gran-estacion',
    name: 'CC Gran Estación (Tren)',
    category: 'transporte',
    coords: [4.6536, -74.0910],
    address: 'Cra 66 con Cl 25/26, Bogotá',
    notes: 'Salida Tren Sabana 8:45 AM sáb/dom/festivos. Estacionamiento del tren turístico.',
    web: 'https://turistren.com.co',
  },

  // === SITIOS CULTURALES ===
  {
    id: 'planetario',
    name: 'Planetario de Bogotá',
    category: 'cultura',
    coords: [4.6718, -74.0650],
    address: 'Calle 26B # 5-93, Bogotá (La Candelaria)',
    phone: '+57 601 379 5750 ext. 9104/9105',
    email: 'informacion.planetariodebogota@idartes.gov.co',
    web: 'https://www.planetariodebogota.gov.co/',
    instagram: '@planetariobog',
    hours: 'Taquilla: mar-dom 10:30am-5pm (sáb hasta 6pm). Shows en domo: mar-jue 9am-6:30pm; vie-sáb 9am-8pm; dom-fest 9am-6:30pm.',
    notes: 'Shows láser: Michael Jackson martes, Soda Stereo miércoles, Pink Floyd jueves, Universo Cerati (6pm). Verificar cartelera julio 2026. Comprar por Tuboleta. NO recomendado con pupilas dilatadas.',
    priceRange: 'General $23.500 · Estudiante $19.000 · Show láser $14.000',
    web: 'https://www.planetariodebogota.gov.co/',
  },
  {
    id: 'cinemateca',
    name: 'Cinemateca de Bogotá',
    category: 'cultura',
    coords: [4.6005, -74.0716],
    address: 'Carrera 3 # 19-10, Bogotá (Parque de los Periodistas)',
    phone: '+57 601 379 5750 ext. 4504',
    web: 'https://cinematecadebogota.gov.co/',
    instagram: '@cinematecabta',
    hours: 'Oficinas L-V 8am-4pm. Salas: función vespertina/nocturna mar-dom. Taquilla abre 1h antes.',
    notes: 'Entrada libre a muchas proyecciones. Eventos especiales $5.000-$15.000. Franja Cinema Local desde $6.000.',
    priceRange: 'Libre - $15.000',
  },
  {
    id: 'jbb',
    name: 'Jardín Botánico "José Celestino Mutis"',
    category: 'naturaleza',
    coords: [4.6705, -74.1066],
    address: 'Av. Calle 63 # 68-95, Bogotá (Engativá)',
    phone: '+57 601 437 7060 ext. 1000',
    web: 'https://www.jbb.gov.co/',
    instagram: '@jardinbotanicodebogota',
    hours: 'Mar-vie 8am-5pm · Sáb, dom y festivos 9am-5pm. Lunes hábil: cerrado. Si lunes es festivo, martes siguiente cierra.',
    notes: '⚠️ Abre lun 20 julio (festivo). CIERRA mar 21 julio (mantenimiento post-festivo). NO requiere reserva. Compra en taquilla el día.',
    priceRange: 'Nacional $6.600 · Tropicario $12.200 · Combo $15.600',
  },
  {
    id: 'cementerio',
    name: 'Cementerio Central de Bogotá',
    category: 'cultura',
    coords: [4.6198, -74.0800],
    address: 'Carrera 20 entre Calles 24 y 37, Bogotá (Santa Fe)',
    phone: 'UAESP: +57 601 381 3000 · IDPC: +57 601 355 0800',
    web: 'https://idpc.gov.co/',
    notes: 'Tour oficial UAESP+IDT solo Oct-Dic (NO julio 2026). Tour privado Etnias Andantes WhatsApp +57 320 287 5066 con 2-3 sem anticipación. Visita diurna autoguiada GRATIS.',
    priceRange: 'Visita diurna gratis · Tour Etnias consultar',
    web: 'https://idpc.gov.co/',
  },
  {
    id: 'monserrate',
    name: 'Cerro de Monserrate',
    category: 'naturaleza',
    coords: [4.6047, -74.0557],
    address: 'Carrera 2 Este # 21-48, Paseo Bolívar, Bogotá',
    phone: '+57 601 7470190 / +57 601 2845700',
    web: 'https://monserrate.co/es',
    instagram: '@cerromonserrate',
    hours: 'Teleférico L-sáb 6:30am-10pm. Domingos 5:30am-5pm. Festivos 6:30am-5pm (incluye lun 20 julio). Sendero peatonal cerrado martes.',
    notes: 'Restaurantes cima: Casa San Isidro (francesa, +57 315 253 9963), Casa Santa Clara (colombiana), Café Bistró (casual). Reservas: reservas@restaurantesmonserrate.com / WhatsApp +57 317 3317148.',
    priceRange: 'Teleférico L-sáb $35.000 · Domingos $21.000 (tarifa especial)',
  },
  {
    id: 'museo-oro',
    name: 'Museo del Oro (BanRep)',
    category: 'cultura',
    coords: [4.6028, -74.0721],
    address: 'Carrera 6 # 15-88, Bogotá (Parque de Santander)',
    phone: '+57 601 343 2222',
    web: 'https://www.banrepcultural.org/bogota/museo-del-oro',
    instagram: '@museodeloro',
    hours: 'Lunes CERRADO (incluidos lunes festivos → NO abre lun 20 julio). Mar-sáb 9am-7pm. Dom y festivos 10am-5pm.',
    notes: 'Domingos: entrada GRATUITA. Mar-sáb $5.000. Audioguía $8.000. Casilleros piso 2. Sin flash. 2-3 horas de visita.',
    priceRange: 'Mar-sáb $5.000 · Domingos GRATIS',
  },
  {
    id: 'parque-sb',
    name: 'Parque Simón Bolívar',
    category: 'naturaleza',
    coords: [4.6580, -74.0930],
    address: 'Calle 63 y 53, entre Cra 48 y 68, Bogotá',
    phone: 'IDRD: +57 601 660 5400',
    web: 'https://www.idrd.gov.co/parques-y-escenarios/parque-simon-bolivar',
    instagram: '@idrdbogota',
    hours: 'L-D 6am-6pm. Festivos 6am-6pm (incluye lun 20 julio).',
    notes: 'Entrada GRATUITA. Lago, alquiler lanchas $8.000, Plaza de Eventos, Biblioteca Virgilio Barco (Salmona, gratis). Ciclovía domingos y festivos 7am-2pm.',
    priceRange: 'GRATIS',
  },
  {
    id: 'unal',
    name: 'Universidad Nacional (Nacho)',
    category: 'cultura',
    coords: [4.6380, -74.0850],
    address: 'Carrera 45 # 26-85, Edificio Uriel Gutiérrez, Bogotá',
    phone: 'PBX +57 601 316 5000',
    web: 'https://bogota.unal.edu.co/',
    instagram: '@bogotaunal',
    notes: 'Política "campus abierto": visitantes externos con cédula/pasaporte en portería, sin invitación. Portería Cra 45 (peatonal principal, 5 min estación TM). Museo Arquitectura Leopoldo Rother L-V 8am-5pm, sáb 8am-12m. Comedor "Chucho León" reabrió sep-2025 (confirmar acceso externos).',
    priceRange: 'GRATIS',
  },

  // === RESTAURANTES PRINCIPALES ===
  {
    id: 'vitto',
    name: 'Vitto Restaurante',
    category: 'restaurante',
    restaurantCategory: 'italiana',
    coords: [4.6469, -74.0580],
    address: 'Calle 69 # 4-97, Bogotá (Zona G, NO Zona Rosa)',
    whatsapp: '+57 310 309 9727',
    web: 'https://grupolegrand.com/restaurantes/vitto-4',
    instagram: '@vitto_bogota',
    hours: 'L-Mi 12m-10pm · J-S 12m-11pm · D y festivos 12m-9pm',
    notes: 'Reservas por WhatsApp con 24h anticipación. Grupo Le Grand. NO confundir con Zona Rosa.',
    priceRange: '$35.000 - $80.000 por persona',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Vitto+Restaurante+Calle+69+4-97+Bogota',
    menu: [
      {
        title: 'ENTRADAS & PICOTEOS',
        items: [
          { name: 'Bastones de Muzzarella', description: 'colchón de fileto, crujientes de jamón', price: '$15.600' },
          { name: 'Bubba Shrimps', description: 'apanados, salsa mil islas, alioli, habanero', price: '$20.000' },
          { name: 'Burrata', description: 'rúcula, tomates cherry, almendras, prosciutto', price: '$28.000' },
          { name: 'Rabas (250g)', description: 'anillos de calamar apanados panko', price: '$15.000' },
          { name: 'Ceviche de Lenguado (200g)', description: 'leche de tigre, cilantro, limón, ají', price: '$13.000' },
          { name: 'Provoleta Grillada', description: 'provolone, frijoles, tomates confitados, focaccia', price: '$17.900' },
        ],
      },
      {
        title: 'RISSOTTOS (ARROCES)',
        items: [
          { name: 'Risso al Funghi', description: 'carnaroli, mix hongos, portobellos, pechuga', price: '$19.000' },
          { name: 'Risso di Zucca', description: 'calabaza asada, queso azul', price: '$17.000' },
        ],
      },
      {
        title: 'PASTAS ARTESANALES',
        items: [
          { name: 'Raviolones Vitto', description: 'pasta entintada, salmón, camarones, cúrcuma', price: '$30.500' },
          { name: 'Raviol Caprese', description: 'mozzarella, tomate, albahaca, cuatro quesos', price: '$26.800' },
          { name: 'Sorrentinos de Espinaca', description: 'salsa rosa', price: '$23.800' },
        ],
      },
      {
        title: 'CORTES A LA PARRILLA',
        items: [
          { name: 'Pechuga de Pollo (300g)', description: 'corte magro grillado', price: '$19.800' },
          { name: 'Lomo filet (300g)', description: 'corte de res a la parrilla', price: '$31.500' },
          { name: 'Ojo de Bife (350g)', description: 'reducción vino tinto, cinco especias, sriracha', price: '$31.500' },
        ],
      },
      {
        title: 'OPCIONES DEL MAR',
        items: [
          { name: 'Trucha Grillada', description: 'puré de zapallo, semillas tostadas', price: '$33.500' },
          { name: 'Salmón Grillado (250g)', description: 'salsa Meuniere (mantequilla, limón, alcaparras)', price: '$43.500' },
          { name: 'Lenguado en Costra', description: 'gremolata, papas andinas', price: '$24.500' },
        ],
      },
      {
        title: 'POSTRES',
        items: [
          { name: 'Lingote Supremo', description: 'marquise de chocolate, crema Bariloche', price: '$12.000' },
          { name: 'Tiramisú di la Nonna', description: 'receta de la abuela', price: '$9.500' },
          { name: 'Suspiro Limeño', description: 'postre peruano tradicional', price: '$9.500' },
        ],
      },
    ],
  },
  {
    id: 'la-puerta-falsa',
    name: 'La Puerta Falsa',
    category: 'restaurante',
    restaurantCategory: 'tipica',
    coords: [4.5981, -74.0721],
    address: 'Calle 11 # 6-50, Bogotá (La Candelaria, junto a Catedral)',
    whatsapp: 'wa.me/message/HA7G24OVVLAHP1',
    instagram: '@lapuertafalsa1816',
    hours: 'L-S 7am-9pm · D y festivos 7am-6pm',
    notes: 'Restaurante más antiguo de Colombia (1816, 210 años). Recomendado por Anthony Bourdain y TasteAtlas (top 100 del mundo). NO acepta reservas. Fila 15-45 min.',
    priceRange: '$15.000 - $50.000 por persona',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=La+Puerta+Falsa+Calle+11+6-50+Bogota',
    menu: [
      {
        title: 'PLATOS TÍPICOS SANTAFEREÑOS',
        items: [
          { name: 'Ajiaco Santafereño', description: '3 papas, pollo, guascas, mazorca, alcaparras, aguacate, crema', price: '$38.000-40.000' },
          { name: 'Tamal Tolimense', description: 'arroz, harina de maíz, pollo, cerdo, huevo, envuelto en hoja', price: '$9.000-16.000' },
          { name: 'Chocolate Santafereño Completo', description: 'chocolate caliente, queso, pan, almojábana', price: '$9.000-17.000' },
          { name: 'Changua Bogotana', description: 'caldo de leche con huevo, calado, cilantro', price: '$8.000-12.000' },
        ],
      },
      {
        title: 'DULCES TÍPICOS',
        items: [
          { name: 'Cocadas', description: 'dulce de coco tradicional', price: '$3.000-5.000' },
          { name: 'Brevas con Arequipe', description: 'brevas, dulce de leche', price: '$5.000-8.000' },
          { name: 'Arroz con Leche', description: 'postre tradicional colombiano', price: '$4.000-7.000' },
          { name: 'Natas', description: 'postre lácteo bogotano', price: '$4.000-6.000' },
        ],
      },
    ],
  },
  {
    id: 'la-puerta-catedral',
    name: 'La Puerta de la Catedral',
    category: 'restaurante',
    restaurantCategory: 'tipica',
    coords: [4.5982, -74.0725],
    address: 'Calle 11 # 6-26, Bogotá (a 30m de La Puerta Falsa)',
    web: 'https://www.lapuertadelacatedral.com/',
    instagram: '@lapuertadelacatedral',
    hours: 'L-S 7am-7:30pm · D y festivos 7am-6pm',
    notes: 'Más variedad que La Puerta Falsa. Sí aceptan reservas (WhatsApp/Instagram, web en mantenimiento). Calificación Degusta 4.3/5.',
    priceRange: '$40.000 - $120.000 por persona (promedio $86.300)',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=La+Puerta+de+la+Catedral+Calle+11+6-26+Bogota',
    menu: [
      {
        title: 'SOPAS Y CALDOS',
        items: [
          { name: 'Ajiaco Santafereño', description: '3 papas, pollo, guascas, mazorca, alcaparras, aguacate, crema', price: '$38.000' },
          { name: 'Sopa de Mondongo', description: 'con arroz y aguacate', price: '$38.000' },
        ],
      },
      {
        title: 'CARNES',
        items: [
          { name: 'T-Bone Steak', description: 'corte de res premium', price: '$94.000' },
          { name: 'Sobrebarriga (350g)', description: 'arroz, aguacate, papa, yuca al vapor', price: '$56.000' },
          { name: 'Lomo de Res (300g)', description: 'ensalada, papas criollas, arepa boyacense', price: '$64.000' },
          { name: 'Costillas de Cerdo (350g)', description: 'papas criollas, plátano, guacamole, arroz', price: '$56.000' },
        ],
      },
      {
        title: 'PLATOS COLOMBIANOS',
        items: [
          { name: 'Bandeja Paisa', description: 'frijol, carne molida, chorizo, chicharrón, morcilla, arroz, huevo, plátano, aguacate, arepa', price: '$48.000' },
          { name: 'Frijolada Paisa', description: 'sin arroz-huevo extra', price: '$46.000' },
          { name: 'Frijoles con Pezuña', description: 'plato tradicional económico', price: '$36.000' },
        ],
      },
      {
        title: 'POLLO Y PESCADO',
        items: [
          { name: 'Pechuga de Pollo Gratinada', description: 'con camarón y champiñón', price: '$54.000' },
          { name: 'Pechuga de Pollo a la Plancha', description: '—', price: '$45.000' },
          { name: 'Pargo Rojo (900-1000g)', description: 'papas francesas, patacón', price: '$130.000' },
        ],
      },
    ],
  },
  {
    id: 'edelweiss',
    name: 'Edelweiss (Cajicá)',
    category: 'restaurante',
    restaurantCategory: 'aleman',
    coords: [4.9180, -74.0290],
    address: 'Km 1 vía Cajicá – Zipaquirá, Cundinamarca',
    whatsapp: '+57 311 541 1241',
    phone: '+57 1 883 1212',
    email: 'info@edelweisscajica.com',
    instagram: '@edelweisscajica',
    web: 'https://www.edelweisscajica.com',
    hours: 'Abre martes a domingo (CIERRA lunes). Excepción: "Lunes festivo abierto" — si un lunes es festivo, abren. Mié-Jue 1-4pm, Vie 1-8pm, Sáb 12m-6pm, Dom 12m-6pm',
    notes: 'Reservas preferibles (Degusta). Cervecería propia Ley Pureza Alemana 1516 (verificar activa al reservar). 45-60 min desde Calle 94. WhatsApp +57 311 541 1241.',
    priceRange: '$35.000 - $70.000 por persona (promedio Degusta $38.900)',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Edelweiss+Cajica+Cundinamarca',
    menu: [
      {
        title: 'PLATOS ALEMANES DESTACADOS',
        items: [
          { name: 'Codillo de Cerdo (Schweinshaxe)', description: 'cerdo asado lento, chucrut, nudo crocante, ensalada de papa', price: '$45.000-60.000' },
          { name: 'Stammtisch', description: '3 salchichas: Thüringer, ternera, campesina + ensalada de papa + jamón curado', price: '$40.000-55.000' },
          { name: 'Salchicha Suiza / Weisswurst', description: 'salchicha tradicional bávara', price: '$25.000-35.000' },
          { name: 'Lomo de Res', description: 'corte alemán con guarnición', price: '$40.000-55.000' },
          { name: 'Pretzel Bávaro', description: 'pan tradicional alemán', price: '$8.000-15.000' },
          { name: 'Sauerkraut (chucrut)', description: 'col fermentada tradicional', price: '$10.000-15.000' },
          { name: 'Strudel de Manzana', description: 'postre tradicional alemán', price: '$15.000-22.000' },
        ],
      },
      {
        title: 'BEBIDAS (CONFIRMAR DISPONIBILIDAD)',
        items: [
          { name: 'Cervezas Artesanales Casa', description: 'Ley Pureza Alemana 1516 (verificar si sigue activa)', price: '$12.000-18.000' },
          { name: 'Cervezas Importadas Alemanas', description: 'variedad de marcas', price: '$10.000-20.000' },
        ],
      },
    ],
  },
  {
    id: 'chiguiro-parrilla',
    name: 'Chigüiro Parrilla Bar',
    category: 'restaurante',
    restaurantCategory: 'chiguiro',
    coords: [4.6710, -74.0800],
    address: 'Carrera 70 # 55-97, Normandía, Bogotá (5-10 min taxi JBB)',
    whatsapp: '+57 314 220 1925',
    phone: '+57 601 416 4093',
    instagram: '@chiguiroparrillabar',
    hours: 'Rappi indica apertura 11:30 a.m. Confirmar por WhatsApp antes de ir.',
    notes: 'Cerca del Jardín Botánico. Ambiente familiar, económico. Servicio domicilio Rappi/WhatsApp.',
    priceRange: '$25.000 - $50.000 por persona',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Chiguiro+Parrilla+Bar+Carrera+70+55-97+Normandia+Bogota',
    menu: [
      {
        title: 'CHIGÜIRO Y CARNE LLANERA',
        items: [
          { name: 'Carne de Chigüiro', description: 'con papa, plátano, arepa boyacense, guacamole', price: '$43.200' },
          { name: 'Picada llanera con chigüiro y costilla', description: 'para compartir', price: 'desde $34.000/persona' },
          { name: 'Costillas BBQ', description: 'papa criolla, arroz, arepa', price: 'consultar' },
          { name: 'Taza de ajiaco (entrada)', description: '—', price: '$12.000' },
        ],
      },
    ],
  },
  {
    id: 'chiguire-53',
    name: 'Asadero Chigüire 53',
    category: 'restaurante',
    restaurantCategory: 'chiguiro',
    coords: [4.6490, -74.0700],
    address: 'Calle 53 # 16-74, Teusaquillo, Bogotá (10 min taxi UNAL)',
    instagram: '@chiguire53',
    hours: 'Apertura 11:30 a.m. (Rappi). Cierre no confirmado.',
    notes: 'Cerca de Universidad Nacional. 20 años de tradición. Atienden eventos (trompo, barril).',
    priceRange: '$30.000 - $55.000 por persona',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Asadero+Chiguire+53+Calle+53+16-74+Teusaquillo+Bogota',
    menu: [
      {
        title: 'CHIGÜIRO Y CARNE LLANERA',
        items: [
          { name: 'Chigüiro', description: 'con papa, plátano, arepa boyacense, guacamole', price: '$43.200' },
          { name: 'Baby Beef', description: '—', price: '$51.044' },
          { name: 'Costillas, chorizo, pollo, picadas llaneras', description: 'variedad', price: 'consultar' },
        ],
      },
    ],
  },
  {
    id: 'andres-chia',
    name: 'Andrés Carne de Res Chía',
    category: 'restaurante',
    restaurantCategory: 'tipica',
    coords: [4.8510, -74.0480],
    address: 'Calle 3 # 11A-56, Chía, Cundinamarca',
    phone: '+57 601 861 2233 opción 1 / +57 315 355 9096',
    web: 'https://www.andrescarnederes.com',
    instagram: '@andres_c_de_res',
    hours: 'Mié-Dom 12m-10pm. CIERRA lunes y martes (excepto lunes festivos).',
    notes: '10-15 min en carro desde Edelweiss. Cover $60.000 solo en eventos especiales. Reservas recomendadas (máx 6 personas/mesa, 15 min tolerancia, 2h estadía).',
    priceRange: '$60.000 - $150.000+ por persona',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Andres+Carne+de+Res+Chia+Calle+3+11A-56+Chia',
  },
  {
    id: 'paloquemao',
    name: 'Plaza de Mercado Paloquemao',
    category: 'mercado',
    restaurantCategory: 'mercado',
    coords: [4.6190, -74.0850],
    address: 'Av. Calle 19 # 25-04, Bogotá (Los Mártires)',
    phone: '+57 601 742 6664',
    email: 'atencionalcliente@plazadepaloquemao.com',
    web: 'https://plazadepaloquemao.com/',
    instagram: '@plazadepaloquemao',
    hours: 'L-S 4:30am-4:30pm · D y festivos 5am-4:30pm (web) / 5am-2:30pm (Instagram/VisitBogotá). Asumir cierre 2:30pm domingos. Mercado de Flores (Av 19 #25-02): domingos desde 3:30am.',
    notes: 'Entrada GRATUITA. Parqueo propio $5-10k. Llevar efectivo billetes pequeños. 67 locales. Plan domingo con Huevito en carro 7:30-8am. El Palacio del Jugo (Local 80013) NO abre domingos.',
    priceRange: 'Plan completo 2 pers: $100-210k · Mínimo: $50-80k',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Plaza+de+Mercado+Paloquemao+Av+Calle+19+25-04+Bogota',
    menu: [
      {
        title: 'LOCALES DESTACADOS',
        items: [
          { name: 'Lechonería Doña Rosalba (Local 80228)', description: 'lechona tolimense, 50 años tradición', price: '$12-15k porción' },
          { name: 'El Palacio del Jugo (Local 80013)', description: 'jugos naturales de frutas exóticas (NO abre domingos)', price: '$4-8k' },
          { name: 'Especias para Colombia (Local 81102)', description: 'tés, especias, infusiones (abre domingos 8am-3pm)', price: 'variable' },
          { name: 'Mercado Floral Colombia (Local 87056)', description: 'flores mayorista y detalle', price: 'variable' },
          { name: 'Empanadas Don Camilo (Local 80074)', description: 'empanadas', price: '$3-5k c/u' },
          { name: 'Donde Coca (Local 80138)', description: 'cocina tradicional colombiana', price: '$10-18k' },
        ],
      },
    ],
  },
  {
    id: 'lechoneria-dona-rosalba',
    name: 'Lechonería Doña Rosalba',
    category: 'restaurante',
    restaurantCategory: 'lechona',
    coords: [4.6188, -74.0848],
    address: 'Local 80228, Plaza de Mercado Paloquemao, Av. Calle 19 # 25-04, Bogotá',
    phone: '310 629 1837 / 310 258 9581 (tamales con anticipación)',
    instagram: '@lechoneria_dona_rosalba',
    hours: 'L-S 07:00-16:00 · D y Festivos 07:00-14:00 (abre festivos 20 julio)',
    notes: '50 años de tradición en Paloquemao. Lechona bogotana (con arroz) vs tolimense (sin arroz): preguntar opción disponible. Pedido de tamales requiere anticipación (llamar 3102589581 o 3106291837). Llevar efectivo en billetes pequeños.',
    priceRange: '$15.000 - $30.000 por persona',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Lechoneria+Dona+Rosalba+Paloquemao+Bogota',
    menu: [
      {
        title: 'LECHONA Y TAMALES TOLIMENSES',
        items: [
          { name: 'Lechona bogotana (con arroz) por libra', description: 'cerdo relleno de arroz y arveja, cuerito crocante', price: 'consultar (~$20-25k/libra)' },
          { name: 'Lechona tolimense (sin arroz)', description: 'receta tradicional del Tolima', price: 'consultar' },
          { name: 'Porción individual de lechona', description: 'con arepa y cuero', price: '$12.000-15.000' },
          { name: 'Tamal tolimense', description: 'pedir con anticipación', price: '$8.000-12.000' },
          { name: 'Mixto Especial (Tamal + Lechona 850g + Arepa)', description: 'combo tradicional', price: '$16.000' },
          { name: 'Mixto Corriente (Tamal + Lechona 600g)', description: 'combo económico', price: '$12.000' },
        ],
      },
      {
        title: 'BEBIDAS',
        items: [
          { name: 'Gaseosas (Postobón/Hit)', description: 'varios tamaños', price: '$3.000-8.000' },
        ],
      },
    ],
  },
  {
    id: 'taqueria-huevito',
    name: 'Taquería de Huevito',
    category: 'restaurante',
    restaurantCategory: 'taqueria',
    coords: [4.6765, -74.0510],
    address: 'Calle 90 con Carrera 11, plazoleta de comidas (a 5 min caminando de Calle 94)',
    notes: 'Taquería operada por el amigo "Huevito". NO se encontró info pública verificada. Confirmar con Huevito: nombre exacto, horarios, si atiende público general. Plan ideal encuentro social con Huevito y amigos.',
    priceRange: 'Ronda compartida $40-80k (2 pers, luego cada quien)',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Calle+90+con+Carrera+11+Plazoleta+Comidas+Bogota',
  },

  // === ALTERNATIVAS ALEMÁN ===
  {
    id: 'alt-harald',
    name: 'Restaurante Alemán Harald',
    category: 'restaurante',
    restaurantCategory: 'aleman',
    isAlternative: true,
    coords: [4.7030, -74.0410],
    address: 'Calle 116 #70C-68, Av. Pepe Sierra, Bogotá (Suba/Cedritos)',
    whatsapp: '+57 316 430 4825',
    instagram: '@haraldbogota',
    web: 'https://www.degusta.com.co/bogota/restaurante/harald_100526.html',
    hours: 'Confirmar por WhatsApp. Típicamente almuerzo-cena martes a domingo (cerrar lunes).',
    notes: '35 años tradición. ÚNICO restaurante alemán especializado en codillo Schweinshaxe en Bogotá. ⚠️ Campaña #SALVEMOSALRESTAURANTEALEMAN en IG 2024-2026 → confirmar estado operativo.',
    priceRange: '$38.000 - $60.000 por persona (promedio $42.600)',
    rating: { score: 4.6, reviews: 452, source: 'Google Maps (Wanderlog)' },
    meetsCriteria: false,
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Restaurante+Aleman+Harald+Calle+116+70C-68+Bogota',
    menu: [
      {
        title: 'PLATOS ALEMANES DESTACADOS',
        items: [
          { name: 'Codillo Schweinshaxe', description: 'cerdo asado lento, chucrut, nudo crocante, ensalada de papa, bolas de pan', price: '$42.600 (promedio)' },
          { name: '7 tipos de salchichas alemanas', description: 'Thüringer, Weisswurst, Bratwurst, etc.', price: 'consultar carta' },
          { name: '8 tipos de cerveza', description: 'importadas y locales alemanas', price: 'consultar carta' },
        ],
      },
    ],
  },
  {
    id: 'alt-bruder',
    name: 'Bruder Zona T Microcervecería',
    category: 'restaurante',
    restaurantCategory: 'aleman',
    isAlternative: true,
    coords: [4.6680, -74.0520],
    address: 'Calle 83 #12A-11, Zona T, Chapinero, Bogotá',
    whatsapp: '+57 311 640 2262',
    web: 'https://www.bruder.com.co',
    instagram: '@bruder_cerveza',
    hours: 'Típicamente L-J 12-23, V-S 12-02, D 12-21. Confirmar antes de ir.',
    notes: 'Cervecería artesanal con comida alemana-artsanal. 10 min Cabify desde Calle 94. 8 cervezas en barril. Música en vivo algunos días.',
    priceRange: '$30.000 - $60.000 por persona',
    rating: { score: 0, reviews: 0, source: 'DATO NO VERIFICADO' },
    meetsCriteria: false,
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Bruder+Cerveza+Calle+83+12A-11+Zona+T+Bogota',
    menu: [
      {
        title: 'CERVEZAS ARTESANALES (8 EN BARRIL)',
        items: [
          { name: 'IPA', description: 'cerveza india pale ale', price: '$12-18k' },
          { name: 'Wheat Beer de Maracuyá', description: 'cerveza de trigo tropical', price: '$12-18k' },
          { name: 'Cerveza de Chocolate', description: 'stout con cacao', price: '$12-18k' },
          { name: 'Imperial', description: 'cerveza de alta graduación', price: '$14-20k' },
        ],
      },
      {
        title: 'PICADAS Y COMIDA',
        items: [
          { name: 'Picada Bruder', description: 'salchichas, arepas, carnes asadas', price: '$35-55k' },
          { name: 'Hamburguesa Bruder', description: 'mencionada como excelente en reseñas', price: '$20-28k' },
          { name: 'Opciones vegetarianas/veganas', description: 'burgers de lentejas/verduras', price: '$18-25k' },
        ],
      },
    ],
  },

  // === ALTERNATIVAS TAQUERÍA ===
  {
    id: 'alt-la-taqueria',
    name: 'La Taquería (Parque 93)',
    category: 'restaurante',
    restaurantCategory: 'taqueria',
    isAlternative: true,
    coords: [4.6960, -74.0520],
    address: 'Calle 93 #11A-11, Chapinero, Bogotá',
    web: 'https://www.lataqueria.com.co',
    hours: 'L-M 12-21, J-S 12-22, D 12-21',
    notes: '4+ sedes en Bogotá. Especialidad en Birria estilo Jalisco. All You Can Eat $43.900 (solo sede 7 de Agosto Cra 23 #65-66 Piso 2).',
    priceRange: '$25.000 - $50.000 por persona',
    rating: { score: 4.6, reviews: 2112, source: 'Google Maps' },
    meetsCriteria: true,
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=La+Taqueria+Calle+93+11A-11+Bogota',
    menu: [
      {
        title: 'TACOS Y ESPECIALIDADES',
        items: [
          { name: 'Taco individual', description: 'estilo callejero (pastor, pollo, res, birria)', price: '$6.900 c/u' },
          { name: 'Quesabirria', description: 'taco con queso derretido + birria', price: '$28.900' },
          { name: 'Burro (burrito grande)', description: 'gran burrito relleno', price: '$27.900' },
          { name: 'Esquites', description: 'maíz en grano con crema, queso, chile', price: '$13.000' },
          { name: 'All You Can Eat', description: 'solo sede 7 de Agosto (Cra 23 #65-66 Piso 2)', price: '$43.900/persona' },
        ],
      },
    ],
  },
  {
    id: 'alt-renata',
    name: 'Renata Tacos (Cra 14 #85-22)',
    category: 'restaurante',
    restaurantCategory: 'taqueria',
    isAlternative: true,
    coords: [4.6710, -74.0530],
    address: 'Carrera 14 #85-22, Chicó, Bogotá (5 min Cabify Calle 94)',
    phone: '(601) 805 8437',
    web: 'https://renatatacos.com',
    instagram: '@renatatacos',
    hours: 'L-Mar 11:30-21:00. Domicilios vía Rappi.',
    notes: '8 sedes en Bogotá. Taquería de barrio (concepto mexicano). Salsas caseras muy elogiadas. Caja Taquera exclusiva Rappi.',
    priceRange: '$20.000 - $45.000 por persona',
    rating: { score: 4.3, reviews: 1473, source: 'Google Maps' },
    meetsCriteria: true,
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Renata+Tacos+Cra+14+85-22+Bogota',
    menu: [
      {
        title: 'TACOS Y FLAUTAS',
        items: [
          { name: 'Taco Carnitas individual', description: 'con costra (maíz nixtamalizado colombiano)', price: '$5.600 c/u' },
          { name: 'Carnitas (orden)', description: 'varios tacos de carnitas', price: '$16.400' },
          { name: 'Flautas Carnitas', description: 'flautas crujientes rellenas', price: '$36.500' },
          { name: 'Flautas Pollo', description: '—', price: '$25.800' },
          { name: 'Flautas Res / Mixtas', description: '—', price: '$29.500' },
          { name: 'Renachos (nachos casa)', description: 'nachos estilo Renata', price: '$25.800' },
          { name: 'Chorizo Mexicano', description: '—', price: '$23.000' },
          { name: 'Totopos con Guacamole', description: '—', price: '$12.000' },
        ],
      },
      {
        title: 'BEBIDAS',
        items: [
          { name: 'Cerveza Stella Artois', description: '—', price: '$12.500' },
          { name: 'Cerveza Coronita / Mini Budweiser', description: '—', price: '$6.900' },
        ],
      },
    ],
  },
  {
    id: 'alt-insurgentes',
    name: 'Insurgentes Taco Bar (Parque 93)',
    category: 'restaurante',
    restaurantCategory: 'taqueria',
    isAlternative: true,
    coords: [4.6965, -74.0525],
    address: 'Calle 93B #13-91, Parque de la 93, Chapinero, Bogotá',
    whatsapp: '+57 313 867 1730',
    web: 'https://insurgentes.com.co',
    instagram: '@insurgentestacobar',
    hours: 'L-M 12-23 / J-S 12-24 (medianoche) / D 12-21',
    notes: 'Sede adicional: Calle 56 #5-21, Chapinero. ⚠️ Tripadvisor 3.7/5 indica quejas frecuentes sobre servicio. Preferir La Taquería o Renata.',
    priceRange: '$20.000 - $45.000 por persona',
    rating: { score: 3.7, reviews: 98, source: 'Tripadvisor' },
    meetsCriteria: false,
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Insurgentes+Taco+Bar+Calle+93B+13-91+Bogota',
    menu: [
      {
        title: 'TACOS Y COMIDA',
        items: [
          { name: 'Taco al Pastor', description: 'cerdo marinado con chiles guajillo, ancho, morita; salsa de chiles secos, piña, cebolla, cilantro', price: '$7.000 c/u' },
          { name: 'Taco de Zapallo con Frijol Negro', description: 'zapallo al horno, frijol negro refrito, salsa de chiles secos, queso molido', price: '$5.500 c/u' },
          { name: '"Tres leches" postre', description: 'mencionado como Top 4 de Bogotá', price: 'consultar' },
        ],
      },
      {
        title: 'BEBIDAS',
        items: [
          { name: 'Gaseosas (Coca Cola, Quatro, Sprite)', description: '—', price: '$10.000' },
          { name: 'Mezcales y cervezas', description: 'carta amplia de mezcal', price: 'variable' },
        ],
      },
    ],
  },

  // === ALTERNATIVAS LECHONA ===
  {
    id: 'alt-tolimense',
    name: 'El Tolimense Colombian Food',
    category: 'restaurante',
    restaurantCategory: 'lechona',
    isAlternative: true,
    coords: [4.6500, -74.0600],
    address: 'Chapinero, Bogotá (dirección exacta DATO NO VERIFICADO)',
    web: 'https://www.eltolimense.com',
    hours: 'Desayuno, comidas, cenas, brunch. Abierto hasta tarde.',
    notes: 'Slogan: "El verdadero sabor Tolimense". Lechona tolimense original en Chapinero con cerveza artesanal. Contactar antes de ir para confirmar dirección exacta.',
    priceRange: 'DATO NO VERIFICADO',
    rating: { score: 0, reviews: 0, source: 'DATO NO VERIFICADO' },
    meetsCriteria: false,
  },
  {
    id: 'alt-rica-lechona',
    name: 'Rica Lechona',
    category: 'restaurante',
    restaurantCategory: 'lechona',
    isAlternative: true,
    coords: [4.5660, -74.1080],
    address: 'Calle 27 Sur #12J-12, Barrio San José, Rafael Uribe, Bogotá',
    phone: '+57 601 361 8090',
    whatsapp: '+57 315 645 0393',
    web: 'https://www.ricalechona.com',
    instagram: '@ricalechonatolimense',
    hours: '09:00-18:00',
    notes: 'Marca nacional desde 1991 (Pereira, Armenia, Manizales, Cali, Bogotá). ⚠️ NO práctico desde Calle 94 (1+ hora en TM). Mejor opción sigue siendo Doña Rosalba en Paloquemao.',
    priceRange: 'Estimado $15.000-$25.000 por persona',
    rating: { score: 0, reviews: 0, source: 'DATO NO VERIFICADO' },
    meetsCriteria: false,
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Rica+Lechona+Calle+27+Sur+12J-12+Bogota',
  },

  // === ALTERNATIVAS CHIGÜIRO ===
  {
    id: 'alt-rancho-llanero',
    name: 'Rancho Llanero (Gran Estación)',
    category: 'restaurante',
    restaurantCategory: 'chiguiro',
    isAlternative: true,
    coords: [4.6320, -74.1030],
    address: 'Calle 6 #26-99, Local 1-63, CC Gran Estación, Ricaurte, Bogotá',
    instagram: '@asadero.rancho.llanero',
    hours: 'DATO NO VERIFICADO (típicamente L-D 11-22)',
    notes: 'Accesible por TM troncal K (estación CAD). 25-30 min desde Calle 94. Ambiente llanero con música tradicional. Recomendación: reservar fines de semana.',
    priceRange: 'Estimado $35.000-$55.000 por persona',
    rating: { score: 0, reviews: 0, source: 'DATO NO VERIFICADO' },
    meetsCriteria: false,
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Rancho+Llanero+Gran+Estacion+Calle+6+26-99+Bogota',
    menu: [
      {
        title: 'CARNES A LA LLANERA',
        items: [
          { name: 'Carne a la llanera', description: 'cortes llaneros a la parrilla', price: '$35-55k' },
          { name: 'Mamona', description: 'ternera llanera tradicional', price: '$45-65k' },
          { name: 'Costichicharrón crujiente', description: 'especialidad de la casa', price: '$30-45k' },
          { name: 'Picada llanera', description: 'variedad de carnes para compartir', price: '$40-60k' },
          { name: 'Chigüiro a la parrilla', description: '—', price: '$35-50k' },
        ],
      },
    ],
  },
  {
    id: 'alt-llanerada',
    name: 'Llanerada y Carbón',
    category: 'restaurante',
    restaurantCategory: 'chiguiro',
    isAlternative: true,
    coords: [4.6600, -74.0770],
    address: 'Calle 72 #68C-05, barrio Las Ferias, Bogotá (15-20 min Cabify Calle 94)',
    whatsapp: '+57 314 409 4802 / +57 314 405 8429',
    instagram: '@llanerada_carbon',
    hours: 'DATO NO VERIFICADO (típicamente L-D 11-22)',
    notes: 'Sede adicional: Calle 67 #23-46, 7 de Agosto. Recomendado en TikTok/IG. Porciones generosas, precios buenos. Ambiente familiar con música llanera.',
    priceRange: 'Estimado $30.000-$50.000 por persona',
    rating: { score: 0, reviews: 0, source: 'DATO NO VERIFICADO' },
    meetsCriteria: false,
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Llanerada+Carbon+Calle+72+68C-05+Bogota',
    menu: [
      {
        title: 'CARNES LLANERAS',
        items: [
          { name: 'Carne a la llanera con costichicharrón', description: 'especialidad de la casa', price: '$30-50k' },
          { name: 'Chigüiro a la parrilla', description: '—', price: '$30-45k' },
          { name: 'Picada llanera', description: 'para compartir', price: '$35-55k' },
        ],
      },
    ],
  },

  // === ALTERNATIVAS COMIDA TÍPICA ===
  {
    id: 'alt-andres-dc',
    name: 'Andrés D.C. (Zona T)',
    category: 'restaurante',
    restaurantCategory: 'tipica',
    isAlternative: true,
    coords: [4.6680, -74.0500],
    address: 'Calle 82 #11-15, Zona T, Chapinero, Bogotá',
    phone: '+57 315 355 9096 / 601 861 2233 opción 1',
    web: 'https://www.andrescarnederes.com/andres-dc',
    hours: 'Todos los días 09:00-24:00. Domingo brunch desde 9 AM.',
    notes: 'Versión urbana de Andrés Carne de Res Chía. Música en vivo diario. Brunch dominical muy recomendado. Fin de semana sin reservar: 30-60 min espera. Acepta tarjeta. Cover: normalmente NO.',
    priceRange: '$50.000 - $120.000 por persona',
    rating: { score: 4.2, reviews: 12156, source: 'Tripadvisor' },
    meetsCriteria: true,
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Andres+DC+Calle+82+11-15+Bogota',
    menu: [
      {
        title: 'PLATOS COLOMBIANOS',
        items: [
          { name: 'Bandeja Paisa', description: 'frijol, carne, chicharrón, chorizo, morcilla, arroz, huevo, plátano, aguacate, arepa', price: '$45-55k' },
          { name: 'Ajiaco Santafereño', description: '3 papas, pollo, guascas, mazorca, alcaparras, aguacate, crema', price: '$40-50k' },
          { name: 'Chicharrón', description: 'cuerito crocante', price: '$35-45k' },
          { name: 'Carnes asadas, parrilla', description: 'variedad de cortes', price: '$40-80k' },
          { name: 'Brunch dominical', description: 'desde 9 AM', price: 'consultar' },
          { name: 'Coctelería', description: 'herencia de Andrés Carne de Res Chía', price: '$20-40k' },
        ],
      },
    ],
  },
  {
    id: 'alt-casa-vieja',
    name: 'Casa Vieja (Usaquén)',
    category: 'restaurante',
    restaurantCategory: 'tipica',
    isAlternative: true,
    coords: [4.6920, -74.0300],
    address: 'Carrera 6A #117-35, Usaquén, Bogotá',
    phone: '213 3246 / +57 313 870 1809 (WhatsApp)',
    web: 'https://www.casavieja.com.co',
    instagram: '@casaviejacolombia',
    hours: '12:00-18:00 (sede Jiménez). Confirmar sede Usaquén.',
    notes: 'Fundado en 1964 (50+ años). Ambiente "como en casa de la abuela". Domicilios propios + Rappi. Carta: 20 entradas + 25 fuertes + postres.',
    priceRange: '$30.000 - $50.000 por persona',
    rating: { score: 4.3, reviews: 518, source: 'Google Maps (Wanderlog)' },
    meetsCriteria: false,
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Casa+Vieja+Cra+6A+117-35+Usaquen+Bogota',
    menu: [
      {
        title: 'CAZUELAS Y PLATOS COLOMBIANOS',
        items: [
          { name: 'Cazuela de frijoles', description: '—', price: '$30-40k' },
          { name: 'Ajiaco Santafereño', description: '—', price: '$32-42k' },
          { name: 'Bandeja Paisa', description: '—', price: '$35-45k' },
          { name: 'Posta Negra', description: 'carne en salsa oscura', price: '$35-45k' },
          { name: 'Sancocho', description: '—', price: '$30-40k' },
          { name: 'Tamales', description: '—', price: '$12-18k' },
        ],
      },
    ],
  },
  {
    id: 'alt-comp-criolla',
    name: 'Compañía Criolla (Zona T)',
    category: 'restaurante',
    restaurantCategory: 'tipica',
    isAlternative: true,
    coords: [4.6685, -74.0520],
    address: 'Calle 84A #12-25, Chapinero (Zona T), Bogotá',
    whatsapp: '+57 315 704 2954 / +57 300 693 4496',
    web: 'https://companiacriolla.com',
    instagram: '@companiacriolla',
    hours: 'DATO NO VERIFICADO (típico L-D 12-22). Música en vivo V-S-D desde 15:00.',
    notes: '⚠️ Calidad inconsistente según reseñas. Fogones de leña tradicionales. Ambiente "como casa de abuela".',
    priceRange: '$30.000 - $60.000 por persona',
    rating: { score: 0, reviews: 0, source: 'DATO NO VERIFICADO' },
    meetsCriteria: false,
    menu: [
      {
        title: 'PLATOS TÍPICOS',
        items: [
          { name: 'Ajiaco', description: '—', price: '$30-40k' },
          { name: 'Bandeja Paisa', description: '—', price: '$35-45k' },
          { name: 'Mondongo', description: '—', price: '$30-40k' },
          { name: 'Sancocho', description: '—', price: '$30-40k' },
          { name: 'Cócteles únicos', description: '—', price: '$20-35k' },
        ],
      },
    ],
  },
  {
    id: 'alt-casa-santa-clara',
    name: 'Casa Santa Clara (Monserrate)',
    category: 'restaurante',
    restaurantCategory: 'tipica',
    isAlternative: true,
    coords: [4.6055, -74.0560],
    address: 'Cerro de Monserrate (cima, 3.152 m s.n.m.), Bogotá',
    phone: '+57 315 253 9963 / +57 601 666 1684',
    email: 'reservas@restaurantesmonserrate.com',
    web: 'https://www.restaurantesmonserrate.com',
    instagram: '@restaurantesmonserrate',
    hours: 'L-V 12m-8pm · Sáb 8am-8pm · Dom 8am-5pm',
    notes: 'En la cima de Monserrate. Cocina tradicional colombiana. Reservas recomendadas. Acceso por teleférico o funicular.',
    priceRange: '$50.000 - $100.000 por persona',
    rating: { score: 4.6, reviews: 1411, source: 'Tripadvisor' },
    meetsCriteria: true,
    menu: [
      {
        title: 'PLATOS COLOMBIANOS',
        items: [
          { name: 'Ajiaco Santafereño', description: 'plato destacado', price: '$50-65k' },
          { name: 'Bandeja Paisa', description: '—', price: '$55-70k' },
          { name: 'Carnes asadas', description: '—', price: '$60-90k' },
          { name: 'Postres típicos', description: '—', price: '$15-25k' },
        ],
      },
    ],
  },

  // === ALTERNATIVAS ITALIANA ===
  {
    id: 'alt-oliveto',
    name: 'Oliveto Pizza & Pasta Parkway',
    category: 'restaurante',
    restaurantCategory: 'italiana',
    isAlternative: true,
    coords: [4.6380, -74.0720],
    address: 'Parkway (Cra 24 entre Cl 36 y 45), Teusaquillo, Bogotá',
    hours: 'L-D 9am-12am (varía por establecimiento)',
    notes: 'Tripadvisor 4.9/5 (~1269 reseñas). Ideal combinar con visita UNAL: TM Universidad Nacional + 15 min caminando por Calle 45. Ambiente bohemio del Parkway.',
    priceRange: '$25.000 - $50.000 por persona',
    rating: { score: 4.9, reviews: 1269, source: 'Tripadvisor' },
    meetsCriteria: true,
    menu: [
      {
        title: 'PIZZA Y PASTA',
        items: [
          { name: 'Pizza Margherita', description: 'plato destacado', price: '$25-35k' },
          { name: 'Pizza artesanal (variedades)', description: '—', price: '$28-45k' },
          { name: 'Pasta fresca', description: '—', price: '$25-40k' },
          { name: 'Antipasti', description: '—', price: '$15-25k' },
          { name: 'Risottos', description: '—', price: '$30-45k' },
        ],
      },
    ],
  },

  // === SITIOS COMPLEMENTARIOS ===
  {
    id: 'parque-93',
    name: 'Parque de la 93',
    category: 'naturaleza',
    coords: [4.6960, -74.0520],
    address: 'Calle 93 entre Cra 11A y 13, Bogotá',
    notes: 'Parque urbano con cafés, restaurantes. 5 min caminando desde Calle 94. Gratuito.',
    priceRange: 'GRATIS',
  },
  {
    id: 'zona-t',
    name: 'Zona T / Andino',
    category: 'compras',
    coords: [4.6680, -74.0500],
    address: 'Calle 82 entre Cra 11 y 13, Bogotá',
    notes: 'Zona comercial y de noche. CC Andino (Cra 11 #82-71), El Retiro, Unicentro. Andrés D.C. en Calle 82 #11-15.',
  },
  {
    id: 'parkway',
    name: 'Parkway (Teusaquillo)',
    category: 'cultura',
    coords: [4.6380, -74.0720],
    address: 'Carrera 24 entre Calles 36 y 45, Bogotá',
    notes: 'Alameda arbolada de ~800m, boulevard tipo inglés construido hacia 1950. Restaurantes: Matrona, Oliveto, KoronKo, Casa Obrador, Santa María. Ideal combinar con UNAL.',
  },
];

// ============ DAY PLANS ============

export const dayPlans: DayPlan[] = [
  {
    day: 1,
    date: '15 julio 2026',
    weekday: 'Miércoles',
    title: 'Llegada + Universidad Nacional (Nacho)',
    subtitle: 'Aeropuerto → Calle 94 → Tarde en campus + Parkway',
    plan: [
      { id: 'd1-1', time: '10:00 AM', type: 'info', placeId: 'aeropuerto', activity: 'Llegada Aeropuerto El Dorado. Migración, maletas.', notes: 'Taxi oficial aeropuerto disponible en terminal.' },
      { id: 'd1-2', time: '10:00-10:40', type: 'movilidad', fromPlaceId: 'aeropuerto', toPlaceId: 'alojamiento', isMovement: true, transportAlternatives: [        { id: 'd1-2-taxi', mode: 'Taxi', label: 'Taxi oficial aeropuerto', duration: '25-40 min', cost: '$35.000-50.000', notes: 'Tiquete con precio exacto. Recomendado con maletas.', isRecommended: true },        { id: 'd1-2-uber', mode: 'Uber', label: 'Uber / Cabify', duration: '25-40 min', cost: '$30.000-45.000', notes: 'Caminar a Av. El Dorado para pedirlo (restricción dentro del aeropuerto).' },        { id: 'd1-2-tm', mode: 'TM', label: 'TransMilenio M86/K86', duration: '60-90 min', cost: '$3.550 c/u', notes: 'Con transbordo. Incómodo con maletas.' },      ], activity: 'Traslado Aeropuerto → Alojamiento Calle 94' },
      { id: 'd1-3', time: '10:40-11:30', type: 'actividad', placeId: 'alojamiento', activity: 'Check-in, dejar maletas, cambio de ropa.' },
      { id: 'd1-4', time: '11:30-12:00', type: 'compra', placeId: 'alojamiento', activity: 'Comprar tarjeta TuLlave personalizada en estación Calle 100-Marketmedios. 2× $8.000 + $20.000 recarga = $56.000. Llevar pasaporte.', notes: 'Estación a 600m del alojamiento (puente peatonal Calle 94).' },
      { id: 'd1-5', time: '12:00-12:50', type: 'movilidad', fromPlaceId: 'alojamiento', toPlaceId: 'unal', isMovement: true, transportAlternatives: [        { id: 'd1-5-tm', mode: 'TM', label: 'TransMilenio (troncal B→E)', duration: '40-55 min', cost: '$3.550 c/u', notes: 'TM Calle 100 (B) → transbordo Av. El Dorado o Salitre El Greco → troncal E (NQS) → estación Universidad Nacional.', isRecommended: true },        { id: 'd1-5-uber', mode: 'Uber', label: 'Uber / Cabify', duration: '25-35 min', cost: '$18.000-25.000', notes: 'Directo, más rápido pero más caro.' },      ], activity: 'TransMilenio Calle 94 → Universidad Nacional' },
      { id: 'd1-6', time: '1:00-2:00 PM', type: 'comida', placeId: 'unal', activity: 'Almuerzo: Comedor \'Chucho León\' (reabrió sep-2025, preguntar portería externos) o buffet Calle 44 #15-14 (~$11k c/u).' },
      { id: 'd1-7', time: '2:00-5:00', type: 'actividad', placeId: 'unal', activity: 'Recorrido arquitectónico campus: Plaza Che → Auditorio León de Greiff → Museo Arquitectura Leopoldo Rother → Residencias Bloques 1-3 → Edificio Posgrados Salmona → Biblioteca Central.' },
      { id: 'd1-8', time: '5:00-5:20', type: 'movilidad', fromPlaceId: 'unal', toPlaceId: 'parkway', isMovement: true, transportMode: 'Caminata', transportDuration: '15 min', transportCost: '$0', transportNotes: 'Salir por portería Cra 45, caminar por Calle 45 hasta Cra 24 (Parkway). Alameda arbolada.', activity: 'Caminata UNAL → Parkway' },
      { id: 'd1-9', time: '5:00-7:00', type: 'comida', placeId: 'parkway', activity: 'Cena en Parkway: Matrona, Oliveto, Casa Obrador (económico), KoronKo.' },
      { id: 'd1-10', time: '7:30-8:30', type: 'movilidad', fromPlaceId: 'parkway', toPlaceId: 'alojamiento', isMovement: true, transportAlternatives: [        { id: 'd1-10-tm', mode: 'TM', label: 'TransMilenio', duration: '40-55 min', cost: '$3.550 c/u', notes: 'TM estación Universidad Nacional → Calle 100.', isRecommended: true },        { id: 'd1-10-uber', mode: 'Uber', label: 'Uber / Cabify', duration: '25 min', cost: '$18.000-25.000', notes: 'Más directo de noche.' },      ], activity: 'Regreso Parkway → Calle 94' },
    ],
    estimatedCost: '$165-235k + taxi $35-50k',
  },
  {
    day: 2,
    date: '16 julio 2026',
    weekday: 'Jueves',
    title: 'La Candelaria: Ajiaco, Changua, Cementerio, Planetario',
    subtitle: 'Día cultural completo en centro histórico',
    plan: [
      { id: 'd2-1', time: '7:30 AM', type: 'info', placeId: 'alojamiento', activity: 'Salida Calle 94.' },
      { id: 'd2-2', time: '7:30-8:30', type: 'movilidad', fromPlaceId: 'alojamiento', toPlaceId: 'la-puerta-falsa', isMovement: true, transportAlternatives: [        { id: 'd2-2-tm', mode: 'TM', label: 'TransMilenio (troncal B→A)', duration: '45-60 min', cost: '$3.550 c/u', notes: 'TM Calle 100 (B) → transbordo → troncal A (Caracas) → estación Las Aguas. 5 min a pie.', isRecommended: true },        { id: 'd2-2-uber', mode: 'Uber', label: 'Uber / Cabify', duration: '35-50 min', cost: '$25.000-35.000', notes: 'Directo, evita transbordos.' },      ], activity: 'Calle 94 → La Candelaria' },
      { id: 'd2-3', time: '8:30-9:30', type: 'comida', placeId: 'la-puerta-falsa', activity: 'Desayuno La Puerta Falsa: Changua + chocolate + tamal. ~$25k 2 pers. Sin reserva, fila 15-45 min.' },
      { id: 'd2-4', time: '9:30-11:30', type: 'actividad', placeId: 'la-puerta-falsa', activity: 'Caminata La Candelaria: Plaza de Bolívar, Catedral, Casa de Nariño (exterior), callejones históricos.' },
      { id: 'd2-5', time: '11:30-12:00', type: 'movilidad', fromPlaceId: 'la-puerta-falsa', toPlaceId: 'cementerio', isMovement: true, transportAlternatives: [        { id: 'd2-5-uber', mode: 'Uber', label: 'Uber / Cabify', duration: '8 min', cost: '$8.000-12.000', notes: 'Más rápido.', isRecommended: true },        { id: 'd2-5-caminata', mode: 'Caminata', label: 'Caminata', duration: '25 min', cost: '$0', notes: 'Por La Carrera 10 hacia el sur.' },        { id: 'd2-5-tm', mode: 'TM', label: 'TransMilenio', duration: '15 min', cost: '$3.550 c/u', notes: 'Estación Las Aguas → CAD o Paloquemao.' },      ], activity: 'La Candelaria → Cementerio Central' },
      { id: 'd2-6', time: '11:30-12:30', type: 'actividad', placeId: 'cementerio', activity: 'Visita Cementerio Central. Diurna GRATUITA (Monumento Nacional).' },
      { id: 'd2-7', time: '12:30-1:00', type: 'movilidad', fromPlaceId: 'cementerio', toPlaceId: 'la-puerta-falsa', isMovement: true, transportAlternatives: [        { id: 'd2-7-uber', mode: 'Uber', label: 'Uber', duration: '8 min', cost: '$8.000-12.000', isRecommended: true },        { id: 'd2-7-caminata', mode: 'Caminata', label: 'Caminata', duration: '25 min', cost: '$0' },      ], activity: 'Cementerio → La Candelaria' },
      { id: 'd2-8', time: '1:00-2:30 PM', type: 'comida', placeId: 'la-puerta-falsa', activity: 'Almuerzo ajiaco La Puerta Falsa o La Puerta de la Catedral. $38-40k c/u.' },
      { id: 'd2-9', time: '2:30-2:40', type: 'movilidad', fromPlaceId: 'la-puerta-falsa', toPlaceId: 'museo-oro', isMovement: true, transportMode: 'Caminata', transportDuration: '10-15 min', transportCost: '$0', transportNotes: 'Por Plaza de Bolívar. Cl 11 #6-50 → Cra 6 #15-88.', activity: 'Caminata La Puerta Falsa → Museo del Oro' },
      { id: 'd2-10', time: '2:30-5:00', type: 'actividad', placeId: 'museo-oro', activity: 'Museo del Oro. Jueves $5.000 c/u. 2-3 horas. Casilleros piso 2.' },
      { id: 'd2-11', time: '5:00-6:00', type: 'espera', placeId: 'museo-oro', activity: 'Pausa café: Café San Alberto o Juan Valdez La Candelaria.' },
      { id: 'd2-12', time: '5:30-5:45', type: 'movilidad', fromPlaceId: 'museo-oro', toPlaceId: 'planetario', isMovement: true, transportMode: 'Caminata', transportDuration: '10-15 min', transportCost: '$0', transportNotes: 'Por Parque de la Independencia.', activity: 'Caminata Museo Oro → Planetario' },
      { id: 'd2-13', time: '6:00-7:30', type: 'actividad', placeId: 'planetario', activity: 'Planetario. Jueves show láser Pink Floyd 6pm (verificar cartelera julio 2026).' },
      { id: 'd2-14', time: '8:00-9:00', type: 'movilidad', fromPlaceId: 'planetario', toPlaceId: 'alojamiento', isMovement: true, transportAlternatives: [        { id: 'd2-14-tm', mode: 'TM', label: 'TransMilenio', duration: '50-60 min', cost: '$3.550 c/u', isRecommended: true },        { id: 'd2-14-uber', mode: 'Uber', label: 'Uber / Cabify', duration: '35-50 min', cost: '$25.000-35.000' },      ], activity: 'Regreso Planetario → Calle 94' },
    ],
    alternatives: [
      { label: 'Si llueve o prefieres indoors', description: 'Cinemateca + Centro Cultural GGM + La Candelaria', placeIds: ['cinemateca'] },
    ],
    estimatedCost: '$90-180k',
  },
  {
    day: 3,
    date: '17 julio 2026',
    weekday: 'Viernes',
    title: 'Cita Médica + Planes Compatibles',
    subtitle: 'Cita oftalmológica (queratocono) hasta las 5:00 PM y cena tranquila',
    isRestriccionMedica: true,
    plan: [
      { id: 'd3-1', time: '7:30-8:30 AM', type: 'comida', placeId: 'alojamiento', activity: 'Desayuno ligero cercano: Juan Valdez, Pan Pa\' Ya, Atlanta Pastry.' },
      { id: 'd3-2', time: '9:00 AM - 5:00 PM', type: 'actividad', placeId: 'alojamiento', activity: 'Cita oftalmológica (queratocono) en clínica cerca de Calle 98. Llevar gafas de sol y acompañamiento.' },
      { id: 'd3-3', time: '1:00-2:00 PM', type: 'comida', placeId: 'parque-93', activity: 'Almuerzo ligero en el norte (inmediaciones de la clínica): La Taquería o Café Velvet.', notes: 'Evitar luz solar intensa, usar gafas de sol.' },
      { id: 'd3-4', time: '5:00-5:15 PM', type: 'movilidad', fromPlaceId: 'alojamiento', toPlaceId: 'alojamiento', isMovement: true, transportAlternatives: [
        { id: 'd3-4-uber', mode: 'Uber', label: 'Uber / Cabify', duration: '10-15 min', cost: '$8.000-12.000', isRecommended: true },
        { id: 'd3-4-caminata', mode: 'Caminata', label: 'Caminata', duration: '15 min', cost: '$0' }
      ], activity: 'Traslado Clínica → Alojamiento Calle 94' },
      { id: 'd3-5', time: '5:15-7:00 PM', type: 'espera', placeId: 'alojamiento', activity: 'Reposo estricto en el alojamiento en un entorno de luz controlada y penumbra (pupilas dilatadas).' },
      { id: 'd3-6', time: '7:00-7:15 PM', type: 'movilidad', fromPlaceId: 'alojamiento', toPlaceId: 'vitto', isMovement: true, transportAlternatives: [
        { id: 'd3-6-uber', mode: 'Uber', label: 'Uber / Cabify', duration: '10-15 min', cost: '$12.000-18.000', isRecommended: true },
        { id: 'd3-6-caminata', mode: 'Caminata', label: 'Caminata', duration: '25 min', cost: '$0' }
      ], activity: 'Traslado Alojamiento → Vitto (Zona G)' },
      { id: 'd3-7', time: '7:15-9:30 PM', type: 'comida', placeId: 'vitto', activity: 'Cena en Vitto (Zona G) en ambiente de iluminación cálida. WhatsApp +57 310 309 9727.' },
      { id: 'd3-8', time: '9:30-10:00 PM', type: 'movilidad', fromPlaceId: 'vitto', toPlaceId: 'alojamiento', isMovement: true, transportAlternatives: [
        { id: 'd3-8-uber', mode: 'Uber', label: 'Uber / Cabify', duration: '10-15 min', cost: '$12.000-18.000', isRecommended: true }
      ], activity: 'Regreso Vitto → Calle 94' }
    ],
    estimatedCost: '$141.000-$290.000',
  },
  {
    day: 4,
    date: '18 julio 2026',
    weekday: 'Sábado',
    title: 'Día Libre: JBB + Chigüiro + Parque Simón Bolívar',
    subtitle: 'Plan eco recomendado · Naturaleza + comida llanera',
    plan: [
      { id: 'd4-1', time: '8:30 AM', type: 'info', placeId: 'alojamiento', activity: 'Salida Calle 94.' },
      { id: 'd4-2', time: '8:30-9:00', type: 'movilidad', fromPlaceId: 'alojamiento', toPlaceId: 'jbb', isMovement: true, transportAlternatives: [        { id: 'd4-2-uber', mode: 'Uber', label: 'Uber / Cabify', duration: '20-30 min', cost: '$15.000-22.000', isRecommended: true },        { id: 'd4-2-tm', mode: 'TM', label: 'TransMilenio + caminata', duration: '40-55 min', cost: '$3.550 c/u', notes: 'Calle 100 → Avenida Chile + 10 min a pie.' },      ], activity: 'Calle 94 → Jardín Botánico' },
      { id: 'd4-3', time: '9:00-11:30', type: 'actividad', placeId: 'jbb', activity: 'Jardín Botánico. Entrada nacional 2× $6.600 = $13.200. Combo Tropicario opcional.' },
      { id: 'd4-4', time: '11:30-11:40', type: 'movilidad', fromPlaceId: 'jbb', toPlaceId: 'parque-sb', isMovement: true, transportMode: 'Caminata', transportDuration: '5-10 min', transportCost: '$0', transportNotes: 'Son adyacentes.', activity: 'Caminata JBB → Parque Simón Bolívar' },
      { id: 'd4-5', time: '11:30-1:30 PM', type: 'actividad', placeId: 'parque-sb', activity: 'Parque Simón Bolívar (gratis). Lago, Biblioteca Virgilio Barco (Salmona).' },
      { id: 'd4-6', time: '1:30-1:40', type: 'movilidad', fromPlaceId: 'parque-sb', toPlaceId: 'chiguiro-parrilla', isMovement: true, transportAlternatives: [        { id: 'd4-6-uber', mode: 'Uber', label: 'Uber', duration: '5-10 min', cost: '$8.000-12.000', isRecommended: true },        { id: 'd4-6-caminata', mode: 'Caminata', label: 'Caminata', duration: '20 min', cost: '$0' },      ], activity: 'Parque SB → Chigüiro Parrilla Bar' },
      { id: 'd4-7', time: '2:00-4:00', type: 'comida', placeId: 'chiguiro-parrilla', activity: 'Almuerzo Chigüiro Parrilla Bar. Chigüiro $43.200 c/u.' },
      { id: 'd4-8', time: '4:00-4:30', type: 'movilidad', fromPlaceId: 'chiguiro-parrilla', toPlaceId: 'alojamiento', isMovement: true, transportAlternatives: [        { id: 'd4-8-uber', mode: 'Uber', label: 'Uber', duration: '15-20 min', cost: '$15.000-20.000', isRecommended: true },        { id: 'd4-8-tm', mode: 'TM', label: 'TransMilenio', duration: '35-45 min', cost: '$3.550 c/u' },      ], activity: 'Regreso Chigüiro → Calle 94' },
      { id: 'd4-9', time: '5:00-8:00', type: 'comida', placeId: 'parque-93', activity: 'Cena en La 93.' },
    ],
    alternatives: [
      { label: 'Opción A · Cultural clásica', description: 'Monserrate + La Candelaria + Museo del Oro', placeIds: ['monserrate', 'la-puerta-falsa', 'museo-oro'] },
      { label: 'Opción C · Tren de la Sabana', description: 'Zipaquirá: Catedral de Sal (8:45am-5:15pm, $238k 2pers)', placeIds: ['cc-gran-estacion', 'estacion-usaquen'] },
    ],
    estimatedCost: '$80-260k',
  },
  {
    day: 5,
    date: '19 julio 2026',
    weekday: 'Domingo',
    title: 'Paloquemao + Planetario + Museo del Oro (con Huevito)',
    subtitle: 'Mañana con Huevito en carro · Tarde cultural',
    plan: [
      { id: 'd5-1', time: '7:00 AM', type: 'info', placeId: 'alojamiento', activity: 'Salida Calle 94 con Huevito en carro.' },
      { id: 'd5-2', time: '7:00-7:30', type: 'movilidad', fromPlaceId: 'alojamiento', toPlaceId: 'paloquemao', isMovement: true, transportMode: 'Carro', transportDuration: '25-35 min', transportCost: 'Parqueo $5-10k', transportNotes: 'Av. Calle 94 → Av. NQS sur → Av. Calle 19. Pico y placa NO aplica domingos.', activity: 'Carro con Huevito Calle 94 → Paloquemao' },
      { id: 'd5-3', time: '7:30-8:00', type: 'info', placeId: 'paloquemao', activity: 'Llegada Paloquemao. Parqueo propio ($5-10k). Entrada libre.' },
      { id: 'd5-4', time: '8:00-9:00', type: 'comida', placeId: 'paloquemao', activity: 'Desayuno en mercado: caldo de costilla, chocolate con tamal, jugo natural.' },
      { id: 'd5-5', time: '9:00-11:00', type: 'actividad', placeId: 'paloquemao', activity: 'Recorrido mercado: frutas exóticas, Mercado de Flores, Especias para Colombia (Local 81102).' },
      { id: 'd5-6', time: '11:00-11:10', type: 'movilidad', fromPlaceId: 'paloquemao', toPlaceId: 'lechoneria-dona-rosalba', isMovement: true, transportMode: 'Caminata', transportDuration: '2 min', transportCost: '$0', transportNotes: 'Local 80228 dentro de la plaza.', activity: 'Caminata dentro de Paloquemao → Lechonería Doña Rosalba' },
      { id: 'd5-7', time: '11:00-1:00', type: 'comida', placeId: 'lechoneria-dona-rosalba', activity: 'Lechona tolimense Doña Rosalba, frutas, flores, especias. Presupuesto 2 pers: $100-210k.' },
      { id: 'd5-8', time: '1:30 PM', type: 'info', placeId: 'paloquemao', activity: 'Salida Paloquemao (asumir cierre 2:30pm conservador).' },
      { id: 'd5-9', time: '1:30-1:50', type: 'movilidad', fromPlaceId: 'paloquemao', toPlaceId: 'museo-oro', isMovement: true, transportMode: 'Carro', transportDuration: '15-20 min', transportCost: 'Incluido (Huevito)', transportNotes: 'Sin tráfico domingo.', activity: 'Carro con Huevito Paloquemao → Museo del Oro' },
      { id: 'd5-10', time: '2:00-4:30', type: 'actividad', placeId: 'museo-oro', activity: 'Museo del Oro. DOMINGO GRATIS. Cierre 5pm.' },
      { id: 'd5-11', time: '4:30-4:40', type: 'movilidad', fromPlaceId: 'museo-oro', toPlaceId: 'la-puerta-falsa', isMovement: true, transportMode: 'Caminata', transportDuration: '10 min', transportCost: '$0', transportNotes: 'Por Plaza de Bolívar.', activity: 'Caminata Museo Oro → La Puerta Falsa' },
      { id: 'd5-12', time: '4:30-6:00', type: 'comida', placeId: 'la-puerta-falsa', activity: 'Onces en La Puerta Falsa (domingo 7am-6pm, chocolate $9-17k).' },
      { id: 'd5-13', time: '5:45-6:00', type: 'movilidad', fromPlaceId: 'la-puerta-falsa', toPlaceId: 'planetario', isMovement: true, transportMode: 'Caminata', transportDuration: '10-15 min', transportCost: '$0', activity: 'Caminata La Puerta Falsa → Planetario' },
      { id: 'd5-14', time: '6:00-7:30', type: 'actividad', placeId: 'planetario', activity: 'Planetario show láser (verificar cartelera julio 2026).' },
      { id: 'd5-15', time: '8:00-9:00', type: 'movilidad', fromPlaceId: 'planetario', toPlaceId: 'alojamiento', isMovement: true, transportAlternatives: [        { id: 'd5-15-tm', mode: 'TM', label: 'TransMilenio', duration: '50-60 min', cost: '$3.550 c/u', isRecommended: true },        { id: 'd5-15-uber', mode: 'Uber', label: 'Uber / Cabify', duration: '35-50 min', cost: '$25.000-35.000' },      ], activity: 'Regreso Planetario → Calle 94' },
    ],
    estimatedCost: '$160-295k',
  },
  {
    day: 6,
    date: '20 julio 2026',
    weekday: 'Lunes',
    title: 'Día de la Independencia · Descanso con 6 Opciones',
    subtitle: 'Feriado nacional: Museo del Oro CIERRA, otros abren',
    isFeriado: true,
    plan: [
      { id: 'd6-1', time: '7:30 AM', type: 'info', placeId: 'alojamiento', activity: 'Plan A recomendado: Monserrate temprano + Parque 93' },
      { id: 'd6-2', time: '7:30-8:15', type: 'movilidad', fromPlaceId: 'alojamiento', toPlaceId: 'monserrate', isMovement: true, transportAlternatives: [        { id: 'd6-2-uber', mode: 'Uber', label: 'Uber / Cabify', duration: '35-45 min', cost: '$25.000-35.000', isRecommended: true },        { id: 'd6-2-tm', mode: 'TM', label: 'TransMilenio + caminata', duration: '50-60 min', cost: '$3.550 c/u', notes: 'Estación Las Aguas + 15 min a pie cuesta arriba.' },      ], activity: 'Calle 94 → Monserrate (base teleférico)' },
      { id: 'd6-3', time: '8:30-11:00', type: 'actividad', placeId: 'monserrate', activity: 'Monserrate. Festivos 6:30am-5pm. Teleférico $35.000 c/u.' },
      { id: 'd6-4', time: '11:00-11:15', type: 'movilidad', fromPlaceId: 'monserrate', toPlaceId: 'alt-casa-santa-clara', isMovement: true, transportMode: 'Caminata', transportDuration: '5 min', transportCost: '$0', transportNotes: 'En la cima, junto a la iglesia.', activity: 'Caminata cima → Casa Santa Clara' },
      { id: 'd6-5', time: '12:00-2:00', type: 'comida', placeId: 'alt-casa-santa-clara', activity: 'Almuerzo Casa Santa Clara (cima Monserrate).' },
      { id: 'd6-6', time: '2:30-3:15', type: 'movilidad', fromPlaceId: 'monserrate', toPlaceId: 'parque-93', isMovement: true, transportAlternatives: [        { id: 'd6-6-uber', mode: 'Uber', label: 'Uber / Cabify', duration: '35-45 min', cost: '$25.000-35.000', isRecommended: true },        { id: 'd6-6-tm', mode: 'TM', label: 'TransMilenio', duration: '55-65 min', cost: '$3.550 c/u' },      ], activity: 'Monserrate → Parque 93' },
      { id: 'd6-7', time: '3:00-6:00', type: 'espera', placeId: 'parque-93', activity: 'Tarde tranquila Parque de la 93. Café, descanso.' },
    ],
    alternatives: [
      { label: 'Plan B · Naturaleza', description: 'Parque Simón Bolívar + Jardín Botánico (ambos abren festivos)', placeIds: ['parque-sb', 'jbb'] },
      { label: 'Plan C · Salida de Bogotá', description: 'Edelweiss Cajicá + Andrés Carne de Res Chía (ambos abren festivos)', placeIds: ['edelweiss', 'andres-chia'] },
      { label: 'Plan D · Cultural alternativo', description: 'Caminata La Candelaria + La Puerta Falsa (Museo Oro CIERRA)', placeIds: ['la-puerta-falsa'] },
      { label: 'Plan E · Descanso', description: 'Día relax alojamiento + cena Zona T (Andrés D.C.)', placeIds: ['alt-andres-dc'] },
    ],
    estimatedCost: '$40-180k',
  },
  {
    day: 7,
    date: '21 julio 2026',
    weekday: 'Martes',
    title: 'Edelweiss (almuerzo) + Vitto (cena) + Taquería Huevito',
    subtitle: 'Día de cierre gastronómico + encuentros sociales',
    plan: [
      { id: 'd7-1', time: '10:00 AM', type: 'info', placeId: 'alojamiento', activity: 'Reserva Edelweiss WhatsApp +57 311 541 1241. Confirmar horario.' },
      { id: 'd7-2', time: '11:00-12:00', type: 'movilidad', fromPlaceId: 'alojamiento', toPlaceId: 'edelweiss', isMovement: true, transportAlternatives: [        { id: 'd7-2-uber', mode: 'Uber', label: 'Uber / Cabify', duration: '45-60 min', cost: '$80.000-120.000', isRecommended: true },        { id: 'd7-2-bus', mode: 'Carro', label: 'Bus Sotracausán', duration: '90 min', cost: '$8.000-12.000 c/u', notes: 'Desde Portal del Norte. Más económico pero lento.' },        { id: 'd7-2-tren', mode: 'Tren', label: 'Tren de la Sabana (sáb/dom)', duration: '60 min', cost: '$119.000 c/u', notes: 'Solo disponible fin de semana.' },      ], activity: 'Calle 94 → Edelweiss (Cajicá)' },
      { id: 'd7-3', time: '12:00-2:30', type: 'comida', placeId: 'edelweiss', activity: 'Almuerzo Edelweiss: codillo, salchichas, sauerkraut, pretzel, strudel.' },
      { id: 'd7-4', time: '2:30-3:30', type: 'movilidad', fromPlaceId: 'edelweiss', toPlaceId: 'alojamiento', isMovement: true, transportAlternatives: [        { id: 'd7-4-uber', mode: 'Uber', label: 'Uber / Cabify', duration: '45-60 min', cost: '$80.000-120.000', isRecommended: true },        { id: 'd7-4-bus', mode: 'Carro', label: 'Bus Sotracausán', duration: '90 min', cost: '$8.000-12.000 c/u' },      ], activity: 'Regreso Edelweiss → Calle 94' },
      { id: 'd7-5', time: '6:30-7:30', type: 'comida', placeId: 'taqueria-huevito', activity: 'Taquería de Huevito (Cl 90 c/ Cra 11, 5 min caminando). Encuentro con amigos.' },
      { id: 'd7-6', time: '7:30-7:45', type: 'movilidad', fromPlaceId: 'taqueria-huevito', toPlaceId: 'vitto', isMovement: true, transportAlternatives: [        { id: 'd7-6-uber', mode: 'Uber', label: 'Uber', duration: '10-15 min', cost: '$12.000-18.000', isRecommended: true },        { id: 'd7-6-caminata', mode: 'Caminata', label: 'Caminata', duration: '25 min', cost: '$0' },      ], activity: 'Taquería Huevito → Vitto' },
      { id: 'd7-7', time: '8:00-10:30', type: 'comida', placeId: 'vitto', activity: 'Cena Vitto (Zona G). WhatsApp +57 310 309 9727.' },
      { id: 'd7-8', time: '10:30-10:45', type: 'movilidad', fromPlaceId: 'vitto', toPlaceId: 'alojamiento', isMovement: true, transportAlternatives: [        { id: 'd7-8-uber', mode: 'Uber', label: 'Uber', duration: '10-15 min', cost: '$12.000-18.000', isRecommended: true },        { id: 'd7-8-caminata', mode: 'Caminata', label: 'Caminata', duration: '25 min', cost: '$0' },      ], activity: 'Regreso Vitto → Calle 94' },
    ],
    alternatives: [
      { label: 'Si NO van a Edelweiss', description: 'Mañana Museo del Oro (reabre martes) + Cinemateca + encuentros amigos', placeIds: ['museo-oro', 'cinemateca'] },
    ],
    estimatedCost: '$200-380k',
  },
  {
    day: 8,
    date: '22 julio 2026',
    weekday: 'Miércoles',
    title: 'Salida · Vuelo de Regreso (5:00 a.m.)',
    subtitle: 'Traslado al aeropuerto El Dorado',
    plan: [
      { id: 'd8-1', time: '3:30 AM', type: 'espera', placeId: 'alojamiento', activity: 'Despertador. Ducha, revisión maletas, checkout.' },
      { id: 'd8-2', time: '4:00 AM', type: 'info', placeId: 'alojamiento', activity: 'Taxi en puerta. Taxis Libres WhatsApp +57 310 2111111 (reservar martes 21).' },
      { id: 'd8-3', time: '4:00-4:40', type: 'movilidad', fromPlaceId: 'alojamiento', toPlaceId: 'aeropuerto', isMovement: true, transportAlternatives: [        { id: 'd8-3-taxi', mode: 'Taxi', label: 'Taxi oficial (reservado)', duration: '25-40 min', cost: '$35.000-50.000', notes: 'TM NO opera antes de 4am. Reservar con 24h anticipación.', isRecommended: true },        { id: 'd8-3-uber', mode: 'Uber', label: 'Uber / Cabify', duration: '25-40 min', cost: '$30.000-45.000', notes: 'Disponibilidad limitada de madrugada.' },      ], activity: 'Taxi Calle 94 → Aeropuerto (madrugada)' },
      { id: 'd8-4', time: '4:40 AM', type: 'info', placeId: 'aeropuerto', activity: 'Llegada Aeropuerto El Dorado. Check-in 3h antes del vuelo.' },
      { id: 'd8-5', time: '5:00 AM', type: 'info', placeId: 'aeropuerto', activity: 'Vuelo de regreso. Fin del viaje.' },
    ],
    estimatedCost: '$60-95k',
  },
];

// ============ HELPER FUNCTIONS ============

export function getPlaceById(id: string): Place | undefined {
  return places.find((p) => p.id === id);
}

/**
 * Resolve a place by id, but if it's a restaurant with a category and the user
 * selected an alternative for that category, return the alternative instead.
 */
export function resolvePlace(
  placeId: string | undefined,
  selectedAlternatives: Record<string, string>
): Place | undefined {
  if (!placeId) return undefined;
  if (selectedAlternatives[placeId]) {
    const alt = getPlaceById(selectedAlternatives[placeId]);
    if (alt) return alt;
  }
  const place = getPlaceById(placeId);
  if (!place) return undefined;
  if (place.restaurantCategory && selectedAlternatives[place.restaurantCategory]) {
    const alt = getPlaceById(selectedAlternatives[place.restaurantCategory]);
    if (alt) return alt;
  }
  return place;
}

/**
 * Maps a TransportMode to the Google Maps Directions API travel mode.
 */
export function toGoogleMapsMode(mode: TransportMode | undefined): 'driving' | 'transit' | 'walking' | 'bicycling' {
  switch (mode) {
    case 'TM':
    case 'Tren':
      return 'transit';
    case 'Caminata':
      return 'walking';
    case 'Uber':
    case 'Cabify':
    case 'Carro':
    case 'Taxi':
    case 'Teleferico':
      return 'driving';
    default:
      return 'driving';
  }
}

export function getAlternativesByCategory(category: RestaurantCategory): Place[] {
  return places.filter((p) => p.restaurantCategory === category && p.isAlternative);
}

export function getMainByCategory(category: RestaurantCategory): Place | undefined {
  return places.find((p) => p.restaurantCategory === category && !p.isAlternative);
}

export const categoryLabels: Record<RestaurantCategory, string> = {
  aleman: 'Alemán',
  taqueria: 'Taquería',
  lechona: 'Lechona',
  chiguiro: 'Chigüiro',
  tipica: 'Comida Típica',
  italiana: 'Italiana',
  mercado: 'Mercado',
};

export const categoryEmojis: Record<RestaurantCategory, string> = {
  aleman: '🍺',
  taqueria: '🌮',
  lechona: '🐖',
  chiguiro: '🦫',
  tipica: '🍽️',
  italiana: '🍝',
  mercado: '🥭',
};

// Helper to calculate distance in km between two Bogotá coordinates
export const getDistance = (c1: [number, number], c2: [number, number]): number => {
  const dx = (c2[1] - c1[1]) * 110.8;
  const dy = (c2[0] - c1[0]) * 111.0;
  return Math.sqrt(dx * dx + dy * dy);
};

// Automatical Route & Cost Recalculation engine
export const recomputeCustomPlanSteps = (steps: PlanStep[]): PlanStep[] => {
  return steps.map((step, idx) => {
    if (step.type === 'movilidad') {
      let fromId = '';
      for (let j = idx - 1; j >= 0; j--) {
        if (steps[j].placeId) {
          fromId = steps[j].placeId!;
          break;
        }
      }
      let toId = '';
      for (let j = idx + 1; j < steps.length; j++) {
        if (steps[j].placeId) {
          toId = steps[j].placeId!;
          break;
        }
      }

      const fromPlace = getPlaceById(fromId);
      const toPlace = getPlaceById(toId);

      const updated = {
        ...step,
        fromPlaceId: fromId || undefined,
        toPlaceId: toId || undefined,
        isMovement: true,
      };

      if (fromPlace && toPlace) {
        const dist = getDistance(fromPlace.coords, toPlace.coords);
        const mode = step.transportMode || (dist < 1.2 ? 'Caminata' : 'Uber');
        updated.transportMode = mode;

        if (mode === 'Caminata') {
          const durationMin = Math.round(dist * 12 + 3);
          updated.transportDuration = `${durationMin} min`;
          updated.transportCost = 'Gratis';
        } else if (mode === 'TM' || mode === 'SITP') {
          const durationMin = Math.round(dist * 4.5 + 12);
          updated.transportDuration = `${durationMin} min`;
          updated.transportCost = '$3.550 c/u';
        } else if (mode === 'Tren') {
          updated.transportDuration = '60 min';
          updated.transportCost = '$96.000 c/u';
        } else {
          // Uber / Taxi / Cabify
          const durationMin = Math.round(dist * 3.5 + 4);
          const costK = Math.round(8 + dist * 2.2);
          updated.transportDuration = `${durationMin} min`;
          updated.transportCost = `$${costK}.000`;
        }
        updated.activity = `Traslado a ${toPlace.name}`;
      } else {
        updated.transportDuration = undefined;
        updated.transportCost = undefined;
      }
      return updated;
    } else {
      const place = getPlaceById(step.placeId);
      if (place && (!step.activity || step.activity === 'Nueva actividad' || step.activity.startsWith('Visita a '))) {
        step.activity = `Visita a ${place.name}`;
      }
    }
    return step;
  });
};

// Rebuilds plan steps by inserting new mobility segments between each pair of activity steps
export const reconstructSteps = (activitiesOnly: PlanStep[]): PlanStep[] => {
  const result: PlanStep[] = [];
  for (let i = 0; i < activitiesOnly.length; i++) {
    result.push(activitiesOnly[i]);
    if (i < activitiesOnly.length - 1) {
      const act1 = activitiesOnly[i];
      const act2 = activitiesOnly[i + 1];
      result.push({
        id: `move-${act1.id}-${act2.id}`,
        time: `${act1.time} - ${act2.time}`,
        type: 'movilidad',
        isMovement: true,
        fromPlaceId: act1.placeId,
        toPlaceId: act2.placeId,
        activity: `Traslado a ${getPlaceById(act2.placeId || '')?.name || 'siguiente sitio'}`,
      });
    }
  }
  return recomputeCustomPlanSteps(result);
};

export function getEffectiveTransportMode(
  step: PlanStep,
  selectedTransport: Record<string, string>
): TransportMode {
  const selection = selectedTransport[step.id];
  if (selection) {
    if (['TM', 'SITP', 'Uber', 'Cabify', 'Carro', 'Caminata', 'Tren', 'Taxi', 'Teleferico', 'Espera', 'Interno'].includes(selection)) {
      return selection as TransportMode;
    }
    if (step.transportAlternatives) {
      const alt = step.transportAlternatives.find((a) => a.id === selection || a.mode === selection);
      if (alt) return alt.mode;
    }
  }
  if (step.transportAlternatives && step.transportAlternatives.length > 0) {
    const recommended = step.transportAlternatives.find((a) => a.isRecommended) || step.transportAlternatives[0];
    return recommended.mode;
  }
  return step.transportMode || 'Uber';
}

export function isSameZone(
  fromPlaceId: string | undefined,
  toPlaceId: string | undefined,
  step: PlanStep,
  selectedTransport: Record<string, string>
): boolean {
  if (!fromPlaceId || !toPlaceId) return false;
  const fromPlace = getPlaceById(fromPlaceId);
  const toPlace = getPlaceById(toPlaceId);
  if (!fromPlace || !toPlace) return false;

  const mode = getEffectiveTransportMode(step, selectedTransport);
  if (mode === 'Caminata' || mode === 'Interno') {
    return true;
  }

  const distance = getDistance(fromPlace.coords, toPlace.coords);
  if (distance < 2.0) {
    const hasMotorizedOverride = ['TM', 'SITP', 'Uber', 'Cabify', 'Carro', 'Taxi', 'Tren'].includes(selectedTransport[step.id] || '');
    if (!hasMotorizedOverride) {
      return true;
    }
  }

  return false;
}

export const transportNames: Record<TransportMode, string> = {
  TM: 'TransMilenio 🟥',
  SITP: 'SITP 🟦',
  Tren: 'Tren de la Sabana 🚂',
  Uber: 'Uber / Cabify 🚗',
  Cabify: 'Cabify 🚗',
  Carro: 'Vehículo Particular 🚗',
  Taxi: 'Taxi Oficial 🚖',
  Teleferico: 'Teleférico Monserrate 🚠',
  Caminata: 'Caminata Peatonal 🚶',
  Espera: 'Tiempo de Espera ⏱️',
  Interno: 'Traslado Interno 🚶',
};

export interface TransportDetails {
  mode: TransportMode;
  duration: string;
  cost: string;
  label: string;
}

export function getEffectiveTransportDetails(
  step: PlanStep,
  selectedTransport: Record<string, string>
): TransportDetails {
  const mode = getEffectiveTransportMode(step, selectedTransport);
  const selection = selectedTransport[step.id];

  if (step.transportAlternatives) {
    const alt = step.transportAlternatives.find((a) => a.id === selection || a.mode === selection);
    if (alt) {
      return {
        mode: alt.mode,
        duration: alt.duration,
        cost: alt.cost,
        label: alt.label,
      };
    }
    const recommended = step.transportAlternatives.find((a) => a.isRecommended) || step.transportAlternatives[0];
    if (recommended && recommended.mode === mode) {
      return {
        mode: recommended.mode,
        duration: recommended.duration,
        cost: recommended.cost,
        label: recommended.label,
      };
    }
  }

  if (mode === step.transportMode) {
    return {
      mode,
      duration: step.transportDuration || '15 min',
      cost: step.transportCost || 'Gratis',
      label: transportNames[mode] || mode,
    };
  }

  const fromPlace = step.fromPlaceId ? getPlaceById(step.fromPlaceId) : null;
  const toPlace = step.toPlaceId ? getPlaceById(step.toPlaceId) : null;
  if (fromPlace && toPlace) {
    const dist = getDistance(fromPlace.coords, toPlace.coords);
    if (mode === 'Caminata' || mode === 'Interno') {
      const durationMin = Math.round(dist * 12 + 3);
      return {
        mode,
        duration: `${durationMin} min`,
        cost: 'Gratis',
        label: transportNames[mode] || mode,
      };
    } else if (mode === 'TM' || mode === 'SITP') {
      const durationMin = Math.round(dist * 4.5 + 12);
      return {
        mode,
        duration: `${durationMin} min`,
        cost: '$3.550 c/u',
        label: transportNames[mode] || mode,
      };
    } else if (mode === 'Tren') {
      return {
        mode,
        duration: '60 min',
        cost: '$96.000 c/u',
        label: transportNames[mode] || mode,
      };
    } else {
      const durationMin = Math.round(dist * 3.5 + 4);
      const costK = Math.round(8 + dist * 2.2);
      return {
        mode,
        duration: `${durationMin} min`,
        cost: `$${costK}.000`,
        label: transportNames[mode] || mode,
      };
    }
  }

  return {
    mode,
    duration: step.transportDuration || '15 min',
    cost: step.transportCost || 'Gratis',
    label: transportNames[mode] || mode,
  };
}


