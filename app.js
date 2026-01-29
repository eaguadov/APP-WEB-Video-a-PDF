/**
 * Video to PDF Converter
 * Extracts unique frames from presentation videos and generates a PDF
 */

// ============================================
// State Management
// ============================================
const state = {
    videoFile: null,
    videoElement: null,
    frames: [],
    selectedFrames: new Set(),
    sensitivity: 95,
    samplingRate: 1,
    isProcessing: false
};

// ============================================
// DOM Elements
// ============================================
const elements = {
    uploadZone: document.getElementById('uploadZone'),
    fileInput: document.getElementById('fileInput'),
    uploadSection: document.getElementById('uploadSection'),
    videoSection: document.getElementById('videoSection'),
    videoPreview: document.getElementById('videoPreview'),
    videoDuration: document.getElementById('videoDuration'),
    videoDimensions: document.getElementById('videoDimensions'),
    videoSize: document.getElementById('videoSize'),
    controlsSection: document.getElementById('controlsSection'),
    sensitivitySlider: document.getElementById('sensitivitySlider'),
    sensitivityValue: document.getElementById('sensitivityValue'),
    samplingSlider: document.getElementById('samplingSlider'),
    samplingValue: document.getElementById('samplingValue'),
    extractBtn: document.getElementById('extractBtn'),
    progressContainer: document.getElementById('progressContainer'),
    progressFill: document.getElementById('progressFill'),
    progressText: document.getElementById('progressText'),
    gallerySection: document.getElementById('gallerySection'),
    frameGallery: document.getElementById('frameGallery'),
    emptyState: document.getElementById('emptyState'),
    generatePdfBtn: document.getElementById('generatePdfBtn'),
    hiddenCanvas: document.getElementById('hiddenCanvas')
};

// ============================================
// Initialization
// ============================================
function init() {
    setupEventListeners();
    console.log('📹 Video to PDF Converter initialized');
}

function setupEventListeners() {
    // Upload zone
    elements.uploadZone.addEventListener('click', () => elements.fileInput.click());
    elements.uploadZone.addEventListener('dragover', handleDragOver);
    elements.uploadZone.addEventListener('dragleave', handleDragLeave);
    elements.uploadZone.addEventListener('drop', handleDrop);
    elements.fileInput.addEventListener('change', handleFileSelect);
    
    // Sliders
    elements.sensitivitySlider.addEventListener('input', (e) => {
        state.sensitivity = parseInt(e.target.value);
        elements.sensitivityValue.textContent = `${state.sensitivity}%`;
    });
    
    elements.samplingSlider.addEventListener('input', (e) => {
        state.samplingRate = parseFloat(e.target.value);
        elements.samplingValue.textContent = `${state.samplingRate} frame/seg`;
    });
    
    // Extract button
    elements.extractBtn.addEventListener('click', extractFrames);
    
    // Generate PDF button
    elements.generatePdfBtn.addEventListener('click', generatePDF);
}

// ============================================
// File Handling
// ============================================
function handleDragOver(e) {
    e.preventDefault();
    elements.uploadZone.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.preventDefault();
    elements.uploadZone.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    elements.uploadZone.classList.remove('drag-over');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
}

function handleFileSelect(e) {
    const files = e.target.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
}

function handleFile(file) {
    // Validate file type
    if (!file.type.startsWith('video/')) {
        alert('❌ Por favor selecciona un archivo de video válido');
        return;
    }
    
    state.videoFile = file;
    loadVideo(file);
}

function loadVideo(file) {
    const url = URL.createObjectURL(file);
    elements.videoPreview.src = url;
    state.videoElement = elements.videoPreview;
    
    elements.videoPreview.addEventListener('loadedmetadata', () => {
        displayVideoInfo(file);
        showSection(elements.videoSection);
        showSection(elements.controlsSection);
    });
}

