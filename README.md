# 📹 Video a PDF - Conversor de Presentaciones

Aplicación web que extrae diapositivas únicas de videos de presentaciones (PPT, Genially, etc.) y las convierte en un documento PDF.

## 🚀 Características

- ✅ **100% Local y Privado** - Todo el procesamiento se realiza en tu navegador
- 🎨 **Interfaz Moderna** - Diseño oscuro con efectos glassmorphism
- 🔍 **Detección Inteligente** - Algoritmo de hash perceptual para eliminar duplicados
- ⚙️ **Configurable** - Ajusta la sensibilidad y velocidad de muestreo
- 📝 **Revisión Manual** - Selecciona manualmente qué diapositivas incluir
- 📄 **PDF de Alta Calidad** - Genera PDFs optimizados con tus diapositivas

## 📦 Instalación

**No requiere instalación.** Solo descarga estos archivos:

```
VIDEO A PDF/
├── index.html
├── styles.css
└── app.js
```

## 🎯 Uso

### Opción 1: Uso Local
1. Abre `index.html` con tu navegador (doble clic)
2. Arrastra tu video o haz clic para seleccionarlo
3. Ajusta la configuración según tus necesidades:
   - **Sensibilidad**: Mayor valor = menos duplicados (95% recomendado)
   - **Velocidad de muestreo**: Menor valor = más preciso pero más lento (1 frame/seg recomendado)
4. Haz clic en "Extraer Diapositivas"
5. Revisa las diapositivas detectadas
6. Haz clic en "Generar PDF" para descargar tu documento

### Opción 2: Compartir con Otros
Simplemente comprime la carpeta en un ZIP y compártela. El destinatario solo necesita:
1. Descomprimir el ZIP
2. Abrir `index.html`
3. ¡Listo!

## 🎬 Formatos de Video Soportados

- MP4
- WebM
- QuickTime (MOV)

## ⚙️ Cómo Funciona

1. **Carga del Video**: El video se carga completamente en memoria del navegador
2. **Extracción de Frames**: Se captura 1 frame por segundo (configurable)
3. **Detección de Duplicados**: 
   - Cada frame se convierte a escala de grises y se redimensiona
   - Se calcula un hash perceptual (fingerprint digital)
   - Se compara con el frame anterior
   - Si la similitud es >= 95%, se considera duplicado y se descarta
4. **Revisión Manual**: Puedes añadir/quitar diapositivas manualmente
5. **Generación PDF**: Se crea un PDF con las diapositivas seleccionadas

## 🔧 Requisitos Técnicos

- Navegador moderno (Chrome, Firefox, Edge, Safari)
- JavaScript habilitado
- Conexión a internet solo para cargar la librería pdf-lib (CDN)

## 💡 Consejos

- Para videos largos (>10 min), el procesamiento puede tardar 30-60 segundos
- Si detecta demasiados duplicados, reduce la sensibilidad (ej: 90%)
- Si omite diapositivas, aumenta la sensibilidad (ej: 98%)
- Puedes ajustar la velocidad de muestreo para videos con transiciones muy rápidas

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
