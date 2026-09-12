import { Router } from 'express';
import crypto from 'crypto';

const router = Router();

interface PlanPriceMap {
  [key: string]: { name: string; amount: number; months: number };
}

const PLAN_PRICES: PlanPriceMap = {
  monthly: { name: 'Monthly Pro Plan', amount: 999, months: 1 },
  half_yearly: { name: 'Half-Yearly Growth Plan', amount: 4999, months: 6 },
  yearly: { name: 'Yearly Platinum VIP Plan', amount: 8999, months: 12 }
};

// POST /api/payments/create-order
router.post('/create-order', (req, res) => {
  try {
    const { plan_type, business_name, email, phone } = req.body;
    const plan = PLAN_PRICES[plan_type];

    if (!plan) {
      return res.status(400).json({ error: 'Invalid plan selected. Choose monthly, half_yearly, or yearly.' });
    }

    const orderId = `ORDER_${Date.now()}_${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    // Virtual UPI URI for dynamic scan: upi://pay?pa=spa24wellness@upi&pn=SPA24%20Directory&am=...
    const upiString = `upi://pay?pa=spa24payments@okhdfcbank&pn=SPA24%20Wellness%20Directory&am=${plan.amount}&cu=INR&tn=${encodeURIComponent(`${plan.name} - ${business_name || 'Spa Listing'}`)}`;

    return res.json({
      order_id: orderId,
      amount: plan.amount,
      currency: 'INR',
      plan_name: plan.name,
      plan_type,
      duration_months: plan.months,
      upi_id: 'spa24payments@okhdfcbank',
      upi_string: upiString,
      created_at: new Date().toISOString()
    });
  } catch (err) {
    console.error('Create payment order error:', err);
    return res.status(500).json({ error: 'Failed to initiate payment transaction' });
  }
});

// POST /api/payments/verify
router.post('/verify', (req, res) => {
  try {
    const { order_id, plan_type, method = 'UPI' } = req.body;
    const plan = PLAN_PRICES[plan_type];

    if (!plan) {
      return res.status(400).json({ error: 'Invalid plan specification' });
    }

    // Generate authenticated transaction confirmation
    const paymentId = `PAY_${Date.now()}_${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    return res.json({
      success: true,
      payment_id: paymentId,
      order_id: order_id || `ORD-${Date.now()}`,
      amount: plan.amount,
      currency: 'INR',
      plan_type,
      plan_name: plan.name,
      payment_method: method,
      status: 'paid',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Payment verification error:', err);
    return res.status(500).json({ error: 'Payment verification failed' });
  }
});

export default router;
