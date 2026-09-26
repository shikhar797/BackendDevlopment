// Our goal

// Build this API without Express:

// Method	Endpoint	Purpose
// GET	    /users	    Get all users
// GET	    /users/1	Get one user
// POST	    /users	    Create user
// PATCH	/users/1	Update user
// DELETE	/users/1	Delete user



const http=require('http')

var users=[
    {   
        'id':1,
        'name':"Shikhar",
        'age':21
    },
    {   
        'id':2,
        'name':"Prakhar",
        'age':25
    }
]
const server = http.createServer((req, res) => {
    if (req.method === "GET" && req.url === "/user") {
        console.log(users);
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(users));   // fixed typo
    }
    else if (req.method === "POST" && req.url === '/user') {
        let body = "";
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            try {
                const newUser = JSON.parse(body);
                users.push(newUser);
                console.log("User inserted", users);
                res.statusCode = 200;
                res.end("User inserted");
            } catch (err) {
                res.statusCode = 400;
                res.end("Please send valid data format");
            }
        });
    }
    else if (req.method === "GET" && req.url.startsWith("/user/")) {
        const myurl = new URL(req.url, `http://${req.headers.host}`);
        const id = myurl.pathname.split('/')[2];
        let flag = false;
        for (const x of users) {
            if (x.id == id) {
                flag = true;
                res.statusCode = 200;
                res.end(JSON.stringify(x));
                break;
            }
        }
        if (!flag) {
            res.statusCode = 404;   // fixed
            res.end("User not found");
        }
    }
    else if (req.method === "PATCH") {
        const myurl = new URL(req.url, `http://${req.headers.host}`);
        const id = myurl.pathname.split('/')[2];
        let body = "";
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            try {
                const updatedUser = JSON.parse(body);
                let found = false;
                for (const x of users) {
                    if (x.id == id) {
                        Object.assign(x, updatedUser);
                        found = true;
                    }
                }
                if (!found) {
                    res.statusCode = 404;
                    return res.end("User not found");
                }
                res.statusCode = 200;
                res.end("User updated");
            } catch (err) {
                res.statusCode = 400;
                res.end("Wrong format");
            }
        });
    }
    else if (req.method === "DELETE") {
        const myurl = new URL(req.url, `http://${req.headers.host}`);
        const id = myurl.pathname.split('/')[2];
        const index = users.findIndex(user => user.id == id);

        if (index !== -1) {
            users.splice(index, 1);
            res.statusCode = 200;
            res.end("User deleted successfully");   // removed duplicate res.end
        } else {
            res.statusCode = 404;                     // added missing else
            res.end("User not found");
        }
    }
    else {
        res.end("End");
    }
});

server.listen(3000,()=>{
    console.log("Server is listening in port 3000")
})