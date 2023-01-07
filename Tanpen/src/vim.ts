type Mode = 'insert' | 'visual' | 'normal'
type Direction = 'forward' | 'backward'

const log = (...x: any[]) => {
    // @ts-ignore
    webkit.messageHandlers['debug'].postMessage(x)
    console.log(...x)
}

export default class Vim {
    _mode!: Mode
    textFrame: HTMLElement
    textEditor: HTMLElement
    backdrop: HTMLElement
    selection: Selection = window.getSelection()!

    // TODO: Do not send back text to WebKit at launch
    _text?: string | undefined
    set text(newValue: string) {
        if (!this._text) this.textEditor.innerText = newValue
        this._text = newValue
        this.backdrop.innerText = newValue
        // @ts-ignore
        webkit.messageHandlers['text'].postMessage(this.textEditor.innerText)

        if (this.selection.type === 'None') this.moveToEndOfFile()
        else this.highlight()
    }

    get mode() { return this._mode }
    set mode(newValue) {
        document.body.classList.remove(this._mode)
        document.body.classList.add(newValue)
        this._mode = newValue
        // @ts-ignore
        webkit.messageHandlers['mode'].postMessage(newValue)

        switch (newValue) {
        case 'normal':
            switch (this.selection.type) {
            case 'Caret':
                if (this.selection.focusNode!.nodeType === Node.ELEMENT_NODE || 
                    this.selection.focusOffset === 0) this.highlight()
                else this.moveByCharacter('backward')
                break
            }
        case 'visual':
            break
        case 'insert':
            this.removeHighlight()
            break
        }
    }

    add(event: KeyboardEvent) {
        if (this.mode === "insert") {
            switch (event.key) {
            case 'ArrowUp':
            case 'b':
                if (event.key === 'b' && !event.ctrlKey) break
                event.preventDefault()
                this.selection.modify(event.shiftKey ? 'extend' : 'move', 
                                      'backward', 
                                      event.altKey ? 'word' : 'character')
                break
            case 'ArrowDown':
            case 'f':
                if (event.key === 'f' && !event.ctrlKey) break
                event.preventDefault()
                this.selection.modify(event.shiftKey ? 'extend' : 'move', 
                                      'forward', 
                                      event.altKey ? 'word' : 'character')
                break
            case 'ArrowLeft':
            case 'ArrowRight':
                event.preventDefault()
                break
            case 'Escape':
                event.preventDefault()
                this.mode = 'normal'
                break

            }
        } else {
            if (!event.altKey && !event.metaKey && !event.ctrlKey)
                event.preventDefault()
            switch (event.key) {
            case 'j':
                this.moveByCharacter('forward')
                break
            case 'k':
                this.moveByCharacter('backward')
                break
            case 'w':
                this.moveForwardBySentence()
                break
            case 'b':
                this.moveToSentence(true)
                break
            case 'e':
                this.moveToSentence()
                break
            case 'i':
                this.mode = 'insert'
                break
            case 'v':
                this.mode = 'visual'
            case 'x':
                this.deleteCharacter()
                break
            case 'p':
                this.insertCharacter()
                break
            case '$':
                this.moveToLineEnd()
                break
            case 'A':
                this.editAtLineEnd()
                break
            }
        }
    }

    deletionStore?: string | null
    
    // FIXME: Error when deleting line with one single character
    deleteCharacter() {
        if (!this.selection.focusNode) return

        let caretNode = this.selection.focusNode!
        let caretOffset = this.selection.focusOffset

        if (caretNode.nodeType === Node.TEXT_NODE) {
            const range = document.createRange()
            range.setStart(caretNode, caretOffset)
            range.setEnd(caretNode, caretOffset+1)
            this.deletionStore = range.toString()
            range.deleteContents()
            if (this.selection.focusNode!.textContent!.length === range.startOffset)
                this.moveByCharacter('backward')
        } else {
            if (caretNode.hasChildNodes())
                caretNode = caretNode.childNodes[caretOffset]
            if (caretNode.nextSibling) {
                if (caretNode.nextSibling.nodeType === Node.ELEMENT_NODE)
                    this.selection.setPosition(this.textEditor, caretOffset)
                else
                    this.selection.setPosition(caretNode.nextSibling, 0)
                this.deletionStore = '\n'
                this.textEditor.removeChild(caretNode)
            }        
        }
    }

