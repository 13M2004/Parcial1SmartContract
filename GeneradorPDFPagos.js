// Clase para generar documentos PDF de pagos y boletas
class GeneradorPDFPagos {
    // Método para generar boleta de pago en formato PDF
    static async generarBoletaPDF(pago, empleado) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Fondo del cheque
        doc.setFillColor(245, 245, 245);
        doc.rect(20, 20, 170, 100, 'F');
        
        // Borde decorativo
        doc.setDrawColor(44, 62, 80);
        doc.setLineWidth(0.5);
        doc.rect(22, 22, 166, 96);
        
        // Encabezado del cheque
        doc.setFillColor(44, 62, 80);
        doc.rect(25, 25, 160, 25, 'F');
        
        // Título
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(20);
        doc.text('SGE TECH BANK', 105, 40, { align: 'center' });
        doc.setFontSize(10);
        doc.text('Sistema de Gestión Empresarial', 105, 45, { align: 'center' });
        
        // Información del cheque
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);
        doc.text(`Guatemala, ${new Date(pago.fecha).toLocaleDateString()}`, 30, 65);
        doc.text(`PÁGUESE A: ${empleado.nombre}`, 30, 75);
        
        // Monto en números y letras
        doc.setFontSize(14);
        doc.text(`Q. ${pago.monto.toFixed(2)}`, 140, 75);
        
        // Línea de firma
        doc.line(30, 95, 90, 95);
        doc.setFontSize(10);
        doc.text('FIRMA AUTORIZADA', 45, 100);
        
        // Detalles del pago
        doc.setFillColor(255, 255, 255);
        doc.rect(20, 130, 170, 100, 'F');
        
        doc.setFontSize(12);
        doc.text('DETALLES DEL PAGO', 105, 140, { align: 'center' });
        doc.line(30, 145, 180, 145);
        
        // Tabla de detalles
        const detalles = [
            ['No. Referencia:', pago.id],
            ['ID Empleado:', pago.idEmpleado],
            ['Puesto:', empleado.puesto],
            ['Horas Trabajadas:', `${pago.horasTrabajadas}%`],
            ['Monto Original:', `Q. ${pago.montoOriginal.toFixed(2)}`],
            ['Monto Final:', `Q. ${pago.monto.toFixed(2)}`]
        ];
        
        let y = 160;
        detalles.forEach(([label, value]) => {
            doc.text(label, 40, y);
            doc.text(value, 120, y);
            y += 10;
        });
        
        // Marca de agua
        doc.setTextColor(200, 200, 200);
        doc.setFontSize(60);
        doc.text('CANCELADO', 105, 150, {
            align: 'center',
            angle: 45
        });
        
        // Pie de página
        doc.setFillColor(44, 62, 80);
        doc.rect(20, 240, 170, 30, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.text(`Fecha de Procesamiento: ${new Date(pago.fechaPago).toLocaleString()}`, 105, 255, { align: 'center' });
        doc.text('DOCUMENTO VÁLIDO', 105, 265, { align: 'center' });
        
        return doc.save(`cheque_${pago.idEmpleado}_${Date.now()}.pdf`);
    }

    static async generarReportePagos(pagos, titulo = 'Reporte de Pagos') {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Encabezado
        doc.setFillColor(44, 62, 80);
        doc.rect(20, 20, 170, 30, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(20);
        doc.text(titulo, 105, 40, { align: 'center' });
        
        // Tabla de pagos
        let y = 60;
        const headers = ['Fecha', 'Empleado', 'Monto', 'Estado'];
        
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);
        
        // Encabezados de tabla
        headers.forEach((header, i) => {
            doc.text(header, 30 + (i * 45), y);
        });
        
        y += 10;
        doc.line(20, y, 190, y);
        
        // Datos de la tabla
        pagos.forEach(pago => {
            y += 15;
            if (y > 270) {
                doc.addPage();
                y = 30;
            }
            
            doc.text(new Date(pago.fecha).toLocaleDateString(), 30, y);
            doc.text(pago.idEmpleado, 75, y);
            doc.text(`Q${pago.monto.toFixed(2)}`, 120, y);
            doc.text(pago.estado, 165, y);
        });
        
        // Generar el PDF
        return doc.save(`reporte_pagos_${Date.now()}.pdf`);
    }
}

export default GeneradorPDFPagos;