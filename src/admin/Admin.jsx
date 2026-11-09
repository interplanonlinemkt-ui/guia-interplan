import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { firebaseAtivo } from '../lib/firebase';
import { auth } from './fb';
import { ehAdmin } from './servico';
import Login from './Login';
import Painel from './Painel';
import logo from '../assets/logo.svg';
import '../styles/admin.css';

export default function Admin() {
  const [usuario, setUsuario] = useState(undefined); // undefined = verificando
  const [permitido, setPermitido] = useState(null);

  useEffect(() => {
    document.title = 'Painel ADM · Guia Interplan';
    if (!firebaseAtivo) return;
    return onAuthStateChanged(auth, async (u) => {
      setUsuario(u);
      setPermitido(null);
      if (u) setPermitido(await ehAdmin(u.uid).catch(() => false));
    });
  }, []);

  if (!firebaseAtivo) {
    return (
      <Tela>
        <h1>Firebase não configurado</h1>
        <p>
          Preencha o arquivo <code>.env</code> com as chaves do projeto Firebase (veja o <code>.env.example</code> e o
          README) e reinicie o servidor.
        </p>
      </Tela>
    );
  }

  if (usuario === undefined || (usuario && permitido === null)) {
    return <Tela><p>Verificando acesso…</p></Tela>;
  }

  if (!usuario) return <Login />;

  if (!permitido) {
    return (
      <Tela>
        <h1>Acesso não autorizado</h1>
        <p>
          A conta <strong>{usuario.email}</strong> entrou, mas ainda não é administradora do guia.
        </p>
        <p>
          Peça para um administrador criar, no Firestore, um documento na coleção <code>admins</code> com este ID:
        </p>
        <p className="adm-codigo">{usuario.uid}</p>
        <button className="botao botao--contorno" onClick={() => signOut(auth)}>
          Sair
        </button>
      </Tela>
    );
  }

  return <Painel usuario={usuario} />;
}

export function Tela({ children }) {
  return (
    <div className="adm-tela">
      <div className="adm-tela__caixa">
        <img src={logo} alt="Interplan" width="200" height="38" className="adm-tela__logo" />
        {children}
      </div>
    </div>
  );
}
