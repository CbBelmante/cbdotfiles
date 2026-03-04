return {
	-- Headings bonitos, bold, com icones e background
	{
		"MeanderingProgrammer/render-markdown.nvim",
		ft = "markdown",
		opts = {
			heading = {
				enabled = true,
				sign = true,
				icons = { "󰎤 ", "󰎧 ", "󰎪 ", "󰎭 ", "󰎰 ", "󰎳 " },
				width = "full",
				backgrounds = {
					"RenderMarkdownH1Bg",
					"RenderMarkdownH2Bg",
					"RenderMarkdownH3Bg",
					"RenderMarkdownH4Bg",
					"RenderMarkdownH5Bg",
					"RenderMarkdownH6Bg",
				},
				foregrounds = {
					"RenderMarkdownH1",
					"RenderMarkdownH2",
					"RenderMarkdownH3",
					"RenderMarkdownH4",
					"RenderMarkdownH5",
					"RenderMarkdownH6",
				},
			},
			code = {
				enabled = true,
				sign = false,
				width = "full",
				style = "full",
			},
			bullet = {
				enabled = true,
				icons = { "—", "–", "—", "–" },
			},
			checkbox = {
				enabled = true,
				unchecked = { icon = "󰄱 " },
				checked = { icon = "󰱒 " },
			},
			pipe_table = {
				enabled = true,
				style = "full",
			},
		},
	},

	-- Renderiza Mermaid/PlantUML como imagem inline no terminal (Kitty)
	{
		"3rd/diagram.nvim",
		ft = "markdown",
		dependencies = {
			"3rd/image.nvim",
		},
		opts = {
			renderer_options = {
				mermaid = {
					theme = "dark",
				},
			},
		},
	},

	-- Backend de imagem para Kitty terminal
	{
		"3rd/image.nvim",
		lazy = true,
		opts = {
			backend = "kitty",
			integrations = {
				markdown = {
					enabled = true,
					sizing_strategy = "auto",
				},
			},
			max_width = 100,
			max_height = 30,
		},
	},
}
