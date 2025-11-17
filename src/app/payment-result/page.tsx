'use client';

<<<<<<< HEAD
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function PaymentResultPage() {
=======
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

function PaymentResultContent() {
>>>>>>> dev
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
<<<<<<< HEAD
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Payment Successful!</h1>
            <p className="text-sm sm:text-base text-gray-600 mb-6 lg:mb-8 max-w-md mx-auto">
=======
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Successful!</h1>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
>>>>>>> dev
              Your subscription has been activated. You now have full access to all premium content.
            </p>
            <div className="space-y-4">
              <Link 
                href="/dashboard"
<<<<<<< HEAD
                className="inline-block w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-center"
              >
                Go to Dashboard
              </Link>
              <p className="text-xs sm:text-sm text-gray-500">
=======
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Go to Dashboard
              </Link>
              <p className="text-sm text-gray-500">
>>>>>>> dev
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
<<<<<<< HEAD
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Free Trial Started!</h1>
            <p className="text-sm sm:text-base text-gray-600 mb-6 lg:mb-8 max-w-md mx-auto">
=======
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Free Trial Started!</h1>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
>>>>>>> dev
              Welcome to The Pusaka Newsletter! Your 3-month free trial has been activated. 
              Enjoy full access to all our premium content.
            </p>
            <div className="space-y-4">
              <Link 
                href="/dashboard"
<<<<<<< HEAD
                className="inline-block w-full sm:w-auto bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors text-center"
              >
                Start Reading
              </Link>
              <p className="text-xs sm:text-sm text-gray-500">
                Your trial expires in 3 months. We'll remind you before it ends.
=======
                className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                Start Reading
              </Link>
              <p className="text-sm text-gray-500">
                Your trial expires in 3 months. We&apos;ll remind you before it ends.
>>>>>>> dev
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
<<<<<<< HEAD
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Payment Failed</h1>
            <p className="text-sm sm:text-base text-gray-600 mb-6 lg:mb-8 max-w-md mx-auto">
              We couldn't process your payment. Please try again or contact support if the problem persists.
=======
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Failed</h1>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              We couldn&apos;t process your payment. Please try again or contact support if the problem persists.
>>>>>>> dev
            </p>
            <div className="space-y-4">
              <Link 
                href="/pricing"
<<<<<<< HEAD
                className="inline-block w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-center"
              >
                Try Again
              </Link>
              <div className="text-xs sm:text-sm text-gray-500">
=======
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Try Again
              </Link>
              <div className="text-sm text-gray-500">
>>>>>>> dev
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
<<<<<<< HEAD
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Processing...</h1>
            <p className="text-sm sm:text-base text-gray-600">Please wait while we confirm your payment status.</p>
=======
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Processing...</h1>
            <p className="text-gray-600">Please wait while we confirm your payment status.</p>
>>>>>>> dev
          </div>
        );
    }
  };

  return (
<<<<<<< HEAD
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8" style={{backgroundColor: 'var(--accent-blue)'}}>
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8" style={{backgroundColor: 'var(--accent-cream)'}}>
          {/* Logo */}
          <div className="flex items-center justify-center mb-6 lg:mb-8">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mr-3">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" style={{color: 'var(--accent-blue)'}}>
                <path d="M12 2L8 6V8L12 4L16 8V6L12 2ZM12 4.5L10 6.5V8.5L12 6.5L14 8.5V6.5L12 4.5ZM6 9V11L12 5L18 11V9L12 3L6 9ZM12 7L8 11V13L12 9L16 13V11L12 7ZM4 12V14L12 6L20 14V12L12 4L4 12ZM12 8L6 14V16L12 10L18 16V14L12 8ZM2 15V17L12 7L22 17V15L12 5L2 15ZM12 9L4 17V19L12 11L20 19V17L12 9Z"/>
              </svg>
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900" style={{fontFamily: 'serif'}}>The Pusaka Newsletter</h2>
              <p className="text-xs" style={{color: 'var(--accent-blue)'}}>ThePusaka.id</p>
            </div>
=======
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo */}
          <div className="flex items-center justify-center mb-8">
            <Image 
              src="/eagle-logo.svg" 
              alt="The Pusaka Newsletter" 
              width={48}
              height={48}
              className="h-12 w-12 mr-3"
            />
            <h2 className="text-xl font-bold text-gray-900">The Pusaka Newsletter</h2>
>>>>>>> dev
          </div>
          
          {renderContent()}
        </div>
        
        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link 
            href="/"
<<<<<<< HEAD
            className="text-white hover:text-blue-200 text-sm transition-colors"
=======
            className="text-gray-500 hover:text-gray-700 text-sm transition-colors"
>>>>>>> dev
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
<<<<<<< HEAD
=======

export default function PaymentResultPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--primary-dark)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <PaymentResultContent />
    </Suspense>
  );
}
>>>>>>> dev
