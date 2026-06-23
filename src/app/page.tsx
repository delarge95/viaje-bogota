'use client';

import { useMemo } from 'react';
import { dayPlans, getPlaceById, resolvePlace, places } from '@/lib/travel-data';
import { useTravelStore } from '@/lib/travel-store';
import dynamic from 'next/dynamic';
import PlaceDetail from '@/components/place-detail';
import AlternativesSelector from '@/components/alternatives-selector';
import DayItinerary from '@/components/day-itinerary';
import DayNavigator from '@/components/day-navigator';
import RestaurantList from '@/components/restaurant-list';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Map as MapIcon,
  CalendarDays,
  Utensils,
  Info,
  Mountain,
  Compass,
  Clock,
  Phone,
  MapPin,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Dynamically import TravelMap with ssr:false (Google Maps iframe needs browser)
const TravelMap = dynamic(() => import('@/components/travel-map'), {
  ssr: false,
  loading: () => (
    <div className="h-[560px] w-full bg-muted/40 rounded-lg flex items-center justify-center text-sm text-muted-foreground">
      <div className="text-center">
        <div className="animate-pulse h-8 w-8 mx-auto mb-2 rounded-full bg-primary/30" />
        Cargando mapa...
      </div>
    </div>
  ),
});

type ViewType = 'itinerario' | 'mapa' | 'restaurantes' | 'info';

