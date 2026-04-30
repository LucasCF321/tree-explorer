import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";

interface FnDoc {
  name: string;
  signature: string;
  description: string;
  bigO?: string;
}

interface Section {
  file: string;
  title: string;
  summary: string;
  functions: FnDoc[];
}

const SECTIONS: Section[] = [
  {
    file: "src/lib/tree.ts",
    title: "Árvore N-ária — Estrutura e Algoritmos",
    summary:
      "Coração do projeto. Define TreeNode (um nó com pai + lista de filhos) e Tree (encapsula a raiz e expõe todos os algoritmos clássicos de árvore).",
    functions: [
      {
        name: "TreeNode.constructor",
        signature: "new TreeNode(id, data, parent?)",
        description:
          "Cria um nó já amarrado a um pai (ou null se for raiz). Mantém referência bidirecional pai↔filho.",
        bigO: "O(1)",
      },
      {
        name: "TreeNode.addChild",
        signature: "node.addChild(child)",
        description:
          "Adiciona um filho e ajusta o ponteiro parent dele. Essa integridade é o que permite pathTo e depth funcionarem.",
        bigO: "O(1)",
      },
      {
        name: "Tree.findById",
        signature: "tree.findById(id)",
        description:
          "Busca um nó por id usando DFS iterativo com pilha (evita stack overflow em árvores profundas).",
        bigO: "O(n) tempo · O(h) espaço",
      },
      {
        name: "Tree.searchByName",
        signature: "tree.searchByName(query)",
        description:
          "BFS pela árvore procurando o primeiro nó cujo nome contém a query (case-insensitive). Retorna o caminho da raiz até ele.",
        bigO: "O(n)",
      },
      {
        name: "Tree.pathTo",
        signature: "tree.pathTo(id)",
        description:
          "Sobe do nó até a raiz seguindo os ponteiros parent, montando o caminho completo.",
        bigO: "O(h)",
      },
      {
        name: "Tree.insert",
        signature: "tree.insert(parentId, child)",
        description: "Localiza o pai e anexa o filho. Retorna false se o pai não existir.",
        bigO: "O(n)",
      },
      {
        name: "Tree.remove",
        signature: "tree.remove(id)",
        description:
          "Remove o nó (e toda sua subárvore por consequência). Caso especial: remover a raiz zera a árvore.",
        bigO: "O(n)",
      },
      {
        name: "Tree.height (estática)",
        signature: "Tree.height(node)",
        description: "Altura recursiva: 1 + max(altura dos filhos). Folha = 1.",
        bigO: "O(n)",
      },
      {
        name: "Tree.depth (estática)",
        signature: "Tree.depth(node)",
        description: "Conta quantos parents precisa subir até a raiz.",
        bigO: "O(h)",
      },
      {
        name: "Tree.degree (estática)",
        signature: "Tree.degree(node)",
        description: "Grau = número de filhos diretos do nó.",
        bigO: "O(1)",
      },
      {
        name: "Tree.size",
        signature: "tree.size()",
        description: "Total de nós da árvore (implementado via BFS).",
        bigO: "O(n)",
      },
      {
        name: "Tree.preOrder",
        signature: "tree.preOrder()",
        description:
          "Caminhamento RAIZ → FILHOS (recursivo). Útil para clonar/serializar árvores.",
        bigO: "O(n) tempo · O(h) espaço",
      },
      {
        name: "Tree.postOrder",
        signature: "tree.postOrder()",
        description:
          "Caminhamento FILHOS → RAIZ. Útil para deletar árvores ou calcular tamanhos de subárvore.",
        bigO: "O(n) tempo · O(h) espaço",
      },
      {
        name: "Tree.inOrder",
        signature: "tree.inOrder()",
        description:
          "Adaptação para n-ária: 1º FILHO → RAIZ → DEMAIS FILHOS. Em árvore binária equivale a esquerda→raiz→direita.",
        bigO: "O(n) tempo · O(h) espaço",
      },
      {
        name: "Tree.dfs",
        signature: "tree.dfs(targetId?)",
        description:
          "Busca em Profundidade com pilha explícita. Empilha filhos em ordem reversa para visitar o mais à esquerda primeiro. Para ao encontrar targetId.",
        bigO: "O(n) tempo · O(h) espaço",
      },
      {
        name: "Tree.bfs",
        signature: "tree.bfs(targetId?)",
        description: "Busca em Largura com fila. Visita nível por nível.",
        bigO: "O(n) tempo · O(w) espaço",
      },
      {
        name: "Tree.toJSON",
        signature: "tree.toJSON()",
        description:
          "Serializa recursivamente para { id, data, children: [...] }. Usado no botão Exportar.",
        bigO: "O(n)",
      },
      {
        name: "Tree.fromJSON (estática)",
        signature: "Tree.fromJSON(json)",
        description: "Reconstrói a árvore a partir do JSON, religando os ponteiros parent.",
        bigO: "O(n)",
      },
    ],
  },
  {
    file: "src/lib/pokeapi.ts",
    title: "Integração com a PokéAPI",
    summary: "Transforma a resposta da PokéAPI (cadeia de evolução aninhada) na nossa Tree n-ária.",
    functions: [
      {
        name: "idFromUrl",
        signature: "idFromUrl(url)",
        description:
          "Helper: extrai o ID numérico do final de uma URL da PokéAPI (.../pokemon-species/133/ → '133').",
        bigO: "O(1)",
      },
      {
        name: "spriteFor",
        signature: "spriteFor(speciesId)",
        description: "Monta a URL da arte oficial do Pokémon a partir do ID.",
        bigO: "O(1)",
      },
      {
        name: "buildNode",
        signature: "buildNode(link, parent)",
        description:
          "Função recursiva que transforma um nó da resposta da API (ChainLink) em TreeNode, descendo por evolves_to. Aqui a estrutura da API vira árvore n-ária.",
        bigO: "O(n)",
      },
      {
        name: "fetchEvolutionChain",
        signature: "fetchEvolutionChain(chainId)",
        description:
          "Faz o fetch da cadeia de evolução, chama buildNode na raiz e devolve uma Tree pronta para uso.",
        bigO: "O(n) + I/O",
      },
    ],
  },
  {
    file: "src/lib/layout.ts",
    title: "Posicionamento Visual",
    summary: "Calcula coordenadas (x, y) para desenhar a árvore sem sobreposição.",
    functions: [
      {
        name: "layoutTree",
        signature: "layoutTree(root)",
        description:
          "Algoritmo inspirado em Reingold–Tilford. Layout top-down: filhos abaixo do pai, irmãos lado a lado. Retorna [{ id, x, y, node }] consumido pelo React Flow.",
        bigO: "O(n)",
      },
    ],
  },
  {
    file: "src/components/TreeVisualizer.tsx",
    title: "Orquestração da UI",
    summary:
      "Conecta a Tree (lógica) ao React Flow (visual). Gerencia estado, animações e interações.",
    functions: [
      {
        name: "loadChain",
        signature: "loadChain(id)",
        description: "Busca cadeia da PokéAPI e popula a árvore, resetando estados visuais.",
      },
      {
        name: "sleep",
        signature: "sleep(ms)",
        description:
          "Pausa cancelável usando requestAnimationFrame. Respeita o cancelRef para parar animações em andamento.",
      },
      {
        name: "animate",
        signature: "animate(order, finalState)",
        description:
          "Coração da visualização didática. Percorre a ordem retornada pelo algoritmo, marca cada nó como 'visiting' (amarelo piscando), espera o intervalo, depois marca como 'visited'.",
      },
      {
        name: "runAlgorithm",
        signature: "runAlgorithm()",
        description:
          "Chama o algoritmo escolhido (DFS / BFS / Pré / Pós / Em-ordem) e dispara a animação com o resultado.",
      },
      {
        name: "runSearch",
        signature: "runSearch()",
        description:
          "Busca por nome, anima o caminho da raiz até o nó encontrado e marca o último em verde ('found').",
      },
      {
        name: "stop",
        signature: "stop()",
        description: "Aciona o cancelRef para interromper a animação corrente.",
      },
      {
        name: "handleAddChild / handleRemove",
        signature: "handleAddChild() · handleRemove()",
        description:
          "Mutações manuais na árvore com toasts de feedback. Bloqueia remoção da raiz.",
      },
      {
        name: "handleExport",
        signature: "handleExport()",
        description: "Converte a árvore para JSON e dispara download via Blob.",
      },
      {
        name: "onNodeClick",
        signature: "onNodeClick(event, node)",
        description:
          "Clique no nó atualiza selectedId, alimentando o painel de métricas e o formulário de inserção.",
      },
    ],
  },
  {
    file: "src/components/PokeNode.tsx",
    title: "Nó Visual Customizado",
    summary: "Componente do React Flow que renderiza cada Pokémon.",
    functions: [
      {
        name: "PokeNode",
        signature: "<PokeNode data={...} />",
        description:
          "Recebe data.state e aplica classes Tailwind condicionais: anel amarelo quando visitando, verde quando encontrado, escala maior quando ativo. Os <Handle> são pontos de conexão das arestas.",
      },
    ],
  },
  {
    file: "src/components/MetricsPanel.tsx",
    title: "Painel de Métricas",
    summary: "Mostra estatísticas da árvore e do nó selecionado em tempo real.",
    functions: [
      {
        name: "MetricsPanel",
        signature: "<MetricsPanel tree={...} selected={...} />",
        description:
          "Lê tree e selected, calcula altura/tamanho da árvore e grau/profundidade/altura do nó selecionado usando os métodos estáticos de Tree.",
      },
    ],
  },
];

