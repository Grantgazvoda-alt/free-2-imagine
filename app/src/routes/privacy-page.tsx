import { Typography } from "@higgsfield/quanta/typography";
import { Icon } from "@higgsfield/quanta/icon";
import { Shield } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-dvh bg-q-background-primary">
      <div className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-12">
        <div className="flex items-center gap-3">
          <Icon as={Shield} size="lg" />
          <Typography as="h1" variant="headline-md-semi-bold" color="primary">
            Privacy Policy
          </Typography>
        </div>
        <Typography as="p" variant="body-sm-regular" color="tertiary">
          Last Updated: July 26, 2026
        </Typography>
        <div className="flex flex-col gap-4 text-q-body-sm-regular text-q-text-secondary leading-relaxed">
          <section>
            <Typography as="h2" variant="title-sm-semi-bold" color="primary" className="mb-2">1. Information We Collect</Typography>
            <Typography as="p" variant="body-sm-regular" color="secondary">When you sign in with Higgsfield, we receive your user ID, workspace ID, and display name. We do not store passwords. We collect usage data including pages visited, generation prompts, and outputs. Payment processing is handled by Stripe — we do not store card details.</Typography>
          </section>
          <section>
            <Typography as="h2" variant="title-sm-semi-bold" color="primary" className="mb-2">2. Data Storage</Typography>
            <Typography as="p" variant="body-sm-regular" color="secondary">Your data is stored on Cloudflare's global network (D1 database) and Higgsfield's infrastructure. Generation history is retained for the life of your account. Analytics data is retained for 24 months.</Typography>
          </section>
          <section>
            <Typography as="h2" variant="title-sm-semi-bold" color="primary" className="mb-2">3. GDPR Rights</Typography>
            <Typography as="p" variant="body-sm-regular" color="secondary">EEA users have the right to access, rectify, erase, restrict, port, and object to processing of their data. Contact dpo@orgasmo.app to exercise these rights.</Typography>
          </section>
          <section>
            <Typography as="h2" variant="title-sm-semi-bold" color="primary" className="mb-2">4. Contact</Typography>
            <Typography as="p" variant="body-sm-regular" color="secondary">Email: support@orgasmo.app. DPO: dpo@orgasmo.app. Full policy available in PRIVACY.md.</Typography>
          </section>
        </div>
      </div>
    </div>
  );
}