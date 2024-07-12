const express = require('express');
const axios = require('axios');
const app = express();
const port = 9876;

const WINDOW_SIZE = 10;
let storedNumbers = [];

app.use(express.json());

app.get('/numbers/:numberid', async (req, res) => {
    const numberId = req.params.numberid;

    if (!['p', 'f', 'e', 'r'].includes(numberId)) {
        return res.status(400).json({ error: 'Invalid number ID' });
    }

    const fetchNumbers = async () => {
        try {
            const response = await axios.get(`http://localhost:9876/fetchNumbers/${numberId}`, { timeout: 500 });
            return response.data.numbers;
        } catch (error) {
            console.error('Error fetching numbers:', error);
            return [];
        }
    };

    const previousState = [...storedNumbers];
    const newNumbers = await fetchNumbers();

    const uniqueNewNumbers = newNumbers.filter(num => !storedNumbers.includes(num));
    storedNumbers = [...storedNumbers, ...uniqueNewNumbers].slice(-WINDOW_SIZE);

    const average = storedNumbers.length > 0
        ? storedNumbers.reduce((acc, num) => acc + num, 0) / storedNumbers.length
        : 0;

    res.json({
        windowPrevState: previousState,
        windowCurrState: storedNumbers,
        numbers: newNumbers,
        avg: average.toFixed(2)
    });
});

app.get('/fetchNumbers/:numberid', (req, res) => {
    const numberId = req.params.numberid;
    let numbers = [];

    switch (numberId) {
        case 'p':
            numbers = [2, 3, 5, 7];
            break;
        case 'f':
            numbers = [1, 1, 2, 3];
            break;
        case 'e':
            numbers = [2, 4, 6, 8];
            break;
        case 'r':
            numbers = [10, 9, 8, 7];
            break;
        default:
            break;
    }

    res.json({ numbers });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
