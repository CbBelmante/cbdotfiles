return {
	"rcarriga/nvim-notify",
	event = "VeryLazy",
	opts = {
		timeout = 3000,
		stages = "fade_in_slide_out",
		render = "compact",
		max_width = 50,
	},
	config = function(_, opts)
		local notify = require("notify")
		notify.setup(opts)
		vim.notify = notify
	end,
}
