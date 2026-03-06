-- ═══════════════════════════════════════════════════════════════
-- ORIGAMID THEME para Neovim
-- Port do tema VS Code do André Rafael (Origamid)
-- https://github.com/origamid/origamid-next-vscode
-- ═══════════════════════════════════════════════════════════════

local M = {}

local c = {
	-- UI
	bg0 = "#131313",       -- darkest (activity bar, title bar)
	bg1 = "#191919",       -- sidebar, status bar
	bg2 = "#222222",       -- editor
	bg3 = "#363537",       -- inputs, panels
	bg4 = "#525053",       -- highlights
	border = "#69676C",    -- borders
	muted = "#88888F",     -- muted text
	fg = "#FFFFFF",        -- foreground

	-- Syntax
	green = "#88BB44",     -- strings
	yellow = "#FFDD44",    -- functions, properties
	blue = "#99BBFE",      -- keywords, constants
	blue2 = "#99BBFF",     -- variables
	purple = "#DDAAFF",    -- types, tags
	orange = "#FF7722",    -- operators

	-- Extra
	sel = "#FFFFFF12",     -- selection
	none = "NONE",
}

function M.setup()
	vim.cmd("hi clear")
	if vim.fn.exists("syntax_on") then
		vim.cmd("syntax reset")
	end
	vim.g.colors_name = "origamid"
	vim.o.termguicolors = true

	local hl = function(group, opts)
		vim.api.nvim_set_hl(0, group, opts)
	end

	-- ─── Editor ───────────────────────────────────────────
	hl("Normal", { fg = c.fg, bg = c.bg2 })
	hl("NormalNC", { fg = c.fg, bg = c.bg2 })
	hl("NormalFloat", { fg = c.fg, bg = c.bg1 })
	hl("FloatBorder", { fg = c.border, bg = c.bg1 })
	hl("Cursor", { fg = c.bg0, bg = c.fg })
	hl("CursorLine", { bg = c.bg3 })
	hl("CursorColumn", { bg = c.bg3 })
	hl("ColorColumn", { bg = c.bg3 })
	hl("LineNr", { fg = c.bg4 })
	hl("CursorLineNr", { fg = c.yellow, bold = true })
	hl("SignColumn", { bg = c.bg2 })
	hl("FoldColumn", { fg = c.bg4, bg = c.bg2 })
	hl("Folded", { fg = c.muted, bg = c.bg3 })
	hl("VertSplit", { fg = c.bg3, bg = c.none })
	hl("WinSeparator", { fg = c.bg3, bg = c.none })
	hl("EndOfBuffer", { fg = c.bg2, bg = c.bg2 })
	hl("NonText", { fg = c.bg4 })
	hl("SpecialKey", { fg = c.bg4 })
	hl("Visual", { bg = "#3a3a4a" })
	hl("VisualNOS", { bg = "#3a3a4a" })
	hl("Search", { fg = c.bg0, bg = c.yellow })
	hl("IncSearch", { fg = c.bg0, bg = c.orange })
	hl("CurSearch", { fg = c.bg0, bg = c.orange })
	hl("MatchParen", { fg = c.yellow, bold = true, underline = true })
	hl("Pmenu", { fg = c.fg, bg = c.bg1 })
	hl("PmenuSel", { fg = c.fg, bg = c.bg4 })
	hl("PmenuSbar", { bg = c.bg3 })
	hl("PmenuThumb", { bg = c.bg4 })
	hl("WildMenu", { fg = c.bg0, bg = c.yellow })
	hl("StatusLine", { fg = c.fg, bg = c.bg1 })
	hl("StatusLineNC", { fg = c.muted, bg = c.bg1 })
	hl("TabLine", { fg = c.muted, bg = c.bg1 })
	hl("TabLineFill", { bg = c.bg0 })
	hl("TabLineSel", { fg = c.fg, bg = c.bg2 })
	hl("WinBar", { fg = c.fg, bg = c.bg2 })
	hl("WinBarNC", { fg = c.muted, bg = c.bg2 })
	hl("Title", { fg = c.yellow, bold = true })
	hl("Directory", { fg = c.blue })
	hl("ErrorMsg", { fg = c.blue })
	hl("WarningMsg", { fg = c.yellow })
	hl("ModeMsg", { fg = c.fg, bold = true })
	hl("MoreMsg", { fg = c.green })
	hl("Question", { fg = c.green })
	hl("QuickFixLine", { bg = c.bg3 })

	-- ─── Syntax ───────────────────────────────────────────
	hl("Comment", { fg = c.muted, italic = true })
	hl("String", { fg = c.green })
	hl("Character", { fg = c.green })
	hl("Number", { fg = c.blue })
	hl("Float", { fg = c.blue })
	hl("Boolean", { fg = c.blue })
	hl("Identifier", { fg = c.fg })
	hl("Function", { fg = c.yellow })
	hl("Statement", { fg = c.blue })
	hl("Conditional", { fg = c.blue })
	hl("Repeat", { fg = c.blue })
	hl("Label", { fg = c.blue })
	hl("Operator", { fg = c.orange })
	hl("Keyword", { fg = c.blue })
	hl("Exception", { fg = c.blue })
	hl("PreProc", { fg = c.purple })
	hl("Include", { fg = c.blue })
	hl("Define", { fg = c.purple })
	hl("Macro", { fg = c.purple })
	hl("PreCondit", { fg = c.purple })
	hl("Type", { fg = c.purple })
	hl("StorageClass", { fg = c.blue2 })
	hl("Structure", { fg = c.purple })
	hl("Typedef", { fg = c.purple })
	hl("Special", { fg = c.orange })
	hl("SpecialChar", { fg = c.orange })
	hl("Tag", { fg = c.purple })
	hl("Delimiter", { fg = c.fg })
	hl("SpecialComment", { fg = c.muted, italic = true })
	hl("Debug", { fg = c.orange })
	hl("Underlined", { underline = true })
	hl("Error", { fg = c.blue })
	hl("Todo", { fg = c.yellow, bold = true })
	hl("Constant", { fg = c.blue })

	-- ─── Treesitter ───────────────────────────────────────
	hl("@variable", { fg = c.fg })
	hl("@variable.builtin", { fg = c.blue })
	hl("@variable.parameter", { fg = c.fg })
	hl("@variable.member", { fg = c.yellow })
	hl("@constant", { fg = c.blue })
	hl("@constant.builtin", { fg = c.blue })
	hl("@module", { fg = c.purple })
	hl("@string", { fg = c.green })
	hl("@string.escape", { fg = c.orange })
	hl("@string.regex", { fg = c.orange })
	hl("@character", { fg = c.green })
	hl("@number", { fg = c.blue })
	hl("@boolean", { fg = c.blue })
	hl("@float", { fg = c.blue })
	hl("@function", { fg = c.yellow })
	hl("@function.builtin", { fg = c.yellow })
	hl("@function.call", { fg = c.yellow })
	hl("@function.method", { fg = c.yellow })
	hl("@function.method.call", { fg = c.yellow })
	hl("@constructor", { fg = c.purple })
	hl("@keyword", { fg = c.blue })
	hl("@keyword.function", { fg = c.blue })
	hl("@keyword.return", { fg = c.blue })
	hl("@keyword.operator", { fg = c.orange })
	hl("@keyword.import", { fg = c.blue })
	hl("@keyword.conditional", { fg = c.blue })
	hl("@keyword.repeat", { fg = c.blue })
	hl("@keyword.exception", { fg = c.blue })
	hl("@operator", { fg = c.orange })
	hl("@punctuation.bracket", { fg = c.fg })
	hl("@punctuation.delimiter", { fg = c.fg })
	hl("@punctuation.special", { fg = c.orange })
	hl("@type", { fg = c.purple })
	hl("@type.builtin", { fg = c.purple })
	hl("@type.qualifier", { fg = c.blue })
	hl("@tag", { fg = c.purple })
	hl("@tag.attribute", { fg = c.yellow })
	hl("@tag.delimiter", { fg = c.muted })
	hl("@property", { fg = c.yellow })
	hl("@attribute", { fg = c.yellow })
	hl("@comment", { fg = c.muted, italic = true })
	hl("@markup.heading", { fg = c.yellow, bold = true })
	hl("@markup.link", { fg = c.blue, underline = true })
	hl("@markup.link.url", { fg = c.blue, underline = true })
	hl("@markup.raw", { fg = c.green })
	hl("@markup.strong", { bold = true })
	hl("@markup.italic", { italic = true })

	-- ─── LSP ──────────────────────────────────────────────
	hl("DiagnosticError", { fg = c.blue })
	hl("DiagnosticWarn", { fg = c.yellow })
	hl("DiagnosticInfo", { fg = c.blue2 })
	hl("DiagnosticHint", { fg = c.green })
	hl("DiagnosticUnderlineError", { undercurl = true, sp = c.blue })
	hl("DiagnosticUnderlineWarn", { undercurl = true, sp = c.yellow })
	hl("DiagnosticUnderlineInfo", { undercurl = true, sp = c.blue2 })
	hl("DiagnosticUnderlineHint", { undercurl = true, sp = c.green })
	hl("LspReferenceText", { bg = c.bg3 })
	hl("LspReferenceRead", { bg = c.bg3 })
	hl("LspReferenceWrite", { bg = c.bg4 })

	-- ─── Git ──────────────────────────────────────────────
	hl("GitSignsAdd", { fg = c.green })
	hl("GitSignsChange", { fg = c.yellow })
	hl("GitSignsDelete", { fg = c.blue })
	hl("DiffAdd", { bg = "#2a3a20" })
	hl("DiffChange", { bg = "#2a2a30" })
	hl("DiffDelete", { bg = "#3a2020" })
	hl("DiffText", { bg = "#3a3a20" })

	-- ─── Neo-tree ─────────────────────────────────────────
	hl("NeoTreeNormal", { fg = c.fg, bg = c.bg1 })
	hl("NeoTreeNormalNC", { fg = c.fg, bg = c.bg1 })
	hl("NeoTreeEndOfBuffer", { fg = c.bg1, bg = c.bg1 })
	hl("NeoTreeWinSeparator", { fg = c.bg3, bg = c.bg1 })
	hl("NeoTreeDirectoryIcon", { fg = c.yellow })
	hl("NeoTreeDirectoryName", { fg = c.blue })
	hl("NeoTreeRootName", { fg = c.yellow, bold = true })
	hl("NeoTreeGitModified", { fg = c.yellow })
	hl("NeoTreeGitAdded", { fg = c.green })
	hl("NeoTreeGitDeleted", { fg = c.blue })

	-- ─── Telescope ────────────────────────────────────────
	hl("TelescopeNormal", { fg = c.fg, bg = c.bg1 })
	hl("TelescopeBorder", { fg = c.border, bg = c.bg1 })
	hl("TelescopePromptNormal", { fg = c.fg, bg = c.bg3 })
	hl("TelescopePromptBorder", { fg = c.bg3, bg = c.bg3 })
	hl("TelescopePromptTitle", { fg = c.bg0, bg = c.yellow })
	hl("TelescopePreviewTitle", { fg = c.bg0, bg = c.green })
	hl("TelescopeResultsTitle", { fg = c.bg0, bg = c.blue })
	hl("TelescopeSelection", { bg = c.bg3 })
	hl("TelescopeMatching", { fg = c.yellow, bold = true })

	-- ─── Which-key ────────────────────────────────────────
	hl("WhichKey", { fg = c.yellow })
	hl("WhichKeyGroup", { fg = c.blue })
	hl("WhichKeyDesc", { fg = c.fg })
	hl("WhichKeyFloat", { bg = c.bg1 })

	-- ─── Notify ───────────────────────────────────────────
	hl("NotifyINFOBody", { fg = c.fg, bg = c.bg1 })
	hl("NotifyINFOTitle", { fg = c.green, bg = c.bg1 })
	hl("NotifyINFOBorder", { fg = c.border, bg = c.bg1 })
	hl("NotifyWARNBody", { fg = c.fg, bg = c.bg1 })
	hl("NotifyWARNTitle", { fg = c.yellow, bg = c.bg1 })
	hl("NotifyWARNBorder", { fg = c.border, bg = c.bg1 })
	hl("NotifyERRORBody", { fg = c.fg, bg = c.bg1 })
	hl("NotifyERRORTitle", { fg = c.blue, bg = c.bg1 })
	hl("NotifyERRORBorder", { fg = c.border, bg = c.bg1 })

	-- ─── Mini.map ─────────────────────────────────────────
	hl("MiniMapNormal", { bg = c.bg1 })

	-- ─── Bufferline ───────────────────────────────────────
	hl("BufferLineBackground", { fg = c.muted, bg = c.bg0 })
	hl("BufferLineFill", { bg = c.bg0 })
	hl("BufferLineBufferSelected", { fg = c.fg, bg = c.bg2, bold = true })
	hl("BufferLineIndicatorSelected", { fg = c.yellow, bg = c.bg2 })

	-- ─── Indent ───────────────────────────────────────────
	hl("IndentBlanklineChar", { fg = c.bg3 })
	hl("IblIndent", { fg = c.bg3 })
	hl("IblScope", { fg = c.bg4 })

	-- ─── Dropbar ──────────────────────────────────────────
	hl("DropBarCurrentContext", { bg = c.bg3 })
	hl("DropBarIconUISeparator", { fg = c.muted })

	-- ─── Render Markdown ──────────────────────────────────
	hl("RenderMarkdownCode", { bg = "#292929" })
	hl("RenderMarkdownCodeInline", { bg = "#292929" })
	hl("RenderMarkdownH1Bg", { bg = "#2a2a10" })
	hl("RenderMarkdownH2Bg", { bg = "#1a2a1a" })
	hl("RenderMarkdownH3Bg", { bg = "#1a1a2a" })
	hl("RenderMarkdownH4Bg", { bg = "#2a1a2a" })
	hl("RenderMarkdownH5Bg", { bg = "#1a2a2a" })
	hl("RenderMarkdownH6Bg", { bg = "#2a2a2a" })
end

return M
