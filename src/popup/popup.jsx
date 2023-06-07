import React from "react";
import {createRoot} from "react-dom/client";
import browser from 'webextension-polyfill';
import App from "./App";
function Popup() {
    return (
        <div>
            <App/>
        </div>
    );
}
browser.tabs.query({ active: true, currentWindow: true }).then(() => {
    const root = createRoot(document.getElementById('popup'));

    root.render(
        <React.StrictMode>
            <Popup />
        </React.StrictMode>,
    );
});
/*const container = document.getElementById('popup');
const root = createRoot(container);
root.render(<Popup />);*/


/*
document.addEventListener('DOMContentLoaded', () => {
    const addButton = document.getElementById('add-image-button');
    const inputField = document.getElementById('image-url-input');

    addButton.addEventListener('click', () => {
        const imageUrl = inputField.value.trim();

        if (imageUrl) {
            chrome.runtime.sendMessage({ type: 'addImage', src: imageUrl });
            inputField.value = '';
        }
    });
});*/
