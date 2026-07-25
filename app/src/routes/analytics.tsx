import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Typography } from "@higgsfield/quanta/typography";
import { Loader } from "@higgsfield/quanta/loader";
import { Button } from "@higgsfield/quanta/button";
import { Icon } from "@higgsfield/quanta/icon";
import { BarChart3, Eye, Sparkles, Globe, Activity } from "lucide-react";
import { getAnalyticsSummaryFn } from "@/lib/analytics.functions";

export const Route = createFileRoute("/analytics")({
  component: AnalyticsDashboard,
  head: () => ({
    meta: [
      { title: "Analytics — Orgasmo" },
      { name: "description", content: "Orgasmo analytics dashboard" },
    ],
  }),
});

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: typeof Eye;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-q-600 border border-q-border-subtle bg-q-background-secondary p-5">
      <div
        className={`flex size-12 shrink-0 items-center justify-center rounded-q-400 ${color}`}
      >
        <Icon as={icon} size="lg" className="text-white" />
      </div>
      <div className="flex min-w-0 flex-col gap-0.5">
        <Typography as="span" variant="body-sm-regular" color="tertiary">
          {label}
        </Typography>
        <Typography as="span" variant="display-lg-bold" color="primary">
          {value}
        </Typography>
      </div>
    </div>
  );
}

function AnalyticsDashboard() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["analytics", "summary"],
    queryFn: () => getAnalyticsSummaryFn(),
    refetchOnWindowFocus: false,
    staleTime: 30_000,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-q-background-primary">
        <Loader size="md" color="neutral" aria-label="Loading analytics" />
      </div>
    );
  }

  if (error || data?.ok === false) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-q-background-primary px-4">
        <Typography as="h1" variant="title-md-semi-bold" color="danger">
          Failed to load analytics
        </Typography>
        <Typography as="p" variant="body-sm-regular" color="secondary">
          {error?.message ?? data?.error}
        </Typography>
        <Button variant="tertiary" size="sm" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  const summary = data.summary;

  return (
    <div className="min-h-dvh bg-q-background-primary p-6">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <div className="flex items-center gap-3">
          <Icon as={BarChart3} size="lg" />
          <Typography as="h1" variant="headline-md-semi-bold" color="primary">
            Analytics
          </Typography>
        </div>

        {/* Stats row */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={Eye}
            label="Page Views"
            value={summary.totalPageViews}
            color="bg-blue-600"
          />
          <StatCard
            icon={Sparkles}
            label="Generations"
            value={summary.totalGenerations}
            color="bg-lime-600"
          />
          <StatCard
            icon={Globe}
            label="Top Pages"
            value={summary.topPages.length}
            color="bg-purple-600"
          />
          <StatCard
            icon={Activity}
            label="Features Used"
            value={summary.featureUsage.length}
            color="bg-amber-600"
          />
        </div>

        {/* Page views by day */}
        {summary.pageViewsByDay.length > 0 && (
          <section className="flex flex-col gap-4">
            <Typography as="h2" variant="title-md-semi-bold" color="primary">
              Page Views (Last 14 Days)
            </Typography>
            <div className="flex items-end gap-2 overflow-x-auto pb-2">
              {summary.pageViewsByDay.map((day) => {
                const max = Math.max(...summary.pageViewsByDay.map((d) => d.count), 1);
                const height = Math.max((day.count / max) * 120, 8);
                return (
                  <div
                    key={day.day}
                    className="flex shrink-0 flex-col items-center gap-1"
                    title={`${day.day}: ${day.count} views`}
                  >
                    <Typography as="span" variant="caption-sm-regular" color="tertiary">
                      {day.count}
                    </Typography>
                    <div
                      className="w-8 rounded-t-q-200 bg-q-brand-primary transition-all"
                      style={{ height: `${height}px` }}
                    />
                    <Typography as="span" variant="caption-xs-regular" color="tertiary" className="truncate max-w-12 text-center">
                      {day.day.slice(5)}
                    </Typography>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Top pages */}
        {summary.topPages.length > 0 && (
          <section className="flex flex-col gap-4">
            <Typography as="h2" variant="title-md-semi-bold" color="primary">
              Top Pages
            </Typography>
            <div className="flex flex-col gap-2">
              {summary.topPages.map((page, i) => (
                <div
                  key={page.page_path}
                  className="flex items-center gap-4 rounded-q-400 bg-q-background-secondary px-4 py-3"
                >
                  <Typography as="span" variant="body-sm-regular" color="tertiary" className="w-6 text-right">
                    {i + 1}
                  </Typography>
                  <Typography as="span" variant="body-sm-regular" color="primary" className="flex-1 truncate">
                    {page.page_path}
                  </Typography>
                  <Typography as="span" variant="body-sm-semi-bold" color="brand">
                    {page.count}
                  </Typography>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Feature usage */}
        {summary.featureUsage.length > 0 && (
          <section className="flex flex-col gap-4">
            <Typography as="h2" variant="title-md-semi-bold" color="primary">
              Feature Usage
            </Typography>
            <div className="flex flex-col gap-2">
              {summary.featureUsage.map((feature) => (
                <div
                  key={feature.event_name}
                  className="flex items-center gap-4 rounded-q-400 bg-q-background-secondary px-4 py-3"
                >
                  <Typography as="span" variant="body-sm-regular" color="primary" className="flex-1">
                    {feature.event_name}
                  </Typography>
                  <Typography as="span" variant="body-sm-semi-bold" color="brand">
                    {feature.count}
                  </Typography>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Recent events */}
        {summary.recentEvents.length > 0 && (
          <section className="flex flex-col gap-4">
            <Typography as="h2" variant="title-md-semi-bold" color="primary">
              Recent Events
            </Typography>
            <div className="flex flex-col gap-1">
              {summary.recentEvents.map((event, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-q-300 bg-q-background-secondary px-3 py-2"
                >
                  <span
                    className={`inline-block size-2 shrink-0 rounded-full ${
                      event.event_type === "page_view"
                        ? "bg-blue-500"
                        : event.event_type === "generation"
                          ? "bg-lime-500"
                          : "bg-amber-500"
                    }`}
                  />
                  <Typography as="span" variant="caption-sm-regular" color="primary" className="flex-1 truncate">
                    {event.event_name}
                  </Typography>
                  <Typography as="span" variant="caption-xs-regular" color="tertiary" className="shrink-0">
                    {event.page_path}
                  </Typography>
                  <Typography as="span" variant="caption-xs-regular" color="tertiary" className="shrink-0">
                    {event.created_at?.slice(0, 10)}
                  </Typography>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Empty state */}
        {summary.totalPageViews === 0 && (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <Icon as={BarChart3} size="xl" className="text-q-text-tertiary" />
            <Typography as="h2" variant="title-md-semi-bold" color="secondary">
              No data yet
            </Typography>
            <Typography as="p" variant="body-sm-regular" color="tertiary" className="max-w-sm">
              Analytics data will appear here once users start interacting with the app.
            </Typography>
          </div>
        )}
      </div>
    </div>
  );
}