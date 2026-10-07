# Express.js Controllers

## 1. What is a Controller?

A **controller** is the part of an Express application that handles an HTTP request after middleware has completed its job.

A controller typically:
- Reads data from `req`
- Coordinates the operation
- Decides the HTTP response
- Sends the response using `res`

Example:

```js
const createUser = (req, res) => {
    res.status(201).json({
        success: true,
        message: "User created successfully",
        user: req.body
    });
};
```

Controllers should focus mainly on **HTTP-level responsibilities**, rather than containing all business logic or database code.

---

## 2. Why Do We Need Controllers?

You can put everything directly inside a route:

```js
app.post('/user', validate(userSchema), (req, res) => {
    res.status(201).json({
        success: true,
        user: req.body
    });
});
```

This works, but routes can become difficult to maintain as the application grows.

Instead, extract the request handler:

```js
const createUser = (req, res) => {
    res.status(201).json({
        success: true,
        user: req.body
    });
};

app.post('/user', validate(userSchema), createUser);
```

This gives a clear separation:

```text
Route      → endpoint and middleware composition
Controller → HTTP request/response handling
```

---

# 3. Route vs Controller

This distinction is important.

### Route

A route defines:
- HTTP method
- URL/path
- Middleware
- Controller

```js
app.post('/user', validate(userSchema), createUser);
```

### Controller

The controller handles the request:

```js
const createUser = (req, res) => {
    res.status(201).json({
        success: true,
        message: "User created successfully",
        user: req.body
    });
};
```

Mental model:

```text
Route      = WHERE and WHEN
Controller = WHAT HTTP operation to perform
```

---

# 4. Request Flow

At the current stage:

```text
Client
  ↓
Route
  ↓
Middleware
  ↓
Controller
  ↓
HTTP Response
  ↓
Client
```

Later, the architecture will become:

```text
Client
  ↓
Route
  ↓
Middleware
  ↓
Controller
  ↓
Service
  ↓
Database
```

---

# 5. `req` Inside Controllers

Controllers can access information from the request.

## Route Parameters

For:

```text
GET /user/10
```

Route:

```js
app.get('/user/:id', getUser);
```

Controller:

```js
const getUser = (req, res) => {
    const userId = Number(req.params.id);

    res.json({
        userId: userId
    });
};
```

`req.params.id` is normally a string, so conversion may be required:

```js
Number(req.params.id)
```

---

## Query Parameters

For:

```text
GET /user?age=21
```

Controller:

```js
const getUsers = (req, res) => {
    const age = req.query.age;

    res.json({
        age: age
    });
};
```

Use:

```js
req.query
```

for query parameters.

---

## Request Body

For:

```text
POST /user
```

with:

```json
{
    "name": "Shikhar",
    "age": 21
}
```

Controller:

```js
const createUser = (req, res) => {
    const user = req.body;

    res.status(201).json({
        success: true,
        user: user
    });
};
```

JSON parsing must be enabled:

```js
app.use(express.json());
```

---

# 6. Middleware + Controller

Validation middleware:

```js
function validate(schema) {
    return (req, res, next) => {
        const result = schema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                errors: result.error.issues
            });
        }

        req.body = result.data;
        next();
    };
}
```

Controller:

```js
const createUser = (req, res) => {
    res.status(201).json({
        success: true,
        message: "User created successfully",
        user: req.body
    });
};
```

Route:

```js
app.post(
    '/user',
    validate(userSchema),
    createUser
);
```

Flow:

```text
POST /user
    ↓
validate(userSchema)
    ↓
createUser
    ↓
201 Response
```

If validation fails:

```text
POST /user
    ↓
validate(userSchema)
    ↓
400 Response
```

The controller is never reached.

---

# 7. PATCH Controller

For:

```text
PATCH /user/5
```

Route:

```js
app.patch(
    '/user/:id',
    validate(updatedUserSchema),
    updateUser
);
```

Controller:

```js
const updateUser = (req, res) => {
    const userId = Number(req.params.id);

    res.status(200).json({
        success: true,
        message: "User updated successfully",
        userId: userId,
        updatedData: req.body
    });
};
```

Important distinction:

```text
req.params.id
    ↓
Which user?

req.body
    ↓
What should change?
```

Example:

```text
PATCH /user/5
```

Body:

```json
{
    "age": 22
}
```

Then:

```js
req.params.id // "5"
req.body      // { age: 22 }
```

---

# 8. POST vs PATCH

### POST

Usually creates a resource:

```js
const createUser = (req, res) => {
    res.status(201).json({
        success: true,
        message: "User created successfully",
        user: req.body
    });
};
```

Successful creation commonly uses:

```text
201 Created
```

### PATCH

Usually partially updates a resource:

