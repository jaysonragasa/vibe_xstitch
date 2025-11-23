class PrintManager {
    static printPattern(pattern, colorMap, gridColumns, gridRows) {
        if (pattern.length === 0) {
            alert('Please generate a pattern first');
            return;
        }

        const printWindow = window.open('', '_blank');
        const printContent = this.generatePrintHTML(pattern, colorMap, gridColumns, gridRows);
        
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
    }

    static generatePrintHTML(pattern, colorMap, gridColumns, gridRows) {
        // A4 with 0.5" margins: ~34 cols × 50 rows fit with 20px cells
        const colsPerPage = 34;
        const rowsPerPage = 50;
        
        const totalColPages = Math.ceil(gridColumns / colsPerPage);
        const totalRowPages = Math.ceil(gridRows / rowsPerPage);
        
        let gridPages = '';
        let pageNum = 1;
        
        for (let rowPage = 0; rowPage < totalRowPages; rowPage++) {
            for (let colPage = 0; colPage < totalColPages; colPage++) {
                const startRow = rowPage * rowsPerPage;
                const endRow = Math.min(startRow + rowsPerPage, gridRows);
                const startCol = colPage * colsPerPage;
                const endCol = Math.min(startCol + colsPerPage, gridColumns);
                
                gridPages += `
                <div class="grid-section" ${pageNum > 1 ? 'style="page-break-before: always;"' : ''}>
                    <h3>Section ${pageNum}: Row ${rowPage + 1}, Column ${colPage + 1}</h3>
                    <table class="pattern-grid">
                        ${pattern.slice(startRow, endRow).map(row => 
                            `<tr>${row.slice(startCol, endCol).map(color => 
                                `<td class="grid-cell" style="background-color: #${color.hex}">
                                    ${color.code.substring(0, 3)}
                                </td>`
                            ).join('')}</tr>`
                        ).join('')}
                    </table>
                </div>`;
                pageNum++;
            }
        }
        
        return `
<!DOCTYPE html>
<html>
<head>
    <title>Cross Stitch Pattern</title>
    <style>
        @page { margin: 0.5in; }
        body { font-family: Arial, sans-serif; margin: 0; background: white; }
        .grid-section h3 { text-align: center; margin-bottom: 15px; font-size: 14px; }
        .pattern-grid { border-collapse: collapse; margin: 0 auto; }
        .grid-cell { 
            width: 20px; height: 20px; border: 1px solid #000; 
            text-align: center; font-size: 8px; line-height: 20px;
        }
        .legend { page-break-before: always; }
        .legend h3 { margin-top: 0; text-align: center; }
        .legend-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
        .legend-item { display: flex; align-items: center; margin-bottom: 8px; }
        .legend-color { width: 20px; height: 20px; border: 1px solid #000; margin-right: 10px; }
        .legend-text { font-size: 12px; }
    </style>
</head>
<body>
    ${gridPages}
    
    <div class="legend">
        <h3>DMC Thread Colors (${colorMap.size} colors)</h3>
        <div class="legend-grid">
            ${Array.from(colorMap.values()).map(color => 
                `<div class="legend-item">
                    <div class="legend-color" style="background-color: #${color.hex}"></div>
                    <div class="legend-text">${color.code} - ${color.name}</div>
                </div>`
            ).join('')}
        </div>
    </div>
</body>
</html>`;
    }
}