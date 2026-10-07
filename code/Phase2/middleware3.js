const express = require('express');

const app = express();

app.use(express.json());

const logger = (req, res, next) => {
    console.log(`Method: ${req.method}`);
    console.log(`URL: ${req.url}`);
    next();
};

app.use(logger);

const requestInfo = (req, res, next) => {
    req.requestInfo = {
        source: "API",
        version: "v1"
    };

    next();
};

app.use(requestInfo);

const auth = (req, res, next) => {
    const token = req.headers.authorization;

    if (token !== "secret123") {
        return res.status(401).json({
            success: false,
            message: "Unauthorized"
        });
    }

    next();
};

app.get('/public', (req, res) => {
    res.json({
        message: "This is public",
        requestInfo: req.requestInfo
    });
});

app.get('/private', auth, (req, res) => {
    res.json({
        message: "This is private",
        requestInfo: req.requestInfo
    });
});

app.post('/user', auth, (req, res) => {
    res.json(req.body);
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});