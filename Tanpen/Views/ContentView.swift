//
//  ContentView.swift
//  Tanpen
//
//  Created by Toto Minai on 22/12/2022.
//

import SwiftUI

struct ContentView: View {
    @Binding var document: TanpenDocument
    @State private var hoversTitlebar = false
    
    @Environment(\.controlActiveState) private var controlActiveState
    @State private var window: NSWindow!
    
    var body: some View {
        ZStack {
            WebView(text: $document.text) { webView in
                if let window = webView.window {
                    self.window = window
                }
            }
                .ignoresSafeArea()
                .mask {
                    HStack(spacing: 0) {
                        LinearGradient(colors: [.black.opacity(0), .black], startPoint: .leading, endPoint: .trailing)
                            .frame(width: 28)
                        Rectangle()
                        LinearGradient(colors: [.black.opacity(0), .black], startPoint: .trailing, endPoint: .leading)
                            .frame(width: 28)
                    }
                }
                .overlay(alignment: .top) {
                    Rectangle()
                        .fill(.black.opacity(1e-3))
                        .frame(height: Metrics.titlebarHeight)
                        .onHover { hoversTitlebar = $0 }
                        .ignoresSafeArea()
                }
        }
        .background(EffectView(.underPageBackground, blendingMode: .behindWindow).ignoresSafeArea())
        .onReceive(NotificationCenter.default.publisher(for: Notification.Name("shareText"))) { notification in
            if controlActiveState != .key { return }
            if let item = notification.object as? NSSharingService {
                item.perform(withItems: [ document.text ])
            }
        }
        .onChange(of: hoversTitlebar) {
            if let window { window.showsTitlebar($0) }
        }
//        .onReceive(NotificationCenter.default.publisher(for: NSPopover.didShowNotification)) { notif in
//            let popover = notif.object as! NSPopover
//            if let button = popover.delegate as? NSButton,
//               button.className == "NSThemeAutosaveButton" {
//                isAutosavePanelOpen = true
//            }
//        }
//        .onReceive(NotificationCenter.default.publisher(for: NSPopover.didCloseNotification)) { notif in
//            let popover = notif.object as! NSPopover
//            if let button = popover.delegate as? NSButton,
//               button.className == "NSThemeAutosaveButton" {
//                isAutosavePanelOpen = false
//            }
//        }
//        .onReceive(NotificationCenter.default.publisher(for: NSWindow.didEnterFullScreenNotification)) { _ in
//            entersFullscreen = true
//        }
//        .onReceive(NotificationCenter.default.publisher(for: NSWindow.didExitFullScreenNotification)) { _ in
//            entersFullscreen = false
//        }
    }
}


