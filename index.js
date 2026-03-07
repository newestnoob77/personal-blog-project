import "./env.js";
import express from "express";
import session from "express-session";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __filename=fileURLToPath(import.meta.url);
const __dirname=path.dirname(__filename);
const server=express()
server.set("view engine","ejs")
server.set("views",path.join(__dirname,"views"));
server.use(express.urlencoded({extended:true}))
server.use(session({
    secret:process.env.SESSION_SECRET,
    resave:false,
    saveUninitialized:false
}))
const articleDir =path.join(__dirname,"data","article")

server.get("/home",(req,res)=>{
const files=fs.readdirSync(articleDir)
const articles=files.map(file=>{
    const content=fs.readFileSync(path.join(articleDir,file),"utf-8")
    return JSON.parse(content)
})

res.render("home",{articles})
})
server.get("/article/:id",(req,res)=>{
    const {id}=req.params
const filePath=path.join(articleDir,`${id}.json`)
if(!fs.existsSync(filePath))return res.status(404).send("Article not found")
    const article=fs.readFileSync(filePath,"utf-8")
res.render("article",{article:JSON.parse(article)})
})
server.get("/login",(req,res)=>{
    res.render("login",{error:null})
})
server.post("/login",(req,res)=>{
    const {username,password}=req.body
    console.log(username,password)
    console.log("ENV USERNAME:", process.env.ADMIN_USERNAME);
console.log("ENV PASSWORD:", process.env.ADMIN_PASSWORD);
    if(username===process.env.ADMIN_USERNAME
 && password===process.env.ADMIN_PASSWORD){
req.session.isAdmin=true
return res.redirect("/admin")
    }
    else{
        return res.render("login",{error:"Invalid credentials"})
    }
})
server.get("/admin",(req,res)=>{
    if(!req.session.isAdmin){
        return res.status(400).send("Access denied")
    }
    else{
        const files=fs.readdirSync(articleDir)
        const articles=files.map(file=>{
            const content=fs.readFileSync( path.join(articleDir,file),"utf-8")
            return JSON.parse(content)
        })
        res.render("admin",{articles})
    }
})
server.get("/add",(req,res)=>{
    if(!req.session.isAdmin){
        return res.status(400).send("Access denied")
    }
    else{
        res.render("add")
    }
})



server.post("/add",(req,res)=>{
    if(!req.session.isAdmin){
        return res.status(400).send("Access denied")
    }else{
        const {title,content,date}=req.body;
        const newArticle={
            id:title,
            title:title,
            content:content,
            date:date
        }
        fs.writeFileSync(path.join(articleDir,`${newArticle.id}.json`), JSON.stringify(newArticle), "utf-8");
        res.redirect("/admin")
    }
})
server.get("/edit",(req,res)=>{
    if(!req.session.isAdmin){
        return res.status(400).send("Access denied")
    }
    else{
        const {id}=req.query
        if (!id) return res.status(400).send("Missing article ID");


        const filePath=path.join(articleDir,`${id}.json`)
        if(!fs.existsSync(filePath))return res.status(404).send("Article not found")
            const article=JSON.parse(fs.readFileSync(filePath,"utf-8"))
        return res.render("edit",{article})
    }
})
server.post("/edit",(req,res)=>{
    if(!req.session.isAdmin){
        return res.status(400).send("Access denied")
    }
    else{
        const {id,title,content,date}=req.body;
        const oldFilePath=path.join(articleDir,`${id}.json`)
        if(!fs.existsSync(oldFilePath))return res.status(404).send("Article not found")
        const newFilePath=path.join(articleDir,`${title}.json`)
    if(id!==title){
        
    try{
fs.renameSync(oldFilePath,newFilePath)
    }
    catch(err){
        console.log(err)
        return res.status(500).send("Error renaming file")
    }
    }
         const updatedArticle={
        id:title,
        title:title,
        content:content,
        date:date
    }
    fs.writeFileSync(newFilePath,JSON.stringify(updatedArticle),"utf-8")
    res.redirect("/admin")
    }
})
server.post("/delete/:id",(req,res)=>{
    if(!req.session.isAdmin){
        return res.status(400).send("Access denied")
    }else{
        const {id}=req.params
        if (!id) return res.status(400).send("Missing article ID");
        const filePath=path.join(articleDir,`${id}.json`)
        if(!fs.existsSync(filePath))return res.status(404).send("Article not found")
            fs.unlinkSync(filePath)
        res.redirect("/admin")
        console.log(`Deleted article with id: ${id}`)
    }
})
server.listen(3000,()=>{
    console.log("Server is running on port 3000")
})