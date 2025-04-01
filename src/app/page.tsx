"use client";
import { useState, useEffect } from "react";
import VinylCard from "../../components/vinyl/VinylCard";
import SortFilter from "../../components/vinyl/SortFilter";
import { getMyCollection } from "../../lib/api";
import { Vinyl } from "../../lib/types";
import VOTD from "../../components/vinyl/VOTD";

export default function Home() {
  const [allVinyls, setAllVinyls] = useState<Vinyl[]>([]);
  const [displayedVinyls, setDisplayedVinyls] = useState<Vinyl[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [availableStyles, setAvailableStyles] = useState<string[]>([]);
  const [selectedGenre, setSelectedGenre] = useState("");
  const [dominantColor, setDominantColor] = useState<string | null>(null);
  const [isLightBackground, setIsLightBackground] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getMyCollection();
      setAllVinyls(data);
      setDisplayedVinyls(data);

      // Extraire les genres uniques
      const uniqueGenres = Array.from(
        new Set(data.flatMap((vinyl) => vinyl.genres))
      );
      setGenres(uniqueGenres);
    };
    fetchData();
  }, []);

  // Mettre à jour les styles disponibles quand le genre change
  const updateAvailableStyles = (genre: string) => {
    if (!genre) {
      // Si aucun genre n'est sélectionné, afficher tous les styles
      const allStyles = Array.from(
        new Set(allVinyls.flatMap((vinyl) => vinyl.styles))
      );
      setAvailableStyles(allStyles);
    } else {
      // Filtrer les styles en fonction du genre sélectionné
      const vinylsWithGenre = allVinyls.filter((vinyl) =>
        vinyl.genres.includes(genre)
      );
      const stylesForGenre = Array.from(
        new Set(vinylsWithGenre.flatMap((vinyl) => vinyl.styles))
      );
      setAvailableStyles(stylesForGenre);
    }
  };

  // Fonction pour recevoir la couleur dominante de VOTD
  const handleColorExtracted = (color: string, isLight: boolean) => {
    setDominantColor(color);
    setIsLightBackground(isLight);
  };

  const handleSort = (sortBy: string) => {
    const sorted = [...displayedVinyls];
    switch (sortBy) {
      case "title":
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "title-desc":
        sorted.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case "artist":
        sorted.sort((a, b) => a.artist.localeCompare(b.artist));
        break;
      case "artist-desc":
        sorted.sort((a, b) => b.artist.localeCompare(a.artist));
        break;
      case "year":
        sorted.sort((a, b) => a.year - b.year);
        break;
      case "year-desc":
        sorted.sort((a, b) => b.year - a.year);
        break;
    }
    setDisplayedVinyls(sorted);
  };

  const handleFilter = (filterType: string, value: string) => {
    let filtered = [...allVinyls];

    if (filterType === "genre") {
      setSelectedGenre(value);
      updateAvailableStyles(value);

      if (value) {
        filtered = filtered.filter((vinyl) => vinyl.genres.includes(value));
      }
    } else if (filterType === "style") {
      if (value) {
        filtered = filtered.filter((vinyl) => vinyl.styles.includes(value));
        // Maintenir le filtre de genre si présent
        if (selectedGenre) {
          filtered = filtered.filter((vinyl) =>
            vinyl.genres.includes(selectedGenre)
          );
        }
      }
    }

    setDisplayedVinyls(filtered);
  };

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: dominantColor || "black" }}
    >
      <div className="py-8 mx-auto">
        <div className="px-4 mb-8">
          <h1
            className={`text-3xl font-bold ${
              isLightBackground ? "text-black" : "text-white"
            }`}
          >
            Ma Collection de Vinyles
          </h1>
          <div
            className={`mt-2 text-2xl ${
              isLightBackground ? "text-black" : "text-white"
            }`}
          >
            {displayedVinyls.length} albums affichés
          </div>
        </div>

        <VOTD allVinyls={allVinyls} onColorExtracted={handleColorExtracted} />
        <div className="px-4">
          <SortFilter
            onSortChange={handleSort}
            onFilterChange={handleFilter}
            genres={genres}
            styles={availableStyles}
            selectedGenre={selectedGenre}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 px-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
          {displayedVinyls.map((vinyl) => (
            <div key={vinyl.id} className="w-full aspect-square">
              <VinylCard {...vinyl} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
