// Converte os dados extraídos do site atual (dados/site-atual.json)
// para o formato novo usado pelo app e pela importação no Firebase.
// Uso: node scripts/converter-site-atual.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const origem = JSON.parse(readFileSync('dados/site-atual.json', 'utf8'));

const slug = (s) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);

// Observações que o público pode ver; o resto vira nota interna do ADM.
const ehObsPublica = (t) => /^(atendimento|online|domicil)/i.test(t.trim());

const ids = new Set();
const idUnico = (base) => {
  let id = base || 'item', n = 2;
  while (ids.has(id)) id = `${base}-${n++}`;
  ids.add(id);
  return id;
};

const anuncios = origem.ANUNCIOS.map((a, i) => ({
  id: idUnico('anuncio-' + slug(a.nome)),
  nome: a.nome,
  categoria: a.cat,
  imagemUrl: '/anuncios/' + a.f.replace(/\.jpg$/i, '.webp'),
  largura: a.w,
  altura: a.h,
  profissionais: a.prof || [],
  servicos: a.esp || [],
  beneficio: a.ben || '',
  telefones: a.tel || [],
  whatsapps: a.zap || [],
  enderecos: a.end || [],
  instagram: a.ig || '',
  site: a.site || '',
  palavrasChave: a.k || '',
  destaque: true,
  ordem: i,
  ativo: true,
}));

const prestadores = origem.REDE.map((r) => {
  const [nome, especialidade, cidade, endereco, bairro, tel1, tel2, obs, grupo, ad] = r;
  const nota = (obs || '').trim();
  const telefones = [tel1, tel2].map((t) => String(t || '').replace(/\D/g, '')).filter(Boolean);
  return {
    id: idUnico(slug(nome + '-' + especialidade)),
    nome: nome.trim(),
    especialidade,
    grupo,
    cidade,
    endereco: endereco || '',
    bairro: bairro || '',
    telefones,
    observacao: nota && ehObsPublica(nota) ? nota : '',
    notaInterna: nota && !ehObsPublica(nota) ? nota : '',
    anuncioId: ad >= 0 ? anuncios[ad].id : null,
    ativo: true,
  };
});

const unidades = origem.UNIDADES;
const grupos = origem.GRUPOS;

mkdirSync('public/dados', { recursive: true });
writeFileSync(
  'public/dados/rede.json',
  JSON.stringify({ versao: Date.now(), grupos, unidades, anuncios, prestadores })
);
console.log(`OK: ${prestadores.length} prestadores, ${anuncios.length} anúncios.`);
console.log(`Notas internas para revisar: ${prestadores.filter((p) => p.notaInterna).length}`);
