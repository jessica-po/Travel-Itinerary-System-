import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { SupabaseContextProvider } from './context/SupabaseContext.tsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SupabaseContextProvider>
      <App />
    </SupabaseContextProvider>
  </StrictMode>,
);
