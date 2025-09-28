# Design System

Diese Datei dokumentiert das Design-System von CompQuest mit allen verfügbaren Variablen und deren Verwendung.

## Struktur

```
src/styles/
├── _variables.scss    # Alle Design-Token (Farben, Abstände, etc.)
└── main.scss         # Hauptstyles mit Utility-Klassen
```

## Verwendung

### In SCSS-Dateien

```scss
@import '../../styles/variables'; // Pfad je nach Tiefe anpassen

.my-component {
  color: $primary-blue;
  padding: $spacing-lg;
  border-radius: $border-radius-sm;
}
```

### In React-Komponenten

```typescript
// Importiere entweder die main.scss für globale Styles
import '../styles/main.scss';

// Oder nur die Variablen in individuelle Komponenten-SCSS-Dateien
```

## Verfügbare Variablen

### Farben

#### Primärfarben

- `$primary-blue`: #646cff
- `$primary-blue-hover`: #535bf2
- `$primary-blue-light`: #007acc

#### Neutrale Farben

- `$white`: #ffffff
- `$near-white`: rgba(255, 255, 255, 0.87)
- `$light-gray`: #f9f9f9
- `$light-gray-2`: #f5f5f5
- `$medium-gray`: #888
- `$medium-gray-2`: #ccc
- `$medium-gray-3`: #ddd
- `$dark-gray`: #333
- `$darker-gray`: #1a1a1a
- `$darkest-gray`: #242424

#### Status-Farben

- `$success-green`: #28a745
- `$success-green-bg`: #d4edda
- `$success-green-text`: #155724
- `$warning-yellow`: #ffd700
- `$warning-yellow-hover`: #ffed4a

### Abstände (8px Grid System)

- `$spacing-xs`: 4px
- `$spacing-sm`: 8px
- `$spacing-md`: 12px
- `$spacing-lg`: 16px
- `$spacing-xl`: 20px
- `$spacing-2xl`: 24px
- `$spacing-3xl`: 30px

### Typografie

- `$font-family-base`: system-ui, Avenir, Helvetica, Arial, sans-serif
- `$font-size-sm`: 14px
- `$font-size-base`: 16px
- `$font-size-lg`: 1.2em
- `$font-size-xl`: 3.2em
- `$font-weight-normal`: 400
- `$font-weight-medium`: 500
- `$font-weight-semibold`: 600
- `$font-weight-bold`: bold

### Borders & Border Radius

- `$border-width-base`: 1px
- `$border-width-thick`: 2px
- `$border-radius-sm`: 4px
- `$border-radius-md`: 8px
- `$border-color-default`: $medium-gray-2
- `$border-color-focus`: $primary-blue

### Transitionen

- `$transition-fast`: 0.2s ease
- `$transition-medium`: 0.25s
- `$transition-slow`: 0.3s ease

### Layout

- `$container-sm`: 320px
- `$container-md`: 800px
- `$container-lg`: 1280px
- `$input-width-sm`: 80px
- `$input-width-md`: 100px

## Utility-Klassen

Die `main.scss` enthält nützliche Utility-Klassen:

### Text

- `.u-text-center`, `.u-text-left`, `.u-text-right`

### Spacing

- `.u-margin-*`, `.u-padding-*` (xs, sm, md, lg, xl)
- `.u-margin-top-*`, `.u-margin-bottom-*`

### Display & Flexbox

- `.u-hidden`, `.u-block`, `.u-flex`
- `.u-flex-center`, `.u-flex-between`, `.u-flex-column`

### Farben

- `.u-color-primary`, `.u-color-success`, `.u-color-muted`
- `.u-bg-light`, `.u-bg-success`

### Schriftgewicht

- `.u-font-normal`, `.u-font-medium`, `.u-font-semibold`, `.u-font-bold`

## Best Practices

1. **Immer Variablen verwenden** statt hardcodierte Werte
2. **8px Grid System** für Abstände verwenden
3. **Semantische Farbnamen** nutzen (primary, success, etc.)
4. **Utility-Klassen** für häufige Styles verwenden
5. **Konsistente Border-Radius** und **Transitions** verwenden

## Migration bestehender Styles

Alle bestehenden SCSS-Dateien wurden bereits auf das neue System migriert:

- `index.scss` ✓
- `App.scss` ✓
- `numberInput.component.scss` ✓
- `datapackage.page.scss` ✓
- `binaryInputRow.component.scss` ✓
