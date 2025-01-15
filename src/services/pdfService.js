const PDFDocument = require('pdfkit');

const generateSalesPDF = async (sale, stream) => {
    const doc = new PDFDocument({
        size: 'A4',
        margin: 50
    });

    doc.pipe(stream);

    // Encabezado
    doc.fontSize(20).text('Comprobante de Venta', {align: 'center'});
    doc.moveDown();

    // Información de la venta
    doc.fontSize(12);
    doc.text(`Número de Venta: ${sale.saleNumber}`);
    doc.text(`Fecha: ${sale.createdAt.toLocaleDateString()}`);
    doc.text(`Método de Pago: ${sale.paymentMethod}`);
    doc.moveDown();

    // Tabla de productos
    doc.fontSize(10);
    let yPosition = doc.y;
    
    // Encabezados de la tabla
    doc.text('Producto', 50, yPosition);
    doc.text('Cantidad', 300, yPosition);
    doc.text('Precio', 400, yPosition);
    doc.text('Subtotal', 480, yPosition);
    
    doc.moveDown();
    yPosition = doc.y;

    // Detalles de productos
    sale.details.forEach(detail => {
        doc.text(detail.product.name, 50, yPosition);
        doc.text(detail.quantity.toString(), 300, yPosition);
        doc.text(`S/ ${detail.price.toFixed(2)}`, 400, yPosition);
        doc.text(`S/ ${detail.subtotal.toFixed(2)}`, 480, yPosition);
        yPosition += 20;
    });

    // Total
    doc.moveDown();
    doc.fontSize(12).text(`Total: S/ ${sale.total.toFixed(2)}`, {align: 'right'});

    doc.end();
};

module.exports = {
    generateSalesPDF
};