export default function Home() {
  const selectedDay = useTravelStore((s) => s.selectedDay);
  const selectedView = useTravelStore((s) => s.selectedView);
  const setSelectedView = useTravelStore((s) => s.setSelectedView);
  const selectedPlaceId = useTravelStore((s) => s.selectedPlaceId);
  const selectedAlternatives = useTravelStore((s) => s.selectedAlternatives);
  const routeOriginId = useTravelStore((s) => s.routeOriginId);
  const routeDestinationId = useTravelStore((s) => s.routeDestinationId);

  const dayPlan = useMemo(() => dayPlans.find((d) => d.day === selectedDay), [selectedDay]);

  // Build place IDs that appear in this day's plan (considering alternatives)
  const highlightedPlaceIds = useMemo(() => {
    if (!dayPlan) return [];
    const ids = new Set<string>();
    dayPlan.plan.forEach((step) => {
      [step.placeId, step.fromPlaceId, step.toPlaceId].forEach((pid) => {
        if (pid) ids.add(pid);
      });
    });
    dayPlan.alternatives?.forEach((alt) => alt.placeIds.forEach((id) => ids.add(id)));
    return Array.from(ids);
  }, [dayPlan]);

  // Selected place (for detail panel) - resolve with alternatives
  const selectedPlace = selectedPlaceId ? resolvePlace(selectedPlaceId, selectedAlternatives) : null;

  // Is a route currently active?
  const isRouteActive = !!(routeOriginId && routeDestinationId);

  // Quick stats
  const totalPlaces = places.length;
  const totalRestaurants = places.filter((p) => p.category === 'restaurante').length;
  const totalAlternatives = places.filter((p) => p.isAlternative).length;
  const meetsCriteria = places.filter((p) => p.meetsCriteria).length;

  const navItems: { id: ViewType; label: string; icon: typeof MapIcon }[] = [
    { id: 'itinerario', label: 'Itinerario', icon: CalendarDays },
    { id: 'mapa', label: 'Mapa', icon: MapIcon },
    { id: 'restaurantes', label: 'Restaurantes', icon: Utensils },
    { id: 'info', label: 'Info', icon: Info },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* HEADER */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
                <Mountain className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-base font-bold leading-tight">Bogotá · Plan de Viaje</h1>
                <p className="text-[11px] text-muted-foreground leading-tight">15-22 julio 2026 · 8 días · 2 personas</p>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-2">
              <Badge variant="secondary" className="text-[11px]">
                <Compass className="h-3 w-3 mr-1" />
                {totalPlaces} lugares
              </Badge>
              <Badge variant="secondary" className="text-[11px]">
                <Utensils className="h-3 w-3 mr-1" />
                {totalRestaurants} restaurantes
              </Badge>
              <Badge variant="secondary" className="text-[11px]">
                {totalAlternatives} alternativas
              </Badge>
              <Badge variant="outline" className="text-[11px] text-green-700 border-green-400">
                {meetsCriteria} cumplen criterio
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-4">
        {/* Top: Day navigator */}
        <div className="mb-4">
          <DayNavigator />
        </div>

        {/* View tabs */}
        <div className="flex items-center gap-1 mb-4 p-1 bg-muted rounded-lg w-fit">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setSelectedView(item.id)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all',
                  selectedView === item.id
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* LEFT COLUMN - varies by view */}
          <div className={cn(
            'space-y-4',
            selectedView === 'itinerario' && 'lg:col-span-5',
            selectedView === 'mapa' && 'lg:col-span-5',
            selectedView === 'restaurantes' && 'lg:col-span-12',
            selectedView === 'info' && 'lg:col-span-12',
          )}>
            {selectedView === 'itinerario' && <DayItinerary />}
            {selectedView === 'mapa' && (
              <>
                {selectedPlace ? (
                  <PlaceDetail place={selectedPlace} onClose={() => useTravelStore.getState().setSelectedPlaceId(null)} />
                ) : (
                  <Card className="border-dashed">
                    <CardContent className="pt-6 text-center text-sm text-muted-foreground">
                      <MapIcon className="h-8 w-8 mx-auto mb-2 opacity-40" />
                      Selecciona un paso del itinerario o un lugar del mapa para ver detalles y rutas
                    </CardContent>
                  </Card>
                )}
                <AlternativesSelector />
              </>
            )}
            {selectedView === 'restaurantes' && <RestaurantList />}
            {selectedView === 'info' && <InfoPanel />}
          </div>

          {/* RIGHT COLUMN - Map (always visible on itinerario and mapa views; sticky) */}
          {(selectedView === 'itinerario' || selectedView === 'mapa') && (
            <div className="lg:col-span-7 lg:sticky lg:top-24 lg:self-start space-y-3">
              <Card className="overflow-hidden p-0 border-border">
                <div className="px-3 py-2 border-b border-border bg-muted/40 flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <MapIcon className="h-4 w-4 text-primary shrink-0" />
                    <span className="text-sm font-semibold truncate">
                      {isRouteActive
                        ? `Ruta · Día ${selectedDay}`
                        : `Mapa · Día ${selectedDay} · ${dayPlan?.weekday}`}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-7 shrink-0"
                    onClick={() => setSelectedView('mapa')}
                  >
                    Ver mapa completo →
                  </Button>
                </div>
                <div className="p-3">
                  <TravelMap
                    highlightedPlaceIds={highlightedPlaceIds}
                    height="560px"
                  />
                </div>
              </Card>

              {/* Tip card */}
              <Card className="p-3 bg-primary/5 border-primary/20">
                <div className="flex items-start gap-2 text-[11px] text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-foreground">Tip:</span> Clic en cualquier paso del itinerario (ícono de bus, carro o caminata) para ver la ruta exacta en el mapa. El modo de transporte (TransMilenio, Uber, caminata) se aplica automáticamente a Google Maps.
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-border bg-card mt-12">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground">
            <div className="flex items-center gap-2">
              <Mountain className="h-3.5 w-3.5 text-primary" />
              <span>Plan maestro de viaje · Bogotá 2026 · Z.ai</span>
            </div>
            <div className="flex items-center gap-3">
              <span>Datos verificados de fuentes oficiales .gov.co</span>
              <span>·</span>
              <span>4.7110° N, 74.0721° W · 2,640 m s.n.m.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function InfoPanel() {
  const emergencyContacts = [
    { label: 'Emergencias (nacional)', value: '123', note: 'Policía, Bomberos, Ambulancia' },
    { label: 'Línea al Turista (IDT)', value: '195', note: 'Atención bilingüe 24/7' },
    { label: 'Policía de Turismo', value: '+57 601 422 8420' },
    { label: 'Cruz Roja Colombiana', value: '+57 601 437 1130' },
    { label: 'TransMilenio atención', value: '195 / +57 601 4824304' },
    { label: 'Secretaría Movilidad Bogotá', value: '+57 601 364 9400' },
  ];

  const keyContacts = [
    { label: 'Taxis Libres (reserva 4am)', value: '+57 310 2111111', href: 'https://wa.me/573102111111' },
    { label: 'Tuboleta (Tren, Planetario)', value: '+57 601 5936300' },
    { label: 'Turistren', value: '+57 3115338264', href: 'https://wa.me/573115338264' },
    { label: 'Edelweiss Cajicá', value: '+57 311 541 1241', href: 'https://wa.me/573115411241' },
    { label: 'Etnias Andantes (Cementerio)', value: '+57 320 287 5066', href: 'https://wa.me/573202875066' },
    { label: 'Chigüiro Parrilla Bar', value: '+57 314 220 1925', href: 'https://wa.me/573142201925' },
    { label: 'Andrés Carne de Res', value: '+57 601 861 2233 opc 1' },
    { label: 'Vitto', value: '+57 310 309 9727', href: 'https://wa.me/573103099727' },
    { label: 'Restaurante Monserrate', value: '+57 315 253 9963' },
  ];

  const apps = [
    { name: 'TransMi App', use: 'Rutas TM, recargas TuLlave' },
    { name: 'Maas (TuLlave)', use: 'Recarga digital' },
    { name: 'Cabify', use: 'Transporte más seguro' },
    { name: 'Uber', use: 'Mayor cobertura' },
    { name: 'DiDi', use: 'Tarifas más bajas' },
    { name: 'Taxis Libres', use: 'Taxis amarillos oficiales' },
    { name: 'Tuboleta', use: 'Compra Tren Sabana, Planetario' },
    { name: 'Google Maps (offline)', use: 'Descargar mapa Bogotá' },
    { name: 'Waze', use: 'Tráfico en tiempo real' },
    { name: 'Rappi', use: 'Domicilios comida' },
  ];

  const planEconomico = [
    { concepto: 'Transporte (TM prioritario + 2 Uber)', costo: '$100-130k' },
    { concepto: 'Comidas (8 días, mix: mercado/corrientazos/restaurantes)', costo: '$750-950k' },
    { concepto: 'Entradas culturales (Museo Oro gratis, JBB, Planetario, Monserrate)', costo: '$150-220k' },
    { concepto: 'Compras Paloquemao (frutas, flores, especias)', costo: '$80-150k' },
    { concepto: 'Edelweiss (Cajicá) + traslado', costo: '$250-380k' },
    { concepto: 'Colchón imprevistos / plan B', costo: '$50-100k' },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold mb-1">Información esencial del viaje</h2>
        <p className="text-xs text-muted-foreground">Contactos de emergencia, apps, presupuesto económico y datos útiles</p>
      </div>

      {/* Plan económico */}
      <Card>
        <div className="p-4 border-b border-border bg-green-50">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <span className="text-base">💰</span> Plan Económico · &lt; $2.000.000 COP
          </h3>
          <p className="text-[11px] text-muted-foreground mt-1">2 personas · 8 días · sin contar vuelos y alojamiento</p>
        </div>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {planEconomico.map((item, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-2.5 text-sm">
                <span className="text-foreground">{item.concepto}</span>
                <span className="font-mono font-semibold text-primary">{item.costo}</span>
              </div>
            ))}
            <div className="flex items-center justify-between px-4 py-3 bg-green-50">
              <span className="font-bold text-foreground">TOTAL ESTIMADO</span>
              <span className="font-mono font-bold text-green-700 text-lg">$1.380k - $1.930k</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Emergencias */}
      <Card>
        <div className="p-4 border-b border-border">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Phone className="h-4 w-4 text-red-600" />
            Emergencias 24/7
          </h3>
        </div>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {emergencyContacts.map((c, i) => (
              <div key={i} className="px-4 py-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">{c.label}</span>
                  <span className="font-mono font-semibold text-primary text-sm">{c.value}</span>
                </div>
                {c.note && <div className="text-[11px] text-muted-foreground mt-0.5">{c.note}</div>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Contactos clave */}
      <Card>
        <div className="p-4 border-b border-border">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Phone className="h-4 w-4 text-primary" />
            Contactos clave del viaje
          </h3>
        </div>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {keyContacts.map((c, i) => (
              <div key={i} className="px-4 py-2.5 flex items-center justify-between">
                <span className="text-sm text-foreground">{c.label}</span>
                {c.href ? (
                  <a
                    href={c.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono font-semibold text-primary text-sm hover:underline"
                  >
                    {c.value}
                  </a>
                ) : (
                  <span className="font-mono font-semibold text-primary text-sm">{c.value}</span>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Apps recomendadas */}
      <Card>
        <div className="p-4 border-b border-border">
          <h3 className="text-sm font-semibold">📱 Apps a descargar antes del viaje</h3>
        </div>
        <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {apps.map((app, i) => (
            <div key={i} className="border border-border rounded-md p-2.5">
              <div className="font-medium text-sm text-foreground">{app.name}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">{app.use}</div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Datos útiles */}
      <Card>
        <div className="p-4 border-b border-border">
          <h3 className="text-sm font-semibold">📋 Datos útiles</h3>
        </div>
        <CardContent className="p-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Moneda</span>
            <span className="font-medium">Peso Colombiano (COP) · 1 USD ≈ $4.000-$4.300</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Huso horario</span>
            <span className="font-medium">UTC-5 todo el año</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Clima Bogotá</span>
            <span className="font-medium">8-19°C · julio seco con chubascos vespertinos</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Altitud</span>
            <span className="font-medium">2.640 m s.n.m. · beber agua primer día</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Agua potable</span>
            <span className="font-medium">Sí, del grifo · llevar botella reutilizable</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Propinas</span>
            <span className="font-medium">10% suele estar incluido</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tarjetas</span>
            <span className="font-medium">Visa/MasterCard · llevar efectivo para mercado</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Electricidad</span>
            <span className="font-medium">110V · enchufe tipo A (EE.UU.)</span>
          </div>
        </CardContent>
      </Card>

      {/* Acciones urgentes */}
      <Card className="border-amber-400 bg-amber-50/50">
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-600" />
            Acciones urgentes antes del viaje
          </h3>
          <ul className="space-y-1.5 text-xs">
            <li className="flex gap-2">
              <span className="text-amber-600 font-bold">~5 jul 2026:</span>
              <span>Comprar boletas Tren Sabana en tuboleta.com (se agotan rápido)</span>
            </li>
            <li className="flex gap-2">
              <span className="text-amber-600 font-bold">~30 jun:</span>
              <span>Verificar cartelera Planetario julio 2026</span>
            </li>
            <li className="flex gap-2">
              <span className="text-amber-600 font-bold">Con 2-3 sem:</span>
              <span>Reservar tour Etnias Andantes Cementerio (+57 320 287 5066)</span>
            </li>
            <li className="flex gap-2">
              <span className="text-amber-600 font-bold">Antes de cada plan:</span>
              <span>Reconfirmar horarios por WhatsApp de cada restaurante</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
