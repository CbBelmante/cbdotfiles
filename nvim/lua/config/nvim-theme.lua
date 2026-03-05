-- ═══════════════════════════════════════════════════════════════
-- CB NEOVIM THEME
-- Mude o current pra trocar entre os temas
-- ═══════════════════════════════════════════════════════════════

local themes = {
	-- Azul escuro
	blue = {
		editor_bg = "#1a1b2e",
		sidebar_bg = "#141521",
		separator_fg = "#2a2b3d",
	},
	-- Cinza estilo WebStorm
	gray = {
		editor_bg = "#2b2b2b",
		sidebar_bg = "#222222",
		separator_fg = "#3c3c3c",
	},
}

-- ══════════════════════════════
-- TROQUE AQUI: "blue" ou "gray"
-- ══════════════════════════════
local current = "gray"

return themes[current]
