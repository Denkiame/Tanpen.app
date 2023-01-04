//
//  ContentView.swift
//  Tanpen
//
//  Created by Toto Minai on 22/12/2022.
//

import SwiftUI

struct ContentView: View {
    @Environment(\.controlActiveState) private var controlActiveState
    
    @Binding var document: TanpenDocument
    
    var body: some View {
        ZStack {
            VStack(spacing: 0) {
                WebView(text: $document.text)
                    .mask {
                        HStack(spacing: 0) {
                            LinearGradient(colors: [.black.opacity(0), .black], startPoint: .leading, endPoint: .trailing)
                                .frame(width: 28)
                            Rectangle()
                            LinearGradient(colors: [.black.opacity(0), .black], startPoint: .trailing, endPoint: .leading)
                                .frame(width: 28)
                        }
                    }
            }
        }
        .onReceive(NotificationCenter.default.publisher(for: Notification.Name("shareText"))) { notification in
            if controlActiveState != .key { return }
            if let item = notification.object as? NSSharingService {
                item.perform(withItems: [ document.text ])
            }
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


