import { publico } from '../lib/url';

export default function Hero() {
  return (
    <section className="hero">
      {/* A arte já traz o título; o h1 abaixo é para leitores de tela e buscadores. */}
      <picture>
        {/* Se criar uma arte vertical para celular, salve em public/img/banner-mobile.png e descomente:
        <source media="(max-width: 767px)" srcSet={publico('/img/banner-mobile.png')} /> */}
        <img className="hero__imagem" src={publico('/img/banner.png')} alt="" width="1400" height="450" fetchpriority="high" />
      </picture>
      <h1 className="sr-only">
        Guia de Benefícios Interplan — médicos, clínicas, exames e descontos para clientes Interplan em Presidente
        Prudente e região.
      </h1>
    </section>
  );
}
