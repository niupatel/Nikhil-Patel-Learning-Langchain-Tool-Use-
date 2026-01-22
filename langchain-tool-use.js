import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { HumanMessage } from "@langchain/core/messages";

const MODEL_NAME = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";

const getStephenCurryWifi = tool(
  () => {
    return {
      name: "StephenCurry",
      mac: "c6:50:9c:a1:a8:0a",
      type: "Access Point",
      channel: "44",
      signal: "-52 dBm",
      lastSeen: "just now",
    };
  },
  {
    name: "getStephenCurryWifi",
    description: "Return the Wi-Fi details for the StephenCurry network",
    schema: z.object({}),
  }
);

const getEduroamWifi = tool(
  () => {
    return {
      name: "eduroam",
      mac: "c6:50:9c:a1:a8:1b",
      type: "Access Point",
      channel: "36",
      signal: "-60 dBm",
      lastSeen: "1 min ago",
    };
  },
  {
    name: "getEduroamWifi",
    description: "Return the Wi-Fi details for the eduroam network",
    schema: z.object({}),
  }
);

function printWifiTable(rows) {
  const header = [
    "Name",
    "MAC",
    "Type",
    "Channel",
    "Signal",
    "Last Seen",
  ].join("\t");

  console.log(header);
  for (const row of rows) {
    console.log(
      [
        row.name,
        row.mac,
        row.type,
        row.channel,
        row.signal,
        row.lastSeen,
      ].join("\t")
    );
  }
}

async function runToolExample() {
  const llm = new ChatGoogleGenerativeAI({
    model: MODEL_NAME,
    temperature: 0,
  });

  const llmWithTools = llm.bindTools([getStephenCurryWifi, getEduroamWifi]);

  const response = await llmWithTools.invoke([
    new HumanMessage(
      "Use the tools to fetch the Wi-Fi details for StephenCurry and eduroam."
    ),
  ]);

  const rows = [];
  if (response.tool_calls && response.tool_calls.length > 0) {
    for (const toolCall of response.tool_calls) {
      if (toolCall.name === "getStephenCurryWifi") {
        rows.push(await getStephenCurryWifi.invoke(toolCall.args));
      } else if (toolCall.name === "getEduroamWifi") {
        rows.push(await getEduroamWifi.invoke(toolCall.args));
      }
    }
  } else {
    rows.push(await getStephenCurryWifi.invoke({}));
    rows.push(await getEduroamWifi.invoke({}));
  }

  printWifiTable(rows);
}

async function main() {
  try {
    await runToolExample();
  } catch (error) {
    console.error("Error running examples:", error);
    console.log("\nMake sure to:");
    console.log(
      "1. Install dependencies: npm install @langchain/google-genai @langchain/core zod"
    );
    console.log("2. Set your Gemini API key: set GOOGLE_API_KEY=your-key-here");
  }
}

main();