function displayVideoInfo(file) {
    const duration = elements.videoPreview.duration;
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    
    elements.videoDuration.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    elements.videoDimensions.textContent = `${elements.videoPreview.videoWidth} × ${elements.videoPreview.videoHeight}`;
    elements.videoSize.textContent = formatFileSize(file.size);
}

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// ============================================
// Frame Extraction
// ============================================
async function extractFrames() {
    if (state.isProcessing) return;
    
    state.isProcessing = true;
    state.frames = [];
    state.selectedFrames.clear();
    
    elements.extractBtn.disabled = true;
    showProgress();
    
    try {
        const video = elements.videoPreview;
        const canvas = elements.hiddenCanvas;
        const ctx = canvas.getContext('2d');
        
        // Set canvas size to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const duration = video.duration;
        const interval = state.samplingRate;
        const totalFrames = Math.floor(duration / interval);
        
        let previousHash = null;
        let frameCount = 0;
        
        updateProgress(0, `Extrayendo frames (0/${totalFrames})...`);
        
        for (let time = 0; time < duration; time += interval) {
            // Seek to time
            await seekTo(video, time);
            
            // Draw current frame to canvas
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            // Get image data and calculate hash
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const hash = calculatePerceptualHash(imageData);
            
            // Compare with previous frame
            const isDuplicate = previousHash && isSimilar(hash, previousHash, state.sensitivity);
            
            if (!isDuplicate) {
                // Convert canvas to base64
                const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
                
                state.frames.push({
                    id: Date.now() + frameCount,
                    dataUrl: dataUrl,
                    time: time,
                    hash: hash
                });
                
                state.selectedFrames.add(state.frames.length - 1);
                previousHash = hash;
            }
            
            frameCount++;
            updateProgress((frameCount / totalFrames) * 100, `Extrayendo frames (${frameCount}/${totalFrames})...`);
        }
        
        updateProgress(100, `✅ Extracción completa: ${state.frames.length} diapositivas únicas detectadas`);
        
        setTimeout(() => {
            hideProgress();
            displayFrameGallery();
        }, 1000);
        
    } catch (error) {
        console.error('Error extracting frames:', error);
        alert('❌ Error al extraer frames: ' + error.message);
        hideProgress();
    } finally {
        state.isProcessing = false;
        elements.extractBtn.disabled = false;
    }
}

function seekTo(video, time) {
    return new Promise((resolve) => {
        video.currentTime = time;
        video.addEventListener('seeked', function onSeeked() {
            video.removeEventListener('seeked', onSeeked);
            // Small delay to ensure frame is rendered
            setTimeout(resolve, 50);
        });
    });
}

// ============================================
// Perceptual Hashing (Simple Implementation)
// ============================================
function calculatePerceptualHash(imageData) {
    const size = 16; // Resize to 16x16
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    
    // Resize and convert to grayscale
    const pixels = [];
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const srcX = Math.floor((x / size) * width);
            const srcY = Math.floor((y / size) * height);
            const i = (srcY * width + srcX) * 4;
            
            // Convert to grayscale
            const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
            pixels.push(gray);
        }
    }
    
    // Calculate average
    const avg = pixels.reduce((a, b) => a + b, 0) / pixels.length;
    
    // Create hash: 1 if pixel > average, 0 otherwise
    const hash = pixels.map(p => p > avg ? 1 : 0);
    
    return hash;
}

function isSimilar(hash1, hash2, threshold) {
    if (!hash1 || !hash2 || hash1.length !== hash2.length) return false;
    
    // Calculate Hamming distance
    let differences = 0;
    for (let i = 0; i < hash1.length; i++) {
        if (hash1[i] !== hash2[i]) differences++;
    }
    
    const similarity = ((hash1.length - differences) / hash1.length) * 100;
    return similarity >= threshold;
}

// ============================================
// Frame Gallery Display
// ============================================
function displayFrameGallery() {
    elements.frameGallery.innerHTML = '';
    
    if (state.frames.length === 0) {
        elements.emptyState.classList.remove('hidden');
        elements.generatePdfBtn.classList.add('hidden');
        return;
    }
    
    elements.emptyState.classList.add('hidden');
    elements.generatePdfBtn.classList.remove('hidden');
    showSection(elements.gallerySection);
    
    state.frames.forEach((frame, index) => {
        const frameItem = createFrameElement(frame, index);
        elements.frameGallery.appendChild(frameItem);
    });
}

