import { buildSchema } from 'graphql';

export default buildSchema(`
  type Post {
    _id: ID!
    title: String!
    content: String!
    imageUrl: String!
    creator: User!
    createdAt: String!
    updatedAt: String!
  }

  type User {
    _id: ID!
    name: String!
    email: String!
    password: String
    status: String!
    posts: [Post!]!
  }

  type AuthData {
    token: String!
    userId: String!
  }
  
  input UserData {
    email: String!
    name: String!
    password: String!
  }
  
  type RootMutation {
    createUser(userInput: UserData): User!
  }

  type Hello {
    text: String
  }

  type RootQuery {
    login(email: String!, password: String!): AuthData!
  }

  schema {
    query: RootQuery
    mutation: RootMutation
  }
`);
