// Clase para generar documentos PDF de pagos y boletas
class GeneradorPDFPagos {
    // Método para generar boleta de pago en formato PDF
    static async generarBoletaPDF(pago) {
        // Inicialización de la librería jsPDF
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Fondo azul marino del encabezado
        doc.setFillColor(0, 51, 102); // Color azul marino
        doc.rect(20, 20, 170, 40, 'F');
        
        // Título "SGE TECH BANK"
        doc.setTextColor(255, 255, 255); // Texto blanco
        doc.setFontSize(28);
        doc.text('SGE TECH BANK', 105, 45, { align: 'center' });
        
        // Contenido principal (fondo blanco)
        doc.setFillColor(255, 255, 255);
        doc.rect(20, 60, 170, 60, 'F');
        
        // Información del pago
        doc.setTextColor(0, 0, 0); // Texto negro
        doc.setFontSize(12);
        doc.text(`Fecha: ${pago.fecha}`, 30, 75);
        doc.text(`Páguese a: ${pago.nombreEmpleado}`, 30, 90);
        doc.text(`La suma de: Q.${pago.monto.toFixed(2)}`, 30, 105);
        
        // Detalles adicionales (marco azul)
        doc.setDrawColor(0, 51, 102);
        doc.rect(20, 120, 170, 50);
        
        // Información adicional
        doc.text(`ID Empleado: ${pago.idEmpleado}`, 30, 135);
        doc.text(`Asistencia: ${pago.asistencia}%`, 30, 150);
        doc.text(`Horas trabajadas: ${pago.horasTrabajadas}`, 30, 165);
        doc.text(`Estado: Cancelado`, 120, 165);
        
        // Generar el PDF
        doc.save(`boleta_pago_${Date.now()}.pdf`);
    }
}