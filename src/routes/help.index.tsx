import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { getOrCreateStartThread } from "@/lib/threads";

export const Route = createFileRoute("/help/")({
  head: () => ({
    meta: [
      { title: "Onboarding Guide — DICS Global" },
      { name: "description", content: "Ask questions about your DICS Global onboarding forms and documents." },
      { property: "og:title", content: "Onboarding Guide — DICS Global" },
      { property: "og:description", content: "Get answers about joining forms, declarations and required documents." },
    ],
  }),
  component: HelpIndex,
});

function HelpIndex() {
  const navigate = useNavigate();
  useEffect(() => {
    const t = getOrCreateStartThread();
    navigate({ to: "/help/$threadId", params: { threadId: t.id }, replace: true });
  }, [navigate]);
  return <div className="min-h-screen bg-background" />;
}