export function DocsDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <BookOpen className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Documentação</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[85vh] p-0 bg-card border-border">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-xl flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-accent" />
            Documentação Técnica — Pokétree
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Cada função do projeto, com assinatura, descrição e complexidade Big O.
          </p>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] px-6 pb-6">
          <div className="space-y-6 pt-2">
            {SECTIONS.map((section) => (
              <section key={section.file} className="space-y-3">
                <div className="border-b border-border pb-2">
                  <h2 className="text-lg font-bold text-foreground">{section.title}</h2>
                  <code className="text-xs text-accent">{section.file}</code>
                  <p className="text-sm text-muted-foreground mt-1">{section.summary}</p>
                </div>
                <div className="space-y-2.5">
                  {section.functions.map((fn) => (
                    <div
                      key={fn.name}
                      className="bg-muted/30 rounded-lg p-3 border border-border/50"
                    >
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div>
                          <div className="font-semibold text-sm text-foreground">{fn.name}</div>
                          <code className="text-[11px] text-accent font-mono">
                            {fn.signature}
                          </code>
                        </div>
                        {fn.bigO && (
                          <Badge
                            variant="outline"
                            className="font-mono text-[10px] border-accent/40 text-accent shrink-0"
                          >
                            {fn.bigO}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                        {fn.description}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
