/* eslint-disable @typescript-eslint/no-unused-vars */
import { assign, createMachine } from "xstate";

type Context = {
  providers?: Provider[];
  selectedProvider?: Provider;
  fields?: { type: string; name: string }[];
  fieldsInput?: Record<string, string>;
  error?: string;
};

enum Provider {
  PASSWORD = "password",
  REDIRECT = "redirect",
}

const delay = (timeout: number) =>
  new Promise((r) => {
    setTimeout(r, timeout);
  });

export const machine = createMachine<Context>(
  {
    initial: "initial",
    context: {},
    on: {
      "*": {
        target: "error",
        actions: "invalidEvent",
      },
    },
    states: {
      initial: {
        invoke: {
          src: "fetchProviders",
          onDone: {
            target: "providers",
            actions: "storeProviders",
          },
          onError: { target: "error", actions: "error" },
        },
      },
      providers: {
        tags: "ui",
        on: {
          SELECT: {
            target: "selectedProvider",
            actions: "storeSelectedProvider",
          },
        },
      },
      selectedProvider: {
        always: [
          {
            cond: "isPasswordProvider",
            target: "fetchFields",
          },
          {
            target: "redirect",
          },
        ],
      },
      fetchFields: {
        invoke: {
          src: "fetchFields",
          onDone: {
            target: "fields",
            actions: "storeFields",
          },
        },
      },
      fields: {
        tags: "ui",
        on: {
          INPUT: {
            target: "checkFields",
            actions: "storeFieldsInput",
          },
          BACK: { target: "providers" },
        },
      },
      checkFields: {
        invoke: {
          src: "checkFields",
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
          BACK: { target: "providers" },
        },
      },
      credentials: {
        invoke: {
          src: "processCredentials",
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
    services: {
      fetchProviders: async () => {
        await delay(100);

        return [Provider.PASSWORD, Provider.REDIRECT];
      },
      processCredentials: () => delay(100),
      fetchFields: async () => {
        await delay(100);

        return [
          {
            type: "text",
            name: "username",
          },
          {
            type: "text",
            name: "password",
          },
        ];
      },
      checkFields: async (context) => {
        await delay(100);

        if (
          context.fieldsInput?.username !== "test" ||
          context.fieldsInput?.password !== "password"
        ) {
          throw new Error("invalid credentials");
        }
      },
    },
    guards: {
      isPasswordProvider: (context) =>
        context.selectedProvider === Provider.PASSWORD,
    },
    actions: {
      storeProviders: assign({
        providers: (context, event) => event.data,
      }),
      storeSelectedProvider: assign({
        selectedProvider: (context, event) => event.data,
      }),
      storeFields: assign({
        fields: (_, event) => event.data,
      }),
      storeFieldsInput: assign({
        fieldsInput: (_, event) => event.data,
      }),
      error: assign({
        error: (context, event) => event.data.message,
      }),
      invalidEvent: assign({
        error: (_) => "Invalid event",
      }),
    },
  }
);
