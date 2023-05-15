import type { Component } from 'solid-js';
import { createSignal, createEffect, on, onMount, onCleanup } from 'solid-js'
import { generate } from './utils/generate'
import alea from 'alea'

const [mapWidth, setMapWidth] = createSignal(200)
const [mapHeight, setMapHeight] = createSignal(200)
const [noiseScale, setNoiseScale] = createSignal(50)
const [octaves, setOctaves] = createSignal(4)
const [persistence, setPersistence] = createSignal(0.5)
const [lacunarity, setLacunarity] = createSignal(1.8)
const [amplitude, setAmplitude] = createSignal(1)
const [frequency, setFrequency] = createSignal(1)
const [fbm, setFbm] = createSignal(true)
const [domainWarping, setDomainWarping] = createSignal(false)
const [ridged, setRidged] = createSignal(false)
const [billowy, setBillowy] = createSignal(false)
const [multiFractal, setMultiFractal] = createSignal(false)
const [combined, setCombined] = createSignal(false)
const [turbulence, setTurbulence] = createSignal(false)
const [terraceLevels, setTerraceLevels] = createSignal(0)
const [warpIntensity, setWarpIntensity] = createSignal(0.1)
const [warpScale, setWarpScale] = createSignal(2)
const [seed, setSeed] = createSignal((alea()() * 100000000).toFixed())
const [offset, setOffset] = createSignal({ x: 0, y: 0 })
const [scrollFactor, setScrollFactor] = createSignal(5)

let animationFrameId: number | null = null
let isDragging = false
let accumulatedDeltaX = 0
let accumulatedDeltaY = 0
let startX = 0;
let startY = 0;
let prevOffsetX = 0;
let prevOffsetY = 0;

const handleMouseDown = (event: MouseEvent) => {
  isDragging = true;
  startX = event.clientX;
  startY = event.clientY;
  prevOffsetX = offset().x;
  prevOffsetY = offset().y;
  window.addEventListener('mousemove', handleMouseMove);
};

const handleMouseUp = () => {
  isDragging = false;
  window.removeEventListener('mousemove', handleMouseMove);
};

const handleMouseMove = (event: MouseEvent) => {
  if (isDragging && animationFrameId === null) {
    accumulatedDeltaX += event.movementX / scrollFactor();
    accumulatedDeltaY += event.movementY / scrollFactor();
    animationFrameId = requestAnimationFrame(updateMap);
  }
};

const updateMap = () => {
  setOffset((prevOffset) => ({
    x: prevOffset.x - accumulatedDeltaX,
    y: prevOffset.y - accumulatedDeltaY,
  }));

  accumulatedDeltaX = 0;
  accumulatedDeltaY = 0;
  animationFrameId = null;
};
const pressedKeys = new Set<string>()

const updateOffset = () => {
  let deltaX = 0
  let deltaY = 0

  if (!isDragging) {
    if (pressedKeys.has('KeyW')) {
      deltaY -= 10
    }
    if (pressedKeys.has('KeyA')) {
      deltaX -= 10
    }
    if (pressedKeys.has('KeyS')) {
      deltaY += 10
    }
    if (pressedKeys.has('KeyD')) {
      deltaX += 10
    }
  }

  if (deltaX || deltaY) {
    setOffset((prevOffset) => ({
      x: prevOffset.x + deltaX / scrollFactor(),
      y: prevOffset.y + deltaY / scrollFactor(),
    }))
  }

  if (pressedKeys.size > 0 || isDragging) {
    animationFrameId = requestAnimationFrame(updateOffset)
  } else {
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId)
      animationFrameId = null
    }
  }
} 

const handleKeyDown = (event: KeyboardEvent) => {
  if (['KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(event.code)) {
    pressedKeys.add(event.code)
    if (animationFrameId === null) {
      animationFrameId = requestAnimationFrame(updateOffset)
    }
  }
}

const handleKeyUp = (event: KeyboardEvent) => {
  if (['KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(event.code)) {
    pressedKeys.delete(event.code)
    if (pressedKeys.size === 0 && animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId)
      animationFrameId = null
    }
  }
}

onMount(() => {
  window.addEventListener('keydown', handleKeyDown)
  window.addEventListener('keyup', handleKeyUp)
})

onCleanup(() => {
  window.removeEventListener('keydown', handleKeyDown)
  window.removeEventListener('keyup', handleKeyUp)
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId)
  }
})

