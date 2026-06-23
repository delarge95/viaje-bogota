'use client';

import { useState, useMemo } from 'react';
import { dayPlans, getPlaceById, places, type PlanStep, type CustomPlan, type TransportMode } from '@/lib/travel-data';
import { useTravelStore } from '@/lib/travel-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Copy, Edit3, Save, X, Bus, Car, Footprints, MapPin, Utensils, Clock, ArrowUp, ArrowDown, Search, Sparkles, Check, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

// Helper to calculate distance in km between two Bogotá coordinates
const getDistance = (c1: [number, number], c2: [number, number]): number => {
  const dx = (c2[1] - c1[1]) * 110.8;
  const dy = (c2[0] - c1[0]) * 111.0;
  return Math.sqrt(dx * dx + dy * dy);
};

// Automatical Route & Cost Recalculation engine
const recomputeCustomPlanSteps = (steps: PlanStep[]): PlanStep[] => {
  return steps.map((step, idx) => {
    // If mobility step, resolve fromPlaceId & toPlaceId from nearest activities
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
      // For standard steps, automatically assign the correct place details
      const place = getPlaceById(step.placeId);
      if (place && (!step.activity || step.activity === 'Nueva actividad' || step.activity.startsWith('Visita a '))) {
        step.activity = `Visita a ${place.name}`;
      }
    }
    return step;
  });
};

