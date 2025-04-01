import { useRef, useEffect } from "react";
import ColorThiefModule from "colorthief";
import type { ColorThief } from "../../lib/types";

interface ColorExtractorProps {
  imageRef: React.RefObject<HTMLImageElement | null>;
  onColorExtracted: (color: string, isLight: boolean) => void;
}

export default function ColorExtractor({
  imageRef,
  onColorExtracted,
}: ColorExtractorProps) {
  const hasExtractedRef = useRef(false);

  useEffect(() => {
    const extractColor = () => {
      if (
        imageRef.current &&
        imageRef.current.complete &&
        !hasExtractedRef.current
      ) {
        try {
          const colorThief = new (ColorThiefModule as unknown as {
            new (): ColorThief;
          })();

          const color = colorThief.getColor(imageRef.current);
          const dominantColor = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;

          // Calculer la luminosité pour déterminer si c'est une couleur claire ou foncée
          const r = color[0];
          const g = color[1];
          const b = color[2];
          const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
          const isLight = luminance > 0.5;

          onColorExtracted(dominantColor, isLight);
          hasExtractedRef.current = true;
        } catch (error) {
          console.error("Erreur lors de l'extraction de la couleur:", error);
        }
      }
    };

    extractColor();

    // Si l'image n'est pas encore chargée, ajouter un écouteur d'événement
    if (imageRef.current && !imageRef.current.complete) {
      imageRef.current.addEventListener("load", extractColor);
    }

    return () => {
      if (imageRef.current) {
        imageRef.current.removeEventListener("load", extractColor);
      }
    };
  }, [imageRef, onColorExtracted]);

  return null; // Ce composant ne rend rien visuellement
}
