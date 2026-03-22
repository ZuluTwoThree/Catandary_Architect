import { memo } from 'react';
import {
  BaseEdge,
  getStraightPath,
  type EdgeProps,
  type Edge,
} from '@xyflow/react';
import { RelationType } from '../../model/enums';

export type OpmRelationEdgeData = {
  relationType: RelationType;
  label?: string;
  forwardMeaning?: string;
  backwardMeaning?: string;
  [key: string]: unknown;
};

export type OpmRelationEdgeType = Edge<OpmRelationEdgeData, 'opmRelation'>;

function getRelationMarker(relationType: RelationType): string {
  switch (relationType) {
    case RelationType.Aggregation:
      return 'url(#triangleAgg)';
    case RelationType.Exhibition:
      return 'url(#triangleExh)';
    case RelationType.Generalization:
      return 'url(#triangleGen)';
    case RelationType.Instantiation:
      return 'url(#triangleInst)';
    case RelationType.UniDirectional:
      return 'url(#arrowOpen)';
    case RelationType.BiDirectional:
      return 'url(#arrowOpen)';
    default:
      return 'url(#triangleExh)';
  }
}

function getRelationStroke(relationType: RelationType): { dasharray?: string } {
  switch (relationType) {
    case RelationType.Instantiation:
      return { dasharray: '4 3' };
    default:
      return {};
  }
}

export const OpmRelationEdge = memo(
  ({
    sourceX,
    sourceY,
    targetX,
    targetY,
    data,
    style,
  }: EdgeProps<OpmRelationEdgeType>) => {
    const relationType = data?.relationType ?? RelationType.Exhibition;
    const strokeStyle = getRelationStroke(relationType);

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
          markerEnd={getRelationMarker(relationType)}
          style={{
            ...style,
            stroke: '#000000',
            strokeWidth: 1.5,
            strokeDasharray: strokeStyle.dasharray,
          }}
        />
        {data?.forwardMeaning && (
          <text
            x={labelX}
            y={labelY - 8}
            textAnchor="middle"
            fontSize={10}
            fill="#333"
          >
            {data.forwardMeaning}
          </text>
        )}
        {data?.backwardMeaning && (
          <text
            x={labelX}
            y={labelY + 14}
            textAnchor="middle"
            fontSize={10}
            fill="#666"
          >
            {data.backwardMeaning}
          </text>
        )}
      </>
    );
  },
);

OpmRelationEdge.displayName = 'OpmRelationEdge';
