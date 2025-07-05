import jsPDF from 'jspdf';
import { performCompleteAnalysis } from './analysisUtils';
import { THRESHOLDS, THRESHOLD_LABELS } from './thresholds';

const drawTable = (pdf, x, y, analysis) => {
  const cellWidth = 35;
  const cellHeight = 12;
  const tableWidth = cellWidth * 4;
  const tableHeight = cellHeight * 4;

  const headers = [
    '',
    `Périnée court\n(${THRESHOLD_LABELS.PERINEUM.SHORT})`,
    `Périnée moyen\n(${THRESHOLD_LABELS.PERINEUM.MEDIUM})`,
    `Périnée long\n(${THRESHOLD_LABELS.PERINEUM.LONG})`
  ];
  const rows = [
    [`Fente courte\n(${THRESHOLD_LABELS.VULVA_TO_TOTAL.SHORT})`, 'cas_01', 'cas_04', 'cas_07'],
    [`Fente moyenne\n(${THRESHOLD_LABELS.VULVA_TO_TOTAL.MEDIUM})`, 'cas_02', 'cas_05', 'cas_08'],
    [`Fente longue\n(${THRESHOLD_LABELS.VULVA_TO_TOTAL.LONG})`, 'cas_03', 'cas_06', 'cas_09']
  ];

  pdf.setLineWidth(0.5);
  pdf.rect(x, y, tableWidth, tableHeight);

  for (let i = 1; i < 4; i++) {
    pdf.line(x + i * cellWidth, y, x + i * cellWidth, y + tableHeight);
    pdf.line(x, y + i * cellHeight, x + tableWidth, y + i * cellHeight);
  }

  pdf.setFillColor(240, 240, 240);
  pdf.rect(x, y, tableWidth, cellHeight, 'F');
  pdf.rect(x, y, cellWidth, tableHeight, 'F');

  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');

  for (let i = 0; i < headers.length; i++) {
    const textX = x + i * cellWidth + cellWidth / 2;
    const textY = y + cellHeight / 2 + 2;
    const lines = headers[i].split('\n');

    if (lines.length > 1) {
      pdf.text(lines[0], textX, textY - 2, { align: 'center' });
      pdf.setFontSize(10);
      pdf.text(lines[1], textX, textY + 3, { align: 'center' });
      pdf.setFontSize(12);
    } else {
      pdf.text(headers[i], textX, textY, { align: 'center' });
    }
  }

  pdf.setFont('helvetica', 'normal');
  for (let i = 0; i < rows.length; i++) {
    for (let j = 0; j < rows[i].length; j++) {
      const textX = x + j * cellWidth + cellWidth / 2;
      const textY = y + (i + 1) * cellHeight + cellHeight / 2 + 2;

      if (rows[i][j] === analysis.caseNumber) {
        pdf.setFillColor(144, 238, 144);
        pdf.rect(x + j * cellWidth, y + (i + 1) * cellHeight, cellWidth, cellHeight, 'F');
        pdf.setFont('helvetica', 'bold');
        pdf.text(rows[i][j], textX, textY, { align: 'center' });
        pdf.setFont('helvetica', 'normal');
      } else {
        if (j === 0) {
          pdf.setFont('helvetica', 'bold');
          const lines = rows[i][j].split('\n');
          if (lines.length > 1) {
            pdf.text(lines[0], textX, textY - 2, { align: 'center' });
            pdf.setFontSize(10);
            pdf.text(lines[1], textX, textY + 3, { align: 'center' });
            pdf.setFontSize(12);
          } else {
            pdf.text(rows[i][j], textX, textY, { align: 'center' });
          }
          pdf.setFont('helvetica', 'normal');
        } else {
          pdf.text(rows[i][j], textX, textY, { align: 'center' });
        }
      }
    }
  }

  pdf.setLineWidth(0.5);
  pdf.rect(x, y, tableWidth, tableHeight);
  for (let i = 1; i < 4; i++) {
    pdf.line(x + i * cellWidth, y, x + i * cellWidth, y + tableHeight);
    pdf.line(x, y + i * cellHeight, x + tableWidth, y + i * cellHeight);
  }
};

