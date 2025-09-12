// app/payment/failed/page.tsx
import Link from 'next/link';

export default function PaymentFailed() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Payment Failed</h1>
        <p>Please try again or contact support.</p>
        <Link href="/pricing" className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded">
          Try Again
        </Link>
      </div>
    </div>
  );
}
