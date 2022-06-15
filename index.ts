/* eslint-disable no-console */
import express from "express";
import { interpret, InterpreterFrom } from "xstate";
import { waitFor } from "xstate/lib/waitFor";
import { machine } from "./machine";

const app = express();
app.use(express.json());
const port = 3000;

let actor: InterpreterFrom<typeof machine>;

const stateFromMachine = () => ({
  value: actor.state.value,
  context: actor.state.context,
});

app.post("/start", async (req, res) => {
  actor = interpret(machine);

  actor.start();

  await waitFor(actor, (state) => state.hasTag("ui"));

  res.json(stateFromMachine());
});

app.post("/next", async (req, res) => {
  if (!actor) {
    throw new Error("Machine not started");
  }

  actor.send(req.body);

  await waitFor(actor, (state) => state.hasTag("ui"));

  res.json(stateFromMachine());
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
