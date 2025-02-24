declare module 'colorthief' {
  export class ColorThief {
    getColor(img: HTMLImageElement): [number, number, number];
    getPalette(img: HTMLImageElement, colorCount?: number): [number, number, number][];
  }
} 