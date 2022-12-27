//
//  TanpenApp.swift
//  Tanpen
//
//  Created by Toto Minai on 22/12/2022.
//

import SwiftUI
import InputMethodKit

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
                Button("Normal Mode") {
                }.keyboardShortcut(.escape, modifiers: [])
                Divider()
                Button("Next Character") {
                }.keyboardShortcut("j", modifiers: [])
                Button("Previous Character") {
                }.keyboardShortcut("k", modifiers: [])
                Button("Next Word") {
                }.keyboardShortcut("w", modifiers: [])
                Button("Previous Word") {
                }.keyboardShortcut("b", modifiers: [])
                Button("Next Line") {
                }.keyboardShortcut("h", modifiers: [])
                Button("Previous Line") {
                }.keyboardShortcut("l", modifiers: [])
                Button("Insert after Sentence") {
                }.keyboardShortcut("a", modifiers: .shift)
            }
        }
        
        Settings {
            Text("Help")
        }
    }
}

class AppDelegate: NSObject, NSApplicationDelegate {
    var touchbar: NSTouchBar!
    
    func applicationDidFinishLaunching(_ notification: Notification) {
    }
}

class InputSource {
    static var sources: [TISInputSource] {
        TISCreateInputSourceList(nil, false).takeRetainedValue() as! [TISInputSource]
    }

    static func select(with id: String) {
        TISSelectInputSource(sources.first { $0.id == id })
    }
}

extension TISInputSource {
    private func getProperty(_ key: CFString) -> AnyObject {
        return Unmanaged<AnyObject>
            .fromOpaque(TISGetInputSourceProperty(self, key))
            .takeUnretainedValue()
    }

    var id: String { getProperty(kTISPropertyInputSourceID) as! String }
    var localizedName: String { getProperty(kTISPropertyLocalizedName) as! String }
    var isSelectCapable: Bool { getProperty(kTISPropertyInputSourceIsSelectCapable) as! Bool }
}
