import express from 'express'
import {getDatabaseTableeee} from './models/test.js'
const app = express()

app.get("/notes", async (req,res) =>{
    const notes = await getDatabaseTableeee()
    res.send(notes)
})

app.use((err,req,res,next) =>{
    console.error(err)
    res.status(500).send("smothing broke")
})

app.listen(8080, () =>{
    console.log('server is running on port 8080')
})