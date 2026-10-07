const { z } = require('zod');
const express = require('express');

const app = express();

app.use(express.json());

const userSchema = z.object({

    name: z.string()
        .trim()
        .min(1, "Name is required")
        .regex(/^[A-Za-z ]+$/, "Name must contain only letters"),

    age: z.number()
        .min(18, "Age must be at least 18"),

    email: z.email({
        message: "Invalid email address"
    })

});

const validateUser = (req, res, next) => {

    const result = userSchema.safeParse(req.body);

    if (!result.success) {

        return res.status(400).json({
            success: false,
            errors: result.error.issues
        });

    }

    req.body = result.data;

    next();
};

app.post('/user', validateUser, (req, res) => {

    res.status(201).json({
        success: true,
        message: "User inserted successfully",
        user: req.body
    });

});

app.listen(3000);