### Express is not a replacement for Node.js. Express is a web framework built on top of Node.js that makes HTTP server development easier.

You just experienced why.

In raw Node, you had to manually handle:

```
request
  ↓
method check
  ↓
URL parsing
  ↓
route matching
  ↓
body collection
  ↓
JSON parsing
  ↓
status code
  ↓
headers
  ↓
response
```
Express gives you abstractions for most of that.



## first middleware in express
```
app.use(express.json());
```
is a built-in middleware function in Express used to parse incoming requests with JSON payloads and make that data available on req.body.

### How It Works
1.Detects JSON: It checks incoming HTTP requests with the header Content-Type: application/json.

2.Parses Data: It takes the raw JSON string from the request body and converts it into a usable JavaScript object.

3.Attaches to Request: It assigns the resulting object to req.body, allowing your route handlers to easily read incoming data (such as during POST or PUT requests)

## Types of Middleware in JS

### 1.Application level middleware
Bound globally to the instance using app.use() i.e. is app.get(),app.post()

```
app.use((req, res, next) => {
  console.log('Global Logger: Time:', Date.now());
  next();
});
```


### 2.Router-Level middleware
Works identically to application-level middleware, but it is bound to an instance of express.Router().
This is essential for modularizing code (e.g., locking an entire /admin dashboard folder behind auth.)

```
const router = express.Router();

router.use((req, res, next) => {
  // Code runs only for routes configured through this specific router
  next();
});
```
### 3. Built-In Middleware
Express comes natively bundled with a few essential middleware functions to handle common incoming payloads.

1.express.json(): Parses incoming requests containing JSON payloads into req.body

2.express.urlencoded(): Parses URL-encoded data (HTML form submissions)

3.express.static(): Serves static files such as images, CSS styles, and client-side JavaScript.

### 4.Error-Handling Middleware
Error handlers are defined differently by accepting four arguments instead of three: (err, req, res, next). Express automatically recognizes this signature and routes runtime exceptions here

```
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke inside the server!');
});
```

### 5. Third-Party Middleware
Installed through npm

• morgan: HTTP request logger.
• cors: Enables Cross-Origin Resource Sharing.
• helmet: Helps secure your app by setting various HTTP security headers

## next() function in express
The next function is a function in the Express router which, when invoked, executes the middleware succeeding the current middleware.

# Express.js Middleware — Revision Notes

## 1. What is Middleware?

Middleware is a function that runs during the **request-response cycle**.

Basic structure:

```js
(req, res, next) => {
    // middleware logic
    next();
}
```

### Parameters

| Parameter | Meaning                                        |
| --------- | ---------------------------------------------- |
| `req`     | Incoming HTTP request                          |
| `res`     | HTTP response                                  |
| `next`    | Function used to continue the middleware chain |

Basic flow:

```text
Client
  ↓
Request
  ↓
Middleware 1
  ↓
Middleware 2
  ↓
Route Handler
  ↓
Response
```

---

# 2. `next()`

Calling:

```js
next();
```

tells Express:

> Continue to the next middleware/handler in the chain.

Example:

```js
const logger = (req, res, next) => {
    console.log(req.method);
    next();
};
```

If you don't call `next()` and don't send a response, the request can hang.

---

# 3. Middleware Execution Order

Express executes middleware **in registration order**.

```js
app.use((req, res, next) => {
    console.log("A");
    next();
});

app.use((req, res, next) => {
    console.log("B");
    next();
});

app.get("/", (req, res) => {
    console.log("C");
    res.send("Hello");
});
```

Output:

```text
A
B
C
```

Think:

```text
Request
  ↓
A
  ↓ next()
B
  ↓ next()
C
  ↓
Response
```

### Important rule

> Express middleware executes top-to-bottom according to where it is registered.

---

# 4. `res.send()` Stops the Express Chain

Consider:

```js
app.use((req, res, next) => {
    console.log("A");
    next();
});

app.get("/", (req, res) => {
    console.log("B");
    res.send("Hello");
});

app.use((req, res, next) => {
    console.log("C");
    next();
});
```

Output:

```text
A
B
```

`C` does not execute because the route sent the response and did not call `next()`.

