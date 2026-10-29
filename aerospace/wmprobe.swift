// ═══════════════════════════════════════════════════════════════════════════════
// wmprobe — posicao do mouse + retangulo de cada janela, em coordenadas globais
// ═══════════════════════════════════════════════════════════════════════════════
//
// Existe porque o CLI do AeroSpace nao expoe geometria nenhuma: o --json de
// list-windows traz so app-name, window-id e window-title, e list-monitors nem
// dimensao de tela da. Sem retangulo nao da pra saber em qual quadrante da
// janela o cursor esta, que e o criterio do smart_split do Hyprland.
//
// MEDIDO: o window-id do AeroSpace E o CGWindowID do macOS (casou em 168/295/72).
// Logo a saida daqui casa direto com `aerospace list-windows --format %{window-id}`.
//
// Nao exige permissao: kCGWindowBounds e legivel sem Gravacao de Tela (so o
// titulo da janela e restrito, e nao usamos titulo). CGEvent.location nao
// exige Acessibilidade.
//
// Saida (uma linha por registro, campos separados por espaco):
//   mouse <x> <y>
//   win <id> <x> <y> <largura> <altura> <app>
//
// Compilar: swiftc -O -o wmprobe wmprobe.swift
// ═══════════════════════════════════════════════════════════════════════════════

import CoreGraphics
import Foundation

if let ev = CGEvent(source: nil) {
    print("mouse \(Int(ev.location.x)) \(Int(ev.location.y))")
}

let opts: CGWindowListOption = [.optionOnScreenOnly, .excludeDesktopElements]
guard let list = CGWindowListCopyWindowInfo(opts, kCGNullWindowID) as? [[String: Any]] else {
    exit(1)
}
for w in list {
    guard let layer = w[kCGWindowLayer as String] as? Int, layer == 0,
          let id = w[kCGWindowNumber as String] as? Int,
          let bd = w[kCGWindowBounds as String] as? [String: Any]
    else { continue }
    let owner = w[kCGWindowOwnerName as String] as? String ?? "?"
    // JankyBorders desenha overlays em layer 0 que nao sao janelas reais.
    if owner == "borders" { continue }
    let x  = (bd["X"] as? NSNumber)?.intValue ?? 0
    let y  = (bd["Y"] as? NSNumber)?.intValue ?? 0
    let ww = (bd["Width"] as? NSNumber)?.intValue ?? 0
    let hh = (bd["Height"] as? NSNumber)?.intValue ?? 0
    print("win \(id) \(x) \(y) \(ww) \(hh) \(owner)")
}
