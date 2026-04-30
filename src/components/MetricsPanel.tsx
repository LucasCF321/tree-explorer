import { Card } from "@/components/ui/card";
import { Tree, TreeNode } from "@/lib/tree";
import { Activity, GitBranch, Layers, Hash } from "lucide-react";

interface MetricsPanelProps {
  tree: Tree;
  selected: TreeNode | null;
}

export function MetricsPanel({ tree, selected }: MetricsPanelProps) {
  const totalHeight = Tree.height(tree.root);
  const totalSize = tree.size();

  return (
    <div className="space-y-3">
      <Card className="p-4 bg-card/80 backdrop-blur border-border">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Árvore
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <Metric icon={<Layers className="w-4 h-4" />} label="Altura" value={totalHeight} />
          <Metric icon={<Hash className="w-4 h-4" />} label="Nós" value={totalSize} />
        </div>
      </Card>

      <Card className="p-4 bg-card/80 backdrop-blur border-border">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Nó Selecionado
        </h3>
        {selected ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              {selected.data.imageUrl && (
                <img
                  src={selected.data.imageUrl}
                  alt={selected.data.name}
                  className="w-12 h-12 object-contain"
                />
              )}
              <div className="font-bold capitalize text-lg">{selected.data.name}</div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Metric
                icon={<GitBranch className="w-4 h-4" />}
                label="Grau"
                value={Tree.degree(selected)}
              />
              <Metric
                icon={<Activity className="w-4 h-4" />}
                label="Profundidade"
                value={Tree.depth(selected)}
              />
              <Metric
                icon={<Layers className="w-4 h-4" />}
                label="Altura sub."
                value={Tree.height(selected)}
              />
              <Metric
                icon={<Hash className="w-4 h-4" />}
                label="Filhos"
                value={selected.children.length}
              />
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Clique em um nó para ver detalhes.</p>
        )}
      </Card>
    </div>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="bg-muted/40 rounded-lg p-2.5">
      <div className="flex items-center gap-1.5 text-muted-foreground text-[11px] uppercase tracking-wider">
        {icon}
        {label}
      </div>
      <div className="text-2xl font-bold mt-1 text-foreground">{value}</div>
    </div>
  );
}
