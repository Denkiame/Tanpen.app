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
        
        Settings {
            TabView {
                Text("General")
                    .tabItem {
                        Label("General", systemImage: "gearshape")
                    }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
        }
    }
}