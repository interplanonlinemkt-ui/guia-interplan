import { useState } from 'react';
import iconeBusca from '../assets/icone-busca.svg';

export default function Filtros({ busca, cidade, especialidade, opcoes, onChange, onLimpar, mobile }) {
  const [aberto, setAberto] = useState(false);
  const ativos = [cidade, especialidade].filter(Boolean).length;
  const algumFiltro = Boolean(busca || cidade || especialidade);

  const selects = (
    <>
      <label className="campo campo--select">
        <span className="sr-only">Cidade</span>
        <select value={cidade} onChange={(e) => onChange('cidade', e.target.value)}>
          <option value="">Cidade</option>
          {opcoes.cidades.map((c) => (
            <option key={c.valor} value={c.valor}>
              {c.valor} ({c.total})
            </option>
          ))}
        </select>
      </label>
      <label className="campo campo--select">
        <span className="sr-only">Especialidade</span>
        <select value={especialidade} onChange={(e) => onChange('esp', e.target.value)}>
          <option value="">Especialidade</option>
          {opcoes.especialidades.map((c) => (
            <option key={c.valor} value={c.valor}>
              {c.valor} ({c.total})
            </option>
          ))}
        </select>
      </label>
      <button className="botao botao--verde filtros__limpar" onClick={onLimpar} disabled={!algumFiltro}>
        Limpar filtros
      </button>
    </>
  );

  return (
    <div className="filtros" role="search">
      <label className="campo campo--busca">
        <img src={iconeBusca} alt="" width="21" height="21" />
        <span className="sr-only">Procure pela sua necessidade</span>
        <input
          type="search"
          placeholder="Procure pela sua necessidade"
          value={busca}
          onChange={(e) => onChange('q', e.target.value)}
          autoComplete="off"
          enterKeyHint="search"
        />
      </label>

      {mobile ? (
        <>
          <button
            className="botao botao--contorno filtros__alternar"
            onClick={() => setAberto((v) => !v)}
            aria-expanded={aberto}
            aria-controls="filtros-extra"
          >
            Filtros{ativos > 0 && ` (${ativos})`}
          </button>
          {aberto && (
            <div className="filtros__extra" id="filtros-extra">
              {selects}
            </div>
          )}
        </>
      ) : (
        selects
      )}
    </div>
  );
}
