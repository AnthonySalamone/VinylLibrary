import { useState, useRef } from "react";

interface DominantColorState {
  imageRef: React.RefObject<HTMLImageElement | null>;
  dominantColor: string | null;
  textColorClass: string;
  isLightBackground: boolean;
}

/**
 * Hook personnalisé pour extraire la couleur dominante d'une image
 *
 * @returns Un objet contenant:
 * - imageRef: Référence à attacher à l'élément image
 * - dominantColor: Couleur dominante au format RGB
 * - textColorClass: Classe de texte recommandée (noir ou blanc)
 * - isLightBackground: Indicateur booléen si la couleur est claire
 */
export default function useDominantColor(): DominantColorState & {
  handleColorExtracted: (color: string, isLight: boolean) => void;
} {
  const [dominantColor, setDominantColor] = useState<string | null>(null);
  const [textColorClass, setTextColorClass] = useState<string>("text-white");
  const [isLightBackground, setIsLightBackground] = useState<boolean>(false);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleColorExtracted = (color: string, isLight: boolean) => {
    setDominantColor(color);
    setTextColorClass(isLight ? "text-black" : "text-white");
    setIsLightBackground(isLight);
  };

  return {
    imageRef,
    dominantColor,
    textColorClass,
    isLightBackground,
    handleColorExtracted,
  };
}
