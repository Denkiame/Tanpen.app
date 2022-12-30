class Vim {
    _mode;
    element;
    selection = window.getSelection();
    get text() { return this.element.innerText; }
    set text(newValue) { this.element.innerText = newValue; }
    get mode() { return this._mode; }
    set mode(newValue) {
        this._mode = newValue;
        this.element.contentEditable = newValue === 'insert' ?
            'plaintext-only' :
            'false';
        if (newValue === 'insert')
            document.body.removeEventListener('keydown', this.add.bind(this));
        else
            document.body.addEventListener('keydown', this.add.bind(this));
    }
    get textSelected() { return this.selection.toString(); }
    add(event) {
        switch (event.key) {
            case 'j':
                this.modify('forward', 'character');
                break;
            case 'k':
                this.modify('backward', 'character');
                break;
        }
    }
    modify(direction, unit, times = 1) {
        this.selection.collapseToStart();
        for (let i = times; i > 0; --i) {
            this.selection.modify('move', direction, unit);
        }
        this.selection.modify('extend', 'forward', unit);
    }
    constructor(element, mode = 'normal') {
        this.element = element;
        this.mode = mode;
    }
}
