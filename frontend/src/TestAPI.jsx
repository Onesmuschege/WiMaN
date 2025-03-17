import {useEffect, useState} from 'react';

const API_URL = "http://127.0.0.1:5000/api/test";
const TestAPI = () => {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch(API_URL)
            .then((response) => setData(response.data))
            .catch((err) => setError(err.message))
            .catch(error => console.error("API Error:", error));
        }, []);

        return (
            <div>
                <h2>Testing API connection.....</h2>
                {data ? <p>API Response: {JSON.stringify(data)}</p> : <p>Loading...</p>}
                {error && <p>Error: {error}</p>}
            </div>
        );
    };

export default TestAPI;
