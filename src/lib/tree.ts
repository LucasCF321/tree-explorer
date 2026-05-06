// Generic n-ary tree data structure with traversal & search algorithms.
// All algorithms return ordered arrays of node IDs so the UI can animate them.

/**
 * Dados utilitários armazenados em cada nó da árvore.
 * Mantém o conteúdo "de domínio" (nome, imagem, metadados) separado
 * da estrutura algorítmica (parent/children).
 */
export interface NodeData {
  name: string;
  imageUrl?: string;
  meta?: Record<string, string | number>;
}

/**
 * TreeNode — representa um nó da árvore n-ária.
 * Cada nó conhece seu pai (ponteiro para cima) e seus filhos
 * (lista — pode ter 0..N), permitindo navegar nos dois sentidos.
 */
export class TreeNode {
  id: string;
  data: NodeData;
  parent: TreeNode | null;
  children: TreeNode[];

  /**
   * Constrói um nó já amarrado a um pai (ou null se for raiz).
   * Inicializa a lista de filhos vazia. Complexidade: O(1).
   */
  constructor(id: string, data: NodeData, parent: TreeNode | null = null) {
    this.id = id;
    this.data = data;
    this.parent = parent;
    this.children = [];
  }

  /**
   * Adiciona um filho a este nó e ajusta o ponteiro `parent` do filho.
   * Essa integridade bidirecional é o que permite `pathTo` e `depth`
   * funcionarem subindo pelos parents. Complexidade: O(1).
   */
  addChild(child: TreeNode) {
    child.parent = this;
    this.children.push(child);
  }
}

/**
 * Tree — encapsula a raiz da árvore e expõe todos os algoritmos clássicos:
 * busca (DFS/BFS), travessias (pré/pós/em-ordem), métricas (altura, grau,
 * profundidade), mutações (insert/remove) e serialização (toJSON/fromJSON).
 */
export class Tree {
  root: TreeNode | null;

  constructor(root: TreeNode | null = null) {
    this.root = root;
  }

  // ---------- Lookup ----------

  /**
   * Busca um nó pelo seu id usando DFS iterativo com pilha explícita.
   * Usamos pilha (e não recursão) para evitar stack-overflow em árvores
   * muito profundas. Complexidade: O(n) tempo · O(h) espaço.
   */
  findById(id: string): TreeNode | null {
    if (!this.root) return null;
    const stack: TreeNode[] = [this.root];
    while (stack.length) {
      const n = stack.pop()!;
      if (n.id === id) return n;
      for (const c of n.children) stack.push(c);
    }
    return null;
  }

  /**
   * Busca o primeiro nó cujo `data.name` contém `query` (case-insensitive)
   * percorrendo em largura (BFS — encontra o mais próximo da raiz primeiro).
   * Retorna o caminho da raiz até o nó encontrado (ou []). O(n).
   */
  searchByName(query: string): string[] {
    if (!this.root || !query.trim()) return [];
    const q = query.trim().toLowerCase();
    const found = this.bfs().find((id) => {
      const node = this.findById(id);
      return node?.data.name.toLowerCase().includes(q);
    });
    if (!found) return [];
    return this.pathTo(found);
  }

  /**
   * Reconstrói o caminho da raiz até o nó de id `id` subindo pelos
   * ponteiros `parent`. Complexidade: O(h) (h = altura da árvore).
   */
  pathTo(id: string): string[] {
    const node = this.findById(id);
    if (!node) return [];
    const path: string[] = [];
    let cur: TreeNode | null = node;
    while (cur) {
      path.unshift(cur.id);
      cur = cur.parent;
    }
    return path;
  }

  // ---------- Mutations ----------

  /**
   * Insere `child` como filho do nó cujo id é `parentId`.
   * Retorna false se o pai não existir. Complexidade: O(n) (busca do pai).
   */
  insert(parentId: string, child: TreeNode): boolean {
    const parent = this.findById(parentId);
    if (!parent) return false;
    parent.addChild(child);
    return true;
  }

  /**
   * Remove o nó `id` (e por consequência toda a subárvore abaixo dele).
   * Caso especial: remover a raiz zera a árvore. Complexidade: O(n).
   */
  remove(id: string): boolean {
    if (!this.root) return false;
    if (this.root.id === id) {
      this.root = null;
      return true;
    }
    const node = this.findById(id);
    if (!node || !node.parent) return false;
    node.parent.children = node.parent.children.filter((c) => c.id !== id);
    return true;
  }

  // ---------- Metrics ----------

