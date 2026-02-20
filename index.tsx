import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// #region agent log
fetch('http://127.0.0.1:7242/ingest/d0a4301c-b84f-4c55-bddc-e10b88093a8c', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    id: `log_${Date.now()}_index_entry`,
    timestamp: Date.now(),
    location: 'index.tsx:before-root',
    message: 'Index entry executed before ReactDOM.createRoot',
    data: {},
    runId: 'pre-fix',
    hypothesisId: 'H1'
  })
}).catch(() => {});
// #endregion

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);