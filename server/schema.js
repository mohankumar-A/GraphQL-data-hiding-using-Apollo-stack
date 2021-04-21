const { gql, makeExecutableSchema } = require('apollo-server');


const typeDefs = gql`
    type Book {
        title: String
        author: String
    }

   type Query {
       books: [Book]
   }
`;

const books = [
    {
        title: 'the cook',
        author: 'Stephan'
    },
    {
        title: 'Hary potter',
        author: 'rowling'

    }
]

const resolvers = {
    Query: {
        books: () => books,
    },
};

const schema = makeExecutableSchema({
    typeDefs,
    resolvers
})

module.exports = schema;
