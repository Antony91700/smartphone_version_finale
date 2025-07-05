// Export handler functions for measurements - Version smartphone simplifiée

// Fonction pour l'export des images optimisé smartphone
export const handleExportImages = async (canvas, originalImage, measurements) => {
  if (!canvas || !originalImage) {
    throw new Error('Canvas ou image originale manquante');
  }

  try {
    // 1. Image originale croppée (zone visible sur le canvas)
    const croppedCanvas = document.createElement('canvas');
    const croppedCtx = croppedCanvas.getContext('2d');
    
    // Dimensions de la zone visible
    const visibleWidth = canvas.width;
    const visibleHeight = canvas.height;
    
    croppedCanvas.width = visibleWidth;
    croppedCanvas.height = visibleHeight;
    
    // Copier la zone visible (sans les annotations)
    croppedCtx.drawImage(originalImage, 0, 0);
    
    // Télécharger l'image croppée
    const croppedDataUrl = croppedCanvas.toDataURL('image/png');
    downloadImage(croppedDataUrl, 'image_originale_crop.png');
    
    // 2. Image avec les mesures (canvas actuel)
    const measuredDataUrl = canvas.toDataURL('image/png');
    downloadImage(measuredDataUrl, 'image_avec_mesures.png');
    
    return {
      croppedImage: croppedDataUrl,
      measuredImage: measuredDataUrl
    };
    
  } catch (error) {
    console.error('Erreur lors de l\'export des images:', error);
    throw error;
  }
};

// Fonction utilitaire pour télécharger une image
const downloadImage = (dataUrl, filename) => {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};