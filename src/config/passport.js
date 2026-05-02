import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User } from '../models/user.model.js';

passport.use(
  new GoogleStrategy(
    {
      clientID:     process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:  `${process.env.BACKEND_URL}/users/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email      = profile.emails[0].value;
        const googleImage = profile.photos?.[0]?.value || null; // Google profile picture

        // 1. Check by Google ID
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          // 2. Check by email (account linking)
          user = await User.findOne({ email });

          if (user) {
            user.googleId = profile.id;
            if (googleImage && !user.image) user.image = googleImage;
            await user.save();
          } else {
            // 3. Create new user
            user = await User.create({
              googleId: profile.id,
              name:     profile.displayName,
              email,
              username: email.split('@')[0] + '_' + Math.floor(Math.random() * 1000),
              image:    googleImage,
            });
          }
        } else {
          // Update image if not set yet
          if (googleImage && !user.image) {
            user.image = googleImage;
            await user.save();
          }
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);