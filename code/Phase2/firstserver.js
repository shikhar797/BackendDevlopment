// Build:

// GET    /
// GET    /user/:id
// GET    /users
// POST   /user

const express = require('express')
const app = express()

app.use(express.json()); // middleware

var users = [
    {
        'id': 1,
        'name': "Shikhar",
        'age': 21
    },
    {
        'id': 2,
        'name': "Prakhar",
        'age': 25
    }
]

app.get('/', (req, res) => {
    res.send("Hello from the server")
})

app.get('/users', (req, res) => {
    res.json(users)   // #7: use res.json()
})

// #1: actually find and return the user by id
app.get('/user/:id', (req, res) => {
    const id = Number(req.params.id)   // #3: numeric conversion
    const user = users.find(x => x.id === id)   // #3: proper === comparison

    if (!user) {
        return res.status(404).json({          // 404 since resource not found
            success: false,
            message: "No user found with that id"
        })
    }

    res.json(user)
})

app.post('/user', (req, res) => {
    // #2: generate an ID instead of trusting client input
    const newId = users.length > 0
        ? Math.max(...users.map(u => u.id)) + 1
        : 1

    const newUser = { id: newId, ...req.body }
    users.push(newUser)

    res.status(201).json(newUser)   // #8: 201 + return the created user
})

app.patch('/user/:id', (req, res) => {
    const id = Number(req.params.id)        // #3
    const updatedValue = req.body
    let flag = false

    for (const x of users) {
        if (x.id === id) {                  // #3: === instead of ==
            Object.assign(x, updatedValue)
            flag = true
            res.json(x)                     // #7: res.json, return the updated user
            return                          // #4: return after successful update
        }
    }

    if (!flag) {
        res.status(404).json({              // #5: 404, not 400
            success: false,
            message: "No user found with that id"
        })
    }
})

app.delete('/user/:id', (req, res) => {
    const id = Number(req.params.id)        // #3
    const index = users.findIndex(user => user.id === id)   // #3

    if (index !== -1) {
        const deletedUser = users.splice(index, 1)[0]
        res.json({                          // #7
            success: true,
            message: "User successfully deleted",
            deletedUser
        })
    } else {
        res.status(404).json({              // #6: 404, not 400
            status: "Failed",
            message: "No user found"
        })
    }
})

app.listen(3000, () => {
    console.log("Server is listening on port 3000")
})

