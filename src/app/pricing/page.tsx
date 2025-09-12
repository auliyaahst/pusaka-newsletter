// app/pricing/page.tsx
'use client';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PricingPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'Monthly' | 'Yearly' | 'Link'>('Monthly');
  const router = useRouter();

  const plans = [
    {
      id: 'basic',
      title: 'Basic',
      monthlyPrice: 29,
      yearlyPrice: 290,
      features: [
        'Access to basic newsletter',
        'Monthly insights',
        'Email support',
        'Basic analytics',
        'Mobile app access'
      ],
      buttonStyle: 'bg-gray-800 text-white hover:bg-gray-900'
    },
    {
      id: 'premium',
      title: 'Premium',
      monthlyPrice: 50,
      yearlyPrice: 500,
      features: [
        'All basic features',
        'Premium newsletter content',
        'Weekly deep insights',
        'Priority support',
        'Advanced analytics',
        'Early access to content'
      ],
      buttonStyle: 'bg-white text-gray-800 border border-gray-300 hover:bg-gray-50',
      popular: true
    },
    {
      id: 'enterprise',
      title: 'Enterprise',
      monthlyPrice: 99,
      yearlyPrice: 990,
      features: [
        'All premium features',
        'Custom newsletter branding',
        'Dedicated account manager',
        '24/7 phone support',
        'Custom integrations',
        'Team collaboration tools'
      ],
      buttonStyle: 'bg-gray-800 text-white hover:bg-gray-900'
    }
  ];

  const handleSubscribe = async (planId: string) => {
    if (!session) {
      router.push('/login');
      return;
    }

    setLoading(planId);
    
    try {
      const subscriptionType = billingCycle === 'Monthly' ? 'MONTHLY' : 'ANNUALLY';
      const response = await fetch('/api/subscriptions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionType })
      });

      const data = await response.json();
      
      if (response.ok) {
        if (data.invoiceUrl) {
          window.location.href = data.invoiceUrl;
        } else if (data.redirectUrl) {
          window.location.href = data.redirectUrl;
        }
      } else {
        console.error('Subscription error:', data.error);
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Subscription error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const handleSkipRegistration = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#03396C' }}>
      {/* Header */}
      <div className="px-6 py-8">
        <div className="flex items-center space-x-3 text-white">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-blue-900" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2L3 7v11h4v-6h6v6h4V7l-7-5z"/>
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold">The Pusaka Newsletter</h1>
            <p className="text-blue-200 text-sm">ThePusaka.id</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center px-4 pb-20">
        <div className="w-full max-w-6xl">
          <h1 className="text-4xl font-bold text-white text-center mb-12">Choose your plan</h1>
          
          {/* Billing Toggle */}
          <div className="flex justify-center mb-12">
            <div className="bg-white rounded-lg p-1 inline-flex">
              {['Monthly', 'Yearly', 'Link'].map((cycle) => (
                <button
                  key={cycle}
                  onClick={() => setBillingCycle(cycle as 'Monthly' | 'Yearly' | 'Link')}
                  className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                    billingCycle === cycle
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  {cycle}
                </button>
              ))}
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {plans.map((plan) => {
              const price = billingCycle === 'Monthly' ? plan.monthlyPrice : plan.yearlyPrice;
              const priceLabel = billingCycle === 'Monthly' ? '/mo' : '/year';
              
              return (
                <div
                  key={plan.id}
                  className={`bg-white rounded-lg p-8 relative ${
                    plan.popular ? 'ring-2 ring-gray-800' : ''
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gray-800 text-white px-3 py-1 rounded-full text-sm font-medium">
                        Most Popular
                      </span>
                    </div>
                  )}
                  
                  <div className="text-center mb-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">{plan.title}</h3>
                    <div className="mb-4">
                      <span className="text-4xl font-bold text-gray-900">${price}</span>
                      <span className="text-gray-600">{priceLabel}</span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-green-500 mr-3">•</span>
                        <span className="text-gray-600 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={loading === plan.id}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 ${plan.buttonStyle}`}
                  >
                    {loading === plan.id ? 'Processing...' : 'Button'}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Skip Registration */}
          <div className="text-center">
            <button
              onClick={handleSkipRegistration}
              className="bg-white bg-opacity-20 text-black border border-white border-opacity-30 px-6 py-2 rounded-lg hover:bg-opacity-30 transition-colors"
            >
              Skip Registration
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-6">
        <p className="text-blue-200 text-sm">© The Pusaka Newsletter</p>
      </div>
    </div>
  );
}