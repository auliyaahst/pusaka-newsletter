'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  duration: string;
  features: string[];
  popular?: boolean;
  subscriptionType: string;
}

const pricingPlans: PricingPlan[] = [
  {
    id: 'trial',
    name: 'Free Trial',
    price: 0,
    duration: '3 months',
    subscriptionType: 'FREE_TRIAL',
    features: [
      'Access to all newsletter content',
      'Weekly premium insights',
      'Mobile app access',
      'Basic analytics',
      'Email support'
    ]
  },
  {
    id: 'monthly',
    name: 'Monthly',
    price: 99000,
    duration: 'per month',
    subscriptionType: 'MONTHLY',
    features: [
      'Everything in Free Trial',
      'Unlimited article access',
      'Premium research reports',
      'Advanced analytics',
      'Priority support',
      'Download PDF articles'
    ]
  },
  {
    id: 'quarterly',
    name: 'Quarterly',
    price: 249000,
    originalPrice: 297000,
    duration: '3 months',
    subscriptionType: 'QUARTERLY',
    popular: true,
    features: [
      'Everything in Monthly',
      '16% savings vs monthly',
      'Quarterly market reports',
      'Exclusive webinars',
      'Direct analyst access',
      'Custom research requests'
    ]
  },
  {
    id: 'annually',
    name: 'Annual',
    price: 899000,
    originalPrice: 1188000,
    duration: 'per year',
    subscriptionType: 'ANNUALLY',
    features: [
      'Everything in Quarterly',
      '24% savings vs monthly',
      'Annual industry summit access',
      'One-on-one consultations',
      'White-label reports',
      'API access'
    ]
  }
];

export default function PricingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubscribe = async (plan: PricingPlan) => {
    if (!session) {
      router.push('/login?redirect=/pricing');
      return;
    }

    setSelectedPlan(plan.id);
    setLoading(true);

    try {
      if (plan.id === 'trial') {
        // Handle free trial signup
        const response = await fetch('/api/start-trial', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          router.push('/payment-result?success=trial-started');
        } else {
          alert('Failed to start trial. Please try again.');
        }
      } else {
        // Handle paid subscription
        const response = await fetch('/api/create-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            subscriptionType: plan.subscriptionType,
            amount: plan.price,
          }),
        });

        const data = await response.json();

        if (response.ok && data.invoiceUrl) {
          // Redirect to Xendit payment page
          window.location.href = data.invoiceUrl;
        } else {
          alert('Failed to create payment. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setLoading(false);
      setSelectedPlan('');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--accent-blue)' }}>
      {/* Header with consistent styling */}
      <header className="text-white" style={{backgroundColor: 'var(--accent-blue)'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mr-3">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" style={{color: 'var(--accent-blue)'}}>
                  <path d="M12 2L8 6V8L12 4L16 8V6L12 2ZM12 4.5L10 6.5V8.5L12 6.5L14 8.5V6.5L12 4.5ZM6 9V11L12 5L18 11V9L12 3L6 9ZM12 7L8 11V13L12 9L16 13V11L12 7ZM4 12V14L12 6L20 14V12L12 4L4 12ZM12 8L6 14V16L12 10L18 16V14L12 8ZM2 15V17L12 7L22 17V15L12 5L2 15ZM12 9L4 17V19L12 11L20 19V17L12 9Z"/>
                </svg>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold leading-tight" style={{fontFamily: 'serif'}}>The Pusaka Newsletter</h1>
                <p className="text-blue-200 text-xs sm:text-sm">ThePusaka.id</p>
              </div>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">Choose Your Plan</h2>
            <p className="text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto px-4">
              Start with a 3-month free trial, then choose the plan that fits your needs
            </p>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto">
        {/* Pricing Plans */}
        <div className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16" style={{backgroundColor: 'var(--accent-cream)'}}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {pricingPlans.map((plan) => (
              <div
                key={plan.id}
                className={`relative bg-white rounded-2xl shadow-lg p-6 sm:p-8 transition-all duration-300 hover:shadow-xl hover:scale-105 ${
                  plan.popular ? 'ring-2 ring-blue-500 transform scale-105' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-6 sm:mb-8">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    {plan.originalPrice && (
                      <p className="text-gray-400 line-through text-base sm:text-lg">
                        {formatPrice(plan.originalPrice)}
                      </p>
                    )}
                    <p className="text-3xl sm:text-4xl font-bold text-gray-900">
                      {plan.price === 0 ? 'Free' : formatPrice(plan.price)}
                    </p>
                    <p className="text-sm sm:text-base text-gray-600">/{plan.duration}</p>
                  </div>
                </div>

                <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <svg
                        className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-sm sm:text-base text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscribe(plan)}
                  disabled={loading && selectedPlan === plan.id}
                  className={`w-full py-2 sm:py-3 px-4 sm:px-6 rounded-lg text-sm sm:text-base font-semibold transition-all duration-300 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700'
                      : plan.id === 'trial'
                      ? 'bg-green-500 text-white hover:bg-green-600'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  } ${
                    loading && selectedPlan === plan.id
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:shadow-lg'
                  }`}
                >
                  {loading && selectedPlan === plan.id ? (
                    <div className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing...
                    </div>
                  ) : (
                    `${plan.id === 'trial' ? 'Start Free Trial' : 'Subscribe Now'}`
                  )}
                </button>
              </div>
            ))}
          </div>

          {/* FAQ Section */}
          <div className="mt-12 sm:mt-16 lg:mt-20">
            <h3 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-8 sm:mb-12">
              Frequently Asked Questions
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              <div className="bg-white rounded-lg p-4 sm:p-6 shadow-md">
                <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">
                  How does the free trial work?
                </h4>
                <p className="text-sm sm:text-base text-gray-600">
                  Get full access to our premium content for 3 months completely free. 
                  No credit card required. After the trial, you can choose to subscribe 
                  to continue your access.
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 sm:p-6 shadow-md">
                <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">
                  Can I change my plan later?
                </h4>
                <p className="text-sm sm:text-base text-gray-600">
                  Yes! You can upgrade or downgrade your plan at any time from your 
                  dashboard. Changes will be prorated accordingly.
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 sm:p-6 shadow-md">
                <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">
                  What payment methods do you accept?
                </h4>
                <p className="text-sm sm:text-base text-gray-600">
                  We accept various payment methods through Xendit including bank 
                  transfers, e-wallets (GoPay, OVO, DANA), and credit/debit cards.
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 sm:p-6 shadow-md">
                <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">
                  Can I cancel anytime?
                </h4>
                <p className="text-sm sm:text-base text-gray-600">
                  Absolutely! You can cancel your subscription at any time from your 
                  dashboard. You'll continue to have access until the end of your 
                  current billing period.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-white py-6 sm:py-8" style={{backgroundColor: 'var(--accent-blue)'}}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm sm:text-base">&copy; 2025 The Pusaka Newsletter. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
