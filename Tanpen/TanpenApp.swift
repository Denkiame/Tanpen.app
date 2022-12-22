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
        }
    }
}

class AppDelegate: NSObject, NSApplicationDelegate {
    func applicationDidFinishLaunching(_ notification: Notification) {
    }
}
