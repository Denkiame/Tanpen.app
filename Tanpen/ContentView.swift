//
//  ContentView.swift
//  Tanpen
//
//  Created by Toto Minai on 22/12/2022.
//

import SwiftUI

struct ContentView: View {
    @EnvironmentObject var windowManager: WindowManager
    @StateObject var vim = Vim()
    
    @Binding var document: TanpenDocument
    @State private var entersFullscreen = false
    
    @State private var window: NSWindow!
    
    
    var body: some View {
        ZStack {
            VStack(spacing: 0) {
                WebView(text: $document.text, in: $window) { webView in
                    vim.webView = webView
                }
                    .mask {
                        HStack(spacing: 0) {
                            LinearGradient(colors: [.black.opacity(0), .black], startPoint: .leading, endPoint: .trailing)
                                .frame(width: 28)
                            Rectangle()
                            LinearGradient(colors: [.black.opacity(0), .black], startPoint: .trailing, endPoint: .leading)
                                .frame(width: 28)
                        }
                    }
                    .overlay(alignment: .bottomLeading) {
                        Text(vim.mode == .insert ? "" : "<~>")
                            .font(.system(.body).monospaced())
                            .padding(.horizontal, Metrics.horizontalPadding)
                            .foregroundColor(.secondary)
                            .frame(height: Metrics.titlebarHeight)
                    }
            }
        }
        .onChange(of: window) { _ in
            windowManager.correspondingVim[window] = vim
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


