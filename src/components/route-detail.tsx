'use client';

import { useMemo } from 'react';
import {
  getPlaceById,
  getDistance,
  getEffectiveTransportMode,
  getEffectiveTransportDetails,
  type PlanStep,
  type TransportMode
} from '@/lib/travel-data';
import { useTravelStore } from '@/lib/travel-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Car,
  Bus,
  Footprints,
  Train,
  ArrowRight,
  MapPin,
  Clock,
  X,
  Navigation
} from 'lucide-react';
import { cn } from '@/lib/utils';

function parseMin(durationStr: string | undefined): number {
  if (!durationStr) return 0;
  const numbers = durationStr.match(/\d+/g);
  if (!numbers || numbers.length === 0) return 0;
  if (numbers.length === 2) {
    const val1 = parseInt(numbers[0], 10);
    const val2 = parseInt(numbers[1], 10);
    return Math.round((val1 + val2) / 2);
  }
  return parseInt(numbers[0], 10);
}


interface RouteDetailProps {
  step: PlanStep;
  stepIdx: number;
  onSelectTransport: (idx: number, mode: TransportMode) => void;
  onClose: () => void;
}

const transportMetadata: Record<TransportMode, { label: string; icon: typeof Bus; color: string; desc: string }> = {
  TM: { label: 'TransMilenio 🟥', icon: Bus, color: 'border-l-red-600 bg-red-50/10 dark:bg-red-950/5 text-red-700 dark:text-red-400', desc: 'Bus articulado rápido por carriles exclusivos en Bogotá.' },
  SITP: { label: 'Bus SITP 🟦', icon: Bus, color: 'border-l-blue-600 bg-blue-50/10 dark:bg-blue-950/5 text-blue-700 dark:text-blue-400', desc: 'Buses urbanos zonales que recorren toda la ciudad.' },
  Tren: { label: 'Tren Turístico 🚂', icon: Train, color: 'border-l-emerald-600 bg-emerald-50/10 dark:bg-emerald-950/5 text-emerald-700 dark:text-emerald-400', desc: 'Tren de la Sabana para paseos turísticos.' },
  Uber: { label: 'Uber / Cabify 🚗', icon: Car, color: 'border-l-yellow-600 bg-yellow-50/10 dark:bg-yellow-950/5 text-yellow-700 dark:text-yellow-400', desc: 'Vehículo privado, directo y cómodo.' },
  Cabify: { label: 'Cabify 🚗', icon: Car, color: 'border-l-yellow-600 bg-yellow-50/10 dark:bg-yellow-950/5 text-yellow-700 dark:text-yellow-400', desc: 'App de transporte privado local.' },
  Carro: { label: 'Carro Particular 🚗', icon: Car, color: 'border-l-slate-600 bg-slate-50/10 dark:bg-slate-950/5 text-slate-700 dark:text-slate-400', desc: 'Desplazamiento en carro propio.' },
  Taxi: { label: 'Taxi Oficial 🚖', icon: Car, color: 'border-l-yellow-500 bg-yellow-500/5 text-yellow-600 dark:text-yellow-300', desc: 'Taxis libres amarillos reglamentarios.' },
  Teleferico: { label: 'Teleférico / Funicular 🚠', icon: Car, color: 'border-l-purple-600 bg-purple-50/10 dark:bg-purple-950/5 text-purple-700 dark:text-purple-400', desc: 'Ascenso/descenso al Cerro de Monserrate.' },
  Caminata: { label: 'Caminata 🚶', icon: Footprints, color: 'border-l-green-600 bg-green-50/10 dark:bg-green-950/5 text-green-700 dark:text-green-400', desc: 'Caminata a pie. Evita el tráfico de la ciudad.' },
  Espera: { label: 'Espera ⏱️', icon: Clock, color: 'border-l-gray-400 bg-gray-50/10 text-gray-700', desc: 'Tiempo de espera en sitio.' },
  Interno: { label: 'Interno 🚶', icon: Footprints, color: 'border-l-green-600 bg-green-50/10 text-green-700', desc: 'Desplazamiento dentro del mismo sitio.' },
};

