import { createFileRoute } from "@tanstack/react-router";
import { TreeVisualizer } from "@/components/TreeVisualizer";
import { Toaster } from "@/components/ui/sonner";
import { TreePine, Github } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Pokétree — Visualizador de Árvores N-árias" },
      {
        name: "description",
        content:
          "Visualize cadeias de evolução Pokémon como árvores n-árias. Execute DFS, BFS, pré, pós e em-ordem com animações.",
      },
      { property: "og:title", content: "Pokétree — Visualizador de Árvores" },
      {
        property: "og:description",
        content: "Estrutura de dados em ação: árvores n-árias com PokéAPI.",
      },
    ],
  }),
});

function Index() {
  return (
    <div className="min-h-screen px-4 py-4 lg:px-6">
      <header className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
            <TreePine className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl lg:text-2xl font-bold tracking-tight">
              Poké<span className="text-accent">tree</span>
            </h1>
            <p className="text-xs text-muted-foreground">
              Árvores n-árias · DFS · BFS · Pré/Pós/Em-ordem
            </p>
          </div>
        </div>
        <a
          href="https://pokeapi.co"
          target="_blank"
          rel="noreferrer"
          className="text-xs text-muted-foreground hover:text-accent transition-smooth flex items-center gap-1.5"
        >
          <Github className="w-3.5 h-3.5" />
          PokéAPI
        </a>
      </header>

      <TreeVisualizer />
      <Toaster theme="dark" position="top-right" />
    </div>
  );
}
