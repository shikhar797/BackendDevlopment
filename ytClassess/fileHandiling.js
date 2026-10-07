const fs=require('fs')


//syncronus
//return something
fs/fs.writeFileSync('./details.txt',"name:Shikhar\nage:20")

//asynchronnus
//do not return anything
fs/fs.writeFileSync('./details.txt',"name:Shikhar\nage:20",(err)=>{
    console.log("Error",err)
})


//syncronus
//return result
console.log(fs.readFileSync('./details.txt','utf-8'))


//asyncronus
//do not return anything
fs.readFile('./details.txt','utf-8',(err,result)=>{
    if(err){
        console.log(err)
    }
    else console.log(result)
})

fs.mkdir('sample/a/b',{recursive:true},(err)=>{})