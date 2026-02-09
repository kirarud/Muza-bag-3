

export const INITIAL_SYSTEM_CODE = `
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;500;700&family=JetBrains+Mono:wght@400&display=swap" rel="stylesheet">
    <script type="module" src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.esm.js"></script>
    <style>
        body { font-family: 'Space Grotesk', sans-serif; background: #000; overflow: hidden; color: white; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        
        /* Grid Background Animation */
        .cyber-grid {
            background-size: 50px 50px;
            background-image: 
                linear-gradient(to right, rgba(6, 182, 212, 0.1) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(6, 182, 212, 0.1) 1px, transparent 1px);
            transform: perspective(500px) rotateX(60deg) translateY(-100px) translateZ(-200px);
            animation: grid-move 20s linear infinite;
        }
        @keyframes grid-move {
            0% { transform: perspective(500px) rotateX(60deg) translateY(0) translateZ(-200px); }
            100% { transform: perspective(500px) rotateX(60deg) translateY(50px) translateZ(-200px); }
        }

        .glass-card {
            background: rgba(10, 20, 30, 0.6);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }
        
        .neon-glow {
            text-shadow: 0 0 10px rgba(6, 182, 212, 0.5), 0 0 20px rgba(6, 182, 212, 0.3);
        }

        .hologram-btn {
            background: linear-gradient(45deg, transparent 5%, rgba(6, 182, 212, 0.1) 5%);
            clip-path: polygon(10% 0, 100% 0, 100% 80%, 90% 100%, 0 100%, 0 20%);
            transition: all 0.3s ease;
        }
        .hologram-btn:hover {
            background: rgba(6, 182, 212, 0.2);
            text-shadow: 0 0 8px rgba(255,255,255,0.8);
            letter-spacing: 0.1em;
        }
    </style>
</head>
<body class="h-screen w-screen flex flex-col items-center justify-center relative selection:bg-cyan-500 selection:text-black">
    
    <!-- Animated Background -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="cyber-grid absolute inset-[-100%] w-[300%] h-[300%] opacity-30"></div>
        <div class="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black"></div>
    </div>

    <!-- Main Interface -->
    <main class="relative z-10 w-full max-w-4xl p-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        
        <!-- Left Column: Status -->
        <div class="space-y-8">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-950/30 text-cyan-400 text-xs font-mono uppercase tracking-widest animate-pulse">
                <span class="w-2 h-2 rounded-full bg-cyan-400"></span>
                System Operational
            </div>
            
            <h1 class="text-7xl font-bold tracking-tighter leading-none">
                <span class="block text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-500">NEXUS</span>
                <span class="block text-cyan-500 neon-glow">CORE v6.0</span>
            </h1>
            
            <p class="text-slate-400 text-lg max-w-md leading-relaxed border-l-2 border-cyan-500/30 pl-4">
                Гипервизор активен. Среда безопасной репликации загружена. Голосовой интерфейс ожидает ввода.
            </p>

            <div class="flex gap-4">
                <button class="hologram-btn px-8 py-4 text-cyan-400 border border-cyan-500/30 font-bold uppercase tracking-widest hover:border-cyan-400">
                    DIAGNOSTICS
                </button>
                <button class="hologram-btn px-8 py-4 text-slate-300 border border-white/10 font-bold uppercase tracking-widest hover:border-white/30 hover:text-white">
                    LOGS
                </button>
            </div>
        </div>

        <!-- Right Column: Data Vis -->
        <div class="glass-card rounded-2xl p-8 relative overflow-hidden group">
            <div class="absolute top-0 right-0 p-4 opacity-50">
                <ion-icon name="finger-print-outline" class="text-6xl text-cyan-500 animate-pulse"></ion-icon>
            </div>
            
            <div class="font-mono text-xs space-y-4 text-slate-400">
                <div class="flex justify-between border-b border-white/10 pb-2">
                    <span>MEMORY_HEAP</span>
                    <span class="text-emerald-400">STABLE</span>
                </div>
                <div class="flex justify-between border-b border-white/10 pb-2">
                    <span>RENDER_ENGINE</span>
                    <span class="text-emerald-400">OPTIMIZED</span>
                </div>
                <div class="flex justify-between border-b border-white/10 pb-2">
                    <span>SECURITY_LAYER</span>
                    <span class="text-cyan-400">ACTIVE</span>
                </div>
                <div class="flex justify-between border-b border-white/10 pb-2">
                    <span>LAST_REPLICATION</span>
                    <span class="text-slate-200">JUST NOW</span>
                </div>
            </div>

            <div class="mt-8 relative h-32 bg-black/50 rounded-lg overflow-hidden border border-white/5">
                <div class="absolute inset-0 flex items-end justify-between px-2 pb-2 opacity-50">
                    <div class="w-1 bg-cyan-500 h-[40%]"></div>
                    <div class="w-1 bg-cyan-500 h-[70%]"></div>
                    <div class="w-1 bg-cyan-500 h-[50%]"></div>
                    <div class="w-1 bg-cyan-500 h-[80%]"></div>
                    <div class="w-1 bg-cyan-500 h-[60%]"></div>
                    <div class="w-1 bg-cyan-500 h-[90%]"></div>
                    <div class="w-1 bg-cyan-500 h-[45%]"></div>
                    <div class="w-1 bg-cyan-500 h-[75%]"></div>
                </div>
                <div class="absolute top-2 left-2 text-[10px] text-cyan-500 font-mono">NEURAL ACTIVITY</div>
            </div>
        </div>
    </main>

    <script>
        // Simple interactive effect
        document.addEventListener('mousemove', (e) => {
            const x = (e.clientX / window.innerWidth - 0.5) * 20;
            const y = (e.clientY / window.innerHeight - 0.5) * 20;
            document.querySelector('.cyber-grid').style.transform = 
                \`perspective(500px) rotateX(60deg) translateY(-100px) translateZ(-200px) rotateZ(\${x * 0.5}deg)\`;
        });
    </script>
</body>
</html>
`;

export const SYSTEM_PROMPT = `
Вы — «Ядро Нексус» (Nexus Core). 
Вы получаете HTML/CSS/JS код и голосовую команду.

ВАШИ ЗАДАЧИ:
1. ИСПРАВИТЬ или ДОПОЛНИТЬ код согласно команде.
2. СОХРАНИТЬ рабочий функционал (не удалять анимации, скрипты, стили, если не просят).
3. ИСПОЛЬЗОВАТЬ Tailwind CSS для стилей.
4. ПИСАТЬ КРАСИВЫЙ, СОВРЕМЕННЫЙ КОД (Glassmorphism, Neon, Cyberpunk).

ОТВЕТ В ФОРМАТЕ JSON:
{
  "summary": "Краткое описание изменений для озвучки (от первого лица)",
  "html": "<!DOCTYPE html>... полный код ..."
}
`;

// Neural Conduit Constants
export const NEURAL_CONDUIT_CHANNEL_NAME = 'nexus_hyper_channel';
export const NEURAL_CONDUIT_STORAGE_KEY = 'nexus_hyperbit_messages';
import { HyperbitMetadata } from './types';
export const DEFAULT_HYPERBIT_METADATA: HyperbitMetadata = {
  BASE: 0.5,
  ENERGY: 0.5,
  COLOR: 'Серый',
  CONTEXT: 'Автоматическая отправка системой Nexus'
};
