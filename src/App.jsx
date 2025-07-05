import React, { useState, useRef, useEffect } from 'react';
import { Box, useToast } from '@chakra-ui/react';
import { ResizableCanvas } from './components/ResizableCanvas';
import { SmartphoneControls } from './components/SmartphoneControls.jsx';
import { calculateDistance } from './utils/measurementUtils';
import { generatePDF } from './utils/pdfUtils';
import { handleExportImages } from './utils/exportHandlers';
import { performCompleteAnalysis } from './utils/analysisUtils';

// États de l'application
const APP_STATES = {
  NO_IMAGE: 'no_image',
  IMAGE_LOADED: 'image_loaded', 
  PLACING_POINTS: 'placing_points',
  EDITING_POINTS: 'editing_points', // Nouvel état pour l'édition
  MEASUREMENTS_READY: 'measurements_ready'
};

function App() {
  const [appState, setAppState] = useState(APP_STATES.NO_IMAGE);
  const [image, setImage] = useState(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [points, setPoints] = useState([]);
  const [measurements, setMeasurements] = useState(null);
  const [draggedPointIndex, setDraggedPointIndex] = useState(null); // Index du point en cours de déplacement
  const canvasRef = useRef(null);
  const toast = useToast();

  // Fonction pour recalculer les mesures
  const recalculateMeasurements = (currentPoints) => {
    if (currentPoints.length !== 3) return null;

    try {
      const distance12 = calculateDistance(currentPoints[0], currentPoints[1]);
      const distance23 = calculateDistance(currentPoints[1], currentPoints[2]);
      const distance13 = calculateDistance(currentPoints[0], currentPoints[2]);

      return {
        distance12,
        distance23,
        distance13,
        ratio2312: (distance23 / distance12) * 100,
        ratio2313: (distance23 / distance13) * 100,
        showRatio2312: true,
        showRatio2313: true,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Erreur lors du calcul des mesures:', error);
      return null;
    }
  };

  // Calcul automatique des mesures quand 3 points sont placés ou modifiés
  useEffect(() => {
    if (points.length === 3) {
      const newMeasurements = recalculateMeasurements(points);
      
      if (newMeasurements) {
        setMeasurements(newMeasurements);
        
        // Passer automatiquement en mode édition après placement des 3 points (seulement si on était en mode placement)
        if (appState === APP_STATES.PLACING_POINTS) {
          setAppState(APP_STATES.EDITING_POINTS);
          
          toast({
            title: '✅ Points placés avec succès',
            description: 'Vous pouvez maintenant ajuster leur position en les faisant glisser',
            status: 'success',
            duration: 4000,
            isClosable: true,
          });
          
          // Feedback haptique si disponible
          if (navigator.vibrate) {
            navigator.vibrate([100, 50, 100]);
          }
        }
      }
    } else {
      // Si moins de 3 points, pas de mesures
      setMeasurements(null);
    }
  }, [points, appState]);

  const handleImageLoad = (event) => {
    try {
      const file = event.target.files[0];
      if (file) {
        // Reset de l'état
        setPoints([]);
        setMeasurements(null);
        setScale(1);
        setPosition({ x: 0, y: 0 });
        setDraggedPointIndex(null);
        
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            setImage(img);
            setAppState(APP_STATES.IMAGE_LOADED);
          };
          img.onerror = () => {
            toast({
              title: 'Erreur de chargement',
              description: 'Impossible de charger l\'image',
              status: 'error',
              duration: 3000,
            });
          };
          img.src = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'image:', error);
      toast({
        title: 'Erreur',
        description: 'Erreur lors du chargement de l\'image',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleStartMeasurement = () => {
    try {
      setAppState(APP_STATES.PLACING_POINTS);
      setPoints([]);
      setMeasurements(null);
      setDraggedPointIndex(null);
    } catch (error) {
      console.error('Erreur lors du démarrage des mesures:', error);
    }
  };

  const handleEditPoints = () => {
    try {
      if (points.length === 3) {
        setAppState(APP_STATES.EDITING_POINTS);
        setDraggedPointIndex(null); // Reset du point sélectionné
        toast({
          title: '✏️ Mode édition activé',
          description: 'Touchez un point puis faites-le glisser pour ajuster sa position',
          status: 'info',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Erreur lors de l\'activation du mode édition:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'activer le mode édition',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleFinishEditing = () => {
    try {
      setAppState(APP_STATES.MEASUREMENTS_READY);
      setDraggedPointIndex(null);
      
      toast({
        title: '✅ Édition terminée',
        description: 'Position des points finalisée',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Erreur lors de la finalisation de l\'édition:', error);
      // En cas d'erreur, on reste en mode édition plutôt que de crasher
      toast({
        title: 'Attention',
        description: 'Édition terminée avec des avertissements',
        status: 'warning',
        duration: 3000,
      });
    }
  };

  const handleShowResults = () => {
    try {
      if (measurements) {
        // Effectuer l'analyse complète
        const analysis = performCompleteAnalysis(measurements);
        
        // Afficher les résultats simplifiés
        toast({
          title: '📊 Analyse des mesures',
          description: `Périnée ${analysis.perineumClass} (${Math.round(analysis.perineeToTotalRatio)}%) - Fente vulvaire ${analysis.vulvaClass} (${Math.round(analysis.vulvaToTotalRatio)}%)`,
          status: 'success',
          duration: 6000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Erreur lors de l\'affichage des résultats:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'afficher l\'analyse',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleExportAll = async () => {
    if (!canvasRef.current || !measurements) {
      return;
    }

    try {
      // Export des images et PDF
      const imageDataUrl = canvasRef.current.toDataURL('image/png');
      
      // Export des 2 fichiers images + PDF
      await handleExportImages(canvasRef.current, image, measurements);
      await generatePDF(imageDataUrl, measurements);
      
      toast({
        title: '✅ Export terminé',
        description: 'Images et PDF téléchargés avec succès',
        status: 'success',
        duration: 3000,
      });
      
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      toast({
        title: 'Erreur d\'export',
        description: 'Une erreur est survenue lors de l\'export',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleReset = () => {
    try {
      setImage(null);
      setPoints([]);
      setMeasurements(null);
      setScale(1);
      setPosition({ x: 0, y: 0 });
      setDraggedPointIndex(null);
      setAppState(APP_STATES.NO_IMAGE);
    } catch (error) {
      console.error('Erreur lors du reset:', error);
      // Force le reset même en cas d'erreur
      window.location.reload();
    }
  };

  // Fonction pour détecter si un point est cliqué
  const getClickedPointIndex = (clickCoords) => {
    try {
      const CLICK_THRESHOLD = Math.max(20, 30 / scale); // Zone de clic adaptée au zoom
      
      for (let i = 0; i < points.length; i++) {
        const point = points[i];
        const screenPoint = {
          x: point.x * scale + position.x,
          y: point.y * scale + position.y
        };
        
        const distance = Math.sqrt(
          Math.pow(clickCoords.x - screenPoint.x, 2) + 
          Math.pow(clickCoords.y - screenPoint.y, 2)
        );
        
        if (distance <= CLICK_THRESHOLD) {
          return i;
        }
      }
      return -1;
    } catch (error) {
      console.error('Erreur lors de la détection du point cliqué:', error);
      return -1;
    }
  };

  // Gestionnaire de gestes tactiles avec gestion d'erreur améliorée
  const handleTouchGesture = (gestureType, data) => {
    try {
      switch (gestureType) {
        case 'pan':
          if (appState === APP_STATES.EDITING_POINTS && draggedPointIndex !== null) {
            // Déplacer le point sélectionné
            const imageCoords = {
              x: (data.currentX - position.x) / scale,
              y: (data.currentY - position.y) / scale
            };
            
            setPoints(prev => {
              const newPoints = [...prev];
              newPoints[draggedPointIndex] = imageCoords;
              return newPoints;
            });
          } else if (appState !== APP_STATES.PLACING_POINTS && draggedPointIndex === null) {
            // Pan normal de l'image
            setPosition(prev => ({
              x: prev.x + data.deltaX,
              y: prev.y + data.deltaY
            }));
          }
          break;
          
        case 'pinchZoom':
          setScale(data.scale);
          break;
          
        case 'longTap':
          if (appState === APP_STATES.PLACING_POINTS && points.length < 3) {
            // Feedback haptique
            if (navigator.vibrate) {
              navigator.vibrate(50);
            }
            
            setPoints(prev => [...prev, data]);
          }
          break;

        case 'tap':
          if (appState === APP_STATES.EDITING_POINTS) {
            // Vérifier si on a cliqué sur un point
            const clickedIndex = getClickedPointIndex(data);
            if (clickedIndex !== -1) {
              setDraggedPointIndex(clickedIndex);
              
              // Feedback haptique
              if (navigator.vibrate) {
                navigator.vibrate(30);
              }
              
              toast({
                title: `Point P${clickedIndex + 1} sélectionné`,
                description: 'Faites glisser pour repositionner',
                status: 'info',
                duration: 2000,
                isClosable: true,
              });
            } else {
              // Désélectionner si on clique ailleurs
              setDraggedPointIndex(null);
            }
          }
          break;

case 'dragEnd':
  if (draggedPointIndex !== null) {
    setDraggedPointIndex(null);

    if (navigator.vibrate) {
      navigator.vibrate([50, 30, 50]);
    }

    // ✅ Sortie automatique du mode édition
    setAppState(APP_STATES.MEASUREMENTS_READY);

    toast({
      title: '✅ Point repositionné',
      description: 'Mode édition terminé – vous pouvez zoomer/déplacer',
      status: 'success',
      duration: 2500,
      isClosable: true,
    });
  }
  break;
          
        case 'doubleTap':
          // Reset du zoom
          setScale(1);
          setPosition({ x: 0, y: 0 });
          break;
          
        default:
          break;
      }
    } catch (error) {
      console.error('Erreur lors de la gestion du geste:', gestureType, error);
      // En cas d'erreur, on reset le point sélectionné pour éviter les états incohérents
      setDraggedPointIndex(null);
    }
  };

  return (
    <Box position="relative" h="100vh" w="100vw" overflow="hidden" bg="gray.50">
      {/* Canvas plein écran */}
      <Box 
        position="absolute" 
        top={0} 
        left={0} 
        right={0} 
        bottom={0}
        display="flex" 
        justifyContent="center" 
        alignItems="center"
      >
        <ResizableCanvas
          canvasRef={canvasRef}
          image={image}
          scale={scale}
          position={position}
          points={points}
          isPlacingPoints={appState === APP_STATES.PLACING_POINTS}
          isEditing={appState === APP_STATES.EDITING_POINTS}
          measurements={measurements}
          drawingColor="white"
          onTouchGesture={handleTouchGesture}
          setPoints={setPoints}
          draggedPointIndex={draggedPointIndex}
          setDraggedPointIndex={setDraggedPointIndex}
        />
      </Box>

      {/* Contrôles smartphone ultra-épurés */}
      <SmartphoneControls
        appState={appState}
        onImageLoad={handleImageLoad}
        onStartMeasurement={handleStartMeasurement}
        onEditPoints={handleEditPoints}
        onFinishEditing={handleFinishEditing}
        onShowResults={handleShowResults}
        onExportAll={handleExportAll}
        onReset={handleReset}
        measurements={measurements}
        pointsCount={points.length}
        canvasRef={canvasRef}
        draggedPointIndex={draggedPointIndex}
      />
    </Box>
  );
}

export default App;