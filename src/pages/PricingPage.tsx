import React, { useState } from 'react';
import {
  Check,
  Sparkles,
  ShieldCheck,
  CreditCard,
  Zap,
  Star,
  Crown,
  TrendingUp,
  HelpCircle,
  ArrowRight,
  PhoneCall,
  CheckCircle2
} from 'lucide-react';
import { LISTING_PLANS, PlanType } from '../types';

interface PricingPageProps {
  onNavigate: (path: string) => void;
}

export const PricingPage: React.FC<PricingPageProps> = ({ onNavigate }) => {
  const [billingCycle, setBillingCycle] = useState<'all' | 'monthly' | 'half_yearly' | 'yearly'>('all');

  const faqs = [
    {
      q: 'How does the listing verification and payment work?',
      a: 'When you submit your spa, you can choose between Free Basic, Monthly Pro, Half-Yearly Growth, or Yearly Platinum. Paid plans receive expedited 24-hour editorial verification, top search placement, visitor analytics, and direct booking buttons. You can pay online via UPI, Cards, or Net Banking.'
    },
    {
      q: 'Can I upgrade or change my plan later?',
      a: 'Yes, anytime! You can upgrade from Monthly to Half-Yearly or Yearly to lock in discounted rates and higher directory placement. You can also contact our editorial desk to adjust your listing tier.'
    },
    {
      q: 'What is the "Visitor on Spa Counter"?',
      a: 'The Visitor on Spa Counter showcases verified visitor views directly on your listing card and detail page, reinforcing credibility, client footfall, and high trust with prospective customers.'
    },
    {
      q: 'What payment methods are supported in India?',
      a: 'We support all major payment methods including UPI (Google Pay, PhonePe, Paytm, BHIM UPI), RuPay, Visa, MasterCard, and Net Banking across 50+ Indian banks.'
    },
    {
      q: 'What happens when my subscription expires?',
      a: 'Your listing will never be deleted. If you decide not to renew, your listing automatically reverts to the Free Basic tier without losing your address, reviews, or basic business presence.'
    }
  ];

  return (
    <div className="bg-stone-50 min-h-screen py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Hero */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold mb-4 border border-emerald-200">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Listing Plans for Wellness Centers &amp; Spas</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-stone-900 tracking-tight font-display mb-4">
            Grow Your Spa with Verified Visibility
          </h1>
          <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
            Connect with thousands of genuine clients looking for relaxation, massage therapy, and luxury wellness. Choose the right listing plan for your business.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 items-stretch mb-16">
          {LISTING_PLANS.map((plan) => {
            const isYearly = plan.id === 'yearly';
            const isHalfYearly = plan.id === 'half_yearly';
            const isMonthly = plan.id === 'monthly';
            const isFree = plan.id === 'free';

            return (
              <div
                key={plan.id}
                id={`pricing-card-${plan.id}`}
                className={`relative rounded-2xl flex flex-col justify-between transition-all duration-300 ${
                  isHalfYearly
                    ? 'bg-white border-2 border-purple-600 shadow-xl shadow-purple-500/10 md:-translate-y-2'
                    : isYearly
                    ? 'bg-gradient-to-b from-amber-50/50 to-white border-2 border-amber-500 shadow-lg'
                    : 'bg-white border border-stone-200 shadow-xs hover:shadow-md'
                }`}
              >
                {/* Header Highlight Ribbon */}
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-[11px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
                    <Star className="w-3 h-3 fill-white" />
                    <span>Most Popular</span>
                  </div>
                )}
                {isYearly && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-500 text-stone-950 text-[11px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
                    <Crown className="w-3 h-3 fill-stone-950" />
                    <span>Best Value</span>
                  </div>
                )}

                <div className="p-6 sm:p-7 flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-stone-900 font-display">{plan.name}</h3>
                    {isYearly && <Crown className="w-5 h-5 text-amber-500" />}
                    {isHalfYearly && <TrendingUp className="w-5 h-5 text-purple-600" />}
                    {isMonthly && <Zap className="w-5 h-5 text-emerald-600" />}
                    {isFree && <ShieldCheck className="w-5 h-5 text-stone-400" />}
                  </div>

                  <p className="text-xs text-stone-500 mb-6 min-h-[36px] leading-relaxed">
                    {plan.tagline}
                  </p>

                  {/* Price Section */}
                  <div className="mb-6 pb-6 border-b border-stone-100">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl sm:text-4xl font-extrabold text-stone-900 font-display">
                        {plan.price === 0 ? 'Free' : `₹${plan.price.toLocaleString('en-IN')}`}
                      </span>
                      {plan.price > 0 && (
                        <span className="text-xs text-stone-500 font-medium">
                          / {plan.id === 'monthly' ? 'month' : plan.id === 'half_yearly' ? '6 mo' : 'year'}
                        </span>
                      )}
                    </div>

                    {plan.originalPrice && (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-stone-400 line-through">
                          ₹{plan.originalPrice.toLocaleString('en-IN')}
                        </span>
                        {plan.discountLabel && (
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                            {plan.discountLabel}
                          </span>
                        )}
                      </div>
                    )}

                    {plan.monthlyEquivalent > 0 && plan.id !== 'monthly' && (
                      <p className="text-[11px] text-stone-500 mt-1">
                        Equivalent to only <strong className="text-stone-800">₹{plan.monthlyEquivalent}/mo</strong>
                      </p>
                    )}
                  </div>

                  {/* Feature Checklist */}
                  <div className="space-y-3 flex-1 mb-8">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                      What's Included:
                    </div>
                    <ul className="space-y-2.5">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs text-stone-700 leading-snug">
                          <CheckCircle2
                            className={`w-4 h-4 shrink-0 mt-0.5 ${
                              isYearly
                                ? 'text-amber-500'
                                : isHalfYearly
                                ? 'text-purple-600'
                                : isMonthly
                                ? 'text-emerald-600'
                                : 'text-stone-400'
                            }`}
                          />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Card CTA */}
                <div className="p-6 pt-0">
                  <button
                    id={`select-plan-${plan.id}-btn`}
                    onClick={() => onNavigate(`/list-your-spa?plan=${plan.id}`)}
                    className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer ${
                      isHalfYearly
                        ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-600/20'
                        : isYearly
                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold shadow-amber-500/20'
                        : isMonthly
                        ? 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-emerald-700/20'
                        : 'bg-stone-800 hover:bg-stone-900 text-white'
                    }`}
                  >
                    <span>{plan.id === 'free' ? 'Get Started Free' : `Choose ${plan.name}`}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <p className="text-[11px] text-center text-stone-400 mt-2">
                    {plan.id === 'free' ? 'Standard review queue' : 'Instant activation & 24h review'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Feature Comparison Table */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 mb-16 shadow-xs overflow-hidden">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-stone-900 font-display">
              Comprehensive Feature Comparison
            </h2>
            <p className="text-xs text-stone-500">
              Detailed breakdown of perks and benefits across all listing tiers.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-stone-200">
                  <th className="py-3 px-4 text-stone-500 font-semibold">Features &amp; Visibility</th>
                  <th className="py-3 px-4 text-stone-700 font-bold">Free Basic</th>
                  <th className="py-3 px-4 text-emerald-800 font-bold">Monthly Pro (₹999)</th>
                  <th className="py-3 px-4 text-purple-700 font-bold">Half-Yearly (₹4,999)</th>
                  <th className="py-3 px-4 text-amber-700 font-bold">Yearly VIP (₹8,999)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                <tr>
                  <td className="py-3 px-4 font-medium">Directory Indexing &amp; Contact Info</td>
                  <td className="py-3 px-4"><Check className="w-4 h-4 text-emerald-600" /></td>
                  <td className="py-3 px-4"><Check className="w-4 h-4 text-emerald-600" /></td>
                  <td className="py-3 px-4"><Check className="w-4 h-4 text-emerald-600" /></td>
                  <td className="py-3 px-4"><Check className="w-4 h-4 text-emerald-600" /></td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium">Verification Approval Speed</td>
                  <td className="py-3 px-4 text-stone-500">3 - 7 Days</td>
                  <td className="py-3 px-4 font-semibold text-emerald-700">Within 24 Hours</td>
                  <td className="py-3 px-4 font-semibold text-purple-700">Within 24 Hours</td>
                  <td className="py-3 px-4 font-semibold text-amber-700">Priority VIP (Same Day)</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium">Trust Badge on Cards &amp; Page</td>
                  <td className="py-3 px-4 text-stone-400">—</td>
                  <td className="py-3 px-4 text-emerald-700 font-semibold">Verified Pro</td>
                  <td className="py-3 px-4 text-purple-700 font-semibold">Premium Featured</td>
                  <td className="py-3 px-4 text-amber-600 font-semibold">Platinum VIP Shield</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium">Visitor on Spa Counter</td>
                  <td className="py-3 px-4 text-stone-400">—</td>
                  <td className="py-3 px-4"><Check className="w-4 h-4 text-emerald-600" /></td>
                  <td className="py-3 px-4"><Check className="w-4 h-4 text-emerald-600" /></td>
                  <td className="py-3 px-4"><Check className="w-4 h-4 text-emerald-600" /></td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium">SEO Keywords &amp; Image Alt Tags</td>
                  <td className="py-3 px-4 text-stone-400">—</td>
                  <td className="py-3 px-4"><Check className="w-4 h-4 text-emerald-600" /></td>
                  <td className="py-3 px-4"><Check className="w-4 h-4 text-emerald-600" /></td>
                  <td className="py-3 px-4"><Check className="w-4 h-4 text-emerald-600" /></td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium">Direct WhatsApp &amp; Booking Links</td>
                  <td className="py-3 px-4 text-stone-400">—</td>
                  <td className="py-3 px-4"><Check className="w-4 h-4 text-emerald-600" /></td>
                  <td className="py-3 px-4"><Check className="w-4 h-4 text-emerald-600" /></td>
                  <td className="py-3 px-4"><Check className="w-4 h-4 text-emerald-600" /></td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium">Area / Locality Search Boost</td>
                  <td className="py-3 px-4 text-stone-500">Standard</td>
                  <td className="py-3 px-4 text-emerald-700 font-medium">3x Boost</td>
                  <td className="py-3 px-4 text-purple-700 font-semibold">Top 5 Area Ranking</td>
                  <td className="py-3 px-4 text-amber-700 font-bold">#1 - #3 Top Placement</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium">Dedicated Account Manager</td>
                  <td className="py-3 px-4 text-stone-400">—</td>
                  <td className="py-3 px-4 text-stone-400">—</td>
                  <td className="py-3 px-4 text-purple-700 font-medium">Priority Support</td>
                  <td className="py-3 px-4 text-amber-700 font-bold"><Check className="w-4 h-4 text-amber-600 inline" /> Dedicated Desk</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQs */}
        <div className="max-w-3xl mx-auto mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-stone-900 font-display">
              Frequently Asked Questions
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              Have questions about listing your wellness establishment? We are here to help.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-xl border border-stone-200 p-5 shadow-2xs">
                <h3 className="text-sm font-bold text-stone-900 flex items-start gap-2 mb-2">
                  <HelpCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{faq.q}</span>
                </h3>
                <p className="text-xs text-stone-600 pl-6 leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Need Assistance Banner */}
        <div className="bg-gradient-to-r from-emerald-900 to-stone-900 rounded-2xl text-white p-8 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div>
            <h3 className="text-xl font-bold font-display mb-1">Need help deciding the right plan?</h3>
            <p className="text-xs text-emerald-200 max-w-xl">
              Our partner listing team is available on WhatsApp and phone to help you onboard your center smoothly.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate('/contact')}
              className="py-2.5 px-5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors"
            >
              Contact Support
            </button>
            <button
              onClick={() => onNavigate('/list-your-spa?plan=half_yearly')}
              className="py-2.5 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors shadow-sm"
            >
              List Your Spa Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
