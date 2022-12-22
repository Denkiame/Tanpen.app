document.body.addEventListener('input', () => {
    // @ts-ignore
    webkit.messageHandlers.bridge.postMessage(document.body.innerText)
})

const loadFromFile = (html: string) => {
    console.log(html)
    document.body.innerHTML = html
}
