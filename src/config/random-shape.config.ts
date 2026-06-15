export const RANDOM_SHAPE_RANGES = {
  rotation: { min: 0, max: 360 },

  rect: {
    width: { min: 40, max: 150 },
    height: { min: 40, max: 150 },
    radius: { min: 0, max: 24 },
    strokeWidth: { min: 0, max: 6 },
  },

  ellipse: {
    radiusX: { min: 30, max: 100 },
    radiusY: { min: 20, max: 75 },
    strokeWidth: { min: 0, max: 5 },
  },

  line: {
    endX: { min: 40, max: 200 },
    endY: { min: 40, max: 200 },
    width: { min: 3, max: 16 },
  },

  triangle: {
    size: { min: 40, max: 120 },
    strokeWidth: { min: 0, max: 5 },
  },

  polygon: {
    vertexCount: { min: 3, max: 10 },
    radius: { min: 30, max: 90 },
    strokeWidth: { min: 0, max: 5 },
  },

  star: {
    points: { min: 5, max: 8 },
    outerRadius: { min: 35, max: 80 },
    innerRadius: { min: 15, max: 40 },
    strokeWidth: { min: 0, max: 4 },
  },

  image: {
    width: { min: 60, max: 160 },
    height: { min: 50, max: 120 },
  },
} as const

export const RECT_IMAGE_TEXTURE_STYLE = {
  strokeColor: 'rgba(255, 255, 255, 0.5)',
  strokeWidth: 2,
  baseAlpha: 0.85,
  overlaySize: { min: 0.3, max: 0.8 },
  accentColors: [
    '#6366f1', '#863bff', '#47bfff',
    '#f472b6', '#34d399', '#fbbf24',
    '#fb923c', '#a78bfa', '#2dd4bf',
  ] as readonly string[],
} as const
