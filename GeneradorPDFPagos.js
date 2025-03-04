// Clase para generar documentos PDF de pagos y boletas
class GeneradorPDFPagos {
    // Método para generar boleta de pago en formato PDF
    static async generarBoletaPDF(pago, empleado) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Encabezado
        doc.setFillColor(44, 62, 80); // Color primario del sistema
        doc.rect(20, 20, 170, 40, 'F');
        
        // Título y logo
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(28);
        doc.text('SGE TECH', 105, 40, { align: 'center' });
        doc.setFontSize(14);
        doc.text('Sistema de Gestión Empresarial', 105, 52, { align: 'center' });
        
        // Contenido principal
        doc.setFillColor(255, 255, 255);
        doc.rect(20, 70, 170, 160, 'F');
        
        // Información del cheque
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);
        
        // Datos del empleado y pago
        doc.text(`Fecha: ${new Date(pago.fecha).toLocaleDateString()}`, 30, 85);
        doc.text(`No. de Referencia: ${pago.id}`, 120, 85);
        
        doc.text(`Páguese a: ${empleado.nombre}`, 30, 100);
        doc.text(`ID Empleado: ${pago.idEmpleado}`, 120, 100);
        
        // Monto en números y letras
        doc.setFontSize(14);
        doc.text(`Q. ${pago.monto.toFixed(2)}`, 30, 120);
        
        // Detalles del pago
        doc.setFontSize(12);
        doc.line(20, 140, 190, 140);
        
        doc.text('Detalles del Pago:', 30, 155);
        doc.text(`Puesto: ${empleado.puesto}`, 30, 170);
        doc.text(`Horas Trabajadas: ${pago.horasTrabajadas}%`, 30, 185);
        doc.text(`Monto Original: Q. ${pago.montoOriginal.toFixed(2)}`, 30, 200);
        doc.text(`Monto Final: Q. ${pago.monto.toFixed(2)}`, 30, 215);
        
        // Pie de página
        doc.setFillColor(44, 62, 80);
        doc.rect(20, 240, 170, 30, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.text('PAGO PROCESADO', 105, 255, { align: 'center' });
        doc.text(`Fecha de Procesamiento: ${new Date(pago.fechaPago).toLocaleString()}`, 105, 265, { align: 'center' });
        
        // Marca de agua
        doc.setTextColor(200, 200, 200);
        doc.setFontSize(60);
        doc.text('CANCELADO', 105, 150, {
            align: 'center',
            angle: 45
        });
        
        // Generar el PDF
        return doc.save(`boleta_pago_${pago.idEmpleado}_${Date.now()}.pdf`);
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