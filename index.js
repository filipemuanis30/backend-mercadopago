const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const mercadopago = require('mercadopago');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Configure MercadoPago
mercadopago.configure({
  access_token: process.env.MERCADOPAGO_ACCESS_TOKEN
});

// Endpoint para criar pagamento com QR Code
app.post('/criar-pagamento', async (req, res) => {
  const { numero } = req.body;
  const valor = 10.00;

  try {
    const response = await mercadopago.preferences.create({
      items: [
        {
          title: `Reserva número ${numero}`,
          quantity: 1,
          unit_price: valor
        }
      ],
      payment_methods: {
        excluded_payment_types: [{ id: "ticket" }],
        installments: 1
      },
      back_urls: {
        success: "https://seusite.com/sucesso",
        failure: "https://seusite.com/falha"
      },
      auto_return: "approved"
    });

    res.json({
      status: 'ok',
      qr_url: response.body.init_point
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'erro', message: 'Erro ao criar pagamento' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
