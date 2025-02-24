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