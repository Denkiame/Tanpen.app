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
                Section {
                    Picker("Control with:", selection: $controlInputMethodID) {
                        ForEach(InputSource.sources.filter {
                            ($0.type == "TISTypeKeyboardInputMode" ||
                             $0.type == "TISTypeKeyboardLayout") &&
                            $0.languages.contains("en")
                        }) { source in
                            Text(source.localizedName)
                                .id(source.id)
                        }
                    }
                    
                    Picker("Write in:", selection: $insertInputMethodID) {
                        ForEach(InputSource.sources.filter {
                            $0.type == "TISTypeKeyboardInputMode" ||
                            $0.type == "TISTypeKeyboardLayout" }) { source in
                                Text(source.localizedName)
                                    .id(source.id)
                            }
                    }
                }
            }
            .padding()
            .tabItem { Label("General", systemImage: "gearshape") }
            
            Form {
            }
            .padding()
            .tabItem { Label("Forward", systemImage: "arrowshape.turn.up.forward") }
            
            Form {
            }
            .padding()
            .tabItem { Label("Style", systemImage: "fleuron.fill") }
            
        }
        .frame(width: 312)
        .background(EffectView(.windowBackground, blendingMode: .behindWindow))
    }
}
