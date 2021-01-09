import { GraphQLServer } from "graphql-yoga";
import fetch, { Headers } from "node-fetch";

const typeDefs = `
  type TaskList {
    kind: String,
    id: String,
    etag: String,
    title: String,
    updated: String,
    selfLink: String
  }

  type Query {
    taskLists: [TaskList]
  }
`;

const resolvers = {
  Query: {
    taskLists: async (_, { name }, context) => {
      const headers = new Headers({
        "Content-Type": "application/json",
        Authorization: context.token,
      });

      const options = {
        headers,
      };

      return fetch(
        "https://tasks.googleapis.com/tasks/v1/users/@me/lists",
        options
      )
        .then((response) => response.json())
        .then((response) => response.items);
    },
  },
};

const server = new GraphQLServer({
  typeDefs,
  resolvers,
  context: ({ request }) => {
    const token = request.headers.authorization;

    return {
      ...request,
      token,
    };
  },
});
server.start(() => console.log("Server is running on localhost:4000"));
