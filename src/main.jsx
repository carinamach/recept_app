import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import App from '@/App.jsx';
import { RecipeProvider } from '@/context/RecipeContext.jsx';
import { ThemeProvider } from '@/context/ThemeContext.jsx';
import '@/index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <RecipeProvider>
          <App />
        </RecipeProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
);
