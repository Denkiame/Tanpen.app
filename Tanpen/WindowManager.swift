//
//  WindowManager.swift
//  Tanpen
//
//  Created by Toto Minai on 27/12/2022.
//

import AppKit

class WindowManager: NSObject, ObservableObject {
    @Published var mainWindow: NSWindow?
    private var windows = Set<NSWindow>()
    @Published var correspondingVim = [NSWindow : Vim]()
    
    override init() {
        super.init()
        
        NotificationCenter.default.addObserver(forName: NSWindow.didChangeOcclusionStateNotification,
                                               object: nil, queue: nil) { notification in
            if let window = notification.object as? NSWindow,
               !self.windows.contains(window) {
                self.configure(window: window)
                self.windows.insert(window)
            }
        }
    }
}

extension WindowManager: NSWindowDelegate {
    func windowDidBecomeMain(_ notification: Notification) {
        if let window = notification.object as? NSWindow {
            mainWindow = window
        }
    }
    
    func windowDidResignMain(_ notification: Notification) {
        if let window = notification.object as? NSWindow,
            mainWindow == window {
            mainWindow = nil
        }
    }
    
    func windowWillClose(_ notification: Notification) {
        if let window = notification.object as? NSWindow {
            correspondingVim.removeValue(forKey: window)
        }
    }
}

extension WindowManager {
    func configure(window: NSWindow) {
        window.backgroundColor = NSColor.textBackgroundColor
        
        window.titlebarAppearsTransparent = true
        window.titlebarSeparatorStyle = .none
        
        window.tabbingMode = .disallowed
        window.delegate = self
        
        if window.isMainWindow {
            mainWindow = window
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
