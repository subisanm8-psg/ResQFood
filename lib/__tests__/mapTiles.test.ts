import { describe, it, expect } from 'vitest';
import { MAP_TILE_SOURCES } from '../mapTiles';

describe('mapTiles configuration', () => {
  it('exports tile sources in the required order with no API keys', () => {
    expect(MAP_TILE_SOURCES).toHaveLength(3);

    // 1. CARTO Voyager, no key
    expect(MAP_TILE_SOURCES[0].name).toBe('CARTO Voyager');
    expect(MAP_TILE_SOURCES[0].url).toContain('basemaps.cartocdn.com/rastertiles/voyager');
    expect(MAP_TILE_SOURCES[0].url).not.toContain('api_key');
    expect(MAP_TILE_SOURCES[0].attribution).toBeTruthy();

    // 2. CARTO Positron, no key
    expect(MAP_TILE_SOURCES[1].name).toBe('CARTO Positron');
    expect(MAP_TILE_SOURCES[1].url).toContain('basemaps.cartocdn.com/light_all');
    expect(MAP_TILE_SOURCES[1].url).not.toContain('api_key');
    expect(MAP_TILE_SOURCES[1].attribution).toBeTruthy();

    // 3. OpenStreetMap standard
    expect(MAP_TILE_SOURCES[2].name).toBe('OpenStreetMap standard');
    expect(MAP_TILE_SOURCES[2].url).toBe('https://tile.openstreetmap.org/{z}/{x}/{y}.png');
    expect(MAP_TILE_SOURCES[2].isOsm).toBe(true);
    expect(MAP_TILE_SOURCES[2].attribution).toContain('OpenStreetMap');
  });

  it('contains no URLs pointing to carto.com/basemaps or pages requiring API keys', () => {
    MAP_TILE_SOURCES.forEach((source) => {
      expect(source.url).not.toContain('carto.com/basemaps');
      expect(source.attribution).not.toContain('carto.com/basemaps');
    });
  });
});
