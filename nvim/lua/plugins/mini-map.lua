return {
	"nvim-mini/mini.map",
	event = "VeryLazy",
	keys = {
		{ "<leader>uM", function() require("mini.map").toggle() end, desc = "Toggle minimap" },
		{ "<leader>uf", function() require("mini.map").toggle_focus() end, desc = "Focus minimap" },
		{ "<leader>ur", function() require("mini.map").refresh() end, desc = "Refresh minimap" },
	},
	config = function()
		local map = require("mini.map")
		map.setup({
			integrations = {
				map.gen_integration.builtin_search(),
				map.gen_integration.diagnostic(),
			},
			window = {
				width = 10,
				winblend = 0,
			},
			symbols = {
				encode = map.gen_encode_symbols.dot("4x2"),
			},
		})

		local function apply_minimap_transparency()
			-- Pegar fg atual do NormalFloat (ou Normal) pra nao perder cor do texto
			local hl = vim.api.nvim_get_hl(0, { name = "NormalFloat", link = false })
			if not hl.fg then
				hl = vim.api.nvim_get_hl(0, { name = "Normal", link = false })
			end
			-- Mesmo padrao do transparency.lua do Omarchy: bg = "none"
			vim.api.nvim_set_hl(0, "MiniMapNormal", { fg = hl.fg, bg = "none" })
		end

		apply_minimap_transparency()

		-- Reaplicar apos troca de tema
		vim.api.nvim_create_autocmd("ColorScheme", {
			callback = apply_minimap_transparency,
		})

		map.open()
	end,
}
