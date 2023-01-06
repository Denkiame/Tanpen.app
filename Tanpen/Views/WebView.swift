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
    let callback: (WKWebView) -> Void
    
    func makeCoordinator() -> Coordinator { Coordinator(text: $text, callback: callback) }
    
    func makeNSView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        config.setValue(false, forKey: "drawsBackground")
        config.userContentController.add(context.coordinator, name: "text")
        config.userContentController.add(context.coordinator, name: "mode")
        config.userContentController.add(context.coordinator, name: "debug")
        
        let webView = WKWebView(frame: .zero, configuration: config)
        webView.navigationDelegate = context.coordinator
        
        let documentURL = Bundle.main.url(forResource: "pages/document", withExtension: "html")!
        webView.loadFileURL(documentURL, allowingReadAccessTo: documentURL)
        
        return webView
    }
    
    func updateNSView(_ webView: WKWebView, context: Context) { }
    
    init(text: Binding<String>, callback: @escaping (WKWebView) -> Void) {
        _text = text
        self.callback = callback
    }
    
    class Coordinator: NSObject, WKScriptMessageHandler, WKNavigationDelegate {
        @AppStorage("insertInputMethodID") private var insertInputMethodID = "com.apple.inputmethod.TCIM.Zhuyin"
        @AppStorage("controlInputMethodID") private var controlInputMethodID = "com.apple.keylayout.ABC"
        @Binding var text: String
        
        let callback: (WKWebView) -> Void
        
        func userContentController(_ userContentController: WKUserContentController,
                                   didReceive message: WKScriptMessage) {
            switch message.name {
            case "text":
                text = message.body as! String
                break
            case "mode":
                let mode = message.body as! String
                InputSource.select(with: mode == "insert" ?
                                   insertInputMethodID :
                                    controlInputMethodID)
                break
            default:
                (message.body as! [Any]).forEach { print($0, terminator: " ") }
                print()
                break
            }
        }
        
        func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
            webView.evaluateJavaScript("vim.text = `\(text)`")
            webView.evaluateJavaScript("vim.setupObservers()")
            callback(webView)
        }
        
        init(text: Binding<String>, callback: @escaping (WKWebView) -> Void) {
            _text = text
            self.callback = callback
        }
    }
}
