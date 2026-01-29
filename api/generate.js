const pdfMake = require('pdfmake/build/pdfmake');
const pdfFonts = require('pdfmake/build/vfs_fonts');
pdfMake.vfs = pdfFonts.pdfMake.vfs;

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  
  try {
    const body = req.body;
    
    const docDefinition = {
      pageSize: body.pageSize || 'A4',
      pageMargins: body.pageMargins || [40, 40, 40, 60],
      content: body.content || [],
      
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
    
    pdfDoc.getBuffer(function(buffer) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="magazine.pdf"');
      res.end(buffer);
    });
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
};
