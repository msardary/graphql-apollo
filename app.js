const express = require('express');
const { ApolloServer } = require('apollo-server-express');

const app = express();

const connectDB = require('./db');
const apolloConfig = require('./GraphQL');



const server = new ApolloServer(apolloConfig);


(async () => {
    await server.start();

    // Add graphql server route
    server.applyMiddleware({app});
})();




app.listen({port: 4000}, () => 
    console.log(`Server Ready at http://localhost:4000${server.graphqlPath}`)
);