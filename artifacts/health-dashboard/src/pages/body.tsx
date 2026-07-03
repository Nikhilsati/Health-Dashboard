import { useState, Component, type ReactNode } from "react";
import { BodyScene } from "@/components/body/BodyScene";
import { SystemReadingsPanel } from "@/components/body/SystemReadingsPanel";

class WebGLErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

const WebGLFallback = () => (
  <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-8"
       style={{ background: "#080d1a" }}>
    <div className="text-4xl opacity-30">⊙</div>
    <p className="text-sm font-medium text-slate-400">3D viewer requires WebGL</p>
    <p className="text-xs text-slate-600 max-w-xs">
      Your browser or environment does not support WebGL. Try opening this in Chrome or Firefox on a desktop.
    </p>
  </div>
);

export default function BodyPage() {
  const [selectedCat, setSelectedCat] = useState<string | null>(null);

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* 3D Canvas — left 55% */}
      <div className="relative flex" style={{ flex: "0 0 55%" }}>
        <WebGLErrorBoundary fallback={<WebGLFallback />}>
          <BodyScene
            selectedCat={selectedCat}
            onSelect={(cat) => setSelectedCat(prev => prev === cat ? null : cat)}
          />
        </WebGLErrorBoundary>
        {/* Subtle instruction overlay when nothing selected */}
        {!selectedCat && (
          <div className="absolute bottom-6 left-0 right-0 flex justify-center pointer-events-none">
            <div className="text-xs text-slate-400/70 bg-black/30 backdrop-blur-sm px-4 py-1.5 rounded-full">
              Rotate · Click an organ to explore
            </div>
          </div>
        )}
      </div>

      {/* Readings panel — right 45% */}
      <div
        className="flex-1 border-l overflow-hidden flex flex-col"
        style={{ background: "var(--color-card, #0f172a)", borderColor: "rgba(255,255,255,0.07)" }}
      >
        <SystemReadingsPanel categoryId={selectedCat} />
      </div>
    </div>
  );
}
