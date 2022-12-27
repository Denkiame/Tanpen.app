var isContentEditable = true;
document.body.addEventListener('input', function () {
    // @ts-ignore
    webkit.messageHandlers.bridge.postMessage(document.body.innerText);
});
document.body.addEventListener('paste', function (event) {
    event.preventDefault();
    if (!event.clipboardData)
        return;
    var text = event.clipboardData.getData('text/plain');
    window.document.execCommand('insertText', false, text);
});
document.body.onpointerup = function () {
    if (isContentEditable) {
        return;
    }
    var selection = window.getSelection();
    if (!selection)
        return;
    if (selection.isCollapsed)
        selection.modify('extend', 'forward', 'character');
};
var loadFromFile = function (html) {
    document.body.innerHTML = html;
};
var changeContentEditable = function (editable) {
    isContentEditable = editable;
    document.body.contentEditable = editable ? 'true' : 'false';
    var selection = window.getSelection();
    if (!selection)
        return;
    if (editable)
        selection.collapseToStart();
    else if (selection.isCollapsed)
        selection.modify('extend', selection.anchorOffset === 0 ?
            'forward' :
            'backward', 'character');
};
var changeSelectionByCharacter = function (direction, repeat) {
    if (repeat === void 0) { repeat = 1; }
    var selection = window.getSelection();
    if (!selection)
        return;
    if (direction === 'forward') {
        selection.collapseToEnd();
        --repeat;
    }
    else
        selection.collapseToStart();
    do
        if (repeat) {
            if (direction === 'backward' && selection.anchorOffset === 0)
                continue;
            selection.modify('move', direction, 'character');
        }
        else
            selection.modify('extend', 'forward', 'character');
    while (--repeat >= 0);
};
var changeSelectionByWord = function (direction, repeat) {
    if (repeat === void 0) { repeat = 1; }
    var selection = window.getSelection();
    if (!selection)
        return;
    if (direction === 'forward') {
        selection.collapseToEnd();
        selection.modify('move', 'backward', 'character');
    }
    else
        selection.collapseToStart();
    do
        if (repeat)
            selection.modify('move', direction, 'word');
        else {
            selection.modify('extend', 'forward', 'character');
            while (selection.toString().match(/[\s\p{Punctuation}]/u)) {
                selection.collapseToEnd();
                selection.modify('extend', 'forward', 'character');
            }
        }
    while (--repeat >= 0);
};
var changeSelectionByParagraph = function (direction) {
    var selection = window.getSelection();
    if (!selection) {
        return;
    }
    if (direction === 'forward') {
        selection.collapseToEnd();
    }
    else if (direction === 'backward') {
        selection.collapseToStart();
    }
    selection.modify('extend', direction, 'paragraphboundary');
};
var deleteCharacter = function () {
    var selection = window.getSelection();
    if (!selection)
        return;
    selection.deleteFromDocument();
    selection.modify('extend', 'forward', 'character');
};
var changeSelectionByLine = function (direction) {
    var selection = window.getSelection();
    if (!selection) {
        return;
    }
    selection.collapseToStart(); // FIXME: buggy
    selection.modify('move', direction, 'line');
    selection.modify('extend', 'forward', 'character');
};
var appendSentence = function () {
    var selection = window.getSelection();
    if (!selection) {
        return;
    }
    selection.collapseToStart();
    selection.modify('extend', 'forward', 'character');
    while (!selection.toString().match(/[\p{Punctuation}]/u)) {
        selection.collapseToEnd();
        selection.modify('extend', 'forward', 'character');
    }
    while (selection.toString().match(/[\s\p{Punctuation}]/u)) {
        selection.collapseToEnd();
        selection.modify('extend', 'forward', 'character');
    }
    selection.collapseToStart();
};
