import { createNoise2D } from 'simplex-noise';
import alea from 'alea';
import { selectBiome } from './biomes';

type Hex = {
  coordinates: [number, number];
  elevation: number;
};

type Options = {
  useFBM: boolean;
  useDomainWarping: boolean;
  warpIntensity: number;
  warpScale: number;
};

export function generate(
  noiseScale: number,
  octaves: number,
  persistence: number,
  lacunarity: number,
  amplitude: number,
  frequency: number,
  mapHeight: number,
  mapWidth: number,
  offsetX: number,
  offsetY: number,
  seed: string,
  canvas: HTMLCanvasElement,
  options: Options
) {
  console.log('Seed:', seed);
  const pnrg = alea(seed);
  const noise2D = createNoise2D(pnrg);
  const ctx = canvas.getContext('2d');
  const tileSize = 4;
  canvas.width = mapWidth * tileSize;
  canvas.height = mapHeight * tileSize;

  let grid: Hex[] = [];

  for (let x = 0; x < mapWidth; x++) {
    for (let y = 0; y < mapHeight; y++) {
      let noiseValue = 0;
      let f = frequency;
      let a = amplitude;

      for (let i = 0; i < octaves; i++) {
        let xCoord = ((x + offsetX) * f) / noiseScale;
        let yCoord = ((y + offsetY) * f) / noiseScale;

        if (options.useDomainWarping) {
          const warp = options.warpIntensity * noise2D(xCoord / options.warpScale, yCoord / options.warpScale);
          xCoord += warp;
          yCoord += warp;
        }

        let octaveValue = noise2D(xCoord, yCoord);

        if (options.useFBM) {
          octaveValue *= a;
        }

        noiseValue += octaveValue;
        f *= lacunarity;
        a *= persistence;
      }

      noiseValue = (noiseValue + 1) / 2;

      grid.push({
        coordinates: [x, y],
        elevation: noiseValue,
      });

      const rectX = x * tileSize;
      const rectY = y * tileSize;

    //   ctx!.fillStyle = `rgba(${255 * noiseValue}, ${255 * noiseValue}, ${255 * noiseValue}, 1)`;
    //   ctx!.fillRect(rectX, rectY, tileSize, tileSize);

    const biome = selectBiome(noiseValue)
            const { r, g, b, alpha } = biome.color
            ctx!.fillStyle = `rgba(${r}, ${g}, ${b},  ${alpha})`
            ctx!.fillRect(rectX, rectY, tileSize, tileSize)
    }
  }
}


