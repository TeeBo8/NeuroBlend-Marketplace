"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
  Brain,
  Lightbulb,
  Zap,
  Feather,
  Coffee,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ProductCard,
  ProductCardSkeleton,
} from "@/components/product/product-card";
import { api } from "@/trpc/client";
import { cn } from "@/lib/utils";
import {
  trackQuizStart,
  trackQuizAnswer,
  trackQuizComplete,
  trackQuizRestart,
} from "@/lib/analytics";
import { PageHero } from '@/components/layout/page-hero';

// ─── Types ───────────────────────────────────────────────

type ProfileKey = "HPI" | "ADHD" | "hypersensitive";

type Answer = {
  label: string;
  description: string;
  icon: React.ReactNode;
  scores: Record<ProfileKey, number>;
};

type Question = {
  id: number;
  question: string;
  subtitle: string;
  answers: Answer[];
};

// ─── Quiz Data ───────────────────────────────────────────

const QUESTIONS: Question[] = [
  {
    id: 1,
    question: "Comment fonctionne votre esprit ?",
    subtitle: "Choisissez ce qui vous ressemble le plus",
    answers: [
      {
        label: "Analytique",
        description:
          "Je pense en arborescences, j'analyse tout en profondeur, j'adore les puzzles complexes.",
        icon: <Lightbulb className="h-6 w-6" />,
        scores: { HPI: 3, ADHD: 1, hypersensitive: 0 },
      },
      {
        label: "Intense",
        description:
          "Mon cerveau va à 100 à l'heure, je passe d'une idée à l'autre, j'ai besoin de stimulation.",
        icon: <Zap className="h-6 w-6" />,
        scores: { HPI: 1, ADHD: 3, hypersensitive: 0 },
      },
      {
        label: "Intuitif",
        description:
          "Je ressens tout intensément, les ambiances, les émotions, les subtilités que d'autres ne perçoivent pas.",
        icon: <Feather className="h-6 w-6" />,
        scores: { HPI: 0, ADHD: 0, hypersensitive: 3 },
      },
    ],
  },
  {
    id: 2,
    question: "Qu'attendez-vous de votre café ?",
    subtitle: "Ce que vous recherchez dans votre tasse",
    answers: [
      {
        label: "Focus",
        description:
          "Un soutien pour ma concentration, une aide pour rester dans ma zone de flow.",
        icon: <Brain className="h-6 w-6" />,
        scores: { HPI: 1, ADHD: 3, hypersensitive: 0 },
      },
      {
        label: "Stimulation",
        description:
          "Un boost pour ma créativité et mes réflexions profondes, du caractère et de la complexité.",
        icon: <Lightbulb className="h-6 w-6" />,
        scores: { HPI: 3, ADHD: 1, hypersensitive: 0 },
      },
      {
        label: "Douceur",
        description:
          "Un moment de calme et de réconfort, des arômes subtils qui ne m'agressent pas.",
        icon: <Feather className="h-6 w-6" />,
        scores: { HPI: 0, ADHD: 0, hypersensitive: 3 },
      },
    ],
  },
  {
    id: 3,
    question: "Quelle intensité préférez-vous ?",
    subtitle: "Le caractère de votre café idéal",
    answers: [
      {
        label: "Doux",
        description:
          "Arômes légers et délicats, faible amertume, douceur enveloppante.",
        icon: <Feather className="h-6 w-6" />,
        scores: { HPI: 0, ADHD: 0, hypersensitive: 3 },
      },
      {
        label: "Équilibré",
        description:
          "Un juste milieu entre douceur et caractère, polyvalent et agréable.",
        icon: <Coffee className="h-6 w-6" />,
        scores: { HPI: 1, ADHD: 3, hypersensitive: 1 },
      },
      {
        label: "Corsé",
        description:
          "Corps puissant, arômes intenses, un café qui a du caractère.",
        icon: <Zap className="h-6 w-6" />,
        scores: { HPI: 3, ADHD: 1, hypersensitive: 0 },
      },
    ],
  },
];

const PROFILES: Record<
  ProfileKey,
  {
    label: string;
    emoji: string;
    title: string;
    description: string;
    color: string;
    traits: string[];
  }
