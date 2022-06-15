import { assign, createMachine } from "xstate";

type Context = {
  providers?: string[];
  selectedProvider?: string;
  fields?: { type: string; name: string }[];
  error?: string;
};

const fetchProviders = async (): Promise<string[]> =>
  Promise.resolve(["nordea", "seb"]);

export const machine = createMachine<Context>(
  {
    initial: "initial",
    context: {},
    on: {
      "*": {
        target: "error",
        actions: assign({
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          error: (_) => "Invalid event",
        }),
      },
    },
    states: {
      initial: {
        invoke: {
          src: fetchProviders,
          onDone: {
            target: "providers",
            actions: assign({
              providers: (context, event) => event.data,
            }),
          },
          onError: { target: "error", actions: "error" },
        },
      },
      providers: {
        tags: "ui",
        on: {
          SELECT: {
            target: "provider",
            actions: assign({
              selectedProvider: (context, event) => event.data,
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              fields: (_) => [
                {
                  type: "text",
                  name: "username",
                },
                {
                  type: "text",
                  name: "password",
                },
              ],
            }),
          },
        },
      },
      provider: {
        tags: "ui",
        on: {
          INPUT: {
            target: "credentials",
          },
        },
      },
      credentials: {
        invoke: {
          src: async (context, event) => {
            if (
              event.data.name !== "test" ||
              event.data.password !== "password"
            ) {
              throw new Error("invalid credentials");
            }
          },
          onDone: { target: "done" },
          onError: {
            target: "error",
            actions: "error",
          },
        },
      },
      done: { type: "final", tags: "ui" },
      error: { type: "final", tags: "ui" },
    },
  },
  {
    actions: {
      error: assign({
        error: (context, event) => event.data.message,
      }),
    },
  }
);