    insertCharacter() {
        if (!this.selection.focusNode || !this.deletionStore) return
        const range = this.selection.getRangeAt(0)

        let caretNode = this.selection.focusNode!
        const caretOffset = this.selection.focusOffset

        if (this.deletionStore === '\n') {
            if (caretNode.hasChildNodes())
                caretNode = caretNode.childNodes[caretOffset]
            if (caretNode.nextSibling) {
                this.textEditor.insertBefore(document.createElement('br'), caretNode.nextSibling)
            } else this.textEditor.appendChild(document.createElement('br'))

            this.moveToLineEnd()
            this.moveByCharacter('forward')
        } else {
            if (caretNode.hasChildNodes())
                caretNode = caretNode.childNodes[caretOffset]
            let textNode = document.createTextNode(this.deletionStore)
            if (caretNode.nodeType === Node.ELEMENT_NODE) {
                this.textEditor.replaceChild(textNode, caretNode)
                this.selection.setPosition(textNode, 0)
            } else {
                range.setStart(caretNode, caretOffset+1)
                range.insertNode(textNode)
                this.textEditor.normalize()
                this.moveByCharacter('forward')
            }
        }
    }

    moveByCharacter(direction: Direction, times: number=1) {
        let caretNode = this.selection.focusNode!
        let caretOffset = this.selection.focusOffset

        while (times) {
            let length: number 
            if (caretNode.nodeType === Node.TEXT_NODE)
                length = caretNode.textContent!.length
            else {  // <br />
                if (caretNode.hasChildNodes())
                    caretNode = caretNode.childNodes[caretOffset]
                length = 1
                caretOffset = 0
            }

            if (direction === 'forward')
                if (times > length-1 - caretOffset) {
                    times -= length-1 - caretOffset
                    if (!caretNode.nextSibling) {
                        caretOffset = length-1
                        break 
                    } else {
                        --times
                        caretOffset = 0
                        if (caretNode.nodeType === Node.TEXT_NODE) {
                            if (caretNode.nextSibling.nextSibling)
                                caretNode = caretNode.nextSibling.nextSibling
                        } else caretNode = caretNode.nextSibling
                    }
                } else {
                    caretOffset += times
                    times = 0
                }
            else if (direction === 'backward') {
                if (times > caretOffset) {
                    times -= caretOffset
                    if (!caretNode.previousSibling) {
                        caretOffset = 0
                        break
                    } else {
                        --times
                        if (caretNode.previousSibling.nodeType === Node.ELEMENT_NODE &&
                            caretNode.previousSibling.previousSibling &&
                            caretNode.previousSibling.previousSibling.nodeType === Node.TEXT_NODE)
                            caretNode = caretNode.previousSibling.previousSibling
                        else caretNode = caretNode.previousSibling
                        if (caretNode.nodeType === Node.TEXT_NODE)
                            caretOffset = caretNode.textContent!.length-1
                    }
                } else {
                    caretOffset -= times
                    times = 0
                }
            }
        }

        if (caretNode.nodeType === Node.TEXT_NODE)
            this.selection.setPosition(caretNode, caretOffset)
        else {
            let index = 0, node: Node | null = caretNode
            while (node = node.previousSibling) ++index
            this.selection.setPosition(this.textEditor, index)
        }        
    }

