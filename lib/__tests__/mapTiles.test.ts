import { describe, it, expect } from 'vitest';
import { OSM_TILE_CONFIG } from '../mapTiles';

describe('mapTiles configuration', () => {
  it('uses OpenStreetMap standard source with exact attribution and maxZoom 19', () => {
    expect(OSM_TILE_CONFIG.url).toBe('https://tile.openstreetmap.org/{z}/{x}/{y}.png');
    expect(OSM_TILE_CONFIG.attribution).toBe('© OpenStreetMap contributors');
    expect(OSM_TILE_CONFIG.maxZoom).toBe(19);
  });

  it('contains no cartocdn, carto.com, voyager, or positron references and no API keys', () => {
    const combined = `${OSM_TILE_CONFIG.url} ${OSM_TILE_CONFIG.attribution} ${OSM_TILE_CONFIG.name}`.toLowerCase();
    expect(combined).not.toContain('cartocdn');
    expect(combined).not.toContain('carto.com');
    expect(combined).not.toContain('voyager');
    expect(combined).not.toContain('positron');
    expect(combined).not.toContain('api_key');
  });
});
