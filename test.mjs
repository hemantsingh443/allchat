// conversation.js
import fetch from 'node-fetch';
import readline from 'readline/promises'; // Use the promise-based version for async/await

// --- Configuration ---
const OPENROUTER_API_KEY = "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";
const API_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL_ID = "mistralai/mistral-7b-instruct:free";

// --- The Conversation Logic ---

// Set up the interface for reading from the terminal
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// This array will store the entire conversation history
const conversationHistory = [
  // You can optionally add a "system" message to guide the AI's behavior
  { role: "system", content: "You are a helpful and concise assistant. Respond in short, clear paragraphs." }
];

async function getAIResponse() {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": "http://localhost:3000", // Required for free models
        "Content-Type": "application/json"
      },
      // IMPORTANT: Send the entire conversation history in the 'messages' array
      body: JSON.stringify({
        model: MODEL_ID,
        messages: conversationHistory
      })
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(`API Error: ${res.status} - ${JSON.stringify(errorData.error)}`);
    }

    const data = await res.json();
    return data.choices[0].message.content;

  } catch (error) {
    console.error("❌ An error occurred:", error.message);
    // Return a message so the chat can continue
    return "Sorry, I encountered an error. Please try again.";
  }
}

async function startConversation() {
  console.log(`\nChatting with ${MODEL_ID}. Type 'exit' or 'quit' to end the conversation.\n`);

  while (true) {
    // 1. Get user input
    const userInput = await rl.question("You: ");

    // 2. Check for exit condition
    if (userInput.toLowerCase() === 'exit' || userInput.toLowerCase() === 'quit') {
      console.log("Goodbye!");
      rl.close();
      break;
    }

    // 3. Add the user's message to the history
    conversationHistory.push({ role: "user", content: userInput });

    // 4. Get the AI's response (which uses the full history)
    process.stdout.write("AI is thinking...");
    const aiResponse = await getAIResponse();

    // 5. Add the AI's response to the history
    conversationHistory.push({ role: "assistant", content: aiResponse });

    // Clear the "thinking..." line and print the response
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
    console.log(`AI: ${aiResponse}\n`);
  }
}

// Start the chat!
startConversation();