// DMC_COLORS_COMPLETE is loaded from dmc-colors-complete.js

class CrossStitchPatternMaker {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.currentImage = null;
        this.pattern = [];
        this.colorMap = new Map();
        this.gridColumns = 0;
        this.gridRows = 0;
        
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        document.getElementById('imageUpload').addEventListener('change', (e) => this.handleImageUpload(e));
        document.getElementById('cameraBtn').addEventListener('click', () => this.startCamera());
        document.getElementById('captureBtn').addEventListener('click', () => this.capturePhoto());
        document.getElementById('generatePattern').addEventListener('click', () => this.generatePattern());
        document.getElementById('printPattern').addEventListener('click', () => this.printPattern());
        document.getElementById('gridSize').addEventListener('change', (e) => this.toggleCustomGrid(e));
        document.getElementById('colorCount').addEventListener('change', (e) => this.toggleCustomColor(e));
        document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());
        document.getElementById('showNumbers').addEventListener('change', (e) => this.toggleGridNumbers(e));
    }

    toggleCustomGrid(event) {
        const customGroup = document.getElementById('customGridGroup');
        customGroup.style.display = event.target.value === 'custom' ? 'block' : 'none';
    }

    toggleCustomColor(event) {
        const customGroup = document.getElementById('customColorGroup');
        customGroup.style.display = event.target.value === 'custom' ? 'block' : 'none';
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        const toggleBtn = document.getElementById('themeToggle');
        
        document.documentElement.setAttribute('data-theme', newTheme);
        toggleBtn.textContent = newTheme === 'dark' ? '☀️ Light' : '🌙 Dark';
        
        localStorage.setItem('theme', newTheme);
    }

    toggleGridNumbers(event) {
        if (this.pattern.length > 0) {
            this.renderPattern();
        }
    }

    initializeTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        const toggleBtn = document.getElementById('themeToggle');
        
        document.documentElement.setAttribute('data-theme', savedTheme);
        toggleBtn.textContent = savedTheme === 'dark' ? '☀️ Light' : '🌙 Dark';
    }

    handleImageUpload(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.loadImage(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    }

    async startCamera() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            const video = document.getElementById('camera');
            video.srcObject = stream;
            video.classList.remove('hidden');
            document.getElementById('captureBtn').classList.remove('hidden');
        } catch (err) {
            alert('Camera access denied or not available');
        }
    }

    capturePhoto() {
        const video = document.getElementById('camera');
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);
        
        const dataURL = canvas.toDataURL('image/png');
        this.loadImage(dataURL);
        
        // Stop camera
        const stream = video.srcObject;
        stream.getTracks().forEach(track => track.stop());
        video.classList.add('hidden');
        document.getElementById('captureBtn').classList.add('hidden');
    }

    loadImage(src) {
        const img = new Image();
        img.onload = () => {
            this.currentImage = img;
            const preview = document.getElementById('imagePreview');
            preview.src = src;
            preview.classList.remove('hidden');
        };
        img.src = src;
    }

    generatePattern() {
        if (!this.currentImage) {
            alert('Please upload or capture an image first');
            return;
        }

        const gridSizeSelect = document.getElementById('gridSize').value;
        let width, height;
        
        if (gridSizeSelect === 'custom') {
            width = parseInt(document.getElementById('customGridWidth').value);
            height = parseInt(document.getElementById('customGridHeight').value);
        } else {
            width = height = parseInt(gridSizeSelect);
        }
        
        const colorCountSelect = document.getElementById('colorCount').value;
        const maxColors = colorCountSelect === 'custom' ? 
            parseInt(document.getElementById('customColorCount').value) : 
            parseInt(colorCountSelect);
        const algorithm = document.getElementById('algorithm').value;
        
        // Store grid dimensions globally
        this.gridColumns = width;
        this.gridRows = Math.round(width * (this.currentImage.height / this.currentImage.width));
        
        // Resize image to grid size
        this.canvas.width = this.gridColumns;
        this.canvas.height = this.gridRows;
        this.ctx.drawImage(this.currentImage, 0, 0, this.gridColumns, this.gridRows);
        
        const imageData = this.ctx.getImageData(0, 0, this.gridColumns, this.gridRows);
        
        // Step 3: Map each pixel directly to closest DMC color, then reduce to maxColors
        const pixelDMCMap = new Map();
        const dmcColorCounts = new Map();
        
        // First pass: map each pixel to its closest DMC color
        for (let y = 0; y < this.gridRows; y++) {
            for (let x = 0; x < this.gridColumns; x++) {
                const index = (y * this.gridColumns + x) * 4;
                const r = imageData.data[index];
                const g = imageData.data[index + 1];
                const b = imageData.data[index + 2];
                
                const dmcColor = typeof DMC_COLORS_COMPLETE !== 'undefined' ? 
                    this.findClosestDMCColorComplete(r, g, b, algorithm) : 
                    this.findClosestDMCColor(r, g, b, algorithm);
                
                const pixelKey = `${x},${y}`;
                pixelDMCMap.set(pixelKey, dmcColor);
                
                dmcColorCounts.set(dmcColor.code, (dmcColorCounts.get(dmcColor.code) || 0) + 1);
            }
        }
        
        // Step 4: Select top maxColors by frequency
        const selectedDMCCodes = Array.from(dmcColorCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, maxColors)
            .map(entry => entry[0]);
        
        const selectedDMCSet = new Set(selectedDMCCodes);
        
        this.pattern = [];
        this.colorMap.clear();
        
        // Second pass: build pattern using selected colors
        for (let y = 0; y < this.gridRows; y++) {
            const row = [];
            for (let x = 0; x < this.gridColumns; x++) {
                const index = (y * this.gridColumns + x) * 4;
                const r = imageData.data[index];
                const g = imageData.data[index + 1];
                const b = imageData.data[index + 2];
                
                const pixelKey = `${x},${y}`;
                let dmcColor = pixelDMCMap.get(pixelKey);
                
                // If this DMC color wasn't selected, find closest selected one
                if (!selectedDMCSet.has(dmcColor.code)) {
                    dmcColor = this.findClosestSelectedDMCColor(r, g, b, selectedDMCCodes, algorithm);
                }
                
                row.push(dmcColor);
                
                if (!this.colorMap.has(dmcColor.code)) {
                    this.colorMap.set(dmcColor.code, dmcColor);
                }
            }
            this.pattern.push(row);
        }
        
        this.renderPattern();
        this.renderLegend();
    }

    quantizeColors(imageData, width, height, maxColors, algorithm) {
        // Use k-means clustering for better color quantization
        const pixels = [];
        for (let i = 0; i < imageData.data.length; i += 4) {
            pixels.push({
                r: imageData.data[i],
                g: imageData.data[i + 1],
                b: imageData.data[i + 2]
            });
        }
        
        return this.kMeansQuantization(pixels, maxColors, algorithm);
    }

    kMeansQuantization(pixels, k, algorithm) {
        // Initialize centroids randomly
        let centroids = [];
        for (let i = 0; i < k; i++) {
            const randomPixel = pixels[Math.floor(Math.random() * pixels.length)];
            centroids.push({ r: randomPixel.r, g: randomPixel.g, b: randomPixel.b });
        }
        
        let iterations = 0;
        const maxIterations = 20;
        let clusters = Array(k).fill().map(() => []);
        
        while (iterations < maxIterations) {
            // Reset clusters
            clusters = Array(k).fill().map(() => []);
            
            for (const pixel of pixels) {
                let minDistance = Infinity;
                let closestCentroid = 0;
                
                for (let i = 0; i < centroids.length; i++) {
                    const distance = this.calculateColorDistance(pixel, centroids[i], algorithm);
                    if (distance < minDistance) {
                        minDistance = distance;
                        closestCentroid = i;
                    }
                }
                
                clusters[closestCentroid].push(pixel);
            }
            
            // Update centroids
            let changed = false;
            for (let i = 0; i < centroids.length; i++) {
                if (clusters[i].length === 0) continue;
                
                const newCentroid = {
                    r: Math.round(clusters[i].reduce((sum, p) => sum + p.r, 0) / clusters[i].length),
                    g: Math.round(clusters[i].reduce((sum, p) => sum + p.g, 0) / clusters[i].length),
                    b: Math.round(clusters[i].reduce((sum, p) => sum + p.b, 0) / clusters[i].length)
                };
                
                if (newCentroid.r !== centroids[i].r || newCentroid.g !== centroids[i].g || newCentroid.b !== centroids[i].b) {
                    centroids[i] = newCentroid;
                    changed = true;
                }
            }
            
            if (!changed) break;
            iterations++;
        }
        
        // Add count information
        return centroids.map((centroid, i) => ({
            ...centroid,
            count: clusters[i] ? clusters[i].length : 0
        })).filter(c => c.count > 0);
    }

    calculateColorDistance(color1, color2, algorithm) {
        switch (algorithm) {
            case 'weighted':
                return Math.sqrt(
                    2 * Math.pow(color1.r - color2.r, 2) +
                    4 * Math.pow(color1.g - color2.g, 2) +
                    3 * Math.pow(color1.b - color2.b, 2)
                );
            case 'lab':
                const lab1 = this.rgbToLab(color1.r, color1.g, color1.b);
                const lab2 = this.rgbToLab(color2.r, color2.g, color2.b);
                return Math.sqrt(
                    Math.pow(lab1[0] - lab2[0], 2) +
                    Math.pow(lab1[1] - lab2[1], 2) +
                    Math.pow(lab1[2] - lab2[2], 2)
                );
            default: // euclidean
                return Math.sqrt(
                    Math.pow(color1.r - color2.r, 2) +
                    Math.pow(color1.g - color2.g, 2) +
                    Math.pow(color1.b - color2.b, 2)
                );
        }
    }

    findClosestSelectedDMCColor(r, g, b, selectedDMCCodes, algorithm) {
        let minDistance = Infinity;
        let closestColor = null;
        
        const dmcColors = typeof DMC_COLORS_COMPLETE !== 'undefined' ? DMC_COLORS_COMPLETE : {};
        
        for (const code of selectedDMCCodes) {
            const dmcColor = Object.values(dmcColors).find(c => c.code === code);
            if (!dmcColor || !dmcColor.hex) continue;
            
            const hexR = parseInt(dmcColor.hex.substr(0, 2), 16);
            const hexG = parseInt(dmcColor.hex.substr(2, 2), 16);
            const hexB = parseInt(dmcColor.hex.substr(4, 2), 16);
            
            const distance = this.calculateColorDistance(
                { r, g, b },
                { r: hexR, g: hexG, b: hexB },
                algorithm
            );
            
            if (distance < minDistance) {
                minDistance = distance;
                closestColor = { ...dmcColor };
            }
        }
        
        return closestColor || { code: '310', name: 'Black', hex: '000000' };
    }

    findClosestDMCColor(r, g, b, algorithm = 'euclidean') {
        let minDistance = Infinity;
        let closestColor = null;
        
        // Use original DMC_COLORS if available, otherwise use first available color
        const dmcColors = typeof DMC_COLORS !== 'undefined' ? DMC_COLORS : {
            'FFFFFF': { code: 'B5200', name: 'Snow White' },
            '000000': { code: '310', name: 'Black' }
        };
        
        for (const [hex, dmcColor] of Object.entries(dmcColors)) {
            const hexR = parseInt(hex.substr(0, 2), 16);
            const hexG = parseInt(hex.substr(2, 2), 16);
            const hexB = parseInt(hex.substr(4, 2), 16);
            
            let distance;
            
            switch (algorithm) {
                case 'weighted':
                    distance = Math.sqrt(
                        2 * Math.pow(r - hexR, 2) +
                        4 * Math.pow(g - hexG, 2) +
                        3 * Math.pow(b - hexB, 2)
                    );
                    break;
                case 'lab':
                    const lab1 = this.rgbToLab(r, g, b);
                    const lab2 = this.rgbToLab(hexR, hexG, hexB);
                    distance = Math.sqrt(
                        Math.pow(lab1[0] - lab2[0], 2) +
                        Math.pow(lab1[1] - lab2[1], 2) +
                        Math.pow(lab1[2] - lab2[2], 2)
                    );
                    break;
                default: // euclidean
                    distance = Math.sqrt(
                        Math.pow(r - hexR, 2) +
                        Math.pow(g - hexG, 2) +
                        Math.pow(b - hexB, 2)
                    );
            }
            
            if (distance < minDistance) {
                minDistance = distance;
                closestColor = { ...dmcColor, hex: hex };
            }
        }
        
        return closestColor;
    }

    findBestUnusedDMCColor(r, g, b, algorithm, usedCodes) {
        let minDistance = Infinity;
        let closestColor = null;
        
        const dmcColors = typeof DMC_COLORS !== 'undefined' ? DMC_COLORS : {
            'FFFFFF': { code: 'B5200', name: 'Snow White' },
            '000000': { code: '310', name: 'Black' }
        };
        
        for (const [hex, dmcColor] of Object.entries(dmcColors)) {
            if (usedCodes.has(dmcColor.code)) continue;
            
            const hexR = parseInt(hex.substr(0, 2), 16);
            const hexG = parseInt(hex.substr(2, 2), 16);
            const hexB = parseInt(hex.substr(4, 2), 16);
            
            let distance;
            
            switch (algorithm) {
                case 'weighted':
                    distance = Math.sqrt(
                        2 * Math.pow(r - hexR, 2) +
                        4 * Math.pow(g - hexG, 2) +
                        3 * Math.pow(b - hexB, 2)
                    );
                    break;
                case 'lab':
                    const lab1 = this.rgbToLab(r, g, b);
                    const lab2 = this.rgbToLab(hexR, hexG, hexB);
                    distance = Math.sqrt(
                        Math.pow(lab1[0] - lab2[0], 2) +
                        Math.pow(lab1[1] - lab2[1], 2) +
                        Math.pow(lab1[2] - lab2[2], 2)
                    );
                    break;
                default: // euclidean
                    distance = Math.sqrt(
                        Math.pow(r - hexR, 2) +
                        Math.pow(g - hexG, 2) +
                        Math.pow(b - hexB, 2)
                    );
            }
            
            if (distance < minDistance) {
                minDistance = distance;
                closestColor = { ...dmcColor, hex: hex };
            }
        }
        
        return closestColor;
    }

    rgbToLab(r, g, b) {
        // Simplified RGB to LAB conversion
        r /= 255; g /= 255; b /= 255;
        
        r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
        g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
        b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;
        
        let x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
        let y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.00000;
        let z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;
        
        x = x > 0.008856 ? Math.pow(x, 1/3) : (7.787 * x) + 16/116;
        y = y > 0.008856 ? Math.pow(y, 1/3) : (7.787 * y) + 16/116;
        z = z > 0.008856 ? Math.pow(z, 1/3) : (7.787 * z) + 16/116;
        
        return [(116 * y) - 16, 500 * (x - y), 200 * (y - z)];
    }

    renderPattern() {
        const gridContainer = document.getElementById('gridContainer');
        const patternGrid = document.getElementById('patternGrid');
        const showNumbers = document.getElementById('showNumbers').checked;
        
        // Show container first to get proper dimensions
        gridContainer.classList.remove('hidden');
        patternGrid.innerHTML = '';
        
        // Get border thickness from CSS
        const tempCell = document.createElement('div');
        tempCell.className = 'grid-cell';
        tempCell.style.visibility = 'hidden';
        document.body.appendChild(tempCell);
        const borderWidth = parseInt(getComputedStyle(tempCell).borderWidth) || 1;
        document.body.removeChild(tempCell);

        var gridContainerPadding = 15
        //gridContainerPadding = gridContainerPadding * 2

        var gridCellBorderThickness = 0;
        //gridCellBorderThickness = 1 + 1; // thickness on both sides
        
        // gridContainer width minus padding and borders divided by number of columns
        var cellSize = patternGrid.clientWidth / this.gridColumns;
        //cellSize += gridCellBorderThickness;
        
        this.pattern.forEach(row => {
            const rowDiv = document.createElement('div');
            rowDiv.style.display = 'flex';
            
            row.forEach(color => {
                const cell = document.createElement('div');
                cell.className = showNumbers ? 'grid-cell show-numbers' : 'grid-cell';
                cell.style.backgroundColor = color.hex ? `#${color.hex}` : '#000000';
                cell.style.width = `${cellSize}px`;
                cell.style.height = `${cellSize}px`;
                cell.style.lineHeight = `${cellSize}px`;
                cell.style.fontSize = `${Math.max(3, cellSize * 0.25)}px`;
                cell.textContent = showNumbers ? color.code.substring(0, 3) : '';
                cell.title = `${color.code} - ${color.name}`;
                rowDiv.appendChild(cell);
            });
            patternGrid.appendChild(rowDiv);
        });
    }

    renderLegend() {
        const legend = document.getElementById('legend');
        const legendItems = document.getElementById('legendItems');
        
        legendItems.innerHTML = '';
        
        this.colorMap.forEach(color => {
            const item = document.createElement('div');
            item.className = 'legend-item';
            
            const colorBox = document.createElement('div');
            colorBox.className = 'legend-color';
            colorBox.style.backgroundColor = color.hex ? `#${color.hex}` : '#000000';
            
            const text = document.createElement('span');
            text.textContent = `${color.code} - ${color.name}`;
            
            item.appendChild(colorBox);
            item.appendChild(text);
            legendItems.appendChild(item);
        });
        
        legend.classList.remove('hidden');
    }

    findClosestDMCColorComplete(r, g, b, algorithm = 'euclidean') {
        let minDistance = Infinity;
        let closestColor = null;
        
        for (const dmcColor of Object.values(DMC_COLORS_COMPLETE)) {
            if (!dmcColor.hex) continue;
            
            const hexR = parseInt(dmcColor.hex.substr(0, 2), 16);
            const hexG = parseInt(dmcColor.hex.substr(2, 2), 16);
            const hexB = parseInt(dmcColor.hex.substr(4, 2), 16);
            
            const distance = this.calculateColorDistance(
                { r, g, b },
                { r: hexR, g: hexG, b: hexB },
                algorithm
            );
            
            if (distance < minDistance) {
                minDistance = distance;
                closestColor = { ...dmcColor };
            }
        }
        
        return closestColor || { code: '310', name: 'Black', hex: '000000' };
    }

    findBestUnusedDMCColorComplete(r, g, b, algorithm, usedCodes) {
        let minDistance = Infinity;
        let closestColor = null;
        
        for (const dmcColor of Object.values(DMC_COLORS_COMPLETE)) {
            if (usedCodes.has(dmcColor.code) || !dmcColor.hex) continue;
            
            const hexR = parseInt(dmcColor.hex.substr(0, 2), 16);
            const hexG = parseInt(dmcColor.hex.substr(2, 2), 16);
            const hexB = parseInt(dmcColor.hex.substr(4, 2), 16);
            
            const distance = this.calculateColorDistance(
                { r, g, b },
                { r: hexR, g: hexG, b: hexB },
                algorithm
            );
            
            if (distance < minDistance) {
                minDistance = distance;
                closestColor = { ...dmcColor };
            }
        }
        
        return closestColor;
    }

    printPattern() {
        const showNumbers = document.getElementById('showNumbers').checked;
        PrintManager.printPattern(this.pattern, this.colorMap, this.gridColumns, this.gridRows, showNumbers);
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    const app = new CrossStitchPatternMaker();
    app.initializeTheme();
});