import { Typography } from "@higgsfield/quanta/typography";
import { Icon } from "@higgsfield/quanta/icon";
import { Scale } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-dvh bg-q-background-primary">
      <div className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-12">
        <div className="flex items-center gap-3">
          <Icon as={Scale} size="lg" />
          <Typography as="h1" variant="headline-md-semi-bold" color="primary">
            Terms of Service
          </Typography>
        </div>
        <Typography as="p" variant="body-sm-regular" color="tertiary">
          Last Updated: July 26, 2026
        </Typography>
        <div className="flex flex-col gap-4 text-q-body-sm-regular text-q-text-secondary leading-relaxed">
          <section>
            <Typography as="h2" variant="title-sm-semi-bold" color="primary" className="mb-2">1. Acceptance of Terms</Typography>
            <Typography as="p" variant="body-sm-regular" color="secondary">By accessing or using Orgasmo ("the Service"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.</Typography>
          </section>
          <section>
            <Typography as="h2" variant="title-sm-semi-bold" color="primary" className="mb-2">2. Eligibility</Typography>
            <Typography as="p" variant="body-sm-regular" color="secondary">You must be at least 18 years old to use Orgasmo. By using the Service, you represent and warrant that you are 18 or older.</Typography>
          </section>
          <section>
            <Typography as="h2" variant="title-sm-semi-bold" color="primary" className="mb-2">3. Prohibited Content</Typography>
            <Typography as="p" variant="body-sm-regular" color="secondary">You may NOT use Orgasmo to generate: CSAM (Child Sexual Abuse Material), non-consensual intimate imagery, illegal material, harassment or hate speech, or fraudulent content. Violation will result in immediate account termination.</Typography>
          </section>
          <section>
            <Typography as="h2" variant="title-sm-semi-bold" color="primary" className="mb-2">4. DMCA / Copyright</Typography>
            <Typography as="p" variant="body-sm-regular" color="secondary">Submit DMCA notices to dmca@orgasmo.app. We respond promptly to valid takedown requests.</Typography>
          </section>
          <section>
            <Typography as="h2" variant="title-sm-semi-bold" color="primary" className="mb-2">5. Contact</Typography>
            <Typography as="p" variant="body-sm-regular" color="secondary">Email: support@orgasmo.app. DMCA: dmca@orgasmo.app. Full terms available in TERMS.md.</Typography>
          </section>
        </div>
      </div>
    </div>
  );
}