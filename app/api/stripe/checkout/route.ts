import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-01-27.acacia",
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      productType, // 'einzel' | 'jahresabo'
      customerData,
      successUrl,
      cancelUrl
    } = body;

    // Produkt-Preise (in Cent)
    const prices = {
      einzel: 2900, // 29 €
      jahresabo: 14900, // 149 €
    };

    const productNames = {
      einzel: "EduFunds Einzelantrag",
      jahresabo: "EduFunds Jahresabo",
    };

    // Stripe Checkout Session erstellen
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card", "apple_pay", "google_pay"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: productNames[productType as keyof typeof productNames],
              description: productType === "einzel" 
                ? "1 KI-generierter Antrag + Support" 
                : "5 Anträge pro Jahr + Prioritäts-Support",
            },
            unit_amount: prices[productType as keyof typeof prices],
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: successUrl || `${process.env.NEXT_PUBLIC_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_URL}/checkout/cancel`,
      customer_email: customerData.email,
      metadata: {
        productType,
        customerName: customerData.name,
        school: customerData.school,
      },
    });

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      sessionUrl: session.url,
    });

  } catch (error) {
    console.error("Stripe Checkout Error:", error);
    return NextResponse.json(
      { error: "Fehler bei der Stripe-Integration", details: String(error) },
      { status: 500 }
    );
  }
}

// Stripe Webhook für Zahlungsbestätigungen
export async function PUT(request: NextRequest) {
  const sig = request.headers.get("stripe-signature");
  const body = await request.text();

  if (!sig) {
    return NextResponse.json({ error: "Kein Signature" }, { status: 400 });
  }

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ""
    );

    // Event verarbeiten
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        console.log("Zahlung erfolgreich:", session.id);
        // TODO: Bestellung in Datenbank aktualisieren
        break;
      }
      case "checkout.session.expired": {
        console.log("Session abgelaufen");
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook Error:", error);
    return NextResponse.json(
      { error: "Webhook Fehler" },
      { status: 400 }
    );
  }
}
