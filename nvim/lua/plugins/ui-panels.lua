return {
	{
		"folke/snacks.nvim",
		opts = function()
			local function apply_panel_colors()
				local theme = require("config.nvim-theme")
				if not theme.editor_bg then return end

				vim.api.nvim_set_hl(0, "Normal", { bg = theme.editor_bg })
				vim.api.nvim_set_hl(0, "NormalNC", { bg = theme.editor_bg })
				vim.api.nvim_set_hl(0, "EndOfBuffer", { bg = theme.editor_bg })
				vim.api.nvim_set_hl(0, "SignColumn", { bg = theme.editor_bg })
				vim.api.nvim_set_hl(0, "FoldColumn", { bg = theme.editor_bg })
				vim.api.nvim_set_hl(0, "Folded", { bg = theme.editor_bg })

				if theme.sidebar_bg then
					vim.api.nvim_set_hl(0, "NeoTreeNormal", { bg = theme.sidebar_bg })
					vim.api.nvim_set_hl(0, "NeoTreeNormalNC", { bg = theme.sidebar_bg })
					vim.api.nvim_set_hl(0, "NeoTreeEndOfBuffer", { bg = theme.sidebar_bg, fg = theme.sidebar_bg })
					vim.api.nvim_set_hl(0, "MiniMapNormal", { bg = theme.sidebar_bg })
				end

				if theme.separator_fg then
					vim.api.nvim_set_hl(0, "NeoTreeWinSeparator", { bg = theme.sidebar_bg, fg = theme.separator_fg })
				end
			end

			vim.api.nvim_create_autocmd("ColorScheme", {
				callback = function()
					vim.defer_fn(apply_panel_colors, 50)
				end,
			})

			vim.api.nvim_create_autocmd("VimEnter", {
				callback = function()
					vim.defer_fn(apply_panel_colors, 200)
				end,
			})
		end,
	},
}
