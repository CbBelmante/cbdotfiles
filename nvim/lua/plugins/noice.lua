return {
  "folke/noice.nvim",
  event = "VeryLazy",
  dependencies = {
    "MunifTanjim/nui.nvim",
  },
  opts = {
    cmdline = {
      view = "cmdline_popup",
    },
    messages = {
      view_search = false,
    },
    presets = {
      bottom_search = false,
      command_palette = true,
      long_message_to_split = true,
    },
  },
}
