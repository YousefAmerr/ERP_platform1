import express from 'express'
import 'colors'
import cors from 'cors'
import {connectDB} from './config/database.js'
import morgan from 'morgan'
import UserRoute from './routes/UserRoute.js'

//check 
connectDB();

const app = express()

//middlewares
app.use(express.json())
app.use(cors())
app.use(morgan("dev"))


//routes
app.use('/api/v1/user',UserRoute)


app.use((err,req,res,next) =>{
    console.error(err)
    res.status(500).send("smothing broke")
})


//PORT 
const PORT = process.env.PORT


app.listen(PORT, () => {
console.log(('server is running on port ' + PORT).bgCyan.white);
});


