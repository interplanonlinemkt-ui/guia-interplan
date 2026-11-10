import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatarTelefone } from './texto';
import logoSvg from '../assets/logo.svg';
import simboloSvg from '../assets/simbolo.svg';

const VERDE = [16, 97, 52];

/** jsPDF não lê SVG: desenha o SVG num canvas e devolve um PNG */
function svgParaPng(url, largura, altura) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = largura;
      c.height = altura;
      c.getContext('2d').drawImage(img, 0, 0, largura, altura);
      resolve(c.toDataURL('image/png'));
    };
    img.onerror = reject;
    img.src = url;
  });
}

export async function gerarPdf(lista, { busca, cidade, especialidade }) {
  const [logo, simbolo] = await Promise.all([
    svgParaPng(logoSvg, 284 * 4, 54 * 4),
    svgParaPng(simboloSvg, 54 * 8, 54 * 8),
  ]).catch(() => [null, null]);

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const filtros = [
    busca && `Busca: "${busca}"`,
    cidade && `Cidade: ${cidade}`,
    especialidade && `Especialidade: ${especialidade}`,
  ].filter(Boolean);

  const largPag = pdf.internal.pageSize.getWidth();
  const altPag = pdf.internal.pageSize.getHeight();

  // Marca d'água: símbolo da Interplan, grande e bem clarinho, no centro de cada página
  const marcaDagua = () => {
    if (!simbolo) return;
    const lado = 120;
    pdf.saveGraphicsState();
    pdf.setGState(new pdf.GState({ opacity: 0.07 }));
    pdf.addImage(simbolo, 'PNG', (largPag - lado) / 2, (altPag - lado) / 2, lado, lado);
    pdf.restoreGraphicsState();
  };

  // Cabeçalho (só na primeira página)
  if (logo) pdf.addImage(logo, 'PNG', 14, 12, 56, (56 * 54) / 284);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(15);
  pdf.setTextColor(...VERDE);
  pdf.text('Guia de Benefícios', largPag - 14, 19, { align: 'right' });
  pdf.setDrawColor(117, 191, 0);
  pdf.setLineWidth(0.8);
  pdf.line(14, 28, largPag - 14, 28);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.setTextColor(60);
  pdf.text(filtros.length ? filtros.join('   ·   ') : 'Todos os prestadores', 14, 35);
  pdf.text(`${lista.length} resultado(s) · gerado em ${new Date().toLocaleDateString('pt-BR')}`, 14, 40);

  autoTable(pdf, {
    startY: 45,
    margin: { top: 16, bottom: 16 },
    head: [['Prestador', 'Especialidade', 'Endereço', 'Telefones']],
    body: lista.map((p) => [
      p.nome,
      p.especialidade,
      [p.endereco, p.bairro, p.cidade].filter(Boolean).join(' - ') || p.observacao || '',
      (p.telefones || []).map(formatarTelefone).join('\n'),
    ]),
    styles: { fontSize: 8, cellPadding: 2, valign: 'top' },
    headStyles: { fillColor: VERDE, textColor: 255 },
    alternateRowStyles: { fillColor: [244, 249, 240] },
    columnStyles: { 0: { cellWidth: 52 }, 1: { cellWidth: 36 }, 3: { cellWidth: 30 } },
    // A tabela pinta fundo nas células, então a marca d'água vai por cima, bem transparente
    didDrawPage: () => {
      marcaDagua();
      pdf.setFontSize(8);
      pdf.setTextColor(120);
      pdf.text(
        'Interplan · Plantão 24h (18) 3226-5050 · Confirme endereço, horários e descontos ao agendar.',
        14,
        altPag - 8
      );
      pdf.text(`${pdf.internal.getNumberOfPages()}`, largPag - 14, altPag - 8, { align: 'right' });
    },
  });

  pdf.save('guia-interplan.pdf');
}