const App: Component = () => {
  let canvas: HTMLCanvasElement

  onMount(() => {
    generate(
      noiseScale(),
      octaves(),
      persistence(),
      lacunarity(),
      amplitude(),
      frequency(),
      mapHeight(),
      mapWidth(),
      offset().x,
      offset().y,
      seed(),
      canvas,
      {
        useFBM: fbm(),
        useRidged: ridged(),
        useBillowy: billowy(),
        useMultiFractal: multiFractal(),
        useDomainWarping: domainWarping(),
        warpIntensity: warpIntensity(),
        warpScale: warpScale(),
        combineNoise: combined(),
        useTurbulence: turbulence(),
        terraceLevels: terraceLevels(),
      }
    )
  })

  createEffect(
    on(
      [
        mapWidth,
        mapHeight,
        noiseScale,
        octaves,
        persistence,
        lacunarity,
        amplitude,
        frequency,
        offset,
        seed,
        fbm,
        domainWarping,
        warpIntensity,
        warpScale,
        ridged,
        billowy,
        multiFractal,
        combined,
        turbulence,
        terraceLevels,

      ],
      () => {
        generate(
          noiseScale(),
          octaves(),
          persistence(),
          lacunarity(),
          amplitude(),
          frequency(),
          mapHeight(),
          mapWidth(),
          offset().x,
          offset().y,
          seed(),
          canvas,
          {
            useFBM: fbm(),
            useRidged: ridged(),
            useBillowy: billowy(),
            useMultiFractal: multiFractal(),
            useDomainWarping: domainWarping(),
            warpIntensity: warpIntensity(),
            warpScale: warpScale(),
            combineNoise: combined(),
            useTurbulence: turbulence(),
            terraceLevels: terraceLevels(),
          }
        )
      },
      { defer: true }
    )
  )

  return (
    <main>
      <h1>Cartographer</h1>
      <div id="container">
        <div id="side">
          <div id="seed">
            <label for="seed">Seed</label>
            <input
              type="text"
              id="seed"
              value={seed()}
              onInput={(e) => setSeed(e.currentTarget.value)}
            ></input>
          </div>
          <div id="settings">
            <div id="mapSettings">
              <div id="mapWidth">
                <label for="mapWidth">Map Width</label>
                <input
                  type="input"
                  id="mapWidth"
                  min="100"
                  max="1000"
                  value={mapWidth()}
                  onInput={(e) => {
                    console.log('Width Changed!')
                    setMapWidth(parseFloat(e.currentTarget.value))
                  }}
                ></input>
              </div>
              <div id="mapHeight">
                <label for="mapHeight">Map Height</label>
                <input
                  type="input"
                  id="mapHeight"
                  min="100"
                  max="1000"
                  value={mapHeight()}
                  onInput={(e) =>
                    setMapHeight(parseFloat(e.currentTarget.value))
                  }
                ></input>
              </div> <div id="offsetX">
                <label for="offsetX">Offset X</label>
                <input
                  type="input"
                  id="offsetX"
                  readOnly
                  min="1"
                  max="1000"
                  value={offset().x.toFixed()}
                  onInput={(e) =>
                    setOffset({
                      x: parseFloat(e.currentTarget.value),
                      y: offset().y,
                    })
                  }
                ></input>
              </div>
              <div id="offsetY">
                <label for="offsetY">Offset Y</label>
                <input
                  type="input"
                  id="offsetY"
                  readOnly
                  min="1"
                  max="1000"
                  value={offset().y.toFixed()}
                  onInput={(e) =>
                    setOffset({
                      x: offset().x,
                      y: parseFloat(e.currentTarget.value),
                    })
                  }
                ></input>
              </div>
            </div>
            <div id="noiseSettings">
              <div id="noiseScale">
                <label for="noiseScale">Noise Scale</label><input
                  type="number"
                  id="noiseScale"
                  min="1"
                  max="1000"
                  value={noiseScale()}
                  onInput={(e) =>
                    setNoiseScale(parseFloat(e.currentTarget.value))
                  }
                ></input>
              </div>
              <div id="octaves">
                <label for="octaves">Octaves</label>
                <input
                  type="number"
                  id="octaves"
                  min="1"
                  max="10"
                  step="1"
                  value={octaves()}
                  onInput={(e) =>
                    setOctaves(parseFloat(e.currentTarget.value))
                  }
                ></input>
              </div>
              <div id="persistence">
                <label for="persistence">Persistence</label>
                <input
                  type="number"
                  id="persistence"
                  min="0"
                  max="5"
                  step="0.01"
                  value={persistence()}
                  onInput={(e) =>
                    setPersistence(parseFloat(e.currentTarget.value))
                  }
                ></input>
              </div>
              <div id="lacunarity">
                <label for="lacunarity">Lacunarity</label>
                <input
                  type="number"
                  id="lacunarity"
                  min="0"
                  max="10"
                  step="0.01"
                  value={lacunarity()}
                  onInput={(e) =>
                    setLacunarity(parseFloat(e.currentTarget.value))
                  }
                ></input>
              </div>
              <div id="amplitude">
                <label for="amplitude">Amplitude</label>
                <input
                  type="number"
                  id="amplitude"
                  min="0"
                  max="10"
                  step="0.1"
                  value={amplitude()}
                  onInput={(e) =>
                    setAmplitude(parseFloat(e.currentTarget.value))
                  }
                ></input>
              </div>
              <div id="frequency">
                <label for="frequency">Frequency</label>
                <input
                  type="number"
                  id="frequency"
                  min="0"
                  max="10"
                  step="0.01"
                  value={frequency()}
                  onInput={(e) =>
                    setFrequency(parseFloat(e.currentTarget.value))
                  }
                ></input>
              </div>
              <div id="fbm">
                <label for="fbm">FBM</label>
                <input type="checkbox" id="fbm" checked={fbm()} onInput={(e) => setFbm(e.currentTarget.checked)}></input>
              </div>
              <div id="ridged">
                <label for="ridged">Ridged</label>
                <input type="checkbox" id="ridged" checked={ridged()} onInput={(e) => setRidged(e.currentTarget.checked)}></input>
              </div>
              <div id="billowy">
                <label for="billowy">Billowy</label>
                <input type="checkbox" id="billowy" checked={billowy()} onInput={(e) => setBillowy(e.currentTarget.checked)}></input>
              </div>
              <div id="multifractal">
                <label for="multifractal">Multifractal</label>
                <input type="checkbox" id="multifractal" checked={multiFractal()} onInput={(e) => setMultiFractal(e.currentTarget.checked)}></input>
              </div>
              <div id="combined">
                <label for="combined">Combined</label>
                <input type="checkbox" id="combined" checked={combined()} onInput={(e) => setCombined(e.currentTarget.checked)}></input>
              </div>
              <div id="turbulence">
                <label for="turbulence">Turbulence</label>
                <input type="checkbox" id="turbulence" checked={turbulence()} onInput={(e) => setTurbulence(e.currentTarget.checked)}></input>
              </div>
              <div id="terraceLevels">
                <label for="terraceLevels">Terrace Levels</label>
                <input

                  type="number"
                  id="terraceLevels"
                  min="0"
                  max="10"
                  step="0.01"
                  value={terraceLevels()}
                  onInput={(e) =>
                    setTerraceLevels(parseFloat(e.currentTarget.value))
                  }
                ></input>

              </div>
              
              
              <div id="domainWarping">
                <label for="domainWarping">Domain Warping</label>
                <input type="checkbox" id="domainWarping" checked={domainWarping()} onInput={(e) => setDomainWarping(e.currentTarget.checked)}></input>
              </div>
              <div id="warpScale">
                <label for="warpScale">Warp Scale</label>
                <input
                  type="number"
                  id="warpScale"
                  min="0"
                  max="10"
                  step="0.1"
                  value={warpScale()}
                  onInput={(e) =>
                    setWarpScale(parseFloat(e.currentTarget.value))
                  }
                ></input>
              </div>
              <div id="warpIntensity">
                <label for="warpIntensity">Warp Intensity</label>
                <input

                  type="number"
                  id="warpIntensity"
                  min="0"
                  max="10"
                  step="0.1"
                  value={warpIntensity()}
                  onInput={(e) =>
                    setWarpIntensity(parseFloat(e.currentTarget.value))
                  }
                ></input>
                </div>

            </div>
          </div>
        </div>
        <div id="map">
          <canvas
            ref={(el) => (canvas = el)}
            onMouseDown={(event) => handleMouseDown(event)}
            onMouseUp={() => handleMouseUp()}
          />
        </div>
      </div>
    </main>
  );
};

export default App;