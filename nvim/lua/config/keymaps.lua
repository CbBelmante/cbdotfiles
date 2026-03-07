-- Keymaps are automatically loaded on the VeryLazy event
-- Default keymaps that are always set: https://github.com/LazyVim/LazyVim/blob/main/lua/lazyvim/config/keymaps.lua
-- Add any additional keymaps here
vim.keymap.set("n", "<Tab>", "<C-w>w", { desc = "Alternar entre paineis" })
vim.keymap.set("n", "<leader>p", "<cmd>Telescope find_files<cr>", { desc = "Buscar arquivo" })