export default function RouteDetail({
  step,
  stepIdx,
  onSelectTransport,
  onClose,
}: RouteDetailProps) {
  const fromPlace = getPlaceById(step.fromPlaceId || '');
  const toPlace = getPlaceById(step.toPlaceId || '');

  // Calculate distance in km
  const distance = useMemo(() => {
    if (fromPlace && toPlace) {
      return getDistance(fromPlace.coords, toPlace.coords);
    }
    return 0;
  }, [fromPlace, toPlace]);

  // Formulate dynamic transport alternatives
  const alternatives = useMemo(() => {
    if (!fromPlace || !toPlace) return [];

    // If the step has predefined transport alternatives, we MUST use them!
    if (step.transportAlternatives && step.transportAlternatives.length > 0) {
      return step.transportAlternatives.map((alt) => ({
        mode: alt.mode,
        duration: alt.duration,
        cost: alt.cost,
        label: alt.label,
      }));
    }

    const list: { mode: TransportMode; duration: string; cost: string; label?: string }[] = [];

    // 1. Caminata (always show, but comment on it if too far)
    const walkDuration = Math.round(distance * 12 + 3);
    list.push({
      mode: 'Caminata',
      duration: `${walkDuration} min`,
      cost: 'Gratis',
    });

    // 2. TransMilenio (highly recommended for long distances near lines)
    const tmDuration = Math.round(distance * 4.5 + 12);
    list.push({
      mode: 'TM',
      duration: `${tmDuration} min`,
      cost: '$3.550 c/u',
    });

    // 3. Uber / Taxi (always relevant in Bogotá)
    const uberDuration = Math.round(distance * 3.5 + 4);
    const costK = Math.round(8 + distance * 2.2);
    list.push({
      mode: 'Uber',
      duration: `${uberDuration} min`,
      cost: `$${costK}.000`,
    });

    // 4. Taxi Oficial
    list.push({
      mode: 'Taxi',
      duration: `${uberDuration + 2} min`,
      cost: `$${Math.round(costK * 0.95)}.000`,
    });

    return list;
  }, [fromPlace, toPlace, distance, step]);

  const selectedTransport = useTravelStore((s) => s.selectedTransport);

  const currentMode = useMemo(() => {
    return getEffectiveTransportMode(step, selectedTransport);
  }, [step, selectedTransport]);

  const recommendedMode = useMemo(() => {
    if (step.transportAlternatives && step.transportAlternatives.length > 0) {
      const rec = step.transportAlternatives.find((a) => a.isRecommended) || step.transportAlternatives[0];
      return rec.mode;
    }
    return step.transportMode || 'Uber';
  }, [step]);

  const recommendedDuration = useMemo(() => {
    if (step.transportAlternatives && step.transportAlternatives.length > 0) {
      const rec = step.transportAlternatives.find((a) => a.isRecommended) || step.transportAlternatives[0];
      return rec.duration;
    }
    return step.transportDuration || '15 min';
  }, [step]);

  const delayMinutes = useMemo(() => {
    const selDetails = getEffectiveTransportDetails(step, selectedTransport);
    const recMin = parseMin(recommendedDuration);
    const selMin = parseMin(selDetails.duration);
    return selMin > recMin + 5 ? selMin - recMin : 0;
  }, [step, selectedTransport, recommendedDuration]);

  if (!fromPlace || !toPlace) {
    return (
      <Card className="border-border shadow-lg p-6 text-center text-xs text-muted-foreground">
        No se pudieron cargar los detalles de este trayecto.
      </Card>
    );
  }

  return (
    <Card className="border-border shadow-lg animate-fade-in-up bg-card overflow-hidden">
      <CardHeader className="pb-3 bg-primary/[0.01] border-b border-border">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary flex items-center gap-1">
              <Navigation className="h-3 w-3" /> Detalles de Ruta
            </span>
            <CardTitle className="text-base font-bold mt-1 leading-snug">
              Traslado: {fromPlace.name} → {toPlace.name}
            </CardTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {/* Origin / Destination Connection Visual */}
        <div className="bg-muted/30 p-3 rounded-xl border border-border/40 space-y-3 relative overflow-hidden">
          <div className="absolute right-3 top-3 opacity-15">
            <Navigation className="h-10 w-10 text-primary rotate-45" />
          </div>

          <div className="flex items-start gap-2.5 text-xs">
            <div className="flex flex-col items-center gap-1 mt-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-background ring-1 ring-emerald-500/20" />
              <div className="w-0.5 h-6 border-l border-dashed border-muted-foreground/30" />
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-background ring-1 ring-red-500/20" />
            </div>
            <div className="flex-1 space-y-3">
              <div className="min-w-0">
                <span className="text-[9px] font-extrabold uppercase text-muted-foreground/80">Salida</span>
                <p className="font-bold text-foreground truncate">{fromPlace.name}</p>
                <p className="text-[10px] text-muted-foreground truncate">{fromPlace.address}</p>
              </div>
              <div className="min-w-0">
                <span className="text-[9px] font-extrabold uppercase text-muted-foreground/80">Llegada</span>
                <p className="font-bold text-foreground truncate">{toPlace.name}</p>
                <p className="text-[10px] text-muted-foreground truncate">{toPlace.address}</p>
              </div>
            </div>
          </div>

          <Separator className="bg-border/60" />

          <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground">
            <span>Distancia física estimada:</span>
            <Badge variant="secondary" className="font-mono font-bold text-xs bg-primary/10 text-primary border-none">
              {distance.toFixed(2)} km
            </Badge>
          </div>
        </div>

        {/* Delay warning alert box */}
        {delayMinutes > 0 && (
          <div className="bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 p-3 rounded-xl text-xs flex items-start gap-2 animate-pulse">
            <span className="text-sm shrink-0">⚠️</span>
            <div className="space-y-0.5 flex-1">
              <p className="font-bold">Alerta de retraso</p>
              <p className="leading-normal">
                Esta opción sumará aproximadamente <span className="font-extrabold">{delayMinutes} minutos</span> al tiempo de traslado de hoy.
              </p>
              <Button
                variant="link"
                className="p-0 h-auto text-[11px] text-amber-800 dark:text-amber-300 underline font-bold mt-1.5 hover:opacity-80"
                onClick={() => onSelectTransport(stepIdx, recommendedMode)}
              >
                Restaurar medio recomendado ({recommendedMode})
              </Button>
            </div>
          </div>
        )}


        {/* Alternatives transport list */}
        <div className="space-y-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">
            Seleccionar Medio de Transporte:
          </span>

          <div className="space-y-2 max-h-[250px] overflow-y-auto custom-scroll pr-1">
            {alternatives.map((alt) => {
              const isSelected = currentMode === alt.mode;
              const meta = transportMetadata[alt.mode] || { label: alt.mode, icon: Car, color: 'border-l-gray-400', desc: '' };
              const ModeIcon = meta.icon;

              return (
                <div
                  key={alt.mode}
                  onClick={() => onSelectTransport(stepIdx, alt.mode)}
                  className={cn(
                    'flex items-center gap-3 border border-border/80 border-l-[4px] p-2.5 rounded-lg cursor-pointer transition-all hover:bg-muted/10',
                    meta.color,
                    isSelected ? 'ring-2 ring-primary border-primary bg-primary/[0.01]' : ''
                  )}
                >
                  <div className="p-1.5 rounded-full bg-background border shrink-0 text-foreground">
                    <ModeIcon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-bold text-xs text-foreground truncate">
                        {alt.label || meta.label}
                      </span>
                      <div className="flex gap-1.5 font-mono text-[10px] shrink-0 font-bold">
                        <span className="text-foreground">⏱️ {alt.duration}</span>
                        <span className="text-primary">💵 {alt.cost}</span>
                      </div>
                    </div>
                    <p className="text-[9.5px] text-muted-foreground leading-snug line-clamp-1 mt-0.5">
                      {meta.desc || `Traslado vía ${alt.mode}.`}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
