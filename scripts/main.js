// Hemoscan Image to RGB565 Converter
// Fully client-side, vanilla JS implementation

// State variables - C-Array
let originalImage = null;
let currentFile = null;
let targetWidthInput = document.getElementById('targetWidth');
let targetHeightInput = document.getElementById('targetHeight');
let maintainAspectCheck = document.getElementById('maintainAspect');
let variableNameInput = document.getElementById('variableName');
let widthMacroInput = document.getElementById('widthMacro');
let heightMacroInput = document.getElementById('heightMacro');
let guardNameInput = document.getElementById('guardName');
let btnConvert = document.getElementById('btnConvert');
let btnCopy = document.getElementById('btnCopy');
let btnDownload = document.getElementById('btnDownload');
let codeResult = document.getElementById('codeResult');
let dropZone = document.getElementById('dropZone');
let imageInput = document.getElementById('imageInput');
let systemStatus = document.getElementById('systemStatus');
let originalWidth = 1;
let originalHeight = 1;

// State variables - Resizer
let resizerImage = null;
let resizerFile = null;
let resizerWidthInput = document.getElementById('resizerWidth');
let resizerHeightInput = document.getElementById('resizerHeight');
let resizerMaintainAspect = document.getElementById('resizerMaintainAspect');
let resizerFormatSelect = document.getElementById('resizerFormat');
let btnResize = document.getElementById('btnResize');
let btnDownloadResized = document.getElementById('btnDownloadResized');
let dropZoneResizer = document.getElementById('dropZoneResizer');
let imageInputResizer = document.getElementById('imageInputResizer');
let resizerOriginalWidth = 1;
let resizerOriginalHeight = 1;

// Setup Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Tab switching
    const btnTabCArray = document.getElementById('btnTabCArray');
    const btnTabResizer = document.getElementById('btnTabResizer');
    const carraySection = document.getElementById('carraySection');
    const resizerSection = document.getElementById('resizerSection');

    btnTabCArray.addEventListener('click', () => {
        btnTabCArray.classList.add('active');
        btnTabResizer.classList.remove('active');
        carraySection.style.display = 'grid';
        resizerSection.style.display = 'none';
        setSystemStatus('Ready', 'ready');
    });

    btnTabResizer.addEventListener('click', () => {
        btnTabResizer.classList.add('active');
        btnTabCArray.classList.remove('active');
        carraySection.style.display = 'none';
        resizerSection.style.display = 'grid';
        setSystemStatus('Ready', 'ready');
    });

    // C-Array: File input & Drag/Drop
    imageInput.addEventListener('change', handleFileSelect);
    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
    dropZone.addEventListener('dragleave', () => { dropZone.classList.remove('dragover'); });
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) processFile(e.dataTransfer.files[0]);
    });

    // C-Array: Dimension aspect ratio lock
    targetWidthInput.addEventListener('input', () => {
        if (maintainAspectCheck.checked && originalImage) {
            const w = parseInt(targetWidthInput.value) || 0;
            if (w > 0) targetHeightInput.value = Math.round(w * (originalHeight / originalWidth));
        }
        updateStatus();
    });
    targetHeightInput.addEventListener('input', () => {
        if (maintainAspectCheck.checked && originalImage) {
            const h = parseInt(targetHeightInput.value) || 0;
            if (h > 0) targetWidthInput.value = Math.round(h * (originalWidth / originalHeight));
        }
        updateStatus();
    });

    variableNameInput.addEventListener('input', () => {
        const base = variableNameInput.value.trim().toUpperCase().replace(/[^A-Z0-9_]/g, '_');
        widthMacroInput.value = `${base}_WIDTH`;
        heightMacroInput.value = `${base}_HEIGHT`;
        guardNameInput.value = `${base}_H`;
    });

    btnConvert.addEventListener('click', performConversion);
    btnCopy.addEventListener('click', copyToClipboard);
    btnDownload.addEventListener('click', downloadHeaderFile);

    // Resizer: File input & Drag/Drop
    imageInputResizer.addEventListener('change', handleResizerFileSelect);
    dropZoneResizer.addEventListener('dragover', (e) => { e.preventDefault(); dropZoneResizer.classList.add('dragover'); });
    dropZoneResizer.addEventListener('dragleave', () => { dropZoneResizer.classList.remove('dragover'); });
    dropZoneResizer.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZoneResizer.classList.remove('dragover');
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) processResizerFile(e.dataTransfer.files[0]);
    });

    // Resizer: Dimension aspect ratio lock
    resizerWidthInput.addEventListener('input', () => {
        if (resizerMaintainAspect.checked && resizerImage) {
            const w = parseInt(resizerWidthInput.value) || 0;
            if (w > 0) resizerHeightInput.value = Math.round(w * (resizerOriginalHeight / resizerOriginalWidth));
        }
        updateResizerStatus();
    });
    resizerHeightInput.addEventListener('input', () => {
        if (resizerMaintainAspect.checked && resizerImage) {
            const h = parseInt(resizerHeightInput.value) || 0;
            if (h > 0) resizerWidthInput.value = Math.round(h * (resizerOriginalWidth / resizerOriginalHeight));
        }
        updateResizerStatus();
    });
    btnResize.addEventListener('click', performResizing);
    btnDownloadResized.addEventListener('click', downloadResizedImage);

    setSystemStatus('Ready', 'ready');
});