Flow:

```text
A
 ↓
B
 ↓
res.send()
 ↓
Response finished
 ↓
C is never reached
```

---

# 5. `next()` Does NOT Stop JavaScript Execution

This is an important distinction.

Consider:

```js
app.get("/", (req, res, next) => {
    console.log("A");

    next();

    console.log("B");
});
```

Both `A` and `B` can execute.

Why?

Because:

```js
next();
```

passes control to Express's next handler, but it does **not automatically terminate the current JavaScript function**.

---

# 6. `return next()`

If you want to continue the Express chain **and immediately exit the current function**, use:

```js
return next();
```

Example:

```js
app.get("/", (req, res, next) => {
    console.log("A");

    return next();

    console.log("B"); // never executes
});
```

### Remember

```js
next();
```

→ Continue Express chain, current function can continue.

```js
return next();
```

→ Continue Express chain + exit current function.

---

# 7. Global Middleware

Registered using:

```js
app.use(logger);
```

Example:

```js
const logger = (req, res, next) => {
    console.log(req.method);
    console.log(req.url);
    next();
};

app.use(logger);
```

This middleware runs for requests that reach it.

Example:

```text
GET /public
GET /private
POST /user
DELETE /user/10
```

All can pass through the logger.

---

# 8. Route-Specific Middleware

Middleware can be attached only to a particular route.

```js
app.get("/private", auth, (req, res) => {
    res.send("Private Account");
});
```

Here:

```text
GET /public
    ↓
logger
    ↓
public route
```

But:

```text
GET /private
    ↓
logger
    ↓
auth
    ↓
private route
```

`auth` does not run for `/public`.

---

# 9. Multiple Middleware

You can have multiple middleware functions before a route.

```js
app.post(
    "/user",
    logger,
    validateUser,
    auth,
    createUser
);
```

Execution:

```text
Request
  ↓
logger
  ↓ next()
validateUser
  ↓ next()
auth
  ↓ next()
createUser
  ↓
Response
```

This allows each middleware to have **one responsibility**.

---

# 10. Middleware Can Modify `req`

Middleware can attach custom information to the request object.

Example:

```js
const requestInfo = (req, res, next) => {

    req.requestInfo = {
        source: "API",
        version: "v1"
    };

    next();
};
```

Then the route can access it:

```js
app.get("/profile", (req, res) => {

    res.json({
        message: "Profile",
        requestInfo: req.requestInfo
    });

});
```

### Flow

```text
Request
  ↓
requestInfo middleware
  ↓
req.requestInfo = {...}
  ↓
next()
  ↓
Route
  ↓
req.requestInfo available
```

### Important

`req.user`, `req.requestInfo`, etc. are **custom properties attached to the request object**.

They are not route parameters.

---

# 11. Later Middleware Can Overwrite `req`

Example:

```js
app.use((req, res, next) => {
    req.name = "Shikhar";
    next();
});

app.use((req, res, next) => {
    req.name = "Prakhar";
    next();
});
```

The route receives:

```js
req.name
```

as:

```text
Prakhar
```

because the second middleware overwrote the value.

### Rule

> Later middleware can modify or overwrite changes made by earlier middleware.

---

# 12. Authentication Middleware

Authentication middleware checks whether a request is allowed to continue.

Example:

```js
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
```

Used as:

```js
app.get("/private", auth, (req, res) => {
    res.send("Private Account");
});
```

### Valid request

```text
Authorization: secret123
```

Flow:

```text
Request
  ↓
auth
  ↓
Token valid
  ↓
next()
  ↓
private route
```

### Invalid request

```text
Authorization: wrong
```

Flow:

```text
Request
  ↓
auth
  ↓
Token invalid
  ↓
401 response
  ↓
STOP
```

The route does not execute.

---

# 13. Why `return` is Important in Authentication

Correct:

```js
if (!token) {
    return res.status(401).json({
        message: "Unauthorized"
    });
}

next();
```

The `return` exits the middleware.

Without properly stopping execution, you could accidentally continue processing the request after sending a response.

### General pattern

```text
Invalid request
     ↓
return response
     ↓
STOP

Valid request
     ↓
next()
     ↓
CONTINUE
```

