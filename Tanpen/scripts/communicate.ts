let isContentEditable = true

document.body.addEventListener('change', () => {
    // @ts-ignore
    webkit.messageHandlers.bridge.postMessage(document.body.innerText)
})

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

const loadFromFile = (html: string) => {
    document.body.innerHTML = html
}

const changeContentEditable = (editable: boolean) => {
    isContentEditable = editable
    document.body.contentEditable = editable ? 'true' : 'false'

    const selection = window.getSelection()
    if (!selection) return

    if (editable)
        selection.collapseToStart()
    else if (selection.isCollapsed)
        selection.modify('extend', 
                         selection.anchorOffset === 0 ? 
                             'forward' :
                             'backward',
                         'character')
}

const changeSelectionByCharacter = (direction: string, repeat: number=1) => {
    const selection = window.getSelection()
    if (!selection) return

    if (direction === 'forward') {
        selection.collapseToEnd()
        --repeat
    } else selection.collapseToStart()

    do
        if (repeat) {
            if (direction === 'backward' && selection.anchorOffset === 0) continue
            selection.modify('move', direction, 'character')
        } else selection.modify('extend', 'forward', 'character')
    while (--repeat >= 0)
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
