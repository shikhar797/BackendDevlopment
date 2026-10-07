# Zod Validation in Express

## 1. What is Zod?

Zod is a TypeScript-first schema validation library that can also be used directly in JavaScript.

In a backend API, Zod is used to define what valid input should look like and validate incoming data such as `req.body`.

Instead of writing many manual checks:

```js
if (!name) ...
if (typeof age !== "number") ...
if (age < 18) ...
if (!email) ...
```

we define a schema:

```js
const userSchema = z.object({
    name: z.string(),
    age: z.number(),
    email: z.email()
});
```

---

## 2. Install Zod

```bash
npm install zod
```

Import it:

```js
const { z } = require("zod");
```

---

# 3. Schema

A schema describes the expected structure and validation rules of data.

Example:

```js
const userSchema = z.object({
    name: z.string(),
    age: z.number(),
    email: z.email()
});
```

This means:

- `name` must be a string
- `age` must be a number
- `email` must be a valid email
- all three fields are required by default

---

# 4. Common Zod Validators

## String

```js
z.string()
```

Example:

```js
name: z.string()
```

## Minimum length

```js
z.string().min(3)
```

With a custom message:

```js
z.string().min(3, "Name must contain at least 3 characters")
```

## Trim whitespace

```js
z.string().trim()
```

Example:

```js
name: z.string().trim()
```

This removes leading/trailing whitespace from the parsed value.

## Regular expression

```js
z.string().regex(/^[A-Za-z ]+$/, "Name must contain only letters")
```

Example:

```js
name: z.string()
    .trim()
    .min(1, "Name is required")
    .regex(/^[A-Za-z ]+$/, "Name must contain only letters")
```

---

# 5. Number

```js
z.number()
```

Example:

```js
age: z.number()
```

Minimum:

```js
age: z.number().min(18, "Age must be at least 18")
```

Maximum:

```js
age: z.number().max(100)
```

Important:

```js
z.number()
```

expects a JavaScript number.

Therefore:

```json
{
    "age": 21
}
```

is valid, while:

```json
{
    "age": "21"
}
```

is not valid unless you explicitly use coercion/transformation.

---

# 6. Email

A current Zod API can validate email with:

```js
z.email()
```

Example:

```js
email: z.email({
    message: "Invalid email address"
})
```

---

# 7. Object Schema

Most API request schemas are objects:

```js
const userSchema = z.object({
    name: z.string(),
    age: z.number(),
    email: z.email()
});
```

The incoming request body can then be checked against this schema.

---

# 8. safeParse()

The most important method for our Express middleware is:

```js
const result = userSchema.safeParse(req.body);
```

`safeParse()` does not throw an exception for validation failure.

It returns a result that is either successful or unsuccessful.

### Successful validation

Conceptually:

```js
{
    success: true,
    data: {
        name: "Shikhar",
        age: 21,
        email: "shikhar@gmail.com"
    }
}
```

So:

```js
result.success
```

is:

```js
true
```

and the validated data is:

```js
result.data
```

### Failed validation

Conceptually:

```js
{
    success: false,
    error: ...
}
```

So:

```js
result.success
```

is:

```js
false
```

and validation details are available through:

```js
result.error.issues
```

---

# 9. Zod Validation Middleware

A basic reusable Express middleware:

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

### Flow

```text
Request
   ↓
express.json()
   ↓
validate(schema)
   ↓
safeParse(req.body)
   ↓
 ┌───────────────┐
 │               │
INVALID         VALID
 │               │
400              ↓
response        req.body = result.data
                 ↓
               next()
                 ↓
             Route Handler
```

---

# 10. Using the Middleware

Create a schema:

```js
const userSchema = z.object({
    name: z.string().min(3),
    age: z.number().min(18),
    email: z.email()
});
```

Use it:

```js
app.post(
    "/user",
    validate(userSchema),
    (req, res) => {

        res.status(201).json({
            success: true,
            user: req.body
        });

    }
);
```

The route only receives data after it passes validation.

---

# 11. Why `validate(schema)`?

Instead of writing separate middleware for every resource:

```js
validateUser()
validateProduct()
validateOrder()
```

we create one generic function:

```js
function validate(schema) {
    return (req, res, next) => {
        // validate using the supplied schema
    };
}
```

Then:

```js
app.post("/user", validate(userSchema), handler);

app.post("/product", validate(productSchema), handler);

app.post("/order", validate(orderSchema), handler);
```

The schema changes, but the validation middleware remains reusable.

---

# 12. POST vs PATCH

For creation, fields are generally required:

```js
const createUserSchema = z.object({
    name: z.string().min(3),
    age: z.number().min(18),
    email: z.email()
});
```

For a partial update:

```js
const updateUserSchema = createUserSchema.partial();
```

Now all fields become optional.

Therefore:

```json
{
    "email": "new@gmail.com"
}
```

can be valid for PATCH.

But:

```json
{
    "age": "twenty"
}
```

