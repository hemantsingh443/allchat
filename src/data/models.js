import { Bot } from 'lucide-react';

export const modelCategories = [
    {
        name: "Google",
        logo: <Bot size={16} className="text-blue-500" />,
        models: [
            { id: 'google/gemini-1.5-flash-latest', name: 'Gemini 1.5 Flash', capabilities: { vision: true, reasoning: true }, isFree: true },
            { id: 'google/gemini-pro-1.5', name: 'Gemini 1.5 Pro', capabilities: { vision: true, reasoning: true }, isFree: true },
        ]
    },
    {
        name: "Mistral AI",
        logo: <Bot size={16} className="text-orange-400" />,
        models: [
            { 
                id: 'mistralai/mistral-7b-instruct:free', 
                name: 'Mistral 7B Instruct', 
                capabilities: { reasoning: true },
                isFree: true
            },
            { 
                id: 'mistralai/devstral-small:free', 
                name: 'Devstral Small', 
                capabilities: { reasoning: true, code: true },
                isFree: true
            },
        ]
    },
    {
        name: "DeepSeek",
        logo: <Bot size={16} className="text-indigo-500" />,
        models: [
            { 
                id: 'deepseek/deepseek-r1:free', 
                name: 'DeepSeek R1', 
                capabilities: { reasoning: true, code: true },
                isFree: true,
                config: {
                    reasoningEnabled: true,
                    maxTokens: 12000
                }
            },
        ]
    },
    {
        name: "Kimi",
        logo: <Bot size={16} className="text-pink-500" />,
        models: [
            { 
                id: 'moonshotai/kimi-dev-72b:free', 
                name: 'Kimi-Dev-72B', 
                capabilities: { reasoning: true, code: true },
                isFree: true
            },
        ]
    },
    {
        name: "OpenAI",
        logo: <Bot size={16} className="text-green-500" />,
        models: [
            { id: 'openai/gpt-4o', name: 'GPT-4o', capabilities: { vision: true, reasoning: true, code: true } },
            { id: 'openai/gpt-4-turbo', name: 'GPT-4 Turbo', capabilities: { reasoning: true, code: true } },
            { id: 'openai/gpt-3.5-turbo', name: 'GPT-3.5 Turbo', capabilities: { reasoning: true } },
        ]
    },
    {
        name: "Anthropic",
        logo: <Bot size={16} className="text-purple-500" />,
        models: [
            { id: 'anthropic/claude-3-opus', name: 'Claude 3 Opus', capabilities: { vision: true, reasoning: true, code: true } },
            { id: 'anthropic/claude-3-sonnet', name: 'Claude 3 Sonnet', capabilities: { vision: true, reasoning: true, code: true } },
        ]
    },
];

// We still export a flattened version for convenience in other parts of the app
export const allModels = modelCategories.flatMap(category => 
    category.models.map(model => ({ ...model, provider: category.name }))
);