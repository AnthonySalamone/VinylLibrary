'use client'

interface SortFilterProps {
  onSortChange: (sortBy: string) => void;
  onFilterChange: (filterType: string, value: string) => void;
  genres: string[];
  styles: string[];
  selectedGenre: string;
}

export default function SortFilter({ 
  onSortChange, 
  onFilterChange, 
  genres, 
  styles 
}: SortFilterProps) {
  return (
    <div className="flex gap-4 mb-6">
      {/* Tri */}
      <select 
        onChange={(e) => onSortChange(e.target.value)}
        className="px-4 py-2 text-white bg-gray-800 rounded-lg"
        defaultValue=""
      >
        <option value="">Trier par...</option>
        <option value="title">Titre A-Z</option>
        <option value="title-desc">Titre Z-A</option>
        <option value="artist">Artiste A-Z</option>
        <option value="artist-desc">Artiste Z-A</option>
        <option value="year">Année ↑</option>
        <option value="year-desc">Année ↓</option>
      </select>

      {/* Filtre par genre */}
      <select 
        onChange={(e) => onFilterChange('genre', e.target.value)}
        className="px-4 py-2 text-white bg-gray-800 rounded-lg"
        defaultValue=""
      >
        <option value="">Genre...</option>
        {genres.map(genre => (
          <option key={genre} value={genre}>{genre}</option>
        ))}
      </select>

      {/* Filtre par style */}
      <select 
        onChange={(e) => onFilterChange('style', e.target.value)}
        className="px-4 py-2 text-white bg-gray-800 rounded-lg"
        defaultValue=""
      >
        <option value="">Style...</option>
        {styles.map(style => (
          <option key={style} value={style}>{style}</option>
        ))}
      </select>
    </div>
  )
}