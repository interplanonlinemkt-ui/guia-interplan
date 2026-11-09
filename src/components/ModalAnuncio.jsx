import Modal from './Modal';
import { opcoesContato } from './ContatoMenu';
import { formatarTelefone, linkWhatsapp } from '../lib/texto';

const linkMapa = (endereco) =>
  'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(endereco);

export default function ModalAnuncio({ anuncio: a, prestadores, onFechar }) {
  const telefones = opcoesContato(a.telefones).filter((o) => o.tipo === 'tel');
  const whatsapps = a.whatsapps.filter(Boolean);
  const instagram = a.instagram?.replace(/^@/, '');
  const site = a.site && !/^https?:/.test(a.site) ? 'https://' + a.site : a.site;

  return (
    <Modal titulo={a.nome} onFechar={onFechar} className="modal--anuncio">
      <div className="anuncio">
        <div className="anuncio__imagem">
          <img src={a.imagemUrl} alt={`Anúncio de ${a.nome}`} />
        </div>
        <div className="anuncio__info">
          <p className="anuncio__categoria">{a.categoria}</p>
          <h2 className="anuncio__nome">{a.nome}</h2>

          {a.beneficio && <p className="anuncio__beneficio">{a.beneficio}</p>}

          {a.servicos.length > 0 && (
            <div className="anuncio__bloco">
              <h3>Serviços</h3>
              <ul className="etiquetas">
                {a.servicos.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
          )}

          {a.profissionais.length > 0 && (
            <div className="anuncio__bloco">
              <h3>Profissionais</h3>
              <ul className="anuncio__lista">
                {a.profissionais.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
          )}

          {a.enderecos.length > 0 && (
            <div className="anuncio__bloco">
              <h3>Endereço</h3>
              <ul className="anuncio__lista">
                {a.enderecos.map((e) => (
                  <li key={e}>
                    <a href={linkMapa(e)} target="_blank" rel="noopener noreferrer">
                      {e}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {prestadores.length > 0 && (
            <div className="anuncio__bloco">
              <h3>Na rede credenciada</h3>
              <ul className="anuncio__lista">
                {prestadores.map((p) => (
                  <li key={p.id}>
                    {p.nome} <span className="anuncio__esp">· {p.especialidade}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="anuncio__acoes">
            {telefones.map((o) => (
              <a key={o.href} className="botao botao--escuro botao--pequeno" href={o.href}>
                {o.rotulo}
              </a>
            ))}
            {whatsapps.map((n) => (
              <a
                key={n}
                className="botao botao--verde botao--pequeno"
                href={linkWhatsapp(n)}
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp {formatarTelefone(n)}
              </a>
            ))}
            {instagram && (
              <a
                className="botao botao--contorno botao--pequeno"
                href={`https://instagram.com/${instagram}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                @{instagram}
              </a>
            )}
            {site && (
              <a className="botao botao--contorno botao--pequeno" href={site} target="_blank" rel="noopener noreferrer">
                Site
              </a>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
