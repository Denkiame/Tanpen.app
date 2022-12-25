//
//  TanpenApp.swift
//  Tanpen
//
//  Created by Toto Minai on 22/12/2022.
//

import SwiftUI

@main
struct TanpenApp: App {
    @NSApplicationDelegateAdaptor var appDelegate: AppDelegate
    
    var body: some Scene {
        DocumentGroup(newDocument: TanpenDocument()) { file in
            ContentView(document: file.$document)
                .frame(minWidth: 342, minHeight: 330.67 - Metrics.titlebarHeight)
        }
        .commands {
            CommandMenu("Control") {
                Button("Insert Mode") {
                }.keyboardShortcut("i", modifiers: [])
                Divider()
                Button("Next Character") {
                }.keyboardShortcut("j", modifiers: [])
                Button("Preview Character") {
                }.keyboardShortcut("k", modifiers: [])
            }
        }
    }
}

class AppDelegate: NSObject, NSApplicationDelegate {
    func applicationDidFinishLaunching(_ notification: Notification) {
    }
}
