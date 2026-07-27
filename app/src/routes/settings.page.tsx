import { useQuery } from "@tanstack/react-query";
import { Typography } from "@higgsfield/quanta/typography";
import { Loader } from "@higgsfield/quanta/loader";
import { Button } from "@higgsfield/quanta/button";
import { Icon } from "@higgsfield/quanta/icon";
import { User, CreditCard, Palette, LogOut, ExternalLink, Shield } from "lucide-react";
import { fetchCurrentUser } from "@/lib/fnf.browser";

export default function SettingsPage() {
  const { data: user, isLoading } = useQuery({
    queryKey: ["current-user"],
    queryFn: fetchCurrentUser,
    staleTime: 30_000,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-q-background-primary">
        <Loader size="md" color="neutral" aria-label="Loading settings" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-q-background-primary">
      <div className="mx-auto flex max-w-2xl flex-col gap-6 p-6">
        <div className="flex items-center gap-3">
          <Icon as={User} size="lg" />
          <Typography as="h1" variant="headline-md-semi-bold" color="primary">
            Settings
          </Typography>
        </div>

        {!user ? (
          <SettingsSection icon={Shield} title="Sign In">
            <Typography as="p" variant="body-sm-regular" color="secondary">
              Sign in with your Higgsfield account to generate images, manage projects, and track your usage.
            </Typography>
            <div className="mt-2">
              <Button
                onClick={() => {
                  window.location.href = "/__auth/login?return=/settings";
                }}
              >
                Sign In with Higgsfield
              </Button>
            </div>
          </SettingsSection>
        ) : (
          <>
            <SettingsSection icon={User} title="Profile">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Typography as="span" variant="body-sm-regular" color="tertiary" className="w-24 shrink-0">
                    User ID:
                  </Typography>
                  <Typography as="span" variant="body-sm-regular" color="primary" className="font-mono text-xs">
                    {(user as any).id ?? "—"}
                  </Typography>
                </div>
                <div className="flex items-center gap-2">
                  <Typography as="span" variant="body-sm-regular" color="tertiary" className="w-24 shrink-0">
                    Workspace:
                  </Typography>
                  <Typography as="span" variant="body-sm-regular" color="primary">
                    {(user as any).workspaceId ?? "Personal"}
                  </Typography>
                </div>
              </div>
              <div className="mt-2">
                <Button
                  variant="tertiary"
                  size="sm"
                  onClick={() => {
                    window.location.href = "/__auth/logout?return=/";
                  }}
                  start={<Icon as={LogOut} size="sm" />}
                >
                  Sign Out
                </Button>
              </div>
            </SettingsSection>

            <SettingsSection icon={CreditCard} title="Credits & Plan">
              <Typography as="p" variant="body-sm-regular" color="secondary">
                Your credits and plan details are managed through your Higgsfield account.
              </Typography>
              <div className="mt-2">
                <Button
                  variant="tertiary"
                  size="sm"
                  onClick={() => window.open("https://higgsfield.ai", "_blank")}
                  start={<Icon as={ExternalLink} size="sm" />}
                >
                  Manage Subscription
                </Button>
              </div>
            </SettingsSection>

            <SettingsSection icon={Palette} title="Appearance">
              <Typography as="p" variant="body-sm-regular" color="secondary">
                Orgasmo uses the system dark theme. The app is permanently dark to match the Higgsfield platform.
              </Typography>
            </SettingsSection>
          </>
        )}

        <div className="rounded-q-500 border border-q-border-subtle bg-q-background-secondary p-5">
          <Typography as="h2" variant="title-md-semi-bold" color="primary" className="mb-3">
            About
          </Typography>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <Typography as="span" variant="body-sm-regular" color="tertiary" className="w-24 shrink-0">
                App:
              </Typography>
              <Typography as="span" variant="body-sm-regular" color="primary">
                Orgasmo
              </Typography>
            </div>
            <div className="flex items-center gap-2">
              <Typography as="span" variant="body-sm-regular" color="tertiary" className="w-24 shrink-0">
                Version:
              </Typography>
              <Typography as="span" variant="body-sm-regular" color="primary">
                1.0.0
              </Typography>
            </div>
            <div className="flex items-center gap-2">
              <Typography as="span" variant="body-sm-regular" color="tertiary" className="w-24 shrink-0">
                Model:
              </Typography>
              <Typography as="span" variant="body-sm-regular" color="primary">
                GPT Image 2
              </Typography>
            </div>
            <div className="flex items-center gap-2">
              <Typography as="span" variant="body-sm-regular" color="tertiary" className="w-24 shrink-0">
                Platform:
              </Typography>
              <Typography as="span" variant="body-sm-regular" color="primary">
                Higgsfield
              </Typography>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}