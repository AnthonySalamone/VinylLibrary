export interface Vinyl {
  id: string | number;
  title: string;
  artist: string;
  year: number;
  cover: string;
  genres: string[];
  styles: string[];
  copies?: number;
}

export interface ColorThief {
  getColor(img: HTMLImageElement): [number, number, number];
  getPalette(
    img: HTMLImageElement,
    colorCount?: number
  ): [number, number, number][];
}
