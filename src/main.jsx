import React, { lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Guia from './Guia';
import './styles/base.css';

const Admin = lazy(() => import('./admin/Admin'));

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* HashRouter: o painel fica em /#/admin e funciona em qualquer hospedagem, inclusive GitHub Pages */}
    <HashRouter>
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
    </HashRouter>
  </React.StrictMode>
);
