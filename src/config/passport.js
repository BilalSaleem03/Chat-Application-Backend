import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User } from '../models/user.model.js';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      // Ensure this matches exactly what you configured in Google Cloud Console
      callbackURL: `${process.env.BACKEND_URL}/users/google/callback` 
    },
    async (accessToken, refreshToken, profile, done) => {
      try {

        const email = profile.emails[0].value;

        // 1. Check if user already exists by Google ID
        let user = await User.findOne({ googleId: profile.id });

        // 2. If not found by Google ID, check if they exist by email (Account Linking)
        if (!user) {
          user = await User.findOne({ email });
          
          if (user) {
            // Update the existing account with the Google ID
            user.googleId = profile.id;
            await user.save();
          } else {
            // 3. Create a brand new user
            user = await User.create({
              googleId: profile.id,
              name: profile.displayName,
              email: email,
              // Generate a unique username based on email
              username: email.split('@')[0] + "_" + Math.floor(Math.random() * 1000)
            });
          }
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);