function createFrameElement(frame, index) {
    const div = document.createElement('div');
    div.className = 'frame-item';
    if (state.selectedFrames.has(index)) {
        div.classList.add('selected');
    }
    
    const img = document.createElement('img');
    img.src = frame.dataUrl;
    img.alt = `Diapositiva ${index + 1}`;
    
    const number = document.createElement('div');
    number.className = 'frame-number';
    number.textContent = index + 1;
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'frame-delete';
    deleteBtn.textContent = '❌';
    deleteBtn.onclick = (e) => {
        e.stopPropagation();
        deleteFrame(index);
    };
    
    div.onclick = () => toggleFrameSelection(index, div);
    
    div.appendChild(img);
    div.appendChild(number);
    div.appendChild(deleteBtn);
    
    return div;
}

function toggleFrameSelection(index, element) {
    if (state.selectedFrames.has(index)) {
        state.selectedFrames.delete(index);
        element.classList.remove('selected');
    } else {
        state.selectedFrames.add(index);
        element.classList.add('selected');
    }
    
    // Update PDF button state
    elements.generatePdfBtn.disabled = state.selectedFrames.size === 0;
}

function deleteFrame(index) {
    if (confirm('¿Eliminar esta diapositiva?')) {
        state.frames.splice(index, 1);
        
        // Update selected frames indices
        const newSelected = new Set();
        state.selectedFrames.forEach(i => {
            if (i < index) newSelected.add(i);
            else if (i > index) newSelected.add(i - 1);
        });
        state.selectedFrames = newSelected;
        
        displayFrameGallery();
    }
}

// ============================================
// PDF Generation
// ============================================
async function generatePDF() {
    if (state.selectedFrames.size === 0) {
        alert('❌ Selecciona al menos una diapositiva');
        return;
    }
    
    showProgress();
    updateProgress(0, 'Generando PDF...');
    
    try {
        const { PDFDocument } = PDFLib;
        const pdfDoc = await PDFDocument.create();
        
        const selectedIndices = Array.from(state.selectedFrames).sort((a, b) => a - b);
        const total = selectedIndices.length;
        
        for (let i = 0; i < total; i++) {
            const index = selectedIndices[i];
            const frame = state.frames[index];
            
            updateProgress((i / total) * 100, `Añadiendo página ${i + 1}/${total}...`);
            
            // Convert base64 to bytes
            const imageBytes = await fetch(frame.dataUrl).then(res => res.arrayBuffer());
            
            // Embed image
            const image = await pdfDoc.embedJpg(imageBytes);
            const { width, height } = image.scale(1);
            
            // Add page with image dimensions
            const page = pdfDoc.addPage([width, height]);
            page.drawImage(image, {
                x: 0,
                y: 0,
                width: width,
                height: height
            });
        }
        
        updateProgress(100, 'Guardando PDF...');
        
        // Save PDF
        const pdfBytes = await pdfDoc.save();
        
        // Download
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `presentacion_${Date.now()}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
        
        updateProgress(100, '✅ PDF generado correctamente');
        
        setTimeout(hideProgress, 2000);
        
    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('❌ Error al generar PDF: ' + error.message);
        hideProgress();
    }
}

// ============================================
// UI Helpers
// ============================================
function showSection(section) {
    section.classList.remove('hidden');
}

function showProgress() {
    elements.progressContainer.classList.add('active');
}

function hideProgress() {
    elements.progressContainer.classList.remove('active');
}

function updateProgress(percent, text) {
    elements.progressFill.style.width = `${percent}%`;
    elements.progressText.textContent = text;
}

// ============================================
// Start Application
// ============================================
document.addEventListener('DOMContentLoaded', init);
