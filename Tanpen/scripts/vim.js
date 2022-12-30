class Vim {
    _mode;
    element;
    selection = window.getSelection();
    get text() { return this.element.innerText; }
    set text(newValue) { this.element.innerText = newValue; }
    get mode() { return this._mode; }
    set mode(newValue) {
        if (this._mode) {
            if (newValue === 'normal') {
                if (this.selection.isCollapsed) { // From INSERT mode: Caret -> Block
                    if (this.selection.focusOffset === 0)
                        this.selection.modify('move', 'forward', 'character');
                    this.selection.modify('extend', 'backward', 'character');
                    if (this.textSelected === '\n')
                        this.selection.collapseToEnd();
                }
                else { // TODO: From VISUAL mode
                }
            }
            else if (newValue === 'insert') { // From NORMAL mode: Block -> Caret
                this.selection.collapseToStart();
            }
        }
        this._mode = newValue;
        // @ts-ignore
        webkit.messageHandlers['mode'].postMessage(newValue);
        const ele = document.getElementById('mode');
        if (ele)
            ele.innerText = newValue;
    }
    get textSelected() { return this.selection.toString(); }
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
                case 'x':
                    this.deleteSelection();
                    break;
            }
        }
    }
    deleteSelection() {
        this.selection.deleteFromDocument();
        this.selection.modify('move', 'forward', 'character');
        this.selection.modify('extend', 'backward', 'character');
    }
    moveByCharacter(direction, times = 1) {
        while (times-- > 0) {
            if (this.selection.isCollapsed) // `\n` at the beginning of line
                this.selection.modify('move', 'forward', 'character'); // Normailise caret to where it should be
            else
                this.selection.collapseToEnd();
            this.selection.modify('move', direction, 'character');
            this.selection.modify('extend', 'backward', 'character');
            if (this.textSelected === '\n')
                if (this.selection.focusOffset === 1)
                    ++times; // `\n` at the end of line will be ignored
                else
                    this.selection.collapseToStart(); // Make `\n` block displayed as hairline
            else if (this.selection.isCollapsed) { // Reach beginning or ending of article
                if (direction === 'backward')
                    this.selection.modify('move', 'forward', 'character');
                this.selection.modify('extend', 'backward', 'character');
                break;
            }
        }
    }
    moveByWord(direction, times = 1) {
        this.selection.collapseToStart();
        while (times-- > 0) {
            this.selection.modify('move', direction, 'word');
        }
        this.selection.modify('move', 'forward', 'character');
        this.selection.modify('extend', 'backward', 'character');
        let lastOffset = this.selection.focusOffset;
        while (this.textSelected.match(/[\s\p{Punctuation}]/u)) {
            this.selection.collapseToEnd();
            this.selection.modify('move', 'forward', 'character');
            this.selection.modify('extend', 'backward', 'character');
            if (this.selection.focusOffset === lastOffset)
                break;
            else
                lastOffset = this.selection.focusOffset;
        }
    }
    setupObservers() {
        document.body.onkeydown = this.add.bind(this);
        document.body.onpointerdown = (event) => {
            if (this.mode === 'insert')
                return;
            // TODO: Caret -> Block when clicked
        };
        const textObserver = new MutationObserver(() => 
        // @ts-ignore
        webkit.messageHandlers['text'].postMessage(this.element.innerText));
        textObserver.observe(this.element, { childList: true, subtree: true, characterData: true });
    }
    constructor(element, mode = 'insert') {
        this.element = element;
        this.mode = mode;
        this.setupObservers();
    }
}
