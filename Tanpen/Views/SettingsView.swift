//
//  SettingsView.swift
//  Tanpen
//
//  Created by Toto Minai on 04/01/2023.
//

import SwiftUI

struct SettingsView: View {
    @AppStorage("insertInputMethodID") private var insertInputMethodID = "com.apple.inputmethod.TCIM.Zhuyin"
    @AppStorage("controlInputMethodID") private var controlInputMethodID = "com.apple.keylayout.ABC"
    
    var body: some View {
        TabView {
            Form {
                Section("Input Source") {
                    Picker("Control", selection: $controlInputMethodID) {
                        ForEach(InputSource.sources.filter {
                            ($0.type == "TISTypeKeyboardInputMode" ||
                             $0.type == "TISTypeKeyboardLayout") &&
                            $0.languages.contains("en")
                        }) { source in
                            Text(source.localizedName)
                                .id(source.id)
                        }
                    }
                    
                    Picker("Writing", selection: $insertInputMethodID) {
                        ForEach(InputSource.sources.filter {
                            $0.type == "TISTypeKeyboardInputMode" ||
                            $0.type == "TISTypeKeyboardLayout" }) { source in
                                Text(source.localizedName)
                                    .id(source.id)
                            }
                    }
                }
            }
            .tabItem { Label("General", systemImage: "gearshape") }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}
