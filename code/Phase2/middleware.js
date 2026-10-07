const express=require('express')
const app=express()
const responseTime=require('response-time')

const logger = (req, res, next) => {
    console.log("Method:", req.method);
    console.log("URL:", req.url);

    next();
}
const timer=responseTime((req,res,time)=>{
    console.log(`${time.toFixed(2)}ms`)
})

const requestType=(req,res,next)=>{
    req.requestType="API"
    next()
}
app.use(logger)
app.use(timer)
app.use(requestType)

app.get('/',(req,res)=>{
    res.send("Hello")
})

app.listen(3000,()=>{
    console.log("Post is listening in port 3000")
})