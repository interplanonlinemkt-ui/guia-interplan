import { useEffect, useRef, useState } from 'react';
import { publico } from '../lib/url';
import setaEsquerda from '../assets/seta-esquerda.svg';
import setaDireita from '../assets/seta-direita.svg';

export default function Destaques({ anuncios, onAbrir }) {
  const trilho = useRef(null);
  const [limites, setLimites] = useState({ inicio: true, fim: false });

  const atualizar = () => {
    const el = trilho.current;
    if (!el) return;
    setLimites({
      inicio: el.scrollLeft <= 4,
      fim: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4,
    });
  };

  useEffect(() => {
    atualizar();
    window.addEventListener('resize', atualizar);
    return () => window.removeEventListener('resize', atualizar);
  }, [anuncios]);

  const rolar = (dir) => {
    const el = trilho.current;
    el.scrollBy({ left: dir * el.clientWidth, behavior: 'smooth' });
  };

  return (
    <section className="destaques" aria-labelledby="titulo-destaques">
      <h2 id="titulo-destaques" className="titulo-secao">
        Parceiros em destaque
      </h2>
      <div className="destaques__area">
        <button
          className="destaques__seta destaques__seta--esq"
          onClick={() => rolar(-1)}
          disabled={limites.inicio}
          aria-label="Destaques anteriores"
        >
          <img src={setaEsquerda} alt="" width="53" height="53" />
        </button>
        <ul className="destaques__trilho" ref={trilho} onScroll={atualizar}>
          {anuncios.map((a) => (
            <li key={a.id}>
              <button className="destaque" onClick={() => onAbrir(a)}>
                <span className="destaque__imagem">
                  <img src={publico(a.imagemUrl)} alt="" loading="lazy" />
                </span>
                <span className="destaque__nome">{a.nome}</span>
              </button>
            </li>
          ))}
        </ul>
        <button
          className="destaques__seta destaques__seta--dir"
          onClick={() => rolar(1)}
          disabled={limites.fim}
          aria-label="Próximos destaques"
        >
          <img src={setaDireita} alt="" width="53" height="53" />
        </button>
      </div>
    </section>
  );
}
