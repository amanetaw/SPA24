import React, { useState, useEffect } from 'react';
import {
  X,
  CreditCard,
  QrCode,
  Building,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Clock,
  ArrowRight,
  Copy,
  Check,
  Sparkles,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { api } from '../../lib/api';
import { LISTING_PLANS } from '../../types';

interface PaymentCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  planType: 'monthly' | 'half_yearly' | 'yearly';
  businessName: string;
  email: string;
  phone: string;
  onSuccess: (paymentData: {
    payment_id: string;
    amount_paid: number;
    payment_method: string;
    paid_at: string;
    status: string;
  }) => void;
}

export const PaymentCheckoutModal: React.FC<PaymentCheckoutModalProps> = ({
  isOpen,
  onClose,
  planType,
  businessName,
  email,
  phone,
  onSuccess
}) => {
  const [activeTab, setActiveTab] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStep, setProcessStep] = useState<string>('');
  const [paymentSuccess, setPaymentSuccess] = useState<any>(null);
  const [error, setError] = useState('');

  // Card form state
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState(businessName || '');

  // Net banking state
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');

  const selectedPlan = LISTING_PLANS.find(p => p.id === planType) || LISTING_PLANS[1];

  useEffect(() => {
    if (isOpen && planType) {
      setLoadingOrder(true);
      setError('');
      setPaymentSuccess(null);
      api.payments.createOrder({
        plan_type: planType,
        business_name: businessName,
        email,
        phone
      })
        .then(res => {
          setOrderData(res);
          setLoadingOrder(false);
        })
        .catch(err => {
          console.error('Failed to create order:', err);
          setError('Failed to initiate payment gateway. Please retry.');
          setLoadingOrder(false);
        });
    }
  }, [isOpen, planType, businessName, email, phone]);

  if (!isOpen) return null;

  const handleCopyUpi = () => {
    if (orderData?.upi_id) {
      navigator.clipboard.writeText(orderData.upi_id);
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2500);
    }
  };

  const handleSimulatePayment = async (method: string) => {
    setIsProcessing(true);
    setError('');
    setProcessStep('Connecting to Secure Payment Gateway...');

    try {
      await new Promise(r => setTimeout(r, 900));
      setProcessStep('Verifying Transaction with Bank / UPI network...');
      await new Promise(r => setTimeout(r, 900));
      setProcessStep('Authorizing Listing Plan Activation...');

      const result = await api.payments.verifyPayment({
        order_id: orderData?.order_id,
        plan_type: planType,
        method
      });

      await new Promise(r => setTimeout(r, 600));
      setIsProcessing(false);
      setPaymentSuccess(result);

      // Notify parent after brief triumph celebration
      setTimeout(() => {
        onSuccess({
          payment_id: result.payment_id,
          amount_paid: result.amount,
          payment_method: method,
          paid_at: result.timestamp,
          status: 'paid'
        });
      }, 1500);
    } catch (err: any) {
      setIsProcessing(false);
      setError(err?.message || 'Payment processing failed. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl border border-stone-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-stone-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/30 border border-emerald-500/50 flex items-center justify-center">
              <Lock className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-bold font-display">Secure Listing Checkout</h3>
              <p className="text-[11px] text-stone-400">256-Bit Encrypted Payment Gateway</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="text-stone-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Order Summary Ribbon */}
        <div className="bg-emerald-50 border-b border-emerald-100 p-4 flex items-center justify-between text-xs">
          <div>
            <span className="font-bold text-emerald-950">{selectedPlan.name}</span>
            <span className="text-emerald-700 ml-2">({selectedPlan.billingPeriod})</span>
          </div>
          <div className="text-right">
            <span className="text-lg font-extrabold text-emerald-900 font-display">
              ₹{selectedPlan.price.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {paymentSuccess ? (
          /* Payment Success State */
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-xl font-bold text-stone-900 font-display">Payment Successful!</h4>
            <p className="text-xs text-stone-600 max-w-sm mx-auto">
              Your payment of <strong className="text-stone-900">₹{paymentSuccess.amount.toLocaleString('en-IN')}</strong> has been confirmed.
            </p>
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs text-stone-600 text-left font-mono space-y-1">
              <div>Transaction ID: <span className="text-emerald-700 font-bold">{paymentSuccess.payment_id}</span></div>
              <div>Plan: {paymentSuccess.plan_name}</div>
              <div>Status: Verified &amp; Activated</div>
            </div>
            <p className="text-[11px] text-stone-400">Finalizing your listing submission...</p>
          </div>
        ) : isProcessing ? (
          /* Processing State */
          <div className="p-10 text-center space-y-5">
            <div className="w-12 h-12 rounded-full border-4 border-emerald-200 border-t-emerald-700 animate-spin mx-auto" />
            <div className="space-y-1">
              <h4 className="text-base font-bold text-stone-900 font-display">Processing Payment</h4>
              <p className="text-xs text-emerald-700 font-medium animate-pulse">{processStep}</p>
            </div>
            <p className="text-[11px] text-stone-400 max-w-xs mx-auto">
              Please do not close or refresh this window while transaction is in flight.
            </p>
          </div>
        ) : (
          /* Payment Methods & Flow */
          <div className="p-5 sm:p-6 space-y-5">
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            {/* Payment Method Selector Tabs */}
            <div className="grid grid-cols-3 gap-2 bg-stone-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveTab('upi')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'upi'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <QrCode className="w-4 h-4 text-emerald-600" />
                <span>Instant UPI</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('card')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'card'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <span>Card</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('netbanking')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'netbanking'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Building className="w-4 h-4 text-emerald-600" />
                <span>Net Banking</span>
              </button>
            </div>

            {/* Tab 1: UPI */}
            {activeTab === 'upi' && (
              <div className="space-y-4">
                <div className="flex flex-col items-center justify-center p-4 bg-stone-50 border border-stone-200 rounded-xl">
                  {/* Generated QR Mock Visual */}
                  <div className="w-44 h-44 bg-white p-2.5 rounded-xl border border-stone-200 shadow-xs flex flex-col items-center justify-center relative">
                    <div className="w-full h-full bg-stone-900 p-2 rounded-lg flex flex-col items-center justify-center text-white text-center">
                      <QrCode className="w-24 h-24 text-emerald-400 mb-1" />
                      <span className="text-[10px] tracking-wider text-stone-300 font-mono">SCAN VIA UPI APP</span>
                      <span className="text-[9px] text-amber-300 font-bold">₹{selectedPlan.price}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-stone-500 mt-2 text-center">
                    Scan with Google Pay, PhonePe, Paytm, or BHIM
                  </p>
                </div>

                {/* Copyable UPI ID */}
                <div className="flex items-center justify-between p-2.5 bg-stone-100 rounded-xl border border-stone-200 text-xs">
                  <div className="truncate mr-2">
                    <span className="text-stone-400 block text-[10px]">Merchant UPI ID:</span>
                    <span className="font-mono font-medium text-stone-800">{orderData?.upi_id || 'spa24payments@okhdfcbank'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyUpi}
                    className="px-2.5 py-1 rounded-md bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold border border-stone-200 flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    {copiedUpi ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-stone-500" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                <button
                  type="button"
                  id="pay-via-upi-btn"
                  onClick={() => handleSimulatePayment('UPI')}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>I Have Paid ₹{selectedPlan.price.toLocaleString('en-IN')} via UPI</span>
                </button>
              </div>
            )}

            {/* Tab 2: Credit / Debit Card */}
            {activeTab === 'card' && (
              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Card Number</label>
                  <input
                    type="text"
                    maxLength={19}
                    placeholder="4532 •••• •••• 8921"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Valid Thru</label>
                    <input
                      type="text"
                      maxLength={5}
                      placeholder="MM / YY"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">CVV / CVC</label>
                    <input
                      type="password"
                      maxLength={4}
                      placeholder="•••"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Name on Card</label>
                  <input
                    type="text"
                    placeholder="Cardholder Name"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <button
                  type="button"
                  id="pay-via-card-btn"
                  onClick={() => handleSimulatePayment('Card')}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>Pay ₹{selectedPlan.price.toLocaleString('en-IN')} Securely</span>
                </button>
              </div>
            )}

            {/* Tab 3: Net Banking */}
            {activeTab === 'netbanking' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-2">Select Your Bank</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['HDFC Bank', 'State Bank of India', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra', 'Punjab National Bank'].map(bank => (
                      <button
                        key={bank}
                        type="button"
                        onClick={() => setSelectedBank(bank)}
                        className={`p-2.5 rounded-xl border text-left text-xs font-medium transition-all cursor-pointer ${
                          selectedBank === bank
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold'
                            : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                        }`}
                      >
                        {bank}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  id="pay-via-netbanking-btn"
                  onClick={() => handleSimulatePayment(`NetBanking (${selectedBank})`)}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Building className="w-4 h-4" />
                  <span>Continue with {selectedBank}</span>
                </button>
              </div>
            )}

            {/* Trust Footer */}
            <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400">
              <div className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>PCI-DSS Level 1 Compliant</span>
              </div>
              <span>Instant Tax Invoice &amp; Receipt</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
