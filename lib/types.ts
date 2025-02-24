export interface Vinyl {
  id: number;
  title: string;
  artist: string;
  year: number;
  cover: string;
  genres: string[];
  styles: string[];
  copies?: number;
}