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
  weatherTheme: {
    en: string;
    zh: string;
  };
  diary: {
    en: string;
    zh: string;
  };
  mood: string[];
  topPicks: Array<{ name: string; icon: string }>;
  photos: Array<{ color: string; label: string }>;
  places: Array<{
    name: string;
    nameZh: string;
    lat: number;
    lng: number;
    category: string;
    icon: string;
    blurb: {
      en: string;
      zh: string;
    };
  }>;
}
