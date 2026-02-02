# Event Thumbnail Bilder

Dieser Ordner enthält die Bilder für das automatisch scrollende Carousel auf der Events-Seite.

## Anleitung:

1. **Bilder hinzufügen**: Lade deine Event-Fotos in diesen Ordner hoch
2. **Benennung**: Benenne die Bilder: `1.jpg`, `2.jpg`, `3.jpg`, etc.
3. **Format**: JPG, PNG oder WebP
4. **Empfohlene Größe**:
   - Breite: 600-800px
   - Höhe: 400-600px
   - Querformat (16:9 oder 3:2 Ratio)

## Wichtig:

- Je mehr Bilder, desto länger dauert der Loop
- Die Bilder werden automatisch von rechts nach links scrollen
- Bei Hover pausiert die Animation
- Auf Mobile werden die Bilder kleiner angezeigt (200x150px)
- Auf Desktop: 300x200px

## Standard Bilder:

Der Code sucht aktuell nach diesen Bildern:
- 1.jpg
- 2.jpg
- 3.jpg
- 4.jpg
- 5.jpg
- 6.jpg
- 7.jpg
- 8.jpg

Du kannst mehr oder weniger Bilder verwenden - passe einfach die Liste in der Komponente an:
`src/components/events/EventImageCarousel.tsx`

Viel Spaß! 🍷
