import { useMemo, useState } from 'react';
import { semAcento } from '../lib/texto';
import FormAnuncio from './FormAnuncio';
import { publico } from '../lib/url';

export default function ListaAnuncios({ dados, onAlterar }) {
  const [busca, setBusca] = useState('');
  const [editando, setEditando] = useState(null);

  const vinculos = useMemo(() => {
    const m = new Map();
    dados.prestadores.forEach((p) => p.anuncioId && m.set(p.anuncioId, (m.get(p.anuncioId) || 0) + 1));
    return m;
  }, [dados.prestadores]);

  const lista = useMemo(() => {
    const t = semAcento(busca);
    return [...dados.anuncios]
      .filter((a) => semAcento(a.nome + ' ' + a.categoria).includes(t))
      .sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0));
  }, [dados.anuncios, busca]);

  return (
    <section className="adm-bloco">
      <div className="adm-barra">
        <input className="adm-input adm-barra__busca" type="search" placeholder="Buscar anúncio…" value={busca} onChange={(e) => setBusca(e.target.value)} />
        <button className="botao botao--verde botao--pequeno" onClick={() => setEditando('novo')}>
          + Novo anúncio
        </button>
      </div>
      <p className="adm-contagem">{lista.length} anúncio(s) · a ordem define a sequência no carrossel de destaques</p>

      <ul className="adm-anuncios">
        {lista.map((a) => (
          <li key={a.id}>
            <button className={`adm-anuncio ${a.ativo === false ? 'inativo' : ''}`} onClick={() => setEditando(a)}>
              <span className="adm-anuncio__img">
                {a.imagemUrl ? <img src={publico(a.imagemUrl)} alt="" loading="lazy" /> : <em>Sem imagem</em>}
              </span>
              <span className="adm-anuncio__nome">{a.nome}</span>
              <span className="adm-anuncio__meta">
                #{a.ordem ?? '—'} · {a.categoria}
              </span>
              <span className="adm-anuncio__selos">
                {a.ativo === false ? <span className="adm-selo adm-selo--off">Inativo</span> : <span className="adm-selo adm-selo--on">Ativo</span>}
                {a.destaque && <span className="adm-selo">Destaque</span>}
                {vinculos.get(a.id) > 0 && <span className="adm-selo">{vinculos.get(a.id)} prestador(es)</span>}
              </span>
            </button>
          </li>
        ))}
      </ul>

      {editando && (
        <FormAnuncio
          inicial={editando === 'novo' ? null : editando}
          dados={dados}
          onFechar={() => setEditando(null)}
          onSalvar={async (item, acao) => {
            await onAlterar(item, acao);
            setEditando(null);
          }}
        />
      )}
    </section>
  );
}
