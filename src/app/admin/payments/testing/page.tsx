'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'

interface Payment {
  id: string
  amount: number
  currency: string
  status: string
  subscriptionType: string
  createdAt: string
  paidAt?: string
  user: {
    email: string
    name?: string
  }
}

export default function PaymentTestingPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchPayments = async () => {
    try {
      const response = await fetch('/api/admin/payments/list')
      if (response.ok) {
        const data = await response.json()
        setPayments(data.payments)
      }
    } catch (error) {
      console.error('Error fetching payments:', error)
    } finally {
      setLoading(false)
    }
  }

  const simulateWebhook = async (paymentId: string, action: 'complete' | 'expire') => {
    setProcessing(paymentId)
    try {
      const response = await fetch('/api/payments/simulate-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId, action })
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: 'Success',
          description: data.message,
          variant: 'default'
        })
        fetchPayments() // Refresh the list
      } else {
        toast({
          title: 'Error',
          description: data.error,
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to simulate webhook',
        variant: 'destructive'
      })
    } finally {
      setProcessing(null)
    }
  }

  useEffect(() => {
    fetchPayments()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center">Loading payments...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Payment Testing</h1>
        <Button onClick={fetchPayments} variant="outline">
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Development Payment Testing</CardTitle>
          <p className="text-sm text-muted-foreground">
            This page allows you to simulate payment webhooks for testing purposes in development.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {payments.length === 0 ? (
              <p className="text-center py-4 text-muted-foreground">
                No payments found. Create a subscription to see payments here.
              </p>
            ) : (
              payments.map((payment) => (
                <Card key={payment.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Badge variant={
                            payment.status === 'PAID' ? 'default' : 
                            payment.status === 'PENDING' ? 'secondary' : 
                            'destructive'
                          }>
                            {payment.status}
                          </Badge>
                          <span className="font-medium">{payment.subscriptionType}</span>
                        </div>
                        <div>
                          <p className="font-semibold">{payment.user.email}</p>
                          {payment.user.name && (
                            <p className="text-sm text-muted-foreground">{payment.user.name}</p>
                          )}
                        </div>
                        <div className="text-sm space-y-1">
                          <p><strong>Amount:</strong> {payment.currency} {payment.amount.toLocaleString()}</p>
                          <p><strong>Created:</strong> {new Date(payment.createdAt).toLocaleString()}</p>
                          {payment.paidAt && (
                            <p><strong>Paid:</strong> {new Date(payment.paidAt).toLocaleString()}</p>
                          )}
                          <p><strong>Payment ID:</strong> <code className="text-xs">{payment.id}</code></p>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        {payment.status === 'PENDING' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => simulateWebhook(payment.id, 'complete')}
                              disabled={processing === payment.id}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              {processing === payment.id ? 'Processing...' : 'Mark as Paid'}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => simulateWebhook(payment.id, 'expire')}
                              disabled={processing === payment.id}
                            >
                              Mark as Expired
                            </Button>
                          </>
                        )}
                        {payment.status === 'PAID' && (
                          <span className="text-green-600 font-medium">✓ Completed</span>
                        )}
                        {payment.status === 'EXPIRED' && (
                          <span className="text-red-600 font-medium">✗ Expired</span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Setup Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">For Local Development Testing:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Create a subscription as the test user</li>
              <li>Use the "Mark as Paid" button above to simulate successful payment</li>
              <li>Check that the user's subscription is activated</li>
            </ol>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">For Production-like Testing (with ngrok):</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Install ngrok: <code className="bg-gray-100 px-1 rounded">npm install -g ngrok</code></li>
              <li>Run ngrok: <code className="bg-gray-100 px-1 rounded">ngrok http 3000</code></li>
              <li>Update Xendit webhook URL to: <code className="bg-gray-100 px-1 rounded">https://your-ngrok-url.ngrok.io/api/payments/webhook/xendit</code></li>
              <li>Make actual test payments using Xendit's test payment methods</li>
            </ol>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Using the Command Line Script:</h4>
            <p className="text-sm">
              Run: <code className="bg-gray-100 px-1 rounded">npx tsx scripts/simulate-payment-webhook.ts [payment-id]</code>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              If no payment ID is provided, it will process the most recent pending payment.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
