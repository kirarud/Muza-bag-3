

import { HyperbitMessage, HyperbitMetadata, HyperbitPayload } from '../types';
import { NEURAL_CONDUIT_CHANNEL_NAME, NEURAL_CONDUIT_STORAGE_KEY, DEFAULT_HYPERBIT_METADATA } from '../constants';

/**
 * NEURAL CONDUIT SERVICE v1.0
 * Обеспечивает межвкладочный буфер обмена для обмена "гипербитами" данных.
 * Использует BroadcastChannel для реального времени и localStorage для персистентности.
 */

class NeuralConduitService {
  private channel: BroadcastChannel;
  private listeners: Set<(message: HyperbitMessage) => void> = new Set();
  private currentTabId: string;

  constructor() {
    this.currentTabId = this.generateTabId();
    this.channel = new BroadcastChannel(NEURAL_CONDUIT_CHANNEL_NAME);
    this.channel.onmessage = this.handleBroadcastMessage;
    window.addEventListener('storage', this.handleStorageEvent);
  }

  // Generate a unique ID for the current tab/window
  private generateTabId(): string {
    let id = sessionStorage.getItem('nexus_tab_id');
    if (!id) {
      id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      sessionStorage.setItem('nexus_tab_id', id);
    }
    return id;
  }

  // Handle messages received from other tabs via BroadcastChannel
  private handleBroadcastMessage = (event: MessageEvent) => {
    const message: HyperbitMessage = event.data;
    if (message && message.senderId !== this.currentTabId) { // Ignore messages from self
      this.addMessageToStorage(message); // Add to local storage for persistence and sync
      this.listeners.forEach(callback => callback(message));
    }
  };

  // Handle messages received from other tabs via localStorage 'storage' event
  private handleStorageEvent = (event: StorageEvent) => {
    if (event.key === NEURAL_CONDUIT_STORAGE_KEY && event.newValue) {
      // Logic to detect new messages from localStorage changes
      const oldMessages = event.oldValue ? JSON.parse(event.oldValue) : [];
      const newMessages = JSON.parse(event.newValue);
      
      if (newMessages.length > oldMessages.length) {
        const latestMessage = newMessages[newMessages.length - 1];
        if (latestMessage && latestMessage.senderId !== this.currentTabId) { // Ensure it's not a self-induced change
            this.listeners.forEach(callback => callback(latestMessage));
        }
      }
    }
  };

  // Add a message to localStorage and notify other tabs
  private addMessageToStorage(message: HyperbitMessage) {
    const messages = this.getMessages();
    messages.push(message);
    localStorage.setItem(NEURAL_CONDUIT_STORAGE_KEY, JSON.stringify(messages));
  }

  /**
   * Отправляет Hyperbit сообщение в межвкладочный буфер.
   * @param type Тип содержимого сообщения.
   * @param payloadData Данные полезной нагрузки (объект или строка).
   * @param hyperbitMetadata Метаданные Гипербита.
   */
  sendHyperbitMessage(
    type: HyperbitMessage['type'], 
    payloadData: any, 
    hyperbitMetadata: Partial<HyperbitMetadata> = {}
  ): void {
    const message: HyperbitMessage = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      senderId: this.currentTabId,
      type: type,
      payload: JSON.stringify(payloadData),
      hyperbit: { ...DEFAULT_HYPERBIT_METADATA, ...hyperbitMetadata },
      sourceUrl: window.location.href,
    };
    
    this.addMessageToStorage(message);
    this.channel.postMessage(message); // Broadcast to other tabs
    console.log(`[NeuralConduit] Sent message (${type}):`, message);
  }

  /**
   * Возвращает все сообщения из Гипербуфера.
   */
  getMessages(): HyperbitMessage[] {
    try {
      const messages = localStorage.getItem(NEURAL_CONDUIT_STORAGE_KEY);
      return messages ? JSON.parse(messages) : [];
    } catch (e) {
      console.error("[NeuralConduit] Failed to retrieve messages from storage:", e);
      return [];
    }
  }

  /**
   * Очищает все сообщения из Гипербуфера.
   */
  clearMessages(): void {
    localStorage.removeItem(NEURAL_CONDUIT_STORAGE_KEY);
    this.channel.postMessage({ type: 'CLEAR_ALL_MESSAGES', senderId: this.currentTabId }); // Notify other tabs to clear
    this.listeners.forEach(callback => callback({ id: 'clear', timestamp: Date.now(), senderId: 'system', type: 'RAW_INSTRUCTION', payload: 'cleared', hyperbit: DEFAULT_HYPERBIT_METADATA, sourceUrl: '' }));
    console.log("[NeuralConduit] Cleared all messages.");
  }

  /**
   * Подписывает колбэк на новые сообщения Гипербуфера.
   * @returns Функция отписки.
   */
  onNewMessage(callback: (message: HyperbitMessage) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }
}

export const neuralConduitService = new NeuralConduitService();
