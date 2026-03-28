import { Client } from "@upstash/workflow";
import { QSTASH_URL, QSTASH_TOKEN } from "./env.js";

export const WorkflowClient = new Client({
  url: QSTASH_URL,
  token: QSTASH_TOKEN,
});

export default WorkflowClient;
