"use client";

import dynamic from "next/dynamic";
import type { CSSProperties } from "react";

type PlotTrace = Record<string, unknown>;
type PlotLayout = Record<string, unknown>;
type PlotConfig = Record<string, unknown>;
type PlotlyComponentProps = {
  data: PlotTrace[];
  layout: PlotLayout;
  config?: PlotConfig;
  style?: CSSProperties;
  useResizeHandler?: boolean;
};

const Plot = dynamic<PlotlyComponentProps>(async () => {
  const [plotlyModule, factoryModule] = await Promise.all([
    import("plotly.js-dist-min"),
    import("react-plotly.js/factory"),
  ]);
  const createPlotlyComponent = factoryModule.default;
  const Plotly = plotlyModule.default;
  return createPlotlyComponent(Plotly);
}, { ssr: false });

export type PlotlyChartProps = {
  data: PlotTrace[];
  layout: PlotLayout;
  config?: PlotConfig;
  className?: string;
};

export function PlotlyChart({ data, layout, config, className }: PlotlyChartProps) {
  return (
    <div className={className}>
      <Plot
        data={data}
        layout={layout}
        config={{
          responsive: true,
          displayModeBar: false,
          ...config,
        }}
        style={{ width: "100%", height: "100%" }}
        useResizeHandler
      />
    </div>
  );
}
