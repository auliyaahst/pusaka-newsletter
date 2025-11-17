export interface UserSubscription {
  subscriptionType: string
  subscriptionEnd: string | null
  isActive: boolean
}

export interface SubscriptionPlan {
  id: string
  name: string
  price: number
  currency: string
  duration: number
  features: string[]
  popular?: boolean
}

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'monthly',
    name: 'Monthly Plan',
    price: 99000, // IDR 99,000
    currency: 'IDR',
    duration: 30,
    features: [
      'Access to all articles',
      'Monthly newsletter',
      'Basic support',
      'Download PDF articles'
    ]
  },
  {
    id: 'quarterly',
    name: 'Quarterly Plan',
    price: 249000, // IDR 249,000 (save 16%)
    currency: 'IDR',
    duration: 90,
    popular: true,
    features: [
      'Access to all articles',
      'Monthly newsletter',
      'Priority support',
      'Download PDF articles',
      'Early access to new content'
    ]
  },
  {
    id: 'annually',
    name: 'Annual Plan',
    price: 899000, // IDR 899,000 (save 24%)
    currency: 'IDR',
    duration: 365,
    features: [
      'Access to all articles',
      'Monthly newsletter',
      'Premium support',
      'Download PDF articles',
      'Early access to new content',
      'Exclusive webinars',
      'Direct author contact'
    ]
  }
]

export const formatCurrency = (amount: number, currency: string = 'IDR') => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amount)
}

export const isSubscriptionActive = (subscription: UserSubscription | null): boolean => {
  if (!subscription) return false
  if (!subscription.isActive) return false
  if (!subscription.subscriptionEnd) return true
  return new Date(subscription.subscriptionEnd) > new Date()
}

export const getSubscriptionDisplayName = (subscriptionType: string): string => {
  switch (subscriptionType) {
    case 'MONTHLY':
      return 'Monthly Plan'
    case 'QUARTERLY':
      return 'Quarterly Plan'
    case 'ANNUALLY':
      return 'Annual Plan'
    case 'FREE_TRIAL':
      return 'Free Trial'
    default:
      return subscriptionType.replace('_', ' ')
  }
}

export const getDaysUntilExpiry = (subscriptionEnd: string | null): number | null => {
  if (!subscriptionEnd) return null
  const endDate = new Date(subscriptionEnd)
  const today = new Date()
  const diffTime = endDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return Math.max(0, diffDays)
}
