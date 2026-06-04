import Link from "next/link";

import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function HomePage() {
  return (
    <AppShell>
      <div className="space-y-10 py-8">
        <div className="mx-auto max-w-3xl space-y-4 text-center">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Wayflyer × Fin · Operator lane
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">
            Pretty Fly Operator Stack
          </h1>
          <p className="text-muted-foreground">
            We noticed Pretty Fly is{" "}
            <strong className="font-medium text-foreground">
              -3,782 units underwater
            </strong>{" "}
            on inventory while spending on 1.3x ROAS womens prospecting — so we
            built three tools grounded in their 24-month data pack.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Creative Director</CardTitle>
              <CardDescription>
                Launch concepts tied to real bestseller SKUs — revenue, landed
                cost, refund rate from CSV. No hallucinated metrics.
              </CardDescription>
              <Button className="mt-2 w-full" render={<Link href="/generate" />}>
                Demo launches
              </Button>
            </CardHeader>
          </Card>

          <Card className="border-2 border-primary/30">
            <CardHeader>
              <CardTitle>Control Tower</CardTitle>
              <CardDescription>
                Daily ops: reorder £135k top-six SKUs, pause weak ads, route
                support to the bot — £280k profit / 2,054 hrs at stake.
              </CardDescription>
              <Button
                className="mt-2 w-full"
                variant="outline"
                render={<Link href="/control-tower" />}
              >
                Demo ops
              </Button>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>China Market</CardTitle>
              <CardDescription>
                Live expansion intel from NBS, JD, Alibaba, China Daily — for
                international growth decisions.
              </CardDescription>
              <Button
                className="mt-2 w-full"
                variant="outline"
                render={<Link href="/china-market" />}
              >
                Demo expansion
              </Button>
            </CardHeader>
          </Card>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Friday demo: Control Tower → Creative Director → 90s total · all
          figures traceable to hackathon_assets/pretty_fly_data_pack
        </p>
      </div>
    </AppShell>
  );
}
