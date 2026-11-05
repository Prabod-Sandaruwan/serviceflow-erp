export function drawCards(doc: PDFKit.PDFDocument, invoice: any, y: number): void {
  const client = invoice.project?.client || {};
  const project = invoice.project || {};
  const milestone = invoice.milestone || {};

  // Card 1: BILLED TO
  doc.roundedRect(38, y, 254, 76, 5).fillAndStroke('#ffffff', '#e2e8f0');
  doc.fontSize(7).font('Helvetica-Bold').fillColor('#4f46e5').text('BILLED TO', 46, y + 8);

  const clientName = client.displayName || invoice.clientName || 'Valued Client';
  doc.fontSize(9.5).font('Helvetica-Bold').fillColor('#0f172a').text(clientName, 46, y + 20, { width: 238 });

  let textY = y + 33;
  if (client.address) {
    doc.fontSize(7).font('Helvetica').fillColor('#64748b').text(client.address, 46, textY, { width: 238 });
    textY += 12;
  }
  const meta: string[] = [];
  if (client.email) meta.push(`Email: ${client.email}`);
  if (client.phone) meta.push(`Tel: ${client.phone}`);
  if (meta.length > 0) {
    doc.fontSize(7).font('Helvetica').fillColor('#64748b').text(meta.join('   •   '), 46, textY, { width: 238 });
    textY += 11;
  }
  if (client.registrationNumber) {
    doc.fontSize(7).font('Helvetica').fillColor('#64748b').text(`Tax / Reg ID: ${client.registrationNumber}`, 46, textY, { width: 238 });
  }

  // Card 2: ASSOCIATED PROJECT & ASSIGNMENT
  doc.roundedRect(303, y, 254, 76, 5).fillAndStroke('#ffffff', '#e2e8f0');
  doc.fontSize(7).font('Helvetica-Bold').fillColor('#4f46e5').text('ASSOCIATED PROJECT & ASSIGNMENT', 311, y + 8);

  // Project Reference
  doc.fontSize(6.5).font('Helvetica').fillColor('#64748b').text('Project Reference:', 311, y + 21);
  const pCode = project.projectCode || (invoice.projectId ? `PRJ-${invoice.projectId}` : '—');
  doc.roundedRect(460, y + 18, 90, 13, 3).fillAndStroke('#f1f5f9', '#cbd5e1');
  doc.fontSize(6.5).font('Helvetica-Bold').fillColor('#0f172a').text(pCode, 460, y + 21, { width: 90, align: 'center' });

  // Project Title
  doc.fontSize(6.5).font('Helvetica').fillColor('#64748b').text('Project Title:', 311, y + 35);
  doc.font('Helvetica-Bold').fillColor('#1e293b').text(project.name || '—', 400, y + 35, { width: 150, align: 'right' });

  // Account Manager
  doc.font('Helvetica').fillColor('#64748b').text('Account Manager:', 311, y + 47);
  if (project.manager) {
    doc.circle(446, y + 50.5, 2.5).fill('#16a34a');
    doc.font('Helvetica-Bold').fillColor('#1e293b').text(project.manager, 452, y + 47, { width: 98, align: 'right' });
  } else {
    doc.font('Helvetica').fillColor('#94a3b8').text('—', 452, y + 47, { width: 98, align: 'right' });
  }

  // Billing Cycle / Milestone
  doc.font('Helvetica').fillColor('#64748b').text('Billing Cycle:', 311, y + 59);
  doc.font('Helvetica-Bold').fillColor('#1e293b').text(milestone.name || 'Milestone Delivery', 400, y + 59, { width: 150, align: 'right' });
}