// Set status messages helper
function setSystemStatus(message, className = '') {
    systemStatus.textContent = message;
    systemStatus.className = 'system-status';
    if (className) {
        systemStatus.classList.add(className);
    }
}

// Map filenames to C specifications
function getCustomMappings(filename) {
    // Remove extension
    const base = filename.replace(/\.[^/.]+$/, "").trim();
    const lower = base.toLowerCase();
    let arrayName = base.replace(/[^a-zA-Z0-9_]+/g, '_');
    
    // Explicit Hemoscan script mappings
    if (lower === "home") {
        arrayName = "Home";
    } else if (lower === "info" || lower === "info_page") {
        arrayName = "Info";
    } else if (lower === "test") {
        arrayName = "Test";
    } else if (lower === "result") {
        arrayName = "result";
    } else if (lower === "records" || lower === "record") {
        arrayName = "record";
    } else if (lower === "splash") {
        arrayName = "splash";
    } else if (lower === "clock") {
        arrayName = "clock";
    } else {
        // Sanitize first char (must not start with digit)
        if (/^[0-9]/.test(arrayName)) {
            arrayName = "_" + arrayName;
        }
    }
    
    const macroBase = arrayName.toUpperCase();
    return {
        arrayName: arrayName,
        wMacro: `${macroBase}_WIDTH`,
        hMacro: `${macroBase}_HEIGHT`,
        guard: `${macroBase}_H`
    };
}

function handleFileSelect(e) {
    if (e.target.files && e.target.files.length > 0) {
        processFile(e.target.files[0]);
    }
}

