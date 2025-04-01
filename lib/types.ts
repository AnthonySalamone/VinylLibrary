export interface Vinyl {
  id: string | number;
  title: string;
  artist: string;
  year: number;
  cover: string;
  genres: string[];
  styles: string[];
  copies?: number;
  raw?: {
    basic_information: {
      formats?: Array<{
        name: string;
        qty: number;
        descriptions?: string[];
      }>;
      resource_url?: string;
    };
  };
}

export interface ColorThief {
  getColor(img: HTMLImageElement): [number, number, number];
  getPalette(
    img: HTMLImageElement,
    colorCount?: number
  ): [number, number, number][];
}
