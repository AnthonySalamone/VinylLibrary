import Image from 'next/image';

// components/vinyl/VinylCard.tsx
interface VinylProps {
  title: string;
  artist: string;
  year: number;
  cover: string;
  copies?: number;
  genres?: string[];
  styles?: string[];
}

export default function VinylCard({ title, artist, year, cover, copies = 1, genres = [], styles = [] }: VinylProps) {
  return (
    <div className="relative w-full col-span-1 group">
        <div className="relative w-full pt-[100%]">
            {cover ? (
                <Image
                    src={cover}
                    alt={`${title} by ${artist}`}
                    className="absolute top-0 left-0 w-full h-full object-cover"
                    width={1000}
                    height={1000}
                    priority={false}
                    loading="lazy"
                    quality={75}
                />
            ) : (
                <div>
                    No Cover
                </div>
            )}
        </div>
        
        <div className="absolute top-0 left-0 w-full h-full bg-black/70 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"/>

        <div className="absolute top-2 left-2 space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex flex-col gap-2">
                {/* Genres */}
                <div>
                    {genres.map((genre, index) => (
                        <span 
                        key={index}
                        className="uppercase text-white text-sm font-bold mr-1 last:mr-0"
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
                        className="bg-black/70 text-white mr-1 rounded-full text-xs last:mr-0 p-2"
                        >
                        {style}
                        </span>
                    ))}
                </div>
            </div>

            {/* Informations de l'album */}
            <div className="w-full">
                <h3 className="text-white font-bold text-lg break-words">{title}</h3>
                <p className="text-white/90 truncate">{artist}</p>
                <p className="text-white/70 text-sm">{year}</p>
            </div>
            {/* Badge pour les copies multiples */}
            {copies > 1 && (
                <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded-full text-sm">
                    {copies}x
                </div>
            )}
        </div>
        
    </div>
  )
}