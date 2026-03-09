-- Options are automatically loaded before lazy.nvim startup
-- Default options that are always set: https://github.com/LazyVim/LazyVim/blob/main/lua/lazyvim/config/options.lua
-- Add any additional options here
vim.opt.relativenumber = false
vim.opt.spell = false
-- Auto-save ao trocar buffer (exceto diffs do Claude Code)
vim.api.nvim_create_autocmd("BufLeave", {
  callback = function(ev)
    local buf = ev.buf
    local bt = vim.bo[buf].buftype
    local name = vim.api.nvim_buf_get_name(buf)
    local is_claude_diff = bt == "acwrite" or bt == "nofile" or name:match("NEW FILE") or name:match("claudecode")
    if vim.bo[buf].modified and not is_claude_diff and vim.bo[buf].modifiable then
      vim.api.nvim_buf_call(buf, function()
        vim.cmd("silent! write")
      end)
    end
  end,
})
