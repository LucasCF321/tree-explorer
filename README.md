Documentação Técnica — Pokétree
Cada função do projeto, com assinatura, descrição e complexidade Big O.

Árvore N-ária — Estrutura e Algoritmos
src/lib/tree.ts
Coração do projeto. Define TreeNode (um nó com pai + lista de filhos) e Tree (encapsula a raiz e expõe todos os algoritmos clássicos de árvore).

TreeNode.constructor
new TreeNode(id, data, parent?)
O(1)
Cria um nó já amarrado a um pai (ou null se for raiz). Mantém referência bidirecional pai↔filho.

TreeNode.addChild
node.addChild(child)
O(1)
Adiciona um filho e ajusta o ponteiro parent dele. Essa integridade é o que permite pathTo e depth funcionarem.

Tree.findById
tree.findById(id)
O(n) tempo · O(h) espaço
Busca um nó por id usando DFS iterativo com pilha (evita stack overflow em árvores profundas).

Tree.searchByName
tree.searchByName(query)
O(n)
BFS pela árvore procurando o primeiro nó cujo nome contém a query (case-insensitive). Retorna o caminho da raiz até ele.

Tree.pathTo
tree.pathTo(id)
O(h)
Sobe do nó até a raiz seguindo os ponteiros parent, montando o caminho completo.

Tree.insert
tree.insert(parentId, child)
O(n)
Localiza o pai e anexa o filho. Retorna false se o pai não existir.

Tree.remove
tree.remove(id)
O(n)
Remove o nó (e toda sua subárvore por consequência). Caso especial: remover a raiz zera a árvore.

Tree.height (estática)
Tree.height(node)
O(n)
Altura recursiva: 1 + max(altura dos filhos). Folha = 1.

Tree.depth (estática)
Tree.depth(node)
O(h)
Conta quantos parents precisa subir até a raiz.

Tree.degree (estática)
Tree.degree(node)
O(1)
Grau = número de filhos diretos do nó.

Tree.size
tree.size()
O(n)
Total de nós da árvore (implementado via BFS).

Tree.preOrder
tree.preOrder()
O(n) tempo · O(h) espaço
Caminhamento RAIZ → FILHOS (recursivo). Útil para clonar/serializar árvores.

Tree.postOrder
tree.postOrder()
O(n) tempo · O(h) espaço
Caminhamento FILHOS → RAIZ. Útil para deletar árvores ou calcular tamanhos de subárvore.

Tree.inOrder
tree.inOrder()
O(n) tempo · O(h) espaço
Adaptação para n-ária: 1º FILHO → RAIZ → DEMAIS FILHOS. Em árvore binária equivale a esquerda→raiz→direita.

Tree.dfs
tree.dfs(targetId?)
O(n) tempo · O(h) espaço
Busca em Profundidade com pilha explícita. Empilha filhos em ordem reversa para visitar o mais à esquerda primeiro. Para ao encontrar targetId.

Tree.bfs
tree.bfs(targetId?)
O(n) tempo · O(w) espaço
Busca em Largura com fila. Visita nível por nível.

Tree.toJSON
tree.toJSON()
O(n)
Serializa recursivamente para { id, data, children: [...] }. Usado no botão Exportar.

Tree.fromJSON (estática)
Tree.fromJSON(json)
O(n)
Reconstrói a árvore a partir do JSON, religando os ponteiros parent.

Integração com a PokéAPI
src/lib/pokeapi.ts
Transforma a resposta da PokéAPI (cadeia de evolução aninhada) na nossa Tree n-ária.

idFromUrl
idFromUrl(url)
O(1)
Helper: extrai o ID numérico do final de uma URL da PokéAPI (.../pokemon-species/133/ → '133').

spriteFor
spriteFor(speciesId)
O(1)
Monta a URL da arte oficial do Pokémon a partir do ID.

buildNode
buildNode(link, parent)
O(n)
Função recursiva que transforma um nó da resposta da API (ChainLink) em TreeNode, descendo por evolves_to. Aqui a estrutura da API vira árvore n-ária.

fetchEvolutionChain
fetchEvolutionChain(chainId)
O(n) + I/O
Faz o fetch da cadeia de evolução, chama buildNode na raiz e devolve uma Tree pronta para uso.

Posicionamento Visual
src/lib/layout.ts
Calcula coordenadas (x, y) para desenhar a árvore sem sobreposição.

layoutTree
layoutTree(root)
O(n)
Algoritmo inspirado em Reingold–Tilford. Layout top-down: filhos abaixo do pai, irmãos lado a lado. Retorna [{ id, x, y, node }] consumido pelo React Flow.

Orquestração da UI
src/components/TreeVisualizer.tsx
Conecta a Tree (lógica) ao React Flow (visual). Gerencia estado, animações e interações.

loadChain
loadChain(id)
Busca cadeia da PokéAPI e popula a árvore, resetando estados visuais.

sleep
sleep(ms)
Pausa cancelável usando requestAnimationFrame. Respeita o cancelRef para parar animações em andamento.

animate
animate(order, finalState)
Coração da visualização didática. Percorre a ordem retornada pelo algoritmo, marca cada nó como 'visiting' (amarelo piscando), espera o intervalo, depois marca como 'visited'.

runAlgorithm
runAlgorithm()
Chama o algoritmo escolhido (DFS / BFS / Pré / Pós / Em-ordem) e dispara a animação com o resultado.

runSearch
runSearch()
Busca por nome, anima o caminho da raiz até o nó encontrado e marca o último em verde ('found').

stop
stop()
Aciona o cancelRef para interromper a animação corrente.

handleAddChild / handleRemove
handleAddChild() · handleRemove()
Mutações manuais na árvore com toasts de feedback. Bloqueia remoção da raiz.

handleExport
handleExport()
Converte a árvore para JSON e dispara download via Blob.

onNodeClick
onNodeClick(event, node)
Clique no nó atualiza selectedId, alimentando o painel de métricas e o formulário de inserção.

Nó Visual Customizado
src/components/PokeNode.tsx
Componente do React Flow que renderiza cada Pokémon.

PokeNode
<PokeNode data={...} />
Recebe data.state e aplica classes Tailwind condicionais: anel amarelo quando visitando, verde quando encontrado, escala maior quando ativo. Os <Handle> são pontos de conexão das arestas.

Painel de Métricas
src/components/MetricsPanel.tsx
Mostra estatísticas da árvore e do nó selecionado em tempo real.

MetricsPanel
<MetricsPanel tree={...} selected={...} />
Lê tree e selected, calcula altura/tamanho da árvore e grau/profundidade/altura do nó selecionado usando os métodos estáticos de Tree.
