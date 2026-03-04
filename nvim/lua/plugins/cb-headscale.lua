return {
	-- cb-headscale: headings com fonte grande via Kitty Text Sizing Protocol (OSC 66)
	{
		"CbBelmante/cb-headscale.nvim",
		ft = "markdown",
		dependencies = {
			"nvim-treesitter/nvim-treesitter",
		},
		opts = {
			scale_map = {
				[1] = 3, -- h1: triple size
				[2] = 2, -- h2: double size
			},
			anti_conceal = true,
		},
	},

	-- Hook render-markdown.nvim pra coordenar com cb-headscale
	{
		"MeanderingProgrammer/render-markdown.nvim",
		opts = function(_, opts)
			opts.on = opts.on or {}
			local orig_render = opts.on.render
			local orig_clear = opts.on.clear
			opts.on.render = function(ctx)
				if orig_render then
					orig_render(ctx)
				end
				local ok, kh = pcall(require, "cb-headscale.renderer")
				if ok then
					kh.render(ctx.win, ctx.buf)
				end
			end
			opts.on.clear = function(ctx)
				if orig_clear then
					orig_clear(ctx)
				end
				local ok, kh = pcall(require, "cb-headscale.renderer")
				if ok then
					kh.clear(ctx.win, ctx.buf)
				end
			end
		end,
	},
}
