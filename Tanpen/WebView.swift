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
    
    func makeCoordinator() -> Coordinator { Coordinator(text: $text) }
    
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
    
    class Coordinator: NSObject, WKScriptMessageHandler, WKNavigationDelegate {
        @Binding var text: String
        
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
                print(message.name, message.body)
                break
            }
        }
        
        func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
            webView.evaluateJavaScript("vim.text = `\(text)`")
        }
        
        init(text: Binding<String>) { _text = text }
    }
}
