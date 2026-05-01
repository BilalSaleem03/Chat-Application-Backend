import { User } from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { generateAccessAndRefreshToken } from '../helpers/jwt.js';

// Local Registration
export const register = async (req, res) => {
  try {
    const { name, username, email, password } = req.body;
    const user = await User.create({ name, username, email, password });
    //create tokens
    const tokens = await generateAccessAndRefreshToken(user._id);
    const { accessToken, refreshToken } = tokens;
    const options = {httpOnly : true , secure: true, sameSite: "none" ,maxAge: 7 * 24 * 60 * 60 * 1000};
    
    res.status(201)
        .cookie("accessToken" , accessToken , options)
        .cookie("refreshToken" , refreshToken , options)
        .json({success : "Registered Successfully"});
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Local Login
export const login = async (req, res) => {

  try {
    const { usernameOrEmail, password } = req.body;
    const user = await User.findOne({ $or: [{ email: usernameOrEmail }, { username: usernameOrEmail }] });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    if (user && user.password && (await bcrypt.compare(password, user.password))) {
      const tokens = await generateAccessAndRefreshToken(user._id);
      const { accessToken, refreshToken } = tokens;
      const options = {httpOnly : true , secure: true, sameSite: "none" ,maxAge: 7 * 24 * 60 * 60 * 1000};
      
      res
      .status(200)
      .cookie("accessToken" , accessToken , options)
      .cookie("refreshToken" , refreshToken , options)
      .json({success : "Logged IN"});
  
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const logout = async (req, res) => {
    try {  
        // console.log("Logging out user:", req.user);

        res.status(200)
            .clearCookie("accessToken" , {httpOnly : true , secure: true, sameSite: "none" ,maxAge: 0})
            .clearCookie("refreshToken" , {httpOnly : true , secure: true, sameSite: "none" ,maxAge: 0})
            .json({success : "Logged Out Successfully"});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}



export const googleAuthCallback = async (req, res) => {
    try {
        console.log("Google Auth Callback User:", req.user);
        const user = await User.findOne({ googleId: req.user.googleId });
        const tokens = await generateAccessAndRefreshToken(req.user._id);
        const { accessToken, refreshToken } = tokens;
        const options = {httpOnly : true , secure: true, sameSite: "none" ,maxAge: 7 * 24 * 60 * 60 * 1000};
    
    res.status(201)
        .cookie("accessToken" , accessToken , options)
        .cookie("refreshToken" , refreshToken , options)
        .json({success : "Logged in with Google Successfully"});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
        
