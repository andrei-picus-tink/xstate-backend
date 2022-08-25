/* eslint-disable @typescript-eslint/no-unused-vars */
import { assign, createMachine } from "xstate";

type Context = {
  providers?: Provider[];
  selectedProvider?: Provider;
  fields?: { type: string; name: string }[];
  error?: string;
};

enum Provider {
  PASSWORD = "password",
  REDIRECT = "redirect",
}

export const machine = createMachine<Context>(
  {
    initial: "initial",
    context: {},
    on: {
      "*": {
        target: "error",
        actions: assign({
          error: (_) => "Invalid event",
        }),
      },
    },
    states: {
      initial: {
        invoke: {
          src: () => Promise.resolve([Provider.PASSWORD, Provider.REDIRECT]),
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
            target: "selectedProvider",
            actions: assign({
              selectedProvider: (context, event) => event.data,
            }),
          },
        },
      },
      selectedProvider: {
        always: [
          {
            cond: (context) => context.selectedProvider === Provider.PASSWORD,
            target: "fields",
            actions: assign({
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
          {
            target: "redirect",
          },
        ],
      },
      fields: {
        tags: "ui",
        on: {
          INPUT: {
            target: "checkFields",
            actions: assign({
              fields: (_, event) => event.data,
            }),
          },
        },
      },
      checkFields: {
        invoke: {
          src: async (context, event) => {
            if (
              event.data.name !== "test" ||
              event.data.password !== "password"
            ) {
              throw new Error("invalid credentials");
            }
          },
          onDone: { target: "credentials" },
          onError: {
            target: "error",
            actions: "error",
          },
        },
      },
      redirect: {
        tags: "ui",
        on: {
          RESUME: {
            target: "credentials",
          },
        },
      },
      credentials: {
        invoke: {
          src: () =>
            new Promise((r) => {
              setTimeout(r, 500);
            }),
          onDone: { target: "done" },
          onError: { target: "error", actions: "error" },
        },
      },
      done: { type: "final", tags: "ui" },
      error: {
        type: "final",
        tags: "ui",
        data: (context) => ({
          error: context.error,
        }),
      },
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
