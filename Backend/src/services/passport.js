import dotenv from "dotenv";
dotenv.config();

import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";

const SERVER =
  process.env.SERVER || `http://localhost:${process.env.PORT || 5000}`;
const CALLBACK = `${SERVER}/api/auth/google/callback`; // must match Google Console redirect URI

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: CALLBACK,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        const photo = profile.photos?.[0]?.value;

        let user = await User.findOne({ googleId: profile.id });
        if (!user && email) {
          user = await User.findOne({ email });
          if (user) {
            user.googleId = profile.id;
            user.profilePic = user.profilePic || photo;
            user.authProvider = "google";
            await user.save();
            return done(null, user);
          }
        }

        if (!user) {
          user = await User.create({
            name: profile.displayName || email,
            email,
            googleId: profile.id,
            profilePic: photo,
            authProvider: "google",
          });
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user._id);
});
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

export default passport;
