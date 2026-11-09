import logoBranco from '../assets/logo-branco.svg';
import instagram from '../assets/rede-instagram.svg';
import facebook from '../assets/rede-facebook.svg';
import youtube from '../assets/rede-youtube.svg';
import { CONTATO, REDES, AVISO_RODAPE } from '../config';
import { formatarTelefone, linkTelefone } from '../lib/texto';

const redes = [
  ['instagram', 'Instagram', instagram],
  ['facebook', 'Facebook', facebook],
  ['youtube', 'YouTube', youtube],
];

export default function Rodape() {
  return (
    <footer className="rodape">
      <div className="rodape__principal">
        <div className="rodape__coluna">
          <img src={logoBranco} alt="Interplan" width="284" height="54" className="rodape__logo" />
          <p className="rodape__empresa">
            {CONTATO.razaoSocial}
            <br />
            CNPJ: {CONTATO.cnpj}
          </p>
          <p className="rodape__contatos">
            <a href={linkTelefone(CONTATO.plantao)}>{formatarTelefone(CONTATO.plantao)}</a>
            <a href={`mailto:${CONTATO.email}`}>{CONTATO.email}</a>
            <a href={CONTATO.site}>{CONTATO.site.replace(/^https?:\/\//, '')}</a>
          </p>
        </div>
        <span className="rodape__divisor" aria-hidden="true" />
        <div className="rodape__coluna rodape__coluna--dir">
          <ul className="rodape__redes">
            {redes.map(([chave, nome, icone]) =>
              REDES[chave] ? (
                <li key={chave}>
                  <a href={REDES[chave]} target="_blank" rel="noopener noreferrer" aria-label={nome}>
                    <img src={icone} alt="" width="55" height="55" />
                  </a>
                </li>
              ) : (
                <li key={chave} aria-hidden="true">
                  <img src={icone} alt="" width="55" height="55" />
                </li>
              )
            )}
          </ul>
          <p className="rodape__aviso">{AVISO_RODAPE}</p>
        </div>
      </div>
      <div className="rodape__copyright">
        <p>Copyright © {new Date().getFullYear()} - Interplan • Todos os direitos reservados</p>
      </div>
    </footer>
  );
}
