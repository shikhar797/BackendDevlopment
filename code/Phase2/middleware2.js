const express=require('express')
const app=express()

const logger=(req,res,next)=>{
    console.log(`Method:${req.method}`)
    console.log(`URl:${req.url}`)
    next()
}

const auth=(req,res,next)=>{
    console.log("User verified")
    next()
}
//global middleware
app.use(logger)

app.get('/public',(req,res)=>{
    res.send("Public account")
})
// app.use(auth)
app.get('/private',auth,(req,res)=>{  //route specific middleware here
    res.send('Private Account')
})

app.listen(3000)