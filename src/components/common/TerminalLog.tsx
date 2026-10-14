import React, { useState, useEffect, useRef } from 'react';
import { TerminalLogEntry } from '../../types';
import { Terminal, Copy, Trash2, ArrowDown, Check } from 'lucide-react';

interface TerminalLogProps {
  logs: TerminalLogEntry[];
  onClear: () => void;
  maxLines?: number;
}

export const TerminalLog: React.FC<TerminalLogProps> = ({
  logs,
  onClear,
  maxLines = 100,
}) => {
  const [autoScroll, setAutoScroll] = useState(true);
  const [copied, setCopied] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const displayedLogs = logs.slice(-maxLines);

  const handleCopyLogs = () => {
    const text = displayedLogs
      .map((l) => `[${l.timestamp}] ${l.type} ${l.message}${l.details ? ` | ${l.details}` : ''}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#0b101d] border border-slate-800/90 rounded-2xl overflow-hidden flex flex-col h-[230px] sm:h-[250px] shadow-xl">
      {/* Title Bar */}
      <div className="bg-[#080d18] px-4 py-2.5 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-xs font-mono font-bold text-slate-200">
            Recent routing activity
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            title="Toggle Auto-Scroll"
            className={`p-1 rounded text-xs transition-colors cursor-pointer ${
              autoScroll ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <ArrowDown className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleCopyLogs}
            title="Copy Logs"
            className="p-1 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={onClear}
            title="Clear Console"
            className="p-1 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Terminal Content */}
      <div
        ref={scrollRef}
        className="p-3.5 overflow-y-auto flex-1 font-mono text-xs space-y-1 selection:bg-emerald-950 selection:text-emerald-300"
      >
        {displayedLogs.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center">
            <Terminal className="h-5 w-5 text-slate-600" />
            <p className="text-xs font-medium text-slate-300">No routing activity yet</p>
            <p className="max-w-xs text-[11px] leading-5 text-slate-500">
              Run a routing preview to see decision events here. This panel does not represent a live production feed.
            </p>
          </div>
        )}
        {displayedLogs.map((log) => {
          let typeColor = 'text-slate-400';
          let msgColor = 'text-slate-300';

          if (log.type === 'AGENT') {
            typeColor = 'text-purple-400';
            msgColor = 'text-emerald-300 font-semibold';
          } else if (log.type === 'TELEMETRY') {
            typeColor = 'text-emerald-400';
            msgColor = 'text-emerald-400 font-bold';
          } else if (log.type === 'PASSPORT') {
            typeColor = 'text-sky-400';
            msgColor = 'text-sky-300 font-bold';
          } else if (log.type === 'WARN') {
            typeColor = 'text-amber-400';
            msgColor = 'text-amber-300';
          } else if (log.type === 'ERROR') {
            typeColor = 'text-rose-400';
            msgColor = 'text-rose-300 font-semibold';
          }

          return (
            <div key={log.id} className="leading-relaxed hover:bg-slate-900/40 px-1 rounded transition-colors text-[11px]">
              <span className="text-slate-500 select-none mr-2 font-mono">[{log.timestamp}]</span>
              <span className={`mr-2 font-bold ${typeColor}`}>{log.type}</span>
              <span className={msgColor}>{log.message}</span>
              {log.details && (
                <span className="text-slate-500 block text-[10px] ml-16 mt-0.5 truncate">
                  ↳ {log.details}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
