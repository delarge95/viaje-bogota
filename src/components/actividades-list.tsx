'use client';

import { useMemo } from 'react';
import { dayPlans, getPlaceById } from '@/lib/travel-data';
import { useTravelStore } from '@/lib/travel-store';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarOff, AlertTriangle, Clock, MapPin, Bus, Car, Footprints, Utensils, ShoppingBag, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const stepTypeIcons = {
  movilidad: Bus,
  actividad: MapPin,
  comida: Utensils,
  compra: ShoppingBag,
  espera: Clock,
  info: Sparkles,
};

export default function ActividadesList() {
  const setSelectedDay = useTravelStore((s) => s.setSelectedDay);
  const setMainView = useTravelStore((s) => s.setMainView);

  const totalSteps = useMemo(() => {
    return dayPlans.reduce((acc, day) => acc + day.plan.length, 0);
  }, []);

  const totalMovilidad = useMemo(() => {
    return dayPlans.reduce((acc, day) => acc + day.plan.filter((s) => s.type === 'movilidad').length, 0);
  }, []);

  const totalComida = useMemo(() => {
    return dayPlans.reduce((acc, day) => acc + day.plan.filter((s) => s.type === 'comida').length, 0);
  }, []);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold">Actividades y planes</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          {dayPlans.length} días · {totalSteps} pasos · {totalMovilidad} trayectos · {totalComida} comidas
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <Card className="p-3 bg-orange-50/50 border-orange-200">
          <div className="flex items-center gap-2">
            <Bus className="h-4 w-4 text-orange-600" />
            <div>
              <div className="text-lg font-bold text-orange-600">{totalMovilidad}</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Trayectos</div>
            </div>
          </div>
        </Card>
        <Card className="p-3 bg-rose-50/50 border-rose-200">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-rose-600" />
            <div>
              <div className="text-lg font-bold text-rose-600">
                {dayPlans.reduce((acc, d) => acc + d.plan.filter((s) => s.type === 'actividad').length, 0)}
              </div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Actividades</div>
            </div>
          </div>
        </Card>
        <Card className="p-3 bg-amber-50/50 border-amber-200">
          <div className="flex items-center gap-2">
            <Utensils className="h-4 w-4 text-amber-700" />
            <div>
              <div className="text-lg font-bold text-amber-700">{totalComida}</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Comidas</div>
            </div>
          </div>
        </Card>
        <Card className="p-3 bg-violet-50/50 border-violet-200">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-violet-600" />
            <div>
              <div className="text-lg font-bold text-violet-600">
                {dayPlans.reduce((acc, d) => acc + d.plan.filter((s) => s.type === 'compra').length, 0)}
              </div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Compras</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Days list */}
      <div className="space-y-3">
        {dayPlans.map((day) => {
          const movilidad = day.plan.filter((s) => s.type === 'movilidad').length;
          const actividades = day.plan.filter((s) => s.type === 'actividad').length;
          const comidas = day.plan.filter((s) => s.type === 'comida').length;

          return (
            <Card
              key={day.day}
              className="cursor-pointer hover:border-primary/50 hover:shadow-md transition-all overflow-hidden"
              onClick={() => {
                setSelectedDay(day.day);
                setMainView('itinerario');
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs font-mono font-bold text-primary">Día {day.day}</span>
                      <span className="text-xs text-muted-foreground">{day.weekday} {day.date}</span>
                      {day.isFeriado && (
                        <Badge variant="outline" className="text-[9px] py-0 h-4 text-amber-700 border-amber-400 bg-amber-50">
                          <CalendarOff className="h-2.5 w-2.5 mr-0.5" /> Feriado
                        </Badge>
                      )}
                      {day.isRestriccionMedica && (
                        <Badge variant="outline" className="text-[9px] py-0 h-4 text-red-700 border-red-300 bg-red-50">
                          <AlertTriangle className="h-2.5 w-2.5 mr-0.5" /> Médico
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-semibold text-sm leading-tight">{day.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{day.subtitle}</p>

                    {/* Step type summary */}
                    <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Bus className="h-3 w-3 text-orange-600" /> {movilidad}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-rose-600" /> {actividades}
                      </span>
                      <span className="flex items-center gap-1">
                        <Utensils className="h-3 w-3 text-amber-700" /> {comidas}
                      </span>
                    </div>

                    {/* Alternatives */}
                    {day.alternatives && day.alternatives.length > 0 && (
                      <div className="flex items-center gap-1 mt-2 flex-wrap">
                        <Sparkles className="h-3 w-3 text-primary" />
                        {day.alternatives.map((alt, i) => (
                          <Badge key={i} variant="secondary" className="text-[9px] py-0 h-4">
                            {alt.label.split(' · ')[0]}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[9px] uppercase tracking-wide text-muted-foreground">2 pers.</div>
                    <div className="text-xs font-bold text-primary">{day.estimatedCost}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
