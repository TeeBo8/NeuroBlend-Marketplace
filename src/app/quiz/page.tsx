import type { Metadata } from "next";
import { QuizContent } from "./quiz-content";

export const metadata: Metadata = {
  title: "Quiz café — Quel profil neuroatypique êtes-vous ?",
  description:
    "Répondez à 3 questions et découvrez le profil café adapté à votre esprit neuroatypique. HPI, ADHD ou Hypersensible, trouvez le blend artisanal fait pour vous.",
  keywords: [
    "quiz café",
    "profil neuroatypique",
    "café HPI",
    "café ADHD",
    "café hypersensible",
    "test café",
  ],
  openGraph: {
    title: "Quiz — Trouvez votre café idéal | NeuroBlend",
    description:
      "3 questions pour découvrir le blend artisanal fait pour votre esprit.",
    type: "website",
    locale: "fr_FR",
  },
  alternates: {
    canonical: "/quiz",
  },
};

export default function QuizPage() {
  return <QuizContent />;
}
