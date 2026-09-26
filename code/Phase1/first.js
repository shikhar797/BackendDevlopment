//creating our first server in node js
const http=require('http');
const { url } = require('inspector');

const server=http.createServer((req,res)=>{
    res.end("Hello this is my first server") //this send the last chunk of information and ends the server
});





//instead of res.end() we can write res.write() which send the large chunk of data but you still have to end the server by res.end()


//req->Contains information about what the client is asking for.

//res->Allows your server to construct the response.

const server1=http.createServer((req,res)=>{
    console.log(req.url)  //this will give url 
    console.log(req.method) //this will give any of the one method it is  GET,PUT,POST,DELETE 
    console.log(req.headers)
    console.log(req.headers['content-type'])
    console.log(req.headers['content-length'])


    res.end("Ending the server resposne")
})



//now say we have to return different response for different URL
const server2=http.createServer((req,res)=>{
    if(req.method=="GET" && req.url==="/user"){
        res.write("User1:Shikhar")     //always remeber it return a string not json not anything
        res.end("Displayed all users")
    }
    else if(req.method=="GET" && req.url==="/product"){
        res.write("Product1 \n")
        res.end("Displayed all Products")
    }
    else{
        res.end("No valid URL")
    }
})



const server3=http.createServer((req,res)=>{
    if(req.method==="GET" && req.url==="/user"){
        res.end("User page")
    }
    else if(req.method==="GET" && req.url==="/home"){
        res.end("Home Page")
    }
    else if(req.method==="GET" && req.url==="/product"){
        res.end("Products Page")
    }
    else{
        res.end("No valid URL")
    }
})



const server4=http.createServer((req,res)=>{
    if(req.method==="POST" && req.url==="/user"){
        let body=""   //in node js there is no function to read body of the post so we will read it manually

        req.on('data',chunk=>{            //'data' and 'end' are events on the request stream
            body+=chunk.toString()
        })
        req.on('end',()=>{
            const user=JSON.parse(body)
            console.log(user.user)
            console.log(user.age)
            res.end("Ending the server")

        })
    }
    else{
        res.end("Ending the server")

    }
})


const server5 =http.createServer((req,res)=>{
    if(req.method==="POST" && req.url==="/user"){
        let body=""
        req.on('data',chunk=>{
            body+=chunk
        })
        req.on('end',()=>{
            if(req.headers['content-type']==='application/json'){
                const user=JSON.parse(body)
                console.log(user.user)
                console.log(user.age)
            }
            else{
                console.log(body)
            }
            res.end("User data recived \nEnd Server \n")
        })
        
    }
})


const server6=http.createServer((req,res)=>{
    if(req.method==="GET"){ 
        //new URL(input, base) and forms a complete url
        const myUrl=new URL(req.url,`http://${req.headers.host}`)
        console.log(myUrl.protocol);  // 'https:'
        console.log(myUrl.host);      // 'example.com:8080' or 'localhost:3000'
        console.log(myUrl.hostname);  // 'example.com' or 'localhost'
        console.log(myUrl.port);      // '3000'
        console.log(myUrl.pathname);  // '/user'
        console.log(myUrl.search);    // '?user=alice&id=123'
    }
    res.end("Ending the server")
})




const server7=http.createServer((req,res)=>{
    if(req.method==="GET"){
        //parse the query parameter
        const myurl=new URL(req.url,`http://${req.headers.host}`)
        console.log("age:",myurl.searchParams.get('age'))
        //we can get the value of query paramter using 
        //value=url.searchParams.get('key')
    }
})




//now i want to like print all the key value pair of query paramtere    
const server8=http.createServer((req,res)=>{
    if(req.method==="GET"){
        //parse the query parameter
        const myurl=new URL(req.url,`http://${req.headers.host}`)
        for(const [key,value] of myurl.searchParams){
            console.log(`{${key}:${value}}`)
        }
        //this will give all the key value pair of query parameter
        console.log(myurl.searchParams)
    }
    res.end("Ending the server")
})



//now implementing route paramter and trying to print it
const server9=http.createServer((req,res)=>{
    if(req.method==="GET"){
        const myurl=new URL(req.url,`http://${req.headers.host}`)
        console.log(myurl.pathname)
        const user_path=myurl.pathname
        const arr=user_path.split('/')
        console.log(arr)

    }
    res.end("Srever is closing")
})


function isNumeric(value) {
    return /^\d+$/.test(value);
}
const server10=http.createServer((req,res)=>{
    if(req.method==="GET"){
        const myurl=new URL(req.url,`http://${req.headers.host}`)
        const url_commponent=myurl.pathname.split('/')
        const id=myurl.pathname.split('/')[2]
        const user={
            "id":id,
            "name":myurl.searchParams.get('name'),
            "age":myurl.searchParams.get('age')
        }
        res.statusCode=200
        res.setHeader("Content-Type","application/json")
        res.end(JSON.stringify(user))
        if(url_commponent[1]!=="user" || url_commponent.length<3 || !isNumeric(url_commponent[2])){
            res.statusCode=404
            res.end("Page not Found")
        }
    }
    else{
        res.statusCode=404
        res.end("Page not Found")
    }
})

server10.listen(3000,()=>{
    console.log("server is listening in port number 3000")
});Post