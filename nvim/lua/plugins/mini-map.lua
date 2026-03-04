return {
	"nvim-mini/mini.map",
	keys = {
		{ "<leader>um", function() require("mini.map").toggle() end, desc = "Toggle minimap" },
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
				winblend = 50,
			},
			symbols = {
				encode = map.gen_encode_symbols.dot("4x2"),
			},
		})
	end,
}
