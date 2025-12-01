export interface PlaceData {
  id: string;
  name: string;
  address: string;
  rating: string;
  reviews: string;
  website: string;
  phone: string;
  googleMapsUrl?: string;
}

export interface ScrapeStatus {
  loading: boolean;
  error: string | null;
  complete: boolean;
}

export interface SearchParams {
  query: string;
}