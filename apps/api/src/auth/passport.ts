import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { verifyPassword } from '../lib/password.js';

export function configurePassport(database) {
  passport.use(
    new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
      try {
        const user = await database.findUserByEmail(email);
        if (!user) {
          return done(null, false, { message: 'invalid credentials' });
        }

        const matches = verifyPassword(password, user.passwordHash);
        if (!matches) {
          return done(null, false, { message: 'invalid credentials' });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );

  passport.use(
    new JwtStrategy(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_SECRET ?? 'dev-secret'
      },
      async (payload, done) => {
        const user = await database.findUserById(payload.sub);
        if (!user) {
          return done(null, false);
        }
        return done(null, user);
      }
    )
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    const user = await database.findUserById(id);
    done(null, user ?? false);
  });

  return passport;
}
