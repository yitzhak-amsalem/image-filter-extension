import React, {useState} from 'react';

function App() {

    const [selectedFiles, setSelectedFiles] = useState([]);
    const [uploadedImages, setUploadedImages] = useState([]);
    const [success, setSuccess] = useState(false);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setSelectedFiles(files);

        const imageUrls = files.map((file) => URL.createObjectURL(file));
        setUploadedImages(imageUrls);

        const imagePromises = files.map((file) => {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    resolve(e.target.result);
                };
                reader.readAsDataURL(file);
            });
        });

        Promise.all(imagePromises).then((base64Images) => {
            setUploadedImages(base64Images);
        });


    };
    const saveImages = () => {
        chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
            const dataToSend = {"model": uploadedImages};
            chrome.tabs.sendMessage(tabs[0].id, {data: dataToSend}, function (response) {
                if (response) {
                    console.log(response);
                    setSuccess(true)
                } else {
                    console.log('Error! No response from content script');
                }
            });
        });
    }

    return (
        <div>
            <h1>Face Model</h1>
            <div>
                <h2>Upload Your Images</h2>
                <input type="file" multiple accept="image/*" onChange={handleFileChange}/>
                {
                    uploadedImages.length > 0 &&
                    <div>
                        {
                            uploadedImages.map((url, index) => (
                                <li key={index}>
                                    <img src={url} alt={`Uploaded ${index}`} width={"30px"} height={"30px"}/>
                                </li>
                            ))
                        }
                    </div>
                }
            </div>

            <button onClick={saveImages}>Save Face Model</button>

            {
                success &&
                <div>
                    Success!
                </div>
            }

        </div>
    );
}

export default App;
