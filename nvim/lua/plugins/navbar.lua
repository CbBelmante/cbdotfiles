return {
	{
		"Bekaboo/dropbar.nvim",
		event = "VeryLazy",
		opts = {
			bar = {
				sources = function(buf, _)
					local sources = require("dropbar.sources")
					local utils = require("dropbar.utils")
					if vim.bo[buf].ft == "markdown" then
						return { sources.markdown }
					end
					if vim.bo[buf].buftype == "terminal" then
						return { sources.terminal }
					end
					return {
						sources.path,
						utils.source.fallback({
							sources.lsp,
							sources.treesitter,
						}),
					}
				end,
			},
		},
	},
	{
		"SmiteshP/nvim-navic",
		event = "LspAttach",
		opts = {
			lsp = { auto_attach = true },
			highlight = true,
			icons = {
				File = " ",
				Module = " ",
				Namespace = " ",
				Package = " ",
				Class = " ",
				Method = " ",
				Property = " ",
				Field = " ",
				Constructor = " ",
				Enum = " ",
				Interface = " ",
				Function = " ",
				Variable = " ",
				Constant = " ",
				String = " ",
				Number = " ",
				Boolean = " ",
				Array = " ",
				Object = " ",
				Key = " ",
				Null = " ",
				EnumMember = " ",
				Struct = " ",
				Event = " ",
				Operator = " ",
				TypeParameter = " ",
			},
		},
	},
}
