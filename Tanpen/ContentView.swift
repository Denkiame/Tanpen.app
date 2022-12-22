//
//  ContentView.swift
//  Tanpen
//
//  Created by Toto Minai on 22/12/2022.
//

import SwiftUI

struct ContentView: View {
    @Binding var document: TanpenDocument

    var body: some View {
        TextEditor(text: $document.text)
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView(document: .constant(TanpenDocument()))
    }
}
