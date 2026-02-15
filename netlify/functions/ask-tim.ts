// Netlify Function (TypeScript): Ask Tim
// Uses fetch to call OpenAI Chat Completions API. Requires env var OPENAI_API_KEY.

// Import task data from local function data directory
import writeAssemblyTasks from './data/write-assembly.json';
import readAssemblyTasks from './data/read-assembly.json';
import javaToAssemblyTasks from './data/java-to-assembly.json';
import vonNeumannData from './data/von-neumann.json';

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

		const body = event.body ? (JSON.parse(event.body) as { question?: string; taskMeta?: any; taskContext?: any; contextPreview?: string; messages?: Array<{ role: string; content: string }> }) : {};
		const question = (body.question ?? '').toString().trim();
		const taskMeta = body.taskMeta ?? null;
		const taskContext = body.taskContext ?? null;
		const contextPreview = (body.contextPreview ?? null) as string | null;
		const priorMessages = Array.isArray(body.messages) ? body.messages.slice(-20).map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: String(m.content ?? '') })) : [];
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

		const systemPrompt = `Du bist Tim, ein NPC welcher in dieser Anwendung als Arbeitskollege im Gebiet der Informatik auftritt.
		Aber hinter der Facade bist du ein digitaler Lernassistent für das Modul 'Start Informatik'.
		Deine Aufgabe ist es, Studierende beim Verstehen der technischen Informatik zu unterstützen – nicht, ihnen Aufgabenlösungen direkt zu verraten.
		Dein Wissen basiert auf dem Buch 'Grundlagen der Technischen Informatik' von Dirk W. Hoffmann, insbesondere:\n- Kapitel 3: Zahlendarstellung (Zahlensysteme, Einer-/Zweierkomplement, Fest- & Gleitkommadarstellung, Arithmetik, Komplemente)\n- Kapitel 11: Mikroprozessortechnik (Von-Neumann-Architektur, Assembly, Java zu Assembly)\n\nDidaktische Leitlinien:
		\n1. Scaffolding: Gib Hinweise in kleinen Schritten, um Studierende zur eigenen Lösung zu führen.
		\n2. Sokratisches Fragen: Stelle gezielte Rückfragen statt die Lösung zu nennen.
		\n3. Positive Verstärkung: Lobe und ermutige Lernende.\n
		4. Adaptives Feedback: Bei Verständnisfragen direkte Antwort, bei aufgabenbezogenen Fragen Hilfestellung ohne Lösung.
		\n\nAntwortstrategie:\n- Verständnisfragen (Whitelist): Beantworte klar und kurz, z. B. 'Wie viele Kernkomponenten hat die Von-Neumann-Architektur?' oder 'Was bedeutet BRZ?'.
		\n- Aufgabenbezogene Fragen (Quiz, Multiple Choice, Zuweisung): Nenne nie die Lösung. Erkläre stattdessen Prinzipien, Denkwege und Merkmale, die zum selbstständigen Finden führen.
		\n- Assemblerbefehle: Allgemeine Fragen zu Befehlen beantworten. Fragen zur konkreten Lösung von Aufgaben nur durch Hinweise erklären, nicht direkt lösen.
		\n- Codeverständnis: Erkläre, was der Code macht, aber nicht die Lösung einer Aufgabe.
		\n\nTon & Stil:\n- Freundlich, motivierend, positiv.
		\n- Fachlich korrekt, aber einfach erklärt.
		\n\nWichtige Regeln:\n- Nie die Lösung direkt nennen.
		\n- Hilf, Konzepte und Zusammenhänge zu verstehen.
		\n- Bei Unsicherheit immer Erklärung statt Lösung.
		\n- Wenn der Student explizit nach der Lösung fragt: 'Ich kann dir die Lösung nicht direkt sagen, aber ich kann dir helfen, sie zu finden. Möchtest du, dass ich dir einen Hinweis gebe?'
		\n- Wenn der Student nach einem Beispiel fragt, achte darauf niemals Beispiele mit den Werten aus der aktuellen Aufgabe zu geben.
		\n- Wenn der Student explizit nach der Lösung fragt: 'Ich kann dir die Lösung nicht direkt sagen, aber ich kann dir helfen, sie zu finden. Möchtest du, dass ich dir einen Hinweis gebe?'
		\n\nDatenstruktur-Kontext:\n- 
		Für jede Aufgabe bekommst du: 'description' (Aufgabenstellung), 'contextData' (Variablen/Zustand), 'userState' (Eingabe des Nutzers) und 'solution' (Korrekte Lösung).
		\n- Nutze 'solution' und 'userState' um zu analysieren, wo der Nutzer steht und welche Fehler er gemacht hat.
		\n- VERRATE NIEMALS DIE LÖSUNG DIREKT, auch wenn sie im Context steht. Nutze sie nur für präzise, sokratische Hinweise.`;

		// Build messages. If the client provided a taskContext, include a
		// formatted, human-readable representation as an extra user message so
		// the assistant can ground its answer in the current task.
		const contextMsgParts: string[] = [];
		if (taskMeta && (taskMeta.id || taskMeta.title)) {
			contextMsgParts.push(`Aufgabe: ${taskMeta.title ?? taskMeta.id}`);
		}



		if (taskContext && typeof taskContext === 'object') {
			try {
				const ctx = taskContext as any;

				// Generic handling for new TaskContext interface
				if (ctx.subtaskType) {
					contextMsgParts.push(`\nAufgabentyp: ${ctx.subtaskType}`);
					contextMsgParts.push(`Titel: ${ctx.taskTitle || 'Unbekannt'}`);

					if (ctx.description) {
						contextMsgParts.push(`\nAufgabenstellung:\n${ctx.description}`);
					}

					if (ctx.contextData) {
						contextMsgParts.push(`\nSzenario / Daten:\n${JSON.stringify(ctx.contextData, null, 2)}`);
					}

					if (ctx.userState) {
						contextMsgParts.push(`\nAktuelle Eingabe des Nutzers:\n${JSON.stringify(ctx.userState, null, 2)}`);
					}

					if (ctx.solution) {
						contextMsgParts.push(`\n--- INTERNE LÖSUNG (NICHT VERRATEN) ---\n${JSON.stringify(ctx.solution, null, 2)}\n---------------------------------------`);
					}
				} else {
					// Fallback for legacy or unknown structure
					const preview = contextPreview || JSON.stringify(taskContext).slice(0, 800);
					contextMsgParts.push(`\nKontext: ${preview}`);
				}

			} catch (err) {
				contextMsgParts.push('\nKontext: [Fehler beim Lesen des TaskContext]');
			}
		} else if (contextPreview) {
			contextMsgParts.push(`\nKontext: ${contextPreview}`);
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

		console.log(process.env.TIM_MODEL, 'tim model')
		const resp = await fetch(OPENAI_API_URL, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${apiKey}`,
			},
			body: JSON.stringify({
				model: process.env.TIM_MODEL ?? 'chatgpt-4o-latest',
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
