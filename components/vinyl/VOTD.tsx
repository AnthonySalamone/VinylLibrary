'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Vinyl } from '../../lib/types'

interface VOTDProps {
  allVinyls: Vinyl[]
}

export default function VOTD({ allVinyls }: VOTDProps) {
  const [vinylOfTheDay, setVinylOfTheDay] = useState<Vinyl | null>(null)

  useEffect(() => {
    const getVinylOfTheDay = () => {
      if (allVinyls.length === 0) return null

      // Obtenir la date actuelle
      const today = new Date()
      const dateKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`
      
      // Vérifier si un vinyle est déjà stocké pour aujourd'hui
      const storedVinyl = localStorage.getItem('vinylOfTheDay')
      const storedDate = localStorage.getItem('vinylOfTheDayDate')

      // Si nous avons un vinyle stocké pour aujourd'hui, l'utiliser
      if (storedVinyl && storedDate === dateKey) {
        return JSON.parse(storedVinyl)
      }

      // Sinon, en sélectionner un nouveau
      const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000)
      const year = today.getFullYear()
      const stableSeed = (year * 1000 + dayOfYear)
      const index = stableSeed % allVinyls.length
      const newVinyl = allVinyls[index]

      // Stocker le nouveau vinyle et la date
      localStorage.setItem('vinylOfTheDay', JSON.stringify(newVinyl))
      localStorage.setItem('vinylOfTheDayDate', dateKey)

      return newVinyl
    }

    const selectedVinyl = getVinylOfTheDay()
    setVinylOfTheDay(selectedVinyl)
  }, [allVinyls])
    
  if (!vinylOfTheDay) return null

  return (
    <div className="overflow-hidden px-4 py-10 mb-8 text-white bg-slate-200">
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
          />
        </div>

        {/* Informations de l'album */}
        <div className="flex-1">
          <h3 className="mb-2 text-2xl font-bold">
            {vinylOfTheDay.title}
          </h3>
          <p className="mb-4 text-lg">
            {vinylOfTheDay.artist}
          </p>
          <p className="mb-4">
            {vinylOfTheDay.year}
          </p>
          
          {/* Genres et Styles */}
          <div className="space-y-2">
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
    </div>
  )
}