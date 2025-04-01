import _ from "lodash";
import { Vinyl } from "./types";

interface DiscogsFormat {
  name: string;
  qty: number;
  descriptions?: string[];
}

interface DiscogsRelease {
  basic_information: {
    id: number;
    title: string;
    artists: Array<{ name: string }>;
    year: number;
    cover_image: string;
    formats: DiscogsFormat[];
    genres: string[];
    styles: string[];
  };
}

const DISCOGS_TOKEN = process.env.NEXT_PUBLIC_DISCOGS_TOKEN;
const USERNAME = process.env.NEXT_PUBLIC_DISCOGS_USERNAME;

// Stockage des données en cache côté client
let cachedCollection: Vinyl[] | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes en millisecondes

export async function getMyCollection() {
  try {
    const now = Date.now();

    // Vérifier si on a des données en cache valides
    if (cachedCollection && now - lastFetchTime < CACHE_DURATION) {
      return cachedCollection;
    }

    if (!DISCOGS_TOKEN || !USERNAME) {
      throw new Error("Missing Discogs credentials");
    }

    let page = 1;
    let allReleases: DiscogsRelease[] = [];
    let hasMorePages = true;

    while (hasMorePages) {
      const response = await fetch(
        `https://api.discogs.com/users/${USERNAME}/collection/folders/0/releases?page=${page}&per_page=100`,
        {
          headers: {
            Authorization: `Discogs token=${DISCOGS_TOKEN}`,
            "User-Agent": "VinylLibrary/1.0",
          },
          // Éviter les problèmes de cache
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Log de la pagination
      console.log("Pagination info:", data.pagination);

      // Log du premier release complet de la page
      console.log(
        "Complete first release data of page " + page + ":",
        data.releases[0]
      );

      // Log de la structure basic_information du premier release
      console.log(
        "Basic information structure:",
        data.releases[0].basic_information
      );

      // Log des formats disponibles
      console.log(
        "Available formats:",
        data.releases[0].basic_information.formats
      );

      // Log des genres et styles
      console.log("Genres:", data.releases[0].basic_information.genres);
      console.log("Styles:", data.releases[0].basic_information.styles);

      allReleases = [...allReleases, ...data.releases];

      hasMorePages = data.pagination.page < data.pagination.pages;
      page++;
    }

    // Regrouper les albums par leur ID de release (pas l'instance_id)
    const uniqueReleases = _.uniqBy(allReleases, "basic_information.id");

    const formattedReleases = uniqueReleases.map((release: DiscogsRelease) => {
      const formatted = {
        id: release.basic_information.id,
        title: release.basic_information.title,
        artist: release.basic_information.artists[0].name,
        year: release.basic_information.year,
        cover: release.basic_information.cover_image,
        formats: release.basic_information.formats,
        genres: release.basic_information.genres || [],
        styles: release.basic_information.styles || [],
        copies: allReleases.filter(
          (r) => r.basic_information.id === release.basic_information.id
        ).length,
        // Ajout de toutes les données brutes pour inspection
        raw: release,
      };

      // Log de chaque release formaté
      console.log("Formatted release:", formatted);

      return formatted;
    });

    // Mettre à jour le cache et l'horodatage
    cachedCollection = _.shuffle(formattedReleases);
    lastFetchTime = now;

    return cachedCollection;
  } catch (error) {
    console.error("Error fetching collection:", error);
    // Retourner les données en cache même si elles sont expirées, en cas d'erreur
    return cachedCollection || [];
  }
}

export async function getFolders() {
  try {
    if (!DISCOGS_TOKEN || !USERNAME) {
      throw new Error("Missing Discogs credentials");
    }

    const response = await fetch(
      `https://api.discogs.com/users/${USERNAME}/collection/folders`,
      {
        headers: {
          Authorization: `Discogs token=${DISCOGS_TOKEN}`,
          "User-Agent": "VinylLibrary/1.0",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Folders:", data);
    return data.folders;
  } catch (error) {
    console.error("Error fetching folders:", error);
    return [];
  }
}
