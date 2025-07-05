import jsPDF from 'jspdf';

export const generateUserGuide = () => {
  try {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Configuration des couleurs
    const primaryColor = [41, 128, 185]; // Bleu
    const secondaryColor = [52, 73, 94]; // Gris foncé
    const accentColor = [231, 76, 60]; // Rouge
    const lightGray = [236, 240, 241];

    let currentY = 20;
    const margin = 20;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const contentWidth = pageWidth - 2 * margin;
    const bottomMargin = 30; // Marge de sécurité en bas de page

    // Fonction pour vérifier si on doit changer de page
    const checkPageBreak = (neededSpace = 20) => {
      if (currentY + neededSpace > pageHeight - bottomMargin) {
        pdf.addPage();
        currentY = 20;
        return true;
      }
      return false;
    };

    // Fonction pour ajouter du texte avec gestion automatique des pages
    const addTextWithPageBreak = (text, x, y, options = {}) => {
      const lines = pdf.splitTextToSize(text, contentWidth - (options.indent || 0));
      
      lines.forEach((line, index) => {
        if (checkPageBreak(6)) {
          // Si on change de page, ajuster y
          y = currentY;
        }
        pdf.text(line, x, y + (index * 5));
      });
      
      return y + (lines.length * 5);
    };

    // PAGE 1 - TITRE ET INTRODUCTION
    // TITRE PRINCIPAL
    pdf.setFillColor(...primaryColor);
    pdf.rect(0, 0, pageWidth, 40, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Guide d\'utilisation', pageWidth/2, 20, { align: 'center' });
    
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Application de mesure du périnée', pageWidth/2, 30, { align: 'center' });

    currentY = 50;

    // SECTION 1: INTRODUCTION
    pdf.setTextColor(...secondaryColor);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('1. Introduction', margin, currentY);
    currentY += 10;

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    const introText = `Cette application permet de mesurer précisément les dimensions anatomiques du périnée à partir d'une photographie. Elle calcule automatiquement les rapports entre la longueur de la fente vulvaire et celle du périnée, selon une méthode scientifique validée.

L'application fonctionne entièrement dans votre navigateur web, sans envoi de données vers des serveurs externes, garantissant ainsi la confidentialité totale de vos images.

Cette méthode de mesure permet d'identifier des configurations anatomiques particulières qui peuvent avoir des implications cliniques importantes, notamment dans le contexte obstétrical, sexologique ou pour l'évaluation de troubles pelviens.`;

    currentY = addTextWithPageBreak(introText, margin, currentY);
    currentY += 15;

    // NOUVELLE PAGE - ÉTAPES D'UTILISATION
    pdf.addPage();
    currentY = 20;

    // SECTION 2: ÉTAPES D'UTILISATION
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...primaryColor);
    pdf.text('2. Étapes d\'utilisation', margin, currentY);
    currentY += 15;

    // Étape 1
    pdf.setFillColor(...lightGray);
    pdf.rect(margin, currentY - 5, contentWidth, 8, 'F');
    pdf.setTextColor(...accentColor);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Étape 1 : Chargement de l\'image', margin + 5, currentY);
    currentY += 12;

    pdf.setTextColor(...secondaryColor);
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    const step1Text = `• Cliquez sur le bouton "Charger une image"
• Sélectionnez votre photographie depuis votre appareil
• L'image s'affiche automatiquement sur l'écran noir
• Utilisez les gestes tactiles pour ajuster la vue :
  - Pincement : zoom avant/arrière
  - Glissement : déplacer l'image
  - Double-tap : réinitialiser le zoom

Conseil : Assurez-vous que l'image est de bonne qualité, nette et bien éclairée pour optimiser la précision des mesures.`;

    currentY = addTextWithPageBreak(step1Text, margin + 5, currentY, { indent: 5 });
    currentY += 12;

    // Vérifier l'espace avant l'étape 2
    checkPageBreak(40);

    // Étape 2
    pdf.setFillColor(...lightGray);
    pdf.rect(margin, currentY - 5, contentWidth, 8, 'F');
    pdf.setTextColor(...accentColor);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Étape 2 : Placement des points de mesure', margin + 5, currentY);
    currentY += 12;

    pdf.setTextColor(...secondaryColor);
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    const step2Text = `• Cliquez sur l'œil en haut à gauche pour afficher les contrôles
• Appuyez sur le bouton vert "+" pour commencer les mesures
• Placez 3 points dans l'ordre suivant :
  
  P1 : Sous le clitoris : à la jonction des petites lèvres (point le plus haut)
  P2 : Fourchette de la vulve (jonction vulve/périnée)  
  P3 : Centre de l'anus (point le plus bas)

• Pour placer un point : maintenez appuyé 0,6 seconde à l'endroit désiré
• Un réticule rouge apparaît pour vous guider avec précision
• Une vibration confirme le placement (si votre appareil le supporte)

Important : L'ordre de placement des points est crucial pour obtenir des mesures correctes.`;

    currentY = addTextWithPageBreak(step2Text, margin + 5, currentY, { indent: 5 });
    currentY += 12;

    // Vérifier l'espace avant l'étape 3
    checkPageBreak(35);

    // Étape 3
    pdf.setFillColor(...lightGray);
    pdf.rect(margin, currentY - 5, contentWidth, 8, 'F');
    pdf.setTextColor(...accentColor);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Étape 3 : Ajustement des points (optionnel)', margin + 5, currentY);
    currentY += 12;

    pdf.setTextColor(...secondaryColor);
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    const step3Text = `• Après placement des 3 points, l'application passe en mode édition
• Touchez un point pour le sélectionner (il devient orange)
• Faites-le glisser pour ajuster sa position
• Les mesures se recalculent automatiquement en temps réel
• L'application sort automatiquement du mode édition après déplacement

Astuce : Utilisez le zoom pour affiner la position des points avec une précision maximale.`;

    currentY = addTextWithPageBreak(step3Text, margin + 5, currentY, { indent: 5 });
    currentY += 12;

    // Vérifier l'espace avant l'étape 4
    checkPageBreak(40);

    // Étape 4
    pdf.setFillColor(...lightGray);
    pdf.rect(margin, currentY - 5, contentWidth, 8, 'F');
    pdf.setTextColor(...accentColor);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Étape 4 : Consultation des résultats', margin + 5, currentY);
    currentY += 12;

    pdf.setTextColor(...secondaryColor);
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    const step4Text = `• Cliquez sur l'œil pour afficher les contrôles
• Bouton bleu : affiche un résumé des mesures dans une notification
• Bouton orange : télécharge le rapport PDF complet + image annotée
• Le PDF contient :
  - Mesures absolues et relatives
  - Classification selon 9 cas anatomiques
  - Analyse détaillée et recommandations
  - Image annotée avec les points de mesure

Le rapport PDF est autonome et peut être conservé ou partagé avec des professionnels de santé.`;

    currentY = addTextWithPageBreak(step4Text, margin + 5, currentY, { indent: 5 });

    // NOUVELLE PAGE - INTERPRÉTATION DES RÉSULTATS
    pdf.addPage();
    currentY = 20;

    // SECTION 3: INTERPRÉTATION DES RÉSULTATS
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...primaryColor);
    pdf.text('3. Interprétation des résultats', margin, currentY);
    currentY += 15;

    // Mesures calculées
    pdf.setFillColor(...lightGray);
    pdf.rect(margin, currentY - 5, contentWidth, 8, 'F');
    pdf.setTextColor(...accentColor);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Mesures calculées automatiquement', margin + 5, currentY);
    currentY += 12;

    pdf.setTextColor(...secondaryColor);
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    const measuresText = `• Distance P1-P2 : Longueur de la fente vulvaire (en pixels)
• Distance P2-P3 : Longueur du périnée (en pixels)  
• Distance P1-P3 : Longueur totale (fente + périnée)
• Rapport périnée/fente : Pourcentage du périnée par rapport à la fente
• Rapport périnée/total : Pourcentage du périnée par rapport à la longueur totale
• Rapport fente/total : Pourcentage de la fente par rapport à la longueur totale

Les mesures en pixels permettent une évaluation relative précise, indépendamment de la taille absolue de l'image.`;

    currentY = addTextWithPageBreak(measuresText, margin + 5, currentY, { indent: 5 });
    currentY += 12;

    // Classification
    pdf.setFillColor(...lightGray);
    pdf.rect(margin, currentY - 5, contentWidth, 8, 'F');
    pdf.setTextColor(...accentColor);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Classification anatomique', margin + 5, currentY);
    currentY += 12;

    pdf.setTextColor(...secondaryColor);
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    const classificationText = `L'application classe automatiquement l'anatomie selon 9 cas possibles basés sur des seuils scientifiquement établis :

Classification du périnée (par rapport à la longueur totale) :
• Périnée court : < 31,6% de la longueur totale
• Périnée moyen : 31,6% - 34,9% de la longueur totale  
• Périnée long : > 34,9% de la longueur totale

Classification de la fente vulvaire (par rapport à la longueur totale) :
• Fente courte : < 65,1% de la longueur totale
• Fente moyenne : 65,1% - 68,4% de la longueur totale
• Fente longue : > 68,4% de la longueur totale

Cette classification croisée génère 9 cas possibles (court/court, court/moyen, etc.) permettant d'identifier des configurations anatomiques particulières pouvant nécessiter une attention clinique spécifique.`;

    currentY = addTextWithPageBreak(classificationText, margin + 5, currentY, { indent: 5 });

    // NOUVELLE PAGE - CONSEILS TECHNIQUES
    pdf.addPage();
    currentY = 20;

    // SECTION 4: CONSEILS TECHNIQUES
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...primaryColor);
    pdf.text('4. Conseils techniques', margin, currentY);
    currentY += 15;

    // Qualité de l'image
    pdf.setFillColor(...lightGray);
    pdf.rect(margin, currentY - 5, contentWidth, 8, 'F');
    pdf.setTextColor(...accentColor);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Qualité de l\'image recommandée', margin + 5, currentY);
    currentY += 12;

    pdf.setTextColor(...secondaryColor);
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    const qualityText = `• Image nette et bien éclairée
• Contraste suffisant pour distinguer les structures anatomiques
• Vue frontale perpendiculaire au plan anatomique
• Résolution minimale recommandée : 1000x1000 pixels
• Formats supportés : JPG, PNG, WebP, GIF
• Éviter les images floues, sous-exposées ou sur-exposées
• Préférer un éclairage uniforme sans ombres marquées

Une image de qualité optimale garantit la précision des mesures et facilite le placement des points de référence.`;

    currentY = addTextWithPageBreak(qualityText, margin + 5, currentY, { indent: 5 });
    currentY += 12;

    // Précision des mesures
    pdf.setFillColor(...lightGray);
    pdf.rect(margin, currentY - 5, contentWidth, 8, 'F');
    pdf.setTextColor(...accentColor);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Optimisation de la précision', margin + 5, currentY);
    currentY += 12;

    pdf.setTextColor(...secondaryColor);
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    const precisionText = `• Utilisez le zoom pour placer les points avec précision maximale
• Le réticule rouge vous aide à viser exactement le point désiré
• Prenez votre temps pour le placement initial des points
• Utilisez le mode édition pour affiner la position si nécessaire
• Les mesures relatives (pourcentages) sont plus fiables que les mesures absolues
• Répétez la mesure si vous avez des doutes sur la précision
• Vérifiez que les trois points sont bien alignés selon l'anatomie

La précision du placement des points est cruciale pour obtenir des résultats fiables et reproductibles.`;

    currentY = addTextWithPageBreak(precisionText, margin + 5, currentY, { indent: 5 });
    currentY += 12;

    // Vérifier l'espace pour la section compatibilité
    checkPageBreak(40);

    // Compatibilité
    pdf.setFillColor(...lightGray);
    pdf.rect(margin, currentY - 5, contentWidth, 8, 'F');
    pdf.setTextColor(...accentColor);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Compatibilité et performance', margin + 5, currentY);
    currentY += 12;

    pdf.setTextColor(...secondaryColor);
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    const compatibilityText = `• Fonctionne sur tous les navigateurs modernes (Chrome, Firefox, Safari, Edge)
• Optimisé pour les écrans tactiles (smartphones, tablettes)
• Compatible avec les ordinateurs de bureau et portables
• Aucune installation requise - fonctionne directement en ligne
• Traitement local - aucune donnée envoyée sur internet
• Fonctionne hors ligne une fois l'application chargée
• Performance optimale sur appareils récents (moins de 3 ans)

L'application s'adapte automatiquement à la taille de votre écran pour une utilisation optimale.`;

    currentY = addTextWithPageBreak(compatibilityText, margin + 5, currentY, { indent: 5 });

    // NOUVELLE PAGE - CONFIDENTIALITÉ ET SUPPORT
    pdf.addPage();
    currentY = 20;

    // SECTION 5: CONFIDENTIALITÉ ET SÉCURITÉ
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...primaryColor);
    pdf.text('5. Confidentialité et sécurité', margin, currentY);
    currentY += 15;

    pdf.setTextColor(...secondaryColor);
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    const privacyText = `Cette application a été conçue avec la confidentialité comme priorité absolue :

• Traitement 100% local : Toutes les images et calculs sont traités directement dans votre navigateur
• Aucun envoi de données : Vos images ne quittent jamais votre appareil
• Pas de stockage serveur : Aucune donnée n'est conservée sur des serveurs externes
• Pas de cookies de tracking : L'application ne vous suit pas et ne collecte aucune donnée personnelle
• Code open-source : La transparence du fonctionnement est garantie
• Chiffrement local : Les données temporaires sont protégées
• Suppression automatique : Les images sont effacées de la mémoire à la fermeture

Vos données médicales restent entièrement sous votre contrôle. Cette approche respecte les réglementations RGPD et garantit une confidentialité maximale pour des données sensibles.`;

    currentY = addTextWithPageBreak(privacyText, margin, currentY);
    currentY += 15;

    // SECTION 6: SUPPORT ET CONTACT
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...primaryColor);
    pdf.text('6. Support et contact', margin, currentY);
    currentY += 15;

    pdf.setTextColor(...secondaryColor);
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Pour plus d\'informations, questions techniques ou un bilan personnalisé :', margin, currentY);
    currentY += 10;

    // Email cliquable
    const email = 'antony.sexolog@gmail.com';
    pdf.setTextColor(41, 128, 185);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Email : ${email}`, margin, currentY);
    const emailWidth = pdf.getTextWidth(`Email : ${email}`);
    pdf.link(margin, currentY - 3, emailWidth, 6, { url: `mailto:${email}` });
    currentY += 10;

    // Site web cliquable
    const website = 'https://sites.google.com/view/mesures-perinee/accueil';
    pdf.text('Site explicatif complet : Documentation détaillée', margin, currentY);
    const websiteWidth = pdf.getTextWidth('Site explicatif complet : Documentation détaillée');
    pdf.link(margin, currentY - 3, websiteWidth, 6, { url: website });
    currentY += 15;

    pdf.setTextColor(...secondaryColor);
    pdf.setFont('helvetica', 'normal');
    const supportText = `Consultations spécialisées disponibles pour :

