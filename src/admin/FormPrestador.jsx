import { useMemo, useState } from 'react';
import Modal from '../components/Modal';
import { comparar, digitos } from '../lib/texto';
import { novoId } from './servico';

const VAZIO = {
  nome: '', especialidade: '', grupo: 'medicos', cidade: 'Presidente Prudente', endereco: '', bairro: '',
  telefones: ['', ''], observacao: '', notaInterna: '', anuncioId: null, ativo: true,
};

export default function FormPrestador({ inicial, dados, onFechar, onSalvar }) {
  const [f, setF] = useState(() => {
    const base = { ...VAZIO, ...(inicial || {}) };
    const tels = [...(base.telefones || [])];
    while (tels.length < 3) tels.push('');
    return { ...base, telefones: tels };
  });
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  const listas = useMemo(() => {
    const uniq = (campo) => [...new Set(dados.prestadores.map((p) => p[campo]).filter(Boolean))].sort(comparar);
    return { especialidades: uniq('especialidade'), cidades: uniq('cidade'), bairros: uniq('bairro') };
  }, [dados.prestadores]);

  const grupos = Object.entries(dados.config?.grupos || {});
  const anuncios = [...dados.anuncios].sort((a, b) => comparar(a.nome, b.nome));

  const set = (campo) => (e) => {
    const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setF((x) => ({ ...x, [campo]: v }));
  };
  const setTel = (i) => (e) =>
    setF((x) => ({ ...x, telefones: x.telefones.map((t, j) => (j === i ? e.target.value : t)) }));

  // Ao escolher uma especialidade já existente, sugere o mesmo grupo
  const aoEscolherEsp = (e) => {
    const esp = e.target.value;
    const igual = dados.prestadores.find((p) => p.especialidade === esp);
    setF((x) => ({ ...x, especialidade: esp, grupo: igual?.grupo || x.grupo }));
  };

  const telefonesInvalidos = f.telefones.filter((t) => t && ![10, 11].includes(digitos(t).length));

  const enviar = async (e) => {
    e.preventDefault();
    setErro('');
    if (telefonesInvalidos.length) return setErro('Telefone com número de dígitos inválido. Use DDD + número (10 ou 11 dígitos).');
    const item = {
      ...f,
      id: f.id || novoId(f.nome),
      nome: f.nome.trim(),
      especialidade: f.especialidade.trim(),
      cidade: f.cidade.trim(),
      endereco: f.endereco.trim(),
      bairro: f.bairro.trim(),
      observacao: f.observacao.trim(),
      notaInterna: f.notaInterna.trim(),
      telefones: f.telefones.map(digitos).filter(Boolean),
      anuncioId: f.anuncioId || null,
    };
    setSalvando(true);
    try {
      await onSalvar(item, 'salvar');
    } catch (err) {
      setErro('Erro ao salvar: ' + err.message);
      setSalvando(false);
    }
  };

  const remover = async () => {
    if (!window.confirm(`Excluir "${f.nome}" definitivamente? Para só tirar do site, desmarque "Ativo".`)) return;
    setSalvando(true);
    try {
      await onSalvar(f, 'excluir');
    } catch (err) {
      setErro('Erro ao excluir: ' + err.message);
      setSalvando(false);
    }
  };

  return (
    <Modal titulo={inicial ? 'Editar prestador' : 'Novo prestador'} onFechar={onFechar} largura={760}>
      <form className="adm-form adm-form--modal" onSubmit={enviar}>
        <h2>{inicial ? 'Editar prestador' : 'Novo prestador'}</h2>

        <label className="adm-campo">
          <span>Nome *</span>
          <input value={f.nome} onChange={set('nome')} required placeholder="Ex.: Dra. Maria da Silva" />
        </label>

        <div className="adm-grade2">
          <label className="adm-campo">
            <span>Especialidade *</span>
            <input value={f.especialidade} onChange={aoEscolherEsp} list="lst-esp" required />
            <datalist id="lst-esp">{listas.especialidades.map((x) => <option key={x} value={x} />)}</datalist>
          </label>
          <label className="adm-campo">
            <span>Grupo</span>
            <select value={f.grupo} onChange={set('grupo')}>
              {grupos.map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </label>
        </div>

        <div className="adm-grade2">
          <label className="adm-campo">
            <span>Endereço</span>
            <input value={f.endereco} onChange={set('endereco')} placeholder="Rua, número" />
          </label>
          <label className="adm-campo">
            <span>Bairro</span>
            <input value={f.bairro} onChange={set('bairro')} list="lst-bairro" />
            <datalist id="lst-bairro">{listas.bairros.map((x) => <option key={x} value={x} />)}</datalist>
          </label>
        </div>

        <label className="adm-campo">
          <span>Cidade *</span>
          <input value={f.cidade} onChange={set('cidade')} list="lst-cidade" required />
          <datalist id="lst-cidade">{listas.cidades.map((x) => <option key={x} value={x} />)}</datalist>
        </label>

        <fieldset className="adm-campo">
          <span>Telefones (com DDD) — celulares ganham botão de WhatsApp automaticamente</span>
          <div className="adm-grade3">
            {f.telefones.map((t, i) => (
              <input key={i} value={t} onChange={setTel(i)} inputMode="tel" placeholder={i === 0 ? '(18) 3222-0000' : 'Opcional'}
                aria-invalid={telefonesInvalidos.includes(t) || undefined} />
            ))}
          </div>
        </fieldset>

        <label className="adm-campo">
          <span>Observação pública (aparece no card)</span>
          <input value={f.observacao} onChange={set('observacao')} placeholder="Ex.: Atendimento online / Atendimento em domicílio" />
        </label>

        <label className="adm-campo">
          <span>Nota interna (só o ADM vê)</span>
          <textarea value={f.notaInterna} onChange={set('notaInterna')} rows={2} />
        </label>

        <label className="adm-campo">
          <span>Anúncio vinculado (botão "Ver anúncio")</span>
          <select value={f.anuncioId || ''} onChange={set('anuncioId')}>
            <option value="">Nenhum</option>
            {anuncios.map((a) => <option key={a.id} value={a.id}>{a.nome}</option>)}
          </select>
        </label>

        <label className="adm-check">
          <input type="checkbox" checked={f.ativo !== false} onChange={set('ativo')} />
          Ativo (aparece no site)
        </label>

        {erro && <p className="adm-erro" role="alert">{erro}</p>}

        <div className="adm-form__acoes">
          {inicial && (
            <button type="button" className="adm-link adm-link--perigo" onClick={remover} disabled={salvando}>
              Excluir definitivamente
            </button>
          )}
          <button type="button" className="botao botao--contorno botao--pequeno" onClick={onFechar}>Cancelar</button>
          <button className="botao botao--escuro botao--pequeno" disabled={salvando}>
            {salvando ? 'Salvando…' : 'Salvar'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
