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
    //const imageAlbumElement = conversationPanelWrapper.querySelector('[data-testid="image-album"]');
    const filterButton = createButtonElement(albumElement);
    if (albumElement) {
        albumElement.appendChild(filterButton)
    }
}

function onFilter(imageAlbumElement) {
    alert("Filter!!!")
    letsFilterImages(imageAlbumElement);
}

function letsFilterImages(imageAlbumElement) {
    const imgElements = extractImageFiles(imageAlbumElement);
    console.log("images length:", imgElements.length)
    sendImageArrToService(imgElements);
}

async function sendImageArrToService(imageArr) {
    /*   const formData = new FormData();
       Array.from(imageArr).forEach((image, index) => {
           formData.append(`image_${index}`, imageUrlToFile(image.src))
       });*/

//    imageUrlToFile(imageArr[0].src)
    imageArrUrlToFiles(imageArr)
    /*fetch('http://127.0.0.1:5000/upload', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({images: base64Images})
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
    });*/

//    const imageFile = imageToFile(image)
//    formData.append('image', imageFile, 'image.png');
}

function imageArrUrlToFiles(imageElements){
    Promise.all(
        imageElements.map((img, index) =>
            fetch(img.src)
                .then(response => response.arrayBuffer())
                .then(buffer => {
                    const base64Image = arrayBufferToBase64(buffer);
                    return { index, image: base64Image };
                })
        )
    ).then(imagesWithIndexes => {
            fetch('http://127.0.0.1:5000/upload', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ images: imagesWithIndexes })
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
                body: JSON.stringify({ image: base64Image })
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

function extractImageFiles(imageAlbumElement) {
    const imgElements = Array.from(imageAlbumElement.querySelectorAll("img"));
    return imgElements.filter((imgElement) => imgElement.src.includes("whatsapp"));
}

function createButtonElement(imageAlbumElement) {
    const filterButton = document.createElement("button");
    filterButton.innerText = "Filter";
    filterButton.id = "filter-btn";
    filterButton.addEventListener("click", () => onFilter(imageAlbumElement))
    filterButton.style.border = "3px solid green";
    filterButton.style.background = "#c9fc9f";
    filterButton.style.color = "#276001";
    filterButton.style.height = "70px";
    filterButton.style.width = "120px";
    filterButton.style.marginRight = "100px";
    filterButton.style.fontFamily = 'Chivo Mono, monospace';
    filterButton.style.borderRadius = "10px";
    filterButton.style.fontSize = "1.5em";

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


