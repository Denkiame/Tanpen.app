//
//  TanpenApp.swift
//  Tanpen
//
//  Created by Toto Minai on 22/12/2022.
//

import SwiftUI

@main
struct TanpenApp: App {
    let windowDelegate = WindowDelegate()
    
    var body: some Scene {
        DocumentGroup(newDocument: TanpenDocument()) { file in
            ContentView(document: file.$document)
                .frame(minWidth: 342, minHeight: 330.67 - Metrics.titlebarHeight)
        }
        .commands {
            CommandMenu("Forward") {
                ForEach(NSSharingService.sharingServices(forItems: [""]), id: \.title) { item in
                    Button(item.title) {
                        NotificationCenter.default.post(name: NSNotification.Name("shareText"), object: item)
                    }
                }
            }
        }
        
        Settings { SettingsView() }
    }
}

