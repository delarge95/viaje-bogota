'use client';

import { dayPlans } from '@/lib/travel-data';
import { useTravelStore } from '@/lib/travel-store';
import { cn } from '@/lib/utils';
import { Calendar, CalendarOff, AlertTriangle } from 'lucide-react';

export default function DayNavigator() {
  const selectedDay = useTravelStore((s) => s.selectedDay);
  const setSelectedDay = useTravelStore((s) => s.setSelectedDay);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 px-1">
        <Calendar className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-semibold">8 días · 15-22 julio 2026</h2>
      </div>
      <div className="grid grid-cols-4 gap-1.5">
        {dayPlans.map((day) => (
          <button
            key={day.day}
            onClick={() => setSelectedDay(day.day)}
            className={cn(
              'relative p-2 rounded-md border text-center transition-all',
              selectedDay === day.day
                ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                : 'border-border bg-card hover:border-primary/50 hover:bg-muted/50'
            )}
          >
            <div className="text-[10px] uppercase tracking-wide opacity-80">{day.weekday.slice(0, 3)}</div>
            <div className="text-base font-bold leading-tight">{day.day}</div>
            <div className="flex justify-center gap-0.5 mt-0.5 h-2.5">
              {day.isFeriado && (
                <CalendarOff className={cn('h-2.5 w-2.5', selectedDay === day.day ? 'text-primary-foreground' : 'text-amber-600')} />
              )}
              {day.isRestriccionMedica && (
                <AlertTriangle className={cn('h-2.5 w-2.5', selectedDay === day.day ? 'text-primary-foreground' : 'text-red-500')} />
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
