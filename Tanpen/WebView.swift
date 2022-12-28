//
//  WebView.swift
//  Tanpen
//
//  Created by Toto Minai on 28/12/2022.
//

import SwiftUI
import WebKit

struct WebView: NSViewRepresentable {
    @Binding var text: String
    @Binding var window: NSWindow?
    let passThrough: (WKWebView) -> Void
    
    func makeCoordinator() -> Coordinator { Coordinator(text: $text, in: $window) }
    
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
        
        passThrough(webView)
        
        return webView
    }
    
    func updateNSView(_ webView: WKWebView, context: Context) { }
    
    init(text: Binding<String>, in window: Binding<NSWindow?>,
         _ passThrough: @escaping (WKWebView) -> Void) {
        _text = text
        _window = window
        self.passThrough = passThrough
    }
    
    class Coordinator: NSObject, WKScriptMessageHandler, WKNavigationDelegate {
        @Binding var text: String
        @Binding var window: NSWindow?
        
        var html: String {
            text.split(separator: "\n", omittingEmptySubsequences: false)
                .map { "<p>\($0 == "" ? "<br />" : $0)</p>" }
                .joined()
        }
        
        func userContentController(_ userContentController: WKUserContentController,
                                   didReceive message: WKScriptMessage) {
            text = message.body as! String
        }
        
        func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
            webView.evaluateJavaScript("loadFromFile('\(html)')")
            window = webView.window
        }
        
        init(text: Binding<String>, in window: Binding<NSWindow?>) {
            _text = text
            _window = window
        }
    }
}