> = {
  HPI: {
    label: "HPI (Haut Potentiel)",
    emoji: "💡",
    title: "L'Esprit Analytique",
    description:
      "Votre cerveau aime la complexité et la profondeur. Vous apprécierez des cafés aux profils aromatiques riches et nuancés, avec des notes subtiles qui stimulent votre pensée en arborescence.",
    color: "border-primary bg-primary/5 text-primary",
    traits: [
      "Arômes complexes et nuancés",
      "Single origins d'exception",
      "Torréfactions variées pour explorer",
    ],
  },
  ADHD: {
    label: "ADHD",
    emoji: "⚡",
    title: "L'Esprit Dynamique",
    description:
      "Votre énergie a besoin d'être canalisée, pas freinée. Nos blends ADHD offrent une libération progressive de caféine pour un focus stable et durable, sans les pics suivis de crashes.",
    color: "border-secondary bg-secondary/10 text-secondary-foreground",
    traits: [
      "Libération progressive de caféine",
      "Équilibre énergie et concentration",
      "Corps rond et réconfortant",
    ],
  },
  hypersensitive: {
    label: "Hypersensible",
    emoji: "🌿",
    title: "L'Âme Sensible",
    description:
      "Votre sensibilité est un super-pouvoir. Nos cafés Hypersensible respectent votre finesse sensorielle avec des arômes doux, des torréfactions légères et des options décaféinées naturelles.",
    color: "border-accent bg-accent/50 text-accent-foreground",
    traits: [
      "Arômes doux et subtils",
      "Faible amertume",
      "Options décaféinées naturelles",
    ],
  },
};

// ─── Component ───────────────────────────────────────────

