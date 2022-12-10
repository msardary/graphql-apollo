const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { gql } = require("apollo-server-express");
const { ApolloServerPluginLandingPageGraphQLPlayground } = require("apollo-server-core");
const {
  UserInputError,
  AuthenticationError,
  ForbiddenError,
} = require("apollo-server");

const verifyToken = require("./utils");

//? Models import
const ArticleModel = require("./models/article");
const UserModel = require("./models/user");
const CommentModel = require("./models/comment");

const typeDefs = gql`
  type Query {
    article(id: String!): Article
    articles(page: Int, limit: Int): ArticlesResult
    user(id: String!): User
    users(page: Int, limit: Int): UsersResult
  }

  type Mutation {
    addArticle(title: String!, body: String!): Article
    updateArticle(id: String!, title: String!, body: String!): Article
    deleteArticle(id: String!): Boolean
    signUp(
      name: String!
      age: Int!
      address: String!
      email: String!
      password: String!
    ): Token!
    signIn(email: String!, password: String!): Token!
  }

  type Token {
    token: String!
  }

  type User {
    name: String
    age: Int
    address: String
    admin: Boolean
    email: String
    articles: [Article]
    password: String
    createdAt: String
    updatedAt: String
  }

  type Article {
    title: String
    body: String
    user: User
    comments: [Comments]
    createdAt: String
    updatedAt: String
  }

  type ArticlesResult {
    articles: [Article]
    paginate: Paginate
  }

  type UsersResult {
    users: [User]
    paginate: Paginate
  }

  type Paginate {
    total: Int
    limit: Int
    page: Int
    pages: Int
  }

  type Comments {
    user: String
    approved: Boolean
    article: String
    comment: String
  }
`;

const resolvers = {
  Query: {
    article: async (_, { id }) => {
      const art = await ArticleModel.findById(id);
      return art;
    },
    articles: async (_, { page, limit }, { user }) => {
      const a_page = page || 1;
      const a_limit = limit || 5;

      if (!user) {
        throw new ForbiddenError("Forbidden");
      }

      const art = await ArticleModel.paginate({}, { a_page, a_limit });
      return {
        articles: art.docs,
        paginate: {
          total: art.total,
          limit: art.limit,
          page: art.page,
          pages: art.pages,
        },
      };
    },

    user: async (_, { id }) => await UserModel.findById(id),
    users: async (_, { page, limit }, { user }) => {
      const a_page = page || 1;
      const a_limit = limit || 5;

      if (!user) {
        throw new ForbiddenError("Forbidden");
      }

      const users = await UserModel.paginate({}, { a_page, a_limit });
      return {
        users: users.docs,
        paginate: {
          total: users.total,
          limit: users.limit,
          page: users.page,
          pages: users.pages,
        },
      };
    },
  },
  Mutation: {
    addArticle: async (_, { title, body }, { user }) => {
      if (!user) {
        throw new ForbiddenError("Forbidden");
      }

      const article = await ArticleModel.create({
        user: user.id,
        title,
        body,
      });

      return article;
    },
    updateArticle: async (_, { id, title, body }, { user }) => {
      if (!user) {
        throw new ForbiddenError("Forbidden");
      }

      const article = await ArticleModel.findByIdAndUpdate(id, {
        title,
        body,
      });

      if (!article) throw new Error("Article not found!!!");

      return await ArticleModel.findById(id);
    },
    deleteArticle: async (_, { id }) => {
      const article = await ArticleModel.findByIdAndRemove(id);

      if (!article) throw new Error("Article not found!!!");

      return true;
    },
    signUp: async (
      _,
      { name, age, address, email, password },
      { sercret_key }
    ) => {
      const user = await UserModel.create({
        name,
        age,
        address,
        email,
        password,
      });

      return {
        token: jwt.sign(
          {
            id: user._id,
            email: user.email,
            age: user.age,
          },
          sercret_key,
          {
            expiresIn: "24h",
          }
        ),
      };
    },
    signIn: async (_, { email, password }, { sercret_key }) => {
      const user = await UserModel.findOne({ email });

      if (!user) {
        throw new UserInputError("User Not Found!!!");
      }

      const isEqual = await bcrypt.compare(password, user.password);

      if (!isEqual) {
        throw new AuthenticationError("Invalid Password!");
      }

      return {
        token: jwt.sign(
          {
            id: user._id,
            email: user.email,
            age: user.age,
          },
          sercret_key,
          {
            expiresIn: "24h",
          }
        ),
      };
    },
  },
  User: {
    articles: async ({ id }) => await ArticleModel.find({ user: id }),
  },
  Article: {
    user: async ({ user }) => await UserModel.findById(user),
    comments: async ({ parent }) =>
      await CommentModel.find({ article: parent.id, approved: true }),
  },
  Comments: {
    user: async ({ user }) => await UserModel.findById(user),
    article: async ({ article }) => await ArticleModel.findById(article),
  },
};

const apolloConfig = {
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const sercret_key = "dfjkdhsf330f@jf";
    const user = verifyToken(req.headers["auth-token"], sercret_key);

    return {
      user,
      sercret_key,
    };
  },
  plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
};

module.exports = apolloConfig;
