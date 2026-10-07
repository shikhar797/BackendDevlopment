const express = require('express');

const app = express();

app.use(express.json());

function hasNumber(str) {
    return /\d/.test(str);
}

const validateUser = (req, res, next) => {

    const { name, age } = req.body;

    // Name missing
    if (name === undefined) {
        return res.status(400).json({
            success: false,
            message: "Name is required"
        });
    }

    // Name type
    if (typeof name !== "string") {
        return res.status(400).json({
            success: false,
            message: "Name must be a string"
        });
    }

    // Empty name
    if (name.trim() === "") {
        return res.status(400).json({
            success: false,
            message: "Name cannot be empty"
        });
    }

    // Name contains number
    if (hasNumber(name)) {
        return res.status(400).json({
            success: false,
            message: "Name should not contain numbers"
        });
    }

    // Age missing
    if (age === undefined) {
        return res.status(400).json({
            success: false,
            message: "Age is required"
        });
    }

    // Age type
    if (typeof age !== "number") {
        return res.status(400).json({
            success: false,
            message: "Age must be a number"
        });
    }

    // Age validation
    if (age < 18) {
        return res.status(400).json({
            success: false,
            message: "Age must be at least 18"
        });
    }

    next();
};

app.post('/user', validateUser, (req, res) => {

    res.json({
        success: true,
        message: "User is valid",
        user: req.body
    });

});

app.listen(3000);

