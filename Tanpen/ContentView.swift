//
//  ContentView.swift
//  Tanpen
//
//  Created by Toto Minai on 22/12/2022.
//

import SwiftUI
import WebKit

enum Metrics {
    static let titlebarHeight: CGFloat = 28
    static let horizontalPadding: CGFloat = 9
}

enum Mode {
    case normal, insert
}

struct ContentView: View {
    @Binding var document: TanpenDocument
    @State private var window: NSWindow!
    @State private var isAutosavePanelOpen = false
    @State private var entersFullscreen = false
    @State private var hoversTitlebar = false
    
    @State private var showsSharingServicesPicker = false
    
    @State private var mode = Mode.insert
    
    var body: some View {
        ZStack {
            VStack(spacing: 0) {
                WebView(text: $document.text, mode: $mode)
                    .mask {
                        HStack(spacing: 0) {
                            LinearGradient(colors: [.black.opacity(0), .black], startPoint: .leading, endPoint: .trailing)
                                .frame(width: 28)
                            Rectangle()
                            LinearGradient(colors: [.black.opacity(0), .black], startPoint: .trailing, endPoint: .leading)
                                .frame(width: 28)
                        }
                    }
                    .overlay(alignment: .bottomLeading) {
                        Text(mode == .insert ? "" : "<~>")
                            .font(.system(.body).monospaced())
                            .padding(.horizontal, Metrics.horizontalPadding)
                            .foregroundColor(.secondary)
                            .frame(height: Metrics.titlebarHeight)
                    }
            }
            .padding(.top, entersFullscreen ? Metrics.titlebarHeight : 0)
        }
        .onReceive(NotificationCenter.default.publisher(for: NSWindow.didBecomeKeyNotification)) { notification in
            if window != nil { return }
            if let window = notification.object as? NSWindow {
                self.window = window
                window.titlebarAppearsTransparent = true
                window.tabbingMode = .disallowed
                window.backgroundColor = NSColor.controlBackgroundColor
                NSEvent.addLocalMonitorForEvents(matching: .mouseMoved) { event in
                    hoversTitlebar = (window.frame.maxY - NSEvent.mouseLocation.y <= Metrics.titlebarHeight &&
                        window.frame.maxY - NSEvent.mouseLocation.y >= 0 &&
                        window.frame.minX <= NSEvent.mouseLocation.x &&
                        window.frame.maxX >= NSEvent.mouseLocation.x)
                    
                    return event
                }
                window.showsTitlebar(false)
            }
        }
        .onReceive(NotificationCenter.default.publisher(for: NSPopover.didShowNotification)) { notif in
            let popover = notif.object as! NSPopover
            if let button = popover.delegate as? NSButton,
               button.className == "NSThemeAutosaveButton" {
                isAutosavePanelOpen = true
            }
        }
        .onReceive(NotificationCenter.default.publisher(for: NSPopover.didCloseNotification)) { notif in
            let popover = notif.object as! NSPopover
            if let button = popover.delegate as? NSButton,
               button.className == "NSThemeAutosaveButton" {
                isAutosavePanelOpen = false
            }
        }
        .onReceive(NotificationCenter.default.publisher(for: NSWindow.didEnterFullScreenNotification)) { _ in
            entersFullscreen = true
        }
        .onReceive(NotificationCenter.default.publisher(for: NSWindow.didExitFullScreenNotification)) { _ in
            entersFullscreen = false
        }
        .onChange(of: hoversTitlebar || isAutosavePanelOpen || entersFullscreen) { window.showsTitlebar($0) }
    }
}

extension NSWindow {
    func showsTitlebar(_ value: Bool) {
        if let superview = standardWindowButton(.closeButton)?.superview {
            superview.animator().alphaValue = value ? 1 : 0
            titlebarSeparatorStyle = value ? .automatic : .none
        }
    }
}

struct WebView: NSViewRepresentable {
    @Binding var text: String
    @Binding var mode: Mode
    
    
    func makeCoordinator() -> Coordinator { Coordinator(text: $text, mode: $mode) }
    
    func makeNSView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        config.setValue(false, forKey: "drawsBackground")
        config.userContentController.add(context.coordinator, name: "bridge")
        
        let scriptURL = Bundle.main.url(forResource: "communicate", withExtension: "js")!
        if let source = try? String(contentsOf: scriptURL) {
            let script = WKUserScript(source: source, injectionTime: .atDocumentEnd, forMainFrameOnly: true)
            config.userContentController.addUserScript(script)
        }
        
        let webView = WKWebView(frame: .zero, configuration: config)
        webView.navigationDelegate = context.coordinator
        
        let documentURL = Bundle.main.url(forResource: "document", withExtension: "html")!
        webView.loadFileURL(documentURL, allowingReadAccessTo: documentURL)
        
        context.coordinator.webView = webView
        context.coordinator.setupMonitor()
        
        return webView
    }
    
    func updateNSView(_ webView: WKWebView, context: Context) { }
    
    class Coordinator: NSObject, WKScriptMessageHandler, WKNavigationDelegate {
        @Binding var mode: Mode
        @Binding var text: String
        var webView: WKWebView!
        
        var lastTimeStamp: TimeInterval?
        
        var html: String {
            text.split(separator: "\n", omittingEmptySubsequences: false).map { "<p>\($0 == "" ? "<br />" : $0)</p>" }.joined()
        }
        
        private func vim(with key: Character) {
            switch (key) {
            case "\u{1B}":
                webView.evaluateJavaScript("changeContentEditable(false)")
                mode = .normal
                break
            case "i":
                DispatchQueue.main.async {
                    self.webView.evaluateJavaScript("changeContentEditable(true)")
                    self.mode = .insert
                }
                break
            case "j":  // TODO: Side cases, beginning and ending
                if mode != .normal { break }
                webView.evaluateJavaScript("changeSelectionByCharacter('forward')")
                break
            case "k":
                if mode != .normal { break }
                webView.evaluateJavaScript("changeSelectionByCharacter('backward')")
                break
            case "h":
                if mode != .normal { break }
                webView.evaluateJavaScript("changeSelectionByLine('forward')")
                break
            case "l":
                if mode != .normal { break }
                webView.evaluateJavaScript("changeSelectionByLine('backward')")
                break
            default: break
            }
        }
        
        func setupMonitor() {
            NSEvent.addLocalMonitorForEvents(matching: .keyDown) { event in
                if let characters = event.characters,
                   let ch = characters.first {
                    if event.timestamp == self.lastTimeStamp { return event }
                    
                    self.lastTimeStamp = event.timestamp
                    self.vim(with: ch)
                }

                return event
            }
        }
        
        
        func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
            text = message.body as! String
        }
        
        func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
            webView.evaluateJavaScript("loadFromFile('\(html)')")
        }
        
        init(text: Binding<String>, mode: Binding<Mode>) {
            self._text = text
            self._mode = mode
        }
    }
}

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
