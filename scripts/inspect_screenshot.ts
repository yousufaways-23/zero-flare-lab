// Screenshot inspection via VLM (z-ai-web-dev-sdk createVision, server-side)
import ZAI from "z-ai-web-dev-sdk";
import fs from "fs";

const [,, imagePath, question] = process.argv;
if (!imagePath || !fs.existsSync(imagePath)) {
  console.error("usage: bun scripts/inspect_screenshot.ts <image.png> [question]");
  process.exit(1);
}

async function main() {
  const zai = await ZAI.create();
  const b64 = fs.readFileSync(imagePath).toString("base64");
  const res = await zai.chat.completions.createVision({
    messages: [
      {
        role: "user",
        content: [
          { type: "image_url", image_url: { url: `data:image/png;base64,${b64}` } },
          {
            type: "text",
            text:
              question ??
              "This is a screenshot of a web application. Describe factually: 1) overall layout and theme, 2) any visible errors, blank areas, overlapping/broken UI, missing images or placeholder text, 3) whether navigation and content appear functional. Be specific and concise.",
          },
        ],
      },
    ],
  });
  console.log(res?.choices?.[0]?.message?.content ?? "NO RESPONSE");
}
main().catch((e) => { console.error("VLM error:", e.message); process.exit(1); });
