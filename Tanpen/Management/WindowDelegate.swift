//
//  WindowDelegate.swift
//  Tanpen
//
//  Created by Toto Minai on 27/12/2022.
//

import AppKit

class WindowDelegate: NSObject, NSWindowDelegate {
    func configure(window: NSWindow) {
        window.titlebarAppearsTransparent = true
        window.titlebarSeparatorStyle = .none
        window.standardWindowButton(.zoomButton)?.isHidden = true
        window.standardWindowButton(.miniaturizeButton)?.isHidden = true
        window.styleMask.remove([ .miniaturizable, .fullScreen ])
        DispatchQueue.main.asyncAfter(deadline: .now()+1.2) { window.showsTitlebar(false) }
        
        window.backgroundColor = NSColor(white: 1, alpha: 1e-3)
        
        window.tabbingMode = .disallowed
//        window.delegate = self
    }
    
    override init() {
        super.init()
        
        NotificationCenter.default.addObserver(forName: NSWindow.didChangeOcclusionStateNotification,
                                               object: nil, queue: nil) { notification in
            if let window = notification.object as? NSWindow,
               window.className != "NSMenuWindowManagerWindow" {
                if (window.frameAutosaveName == "com_apple_SwiftUI_Settings_window") {
                    window.standardWindowButton(.zoomButton)?.isHidden = true
                    window.standardWindowButton(.miniaturizeButton)?.isHidden = true
                    window.backgroundColor = NSColor.windowBackgroundColor
                } else { self.configure(window: window) }
            }
        }
    }
}

extension NSWindow {
    func showsTitlebar(_ value: Bool) {
        if let superview = standardWindowButton(.closeButton)?.superview {
            superview.animator().alphaValue = value ? 1 : 0
        }
    }
}
