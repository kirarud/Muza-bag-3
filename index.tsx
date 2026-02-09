
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { GlobalErrorBoundary } from './components/GlobalErrorBoundary';

const container = document.getElementById('root');

if (container) {
  const root = createRoot(container);
  // В критических ситуациях StrictMode может усложнять отладку, убираем его для стабильности
  root.render(
    <GlobalErrorBoundary>
      <App />
    </GlobalErrorBoundary>
  );
  console.log("Nexus Core: UI Mounted Successfully");
} else {
  const msg = "CRITICAL: Root element not found!";
  console.error(msg);
  document.body.innerHTML = `<div style="color:red;padding:20px;">${msg}</div>`;
}
