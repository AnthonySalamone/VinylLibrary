import VinylCard from '../../components/vinyl/VinylCard'
import { getMyCollection } from '../../lib/api'

export default async function Home() {
  const allVinyls = await getMyCollection()
  // const vinyls = allVinyls.slice(0, 20)

  return (
    <div className="min-h-screen bg-black"> 
      <div>
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">
            Ma Collection de Vinyles
          </h1>
          <div className="text-white text-2xl mt-2">
            Affichage de {allVinyls.length} albums
          </div>
        </div>

        {/* Grille de vinyles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
          {allVinyls.map((vinyl) => (
            <div key={vinyl.id} className="w-full aspect-square">
              <VinylCard {...vinyl} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}