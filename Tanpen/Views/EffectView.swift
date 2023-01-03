//
//  EffectView.swift
//  Tanpen
//
//  Created by Toto Minai on 27/12/2022.
//

import SwiftUI

struct EffectView: NSViewRepresentable {
    let material: NSVisualEffectView.Material
    let blendingMode: NSVisualEffectView.BlendingMode
    let followsWindowActiveState: Bool
    
    func makeNSView(context: Context) -> NSVisualEffectView {
        let view = NSVisualEffectView()
        view.material = material
        view.blendingMode = blendingMode
        view.state = followsWindowActiveState ? .followsWindowActiveState : .active
        
        return view
    }
    
    init(_ material: NSVisualEffectView.Material,
         blendingMode: NSVisualEffectView.BlendingMode, followsWindowActiveState: Bool = true) {
        self.material = material
        self.blendingMode = blendingMode
        self.followsWindowActiveState = followsWindowActiveState
    }
    
    func updateNSView(_ view: NSVisualEffectView, context: Context) { }
}

