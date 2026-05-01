

import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';
import { generateAccessAndRefreshToken } from '../helpers/jwt.js';


export const validateJWT = async (req , res , next)=>{
    try {
        const accessToken = req.cookies.accessToken;
        if(!accessToken){
            return res.status(401).json({error : 'Unauthorized Access'});
        }
        // console.log("befor decode" , accessToken)
        const decodedTokenInfo = jwt.verify(accessToken , process.env.ACCESS_TOKEN_SECRET);
        // console.log(decodedTokenInfo)
        const user = await User.findById(decodedTokenInfo._id).select("-password -refreshToken");
    
        if(!user){
            //check refresh token if user not found with access token
            const refreshToken = req.cookies.refreshToken;  
            if(!refreshToken){
                return res.status(401).json({error : 'Unauthorized Access'});
            }
            const decodedRefreshTokenInfo = jwt.verify(refreshToken , process.env.REFRESH_TOKEN_SECRET);
            const userFromRefreshToken = await User.findById(decodedRefreshTokenInfo._id).select("-password -refreshToken");
            if(!userFromRefreshToken){
                return res.status(401).json({error : 'Unauthorized Access'});
            }
            user = userFromRefreshToken;  
        }
        req.user = user;    
        next();
    } catch (error) {
        const options = {httpOnly : true , secure: true, sameSite: "none" ,maxAge: 0};
        if(error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError'){
            return res.status(401)
            .clearCookie("accessToken" , options)
            .clearCookie("refreshToken" , options)
            .json({error : "Access Token Expired"})
        }
        return res.status(500).json({error : "Something went wrong"})
    }
}
