'use client';

import { useState, useMemo } from 'react';
import { dayPlans, getPlaceById, places, type PlanStep, type CustomPlan, type TransportMode } from '@/lib/travel-data';
import { useTravelStore } from '@/lib/travel-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Copy, Edit3, Save, X, Bus, Car, Footprints, MapPin, Utensils, Clock, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function PlanEditor() {
  const customPlans = useTravelStore((s) => s.customPlans);
  const addCustomPlan = useTravelStore((s) => s.addCustomPlan);
  const updateCustomPlan = useTravelStore((s) => s.updateCustomPlan);
  const deleteCustomPlan = useTravelStore((s) => s.deleteCustomPlan);
  const setSelectedDay = useTravelStore((s) => s.setSelectedDay);
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
      name: basedOnDay ? `Plan basado en Día ${basedOnDay}` : 'Nuevo plan personalizado',
      description: basedOnDay ? `Basado en el itinerario del día ${basedOnDay}` : 'Crea tu propio itinerario',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      basedOnDay,
      steps: baseSteps,
    };
    addCustomPlan(plan);
    setEditingId(id);
    setEditName(plan.name);
    setEditDesc(plan.description);
    setEditSteps(baseSteps);
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
      time: '00:00',
      type: 'actividad',
      activity: 'Nueva actividad',
    };
    setEditSteps([...editSteps, newStep]);
  };

  const removeStep = (stepId: string) => {
    setEditSteps(editSteps.filter((s) => s.id !== stepId));
  };

  const moveStep = (stepId: string, direction: 'up' | 'down') => {
    const idx = editSteps.findIndex((s) => s.id === stepId);
    if (idx === -1) return;
    const newIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= editSteps.length) return;
    const newSteps = [...editSteps];
    [newSteps[idx], newSteps[newIdx]] = [newSteps[newIdx], newSteps[idx]];
    setEditSteps(newSteps);
  };

  const updateStep = (stepId: string, updates: Partial<PlanStep>) => {
    setEditSteps(editSteps.map((s) => (s.id === stepId ? { ...s, ...updates } : s)));
  };

  const viewPlan = (plan: CustomPlan) => {
    // Set as active and switch to itinerario view with custom steps
    useTravelStore.getState().setActiveCustomPlan(plan.id);
    useTravelStore.getState().setMainView('itinerario');
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold">Mi Plan Personalizado</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Crea tu propio itinerario partiendo de un día existente o desde cero
        </p>
      </div>

      {/* Create new plan options */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Plus className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold">Crear nuevo plan</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="default" onClick={() => startNewPlan()}>
              <Plus className="h-3.5 w-3.5 mr-1" /> Desde cero
            </Button>
            {dayPlans.map((day) => (
              <Button
                key={day.day}
                size="sm"
                variant="outline"
                onClick={() => startNewPlan(day.day)}
              >
                <Copy className="h-3.5 w-3.5 mr-1" />
                Basado en Día {day.day}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* List of custom plans */}
      {customPlans.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="pt-6 text-center text-sm text-muted-foreground">
            <Edit3 className="h-8 w-8 mx-auto mb-2 opacity-30" />
            Aún no has creado planes personalizados.
            <br />
            Crea uno arriba partiendo de un día existente o desde cero.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {customPlans.map((plan) => (
            <Card key={plan.id} className="overflow-hidden">
              {editingId === plan.id ? (
                /* Edit mode */
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold">Editando plan</span>
                    <div className="flex gap-1">
                      <Button size="sm" variant="default" onClick={saveEdit} className="h-7">
                        <Save className="h-3.5 w-3.5 mr-1" /> Guardar
                      </Button>
                      <Button size="sm" variant="ghost" onClick={cancelEdit} className="h-7">
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <label className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">Nombre</label>
                      <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="h-8 mt-0.5" />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">Descripción</label>
                      <Textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} className="mt-0.5 min-h-[40px]" rows={2} />
                    </div>
                  </div>

                  {/* Steps editor */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold">Pasos del itinerario ({editSteps.length})</span>
                      <Button size="sm" variant="outline" onClick={addStep} className="h-6 text-[11px]">
                        <Plus className="h-3 w-3 mr-0.5" /> Añadir paso
                      </Button>
                    </div>
                    {editSteps.map((step, idx) => (
                      <StepEditor
                        key={step.id}
                        step={step}
                        index={idx}
                        total={editSteps.length}
                        onUpdate={(updates) => updateStep(step.id, updates)}
                        onRemove={() => removeStep(step.id)}
                        onMove={(dir) => moveStep(step.id, dir)}
                      />
                    ))}
                  </div>
                </CardContent>
              ) : (
                /* View mode */
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm">{plan.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{plan.description}</p>
                      <div className="flex items-center gap-2 mt-1.5 text-[11px] text-muted-foreground">
                        <span>{plan.steps.length} pasos</span>
                        <span>·</span>
                        <span>{plan.steps.filter((s) => s.isMovement).length} trayectos</span>
                        {plan.basedOnDay && (
                          <>
                            <span>·</span>
                            <span>Basado en Día {plan.basedOnDay}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button size="sm" variant="default" onClick={() => viewPlan(plan)} className="h-7">
                        Ver itinerario
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => startEdit(plan)} className="h-7">
                        <Edit3 className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => deleteCustomPlan(plan.id)} className="h-7 text-destructive">
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

function StepEditor({
  step,
  index,
  total,
  onUpdate,
  onRemove,
  onMove,
}: {
  step: PlanStep;
  index: number;
  total: number;
  onUpdate: (updates: Partial<PlanStep>) => void;
  onRemove: () => void;
  onMove: (dir: 'up' | 'down') => void;
}) {
  const typeIcons = {
    movilidad: Bus,
    actividad: MapPin,
    comida: Utensils,
    compra: MapPin,
    espera: Clock,
    info: MapPin,
  };
  const Icon = typeIcons[step.type] || MapPin;

  const allPlaces = places;
  const movementPlaces = allPlaces.filter((p) => p.category !== 'restaurante' || true);

  return (
    <div className="border border-border rounded-lg p-2 bg-card space-y-1.5">
      <div className="flex items-center gap-1.5">
        <Icon className="h-3 w-3 text-primary shrink-0" />
        <Input
          value={step.time}
          onChange={(e) => onUpdate({ time: e.target.value })}
          className="h-6 text-[11px] font-mono w-24"
          placeholder="HH:MM"
        />
        <select
          value={step.type}
          onChange={(e) => onUpdate({ type: e.target.value as PlanStep['type'] })}
          className="h-6 text-[11px] rounded border border-border bg-card px-1"
        >
          <option value="movilidad">🚌 Trayecto</option>
          <option value="actividad">📍 Actividad</option>
          <option value="comida">🍽️ Comida</option>
          <option value="compra">🛍️ Compra</option>
          <option value="espera">⏱️ Espera</option>
          <option value="info">ℹ️ Info</option>
        </select>
        <div className="flex gap-0.5 ml-auto">
          <button
            onClick={() => onMove('up')}
            disabled={index === 0}
            className="p-0.5 hover:bg-muted rounded disabled:opacity-30"
          >
            <ArrowUp className="h-3 w-3" />
          </button>
          <button
            onClick={() => onMove('down')}
            disabled={index === total - 1}
            className="p-0.5 hover:bg-muted rounded disabled:opacity-30"
          >
            <ArrowDown className="h-3 w-3" />
          </button>
          <button
            onClick={onRemove}
            className="p-0.5 hover:bg-destructive/10 rounded text-destructive"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>
      <Input
        value={step.activity}
        onChange={(e) => onUpdate({ activity: e.target.value })}
        className="h-7 text-xs"
        placeholder="Descripción de la actividad"
      />
      {step.isMovement && (
        <div className="grid grid-cols-2 gap-1">
          <select
            value={step.fromPlaceId || ''}
            onChange={(e) => onUpdate({ fromPlaceId: e.target.value })}
            className="h-6 text-[10px] rounded border border-border bg-card px-1"
          >
            <option value="">Origen...</option>
            {allPlaces.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <select
            value={step.toPlaceId || ''}
            onChange={(e) => onUpdate({ toPlaceId: e.target.value })}
            className="h-6 text-[10px] rounded border border-border bg-card px-1"
          >
            <option value="">Destino...</option>
            {allPlaces.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      )}
      {!step.isMovement && (
        <select
          value={step.placeId || ''}
          onChange={(e) => onUpdate({ placeId: e.target.value })}
          className="h-6 text-[10px] rounded border border-border bg-card px-1 w-full"
        >
          <option value="">Seleccionar lugar...</option>
          {allPlaces.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      )}
    </div>
  );
}