    moveForwardBySentence(times: number=1) {
        while (times--) {
            const textContent = this.selection.focusNode!.textContent!
            let textSliced = textContent.slice(this.selection.focusOffset)
            let index = 0
            let matched = textSliced.match(/\p{Punctuation}/u)
            if (matched) {
                index += matched.index!
                textSliced = textSliced.slice(index)
                matched = textSliced.match(/[^\p{Punctuation}]/u)

                if (matched) {
                    index += matched.index!

                    const range = this.selection.getRangeAt(0)
                    range.setStart(range.startContainer, range.startOffset + index)

                    this.selection.removeAllRanges()
                    this.selection.addRange(range)
                }
            }
        }
    }

    moveToSentence(toStart: boolean=false, times: number=1) {
        while (times--) {
            const textContent = this.selection.focusNode!.textContent!
            let textSliced = textContent.slice(0, this.selection.focusOffset)
        }
    }

    moveToLineEnd() {
        if (!this.selection.focusNode) return
        const caretNode = this.selection.focusNode!

        if (caretNode.nodeType === Node.TEXT_NODE)
            this.selection.setPosition(caretNode, caretNode.textContent!.length-1)
    }

    editAtLineEnd() {
        if (!this.selection.focusNode) return
        const caretNode = this.selection.focusNode!

        this.mode = 'insert'
        
        if (caretNode.nodeType === Node.TEXT_NODE)
            this.selection.setPosition(caretNode, caretNode.textContent!.length)
    }

    moveToEndOfFile() {
        if (this.textEditor.hasChildNodes()) {
            let caretNode = this.textEditor.lastChild!
            
            if (caretNode.nodeType === Node.TEXT_NODE)
                this.selection.setPosition(caretNode, caretNode.textContent!.length-1)
            else if (caretNode.previousSibling && caretNode.previousSibling.nodeType === Node.TEXT_NODE) {
                caretNode = caretNode.previousSibling
                this.selection.setPosition(caretNode, caretNode.textContent!.length-1)
            } else
                this.selection.setPosition(this.textEditor, this.textEditor.childNodes.length-1)
        }
    }


    private removeHighlight() {
        const caret = document.querySelector('mark')
        if (caret) {
            caret.outerHTML = caret.classList.contains('newline') ? '<br />' : caret.innerHTML
            this.backdrop.normalize()
        }
    }

    // High next character from the current caret
    private highlight() {
        if (this.mode !== 'normal' || !this.selection.isCollapsed) return

        this.removeHighlight()

        let caretNode = this.selection.focusNode!
        let caretOffset = this.selection.focusOffset

        if (caretNode.nodeType === Node.TEXT_NODE) {
            let index = 0, node: Node | null = caretNode
            while (node = node.previousSibling) ++index
            const targetNode = this.backdrop.childNodes[index]
            
            const range = document.createRange()
            range.setStart(targetNode, caretOffset) 
            range.setEnd(targetNode, caretOffset+1)
            
            const caret = document.createElement('mark')
            range.surroundContents(caret)
        } else {
            const caret = document.createElement('mark')
            caret.innerHTML = '　<br />'
            caret.classList.add('newline')

            this.backdrop.replaceChild(caret, this.backdrop.childNodes[caretOffset])
        }
    }

    public setupObservers() {
        new MutationObserver(() =>
            this.text = this.textEditor.innerText
        ).observe(this.textEditor, { childList: true, subtree: true, characterData: true })

        document.body.onkeydown = this.add.bind(this)
        document.onselectionchange = this.highlight.bind(this)
    }

    constructor(textFrame: HTMLElement, mode: Mode='insert') {
        this.textFrame = textFrame
        textFrame.classList.add('text-frame')
        this.textEditor = document.createElement('div')
        this.textEditor.classList.add('editor')
        this.textEditor.contentEditable = 'plaintext-only'
        this.backdrop = document.createElement('div')
        this.backdrop.classList.add('backdrop')

        this.textFrame.appendChild(this.textEditor)
        this.textFrame.appendChild(this.backdrop)

        this.mode = mode
    }        
}

