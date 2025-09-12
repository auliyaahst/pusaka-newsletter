// // app/api/subscriptions/create/route.ts
// import { getServerSession } from "next-auth";
// import { createInvoice } from "@/lib/xendit";
// import { SUBSCRIPTION_PLANS } from "@/lib/subscription-plans";
// import { prisma } from "@/lib/prisma";
// import { authOptions } from "@/lib/auth";

// export async function POST(request: Request) {
//   try {
//     const session = await getServerSession(authOptions);
//     if (!session?.user?.email) {
//       return Response.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const { subscriptionType } = await request.json();
    
//     // Validate subscription type
//     if (!SUBSCRIPTION_PLANS[subscriptionType as keyof typeof SUBSCRIPTION_PLANS]) {
//       return Response.json({ error: "Invalid subscription type" }, { status: 400 });
//     }

//     const plan = SUBSCRIPTION_PLANS[subscriptionType as keyof typeof SUBSCRIPTION_PLANS];
    
//     // Handle FREE_TRIAL separately - no payment needed
//     if (subscriptionType === 'FREE_TRIAL') {
//       const now = new Date();
//       const endDate = new Date(now.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);

//       await prisma.user.update({
//         where: { email: session.user.email },
//         data: {
//           subscriptionType: 'FREE_TRIAL',
//           subscriptionStart: now,
//           subscriptionEnd: endDate,
//           isActive: true
//         }
//       });

//       return Response.json({ 
//         success: true,
//         message: "Free trial activated successfully",
//         redirectUrl: "/dashboard"
//       });
//     }

//     const externalId = `sub_${session.user.id}_${Date.now()}`;

//     // Create Xendit invoice
//     const invoice = await createInvoice({
//       externalId,
//       amount: plan.price,
//       payerEmail: session.user.email,
//       description: `${plan.name} Subscription - The Pusaka Newsletter`
//     });

//     // For now, we'll skip creating payment record since Payment model doesn't exist yet
//     // You can add this later when you add the Payment model to your schema
//     // await prisma.payment.create({
//     //   data: {
//     //     userId: session.user.id,
//     //     xenditInvoiceId: invoice.id,
//     //     amount: plan.price,
//     //     status: "pending",
//     //     subscriptionType,
//     //     externalId
//     //   }
//     // });

//     return Response.json({ 
//       invoiceUrl: invoice.invoiceUrl,
//       invoiceId: invoice.id 
//     });

//   } catch (error) {
//     console.error("Payment creation error:", error);
//     return Response.json({ error: "Payment creation failed" }, { status: 500 });
//   }
// }