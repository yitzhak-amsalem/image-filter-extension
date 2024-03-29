import React, {useState, useEffect} from 'react';
import "./popup.css"

function App() {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [success, setSuccess] = useState(false);
    //const [runEnv, setRunEnv] = useState(false);
    const [distance, setDistance] = useState(0)

    useEffect(() => {
        chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {ping: "model_exists"}, function (response) {
                if (response["modelExists"] !== undefined) {
                    console.log(response["modelExists"]);
                    const files = response["modelFiles"];
                    //const env = response["env"];
                    const dis = response["dis"];
                    setSelectedFiles(files)
                    setSuccess(true)
                    //setRunEnv(env)
                    setDistance(dis)
                    console.log(dis)
                } else {
                    console.log('No model yet.');
                }
            });
        });
    }, [])

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
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
            setSelectedFiles(base64Images);
        });
    };

    const saveImages = () => {
        chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
            const dataToSend = {"model": selectedFiles};
            chrome.tabs.sendMessage(tabs[0].id, {model: dataToSend}, function (response) {
                if (response["modelSaved"] !== undefined) {
                    console.log(response["modelSaved"]);
                    setSuccess(true)
                } else {
                    console.log('Error! No response from content script.');
                }
            });
        });
    }

    const sendDis = (disInput) => {
        setDistance(disInput)
        chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
            const dis = {"dis": disInput};
            chrome.tabs.sendMessage(tabs[0].id, {dis: dis}, function (response) {
                if (response["disResults"] !== undefined) {
                    console.log(response["disResults"]);
                } else {
                    console.log('Error! No response from content script.');
                }
            });
        });
    }

    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            fontFamily: 'Chivo Mono, monospace',
            width: "300px",
            height: "auto",
            margin: "0px",
            padding: "10px",
            borderRadius: "5px",
            border: "3px solid #00a884"
        }}>
            <h1 style={{margin: "10px"}}>Face Model</h1>
            <div>
                {
                    success ?
                        <div>
                            <h2 style={{margin: "10px"}}> Model Saved Successfully! </h2>
                            {
                                selectedFiles.length > 0 &&
                                <div>
                                    {
                                        selectedFiles.map((url, index) => (
                                            <span key={index} style={{margin: "2px"}}>
                                                <img src={url} alt={`Uploaded ${index}`} style={{
                                                    margin: "2px",
                                                    width: "50px",
                                                    height: "50px",
                                                    borderRadius: "8px",
                                                    padding: "5px",
                                                    border: "1px solid #ddd"
                                                }}/>
                                            </span>
                                        ))
                                    }
                                </div>
                            }
                            <button id={"change-button"} style={{
                                margin: "10px",
                                backgroundColor: "#cffdaa",
                                color: "#27540a",
                                fontFamily: 'Chivo Mono, monospace',
                                padding: "8px 16px",
                                border: "none",
                                borderRadius: "5px",
                                boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)"
                            }} onMouseOver={() => {
                                const button = document.getElementById("change-button")
                                button.style.backgroundColor = 'rgba(166,252,99,0.9)';
                                button.style.transition = 'background-color 1s';
                                button.style.cursor = "pointer";
                            }}
                                    onMouseOut={() => {
                                        const button = document.getElementById("change-button")
                                        button.style.backgroundColor = "#cffdaa";
                                        button.style.transition = 'background-color 0.5s';
                                    }} onClick={() => setSuccess(false)}>
                                Change Model
                            </button>
                            <div style={{margin: "10px"}}>
                                Set Accuracy:
                                <div style={{margin: "5px"}}>
                                    <label>
                                        <input type="range" min={-0.15} max={0.15} step={0.01} value={distance}
                                        style={{width: "120px", margin: "5px 7px 5px 7px", cursor: "pointer"}}
                                               onInput={(v) => {
                                                   sendDis(v.target.value)
                                               }}
                                        />
                                        <div style={{margin: "5px"}}>{distance === 0 ? "Normal" : distance > 0 ? "High" : "Low"}</div>
                                    </label>
                                </div>
                            </div>
                           {/* <div style={{margin: "10px"}}>
                                Set Run Environment:
                                <div style={{margin: "5px"}}>
                                    <label className="switch">
                                        <input type="checkbox"
                                               onClick={() => setRunEnv(!runEnv)}
                                               />
                                        <span className="slider round"></span>
                                    </label>
                                </div>
                                {runEnv ? "PROD" : "LOCAL"}
                            </div>*/}
                        </div>
                        :
                        <div>
                            <div>
                                <h2 style={{margin: "10px"}}>Upload Your Images</h2>
                                <input style={{margin: "10px 0 10px 75px"}} type="file" multiple accept="image/*"
                                       onChange={handleFileChange}/>
                            </div>
                            {
                                selectedFiles.length > 0 &&
                                <div>
                                    {
                                        selectedFiles.map((url, index) => (
                                            <span key={index} style={{margin: "2px"}}>
                                                <img src={url} alt={`Uploaded ${index}`} style={{
                                                    margin: "2px",
                                                    width: "50px",
                                                    height: "50px",
                                                    borderRadius: "8px",
                                                    padding: "5px",
                                                    border: "1px solid #ddd"
                                                }}/>
                                            </span>
                                        ))
                                    }
                                </div>
                            }
                            <button id={"save-button"} style={{
                                margin: "10px",
                                backgroundColor: "#cffdaa",
                                color: "#27540a",
                                fontFamily: 'Chivo Mono, monospace',
                                padding: "8px 16px",
                                border: "none",
                                borderRadius: "5px",
                                boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                                cursor: "default"
                            }} onMouseOver={() => {
                                if (selectedFiles.length > 0) {
                                    const button = document.getElementById("save-button")
                                    button.style.backgroundColor = 'rgba(166,252,99,0.9)';
                                    button.style.transition = 'background-color 1s';
                                    button.style.cursor = "pointer";
                                }
                            }}
                                    onMouseOut={() => {
                                        const button = document.getElementById("save-button")
                                        button.style.backgroundColor = "#cffdaa";
                                        button.style.transition = 'background-color 0.5s';
                                        button.style.cursor = "default";
                                    }} disabled={selectedFiles.length === 0} onClick={saveImages}>
                                Save Face Model
                            </button>
                        </div>
                }
            </div>
        </div>
    );
}

export default App;
