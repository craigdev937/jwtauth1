import { User } from "../entity/User";
import { IResolvers } from "graphql-tools";
import bcrypt from "bcryptjs";
import { createTokens } from "../auth";

export const resolvers: IResolvers = {
    Query: {
        me: (parent, arg, { req }) => {
            if (!req.userId) {
                return null;
            }
            return User.findOne(req.userId);
        }
    },

    Mutation: {
        register: async (parent, {email, password}) => {
            const hashedPassword = await bcrypt.hash(password, 10);
            await User.create({
                email,
                password: hashedPassword
            }).save();
            return true;
        },

        login: async (parent, {email, password}, {res}) => {
            const user = await User.findOne({ where: { email } });
            if (!user) {
                return null;
            }

            const valid = await bcrypt.compare(password, user.password);
            if (!valid) {
                return null;
            }

            const { refreshToken, accessToken } = createTokens(user);

            res.cookie(
                "refresh-token", 
                refreshToken, 
                { expire: 60 * 60 * 24 * 7 }
            );

            res.cookie(
                "access-token", 
                accessToken, 
                { expire: 60 * 60 }
            );

            return user;
        },

        invalidateTokens: async (parent, args, {req}) => {
            if (!req.userId) {
                return false;
            }
            const user = await User.findOne(req.userId)
            if (!user) {
                return false;
            }
            user.count += 1
            await user.save()
            return true;
        }
    }
};

