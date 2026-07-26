import { createFileRoute } from "@tanstack/react-router";
import { Typography } from "@higgsfield/quanta/typography";
import { Button } from "@higgsfield/quanta/button";
import { Icon } from "@higgsfield/quanta/icon";
import { Check, Sparkles, Zap, Building2, HelpCircle } from "lucide-react";

export const Route = createFileRoute("/pricing")({
  component: PricingPage,
  head: () => ({
    meta: [
      { title: "Pricing — Orgasmo" },
      { name: "description", content: "Orgasmo pricing plans — generate any image, no rules" },
    ],
  }),
});

interface PlanTier {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  highlighted: boolean;
  icon: typeof Sparkles;
}

const PLANS: PlanTier[] = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Try Orgasmo with limited generations.",
    icon: Sparkles,
    features: [
      "10 free generations",
      "GPT Image 2 model",
      "Basic styles",
      "Reference image upload",
      "Community support",
    ],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$9.99",
    period: "/month",
    description: "For regular creators who need more power.",
    icon: Zap,
    features: [
      "100 generations per month",
      "All 18 avatar styles",
      "Bulk generation (up to 4)",
      "Priority generation queue",
      "Export/import favorites",
      "Email support",
    ],
    cta: "Subscribe",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "$29.99",
    period: "/month",
    description: "For power users and teams.",
    icon: Building2,
    features: [
      "500 generations per month",
      "All features unlimited",
      "Bulk generation (up to 36)",
      "Highest priority queue",
      "Custom style presets",
      "Priority support",
      "Team collaboration",
      "API access",
    ],
    cta: "Contact Us",
    highlighted: false,
  },
];

function PricingCard({ plan, index }: { plan: PlanTier; index: number }) {
  return (
    <div
      className={`relative flex flex-col gap-6 rounded-q-600 p-6 ${
        plan.highlighted
          ? "border-2 border-q-brand-primary bg-q-background-secondary shadow-lg"
          : "border border-q-border-subtle bg-q-background-secondary"
      }`}
    >
      {plan.highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1 rounded-full bg-q-brand-primary px-3 py-1 text-q-caption-xs-semi-bold text-white">
            <Icon as={Sparkles} size="sm" />
            Most Popular
          </span>
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-q-300 bg-q-brand-primary/10">
          <Icon as={plan.icon} size="md" className="text-q-brand-primary" />
        </div>
        <div>
          <Typography as="h3" variant="title-md-semi-bold" color="primary">
            {plan.name}
          </Typography>
        </div>
      </div>

      <div className="flex items-baseline gap-1">
        <Typography as="span" variant="display-lg-bold" color="primary">
          {plan.price}
        </Typography>
        <Typography as="span" variant="body-sm-regular" color="tertiary">
          {plan.period}
        </Typography>
      </div>

      <Typography as="p" variant="body-sm-regular" color="secondary">
        {plan.description}
      </Typography>

      <div className="flex flex-col gap-2.5">
        {plan.features.map((feature, i) => (
          <div key={i} className="flex items-center gap-2.5">
            <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-q-brand-primary/10">
              <Icon as={Check} size="sm" className="text-q-brand-primary" />
            </div>
            <Typography as="span" variant="body-sm-regular" color="primary">
              {feature}
            </Typography>
          </div>
        ))}
      </div>

      <Button
        variant={plan.highlighted ? "marketingPrimary" : "tertiary"}
        size="md"
        className="mt-auto w-full"
        onClick={() => {
          if (plan.name === "Free") {
            window.location.href = "/";
          } else {
            // Future: Stripe checkout integration
            window.location.href = "/settings";
          }
        }}
      >
        {plan.cta}
      </Button>
    </div>
  );
}

function PricingPage() {
  return (
    <div className="min-h-dvh bg-q-background-primary">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-16">
        {/* Header */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex items-center gap-3">
            <Icon as={Sparkles} size="lg" className="text-q-brand-primary" />
            <Typography as="h1" variant="headline-md-semi-bold" color="primary">
              Simple, Transparent Pricing
            </Typography>
          </div>
          <Typography as="p" variant="body-md-regular" color="secondary" className="max-w-lg">
            Generate any image, no rules. Choose the plan that fits your needs.
          </Typography>
        </div>

        {/* Pricing cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {PLANS.map((plan, i) => (
            <PricingCard key={plan.name} plan={plan} index={i} />
          ))}
        </div>

        {/* FAQ */}
        <div className="flex flex-col gap-4 rounded-q-500 border border-q-border-subtle bg-q-background-secondary p-6">
          <div className="flex items-center gap-3">
            <Icon as={HelpCircle} size="md" className="text-q-text-tertiary" />
            <Typography as="h2" variant="title-md-semi-bold" color="primary">
              Frequently Asked Questions
            </Typography>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-1">
              <Typography as="h3" variant="label-sm-medium" color="primary">
                What counts as a generation?
              </Typography>
              <Typography as="p" variant="body-sm-regular" color="secondary">
                Each image generated counts as one generation. Bulk variations count as separate generations.
              </Typography>
            </div>
            <div className="flex flex-col gap-1">
              <Typography as="h3" variant="label-sm-medium" color="primary">
                Can I upgrade or downgrade?
              </Typography>
              <Typography as="p" variant="body-sm-regular" color="secondary">
                Yes, you can change your plan at any time. Changes apply immediately.
              </Typography>
            </div>
            <div className="flex flex-col gap-1">
              <Typography as="h3" variant="label-sm-medium" color="primary">
                What payment methods do you accept?
              </Typography>
              <Typography as="p" variant="body-sm-regular" color="secondary">
                We accept all major credit cards via Stripe. Enterprise plans can also use invoicing.
              </Typography>
            </div>
            <div className="flex flex-col gap-1">
              <Typography as="h3" variant="label-sm-medium" color="primary">
                Is there a refund policy?
              </Typography>
              <Typography as="p" variant="body-sm-regular" color="secondary">
                Yes, we offer a 14-day refund policy for annual plans. Monthly plans can be cancelled anytime.
              </Typography>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}