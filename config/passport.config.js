import passport from 'passport';
import jwt from 'passport-jwt';
import local from 'passport-local';
import { userService } from '../services/user.service.js';
import { createHash, isValidPassword } from '../utils.js';

const JWTStrategy = jwt.Strategy;
const ExtractJWT = jwt.ExtractJwt;
const LocalStrategy = local.Strategy;

const initializePassport = () => {
    passport.use('jwt', new JWTStrategy({
        jwtFromRequest: ExtractJWT.fromExtractors([cookieExtractor]),
        secretOrKey: process.env.JWT_SECRET
    }, async(jwt_payload, done) => {
        try {
            return done(null, jwt_payload);
        } catch(error) {
            return done(error);
        }
    }));

    passport.use('register', new LocalStrategy({
        passReqToCallback: true,
        usernameField: 'email'
    }, async (req, username, password, done) => {
        try {
            const user = await userService.getByEmail(username);
            if(user) return done(null, false);
            const newUser = await userService.create({
                ...req.body,
                password: createHash(password)
            });
            return done(null, newUser);
        } catch(error) {
            return done(error);
        }
    }));

    passport.use('login', new LocalStrategy({
        usernameField: 'email'
    }, async (username, password, done) => {
        try {
            const user = await userService.getByEmail(username);
            if(!user || !isValidPassword(password, user.password)) {
                return done(null, false);
            }
            return done(null, user);
        } catch(error) {
            return done(error);
        }
    }));
};

export default initializePassport;