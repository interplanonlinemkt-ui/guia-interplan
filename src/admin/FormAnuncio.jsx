import { useState } from 'react';
import Modal from '../components/Modal';
import { digitos } from '../lib/texto';
import { publico } from '../lib/url';
import { enviarImagem, novoId, storageDisponivel } from './servico';

const linhas = (txt) => txt.split('\n').map((s) => s.trim()).filter(Boolean);
const juntar = (arr) => (arr || []).join('\n');

export default function FormAnuncio({ inicial, dados, onFechar, onSalvar }) {
  const proximaOrdem = Math.max(-1, ...dados.anuncios.map((a) => a.ordem ?? 0)) + 1;
  const [f, setF] = useState(() => ({
    nome: '', categoria: '', imagemUrl: '', beneficio: '', instagram: '', site: '', palavrasChave: '',
    destaque: true, ativo: true, ordem: proximaOrdem,
    ...(inicial || {}),
    _servicos: juntar(inicial?.servicos),
    _profissionais: juntar(inicial?.profissionais),
    _telefones: juntar(inicial?.telefones),
    _whatsapps: juntar(inicial?.whatsapps),
    _enderecos: juntar(inicial?.enderecos),
  }));
  const [arquivo, setArquivo] = useState(null);
  const [previa, setPrevia] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  const set = (campo) => (e) => {
    const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setF((x) => ({ ...x, [campo]: v }));
  };

  const escolherArquivo = (e) => {
    const arq = e.target.files?.[0];
    if (!arq) return;
    if (!arq.type.startsWith('image/')) return setErro('Escolha um arquivo de imagem (JPG, PNG ou WebP).');
    if (arq.size > 3 * 1024 * 1024) return setErro('Imagem acima de 3 MB. Exporte em tamanho menor (até 1000 px de largura).');
    setErro('');
    setArquivo(arq);
    setPrevia(URL.createObjectURL(arq));
  };

  const enviar = async (e) => {
    e.preventDefault();
    setErro('');
    const id = f.id || novoId('anuncio-' + f.nome);
    setSalvando(true);
    try {
      let imagemUrl = f.imagemUrl.trim();
      let largura = f.largura, altura = f.altura;
      if (arquivo) {
        const img = await createImageBitmap(arquivo);
        [largura, altura] = [img.width, img.height];
        imagemUrl = await enviarImagem(arquivo, id);
      }
      if (!imagemUrl) throw new Error('Envie uma imagem ou informe o endereço (URL) dela.');
      const {
        _servicos, _profissionais, _telefones, _whatsapps, _enderecos, ...resto
      } = f;
      const item = {
        ...resto,
        id,
        imagemUrl,
        largura: largura || null,
        altura: altura || null,
        nome: f.nome.trim(),
        categoria: f.categoria.trim(),
        servicos: linhas(_servicos),
        profissionais: linhas(_profissionais),
        telefones: linhas(_telefones).map(digitos).filter(Boolean),
        whatsapps: linhas(_whatsapps).map(digitos).filter(Boolean),
        enderecos: linhas(_enderecos),
        instagram: f.instagram.trim().replace(/^@/, ''),
        ordem: Number(f.ordem) || 0,
      };
      await onSalvar(item, 'salvar');
    } catch (err) {
      setErro(err.message);
      setSalvando(false);
    }
  };

  const remover = async () => {
    if (!window.confirm(`Excluir o anúncio "${f.nome}"? Os prestadores vinculados perdem o botão "Ver anúncio".`)) return;
    setSalvando(true);
    try {
      await onSalvar(f, 'excluir');
    } catch (err) {
      setErro(err.message);
      setSalvando(false);
    }
  };

  const imagemAtual = previa || publico(f.imagemUrl);

  return (
    <Modal titulo={inicial ? 'Editar anúncio' : 'Novo anúncio'} onFechar={onFechar} largura={900}>
      <form className="adm-form adm-form--modal" onSubmit={enviar}>
        <h2>{inicial ? 'Editar anúncio' : 'Novo anúncio'}</h2>

        <div className="adm-anuncio-form">
          <div className="adm-anuncio-form__img">
            {imagemAtual ? <img src={imagemAtual} alt="Prévia do anúncio" /> : <span>Sem imagem</span>}
            {storageDisponivel() && (
              <label className="botao botao--contorno botao--pequeno adm-upload">
                {imagemAtual ? 'Trocar imagem' : 'Enviar imagem'}
                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={escolherArquivo} />
              </label>
            )}
            <label className="adm-campo">
              <span>{storageDisponivel() ? 'Ou endereço (URL) da imagem' : 'Endereço (URL) da imagem'}</span>
              <input value={f.imagemUrl} onChange={set('imagemUrl')} placeholder="https://…" disabled={Boolean(arquivo)} />
            </label>
          </div>

          <div className="adm-anuncio-form__campos">
            <label className="adm-campo">
              <span>Nome *</span>
              <input value={f.nome} onChange={set('nome')} required />
            </label>
            <label className="adm-campo">
              <span>Categoria</span>
              <input value={f.categoria} onChange={set('categoria')} placeholder="Ex.: Clínica / consultório" />
            </label>
            <label className="adm-campo">
              <span>Benefício / desconto</span>
              <input value={f.beneficio} onChange={set('beneficio')} placeholder="Ex.: 20% de desconto em consultas" />
            </label>
            <div className="adm-grade2">
              <label className="adm-campo">
                <span>Telefones (um por linha)</span>
                <textarea value={f._telefones} onChange={set('_telefones')} rows={2} />
              </label>
              <label className="adm-campo">
                <span>WhatsApp (um por linha)</span>
                <textarea value={f._whatsapps} onChange={set('_whatsapps')} rows={2} />
              </label>
            </div>
          </div>
        </div>

        <label className="adm-campo">
          <span>Serviços (um por linha)</span>
          <textarea value={f._servicos} onChange={set('_servicos')} rows={4} />
        </label>
        <div className="adm-grade2">
          <label className="adm-campo">
            <span>Profissionais (um por linha)</span>
            <textarea value={f._profissionais} onChange={set('_profissionais')} rows={3} />
          </label>
          <label className="adm-campo">
            <span>Endereços (um por linha)</span>
            <textarea value={f._enderecos} onChange={set('_enderecos')} rows={3} />
          </label>
        </div>
        <div className="adm-grade2">
          <label className="adm-campo">
            <span>Instagram</span>
            <input value={f.instagram} onChange={set('instagram')} placeholder="@perfil" />
          </label>
          <label className="adm-campo">
            <span>Site</span>
            <input value={f.site} onChange={set('site')} placeholder="www.exemplo.com.br" />
          </label>
        </div>
        <label className="adm-campo">
          <span>Palavras-chave para a busca (separadas por espaço)</span>
          <input value={f.palavrasChave} onChange={set('palavrasChave')} />
        </label>

        <div className="adm-checks">
          <label className="adm-check">
            <input type="checkbox" checked={f.destaque} onChange={set('destaque')} />
            Mostrar em "Parceiros em destaque"
          </label>
          <label className="adm-check">
            <input type="checkbox" checked={f.ativo !== false} onChange={set('ativo')} />
            Ativo (aparece no site)
          </label>
        </div>

        {erro && <p className="adm-erro" role="alert">{erro}</p>}

        <div className="adm-form__acoes">
          {inicial && (
            <button type="button" className="adm-link adm-link--perigo" onClick={remover} disabled={salvando}>
              Excluir anúncio
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
