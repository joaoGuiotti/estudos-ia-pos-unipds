const OPENROUTER_SITE_NAME = "My First Example";
const OPENROUTER_SITE_URL = "https://openrouter.ai";
const NLP_MODEL = "google/gemma-4-26b-a4b-it:free"

fetch(process.env.API_URL as string, {
    method: 'POST',
    headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_KEY}`,
        'HTTP-Referer': OPENROUTER_SITE_URL,
        'X-OpenRouter-Title': OPENROUTER_SITE_NAME,
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        model: NLP_MODEL,
        messages: [
            {
                role: 'user',
                content: 'Do que é feito um edredon?',
            },
        ],
    }),
}).then(async res => {
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
}).catch(console.error);


// {
//   "id": "gen-1782051636-RYXW5grDGMFXqHCqIXNr",
//   "object": "chat.completion",
//   "created": 1782051636,
//   "model": "google/gemma-4-26b-a4b-it-20260403:free",
//   "provider": "Google AI Studio",
//   "system_fingerprint": null,
//   "service_tier": "default",
//   "choices": [
//     {
//       "index": 0,
//       "logprobs": null,
//       "finish_reason": "stop",
//       "native_finish_reason": "STOP",
//       "message": {
//         "role": "assistant",
//         "content": "Because there is no single, scientifically proven answer to this question, humanity has developed several different frameworks to address it. Depending on who you ask—a scientist, a philosopher, a priest, or an artist—you will receive a very different answer.\n\nHere are the primary ways humans attempt to define the meaning of life:\n\n### 1. The Biological Perspective: Survival and Transmission\nFrom a purely evolutionary standpoint, the \"meaning\" of life is simple: **to continue life.**\n*   **Survival:** Staying alive long enough to reach maturity.\n*   **Reproduction:** Passing on genetic information to the next generation.\n*   **Evolution:** Contributing to the gradual adaptation and improvement of the species.\n\n### 2. The Religious and Spiritual Perspective: Divine Purpose\nFor billions of people, meaning is derived from a connection to something greater than the self.\n*   **Theistic Religions:** Meaning is found in knowing, loving, and serving a Creator, and preparing for an existence beyond this life.\n*   **Eastern Philosophies:** In traditions like Buddhism or Hinduism, meaning may involve learning karmic lessons, fulfilling one's *Dharma* (duty), and eventually achieving enlightenment or liberation from the cycle of suffering.\n\n### 3. The Philosophical Perspectives: Logic and Ethics\nPhilosophers have debated this for millennia, resulting in several major schools of thought:\n*   **Nihilism:** The belief that life has no intrinsic meaning or value. While this sounds bleak, many find freedom in it (see \"Optimistic Nihilism\" below).\n*   **Existentialism:** Popularized by thinkers like Jean-Paul Sartre, this view suggests that the universe provides no inherent meaning, but that this gives you the absolute freedom to **create your own.** You are the architect of your own purpose.\n*   **Absurdism:** Albert Camus argued that humanity has an innate drive to find meaning, but the universe is coldly indifferent and meaningless. The \"meaning\" of life is to accept this absurdity and live defiantly and passionately anyway.\n*   **Hedonism:** The idea that the goal of life is to maximize pleasure and minimize pain.\n*   **Virtue Ethics (Eudaimonia):** Aristotle argued that the meaning of life is \"flourishing\"—achieving excellence through reason and virtue.\n\n### 4. The Psychological Perspective: Connection and Contribution\nPsychologists often look at what makes life *feel* meaningful to a person. Research suggests that meaning usually comes from four pillars:\n*   **Belonging:** Being part of a community or relationship where you are valued.\n*   **Purpose:** Having long-term goals that motivate you to get out of bed.\n*   **Storytelling:** The narrative you create about your life—how you make sense of your triumphs and your suffering.\n*   **Transcendence:** Moments when you feel connected to a higher reality (through art, nature, or meditation).\n\n### 5. The \"Optimistic Nihilist\" Approach (The Modern Synthesis)\nIn recent years, a popular modern view has emerged: If the universe is vast, ancient, and indifferent, then your mistakes don't matter, your embarrassments are temporary, and there is no \"destiny\" you are failing to meet. This realization can be incredibly liberating. It means you are free to enjoy a good cup of coffee, love your friends, and pursue hobbies simply because they make you happy.\n\n***\n\n### Summary\nIf you are looking for a definitive answer, you won't find one written in the stars. Instead, the question is often misunderstood. It is not **\"What is the meaning of life?\"** (as if meaning is a hidden object to be found), but rather **\"How will I create meaning in my life?\"** (as if meaning is a work of art to be made).",
//         "refusal": null,
//         "reasoning": null
//       }
//     }
//   ],
//   "usage": {
//     "prompt_tokens": 8,
//     "completion_tokens": 803,
//     "total_tokens": 811,
//     "cost": 0,
//     "is_byok": false,
//     "prompt_tokens_details": {
//       "cached_tokens": 0,
//       "cache_write_tokens": 0,
//       "audio_tokens": 0,
//       "video_tokens": 0
//     },
//     "cost_details": {
//       "upstream_inference_cost": 0,
//       "upstream_inference_prompt_cost": 0,
//       "upstream_inference_completions_cost": 0
//     },
//     "completion_tokens_details": {
//       "reasoning_tokens": 0,
//       "image_tokens": 0,
//       "audio_tokens": 0
//     }
//   }
// }