import "reflect-metadata";
import express from "express";
import cookieParser from "cookie-parser";
import { notFoundError, errorHandler } from "./middleware/ErrorMiddleware";
import { ApolloServer } from "apollo-server-express";
import { typeDefs } from "./graphql/schema";
import { resolvers } from "./graphql/resolvers";
import { createConnection } from "typeorm";
import { verify } from "jsonwebtoken";
import { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } from "./constants";
import { User } from "./entity/User";
import { createTokens } from "./auth";

const main = async () => {
    await createConnection();
    const app = await express();
    await app.use(cookieParser());

    const server = new ApolloServer({
        typeDefs, 
        resolvers,
        context: ({ req, res }: any) => ({ req, res })
    });

    // JWT Token
    app.use(async (req: any, res, next) => {
        const refreshToken = req.cookies["refresh-token"];
        const accessToken = req.cookies["access-token"];
        if (!refreshToken && !accessToken) {
            return next();
        }

        // Verify the access token.
        try {
            const data = verify(accessToken, ACCESS_TOKEN_SECRET) as any;
            req.userId = data.userId;
            return next();
        } catch(error) {
            console.log(error)
        }

        if (!refreshToken) {
            return next()
        }

        // Verify the refresh token.
        let data;
        try {
            data = verify(refreshToken, REFRESH_TOKEN_SECRET) as any;
        } catch {
            return next();
        }

        const user = await User.findOne(data.userId)
        // Token has been invalidated.
        if (!user || user.count !== data.count) {
            return next();
        }

        const tokens = createTokens(user);
        res.cookie("refresh-token", tokens.refreshToken);
        res.cookie("access-token", tokens.accessToken);
        req.userId = user.id;
        next();
    })

    server.applyMiddleware({ app });
    await app.use(notFoundError, errorHandler);

    const port = process.env.PORT || 9000;
    await app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
        console.log(`Press Ctrl + C to quit.`);
    })
};

main();

