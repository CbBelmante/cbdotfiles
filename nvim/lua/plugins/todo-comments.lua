return {
  "folke/todo-comments.nvim",
  dependencies = { "nvim-lua/plenary.nvim" },
  event = "BufReadPost",
  opts = {},
  keys = {
    { "<leader>st", "<cmd>TodoTelescope<cr>", desc = "Buscar TODOs" },
  },
}
