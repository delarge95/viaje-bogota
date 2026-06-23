'use client';

import { useMemo, useState } from 'react';
import { places, dayPlans, categoryLabels, categoryEmojis, type PlaceCategory, type RestaurantCategory, type Place } from '@/lib/travel-data';
import { useTravelStore } from '@/lib/travel-store';
import PlaceDetail from '@/components/place-detail';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, MapPin, Utensils, CalendarDays, Bus, Mountain, TreePine, ShoppingBag, Star, Check, Globe, Instagram, CalendarOff, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

type ExplorarTab = 'atracciones' | 'restaurantes' | 'dias' | 'transporte_alojamiento';

export default function ExplorarList() {
  const setSelectedPlaceId = useTravelStore((s) => s.setSelectedPlaceId);
  const selectedPlaceId = useTravelStore((s) => s.selectedPlaceId);
  const setSelectedDay = useTravelStore((s) => s.setSelectedDay);
  const setMainView = useTravelStore((s) => s.setMainView);

  const [activeTab, setActiveTab] = useState<ExplorarTab>('atracciones');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Sub-filters
  const [atraccionSubFilter, setAtraccionSubFilter] = useState<'all' | 'cultura' | 'naturaleza' | 'compras'>('all');
  const [restauranteSubFilter, setRestauranteSubFilter] = useState<'all' | RestaurantCategory>('all');

  // Filtered Places/Restaurants
  const items = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    
    if (activeTab === 'atracciones') {
      return places
        .filter((p) => p.category === 'cultura' || p.category === 'naturaleza' || p.category === 'compras')
        .filter((p) => atraccionSubFilter === 'all' || p.category === atraccionSubFilter)
        .filter((p) => !query || p.name.toLowerCase().includes(query) || p.address.toLowerCase().includes(query));
    }
    
    if (activeTab === 'restaurantes') {
      return places
        .filter((p) => p.category === 'restaurante' || p.category === 'mercado')
        .filter((p) => restauranteSubFilter === 'all' || p.restaurantCategory === restauranteSubFilter)
        .filter((p) => !query || p.name.toLowerCase().includes(query) || p.address.toLowerCase().includes(query));
    }
    
    if (activeTab === 'transporte_alojamiento') {
      return places
        .filter((p) => p.category === 'transporte' || p.category === 'alojamiento')
        .filter((p) => !query || p.name.toLowerCase().includes(query) || p.address.toLowerCase().includes(query));
    }
    
    return [];
  }, [activeTab, searchQuery, atraccionSubFilter, restauranteSubFilter]);

  // Selected Place (should not display if it's the days summary or doesn't belong to current tab data)
  const selectedPlace = useMemo(() => {
    if (!selectedPlaceId || activeTab === 'dias') return null;
    const p = places.find((x) => x.id === selectedPlaceId);
    if (!p) return null;
    
    // Safety check that selected place belongs to the currently viewed category
    if (activeTab === 'atracciones' && (p.category === 'cultura' || p.category === 'naturaleza' || p.category === 'compras')) return p;
    if (activeTab === 'restaurantes' && (p.category === 'restaurante' || p.category === 'mercado')) return p;
    if (activeTab === 'transporte_alojamiento' && (p.category === 'transporte' || p.category === 'alojamiento')) return p;
    
    return null;
  }, [selectedPlaceId, activeTab]);

  // Statistics for header
  const stats = useMemo(() => {
    const totalAtracciones = places.filter((p) => p.category === 'cultura' || p.category === 'naturaleza' || p.category === 'compras').length;
    const totalRestaurantes = places.filter((p) => p.category === 'restaurante' || p.category === 'mercado').length;
    const totalDays = dayPlans.length;
    return { totalAtracciones, totalRestaurantes, totalDays };
  }, []);

  return (
    <div className="space-y-4">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-2">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-foreground bg-clip-text">
            Explora la Guía de Viaje
          </h2>
          <p className="text-xs text-muted-foreground">
            {stats.totalAtracciones} atracciones · {stats.totalRestaurantes} restaurantes · {stats.totalDays} itinerarios diarios
          </p>
        </div>
      </div>

      {/* TABS SELECTOR */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 p-1 bg-muted/40 rounded-xl">
        <button
          onClick={() => { setActiveTab('atracciones'); setSelectedPlaceId(null); }}
          className={cn(
            'flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all',
            activeTab === 'atracciones'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Mountain className="h-3.5 w-3.5" />
          Atracciones
        </button>
        <button
          onClick={() => { setActiveTab('restaurantes'); setSelectedPlaceId(null); }}
          className={cn(
            'flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all',
            activeTab === 'restaurantes'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Utensils className="h-3.5 w-3.5" />
          Restaurantes
        </button>
        <button
          onClick={() => { setActiveTab('dias'); setSelectedPlaceId(null); }}
          className={cn(
            'flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all',
            activeTab === 'dias'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <CalendarDays className="h-3.5 w-3.5" />
          Planes por Día
        </button>
        <button
          onClick={() => { setActiveTab('transporte_alojamiento'); setSelectedPlaceId(null); }}
          className={cn(
            'flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all',
            activeTab === 'transporte_alojamiento'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Bus className="h-3.5 w-3.5" />
          Logística
        </button>
      </div>

      {/* SEARCH AND SUB-FILTERS */}
      {activeTab !== 'dias' && (
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, dirección o notas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs rounded-xl"
            />
          </div>

          {/* Atracciones Sub-filters */}
          {activeTab === 'atracciones' && (
            <div className="flex gap-1 overflow-x-auto custom-scroll pb-1">
              <button
                onClick={() => setAtraccionSubFilter('all')}
                className={cn(
                  'px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all whitespace-nowrap',
                  atraccionSubFilter === 'all'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/70'
                )}
              >
                Todos
              </button>
              <button
                onClick={() => setAtraccionSubFilter('cultura')}
                className={cn(
                  'flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all whitespace-nowrap',
                  atraccionSubFilter === 'cultura'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/70'
                )}
              >
                <Mountain className="h-3 w-3" /> Cultura
              </button>
              <button
                onClick={() => setAtraccionSubFilter('naturaleza')}
                className={cn(
                  'flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all whitespace-nowrap',
                  atraccionSubFilter === 'naturaleza'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/70'
                )}
              >
                <TreePine className="h-3 w-3" /> Naturaleza
              </button>
              <button
                onClick={() => setAtraccionSubFilter('compras')}
                className={cn(
                  'flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all whitespace-nowrap',
                  atraccionSubFilter === 'compras'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/70'
                )}
              >
                <ShoppingBag className="h-3 w-3" /> Compras
              </button>
            </div>
          )}

          {/* Restaurantes Sub-filters */}
          {activeTab === 'restaurantes' && (
            <div className="flex gap-1 overflow-x-auto custom-scroll pb-1">
              <button
                onClick={() => setRestauranteSubFilter('all')}
                className={cn(
                  'px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all whitespace-nowrap',
                  restauranteSubFilter === 'all'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/70'
                )}
              >
                Todos
              </button>
              {(['aleman', 'taqueria', 'lechona', 'chiguiro', 'tipica', 'italiana', 'mercado'] as RestaurantCategory[]).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setRestauranteSubFilter(cat)}
                  className={cn(
                    'px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all whitespace-nowrap',
                    restauranteSubFilter === cat
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/70'
                  )}
                >
                  {categoryEmojis[cat]} {categoryLabels[cat]}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TWO COLUMN GRID CONTENT */}
      {activeTab === 'dias' ? (
        /* Planes por Día uses full width since it takes you to Itinerary */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {dayPlans.map((day) => {
            const movilidad = day.plan.filter((s) => s.type === 'movilidad').length;
            const actividades = day.plan.filter((s) => s.type === 'actividad').length;
            const comidas = day.plan.filter((s) => s.type === 'comida').length;

            return (
              <Card
                key={day.day}
                className="cursor-pointer hover:border-primary/60 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 border-border/80 overflow-hidden bg-card"
                onClick={() => {
                  setSelectedDay(day.day);
                  setMainView('itinerario');
                }}
              >
                <CardContent className="p-4 flex flex-col justify-between h-full">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className="text-[10px] py-0.5 h-4.5 bg-primary/10 border-primary/25 text-primary hover:bg-primary/20" variant="outline">
                        Día {day.day}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground font-mono">{day.weekday.slice(0, 3)} {day.date}</span>
                      {day.isFeriado && (
                        <Badge variant="outline" className="text-[9px] py-0 h-4 text-amber-700 border-amber-400 bg-amber-50">
                          <CalendarOff className="h-2.5 w-2.5 mr-0.5" /> Feriado
                        </Badge>
                      )}
                      {day.isRestriccionMedica && (
                        <Badge variant="outline" className="text-[9px] py-0 h-4 text-red-700 border-red-300 bg-red-50">
                          <AlertTriangle className="h-2.5 w-2.5 mr-0.5" /> Pupilas
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-bold text-sm text-foreground leading-tight">{day.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">{day.subtitle}</p>
                  </div>

                  <div className="flex items-center justify-between gap-2 mt-4 pt-2.5 border-t border-border/60">
                    <div className="flex items-center gap-2.5 text-[10px] text-muted-foreground font-medium">
                      <span className="flex items-center gap-0.5" title="Trayectos">
                        <Bus className="h-3 w-3 text-orange-500" /> {movilidad}
                      </span>
                      <span className="flex items-center gap-0.5" title="Actividades">
                        <MapPin className="h-3 w-3 text-rose-500" /> {actividades}
                      </span>
                      <span className="flex items-center gap-0.5" title="Comida">
                        <Utensils className="h-3 w-3 text-amber-600" /> {comidas}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-primary font-mono">{day.estimatedCost}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        /* Atracciones, Restaurantes, Logística use a two-column split layout */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          
          {/* LEFT PANEL: Lists */}
          <div className="space-y-3.5">
            {activeTab === 'restaurantes' ? (
              // Grouped restaurant view
              <div className="space-y-4">
                {items.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic p-4 text-center">No se encontraron restaurantes con los filtros seleccionados.</p>
                ) : (
                  // Group restaurants by category
                  (() => {
                    const categoriesInView = new Set(items.map((i) => i.restaurantCategory || 'otros'));
                    const ordered = (['aleman', 'taqueria', 'lechona', 'chiguiro', 'tipica', 'italiana', 'mercado'] as RestaurantCategory[]).filter(
                      (cat) => categoriesInView.has(cat)
                    );

                    return ordered.map((cat) => {
                      const categoryItems = items.filter((p) => (p.restaurantCategory || 'otros') === cat);
                      if (categoryItems.length === 0) return null;
                      const main = categoryItems.find((p) => !p.isAlternative);
                      const alts = categoryItems.filter((p) => p.isAlternative);

                      return (
                        <div key={cat} className="space-y-2">
                          <div className="flex items-center gap-2 pb-1.5 border-b border-border/70">
                            <span className="text-base">{categoryEmojis[cat]}</span>
                            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{categoryLabels[cat]}</h3>
                            <Badge variant="secondary" className="text-[10px] h-4.5 ml-auto bg-muted">
                              {categoryItems.length}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {main && (
                              <PlaceCard
                                place={main}
                                isMain
                                isSelected={selectedPlaceId === main.id}
                                onClick={() => setSelectedPlaceId(main.id)}
                              />
                            )}
                            {alts.map((alt) => (
                              <PlaceCard
                                key={alt.id}
                                place={alt}
                                isSelected={selectedPlaceId === alt.id}
                                onClick={() => setSelectedPlaceId(alt.id)}
                              />
                            ))}
                          </div>
                        </div>
                      );
                    });
                  })()
                )}
              </div>
            ) : (
              // Standard list view for Atracciones and Logística
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {items.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic p-4 text-center sm:col-span-2">No se encontraron lugares.</p>
                ) : (
                  items.map((place) => (
                    <PlaceCard
                      key={place.id}
                      place={place}
                      isSelected={selectedPlaceId === place.id}
                      onClick={() => setSelectedPlaceId(place.id)}
                    />
                  ))
                )}
              </div>
            )}
          </div>

          {/* RIGHT PANEL: Sticky details */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            {selectedPlace ? (
              <PlaceDetail place={selectedPlace} onClose={() => setSelectedPlaceId(null)} />
            ) : (
              <Card className="border-dashed border-border bg-muted/10">
                <CardContent className="pt-8 pb-8 text-center text-xs text-muted-foreground">
                  {activeTab === 'restaurantes' ? (
                    <Utensils className="h-8 w-8 mx-auto mb-2.5 opacity-25 text-primary" />
                  ) : (
                    <MapPin className="h-8 w-8 mx-auto mb-2.5 opacity-25 text-primary" />
                  )}
                  Selecciona un lugar para ver horarios, menú, contactos y enlaces de mapas.
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface PlaceCardProps {
  place: Place;
  isMain?: boolean;
  isSelected?: boolean;
  onClick: () => void;
}

function PlaceCard({ place, isMain, isSelected, onClick }: PlaceCardProps) {
  // Safe googleMapsUrl fallback
  const mapUrl = place.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + ' ' + place.address)}`;

  return (
    <Card
      onClick={onClick}
      className={cn(
        'cursor-pointer hover:border-primary/60 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200 overflow-hidden bg-card border-border/80 flex flex-col justify-between min-h-[110px]',
        isMain && 'ring-1 ring-primary/20',
        isSelected && 'ring-1 ring-primary border-primary bg-primary/[0.03]'
      )}
    >
      <CardContent className="p-3 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-1.5 mb-1">
            <div className="flex items-center gap-1 flex-wrap min-w-0">
              <span className="font-semibold text-xs text-foreground truncate max-w-[140px] sm:max-w-[160px]">
                {place.name}
              </span>
              {isMain && (
                <Badge variant="outline" className="text-[9px] py-0 px-1 h-3.5 text-primary border-primary/30">
                  Principal
                </Badge>
              )}
              {place.isAlternative && (
                <Badge variant="outline" className="text-[9px] py-0 px-1 h-3.5 text-muted-foreground border-border">
                  Alt
                </Badge>
              )}
            </div>
            
            {place.meetsCriteria && (
              <span className="inline-flex items-center gap-0.5 text-[8.5px] text-green-700 font-bold bg-green-50 dark:bg-green-950/20 dark:text-green-300 px-1 py-0.5 rounded shrink-0">
                <Check className="h-2 w-2" /> &gt;1k · ≥4/5
              </span>
            )}
          </div>
          
          <div className="text-[10px] text-muted-foreground line-clamp-1 flex items-center gap-0.5">
            <MapPin className="h-2.5 w-2.5 shrink-0 text-muted-foreground/60" />
            <span className="truncate">{place.address}</span>
          </div>
        </div>

        {/* Rating and price line */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/40 text-[10px]">
          <div className="flex items-center gap-2">
            {place.rating && place.rating.score > 0 ? (
              <div className="flex items-center gap-0.5">
                <Star className="h-2.5 w-2.5 text-amber-500 fill-amber-500" />
                <span className="font-bold text-foreground">{place.rating.score}</span>
                <span className="text-[9px] text-muted-foreground">({place.rating.reviews})</span>
              </div>
            ) : (
              <span className="text-muted-foreground/60 text-[9px] italic">Sin calificar</span>
            )}
            {place.priceRange && (
              <span className="text-primary font-semibold text-[9.5px]">
                {place.priceRange.split(' por')[0]}
              </span>
            )}
          </div>

          {/* Icon Link Badge Row */}
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 hover:bg-muted text-muted-foreground hover:text-primary rounded transition-colors"
              onClick={(e) => e.stopPropagation()}
              title="Ver en Google Maps"
            >
              <MapPin className="h-3 w-3" />
            </a>
            {place.web && (
              <a
                href={place.web}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 hover:bg-muted text-muted-foreground hover:text-primary rounded transition-colors"
                onClick={(e) => e.stopPropagation()}
                title="Visitar sitio web"
              >
                <Globe className="h-3 w-3" />
              </a>
            )}
            {place.instagram && (
              <a
                href={place.instagram.startsWith('@') ? `https://instagram.com/${place.instagram.slice(1)}` : `https://instagram.com/${place.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 hover:bg-muted text-muted-foreground hover:text-primary rounded transition-colors"
                onClick={(e) => e.stopPropagation()}
                title="Ver Instagram"
              >
                <Instagram className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
