const express = require('express');

const app = express();

app.use(express.json());

const users = [
    {
        id: 1,
        name: "Shikhar",
        age: 21
    },
    {
        id: 2,
        name: "Prakhar",
        age: 25
    }
];

app.get('/user/:id', (req, res, next) => {

    const id = Number(req.params.id);

    for (const x of users) {

        if (x.id === id) {
            return res.json(x);
        }
    }

    return next(new Error("User not found"));
});

const errorHandler = (err, req, res, next) => {

    res.status(404).json({
        success: false,
        message: err.message
    });
};

app.use(errorHandler);

app.listen(3000);