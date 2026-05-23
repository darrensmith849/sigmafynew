/**
 * plotly.js-dist-min ships JS only — no @types and no built-in declarations.
 * We import it lazily for the chart renderer and only use the three
 * top-level functions newPlot / purge / react, so a minimal ambient
 * declaration is enough.
 */
declare module "plotly.js-dist-min" {
  type PlotData = Record<string, unknown>;
  type Layout = Record<string, unknown>;
  type Config = Record<string, unknown>;
  type PlotlyHTMLElement = HTMLDivElement;

  export function newPlot(
    root: PlotlyHTMLElement,
    data: PlotData[],
    layout?: Layout,
    config?: Config,
  ): Promise<PlotlyHTMLElement>;

  export function purge(root: PlotlyHTMLElement): void;

  export function react(
    root: PlotlyHTMLElement,
    data: PlotData[],
    layout?: Layout,
    config?: Config,
  ): Promise<PlotlyHTMLElement>;

  const Plotly: {
    newPlot: typeof newPlot;
    purge: typeof purge;
    react: typeof react;
  };
  export default Plotly;
}
