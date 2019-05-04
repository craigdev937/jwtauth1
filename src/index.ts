import "reflect-metadata";
import express from "express";
import cookieParser from "cookie-parser";
import { notFoundError, errorHandler } from "./middleware/ErrorMiddleware";
import { ApolloServer } from "apollo-server-express";
import { typeDefs } from "./graphql/schema";
import { resolvers } from "./graphql/resolvers";
import { createConnection } from "typeorm";
import { verify } from "jsonwebtoken";
import { ACCESS_TOKEN_SECRET } from "./constants";

const main = async () => {
    await createConnection();
    const app = await express();
    await app.use(cookieParser());

    const server = new ApolloServer({
        typeDefs, 
        resolvers,
        context: ({ req, res }: any) => ({ req, res })
    });

    app.use((req, res, next) => {
        const accessToken = req.cookies["access-token"];
        try {
            const data = verify(accessToken, ACCESS_TOKEN_SECRET) as any;
            (req as any).userId = data.userId;
        } catch(error) {
            console.log(error)
        }        
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

