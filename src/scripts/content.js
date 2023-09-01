const observer = new MutationObserver((mutationsList) => {
    for (let mutation of mutationsList) {
        if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
            const addedNodes = Array.from(mutation.addedNodes);
            const newChatNodes = addedNodes.filter(node =>
                node.getAttribute && node.getAttribute("id") === "main"
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

function onNewChatOpened(conversationPanelWrapper) {
    console.log("New chat opened!");
    scanChatForAlbums(conversationPanelWrapper).then(albums => {
        Array.from(albums).forEach(album => {
            createFilterButton(album)
        })
    })
}

const scanChatForAlbums = (conversationPanelWrapper) => {
    const msgSelectorAll = '[data-id^="album-true"], [data-id^="album-false"]';
    return waitForNodes(conversationPanelWrapper, msgSelectorAll);
}

const waitForNodes = (parentNode, selector) => {
    return new Promise((resolve, reject) => {
        const interval = setInterval(() => {
            const element = parentNode.querySelectorAll(selector);
            if (element) {
                clearInterval(interval);
                resolve(element);
            }
        }, 1000);
    });
}

function createFilterButton(albumElement) {
    const filterButton = createButtonElement(albumElement);
    if (albumElement) {
        albumElement.appendChild(filterButton)
    }
}

function onFilter(imageAlbumElement) {
    handleFiltering(imageAlbumElement);
}

async function handleFiltering(imageAlbumElement) {
    const imgElements = await extractImageFiles(imageAlbumElement);
    closeWindow();
    console.log("images length:", imgElements.length)
    sendImageArrToService(imgElements);
}

async function extractImageFiles(imageAlbumElement) {
    const imgElements = [];
    const albumSize = parseAlbumSize(imageAlbumElement);
    const buttonSelector = imageAlbumElement.querySelector('[role="button"]');
    buttonSelector.click();
    getCurrentImg(imgElements);
    await sleep(400)
    const nextButton = document.body.querySelector('[aria-label="הבא"][role="button"]');
    for (let i = 1; i < albumSize; i++) {
        nextButton.click();
        getCurrentImg(imgElements);
        await sleep(400)
    }
    return imgElements;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function parseAlbumSize(imageAlbumElement) {
    const albumId = imageAlbumElement.getAttribute('data-id');
    const albumIdParts = albumId.split('-');
    const lastPart = albumIdParts[albumIdParts.length - 1];
    const match = lastPart.match(/\d+/);
    if (match) {
        return parseInt(match[0]);
    } else {
        console.log("No number found.");
    }
}

function getCurrentImg(imgElements) {
    setTimeout(() => {
        const currentImgElement = document.body.querySelector('[role="img"]');
        const imgSrc = currentImgElement.querySelectorAll("img")[1]
        imgElements.push(imgSrc);
    }, 300);
}

function closeWindow() {
    document.body.querySelector('[aria-label="סגירה"][role="button"]').click();
}

function sendImageArrToService(imageElements) {
    Promise.all(
        imageElements.map((img, index) =>
            fetch(img.src)
                .then(response => response.arrayBuffer())
                .then(buffer => {
                    const base64Image = arrayBufferToBase64(buffer);
                    return {index, image: base64Image};
                })
        )
    ).then(imagesWithIndexes => {
        fetch('http://127.0.0.1:5000/upload', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({images: imagesWithIndexes})
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
    });
}

function createButtonElement(imageAlbumElement) {
    const filterButton = document.createElement("button");
    filterButton.innerText = "Filter Album";
    filterButton.id = "filter-btn";
    filterButton.addEventListener("click", () => onFilter(imageAlbumElement))
    filterButton.style.backgroundColor = "#cffdaa";
    filterButton.style.color = "#27540a";
    filterButton.style.height = "auto";
    filterButton.style.width = "auto";
    filterButton.style.margin = "5px 80px 5px 0";
    filterButton.style.fontFamily = 'Chivo Mono, monospace';
    filterButton.style.fontSize = "1.2em";
    filterButton.style.padding = "8px 16px";
    filterButton.style.border = "none";
    filterButton.style.borderRadius = "5px";
    filterButton.style.cursor = "pointer";
    filterButton.style.boxShadow = "0px 4px 6px rgba(0, 0, 0, 0.1)";

    filterButton.addEventListener('mouseover', () => {
        filterButton.style.transition = 'background-color 1s';
        filterButton.style.backgroundColor = 'rgba(166,252,99,0.9)';
    });
    filterButton.addEventListener('mouseout', () => {
        filterButton.style.transition = 'background-color 0.5s';
        filterButton.style.backgroundColor = "#cffdaa";
    });

    return filterButton;

}

function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}




function downloadImage(image) {
    const link = document.createElement('a');
    link.href = image.src;
    link.download = 'image.jpg';
    link.click();
}

function forwardImage(imageAlbumElement) {
    const forward = imageAlbumElement.querySelector('[data-testid="forward-chat"]')
    if (forward) {
        console.log(forward)
        forward.click();
        setTimeout(() => {
            //const popup = document.querySelector('[data-testid="chat-modal"]')
            const element = document.querySelector('[data-testid="message-yourself-row"]');
            element.click();
        }, 1000)
        setTimeout(() => {
            const sendBtn = document.querySelector('[data-testid="send"]')
            sendBtn.click();
        }, 1000)
    }
}

function imageToFile(image) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = image.width;
    canvas.height = image.height;
    context.drawImage(image, 0, 0);

    const dataURL = canvas.toDataURL('image/png');
    const imageData = dataURL.replace(/^data:image\/(png|jpeg);base64,/, '');

    const byteCharacters = atob(imageData);
    const byteArrays = [];
    for (let i = 0; i < byteCharacters.length; i++) {
        byteArrays.push(byteCharacters.charCodeAt(i));
    }
    return new Blob([new Uint8Array(byteArrays)], {type: 'image/png'})
}

function send(imagesWithIndexes){
    fetch('http://127.0.0.1:5000/upload2', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({images: imagesWithIndexes})
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

function imageUrlToFile(imageUrls) {
    fetch(imageUrls)
        .then(response => response.arrayBuffer())
        .then(buffer => {
            // Convert the ArrayBuffer to a Base64 string
            const base64Image = arrayBufferToBase64(buffer);

            // Send the Base64-encoded image to the server using a POST request
            fetch('http://127.0.0.1:5000/upload1', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({image: base64Image})
            })
                .then(response => {
                    // Handle the response from the server
                    console.log('Image uploaded successfully');
                })
                .catch(error => {
                    console.error('Error uploading image:', error);
                });
        });
}