```js
const updateUser = (req, res) => {
    const userId = Number(req.params.id);

    res.status(200).json({
        success: true,
        message: "User updated successfully",
        userId,
        updatedData: req.body
    });
};
```

Successful update commonly uses:

```text
200 OK
```

---

# 9. Controllers Should Not Become Huge

Avoid putting everything into a controller:

```js
const createUser = async (req, res) => {
    // validation
    // business rules
    // database queries
    // email
    // payment
    // response
};
```

As the application grows, this becomes difficult to maintain.

A better architecture is:

```text
Route
  ↓
Middleware
  ↓
Controller
  ↓
Service
  ↓
Database
```

The controller coordinates the HTTP operation. The service handles application/business logic.

---

# 10. Controller vs Service

### Controller

Concerned primarily with HTTP:

```js
const createUser = async (req, res) => {
    const user = await userService.createUser(req.body);

    res.status(201).json({
        success: true,
        user
    });
};
```

The controller knows about:

```text
req
res
HTTP status codes
HTTP response
```

### Service

Concerned with application/business logic:

```js
const createUser = async (userData) => {
    // business rules
    // data operations
    return user;
};
```

A service should generally not depend on:

```text
req
res
Express routes
HTTP status codes
```

---

# 11. Good Controller Example

```js
const createUser = (req, res) => {
    const user = req.body;

    res.status(201).json({
        success: true,
        message: "User created successfully",
        user: user
    });
};
```

Route:

```js
app.post(
    '/user',
    validate(userSchema),
    createUser
);
```

Responsibilities are separated:

```text
Route
    → endpoint composition

Middleware
    → validation

Controller
    → HTTP response
```

---

# 12. Common Mistakes

## Mistake 1: Unnecessary Handler After Controller

Wrong:

```js
app.post(
    '/user',
    validate(userSchema),
    createUser,
    (req, res) => {
    }
);
```

If `createUser` sends the response, the extra handler is unnecessary.

Correct:

```js
app.post(
    '/user',
    validate(userSchema),
    createUser
);
```

---

## Mistake 2: Mixing `req.params` and `req.body`

For:

```text
PATCH /user/10
```

```js
req.params.id
```

means:

```text
Which user?
```

while:

```js
req.body
```

means:

```text
What changes?
```

---

## Mistake 3: Wrong Creation Status

Avoid:

```js
res.status(200)
```

for a successful creation when `201 Created` is appropriate.

Prefer:

```js
res.status(201)
```

---

## Mistake 4: Sending Two Responses

Wrong:

```js
res.json({ success: true });
res.json({ message: "Another response" });
```

A request should receive one HTTP response.

---

## Mistake 5: Continuing After Sending a Response

Be careful:

```js
if (!user) {
    res.status(404).json({
        message: "User not found"
    });
}

res.json(user);
```

Prefer:

```js
if (!user) {
    return res.status(404).json({
        message: "User not found"
    });
}

res.json(user);
```

`return` stops the current controller function.

---

# 13. Controller Naming

Use names that describe the operation:

```text
createUser
getUser
getUsers
updateUser
deleteUser
createProduct
getProduct
```

Avoid vague names:

```text
handle
process
doSomething
function1
```

Common CRUD naming:

```text
create
get
update
delete
```

---

# 14. Controller Files

As the project grows, controllers can be separated into files:

```text
controllers/
    user.controller.js
    product.controller.js
```

Example:

```js
// controllers/user.controller.js

const createUser = (req, res) => {
    // ...
};

const getUser = (req, res) => {
    // ...
};

const updateUser = (req, res) => {
    // ...
};

const deleteUser = (req, res) => {
    // ...
};

module.exports = {
    createUser,
    getUser,
    updateUser,
    deleteUser
};
```

Then routes can import them:

```js
const {
    createUser,
    getUser,
    updateUser,
    deleteUser
} = require('../controllers/user.controller');
```

This file structure will become more important when the project architecture grows.

---

# 15. Controller Checklist

Before moving forward, you should understand:

- [ ] What a controller is
- [ ] Why controllers exist
- [ ] Route vs controller
- [ ] `req.params`
- [ ] `req.query`
- [ ] `req.body`
- [ ] Middleware → controller flow
- [ ] POST controller
- [ ] PATCH controller
- [ ] HTTP status codes
- [ ] Why `return` matters after a response
- [ ] Why controllers should not contain all business logic
- [ ] Controller vs service

---

# 16. Mental Model

Remember:

```text
ROUTE
"What endpoint is this?"

MIDDLEWARE
"Should this request continue?"

CONTROLLER
"What HTTP response should I produce?"

SERVICE
"What should the application actually do?"

DATABASE
"Where is the data stored?"
```

The next architectural step is:

```text
Route → Middleware → Controller → Service
```

The Service layer will take responsibility for application/business logic.
