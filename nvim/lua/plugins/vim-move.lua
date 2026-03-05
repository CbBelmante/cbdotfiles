return {
	"matze/vim-move",
	event = "VeryLazy",
	init = function()
		vim.g.move_key_modifier = "A" -- Alt+j/k pra mover linhas, Alt+h/l pra mover horizontal
		vim.g.move_key_modifier_visualmode = "A"
	end,
}