export const generatePDF = async (annotatedImageDataUrl, measurements) => {
  try {
    const now = new Date();
    const timestampStr = now.toISOString().slice(0, 16).replace('T', '-').replace(':', '');
    const pdfFilename = `resultats-${timestampStr}.pdf`;
    const annotatedImageFilename = `annotated-${timestampStr}.png`;

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const analysis = performCompleteAnalysis(measurements);

    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Résultats de la mesure du périnée', 105, 15, { align: 'center' });

    let currentY = 25;

// Configuration des marges et largeur page
    const margin = 20;
    const pageWidth = pdf.internal.pageSize.getWidth();

    const tableX = margin;
    const tableWidth = pageWidth - 2 * margin;

// Colonnes 80% / 20% de la largeur totale du tableau
    const colWidths = [tableWidth * 0.8, tableWidth * 0.2];
    const rowHeight = 8;

    // SECTION 1 – Mesures absolues sous forme de tableau simple
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Mesure de longueur en pixels (px):', tableX, currentY);
    pdf.setFont('helvetica', 'normal');
    currentY += 8;

    const absoluteMeasures = [
      ['Longueur de la fente vulvaire (P1-P2)', `${Math.round(measurements.distance12)} px`],
      ['Longueur du périnée (P2-P3)', `${Math.round(measurements.distance23)} px`],
      ['Longueur totale (P1-P3)', `${Math.round(measurements.distance13)} px`]
    ];

// Position de départ verticale
    const tableY = currentY;

// Dessiner chaque ligne et ses cellules
    for (let i = 0; i < absoluteMeasures.length; i++) {
      const row = absoluteMeasures[i];
      const y = tableY + i * rowHeight;

      // Texte colonne 1 (libellé)
      pdf.text(row[0], tableX + 3, y);

      // Texte colonne 2 (valeur), aligné à droite
      pdf.text(row[1], tableX + colWidths[0] + colWidths[1] - 3, y, { align: 'right' });

      // Bordures cellules
      pdf.rect(tableX, y - rowHeight + 2, colWidths[0], rowHeight);
      pdf.rect(tableX + colWidths[0], y - rowHeight + 2, colWidths[1], rowHeight);
    }

// Bordure extérieure du tableau
    const tableHeight = absoluteMeasures.length * rowHeight;
    pdf.rect(tableX, tableY - rowHeight + 2, tableWidth, tableHeight);

// Met à jour currentY pour la suite
    currentY = tableY + tableHeight + 10;


// SECTION 2 – Mesures relatives en tableau
    pdf.setFont('helvetica', 'bold');
    pdf.text('Mesures relatives :', tableX, currentY);
    pdf.setFont('helvetica', 'normal');
    currentY += 8;

    const relativeMeasures = [
      ['Périnée / Fente vulvaire', `${Math.round(measurements.ratio2312)} %`],
      ['Périnée / Longueur totale', `${Math.round(measurements.ratio2313)} %`],
      ['Fente vulvaire / Longueur totale', `${Math.round(analysis.vulvaToTotalRatio)} %`]
    ];

    const relativeTableY = currentY;

// Dessiner chaque ligne et ses cellules
    for (let i = 0; i < relativeMeasures.length; i++) {
      const row = relativeMeasures[i];
      const y = relativeTableY + i * rowHeight;

      // Texte colonne 1
      pdf.text(row[0], tableX + 3, y);

      // Texte colonne 2 aligné à droite
      pdf.text(row[1], tableX + colWidths[0] + colWidths[1] - 3, y, { align: 'right' });

      // Bordures cellules
      pdf.rect(tableX, y - rowHeight + 2, colWidths[0], rowHeight);
      pdf.rect(tableX + colWidths[0], y - rowHeight + 2, colWidths[1], rowHeight);
    }

// Bordure extérieure
    const relativeTableHeight = relativeMeasures.length * rowHeight;
    pdf.rect(tableX, relativeTableY - rowHeight + 2, tableWidth, relativeTableHeight);

// Met à jour currentY pour la suite
    currentY = relativeTableY + relativeTableHeight + 10;


    // SECTION 3 – Analyses
    pdf.setFont('helvetica', 'bold');
    pdf.text('Analyse selon les règles de référence:', 20, currentY);
    currentY += 8;

    pdf.setFont('helvetica', 'bold');
    pdf.text('1. Rapport périnée / fente vulvaire', 20, currentY);
    pdf.setFont('helvetica', 'normal');
    currentY += 6;
    pdf.text(`Valeur: ${Math.round(analysis.perineeToVulvaRatio)}%`, 25, currentY);
    currentY += 6;
    pdf.text(`Conclusion: ${analysis.analysis.vulva.interpretation}`, 25, currentY);
    currentY += 8;

    pdf.setFont('helvetica', 'bold');
    pdf.text('2. Rapport périnée / longueur totale', 20, currentY);
    pdf.setFont('helvetica', 'normal');
    currentY += 6;
    pdf.text(`Valeur: ${Math.round(analysis.perineeToTotalRatio)}%`, 25, currentY);
    currentY += 6;
    pdf.text(`Conclusion: périnée ${analysis.analysis.perineum.interpretation}`, 25, currentY);
    currentY += 8;

    pdf.setFont('helvetica', 'bold');
    pdf.text('3. Rapport fente vulvaire / longueur totale', 20, currentY);
    pdf.setFont('helvetica', 'normal');
    currentY += 6;
    pdf.text(`Valeur: ${Math.round(analysis.vulvaToTotalRatio)}%`, 25, currentY);
    currentY += 6;

    let vulvaStatus;
    if (analysis.vulvaToTotalRatio < THRESHOLDS.VULVA_TO_TOTAL.SHORT_MAX) {
      vulvaStatus = 'en dessous de la norme (courte)';
    } else if (analysis.vulvaToTotalRatio <= THRESHOLDS.VULVA_TO_TOTAL.MEDIUM_MAX) {
      vulvaStatus = 'dans la norme (moyenne)';
    } else {
      vulvaStatus = 'au-dessus de la norme (longue)';
    }
    pdf.text(`Conclusion: La fente vulvaire est ${vulvaStatus}`, 25, currentY);
    currentY += 10;

    // TABLEAU DES CAS
    pdf.setFont('helvetica', 'bold');
    pdf.text('Classification selon 9 cas possibles:', 20, currentY);
    currentY += 8;

    drawTable(pdf, 20, currentY, analysis);
    currentY += 60;

    // CONCLUSION
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Résultat:', 20, currentY);
    pdf.setFont('helvetica', 'normal');
    currentY += 6;
    pdf.text(`Périnée ${analysis.perineumClass} (${Math.round(analysis.perineeToTotalRatio)}%) - Fente vulvaire ${analysis.vulvaClass} (${Math.round(analysis.vulvaToTotalRatio)}%)`, 20, currentY);
    currentY += 6;
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Configuration: ${analysis.caseNumber}`, 20, currentY);
    currentY += 6;

    pdf.setFont('helvetica', 'normal');
    const conclusionLines = pdf.splitTextToSize(analysis.conclusion, 170);
    conclusionLines.forEach(line => {
      pdf.text(line, 20, currentY);
      currentY += 6;
    });

    currentY += 10;
    pdf.setFontSize(12);
    pdf.text('Visitez le site explicatif:', 20, currentY);
    currentY += 6;
    const url = 'https://sites.google.com/view/mesures-perinee/accueil';
    pdf.setTextColor(0, 0, 255);
    pdf.text(url, 20, currentY);
    const linkWidth = pdf.getTextWidth(url);
    pdf.link(20, currentY - 3, linkWidth, 6, { url });
    pdf.setTextColor(0, 0, 0);

    currentY += 10;
    pdf.setFontSize(10);
    const date = new Date(measurements.timestamp);
    pdf.text(`Date: ${date.toLocaleDateString()} ${date.toLocaleTimeString()}`, 20, currentY);

    // PAGE 2 – IMAGE ANNOTÉE
    pdf.addPage();
    const imgWidth = 394 * 0.264583;
    const imgHeight = 700 * 0.264583;
    const x = (210 - imgWidth) / 2;
    const y = 20;
    pdf.addImage(annotatedImageDataUrl, 'PNG', x, y, imgWidth, imgHeight, undefined, 'FAST');

    // PAGE 3 – TEXTE FINAL
    pdf.addPage();
    const textStartY = 20;
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Contact possible pour un bilan gratuit et sans engagement :', 20, textStartY);
    pdf.setFont('helvetica', 'normal');
    const email = 'antony.sexolog@gmail.com';
    const emailY = textStartY + 6;
    pdf.setTextColor(0, 0, 255);
    pdf.text(email, 20, emailY);
    const emailWidth = pdf.getTextWidth(email);
    pdf.link(20, emailY - 3, emailWidth, 6, { url: `mailto:${email}` });
    pdf.setTextColor(0, 0, 0);

    const professionalLines = pdf.splitTextToSize(
        `Analyse personnalisée pouvant inclure :
• Évaluation de la fonction sexuelle : dyspareunie, anorgasmie coïtale, compatibilité avec le partenaire
• Contexte obstétrical : si une épisiotomie a été pratiquée, cela peut s’expliquer par différents facteurs, notamment une fente vulvaire courte.
• Diagnostic différentiel : mycoses récidivantes associées à un périnée court
• Troubles pelviens : incontinence urinaire, prolapsus (cysto/hystéro/rectocèle)
• Orientation thérapeutique : rééducation périnéale, yoga postural adapté
• Approche complémentaire : massage lymphatique de la vulve

Bilan global recommandé en fonction de la configuration anatomique.`,
        170
    );

    let textY = textStartY + 12;
    for (const line of professionalLines) {
      pdf.text(line, 20, textY);
      textY += 6;
    }

    const pdfBlob = pdf.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    const aPdf = document.createElement('a');
    aPdf.href = pdfUrl;
    aPdf.download = pdfFilename;
    aPdf.click();
    URL.revokeObjectURL(pdfUrl);

    const aImg = document.createElement('a');
    aImg.href = annotatedImageDataUrl;
    aImg.download = annotatedImageFilename;
    aImg.click();

  } catch (error) {
    console.error('Erreur lors de la génération du PDF ou du téléchargement:', error);
    throw error;
  }
};
