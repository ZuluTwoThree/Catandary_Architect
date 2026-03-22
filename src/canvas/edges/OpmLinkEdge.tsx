import { memo } from 'react';
import {
  BaseEdge,
  getStraightPath,
  type EdgeProps,
  type Edge,
} from '@xyflow/react';
import { LinkType } from '../../model/enums';

export type OpmLinkEdgeData = {
  linkType: LinkType;
  condition?: string;
  [key: string]: unknown;
};

export type OpmLinkEdgeType = Edge<OpmLinkEdgeData, 'opmLink'>;

const LINK_STYLES: Record<LinkType, { stroke: string; dasharray?: string }> = {
  [LinkType.Consumption]: { stroke: '#000000' },
  [LinkType.Effect]: { stroke: '#000000' },
  [LinkType.Instrument]: { stroke: '#000000' },
  [LinkType.Condition]: { stroke: '#000000' },
  [LinkType.Agent]: { stroke: '#000000' },
  [LinkType.Result]: { stroke: '#000000' },
  [LinkType.Invocation]: { stroke: '#000000', dasharray: '5 3' },
  [LinkType.Event]: { stroke: '#000000' },
  [LinkType.Exception]: { stroke: '#cc0000' },
  [LinkType.InstrumentEvent]: { stroke: '#000000' },
};

/**
 * OPM Link marker conventions (ISO 19450 / OPCat2):
 *
 * markerEnd = at the destination (target) end of the edge
 * markerStart = at the source end of the edge
 *
 * Consumption:  filled arrow ▶ at process (object consumed)
 * Result:       filled arrow ▶ at object (object created)
 * Effect:       open arrow ▷ at both ends (state change)
 * Instrument:   open circle ○ at process end (object enables, unchanged)
 * Agent:        filled circle ● at process end (active enabler)
 * Condition:    open arrow ▷ at process end
 * Invocation:   dashed line + filled arrow ▶
 * Event:        filled circle ● at process end
 * Exception:    red filled arrow at process end
 * InstrumentEvent: filled circle ● at process end
 */
function getMarkerEnd(linkType: LinkType): string {
  switch (linkType) {
    case LinkType.Consumption:
      return 'url(#arrowFilled)';
    case LinkType.Result:
      return 'url(#arrowFilled)';
    case LinkType.Effect:
      return 'url(#arrowOpen)';
    case LinkType.Instrument:
      return 'url(#circleOpen)';
    case LinkType.Agent:
      return 'url(#circleFilled)';
    case LinkType.Condition:
      return 'url(#arrowOpen)';
    case LinkType.Invocation:
      return 'url(#arrowFilled)';
    case LinkType.Event:
      return 'url(#circleFilled)';
    case LinkType.Exception:
      return 'url(#arrowExc)';
    case LinkType.InstrumentEvent:
      return 'url(#circleFilled)';
    default:
      return 'url(#arrowOpen)';
  }
}

function getMarkerStart(linkType: LinkType): string | undefined {
  switch (linkType) {
    case LinkType.Effect:
      // Effect links have open arrowheads at both ends
      return 'url(#arrowOpen)';
    default:
      return undefined;
  }
}

export const OpmLinkEdge = memo(
  ({
    sourceX,
    sourceY,
    targetX,
    targetY,
    data,
    style,
  }: EdgeProps<OpmLinkEdgeType>) => {
    const linkType = data?.linkType ?? LinkType.Effect;
    const linkStyle = LINK_STYLES[linkType];
    const markerStart = getMarkerStart(linkType);

    const [edgePath, labelX, labelY] = getStraightPath({
      sourceX,
      sourceY,
      targetX,
      targetY,
    });

    return (
      <>
        <BaseEdge
          path={edgePath}
          markerEnd={getMarkerEnd(linkType)}
          markerStart={markerStart}
          style={{
            ...style,
            stroke: linkStyle.stroke,
            strokeWidth: 1.5,
            strokeDasharray: linkStyle.dasharray,
          }}
        />
        {data?.condition && (
          <text
            x={labelX}
            y={labelY - 6}
            textAnchor="middle"
            fontSize={10}
            fill="#333"
            fontStyle="italic"
          >
            {data.condition}
          </text>
        )}
      </>
    );
  },
);

OpmLinkEdge.displayName = 'OpmLinkEdge';
