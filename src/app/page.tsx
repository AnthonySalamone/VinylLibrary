"use client";
import React, { useState, useEffect, useRef } from "react";
import VinylCard from "../../components/vinyl/VinylCard";
import SortFilter from "../../components/vinyl/SortFilter";
import VOTD from "../../components/vinyl/VOTD";
import { getMyCollection } from "../../lib/api";
import { Vinyl } from "../../lib/types";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

// AnimatedTitle Component
const AnimatedTitle = ({
  children,
  className = "",
  isLightBackground,
  vinylCount = 0,
}: {
  children: React.ReactNode;
  className?: string;
  isLightBackground: boolean;
  vinylCount?: number;
}) => {
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (titleRef.current) {
      // Create a ScrollTrigger timeline
      gsap.to(".title-animation-trigger", {
        scrollTrigger: {
          trigger: ".title-animation-trigger",
          start: "top 20%",
          markers: true,
          scrub: true,
        },
        scale: 0,
      });
    }
  }, []);

  return (
    <div className="overflow-hidden title-animation-trigger">
      <h1
        ref={titleRef}
        className={`text-[clamp(4rem,10vw,9rem)] font-bold uppercase text-center leading-none ${
          isLightBackground ? "text-black" : "text-white"
        } ${className}`}
      >
        {children}
      </h1>
      <div
        className={`mt-2 text-2xl text-center ${
          isLightBackground ? "text-black" : "text-white"
        }`}
      >
        {vinylCount} records imported from{" "}
        <a href="https://discogs.com" className="underline">
          Discogs
        </a>
      </div>
    </div>
  );
};

// Main Home Page Component
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
      try {
        const data = await getMyCollection();
        setAllVinyls(data);
        setDisplayedVinyls(data);

        // Extract unique genres
        const uniqueGenres = Array.from(
          new Set(data.flatMap((vinyl) => vinyl.genres))
        );
        setGenres(uniqueGenres);
      } catch (error) {
        console.error("Error loading collection:", error);
        // Handle error, perhaps by displaying a message to the user
      }
    };

    fetchData();
  }, []);

  // Update available styles when genre changes
  const updateAvailableStyles = (genre: string) => {
    if (!genre) {
      // If no genre is selected, show all styles
      const allStyles = Array.from(
        new Set(allVinyls.flatMap((vinyl) => vinyl.styles))
      );
      setAvailableStyles(allStyles);
    } else {
      // Filter styles based on selected genre
      const vinylsWithGenre = allVinyls.filter((vinyl) =>
        vinyl.genres.includes(genre)
      );
      const stylesForGenre = Array.from(
        new Set(vinylsWithGenre.flatMap((vinyl) => vinyl.styles))
      );
      setAvailableStyles(stylesForGenre);
    }
  };

  // Function to receive dominant color from VOTD
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
        // Maintain genre filter if present
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
      <div className="mx-auto">
        <div className="px-4 mb-8 h-[90vh] flex flex-col justify-center items-center">
          <AnimatedTitle
            isLightBackground={isLightBackground}
            vinylCount={displayedVinyls.length}
          >
            Analog
            <br />
            Artifacts
          </AnimatedTitle>
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
