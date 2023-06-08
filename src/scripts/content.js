function onNewChatOpened(conversationPanelWrapper) {
    console.log("New chat opened!");
    insertFilterButton(conversationPanelWrapper)
}

function insertFilterButton(conversationPanelWrapper) {
    const imageAlbumElement = conversationPanelWrapper.querySelector('[data-testid="image-album"]');
    const filterButton = createButtonElement(imageAlbumElement);
    if (imageAlbumElement) {
        imageAlbumElement.insertAdjacentElement("beforeend", filterButton)
    }
}

const observer = new MutationObserver((mutationsList) => {
    for (let mutation of mutationsList) {
        if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
            const addedNodes = Array.from(mutation.addedNodes);
            const newChatNodes = addedNodes.filter(node =>
                node.getAttribute && node.getAttribute("data-testid") === "conversation-panel-wrapper"
            );
            if (newChatNodes.length > 0) {
                const conversationPanelWrapper = newChatNodes[0];
                onNewChatOpened(conversationPanelWrapper);
            }
        }
    }
});

const observerConfig = {childList: true, subtree: true};
observer.observe(document.body, observerConfig);

function onFilter(imageAlbumElement) {
    alert("Filter!!!")
    letFilterImages(imageAlbumElement);
}

function letFilterImages(imageAlbumElement) {
    console.log(imageAlbumElement)
    const imgElements = imageAlbumElement.querySelectorAll("img");
    imgElements.forEach((imgElement) => {
        if (imgElement.src.includes("whatsapp")) {
            console.log("Image source:", imgElement.src);
        }
    });
    const link = document.createElement('a');
    const img = imgElements[1];
    link.href = img.src;
    link.download = 'image.jpg';
    //link.click();

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    canvas.width = img.width;
    canvas.height = img.height;

    context.drawImage(img, 0, 0);

    const dataURL = canvas.toDataURL('image/png'); // 'image/png' for PNG format, 'image/jpeg' for JPEG format

    const imageData = dataURL.replace(/^data:image\/(png|jpeg);base64,/, '');

    sendImageToService(imageData);

    /*    const forward = imageAlbumElement.querySelector('[data-testid="forward-chat"]')
    if (forward){
        console.log(forward)
        forward.click();
        setTimeout(() => {
            const popup = document.querySelector('[data-testid="chat-modal"]')
            const element = document.querySelector('[data-testid="message-yourself-row"]');
            element.click();
        }, 1000)
        setTimeout(() => {
            const sendBtn = document.querySelector('[data-testid="send"]')
            sendBtn.click();
        }, 1000)
    }
*/
}

function sendImageToService(image) {
    const byteCharacters = atob(image);
    const byteArrays = [];
    for (let i = 0; i < byteCharacters.length; i++) {
        byteArrays.push(byteCharacters.charCodeAt(i));
    }
    const blob = new Blob([new Uint8Array(byteArrays)], {type: 'image/png'});
    const formData = new FormData();
    formData.append('image', blob, 'image.png');


    fetch('http://127.0.0.1:5000/upload', {
        method: 'POST',
        body: formData
    }).then(response => {
        if (response.ok) {
            return response.text();
        } else {
            throw new Error('Failed to send image');
        }
    }).then(responseText => {
        console.log('Response:', responseText);
    }).catch(error => {
            console.error('Error:', error);
    });
}

function createButtonElement(imageAlbumElement) {
    const filterButton = document.createElement("button");
    filterButton.innerText = "Filter";
    filterButton.id = "filter-btn";
    filterButton.addEventListener("click", () => onFilter(imageAlbumElement))
    filterButton.style.border = "3px solid green";
    filterButton.style.background = "#c9fc9f";
    filterButton.style.color = "#276001";
    filterButton.style.height = "50px";
    filterButton.style.width = "100px";
    filterButton.style.marginRight = "100px";

    filterButton.addEventListener('mouseover', function () {
        this.style.transition = 'background-color 1s, color 0.5s';
        this.style.backgroundColor = '#0b9b0b';
        this.style.color = '#dff8df';
    })
    filterButton.addEventListener('mouseout', function () {
        this.style.transition = 'background-color 0.5s, color 0.5s';
        this.style.background = "#c9fc9f";
        this.style.color = "#276001";
    });
    return filterButton;
}

