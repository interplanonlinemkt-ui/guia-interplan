/** Remove acentos e deixa minúsculo, para busca */
export const semAcento = (s = '') =>
  String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export const digitos = (s = '') => String(s).replace(/\D/g, '');

/** Celular brasileiro: DDD + 9 + 8 dígitos */
export const ehCelular = (n) => {
  const d = digitos(n);
  return d.length === 11 && d[2] === '9';
};

/** (18) 3203-1855 / (18) 99773-1898 */
export function formatarTelefone(n) {
  const d = digitos(n);
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  return n;
}

export const linkTelefone = (n) => `tel:+55${digitos(n)}`;
export const linkWhatsapp = (n) => `https://wa.me/55${digitos(n)}`;

export const linkRota = (p) =>
  'https://www.google.com/maps/search/?api=1&query=' +
  encodeURIComponent([p.endereco, p.bairro, p.cidade, 'SP'].filter(Boolean).join(', '));

export const formatarNumero = (n) => n.toLocaleString('pt-BR');

/** Ordena textos em português ignorando acentos */
export const comparar = (a, b) => a.localeCompare(b, 'pt-BR', { sensitivity: 'base' });

/** Ordena nomes de pessoas ignorando o título (Dr., Dra.) */
const semTitulo = (n = '') => n.replace(/^\s*(dr|dra|drª)\.?\s+/i, '');
export const compararNomes = (a, b) => comparar(semTitulo(a), semTitulo(b));
