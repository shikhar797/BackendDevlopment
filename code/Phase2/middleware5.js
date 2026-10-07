const express=require('express')

const app=express()

app.use(express.json())

app.get('/user/:id',(req,res,next)=>{
    const user_id=Number(req.params.id);

    if(user_id===1){
        return res.json({'user_id':1,'name':'Shikhar'})
    }
    return next(new Error("User not found"))
})


app.get('/product/:id',(req,res,next)=>{
    const product_id=Number(req.params.id);

    if(product_id===1){
        return res.json({product_id: 1,name: "Laptop"})
    }
    return next(new Error("product not found"))
})

const errorHandler=(err,req,res,next)=>{
    res.status(404).json({
        success:false,
        message:err.message
    })
}
app.use(errorHandler)

app.listen(3000)
