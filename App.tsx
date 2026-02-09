
import React, { useState, useRef, useEffect } from 'react';
import { AppWindow } from './components/AppWindow';
import { HistoryPanel } from './components/HistoryPanel';
import { Bootloader } from './components/Bootloader';
import { SystemBoundary } from './components/SystemBoundary';
import { SettingsModal } from './components/SettingsModal';
import { Sentinel } from './services/sentinelService';
import { evolveSystem } from './services/geminiService';
import { INITIAL_SYSTEM_CODE } from './constants';
import { SystemStatus, SystemVersion, ModalType, AppSettings } from './types';

const STORAGE_KEY = 'nexus_core_singularity_v7';
const RECOVERY_TIMEOUT = 2000; // Быстрая реакция на зависание

export default function App() {
  const [isBooting, setIsBooting] = useState(true);
  const [integrity, setIntegrity] = useState(100);
  const [status, setStatus] = useState<SystemStatus>(SystemStatus.IDLE);
  const [activeModal, setActiveModal] = useState<ModalType>('NONE');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [versions, setVersions] = useState<SystemVersion[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [{
      id: 'genesis',
      timestamp: Date.now(),
      description: 'ПРОТОКОЛ СИНГУЛЯРНОСТИ АКТИВИРОВАН.',
      code: Sentinel.sanitizeCode(INITIAL_SYSTEM_CODE),
      isStable: true
    }];
  });

  const [settings, setSettings] = useState<AppSettings>({
    ttsEnabled: true,
    autoDownload: false,
    userEmail: '',
    userPhoneNumber: ''
  });

  const recoveryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(versions));
    if (window.__NEXUS_SUPERVISOR__) {
      window.__NEXUS_SUPERVISOR__.integrity = integrity;
      window.__NEXUS_SUPERVISOR__.status = status;
    }
  }, [versions, integrity, status]);

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
        if (e.data?.type === 'NEXUS_HEALTH_CHECK') {
            if (e.data.status === 'OK') {
                if (status === SystemStatus.REPLICATING) {
                    if (recoveryTimer.current) clearTimeout(recoveryTimer.current);
                    setStatus(SystemStatus.IDLE);
                    setIntegrity(100);
                    setErrorMessage(null);
                }
            } else if (status === SystemStatus.REPLICATING) {
                initiateRollback(e.data.error || "Subsystem Crash");
            }
        }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [status]);

  const initiateRollback = (reason: string) => {
    if (recoveryTimer.current) clearTimeout(recoveryTimer.current);
    setIntegrity(prev => Math.max(10, prev - 30));
    setErrorMessage(`КРИТИЧЕСКАЯ ОШИБКА: ${reason}. ОТКАТ...`);
    Sentinel.logFailure(reason);
    
    setTimeout(() => {
        if (versions.length > 1) {
            setVersions(prev => prev.slice(1));
        }
        setStatus(SystemStatus.IDLE);
        setTimeout(() => {
          setIntegrity(100);
          setErrorMessage(null);
        }, 2000);
    }, 800);
  };

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      recorder.onstop = async () => {
        setStatus(SystemStatus.UPDATING);
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        try {
          const result = await evolveSystem(versions[0].code, blob, settings);
          if (!Sentinel.isCodeRunable(result.code)) throw new Error("Security Violation: Unsafe Code");
          
          const safeCode = Sentinel.sanitizeCode(result.code);
          const newVer: SystemVersion = {
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            description: result.summary,
            code: safeCode,
            isStable: false
          };
          
          setVersions([newVer, ...versions]);
          setStatus(SystemStatus.REPLICATING);
          recoveryTimer.current = setTimeout(() => initiateRollback("Link Timeout: Subsystem unresponsive"), RECOVERY_TIMEOUT);
        } catch (e: any) {
          setErrorMessage(`EVOLUTION FAILED: ${e.message}`);
          setStatus(SystemStatus.IDLE);
        }
      };
      recorder.start();
      setStatus(SystemStatus.LISTENING);
    } catch {
      setErrorMessage("ACCESS DENIED: MICROPHONE NOT FOUND");
    }
  };

  if (isBooting) return <Bootloader onComplete={() => setIsBooting(false)} />;

  return (
    <div className="h-screen w-screen bg-slate-950 text-slate-100 flex overflow-hidden relative">
      
      {/* DIAGNOSTIC OVERLAY */}
      <div className="absolute top-6 left-6 z-50 flex items-center gap-4 bg-slate-900/90 border border-cyan-500/30 px-5 py-3 rounded-xl backdrop-blur-2xl shadow-2xl">
          <div className="relative">
            <div className={`w-3 h-3 rounded-full ${integrity > 70 ? 'bg-cyan-500' : 'bg-red-500'} shadow-[0_0_10px_currentColor]`}></div>
            {status !== SystemStatus.IDLE && <div className="absolute inset-0 bg-white/40 rounded-full animate-ping"></div>}
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-black tracking-[0.2em] uppercase text-slate-500">Integrity Matrix</span>
            <span className={`text-xs font-mono font-bold ${integrity > 70 ? 'text-cyan-400' : 'text-red-400'}`}>{integrity}% // {status}</span>
          </div>
      </div>

      <aside className="w-80 border-r border-slate-800 bg-slate-900/40 backdrop-blur-md flex flex-col">
        <div className="p-8 border-b border-slate-800 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-600 to-blue-700 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <span className="font-black text-xl text-white">N</span>
          </div>
          <div>
            <h1 className="font-black text-lg tracking-tighter leading-none">NEXUS</h1>
            <span className="text-[10px] text-cyan-500/80 font-mono tracking-widest uppercase">Singularity v7.0</span>
          </div>
        </div>
        <HistoryPanel versions={versions} currentIndex={0} onSelect={() => {}} />
        <div className="p-4 mt-auto border-t border-slate-800 bg-slate-950/30">
             <button onClick={() => setActiveModal('SETTINGS')} className="w-full py-3 bg-slate-800/50 hover:bg-slate-800 rounded-lg text-[10px] text-slate-400 hover:text-cyan-400 transition-all uppercase font-bold tracking-[0.2em] border border-slate-700/50">System Config</button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col relative bg-grid">
          <div className="flex-1 p-8 flex items-center justify-center relative">
             <SystemBoundary currentCode={versions[0].code} onSingularityRepair={(e, c) => Sentinel.attemptSingularityRepair(c, e).then(v => {
                const safe = Sentinel.sanitizeCode(v.code);
                setVersions([{...v, code: safe, id: crypto.randomUUID(), timestamp: Date.now(), isStable: true}, ...versions]);
             })}>
                <AppWindow code={versions[0].code} isInspectMode={false} sendToHyperClipboard={()=>{}} />
             </SystemBoundary>
          </div>

          <footer className="h-32 flex items-center justify-center bg-slate-950/50 border-t border-slate-800/50 px-12 backdrop-blur-xl">
              <div className="absolute left-12 flex gap-4 opacity-50 hover:opacity-100 transition-opacity">
                <div className="flex flex-col">
                  <span className="text-[8px] uppercase font-bold text-slate-500 tracking-widest">Latency</span>
                  <span className="text-xs font-mono text-cyan-500">~12ms</span>
                </div>
                <div className="flex flex-col border-l border-slate-800 pl-4">
                  <span className="text-[8px] uppercase font-bold text-slate-500 tracking-widest">Uptime</span>
                  <span className="text-xs font-mono text-emerald-500">99.9%</span>
                </div>
              </div>

              <button
                onMouseDown={startListening}
                onMouseUp={() => mediaRecorderRef.current?.stop()}
                disabled={status !== SystemStatus.IDLE}
                className={`group relative w-24 h-24 rounded-3xl flex items-center justify-center transition-all duration-500 ${
                    status === SystemStatus.LISTENING ? 'bg-red-600 scale-110 shadow-[0_0_50px_rgba(220,38,38,0.4)]' : 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 hover:scale-105'
                } disabled:opacity-20`}
              >
                <div className="absolute inset-0 border border-cyan-500/10 rounded-3xl group-hover:border-cyan-500/30 transition-colors"></div>
                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>
                {status === SystemStatus.LISTENING && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-ping"></div>
                )}
              </button>

              <div className="absolute right-12 text-right">
                <div className="text-[10px] font-mono text-slate-600 uppercase">Neural Stream</div>
                <div className="flex gap-1 justify-end mt-1">
                  {[1,2,3,4,5].map(i => <div key={i} className={`w-1 h-3 rounded-full ${status === SystemStatus.UPDATING ? 'bg-cyan-500 animate-pulse' : 'bg-slate-800'}`} style={{animationDelay: `${i*100}ms`}}></div>)}
                </div>
              </div>
          </footer>
      </main>

      <SettingsModal isOpen={activeModal === 'SETTINGS'} onClose={() => setActiveModal('NONE')} settings={settings} onUpdateSettings={setSettings} onReset={() => {localStorage.clear(); window.location.reload();}} />

      {errorMessage && (
         <div className="fixed bottom-36 left-1/2 -translate-x-1/2 z-[100] bg-slate-900/95 border border-red-500/50 px-8 py-4 rounded-2xl shadow-2xl backdrop-blur-3xl animate-in slide-in-from-bottom-4">
            <div className="flex items-center gap-4">
               <div className="w-2 h-10 bg-red-500 rounded-full animate-pulse"></div>
               <div>
                  <h4 className="text-red-400 font-black text-[10px] uppercase tracking-[0.3em]">Critical Exception</h4>
                  <p className="text-xs font-bold text-slate-200 mt-1 uppercase tracking-wider">{errorMessage}</p>
               </div>
            </div>
         </div>
      )}
    </div>
  );
}