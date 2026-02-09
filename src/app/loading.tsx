import { Coffee } from "lucide-react";

export default function RootLoading() {
  return (
    <div className="flex min-h-[calc(100vh-12rem)] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
          <Coffee className="absolute inset-0 m-auto h-5 w-5 text-primary" />
        </div>
        <p className="text-sm text-muted-foreground animate-pulse">Chargement...</p>
      </div>
    </div>
  );
}
