import React from 'react';
import { Button, useToast } from '@chakra-ui/react';
import { DownloadIcon } from '@chakra-ui/icons';
import { generateUserGuide } from '../utils/userGuideGenerator';

export function UserGuideButton({ variant = "outline", size = "sm" }) {
  const toast = useToast();

  const handleDownloadGuide = async () => {
    try {
      toast({
        title: 'Génération du guide...',
        description: 'Création du PDF en cours',
        status: 'info',
        duration: 2000,
      });

      await generateUserGuide();
      
      toast({
        title: '📖 Guide téléchargé',
        description: 'Le guide d\'utilisation PDF a été généré avec succès',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      console.error('Erreur lors de la génération du guide:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de générer le guide d\'utilisation',
        status: 'error',
        duration: 3000,
      });
    }
  };

  return (
    <Button
      leftIcon={<DownloadIcon />}
      onClick={handleDownloadGuide}
      variant={variant}
      size={size}
      colorScheme="purple"
    >
      Guide PDF
    </Button>
  );
}