tags:

* backend

* web-development

* networking

* nodejs

* express

* api

* notes
  date: 2026-09-24
  type: permanent-note

# 🚀 Backend & Web Development Fundamentals

## 📍 Core Concepts

### Q1. Definition of a Server?

**Ans:** A server is a program/process that provides a service to another program (client).

```
Client  ───── request ─────>  Server
Client  <──── response ─────  Server

```

### Q2. Frontend vs Backend

#### 🎨 Frontend

The part of the application that runs on the client side, usually the browser.

* **Examples:** `HTML`, `CSS`, `JavaScript`, `React`, `Angular`, `Vue`

* **Responsibilities:**

  * UI Design & Layout

  * User interaction

  * Displaying data

  * Sending requests

  * Basic client-side validation

#### ⚙️ Backend

The server-side application responsible for core application logic and data management.

* **Responsibilities:**

  * Business logic

  * Authentication

  * Authorization

  * Database access

  * APIs

  * Validation

  * Processing

  * Communication with other services

### Q3. What happens when you type google.com?

```
https://google.com
    │
    ▼
 Browser
    │
    ▼
   DNS
    │
    ▼
IP address
    │
    ▼
TCP connection
    │
    ▼
TLS handshake
    │
    ▼
HTTPS request
    │
    ▼
 Server
    │
    ▼
 Response
    │
    ▼
 Browser

```

> \[!INFO\] Additional Components Involved
>
> * **DNS caching**
>
> * **TCP/TLS Protocols**
>
> * **HTTP / HTTPS**
>
> * **CDNs (Content Delivery Networks)**
>
> * **Load Balancers**
>
> * **Reverse Proxies**
>
> * **Cookies & Local Storage**
>
> * **Caching & Compression**

### Q4. What is an API?

**Ans:** A defined interface through which one piece of software can interact with another piece of software.

### Q5. What is a Database?

**Ans:** A database is an organized system for storing and retrieving data.

### Q6. What is Authentication vs Authorization?

**Ans:**

* **Authentication:** Verifies *who you are*.

* **Authorization:** Determines *what you can do*.

## 🔑 Terminology Cheat Sheet

| **Term** | **Meaning** | 
| **Machine** | Physical / virtual computer | 
| **Server** | Program / Process providing a service | 
| **Backend** | Server-side application / business logic | 
| **Database** | System for storing / managing data | 
| **Database Server** | Server software providing database functionality | 
| **API** | Interface for software-to-software interaction | 
| **Client** | Program consuming a service | 

> \[!TIP\] Local Machine Analogy
>
> * **IP Address** $\rightarrow$ Which machine? *(e.g., Which building?)*
>
> * **Port** $\rightarrow$ Which service? *(e.g., Which apartment?)*

## 🌐 Networking & Data Transport

### Q. How do we reliably send data between two different machines?

That's where **TCP** comes in. TCP handles:

* Establishing a connection

* Ordering data packets

* Detecting lost packets

* Retransmitting missing data

* Detecting transmission errors

* Providing reliable, ordered byte-stream communication

*(Note: You don't normally implement this yourself—the operating system's networking stack handles TCP.)*

### Q. TCP vs HTTP

* **TCP:** Provides a reliable, ordered byte stream between two endpoints.

* **HTTP:** An application-layer protocol that defines how clients and servers structure and interpret requests and responses.

```
                 HTTP
        "GET /users HTTP/1.1"
                  ↓
                 TCP
        "reliably transport these bytes"
                  ↓
                  IP
        "deliver them to this machine"

```

#### 🛠️ `curl` (Client URL)

`curl` is used to send HTTP requests directly from the terminal without using GUI clients like Postman.

```
curl http://localhost:3000/user \
     -H "Content-Type: application/json" \
     -d '{"user":"Tannu","age":"22"}'

```

### Q. Parameters in HTTP?

**Ans:** An HTTP parameter is a key-value pair used to send additional data or instructions from a client (like a web browser or app) to a web server.

**Types of parameters:**

1. **Query Parameter** (e.g., `/users?age=30`)

2. **Route Parameter** (e.g., `/users/:id`)

## ⚡ Problems with Node.js Resolved by Express

1. **Query string broke matching:**

   * *Node.js:* `req.url === "/user"` failed when URL was `/user?age=30`.

   * *Express:* Routes match the path automatically.

2. **Manual URL parsing:**

   * *Node.js:* Requires `new URL(req.url, base)`.

   * *Express:* Provides `req.query` as a pre-parsed object.

3. **Route params:**

   * *Node.js:* Requires regex or manual parsing like `split("/")`.

   * *Express:* Built-in syntax `/user/:userId` accessible via `req.params.userId`.

4. **Reading the body:**

   * *Node.js:* Requires manual event listeners `req.on("data", ...)` and `req.on("end", ...)`, followed by `JSON.parse()`.

   * *Express:* Middleware `app.use(express.json())` populates `req.body` directly.

5. **Routing and responses:**

   * *Node.js:* Requires complex `if/else` chains, `writeHead()`, and `JSON.stringify()`.

   * *Express:* Simplified syntax like `app.get(...)` and `res.json(...)`.



   1. Status codes

You've already encountered 404.

Let's establish the important ones:

Code	Meaning	Typical use
200	OK	Successful GET/request
201	Created	Successfully created resource
204	No Content	Success with no response body
400	Bad Request	Client sent invalid data
401	Unauthorized	Authentication required/failed
403	Forbidden	Authenticated but not allowed
404	Not Found	Resource/route doesn't exist
405	Method Not Allowed	Route exists, method isn't supported
409	Conflict	Request conflicts with current state
500	Internal Server Error	Unexpected server-side failure

Don't memorize all of these yet. Understand the categories first.