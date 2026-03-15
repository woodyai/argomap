export interface CityData {
  id: string;
  name: string;
  nameZh: string;
  country: string;
  countryZh: string;
  lat: number;
  lng: number;
  markerColor: string;
  visitDate: string;
  diary: {
    en: string;
    zh: string;
  };
  mood: string[];
  topPicks: Array<{ name: string; icon: string }>;
  photos: Array<{ color: string; label: string }>;
}
