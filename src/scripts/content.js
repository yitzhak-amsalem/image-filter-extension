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

const localPath = "http://127.0.0.1:5000";
const prodPath = "https://filter-service-fgue.onrender.com";
let userModel;
let normalThreshold = 0.6;
let distance = normalThreshold;
let requestPath = localPath;

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    const response = {modelExists: undefined, modelFiles: undefined, env: undefined, dis: undefined};
    if (request.model) {
        userModel = request.model["model"];
        response["modelSaved"] = 'Images saved successfully';
    //} else if (request.env) {
        //requestPath = request.env["env"] ? prodPath : localPath;
        //response["envResults"] = "env sets.";
    } else if (request.dis) {
        distance = (normalThreshold - request.dis["dis"]);
        response["disResults"] = "dis sets.";
    } else if (request.ping) {
        if (userModel) {
            response["modelExists"] = 'Model exists';
            response["modelFiles"] = userModel;
            response["env"] = requestPath === prodPath;
            response["dis"] = (normalThreshold - distance);
        }
    }
    sendResponse(response);
});

function onNewChatOpened(conversationPanelWrapper) {
    console.log("New chat opened!");
    scanChatForAlbums(conversationPanelWrapper).then(albums => {
        Array.from(albums).forEach(album => {
            createFilterButton(album)
        })
    })
}

function scanChatForAlbums(conversationPanelWrapper) {
    const msgSelectorAll = '[data-id^="album-true"], [data-id^="album-false"]';
    return waitForNodes(conversationPanelWrapper, msgSelectorAll);
}

function createFilterButton(albumElement) {
    const filterButton = createButtonElement(albumElement);
    if (albumElement) {
        albumElement.appendChild(filterButton)
    }
}

async function handleFiltering(imageAlbumElement) {
    const imgElements = await extractImageFiles(imageAlbumElement);
    closeWindow();
    console.log("images length:", imgElements.length)
    sendImageArrToService(imgElements);
}

function sendImageArrToService(imageElements) {
    Promise.all(
        imageElements.map(img =>
            fetch(img.src)
                .then(response => response.arrayBuffer())
                .then(buffer => {
                    return arrayBufferToBase64(buffer);
                })
        )
    ).then(imagesBase64 => {
        console.log("path:", requestPath, "dis:", distance)
        fetch(`${requestPath}/filter`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({images: imagesBase64, imagesModel: userModel, distance: distance})
        }).then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Failed to send image');
            }
        }).then(data => {
            console.log('result size:', data["result"].length);
            handleResponse(data["result"])
        }).catch(error => {
            console.error('Error:', error);
        });
    });
}

function handleResponse(resultsImg) {
    resultsImg.forEach((img, index) => {
        const blob = base64toBlob(img, 'image/png');
        const blobUrl = URL.createObjectURL(blob);
        downloadImage(blobUrl, index);
        URL.revokeObjectURL(blobUrl);
    })
}

function downloadImage(url, index) {
    const link = document.createElement('a');
    link.href = url;
    link.download = `image ${index}.jpg`;
    link.click();
}

function onFilter(imageAlbumElement) {
    if (userModel) {
        handleFiltering(imageAlbumElement).then();
    } else {
        alert("Add face model by popup")
    }
}

async function extractImageFiles(imageAlbumElement) {
    const imgElements = [];
    const albumSize = parseAlbumSize(imageAlbumElement);
    const buttonSelector = imageAlbumElement.querySelectorAll('[role="button"]');
    buttonSelector[0].ariaLabel.includes("פרטי הצ'אט") ? buttonSelector[1].click() : buttonSelector[0].click();
    getCurrentImg(imgElements);
    await sleep(550)
    const nextButton = document.body.querySelector('[aria-label="הבא"][role="button"]');
    for (let i = 1; i < albumSize; i++) {
        nextButton.click();
        getCurrentImg(imgElements);
        await sleep(550)
    }
    return imgElements;
}

const waitForNodes = (parentNode, selector) => {
    return new Promise((resolve, reject) => {
        const interval = setInterval(() => {
            const element = parentNode.querySelectorAll(selector);
            if (element) {
                clearInterval(interval);
                resolve(element);
            }
        }, 1200);
    });
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
        if (currentImgElement) {
            const imgSrc = currentImgElement.querySelectorAll("img")[1]
            imgElements.push(imgSrc);
        }
    }, 500);
}

function closeWindow() {
    document.body.querySelector('[aria-label="סגירה"][role="button"]').click();
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

function base64toBlob(base64Data, contentType) {
    const byteCharacters = atob(base64Data);
    const arrayBuffer = new ArrayBuffer(byteCharacters.length);
    const uint8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteCharacters.length; i++) {
        uint8Array[i] = byteCharacters.charCodeAt(i);
    }
    return new Blob([arrayBuffer], {type: contentType});
}
