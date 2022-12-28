//
//  Vim.swift
//  Tanpen
//
//  Created by Toto Minai on 27/12/2022.
//

import SwiftUI
import WebKit

class Vim: ObservableObject {
    enum Notification {
        static let keyDown = NSNotification.Name("VimkeyDownNotification")
    }
    
    var commands = [Character]()
    
    enum Mode {
        case normal, insert, visual
    }
    
    @Published var mode = Mode.insert
    var webView: WKWebView!
    
    func add(_ command: Character) {
        commands.append(command)
    }
    
    func enterInsertMode() {
        mode = .insert
        webView.evaluateJavaScript("changeContentEditable(true)")
        InputSource.select(with: "com.apple.inputmethod.TCIM.Zhuyin")
    }
    
    func backToNormal() {
        mode = .normal
        webView.evaluateJavaScript("changeContentEditable(false)")
        InputSource.select(with: "com.apple.keylayout.ABC")
    }
    
    enum Direction: String {
        case forward, backward
    }
    
    enum Unit: String {
        case character, line, word, paragraph
    }
    
    func move(_ direction: Direction, by unit: Unit) {
        webView.evaluateJavaScript("changeSelectionBy\(unit.rawValue.capitalized)('\(direction.rawValue)')")
    }
    
    func delete(by unit: Unit) {
        webView.evaluateJavaScript("delete\(unit.rawValue.capitalized)()")
    }
    
    func appendAfterSentence() {
        webView.evaluateJavaScript("appendSentence()")
        enterInsertMode()
    }
}

struct VimCommands: Commands {
    @Binding var mainWindow: NSWindow?
    @Binding var correspondingVim: [NSWindow : Vim]
    
    var vim: Vim? {
        if let mainWindow {
            return correspondingVim[mainWindow]
        }
        
        return nil
    }

    var body: some Commands {
        CommandMenu("Control") {
            if mainWindow == nil {
                Text("No Document Available")
            }
            
            if let vim {
                Button("Normal Mode", action: vim.backToNormal)
                    .keyboardShortcut(.escape, modifiers: [])
                Button("Insert Mode", action: vim.enterInsertMode)
                    .keyboardShortcut("i", modifiers: [])
                Button("Visual Mode") {
                    vim.mode = .visual
                }
                .keyboardShortcut("v", modifiers: [])
                
                Divider()
            }
                
            if let vim {
                Button("Next Character") {
                    vim.move(.forward, by: .character)
                }.keyboardShortcut("j", modifiers: [])
                Button("Previous Character") {
                    vim.move(.backward, by: .character)
                }.keyboardShortcut("k", modifiers: [])
                Button("Next Line") {
                    vim.move(.forward, by: .line)
                }.keyboardShortcut("h", modifiers: [])
                Button("Previous Line") {
                    vim.move(.backward, by: .line)
                }.keyboardShortcut("l", modifiers: [])
                
                Divider()
                
                Button("Delete Character") {
                    vim.delete(by: .character)
                }.keyboardShortcut("x", modifiers: [])
                
                
                Divider()
            }
            
            if let vim {
                Button("Next Word") {
                    vim.move(.forward, by: .word)
                }.keyboardShortcut("w", modifiers: [])
                Button("Previous Word") {
                    vim.move(.backward, by: .word)
                }.keyboardShortcut("b", modifiers: [])
                Button("Insert after Sentence") {
                    vim.appendAfterSentence()
                }.keyboardShortcut("a", modifiers: .shift)
            }
        }
    }
}
