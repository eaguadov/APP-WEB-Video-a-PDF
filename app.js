/**
 * Video to PDF Converter v2.0
 * Extracts unique frames from presentation videos and generates a PDF
 * New in v2.0: Drag & drop reordering, improved duplicate detection, transition detection
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
    samplingRate: 0.3, // Check every 0.3 seconds for stability
    stabilityFrames: 3, // How many stable frames before capturing
    isProcessing: false,
    sortable: null
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
    stabilitySlider: document.getElementById('stabilitySlider'),
    stabilityValue: document.getElementById('stabilityValue'),
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
    console.log('📹 Video to PDF Converter v2.0 initialized');
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

    elements.stabilitySlider.addEventListener('input', (e) => {
        state.stabilityFrames = parseInt(e.target.value);
        elements.stabilityValue.textContent = `${state.stabilityFrames} frames`;
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
// Frame Extraction with Stability Detection (v2.0)
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
        const checkInterval = state.samplingRate;
        const totalChecks = Math.floor(duration / checkInterval);

        let previousFrameHash = null;
        let lastSavedHash = null;
        let stabilityCounter = 0;
        let checkCount = 0;

        updateProgress(0, `Analizando video (0/${totalChecks})...`);

        for (let time = 0; time < duration; time += checkInterval) {
            // Seek to time
            await seekTo(video, time);

            // Draw current frame to canvas
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Get image data and calculate multi-level hash
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const currentHash = calculateAdvancedHash(imageData);

            // Check stability with previous frame
            if (previousFrameHash) {
                const similarityToPrevious = compareHashes(currentHash, previousFrameHash);

                // If very similar to previous frame, increment stability
                if (similarityToPrevious >= 98) {
                    stabilityCounter++;
                } else {
                    // Content is changing, reset counter
                    stabilityCounter = 0;
                }

                // If stable for required frames, consider capturing
                if (stabilityCounter >= state.stabilityFrames) {
                    // Check if it's different from last saved frame
                    const isDuplicate = lastSavedHash &&
                        compareHashes(currentHash, lastSavedHash) >= state.sensitivity;

                    if (!isDuplicate) {
                        // Convert canvas to base64
                        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);

                        state.frames.push({
                            id: Date.now() + state.frames.length,
                            dataUrl: dataUrl,
                            time: time,
                            hash: currentHash
                        });

                        state.selectedFrames.add(state.frames.length - 1);
                        lastSavedHash = currentHash;

                        console.log(`✅ Frame capturado en ${time.toFixed(1)}s - Total: ${state.frames.length}`);
                    }

                    // Reset stability counter after capturing or detecting duplicate
                    stabilityCounter = 0;
                }
            }

            previousFrameHash = currentHash;
            checkCount++;
            updateProgress((checkCount / totalChecks) * 100, `Analizando video (${checkCount}/${totalChecks})...`);
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
// Advanced Multi-Level Hash (v2.0)
// ============================================
function calculateAdvancedHash(imageData) {
    const phash = calculatePerceptualHash(imageData);
    const histogram = calculateColorHistogram(imageData);
    const structural = calculateStructuralHash(imageData);

    return {
        perceptual: phash,
        histogram: histogram,
        structural: structural
    };
}

function calculatePerceptualHash(imageData) {
    const size = 32; // Increased from 16x16 to 32x32
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

function calculateColorHistogram(imageData) {
    const data = imageData.data;
    const bins = 8;
    const histogram = { r: new Array(bins).fill(0), g: new Array(bins).fill(0), b: new Array(bins).fill(0) };

    for (let i = 0; i < data.length; i += 4) {
        const r = Math.floor((data[i] / 256) * bins);
        const g = Math.floor((data[i + 1] / 256) * bins);
        const b = Math.floor((data[i + 2] / 256) * bins);

        histogram.r[Math.min(r, bins - 1)]++;
        histogram.g[Math.min(g, bins - 1)]++;
        histogram.b[Math.min(b, bins - 1)]++;
    }

    return histogram;
}

function calculateStructuralHash(imageData) {
    // Divide image into 9 quadrants (3x3 grid)
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const quadrants = [];

    for (let qy = 0; qy < 3; qy++) {
        for (let qx = 0; qx < 3; qx++) {
            const startX = Math.floor((qx / 3) * width);
            const endX = Math.floor(((qx + 1) / 3) * width);
            const startY = Math.floor((qy / 3) * height);
            const endY = Math.floor(((qy + 1) / 3) * height);

            let sum = 0;
            let count = 0;

            for (let y = startY; y < endY; y += 10) {
                for (let x = startX; x < endX; x += 10) {
                    const i = (y * width + x) * 4;
                    const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
                    sum += gray;
                    count++;
                }
            }

            quadrants.push(sum / count);
        }
    }

    return quadrants;
}

function compareHashes(hash1, hash2) {
    if (!hash1 || !hash2) return 0;

    // Compare perceptual hash (50% weight)
    const phashSimilarity = comparePerceptualHash(hash1.perceptual, hash2.perceptual);

    // Compare histogram (30% weight)
    const histogramSimilarity = compareHistograms(hash1.histogram, hash2.histogram);

    // Compare structural (20% weight)
    const structuralSimilarity = compareStructural(hash1.structural, hash2.structural);

    const combined = phashSimilarity * 0.5 + histogramSimilarity * 0.3 + structuralSimilarity * 0.2;

    return combined;
}

function comparePerceptualHash(hash1, hash2) {
    if (!hash1 || !hash2 || hash1.length !== hash2.length) return 0;

    let differences = 0;
    for (let i = 0; i < hash1.length; i++) {
        if (hash1[i] !== hash2[i]) differences++;
    }

    return ((hash1.length - differences) / hash1.length) * 100;
}

function compareHistograms(hist1, hist2) {
    if (!hist1 || !hist2) return 0;

    let similarity = 0;
    let total = 0;

    ['r', 'g', 'b'].forEach(channel => {
        for (let i = 0; i < hist1[channel].length; i++) {
            const min = Math.min(hist1[channel][i], hist2[channel][i]);
            const max = Math.max(hist1[channel][i], hist2[channel][i]);
            similarity += min;
            total += max;
        }
    });

    return (similarity / total) * 100;
}

function compareStructural(struct1, struct2) {
    if (!struct1 || !struct2 || struct1.length !== struct2.length) return 0;

    let totalDiff = 0;
    let maxPossibleDiff = 0;

    for (let i = 0; i < struct1.length; i++) {
        const diff = Math.abs(struct1[i] - struct2[i]);
        totalDiff += diff;
        maxPossibleDiff += Math.max(struct1[i], struct2[i]);
    }

    return ((maxPossibleDiff - totalDiff) / maxPossibleDiff) * 100;
}

// ============================================
// Frame Gallery Display with Drag & Drop (v2.0)
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

    // Initialize SortableJS for drag & drop
    if (state.sortable) {
        state.sortable.destroy();
    }

    state.sortable = Sortable.create(elements.frameGallery, {
        animation: 200,
        ghostClass: 'sortable-ghost',
        dragClass: 'sortable-drag',
        onEnd: handleFrameReorder
    });
}

function createFrameElement(frame, index) {
    const div = document.createElement('div');
    div.className = 'frame-item';
    div.dataset.index = index;
    if (state.selectedFrames.has(index)) {
        div.classList.add('selected');
    }

    const dragHandle = document.createElement('div');
    dragHandle.className = 'frame-drag-handle';
    dragHandle.textContent = '⋮⋮';

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

    div.appendChild(dragHandle);
    div.appendChild(img);
    div.appendChild(number);
    div.appendChild(deleteBtn);

    return div;
}

function handleFrameReorder(evt) {
    const oldIndex = evt.oldIndex;
    const newIndex = evt.newIndex;

    if (oldIndex === newIndex) return;

    // Reorder frames array
    const [movedFrame] = state.frames.splice(oldIndex, 1);
    state.frames.splice(newIndex, 0, movedFrame);

    // Update selected frames indices
    const newSelected = new Set();
    state.selectedFrames.forEach(idx => {
        let newIdx = idx;
        if (idx === oldIndex) {
            newIdx = newIndex;
        } else if (oldIndex < newIndex) {
            if (idx > oldIndex && idx <= newIndex) newIdx--;
        } else {
            if (idx >= newIndex && idx < oldIndex) newIdx++;
        }
        newSelected.add(newIdx);
    });
    state.selectedFrames = newSelected;

    // Redraw gallery to update numbers
    displayFrameGallery();
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
        a.download = `presentacion_v2_${Date.now()}.pdf`;
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
