"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Vinyl } from "../../lib/types";
import axios from "axios";
import ColorExtractor from "../utils/ColorExtractor";
import useDominantColor from "../../hooks/useDominantColor";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

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
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const previousGemsRef = useRef<HTMLHeadingElement>(null);

  // Utiliser notre hook personnalisé
  const { imageRef, dominantColor, textColorClass, handleColorExtracted } =
    useDominantColor();

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

  // Animation
  useEffect(() => {
    if (!titleRef.current) return;

    // S'assurer que l'animation ne s'exécute que côté client
    if (typeof window !== "undefined") {
      // title animation
      const titleAnimation = gsap.to(titleRef.current, {
        y: -200,
        duration: 1,
        scrollTrigger: {
          trigger: titleRef.current,
          start: "top 80%",
          end: "bottom 20%",
          markers: false,
          scrub: 1,
          toggleActions: "play none none reverse",
        },
      });

      const imageAnimation = gsap.to(imageRef.current, {
        rotate: 360,
        duration: 1,
        scrollTrigger: {
          trigger: imageRef.current,
          start: "top 80%",
          end: "bottom 80%",
          markers: false,
          scrub: 1,
          toggleActions: "play none none reverse",
        },
      });

      const previousGemsAnimation = gsap.fromTo(
        previousGemsRef.current,
        {
          x: "-300%",
          opacity: 0,
        },
        {
          x: "0%",
          opacity: 1,
          duration: 1,
          scrollTrigger: {
            trigger: previousGemsRef.current,
            start: "top top",
            end: "bottom bottom",
            markers: false,
            scrub: 1,
            toggleActions: "play none none reverse",
          },
        }
      );

      // Animate each album's position
      previousVinyls.forEach((_, index) => {
        gsap.fromTo(
          `.history-album-${index}`,
          {
            left: "0%",
          },
          {
            left: `${index * 4}%`,
            duration: 1,
            scrollTrigger: {
              trigger: previousGemsRef.current,
              start: "top top",
              end: "bottom top",
              markers: true,
              scrub: 1,
              toggleActions: "play none none reverse",
            },
          }
        );
      });

      // Nettoyer l'animation lors du démontage du composant
      return () => {
        titleAnimation.kill();
        imageAnimation.kill();
        previousGemsAnimation.kill();
        ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      };
    }
  }, [vinylOfTheDay]); // Re-run when vinylOfTheDay changes to ensure the title is rendered

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

      // DEV ONLY: Populate history with albums for development purposes
      // REMOVE THIS SECTION WHEN DEVELOPMENT IS COMPLETE
      if (allVinyls.length > 0) {
        // Force populate with random albums for development
        const randomAlbums = [...allVinyls]
          .sort(() => 0.5 - Math.random())
          .slice(0, MAX_HISTORY_ITEMS);

        history = randomAlbums;
        localStorage.setItem("vinylHistory", JSON.stringify(history));
        console.log("DEV: Force-populated history with random albums");
      }
      // END DEV ONLY SECTION

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

  // Gestion de la couleur extraite avec fonction de rappel vers le composant parent
  useEffect(() => {
    if (dominantColor && onColorExtracted) {
      const isLight = textColorClass === "text-black";
      onColorExtracted(dominantColor, isLight);
    }
  }, [dominantColor, textColorClass, onColorExtracted]);

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

    // Limiter à environ 600 caractères et ajouter "..." si nécessaire
    const maxLength = 600;
    let formattedText =
      artist.profile.length > maxLength
        ? artist.profile.substring(0, maxLength) + "..."
        : artist.profile;

    // Formater les balises spéciales
    formattedText = formatMarkup(formattedText);

    return formattedText;
  };

  // Fonction pour formater les balises spéciales dans le texte
  const formatMarkup = (text: string) => {
    // Remplacer les balises [a=...] par le texte sans la balise
    text = text.replace(/\[a=([^\]]+)\]/g, "$1");

    // Remplacer les balises [l=...] par le texte sans la balise
    text = text.replace(/\[l=([^\]]+)\]/g, "$1");

    // Remplacer les balises [i=...] par le texte sans la balise
    text = text.replace(/\[i=([^\]]+)\]/g, "$1");

    // Remplacer les balises [b=...] par le texte sans la balise
    text = text.replace(/\[b=([^\]]+)\]/g, "$1");

    // Remplacer les balises [url=...] par le texte sans la balise
    text = text.replace(/\[url=([^\]]+)\]/g, "$1");

    return text;
  };

  return (
    <div
      className={`relative mx-4 mb-8 text-black`}
      style={{ color: dominantColor || "black" }}
    >
      <h3
        ref={titleRef}
        className={`mb-4 text-[clamp(2rem,10vw,6rem)] 2xl:text-[clamp(2rem,10vw,8rem)] uppercase xl:[word-spacing:0.5em] 2xl:[word-spacing:1em] font-bold absolute top-0 left-0  ${
          textColorClass === "text-black" ? "text-black" : "text-white"
        }`}
      >
        Vinyl of the Day
      </h3>
      <div className="absolute top-0 right-0 left-0 w-full h-1/5 bg-white rounded-lg"></div>
      <div className="p-4 bg-white rounded-lg lg:p-20">
        <div className="flex z-10 flex-col grid-cols-2 gap-4 lg:grid">
          {/* Image de l'album avec lien vers la page détaillée */}
          <Link
            href={`/album/${vinylOfTheDay.id}`}
            className="overflow-hidden relative w-full rounded-full transition-opacity aspect-square"
          >
            <Image
              src={vinylOfTheDay.cover}
              alt={vinylOfTheDay.title}
              fill
              className="object-cover"
              ref={imageRef}
              crossOrigin="anonymous"
              style={{ border: `1px solid ${dominantColor || "black"}` }}
            />
            <ColorExtractor
              imageRef={imageRef}
              onColorExtracted={handleColorExtracted}
            />
          </Link>
          {/* Informations de l'album */}
          <div className="flex z-10 flex-col justify-between">
            <div>
              <Link
                href={`/album/${vinylOfTheDay.id}`}
                className="hover:underline"
              >
                <h3 className="mb-2 text-[clamp(2rem,10vw,7rem)] leading-none font-bold">
                  {vinylOfTheDay.title}
                </h3>
              </Link>
              <p className="mb-2 text-xl uppercase">{vinylOfTheDay.artist}</p>
              <p className="mb-2 text-xl">{vinylOfTheDay.year}</p>
            </div>
            {/* Genres et Styles */}
            <div className="space-y-2">
              <div className="text-sm lg:text-lg">Genres</div>
              <div
                className={`flex flex-wrap gap-2 ${
                  textColorClass === "text-black" ? "text-black" : "text-white"
                }`}
              >
                {vinylOfTheDay.genres.map((genre: string, index: number) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-sm rounded-full lg:text-lg"
                    style={{ backgroundColor: dominantColor || "black" }}
                  >
                    {genre}
                  </span>
                ))}
              </div>
              <div className="text-sm lg:text-lg">Styles</div>
              <div
                className={`flex flex-wrap gap-2 ${
                  textColorClass === "text-black" ? "text-black" : "text-white"
                }`}
              >
                {vinylOfTheDay.styles.map((style: string, index: number) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-sm rounded-full lg:text-lg"
                    style={{ backgroundColor: dominantColor || "black" }}
                  >
                    {style}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section de l'artiste */}
      <div
        className="p-4 mt-8 rounded-lg lg:mt-20"
        style={{ background: `${dominantColor || "black"}` }}
      >
        <div className="flex flex-col gap-6 md:flex-row">
          {/* Description de l'artiste */}
          <div className="flex-1">
            <h3
              className={`text-[clamp(1.5rem,10vw,4rem)] font-bold uppercase leading-none mb-8 ${
                textColorClass === "text-black" ? "text-black" : "text-white"
              }`}
            >
              Who is {artist?.name}?
            </h3>
            {loading ? (
              <p
                className={`${
                  textColorClass === "text-black" ? "text-black" : "text-white"
                }`}
              >
                Chargement des informations...
              </p>
            ) : (
              <>
                <p
                  className={`text-3xl whitespace-pre-line ${
                    textColorClass === "text-black"
                      ? "text-black"
                      : "text-white"
                  }`}
                >
                  {formatArtistProfile()}
                </p>
                {artist?.url && (
                  <a
                    href={artist.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-block mt-4 ${
                      textColorClass === "text-black"
                        ? "text-black"
                        : "text-white"
                    } hover:underline`}
                  >
                    Voir sur Discogs
                  </a>
                )}
              </>
            )}
          </div>

          {/* Photo de l'artiste */}
          {artistImage && (
            <div className="relative w-full md:w-1/2 aspect-square md:mb-0">
              <Image
                src={artistImage}
                alt={artist?.name || vinylOfTheDay.artist}
                fill
                className="object-cover"
              />
            </div>
          )}
        </div>
      </div>

      {/* Historique des albums du jour */}
      <div className="p-4 pt-10 -mx-4 mt-8 h-screen bg-black lg:mt-20">
        <h3
          ref={previousGemsRef}
          className="text-[clamp(1.5rem,10vw,7rem)] font-bold text-white uppercase text-left leading-none mb-10"
        >
          Previous Gems
        </h3>
        {previousVinyls.length > 0 && (
          <div>
            <div className="relative h-full perspective-1000">
              {previousVinyls.map((vinyl, index) => (
                <Link
                  key={`history-${index}`}
                  href={`/album/${vinyl.id}`}
                  className={`block absolute w-1/3 aspect-square history-album-${index}`}
                  style={{
                    transform: `translateX(${
                      index === 0
                        ? "0"
                        : hoveredIndex === index
                        ? "80%"
                        : hoveredIndex !== null && index > hoveredIndex
                        ? "80%"
                        : "0"
                    })`,
                    zIndex: previousVinyls.length - index,
                    top: "50%",
                    transformOrigin: "left center",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <div className="relative w-full border border-white shadow-lg aspect-square">
                    <Image
                      src={vinyl.cover}
                      alt={vinyl.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  {hoveredIndex === index && (
                    <div className="mt-2 text-center">
                      <p className="text-sm font-bold text-white truncate">
                        {vinyl.title}
                      </p>
                      <p className="text-xs text-white truncate">
                        {vinyl.artist}
                      </p>
                      <p className="text-xs text-white">{vinyl.year}</p>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
