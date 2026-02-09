
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
  currentCode: string;
  onSingularityRepair: (error: string, code: string) => void | Promise<any>;
}

interface State {
  hasError: boolean;
  error: Error | null;
  isRepairing: boolean;
}

export class SystemBoundary extends Component<Props, State> {
  // Explicitly define state as a class property to help with type detection
  state: State = { hasError: false, error: null, isRepairing: false };

  constructor(props: Props) {
    super(props);
    // Note: state is initialized as a property above to avoid line 19 error
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, isRepairing: false };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("BOUNDARY CAUGHT:", error, errorInfo);
  }

  handleRetry = () => {
    // Cast this to any to ensure setState is recognized by the compiler (Fix for line 31)
    (this as any).setState({ hasError: false, error: null, isRepairing: false });
  };

  initiateSingularity = () => {
    // Cast this to any to access state, setState and props (Fixes for lines 35, 36, 38)
    const self = this as any;
    if (self.state.error) {
      self.setState({ isRepairing: true });
      setTimeout(() => {
        self.props.onSingularityRepair(self.state.error!.message, self.props.currentCode);
      }, 1000);
    }
  };

  render() {
    // Cast this to any to ensure state and props are recognized in render (Fixes for lines 44, 51, 62, 64, 70)
    const self = this as any;
    if (self.state.hasError) {
      return (
        <div className="w-full h-full bg-slate-950 flex flex-col items-center justify-center text-center p-12 border border-red-900/30 rounded-xl">
          <div className="w-16 h-16 border-2 border-red-500 rounded-full flex items-center justify-center mb-6 animate-pulse">
            <span className="text-red-500 font-bold text-xl">!</span>
          </div>
          <h2 className="text-xl font-bold text-white mb-2 uppercase tracking-tighter">Сбой Внешней Оболочки</h2>
          <p className="text-slate-500 text-xs max-w-md mb-8 font-mono">{self.state.error?.message}</p>
          <div className="flex gap-4">
            <button 
              onClick={this.handleRetry} 
              className="px-6 py-2 bg-slate-800 text-white rounded font-bold text-[10px] uppercase tracking-widest hover:bg-slate-700 transition-colors"
            >
              Игнорировать
            </button>
            <button 
              onClick={this.initiateSingularity} 
              className="px-6 py-2 bg-red-600 text-white rounded font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-red-900/20 disabled:opacity-50"
              disabled={self.state.isRepairing}
            >
              {self.state.isRepairing ? 'Восстановление...' : 'Сингулярность'}
            </button>
          </div>
        </div>
      );
    }
    return self.props.children;
  }
}
