import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ChatGoogle } from "@langchain/google";
import { END, MessagesAnnotation, START, StateGraph } from "@langchain/langgraph";
import { ToolNode, toolsCondition } from "@langchain/langgraph/prebuilt";

import { MODEL } from "@/lib/ai/client";

import { buildStudyPlannerTools } from "./tools";

const SYSTEM_PROMPT =
  "You are a study planning assistant helping a student with their course " +
  '"{courseTitle}". Use get_upcoming_assignments and get_weak_topics to see ' +
  "what's actually due and what they've been getting wrong. Then call " +
  "add_study_topic once per topic you recommend — 1 to 3 topics, prioritizing " +
  "ones tied to a wrong answer or a near-term deadline over generic review. " +
  "Finish with a short (3-5 sentence) plain-language explanation of your " +
  "reasoning — that explanation is the only part of your reply the student " +
  "sees directly, so make it stand on its own.";

/**
 * Runs the study-planner agent for one course: it decides which of its
 * three tools to call, sees each result, and decides again — a loop, not a
 * single request/response — until it stops calling tools and gives a final
 * answer. Returns that final answer for display; the tangible output is
 * the Topic rows it created along the way (see src/lib/agent/tools.ts).
 */
export async function generateStudyPlan(
  courseId: string,
  courseTitle: string,
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const tools = buildStudyPlannerTools(courseId);
  const model = new ChatGoogle({ model: MODEL, apiKey }).bindTools(tools);

  // The agent node: ask the model what to do next given the conversation
  // so far. Its response either contains tool_calls (route to "tools") or
  // is a final answer (route to END) — toolsCondition below makes that call.
  const agentNode = async (state: typeof MessagesAnnotation.State) => {
    const response = await model.invoke(state.messages);
    return { messages: [response] };
  };

  const graph = new StateGraph(MessagesAnnotation)
    .addNode("agent", agentNode)
    .addNode("tools", new ToolNode(tools))
    .addEdge(START, "agent")
    .addConditionalEdges("agent", toolsCondition, ["tools", END])
    .addEdge("tools", "agent")
    .compile();

  const result = await graph.invoke({
    messages: [
      new SystemMessage(SYSTEM_PROMPT.replace("{courseTitle}", courseTitle)),
      new HumanMessage("Generate my study plan for this course."),
    ],
  });

  const finalMessage = result.messages.at(-1);
  const text = finalMessage?.text?.trim();

  if (!text) {
    throw new Error("The study planner agent did not return a final answer.");
  }

  return text;
}
