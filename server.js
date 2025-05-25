import express from 'express';
import cors from 'cors';
import Stripe from 'stripe';

// Stripe API anahtarı
const stripe = new Stripe('sk_test_51RSPFUQhOuynHDYWoI8hxNsDx15enRiMACMFWU74sCW54i248DB2C0rl23YzH7Qb87CSKt9cMr25ThRL5dUEvyLY00EijUxyzB', {
  apiVersion: '2023-10-16' // Stripe API versiyonu
});

const app = express();
app.use(cors());
app.use(express.json());

app.post('/create-payment-intent', async (req, res) => {
  try {
    console.log('İstek alındı:', {
      body: req.body,
      headers: req.headers,
      url: req.url
    });

    const { amount } = req.body;

    if (!amount) {
      console.error('Tutar belirtilmedi');
      return res.status(400).json({ error: 'Tutar belirtilmedi' });
    }

    if (isNaN(amount) || amount <= 0) {
      console.error('Geçersiz tutar:', amount);
      return res.status(400).json({ error: 'Geçersiz tutar' });
    }

    console.log('Stripe PaymentIntent oluşturuluyor...', {
      amount: Math.round(amount * 100),
      currency: 'try'
    });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'try',
      payment_method_types: ['card'],
      automatic_payment_methods: {
        enabled: true,
      },
    });

    console.log('PaymentIntent oluşturuldu:', {
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      status: paymentIntent.status
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Stripe hatası:', {
      message: error.message,
      type: error.type,
      code: error.code
    });
    res.status(500).json({ 
      error: error.message,
      type: error.type,
      code: error.code
    });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Sunucu http://localhost:${PORT} adresinde çalışıyor`);
  console.log('CORS etkin, tüm kaynaklara izin veriliyor');
}); 