• Évaluation de la fonction sexuelle et troubles associés
• Contexte obstétrical et implications de l'épisiotomie
• Diagnostic différentiel des troubles pelviens
• Orientation thérapeutique personnalisée (rééducation, yoga postural)
• Approches complémentaires (massage lymphatique, techniques manuelles)
• Suivi post-partum et récupération périnéale

Bilan gratuit et sans engagement pour une approche personnalisée de votre situation.`;

    currentY = addTextWithPageBreak(supportText, margin, currentY);
    currentY += 15;

    // Section limitations et avertissements
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...accentColor);
    pdf.text('Important - Limitations et avertissements', margin, currentY);
    currentY += 10;

    pdf.setTextColor(...secondaryColor);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    const warningText = `Cette application est un outil d'aide à l'évaluation anatomique. Elle ne remplace pas un examen médical professionnel. Les résultats doivent être interprétés par un professionnel de santé qualifié. En cas de symptômes ou de préoccupations médicales, consultez votre médecin.`;

    currentY = addTextWithPageBreak(warningText, margin, currentY);

    // FOOTER sur toutes les pages
    const totalPages = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      
      // Footer
      const footerY = pageHeight - 15;
      pdf.setFillColor(...primaryColor);
      pdf.rect(0, footerY - 5, pageWidth, 20, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const now = new Date();
      pdf.text(`Guide d'utilisation - Application de mesure du périnée v1.0 - Page ${i}/${totalPages}`, pageWidth/2, footerY + 5, { align: 'center' });
      pdf.text(`Généré le ${now.toLocaleDateString('fr-FR')} à ${now.toLocaleTimeString('fr-FR')}`, pageWidth/2, footerY + 12, { align: 'center' });
    }

    // Télécharger le PDF
    const timestamp = new Date().toISOString().slice(0, 16).replace('T', '-').replace(':', '');
    pdf.save(`guide-utilisation-mesure-perinee-${timestamp}.pdf`);

  } catch (error) {
    console.error('Erreur lors de la génération du guide:', error);
    throw error;
  }
};