---

# 14. `express.json()`

Express provides built-in middleware for parsing JSON request bodies:

```js
app.use(express.json());
```

Suppose the client sends:

```json
{
    "name": "Shikhar",
    "age": 21
}
```

After `express.json()` processes the request:

```js
req.body
```

contains:

```js
{
    name: "Shikhar",
    age: 21
}
```

---

# 15. Middleware Order and `express.json()`

Correct:

```js
app.use(express.json());

app.post("/user", (req, res) => {
    console.log(req.body);
});
```

Flow:

```text
Request
  ↓
express.json()
  ↓
req.body populated
  ↓
POST /user
```

If the route is registered before the JSON middleware:

```js
app.post("/user", handler);

app.use(express.json());
```

the route can execute before the JSON parser gets a chance to populate `req.body`.

### Rule

> Middleware only affects requests after the point where it is registered.

---

# 16. Middleware Can Block Requests

Middleware doesn't always have to call `next()`.

For example:

```js
const auth = (req, res, next) => {

    if (!authorized) {
        return res.status(401).json({
            message: "Unauthorized"
        });
    }

    next();
};
```

There are two possible outcomes:

```text
             Middleware
                 │
       ┌─────────┴─────────┐
       ↓                   ↓
   Authorized          Unauthorized
       ↓                   ↓
    next()              Response
       ↓                   ↓
   Continue               STOP
```

---

# 17. Error-Handling Middleware

Normal middleware:

```js
(req, res, next) => {
    // ...
}
```

Error-handling middleware has **four parameters**:

```js
(err, req, res, next) => {
    // handle error
}
```

Example:

```js
app.use((err, req, res, next) => {

    res.status(500).json({
        success: false,
        message: err.message
    });

});
```

The first parameter:

```js
err
```

is what distinguishes error-handling middleware from normal middleware.

---

# 18. `next(error)`

To pass an error to Express:

```js
next(new Error("Something went wrong"));
```

Example:

```js
app.get("/test", (req, res, next) => {

    return next(new Error("Something went wrong"));

});
```

Express looks for error-handling middleware.

```text
Route
  ↓
next(error)
  ↓
Error-handling middleware
  ↓
Response
```

---

# 19. `next(error)` vs `next()`

### Normal flow

```js
next();
```

Means:

```text
Continue normal middleware chain
```

### Error flow

```js
next(error);
```

Means:

```text
Something went wrong
        ↓
Go to error-handling middleware
```

---

# 20. Error Handler Must Come After Routes

Typical structure:

```js
app.get("/user", userHandler);

app.get("/product", productHandler);

// Error handler LAST
app.use((err, req, res, next) => {
    // handle error
});
```

Think of the error handler as the application's **central safety net**.

---

# 21. Centralized Error Handling

Instead of every route manually creating an error response:

```js
app.get("/user/:id", (req, res, next) => {

    const user = findUser();

    if (!user) {
        return next(new Error("User not found"));
    }

    res.json(user);
});
```

The common error handler handles the response:

```js
app.use((err, req, res, next) => {

    res.status(404).json({
        success: false,
        message: err.message
    });

});
```

This means different routes can pass different errors:

```text
User route
    ↓
User not found
    ↓
next(error)
    ↓
Central error handler

Product route
    ↓
Product not found
    ↓
next(error)
    ↓
Central error handler
```

---

# 22. `res.send()` / `res.json()` vs `next(error)`

These are different actions.

### Send response

```js
return res.json(user);
```

Means:

> The request was handled successfully.

### Pass error

```js
return next(new Error("User not found"));
```

Means:

> This request encountered an error; let the error-handling system handle it.

---

# 23. Important Pattern: `return res...`

When sending a response inside a conditional:

```js
if (!user) {
    return res.status(404).json({
        message: "User not found"
    });
}
```

The `return` prevents the function from continuing.

Similarly:

```js
if (!user) {
    return next(new Error("User not found"));
}
```

The `return` prevents code after it from executing.

---

# 24. Common Mistakes to Remember

### Mistake 1 — Forgetting `next`

Wrong:

