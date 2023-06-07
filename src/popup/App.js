import React, { useState } from 'react';

function App() {
    const [image1, setImage1] = useState(null);
    const [image2, setImage2] = useState(null);
    const [result, setResult] = useState(null);

    const handleImage1Upload = (event) => {
        const file = event.target.files[0];
        setImage1(URL.createObjectURL(file));
    };

    const handleImage2Upload = (event) => {
        const file = event.target.files[0];
        setImage2(URL.createObjectURL(file));
    };

    const handleSubmit = async () => {
        if (!image1 || !image2) {
            alert('Please select both images.');
            return;
        }

        const formData = new FormData();
        formData.append('image1', image1);
        formData.append('image2', image2);

        try {
            const response = await fetch('http://localhost:5000/api/face-check', {
                method: 'POST',
                body: formData,
                mode: 'no-cors'
            });

            if (response.ok) {
                const data = await response.json();
                setResult(data.result);
                alert("YES! " + data.result)
            } else {
                alert('Face check failed. Please try again.');
            }
        } catch (error) {
            alert('An error occurred. Please try again later.');
        }
    };

    return (
        <div>
            <h1>Face Checker</h1>
            <div>
                <h2>Image 1</h2>
                <input type="file" accept="image/*" onChange={handleImage1Upload} />
                {image1 && <img width={"60px"} height={"60px"} src={image1} alt="Image 1" />}
            </div>
            <div>
                <h2>Image 2</h2>
                <input type="file" accept="image/*" onChange={handleImage2Upload} />
                {image2 && <img width={"60px"} height={"60px"} src={image2} alt="Image 2" />}
            </div>
            <button onClick={handleSubmit}>Check Face</button>
            {result && <div>{result ? 'Face is present in both images.' : 'Face is not present in both images.'}</div>}
        </div>
    );
}

export default App;
