import iconeMapa from '../assets/icone-mapa.svg';
import ContatoMenu from './ContatoMenu';
import { linkRota } from '../lib/texto';

const CIDADE_SEDE = 'Presidente Prudente';

export default function CardPrestador({ prestador: p, anuncio, onVerAnuncio }) {
  const temEndereco = Boolean(p.endereco);
  const local = [p.endereco, p.bairro].filter(Boolean).join(' - ');
  const cidade = p.cidade && p.cidade !== CIDADE_SEDE ? p.cidade : '';

  return (
    <article className="card">
      <div className="card__info">
        <h3 className="card__nome">{p.nome}</h3>
        <p className="card__especialidade">{p.especialidade}</p>
        {temEndereco && (
          <p className="card__endereco">
            {local}
            {cidade && <> · {cidade}</>}
          </p>
        )}
        {(p.observacao || !temEndereco) && (
          <p className="card__obs">
            {p.observacao || 'Consulte o endereço por telefone'}
            {!temEndereco && cidade && <> · {cidade}</>}
          </p>
        )}
      </div>

      <div className="card__acoes">
        <ContatoMenu telefones={p.telefones} nome={p.nome} />
        {(temEndereco || anuncio) && (
          <div className="card__linha">
            {temEndereco && (
              <a className="acao acao--rota" href={linkRota(p)} target="_blank" rel="noopener noreferrer">
                <img src={iconeMapa} alt="" width="15" height="15" />
                Rota
              </a>
            )}
            {anuncio && (
              <button className="acao acao--anuncio" onClick={() => onVerAnuncio(anuncio)}>
                Ver anúncio
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
