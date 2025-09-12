// import { Xendit } from 'xendit-node';

// const xendit = new Xendit({
//   secretKey: process.env.XENDIT_SECRET_KEY!,
// });

// // In your xendit.ts file
// export const createInvoice = async (params: {
//   externalId: string;
//   amount: number;
//   payerEmail: string;
//   description: string;
// }) => {
//   const invoiceData = {
//     externalId: params.externalId,
//     amount: params.amount,
//     payerEmail: params.payerEmail,
//     description: params.description,
//     invoiceDuration: 86400, // 24 hours
//     successRedirectUrl: `${process.env.NEXTAUTH_URL}/payment/success`,
//     failureRedirectUrl: `${process.env.NEXTAUTH_URL}/payment/failed`,
    
//     // Specify allowed payment methods
//     paymentMethods: [
//       'CREDIT_CARD',
//       'DEBIT_CARD', 
//       'OVO',
//       'DANA',
//       'SHOPEEPAY',
//       'GOPAY',
//       'QRIS'
//     ],
    
//     // Optional: Set currency (default is IDR)
//     currency: 'IDR',
    
//     // Optional: Enable specific features
//     shouldSendEmail: true,
//     reminderTime: 1440, // 24 hours before expiry
//   };

//   return await xendit.Invoice.createInvoice({
//     data: invoiceData
//   });
// };

// // // Optional: Specific payment method functions
// // // Credit Card payment
// // export const createCreditCardPayment = async (params: {
// //   externalId: string;
// //   amount: number;
// //   payerEmail: string;
// //   description: string;
// // }) => {
// //   const invoiceData = {
// //     externalId: params.externalId,
// //     amount: params.amount,
// //     payerEmail: params.payerEmail,
// //     description: params.description,
// //     invoiceDuration: 86400,
// //     successRedirectUrl: `${process.env.NEXTAUTH_URL}/payment/success`,
// //     failureRedirectUrl: `${process.env.NEXTAUTH_URL}/payment/failed`,
// //     paymentMethods: ['CREDIT_CARD', 'DEBIT_CARD'],
// //     currency: 'IDR',
// //     shouldSendEmail: true,
// //   };

// //   return await xendit.Invoice.createInvoice({
// //     data: invoiceData
// //   });
// // };

// // // E-wallet payment
// // export const createEwalletPayment = async (params: {
// //   externalId: string;
// //   amount: number;
// //   payerEmail: string;
// //   description: string;
// // }) => {
// //   const invoiceData = {
// //     externalId: params.externalId,
// //     amount: params.amount,
// //     payerEmail: params.payerEmail,
// //     description: params.description,
// //     invoiceDuration: 86400,
// //     successRedirectUrl: `${process.env.NEXTAUTH_URL}/payment/success`,
// //     failureRedirectUrl: `${process.env.NEXTAUTH_URL}/payment/failed`,
// //     paymentMethods: ['OVO', 'DANA', 'SHOPEEPAY', 'GOPAY'],
// //     currency: 'IDR',
// //     shouldSendEmail: true,
// //   };

// //   return await xendit.Invoice.createInvoice({
// //     data: invoiceData
// //   });
// // };

// // // QRIS payment
// // export const createQRISPayment = async (params: {
// //   externalId: string;
// //   amount: number;
// //   payerEmail: string;
// //   description: string;
// // }) => {
// //   const invoiceData = {
// //     externalId: params.externalId,
// //     amount: params.amount,
// //     payerEmail: params.payerEmail,
// //     description: params.description,
// //     invoiceDuration: 86400,
// //     successRedirectUrl: `${process.env.NEXTAUTH_URL}/payment/success`,
// //     failureRedirectUrl: `${process.env.NEXTAUTH_URL}/payment/failed`,
// //     paymentMethods: ['QRIS'],
// //     currency: 'IDR',
// //     shouldSendEmail: true,
// //   };

// //   return await xendit.Invoice.createInvoice({
// //     data: invoiceData
// //   });
// // };