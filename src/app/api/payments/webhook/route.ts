// // app/api/payments/webhook/route.ts
// import { prisma } from "@/lib/prisma";
// import { SUBSCRIPTION_PLANS } from "@/lib/subscription-plans";

// export async function POST(request: Request) {
//   try {
//     const body = await request.json();
    
//     // Verify webhook (you should implement proper verification)
//     const webhookToken = request.headers.get('x-callback-token');
//     if (webhookToken !== process.env.XENDIT_WEBHOOK_TOKEN) {
//       return Response.json({ error: "Invalid webhook" }, { status: 401 });
//     }

//     const { external_id, status, invoice } = body;

//     // Find payment record
//     const payment = await prisma.payment.findUnique({
//       where: { xenditInvoiceId: invoice.id },
//       include: { user: true }
//     });

//     if (!payment) {
//       return Response.json({ error: "Payment not found" }, { status: 404 });
//     }

//     // Update payment status
//     await prisma.payment.update({
//       where: { id: payment.id },
//       data: { status: status.toLowerCase() }
//     });

//     // If payment is successful, update user subscription
//     if (status === 'PAID') {
//       const plan = SUBSCRIPTION_PLANS[payment.subscriptionType];
//       const now = new Date();
//       const endDate = new Date(now.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);

//       await prisma.user.update({
//         where: { id: payment.userId },
//         data: {
//           subscriptionType: payment.subscriptionType,
//           subscriptionStart: now,
//           subscriptionEnd: endDate,
//           isActive: true
//         }
//       });

//       // Optional: Send confirmation email
//       // await sendSubscriptionConfirmationEmail(payment.user.email, plan);
//     }

//     return Response.json({ status: "success" });

//   } catch (error) {
//     console.error("Webhook error:", error);
//     return Response.json({ error: "Webhook processing failed" }, { status: 500 });
//   }
// }