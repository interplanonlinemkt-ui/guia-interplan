import { app, firebaseAtivo } from './firebase';
import { publico } from './url';

/**
 * O site público lê UM documento só (publicacao/atual), que o painel ADM
 * regenera a cada alteração. Assim cada visita custa 1 leitura no Firestore,
 * em vez de 1.135 — fundamental para caber no plano gratuito.
 * Se o Firebase não estiver configurado (ou falhar), usa o JSON local.
 */
export async function carregarGuia() {
  if (firebaseAtivo) {
    try {
      // Versão "lite" do Firestore: bem menor, suficiente para uma leitura simples
      const { getFirestore, doc, getDoc } = await import('firebase/firestore/lite');
      const snap = await getDoc(doc(getFirestore(app), 'publicacao', 'atual'));
      if (snap.exists()) return limpar(JSON.parse(snap.data().json));
    } catch (e) {
      console.warn('[guia] Falha ao ler o Firebase, usando dados locais.', e);
    }
  }
  const r = await fetch(publico('/dados/rede.json'));
  return limpar(await r.json());
}

/** Remove o que não é público (inativos e notas internas) */
export function limpar(d) {
  const anuncios = (d.anuncios || []).filter((a) => a.ativo !== false);
  const idsAnuncio = new Set(anuncios.map((a) => a.id));
  const prestadores = (d.prestadores || [])
    .filter((p) => p.ativo !== false)
    .map(({ notaInterna, ...p }) => ({
      ...p,
      anuncioId: idsAnuncio.has(p.anuncioId) ? p.anuncioId : null,
    }));
  return { ...d, anuncios, prestadores };
}