export default function PlanEditor() {
  const customPlans = useTravelStore((s) => s.customPlans);
  const addCustomPlan = useTravelStore((s) => s.addCustomPlan);
  const updateCustomPlan = useTravelStore((s) => s.updateCustomPlan);
  const deleteCustomPlan = useTravelStore((s) => s.deleteCustomPlan);
  const setMainView = useTravelStore((s) => s.setMainView);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editSteps, setEditSteps] = useState<PlanStep[]>([]);

  const startNewPlan = (basedOnDay?: number) => {
    const id = `custom-${Date.now()}`;
    const baseSteps = basedOnDay
      ? dayPlans.find((d) => d.day === basedOnDay)?.plan.map((s) => ({ ...s, id: `${id}-${s.id}` })) || []
      : [];
    const plan: CustomPlan = {
      id,
      name: basedOnDay ? `Plan personalizado - Basado en Día ${basedOnDay}` : 'Mi plan personalizado',
      description: basedOnDay ? `Itinerario modificado a partir del día ${basedOnDay}` : 'Crea tu propio itinerario en Bogotá',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      basedOnDay,
      steps: recomputeCustomPlanSteps(baseSteps),
    };
    addCustomPlan(plan);
    setEditingId(id);
    setEditName(plan.name);
    setEditDesc(plan.description);
    setEditSteps(plan.steps);
  };

  const startEdit = (plan: CustomPlan) => {
    setEditingId(plan.id);
    setEditName(plan.name);
    setEditDesc(plan.description);
    setEditSteps([...plan.steps]);
  };

  const saveEdit = () => {
    if (!editingId) return;
    updateCustomPlan(editingId, {
      name: editName,
      description: editDesc,
      steps: editSteps,
    });
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const addStep = () => {
    const newStep: PlanStep = {
      id: `step-${Date.now()}`,
      time: '12:00 PM',
      type: 'actividad',
      activity: 'Nueva actividad',
    };
    const recomputed = recomputeCustomPlanSteps([...editSteps, newStep]);
    setEditSteps(recomputed);
  };

  const removeStep = (stepId: string) => {
    const recomputed = recomputeCustomPlanSteps(editSteps.filter((s) => s.id !== stepId));
    setEditSteps(recomputed);
  };

  const moveStep = (stepId: string, direction: 'up' | 'down') => {
    const idx = editSteps.findIndex((s) => s.id === stepId);
    if (idx === -1) return;
    const newIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= editSteps.length) return;
    const newSteps = [...editSteps];
    [newSteps[idx], newSteps[newIdx]] = [newSteps[newIdx], newSteps[idx]];
    const recomputed = recomputeCustomPlanSteps(newSteps);
    setEditSteps(recomputed);
  };

  const updateStep = (stepId: string, updates: Partial<PlanStep>) => {
    const rawSteps = editSteps.map((s) => (s.id === stepId ? { ...s, ...updates } : s));
    const recomputed = recomputeCustomPlanSteps(rawSteps);
    setEditSteps(recomputed);
  };

  const viewPlan = (plan: CustomPlan) => {
    useTravelStore.getState().setActiveCustomPlan(plan.id);
    useTravelStore.getState().setMainView('itinerario');
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold">Mi Plan Personalizado</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Construye tu itinerario interactivo y calcula rutas en tiempo real.
        </p>
      </div>

      {/* Create new plan options */}
      <Card className="border-primary/20 bg-primary/[0.02]">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Plus className="h-4 w-4 text-primary" />
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Crear nuevo plan</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="default" onClick={() => startNewPlan()} className="text-xs font-semibold">
              <Plus className="h-3.5 w-3.5 mr-1" /> Desde cero
            </Button>
            {dayPlans.map((day) => (
              <Button
                key={day.day}
                size="sm"
                variant="outline"
                onClick={() => startNewPlan(day.day)}
                className="text-xs font-semibold"
              >
                <Copy className="h-3.5 w-3.5 mr-1 text-primary/70" />
                Basado en Día {day.day}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* List of custom plans */}
      {customPlans.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="pt-8 pb-8 text-center text-xs text-muted-foreground">
            <Edit3 className="h-8 w-8 mx-auto mb-2.5 opacity-30 text-primary animate-pulse" />
            Aún no has creado planes personalizados.
            <br />
            Utiliza las opciones de arriba para generar uno basado en la agenda.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {customPlans.map((plan) => (
            <Card key={plan.id} className="overflow-hidden border-border/80 shadow-sm">
              {editingId === plan.id ? (
                /* Edit mode */
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center justify-between gap-2 border-b border-border pb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">Editando plan personalizado</span>
                    <div className="flex gap-1.5">
                      <Button size="sm" variant="default" onClick={saveEdit} className="h-7 text-xs font-semibold px-3">
                        <Save className="h-3.5 w-3.5 mr-1" /> Guardar
                      </Button>
                      <Button size="sm" variant="ghost" onClick={cancelEdit} className="h-7 text-xs px-2.5">
                        <X className="h-3.5 w-3.5 mr-1" /> Cancelar
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Nombre del Plan</label>
                        <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="h-8 mt-1 text-xs rounded-lg" />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Descripción</label>
                        <Input value={editDesc} onChange={(e) => setEditDesc(e.target.value)} className="h-8 mt-1 text-xs rounded-lg" />
                      </div>
                    </div>
                  </div>

                  {/* Steps editor */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between border-b border-border/60 pb-1.5">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Pasos del itinerario ({editSteps.length})</span>
                      <Button size="sm" variant="outline" onClick={addStep} className="h-6 text-[10px] font-semibold border-primary/30 text-primary hover:bg-primary/5">
                        <Plus className="h-3 w-3 mr-0.5" /> Añadir actividad
                      </Button>
                    </div>
                    
                    <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1 custom-scroll">
                      {editSteps.map((step, idx) => (
                        <StepEditorCard
                          key={step.id}
                          step={step}
                          index={idx}
                          total={editSteps.length}
                          allSteps={editSteps}
                          onUpdate={(updates) => updateStep(step.id, updates)}
                          onRemove={() => removeStep(step.id)}
                          onMove={(dir) => moveStep(step.id, dir)}
                        />
                      ))}
                    </div>
                  </div>
                </CardContent>
              ) : (
                /* View mode */
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm text-foreground">{plan.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{plan.description}</p>
                      <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground font-medium flex-wrap">
                        <Badge variant="outline" className="text-[9px] py-0 h-4 bg-muted/30">
                          {plan.steps.length} pasos
                        </Badge>
                        <span>·</span>
                        <span className="font-mono">{plan.steps.filter((s) => s.isMovement).length} trayectos</span>
                        {plan.basedOnDay && (
                          <>
                            <span>·</span>
                            <span>Basado en Día {plan.basedOnDay}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1.5 shrink-0 sm:self-center">
                      <Button size="sm" variant="default" onClick={() => viewPlan(plan)} className="h-8 text-xs font-semibold px-3">
                        Activar y ver
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => startEdit(plan)} className="h-8 text-xs px-2.5">
                        <Edit3 className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => deleteCustomPlan(plan.id)} className="h-8 text-xs text-destructive hover:bg-destructive/10 px-2.5">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

interface StepEditorCardProps {
  step: PlanStep;
  index: number;
  total: number;
  allSteps: PlanStep[];
  onUpdate: (updates: Partial<PlanStep>) => void;
  onRemove: () => void;
  onMove: (dir: 'up' | 'down') => void;
}

function StepEditorCard({
  step,
  index,
  total,
  allSteps,
  onUpdate,
  onRemove,
  onMove,
}: StepEditorCardProps) {
  const [showSwap, setShowSwap] = useState(false);
  const [swapSearch, setSwapSearch] = useState('');

  const typeIcons = {
    movilidad: Bus,
    actividad: MapPin,
    comida: Utensils,
    compra: MapPin,
    espera: Clock,
    info: Info,
  };
  const Icon = typeIcons[step.type] || MapPin;

  // Resolve current active place (if any)
  const place = step.placeId ? getPlaceById(step.placeId) : null;
  const fromPlace = step.fromPlaceId ? getPlaceById(step.fromPlaceId) : null;
  const toPlace = step.toPlaceId ? getPlaceById(step.toPlaceId) : null;

  // Calculate coordinates reference (where the user is coming from)
  const getRefCoords = (): [number, number] => {
    for (let i = index - 1; i >= 0; i--) {
      const s = allSteps[i];
      if (s.placeId) {
        const p = getPlaceById(s.placeId);
        if (p && p.coords) return p.coords;
      }
    }
    return [4.6760, -74.0520]; // Default to Calle 94 accommodation
  };

  const refCoords = getRefCoords();
  const refPlaceName = useMemo(() => {
    for (let i = index - 1; i >= 0; i--) {
      const s = allSteps[i];
      if (s.placeId) {
        const p = getPlaceById(s.placeId);
        if (p) return p.name;
      }
    }
    return 'Alojamiento Calle 94';
  }, [index, allSteps]);

  // Sort other places by physical proximity to refCoords
  const proximityPlaces = useMemo(() => {
    return places
      .filter((p) => p.id !== 'alojamiento' && p.coords && p.category !== 'transporte' && p.id !== step.placeId)
      .map((p) => {
        const distance = getDistance(refCoords, p.coords);
        return { ...p, distance };
      })
      .sort((a, b) => a.distance - b.distance);
  }, [refCoords, step.placeId]);

  // Filter list by user search
  const filteredPlaces = useMemo(() => {
    const q = swapSearch.toLowerCase().trim();
    if (!q) return proximityPlaces;
    return proximityPlaces.filter((p) => p.name.toLowerCase().includes(q) || p.address.toLowerCase().includes(q));
  }, [proximityPlaces, swapSearch]);

  const stepColorClass = {
    movilidad: 'border-l-orange-500 bg-orange-50/5',
    actividad: 'border-l-indigo-500 bg-indigo-50/5',
    comida: 'border-l-amber-500 bg-amber-50/5',
    compra: 'border-l-rose-500 bg-rose-50/5',
    espera: 'border-l-slate-400 bg-slate-50/5',
    info: 'border-l-sky-500 bg-sky-50/5',
  }[step.type] || 'border-l-border bg-card';

  return (
    <div className={cn("border border-border/80 border-l-[4px] rounded-xl p-3 space-y-2.5 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.01)]", stepColorClass)}>
      {/* Top control row */}
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="text-[10px] h-5 font-bold uppercase tracking-wider text-muted-foreground bg-background">
          Paso {index + 1}
        </Badge>
        
        <Input
          value={step.time}
          onChange={(e) => onUpdate({ time: e.target.value })}
          className="h-7 text-xs font-mono font-bold w-24 bg-background rounded-md text-center border-border/60"
          placeholder="Ej: 12:00 PM"
        />

        <select
          value={step.type}
          onChange={(e) => {
            const newType = e.target.value as PlanStep['type'];
            onUpdate({
              type: newType,
              // reset properties when swapping type
              placeId: newType === 'movilidad' ? undefined : step.placeId || 'alojamiento',
              isMovement: newType === 'movilidad',
            });
          }}
          className="h-7 text-xs rounded-md border border-border/60 bg-background px-1.5 font-medium"
        >
          <option value="movilidad">🚌 Movilidad</option>
          <option value="actividad">📍 Actividad</option>
          <option value="comida">🍽️ Comida</option>
          <option value="compra">🛍️ Compra</option>
          <option value="espera">⏱️ Espera</option>
          <option value="info">ℹ️ Info</option>
        </select>

        {/* Action icons */}
        <div className="flex gap-0.5 ml-auto shrink-0">
          <button
            onClick={() => onMove('up')}
            disabled={index === 0}
            className="p-1 hover:bg-muted text-muted-foreground rounded-md disabled:opacity-20"
            title="Subir"
          >
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onMove('down')}
            disabled={index === total - 1}
            className="p-1 hover:bg-muted text-muted-foreground rounded-md disabled:opacity-20"
            title="Bajar"
          >
            <ArrowDown className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onRemove}
            className="p-1 hover:bg-destructive/10 text-destructive rounded-md"
            title="Eliminar"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Description input */}
      <div className="space-y-1">
        <label className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Actividad / Descripción</label>
        <Input
          value={step.activity}
          onChange={(e) => onUpdate({ activity: e.target.value })}
          className="h-8 text-xs bg-background rounded-lg border-border/60 font-semibold"
          placeholder="Ej: Visita al Museo Botero o Almuerzo en restaurante..."
        />
      </div>

      {/* MOBILITY FIELDS */}
      {step.type === 'movilidad' && (
        <div className="space-y-2 bg-muted/40 p-2.5 rounded-lg border border-border/40 text-xs">
          <div className="flex flex-wrap items-center gap-1.5 justify-between">
            <span className="text-[10px] font-bold text-muted-foreground">Ruta Auto-calculada:</span>
            <div className="flex gap-2">
              {step.transportDuration && <Badge className="text-[9.5px] py-0 h-4 bg-primary/10 border-primary/20 text-primary" variant="outline">⏱️ {step.transportDuration}</Badge>}
              {step.transportCost && <Badge className="text-[9.5px] py-0 h-4 bg-primary/10 border-primary/20 text-primary font-mono" variant="outline">💵 {step.transportCost}</Badge>}
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-[11px] truncate max-w-[130px] text-foreground">{fromPlace?.name || 'Origen no detectado'}</span>
            <span className="text-muted-foreground">→</span>
            <span className="font-semibold text-[11px] truncate max-w-[130px] text-primary">{toPlace?.name || 'Destino no detectado'}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="space-y-0.5">
              <label className="text-[8.5px] uppercase tracking-wider text-muted-foreground font-bold">Modo de Transporte</label>
              <select
                value={step.transportMode || ''}
                onChange={(e) => onUpdate({ transportMode: e.target.value as TransportMode })}
                className="h-7 text-xs rounded-md border border-border/60 bg-background px-1.5 w-full font-medium"
              >
                <option value="Caminata">🚶 Caminata</option>
                <option value="Uber">🚗 Uber</option>
                <option value="Cabify">🚗 Cabify</option>
                <option value="TM">🚌 TransMilenio</option>
                <option value="SITP">🚌 SITP</option>
                <option value="Taxi">🚖 Taxi</option>
                <option value="Carro">🚘 Carro Particular</option>
                <option value="Tren">🚊 Tren Sabana</option>
              </select>
            </div>
            <div className="space-y-0.5">
              <label className="text-[8.5px] uppercase tracking-wider text-muted-foreground font-bold">Notas de ruta</label>
              <Input
                value={step.transportNotes || ''}
                onChange={(e) => onUpdate({ transportNotes: e.target.value })}
                className="h-7 text-[11px] bg-background border-border/60"
                placeholder="Ej: Salir por NQS..."
              />
            </div>
          </div>
        </div>
      )}

      {/* DESTINATION FIELDS */}
      {step.type !== 'movilidad' && (
        <div className="space-y-2">
          {place ? (
            <div className="bg-background border border-border/70 rounded-lg p-2.5 flex items-start gap-2 justify-between">
              <div className="min-w-0 space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="font-bold text-xs text-foreground truncate">{place.name}</span>
                </div>
                <div className="text-[10px] text-muted-foreground truncate">{place.address}</div>
                {place.priceRange && (
                  <div className="text-[9.5px] text-primary/95 font-bold">Rango precios: {place.priceRange.split(' por')[0]}</div>
                )}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-[10px] shrink-0 border-primary/20 text-primary font-semibold"
                onClick={() => setShowSwap(!showSwap)}
              >
                {showSwap ? 'Cerrar' : 'Reemplazar Lugar'}
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs font-semibold h-8 border-dashed border-primary/30 text-primary"
                onClick={() => setShowSwap(true)}
              >
                <MapPin className="h-3.5 w-3.5 mr-1" /> Asignar Lugar de Destino
              </Button>
            </div>
          )}

          {/* Swap list popup */}
          {showSwap && (
            <Card className="border-primary/25 bg-muted/20 mt-1 shadow-inner overflow-hidden">
              <CardHeader className="p-2 border-b border-border/55 bg-background flex flex-row items-center gap-2 space-y-0">
                <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <Input
                  value={swapSearch}
                  onChange={(e) => setSwapSearch(e.target.value)}
                  placeholder="Buscar sitios por nombre..."
                  className="h-6 text-xs bg-muted/20 border-none outline-none shadow-none focus-visible:ring-0 w-full"
                />
                <Button size="sm" variant="ghost" onClick={() => { setShowSwap(false); setSwapSearch(''); }} className="h-6 w-6 p-0 shrink-0">
                  <X className="h-3.5 w-3.5" />
                </Button>
              </CardHeader>
              <CardContent className="p-2 space-y-1.5 max-h-[160px] overflow-y-auto custom-scroll">
                <div className="text-[9px] font-extrabold uppercase tracking-wider text-muted-foreground px-1 pb-1">
                  Sugerencias por cercanía a: <span className="text-primary font-bold">{refPlaceName}</span>
                </div>
                {filteredPlaces.length === 0 ? (
                  <p className="text-[10px] text-muted-foreground italic p-2 text-center">No se encontraron lugares.</p>
                ) : (
                  filteredPlaces.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        onUpdate({
                          placeId: p.id,
                          activity: `Visita a ${p.name}`,
                        });
                        setShowSwap(false);
                        setSwapSearch('');
                      }}
                      className="w-full text-left p-1.5 text-xs hover:bg-primary/5 hover:text-primary rounded-md border border-transparent hover:border-primary/20 bg-background flex items-center justify-between gap-2 transition-all"
                    >
                      <div className="min-w-0">
                        <div className="font-semibold text-[11px] truncate text-foreground">{p.name}</div>
                        <div className="text-[9px] text-muted-foreground truncate">{p.address}</div>
                      </div>
                      <Badge variant="secondary" className="text-[9px] py-0 h-4 px-1.5 font-mono shrink-0">
                        {p.distance.toFixed(1)} km
                      </Badge>
                    </button>
                  ))
                )}
              </CardContent>
            </Card>
          )}

          {/* Notes input */}
          <div className="space-y-1">
            <label className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Notas / Indicaciones</label>
            <Input
              value={step.notes || ''}
              onChange={(e) => onUpdate({ notes: e.target.value })}
              className="h-7 text-xs bg-background border-border/60"
              placeholder="Ej: Reservar entrada, llevar efectivo, etc."
            />
          </div>
        </div>
      )}
    </div>
  );
}
