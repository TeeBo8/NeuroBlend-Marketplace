import type { Metadata } from "next";
import { QuizContent } from "./quiz-content";

export const metadata: Metadata = {
  title: "Quiz — Trouvez votre café idéal",
  description:
    "Répondez à 3 questions et découvrez le profil café adapté à votre esprit neuroatypique. HPI, ADHD ou Hypersensible, trouvez le blend fait pour vous.",
};

export default function QuizPage() {
  return <QuizContent />;
}
