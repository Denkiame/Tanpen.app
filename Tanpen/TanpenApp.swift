//
//  TanpenApp.swift
//  Tanpen
//
//  Created by Toto Minai on 22/12/2022.
//

import SwiftUI

@main
struct TanpenApp: App {
    var body: some Scene {
        DocumentGroup(newDocument: TanpenDocument()) { file in
            ContentView(document: file.$document)
        }
    }
}
