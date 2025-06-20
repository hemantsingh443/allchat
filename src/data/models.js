// src/data/models.js

import React from 'react';
import { GoogleLogo, OpenAILogo, AnthropicLogo, MistralLogo, DeepSeekLogo, KimiLogo, GrokLogo, QwenLogo, OllamaLogo, GeminiLogo } from './modelLogos';

export const modelCategories = [
    {
        name: "Google",
        logo: <GoogleLogo />,
        models: [
            { id: 'google/gemini-1.5-flash-latest', name: 'Gemini 1.5 Flash', description: 'Fast and versatile multimodal model.', capabilities: { vision: true, code: true }, isFree: true, isDefault: true },
            { id: 'google/gemini-1.5-pro-latest', name: 'Gemini 1.5 Pro', description: 'High-performance model for complex tasks.', capabilities: { vision: true, code: true } },
            { id: 'google/gemini-2.5-flash', name: 'Gemini 2.5 Flash', description: 'Next-gen speed with thinking capabilities.', capabilities: { vision: true, code: true, reasoning: true } },
            { id: 'google/gemini-2.5-pro', name: 'Gemini 2.5 Pro', description: 'Advanced reasoning and thinking model.', capabilities: { vision: true, code: true, reasoning: true } },
            { id: 'google/gemini-2.5-flash-lite-preview-06-17', name: 'Gemini 2.5 Flash Lite', description: 'Preview model with thinking capabilities.', capabilities: { vision: true, code: true, reasoning: true } },
        ]
    },
    {
        name: "Anthropic",
        logo: <AnthropicLogo />,
        models: [
            { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', description: 'Anthropic\'s fastest and most intelligent model.', capabilities: { vision: true, code: true } },
            { id: 'anthropic/claude-3-opus', name: 'Claude 3 Opus', description: 'Most powerful model for complex tasks.', capabilities: { vision: true, code: true } },
            { id: 'anthropic/claude-3-haiku', name: 'Claude 3 Haiku', description: 'Fast and compact for near-instant responses.', capabilities: { vision: true, code: true } },
        ]
    },
    {
        name: "OpenAI",
        logo: <OpenAILogo />,
        models: [
            { id: 'openai/gpt-4.1-nano', name: 'GPT-4.1 Nano', description: 'A highly efficient and capable small model from OpenAI.', capabilities: { vision: true, code: true }, isFree: true },
            { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', description: 'Efficient, fast, and affordable flagship model.', capabilities: { vision: true, code: true } },
            { id: 'openai/gpt-4o', name: 'GPT-4o', description: 'OpenAI\'s latest and most advanced model.', capabilities: { vision: true, code: true } },
            { id: 'openai/gpt-4-turbo', name: 'GPT-4 Turbo', description: 'Powerful model with a large context window.', capabilities: { vision: true, code: true } },
        ]
    },
    {
        name: "Mistral AI",
        logo: <MistralLogo />,
        models: [
            { id: 'mistralai/mistral-7b-instruct:free', name: 'Mistral 7B Instruct', description: 'Efficient and high-performing 7B model.', capabilities: { code: true }, isFree: true },
            { id: 'mistralai/devstral-small:free', name: 'Devstral Small', description: 'A specialized model for code generation.', capabilities: { code: true }, isFree: true },
            { id: 'mistralai/mistral-large-latest', name: 'Mistral Large', description: 'Top-tier reasoning for complex tasks.', capabilities: { code: true } },
        ]
    },
    {
        name: "DeepSeek",
        logo: <DeepSeekLogo />,
        models: [
            { id: 'deepseek/deepseek-r1:free', name: 'DeepSeek R1-0528', description: 'Best-in-class for advanced reasoning.', capabilities: { reasoning: true, code: true }, isFree: true },
        ]
    },
    {
        name: "Kimi",
        logo: <KimiLogo />,
        models: [
            { id: 'moonshotai/kimi-dev-72b:free', name: 'Kimi-Dev-72B', description: 'Large context window and reasoning.', capabilities: { reasoning: true, code: true }, isFree: true },
        ]
    },
    {
        name: "xAI",
        logo: <GrokLogo />,
        models: [
            { id: 'xai/grok-1.5-flash', name: 'Grok 1.5 Flash', description: 'High-performance model from xAI.', capabilities: { code: true } }
        ]
    },
    {
        name: "Qwen",
        logo: <QwenLogo />,
        models: [
            { id: 'qwen/qwen-2-72b-instruct', name: 'Qwen 2 72B Instruct', description: 'Large-scale multimodal model from Alibaba.', capabilities: { vision: true, code: true } }
        ]
    },
    {
        name: "Community",
        logo: <OllamaLogo />,
        models: [
            { id: 'nousresearch/hermes-3-llama-3.1-70b', name: 'Nous Hermes 3 Llama 3.1 70B', description: 'A powerful open-source Hermes 3 model based on Llama 3.1 70B.', capabilities: { code: true } },
        ]
    },
];

// We still export a flattened version for convenience in other parts of the app
export const allModels = modelCategories.flatMap(category =>
    category.models.map(model => ({ ...model, provider: category.name }))
);