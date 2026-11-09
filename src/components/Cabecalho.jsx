import logo from '../assets/logo.svg';
import iconeTelefone from '../assets/icone-telefone-grande.svg';
import { CONTATO } from '../config';
import { formatarTelefone, linkTelefone } from '../lib/texto';

export default function Cabecalho() {
  const tel = formatarTelefone(CONTATO.plantao);
  const [ddd, numero] = [tel.slice(0, 4), tel.slice(5)];
  return (
    <header className="cabecalho">
      <div className="container cabecalho__interno">
        <div className="cabecalho__marca">
          <a href={CONTATO.site} className="cabecalho__logo" aria-label="Interplan — ir para o site">
            <img src={logo} alt="Interplan — ao seu lado em todos os momentos" width="284" height="54" />
          </a>
          <span className="cabecalho__divisor" aria-hidden="true" />
          <p className="cabecalho__obito">
            Em caso de óbito
            <br />
            <strong>Ligue para a Interplan.</strong>
          </p>
        </div>
        <a className="plantao" href={linkTelefone(CONTATO.plantao)}>
          <span className="plantao__rotulo">
            Plantão
            <br />
            24 Horas
          </span>
          <img className="plantao__icone" src={iconeTelefone} alt="" width="36" height="36" />
          <span className="plantao__numero">
            <span className="plantao__ddd">{ddd}</span> {numero}
          </span>
        </a>
      </div>
    </header>
  );
}
