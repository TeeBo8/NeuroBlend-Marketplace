import { Resend } from 'resend';

export const getResend = () => {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not configured');
  }
  return new Resend(process.env.RESEND_API_KEY);
};

const FROM_EMAIL = 'NeuroBlend <onboarding@resend.dev>';

export async function sendOrderConfirmationEmail(
  to: string,
  data: {
    name: string;
    orderNumber: string;
    total: string;
    items: { name: string; quantity: number; price: string }[];
  }
) {
  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Commande ${data.orderNumber} confirmée - NeuroBlend`,
      html: orderConfirmationTemplate(data),
    });
  } catch (error) {
    console.error('Failed to send order confirmation email:', error);
  }
}

export async function sendVendorApprovedEmail(
  to: string,
  businessName: string
) {
  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Votre boutique est approuvée ! - NeuroBlend',
      html: vendorApprovedTemplate(businessName),
    });
  } catch (error) {
    console.error('Failed to send vendor approved email:', error);
  }
}

// --- HTML Templates ---

function baseTemplate(content: string) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <!-- Header -->
    <div style="text-align:center;margin-bottom:32px;">
      <h1 style="margin:0;font-size:28px;font-weight:bold;">
        <span style="color:#6B46C1;">Neuro</span><span style="color:#38B2AC;">Blend</span>
      </h1>
    </div>
    <!-- Content -->
    <div style="background-color:#ffffff;border-radius:12px;padding:32px;border:1px solid #e5e7eb;">
      ${content}
    </div>
    <!-- Footer -->
    <div style="text-align:center;margin-top:32px;color:#9ca3af;font-size:12px;">
      <p style="margin:0;">NeuroBlend - Capsules de café pour esprits neuroatypiques</p>
      <p style="margin:8px 0 0;">Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
    </div>
  </div>
</body>
</html>`;
}

function orderConfirmationTemplate(data: {
  name: string;
  orderNumber: string;
  total: string;
  items: { name: string; quantity: number; price: string }[];
}) {
  const itemsHtml = data.items
    .map(
      (item) => `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid #f3f4f6;color:#374151;">${item.name}</td>
      <td style="padding:8px 0;border-bottom:1px solid #f3f4f6;color:#6b7280;text-align:center;">${item.quantity}</td>
      <td style="padding:8px 0;border-bottom:1px solid #f3f4f6;color:#374151;text-align:right;">${item.price}</td>
    </tr>`
    )
    .join('');

  return baseTemplate(`
    <h2 style="margin:0 0 8px;font-size:22px;color:#111827;">
      Commande confirmée !
    </h2>
    <p style="margin:0 0 24px;color:#6b7280;font-size:14px;">
      Commande n° ${data.orderNumber}
    </p>
    <p style="margin:0 0 24px;color:#4b5563;line-height:1.6;">
      Bonjour ${data.name}, votre commande a bien été enregistrée et est en cours de traitement.
    </p>
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
      <thead>
        <tr style="border-bottom:2px solid #e5e7eb;">
          <th style="padding:8px 0;text-align:left;color:#6b7280;font-size:12px;text-transform:uppercase;">Produit</th>
          <th style="padding:8px 0;text-align:center;color:#6b7280;font-size:12px;text-transform:uppercase;">Qté</th>
          <th style="padding:8px 0;text-align:right;color:#6b7280;font-size:12px;text-transform:uppercase;">Prix</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>
    <div style="text-align:right;padding-top:8px;border-top:2px solid #e5e7eb;">
      <span style="font-size:18px;font-weight:bold;color:#111827;">Total : ${data.total}</span>
    </div>
    <div style="text-align:center;margin-top:24px;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/account/orders" style="display:inline-block;background-color:#6B46C1;color:#ffffff;text-decoration:none;padding:12px 32px;border-radius:8px;font-weight:600;">
        Suivre ma commande
      </a>
    </div>
  `);
}

function vendorApprovedTemplate(businessName: string) {
  return baseTemplate(`
    <h2 style="margin:0 0 16px;font-size:22px;color:#111827;">
      Félicitations ! Votre boutique est approuvée
    </h2>
    <p style="margin:0 0 16px;color:#4b5563;line-height:1.6;">
      <strong>${businessName}</strong> est maintenant active sur NeuroBlend. Vous pouvez commencer à ajouter vos produits et recevoir des commandes.
    </p>
    <p style="margin:0 0 24px;color:#4b5563;line-height:1.6;">
      Pour commencer, rendez-vous dans votre espace vendeur pour configurer votre boutique et ajouter vos premières capsules.
    </p>
    <div style="text-align:center;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/vendor/dashboard" style="display:inline-block;background-color:#6B46C1;color:#ffffff;text-decoration:none;padding:12px 32px;border-radius:8px;font-weight:600;">
        Accéder à mon espace vendeur
      </a>
    </div>
  `);
}
