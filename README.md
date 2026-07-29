# CAN/DO

A scroll-driven Three.js soda-can showcase with a draggable lineup, a dark
studio scene, and a top-lit hero can.

**[Open the live demo](https://f.github.io/can/)**

## Built in 20–30 minutes

This demonstration was built by **GPT-5.6 Sol Ultra** in roughly **20–30
minutes**, with Fatih directing the visual and interaction changes. The process
started from a short reference video and moved through a handful of prompts:
build the Three.js scroll choreography, fix the full-height framing, add
horizontal can browsing, simplify the typography, generate recognizable label
textures, and finish with a dark spotlighted stage.

## What is in the demo

- Seven textured cans arranged as a draggable horizontal lineup.
- Scroll-driven transitions between lineup, hero, burst, and finale states.
- A warm spotlight that follows the highlighted Sprite can from above.
- Responsive camera fitting so the hero can remains fully visible.
- Mouse, trackpad, touch, button, and keyboard controls.

## Assets and texture generation

- **3D can:** [“Soda Can” by Jeremy](https://poly.pizza/m/cNjAaDY27fQ),
  downloaded from Poly Pizza and used under
  [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/).
- **Can textures:** created with OpenAI ImageGen through the Codex
  **imagegen skill** as flat, cylindrical 2:1 label textures.
- **Rendering and interaction:** Three.js and Vite.

The label images are AI-generated demonstration graphics, not official
packaging artwork. Coca-Cola, 7UP, Dr Pepper, Sprite, Fanta, Pepsi, and Mountain
Dew are trademarks of their respective owners.

## Run locally

```bash
npm install
npm run dev
```

Create a production build with:

```bash
npm run build
```

The `main` branch is automatically built and deployed to GitHub Pages through
the included GitHub Actions workflow.
