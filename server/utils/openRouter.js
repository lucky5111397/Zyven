import axios from "axios";

/**
 * Executes a chat completion request via OpenRouter.
 * 
 * WHY: This function acts as the bridge for AI component generation. It is critical 
 * that the 'messages' array passed here includes a strict system prompt enforcing a 
 * predictable, structured response (e.g., pure JSX without markdown). The frontend 
 * LiveComponentPreview relies entirely on exact string parsing (via regex and buble) 
 * to render the generated code in real-time. Any deviation or conversational filler 
 * from the AI will break the sandbox rendering.
 */
export const askAI = async (messages) => {
    try {
        if (!Array.isArray(messages) || messages.length === 0) {
            throw new Error("Messages array is empty or invalid.");
        }

        const apiKey = process.env.OPENROUTER_API_KEY;

        if (!apiKey) {
            throw new Error(
                "OPENROUTER_API_KEY is missing in .env"
            );
        }

        console.log("=================================");
        console.log("OPENROUTER REQUEST STARTED");
        console.log(
            "Model: nvidia/nemotron-3-super-120b-a12b:free"
        );
        console.log("=================================");

        const response = await axios.post(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                model:
                    "nvidia/nemotron-3-super-120b-a12b:free",

                messages,

                temperature: 0.2,

                max_tokens: 6000,
            },
            {
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    "Content-Type": "application/json",

                    "HTTP-Referer":
                        "http://localhost:5173",

                    "X-Title":
                        "Zyven AI Component Generator",
                },

                timeout: 120000,
            }
        );

        console.log(
            "OpenRouter Status:",
            response.status
        );

        const content =
            response?.data?.choices?.[0]?.message?.content;

        console.log(
            "OpenRouter content received:",
            !!content
        );

        if (
            !content ||
            typeof content !== "string" ||
            !content.trim()
        ) {
            console.error(
                "OpenRouter returned empty content:",
                response?.data
            );

            throw new Error(
                "AI returned an empty response."
            );
        }

        console.log(
            "AI response received successfully."
        );

        return content.trim();
    } catch (error) {
        console.error(
            "================================="
        );

        console.error(
            "OPENROUTER ERROR"
        );

        console.error(
            "================================="
        );

        console.error(
            "Status:",
            error?.response?.status
        );

        console.error(
            "Response:",
            error?.response?.data
        );

        console.error(
            "Message:",
            error?.message
        );

        console.error(
            "================================="
        );

        const apiError =
            error?.response?.data?.error;

        throw new Error(
            apiError?.message ||
            error?.response?.data?.message ||
            error?.message ||
            "OpenRouter API Error"
        );
    }
};