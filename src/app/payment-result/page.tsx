'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function PaymentResultPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed' | 'trial-started'>('loading');

  useEffect(() => {
    const paymentStatus = searchParams.get('payment');
    const successParam = searchParams.get('success');
    
    if (paymentStatus === 'success') {
      setStatus('success');
    } else if (paymentStatus === 'failed') {
      setStatus('failed');
    } else if (successParam === 'trial-started') {
      setStatus('trial-started');
    } else {
      // Check for other success indicators
      setStatus('loading');
      // Set a timeout to show failed if no status is detected
      setTimeout(() => setStatus('failed'), 3000);
    }
  }, [searchParams]);

  const renderContent = () => {
    switch (status) {
      case 'success':
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Successful!</h1>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Your subscription has been activated. You now have full access to all premium content.
            </p>
            <div className="space-y-4">
              <Link 
                href="/dashboard"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Go to Dashboard
              </Link>
              <p className="text-sm text-gray-500">
                You should receive a confirmation email shortly.
              </p>
            </div>
          </div>
        );
      
      case 'trial-started':
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Free Trial Started!</h1>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Welcome to The Pusaka Newsletter! Your 3-month free trial has been activated. 
              Enjoy full access to all our premium content.
            </p>
            <div className="space-y-4">
              <Link 
                href="/dashboard"
                className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                Start Reading
              </Link>
              <p className="text-sm text-gray-500">
                Your trial expires in 3 months. We'll remind you before it ends.
              </p>
            </div>
          </div>
        );
      
      case 'failed':
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Failed</h1>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              We couldn't process your payment. Please try again or contact support if the problem persists.
            </p>
            <div className="space-y-4">
              <Link 
                href="/pricing"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Try Again
              </Link>
              <div className="text-sm text-gray-500">
                <p>Need help? Contact us at support@thepusaka.id</p>
              </div>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-gray-400 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Processing...</h1>
            <p className="text-gray-600">Please wait while we confirm your payment status.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo */}
          <div className="flex items-center justify-center mb-8">
            <img 
              src="/eagle-logo.svg" 
              alt="The Pusaka Newsletter" 
              className="h-12 w-12 mr-3"
            />
            <h2 className="text-xl font-bold text-gray-900">The Pusaka Newsletter</h2>
          </div>
          
          {renderContent()}
        </div>
        
        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link 
            href="/"
            className="text-gray-500 hover:text-gray-700 text-sm transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
