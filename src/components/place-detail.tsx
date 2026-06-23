'use client';

import { type Place, categoryLabels, categoryEmojis } from '@/lib/travel-data';
import { useTravelStore } from '@/lib/travel-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  MapPin,
  Clock,
  Phone,
  MessageCircle,
  Globe,
  Instagram,
  Star,
  ExternalLink,
  X,
  Utensils,
} from 'lucide-react';

interface PlaceDetailProps {
  place: Place;
  onClose?: () => void;
}

export default function PlaceDetail({ place, onClose }: PlaceDetailProps) {
  const setSelectedPlaceId = useTravelStore((s) => s.setSelectedPlaceId);

  return (
    <Card className="border-border shadow-lg animate-fade-in-up">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {place.restaurantCategory && (
                <Badge variant="secondary" className="text-xs">
                  {categoryEmojis[place.restaurantCategory]} {categoryLabels[place.restaurantCategory]}
                </Badge>
              )}
              {place.isAlternative && (
                <Badge variant="outline" className="text-xs">
                  Alternativa
                </Badge>
              )}
              {place.meetsCriteria && (
                <Badge className="text-xs bg-green-100 text-green-800 hover:bg-green-200">
                  ✓ &gt;1k reviews · ≥4/5
                </Badge>
              )}
            </div>
            <CardTitle className="text-lg leading-tight">{place.name}</CardTitle>
          </div>
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0"
              onClick={() => {
                onClose();
                setSelectedPlaceId(null);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Address */}
        <div className="flex items-start gap-2 text-sm">
          <MapPin className="h-4 w-4 mt-0.5 text-primary shrink-0" />
          <span className="text-foreground">{place.address}</span>
        </div>

        {/* Rating */}
        {place.rating && place.rating.score > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <Star className="h-4 w-4 text-amber-600 fill-amber-500 shrink-0" />
            <span className="font-semibold">{place.rating.score}/5</span>
            <span className="text-muted-foreground">· {place.rating.reviews} reseñas · {place.rating.source}</span>
          </div>
        )}

        {/* Price range */}
        {place.priceRange && (
          <div className="text-sm">
            <span className="text-muted-foreground font-medium">Rango: </span>
            <span className="text-foreground font-medium">{place.priceRange}</span>
          </div>
        )}

        {/* Hours */}
        {place.hours && (
          <div className="flex items-start gap-2 text-sm">
            <Clock className="h-4 w-4 mt-0.5 text-primary shrink-0" />
            <span className="text-foreground">{place.hours}</span>
          </div>
        )}

        {/* Phone */}
        {place.phone && (
          <div className="flex items-start gap-2 text-sm">
            <Phone className="h-4 w-4 mt-0.5 text-primary shrink-0" />
            <a href={`tel:${place.phone.replace(/[^+\d]/g, '')}`} className="text-foreground hover:text-primary">
              {place.phone}
            </a>
          </div>
        )}

        {/* WhatsApp */}
        {place.whatsapp && (
          <div className="flex items-start gap-2 text-sm">
            <MessageCircle className="h-4 w-4 mt-0.5 text-green-600 shrink-0" />
            <a
              href={place.whatsapp.startsWith('http') ? place.whatsapp : `https://wa.me/${place.whatsapp.replace(/[^+\d]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground hover:text-green-600"
            >
              WhatsApp: {place.whatsapp}
            </a>
          </div>
        )}

        {/* Web */}
        {place.web && (
          <div className="flex items-start gap-2 text-sm">
            <Globe className="h-4 w-4 mt-0.5 text-primary shrink-0" />
            <a href={place.web} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">
              {place.web}
            </a>
          </div>
        )}

        {/* Instagram */}
        {place.instagram && (
          <div className="flex items-start gap-2 text-sm">
            <Instagram className="h-4 w-4 mt-0.5 text-primary shrink-0" />
            <a
              href={place.instagram.startsWith('@') ? `https://instagram.com/${place.instagram.slice(1)}` : `https://instagram.com/${place.instagram}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {place.instagram}
            </a>
          </div>
        )}

        {/* Google Maps */}
        <Button variant="outline" size="sm" className="w-full" asChild>
          <a
            href={place.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + ' ' + place.address)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink className="h-3.5 w-3.5 mr-1" /> Abrir en Google Maps
          </a>
        </Button>

        {/* Notes */}
        {place.notes && (
          <>
            <Separator />
            <div className="text-xs text-muted-foreground leading-relaxed">{place.notes}</div>
          </>
        )}

        {/* Menu */}
        {place.menu && place.menu.length > 0 && (
          <>
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Utensils className="h-4 w-4 text-primary" />
                Menú · Precios 2025-2026
              </div>
              <ScrollArea className="max-h-80 custom-scroll rounded-md border border-border p-3 bg-muted/30">
                <div className="space-y-4">
                  {place.menu.map((section, idx) => (
                    <div key={idx}>
                      <div className="text-xs font-bold uppercase tracking-wider text-primary mb-2 pb-1 border-b border-primary/30">
                        {section.title}
                      </div>
                      <div className="space-y-1.5">
                        {section.items.map((item, i) => (
                          <div key={i} className="flex items-baseline gap-2 text-xs">
                            <div className="flex-1">
                              <div className="font-semibold text-foreground">{item.name}</div>
                              {item.description && (
                                <div className="text-muted-foreground italic text-[11px] leading-snug">
                                  {item.description}
                                </div>
                              )}
                            </div>
                            <div className="font-mono font-bold text-primary text-xs whitespace-nowrap">
                              {item.price}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
