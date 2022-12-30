//
//  InputSource.swift
//  Tanpen
//
//  Created by Toto Minai on 27/12/2022.
//

import InputMethodKit

class InputSource {
    static var sources: [TISInputSource] {
        TISCreateInputSourceList(nil, false).takeRetainedValue() as! [TISInputSource]
    }

    static func select(with id: String) {
        TISSelectInputSource(sources.first { $0.id == id })
    }
}

extension TISInputSource {
    private func getProperty(_ key: CFString) -> AnyObject {
        return Unmanaged<AnyObject>
            .fromOpaque(TISGetInputSourceProperty(self, key))
            .takeUnretainedValue()
    }

    var id: String { getProperty(kTISPropertyInputSourceID) as! String }
    var localizedName: String { getProperty(kTISPropertyLocalizedName) as! String }
    var isSelectCapable: Bool { getProperty(kTISPropertyInputSourceIsSelectCapable) as! Bool }
}

// TODO: Make them user's settings
let insertInputMethodID = "com.apple.inputmethod.TCIM.Zhuyin"
let controlInputMethodID = "com.apple.keylayout.ABC"
