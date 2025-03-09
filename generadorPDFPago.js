export function generarPDFPago(pago, empleado) {
    const fecha = new Date(pago.fecha).toLocaleDateString();
    return `
        <div class="cheque-pdf">
            <div class="cheque-pdf-header">
                <h2>Smart Contract - Comprobante de Pago</h2>
                <p>Fecha: ${fecha}</p>
            </div>
            <div class="cheque-pdf-contenido">
                <p class="cheque-pdf-monto">Q ${pago.monto.toFixed(2)}</p>
                <p class="cheque-pdf-texto">Páguese a la orden de:</p>
                <p class="cheque-pdf-beneficiario">${empleado.nombre}</p>
                <div class="cheque-pdf-detalles">
                    <p>ID Empleado: ${empleado.id}</p>
                    <p>Puesto: ${empleado.puesto}</p>
                    <p>Porcentaje de horas trabajadas: ${pago.porcentajeHoras}%</p>
                </div>
                <div class="cheque-pdf-firma">
                    <div class="linea-firma"></div>
                    <p>Firma Autorizada</p>
                </div>
            </div>
        </div>
    `;
}