import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import guideMark from "@/assets/guide-mark.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DICS Global — Employee Onboarding" },
      { name: "description", content: "A smarter start to every career at Digital Instruments & Control Systems." },
      { property: "og:title", content: "DICS Global — Employee Onboarding" },
      { property: "og:description", content: "Complete your joining formalities and get answers about your onboarding forms." },
    ],
  }),
  component: Index,
});

const STAGES = ["Personal Information", "Employment & Declarations", "Documents & Checklist", "Review & Submit"];

function Index() {
  return (
    <main className="min-h-screen">
      <section className="bg-hero text-primary-foreground">
        <div className="mx-auto max-w-5xl px-6 py-20 md:py-28">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">
            Digital Instruments &amp; Control Systems
          </p>
          <h1 className="mt-4 max-w-2xl text-4xl font-semibold leading-tight md:text-6xl">
            A Smarter Start to Every Career
          </h1>
          <p className="mt-5 max-w-xl text-lg opacity-85">
            Complete your joining formalities securely in one convenient place.
          </p>
          <div className="mt-9">
            <Button asChild size="lg" variant="secondary" className="h-12 px-6 text-base">
              <Link to="/help">
                Ask about your forms <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-10 px-6 py-16 md:grid-cols-[1.2fr_1fr]">
        <div>
          <h2 className="text-2xl font-semibold">Four simple stages</h2>
          <ol className="mt-6 space-y-3">
            {STAGES.map((s, i) => (
              <li key={s} className="flex items-center gap-4 rounded-xl border bg-card p-4 shadow-elegant">
                <span className="flex size-9 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground">
                  {i + 1}
                </span>
                <span className="font-medium">{s}</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="rounded-2xl border bg-card p-7 shadow-elegant">
          <img src={guideMark} alt="" width={816} height={816} loading="lazy" className="size-14" />
          <h2 className="mt-4 text-xl font-semibold">Questions about a form?</h2>
          <p className="mt-2 text-muted-foreground">
            Ask the onboarding guide about the Bio-Data Form, EPF and ESIC declarations, gratuity
            nomination, required uploads and more.
          </p>
          <Link to="/help" className="mt-5 inline-flex items-center gap-2 font-semibold text-accent hover:underline">
            <FileText className="size-4" /> Open the onboarding guide
          </Link>
        </div>
      </section>
    </main>
  );
}
