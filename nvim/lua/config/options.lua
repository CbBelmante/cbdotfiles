-- Options are automatically loaded before lazy.nvim startup
-- Default options that are always set: https://github.com/LazyVim/LazyVim/blob/main/lua/lazyvim/config/options.lua
-- Add any additional options here
vim.opt.relativenumber = false
vim.opt.spell = false
-- Auto-save ao trocar buffer (exceto diffs do Claude Code)
vim.api.nvim_create_autocmd("BufLeave", {
  callback = function(ev)
    local buf = ev.buf
    if vim.bo[buf].modified and vim.bo[buf].buftype ~= "acwrite" and vim.bo[buf].modifiable then
      vim.api.nvim_buf_call(buf, function()
        vim.cmd("silent! write")
      end)
    end
  end,
})