is still invalid because if `age` is provided, it must still be a number.

---

# 13. PATCH Route

A typical route:

```js
app.patch(
    "/user/:id",
    validate(updateUserSchema),
    (req, res) => {

        const userId = Number(req.params.id);

        res.status(200).json({
            success: true,
            userId,
            updatedData: req.body
        });

    }
);
```

Remember:

```js
req.params.id
```

identifies **which resource** to update.

```js
req.body
```

contains **what should change**.

---

# 14. `result.data`

After successful validation:

```js
const result = schema.safeParse(req.body);
```

use:

```js
req.body = result.data;
```

This is useful because Zod may parse/transform the input.

For example, with:

```js
name: z.string().trim()
```

the parsed value can be the trimmed version.

Therefore, downstream code should use the validated/parsed data.

---

# 15. HTTP Status Codes

Validation failure should normally return:

```js
res.status(400)
```

because the client sent invalid data.

Common distinction:

```text
200 → successful request
201 → resource successfully created
400 → invalid request/input
401 → authentication required/failed
403 → authenticated but forbidden
404 → resource not found
500 → server-side error
```

Do NOT use:

```js
404
```

for validation errors.

---

# 16. Common Mistakes

## Mistake 1 — `typeof` comparison

Wrong:

```js
typeof age !== Number
```

Correct:

```js
typeof age !== "number"
```

`typeof` returns a string.

---

## Mistake 2 — Calling `status()` on Zod's result

Wrong:

```js
result.status(400)
```

Correct:

```js
res.status(400)
```

`result` belongs to Zod.

`res` belongs to Express.

---

## Mistake 3 — `issue` vs `issues`

Wrong:

```js
result.error.issue
```

Correct:

```js
result.error.issues
```

---

## Mistake 4 — Passing middleware as a string

Wrong:

```js
app.post("/user", "validateUser", handler);
```

Correct:

```js
app.post("/user", validateUser, handler);
```

---

## Mistake 5 — Forgetting `return`

Wrong:

```js
if (!result.success) {
    res.status(400).json(...);
}

next();
```

This can cause `next()` to execute after sending the error response.

Correct:

```js
if (!result.success) {
    return res.status(400).json(...);
}

next();
```

---

# 17. Complete Example

```js
const express = require("express");
const { z } = require("zod");

const app = express();

app.use(express.json());

const userSchema = z.object({

    name: z.string()
        .trim()
        .min(1, "Name is required")
        .regex(
            /^[A-Za-z ]+$/,
            "Name must contain only letters"
        ),

    age: z.number()
        .min(18, "Age must be at least 18"),

    email: z.email({
        message: "Invalid email address"
    })

});

const updateUserSchema = userSchema.partial();

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

app.post(
    "/user",
    validate(userSchema),
    (req, res) => {

        res.status(201).json({
            success: true,
            message: "User created successfully",
            user: req.body
        });

    }
);

app.patch(
    "/user/:id",
    validate(updateUserSchema),
    (req, res) => {

        const userId = Number(req.params.id);

        res.status(200).json({
            success: true,
            message: "User updated successfully",
            userId,
            updatedData: req.body
        });

    }
);

app.listen(3000);
```

---

# 18. Mental Model

Remember:

```text
Schema
  ↓
Describes valid data

safeParse()
  ↓
Checks the data

result.success
  ↓
Did validation pass?

result.data
  ↓
Validated/parsed data

result.error.issues
  ↓
Why validation failed

validate(schema)
  ↓
Reusable Express middleware

schema.partial()
  ↓
Useful for PATCH
```

---

# 19. Interview Questions

### Q1. Why use Zod instead of manual `if` statements?

Because schemas centralize validation rules, reduce repetitive code, provide structured errors, and can be reused across routes.

### Q2. What does `safeParse()` do?

It validates data without throwing on validation failure and returns a structured success/failure result.

### Q3. What's the difference between `result.data` and `req.body`?

`req.body` is the raw parsed request body. `result.data` is the data successfully parsed/validated by the Zod schema.

### Q4. Why use `.partial()` for PATCH?

PATCH usually allows updating only a subset of resource fields, so `.partial()` makes the schema fields optional while preserving their individual validation rules.

### Q5. Why is `validate(schema)` reusable?

Because it accepts any Zod schema and returns Express middleware that validates the request against that schema.

---

# 20. Checklist

You should now be comfortable with:

- [x] Installing Zod
- [x] `z.object()`
- [x] `z.string()`
- [x] `z.number()`
- [x] `z.email()`
- [x] `.min()`
- [x] `.regex()`
- [x] `.trim()`
- [x] `safeParse()`
- [x] `result.success`
- [x] `result.data`
- [x] `result.error.issues`
- [x] Reusable `validate(schema)`
- [x] `schema.partial()`
- [x] POST validation
- [x] PATCH validation
- [x] `req.params` vs `req.body`
- [x] Proper `400` validation responses