return {
	"nvim-neo-tree/neo-tree.nvim",
	lazy = false,
	init = function()
		vim.api.nvim_create_autocmd("VimEnter", {
			callback = function()
				vim.defer_fn(function()
					pcall(vim.cmd, "Neotree show")
				end, 200)
			end,
		})
	end,
	opts = {
		default_component_configs = {
			icon = {
				folder_open = "\u{f07c}",
				folder_closed = "\u{f07b}",
				folder_empty = "\u{f114}",
			},
			indent = {
				expander_collapsed = ">",
				expander_expanded = "v",
			},
		},
	},
}
