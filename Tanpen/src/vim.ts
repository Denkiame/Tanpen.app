type Mode = 'insert' | 'visual' | 'normal'
type Direction = 'forward' | 'backward'

const debug = (x: any) => {
    // @ts-ignore
    webkit.messageHandlers['debug'].postMessage(x)
}

export default class Vim {
    _mode!: Mode
    textFrame: HTMLElement
    textEditor: HTMLElement
    backdrop: HTMLElement
    selection: Selection = window.getSelection()!

    _text?: string | undefined
    set text(newValue: string) {
        if (this._text === undefined)
            this.textEditor.innerText = newValue
        this._text = newValue
        this.backdrop.innerText = newValue
        // @ts-ignore
        webkit.messageHandlers['text'].postMessage(newValue)
    }

    get mode() { return this._mode }
    set mode(newValue) {
        switch (newValue) {
        case 'normal':
            if (this.selection)
                this.moveByCharacter('backward')
            this.textEditor.contentEditable = 'false'
            this.highlight()
            break
        case 'visual':
            break
        case 'insert':
            this.textEditor.contentEditable = 'plaintext-only'
            this.removeHighlight()
            break
        }

        document.body.classList.remove(this._mode)
        document.body.classList.add(newValue)
        this._mode = newValue

        // @ts-ignore
        webkit.messageHandlers['mode'].postMessage(newValue)
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
                this.moveByWord('forward')
                break
            case 'b':
                this.moveByWord('backward')
                break
            case 'i':
                this.mode = 'insert'
                break
            case 'v':
                this.mode = 'visual'
            case 'x':
                this.deleteCharacter()
                break
            }
        }
    }

    deleteSelection() {
    }

    deleteCharacter() {
        this.removeHighlight()
        this.selection.modify('extend', 'forward', 'character')
        this.selection.deleteFromDocument()
    }

    moveByCharacter(direction: Direction, times: number=1) {
        while (times--) this.selection.modify('move', direction, 'character')
    }

    selectByCharacter(direction: Direction, times: number=1) {

    }

    moveByWord(direction: Direction, times: number=1) {
    }

    caret?: HTMLElement | null

    removeHighlight() {
        if (this.caret) {
            this.caret.outerHTML = this.caret.innerHTML
            this.caret = null
            this.backdrop.normalize()
        }
    }

    highlight() {
        // FIXME: <br /> cannot be marked
        if (this.mode !== 'normal' || !this.selection.isCollapsed) return

        this.removeHighlight()

        const range = this.selection.getRangeAt(0)
        let index = 0, node: Node | null = range.endContainer
        while (node = node.previousSibling) ++index
        const correspondingNode = this.backdrop.childNodes[index]
        
        range.setStart(correspondingNode, range.startOffset) 
        range.setEnd(correspondingNode, range.endOffset+1)
        
        this.caret = document.createElement('mark')
        range.surroundContents(this.caret)
    }

    private setupObservers() {
        document.body.onkeydown = this.add.bind(this)
        document.onselectionchange = this.highlight.bind(this)

        new MutationObserver(() =>
            this.text = this.textEditor.innerText
        ).observe(this.textEditor, { childList: true, subtree: true, characterData: true })
    }

    constructor(textFrame: HTMLElement, mode: Mode='insert') {
        this.textFrame = textFrame
        textFrame.classList.add('text-frame')
        this.textEditor = document.createElement('div')
        this.textEditor.classList.add('editor')
        this.backdrop = document.createElement('div')
        this.backdrop.classList.add('backdrop')

        this.textFrame.appendChild(this.textEditor)
        this.textFrame.appendChild(this.backdrop)

        this.mode = mode
        this.setupObservers()
    }        
}
