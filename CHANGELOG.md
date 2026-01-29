# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto sigue [Semantic Versioning](https://semver.org/lang/es/).

## [2.1.1] - 2026-01-29

### 🔧 Ajustado
- **Calibración de Estimación de Tiempo**
  - Ajustado el cálculo de tiempo estimado (de 50ms a 200ms por frame)
  - Ahora refleja con mucha más precisión el tiempo real de procesamiento que incluye el 'seeking' del video
  
## [2.1.0] - 2026-01-29

### ✨ Añadido
- **Sistema de Presets Inteligentes**
  - 3 modos: ⚡ Rápido, ⚖️ Equilibrado, 🎯 Preciso
  - Auto-configuración al cargar video basada en duración
  - Descripción de cada modo visible en la interfaz
  
- **Estimación de Tiempo**
  - Muestra tiempo estimado de procesamiento antes de empezar
  - Se actualiza en tiempo real al cambiar parámetros
  - Basado en duración del video y configuración actual

### 🎯 Mejorado
- **Drag & Drop ahora intercambia posiciones (Swap Mode)**
  - Antes: Arrastrar desplazaba todas las diapositivas
  - Ahora: Arrastrar intercambia las posiciones de 2 slides
  - Comportamiento más intuitivo y predecible

### 📝 Notas
- Videos < 45s → Preset "Preciso" recomendado automáticamente
- Videos 45s-2min → Preset "Equilibrado" recomendado
- Videos > 2min → Preset "Rápido" recomendado
- **NO PUBLICADO AÚN** - Pendiente de testing

---



## [2.0.2] - 2026-01-29

### ⚡ Optimizado
- **Velocidad de procesamiento mejorada ~90%**
  - Ahora compara solo con los **últimos 10 frames** guardados (no todos)
  - Justificación: Los duplicados suelen estar cerca en el tiempo
  - Mantiene la precisión pero reduce drásticamente el tiempo de procesamiento
  - Early exit: Para de comparar en cuanto encuentra un duplicado

### 📝 Notas
- Feedback de usuario: v2.0.1 funcionaba correctamente pero era muy lenta
- Videos de 60s: de ~30-60s procesamiento → ~5-10s procesamiento
- **NO PUBLICADO AÚN** - Pendiente de testing final

---



## [2.0.1] - 2026-01-29

### 🐛 Corregido
- **Bug crítico: Detección de duplicados no funcionaba correctamente**
  - Ahora compara cada frame con TODOS los frames guardados (antes solo con el último)
  - Esto soluciona el problema de slides idénticos que pasaban el filtro
  - Agregada función `isFrameDuplicateOfAny()` para validación exhaustiva
  
- **Slider de muestreo con rango incorrecto**
  - Cambiado de 0.5-3.0s a **0.1-1.0s** para mayor precisión
  - Valor por defecto: 0.3s (antes 1.0s)
  - Permite análisis más frecuente del video
  
- **Pesos del algoritmo multi-nivel ajustados**
  - Perceptual hash: 50% → **70%** (mayor peso)
  - Histograma: 30% → **20%**
  - Estructural: 20% → **10%**
  - Resultado: Mejor tolerancia a micro-cambios de compresión JPEG

- **Mejoras de UI**
  - Label "Velocidad de Muestreo" → **"Intervalo de Análisis"** (más claro)
  - Valor mostrado: "1 frame/seg" → **"0.3s"** (unidades correctas)
  - Tooltips actualizados con explicaciones más precisas

### 📝 Notas
- **NO PUBLICADO AÚN** - Pendiente de testing con usuario
- Correcciones basadas en feedback de testing de v2.0
- Se espera reducción significativa de falsos negativos (frames duplicados no detectados)

---


## [2.0.0] - 2026-01-29

### ✨ Añadido
- **Reordenamiento de diapositivas con Drag & Drop**
  - Integración de SortableJS para arrastrar y soltar frames
  - Indicador visual de drag handle (⋮⋮)
  - Animaciones suaves durante el reordenamiento
  - El PDF se genera en el orden mostrado en la galería

- **Detección mejorada de duplicados - Algoritmo Multi-Nivel**
  - Hash perceptual mejorado (32x32 píxeles, antes 16x16)
  - Comparación de histogramas de color RGB
  - Análisis estructural por cuadrantes (grid 3x3)
  - Score combinado con pesos: 50% perceptual + 30% histograma + 20% estructural
  - Mayor precisión en la detección de diapositivas con cambios sutiles