export function QuizContent() {
  const [step, setStep] = useState(0); // 0-2 = questions, 3 = results
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  const isResults = step === QUESTIONS.length;

  // Calculate result profile
  const getResult = useCallback((): ProfileKey => {
    const scores: Record<ProfileKey, number> = {
      HPI: 0,
      ADHD: 0,
      hypersensitive: 0,
    };
    answers.forEach((answerIdx, questionIdx) => {
      const answer = QUESTIONS[questionIdx].answers[answerIdx];
      scores.HPI += answer.scores.HPI;
      scores.ADHD += answer.scores.ADHD;
      scores.hypersensitive += answer.scores.hypersensitive;
    });
    const entries = Object.entries(scores) as [ProfileKey, number][];
    entries.sort((a, b) => b[1] - a[1]);
    return entries[0][0];
  }, [answers]);

  const resultProfile = isResults ? getResult() : null;
  const profile = resultProfile ? PROFILES[resultProfile] : null;

  // Fetch recommended products when results are shown
  const { data, isLoading } = api.product.list.useInfiniteQuery(
    { category: resultProfile ?? "HPI", limit: 3, featured: undefined },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      enabled: isResults && resultProfile !== null,
    },
  );

  const products = data?.pages.flatMap((p) => p.items) ?? [];

  const handleSelectAnswer = (answerIdx: number) => {
    setSelectedAnswer(answerIdx);
  };

  const handleNext = () => {
    if (selectedAnswer === null) return;
    // Track quiz start on the very first answer
    if (step === 0 && answers.length === 0) trackQuizStart();
    const answerLabel = QUESTIONS[step].answers[selectedAnswer].label;
    trackQuizAnswer(step, answerLabel);
    const newAnswers = [...answers.slice(0, step), selectedAnswer];
    setAnswers(newAnswers);
    setSelectedAnswer(null);
    // If this was the last question, track quiz completion
    if (step === QUESTIONS.length - 1) {
      const scores: Record<ProfileKey, number> = { HPI: 0, ADHD: 0, hypersensitive: 0 };
      newAnswers.forEach((aIdx, qIdx) => {
        const a = QUESTIONS[qIdx].answers[aIdx];
        scores.HPI += a.scores.HPI;
        scores.ADHD += a.scores.ADHD;
        scores.hypersensitive += a.scores.hypersensitive;
      });
      const entries = Object.entries(scores) as [ProfileKey, number][];
      entries.sort((a, b) => b[1] - a[1]);
      trackQuizComplete(entries[0][0]);
    }
    setStep((s) => s + 1);
  };

  const handleBack = () => {
    if (step === 0) return;
    setStep((s) => s - 1);
    setSelectedAnswer(answers[step - 1] ?? null);
    setAnswers((prev) => prev.slice(0, step - 1));
  };

  const handleRestart = () => {
    trackQuizRestart();
    setStep(0);
    setAnswers([]);
    setSelectedAnswer(null);
  };

  return (
    <>
      {/* Hero */}
      <PageHero title={isResults ? profile?.emoji + " " + profile?.title : "Trouvez votre café idéal"} centered>
        {isResults ? "Voici votre profil et nos recommandations personnalisées" : "3 questions pour découvrir le blend adapté à votre esprit"}
      </PageHero>

      <section className="py-12 md:py-16 bg-background">
        <div className="container mx-auto px-4 max-w-3xl">
          {/* Progress bar */}
          {!isResults && (
            <div className="mb-10">
              <div className="flex justify-between text-sm text-muted-foreground mb-2">
                <span>
                  Question {step + 1} / {QUESTIONS.length}
                </span>
                <span>
                  {Math.round(((step + 1) / QUESTIONS.length) * 100)}%
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{
                    width: `${((step + 1) / QUESTIONS.length) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Questions */}
          {!isResults && (
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">
                {QUESTIONS[step].question}
              </h2>
              <p className="text-muted-foreground mb-8">
                {QUESTIONS[step].subtitle}
              </p>

              <div className="space-y-4 mb-8">
                {QUESTIONS[step].answers.map((answer, idx) => (
                  <button
                    key={answer.label}
                    type="button"
                    onClick={() => handleSelectAnswer(idx)}
                    className={cn(
                      "w-full text-left rounded-xl border-2 p-5 transition-all",
                      selectedAnswer === idx
                        ? "border-primary bg-primary/5 shadow-md"
                        : "border-border hover:border-primary/30 hover:shadow-sm bg-card",
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={cn(
                          "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-colors",
                          selectedAnswer === idx
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        {answer.icon}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">
                          {answer.label}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {answer.description}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Navigation */}
              <div className="flex justify-between">
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  disabled={step === 0}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour
                </Button>
                <Button onClick={handleNext} disabled={selectedAnswer === null}>
                  {step === QUESTIONS.length - 1
                    ? "Voir mon résultat"
                    : "Suivant"}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Results */}
          {isResults && profile && resultProfile && (
            <div>
              {/* Profile Card */}
              <Card className={cn("border-2 mb-10", profile.color)}>
                <CardContent className="p-6 md:p-8">
                  <div className="text-center mb-6">
                    <span className="text-5xl mb-4 block">
                      {profile.emoji}
                    </span>
                    <h2 className="text-2xl font-bold mb-1">
                      {profile.title}
                    </h2>
                    <p className="text-sm font-medium opacity-80">
                      Profil {profile.label}
                    </p>
                  </div>
                  <p className="text-center text-muted-foreground leading-relaxed mb-6 max-w-xl mx-auto">
                    {profile.description}
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {profile.traits.map((trait) => (
                      <span
                        key={trait}
                        className="inline-flex items-center gap-1.5 rounded-full bg-background border px-3 py-1.5 text-sm font-medium"
                      >
                        <Coffee className="h-3.5 w-3.5 text-primary" />
                        {trait}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recommended Products */}
              <h3 className="text-xl font-bold mb-6">
                Nos recommandations pour vous
              </h3>
              {isLoading ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <ProductCardSkeleton key={i} />
                  ))}
                </div>
              ) : products.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                  {products.slice(0, 3).map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <Card className="mb-10">
                  <CardContent className="p-8 text-center">
                    <Coffee className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">
                      Nos torréfacteurs préparent de nouveaux blends pour ce
                      profil. Revenez bientôt !
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button size="lg" asChild>
                  <Link href={`/products?category=${resultProfile}`}>
                    Voir tous les cafés {profile.label}
                  </Link>
                </Button>
                <Button size="lg" variant="outline" onClick={handleRestart}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Refaire le quiz
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
