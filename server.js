import express from 'express';
import cors from 'cors';
import SmartContract from './SmartContract.js';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const contract = new SmartContract();

// Routes for employers
app.post('/payment/create', (req, res) => {
    const { employerId, employeeId, amount, date, conditions } = req.body;

    // Validate data
    if (!employerId || !employeeId || !amount || !date || !conditions) {
      return res.status(400).json({ success: false, message: 'Datos incompletos' });
  }

  if (amount <= 0) {
      return res.status(400).json({ success: false, message: 'El monto debe ser mayor a 0' });
  }

  const result = contract.createPendingPayment(employerId, employeeId, amount, date, conditions);
  res.json({ success: result });
});

// Routes for employees
app.get('/employee/payments/:id', (req, res) => {
   const payments = contract.getEmployeePayments(req.params.id);
   res.json(payments);
});

app.listen(port, () => {
   console.log(`Server running at http://localhost:${port}`);
});
