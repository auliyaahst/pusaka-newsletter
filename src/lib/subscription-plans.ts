// lib/subscription-plans.ts
export const SUBSCRIPTION_PLANS = {
  FREE_TRIAL: {
    name: "Free Trial",
    price: 0,
    durationDays: 7,
    features: ["Access to 3 articles", "Basic newsletter"]
  },
  MONTHLY: {
    name: "Monthly Plan",
    price: 50000, // IDR
    durationDays: 30,
    features: ["Unlimited articles", "Premium newsletter", "Archive access"]
  },
  QUARTERLY: {
    name: "Quarterly Plan", 
    price: 135000, // IDR (10% discount)
    durationDays: 90,
    features: ["Unlimited articles", "Premium newsletter", "Archive access", "Early access"]
  },
  HALF_YEARLY: {
    name: "Half Yearly Plan",
    price: 250000, // IDR (17% discount)
    durationDays: 180,
    features: ["All quarterly features", "Exclusive content"]
  },
  ANNUALLY: {
    name: "Annual Plan",
    price: 480000, // IDR (20% discount)
    durationDays: 365,
    features: ["All features", "Priority support", "Exclusive events"]
  }
};