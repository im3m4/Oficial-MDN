import type { Metadata } from "next";
import DecisionExperience from "./decision-experience";
import "./decision.css";

export const metadata: Metadata = {
  title: "state — MEDYNA",
  description: "Documenta una decisión importante, contrasta lo esperado con lo ocurrido y convierte cada resultado en mejor criterio.",
  alternates: { canonical: "/state" },
  openGraph: { title: "state — MEDYNA", description: "Decidir con claridad. Aprender con evidencia.", url: "https://xmedyna.com/state", type: "website" },
};

export default function DecisionPage() { return <DecisionExperience />; }
