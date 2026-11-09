import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { carregarGuia } from './lib/dados';
import { semAcento, comparar, compararNomes, formatarNumero } from './lib/texto';
import { POR_PAGINA } from './config';
import useMobile from './lib/useMobile';
import Cabecalho from './components/Cabecalho';
import Hero from './components/Hero';
import Destaques from './components/Destaques';
import Filtros from './components/Filtros';
import CardPrestador from './components/CardPrestador';
import Paginacao from './components/Paginacao';
import ModalAnuncio from './components/ModalAnuncio';
import Rodape from './components/Rodape';
import './styles/guia.css';

export default function Guia() {
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState(false);
  const [params, setParams] = useSearchParams();
  const [pagina, setPagina] = useState(1);
  const [visiveis, setVisiveis] = useState(POR_PAGINA);
  const [anuncioAberto, setAnuncioAberto] = useState(null);
  const mobile = useMobile();
  const topoLista = useRef(null);

  const busca = params.get('q') || '';
  const cidade = params.get('cidade') || '';
  const especialidade = params.get('esp') || '';

  useEffect(() => {
    carregarGuia().then(setDados).catch(() => setErro(true));
  }, []);

  const setFiltro = (chave, valor) => {
    const p = new URLSearchParams(params);
    if (valor) p.set(chave, valor);
    else p.delete(chave);
    setParams(p, { replace: true });
    setPagina(1);
    setVisiveis(POR_PAGINA);
  };
  const limparFiltros = () => {
    setParams({}, { replace: true });
    setPagina(1);
    setVisiveis(POR_PAGINA);
  };

  // Índices de busca e mapas auxiliares
  const base = useMemo(() => {
    if (!dados) return null;
    const anuncios = new Map(dados.anuncios.map((a) => [a.id, a]));
    const lista = dados.prestadores
      .map((p) => {
        const a = p.anuncioId ? anuncios.get(p.anuncioId) : null;
        const texto = [
          p.nome, p.especialidade, p.cidade, p.endereco, p.bairro, p.observacao,
          a && [a.nome, a.palavrasChave, a.servicos.join(' ')].join(' '),
        ].join(' ');
        return { ...p, _busca: semAcento(texto) };
      })
      .sort((x, y) => comparar(x.especialidade, y.especialidade) || compararNomes(x.nome, y.nome));
    return { lista, anuncios };
  }, [dados]);

  const filtrados = useMemo(() => {
    if (!base) return [];
    const termos = semAcento(busca).split(/\s+/).filter(Boolean);
    return base.lista.filter(
      (p) =>
        (!cidade || p.cidade === cidade) &&
        (!especialidade || p.especialidade === especialidade) &&
        termos.every((t) => p._busca.includes(t))
    );
  }, [base, busca, cidade, especialidade]);

  const opcoes = useMemo(() => {
    if (!base) return { cidades: [], especialidades: [] };
    const contar = (lista, campo) => {
      const m = new Map();
      lista.forEach((p) => m.set(p[campo], (m.get(p[campo]) || 0) + 1));
      return [...m].map(([valor, total]) => ({ valor, total }));
    };
    const cidades = contar(base.lista, 'cidade').sort((a, b) => b.total - a.total || comparar(a.valor, b.valor));
    const naCidade = cidade ? base.lista.filter((p) => p.cidade === cidade) : base.lista;
    const especialidades = contar(naCidade, 'especialidade').sort((a, b) => comparar(a.valor, b.valor));
    return { cidades, especialidades };
  }, [base, cidade]);

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  const exibidos = mobile
    ? filtrados.slice(0, visiveis)
    : filtrados.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

  const irParaPagina = (n) => {
    setPagina(n);
    topoLista.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const baixarPdf = async () => {
    const { gerarPdf } = await import('./lib/pdf');
    gerarPdf(filtrados, { busca, cidade, especialidade });
  };

  const destaques = useMemo(
    () => (dados ? dados.anuncios.filter((a) => a.destaque).sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0)) : []),
    [dados]
  );

  return (
    <>
      <Cabecalho />
      <main>
        <Hero />
        <section className="conteudo">
          <div className="container">
            {destaques.length > 0 && <Destaques anuncios={destaques} onAbrir={setAnuncioAberto} />}

            <Filtros
              busca={busca}
              cidade={cidade}
              especialidade={especialidade}
              opcoes={opcoes}
              onChange={setFiltro}
              onLimpar={limparFiltros}
              mobile={mobile}
            />

            <p className="resultados" ref={topoLista} aria-live="polite">
              {dados ? (
                <>
                  <strong>{formatarNumero(filtrados.length)}</strong>{' '}
                  {filtrados.length === 1 ? 'resultado' : 'resultados'}
                </>
              ) : erro ? (
                'Não foi possível carregar a rede credenciada. Tente novamente em instantes.'
              ) : (
                'Carregando a rede credenciada…'
              )}
            </p>

            {dados && filtrados.length === 0 && (
              <div className="vazio">
                <p>Nenhum serviço encontrado</p>
              </div>
            )}

            {!dados && !erro && (
              <ul className="grade">
                {Array.from({ length: 8 }, (_, i) => (
                  <li key={i} className="card card--esqueleto" aria-hidden="true" />
                ))}
              </ul>
            )}

            {exibidos.length > 0 && (
              <ul className="grade">
                {exibidos.map((p) => (
                  <li key={p.id}>
                    <CardPrestador
                      prestador={p}
                      anuncio={p.anuncioId ? base.anuncios.get(p.anuncioId) : null}
                      onVerAnuncio={setAnuncioAberto}
                    />
                  </li>
                ))}
              </ul>
            )}

            {filtrados.length > 0 && (
              <div className="rodape-lista">
                {mobile ? (
                  visiveis < filtrados.length && (
                    <button className="botao botao--claro" onClick={() => setVisiveis((v) => v + POR_PAGINA)}>
                      Mostrar mais ({formatarNumero(filtrados.length - visiveis)})
                    </button>
                  )
                ) : (
                  totalPaginas > 1 && <Paginacao atual={pagina} total={totalPaginas} onIr={irParaPagina} />
                )}
                <button className="botao botao--escuro botao--pdf" onClick={baixarPdf}>
                  Baixar PDF da busca
                </button>
              </div>
            )}
          </div>
        </section>
      </main>
      <Rodape />

      {anuncioAberto && (
        <ModalAnuncio
          anuncio={anuncioAberto}
          prestadores={base.lista.filter((p) => p.anuncioId === anuncioAberto.id)}
          onFechar={() => setAnuncioAberto(null)}
        />
      )}
    </>
  );
}
