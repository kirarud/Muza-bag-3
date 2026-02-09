import React, { useState } from 'react';

interface TooltipProps {
  children: React.ReactNode;
  title: string;
  description: string;
  actionInfo?: string; // What happens when clicked
  techInfo?: string;   // Technical detail (optional)
  position?: 'bottom' | 'top' | 'left' | 'right';
}

export const Tooltip: React.FC<TooltipProps> = ({ 
  children, 
  title, 
  description, 
  actionInfo, 
  techInfo, 
  position = 'bottom' 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  // Position styles
  const positionClasses = {
    bottom: "top-full mt-2 left-1/2 -translate-x-1/2",
    top: "bottom-full mb-2 left-1/2 -translate-x-1/2",
    left: "right-full mr-2 top-1/2 -translate-y-1/2",
    right: "left-full ml-2 top-1/2 -translate-y-1/2",
  };

  return (
    <div 
      className="relative flex items-center"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      
      {isVisible && (
        <div className={`absolute z-50 w-64 bg-slate-900/95 border border-cyan-500/30 shadow-[0_0_30px_rgba(0,0,0,0.5)] backdrop-blur-xl rounded-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 pointer-events-none ${positionClasses[position]}`}>
          {/* Header */}
          <div className="bg-slate-950/80 px-3 py-2 border-b border-slate-800 flex items-center justify-between">
            <span className="text-cyan-400 font-bold text-xs uppercase tracking-wider">{title}</span>
            <div className="flex gap-1">
               <div className="w-1 h-1 rounded-full bg-cyan-500"></div>
               <div className="w-1 h-1 rounded-full bg-slate-600"></div>
               <div className="w-1 h-1 rounded-full bg-slate-600"></div>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-3 space-y-2">
            <p className="text-slate-300 text-xs leading-relaxed border-l-2 border-slate-700 pl-2">
              {description}
            </p>
            
            {actionInfo && (
              <div className="mt-2 pt-2 border-t border-slate-800/50">
                <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Действие:</span>
                <p className="text-emerald-400 text-xs">{actionInfo}</p>
              </div>
            )}

            {techInfo && (
               <p className="text-[10px] text-slate-600 font-mono mt-1 text-right">
                 SYS_CMD: {techInfo}
               </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};