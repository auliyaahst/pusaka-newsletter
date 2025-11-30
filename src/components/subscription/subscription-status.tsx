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
      case 'MONTHLY': return 'Monthly Plan';
      case 'QUARTERLY': return 'Quarterly Plan';
      case 'HALF_YEARLY': return 'Semi-Annual Plan';
      case 'ANNUALLY': return 'Annual Plan';
      default: return type;
    }
  };

  const getStatusColor = (type: string, isActive: boolean) => {
    if (!isActive) return 'bg-red-50 text-red-700 border-red-200';
    switch (type) {
      case 'FREE_TRIAL': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'MONTHLY': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'QUARTERLY': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'ANNUALLY': return 'bg-amber-50 text-amber-700 border-amber-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysRemaining = (endDate: string | null) => {
    if (!endDate) return null;
    const end = new Date(endDate);
    const now = new Date();
    const daysLeft = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysLeft;
  };

  const isTrialExpiringSoon = (endDate: string | null) => {
    const days = getDaysRemaining(endDate);
    return days !== null && days <= 7 && days > 0;
  };

  const isExpired = (endDate: string | null) => {
    const days = getDaysRemaining(endDate);
    return days !== null && days <= 0;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 lg:p-8 mb-8 shadow-sm">
        <div className="animate-pulse">
          <div className="flex items-center space-x-3 sm:space-x-4 mb-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-xl flex-shrink-0"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
          <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 lg:p-8 mb-8 shadow-sm">
        <div className="text-center py-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h10a2 2 0 012 2v14a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Subscription Status</h3>
          <p className="text-sm text-gray-500">Unable to load subscription information.</p>
        </div>
      </div>
    );
  }

  const daysRemaining = getDaysRemaining(subscription.subscriptionEnd);
  
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 lg:p-8 mb-8 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center border flex-shrink-0 ${getStatusColor(subscription.subscriptionType, subscription.isActive)}`}>
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7 13a3 3 0 003-3V7a3 3 0 116 0v3a3 3 0 003 3v1a1 1 0 11-2 0v-1a1 1 0 00-1-1H10a1 1 0 00-1 1v1a1 1 0 11-2 0v-1z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900">{getSubscriptionDisplayName(subscription.subscriptionType)}</h3>
            <p className="text-xs sm:text-sm text-gray-500">
              {subscription.isActive ? 'Active subscription' : 'Inactive subscription'}
            </p>
          </div>
        </div>
        
        <span className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium border self-start ${getStatusColor(subscription.subscriptionType, subscription.isActive)}`}>
          {subscription.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>
      
      {subscription.subscriptionEnd && (
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-900">Valid until</p>
              <p className="text-base sm:text-lg font-semibold text-gray-700">{formatDate(subscription.subscriptionEnd)}</p>
            </div>
            {daysRemaining !== null && daysRemaining > 0 && (
              <div className="sm:text-right">
                <p className="text-xs sm:text-sm text-gray-500">Days remaining</p>
                <p className={`text-base sm:text-lg font-semibold ${daysRemaining <= 7 ? 'text-amber-600' : 'text-gray-700'}`}>
                  {daysRemaining}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Action Cards */}
      <div className="space-y-4">
        {subscription.subscriptionType === 'FREE_TRIAL' && subscription.subscriptionEnd && (
          <>
            {(() => {
              if (isExpired(subscription.subscriptionEnd)) {
                return (
                  <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-xl p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row items-start space-y-3 sm:space-y-0 sm:space-x-3">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-base sm:text-lg font-semibold text-red-800 mb-2">Trial Expired</h4>
                        <p className="text-sm text-red-700 mb-4">
                          Your free trial has ended. Upgrade now to continue enjoying premium content and features.
                        </p>
                        <Link 
                          href="/subscription"
                          className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-red-600 text-white text-sm rounded-xl font-medium hover:bg-red-700 transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                          Upgrade Now
                          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              }
              
              if (isTrialExpiringSoon(subscription.subscriptionEnd)) {
                return (
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row items-start space-y-3 sm:space-y-0 sm:space-x-3">
                      <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-base sm:text-lg font-semibold text-amber-800 mb-2">Trial Ending Soon</h4>
                        <p className="text-sm text-amber-700 mb-4">
                          Your free trial expires in {daysRemaining} day{daysRemaining === 1 ? '' : 's'}. Upgrade now to avoid interruption.
                        </p>
                        <Link 
                          href="/subscription"
                          className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-amber-600 text-white text-sm rounded-xl font-medium hover:bg-amber-700 transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                          Upgrade Now
                          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              }
              
              return (
                <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-start space-y-3 sm:space-y-0 sm:space-x-3">
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-base sm:text-lg font-semibold text-emerald-800 mb-2">Enjoying Your Trial?</h4>
                      <p className="text-sm text-emerald-700 mb-4">
                        You have {daysRemaining} day{daysRemaining === 1 ? '' : 's'} left. Upgrade anytime to unlock additional features.
                      </p>
                      <Link 
                        href="/subscription"
                        className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-emerald-600 text-white text-sm rounded-xl font-medium hover:bg-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg"
                      >
                        View Plans
                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })()}
          </>
        )}
        
        {!subscription.trialUsed && subscription.subscriptionType !== 'FREE_TRIAL' && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start space-y-3 sm:space-y-0 sm:space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="text-base sm:text-lg font-semibold text-blue-800 mb-2">Free Trial Available!</h4>
                <p className="text-sm text-blue-700 mb-4">
                  You can still start a 3-month free trial to explore all our premium features.
                </p>
                <Link 
                  href="/subscription"
                  className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white text-sm rounded-xl font-medium hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Start Free Trial
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        )}
        
        {subscription.isActive && subscription.subscriptionType !== 'FREE_TRIAL' && (
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h4 className="text-base sm:text-lg font-semibold text-gray-800 mb-1">Manage Subscription</h4>
                <p className="text-sm text-gray-600">Update your plan or billing information</p>
              </div>
              <Link 
                href="/subscription"
                className="inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 bg-white text-gray-700 border border-gray-300 text-sm rounded-xl font-medium hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Manage
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