function processFile(file) {
    if (!file.type.startsWith('image/')) {
        alert('Please upload a valid image file (PNG, JPG, JPEG, SVG).');
        return;
    }
    
    currentFile = file;
    setSystemStatus('Loading image...', 'working');
    
    const reader = new FileReader();
    reader.onload = (event) => {
        originalImage = new Image();
        originalImage.onload = () => {
            originalWidth = originalImage.width;
            originalHeight = originalImage.height;
            
            // Display details
            document.getElementById('fileNameText').textContent = file.name;
            document.getElementById('fileResolutionText').textContent = `${originalWidth} x ${originalHeight} px`;
            document.getElementById('fileDetails').style.display = 'flex';
            
            // Set defaults: standard 240x320 if screen size matches, or keep actual image dimensions
            targetWidthInput.value = originalWidth;
            targetHeightInput.value = originalHeight;
            
            // Set auto mappings
            const mappings = getCustomMappings(file.name);
            variableNameInput.value = mappings.arrayName;
            widthMacroInput.value = mappings.wMacro;
            heightMacroInput.value = mappings.hMacro;
            guardNameInput.value = mappings.guard;
            
            // Render original preview
            const sourceWrapper = document.getElementById('sourceWrapper');
            sourceWrapper.innerHTML = '';
            const previewImg = originalImage.cloneNode(true);
            sourceWrapper.appendChild(previewImg);
            
            // Enable convert button
            btnConvert.disabled = false;
            
            // Reset output preview / code areas
            document.getElementById('canvasWrapper').innerHTML = '<span class="preview-placeholder">Click Convert to view</span>';
            codeResult.value = '';
            btnCopy.disabled = true;
            btnDownload.disabled = true;
            
            setSystemStatus('Image Loaded', 'ready');
        };
        originalImage.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

function updateStatus() {
    if (originalImage) {
        btnConvert.disabled = false;
    }
}

function performConversion() {
    if (!originalImage) return;
    
    setSystemStatus('Processing...', 'working');
    
    const w = parseInt(targetWidthInput.value) || 240;
    const h = parseInt(targetHeightInput.value) || 320;
    
    // Create an offscreen canvas to resize and extract pixel data
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    
    // Enable high quality scaling
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'medium';
    
    // Draw and resize
    ctx.drawImage(originalImage, 0, 0, w, h);
    
    // Get RGBA pixel buffer
    const imgData = ctx.getImageData(0, 0, w, h);
    const pixels = imgData.data; // [r, g, b, a, r, g, b, a, ...]
    
    const rgb565Array = new Uint16Array(w * h);
    const previewPixels = new Uint8ClampedArray(w * h * 4);
    
    for (let i = 0; i < w * h; i++) {
        const r = pixels[i * 4];
        const g = pixels[i * 4 + 1];
        const b = pixels[i * 4 + 2];
        
        // --- Custom Math Parity ---
        // Originally:
        // Website generated 24-bit big endian: combinedByte = (R<<16) | (G<<8) | B
        // changeEndianness(combinedByte) => 0xBBGGRR
        // Python convert_bitmaps_to_rgb565.py read 0xBBGGRR:
        //     r_part = (val >> 16) & 0xFF  => which is B
        //     g_part = (val >> 8) & 0xFF   => which is G
        //     b_part = val & 0xFF          => which is R
        //     rgb565 = ((r_part & 0xF8) << 8) | ((g_part & 0xFC) << 3) | (b_part >> 3)
        // Which translates directly to:
        //     rgb565 = ((b & 0xF8) << 8) | ((g & 0xFC) << 3) | (r >> 3)
        
        const val565 = ((b & 0xF8) << 8) | ((g & 0xFC) << 3) | (r >> 3);
        rgb565Array[i] = val565;
        
        // --- Scale back to RGB888 for preview rendering ---
        // Decode back:
        // b_decoded is in bits 11-15 (5 bits)
        // g_decoded is in bits 5-10 (6 bits)
        // r_decoded is in bits 0-4 (5 bits)
        const b5 = (val565 >> 11) & 0x1F;
        const g6 = (val565 >> 5) & 0x3F;
        const r5 = val565 & 0x1F;
        
        const r8 = Math.round(r5 * 255 / 31);
        const g8 = Math.round(g6 * 255 / 63);
        const b8 = Math.round(b5 * 255 / 31);
        
        previewPixels[i * 4] = r8;
        previewPixels[i * 4 + 1] = g8;
        previewPixels[i * 4 + 2] = b8;
        previewPixels[i * 4 + 3] = 255; // opaque alpha
    }
    
    // Draw the preview image on the display canvas
    const previewCanvas = document.createElement('canvas');
    previewCanvas.width = w;
    previewCanvas.height = h;
    const previewCtx = previewCanvas.getContext('2d');
    const previewImgData = new ImageData(previewPixels, w, h);
    previewCtx.putImageData(previewImgData, 0, 0);
    
    const canvasWrapper = document.getElementById('canvasWrapper');
    canvasWrapper.innerHTML = '';
    canvasWrapper.appendChild(previewCanvas);
    
    // Generate C header file text
    const textCode = generateCHeader(w, h, rgb565Array);
    codeResult.value = textCode;
    
    // Enable copy & download buttons
    btnCopy.disabled = false;
    btnDownload.disabled = false;
    
    setSystemStatus('Conversion Complete', 'ready');
}

function generateCHeader(w, h, rgb565Array) {
    const varName = variableNameInput.value.trim() || 'Home';
    const wMacro = widthMacroInput.value.trim() || 'HOME_WIDTH';
    const hMacro = heightMacroInput.value.trim() || 'HOME_HEIGHT';
    const guardName = guardNameInput.value.trim() || 'HOME_H';
    const numPixels = w * h;
    const numBytes = numPixels * 2;
    
    let out = [];
    out.push(`#ifndef ${guardName}`);
    out.push(`#define ${guardName}`);
    out.push(``);
    out.push(`#include <stdint.h>`);
    out.push(``);
    out.push(`#define ${wMacro} ${w}`);
    out.push(`#define ${hMacro} ${h}`);
    out.push(``);
    out.push(`static const uint16_t ${varName}[${w} * ${h}] = {`);
    
    // Hex entries formatted 8 per line, e.g. "    0x12AB, 0x34CD, ..."
    for (let i = 0; i < rgb565Array.length; i += 8) {
        let chunk = [];
        for (let j = 0; j < 8 && (i + j) < rgb565Array.length; j++) {
            const val = rgb565Array[i + j];
            // Format 0xXXXX (4-digit uppercase hex)
            const hex = '0x' + val.toString(16).toUpperCase().padStart(4, '0');
            chunk.push(hex);
        }
        out.push(`    ` + chunk.join(', ') + `,`);
    }
    
    out.push(`};`);
    out.push(``);
    out.push(`#endif // ${guardName}`);
    out.push(``);
    
    return out.join('\n');
}

function copyToClipboard() {
    codeResult.select();
    codeResult.setSelectionRange(0, 99999); // For mobile devices
    
    try {
        navigator.clipboard.writeText(codeResult.value).then(() => {
            const oldText = btnCopy.innerHTML;
            btnCopy.innerHTML = '<span class="icon-span">✓</span> Copied!';
            setTimeout(() => {
                btnCopy.innerHTML = oldText;
            }, 2000);
        });
    } catch (err) {
        // Fallback for older browsers
        document.execCommand('copy');
        const oldText = btnCopy.innerHTML;
        btnCopy.innerHTML = '<span class="icon-span">✓</span> Copied!';
        setTimeout(() => {
            btnCopy.innerHTML = oldText;
        }, 2000);
    }
}

function downloadHeaderFile() {
    const code = codeResult.value;
    if (!code) return;
    
    const varName = variableNameInput.value.trim() || 'Home';
    const filename = `${varName}.h`;
    
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    
    if (window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveBlob(blob, filename);
    } else {
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    }
}

// --- Image Resizer Handlers ---

function handleResizerFileSelect(e) {
    if (e.target.files && e.target.files.length > 0) {
        processResizerFile(e.target.files[0]);
    }
}

function processResizerFile(file) {
    if (!file.type.startsWith('image/')) {
        alert('Please upload a valid image file (PNG, JPG, JPEG, SVG).');
        return;
    }
    
    resizerFile = file;
    setSystemStatus('Loading image for resize...', 'working');
    
    const reader = new FileReader();
    reader.onload = (event) => {
        resizerImage = new Image();
        resizerImage.onload = () => {
            resizerOriginalWidth = resizerImage.width;
            resizerOriginalHeight = resizerImage.height;
            
            // Display details
            document.getElementById('resizerFileNameText').textContent = file.name;
            document.getElementById('resizerFileResolutionText').textContent = `${resizerOriginalWidth} x ${resizerOriginalHeight} px`;
            document.getElementById('fileDetailsResizer').style.display = 'flex';
            
            // Set default dimensions to 1386 x 1386 (per user's PIL script)
            resizerWidthInput.value = 1386;
            resizerHeightInput.value = 1386;
            
            // Autoselect format based on file extension
            if (file.type === 'image/png') {
                resizerFormatSelect.value = 'image/png';
            } else {
                resizerFormatSelect.value = 'image/jpeg';
            }
            
            // Render original preview
            const sourceWrapper = document.getElementById('resizerSourceWrapper');
            sourceWrapper.innerHTML = '';
            const previewImg = resizerImage.cloneNode(true);
            sourceWrapper.appendChild(previewImg);
            
            // Enable resize button
            btnResize.disabled = false;
            
            // Reset output preview
            document.getElementById('resizerCanvasWrapper').innerHTML = '<span class="preview-placeholder">Click Resize Image to view</span>';
            btnDownloadResized.disabled = true;
            
            setSystemStatus('Resize Image Loaded', 'ready');
        };
        resizerImage.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

function updateResizerStatus() {
    if (resizerImage) {
        btnResize.disabled = false;
    }
}

let resizedDataUrl = null; // Store data URL for download

function performResizing() {
    if (!resizerImage) return;
    
    setSystemStatus('Resizing image...', 'working');
    
    const w = parseInt(resizerWidthInput.value) || 1386;
    const h = parseInt(resizerHeightInput.value) || 1386;
    
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    
    // High-quality resizing using browser-native scaling algorithms
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    // Draw and scale the image
    ctx.drawImage(resizerImage, 0, 0, w, h);
    
    // Get format
    const format = resizerFormatSelect.value;
    
    // Export data URL (JPEG set to max quality 1.0)
    resizedDataUrl = canvas.toDataURL(format, format === 'image/jpeg' ? 1.0 : undefined);
    
    // Display preview
    const canvasWrapper = document.getElementById('resizerCanvasWrapper');
    canvasWrapper.innerHTML = '';
    const imgPreview = new Image();
    imgPreview.src = resizedDataUrl;
    canvasWrapper.appendChild(imgPreview);
    
    // Enable download button
    btnDownloadResized.disabled = false;
    
    setSystemStatus('Resizing Complete', 'ready');
}

function downloadResizedImage() {
    if (!resizedDataUrl || !resizerFile) return;
    
    // Determine file extension
    const format = resizerFormatSelect.value;
    const ext = format === 'image/png' ? 'png' : 'jpg';
    
    // Output file name, appending "_final" (matching user's python script output pattern)
    const baseName = resizerFile.name.replace(/\.[^/.]+$/, "").trim();
    const filename = `${baseName}_final.${ext}`;
    
    const link = document.createElement('a');
    link.href = resizedDataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
