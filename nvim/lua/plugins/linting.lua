return {
  {
    "mfussenegger/nvim-lint",
    optional = true,
    opts = function(_, opts)
      local config_path = vim.fn.expand("~/.markdownlint-cli2.yaml")
      opts.linters = opts.linters or {}
      opts.linters["markdownlint-cli2"] = {
        args = { "--config", config_path },
      }
    end,
  },
  {
    "stevearc/conform.nvim",
    optional = true,
    opts = {
      formatters = {
        ["markdownlint-cli2"] = {
          prepend_args = { "--config", vim.fn.expand("~/.markdownlint-cli2.yaml") },
        },
      },
    },
  },
}
