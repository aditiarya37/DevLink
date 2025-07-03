const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User');
const crypto = require('crypto');

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL,
      scope: ['user:email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ githubId: profile.id });

        if (user) {
          return done(null, user);
        }

        const userEmail = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
        
        if (userEmail) {
            user = await User.findOne({ email: userEmail });
            if (user) {
                user.githubId = profile.id;
                await user.save();
                return done(null, user);
            }
        }
        
        let username = profile.username || `user${profile.id}`;

        const existingUserWithUsername = await User.findOne({ username: username });
        if (existingUserWithUsername) {
          username = `${username}_${crypto.randomBytes(4).toString('hex')}`;
        }
        
        const newUser = await User.create({
          githubId: profile.id,
          username: username,
          displayName: profile.displayName || profile.username,
          email: userEmail, 
          profilePicture: profile.photos && profile.photos[0] ? profile.photos[0].value : '',
          authProvider: 'github',
        });

        return done(null, newUser);

      } catch (err) {
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => done(err, user));
});