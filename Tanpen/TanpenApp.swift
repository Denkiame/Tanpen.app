//
//  TanpenApp.swift
//  Tanpen
//
//  Created by Toto Minai on 22/12/2022.
//

import SwiftUI

@main
struct TanpenApp: App {
    @StateObject private var windowManager = WindowManager()
    
    var body: some Scene {
        DocumentGroup(newDocument: TanpenDocument()) { file in
            ContentView(document: file.$document)
                .environmentObject(windowManager)
                .frame(minWidth: 342, minHeight: 330.67 - Metrics.titlebarHeight)
        }
        .commands {
            VimCommands(mainWindow: $windowManager.mainWindow,
                        correspondingVim: $windowManager.correspondingVim)
        }
        
        Settings {
            Text("Help")
        }
    }
}
