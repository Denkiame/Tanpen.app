//
//  WindowDelegate.swift
//  Tanpen
//
//  Created by Toto Minai on 27/12/2022.
//

import AppKit

class WindowDelegate: NSObject, NSWindowDelegate {
    func configure(window: NSWindow) {
        window.backgroundColor = NSColor.textBackgroundColor
        
        window.titlebarAppearsTransparent = true
        window.titlebarSeparatorStyle = .none
        
        window.tabbingMode = .disallowed
        window.delegate = self
    }
    
    override init() {
        super.init()
        
        NotificationCenter.default.addObserver(forName: NSWindow.didChangeOcclusionStateNotification,
                                               object: nil, queue: nil) { notification in
            if let window = notification.object as? NSWindow {
                self.configure(window: window)
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
