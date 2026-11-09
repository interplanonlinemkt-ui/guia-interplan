import { useState } from 'react';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from './fb';
import { Tela } from './Admin';

const mensagens = {
  'auth/invalid-credential': 'E-mail ou senha incorretos.',
  'auth/invalid-email': 'E-mail inválido.',
  'auth/too-many-requests': 'Muitas tentativas. Aguarde alguns minutos e tente de novo.',
  'auth/network-request-failed': 'Sem conexão. Verifique a internet.',
};

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [aviso, setAviso] = useState('');
  const [enviando, setEnviando] = useState(false);

  const entrar = async (e) => {
    e.preventDefault();
    setErro('');
    setAviso('');
    setEnviando(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), senha);
    } catch (err) {
      setErro(mensagens[err.code] || 'Não foi possível entrar. Tente novamente.');
    } finally {
      setEnviando(false);
    }
  };

  const recuperar = async () => {
    setErro('');
    if (!email.trim()) return setErro('Digite seu e-mail acima para receber o link de nova senha.');
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setAviso('Se o e-mail estiver cadastrado, você receberá um link para criar uma nova senha.');
    } catch (err) {
      setErro(mensagens[err.code] || 'Não foi possível enviar o e-mail.');
    }
  };

  return (
    <Tela>
      <h1>Painel do Guia</h1>
      <p className="adm-sub">Entre para gerenciar prestadores e anúncios.</p>
      <form className="adm-form" onSubmit={entrar}>
        <label className="adm-campo">
          <span>E-mail</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" required autoFocus />
        </label>
        <label className="adm-campo">
          <span>Senha</span>
          <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} autoComplete="current-password" required />
        </label>
        {erro && <p className="adm-erro" role="alert">{erro}</p>}
        {aviso && <p className="adm-ok" role="status">{aviso}</p>}
        <button className="botao botao--escuro" disabled={enviando}>
          {enviando ? 'Entrando…' : 'Entrar'}
        </button>
        <button type="button" className="adm-link" onClick={recuperar}>
          Esqueci minha senha
        </button>
      </form>
    </Tela>
  );
}
