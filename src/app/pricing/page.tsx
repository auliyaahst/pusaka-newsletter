'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

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
  // {
  //   id: 'trial',
  //   name: 'Free Trial',
  //   price: 0,
  //   duration: '3 months',
  //   subscriptionType: 'FREE_TRIAL',
  //   features: [
  //     'Access to all newsletter content',
  //     'Weekly premium insights',
  //     'Mobile app access',
  //     'Basic analytics',
  //     'Email support'
  //   ]
  // },
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSubscribe = async (plan: PricingPlan) => {
    if (!session) {
      router.push('/login?redirect=/pricing');
      return;
    }

    setSelectedPlan(plan.id);
    setLoading(true);

    try {
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
        globalThis.location.href = data.invoiceUrl;
      } else {
        alert('Failed to create payment. Please try again.');
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
    <div className="h-screen flex flex-col" style={{ backgroundColor: 'var(--accent-blue)' }}>
      {/* Header with exact blue color from image - Fixed at top */}
      <header 
        className="flex-shrink-0 text-white shadow-md" 
        style={{
          backgroundColor: 'var(--accent-blue)'
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              {/* Logo from logo_title.svg */}
              <div className="h-12 flex items-center">
                <Image 
                  src="/logo_title.svg" 
                  alt="The Pusaka Newsletter Logo" 
                  width={150}
                  height={64}
                  className="h-16 w-auto"
                  style={{
                    filter: 'brightness(0) invert(1)'
                  }}
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Consolidated Profile Dropdown with Hamburger Menu */}
              <div className="relative" data-dropdown="profile">
                <button 
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center space-x-2 text-white hover:text-blue-200 bg-white/10 hover:bg-white/20 p-3 rounded-lg transition-all duration-200"
                >
                  {/* Hamburger Menu Icon */}
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                

                {/* Consolidated Dropdown Menu */}
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto transform origin-top-right animate-in fade-in scale-in-95 duration-200">
                    {/* Profile Section */}
                    <div className="p-3 border-b border-gray-200 bg-gray-50">
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-semibold text-sm">
                            {session?.user?.name?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{session?.user?.name}</p>
                          <p className="text-xs text-gray-600 truncate">{session?.user?.email}</p>
                          {session?.user?.role && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                              {session.user.role}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      {/* Dashboard Item */}
                      <button
                        onClick={() => {
                          router.push('/dashboard')
                          setIsMenuOpen(false)
                        }}
                        className="w-full flex items-center space-x-3 text-gray-700 hover:bg-gray-50 px-4 py-3 text-sm transition-colors duration-200"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 5a2 2 0 012-2h2a2 2 0 012 2v3H8V5z" />
                        </svg>
                        <span>Dashboard</span>
                      </button>

                      {/* Profile Item */}
                      <button
                        onClick={() => {
                          router.push('/profile')
                          setIsMenuOpen(false)
                        }}
                        className="w-full flex items-center space-x-3 text-gray-700 hover:bg-gray-50 px-4 py-3 text-sm transition-colors duration-200"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>Profile</span>
                      </button>

                      {/* Subscription Item */}
                      <button
                        onClick={() => {
                          router.push('/subscription')
                          setIsMenuOpen(false)
                        }}
                        className="w-full flex items-center space-x-3 text-gray-700 hover:bg-gray-50 px-4 py-3 text-sm transition-colors duration-200"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Subscription</span>
                      </button>

                      {/* Blog Item */}
                      <button
                        onClick={() => {
                          router.push('/blog')
                          setIsMenuOpen(false)
                        }}
                        className="w-full flex items-center space-x-3 text-gray-700 hover:bg-gray-50 px-4 py-3 text-sm transition-colors duration-200"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M7 4v16l7-4 7 4V4H7z" />
                        </svg>
                        <span>Blog</span>
                      </button>

                      <div className="border-t border-gray-100 mt-2 pt-2">
                        {/* Logout */}
                        <button
                          onClick={() => {
                            signOut({ callbackUrl: '/' })
                            setIsMenuOpen(false)
                          }}
                          className="w-full flex items-center space-x-3 text-red-600 hover:bg-red-50 px-4 py-3 text-sm transition-colors duration-200"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        {/* Pricing Page Title */}
        <div className="text-white py-8 sm:py-12" style={{ backgroundColor: 'var(--accent-blue)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">Choose Your Plan</h1>
            <p className="text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto">
              Select the subscription plan that best fits your needs
            </p>
          </div>
        </div>

        {/* Pricing Plans */}
        <div className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16" style={{backgroundColor: 'var(--accent-cream)'}}>
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
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
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start">
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
                    'Subscribe Now'
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
                  How does the subscription work?
                </h4>
                <p className="text-sm sm:text-base text-gray-600">
                  Choose from our flexible subscription plans. You get full access to our premium content 
                  and can cancel anytime from your profile dashboard.
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
                  dashboard. You&apos;ll continue to have access until the end of your 
                  current billing period.
                </p>
              </div>
            </div>
          </div>
          </div>
        </div>
      </main>

      {/* Footer - Fixed at bottom, always visible */}
      <footer 
        className="flex-shrink-0 text-white py-4 px-8 shadow-md border-t border-opacity-20 border-gray-300" 
        style={{
          backgroundColor: 'var(--accent-blue)'
        }}
      >
        <p className="text-center text-sm">© The Pusaka Newsletter</p>
      </footer>
    </div>
  );
}
