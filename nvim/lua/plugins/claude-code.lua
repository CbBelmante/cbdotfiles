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
	init = function()
		-- Limpa buffers [No Name] vazios apos aceitar diffs do Claude
		vim.api.nvim_create_autocmd("BufEnter", {
			callback = function()
				vim.defer_fn(function()
					for _, buf in ipairs(vim.api.nvim_list_bufs()) do
						if vim.api.nvim_buf_is_loaded(buf) then
							local name = vim.api.nvim_buf_get_name(buf)
							local lines = vim.api.nvim_buf_get_lines(buf, 0, -1, false)
							local is_empty = name == "" and #lines <= 1 and (lines[1] or "") == ""
							local bt = vim.bo[buf].buftype
							if is_empty and bt == "" and not vim.bo[buf].modified then
								pcall(vim.api.nvim_buf_delete, buf, { force = true })
							end
						end
					end
				end, 500)
			end,
		})
	end,
}
