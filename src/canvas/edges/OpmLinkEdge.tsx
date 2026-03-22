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
  label?: string;
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

function getMarkerEnd(linkType: LinkType): string {
  switch (linkType) {
    case LinkType.Consumption:
      return 'url(#arrowFilled)';
    case LinkType.Result:
      return 'url(#arrowFilled)';
    case LinkType.Effect:
      return 'url(#arrowOpen)';
    case LinkType.Instrument:
      return 'url(#arrowOpen)';
    case LinkType.Agent:
      return 'url(#arrowFilledDouble)';
    case LinkType.Condition:
      return 'url(#arrowOpen)';
    case LinkType.Invocation:
      return 'url(#arrowFilled)';
    case LinkType.Event:
      return 'url(#arrowFilledDouble)';
    case LinkType.Exception:
      return 'url(#arrowExc)';
    case LinkType.InstrumentEvent:
      return 'url(#arrowFilledDouble)';
    default:
      return 'url(#arrowOpen)';
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
          style={{
            ...style,
            stroke: linkStyle.stroke,
            strokeWidth: 1.5,
            strokeDasharray: linkStyle.dasharray,
          }}
        />
        {data?.label && (
          <text
            x={labelX}
            y={labelY - 8}
            textAnchor="middle"
            fontSize={10}
            fill="#333"
          >
            {data.label}
          </text>
        )}
        {data?.condition && (
          <text
            x={labelX}
            y={labelY + 12}
            textAnchor="middle"
            fontSize={9}
            fill="#666"
            fontStyle="italic"
          >
            [{data.condition}]
          </text>
        )}
      </>
    );
  },
);

OpmLinkEdge.displayName = 'OpmLinkEdge';
