import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import bcrypt from 'bcryptjs';

export function configurePassport(database) {
  passport.use(
    new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
      try {
        const user = database.findUserByEmail(email);
        if (!user) {
          return done(null, false, { message: 'invalid credentials' });
        }

        const matches = bcrypt.compareSync(password, user.passwordHash);
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
      (payload, done) => {
        const user = database.findUserById(payload.sub);
        if (!user) {
          return done(null, false);
        }
        return done(null, user);
      }
    )
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser((id, done) => done(null, database.findUserById(id) ?? false));

  return passport;
}
