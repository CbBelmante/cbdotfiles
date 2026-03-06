return {
	{
		"folke/snacks.nvim",
		opts = function()
			local function apply_theme_bg()
				-- Reaplica o colorscheme pra desfazer o transparency.lua do Omarchy
				local cs = vim.g.colors_name
				if cs then
					vim.cmd.colorscheme(cs)
				end
			end

			vim.api.nvim_create_autocmd("VimEnter", {
				callback = function()
					vim.defer_fn(apply_theme_bg, 200)
				end,
			})
		end,
	},
}
