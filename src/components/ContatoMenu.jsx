import { useEffect, useId, useRef, useState } from 'react';
import iconeTelefone from '../assets/icone-telefone.svg';
import iconeWhatsapp from '../assets/icone-whatsapp.svg';
import { ehCelular, formatarTelefone, linkTelefone, linkWhatsapp } from '../lib/texto';

/** Monta as opções de contato: "Ligar" para cada número e "WhatsApp" para celulares */
export function opcoesContato(telefones = []) {
  const opcoes = [];
  telefones.forEach((n) => {
    opcoes.push({ tipo: 'tel', rotulo: `Ligar ${formatarTelefone(n)}`, href: linkTelefone(n) });
    if (ehCelular(n)) opcoes.push({ tipo: 'zap', rotulo: `WhatsApp ${formatarTelefone(n)}`, href: linkWhatsapp(n) });
  });
  return opcoes;
}

export default function ContatoMenu({ telefones, nome }) {
  const [aberto, setAberto] = useState(false);
  const raiz = useRef(null);
  const idMenu = useId();
  const opcoes = opcoesContato(telefones);
  const temZap = opcoes.some((o) => o.tipo === 'zap');

  useEffect(() => {
    if (!aberto) return;
    const fora = (e) => !raiz.current?.contains(e.target) && setAberto(false);
    const esc = (e) => e.key === 'Escape' && (setAberto(false), raiz.current?.querySelector('button')?.focus());
    document.addEventListener('pointerdown', fora);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('pointerdown', fora);
      document.removeEventListener('keydown', esc);
    };
  }, [aberto]);

  const icones = (
    <span className="contato__icones" aria-hidden="true">
      <img src={iconeTelefone} alt="" width="16" height="16" />
      {temZap && <img src={iconeWhatsapp} alt="" width="16" height="16" />}
    </span>
  );

  if (opcoes.length === 0) {
    return (
      <span className="contato contato--vazio" aria-disabled="true">
        Sem telefone cadastrado
      </span>
    );
  }

  // Um número só, fixo: o botão já liga direto.
  if (opcoes.length === 1) {
    const o = opcoes[0];
    return (
      <a className="contato" href={o.href} aria-label={`${o.rotulo} — ${nome}`}>
        {icones}
        Contato
      </a>
    );
  }

  return (
    <div className="contato__raiz" ref={raiz}>
      <button
        className="contato"
        onClick={() => setAberto((v) => !v)}
        aria-expanded={aberto}
        aria-controls={idMenu}
        aria-label={`Contato — ${nome}`}
      >
        {icones}
        Contato
      </button>
      {aberto && (
        <ul className="contato__menu" id={idMenu}>
          {opcoes.map((o) => (
            <li key={o.href}>
              <a
                href={o.href}
                className={`contato__opcao contato__opcao--${o.tipo}`}
                {...(o.tipo === 'zap' ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                onClick={() => setAberto(false)}
              >
                {o.rotulo}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
