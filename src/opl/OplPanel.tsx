import { useMemo, useState, useCallback } from 'react';
import type { OpdDiagram, LogicalModel } from '../model/types';
import { generateOplForOpd } from './opl-generator';
import { getOpdEntityIds } from './opd-entities';
import type { OplSentence } from './opl-generator';

interface OplPanelProps {
  opd: OpdDiagram;
  logical: LogicalModel;
}

function renderOplHtml(text: string): string {
  // Convert markdown bold/italic to HTML
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>');
}

function SentenceGroup({ title, sentences }: { title: string; sentences: OplSentence[] }) {
  if (sentences.length === 0) return null;
  return (
    <div className="opl-group">
      <div className="opl-group-title">{title}</div>
      {sentences.map((s, i) => (
        <div
          key={i}
          className="opl-sentence"
          dangerouslySetInnerHTML={{ __html: renderOplHtml(s.text) }}
        />
      ))}
    </div>
  );
}

export function OplPanel({ opd, logical }: OplPanelProps) {
  const [collapsed, setCollapsed] = useState(false);

  const sentences = useMemo(() => {
    const entityIds = getOpdEntityIds(opd);
    return generateOplForOpd(logical, entityIds);
  }, [opd, logical]);

  const declarations = sentences.filter((s) => s.type === 'declaration');
  const relations = sentences.filter((s) => s.type === 'relation');
  const links = sentences.filter((s) => s.type === 'link');

  const plainText = useMemo(() => {
    return sentences
      .map((s) => s.text.replace(/\*\*/g, '').replace(/\*/g, ''))
      .join('\n');
  }, [sentences]);

  const onCopy = useCallback(() => {
    navigator.clipboard.writeText(plainText);
  }, [plainText]);

  return (
    <div className={`opl-panel ${collapsed ? 'collapsed' : ''}`}>
      <div className="opl-header" onClick={() => setCollapsed(!collapsed)}>
        <span className="opl-toggle">{collapsed ? '\u25B6' : '\u25BC'}</span>
        <span className="opl-title">OPL — {opd.name}</span>
        <span className="opl-count">{sentences.length} sentences</span>
        {!collapsed && (
          <button
            className="opl-copy"
            onClick={(e) => {
              e.stopPropagation();
              onCopy();
            }}
            title="Copy OPL to clipboard"
          >
            Copy
          </button>
        )}
      </div>
      {!collapsed && (
        <div className="opl-body">
          <SentenceGroup title="Declarations" sentences={declarations} />
          <SentenceGroup title="Structural Relations" sentences={relations} />
          <SentenceGroup title="Procedural Links" sentences={links} />
          {sentences.length === 0 && (
            <div className="opl-empty">No OPL sentences for this OPD.</div>
          )}
        </div>
      )}
    </div>
  );
}
