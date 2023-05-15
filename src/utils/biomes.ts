export function selectBiome(elevation: number) {
    if (elevation < 0.2) {
        return {
            biome: 'water',
            maxElevation: 0.2,
            color: {
                r: 20,
                g: 92,
                b: 158,
                alpha: 1 - elevation * 3,
            },
        }
    } else if (elevation < 0.25) {
        return {
            biome: 'sand',
            maxElevation: 0.25,
            color: {
                r: 255,
                g: 255,
                b: 0,
                alpha: 1 - elevation * 3,
            },
        }
    } else if (elevation < 0.7) {
        return {
            biome: 'grass',
            maxElevation: 0.7,
            color: {
                r: 41,
                g: 112,
                b: 69,
                alpha: (elevation * 2 + 1) / 2,
            },
        }
    } else {
        return {
            biome: 'mountain',
            maxElevation: 1,
            color: {
                r: 108,
                g: 88,
                b: 76,
                alpha: elevation,
            },
        }
    }
}
