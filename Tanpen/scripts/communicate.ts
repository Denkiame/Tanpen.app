document.body.addEventListener('input', () => {
    // @ts-ignore
    webkit.messageHandlers.bridge.postMessage(document.body.innerText)
})

const loadFromFile = (html: string) => {
    console.log(html)
    document.body.innerHTML = html
}

const changeContentEditable = (editable: boolean) => {
    document.body.contentEditable = editable ? 'true' : 'false'

    const selection = window.getSelection()
    if (!selection) { return }

    if (editable) {
        selection.collapseToStart()
    } else {
        if (selection.isCollapsed) {
            selection.modify('extend', 'backward', 'character')
        }
    } 
}

const changeSelectionByCharacter = (direction: string) => {
    const selection = window.getSelection()
    if (!selection) { return }

    if (direction === 'forward') {
        selection.collapseToEnd()
    } else if (direction === 'backward') {
        selection.collapseToStart()
    }

    selection.modify('extend', direction, 'character')
}

const changeSelectionByLine = (direction: string) => {
    const selection = window.getSelection()
    if (!selection) { return }

    selection.collapseToStart()  // FIXME: buggy
    selection.modify('move', direction, 'line')
    selection.modify('extend', 'forward', 'character')
}
