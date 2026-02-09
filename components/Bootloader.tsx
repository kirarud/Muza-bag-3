
import React, { useEffect, useState } from 'react';

interface BootloaderProps {
  onComplete: () => void;
}

const BOOT_STEPS = [
    { id: 'bios', text: 'NEXUS_BIOS v6.0.1 INITIALIZING...', duration: 400 },
    { id: 'mem', text: 'CHECKING_MEMORY_INTEGRITY... [OK]', duration: 800 },
    { id: 'sentinel', text: 'LOADING_SENTINEL_SERVICE... [ACTIVE]', duration: 1200, color: 'text-cyan-400' },
    { id: 'sandbox', text: 'ISOLATION_LAYERS... [ESTABLISHED]', duration: 1600, color: 'text-emerald-400' },
    { id: 'ui', text: 'MOUNTING_GRAPHICAL_INTERFACE...', duration: 2000 },
    { id: 'ready', text: 'SYSTEM_READY', duration: 2400 }
];

export const Bootloader: React.FC<BootloaderProps> = ({ onComplete }) => {
  const [logs, setLogs] = useState<any[]>([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let timeouts: ReturnType<typeof setTimeout>[] = [];

    // Simulate Step-by-step loading
    BOOT_STEPS.forEach((step, index) => {
        const t = setTimeout(() => {
            setLogs(prev => [...prev, step]);
            setProgress(((index + 1) / BOOT_STEPS.length) * 100);
        }, step.duration);
        timeouts.push(t);
    });

    const finalT = setTimeout(onComplete, 2800);
    timeouts.push(finalT);

    return () => timeouts.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-black z-[100] flex flex-col items-center justify-center font-mono text-xs cursor-wait overflow-hidden">
        
        {/* Central Logo Animation */}
        <div className="relative mb-12">
            <div className="w-24 h-24 border-2 border-cyan-900 rounded-full animate-spin [animation-duration:3s]"></div>
            <div className="absolute inset-0 border-2 border-t-cyan-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-4 bg-cyan-950/30 rounded-full flex items-center justify-center backdrop-blur-sm">
                 <span className="text-cyan-400 font-bold tracking-tighter text-xl animate-pulse">NEXUS</span>
            </div>
        </div>

        {/* Progress Bar */}
        <div className="w-64 h-1 bg-slate-800 rounded-full mb-8 overflow-hidden">
            <div 
                className="h-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.8)] transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
            ></div>
        </div>

        {/* Terminal Logs */}
        <div className="w-full max-w-md space-y-1.5 px-4">
            {logs.map((log) => (
                <div key={log.id} className="flex gap-3 opacity-0 animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-forwards">
                    <span className="text-slate-600 w-12 text-right">[{new Date().toLocaleTimeString('ru-RU', { second: '2-digit' }).split(' ')[0]}]</span>
                    <span className={log.color || 'text-slate-300'}>{log.text}</span>
                </div>
            ))}
            <div className="flex gap-3 animate-pulse">
                <span className="text-slate-600 w-12 text-right">...</span>
                <span className="text-cyan-500">_</span>
            </div>
        </div>

        {/* Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.05)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none -z-10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black pointer-events-none -z-10"></div>
    </div>
  );
};