  /**
   * Altura de uma subárvore: 1 + max(altura dos filhos).
   * Folha tem altura 1; null tem altura 0. Implementação recursiva. O(n).
   */
  static height(node: TreeNode | null): number {
    if (!node) return 0;
    if (node.children.length === 0) return 1;
    return 1 + Math.max(...node.children.map((c) => Tree.height(c)));
  }

  /**
   * Profundidade do nó = quantos `parent` precisamos subir até a raiz.
   * Raiz tem profundidade 0. Complexidade: O(h).
   */
  static depth(node: TreeNode): number {
    let d = 0;
    let cur = node.parent;
    while (cur) {
      d++;
      cur = cur.parent;
    }
    return d;
  }

  /**
   * Grau de um nó = número de filhos diretos. Complexidade: O(1).
   */
  static degree(node: TreeNode): number {
    return node.children.length;
  }

  /**
   * Número total de nós da árvore (calculado via BFS). Complexidade: O(n).
   */
  size(): number {
    return this.bfs().length;
  }

  // ---------- Traversals (return id order) ----------

  /**
   * Pré-ordem: visita a RAIZ antes dos FILHOS (recursivo da esquerda
   * para a direita). Útil para clonar/serializar árvores. O(n).
   */
  preOrder(node: TreeNode | null = this.root, acc: string[] = []): string[] {
    if (!node) return acc;
    acc.push(node.id);
    for (const c of node.children) this.preOrder(c, acc);
    return acc;
  }

  /**
   * Pós-ordem: visita os FILHOS antes da RAIZ. Útil para deletar árvores
   * com segurança ou calcular tamanhos de subárvore de baixo pra cima. O(n).
   */
  postOrder(node: TreeNode | null = this.root, acc: string[] = []): string[] {
    if (!node) return acc;
    for (const c of node.children) this.postOrder(c, acc);
    acc.push(node.id);
    return acc;
  }

  /**
   * Em-ordem adaptado para n-ária: 1º FILHO → RAIZ → DEMAIS FILHOS.
   * Em árvore binária equivale a esquerda → raiz → direita. O(n).
   */
  inOrder(node: TreeNode | null = this.root, acc: string[] = []): string[] {
    if (!node) return acc;
    if (node.children.length === 0) {
      acc.push(node.id);
      return acc;
    }
    this.inOrder(node.children[0], acc);
    acc.push(node.id);
    for (let i = 1; i < node.children.length; i++) this.inOrder(node.children[i], acc);
    return acc;
  }

  // ---------- Search ----------

  /**
   * DFS — Busca em Profundidade com pilha explícita.
   * Empilha os filhos em ordem reversa para que o filho mais à esquerda
   * seja visitado primeiro (mantém a ordem natural). Para ao achar `targetId`.
   * Complexidade: O(n) tempo · O(h) espaço.
   */
  dfs(targetId?: string): string[] {
    if (!this.root) return [];
    const order: string[] = [];
    const stack: TreeNode[] = [this.root];
    while (stack.length) {
      const n = stack.pop()!;
      order.push(n.id);
      if (targetId && n.id === targetId) return order;
      // push reversed so left-most child is visited first
      for (let i = n.children.length - 1; i >= 0; i--) stack.push(n.children[i]);
    }
    return order;
  }

  /**
   * BFS — Busca em Largura com fila. Visita nível por nível, garantindo
   * encontrar o nó-alvo mais próximo da raiz primeiro.
   * Complexidade: O(n) tempo · O(w) espaço (w = largura máxima).
   */
  bfs(targetId?: string): string[] {
    if (!this.root) return [];
    const order: string[] = [];
    const queue: TreeNode[] = [this.root];
    while (queue.length) {
      const n = queue.shift()!;
      order.push(n.id);
      if (targetId && n.id === targetId) return order;
      for (const c of n.children) queue.push(c);
    }
    return order;
  }

  // ---------- Serialization ----------

  /**
   * Serializa a árvore recursivamente para um objeto plano
   * `{ id, data, children: [...] }` — usado pelo botão "Exportar". O(n).
   */
  toJSON(node: TreeNode | null = this.root): unknown {
    if (!node) return null;
    return {
      id: node.id,
      data: node.data,
      children: node.children.map((c) => this.toJSON(c)),
    };
  }

  /**
   * Reconstrói a árvore a partir do JSON gerado por `toJSON`,
   * religando os ponteiros `parent` durante a descida recursiva. O(n).
   */
  static fromJSON(json: any, parent: TreeNode | null = null): TreeNode | null {
    if (!json) return null;
    const node = new TreeNode(json.id, json.data, parent);
    node.children = (json.children || [])
      .map((c: any) => Tree.fromJSON(c, node))
      .filter(Boolean) as TreeNode[];
    return node;
  }
}
