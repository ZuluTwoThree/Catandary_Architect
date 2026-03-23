import { useCallback, useEffect, useRef } from 'react';
import { LinkType, LINK_TYPE_LABELS } from '../model/enums';

interface LinkTypeDialogProps {
  x: number;
  y: number;
  onSelect: (linkType: LinkType) => void;
  onCancel: () => void;
}

const LINK_TYPES: LinkType[] = [
  LinkType.Agent,
  LinkType.Instrument,
  LinkType.Effect,
  LinkType.Consumption,
  LinkType.Result,
  LinkType.Condition,
  LinkType.Event,
  LinkType.Invocation,
  LinkType.Exception,
  LinkType.InstrumentEvent,
];

export function LinkTypeDialog({ x, y, onSelect, onCancel }: LinkTypeDialogProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as HTMLElement)) {
        onCancel();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onCancel]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onCancel]);

  const handleSelect = useCallback(
    (lt: LinkType) => {
      onSelect(lt);
    },
    [onSelect],
  );

  return (
    <div ref={ref} className="link-type-dialog" style={{ left: x, top: y }}>
      <div className="link-type-dialog-title">Link Type</div>
      {LINK_TYPES.map((lt) => (
        <button
          key={lt}
          className="link-type-dialog-item"
          onClick={() => handleSelect(lt)}
        >
          {LINK_TYPE_LABELS[lt]}
        </button>
      ))}
    </div>
  );
}
