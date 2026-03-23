import React from 'react';
import { Handle, Position } from '@xyflow/react';

/**
 * Renders distributed connection handles on all four sides of a node.
 *
 * Each side gets 5 handle positions (10%, 30%, 50%, 70%, 90%) for both
 * source and target connections. This allows edges to connect at different
 * points along each side, matching the OPX connectionParameter data.
 *
 * Handle ID format:
 *   Target (incoming): "{side}-{percent}"      e.g. "top-50", "right-30"
 *   Source (outgoing):  "{side}-{percent}-out"  e.g. "top-50-out", "left-70-out"
 */

const PERCENTS = [10, 30, 50, 70, 90];

const handleStyle: React.CSSProperties = {
  width: 8,
  height: 8,
  background: '#0f3460',
  border: '1px solid #fff',
  opacity: 0,
  transition: 'opacity 0.15s',
};

export function NodeHandles() {
  const handles: React.ReactNode[] = [];

  for (const pct of PERCENTS) {
    // Top
    handles.push(
      <Handle key={`t-${pct}-in`} type="target" position={Position.Top}
        id={`top-${pct}`} className="opm-handle" style={{ ...handleStyle, left: `${pct}%` }} />,
      <Handle key={`t-${pct}-out`} type="source" position={Position.Top}
        id={`top-${pct}-out`} className="opm-handle" style={{ ...handleStyle, left: `${pct}%` }} />,
    );
    // Bottom
    handles.push(
      <Handle key={`b-${pct}-in`} type="target" position={Position.Bottom}
        id={`bottom-${pct}`} className="opm-handle" style={{ ...handleStyle, left: `${pct}%` }} />,
      <Handle key={`b-${pct}-out`} type="source" position={Position.Bottom}
        id={`bottom-${pct}-out`} className="opm-handle" style={{ ...handleStyle, left: `${pct}%` }} />,
    );
    // Left
    handles.push(
      <Handle key={`l-${pct}-in`} type="target" position={Position.Left}
        id={`left-${pct}`} className="opm-handle" style={{ ...handleStyle, top: `${pct}%` }} />,
      <Handle key={`l-${pct}-out`} type="source" position={Position.Left}
        id={`left-${pct}-out`} className="opm-handle" style={{ ...handleStyle, top: `${pct}%` }} />,
    );
    // Right
    handles.push(
      <Handle key={`r-${pct}-in`} type="target" position={Position.Right}
        id={`right-${pct}`} className="opm-handle" style={{ ...handleStyle, top: `${pct}%` }} />,
      <Handle key={`r-${pct}-out`} type="source" position={Position.Right}
        id={`right-${pct}-out`} className="opm-handle" style={{ ...handleStyle, top: `${pct}%` }} />,
    );
  }

  return <>{handles}</>;
}
