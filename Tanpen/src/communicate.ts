let isContentEditable = true

const textChangeObserver = new MutationObserver(() =>
    // @ts-ignore
    webkit.messageHandlers.bridge.postMessage(document.body.innerText)
)

const textChangeObserve = () =>
    textChangeObserver.observe(document.body, { 
        childList: true, 
        characterDataOldValue: true
    })


const setupDocument = (text: string) => {
    document.body.innerText = text
    textChangeObserve()
}

const loadFromText = (text: string, shouldPauseObserver: boolean=false) => {
    if (shouldPauseObserver) textChangeObserver.disconnect()
    document.body.innerText = text
    if (shouldPauseObserver) textChangeObserve()
}

document.body.addEventListener('paste', event => {
    event.preventDefault()

    if (!event.clipboardData) return
    const text = event.clipboardData.getData('text/plain')
    window.document.execCommand('insertText', false, text)
})

document.body.onpointerup = () => {
    if (isContentEditable) { return }

    const selection = window.getSelection()
    if (!selection) return

    if (selection.isCollapsed)
        selection.modify('extend', 'forward', 'character')
}

const changeContentEditable = (editable: boolean) => {
    isContentEditable = editable
    document.body.contentEditable = editable ? 'plaintext-only' : 'false'

    const selection = window.getSelection()
    if (!selection) return

    if (editable)
        selection.collapse(selection.focusNode, selection.focusOffset)
    else if (selection.isCollapsed) {
        if (selection.focusOffset === 0)
            selection.modify('move', 'forward', 'character')
        selection.modify('extend', 'backward', 'character')
    }
}

const moveByCharacter = (direction: string, repeat: number=1) => {
    const selection = window.getSelection()
    if (!selection) return

    if (direction === 'forward')
        selection.collapseToEnd()
    else {
        selection.collapseToStart()
        --repeat
    }

    do
        if (repeat)
            selection.modify('move', direction, 'character')
        else {
            selection.modify('extend', 'backward', 'character')
            validateSelection(selection, direction)
        }
    while (--repeat >= 0)
}

const validateSelection = (selection: Selection, direction: string) => {
    if (selection.toString().length === 0) {
        selection.modify('move', 'forward', 'character')
        selection.modify('extend', 'backward', 'character')
        return
    }

    while (selection.toString() === '\n') {
        selection.collapseToStart()
        selection.modify('move', direction, 'character')
        selection.modify('extend', 'forward', 'character')
    } 
    if (selection.isCollapsed) {
        selection.modify('extend', 'backward', 'character')
    }
}

const changeSelectionByWord = (direction: string, repeat: number=1) => {
    const selection = window.getSelection()
    if (!selection) return

    if (direction === 'forward') {
        selection.collapseToEnd()
        selection.modify('move', 'backward', 'character')
    } else selection.collapseToStart()

    do
        if (repeat)
            selection.modify('move', direction, 'word')
        else {
            selection.modify('extend', 'forward', 'character')

            while (selection.toString().match(/[\s\p{Punctuation}]/u)) {
                selection.collapseToEnd()
                selection.modify('extend', 'forward', 'character')
            }
        }
    while (--repeat >= 0)
}

const changeSelectionByParagraph = (direction: string) => {
    const selection = window.getSelection()
    if (!selection) { return }

    if (direction === 'forward') {
        selection.collapseToEnd()
    } else if (direction === 'backward') {
        selection.collapseToStart()
    }

    selection.modify('extend', direction, 'paragraphboundary')
}

const deleteCharacter = () => {
    const selection = window.getSelection()
    if (!selection) return
   
    selection.deleteFromDocument() 
    selection.modify('extend', 'forward', 'character')
}

const changeSelectionByLine = (direction: string) => {
    const selection = window.getSelection()
    if (!selection) { return }

    selection.collapseToStart()  // FIXME: buggy
    selection.modify('move', direction, 'line')
    selection.modify('extend', 'forward', 'character')
}

const appendSentence = () => {
    const selection = window.getSelection()
    if (!selection) { return }

    selection.collapseToStart()
    
    selection.modify('extend', 'forward', 'character')

    while (!selection.toString().match(/[\p{Punctuation}]/u)) {
        selection.collapseToEnd()
        selection.modify('extend', 'forward', 'character')
    }

    while (selection.toString().match(/[\s\p{Punctuation}]/u)) {
        selection.collapseToEnd()
        selection.modify('extend', 'forward', 'character')
    }

    selection.collapseToStart()
}
