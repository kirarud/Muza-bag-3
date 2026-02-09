
import React, { useEffect, useRef, useState } from 'react';
import { SelectedElementData, HyperbitMetadata } from '../types';

interface AppWindowProps {
  code: string;
  isInspectMode: boolean;
  sendToHyperClipboard: (type: 'ELEMENT_DATA', payloadData: SelectedElementData, hyperbitMetadata?: Partial<HyperbitMetadata>) => void;
}

export const AppWindow: React.FC<AppWindowProps> = ({ code, isInspectMode, sendToHyperClipboard }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  // Track iframe load state to ensure we inject scripts at the right time
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [hoveredElementData, setHoveredElementData] = useState<SelectedElementData | null>(null);

  // Helper to inject our inspection tools
  const injectInspectionTools = () => {
    const iframe = iframeRef.current;
    if (!iframe || !iframe.contentDocument) return;

    const doc = iframe.contentDocument;

    // Helper to generate a unique selector
    const getSelector = (el: Element): string => {
        if (el.id) return `#${el.id}`;
        if (el === doc.body) return 'body';
        let idx = 1;
        let sib = el.previousElementSibling;
        while (sib) {
            if (sib.tagName === el.tagName) idx++;
            sib = sib.previousElementSibling;
        }
        return `${getSelector(el.parentElement as Element)} > ${el.tagName.toLowerCase()}:nth-of-type(${idx})`;
    };

    const handleMouseOver = (e: Event) => {
        if (!isInspectMode) return;
        e.stopPropagation();
        const target = e.target as HTMLElement;
        if (target === doc.body || target === doc.documentElement) {
          setHoveredElementData(null); // Clear if hovering over body/html
          return;
        }
        target.classList.add('nexus-highlight');

        const selector = getSelector(target);
        setHoveredElementData({
            tagName: target.tagName.toLowerCase(),
            html: target.outerHTML,
            text: target.innerText.substring(0, 50),
            selector: selector
        });
    };

    const handleMouseOut = (e: Event) => {
         const target = e.target as HTMLElement;
         target.classList.remove('nexus-highlight');
         setHoveredElementData(null);
    };

    const handleClick = (e: Event) => {
        if (!isInspectMode) return;
        e.preventDefault();
        e.stopPropagation();
        
        const target = e.target as HTMLElement;
        const selector = getSelector(target);
        
        // Remove highlight before capturing HTML to avoid dirtying the code
        target.classList.remove('nexus-highlight');

        const data = {
            tagName: target.tagName.toLowerCase(),
            html: target.outerHTML,
            text: target.innerText.substring(0, 50),
            selector: selector
        };

        window.parent.postMessage({ type: 'ELEMENT_SELECTED', payload: data }, '*');
    };

    // Inject CSS
    const styleId = 'nexus-inspect-styles';
    let styleTag = doc.getElementById(styleId);
    if (!styleTag) {
        styleTag = doc.createElement('style');
        styleTag.id = styleId;
        styleTag.innerHTML = `
            .nexus-highlight {
                outline: 2px solid #06b6d4 !important;
                background-color: rgba(6,182,212, 0.1) !important;
                cursor: crosshair !important;
                box-shadow: 0 0 15px rgba(6,182,212,0.5) !important;
                transition: all 0.2s ease;
            }
            body.inspect-mode-active * {
                pointer-events: auto !important; /* Re-enable pointer events for elements */
            }
        `;
        doc.head.appendChild(styleTag);
    }

    // Always clean up first to avoid duplicates
    doc.body.removeEventListener('mouseover', handleMouseOver);
    doc.body.removeEventListener('mouseout', handleMouseOut);
    doc.body.removeEventListener('click', handleClick);
    doc.documentElement.classList.remove('inspect-mode-active'); // Clean up body class

    if (isInspectMode) {
        doc.body.addEventListener('mouseover', handleMouseOver);
        doc.body.addEventListener('mouseout', handleMouseOut);
        doc.body.addEventListener('click', handleClick);
        doc.documentElement.classList.add('inspect-mode-active');
    }
  };

  // Effect to handle mode switching
  useEffect(() => {
    if (iframeLoaded) {
      injectInspectionTools();
    }
  }, [isInspectMode, iframeLoaded]);

  // Handle code updates
  useEffect(() => {
    if (iframeRef.current) {
      // Reset load state when code changes
      setIframeLoaded(false);
      iframeRef.current.srcdoc = code;
    }
  }, [code]);

  const handleIframeLoad = () => {
    setIframeLoaded(true);
  };

  const handleSendElementToHyperClipboard = () => {
    if (hoveredElementData) {
      sendToHyperClipboard(
        'ELEMENT_DATA', 
        hoveredElementData, 
        { BASE: 0.7, ENERGY: 0.6, COLOR: 'Желтый', CONTEXT: 'Выбранный элемент для анализа' }
      );
      setHoveredElementData(null); // Clear after sending
    }
  };

  return (
    <div className={`w-full max-w-5xl h-full flex flex-col relative group transition-all duration-500 ${isInspectMode ? 'scale-95' : 'scale-100'}`}>
       {/* Tech Border Container */}
       <div className={`absolute -inset-1 border rounded-lg pointer-events-none transition-colors duration-300 ${isInspectMode ? 'border-cyan-500/80' : 'border-slate-700/50'}`}></div>
       <div className={`absolute -inset-1 border rounded-lg pointer-events-none opacity-50 blur-[2px] transition-colors duration-300 ${isInspectMode ? 'border-cyan-500' : 'border-cyan-500/20'}`}></div>

       {/* Scanline Effect for Inspect Mode */}
       {isInspectMode && (
          <div className="absolute inset-0 pointer-events-none z-30 bg-[linear-gradient(transparent_50%,rgba(6,182,212,0.05)_50%)] bg-[length:100%_4px]"></div>
       )}

       {/* Floating send to HyperClipboard button in inspect mode */}
       {isInspectMode && hoveredElementData && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 animate-in fade-in slide-in-from-bottom-2">
             <button
                onClick={handleSendElementToHyperClipboard}
                className="px-4 py-2 bg-purple-600/20 border border-purple-500 text-purple-400 text-xs font-bold rounded-full shadow-lg shadow-purple-500/30 hover:bg-purple-600/40 transition-all flex items-center gap-2 backdrop-blur-sm"
             >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h1a4 4 0 0 0 0 8h-1"/><path d="M7 3v3"/><path d="M17 3v3"/><path d="M7 18v3"/><path d="M17 18v3"/><path d="M5 12h14"/></svg>
                В Гипербуфер ({hoveredElementData.tagName})
             </button>
          </div>
       )}


       {/* Corner Accents */}
       <div className={`absolute -top-1 -left-1 w-4 h-4 border-l-2 border-t-2 rounded-tl-sm z-20 transition-colors ${isInspectMode ? 'border-yellow-400' : 'border-cyan-500'}`}></div>
       <div className={`absolute -top-1 -right-1 w-4 h-4 border-r-2 border-t-2 rounded-tr-sm z-20 transition-colors ${isInspectMode ? 'border-yellow-400' : 'border-cyan-500'}`}></div>
       <div className={`absolute -bottom-1 -left-1 w-4 h-4 border-l-2 border-b-2 rounded-bl-sm z-20 transition-colors ${isInspectMode ? 'border-yellow-400' : 'border-cyan-500'}`}></div>
       <div className={`absolute -bottom-1 -right-1 w-4 h-4 border-r-2 border-b-2 rounded-br-sm z-20 transition-colors ${isInspectMode ? 'border-yellow-400' : 'border-cyan-500'}`}></div>

       {/* Window Header */}
       <div className={`h-8 border-b flex items-center justify-between px-4 rounded-t-lg z-10 transition-colors ${isInspectMode ? 'bg-slate-900 border-cyan-500/50' : 'bg-slate-900 border-slate-800'}`}>
          <div className="flex items-center gap-2">
             <div className={`w-2 h-2 rounded-full ${isInspectMode ? 'bg-yellow-500 animate-pulse' : 'bg-slate-600'}`}></div>
             <span className={`text-[10px] font-mono uppercase ${isInspectMode ? 'text-yellow-500' : 'text-slate-500'}`}>
                {isInspectMode ? 'DIAGNOSTIC_MODE_ENGAGED' : 'runtime_environment.exe'}
             </span>
          </div>
          <div className="flex gap-1">
             <div className="w-8 h-1 bg-slate-800 rounded-full"></div>
             <div className="w-1 h-1 bg-slate-800 rounded-full"></div>
          </div>
       </div>

       {/* Iframe Container */}
       <div className="flex-1 bg-black relative rounded-b-lg overflow-hidden border-x border-b border-slate-800">
          <iframe
            ref={iframeRef}
            onLoad={handleIframeLoad}
            title="Nexus Runtime"
            className="w-full h-full bg-black relative z-10" 
            sandbox="allow-scripts allow-modals allow-forms allow-popups allow-same-origin"
          />
          
          {/* Overlay Effects */}
          <div className="absolute inset-0 pointer-events-none z-20 bg-gradient-to-t from-cyan-500/5 to-transparent"></div>
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] z-20 bg-[length:100%_4px,6px_100%] opacity-10"></div>
       </div>
    </div>
  );
};
