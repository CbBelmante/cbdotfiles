# 🔍 cbSearch - Sistema de Help Interativo

Busca fuzzy (fzf) em comandos e dicas, data-driven com JSON.

## 🎯 Como usar

```bash
# Helps específicos
nvimHelp    # 48 comandos Neovim
sqlpHelp    # 19 comandos SQL + dadbod  
cbHelp      # 15 aliases + ferramentas

# Genérico
cbSearch nvim-tips
cbSearch sql-help
cbSearch cb-help
cbSearch ~/.config/meu-arquivo.json
```

## 🔍 Busca em

- ✅ Nome do comando
- ✅ Descrição
- ✅ Tags
- ✅ Categoria
- ✅ Fuzzy (typos funcionam!)

## ⌨️ Navegação

| Tecla | Ação |
|-------|------|
| `↑ ↓` | Navegar |
| `Enter` | Copiar comando pro clipboard |
| `Esc` | Sair |
| `Ctrl+/` | Toggle preview |

## 📊 Estatísticas

| Arquivo | Comandos | Categorias |
|---------|----------|------------|
| `nvim-tips.json` | 48 | Text Objects, Navegação, Edição, Visual Mode, Busca, SQL |
| `sql-help.json` | 24 | Dadbod, SQL Básico, Funções, Connection, Ferramentas |
| `cb-help.json` | 15 | Help, Navegação, Zellij, Git, Ferramentas, cbdotfiles |
| **TOTAL** | **87** | **17** |

## 📦 Estrutura JSON

```json
{
  "title": "Nome do Help",
  "version": "1.0",
  "source": "fonte",
  "items": [
    {
      "name": "comando",
      "command": "comando",
      "description": "Descrição curta (1 linha)",
      "category": "Categoria",
      "tags": ["tag1", "tag2", "frequente", "útil"],
      "details": "Explicação completa com exemplos.\n\n💡 Dicas\n\nExemplos práticos...",
      "related": ["cmd1", "cmd2", "cmd3"]
    }
  ]
}
```

## 🎨 Categorias sugeridas

### nvim-tips.json
- Text Objects
- Navegação
- Edição
- Visual Mode
- Busca
- Comandos
- SQL/Dadbod

### sql-help.json
- Dadbod
- SQL Básico
- SQL Funções
- Connection
- Ferramentas

### cb-help.json
- Help
- Navegação
- Zellij
- Git
- Ferramentas
- cbdotfiles

## 🏷️ Tags úteis

**Frequência:**
- `frequente` - comandos muito usados
- `útil` - comandos super úteis
- `cuidado` - comandos perigosos (DELETE, etc)

**Função:**
- `copiar`, `deletar`, `buscar`, `navegar`
- `editar`, `selecionar`, `executar`

**Contexto:**
- `sql`, `dadbod`, `git`, `zellij`
- `neovim`, `workspace`

## 💡 Dicas

### Emojis estratégicos

Use com moderação nos `details`:
- `💡` - Dicas importantes
- `⚠️` - Avisos/cuidados
- `✅` - Correto
- `❌` - Errado

### Exemplos práticos

Sempre inclua exemplos com código:

```
Exemplo:
  const name = "Claude Code";
           ↑ cursor aqui
  yi" → copia: Claude Code
```

### Comandos relacionados

Liste 2-5 comandos relacionados pra navegação:
```json
"related": ["ya\"", "ci\"", "di\"", "vi\""]
```

## 🔮 Futuro

Este sistema foi projetado pra migrar facilmente pro **Charm/bubbletea**:

- ✅ **Dados (JSON)** - permanece igual
- ✅ **Lógica (busca/filtro)** - porta pra Go
- ❌ **UI (fzf)** → **UI (bubbletea)** - só isso muda!

Arquitetura limpa = evolução incremental! 🚀

## 📁 Arquivos

```
data/
├── README.md           ← Este arquivo
├── nvim-tips.json      ← Comandos Neovim (48)
├── sql-help.json       ← SQL + dadbod (19)
└── cb-help.json        ← cbdotfiles (15)
```

## 🛠️ Ferramenta

```
bin/cbSearch              ← Script principal
bin/.cbSearch-preview.sh  ← Preview helper
```

## 🔗 Aliases

```bash
# Em zsh/aliases.zsh
alias cbSearch='~/Workspaces/cbdotfiles/bin/cbSearch'
alias nvimHelp='cbSearch nvim-tips'
alias sqlpHelp='cbSearch sql-help'
alias cbHelp='cbSearch cb-help'
```

## 📖 Mais info

- README principal: `../README.md`
- Código fonte: `../bin/cbSearch`
- Dependências: `fzf`, `jq`
