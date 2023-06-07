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

            /*findImageAlbumElement(conversationPanelWrapper)
                .then(imageAlbumElement => {
                    if (imageAlbumElement) {
                        // Create a new button element
                        const filterButton = document.createElement("button");
                        filterButton.innerText = "Filter";
                        filterButton.addEventListener("click", onFilter)

                        imageAlbumElement.insertAdjacentElement("afterbegin", filterButton)
                    }
                })
                .catch(error => {
                    console.error("Error:", error);
                });*/

        }
    }
});

const observerConfig = {childList: true, subtree: true};
observer.observe(document.body, observerConfig);

function onFilter(imageAlbumElement) {
    imageAlbumElement.tabIndex = 0;
    console.log(imageAlbumElement)
    alert("Filter!!!")
    const imgElements = imageAlbumElement.querySelectorAll("img");
    imgElements.forEach((imgElement) => {
        if (imgElement.src.includes("whatsapp")){
            console.log("Image source:", imgElement.src);
        }
    });
    const link = document.createElement('a');
    link.href = imgElements[1].src;
    link.download = 'image.jpg';
    link.click();

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

function createButtonElement(imageAlbumElement) {
    const filterButton = document.createElement("button");
    filterButton.innerText = "Filter";
    filterButton.addEventListener("click", () => onFilter(imageAlbumElement))
    filterButton.style.border = "5px solid green";
    filterButton.style.background = "#c9fc9f";
    filterButton.style.color = "#276001";
    filterButton.style.height = "30px";
    filterButton.style.width = "100px";
    return filterButton;
}


/*
function findImageAlbumElement(parentElement) {
    return new Promise(async (resolve, reject) => {
        const imageAlbumElement = await waitForElement('[data-testid="image-album"]');
        //const imageAlbumElement = parentElement.querySelector('[data-testid="image-album"]');

        if (imageAlbumElement) {
            resolve(imageAlbumElement);
        } else {
            reject("Image album element not found");
        }
    });
}

function waitForElement(selector) {
    return new Promise((resolve) => {
        const element = document.querySelector(selector);
        if (element) {
            resolve(element);
        } else {
            const observer = new MutationObserver(() => {
                const element = document.querySelector(selector);
                if (element) {
                    observer.disconnect();
                    resolve(element);
                }
            });
            observer.observe(document.body, { childList: true, subtree: true });
        }
    });
}*/
