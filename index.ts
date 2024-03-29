/* eslint-disable no-console */
import cors from "cors";
import express from "express";
import { interpret, InterpreterFrom } from "xstate";
import { waitFor } from "xstate/lib/waitFor";
import { machine } from "./machine";
import { randomUUID } from "crypto";

const app = express();
app.use(express.json());
app.use(cors());

const port = 3000;

const sessions = new Map<string, InterpreterFrom<typeof machine>>();

const stateFromMachine = (actor: InterpreterFrom<typeof machine>) => ({
  value: actor.state.value,
  context: actor.state.context,
});

app.post("/start", async (req, res, next) => {
  try {
    const actor = interpret(machine);
    const sessionId = randomUUID();
    console.log(sessionId);

    actor.start();
    sessions.set(sessionId, actor);

    await waitFor(actor, (state) => state.hasTag("ui"));

    res.json({
      sessionId,
      data: stateFromMachine(actor),
    });
  } catch (e) {
    next(e);
  }
});

app.post("/next", async (req, res, next) => {
  try {
    const { sessionId, ...data } = req.body;
    const actor = sessions.get(sessionId);

    if (!actor) {
      throw new Error("Session not found");
    }

    actor.send(data);

    await waitFor(actor, (state) => state.hasTag("ui"));

    res.json(stateFromMachine(actor));
  } catch (e) {
    next(e);
  }
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
