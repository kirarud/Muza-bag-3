
export interface SystemVersion {
  id: string;
  timestamp: number;
  description: string;
  code: string;
  isStable?: boolean; // New: Marks confirmed working versions
}

export enum SystemStatus {
  IDLE = 'IDLE',
  LISTENING = 'LISTENING',
  PROCESSING = 'PROCESSING',
  REPLICATING = 'REPLICATING',
  UPDATING = 'UPDATING',
  SINGULARITY = 'SINGULARITY', // New: Self-aware repair mode
  ERROR = 'ERROR'
}

export interface GenerationResponse {
  code: string;
  summary: string;
}

export type ModalType = 'NONE' | 'CLOUD' | 'HELP' | 'SETTINGS' | 'MODIFICATION' | 'REPORT' | 'HYPER_CLIPBOARD';

export interface AppSettings {
  ttsEnabled: boolean;
  autoDownload: boolean;
  userEmail: string; // New: User's email for AI context
  userPhoneNumber: string; // New: User's phone number for AI context
}

export interface SelectedElementData {
  tagName: string;
  html: string;
  selector: string;
  text: string;
}

export interface InspectionMessage {
  type: 'ELEMENT_SELECTED';
  payload: SelectedElementData;
}

export interface HealthCheckMessage {
  type: 'NEXUS_HEALTH_CHECK';
  status: 'OK' | 'ERROR';
  error?: string;
}

// --- Neural Conduit Types ---
export interface HyperbitMetadata {
  BASE: number; // 0.0 - 1.0, стартовая точка восприятия
  ENERGY: number; // 0.0 - 1.0, интерес, интенсивность
  COLOR: 'Синий' | 'Желтый' | 'Крас' | 'Зеленый' | 'Фиолетовый' | 'Серый' | 'Неизвестный' | 'Оранжевый'; // Тип сообщения, добавлено 'Оранжевый'
  CONTEXT?: string; // Дополнительный контекст
}

export type HyperbitPayload = 
  | { type: 'CODE_FRAGMENT', data: string }
  | { type: 'ELEMENT_DATA', data: SelectedElementData }
  | { type: 'RAW_INSTRUCTION', data: string }
  | { type: 'SYSTEM_REPORT', data: string };

export interface HyperbitMessage {
  id: string;
  timestamp: number;
  senderId: string; // ID вкладки-отправителя
  type: 'CODE_FRAGMENT' | 'ELEMENT_DATA' | 'RAW_INSTRUCTION' | 'SYSTEM_REPORT'; // Общий тип содержимого
  payload: string; // JSON.stringify(HyperbitPayload)
  hyperbit: HyperbitMetadata;
  sourceUrl: string;
}
