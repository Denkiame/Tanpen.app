document.body.addEventListener('input', function () {
    // @ts-ignore
    webkit.messageHandlers.bridge.postMessage(document.body.innerText);
});
var loadFromFile = function (html) {
    console.log(html);
    document.body.innerHTML = html;
};
