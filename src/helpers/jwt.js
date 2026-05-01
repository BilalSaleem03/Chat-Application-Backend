import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';


const generateAccessToken = (userId)=>{
    return jwt.sign({ _id: userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '3600m' });
}

const generateRefreshToken = (userId)=>{
    return jwt.sign({ _id: userId }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
}

export const generateAccessAndRefreshToken = async (userId)=>{
    try{
        const accessToken = generateAccessToken(userId);
        const refreshToken = generateRefreshToken(userId);
        return { accessToken, refreshToken };
    } catch(error){
        throw new Error('Unable to generate tokens');
    }
}


