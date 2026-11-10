import { useMemo, useState } from 'react';
import { semAcento } from '../lib/texto';
import FormAnuncio from './FormAnuncio';
import { publico } from '../lib/url';

const porOrdem = (a, b) => (a.ordem ?? 0) - (b.ordem ?? 0);

/** Move o item da posição `de` para a posição `para` */
const mover = (lista, de, para) => {
  const nova = [...lista];
  const [item] = nova.splice(de, 1);
  nova.splice(para, 0, item);
  return nova;
};

export default function ListaAnuncios({ dados, onAlterar, onReordenar }) {
  const [busca, setBusca] = useState('');
  const [editando, setEditando] = useState(null);
  const [previa, setPrevia] = useState(null); // ordem provisória enquanto arrasta
  const [arrastando, setArrastando] = useState(null); // id do anúncio sendo arrastado
  const [salvando, setSalvando] = useState(false);

  const vinculos = useMemo(() => {
    const m = new Map();
    dados.prestadores.forEach((p) => p.anuncioId && m.set(p.anuncioId, (m.get(p.anuncioId) || 0) + 1));
    return m;
  }, [dados.prestadores]);

  const ordenados = useMemo(() => [...dados.anuncios].sort(porOrdem), [dados.anuncios]);
  const filtrando = busca.trim() !== '';
  const podeArrastar = !filtrando && !salvando;

  const lista = useMemo(() => {
    if (previa) return previa;
    if (!filtrando) return ordenados;
    const t = semAcento(busca);
    return ordenados.filter((a) => semAcento(a.nome + ' ' + a.categoria).includes(t));
  }, [ordenados, previa, filtrando, busca]);

  const salvarOrdem = async (nova) => {
    const mudou = nova.some((a, i) => a.id !== ordenados[i]?.id);
    if (!mudou) return setPrevia(null);
    setSalvando(true);
    setPrevia(nova);
    try {
      await onReordenar(nova);
    } finally {
      setPrevia(null);
      setSalvando(false);
    }
  };

  // --- Arrastar e soltar ---
  const aoIniciar = (e, id) => {
    setArrastando(id);
    setPrevia(ordenados);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id); // necessário no Firefox
  };
  const aoPassar = (e, idAlvo) => {
    e.preventDefault();
    if (!arrastando || idAlvo === arrastando) return;
    setPrevia((atual) => {
      const de = atual.findIndex((a) => a.id === arrastando);
      const para = atual.findIndex((a) => a.id === idAlvo);
      return de === -1 || para === -1 ? atual : mover(atual, de, para);
    });
  };
  const aoSoltar = (e) => {
    e.preventDefault();
    const nova = previa;
    setArrastando(null);
    if (nova) salvarOrdem(nova);
  };
  const aoCancelar = () => {
    // dragend sem drop válido (ex.: soltou fora): descarta a prévia
    if (arrastando) {
      setArrastando(null);
      setPrevia(null);
    }
  };

  // --- Setas (teclado / ajuste fino) ---
  const empurrar = (indice, direcao) => {
    const para = indice + direcao;
    if (para < 0 || para >= ordenados.length) return;
    salvarOrdem(mover(ordenados, indice, para));
  };

  return (
    <section className="adm-bloco">
      <div className="adm-barra">
        <input
          className="adm-input adm-barra__busca"
          type="search"
          placeholder="Buscar anúncio…"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
        <button className="botao botao--verde botao--pequeno" onClick={() => setEditando('novo')}>
          + Novo anúncio
        </button>
      </div>
      <p className="adm-contagem">
        {salvando
          ? 'Salvando a nova ordem…'
          : filtrando
            ? `${lista.length} anúncio(s) · limpe a busca para reordenar`
            : `${lista.length} anúncio(s) · arraste os cards para definir a ordem do carrossel de destaques`}
      </p>

      <ul className={`adm-anuncios ${arrastando ? 'adm-anuncios--arrastando' : ''}`} onDragOver={(e) => podeArrastar && e.preventDefault()} onDrop={aoSoltar}>
        {lista.map((a, i) => (
          <li
            key={a.id}
            draggable={podeArrastar}
            onDragStart={(e) => aoIniciar(e, a.id)}
            onDragOver={(e) => podeArrastar && aoPassar(e, a.id)}
            onDragEnd={aoCancelar}
            className={`adm-anuncios__item ${arrastando === a.id ? 'adm-anuncios__item--movendo' : ''}`}
          >
            <button className={`adm-anuncio ${a.ativo === false ? 'inativo' : ''}`} onClick={() => setEditando(a)} draggable={false}>
              <span className="adm-anuncio__img">
                {a.imagemUrl ? <img src={publico(a.imagemUrl)} alt="" loading="lazy" draggable={false} /> : <em>Sem imagem</em>}
                {!filtrando && <span className="adm-anuncio__posicao">{i + 1}º</span>}
              </span>
              <span className="adm-anuncio__nome">{a.nome}</span>
              <span className="adm-anuncio__meta">{a.categoria}</span>
              <span className="adm-anuncio__selos">
                {a.ativo === false ? <span className="adm-selo adm-selo--off">Inativo</span> : <span className="adm-selo adm-selo--on">Ativo</span>}
                {a.destaque && <span className="adm-selo">Destaque</span>}
                {vinculos.get(a.id) > 0 && <span className="adm-selo">{vinculos.get(a.id)} prestador(es)</span>}
              </span>
            </button>
            {!filtrando && (
              <div className="adm-anuncio__mover">
                <span className="adm-anuncio__alca" aria-hidden="true" title="Arraste para mover">⠿</span>
                <button onClick={() => empurrar(i, -1)} disabled={i === 0 || salvando} aria-label={`Mover ${a.nome} para antes`}>←</button>
                <button onClick={() => empurrar(i, 1)} disabled={i === lista.length - 1 || salvando} aria-label={`Mover ${a.nome} para depois`}>→</button>
              </div>
            )}
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
