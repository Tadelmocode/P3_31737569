# 🎨 Guía de Estilos - Vinyl Store API

## Paleta de Colores

### Colores Base
| Nombre | Código | Uso |
|--------|--------|-----|
| **Primary Dark** | `#0f1419` | Fondo principal |
| **Secondary Dark** | `#1a1f2e` | Fondos secundarios |
| **Tertiary Dark** | `#252d3d` | Fondos terciarios |
| **Hover** | `#2d3748` | Estados hover |

### Colores de Texto
| Nombre | Código | Uso |
|--------|--------|-----|
| **Text Primary** | `#e8eef5` | Texto principal |
| **Text Secondary** | `#a0aec0` | Texto secundario |
| **Text Tertiary** | `#718096` | Texto terciario/deshabilitado |

### Colores de Acento
| Nombre | Código | Uso |
|--------|--------|-----|
| **Accent Primary** | `#6366f1` | Botones, enlaces principales |
| **Accent Secondary** | `#8b5cf6` | Elementos destacados |
| **Accent Tertiary** | `#ec4899` | Énfasis adicional |

### Colores de Estado
| Nombre | Código | Uso |
|--------|--------|-----|
| **Success** | `#10b981` | Operaciones exitosas, GET |
| **Warning** | `#f59e0b` | Advertencias, PUT |
| **Error** | `#ef4444` | Errores, DELETE |
| **Info** | `#3b82f6` | Información, POST |

## Tipografía

### Fuentes
- **Principal**: Poppins (Google Fonts)
- **Monoespaciada**: JetBrains Mono (Google Fonts)

### Tamaños
```css
--font-size-xs: 0.75rem;      /* 12px */
--font-size-sm: 0.875rem;     /* 14px */
--font-size-base: 1rem;       /* 16px */
--font-size-lg: 1.125rem;     /* 18px */
--font-size-xl: 1.25rem;      /* 20px */
--font-size-2xl: 1.5rem;      /* 24px */
--font-size-3xl: 2rem;        /* 32px */
--font-size-4xl: 2.5rem;      /* 40px */
```

### Pesos
- **300**: Light (títulos alternativos)
- **400**: Regular (texto base)
- **500**: Medium (énfasis)
- **600**: Semibold (títulos, botones)
- **700**: Bold (títulos principales)

## Espaciado

```css
--spacing-xs: 0.25rem;    /* 4px */
--spacing-sm: 0.5rem;     /* 8px */
--spacing-md: 1rem;       /* 16px */
--spacing-lg: 1.5rem;     /* 24px */
--spacing-xl: 2rem;       /* 32px */
--spacing-2xl: 3rem;      /* 48px */
--spacing-3xl: 4rem;      /* 64px */
```

## Border Radius

```css
--radius-sm: 0.375rem;    /* 6px */
--radius-md: 0.5rem;      /* 8px */
--radius-lg: 0.75rem;     /* 12px */
--radius-xl: 1rem;        /* 16px */
--radius-2xl: 1.5rem;     /* 24px */
--radius-full: 9999px;    /* Circular */
```

## Sombras

```css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.4);
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.5);
--shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.6);
```

## Transiciones

```css
--transition-fast: 150ms ease-in-out;
--transition-base: 250ms ease-in-out;
--transition-slow: 350ms ease-in-out;
```

## Componentes

### Botones

#### Botón Primario
```html
<a href="#" class="btn btn-primary">Explorar API</a>
```
- Fondo: Gradiente primario
- Color: Blanco
- Sombra: Elevada
- Hover: Elevación adicional

#### Botón Secundario
```html
<a href="#" class="btn btn-secondary">Conocer más</a>
```
- Fondo: Transparente
- Borde: Acento primario
- Color: Acento primario
- Hover: Fondo semi-transparente

### Tarjetas

#### Feature Card
```html
<article class="feature-card">
    <div class="feature-icon">🎵</div>
    <h3 class="feature-title">Título</h3>
    <p class="feature-description">Descripción</p>
</article>
```
- Fondo: Secundario
- Borde: Sutil
- Hover: Elevación + cambio de borde
- Animación: Fade in al scroll

#### Endpoint Group
```html
<div class="endpoint-group">
    <h3 class="endpoint-group-title">Categoría</h3>
    <ul class="endpoint-list">
        <!-- items -->
    </ul>
</div>
```
- Fondo: Secundario
- Borde: Sutil
- Hover: Cambio de color de borde

### Métodos HTTP

| Método | Clase | Color | Fondo |
|--------|-------|-------|-------|
| GET | `.endpoint-method.get` | `#10b981` | `rgba(16, 185, 129, 0.2)` |
| POST | `.endpoint-method.post` | `#3b82f6` | `rgba(59, 130, 246, 0.2)` |
| PUT | `.endpoint-method.put` | `#f59e0b` | `rgba(245, 158, 11, 0.2)` |
| DELETE | `.endpoint-method.delete` | `#ef4444` | `rgba(239, 68, 68, 0.2)` |

## Animaciones

### Fade In Up
```css
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
```

### Float
```css
@keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-20px); }
}
```

### Spin
```css
@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}
```

## Breakpoints Responsivos

```css
/* Desktop: 1200px+ */
@media (max-width: 768px) {
    /* Tablet: 768px - 1199px */
}

@media (max-width: 480px) {
    /* Mobile: < 480px */
}
```

## Mejores Prácticas

### Accesibilidad
- ✅ Contraste suficiente (WCAG AA)
- ✅ Textos alternativos en imágenes
- ✅ Navegación por teclado
- ✅ Semántica HTML correcta

### Performance
- ✅ Animaciones con CSS (no JavaScript)
- ✅ Transiciones suaves
- ✅ Lazy loading de contenido
- ✅ Imágenes optimizadas

### Mantenibilidad
- ✅ Variables CSS centralizadas
- ✅ Nomenclatura BEM
- ✅ Comentarios claros
- ✅ Código modular

## Ejemplos de Uso

### Cambiar Color Principal
```css
:root {
    --accent-primary: #nuevo-color;
}
```

### Agregar Nueva Animación
```css
@keyframes nuevaAnimacion {
    from { /* estado inicial */ }
    to { /* estado final */ }
}

.elemento {
    animation: nuevaAnimacion 0.6s ease-out forwards;
}
```

### Crear Nueva Tarjeta
```html
<article class="feature-card">
    <div class="feature-icon">🎵</div>
    <h3 class="feature-title">Mi Característica</h3>
    <p class="feature-description">Descripción de la característica</p>
</article>
```

## Recursos

- [Google Fonts - Poppins](https://fonts.google.com/specimen/Poppins)
- [Google Fonts - JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [CSS Variables Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/--*)

---

**Última actualización**: 2024
**Versión**: 1.0
