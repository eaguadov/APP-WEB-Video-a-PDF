# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto sigue [Semantic Versioning](https://semver.org/lang/es/).

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
