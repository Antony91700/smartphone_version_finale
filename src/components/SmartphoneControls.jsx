import React, { useState } from 'react';
import {
  Box,
  Button,
  Input,
  VStack,
  IconButton,
  Collapse,
  useDisclosure,
  useToast
} from '@chakra-ui/react';
import { 
  AddIcon, 
  ViewIcon, 
  DownloadIcon, 
  RepeatIcon,
  ViewOffIcon,
  EditIcon,
  CheckIcon,
  QuestionIcon
} from '@chakra-ui/icons';
import { generatePDF } from '../utils/pdfUtils';
import { UserGuideButton } from './UserGuideButton';

const APP_STATES = {
  NO_IMAGE: 'no_image',
  IMAGE_LOADED: 'image_loaded', 
  PLACING_POINTS: 'placing_points',
  EDITING_POINTS: 'editing_points',
  MEASUREMENTS_READY: 'measurements_ready'
};

export function SmartphoneControls({
  appState,
  onImageLoad,
  onStartMeasurement,
  onEditPoints,
  onFinishEditing,
  onShowResults,
  onExportAll,
  onReset,
  measurements,
  pointsCount,
  canvasRef,
  draggedPointIndex
}) {
  const { isOpen: showControls, onToggle: toggleControls } = useDisclosure();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const toast = useToast();

  // Fonction pour générer le PDF avec gestion d'erreur
  const handleDownloadPDF = async () => {
    if (!canvasRef?.current || !measurements) {
      toast({
        title: 'Erreur',
        description: 'Aucune mesure disponible pour générer le PDF',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    setIsGeneratingPDF(true);
    
    try {
      toast({
        title: 'Génération du PDF...',
        description: 'Veuillez patienter',
        status: 'info',
        duration: 2000,
      });

      const imageDataUrl = canvasRef.current.toDataURL('image/png');
      await generatePDF(imageDataUrl, measurements);
      
      toast({
        title: 'PDF généré avec succès',
        description: 'Le fichier a été téléchargé',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      toast({
        title: 'Erreur de génération',
        description: 'Impossible de générer le PDF. Vérifiez votre connexion.',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // État NO_IMAGE : Interface de chargement avec guide
  if (appState === APP_STATES.NO_IMAGE) {
    return (
      <Box
        position="fixed"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        zIndex={1000}
      >
        <VStack spacing={4}>
          <Input
            type="file"
            accept="image/*"
            onChange={onImageLoad}
            display="none"
            id="image-input"
          />
          <Button 
            as="label" 
            htmlFor="image-input" 
            size="lg"
            colorScheme="blue"
            leftIcon={<AddIcon />}
            px={8}
            py={6}
            fontSize="lg"
            borderRadius="xl"
            boxShadow="lg"
          >
            📷 Charger une image
          </Button>
          
          {/* Bouton guide d'utilisation */}
          <UserGuideButton size="md" variant="outline" />
        </VStack>
      </Box>
    );
  }

  // Interface ultra-épurée : TOUS les contrôles sous l'œil - DISPOSITION VERTICALE UNIQUEMENT
  return (
    <>
      {/* ŒIL - Haut gauche */}
      <Box
        position="fixed"
        top={4}
        left={4}
        zIndex={1001}
      >
        <IconButton
          aria-label="Toggle"
          icon={showControls ? <ViewOffIcon /> : <ViewIcon />}
          onClick={toggleControls}
          size="lg"
          colorScheme={showControls ? "red" : "blue"}
          variant="solid"
          borderRadius="full"
          boxShadow="lg"
          _hover={{
            transform: 'scale(1.1)',
            boxShadow: 'xl'
          }}
          transition="all 0.2s"
        />
      </Box>

      {/* TOUS les contrôles cachés - DISPOSITION VERTICALE UNIQUEMENT */}
      <Collapse in={showControls} animateOpacity>
        <Box
          position="fixed"
          top={16} // Juste sous l'œil
          left={4}
          zIndex={1000}
          bg="white"
          borderRadius="xl"
          boxShadow="xl"
          p={3}
          border="1px solid"
          borderColor="gray.200"
          maxW="60px" // Largeur fixe pour forcer la disposition verticale
        >
          <VStack spacing={3}> {/* Espacement augmenté pour éviter les clics accidentels */}
            {/* Bouton principal selon l'état */}
            {appState === APP_STATES.IMAGE_LOADED && (
              <IconButton
                onClick={onStartMeasurement}
                aria-label="Start measurement"
                icon={<AddIcon />}
                size="md"
                colorScheme="green"
                borderRadius="full"
              />
            )}

            {/* Bouton édition des points */}
            {(appState === APP_STATES.MEASUREMENTS_READY || appState === APP_STATES.EDITING_POINTS) && (
              <IconButton
                onClick={appState === APP_STATES.EDITING_POINTS ? onFinishEditing : onEditPoints}
                aria-label={appState === APP_STATES.EDITING_POINTS ? "Finish editing" : "Edit points"}
                icon={appState === APP_STATES.EDITING_POINTS ? <CheckIcon /> : <EditIcon />}
                size="md"
                colorScheme={appState === APP_STATES.EDITING_POINTS ? "green" : "orange"}
                variant="solid"
                borderRadius="full"
              />
            )}

            {/* Export PDF si mesures prêtes */}
            {(appState === APP_STATES.MEASUREMENTS_READY || appState === APP_STATES.EDITING_POINTS) && measurements && (
              <IconButton
                aria-label="Download PDF"
                icon={<DownloadIcon />}
                onClick={handleDownloadPDF}
                isLoading={isGeneratingPDF}
                loadingText="PDF..."
                size="md"
                colorScheme="orange"
                variant="solid"
                borderRadius="full"
              />
            )}

            {/* Voir résultats si disponibles */}
            {(appState === APP_STATES.MEASUREMENTS_READY || appState === APP_STATES.EDITING_POINTS) && measurements && (
              <IconButton
                onClick={onShowResults}
                aria-label="Show results"
                icon={<ViewIcon />}
                size="md"
                colorScheme="blue"
                variant="outline"
                borderRadius="full"
              />
            )}

            {/* Bouton guide d'utilisation - toujours visible */}
            <IconButton
              aria-label="User guide"
              icon={<QuestionIcon />}
              onClick={() => {
                import('../utils/userGuideGenerator').then(module => {
                  module.generateUserGuide();
                });
              }}
              size="md"
              colorScheme="purple"
              variant="outline"
              borderRadius="full"
            />
            
            {/* Reset - TOUJOURS visible en bas */}
            <IconButton
              onClick={onReset}
              aria-label="Reset"
              icon={<RepeatIcon />}
              size="md"
              colorScheme="red"
              variant="outline"
              borderRadius="full"
            />
          </VStack>
        </Box>
      </Collapse>

      {/* Indicateur d'état en mode édition - Seulement si un point est sélectionné */}
      {appState === APP_STATES.EDITING_POINTS && draggedPointIndex !== null && (
        <Box
          position="fixed"
          bottom={4}
          right={4}
          bg="orange.100"
          color="orange.800"
          px={4}
          py={2}
          borderRadius="lg"
          fontSize="sm"
          fontWeight="bold"
          textAlign="center"
          boxShadow="lg"
          zIndex={1000}
          maxW="200px"
        >
          🎯 Déplacement P{draggedPointIndex + 1}
        </Box>
      )}
    </>
  );
}