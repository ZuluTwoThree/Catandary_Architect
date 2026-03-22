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

export function NodeHandles() {
  const handles: React.ReactNode[] = [];

  for (const pct of PERCENTS) {
    // Top
    handles.push(
      <Handle key={`t-${pct}-in`} type="target" position={Position.Top}
        id={`top-${pct}`} style={{ left: `${pct}%`, opacity: 0 }} />,
      <Handle key={`t-${pct}-out`} type="source" position={Position.Top}
        id={`top-${pct}-out`} style={{ left: `${pct}%`, opacity: 0 }} />,
    );
    // Bottom
    handles.push(
      <Handle key={`b-${pct}-in`} type="target" position={Position.Bottom}
        id={`bottom-${pct}`} style={{ left: `${pct}%`, opacity: 0 }} />,
      <Handle key={`b-${pct}-out`} type="source" position={Position.Bottom}
        id={`bottom-${pct}-out`} style={{ left: `${pct}%`, opacity: 0 }} />,
    );
    // Left
    handles.push(
      <Handle key={`l-${pct}-in`} type="target" position={Position.Left}
        id={`left-${pct}`} style={{ top: `${pct}%`, opacity: 0 }} />,
      <Handle key={`l-${pct}-out`} type="source" position={Position.Left}
        id={`left-${pct}-out`} style={{ top: `${pct}%`, opacity: 0 }} />,
    );
    // Right
    handles.push(
      <Handle key={`r-${pct}-in`} type="target" position={Position.Right}
        id={`right-${pct}`} style={{ top: `${pct}%`, opacity: 0 }} />,
      <Handle key={`r-${pct}-out`} type="source" position={Position.Right}
        id={`right-${pct}-out`} style={{ top: `${pct}%`, opacity: 0 }} />,
    );
  }

  return <>{handles}</>;
}
