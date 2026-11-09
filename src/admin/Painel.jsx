import { useCallback, useEffect, useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from './fb';
import { carregarTudo, salvar, excluir, publicar, importarIniciais } from './servico';
import ListaPrestadores from './ListaPrestadores';
import ListaAnuncios from './ListaAnuncios';
import logo from '../assets/logo.svg';

export default function Painel({ usuario }) {
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState('');
  const [aba, setAba] = useState('prestadores');
  const [aviso, setAviso] = useState(null); // {tipo, texto}
  const [importando, setImportando] = useState(null);

  useEffect(() => {
    carregarTudo().then(setDados).catch((e) => setErro(e.message));
  }, []);

  const avisar = useCallback((tipo, texto) => {
    setAviso({ tipo, texto });
    if (tipo === 'ok') setTimeout(() => setAviso((a) => (a?.texto === texto ? null : a)), 3500);
  }, []);

  /** Salva/exclui um item, atualiza a tela e republica o site */
  const alterar = async (colecao, item, acao = 'salvar') => {
    const lista = dados[colecao];
    const nova =
      acao === 'excluir'
        ? lista.filter((x) => x.id !== item.id)
        : lista.some((x) => x.id === item.id)
          ? lista.map((x) => (x.id === item.id ? item : x))
          : [...lista, item];
    if (acao === 'excluir') await excluir(colecao, item.id);
    else await salvar(colecao, item);
    const proximo = { ...dados, [colecao]: nova };
    // Ao excluir um anúncio, solta o vínculo dos prestadores que apontavam para ele
    if (colecao === 'anuncios' && acao === 'excluir') {
      const afetados = proximo.prestadores.filter((p) => p.anuncioId === item.id);
      for (const p of afetados) await salvar('prestadores', { ...p, anuncioId: null });
      proximo.prestadores = proximo.prestadores.map((p) => (p.anuncioId === item.id ? { ...p, anuncioId: null } : p));
    }
    setDados(proximo);
    try {
      await publicar(proximo);
      avisar('ok', acao === 'excluir' ? 'Excluído e site atualizado.' : 'Salvo e site atualizado.');
    } catch (e) {
      avisar('erro', 'Salvo, mas o site não foi atualizado: ' + e.message);
    }
  };

  const importar = async () => {
    if (!window.confirm('Importar os 1.135 prestadores e 66 anúncios do site atual para o banco de dados?')) return;
    try {
      setImportando({ feito: 0, total: 1 });
      const novos = await importarIniciais((feito, total) => setImportando({ feito, total }));
      await publicar(novos);
      setDados(novos);
      avisar('ok', 'Importação concluída e site publicado.');
    } catch (e) {
      avisar('erro', 'Falha na importação: ' + e.message);
    } finally {
      setImportando(null);
    }
  };

  const baixarBackup = () => {
    const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `backup-guia-interplan-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const republicar = async () => {
    try {
      await publicar(dados);
      avisar('ok', 'Site atualizado.');
    } catch (e) {
      avisar('erro', e.message);
    }
  };

  const vazio = dados && dados.prestadores.length === 0 && dados.anuncios.length === 0;

  return (
    <div className="adm">
      <header className="adm-topo">
        <div className="adm-topo__marca">
          <img src={logo} alt="Interplan" width="160" height="30" />
          <span>Painel do Guia</span>
        </div>
        <div className="adm-topo__usuario">
          <a href="/" target="_blank" rel="noopener noreferrer" className="adm-link">
            Ver site ↗
          </a>
          <span className="adm-topo__email">{usuario.email}</span>
          <button className="botao botao--contorno botao--pequeno" onClick={() => signOut(auth)}>
            Sair
          </button>
        </div>
      </header>

      {aviso && (
        <div className={`adm-aviso adm-aviso--${aviso.tipo}`} role={aviso.tipo === 'erro' ? 'alert' : 'status'}>
          {aviso.texto}
          <button onClick={() => setAviso(null)} aria-label="Fechar aviso">×</button>
        </div>
      )}

      <main className="adm-corpo">
        {erro && <p className="adm-erro">Não foi possível carregar os dados: {erro}</p>}
        {!dados && !erro && <p>Carregando dados…</p>}

        {vazio && (
          <div className="adm-bloco adm-importar">
            <h2>Banco de dados vazio</h2>
            <p>Importe a rede do site atual para começar. Isso é feito uma única vez.</p>
            <button className="botao botao--verde" onClick={importar} disabled={Boolean(importando)}>
              {importando
                ? `Importando… ${Math.round((importando.feito / importando.total) * 100)}%`
                : 'Importar dados do site atual'}
            </button>
          </div>
        )}

        {dados && !vazio && (
          <>
            <nav className="adm-abas" role="tablist">
              <button role="tab" aria-selected={aba === 'prestadores'} onClick={() => setAba('prestadores')}>
                Prestadores <span>{dados.prestadores.length}</span>
              </button>
              <button role="tab" aria-selected={aba === 'anuncios'} onClick={() => setAba('anuncios')}>
                Anúncios <span>{dados.anuncios.length}</span>
              </button>
              <div className="adm-abas__extra">
                <button className="adm-link" onClick={republicar}>Republicar site</button>
                <button className="adm-link" onClick={baixarBackup}>Baixar backup</button>
              </div>
            </nav>

            {aba === 'prestadores' ? (
              <ListaPrestadores dados={dados} onAlterar={(item, acao) => alterar('prestadores', item, acao)} />
            ) : (
              <ListaAnuncios dados={dados} onAlterar={(item, acao) => alterar('anuncios', item, acao)} />
            )}
          </>
        )}
      </main>
    </div>
  );
}
