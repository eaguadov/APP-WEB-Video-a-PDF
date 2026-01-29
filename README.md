# 📹 Video a PDF - Conversor de Presentaciones

Aplicación web que extrae diapositivas únicas de videos de presentaciones (PPT, Genially, etc.) y las convierte en un documento PDF.

## 🚀 Características (v2.1)

- ✅ **Presets Inteligentes** - 3 modos (Rápido, Equilibrado, Preciso) auto-recomendados según la duración
- ⏱️ **Estimación de Tiempo** - Conoce cuánto tardará antes de empezar
- 🔄 **Drag & Drop Mejorado** - Reordena diapositivas intercambiando posiciones (Swap Mode)
- 🔍 **Detección Multi-Nivel** - Algoritmo avanzado que combina 3 métodos de análisis (Hash Perceptual, Histograma, Estructural)
- 🎥 **Estabilidad de Transición** - Captura solo cuando la imagen está estable (evita frames borrosos)
- 🔒 **100% Local y Privado** - Todo el procesamiento se realiza en tu navegador

## 📦 Instalación

**No requiere instalación.** Solo descarga o clona el repositorio:

```bash
git clone https://github.com/eaguadov/APP-WEB-Video-a-PDF.git
```
O descarga el ZIP y abre `index.html`.

## 🎯 Guía de Uso Rápido

### 1. Cargar Video
Arrastra tu video a la zona de carga (MP4, WebM, MOV).

### 2. Seleccionar Modo (Presets)
La aplicación recomendará un modo automáticamente:

| Modo | Descripción | Uso Recomendado |
|------|-------------|-----------------|
| **⚡ Rápido** | Análisis ligero (0.8s) | Videos largos (> 2 min) o revisiones rápidas |
| **⚖️ Equilibrado** | Balance ideal (0.5s) | **Opción recomendada** para la mayoría de casos |
| **🎯 Preciso** | Análisis profundo (0.3s) | Videos con **Pop-ups**, animaciones sutiles o textos pequeños |

### 3. Ajustes Avanzados (Opcional)
- **Sensibilidad**: (97-99%) Sube este valor para detectar cambios minúsculos (ej: popups de Genially)
- **Estabilidad**: Define cuántos frames idénticos deben pasar para considerar la imagen "estable"

### 4. Revisión y Exportación
- **Reordenar**: Arrastra una diapositiva sobre otra para intercambiarlas
- **Eliminar**: Haz clic en la X roja
- **PDF**: Genera el documento final con un clic

## ⚙️ Cómo Funciona la Detección (Algoritmo v2)

A diferencia de la versión 1.0, el nuevo algoritmo utiliza un sistema de **triple validación**:

1. **Hash Perceptual (70%)**: Detecta la estructura visual general
2. **Histograma de Color (20%)**: Analiza la distribución de luz y color
3. **Análisis Estructural (10%)**: Busca cambios localizados en cuadrantes específicos

Además, el sistema de **Estabilidad Temporal** asegura que no se capturen frames mientras hay animaciones en curso (transiciones, fade-ins).

## 🐛 Solución de Problemas

**El video no se carga**
- Verifica que el formato sea compatible (MP4, WebM, MOV)
- Intenta con un codec diferente

**Se detectan demasiadas diapositivas duplicadas**
- Aumenta el valor de "Sensibilidad de Detección"
- Usa la revisión manual para eliminar duplicados

**Faltan diapositivas en el resultado**
- Reduce el valor de "Sensibilidad de Detección"
- Reduce la "Velocidad de Muestreo" para analizar más frames

## 📝 Licencia

Libre para uso personal y comercial. Compártelo con quien quieras.

---

**Desarrollado con ❤️ usando HTML5, CSS3 y JavaScript**
