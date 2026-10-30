# Sistema Mercadinho Igor

> Projeto da Disciplina de Desenvolvimento de Software para Web 2026.2
> Universidade Federal do Ceará, Campus de Quixadá
> **Etapa 01:** Diagnóstico comunitário e proposta de uma solução Web

## Equipe

| Nome | Matrícula | GitHub |
|------|-----------|--------|
| Igor José Bastos Mota Filho | 557179 | @IgorF-prog |

**Professor(a):** Nator Júnior Carvalho da Costa

---

## 1. Público beneficiado

- **Nome do estabelecimento:** Mercadinho Igor
- **Tipo:** Pequeno Empreendedor
- **Localização:** Tauá-CE
- **Responsável(is):** Igor Mota
- **Atuação na comunidade:** Vende diversos tipos de produtos, atendendo principalmente aos vizinhos e familiares

## 2. Interação realizada

### 2.1 Escuta inicial

- **Data:** 26/10/2026
- **Formato:** presencial
- **Participantes:** Igor Filho

**Necessidades relatadas:**
- Algo para acompanhar melhor o controle da movimentação dos produtos
- Algo para fazer o caixa diário de forma mais rápida e precisa
- Uma identidade visual para o empreendimento

### 2.2 Apresentação da proposta e retorno

- **Data:** [dd/mm/aaaa]
- **O que foi apresentado:** [esboços, protótipo, lista de funcionalidades]
- **Retorno recebido:** [o que aprovaram, o que pediram para mudar]
- **Ajustes feitos no escopo:** [o que mudou depois do retorno]

### 2.3 Evidências

[Fotos, prints de conversa, anotações. Coloque os arquivos na pasta `docs/evidencias/` e liste aqui.]

- `docs/evidencias/conversa-01.png`
- `docs/evidencias/reuniao-01.jpg`

## 3. Problema identificado

- **Situação atual:** Controle feito através de um caderno
- **Público afetado:** Donos e funcionários
- **Dificuldades:** Perda de pedidos, pouca divulgação, falta de organização, etc.
- **Contribuição esperada da solução:** Irá tornar o trabalho mais fácil e organizado

## 4. Escopo

### 4.1 Objetivo

Elevar a qualidade do trabalho de um pequeno empreendedor, fazendo com que ele cresça usando a tecnologia.

### 4.2 Funcionalidades essenciais (primeira versão)

- [ ] [Funcionalidade 1, ex.: catálogo de produtos com preços]
- [ ] [Funcionalidade 2, ex.: pedido pelo WhatsApp]
- [ ] [Funcionalidade 3, ex.: ofertas da semana, horários e localização]

### 4.3 Limitações da primeira versão

- Nesta etapa o protótipo é apenas HTML e CSS, sem interações em JavaScript.

## 5. Requisitos

### 5.1 Requisitos funcionais

| ID | Descrição |
|----|-----------|
| RF01 | O usuário deve poder [ação] |
| RF02 | O sistema deve exibir [conteúdo] |
| RF03 | ... |

### 5.2 Requisitos não funcionais

| ID | Descrição |
|----|-----------|
| RNF01 | Interface responsiva (celular, tablet e computador) |
| RNF02 | HTML semântico e cuidados básicos de acessibilidade (contraste, textos alternativos, navegação por teclado) |
| RNF03 | Identidade visual coerente com o estabelecimento |

## 6. Proposta de solução

### 6.1 Estrutura de páginas

| Página | Arquivo | Finalidade |
|--------|---------|-----------|
| Início | `menu.html` | Login |
| admin | `admin.html` | Página principal do site |
| produtos | `cadastrar_produto.html` | Cadastrar produtos |
| produtos | `editar_produto.html` | Editar produtos |
| produtos | `listar_produtos.html` | Exibir lista de todos os produtos |
| clientes | `cadastrar_cliente.html` | Cadastrar clientes |
| clientes | `editar_cliente.html` | Editar clientes |
| clientes | `listar_clientes.html` | Exibir lista de todos os clientes |
| clientes | `contas_clientes.html` | Exibir contas de todos os clientes |
| operacoes | `caixa_diario.html` | Fazer o caixa de forma automática |
| operacoes | `entrada_estoque.html` | Registrar entrada de estoque |
| operacoes | `registrar_venda.html` | Registrar venda de produto |


### 6.2 Fluxo de navegação

[Insira um esboço ou diagrama. Exemplo com Mermaid, que o GitHub renderiza:]

```mermaid
flowchart LR
    A[Início] --> B[Produtos]
    A --> C[Ofertas]
    A --> D[Contato]
    B --> E[Fazer pedido]
```

### 6.3 Esboços (wireframes)

[Imagens em `docs/esboços/`, referenciadas aqui.]

### 6.4 Identidade visual

- **Cores:** [paleta e justificativa]
- **Tipografia:** [fontes]
- **Logotipo/imagens:** [origem e autorização de uso]

## 7. Protótipo

- **Como abrir:** baixe o repositório e abra `menu.html` no navegador.
- **Demonstração online (opcional):** [link do GitHub Pages]

## 8. Estrutura do repositório

```
/
├── menu.html
├── sistema.css
├── admin/
|   ├── admin.html
├── produtos/
|   ├── cadastrar_produto.html
|   ├── editar_produto.html
|   ├── listar_produtos.html
├── clientes/
|   ├── cadastrar_cliente.html
|   ├── contas_clientes.html
|   ├── editar_cliente.html
|   ├── listar_clientes.html
├── operacoes/
|   ├── caixa_diario.html
|   ├── entrada_estoque.html
|   ├── registrar_venda.html
├── docs/
│   ├── evidencias/
│   └── esboços/
└── README.md
```

## 9. Organização do trabalho

- **Branches:** `main` (versão estável), `develop` (integração) e branches de trabalho no formato `feature/nome-da-tarefa`.
- **Commits:** mensagens claras e no imperativo, ex.: `Adiciona página de produtos`.

| Integrante | Responsabilidades |
|------------|-------------------|
| [Nome] | [ex.: escuta com o beneficiado, README] |
| [Nome] | [ex.: página inicial e CSS base] |

## 10. Próximos passos (Etapa 02)

- Interações com JavaScript e manipulação do DOM
- Validação de formulários
- Consumo de APIs, quando pertinente
- Validação final com o público beneficiado
