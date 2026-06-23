'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Phone, Clock, Download, AlertCircle } from 'lucide-react';

const planEconomico = [
  { concepto: 'Transporte (TM prioritario + 2 Uber)', costo: '$100-130k' },
  { concepto: 'Comidas (8 días, mix: mercado/corrientazos/restaurantes)', costo: '$750-950k' },
  { concepto: 'Entradas culturales (Museo Oro gratis, JBB, Planetario, Monserrate)', costo: '$150-220k' },
  { concepto: 'Compras Paloquemao (frutas, flores, especias)', costo: '$80-150k' },
  { concepto: 'Edelweiss (Cajicá) + traslado', costo: '$250-380k' },
  { concepto: 'Colchón imprevistos / plan B', costo: '$50-100k' },
];

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
  { name: 'Cabify', use: 'Transporte más seguro' },
  { name: 'Uber', use: 'Mayor cobertura' },
  { name: 'Taxis Libres', use: 'Taxis amarillos oficiales' },
  { name: 'Tuboleta', use: 'Compra Tren, Planetario' },
  { name: 'Google Maps (offline)', use: 'Descargar mapa Bogotá' },
  { name: 'Waze', use: 'Tráfico en tiempo real' },
  { name: 'Rappi', use: 'Domicilios comida' },
];

const datosUtiles = [
  { label: 'Moneda', value: 'Peso Colombiano (COP) · 1 USD ≈ $4.000-4.300' },
  { label: 'Huso horario', value: 'UTC-5 todo el año' },
  { label: 'Clima', value: '8-19°C · julio seco con chubascos vespertinos' },
  { label: 'Altitud', value: '2.640 m s.n.m. · beber agua primer día' },
  { label: 'Agua potable', value: 'Sí, del grifo · llevar botella reutilizable' },
  { label: 'Propinas', value: '10% suele estar incluido' },
  { label: 'Tarjetas', value: 'Visa/MasterCard · llevar efectivo para mercado' },
  { label: 'Electricidad', value: '110V · enchufe tipo A (EE.UU.)' },
];

