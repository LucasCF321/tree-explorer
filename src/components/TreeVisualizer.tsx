import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  type Edge,
  type Node,
  type NodeTypes,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from "reactflow";
import "reactflow/dist/style.css";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Play,
  Search,
  Plus,
  Trash2,
  Download,
  Loader2,
  RotateCcw,
  Sparkles,
} from "lucide-react";

import { Tree, TreeNode } from "@/lib/tree";
import { fetchEvolutionChain, FEATURED_CHAINS } from "@/lib/pokeapi";
import { layoutTree } from "@/lib/layout";
import { PokeNode, type PokeNodeData } from "./PokeNode";
import { MetricsPanel } from "./MetricsPanel";

const nodeTypes: NodeTypes = { poke: PokeNode };

type NodeState = PokeNodeData["state"];
type Algorithm = "dfs" | "bfs" | "pre" | "post" | "in";

const ALGO_LABELS: Record<Algorithm, string> = {
  dfs: "DFS (Profundidade)",
  bfs: "BFS (Largura)",
  pre: "Pré-ordem",
  post: "Pós-ordem",
  in: "Em-ordem",
};

const ALGO_COMPLEXITY: Record<Algorithm, string> = {
  dfs: "O(n) tempo · O(h) espaço (pilha)",
  bfs: "O(n) tempo · O(w) espaço (fila)",
  pre: "O(n) tempo · O(h) espaço",
  post: "O(n) tempo · O(h) espaço",
  in: "O(n) tempo · O(h) espaço",
};

const ALGO_DESCRIPTION: Record<Algorithm, string> = {
  dfs: "Busca em Profundidade — desce até a folha mais à esquerda antes de voltar. Implementada com pilha explícita (evita stack overflow).",
  bfs: "Busca em Largura — visita nível por nível. Implementada com fila; encontra o alvo mais próximo da raiz primeiro.",
  pre: "Pré-ordem (RAIZ → FILHOS) — visita o nó antes de descer. Útil para clonar/serializar a árvore.",
  post: "Pós-ordem (FILHOS → RAIZ) — visita os filhos antes do nó. Útil para deletar com segurança ou somar subárvores.",
  in: "Em-ordem n-ária (1º FILHO → RAIZ → DEMAIS FILHOS) — generalização do percurso esquerda-raiz-direita das árvores binárias.",
};

