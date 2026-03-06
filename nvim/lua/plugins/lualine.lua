return {
	"nvim-lualine/lualine.nvim",
	opts = {
		sections = {
			lualine_b = {
				{ "branch", icon = "\u{f126}" },
				"diff",
				"diagnostics",
			},
			lualine_y = {
				{
					function()
						return "\u{21e5} " .. vim.bo.shiftwidth
					end,
				},
				{ "progress", padding = { left = 1, right = 0 }, separator = " " },
				{ "location", padding = { left = 0, right = 1 } },
			},
			lualine_z = {
				{
					function()
						return "\u{f017} " .. os.date("%H:%M")
					end,
				},
			},
		},
	},
}
