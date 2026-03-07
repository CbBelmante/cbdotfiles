return {
	"coder/claudecode.nvim",
	event = "VeryLazy",
	opts = {
		diff_opts = {
			open_in_new_tab = true,
			hide_terminal_in_new_tab = true,
		},
	},
	keys = {
		{ "<leader>ac", "<cmd>ClaudeCodeStart<cr>", desc = "Start Claude Code connection" },
	},
}
