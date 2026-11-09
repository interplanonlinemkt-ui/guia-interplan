import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

/**
 * Modal acessível: fecha no X (canto superior direito), na tecla Esc
 * e ao clicar fora. Trava a rolagem da página e devolve o foco ao sair.
 */
export default function Modal({ titulo, onFechar, children, largura = 960, className = '' }) {
  const caixa = useRef(null);

  useEffect(() => {
    const anterior = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    caixa.current?.focus();

    const teclado = (e) => {
      if (e.key === 'Escape') onFechar();
      if (e.key === 'Tab') {
        const foco = caixa.current.querySelectorAll(
          'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!foco.length) return;
        const [primeiro, ultimo] = [foco[0], foco[foco.length - 1]];
        if (e.shiftKey && document.activeElement === primeiro) (e.preventDefault(), ultimo.focus());
        else if (!e.shiftKey && document.activeElement === ultimo) (e.preventDefault(), primeiro.focus());
      }
    };
    document.addEventListener('keydown', teclado);
    return () => {
      document.removeEventListener('keydown', teclado);
      document.body.style.overflow = overflow;
      anterior?.focus?.();
    };
  }, [onFechar]);

  return createPortal(
    <div className="modal__fundo" onMouseDown={(e) => e.target === e.currentTarget && onFechar()}>
      <div
        className={`modal ${className}`}
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        tabIndex={-1}
        ref={caixa}
        style={{ maxWidth: largura }}
      >
        <button className="modal__fechar" onClick={onFechar} aria-label="Fechar">
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            <path d="M2 2l14 14M16 2L2 16" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        </button>
        {children}
      </div>
    </div>,
    document.body
  );
}
