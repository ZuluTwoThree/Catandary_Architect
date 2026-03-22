/**
 * SVG marker definitions for OPM link arrowheads and relation symbols.
 * Based on ISO 19450 visual conventions as implemented in OPCat2.
 *
 * Procedural Links:
 *   Consumption/Result: filled arrowhead ▶
 *   Effect: open arrowhead at both ends ◁—▷
 *   Instrument: open circle ○ at process end
 *   Agent: filled circle ● at process end
 *   Condition: open arrowhead ▷ (with "c" label)
 *   Invocation: dashed + filled arrowhead ▶
 *   Event: filled circle ● at process end (like agent but with event semantics)
 *   Exception: red filled arrowhead
 *   InstrumentEvent: filled circle ● at process end
 *
 * Structural Relations:
 *   Aggregation: filled triangle ▲ (at source)
 *   Exhibition: filled triangle ▼ (inverted, at source)
 *   Generalization: open triangle △ (at source)
 *   Instantiation: open triangle △ (dashed line)
 */
export function SvgDefs() {
  return (
    <svg style={{ position: 'absolute', width: 0, height: 0 }}>
      <defs>
        {/* ─── Procedural Link Markers ─────────────────────────────── */}

        {/* Filled arrowhead ▶ (Consumption, Result, Invocation) */}
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

        {/* Open arrowhead ▷ (Effect, Condition) */}
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

        {/* Filled circle ● (Agent, Event, InstrumentEvent) */}
        <marker
          id="circleFilled"
          viewBox="0 0 10 10"
          refX="5"
          refY="5"
          markerWidth={8}
          markerHeight={8}
          orient="auto-start-reverse"
        >
          <circle cx="5" cy="5" r="4" fill="#000" />
        </marker>

        {/* Open circle ○ (Instrument) */}
        <marker
          id="circleOpen"
          viewBox="0 0 10 10"
          refX="5"
          refY="5"
          markerWidth={8}
          markerHeight={8}
          orient="auto-start-reverse"
        >
          <circle cx="5" cy="5" r="3.5" fill="#fff" stroke="#000" strokeWidth={1.5} />
        </marker>

        {/* Exception arrowhead (red filled) */}
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

        {/* ─── Structural Relation Markers ──────────────────────────── */}

        {/* Aggregation triangle ▲ (filled black, at source) */}
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

        {/* Exhibition triangle ▼ (filled black, inverted, at source) */}
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

        {/* Generalization triangle △ (open, at source) */}
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

        {/* Instantiation triangle △ (open, dashed line context) */}
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
