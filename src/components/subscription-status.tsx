'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface UserSubscription {
  subscriptionType: string;
  subscriptionStart: string | null;
  subscriptionEnd: string | null;
  isActive: boolean;
  trialUsed: boolean;
}

export default function SubscriptionStatus() {
  const { data: session } = useSession();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.email) {
      fetchSubscriptionStatus();
    }
  }, [session]);

  const fetchSubscriptionStatus = async () => {
    try {
      const response = await fetch('/api/subscription-status');
      if (response.ok) {
        const data = await response.json();
        setSubscription(data);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSubscriptionDisplayName = (type: string) => {
    switch (type) {
      case 'FREE_TRIAL': return 'Free Trial';
      case 'MONTHLY': return 'Monthly';
      case 'QUARTERLY': return 'Quarterly';
      case 'HALF_YEARLY': return 'Half Yearly';
      case 'ANNUALLY': return 'Annual';
      default: return type;
    }
  };

  const getStatusColor = (type: string, isActive: boolean) => {
    if (!isActive) return 'bg-red-100 text-red-800';
    switch (type) {
      case 'FREE_TRIAL': return 'bg-green-100 text-green-800';
      case 'MONTHLY': return 'bg-blue-100 text-blue-800';
      case 'QUARTERLY': return 'bg-purple-100 text-purple-800';
      case 'ANNUALLY': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isTrialExpiringSoon = (endDate: string | null) => {
    if (!endDate) return false;
    const end = new Date(endDate);
    const now = new Date();
    const daysLeft = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysLeft <= 7 && daysLeft > 0;
  };

  const isExpired = (endDate: string | null) => {
    if (!endDate) return false;
    return new Date(endDate) < new Date();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscription Status</h3>
        <p className="text-gray-600">Unable to load subscription information.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Subscription Status</h3>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(subscription.subscriptionType, subscription.isActive)}`}>
          {getSubscriptionDisplayName(subscription.subscriptionType)}
        </span>
      </div>
      
      <div className="space-y-3">
        {subscription.subscriptionEnd && (
          <div>
            <p className="text-sm text-gray-600">
              Valid until: <span className="font-medium">{formatDate(subscription.subscriptionEnd)}</span>
            </p>
          </div>
        )}
        
        {subscription.subscriptionType === 'FREE_TRIAL' && subscription.subscriptionEnd && (
          <>
            {isExpired(subscription.subscriptionEnd) ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 font-medium">Your free trial has expired</p>
                <p className="text-red-600 text-sm mt-1">
                  Upgrade to continue enjoying our premium content.
                </p>
                <Link 
                  href="/pricing"
                  className="inline-block mt-3 bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
                >
                  Upgrade Now
                </Link>
              </div>
            ) : isTrialExpiringSoon(subscription.subscriptionEnd) ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 font-medium">Your free trial expires soon</p>
                <p className="text-yellow-700 text-sm mt-1">
                  Upgrade now to continue accessing premium content.
                </p>
                <Link 
                  href="/pricing"
                  className="inline-block mt-3 bg-yellow-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-yellow-700 transition-colors"
                >
                  Upgrade Now
                </Link>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 font-medium">Enjoying your free trial?</p>
                <p className="text-green-700 text-sm mt-1">
                  Upgrade anytime to unlock additional features.
                </p>
                <Link 
                  href="/pricing"
                  className="inline-block mt-3 bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
                >
                  View Plans
                </Link>
              </div>
            )}
          </>
        )}
        
        {!subscription.trialUsed && subscription.subscriptionType !== 'FREE_TRIAL' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 font-medium">Free trial available!</p>
            <p className="text-blue-700 text-sm mt-1">
              You can still start a 3-month free trial anytime.
            </p>
            <Link 
              href="/pricing"
              className="inline-block mt-3 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Start Free Trial
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
