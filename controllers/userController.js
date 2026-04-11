import jwt from 'jsonwebtoken'
import { checkRole, findUserByEmail, matchPassword } from "../models/UsersModel.js"


//login
export const Login = async (req, res) => {
    try {
        
        const {email,password,role} = req.body
        //email and password fileds validation
        if(!email || !password || !role){
            return res.status(400).send({
                success:false,
                message:"please provide email and password and role"
            })
        }

        //find user
        const canLogin = await findUserByEmail(email)
        if(!canLogin){
            return res.status(401).send({
                success:false,
                message:"invalid email"
            })
        }

        //match password
        const isMatch = await matchPassword(email, password)
        if(!isMatch){
            return res.status(401).send({
                success:false,
                message:"password is invalid"
            })
        }

        // check role
        const roleType = await checkRole(email, role)
        if(!roleType){
            return res.status(401).send({
                success:false,
                message:"invalid role"
            })
        }


        const token = jwt.sign(
            { email, role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.status(200).send({
            success:true,
            message:"login success",
            token
        })

    } catch (error) {
        console.log(error)
        res.status(500).send({
            success:false,
            message:"error in login api",
            error
        })
    }
}