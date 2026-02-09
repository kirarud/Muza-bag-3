import React from 'react';
import { SystemVersion } from '../types';

interface HistoryPanelProps {
  versions: SystemVersion[];
  currentIndex: number;
  onSelect: (index: number) => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ versions, currentIndex, onSelect }) => {
  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-slate-900/30">
      <div className="px-4 py-3 border-b border-slate-800/50 flex justify-between items-center bg-slate-900/50">
        <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Журнал Событий</h2>
        <span className="text-[9px] text-slate-600 font-mono">LOG_ID_884</span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-0 scrollbar-thin scrollbar-thumb-slate-700">
        <div className="flex flex-col relative">
            {/* Connection Line */}
            <div className="absolute left-6 top-0 bottom-0 w-px bg-slate-800 z-0"></div>

            {versions.map((version, idx) => {
              const isActive = idx === currentIndex;
              const isLatest = idx === 0;

              return (
                <button
                  key={version.id}
                  onClick={() => onSelect(idx)}
                  className={`
                    w-full text-left py-4 px-4 relative z-10 transition-all duration-200 border-l-2
                    hover:bg-slate-800/40
                    ${isActive 
                      ? 'bg-slate-800/60 border-cyan-500' 
                      : 'bg-transparent border-transparent hover:border-slate-700'
                    }
                  `}
                >
                  <div className="flex gap-3 relative">
                     {/* Timeline Node */}
                     <div className={`
                       w-3 h-3 rounded-full border-2 shrink-0 mt-1 z-20 relative bg-slate-900
                       ${isActive ? 'border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]' : 'border-slate-700'}
                       ${isLatest && !isActive ? 'border-emerald-500' : ''}
                     `}>
                        {isActive && <div className="absolute inset-0.5 bg-cyan-400 rounded-full"></div>}
                     </div>

                     <div className="flex-1 min-w-0">
                       <div className="flex justify-between items-start mb-1">
                         <span className={`text-[10px] font-mono font-bold uppercase ${isActive ? 'text-cyan-400' : 'text-slate-500'}`}>
                           REV_{versions.length - 1 - idx}.0
                         </span>
                         <span className="text-[9px] text-slate-600 font-mono">
                           {new Date(version.timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                         </span>
                       </div>
                       
                       <p className={`text-xs leading-snug line-clamp-2 ${isActive ? 'text-slate-200' : 'text-slate-400'}`}>
                         {version.description}
                       </p>
                     </div>
                  </div>
                </button>
              );
            })}
        </div>
      </div>
    </div>
  );
};