export default function InfoPanel() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Información del viaje</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Todo lo que necesitas saber: presupuesto, contactos, apps y datos útiles
        </p>
      </div>

      {/* Plan económico */}
      <Card className="border-green-300/50 bg-green-50/30">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">💰</span>
            <h3 className="text-sm font-bold">Plan Económico · &lt; $2.000.000 COP</h3>
            <Badge variant="outline" className="text-[10px] ml-auto text-green-700 border-green-400">
              2 personas · 8 días
            </Badge>
          </div>
          <div className="space-y-1.5">
            {planEconomico.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-green-200/40 last:border-0">
                <span className="text-foreground">{item.concepto}</span>
                <span className="font-mono font-semibold text-primary">{item.costo}</span>
              </div>
            ))}
            <div className="flex items-center justify-between pt-2 mt-1">
              <span className="font-bold text-sm text-foreground">TOTAL</span>
              <span className="font-mono font-bold text-green-700 text-base">$1.380k - $1.930k</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Two columns: contacts + apps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Emergencies + key contacts */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Phone className="h-4 w-4 text-red-600" />
                <h3 className="text-sm font-bold">Emergencias 24/7</h3>
              </div>
              <div className="space-y-1.5">
                {emergencyContacts.map((c, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div>
                      <span className="text-foreground">{c.label}</span>
                      {c.note && <div className="text-[10px] text-muted-foreground">{c.note}</div>}
                    </div>
                    <span className="font-mono font-semibold text-primary text-xs">{c.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h3 className="text-sm font-bold mb-3">Contactos clave</h3>
              <div className="space-y-1.5">
                {keyContacts.map((c, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="text-foreground truncate">{c.label}</span>
                    {c.href ? (
                      <a href={c.href} target="_blank" rel="noopener noreferrer" className="font-mono font-semibold text-primary text-xs hover:underline shrink-0 ml-2">
                        {c.value}
                      </a>
                    ) : (
                      <span className="font-mono font-semibold text-primary text-xs shrink-0 ml-2">{c.value}</span>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Apps + datos útiles */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Download className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-bold">Apps a descargar</h3>
              </div>
              <div className="grid grid-cols-1 gap-1.5">
                {apps.map((app, i) => (
                  <div key={i} className="flex items-center justify-between text-xs border-b border-border/50 last:border-0 pb-1 last:pb-0">
                    <span className="font-medium text-foreground">{app.name}</span>
                    <span className="text-muted-foreground text-[11px]">{app.use}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-bold">Datos útiles</h3>
              </div>
              <div className="space-y-1.5">
                {datosUtiles.map((d, i) => (
                  <div key={i} className="flex items-start justify-between text-xs gap-2">
                    <span className="text-muted-foreground shrink-0">{d.label}</span>
                    <span className="font-medium text-foreground text-right">{d.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Guía de Orientación Urbana y Altitud */}
      <Card className="border-emerald-300/50 bg-[#2D6A4F]/[0.02]">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2 pb-1.5 border-b border-[#2D6A4F]/20">
            <span className="text-lg">🧭</span>
            <h3 className="text-sm font-bold text-[#2D6A4F]">Guía de Orientación en Bogotá</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-2">
              <h4 className="font-bold text-foreground">🗺️ ¿Cómo ubicarse en la ciudad?</h4>
              <p className="text-muted-foreground leading-relaxed">
                Bogotá está organizada en una cuadrícula natural delimitada por su geografía:
              </p>
              <ul className="space-y-1.5 list-disc pl-4 text-muted-foreground">
                <li>
                  <strong className="text-foreground">Los Cerros Orientales ⛰️:</strong> Son tu brújula natural. Siempre definen el <span className="font-semibold text-primary">Oriente (Este)</span>. Si los miras de frente, estás de cara al Este.
                </li>
                <li>
                  <strong className="text-foreground">Las Calles (Cl.) ↔️:</strong> Corren de Este a Oeste (perpendiculares a los cerros). Sus números aumentan hacia el <span className="font-semibold text-foreground">Norte</span> (ej. del Centro Histórico Calle 10 a la Calle 94 del alojamiento).
                </li>
                <li>
                  <strong className="text-foreground">Las Carreras (Cra.) ↕️:</strong> Corren de Sur a Norte (paralelas a los cerros). Aumentan a medida que te alejas de las montañas hacia el <span className="font-semibold text-foreground">Occidente (Oeste)</span> (ej. Cra. 7 está junto al cerro; Cra. 15 está más lejos).
                </li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-foreground">🏃 Altitud y Clima (2.640 m s.n.m.)</h4>
              <p className="text-muted-foreground leading-relaxed">
                El "soroche" o mal de altura es común debido al menor oxígeno en el aire de la Sabana. Sigue estas recomendaciones:
              </p>
              <ul className="space-y-1.5 list-disc pl-4 text-muted-foreground">
                <li>
                  <strong className="text-foreground">Primeros días:</strong> Evita esfuerzos físicos intensos y caminatas empinadas rápidas.
                </li>
                <li>
                  <strong className="text-foreground">Hidratación constante:</strong> Toma agua embotellada o del grifo (es 100% potable en Bogotá).
                </li>
                <li>
                  <strong className="text-foreground">Alimentación:</strong> Evita comidas excesivamente pesadas o grasosas en tus primeras cenas para facilitar la digestión en altura.
                </li>
                <li>
                  <strong className="text-foreground">El clima:</strong> El sol andino quema con fuerza (usa protector solar), pero a la sombra o al atardecer la temperatura baja rápido (lleva siempre abrigo).
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Acciones urgentes */}
      <Card className="border-amber-300 bg-amber-50/40">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <h3 className="text-sm font-bold">Acciones urgentes antes del viaje</h3>
          </div>
          <ul className="space-y-1.5 text-xs">
            <li className="flex gap-2">
              <span className="text-amber-600 font-bold shrink-0">~5 jul 2026:</span>
              <span>Comprar boletas Tren Sabana en tuboleta.com</span>
            </li>
            <li className="flex gap-2">
              <span className="text-amber-600 font-bold shrink-0">~30 jun:</span>
              <span>Verificar cartelera Planetario julio 2026</span>
            </li>
            <li className="flex gap-2">
              <span className="text-amber-600 font-bold shrink-0">Con 2-3 sem:</span>
              <span>Reservar tour Etnias Andantes Cementerio (+57 320 287 5066)</span>
            </li>
            <li className="flex gap-2">
              <span className="text-amber-600 font-bold shrink-0">Antes de cada plan:</span>
              <span>Reconfirmar horarios por WhatsApp</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
