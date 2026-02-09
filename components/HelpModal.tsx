import React from 'react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-2xl w-full h-[80vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-slate-950 p-4 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded bg-yellow-500/20 flex items-center justify-center text-yellow-400">
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
             </div>
             <h2 className="text-xl font-bold text-slate-100">СПРАВКА СИСТЕМЫ</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <section>
            <h3 className="text-cyan-400 font-bold mb-2 uppercase tracking-wider text-sm">Основная концепция</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Nexus (Нексус) — это приложение, которое пишет само себя. Вы говорите ему, что хотите изменить (добавить кнопку, поменять цвет, создать игру), и искусственный интеллект переписывает код приложения в реальном времени.
            </p>
          </section>

          <section className="grid gap-4">
             <h3 className="text-cyan-400 font-bold uppercase tracking-wider text-sm">Элементы управления</h3>
             
             <div className="bg-slate-800/50 p-3 rounded border border-slate-700/50 flex gap-4">
                <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center shrink-0">
                  <svg className="text-cyan-400" width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>
                </div>
                <div>
                   <h4 className="font-bold text-slate-200">Голосовая Команда</h4>
                   <p className="text-xs text-slate-400 mt-1">
                     Кнопка внизу экрана. Удерживайте её, говорите команду (например, "Добавь калькулятор"), и отпустите. Система начнет эволюцию.
                   </p>
                </div>
             </div>

             <div className="bg-slate-800/50 p-3 rounded border border-slate-700/50 flex gap-4">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
                   <svg className="text-purple-400" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.5 19c0-3.037-2.463-5.5-5.5-5.5S6.5 15.963 6.5 19"/><path d="M12 13.5V22"/><path d="M12 22l4-4"/><path d="M12 22l-4-4"/></svg>
                </div>
                <div>
                   <h4 className="font-bold text-slate-200">Облако (Сохранение)</h4>
                   <p className="text-xs text-slate-400 mt-1">
                     Позволяет скачать всю историю версий в файл или загрузить её обратно. Используйте это для резервного копирования вашего прогресса.
                   </p>
                </div>
             </div>

             <div className="bg-slate-800/50 p-3 rounded border border-slate-700/50 flex gap-4">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                    <svg className="text-green-400" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
                </div>
                <div>
                   <h4 className="font-bold text-slate-200">Голосовой Ассистент</h4>
                   <p className="text-xs text-slate-400 mt-1">
                     Включает или выключает озвучивание ответов системы. Когда включено, Нексус будет рассказывать, что именно он изменил в новой версии.
                   </p>
                </div>
             </div>
          </section>

          <section>
            <h3 className="text-cyan-400 font-bold mb-2 uppercase tracking-wider text-sm">Частые проблемы</h3>
            <ul className="list-disc pl-5 text-slate-300 text-sm space-y-2">
              <li><span className="text-slate-100 font-bold">Система не слышит:</span> Проверьте разрешение на микрофон в браузере.</li>
              <li><span className="text-slate-100 font-bold">Обновление сломало интерфейс:</span> Используйте панель истории слева, чтобы вернуться к предыдущей рабочей версии.</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};
