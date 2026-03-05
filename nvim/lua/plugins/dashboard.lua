return {
	"folke/snacks.nvim",
	opts = {
		dashboard = {
			preset = {
				header = require("config.dashboard-header"),
				keys = {
					{ icon = " ", key = "f", desc = "Buscar arquivo", action = ":lua Snacks.dashboard.pick('files')" },
					{ icon = " ", key = "n", desc = "Novo arquivo", action = ":ene | startinsert" },
					{ icon = " ", key = "g", desc = "Buscar texto", action = ":lua Snacks.dashboard.pick('live_grep')" },
					{ icon = " ", key = "r", desc = "Arquivos recentes", action = ":lua Snacks.dashboard.pick('oldfiles')" },
					{ icon = " ", key = "c", desc = "Configuracao", action = ":lua Snacks.dashboard.pick('files', {cwd = vim.fn.stdpath('config')})" },
					{ icon = " ", key = "s", desc = "Restaurar sessao", section = "session" },
					{ icon = "󰒲 ", key = "l", desc = "Lazy", action = ":Lazy" },
					{ icon = " ", key = "q", desc = "Sair", action = ":qa" },
				},
			},
		},
	},
}
