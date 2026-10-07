type Renderer = (timeMs: number) => void;

const renderers = new Set<Renderer>();
let running = false;

export function addRenderer(render: Renderer): () => void {
  renderers.add(render);
  return () => {
    renderers.delete(render);
  };
}

function frame(timeMs: number): void {
  requestAnimationFrame(frame);
  for (const render of renderers) {
    render(timeMs);
  }
}

export function startRenderLoop(): void {
  if (running) {
    return;
  }
  running = true;
  requestAnimationFrame(frame);
}
