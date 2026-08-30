import User from "../models/user.model.js";
import Component from "../models/component.model.js";
import { askAI } from "../utils/openRouter.js";

export const generateComponent = async (req, res) => {
    try {
        const { prompt } = req.body;

        if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
            return res.status(400).json({
                success: false,
                message: "Prompt is required",
            });
        }

        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const GENERATE_COST = 50;
        const currentCredits = Number(user.aiCredits || 0);

        if (user.role === "user" && currentCredits < GENERATE_COST) {
            return res.status(400).json({
                success: false,
                message: "Not enough AI credits",
                remainingCredits: currentCredits,
            });
        }

        const messages = [
            {
                role: "system",
                content: `You are an expert React UI component generator. Return ONLY a valid JSON object with the format: {"name": "ComponentName", "code": "complete React component code", "props": ["prop1", "prop2"]}. Generate exactly ONE self-contained React component using JavaScript and inline styles. Component must render cleanly without external CSS or non-React dependencies.`,
            },
            {
                role: "user",
                content: prompt.trim(),
            },
        ];

        let aiResponse;

        try {
            aiResponse = await askAI(messages);
        } catch (aiError) {
            console.error("OPENROUTER ERROR:", aiError);
            return res.status(502).json({
                success: false,
                message: aiError?.message || "AI service failed",
            });
        }

        if (!aiResponse || typeof aiResponse !== "string" || !aiResponse.trim()) {
            return res.status(502).json({
                success: false,
                message: "AI returned an empty response",
            });
        }

        let componentData = null;

        let cleanResponse = aiResponse.trim();
        cleanResponse = cleanResponse
            .replace(/^```(?:json)?\s*/i, "")
            .replace(/\s*```$/i, "")
            .trim();

        const firstBrace = cleanResponse.indexOf("{");
        const lastBrace = cleanResponse.lastIndexOf("}");

        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            try {
                const jsonCandidate = cleanResponse.slice(firstBrace, lastBrace + 1);
                const parsed = JSON.parse(jsonCandidate);
                if (parsed && typeof parsed === "object") {
                    const code =
                        (typeof parsed.code === "string" && parsed.code) ||
                        (typeof parsed.component === "string" && parsed.component) ||
                        (typeof parsed.jsx === "string" && parsed.jsx) ||
                        "";
                    const name =
                        (typeof parsed.name === "string" && parsed.name) ||
                        (typeof parsed.componentName === "string" && parsed.componentName) ||
                        "";
                    const props = Array.isArray(parsed.props) ? parsed.props : [];

                    if (code.trim()) {
                        componentData = {
                            name: name.trim(),
                            code: code.trim(),
                            props,
                        };
                    }
                }
            } catch (e) {
            }
        }

        console.log("AI RAW RESPONSE:", aiResponse);

        if (!componentData || !componentData.code) {
            let rawCode = "";
            const codeBlocks = [...aiResponse.matchAll(/```(?:jsx|javascript|js|react|tsx|ts)?\s*([\s\S]*?)```/gi)];
            if (codeBlocks.length > 0) {
                let longestBlock = "";
                for (const match of codeBlocks) {
                    if (match[1].length > longestBlock.length) {
                        longestBlock = match[1];
                    }
                }
                rawCode = longestBlock.trim();
            } else {
                rawCode = aiResponse.trim();
            }
            rawCode = rawCode.replace(/^```[a-z]*\s*/i, "").replace(/\s*```$/i, "").trim();

            const codeMatch =
                aiResponse.match(/"code"\s*:\s*"([\s\S]*?)"\s*,\s*"props"/i) ||
                aiResponse.match(/"code"\s*:\s*`([\s\S]*?)`/i) ||
                aiResponse.match(/"code"\s*:\s*"([\s\S]*?)"\s*\}/i);

            if (!rawCode && codeMatch?.[1]) {
                try {
                    rawCode = JSON.parse(`"${codeMatch[1]}"`);
                } catch {
                    rawCode = codeMatch[1].replace(/\\n/g, "\n").replace(/\\"/g, '"');
                }
            }

            const nameMatch = rawCode.match(/\b(?:const|let|var|function|class)\s+([A-Z][A-Za-z0-9_]*)/);
            const detectedName = nameMatch?.[1] || "CustomComponent";

            componentData = {
                name: detectedName,
                code: rawCode,
                props: [],
            };
        }

        console.log("=== AI GENERATION DEBUG ===");
        console.log("AI RESPONSE TYPE:", typeof aiResponse);
        console.log("AI RESPONSE:", aiResponse);
        console.log("FINAL CODE TYPE:", typeof componentData.code);
        console.log("FINAL CODE LENGTH:", componentData.code?.length);
        console.log("FINAL CODE:", componentData.code);

        if (!componentData.code || typeof componentData.code !== "string" || componentData.code.trim().length < 50 || (!componentData.code.includes("react") && !componentData.code.includes("return"))) {
            return res.status(400).json({
                success: false,
                message: "AI generated invalid or incomplete component code"
            });
        }

        let remainingCredits = null;

        if (user.role === "user") {
            const updatedUser = await User.findOneAndUpdate(
                { _id: user._id, aiCredits: { $gte: GENERATE_COST } },
                { $inc: { aiCredits: -GENERATE_COST } },
                { returnDocument: "after" }
            );
            if (!updatedUser) {
                return res.status(403).json({
                    success: false,
                    message: "Failed to deduct AI credits",
                });
            }
            remainingCredits = updatedUser.aiCredits;
        }

        return res.status(200).json({
            success: true,
            message: "Component generated successfully",
            component: {
                name: componentData.name.trim() || "GeneratedComponent",
                code: componentData.code.trim(),
                props: Array.isArray(componentData.props) ? componentData.props : [],
            },
            remainingCredits,
        });

    } catch (error) {
        console.error("GENERATE COMPONENT ERROR:", error);
        return res.status(500).json({
            success: false,
            message: error?.message || "Failed to generate component",
        });
    }
};