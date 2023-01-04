'use strict';

class Vim {
    _mode;
    textFrame;
    textEditor;
    backdrop;
    selection = window.getSelection();
    _text;
    set text(newValue) {
        if (this._text === undefined)
            this.textEditor.innerText = newValue;
        this._text = newValue;
        this.backdrop.innerText = newValue;
        webkit.messageHandlers['text'].postMessage(newValue);
    }
    get mode() { return this._mode; }
    set mode(newValue) {
        document.body.classList.remove(this._mode);
        document.body.classList.add(newValue);
        this._mode = newValue;
        webkit.messageHandlers['mode'].postMessage(newValue);
        switch (newValue) {
            case 'normal':
                this.textEditor.contentEditable = 'false';
                if (this.selection)
                    if (this.selection.focusOffset === 0)
                        this.highlight();
                    else
                        this.moveByCharacter('backward');
                break;
            case 'visual':
                break;
            case 'insert':
                this.textEditor.contentEditable = 'plaintext-only';
                this.removeHighlight();
                break;
        }
    }
    add(event) {
        if (this.mode === "insert") {
            switch (event.key) {
                case 'ArrowUp':
                case 'b':
                    if (event.key === 'b' && !event.ctrlKey)
                        break;
                    event.preventDefault();
                    this.selection.modify(event.shiftKey ? 'extend' : 'move', 'backward', event.altKey ? 'word' : 'character');
                    break;
                case 'ArrowDown':
                case 'f':
                    if (event.key === 'f' && !event.ctrlKey)
                        break;
                    event.preventDefault();
                    this.selection.modify(event.shiftKey ? 'extend' : 'move', 'forward', event.altKey ? 'word' : 'character');
                    break;
                case 'ArrowLeft':
                case 'ArrowRight':
                    event.preventDefault();
                    break;
                case 'Escape':
                    event.preventDefault();
                    this.mode = 'normal';
                    break;
            }
        }
        else {
            if (!event.altKey && !event.metaKey && !event.ctrlKey)
                event.preventDefault();
            switch (event.key) {
                case 'j':
                    this.moveByCharacter('forward');
                    break;
                case 'k':
                    this.moveByCharacter('backward');
                    break;
                case 'w':
                    this.moveByWord('forward');
                    break;
                case 'b':
                    this.moveByWord('backward');
                    break;
                case 'i':
                    this.mode = 'insert';
                    break;
                case 'v':
                    this.mode = 'visual';
                case 'x':
                    this.deleteCharacter();
                    break;
            }
        }
    }
    deleteSelection() {
    }
    deleteCharacter() {
        this.removeHighlight();
        this.selection.modify('extend', 'forward', 'character');
        this.selection.deleteFromDocument();
    }
    moveByCharacter(direction, times = 1) {
        while (times--) {
            this.selection.modify('move', direction, 'character');
            const range = this.selection.getRangeAt(0);
            if (range.endContainer.textContent.length === range.endOffset)
                ++times;
        }
    }
    selectByCharacter(direction, times = 1) {
    }
    moveByWord(direction, times = 1) {
    }
    caret;
    removeHighlight() {
        if (this.caret) {
            this.caret.outerHTML = this.caret.classList.contains('newline') ? '<br />' : this.caret.innerHTML;
            this.caret = null;
            this.backdrop.normalize();
        }
    }
    highlight() {
        if (this.mode !== 'normal' || !this.selection.isCollapsed)
            return;
        console.log(this.selection);
        this.removeHighlight();
        const range = this.selection.getRangeAt(0);
        if (range.endContainer.textContent.length === range.endOffset)
            return;
        console.log(range);
        if (range.endContainer === this.textEditor) {
            this.caret = document.createElement('mark');
            this.caret.innerHTML = '　<br />';
            this.caret.classList.add('newline');
            this.backdrop.replaceChild(this.caret, this.backdrop.childNodes[range.endOffset]);
            return;
        }
        let index = 0, node = range.endContainer;
        while (node = node.previousSibling)
            ++index;
        const correspondingNode = this.backdrop.childNodes[index];
        range.setStart(correspondingNode, range.startOffset);
        range.setEnd(correspondingNode, range.endOffset + 1);
        this.caret = document.createElement('mark');
        range.surroundContents(this.caret);
    }
    setupObservers() {
        document.body.onkeydown = this.add.bind(this);
        document.onselectionchange = this.highlight.bind(this);
        new MutationObserver(() => this.text = this.textEditor.innerText).observe(this.textEditor, { childList: true, subtree: true, characterData: true });
    }
    constructor(textFrame, mode = 'insert') {
        this.textFrame = textFrame;
        textFrame.classList.add('text-frame');
        this.textEditor = document.createElement('div');
        this.textEditor.classList.add('editor');
        this.backdrop = document.createElement('div');
        this.backdrop.classList.add('backdrop');
        this.textFrame.appendChild(this.textEditor);
        this.textFrame.appendChild(this.backdrop);
        this.mode = mode;
        this.setupObservers();
    }
}

const vim = new Vim(document.querySelector('main'));
vim.mode = 'normal';
