/**
 * SVG marker definitions for OPM link arrowheads and relation symbols.
 * Rendered once inside the React Flow SVG layer.
 */
export function SvgDefs() {
  return (
    <svg style={{ position: 'absolute', width: 0, height: 0 }}>
      <defs>
        {/* Filled arrowhead (Consumption, Result, Invocation) */}
        <marker
          id="arrowFilled"
          viewBox="0 0 10 10"
          refX="10"
          refY="5"
          markerWidth={8}
          markerHeight={8}
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 Z" fill="#000" />
        </marker>

        {/* Open arrowhead (Effect, Instrument, Condition) */}
        <marker
          id="arrowOpen"
          viewBox="0 0 10 10"
          refX="10"
          refY="5"
          markerWidth={8}
          markerHeight={8}
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10" fill="none" stroke="#000" strokeWidth={1.5} />
        </marker>

        {/* Double filled arrowhead (Agent, Event, InstrumentEvent) */}
        <marker
          id="arrowFilledDouble"
          viewBox="0 0 14 10"
          refX="14"
          refY="5"
          markerWidth={10}
          markerHeight={8}
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 7 5 L 0 10 Z" fill="#000" />
          <path d="M 4 0 L 14 5 L 4 10 Z" fill="#000" />
        </marker>

        {/* Exception arrowhead (lightning bolt style) */}
        <marker
          id="arrowExc"
          viewBox="0 0 12 10"
          refX="12"
          refY="5"
          markerWidth={10}
          markerHeight={8}
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 12 5 L 0 10 Z" fill="#cc0000" />
        </marker>

        {/* Aggregation triangle (filled black) */}
        <marker
          id="triangleAgg"
          viewBox="0 0 12 12"
          refX="6"
          refY="12"
          markerWidth={10}
          markerHeight={10}
          orient="auto-start-reverse"
        >
          <path d="M 0 12 L 6 0 L 12 12 Z" fill="#000" />
        </marker>

        {/* Exhibition triangle (filled black, inverted) */}
        <marker
          id="triangleExh"
          viewBox="0 0 12 12"
          refX="6"
          refY="0"
          markerWidth={10}
          markerHeight={10}
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 6 12 L 12 0 Z" fill="#000" />
        </marker>

        {/* Generalization triangle (open) */}
        <marker
          id="triangleGen"
          viewBox="0 0 12 12"
          refX="6"
          refY="12"
          markerWidth={10}
          markerHeight={10}
          orient="auto-start-reverse"
        >
          <path d="M 0 12 L 6 0 L 12 12 Z" fill="#fff" stroke="#000" strokeWidth={1.5} />
        </marker>

        {/* Instantiation triangle (open, dashed context) */}
        <marker
          id="triangleInst"
          viewBox="0 0 12 12"
          refX="6"
          refY="12"
          markerWidth={10}
          markerHeight={10}
          orient="auto-start-reverse"
        >
          <path d="M 0 12 L 6 0 L 12 12 Z" fill="#fff" stroke="#000" strokeWidth={1.5} />
        </marker>
      </defs>
    </svg>
  );
}
