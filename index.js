import { GraphQLServer } from "graphql-yoga";
import fetch, { Headers } from "node-fetch";

const typeDefs = `
  input TaskListInput {
    kind: String,
    id: String,
    etag: String,
    title: String,
    updated: String,
    selfLink: String
  }

  type TaskList {
    kind: String,
    id: String,
    etag: String,
    title: String,
    updated: String,
    selfLink: String
  }

  type TaskListResponse {
    kind: String,
    etag: String,
    nextPageToken: String,
    items: [TaskList]
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

  type TaskResponse {
    kind: String,
    etag: String,
    nextPageToken: String,
    items: [Task]
  }

  input TaskParameters {
    completedMax: String
    completedMin: String
    dueMax: String
    dueMin: String
    maxResults: Int
    pageToken: String
    showCompleted: Boolean
    showDeleted: Boolean
    showHidden: Boolean
    updatedMin: String
  }

  type TaskMetadata {
    type: String,
    description: String,
    link: String
  }

  type Query {
    taskLists(maxResults: Int, pageToken: String): TaskListResponse
    taskList(taskListId: String!): TaskList
    tasks(taskListId: String!, params: TaskParameters): TaskResponse
    task(taskListId: String!, taskId: String!): Task
  }

  type Mutation {
    deleteTaskList(taskListId: String!): String
    insertTaskList(taskList: TaskListInput): TaskList
    patchTaskList(taskList: TaskListInput): TaskList
    updateTaskList(taskList: TaskListInput): TaskList
  }
`;

const resolvers = {
  Query: {
    taskLists: async (_, { maxResults = 20, pageToken = "" }, context) => {
      const headers = new Headers({
        "Content-Type": "application/json",
        Authorization: context.token,
      });

      const options = {
        headers,
      };

      return fetch(
        `https://tasks.googleapis.com/tasks/v1/users/@me/lists?maxResults=${maxResults}&pageToken=${pageToken}`,
        options
      )
        .then((response) => response.json())
        .then((response) => response);
    },
    taskList: async (_, { taskListId }, context) => {
      const headers = new Headers({
        "Content-Type": "application/json",
        Authorization: context.token,
      });

      const options = {
        headers,
      };

      return fetch(
        `https://tasks.googleapis.com/tasks/v1/users/@me/lists/${taskListId}`,
        options
      ).then((response) => response.json());
    },
    tasks: async (_, { taskListId, params = {} }, context) => {
      const headers = new Headers({
        "Content-Type": "application/json",
        Authorization: context.token,
      });

      const options = {
        headers,
      };

      const filteredParams = JSON.parse(JSON.stringify(params));
      const queryParams = new URLSearchParams();
      Object.entries(filteredParams).forEach(([paramName, paramValue]) =>
        queryParams.set(paramName, paramValue)
      );

      return fetch(
        `https://tasks.googleapis.com/tasks/v1/lists/${taskListId}/tasks?${queryParams.toString()}`,
        options
      ).then((response) => response.json());
    },
    task: async (_, { taskListId, taskId }, context) => {
      const headers = new Headers({
        "Content-Type": "application/json",
        Authorization: context.token,
      });

      const options = {
        headers,
      };

      return fetch(
        `https://tasks.googleapis.com/tasks/v1/lists/${taskListId}/tasks/${taskId}`,
        options
      ).then((response) => response.json());
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
