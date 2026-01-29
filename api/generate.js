const pdfMake = require('pdfmake/build/pdfmake');
const pdfFonts = require('pdfmake/build/vfs_fonts');
pdfMake.vfs = pdfFonts.pdfMake.vfs;

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  try {
    const body = req.body;
    
    // Reconstruire le docDefinition avec la fonction footer
    const docDefinition = {
      pageSize: body.pageSize || 'A4',
      pageMargins: body.pageMargins || [40, 40, 40, 60],
      content: body.content,
      
      // Footer avec numéro de page - reconstruit côté serveur
      footer: function(currentPage, pageCount) {
        const color = body.footerColor || '#e85a50';
        return {
          columns: [
            { text: body.footerLogo || 'LOGO', fontSize: 11, bold: true, color: color },
            { text: currentPage.toString(), fontSize: 11, bold: true, color: color, alignment: 'right' }
          ],
          margin: [40, 0, 40, 0]
        };
      },
      
      defaultStyle: body.defaultStyle || { font: 'Helvetica' }
    };
    
    const pdfDoc = pdfMake.createPdf(docDefinition);
    
    pdfDoc.getBuffer((buffer) => {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="magazine.pdf"');
      res.send(Buffer.from(buffer));
    });
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
};
