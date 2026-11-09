// Acesso ao Firebase usado pelo painel ADM.
import {
  collection, doc, getDoc, getDocs, setDoc, deleteDoc, writeBatch, serverTimestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from './fb';

const quem = () => auth.currentUser?.email || 'desconhecido';

/** Remove campos internos (_algo) e undefined antes de gravar */
const limparCampos = (obj) =>
  Object.fromEntries(Object.entries(obj).filter(([k, v]) => !k.startsWith('_') && v !== undefined));

export async function ehAdmin(uid) {
  const snap = await getDoc(doc(db, 'admins', uid));
  return snap.exists();
}

export async function carregarTudo() {
  const [p, a, c] = await Promise.all([
    getDocs(collection(db, 'prestadores')),
    getDocs(collection(db, 'anuncios')),
    getDoc(doc(db, 'config', 'geral')),
  ]);
  return {
    prestadores: p.docs.map((d) => ({ id: d.id, ...d.data() })),
    anuncios: a.docs.map((d) => ({ id: d.id, ...d.data() })),
    config: c.exists() ? c.data() : { grupos: {}, unidades: [] },
  };
}

export async function salvar(colecao, item) {
  const { id, ...dados } = limparCampos(item);
  await setDoc(doc(db, colecao, id), { ...dados, atualizadoEm: serverTimestamp(), atualizadoPor: quem() });
}

export async function excluir(colecao, id) {
  await deleteDoc(doc(db, colecao, id));
}

/**
 * Gera o documento único que o site público lê (publicacao/atual).
 * Só entra o que é público: itens ativos e sem notas internas.
 */
export async function publicar({ prestadores, anuncios, config }) {
  const publico = {
    versao: Date.now(),
    grupos: config.grupos || {},
    unidades: config.unidades || [],
    anuncios: anuncios
      .filter((a) => a.ativo !== false)
      .map(({ atualizadoEm, atualizadoPor, ...a }) => limparCampos(a)),
    prestadores: prestadores
      .filter((p) => p.ativo !== false)
      .map(({ atualizadoEm, atualizadoPor, notaInterna, ...p }) => limparCampos(p)),
  };
  const json = JSON.stringify(publico);
  if (json.length > 950_000) {
    throw new Error('A publicação passou de 950 KB, o limite de um documento do Firestore. Avise o desenvolvedor.');
  }
  await setDoc(doc(db, 'publicacao', 'atual'), { json, atualizadoEm: serverTimestamp(), atualizadoPor: quem() });
}

/** Primeira carga: copia public/dados/rede.json para as coleções */
export async function importarIniciais(aoProgredir) {
  const dados = await (await fetch('/dados/rede.json')).json();
  const itens = [
    ...dados.anuncios.map((a) => ['anuncios', a]),
    ...dados.prestadores.map((p) => ['prestadores', p]),
  ];
  const agora = serverTimestamp();
  for (let i = 0; i < itens.length; i += 400) {
    const lote = writeBatch(db);
    itens.slice(i, i + 400).forEach(([col, { id, ...item }]) =>
      lote.set(doc(db, col, id), { ...item, atualizadoEm: agora, atualizadoPor: quem() })
    );
    await lote.commit();
    aoProgredir?.(Math.min(i + 400, itens.length), itens.length);
  }
  const config = { grupos: dados.grupos, unidades: dados.unidades };
  await setDoc(doc(db, 'config', 'geral'), config);
  return { prestadores: dados.prestadores, anuncios: dados.anuncios, config };
}

export const storageDisponivel = () => Boolean(storage);

/** Envia a imagem do anúncio ao Firebase Storage e devolve a URL pública */
export async function enviarImagem(arquivo, idAnuncio) {
  if (!storage) throw new Error('Firebase Storage não configurado.');
  const ext = arquivo.name.split('.').pop().toLowerCase();
  const caminho = `anuncios/${idAnuncio}-${Date.now()}.${ext}`;
  const r = ref(storage, caminho);
  await uploadBytes(r, arquivo, { contentType: arquivo.type, cacheControl: 'public,max-age=31536000' });
  return getDownloadURL(r);
}

export function novoId(texto) {
  const base = String(texto || 'item')
    .normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50);
  return `${base}-${Date.now().toString(36)}`;
}
