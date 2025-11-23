# Vibe Cross Stitch Pattern Maker

A web-based application that converts photos into cross-stitch patterns using the complete DMC thread color palette.

## Features

### Core Functionality
- **Image Input**: Upload photos or capture directly from camera
- **Pattern Generation**: Convert images to cross-stitch patterns with DMC color matching
- **Grid Configuration**: Customizable grid sizes from 20×20 to 100×100 (or custom dimensions)
- **Color Control**: Adjustable color count from 8 to 64 colors (or custom count)
- **Professional Printing**: Multi-page pattern output optimized for A4 paper

### Advanced Features
- **Complete DMC Palette**: 400+ authentic DMC thread colors with accurate hex values
- **Multiple Algorithms**: Euclidean distance, Weighted RGB, and LAB color space matching
- **Smart Color Selection**: Two-pass system for optimal color reduction and matching
- **Responsive Design**: Works on desktop and mobile devices
- **Theme Support**: Light and dark themes with localStorage persistence
- **Grid Numbers**: Toggle DMC color codes on/off in the display
- **Color Legend**: Complete reference with DMC codes and color names

### Print Features
- **Sectioned Printing**: Pattern split into manageable A4-sized portions
- **Optimal Cell Size**: 20×20 pixel cells for clear visibility
- **Grid Layout**: ~34 columns × 50 rows per page
- **Section Headers**: Clear "Row X, Column Y" identification for easy assembly
- **Always Show Numbers**: DMC codes always visible in print regardless of display setting
- **Professional Layout**: Clean, printer-friendly format with color legend

## Tech Stack

### Frontend
- **HTML5**: Semantic markup with responsive design
- **CSS3**: Custom properties, Grid, Flexbox, print media queries
- **JavaScript ES6+**: Modern class-based architecture
- **Canvas API**: Image processing and color analysis
- **MediaDevices API**: Camera access for photo capture

### Backend
- **C# .NET 8.0**: Simple launcher application
- **Static Files**: Pure client-side web application

### Architecture
- **Modular Design**: Separated concerns with dedicated modules
  - `app.js`: Main application logic
  - `print-manager.js`: Print functionality
  - `dmc-colors-complete.js`: Color database
- **Color Science**: Advanced color matching algorithms
- **Responsive Layout**: CSS Grid and Flexbox for all screen sizes

## Specifications

### Image Processing
- Supports all common image formats (JPEG, PNG, GIF, WebP)
- Camera capture with getUserMedia API
- Canvas-based image resizing and pixel analysis
- Real-time color quantization and DMC matching

### Pattern Generation
- Grid sizes: 20×20 to 100×100 (custom sizes supported)
- Color counts: 8 to 64 colors (custom counts supported)
- Three color matching algorithms:
  - **Euclidean**: Standard RGB distance
  - **Weighted RGB**: Perceptually weighted color matching
  - **LAB**: Perceptually uniform color space

### Print Output
- **Page Size**: A4 (210×297mm) with 0.5" margins
- **Cell Size**: 20×20 pixels for optimal readability
- **Grid Sections**: 34 columns × 50 rows per page maximum
- **Multi-page**: Automatic pagination for large patterns
- **Color Legend**: Complete DMC reference on final page

### DMC Color Database
- **Complete Palette**: 400+ official DMC thread colors
- **Accurate Colors**: Verified hex color values
- **Proper Names**: Official DMC color names and codes
- **Special Colors**: Includes Ecru, Blanc, and metallic threads

## Usage

1. **Load Image**: Upload a photo or use camera capture
2. **Configure Settings**: Choose grid size, color count, and algorithm
3. **Generate Pattern**: Click "Generate Pattern" to create cross-stitch design
4. **Review**: Toggle DMC numbers on/off, view color legend
5. **Print**: Use "Print Pattern" for professional multi-page output

## Browser Support

- **Modern Browsers**: Chrome 60+, Firefox 55+, Safari 11+, Edge 79+
- **Required APIs**: Canvas, MediaDevices (for camera), localStorage
- **Print Support**: All major browsers with proper CSS print media queries

## File Structure

```
CrossStichPatternMaker/
├── index.html              # Main application interface
├── app.js                  # Core application logic
├── print-manager.js        # Print functionality module
├── dmc-colors-complete.js  # Complete DMC color database
├── dmcolorthread.csv       # Source color data
├── specs.md               # Original specifications
└── Program.cs             # C# launcher (optional)
```