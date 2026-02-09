import React, { useRef, useState, useCallback } from 'react';
import { SystemVersion } from '../types';

interface CloudInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  versions: SystemVersion[];
  onImport: (data: SystemVersion[]) => void;
}

export const CloudInterface: React.FC<CloudInterfaceProps> = ({ isOpen, onClose, versions, onImport }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'IDLE' | 'SYNCING' | 'COMPLETE'>('IDLE');

  if (!isOpen) return null;

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(versions));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `nexus_memory_${new Date().toISOString().slice(0,19).replace(/:/g, '-')}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const processFile = (file: File) => {
    setSyncStatus('SYNCING');
    
    // Artificial delay to simulate "Cloud Processing"
    setTimeout(() => {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const json = JSON.parse(event.target?.result as string);
            if (Array.isArray(json) && json[0]?.code) {
              setSyncStatus('COMPLETE');
              setTimeout(() => {
                  onImport(json);
                  onClose();
                  setSyncStatus('IDLE');
              }, 800);
            } else {
              alert("Ошибка: Неверный формат файла Nexus.");
              setSyncStatus('IDLE');
            }
          } catch (err) {
            alert("Ошибка чтения файла.");
            setSyncStatus('IDLE');
          }
        };
        reader.readAsText(file);
    }, 1500);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, []);

  const totalSize = new Blob([JSON.stringify(versions)]).size;
  const sizeKB = (totalSize / 1024).toFixed(2);

  return (
    <div className="absolute inset-0 z-[60] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-cyan-500/30 rounded-xl shadow-[0_0_50px_rgba(8,145,178,0.2)] max-w-2xl w-full overflow-hidden relative">
        
        {/* Loading Overlay */}
        {syncStatus !== 'IDLE' && (
            <div className="absolute inset-0 z-50 bg-black/80 flex flex-col items-center justify-center">
                <div className={`w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full ${syncStatus === 'SYNCING' ? 'animate-spin' : ''}`}></div>
                <p className="mt-4 text-cyan-400 font-mono tracking-widest animate-pulse">
                    {syncStatus === 'SYNCING' ? 'СИНХРОНИЗАЦИЯ С ОБЛАКОМ...' : 'ПАМЯТЬ ВОССТАНОВЛЕНА'}
                </p>
            </div>
        )}

        {/* Header */}
        <div className="bg-slate-950 p-4 border-b border-cyan-900/50 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-cyan-500/20 flex items-center justify-center text-cyan-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.5 19c0-3.037-2.463-5.5-5.5-5.5S6.5 15.963 6.5 19"/><path d="M12 13.5V22"/><path d="M12 22l4-4"/><path d="M12 22l-4-4"/><path d="M20 17.607c1.494-.585 3-1.918 3-4.107 0-2.76-2.24-5-5-5-.402 0-.791.048-1.17.14C16.126 5.566 13.33 3.5 10 3.5c-4.14 0-7.5 3.36-7.5 7.5 0 2.226 1.01 4.225 2.597 5.607"/></svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">ОБЛАКО NEXUS</h2>
              <p className="text-xs text-cyan-500 uppercase tracking-wider">Глобальная Сеть</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="grid grid-cols-2 gap-6">
             {/* Stats */}
             <div className="col-span-2 bg-slate-800/50 rounded-lg p-4 border border-slate-700 flex justify-between items-center">
                <div>
                   <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Объем памяти</div>
                   <div className="text-2xl font-mono text-cyan-400">{sizeKB} KB</div>
                </div>
                <div className="text-right">
                   <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Точки восстановления</div>
                   <div className="text-2xl font-mono text-purple-400">{versions.length}</div>
                </div>
             </div>

             {/* Export */}
             <button 
               onClick={handleExport}
               className="group flex flex-col items-center justify-center p-8 bg-slate-800/50 border border-slate-700 rounded-xl hover:bg-slate-800 hover:border-cyan-500/50 transition-all relative overflow-hidden"
             >
               <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
               <div className="w-12 h-12 bg-cyan-500/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform relative z-10">
                  <svg className="text-cyan-400" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
               </div>
               <span className="font-bold text-slate-200 relative z-10">Экспорт Памяти</span>
               <span className="text-xs text-slate-500 mt-2 text-center max-w-[150px] relative z-10">Скачать дамп системы в .JSON</span>
             </button>

             {/* Import Drop Zone */}
             <div 
               onClick={handleImportClick}
               onDragOver={onDragOver}
               onDragLeave={onDragLeave}
               onDrop={onDrop}
               className={`
                 group flex flex-col items-center justify-center p-8 
                 border-2 border-dashed rounded-xl cursor-pointer transition-all relative overflow-hidden
                 ${isDragging 
                   ? 'bg-purple-900/20 border-purple-400 scale-[1.02]' 
                   : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800 hover:border-purple-500/50'
                 }
               `}
             >
               <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
               <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform relative z-10">
                  <svg className="text-purple-400" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
               </div>
               <span className="font-bold text-slate-200 relative z-10">
                 {isDragging ? 'Отпустите файл' : 'Импорт Памяти'}
               </span>
               <span className="text-xs text-slate-500 mt-2 text-center max-w-[150px] relative z-10">
                 Нажмите или перетащите .JSON файл сюда
               </span>
               <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".json" />
             </div>
          </div>
        </div>

        <div className="bg-slate-950 p-3 border-t border-slate-800 flex justify-between items-center px-6">
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest">Авто-синхронизация активна</p>
            </div>
            <p className="text-[10px] text-slate-600">NEXUS CLOUD v3.0</p>
        </div>
      </div>
    </div>
  );
};