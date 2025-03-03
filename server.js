import express from 'express';
import cors from 'cors';
import SmartContract from './SmartContract.js';

const app = express();
const puerto = 3000;

app.use(cors());
app.use(express.json());

const contrato = new SmartContract();

// Rutas para empleadores
app.post('/pago/crear', (req, res) => {
    const { idEmpleador, idEmpleado, monto, fecha, condiciones } = req.body;

    // Validar datos
    if (!idEmpleador || !idEmpleado || !monto || !fecha || !condiciones) {
        return res.status(400).json({ exito: false, mensaje: 'Datos incompletos' });
    }

    if (monto <= 0) {
        return res.status(400).json({ exito: false, mensaje: 'El monto debe ser mayor a 0' });
    }

    const resultado = contrato.crearPagoPendiente(idEmpleador, idEmpleado, monto, fecha, condiciones);
    res.json({ exito: resultado });
});

// Rutas para empleados
app.get('/empleado/pagos/:id', (req, res) => {
    const pagos = contrato.obtenerPagosEmpleado(req.params.id);
    res.json(pagos);
});

app.listen(puerto, () => {
    console.log(`Servidor ejecutándose en http://localhost:${puerto}`);
});
