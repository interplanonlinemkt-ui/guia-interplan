import React, { lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Guia from './Guia';
import './styles/base.css';

const Admin = lazy(() => import('./admin/Admin'));

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Guia />} />
        <Route
          path="/admin/*"
          element={
            <Suspense fallback={<div className="carregando">Carregando…</div>}>
              <Admin />
            </Suspense>
          }
        />
        <Route path="*" element={<Guia />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