```js
const logger = (req, res, next) => {
    console.log(req.method);
};
```

The request won't continue.

Correct:

```js
const logger = (req, res, next) => {
    console.log(req.method);
    next();
};
```

---

### Mistake 2 — Forgetting `next` in route parameters

Wrong:

```js
app.get("/user/:id", (req, res) => {
    next(error);
});
```

`next` isn't defined.

Correct:

```js
app.get("/user/:id", (req, res, next) => {
    next(error);
});
```

---

### Mistake 3 — Sending response and then continuing

Avoid:

```js
if (user) {
    res.json(user);
}

next(error);
```

Use:

```js
if (user) {
    return res.json(user);
}

return next(error);
```

---

### Mistake 4 — Error handler before routes

Avoid:

```js
app.use(errorHandler);

app.get("/user", handler);
```

Prefer:

```js
app.get("/user", handler);

app.use(errorHandler);
```

---

### Mistake 5 — Returning 200 for an error

This:

```js
res.json({
    message: "User not found"
});
```

normally sends:

```text
200 OK
```

Use:

```js
res.status(404).json({
    message: "User not found"
});
```

---

### Mistake 6 — Hard-coding the error message

Avoid:

```js
const errorHandler = (err, req, res, next) => {

    res.json({
        message: "User not found"
    });

};
```

Better:

```js
const errorHandler = (err, req, res, next) => {

    res.status(404).json({
        success: false,
        message: err.message
    });

};
```

This allows the same handler to handle different errors.

---

# 25. Complete Middleware Flow

A simple Express application can look like:

```js
const express = require("express");

const app = express();

// Global middleware
app.use(express.json());

app.use(logger);
app.use(requestInfo);

// Routes
app.get("/public", publicHandler);

app.get("/private", auth, privateHandler);

app.post("/user", auth, validateUser, createUser);

// Centralized error handler
app.use(errorHandler);

app.listen(3000);
```

Conceptually:

```text
                     Request
                        ↓
                  express.json()
                        ↓
                     logger
                        ↓
                  requestInfo
                        ↓
              ┌─────────┴─────────┐
              ↓                   ↓
           /public             /private
                                  ↓
                                 auth
                                  ↓
                               validate
                                  ↓
                                route
                                  ↓
                               response

              Any error
                   ↓
             errorHandler
                   ↓
                response
```

---

# 26. Mental Model

Whenever you see an Express request, think:

```text
1. Where does the request enter?

2. Which middleware is registered before the route?

3. Does each middleware call next()?

4. Does any middleware modify req?

5. Does any middleware block the request?

6. Which route matches?

7. Does the route send a response?

8. Does it call next(error)?

9. Is there an error handler after the routes?
```

If you can answer these questions, you can trace most basic Express middleware behavior.

---

# 27. Quick Revision Checklist

Before moving forward, you should be able to explain:

* [X] What middleware is
* [x] `req`, `res`, `next`
* [x] `next()`
* [x] `return next()`
* [x] Middleware execution order
* [x] Global middleware
* [x] Route-specific middleware
* [x] Multiple middleware
* [x] Modifying `req`
* [x] Authentication middleware
* [x] Blocking requests
* [x] `express.json()`
* [x] Why middleware order matters
* [x] `next(error)`
* [x] Error-handling middleware
* [x] Centralized error handling
* [x] Correct use of `return res...`
* [x] Correct use of `return next(...)`
* [x] HTTP status codes for errors

---

# 28. The Three Patterns to Memorize

### Continue

```js
next();
```

### Stop with response

```js
return res.status(401).json({
    message: "Unauthorized"
});
```

### Stop current function and pass error

```js
return next(new Error("Something went wrong"));
```

These three patterns cover a **huge portion of basic Express middleware logic**.

---

## What's next?

The next topic is **Validation Middleware**.

We'll take:

```json
{
    "name": "Shikhar",
    "age": 21
}
```

and build middleware that validates the request **before it reaches the route/controller**.

After that, we'll move toward:

```text
Routes
   ↓
Middleware
   ↓
Controllers
   ↓
Services
   ↓
Database
```

which is where we'll start transitioning from basic Express into proper backend architecture.