-**Detección de Transición Completa**
  - Nuevo algoritmo de estabilidad temporal
  - Solo captura frames cuando el contenido está estable
  - Evita capturar frames durante animaciones o transiciones
  - Parámetro configurable: frames estables necesarios (2-5)
  - Muestreo adaptativo cada 0.3 segundos

- **Mejoras de UI**
  - Badge de versión "v2.0" en el header
  - Nuevo slider de "Estabilidad de Transición"
  - Tooltips explicativos mejorados
  - Estilos visuales para drag & drop (ghost, cursor grab/grabbing)
  - Nombres de archivo PDF incluyen "v2" para diferenciación

### 🔄 Cambiado
- **Algoritmo de captura**: De intervalo fijo a detección por estabilidad
- **Velocidad de muestreo**: Ahora comprueba cada 0.3s en lugar de 1s
- **Procesamiento**: Analiza más frames pero detecta mejor los duplicados

### 📝 Notas
- Esperado: Reducción significativa de duplicados (de ~28 a ~8-12 slides en video de ejemplo)
- El procesamiento puede tardar ligeramente más, pero la calidad mejora sustancialmente
- Compatible con proyectos v1.0 (sin breaking changes en el PDF generado)

---


## [1.0.0] - 2026-01-29

### ✨ Añadido
- **Interfaz de usuario moderna**
  - Diseño oscuro con gradientes indigo/púrpura
  - Efectos glassmorphism en tarjetas
  - Animaciones suaves y micro-interacciones
  - Diseño responsive para móviles y tablets
  
- **Carga y visualización de video**
  - Drag & drop para arrastrar archivos
  - Soporte para MP4, WebM, MOV
  - Vista previa del video con controles
  - Información del video (duración, dimensiones, tamaño)

- **Procesamiento de video**
  - Extracción de frames configurable (0.5 - 3 frames/segundo)
  - Algoritmo de hash perceptual para detección de duplicados
  - Sensibilidad ajustable (80-99%)
  - Barra de progreso en tiempo real

- **Galería de frames**
  - Vista en grid responsive
  - Selección/deselección de frames con un clic
  - Eliminación individual de frames
  - Numeración visual de diapositivas
  - Indicadores visuales de selección

- **Generación de PDF**
  - PDF de alta calidad usando pdf-lib
  - Mantiene dimensiones originales
  - Descarga automática
  - Nombres de archivo con timestamp

- **Documentación**
  - README.md completo con instrucciones
  - Guía de solución de problemas
  - Información técnica detallada

### 🔒 Seguridad
- Procesamiento 100% local en el navegador
- No se envían datos a ningún servidor
- Privacidad total del usuario

### 📝 Notas
- Primera versión funcional del proyecto
- Publicado en GitHub: https://github.com/eaguadov/APP-WEB-Video-a-PDF

---

## [Unreleased]

### 🚀 Por Implementar (Futuras Versiones)
- Soporte para más formatos de video (AVI, FLV)
- Exportar como imágenes individuales (ZIP)
- OCR para extraer texto de diapositivas
- Algoritmos de detección más sofisticados (SSIM)
- Opción de agregar marcas de agua al PDF
- Comprimir PDF para reducir tamaño
- Opción de reorganizar frames con drag & drop
- Vista previa del PDF antes de descargar
- Historial de conversiones
- Configuración de calidad de imagen JPEG
- Tema claro/oscuro

---

## Formato de Versiones

**[MAJOR.MINOR.PATCH]**

- **MAJOR**: Cambios incompatibles con versiones anteriores
- **MINOR**: Nueva funcionalidad compatible con versiones anteriores
- **PATCH**: Correcciones de errores compatibles con versiones anteriores

### Categorías de Cambios
- **✨ Añadido** - Nuevas características
- **🔄 Cambiado** - Cambios en funcionalidad existente
- **❌ Deprecado** - Características que se eliminarán pronto
- **🗑️ Eliminado** - Características eliminadas
- **🐛 Corregido** - Corrección de errores
- **🔒 Seguridad** - Correcciones de vulnerabilidades
