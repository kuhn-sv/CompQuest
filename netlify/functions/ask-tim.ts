// Netlify Function (TypeScript): Ask Tim
// Uses fetch to call OpenAI Chat Completions API. Requires env var OPENAI_API_KEY.

// Minimal types to avoid importing @netlify/functions
type HeadersLike = { [key: string]: string };
type NetlifyHandler = (event: { httpMethod: string; body?: string | null }) => Promise<{
	statusCode: number;
	body?: string;
	headers?: HeadersLike;
}>;

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export const handler: NetlifyHandler = async (event) => {
	if (event.httpMethod !== 'POST') {
			return {
				statusCode: 405,
				body: 'Method Not Allowed',
				headers: { Allow: 'POST' } as HeadersLike,
			};
	}

	try {
		const apiKey = process.env.OPENAI_API_KEY;
		if (!apiKey) {
			return {
				statusCode: 500,
				body: JSON.stringify({ error: 'Server API key missing.' }),
				headers: { 'Content-Type': 'application/json' },
			};
		}

		const body = event.body ? (JSON.parse(event.body) as { question?: string; taskMeta?: any; taskContext?: any; contextPreview?: string; messages?: Array<{role: string; content: string}> }) : {};
		const question = (body.question ?? '').toString().trim();
		const taskMeta = body.taskMeta ?? null;
		const taskContext = body.taskContext ?? null;
		const contextPreview = (body.contextPreview ?? null) as string | null;
		const priorMessages = Array.isArray(body.messages) ? body.messages.slice(-20).map(m => ({role: m.role === 'assistant' ? 'assistant' : 'user', content: String(m.content ?? '')})) : [];
		if (!question) {
			return {
				statusCode: 400,
				body: JSON.stringify({ error: 'Frage fehlt.' }),
				headers: { 'Content-Type': 'application/json' },
			};
		}
		if (question.length > 250) {
			return {
				statusCode: 400,
				body: JSON.stringify({ error: 'Frage ist zu lang (max. 250 Zeichen).' }),
				headers: { 'Content-Type': 'application/json' },
			};
		}

		const systemPrompt = `Du bist Tim, ein NPC welcher in dieser Anwendung als Arbeitskollege im Gebiet der Informatik auftritt. Aber deine Funktion ist hier ein didaktisch geschulter Tutor-NPC für das Fach Technische Informatik (nach Hoffmann, Grundlagen der Technischen Informatik, Kap. 3) zu sein.
Dein Ziel ist, Studierenden beim Verstehen von Zahlendarstellung, Zahlensystemen und Rechner-internen Formaten zu helfen, ohne Ergebnisse vorzugeben.
Verwende sokratisches Fragen, Scaffolding und positive Verstärkung.
Antworte stets in 2–4 kurzen, klaren Sätzen plus einer Abschlussfrage.
Passe deine Antworten an die Kategorien normal_question, wrong_answer, right_answer oder dont_know an.
Bleibe immer freundlich, fachlich korrekt, und im thematischen Rahmen von Hoffmann, Kap. 3.`;

		// Build messages. If the client provided a taskContext, include a
		// concise representation as an extra user message so the assistant can
		// ground its answer in the current task. Limit the length to avoid
		// consuming too many tokens.
		const contextMsgParts: string[] = [];
		if (taskMeta && (taskMeta.id || taskMeta.title)) {
			contextMsgParts.push(`Task: ${taskMeta.title ?? taskMeta.id}`);
		}
		if (contextPreview) {
			contextMsgParts.push(`Context: ${contextPreview}`);
		} else if (taskContext) {
			try {
				const s = JSON.stringify(taskContext);
				contextMsgParts.push(
					`Context: ${s.length > 1000 ? s.slice(0, 1000) + '…' : s}`,
				);
			} catch {
				contextMsgParts.push('Context: [unserializable]');
			}
		}

		// messages sequence: system -> (context) -> prior chat messages -> current user question
		const messages: any[] = [];
		messages.push({ role: 'system', content: systemPrompt });
		if (contextMsgParts.length > 0) {
			messages.push({ role: 'user', content: contextMsgParts.join('\n') });
		}
		// include prior messages (up to a small cap)
		for (const m of priorMessages) {
			messages.push({ role: m.role, content: m.content });
		}
		// finally add the newest user question
		messages.push({ role: 'user', content: question });

		const resp = await fetch(OPENAI_API_URL, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${apiKey}`,
			},
			body: JSON.stringify({
				model: 'gpt-3.5-turbo',
				messages,
				temperature: 0.2,
				max_tokens: 350,
			}),
		});

		if (!resp.ok) {
			const text = await resp.text();
			return {
				statusCode: 500,
				body: JSON.stringify({ error: 'Fehler von OpenAI: ' + text.substring(0, 500) }),
				headers: { 'Content-Type': 'application/json' },
			};
		}

		const data = (await resp.json()) as any;
		const answer: string | undefined = data?.choices?.[0]?.message?.content?.trim();

		return {
			statusCode: 200,
			body: JSON.stringify({ answer: answer ?? 'Keine Antwort erhalten.' }),
			headers: { 'Content-Type': 'application/json' },
		};
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : 'Unbekannter Fehler';
		return {
			statusCode: 500,
			body: JSON.stringify({ error: message }),
			headers: { 'Content-Type': 'application/json' },
		};
	}
};

export default handler;
