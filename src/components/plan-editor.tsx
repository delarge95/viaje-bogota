'use client';

import { useState, useMemo } from 'react';
import {
  dayPlans,
  getPlaceById,
  places,
  getDistance,
  reconstructSteps,
  recomputeCustomPlanSteps,
  type PlanStep,
  type CustomPlan
} from '@/lib/travel-data';
import { useTravelStore } from '@/lib/travel-store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Plus,
  Trash2,
  Copy,
  Edit3,
  Save,
  X,
  MapPin,
  Search,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';

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

  // Side-by-side editing states
  const [activeSwapIdx, setActiveSwapIdx] = useState<number | null>(null);
  const [swapSearch, setSwapSearch] = useState('');
  const [editingTimeIdx, setEditingTimeIdx] = useState<number | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Sub-filter of activities
  const activitiesOnly = useMemo(() => {
    return editSteps.filter((s) => s.type !== 'movilidad');
  }, [editSteps]);

  const startNewPlan = (basedOnDay?: number) => {
    const id = `custom-${Date.now()}`;
    const baseSteps = basedOnDay
      ? dayPlans.find((d) => d.day === basedOnDay)?.plan.map((s) => ({ ...s, id: `${id}-${s.id}` })) || []
      : [];
    const plan: CustomPlan = {
      id,
      name: basedOnDay ? `Mi Plan - Día ${basedOnDay}` : 'Mi plan personalizado',
      description: basedOnDay ? `Itinerario personalizado del día ${basedOnDay}` : 'Crea tu propio itinerario en Bogotá',
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
    setActiveSwapIdx(null);
  };

  const startEdit = (plan: CustomPlan) => {
    setEditingId(plan.id);
    setEditName(plan.name);
    setEditDesc(plan.description);
    setEditSteps([...plan.steps]);
    setActiveSwapIdx(null);
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

  const handleAddActivity = () => {
    const newStep: PlanStep = {
      id: `step-${Date.now()}`,
      time: '12:00 PM',
      type: 'actividad',
      placeId: 'alojamiento',
      activity: 'Nueva actividad',
    };
    const updatedActivities = [...activitiesOnly, newStep];
    const newSteps = reconstructSteps(updatedActivities);
    setEditSteps(newSteps);
    setActiveSwapIdx(updatedActivities.length - 1);
  };

  const handleRemoveActivity = (idx: number) => {
    const updatedActivities = activitiesOnly.filter((_, i) => i !== idx);
    const newSteps = reconstructSteps(updatedActivities);
    setEditSteps(newSteps);
    setActiveSwapIdx(null);
  };

  const handleUpdateActivity = (idx: number, updates: Partial<PlanStep>) => {
    const updatedActivities = activitiesOnly.map((act, i) =>
      i === idx ? { ...act, ...updates } : act
    );
    const newSteps = reconstructSteps(updatedActivities);
    setEditSteps(newSteps);
  };

  // Drag & Drop native handlers
  const handleDragStart = (idx: number) => {
    setDraggedIndex(idx);
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
  };

  const handleDrop = (targetIdx: number) => {
    if (draggedIndex === null || draggedIndex === targetIdx) return;
    const updatedActivities = [...activitiesOnly];
    const [removed] = updatedActivities.splice(draggedIndex, 1);
    updatedActivities.splice(targetIdx, 0, removed);

    const newSteps = reconstructSteps(updatedActivities);
    setEditSteps(newSteps);
    setDraggedIndex(null);
    setActiveSwapIdx(targetIdx);
  };

  const viewPlan = (plan: CustomPlan) => {
    useTravelStore.getState().setActiveCustomPlan(plan.id);
    useTravelStore.getState().setMainView('itinerario');
  };

  // Proximity sorting logic for candidate suggestions
  const refCoords = useMemo((): [number, number] => {
    if (activeSwapIdx === null || activeSwapIdx === 0) {
      return [4.6760, -74.0520]; // Default: Calle 94 lodging
    }
    const prevAct = activitiesOnly[activeSwapIdx - 1];
    if (prevAct && prevAct.placeId) {
      const p = getPlaceById(prevAct.placeId);
      if (p && p.coords) return p.coords;
    }
    return [4.6760, -74.0520];
  }, [activeSwapIdx, activitiesOnly]);

  const refPlaceName = useMemo(() => {
    if (activeSwapIdx === null || activeSwapIdx === 0) {
      return 'Alojamiento Calle 94';
    }
    const prevAct = activitiesOnly[activeSwapIdx - 1];
    if (prevAct && prevAct.placeId) {
      const p = getPlaceById(prevAct.placeId);
      if (p) return p.name;
    }
    return 'Alojamiento Calle 94';
  }, [activeSwapIdx, activitiesOnly]);

  const proximitySortedPlaces = useMemo(() => {
    if (activeSwapIdx === null) return [];
    const currentPlaceId = activitiesOnly[activeSwapIdx]?.placeId;
    return places
      .filter((p) => p.id !== 'alojamiento' && p.coords && p.category !== 'transporte' && p.id !== currentPlaceId)
      .map((p) => {
        const distance = getDistance(refCoords, p.coords);
        return { ...p, distance };
      })
      .sort((a, b) => a.distance - b.distance);
  }, [refCoords, activeSwapIdx, activitiesOnly]);

  const filteredPlaces = useMemo(() => {
    const q = swapSearch.toLowerCase().trim();
    if (!q) return proximitySortedPlaces;
    return proximitySortedPlaces.filter((p) => p.name.toLowerCase().includes(q) || p.address.toLowerCase().includes(q));
  }, [proximitySortedPlaces, swapSearch]);

  const handleSelectAlternative = (newPlaceId: string) => {
    if (activeSwapIdx === null) return;
    const newPlace = getPlaceById(newPlaceId);
    if (!newPlace) return;

    handleUpdateActivity(activeSwapIdx, {
      placeId: newPlaceId,
      activity: `Visita a ${newPlace.name}`,
    });
    setSwapSearch('');
  };

  const getStepEmoji = (type: string) => {
    return {
      actividad: '📍',
      comida: '🍽️',
      compra: '🛍️',
      espera: '⏱️',
      info: 'ℹ️',
    }[type] || '✨';
  };

  const getCardStyle = (type: string, isSelected: boolean) => {
    const base = "relative w-full text-left rounded-xl border border-l-[5px] p-4 transition-all cursor-pointer flex flex-col space-y-2 shadow-[0_1px_3px_rgba(0,0,0,0.01)] bg-background";
    const selectedRing = isSelected ? "ring-2 ring-primary border-primary bg-primary/[0.01]" : "";

    const typeStyles = {
      actividad: 'border-indigo-100 dark:border-indigo-950/40 bg-indigo-50/10 dark:bg-indigo-950/5 border-l-indigo-500 hover:border-indigo-300',
      comida: 'border-amber-100 dark:border-amber-950/40 bg-amber-50/10 dark:bg-amber-950/5 border-l-amber-500 hover:border-amber-300',
      compra: 'border-rose-100 dark:border-rose-950/40 bg-rose-50/10 dark:bg-rose-950/5 border-l-rose-500 hover:border-rose-300',
      espera: 'border-slate-100 dark:border-slate-800 bg-slate-50/10 dark:bg-slate-950/5 border-l-slate-400 hover:border-slate-300',
      info: 'border-sky-100 dark:border-sky-950/40 bg-sky-50/10 dark:bg-sky-950/5 border-l-sky-500 hover:border-sky-300',
    }[type] || 'border-border bg-card border-l-primary hover:border-primary/50';

    return cn(base, typeStyles, selectedRing);
  };

  const activeActivity = activeSwapIdx !== null ? activitiesOnly[activeSwapIdx] : null;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">Mis Planes Personalizados</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Construye tu itinerario interactivo y reordena con Drag & Drop.
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
                /* TWO COLUMN INTERACTIVE EDITOR */
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center justify-between gap-2 border-b border-border pb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">Editor de Plan Personalizado</span>
                    <div className="flex gap-1.5">
                      <Button size="sm" variant="default" onClick={saveEdit} className="h-7 text-xs font-semibold px-3">
                        <Save className="h-3.5 w-3.5 mr-1" /> Guardar
                      </Button>
                      <Button size="sm" variant="ghost" onClick={cancelEdit} className="h-7 text-xs px-2.5">
                        <X className="h-3.5 w-3.5 mr-1" /> Cancelar
                      </Button>
                    </div>
                  </div>

                  {/* Metadata row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-muted/20 p-3 rounded-xl border border-border/40">
                    <div>
                      <label className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Nombre del Plan</label>
                      <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="h-8 mt-1 text-xs rounded-lg" />
                    </div>
                    <div>
                      <label className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Descripción</label>
                      <Input value={editDesc} onChange={(e) => setEditDesc(e.target.value)} className="h-8 mt-1 text-xs rounded-lg" />
                    </div>
                  </div>

                  {/* Two column grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch lg:h-[500px] lg:overflow-hidden">

                    {/* LEFT COLUMN: Large Minimal Draggable Activity Cards */}
                    <div className="lg:col-span-5 flex flex-col space-y-2 lg:h-full lg:overflow-y-auto pr-1 custom-scroll">
                      <div className="flex items-center justify-between py-1 border-b border-border/50">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Actividades</span>
                        <Button size="sm" variant="outline" onClick={handleAddActivity} className="h-6 text-[9px] font-semibold border-primary/20 text-primary">
                          + Añadir Actividad
                        </Button>
                      </div>

                      {activitiesOnly.length === 0 ? (
                        <div className="text-center py-10 text-xs text-muted-foreground italic bg-muted/10 rounded-xl border border-dashed">
                          Sin actividades. Añade una arriba.
                        </div>
                      ) : (
                        activitiesOnly.map((step, idx) => {
                          const isSelected = activeSwapIdx === idx;
                          const placeObj = step.placeId ? getPlaceById(step.placeId) : null;

                          return (
                            <div
                              key={step.id}
                              draggable
                              onDragStart={() => handleDragStart(idx)}
                              onDragOver={(e) => handleDragOver(e, idx)}
                              onDrop={() => handleDrop(idx)}
                              onClick={() => { setActiveSwapIdx(idx); setSwapSearch(''); }}
                              className={cn(
                                getCardStyle(step.type, isSelected),
                                draggedIndex === idx && "opacity-40 scale-[0.98]",
                                "group transition-all duration-200"
                              )}
                            >
                              {/* Top row: Time pill + Actions */}
                              <div className="flex items-center justify-between">
                                {/* Time Adjustment */}
                                {editingTimeIdx === idx ? (
                                  <Input
                                    value={step.time}
                                    onChange={(e) => handleUpdateActivity(idx, { time: e.target.value })}
                                    onBlur={() => setEditingTimeIdx(null)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') setEditingTimeIdx(null); }}
                                    className="h-6 w-20 text-[10px] font-mono p-1 rounded border bg-background"
                                    onClick={(e) => e.stopPropagation()}
                                    autoFocus
                                  />
                                ) : (
                                  <Badge
                                    variant="secondary"
                                    className="text-[9px] font-mono font-bold cursor-pointer hover:bg-muted bg-background py-0.5 h-4.5 border border-border"
                                    onClick={(e) => { e.stopPropagation(); setEditingTimeIdx(idx); }}
                                  >
                                    ⏱️ {step.time}
                                  </Badge>
                                )}

                                {/* Card deletion */}
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleRemoveActivity(idx); }}
                                    className="p-0.5 text-muted-foreground hover:text-destructive rounded hover:bg-muted"
                                    title="Eliminar"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>

                              {/* Title / Description */}
                              <div className="flex items-start gap-2 min-w-0">
                                <span className="text-base shrink-0 select-none">
                                  {getStepEmoji(step.type)}
                                </span>
                                <div className="min-w-0 space-y-1">
                                  <h3 className="font-bold text-sm text-foreground leading-snug">
                                    {step.activity}
                                  </h3>

                                  {placeObj && (
                                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                      <MapPin className="h-3 w-3 text-primary shrink-0" />
                                      <span className="font-semibold text-foreground truncate">{placeObj.name}</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Notes input */}
                              <Input
                                value={step.notes || ''}
                                onChange={(e) => handleUpdateActivity(idx, { notes: e.target.value })}
                                placeholder="Añadir nota rápida..."
                                className="h-6 text-[10px] border-none shadow-none focus-visible:ring-0 p-0 text-muted-foreground/80 placeholder-muted-foreground/30 bg-transparent"
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* RIGHT COLUMN: Swap & Search Panel */}
                    <div className="lg:col-span-7 flex flex-col border border-border rounded-xl p-3 bg-muted/[0.01] lg:h-full lg:overflow-y-auto custom-scroll bg-card">
                      {activeActivity && activeActivity.placeId ? (
                        <div className="space-y-3.5 flex flex-col h-full">
                          {/* Selected Step indicator */}
                          <div className="pb-3 border-b border-border">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary flex items-center gap-1.5">
                              <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Reemplazar Actividad
                            </span>
                            <div className="flex items-start justify-between gap-1.5 mt-1">
                              <div>
                                <h4 className="font-bold text-sm text-foreground leading-snug">{activeActivity.activity}</h4>
                                <p className="text-[10.5px] text-muted-foreground mt-0.5">Lugar actual: {getPlaceById(activeActivity.placeId)?.name}</p>
                              </div>
                              <Button variant="ghost" size="sm" onClick={() => setActiveSwapIdx(null)} className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Swap search bar */}
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              value={swapSearch}
                              onChange={(e) => setSwapSearch(e.target.value)}
                              placeholder="Buscar en la base de datos de lugares..."
                              className="pl-9 h-9 text-xs bg-background border-border"
                            />
                          </div>

                          {/* Suggestions list */}
                          <div className="space-y-2 flex-1 overflow-y-auto pr-1">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">
                              Sugerencias por cercanía a: <span className="text-primary">{refPlaceName}</span>
                            </span>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {filteredPlaces.length === 0 ? (
                                <div className="col-span-full text-center py-6 text-xs text-muted-foreground italic">No se encontraron lugares.</div>
                              ) : (
                                filteredPlaces.map((p) => (
                                  <Card
                                    key={p.id}
                                    onClick={() => handleSelectAlternative(p.id)}
                                    className="cursor-pointer border border-border/80 hover:border-primary/50 hover:bg-primary/[0.01] hover:-translate-y-0.5 transition-all duration-200 p-3 flex flex-col justify-between min-h-[110px] shadow-[0_1px_2px_rgba(0,0,0,0.01)] bg-background"
                                  >
                                    <div className="space-y-1 min-w-0">
                                      <div className="flex items-start justify-between gap-1">
                                        <h5 className="font-bold text-xs text-foreground leading-tight truncate max-w-[150px]">{p.name}</h5>
                                        <Badge variant="secondary" className="text-[9px] py-0 h-4 px-1.5 font-mono font-bold text-primary bg-primary/10 border-none shrink-0">
                                          {p.distance.toFixed(1)} km
                                        </Badge>
                                      </div>
                                      <p className="text-[10px] text-muted-foreground line-clamp-1">{p.address}</p>
                                    </div>
                                    <div className="text-[10px] text-primary/80 font-bold mt-2 pt-2 border-t border-border/40 flex justify-between">
                                      <span className="text-[9px] uppercase tracking-wider font-extrabold text-muted-foreground/80">{p.category}</span>
                                      <span>{p.priceRange ? p.priceRange.split(' por')[0] : 'Gratis'}</span>
                                    </div>
                                  </Card>
                                ))
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="h-full flex flex-col justify-center items-center text-center p-6 space-y-3.5 text-muted-foreground my-auto">
                          <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center text-primary/50">
                            <MapPin className="h-6 w-6" />
                          </div>
                          <div className="space-y-1">
                            <h4 className="font-bold text-xs text-foreground">Personaliza tus actividades</h4>
                            <p className="text-[11px] max-w-[240px] leading-relaxed">
                              Haz clic en cualquier tarjeta de actividad a la izquierda para cambiarla por otra sugerida por proximidad física.
                            </p>
                          </div>
                          <div className="border border-border/60 rounded-lg p-2.5 bg-muted/20 text-[10px] text-left max-w-[280px]">
                            💡 <span className="font-bold text-foreground">Sugerencia:</span> Arrastra las tarjetas para cambiar su orden. Los trayectos de transporte y costos se actualizarán automáticamente.
                          </div>
                        </div>
                      )}
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
                        <Badge variant="outline" className="text-[9px] py-0 h-4.5 bg-muted/30">
                          {plan.steps.filter((s) => s.type !== 'movilidad').length} actividades
                        </Badge>
                        <span>·</span>
                        <span className="font-mono">{plan.steps.filter((s) => s.isMovement).length} trayectos automáticos</span>
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
