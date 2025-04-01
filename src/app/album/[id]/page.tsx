"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { getMyCollection } from "../../../../lib/api";
import { Vinyl } from "../../../../lib/types";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import ColorExtractor from "../../../../components/utils/ColorExtractor";
import useDominantColor from "../../../../hooks/useDominantColor";

export default function AlbumPage() {
  const params = useParams();
  const [album, setAlbum] = useState<Vinyl | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Utiliser notre hook personnalisé
  const { imageRef, dominantColor, textColorClass, handleColorExtracted } =
    useDominantColor();

  useEffect(() => {
    const fetchAlbum = async () => {
      try {
        setLoading(true);
        const collection = await getMyCollection();
        const foundAlbum = collection.find(
          (vinyl) => vinyl.id.toString() === params.id
        );

        if (foundAlbum) {
          setAlbum(foundAlbum);
        } else {
          setError("Album non trouvé");
        }
      } catch (err) {
        console.error("Erreur lors du chargement de l'album:", err);
        setError("Erreur lors du chargement de l'album");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchAlbum();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl">Chargement...</div>
      </div>
    );
  }

  if (error || !album) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <div className="mb-4 text-xl text-red-500">
          {error || "Album non trouvé"}
        </div>
        <Link
          href="/"
          className="flex items-center text-blue-500 hover:underline"
        >
          <ArrowLeftIcon className="mr-2 w-5 h-5" />
          Retour à la collection
        </Link>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: dominantColor || "#000" }}
    >
      <div className="pt-8 pb-16 mx-auto">
        {/* Bouton de retour */}
        <div className="px-4 mb-8">
          <Link
            href="/"
            prefetch={false}
            className={`inline-flex items-center ${textColorClass} hover:opacity-80`}
          >
            <ArrowLeftIcon className="mr-2 w-5 h-5" />
            Retour à la collection
          </Link>
        </div>

        <div className="flex flex-col px-4 md:flex-row md:space-x-8">
          {/* Image du vinyle */}
          <div className="relative mx-auto mb-8 w-full max-w-md md:w-1/3 md:mb-0 aspect-square">
            <Image
              src={album.cover}
              alt={`${album.title} par ${album.artist}`}
              ref={imageRef}
              fill
              className="object-cover shadow-2xl"
              crossOrigin="anonymous"
              sizes="(max-width: 768px) 100vw, 33vw"
              priority
            />
            <ColorExtractor
              imageRef={imageRef}
              onColorExtracted={handleColorExtracted}
            />
          </div>

          {/* Informations de l'album */}
          <div className={`flex-1 ${textColorClass}`}>
            <h1 className="mb-2 text-3xl font-bold md:text-4xl">
              {album.title}
            </h1>
            <h2 className="mb-6 text-2xl font-medium opacity-90">
              {album.artist}
            </h2>

            <div className="mb-6">
              <p className="text-lg">
                <span className="font-medium">Année: </span>
                {album.year}
              </p>
              {album.copies && album.copies > 1 && (
                <p className="text-lg">
                  <span className="font-medium">
                    Nombre d&apos;exemplaires:{" "}
                  </span>
                  {album.copies}
                </p>
              )}
            </div>

            {/* Genres */}
            <div className="mb-6">
              <h3 className="mb-2 text-lg font-medium">Genres:</h3>
              <div className="flex flex-wrap gap-2">
                {album.genres.map((genre, index) => (
                  <span
                    key={`genre-${index}`}
                    className="px-3 py-1 text-white bg-red-600 rounded-full"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </div>

            {/* Styles */}
            <div className="mb-6">
              <h3 className="mb-2 text-lg font-medium">Styles:</h3>
              <div className="flex flex-wrap gap-2">
                {album.styles.map((style, index) => (
                  <span
                    key={`style-${index}`}
                    className="px-3 py-1 text-white bg-black rounded-full"
                  >
                    {style}
                  </span>
                ))}
              </div>
            </div>

            {/* Informations supplémentaires si disponibles */}
            {album.raw && (
              <div className="mt-8">
                <h3 className="mb-4 text-xl font-medium">
                  Détails de la version
                </h3>
                {album.raw.basic_information.formats && (
                  <div className="mb-4">
                    <h4 className="mb-2 font-medium">Formats:</h4>
                    <ul className="pl-5 list-disc">
                      {album.raw.basic_information.formats.map(
                        (
                          format: {
                            name: string;
                            qty: number;
                            descriptions?: string[];
                          },
                          index: number
                        ) => (
                          <li key={`format-${index}`}>
                            {format.name}
                            {format.qty > 1 && ` (${format.qty})`}
                            {format.descriptions &&
                              format.descriptions.length > 0 &&
                              ` - ${format.descriptions.join(", ")}`}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}

                {/* Lien vers Discogs si disponible */}
                {album.raw.basic_information.resource_url && (
                  <a
                    href={`https://www.discogs.com/release/${album.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-4 py-2 mt-4 rounded-md transition-colors bg-white/20 hover:bg-white/30"
                  >
                    Voir sur Discogs
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
