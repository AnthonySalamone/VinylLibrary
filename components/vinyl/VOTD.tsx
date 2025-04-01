"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Vinyl, ColorThief } from "../../lib/types";
import axios from "axios";
import ColorThiefModule from "colorthief";

interface VOTDProps {
  allVinyls: Vinyl[];
  onColorExtracted: (color: string, isLight: boolean) => void;
}

interface ArtistInfo {
  id: number;
  name: string;
  images?: Array<{
    uri: string;
    type?: string;
  }>;
  profile?: string;
  url?: string;
}

// Nombre maximum d'albums historiques à conserver
const MAX_HISTORY_ITEMS = 10;

export default function VOTD({ allVinyls, onColorExtracted }: VOTDProps) {
  const [vinylOfTheDay, setVinylOfTheDay] = useState<Vinyl | null>(null);
  const [previousVinyls, setPreviousVinyls] = useState<Vinyl[]>([]);
  const [artist, setArtist] = useState<ArtistInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [dominantColor, setDominantColor] = useState<string | null>(null);
  const [textColorClass, setTextColorClass] = useState<string>("text-black");
  const imageRef = useRef<HTMLImageElement>(null);
  // Configuration pour les requêtes Discogs
  const DISCOGS_TOKEN = process.env.NEXT_PUBLIC_DISCOGS_TOKEN;

  // Fonction pour récupérer les informations de l'artiste
  const fetchArtistInfo = async (artistId: number) => {
    if (!artistId || !DISCOGS_TOKEN) return null;

    setLoading(true);
    try {
      const response = await axios.get(
        `https://api.discogs.com/artists/${artistId}`,
        {
          headers: {
            Authorization: `Discogs token=${DISCOGS_TOKEN}`,
            "User-Agent": "VinylLibrary/1.0",
          },
        }
      );

      if (response.data) {
        setArtist(response.data);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des infos artiste:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const getVinylOfTheDay = () => {
      if (allVinyls.length === 0) return null;

      // Obtenir la date actuelle
      const today = new Date();
      const dateKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;

      // Vérifier si un vinyle est déjà stocké pour aujourd'hui
      const storedVinyl = localStorage.getItem("vinylOfTheDay");
      const storedDate = localStorage.getItem("vinylOfTheDayDate");

      // Charger l'historique des albums précédents
      let history: Vinyl[] = [];
      try {
        const storedHistory = localStorage.getItem("vinylHistory");
        if (storedHistory) {
          history = JSON.parse(storedHistory);
        }
      } catch (error) {
        console.error("Erreur lors du chargement de l'historique:", error);
      }

      setPreviousVinyls(history);

      // Si nous avons un vinyle stocké pour aujourd'hui, l'utiliser
      if (storedVinyl && storedDate === dateKey) {
        return JSON.parse(storedVinyl);
      }

      // Sinon, en sélectionner un nouveau
      const dayOfYear = Math.floor(
        (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) /
          86400000
      );
      const year = today.getFullYear();
      const stableSeed = year * 1000 + dayOfYear;
      const index = stableSeed % allVinyls.length;
      const newVinyl = allVinyls[index];

      // Mettre à jour l'historique
      if (storedVinyl && storedDate !== dateKey) {
        const previousVinyl = JSON.parse(storedVinyl);
        // Ajouter l'ancien vinyl du jour à l'historique
        const updatedHistory = [previousVinyl, ...history].slice(
          0,
          MAX_HISTORY_ITEMS
        );
        localStorage.setItem("vinylHistory", JSON.stringify(updatedHistory));
        setPreviousVinyls(updatedHistory);
      }

      // Stocker le nouveau vinyle et la date
      localStorage.setItem("vinylOfTheDay", JSON.stringify(newVinyl));
      localStorage.setItem("vinylOfTheDayDate", dateKey);

      return newVinyl;
    };

    const selectedVinyl = getVinylOfTheDay();
    setVinylOfTheDay(selectedVinyl);

    // Récupérer les informations de l'artiste si on a un vinyle
    if (
      selectedVinyl &&
      selectedVinyl.raw &&
      selectedVinyl.raw.basic_information.artists[0].id
    ) {
      fetchArtistInfo(selectedVinyl.raw.basic_information.artists[0].id);
    }
  }, [allVinyls, DISCOGS_TOKEN]);

  if (!vinylOfTheDay) return null;

  // Obtenir l'image de l'artiste (la première disponible, de préférence de type primary)
  const getArtistImage = () => {
    if (!artist || !artist.images || artist.images.length === 0) return null;

    // Essayer de trouver une image de type 'primary' d'abord
    const primaryImage = artist.images.find((img) => img.type === "primary");
    if (primaryImage) return primaryImage.uri;

    // Sinon prendre la première image
    return artist.images[0].uri;
  };

  const artistImage = getArtistImage();

  // Formater la description de l'artiste (limiter la longueur)
  const formatArtistProfile = () => {
    if (!artist || !artist.profile) return "Aucune description disponible";

    // Limiter à environ 300 caractères et ajouter "..." si nécessaire
    const maxLength = 300;
    return artist.profile.length > maxLength
      ? artist.profile.substring(0, maxLength) + "..."
      : artist.profile;
  };

  // Puis dans la fonction extractDominantColor, appelez cette fonction
  const extractDominantColor = () => {
    if (imageRef.current && imageRef.current.complete) {
      try {
        const colorThief = new (ColorThiefModule as unknown as {
          new (): ColorThief;
        })();
        const color = colorThief.getColor(imageRef.current);
        const newDominantColor = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
        setDominantColor(newDominantColor);

        // Calculer la luminosité
        const r = color[0];
        const g = color[1];
        const b = color[2];
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        const isLight = luminance > 0.5;

        // Mettre à jour le state local
        setTextColorClass(isLight ? "text-black" : "text-white");

        // Informer le composant parent de la couleur extraite
        if (onColorExtracted) {
          onColorExtracted(newDominantColor, isLight);
        }
      } catch (error) {
        console.error("Erreur lors de l'extraction de la couleur:", error);
      }
    }
  };

  // Gérer le chargement de l'image
  const handleImageLoad = () => {
    extractDominantColor();
  };

  return (
    <div
      className={`overflow-hidden px-4 py-10 mb-8 ${textColorClass}`}
      style={{ backgroundColor: dominantColor || "transparent" }}
    >
      <div>
        <h2 className="mb-4 text-2xl font-bold">Album du Jour</h2>
      </div>

      <div className="flex flex-col gap-4 md:flex-row">
        {/* Image de l'album */}
        <div className="relative w-full md:w-1/3 aspect-square">
          <Image
            src={vinylOfTheDay.cover}
            alt={vinylOfTheDay.title}
            fill
            className="object-cover"
            ref={imageRef}
            onLoad={handleImageLoad}
            crossOrigin="anonymous"
          />
        </div>

        {/* Informations de l'album */}
        <div className="flex-1">
          <h3 className="mb-2 text-2xl font-bold">{vinylOfTheDay.title}</h3>
          <p className="mb-4 text-lg">{vinylOfTheDay.artist}</p>
          <p className="mb-4">{vinylOfTheDay.year}</p>

          {/* Genres et Styles */}
          <div className="mb-4 space-y-2 text-white">
            <div className="flex flex-wrap gap-2">
              {vinylOfTheDay.genres.map((genre: string, index: number) => (
                <span
                  key={index}
                  className="px-2 py-1 text-sm rounded-full bg-red-600/80"
                >
                  {genre}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {vinylOfTheDay.styles.map((style: string, index: number) => (
                <span
                  key={index}
                  className="px-2 py-1 text-sm bg-black rounded-full"
                >
                  {style}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Section de l'artiste */}
      <div className="pt-6 mt-8">
        <h3 className="mb-4 text-xl font-bold">À propos de l&apos;artiste</h3>

        <div className="flex flex-col gap-6 md:flex-row">
          {/* Photo de l'artiste */}
          {artistImage && (
            <div className="relative mb-4 w-full md:w-1/4 aspect-square md:mb-0">
              <Image
                src={artistImage}
                alt={artist?.name || vinylOfTheDay.artist}
                fill
                className="object-cover rounded-lg"
              />
            </div>
          )}

          {/* Description de l'artiste */}
          <div className="flex-1">
            {loading ? (
              <p className="text-gray-700">Chargement des informations...</p>
            ) : (
              <>
                <p className="whitespace-pre-line">{formatArtistProfile()}</p>
                {artist?.url && (
                  <a
                    href={artist.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-4 text-blue-600 hover:underline"
                  >
                    Voir sur Discogs
                  </a>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Historique des albums du jour */}
      {previousVinyls.length > 0 && (
        <div className="pt-6 mt-8 border-t border-gray-300">
          <h3 className="mb-4 text-xl font-bold text-black">
            Historique des Albums du Jour
          </h3>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            {previousVinyls.map((vinyl, index) => (
              <div key={`history-${index}`} className="relative">
                <div className="relative w-full aspect-square">
                  <Image
                    src={vinyl.cover}
                    alt={vinyl.title}
                    fill
                    className="object-cover"
                  />
                  <div className="flex absolute inset-0 flex-col justify-center items-center p-2 text-center bg-black bg-opacity-60 opacity-0 transition-opacity hover:opacity-100">
                    <p className="text-sm font-bold text-white">
                      {vinyl.title}
                    </p>
                    <p className="text-xs text-white">{vinyl.artist}</p>
                    <p className="text-xs text-white">{vinyl.year}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
