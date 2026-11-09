import setaEsquerda from '../assets/seta-esquerda.svg';
import setaDireita from '../assets/seta-direita.svg';

/** Ex.: 1 2 3 4 5 … 95  /  1 … 40 41 42 … 95 */
function paginas(atual, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (atual <= 4) return [1, 2, 3, 4, 5, '…', total];
  if (atual >= total - 3) return [1, '…', total - 4, total - 3, total - 2, total - 1, total];
  return [1, '…', atual - 1, atual, atual + 1, '…', total];
}

export default function Paginacao({ atual, total, onIr }) {
  return (
    <nav className="paginacao" aria-label="Paginação dos resultados">
      <button className="paginacao__seta" onClick={() => onIr(atual - 1)} disabled={atual === 1} aria-label="Página anterior">
        <img src={setaEsquerda} alt="" width="53" height="53" />
      </button>
      <ol className="paginacao__numeros">
        {paginas(atual, total).map((n, i) =>
          n === '…' ? (
            <li key={'r' + i} className="paginacao__reticencias" aria-hidden="true">
              …
            </li>
          ) : (
            <li key={n}>
              <button
                className="paginacao__numero"
                onClick={() => onIr(n)}
                aria-current={n === atual ? 'page' : undefined}
                aria-label={`Página ${n}`}
              >
                {n}
              </button>
            </li>
          )
        )}
      </ol>
      <button className="paginacao__seta" onClick={() => onIr(atual + 1)} disabled={atual === total} aria-label="Próxima página">
        <img src={setaDireita} alt="" width="53" height="53" />
      </button>
    </nav>
  );
}
