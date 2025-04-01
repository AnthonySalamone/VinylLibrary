import Image from "next/image";
import Link from "next/link";

// components/vinyl/VinylCard.tsx
interface VinylProps {
  id: string | number;
  title: string;
  artist: string;
  year: number;
  cover?: string;
  copies?: number;
  genres?: string[];
  styles?: string[];
}

export default function VinylCard({
  id,
  title,
  artist,
  year,
  cover,
  copies = 1,
  genres = [],
  styles = [],
}: VinylProps) {
  return (
    <Link href={`/album/${id}`} className="block w-full h-full">
      <div className="relative col-span-1 w-full h-full group">
        <div className="relative w-full pt-[100%]">
          {cover ? (
            <Image
              src={cover}
              alt={`${title} par ${artist}`}
              className="object-cover absolute top-0 left-0 w-full h-full"
              width={1000}
              height={1000}
              priority={false}
              loading="lazy"
              quality={75}
            />
          ) : (
            <div className="flex absolute top-0 left-0 justify-center items-center w-full h-full bg-gray-300">
              <span>No Cover</span>
            </div>
          )}
        </div>

        <div className="absolute top-0 left-0 w-full h-full opacity-0 backdrop-blur-sm transition-opacity duration-300 bg-black/70 group-hover:opacity-100" />

        <div className="absolute top-2 left-2 space-y-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="flex flex-col gap-2">
            {/* Genres */}
            <div>
              {genres.map((genre, index) => (
                <span
                  key={index}
                  className="mr-1 text-sm font-bold text-white uppercase last:mr-0"
                >
                  {genre}
                </span>
              ))}
            </div>

            {/* Styles musicaux */}
            <div>
              {styles.map((style, index) => (
                <span
                  key={index}
                  className="p-2 mr-1 text-xs text-white rounded-full bg-black/70 last:mr-0"
                >
                  {style}
                </span>
              ))}
            </div>
          </div>

          {/* Informations de l'album */}
          <div className="w-full">
            <h3 className="text-lg font-bold text-white break-words">
              {title}
            </h3>
            <p className="truncate text-white/90">{artist}</p>
            <p className="text-sm text-white/70">{year}</p>
          </div>
          {/* Badge pour les copies multiples */}
          {copies > 1 && (
            <div className="absolute top-2 right-2 px-2 py-1 text-sm text-white rounded-full bg-black/70">
              {copies}x
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
