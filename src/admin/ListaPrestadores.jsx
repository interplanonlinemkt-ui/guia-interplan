import { useMemo, useState } from 'react';
import { semAcento, comparar, compararNomes, formatarTelefone } from '../lib/texto';
import FormPrestador from './FormPrestador';

const POR_PAGINA = 50;

export default function ListaPrestadores({ dados, onAlterar }) {
  const [busca, setBusca] = useState('');
  const [cidade, setCidade] = useState('');
  const [status, setStatus] = useState('todos');
  const [pagina, setPagina] = useState(1);
  const [editando, setEditando] = useState(null); // objeto ou 'novo'

  const anuncios = useMemo(() => new Map(dados.anuncios.map((a) => [a.id, a])), [dados.anuncios]);
  const cidades = useMemo(() => [...new Set(dados.prestadores.map((p) => p.cidade))].sort(comparar), [dados.prestadores]);

  const lista = useMemo(() => {
    const termos = semAcento(busca).split(/\s+/).filter(Boolean);
    return dados.prestadores
      .filter((p) => {
        if (cidade && p.cidade !== cidade) return false;
        if (status === 'ativos' && p.ativo === false) return false;
        if (status === 'inativos' && p.ativo !== false) return false;
        if (status === 'notas' && !p.notaInterna) return false;
        const t = semAcento([p.nome, p.especialidade, p.endereco, p.bairro, p.cidade, ...(p.telefones || [])].join(' '));
        return termos.every((x) => t.includes(x));
      })
      .sort((a, b) => compararNomes(a.nome, b.nome));
  }, [dados.prestadores, busca, cidade, status]);

  const totalPag = Math.max(1, Math.ceil(lista.length / POR_PAGINA));
  const pag = Math.min(pagina, totalPag);
  const visiveis = lista.slice((pag - 1) * POR_PAGINA, pag * POR_PAGINA);
  const filtrar = (fn) => (e) => (fn(e.target.value), setPagina(1));

  return (
    <section className="adm-bloco">
      <div className="adm-barra">
        <input className="adm-input adm-barra__busca" type="search" placeholder="Buscar por nome, especialidade, telefone…" value={busca} onChange={filtrar(setBusca)} />
        <select className="adm-input" value={cidade} onChange={filtrar(setCidade)}>
          <option value="">Todas as cidades</option>
          {cidades.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select className="adm-input" value={status} onChange={filtrar(setStatus)}>
          <option value="todos">Todos</option>
          <option value="ativos">Só ativos</option>
          <option value="inativos">Só inativos</option>
          <option value="notas">Com nota interna (revisar)</option>
        </select>
        <button className="botao botao--verde botao--pequeno" onClick={() => setEditando('novo')}>
          + Novo prestador
        </button>
      </div>

      <p className="adm-contagem">{lista.length} prestador(es)</p>

      <div className="adm-tabela-wrap">
        <table className="adm-tabela">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Especialidade</th>
              <th>Cidade</th>
              <th>Telefone</th>
              <th>Situação</th>
            </tr>
          </thead>
          <tbody>
            {visiveis.map((p) => (
              <tr key={p.id} onClick={() => setEditando(p)} className={p.ativo === false ? 'inativo' : ''}>
                <td>
                  <button className="adm-tabela__nome" onClick={() => setEditando(p)}>{p.nome}</button>
                  {p.notaInterna && <span className="adm-selo adm-selo--alerta" title={p.notaInterna}>revisar</span>}
                  {p.anuncioId && anuncios.has(p.anuncioId) && <span className="adm-selo">anúncio</span>}
                </td>
                <td>{p.especialidade}</td>
                <td>{p.cidade}</td>
                <td>{(p.telefones || []).map(formatarTelefone).join(' · ') || '—'}</td>
                <td>{p.ativo === false ? <span className="adm-selo adm-selo--off">Inativo</span> : <span className="adm-selo adm-selo--on">Ativo</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPag > 1 && (
        <div className="adm-paginas">
          <button className="adm-link" disabled={pag === 1} onClick={() => setPagina(pag - 1)}>← Anterior</button>
          <span>Página {pag} de {totalPag}</span>
          <button className="adm-link" disabled={pag === totalPag} onClick={() => setPagina(pag + 1)}>Próxima →</button>
        </div>
      )}

      {editando && (
        <FormPrestador
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
