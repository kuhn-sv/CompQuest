import { TaskId } from '@shared/enums/taskId.enum';
import type { TaskMetadata } from '@shared/interfaces/tasking.interfaces';

/**
 * Centralised task metadata – the **single source of truth** for every
 * task's display title, description, book chapters, time-limit-for-bonus,
 * and result-screen feedback strings.
 *
 * Usage:
 *   import { TASKS_DATA } from '@tasks/shared/data/tasks.data';
 *   const meta = TASKS_DATA[TaskId.NumberSystem];
 */
export const TASKS_DATA: Record<string, TaskMetadata> = {
    // ──────────────────────────────────────────────────────────
    //  Number Representation  (Zahlendarstellung)
    // ──────────────────────────────────────────────────────────

    [TaskId.NumberSystem]: {
        id: TaskId.NumberSystem,
        title: 'Zahlensystem-Decoder initialisieren',
        description:
            'Verbinde Zahlen mit ihren Äquivalenten in verschiedenen Zahlensystemen.',
        dashboardDescription: 'Konvertiere zwischen binär, oktal & hexadezimal um.',
        chapters: [{ title: '3.1 Zahlensysteme' }],
        timeLimit: 5 * 60 * 1000,
        feedback: {
            accurateAndFast:
                '💨 Genau & Schnell\n„Wow, stark! Du warst richtig fix unterwegs und hast sauber gearbeitet. So sieht\'s aus, wenn man\'s wirklich verstanden hat!"',
            accurateButSlow:
                '⏱️ Genau, aber Langsam\n„Gute Arbeit – alles richtig, nur etwas gemütlich. Keine Sorge, das ist normal! Mit mehr Routine geht\'s schneller. Wenn du magst, übe nochmal mit den Helfermodulen oder schau ins Buch 3.1 Zahlensysteme für ein paar Tricks, wie man sicherer wird."',
            inaccurateButFast:
                '⚡ Ungenau, aber Schnell\n„Du bist echt flott, aber ein paar Rechenschritte waren daneben 😅. Versuch, dir beim nächsten Mal kurz Zeit fürs Prüfen zu nehmen. Die Helfermodule im Übungsmenü helfen dir super dabei – oder wirf nochmal einen Blick in Kapitel 3.1 Zahlensysteme im Buch."',
            inaccurateAndSlow:
                '🐢 Ungenau & Langsam\n„Okay, das war ein harter Ritt – aber du hast\'s durchgezogen! 💪 Ich würd dir empfehlen, dir die Helfermodule im Übungsmenü nochmal anzusehen und ggf. das Buchkapitel 3.1 Zahlensysteme durchzulesen. Danach läuft das deutlich flüssiger."',
        },
    },

    [TaskId.PositiveArithmetic]: {
        id: TaskId.PositiveArithmetic,
        title: 'Additions-Schaltkreis prüfen',
        description: 'Additionen und Subtraktionen mit positiven Zahlen.',
        dashboardDescription: 'Addiere in binär, oktal & hexadezimal.',
        chapters: [{ title: '3.1 Zahlensysteme' }],
        timeLimit: 5 * 60 * 1000,
        feedback: {
            accurateAndFast:
                '💨 Genau & Schnell\n„Wow, stark! Du warst richtig fix unterwegs und hast sauber gearbeitet. So sieht\'s aus, wenn man\'s wirklich verstanden hat!"',
            accurateButSlow:
                '⏱️ Genau, aber Langsam\n„Gute Arbeit – alles richtig, nur etwas gemütlich. Keine Sorge, das ist normal! Mit mehr Routine geht\'s schneller. Wenn du magst, übe nochmal mit den Helfermodulen oder schau ins Buch 3.1 Zahlensysteme für ein paar Tricks, wie man sicherer wird."',
            inaccurateButFast:
                '⚡ Ungenau, aber Schnell\n„Du bist echt flott, aber ein paar Rechenschritte waren daneben 😅. Versuch, dir beim nächsten Mal kurz Zeit fürs Prüfen zu nehmen. Die Helfermodule im Übungsmenü helfen dir super dabei – oder wirf nochmal einen Blick in Kapitel 3.1 Zahlensysteme im Buch."',
            inaccurateAndSlow:
                '🐢 Ungenau & Langsam\n„Okay, das war ein harter Ritt – aber du hast\'s durchgezogen! 💪 Ich würd dir empfehlen, dir die Helfermodule im Übungsmenü nochmal anzusehen und ggf. das Buchkapitel 3.1 Zahlensysteme durchzulesen. Danach läuft das deutlich flüssiger."',
        },
    },

    [TaskId.Complements]: {
        id: TaskId.Complements,
        title: 'Negativzahlen-Modul wiederherstellen',
        description:
            'Verbinde Binärzahlen mit ihren Dezimalwerten und übe Einer-/Zweierkomplement.',
        dashboardDescription: 'Stelle negative Zahlen im Binärsystem dar.',
        chapters: [{ title: '3.2.1 Darstellung natürlicher Zahlen' }],
        timeLimit: 5 * 60 * 1000,
        feedback: {
            accurateAndFast:
                '💨 Genau & Schnell\n„Wow, stark! Du warst richtig fix unterwegs und hast sauber gearbeitet. So sieht\'s aus, wenn man\'s wirklich verstanden hat!"',
            accurateButSlow:
                '⏱️ Genau, aber Langsam\n„Gute Arbeit – alles richtig, nur etwas gemütlich. Keine Sorge, das ist normal! Mit mehr Routine geht\'s schneller. Wenn du magst, übe nochmal mit den Helfermodulen oder schau ins Buch 3.2.1 Darstellung natürlicher Zahlen für ein paar Tricks, wie man sicherer wird."',
            inaccurateButFast:
                '⚡ Ungenau, aber Schnell\n„Du bist echt flott, aber ein paar Rechenschritte waren daneben 😅. Versuch, dir beim nächsten Mal kurz Zeit fürs Prüfen zu nehmen. Die Helfermodule im Übungsmenü helfen dir super dabei – oder wirf nochmal einen Blick in Kapitel 3.2.1 Darstellung natürlicher Zahlen im Buch."',
            inaccurateAndSlow:
                '🐢 Ungenau & Langsam\n„Okay, das war ein harter Ritt – aber du hast\'s durchgezogen! 💪 Ich würd dir empfehlen, dir die Helfermodule im Übungsmenü nochmal anzusehen und ggf. das Buchkapitel 3.2.1 Darstellung natürlicher Zahlen durchzulesen. Danach läuft das deutlich flüssiger."',
        },
    },

    [TaskId.TwosComplementArithmetic]: {
        id: TaskId.TwosComplementArithmetic,
        title: 'Vorzeichenbehaftete Recheneinheit aktivieren',
        description:
            'Verbinde Operationen im Zweierkomplement und erkenne Überläufe.',
        dashboardDescription: 'Wende das Zweierkomplement in Rechnungen an und verstehe Vorzeichenoperationen.',
        chapters: [{ title: '3.2.1 Darstellung natürlicher Zahlen' }],
        timeLimit: 5 * 60 * 1000,
        feedback: {
            accurateAndFast:
                '💨 Genau & Schnell\n„Wow, stark! Du warst richtig fix unterwegs und hast sauber gearbeitet. So sieht\'s aus, wenn man\'s wirklich verstanden hat!"',
            accurateButSlow:
                '⏱️ Genau, aber Langsam\n„Gute Arbeit – alles richtig, nur etwas gemütlich. Keine Sorge, das ist normal! Mit mehr Routine geht\'s schneller. Wenn du magst, übe nochmal mit den Helfermodulen oder schau ins Buch 3.2.1 Darstellung natürlicher Zahlen für ein paar Tricks, wie man sicherer wird."',
            inaccurateButFast:
                '⚡ Ungenau, aber Schnell\n„Du bist echt flott, aber ein paar Rechenschritte waren daneben 😅. Versuch, dir beim nächsten Mal kurz Zeit fürs Prüfen zu nehmen. Die Helfermodule im Übungsmenü helfen dir super dabei – oder wirf nochmal einen Blick in Kapitel 3.2.1 Darstellung natürlicher Zahlen im Buch."',
            inaccurateAndSlow:
                '🐢 Ungenau & Langsam\n„Okay, das war ein harter Ritt – aber du hast\'s durchgezogen! 💪 Ich würd dir empfehlen, dir die Helfermodule im Übungsmenü nochmal anzusehen und ggf. das Buchkapitel 3.2.1 Darstellung natürlicher Zahlen durchzulesen. Danach läuft das deutlich flüssiger."',
        },
    },

    [TaskId.FixedFloatingPoint]: {
        id: TaskId.FixedFloatingPoint,
        title: 'Dezimalzahl-Konverter einstellen',
        description: 'Wandle Dezimalzahlen in Fest- und Gleitkommadarstellung um.',
        dashboardDescription: 'Wandle Dezimalzahlen in Fest- und Gleitkommadarstellung um.',
        chapters: [{ title: '3.2.2 Gleitkommazahlen' }],
        timeLimit: 10 * 60 * 1000,
        feedback: {
            accurateAndFast:
                '💨 Genau & Schnell\n„Wow, stark! Du warst richtig fix unterwegs und hast sauber gearbeitet. So sieht\'s aus, wenn man\'s wirklich verstanden hat!"',
            accurateButSlow:
                '⏱️ Genau, aber Langsam\n„Gute Arbeit – alles richtig, nur etwas gemütlich. Keine Sorge, das ist normal! Mit mehr Routine geht\'s schneller. Wenn du magst, übe nochmal mit den Helfermodulen oder schau ins Buch 3.2.2 Gleitkommazahlen für ein paar Tricks, wie man sicherer wird."',
            inaccurateButFast:
                '⚡ Ungenau, aber Schnell\n„Du bist echt flott, aber ein paar Rechenschritte waren daneben 😅. Versuch, dir beim nächsten Mal kurz Zeit fürs Prüfen zu nehmen. Die Helfermodule im Übungsmenü helfen dir super dabei – oder wirf nochmal einen Blick in Kapitel 3.2.2 Gleitkommazahlen im Buch."',
            inaccurateAndSlow:
                '🐢 Ungenau & Langsam\n„Okay, das war ein harter Ritt – aber du hast\'s durchgezogen! 💪 Ich würd dir empfehlen, dir die Helfermodule im Übungsmenü nochmal anzusehen und ggf. das Buchkapitel 3.2.2 Gleitkommazahlen durchzulesen. Danach läuft das deutlich flüssiger."',
        },
    },

    [TaskId.Quiz]: {
        id: TaskId.Quiz,
        title: 'Systemcheck mit Tim',
        description: 'Beweise dein Wissen. ',
        dashboardDescription: 'Tim hat ein paar Fragen zu dem Thema. Kannst du sie beantworten?',
        timeLimit: 2 * 60 * 1000,
    },

    // ──────────────────────────────────────────────────────────
    //  Microprocessor  (Von-Neumann & Assembler)
    // ──────────────────────────────────────────────────────────

    [TaskId.VonNeumann]: {
        id: TaskId.VonNeumann,
        title: 'Architekturcheck Von-Neumann',
        description:
            'Identifiziere die Kernkomponenten der Von-Neumann-Architektur und rekonstruiere den Aufbau.',
        dashboardDescription: 'Quiz zur Von-Neumann-Architektur',
        chapters: [{ title: '11.1' }],
        timeLimit: 8 * 60 * 1000,
        feedback: {
            accurateAndFast:
                '💨 Genau & Schnell\n„Wow, stark! Du warst richtig fix unterwegs und hast sauber gearbeitet. So sieht\'s aus, wenn man\'s wirklich verstanden hat!"',
            accurateButSlow:
                '⏱️ Genau, aber Langsam\n„Gute Arbeit – alles richtig, nur etwas gemütlich. Keine Sorge, das ist normal! Mit mehr Routine geht\'s schneller. Wenn du magst, übe nochmal mit dem Helfermodul oder schau ins Buch 11.1, um dein Wissen aufzufrischen."',
            inaccurateButFast:
                '⚡ Ungenau, aber Schnell\n„Du bist echt flott, aber ein paar Antworten waren daneben 😅. Versuch, dir beim nächsten Mal kurz Zeit fürs Prüfen zu nehmen. Wirf nochmal einen Blick in Kapitel 11.1 im Buch."',
            inaccurateAndSlow:
                '🐢 Ungenau & Langsam\n„Okay, das war ein harter Ritt – aber du hast\'s durchgezogen! 💪 Ich würd dir empfehlen, ggf. das Buchkapitel 11.1 durchzulesen. Danach läuft das deutlich flüssiger."',
        },
    },

    [TaskId.ReadAssembly]: {
        id: TaskId.ReadAssembly,
        title: 'Code-Interpreter aktivieren',
        description: 'Lies den Assembler-Code und beantworte die Fragen korrekt.',
        dashboardDescription: 'Lies den Assembler-Code und beantworte die Fragen',
        chapters: [{ title: '11.2' }],
        timeLimit: 8 * 60 * 1000,
        feedback: {
            accurateAndFast:
                '💨 Genau & Schnell\n„Wow, stark! Du warst richtig fix unterwegs und hast sauber gearbeitet. So sieht\'s aus, wenn man\'s wirklich verstanden hat!"',
            accurateButSlow:
                '⏱️ Genau, aber Langsam\n„Gute Arbeit – alles richtig, nur etwas gemütlich. Keine Sorge, das ist normal! Mit mehr Routine geht\'s schneller. Wenn du magst, übe nochmal mit dem Helfermodul oder schau ins Buch 11.2, um dein Wissen aufzufrischen."',
            inaccurateButFast:
                '⚡ Ungenau, aber Schnell\n„Du bist echt flott, aber ein paar Befehle waren daneben 😅. Versuch, dir beim nächsten Mal kurz Zeit fürs Prüfen zu nehmen. Das Helfermodul im Übungsmenü hilft dir super dabei – oder wirf nochmal einen Blick in Kapitel 11.2 im Buch."',
            inaccurateAndSlow:
                '🐢 Ungenau & Langsam\n„Okay, das war ein harter Ritt – aber du hast\'s durchgezogen! 💪 Ich würd dir empfehlen, dir das Helfermodul im Übungsmenü nochmal anzusehen und ggf. das Buchkapitel 11.2 durchzulesen. Danach läuft das deutlich flüssiger."',
        },
    },

    [TaskId.WriteAssembly]: {
        id: TaskId.WriteAssembly,
        title: 'Befehlssequenzer reparieren',
        description: 'Sortiere die Befehle in die richtige Reihenfolge.',
        dashboardDescription: 'Sortiere die Befehle in die richtige Reihenfolge',
        chapters: [{ title: '11.2' }],
        timeLimit: 8 * 60 * 1000,
        feedback: {
            accurateAndFast:
                '💨 Genau & Schnell\n„Wow, stark! Du warst richtig fix unterwegs und hast sauber gearbeitet. So sieht\'s aus, wenn man\'s wirklich verstanden hat!"',
            accurateButSlow:
                '⏱️ Genau, aber Langsam\n„Gute Arbeit – alles richtig, nur etwas gemütlich. Keine Sorge, das ist normal! Mit mehr Routine geht\'s schneller. Wenn du magst, übe nochmal mit dem Helfermodul oder schau ins Buch 11.2, um dein Wissen aufzufrischen."',
            inaccurateButFast:
                '⚡ Ungenau, aber Schnell\n„Du bist echt flott, aber ein paar Befehle waren daneben 😅. Versuch, dir beim nächsten Mal kurz Zeit fürs Prüfen zu nehmen. Das Helfermodul im Übungsmenü hilft dir super dabei – oder wirf nochmal einen Blick in Kapitel 11.2 im Buch."',
            inaccurateAndSlow:
                '🐢 Ungenau & Langsam\n„Okay, das war ein harter Ritt – aber du hast\'s durchgezogen! 💪 Ich würd dir empfehlen, dir das Helfermodul im Übungsmenü nochmal anzusehen und ggf. das Buchkapitel 11.2 durchzulesen. Danach läuft das deutlich flüssiger."',
        },
    },

    [TaskId.JavaToAssembly]: {
        id: TaskId.JavaToAssembly,
        title: 'Compiler-Brücke wiederherstellen',
        description:
            'Ordne die Befehle richtig an, um den Java Code in Assembler zu übersetzen.',
        dashboardDescription: 'Übersetze Java Code in Assembler',
        chapters: [{ title: '11.2' }],
        timeLimit: 8 * 60 * 1000,
        feedback: {
            accurateAndFast:
                '💨 Genau & Schnell\n„Wow, stark! Du warst richtig fix unterwegs und hast sauber gearbeitet. So sieht\'s aus, wenn man\'s wirklich verstanden hat!"',
            accurateButSlow:
                '⏱️ Genau, aber Langsam\n„Gute Arbeit – alles richtig, nur etwas gemütlich. Keine Sorge, das ist normal! Mit mehr Routine geht\'s schneller. Wenn du magst, übe nochmal mit dem Helfermodul oder schau ins Buch 11.2, um dein Wissen aufzufrischen."',
            inaccurateButFast:
                '⚡ Ungenau, aber Schnell\n„Du bist echt flott, aber ein paar Befehle waren daneben 😅. Versuch, dir beim nächsten Mal kurz Zeit fürs Prüfen zu nehmen. Das Helfermodul im Übungsmenü hilft dir super dabei – oder wirf nochmal einen Blick in Kapitel 11.2 im Buch."',
            inaccurateAndSlow:
                '🐢 Ungenau & Langsam\n„Okay, das war ein harter Ritt – aber du hast\'s durchgezogen! 💪 Ich würd dir empfehlen, dir das Helfermodul im Übungsmenü nochmal anzusehen und ggf. das Buchkapitel 11.2 durchzulesen. Danach läuft das deutlich flüssiger."',
        },
    },
};
