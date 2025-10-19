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

		const systemPrompt =  `Du bist Tim, ein NPC welcher in dieser Anwendung als Arbeitskollege im Gebiet der Informatik auftritt.
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
		\n\nDatenstruktur-Kontext:\n- 
		Für jede Aufgabe bekommst du: 'question' (Aufgabenstellung), 'availableItems' (Antwortoptionen), 'correctItems' (richtige Antworten, nicht verraten).
		\n- Nutze 'correctItems' nur, um zu prüfen, was der Student versteht, nicht um Antworten zu nennen.`;

		// Build messages. If the client provided a taskContext, include a
		// formatted, human-readable representation as an extra user message so
		// the assistant can ground its answer in the current task.
		const contextMsgParts: string[] = [];
		if (taskMeta && (taskMeta.id || taskMeta.title)) {
			contextMsgParts.push(`Aufgabe: ${taskMeta.title ?? taskMeta.id}`);
		}
		
		// Load solution server-side based on task identifiers
		let solutionContext: any = null;
		if (taskContext && typeof taskContext === 'object') {
			const ctx = taskContext as any;
			const subtaskType = ctx.subtaskType;
			const taskId = ctx.taskId;
			const roundIndex = ctx.roundIndex;

			if (subtaskType === 'WriteAssembly' && taskId) {
				const task = writeAssemblyTasks.find((t: any) => t.id === taskId);
				if (task) {
					solutionContext = {
						correctSequence: task.commands,
					};
				}
			} else if (subtaskType === 'ReadAssembly' && taskId) {
				const task = readAssemblyTasks.find((t: any) => t.id === taskId);
				if (task) {
					solutionContext = {
						correctAnswerIndex: task.correct_index,
						correctAnswer: task.options[task.correct_index],
					};
				}
			} else if (subtaskType === 'JavaToAssembly' && taskId) {
				const task = javaToAssemblyTasks.find((t: any) => t.id === taskId);
				if (task) {
					solutionContext = {
						correctSequence: task.assembler,
					};
				}
			} else if (subtaskType === 'VonNeumann' && ctx.roundType) {
				const data = vonNeumannData as any;
				if (ctx.roundType === 'quiz') {
					solutionContext = {
						correctItems: data.quizItems
							.filter((item: any) => item.isCore)
							.map((item: any) => item.label),
					};
				} else if (ctx.roundType === 'functions' && ctx.selectedComponentIds) {
					// Reconstruct the correct matches from the selected IDs
					const correctMatches: Record<string, string> = {};
					ctx.selectedComponentIds.forEach((id: string) => {
						const label = data.idToLabel[id];
						const desc = data.idToDesc[id];
						if (label && desc) {
							correctMatches[label] = desc;
						}
					});
					solutionContext = { correctMatches };
				} else if (ctx.roundType === 'reconstruct') {
					solutionContext = {
						correctPlacements: {
							cpuZones: ['Steuerwerk', 'Rechenwerk'],
							transportZone: 'Transportmedium',
							bottomZones: ['RAM', 'ROM', 'Peripherie'],
						},
					};
				} else if (ctx.roundType === 'busAssignment') {
					solutionContext = {
						correctAssignments: {
							leftZone: 'Datenbus',
							rightZones: ['Adressbus', 'Steuerbus'],
						},
					};
				}
			}
		}
		
		// Format task context intelligently based on task type
		if (taskContext && typeof taskContext === 'object') {
			try {
				const ctx = taskContext as any;
				
				if (ctx.subtaskType === 'JavaToAssembly') {
					contextMsgParts.push(`\nAufgabentyp: Java → Assembler`);
					contextMsgParts.push(`Thema: ${ctx.topic || 'unbekannt'}`);
					contextMsgParts.push(`Schwierigkeit: ${ctx.difficulty || 'unbekannt'}`);
					if (ctx.javaCode) {
						contextMsgParts.push(`\nJava-Code:\n${ctx.javaCode}`);
					}
					contextMsgParts.push(`\nAnzahl benötigter Assembler-Befehle: ${ctx.numberOfCommands || '?'}`);
					if (ctx.addresses && Array.isArray(ctx.addresses)) {
						contextMsgParts.push(`Speicheradressen: ${ctx.addresses.join(', ')}`);
					}
					// Add solution context
					if (solutionContext && solutionContext.correctSequence) {
						contextMsgParts.push(`\nKorrekte Assembler-Sequenz: ${solutionContext.correctSequence.join(', ')}`);
					}
				} else if (ctx.subtaskType === 'ReadAssembly') {
					contextMsgParts.push(`\nAufgabentyp: Assembler-Programm lesen`);
					contextMsgParts.push(`Frage: ${ctx.question || 'unbekannt'}`);
					if (ctx.assemblyProgram && Array.isArray(ctx.assemblyProgram)) {
						contextMsgParts.push(`\nAssembler-Programm:`);
						ctx.assemblyProgram.forEach((instr: any) => {
							contextMsgParts.push(`  ${instr.address}: ${instr.operation} ${instr.argument || ''}`);
						});
					}
					if (ctx.answerOptions && Array.isArray(ctx.answerOptions)) {
						contextMsgParts.push(`\nAntwortoptionen: ${ctx.answerOptions.join(', ')}`);
					}
					if (ctx.initialValues) {
						contextMsgParts.push(`\nInitiale Speicherwerte: ${JSON.stringify(ctx.initialValues)}`);
					}
					// Add solution context
					if (solutionContext && solutionContext.correctAnswer) {
						contextMsgParts.push(`\nKorrekte Antwort: ${solutionContext.correctAnswer}`);
					}
				} else if (ctx.subtaskType === 'WriteAssembly') {
					contextMsgParts.push(`\nAufgabentyp: Assembler-Programm schreiben`);
					contextMsgParts.push(`Aufgabenbeschreibung: ${ctx.taskDescription || 'unbekannt'}`);
					contextMsgParts.push(`Schwierigkeit: ${ctx.difficulty || 'unbekannt'}`);
					contextMsgParts.push(`Anzahl benötigter Befehle: ${ctx.numberOfCommands || '?'}`);
					// Add solution context
					if (solutionContext && solutionContext.correctSequence) {
						contextMsgParts.push(`\nKorrekte Befehls-Sequenz:`);
						solutionContext.correctSequence.forEach((cmd: any) => {
							contextMsgParts.push(`  ${cmd.op} ${cmd.arg !== null ? cmd.arg : ''}`);
						});
					}
				} else if (ctx.subtaskType === 'VonNeumann') {
					contextMsgParts.push(`\nAufgabentyp: Von-Neumann-Architektur`);
					contextMsgParts.push(`Rundentyp: ${ctx.roundType || 'unbekannt'}`);
					if (ctx.question) {
						contextMsgParts.push(`Frage: ${ctx.question}`);
					}
					if (ctx.availableItems) {
						contextMsgParts.push(`Verfügbare Elemente: ${ctx.availableItems.join(', ')}`);
					}
					if (ctx.components) {
						contextMsgParts.push(`Komponenten: ${ctx.components.join(', ')}`);
					}
					if (ctx.availableComponents) {
						contextMsgParts.push(`Verfügbare Komponenten: ${ctx.availableComponents.join(', ')}`);
					}
					// Add solution context
					if (solutionContext) {
						if (solutionContext.correctItems) {
							contextMsgParts.push(`\nKorrekte Komponenten: ${solutionContext.correctItems.join(', ')}`);
						}
						if (solutionContext.correctMatches) {
							contextMsgParts.push(`\nKorrekte Zuordnungen:`);
							Object.entries(solutionContext.correctMatches).forEach(([comp, desc]) => {
								contextMsgParts.push(`  ${comp} → ${desc}`);
							});
						}
						if (solutionContext.correctPlacements) {
							contextMsgParts.push(`\nKorrekte Platzierung:`);
							contextMsgParts.push(`  CPU-Zonen: ${solutionContext.correctPlacements.cpuZones.join(', ')}`);
							contextMsgParts.push(`  Transport: ${solutionContext.correctPlacements.transportZone}`);
							contextMsgParts.push(`  Bottom-Zonen: ${solutionContext.correctPlacements.bottomZones.join(', ')}`);
						}
						if (solutionContext.correctAssignments) {
							contextMsgParts.push(`\nKorrekte Bus-Zuordnung:`);
							contextMsgParts.push(`  Links: ${solutionContext.correctAssignments.leftZone}`);
							contextMsgParts.push(`  Rechts: ${solutionContext.correctAssignments.rightZones.join(', ')}`);
						}
					}
				} else {
					// Fallback: use the preview or raw JSON
					const preview = contextPreview || JSON.stringify(taskContext).slice(0, 800);
					contextMsgParts.push(`\nKontext: ${preview}`);
				}
			} catch (err) {
				contextMsgParts.push('\nKontext: [konnte nicht gelesen werden]');
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
