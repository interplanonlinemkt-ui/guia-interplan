// Endereços relativos à pasta onde o site está publicado.
// Funciona tanto na raiz (Firebase/Netlify) quanto numa subpasta (GitHub Pages).
const BASE = import.meta.env.BASE_URL; // './' no build

/** '/anuncios/x.webp' → './anuncios/x.webp'; URLs completas (https://…) ficam iguais */
export const publico = (u = '') => (u && u.startsWith('/') && !u.startsWith('//') ? BASE + u.slice(1) : u);
