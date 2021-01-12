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

  type Task {
    kind: String,
    id: String,
    etag: String,
    title: String,
    updated: String,
    selfLink: String,
    parent: String,
    position: String,
    notes: String,
    status: String,
    due: String,
    completed: String,
    deleted: Boolean,
    hidden: Boolean,
    links: [TaskMetadata]
  }

  type TaskMetadata {
    type: String,
    description: String,
    link: String
  }

  type Query {
    taskLists: [TaskList]
    tasks(taskListId: String): [Task]
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
    tasks: async (_, { taskListId }, context) => {
      const headers = new Headers({
        "Content-Type": "application/json",
        Authorization: context.token,
      });

      const options = {
        headers,
      };

      if (!taskListId) {
        throw "taskListId can't be empty";
      }
      console.log(
        `https://tasks.googleapis.com/tasks/v1/lists/${taskListId}/tasks`
      );
      return fetch(
        `https://tasks.googleapis.com/tasks/v1/lists/${taskListId}/tasks`,
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
