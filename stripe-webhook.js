// netlify/functions/stripe-webhook.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY // service_role key, pas anon key
);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const sig = event.headers['stripe-signature'];
  let stripeEvent;

  try {
    stripeEvent = stripe.webhooks.constructEvent(
      event.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature failed:', err.message);
    return { statusCode: 400, body: `Webhook Error: ${err.message}` };
  }

  console.log(`[Stripe] Event: ${stripeEvent.type}`);

  try {
    // === PAIEMENT COMPLÉTÉ ===
    if (stripeEvent.type === 'checkout.session.completed') {
      const session = stripeEvent.data.object;

      // userId Supabase passé via client_reference_id
      const userId = session.client_reference_id;
      if (!userId) {
        console.error('[Stripe] Pas de client_reference_id - paiement ignoré');
        return { statusCode: 200, body: 'OK (no user id)' };
      }

      console.log(`[Stripe] Paiement pour userId: ${userId}, mode: ${session.mode}`);

      // Récupérer le profil actuel
      const { data: profile, error: fetchError } = await supabase
        .from('user_profiles')
        .select('exports_available, is_pro')
        .eq('id', userId)
        .single();

      if (fetchError || !profile) {
        console.error('[Stripe] Profil non trouvé:', userId);
        return { statusCode: 200, body: 'OK (profile not found)' };
      }

      // PAY PER EXPORT (paiement unique)
      if (session.mode === 'payment') {
        const newCredits = (profile.exports_available || 0) + 1;
        const { error } = await supabase
          .from('user_profiles')
          .update({
            exports_available: newCredits,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);

        if (error) {
          console.error('[Stripe] Erreur update crédits:', error);
          return { statusCode: 500, body: 'DB error' };
        }
        console.log(`[Stripe] ✅ +1 export pour ${userId} (total: ${newCredits})`);
      }

      // ABONNEMENT PRO
      if (session.mode === 'subscription') {
        const { error } = await supabase
          .from('user_profiles')
          .update({
            is_pro: true,
            exports_available: 99999,
            stripe_subscription_id: session.subscription,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);

        if (error) {
          console.error('[Stripe] Erreur update PRO:', error);
          return { statusCode: 500, body: 'DB error' };
        }
        console.log(`[Stripe] ✅ PRO activé pour ${userId}`);
      }
    }

    // === ABONNEMENT ANNULÉ ===
    if (stripeEvent.type === 'customer.subscription.deleted') {
      const subscription = stripeEvent.data.object;

      const { error } = await supabase
        .from('user_profiles')
        .update({
          is_pro: false,
          exports_available: 0,
          stripe_subscription_id: null,
          updated_at: new Date().toISOString()
        })
        .eq('stripe_subscription_id', subscription.id);

      if (error) {
        console.error('[Stripe] Erreur désactivation PRO:', error);
      } else {
        console.log(`[Stripe] ✅ Abonnement annulé: ${subscription.id}`);
      }
    }

    return { statusCode: 200, body: JSON.stringify({ received: true }) };

  } catch (err) {
    console.error('[Stripe] Erreur:', err);
    return { statusCode: 500, body: `Error: ${err.message}` };
  }
};
