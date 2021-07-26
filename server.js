const express = require('express')
const expressGrapQL = require('express-graphql').graphqlHTTP;
const { GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLList, GraphQLNonNull, GraphQLInt } = require('graphql')
const app = express()
const authors = [
    { id: 1, name: "J.K. Rowling" },
    { id: 2, name: "Michael Crichton" }
];

const books = [
    {
        id: 1,
        authorId: 1,
        name: "Harry Potter and the Chamber of Secrets"
    },
    {
        id: 2,
        authorId: 1,
        name: "Harry Potter and the Philosphers Stone"
    },
    {
        id: 3,
        authorId: 2,
        name: "Jurassic Park"
    }
];

const BookType = new GraphQLObjectType({
    name: 'Book',
    description: 'This indicates the Book written by Author',
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLInt) },
        name: { type: GraphQLNonNull(GraphQLString) },
        authorId: { type: GraphQLNonNull(GraphQLInt) },
        author: {
            type: AuthorType,
            resolve: (book) => {
                return authors.find(author => author.id === book.authorId)
            }

        }
    })
})

const AuthorType = new GraphQLObjectType({
    name: 'Author',
    description: 'This indicates the Book written by Author',
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLInt) },
        name: { type: GraphQLNonNull(GraphQLString) },
        books: {
            type: new GraphQLList(BookType),
            resolve: (author) => {
                return books.filter(book => book.authorId === author.id)
            }
        }
    })
})

const RootMutationType = new GraphQLObjectType({
    name: 'Mutation',
    description: "Book Mutation",
    fields: () => ({
        addBook: {
            type: BookType,
            description: "Add a book",
            args: {
                authorId: { type: GraphQLNonNull(GraphQLInt) },
                name: { type: GraphQLNonNull(GraphQLString) }
            },
            resolve: (parent, args) => {
                console.log(args);
                const book = { id: books.length + 1, authorId: args.authorId, name: args.name }
                books.push("Book", book)
                console.log("Books", books);
                return books
            }


        },
        addAuthor: {
            type: AuthorType,
            description: "Add Author",
            args: {
                name: { type: GraphQLNonNull(GraphQLString) }
            },
            resolve: (parent, args) => {
                const author = { id: authors.length + 1, name: args.name }
                authors.push(author)
                return authors
            }
        },

        deleteBook: {
            type: BookType,
            description: "Delete Book",
            args: {
                id: { type: GraphQLNonNull(GraphQLInt) }
            },
            resolve: (parent, args) => {
                return books.filter((book) => { !book.id === args.id })
            }
        }
        ,
        deleteAuthor: {
            type:AuthorType,
            description:"Delete Author",
            args:{
                id:{type:GraphQLNonNull(GraphQLInt)}
            },
            resolve:(parent,args)=>{
                return authors.filter(author=>!author.id===args.id)
            }

        }


    })
})



const RootQueryType = new GraphQLObjectType({
    name: 'Query',
    fields: () => ({
        book: {
            type: BookType,
            description: "Detail of Single Book",
            args: {

                id: { type: GraphQLInt }

            },
            resolve: (parent, args) => books.find(book => book.id === args.id)
        },

        books: {
            type: new GraphQLList(BookType),
            description: 'List of all Books',
            resolve: () => books
        },
        authors: {
            type: new GraphQLList(AuthorType),
            description: 'List of all Authors',
            resolve: () => authors
        },
        author: {
            type: AuthorType,
            description: "Author with ID",
            args: {
                id: { type: GraphQLInt }
            },
            resolve: (parent, args) => {
                return authors.find(author => author.id === args.id)
            }
        }
    })
})

const schema = new GraphQLSchema({
    query: RootQueryType,
    mutation: RootMutationType
})

app.use('/graphql', expressGrapQL({
    graphiql: true,
    schema: schema
}))
app.listen(5000, () => console.log('Server is Running'))