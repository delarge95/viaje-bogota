'use client';

import { useMemo, useState } from 'react';
import { places, categoryLabels, type PlaceCategory } from '@/lib/travel-data';
import { useTravelStore } from '@/lib/travel-store';
import PlaceDetail from '@/components/place-detail';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { MapPin, Star, Check, Search, Mountain, Utensils, Bus, ShoppingBag, TreePine } from 'lucide-react';
import { cn } from '@/lib/utils';

const categoryFilters: { value: PlaceCategory | 'all'; label: string; icon: typeof MapPin }[] = [
  { value: 'all', label: 'Todos', icon: MapPin },
  { value: 'cultura', label: 'Cultura', icon: Mountain },
  { value: 'naturaleza', label: 'Naturaleza', icon: TreePine },
  { value: 'alojamiento', label: 'Alojamiento', icon: MapPin },
  { value: 'transporte', label: 'Transporte', icon: Bus },
  { value: 'compras', label: 'Compras', icon: ShoppingBag },
];

export default function LugaresList() {
  const setSelectedPlaceId = useTravelStore((s) => s.setSelectedPlaceId);
  const selectedPlaceId = useTravelStore((s) => s.selectedPlaceId);
  const [filter, setFilter] = useState<PlaceCategory | 'all'>('all');
  const [search, setSearch] = useState('');

  const lugares = useMemo(() => {
    return places
      .filter((p) => p.category !== 'restaurante' && p.category !== 'mercado')
      .filter((p) => filter === 'all' || p.category === filter)
      .filter((p) =>
        search === '' ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.address.toLowerCase().includes(search.toLowerCase())
      );
  }, [filter, search]);

  const selectedPlace = selectedPlaceId ? places.find((p) => p.id === selectedPlaceId) : null;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">Lugares para visitar</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          {lugares.length} sitios culturales, naturales y de transporte · Clic para ver detalles
        </p>
      </div>

      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar lugar o dirección..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
        <div className="flex gap-1 overflow-x-auto custom-scroll pb-1">
          {categoryFilters.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.value}
                onClick={() => setFilter(cat.value)}
                className={cn(
                  'flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all',
                  filter === cat.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/70'
                )}
              >
                <Icon className="h-3 w-3" />
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* List */}
        <div className="space-y-2">
          {lugares.map((place) => (
            <Card
              key={place.id}
              className={cn(
                'cursor-pointer hover:border-primary/50 hover:shadow-md transition-all overflow-hidden',
                selectedPlaceId === place.id && 'ring-1 ring-primary'
              )}
              onClick={() => setSelectedPlaceId(place.id)}
            >
              <CardContent className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="font-medium text-sm truncate">{place.name}</span>
                      {place.isBase && (
                        <Badge variant="outline" className="text-[9px] py-0 h-4">Base</Badge>
                      )}
                    </div>
                    <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-2.5 w-2.5 shrink-0" />
                      <span className="truncate">{place.address}</span>
                    </div>
                    {place.priceRange && (
                      <div className="text-[11px] text-primary font-medium mt-0.5">
                        {place.priceRange.split(' por')[0]}
                      </div>
                    )}
                  </div>
                  <Badge variant="secondary" className="text-[9px] py-0 h-4 shrink-0">
                    {place.category}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Detail panel */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          {selectedPlace ? (
            <PlaceDetail place={selectedPlace} onClose={() => setSelectedPlaceId(null)} />
          ) : (
            <Card className="border-dashed">
              <CardContent className="pt-6 text-center text-sm text-muted-foreground">
                <MapPin className="h-8 w-8 mx-auto mb-2 opacity-30" />
                Selecciona un lugar para ver horarios, contactos y detalles
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
