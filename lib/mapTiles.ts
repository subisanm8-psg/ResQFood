export interface MapTileSource {
  name: string;
  url: string;
  attribution: string;
  maxZoom: number;
}

export const OSM_TILE_CONFIG: MapTileSource = {
  name: 'OpenStreetMap standard',
  url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution: '© OpenStreetMap contributors',
  maxZoom: 19,
};

export default OSM_TILE_CONFIG;