function VisualizerInner() {
  const [tree, setTree] = useState<Tree>(() => new Tree());
  const [version, setVersion] = useState(0); // bump after mutations
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number>(67);
  const [loading, setLoading] = useState(false);
  const [algorithm, setAlgorithm] = useState<Algorithm>("bfs");
  const [searchQuery, setSearchQuery] = useState("");
  const [newNodeName, setNewNodeName] = useState("");
  const [parentIdForInsert, setParentIdForInsert] = useState<string | null>(null);
  const [speed, setSpeed] = useState<number[]>([600]);
  const [nodeStates, setNodeStates] = useState<Record<string, NodeState>>({});
  const [running, setRunning] = useState(false);
  const cancelRef = useRef(false);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { fitView } = useReactFlow();

  // Carrega a cadeia padrão (Eevee) quando o componente monta
  useEffect(() => {
    void loadChain(chainId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * loadChain — busca uma cadeia de evolução da PokéAPI e popula a árvore.
   * Reseta os estados visuais (animações) e seleciona automaticamente a raiz.
   */
  const loadChain = async (id: number) => {
    setLoading(true);
    try {
      const t = await fetchEvolutionChain(id);
      setTree(t);
      setSelectedId(t.root?.id ?? null);
      setNodeStates({});
      setVersion((v) => v + 1);
      toast.success(`Cadeia carregada: ${t.root?.data.name}`);
    } catch (e) {
      toast.error(`Erro ao carregar: ${(e as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  // Reconstrói nós e arestas do React Flow sempre que a árvore, a seleção
  // ou os estados de animação mudam. Aqui a estrutura lógica vira visual.
  useEffect(() => {
    const positioned = layoutTree(tree.root);
    const newNodes: Node<PokeNodeData>[] = positioned.map((p) => ({
      id: p.id,
      type: "poke",
      position: { x: p.x, y: p.y },
      data: {
        name: p.node.data.name,
        imageUrl: p.node.data.imageUrl,
        state: nodeStates[p.id] ?? (selectedId === p.id ? "active" : "idle"),
        degree: p.node.children.length,
        depth: Tree.depth(p.node),
      },
    }));
    const newEdges: Edge[] = [];
    for (const p of positioned) {
      for (const child of p.node.children) {
        newEdges.push({
          id: `${p.id}->${child.id}`,
          source: p.id,
          target: child.id,
          type: "smoothstep",
          animated: false,
          style: { stroke: "oklch(0.68 0.16 235 / 0.6)", strokeWidth: 2 },
        });
      }
    }
    setNodes(newNodes);
    setEdges(newEdges);
    setTimeout(() => fitView({ padding: 0.2, duration: 400 }), 50);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version, nodeStates, selectedId]);

  const selected = useMemo(
    () => (selectedId ? tree.findById(selectedId) : null),
    [selectedId, tree, version],
  );

  /**
   * sleep — pausa cancelável baseada em requestAnimationFrame.
   * Diferente de `setTimeout`, respeita o `cancelRef` para parar
   * imediatamente quando o usuário clica em "Parar".
   */
  const sleep = (ms: number) =>
    new Promise<void>((resolve) => {
      const start = Date.now();
      const tick = () => {
        if (cancelRef.current) return resolve();
        if (Date.now() - start >= ms) return resolve();
        requestAnimationFrame(tick);
      };
      tick();
    });

  /**
   * animate — coração da visualização didática.
   * Recebe a ordem de visita produzida por um algoritmo (DFS, BFS, etc.) e
   * percorre essa lista marcando cada nó como "visiting" (amarelo), espera
   * o intervalo definido pelo usuário e em seguida marca como `finalState`.
   */
  const animate = async (order: string[], finalState: NodeState = "visited") => {
    if (running) return;
    setRunning(true);
    cancelRef.current = false;
    setNodeStates({});
    const states: Record<string, NodeState> = {};
    for (const id of order) {
      if (cancelRef.current) break;
      states[id] = "visiting";
      setNodeStates({ ...states });
      await sleep(speed[0]);
      states[id] = finalState;
      setNodeStates({ ...states });
    }
    setRunning(false);
  };

  /**
   * runAlgorithm — dispara o algoritmo selecionado nas abas (DFS / BFS /
   * Pré / Pós / Em-ordem), pega a ordem retornada e anima a visita dos nós.
   */
  const runAlgorithm = async () => {
    if (!tree.root) return;
    let order: string[] = [];
    switch (algorithm) {
      case "dfs": order = tree.dfs(); break;
      case "bfs": order = tree.bfs(); break;
      case "pre": order = tree.preOrder(); break;
      case "post": order = tree.postOrder(); break;
      case "in": order = tree.inOrder(); break;
    }
    toast.info(`${ALGO_LABELS[algorithm]} — ${order.length} nós`);
    await animate(order);
  };

  /**
   * runSearch — busca por nome (BFS), anima o caminho da raiz até o nó
   * encontrado e o destaca em verde ("found"). Se não houver match,
   * exibe um toast de erro.
   */
  const runSearch = async () => {
    if (!tree.root || !searchQuery.trim()) return;
    const path = tree.searchByName(searchQuery);
    if (!path.length) {
      toast.error("Nenhum nó encontrado");
      return;
    }
    // Animate the search path discovery
    setRunning(true);
    cancelRef.current = false;
    setNodeStates({});
    const states: Record<string, NodeState> = {};
    for (let i = 0; i < path.length; i++) {
      if (cancelRef.current) break;
      states[path[i]] = i === path.length - 1 ? "found" : "visiting";
      setNodeStates({ ...states });
      await sleep(speed[0]);
      if (i < path.length - 1) states[path[i]] = "visited";
      setNodeStates({ ...states });
    }
    setSelectedId(path[path.length - 1]);
    setRunning(false);
    toast.success(`Encontrado em ${path.length - 1} passos`);
  };

  /**
   * stop — interrompe imediatamente qualquer animação em curso ativando
   * o `cancelRef` (lido pelo `sleep` e pelos loops de animação).
   */
  const stop = () => {
    cancelRef.current = true;
    setRunning(false);
    setNodeStates({});
  };

  /**
   * handleAddChild — adiciona um novo nó como filho do nó selecionado.
   * Gera um id único combinando nome + timestamp e dispara `tree.insert`.
   */
  const handleAddChild = () => {
    const parentId = parentIdForInsert ?? selectedId;
    if (!parentId || !newNodeName.trim()) return;
    const id = `${newNodeName.toLowerCase()}-${Date.now()}`;
    const newNode = new TreeNode(id, { name: newNodeName.trim() });
    if (tree.insert(parentId, newNode)) {
      setNewNodeName("");
      setVersion((v) => v + 1);
      const parentNode = tree.findById(parentId);
      toast.success(`"${newNode.data.name}" adicionado em "${parentNode?.data.name}"`);
    }
  };

  /**
   * handleRemove — remove o nó selecionado (e toda a subárvore abaixo dele).
   * Bloqueia a remoção da raiz para preservar a integridade da árvore.
   */
  const handleRemove = () => {
    if (!selectedId) return;
    if (selectedId === tree.root?.id) {
      toast.error("Não é possível remover a raiz");
      return;
    }
    const node = tree.findById(selectedId);
    if (tree.remove(selectedId)) {
      toast.success(`"${node?.data.name}" removido`);
      setSelectedId(tree.root?.id ?? null);
      setVersion((v) => v + 1);
    }
  };

  /**
   * handleExport — serializa a árvore inteira em JSON via `tree.toJSON()`
   * e dispara o download de um arquivo `.json` no navegador (Blob + <a>).
   */
  const handleExport = () => {
    const json = JSON.stringify(tree.toJSON(), null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tree-${tree.root?.data.name ?? "export"}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Árvore exportada");
  };

  /**
   * onNodeClick — callback do React Flow ao clicar em um nó.
   * Atualiza `selectedId`, o que alimenta o painel de métricas
   * e o formulário de inserção de filhos.
   */
  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedId(node.id);
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr_320px] gap-4 h-[calc(100vh-100px)]">
      {/* LEFT — algorithm controls */}
      <div className="flex flex-col gap-3 overflow-y-auto pr-1">
        <Card className="p-4 bg-card/80 backdrop-blur border-border">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Cadeia de Evolução
          </h3>
          <p className="text-[11px] text-muted-foreground mb-2 leading-relaxed">
            Faz <code className="text-accent">fetch</code> na PokéAPI e converte a resposta aninhada em uma árvore n-ária via <code className="text-accent">buildNode</code> (recursivo).
          </p>
          <div className="flex gap-2">
            <Select
              value={String(chainId)}
              onValueChange={(v) => {
                setChainId(Number(v));
                void loadChain(Number(v));
              }}
            >
              <SelectTrigger className="bg-input">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FEATURED_CHAINS.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {loading && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
              <Loader2 className="w-3 h-3 animate-spin" /> Carregando da PokéAPI...
            </div>
          )}
        </Card>

        <Card className="p-4 bg-card/80 backdrop-blur border-border">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Algoritmo
          </h3>
          <Tabs value={algorithm} onValueChange={(v) => setAlgorithm(v as Algorithm)}>
            <TabsList className="grid grid-cols-2 w-full mb-2 h-auto">
              <TabsTrigger value="dfs" className="text-xs">DFS</TabsTrigger>
              <TabsTrigger value="bfs" className="text-xs">BFS</TabsTrigger>
            </TabsList>
            <TabsList className="grid grid-cols-3 w-full h-auto">
              <TabsTrigger value="pre" className="text-xs">Pré</TabsTrigger>
              <TabsTrigger value="in" className="text-xs">Em</TabsTrigger>
              <TabsTrigger value="post" className="text-xs">Pós</TabsTrigger>
            </TabsList>
          </Tabs>
          <p className="text-[11px] text-foreground/80 mt-2 leading-relaxed">
            {ALGO_DESCRIPTION[algorithm]}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1 font-mono">
            {ALGO_COMPLEXITY[algorithm]}
          </p>

          <div className="mt-3">
            <label className="text-[11px] text-muted-foreground uppercase tracking-wider">
              Velocidade: {speed[0]}ms
            </label>
            <Slider
              value={speed}
              onValueChange={setSpeed}
              min={100}
              max={1500}
              step={50}
              className="mt-2"
            />
          </div>

          <div className="flex gap-2 mt-3">
            <Button
              onClick={runAlgorithm}
              disabled={running || !tree.root}
              className="flex-1 bg-gradient-primary hover:opacity-90 text-primary-foreground"
            >
              <Play className="w-4 h-4" /> Executar
            </Button>
            {running && (
              <Button onClick={stop} variant="outline" size="icon">
                <RotateCcw className="w-4 h-4" />
              </Button>
            )}
          </div>
        </Card>

        <Card className="p-4 bg-card/80 backdrop-blur border-border">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Buscar por Nome
          </h3>
          <p className="text-[11px] text-muted-foreground mb-2 leading-relaxed">
            <code className="text-accent">searchByName</code> roda BFS e devolve o caminho da raiz até o 1º match. A animação destaca esse caminho e marca o alvo em verde.
          </p>
          <div className="flex gap-2">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ex: vapor"
              className="bg-input"
              onKeyDown={(e) => e.key === "Enter" && runSearch()}
            />
            <Button onClick={runSearch} disabled={running} size="icon" variant="secondary">
              <Search className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      </div>

      {/* CENTER — graph */}
      <Card className="overflow-hidden bg-card/40 backdrop-blur border-border relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          minZoom={0.2}
          maxZoom={2}
          proOptions={{ hideAttribution: true }}
        >
          <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="oklch(0.4 0.04 260)" />
          <Controls className="!bg-card !border-border [&_button]:!bg-card [&_button]:!border-border [&_button]:!text-foreground" />
        </ReactFlow>
      </Card>

      {/* RIGHT — metrics + edit */}
      <div className="flex flex-col gap-3 overflow-y-auto pl-1">
        <MetricsPanel tree={tree} selected={selected} />

        <Card className="p-4 bg-card/80 backdrop-blur border-border">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Editar Árvore
          </h3>
          <p className="text-[11px] text-muted-foreground mb-3 leading-relaxed">
            <code className="text-accent">insert</code> anexa um novo <code className="text-accent">TreeNode</code> ao pai selecionado. <code className="text-accent">remove</code> tira o nó e toda a sua subárvore (raiz protegida).
          </p>
          <div className="space-y-2">
            <label className="text-[11px] text-muted-foreground uppercase tracking-wider">
              Pai do novo nó
            </label>
            <Select
              value={parentIdForInsert ?? selectedId ?? ""}
              onValueChange={(v) => setParentIdForInsert(v)}
            >
              <SelectTrigger className="bg-input">
                <SelectValue placeholder="Selecione o pai..." />
              </SelectTrigger>
              <SelectContent>
                {tree.bfs().map((id) => {
                  const n = tree.findById(id);
                  if (!n) return null;
                  const depth = Tree.depth(n);
                  return (
                    <SelectItem key={id} value={id}>
                      {"— ".repeat(depth)}{n.data.name}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Input
                value={newNodeName}
                onChange={(e) => setNewNodeName(e.target.value)}
                placeholder="Nome do novo nó..."
                className="bg-input"
                onKeyDown={(e) => e.key === "Enter" && handleAddChild()}
              />
              <Button
                onClick={handleAddChild}
                disabled={!(parentIdForInsert ?? selectedId) || !newNodeName}
                size="icon"
                title="Inserir filho no pai escolhido (Tree.insert)"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Escolha o pai no seletor acima ou clique num nó do gráfico para selecioná-lo automaticamente.
            </p>
            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleRemove}
                disabled={!selectedId || selectedId === tree.root?.id}
                variant="outline"
                className="flex-1"
                title="Remove o nó selecionado e sua subárvore (Tree.remove)"
              >
                <Trash2 className="w-4 h-4" /> Remover
              </Button>
              <Button onClick={handleExport} variant="secondary" size="icon" title="Exportar árvore como JSON (Tree.toJSON + Blob)">
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-water/20 backdrop-blur border-accent/30">
          <div className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-accent shrink-0 mt-0.5" />
            <p className="text-xs text-foreground/80">
              Clique em um nó para selecioná-lo. Os algoritmos animam a ordem de visita em
              <span className="text-visit font-semibold"> amarelo</span>.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

export function TreeVisualizer() {
  return (
    <ReactFlowProvider>
      <VisualizerInner />
    </ReactFlowProvider>
  );
}
