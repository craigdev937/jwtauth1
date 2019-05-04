import "reflect-metadata";
import express from "express";
import { notFoundError, errorHandler } from "./middleware/ErrorMiddleware";
import { ApolloServer } from "apollo-server-express";
import { typeDefs } from "./graphql/schema";
import { resolvers } from "./graphql/resolvers";
import { createConnection } from "typeorm";

const main = async () => {
    await createConnection();
    const app = await express();

    const server = new ApolloServer({ typeDefs, resolvers });
    server.applyMiddleware({ app });
    await app.use(notFoundError, errorHandler);

    const port = process.env.PORT || 9000;
    await app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
        console.log(`Press Ctrl + C to quit.`);
    })
};

main();

