import jsPDF from 'jspdf';

export const generatePDF = async (imageDataUrl, measurements) => {
  try {
    // Create new PDF document
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Add title
    pdf.setFontSize(20);
    pdf.setFont('Roboto', 'bold');
    pdf.text('Résultats de la mesure du périnée', 105, 20, { align: 'center' });

    // Add measurement data
    pdf.setFontSize(12);
    pdf.setFont('Roboto', 'normal');
    
    const startY = 40;
    let currentY = startY;
    
    // Add measurement details with medical descriptions
    pdf.setFont('Roboto', 'bold');
    pdf.text('Mesure de longueur en pixels (px):', 20, currentY);
    pdf.setFont('Roboto', 'normal');
    currentY += 10;
    
    pdf.text(`P1-P2: ${Math.round(measurements.distance12)} px = mesure de la longueur de la fente vulvaire`, 20, currentY);
    currentY += 8;
    pdf.text(`P2-P3: ${Math.round(measurements.distance23)} px = mesure de la longueur du périnée`, 20, currentY);
    currentY += 8;
    pdf.text(`P1-P3: ${Math.round(measurements.distance13)} px = mesure de la longueur totale`, 20, currentY);
    currentY += 6;
    pdf.text('(longueur de la fente vulvaire + longueur du périnée)', 20, currentY);
    currentY += 15;
    
    // Add ratios with medical descriptions
    pdf.setFont('Roboto', 'bold');
    pdf.text('Mesures relatives:', 20, currentY);
    pdf.setFont('Roboto', 'normal');
    currentY += 10;
    
    pdf.text(`P2-P3/P1-P2: ${Math.round(measurements.ratio2312)}%`, 20, currentY);
    currentY += 8;
    pdf.text(`La longueur du périnée représente ${Math.round(measurements.ratio2312)}% de la longueur de la fente`, 20, currentY);
    currentY += 8;
    
    pdf.text(`P2-P3/P1-P3: ${Math.round(measurements.ratio2313)}%`, 20, currentY);
    currentY += 8;
    pdf.text(`La longueur du périnée représente ${Math.round(measurements.ratio2313)}% de la longueur totale`, 20, currentY);
    currentY += 8;
    pdf.text('(longueur de la fente vulvaire + longueur du périnée)', 20, currentY);
    currentY += 15;

    // Add timestamp
    const date = new Date(measurements.timestamp);
    pdf.setFontSize(10);
    pdf.text(`Date: ${date.toLocaleDateString()} ${date.toLocaleTimeString()}`, 20, currentY);
    currentY += 15;

    // Add image
    const img = new Image();
    img.onload = function() {
      // Calculate image dimensions to fit in PDF
      const maxWidth = 170; // mm
      const maxHeight = 120; // mm (reduced to accommodate more text)
      
      let imgWidth = this.width * 0.264583; // Convert pixels to mm
      let imgHeight = this.height * 0.264583;
      
      // Scale down if too large
      if (imgWidth > maxWidth) {
        const ratio = maxWidth / imgWidth;
        imgWidth = maxWidth;
        imgHeight = imgHeight * ratio;
      }
      
      if (imgHeight > maxHeight) {
        const ratio = maxHeight / imgHeight;
        imgHeight = maxHeight;
        imgWidth = imgWidth * ratio;
      }
      
      // Center the image horizontally
      const x = (210 - imgWidth) / 2; // A4 width is 210mm
      
      try {
        pdf.addImage(imageDataUrl, 'PNG', x, currentY, imgWidth, imgHeight);
        
        // Save the PDF
        pdf.save('resultats-mesure.pdf');
      } catch (error) {
        console.error('Erreur lors de l\'ajout de l\'image au PDF:', error);
        // Save PDF without image if there's an error
        pdf.save('resultats-mesure.pdf');
      }
    };
    
    img.onerror = function() {
      console.error('Erreur lors du chargement de l\'image');
      // Save PDF without image if there's an error
      pdf.save('resultats-mesure.pdf');
    };
    
    img.src = imageDataUrl;
    
  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error);
    throw error;
  }
};