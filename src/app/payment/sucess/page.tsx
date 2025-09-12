// app/payment/success/page.tsx
import Link from 'next/link';

export default function PaymentSuccess() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-green-600 mb-4">Payment Successful!</h1>
        <p>Your subscription has been activated.</p>
        <Link href="/dashboard" className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded">
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}