return {
  "f-person/git-blame.nvim",
  event = "BufReadPre",
  opts = {
    enabled = true,
    message_template = " <author> \u{2022} <date> \u{2022} <summary>",
    date_format = "%d/%m/%Y",
    message_when_not_committed = " Sem commit",
  },
}
