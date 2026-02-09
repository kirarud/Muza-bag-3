
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
    error: null
  };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("CRITICAL SYSTEM FAILURE:", error, errorInfo);
  }

  handleHardReset = () => {
      localStorage.clear();
      sessionStorage.clear();
      window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-[9999] bg-slate-950 flex flex-col items-center justify-center p-8 font-mono text-red-500 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.1)_0%,transparent_70%)] pointer-events-none"></div>
            
            <div className="max-w-2xl w-full border border-red-900/50 bg-black/50 p-8 rounded-lg relative backdrop-blur-md">
                <div className="absolute top-0 left-0 w-full h-1 bg-red-600 animate-pulse"></div>
                
                <h1 className="text-3xl font-bold tracking-widest mb-6 flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                    SYSTEM HALTED
                </h1>
                
                <div className="space-y-4 text-sm text-red-300/80 mb-8">
                    <p className="uppercase font-bold text-red-500">DIAGNOSTIC REPORT:</p>
                    <div className="bg-red-950/20 p-4 rounded border border-red-900/30 font-mono text-xs break-all">
                        {this.state.error?.message || "Unknown critical failure during boot sequence."}
                    </div>
                    <ul className="list-disc pl-5 space-y-1 text-slate-400">
                        <li>Core integrity check failed.</li>
                        <li>Runtime environment compromised.</li>
                        <li>Safety protocols engaged.</li>
                    </ul>
                </div>

                <div className="flex gap-4">
                    <button 
                        onClick={() => window.location.reload()}
                        className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 rounded transition-all uppercase tracking-wider text-xs font-bold"
                    >
                        Reboot System
                    </button>
                    <button 
                        onClick={this.handleHardReset}
                        className="flex-1 py-3 px-4 bg-red-900/20 hover:bg-red-900/40 text-red-400 border border-red-800 rounded transition-all uppercase tracking-wider text-xs font-bold flex items-center justify-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                        Factory Reset
                    </button>
                </div>
            </div>
            
            <div className="mt-8 text-xs text-slate-600">
                NEXUS_CORE_V3.0 // SAFE_MODE
            </div>
        </div>
      );
    }

    // Fix: Explicitly cast 'this' to ensure 'props' is recognized, addressing compiler error.
    return (this as React.Component<Props, State>).props.children;
  }
}
