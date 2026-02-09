
import React from 'react';
import { AppSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onReset: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onUpdateSettings, onReset }) => {
  if (!isOpen) return null;

  const toggleTTS = () => onUpdateSettings({ ...settings, ttsEnabled: !settings.ttsEnabled });
  const toggleAutoDownload = () => onUpdateSettings({ ...settings, autoDownload: !settings.autoDownload });
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => onUpdateSettings({ ...settings, userEmail: e.target.value });
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => onUpdateSettings({ ...settings, userPhoneNumber: e.target.value });

  return (
    <div className="absolute inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-600 rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-slate-950 p-4 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-2">
             <div className="w-2 h-6 bg-cyan-500 rounded-sm"></div>
             <h2 className="text-xl font-bold text-slate-100 uppercase tracking-widest">Конфигурация</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* TTS Setting */}
          <div className="flex items-start justify-between gap-4 p-4 rounded-lg bg-slate-800/30 border border-slate-800 hover:border-slate-700 transition-colors">
             <div>
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                   Голосовой Ассистент
                   {settings.ttsEnabled && <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>}
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                   Система будет озвучивать выполненные изменения и статус работы после каждой эволюции.
                </p>
             </div>
             <button 
               onClick={toggleTTS}
               className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${settings.ttsEnabled ? 'bg-green-500/20 border border-green-500' : 'bg-slate-700 border border-slate-600'}`}
             >
                <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-current transition-transform ${settings.ttsEnabled ? 'translate-x-6 text-green-400' : 'translate-x-0 text-slate-400'}`}></div>
             </button>
          </div>

          {/* Auto-Download Setting */}
          <div className="flex items-start justify-between gap-4 p-4 rounded-lg bg-slate-800/30 border border-slate-800 hover:border-slate-700 transition-colors">
             <div>
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                   Авто-сохранение на ПК
                   {settings.autoDownload && <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse"></span>}
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                   Автоматически скачивать файл резервной копии (.json) на компьютер после каждого обновления системы.
                </p>
             </div>
             <button 
               onClick={toggleAutoDownload}
               className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${settings.autoDownload ? 'bg-cyan-500/20 border border-cyan-500' : 'bg-slate-700 border border-slate-600'}`}
             >
                <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-current transition-transform ${settings.autoDownload ? 'translate-x-6 text-cyan-400' : 'translate-x-0 text-slate-400'}`}></div>
             </button>
          </div>

          {/* User PII Input */}
          <div className="border border-orange-500/30 rounded-lg p-4 bg-orange-950/10 space-y-4">
            <h3 className="text-sm font-bold text-orange-400 uppercase tracking-wider flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12v7H5v-7"/><path d="M5 12H3a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h3v6"/><path d="M19 12h2a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-3v6"/><path d="M12 7V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v3"/><path d="M12 7V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v3"/></svg>
                Данные пользователя
            </h3>
            <p className="text-xs text-orange-300/80 leading-relaxed mb-3">
                Эти данные хранятся **локально** в вашем браузере. Они будут включены в промпт для ИИ, если вы их предоставите, чтобы "Муза" могла лучше понимать контекст.
            </p>
            <div>
              <label htmlFor="userEmail" className="text-xs text-slate-400 block mb-1">Email</label>
              <input
                id="userEmail"
                type="email"
                value={settings.userEmail}
                onChange={handleEmailChange}
                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white focus:border-orange-500 focus:outline-none transition-colors"
                placeholder="ваша@почта.com"
              />
            </div>
            <div>
              <label htmlFor="userPhoneNumber" className="text-xs text-slate-400 block mb-1">Номер телефона</label>
              <input
                id="userPhoneNumber"
                type="tel"
                value={settings.userPhoneNumber}
                onChange={handlePhoneChange}
                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white focus:border-orange-500 focus:outline-none transition-colors"
                placeholder="+7 (XXX) XXX-XX-XX"
              />
            </div>
          </div>

          <div className="border-t border-slate-800 pt-6">
             <button 
               onClick={onReset}
               className="w-full py-3 px-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-sm font-bold hover:bg-red-500/20 hover:border-red-500/50 transition-all flex items-center justify-center gap-2"
             >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                ПОЛНЫЙ СБРОС СИСТЕМЫ
             </button>
             <p className="text-[10px] text-red-500/50 text-center mt-2">
                Внимание: Это действие необратимо удалит всю историю эволюции.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};
