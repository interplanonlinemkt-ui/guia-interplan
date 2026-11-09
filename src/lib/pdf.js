import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatarTelefone } from './texto';

const VERDE = [16, 97, 52];

export function gerarPdf(lista, { busca, cidade, especialidade }) {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const filtros = [
    busca && `Busca: "${busca}"`,
    cidade && `Cidade: ${cidade}`,
    especialidade && `Especialidade: ${especialidade}`,
  ].filter(Boolean);

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(16);
  pdf.setTextColor(...VERDE);
  pdf.text('Guia de Benefícios Interplan', 14, 18);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.setTextColor(60);
  pdf.text(filtros.length ? filtros.join('   ·   ') : 'Todos os prestadores', 14, 25);
  pdf.text(`${lista.length} resultado(s) · gerado em ${new Date().toLocaleDateString('pt-BR')}`, 14, 30);

  autoTable(pdf, {
    startY: 35,
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
    didDrawPage: () => {
      pdf.setFontSize(8);
      pdf.setTextColor(120);
      pdf.text(
        'Interplan · Plantão 24h (18) 3226-5050 · Confirme endereço, horários e descontos ao agendar.',
        14,
        pdf.internal.pageSize.getHeight() - 8
      );
    },
  });

  pdf.save('guia-interplan.pdf');
}
