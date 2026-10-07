const express=require('express')
const app=express()
const {z}=require('zod')
app.use(express.json())

const userSchema = z.object({

    name: z.string()
        .trim()
        .min(1, "Name is required")
        .regex(/^[A-Za-z ]+$/, "Name must contain only letters"),

    age: z.number()
        .min(18, "Age must be at least 18"),

    email: z.email({
        message: "Invalid email address"
    })

});

const productSchema=z.object({
    name:z.string().trim().min(2,"Product name is required"),
    price:z.number().min(1)
})


function validate(schema){
    return (req,res,next)=>{
        const result=schema.safeParse(req.body);
        if(!result.success){
            return res.status(400).json({
                success:false,
                errors:result.error.issues
            })
        }
        req.body=result.data
        next()
    }
}

app.post('/user',validate(userSchema),(req,res)=>{
    res.status(200).json({
        success:true,
        message:"User validated successfully",
        user:req.body
    })
})

app.post('/product',validate(productSchema),(req,res)=>{
    res.status(200).json({
        success:true,
        message:"Product validated successfully",
        user:req.body
    })
})


app.listen(3000)