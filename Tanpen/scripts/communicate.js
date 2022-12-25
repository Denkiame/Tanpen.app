document.body.addEventListener('input', function () {
    // @ts-ignore
    webkit.messageHandlers.bridge.postMessage(document.body.innerText);
});
var loadFromFile = function (html) {
    console.log(html);
    document.body.innerHTML = html;
};
var changeContentEditable = function (editable) {
    document.body.contentEditable = editable ? 'true' : 'false';
    var selection = window.getSelection();
    if (!selection) {
        return;
    }
    if (editable) {
        selection.collapseToStart();
    }
    else {
        if (selection.isCollapsed) {
            selection.modify('extend', 'backward', 'character');
        }
    }
};
var changeSelectionByCharacter = function (direction) {
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
    selection.modify('extend', direction, 'character');
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
