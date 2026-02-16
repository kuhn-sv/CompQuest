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
            'Ordne verschiedene Zahlendarstellungen (binär, oktal, hexadezimal) einander zu, damit der Decoder wieder weiß, welche Zahlen äquivalent sind. Konvertiere zwischen den Zahlensystemen, um die Übersetzungsfunktion wiederherzustellen.',
        dashboardDescription: 'Konvertiere zwischen binär, oktal & hexadezimal um.',
        chapters: [{ title: '3.1 Zahlensysteme' }],
        timeLimit: 5 * 60 * 1000,
        feedback: {
            accurateAndFast:
                '⭐⭐⭐ Genau und schnell\n„Wow, beeindruckend! Du hast den Zahlensystem-Decoder blitzschnell und fehlerfrei repariert. Die Umrechnung zwischen binär, oktal und hexadezimal läuft jetzt perfekt. Du arbeitest wie ein Profi!"',
            accurateButSlow:
                '⭐⭐ Genau aber langsam\n„Sehr gut! Der Decoder funktioniert wieder einwandfrei. Du hast dir Zeit genommen und alle Zahlendarstellungen korrekt zugeordnet. Mit etwas mehr Übung wirst du noch schneller.\n💡 Tipp: Schau in deinen Zahlensystem-Werkzeugkasten für Tipps zu schnelleren Konvertierungen. Auch in Kapitel 3.1 Zahlensysteme findest du Abkürzungen und Tricks."',
            inaccurateButFast:
                '⭐ Ungenau aber schnell\n„Du warst schnell unterwegs, aber der Decoder zeigt noch Fehler an. Einige Zahlendarstellungen wurden falsch zugeordnet. Geschwindigkeit ist gut, aber Genauigkeit ist bei der Reparatur entscheidend!\n💡 Tipp: Nutze deinen Zahlensystem-Werkzeugkasten, um die Konvertierungsregeln zu wiederholen. In Kapitel 3.1 Zahlensysteme werden die Umrechnungsschritte detailliert erklärt."',
            inaccurateAndSlow:
                '⚠️ Ungenau und langsam\n„Hmm, hier gibt es noch Probleme. Der Decoder funktioniert nicht richtig und die Reparatur hat auch lange gedauert. Lass uns das nochmal gemeinsam anschauen.\n💡 Tipp: Arbeite mit deinem Zahlensystem-Werkzeugkasten und lies Kapitel 3.1 Zahlensysteme nochmal in Ruhe. Tim kann dir auch bei Fragen helfen!"',
        },
    },

    [TaskId.PositiveArithmetic]: {
        id: TaskId.PositiveArithmetic,
        title: 'Additions-Schaltkreis prüfen',
        description: 'Führe Additionen in binär, oktal und hexadezimal korrekt durch. Zeige dem System, wie man in unterschiedlichen Zahlensystemen rechnet, damit die Recheneinheit wieder zuverlässig arbeitet.',
        dashboardDescription: 'Addiere in binär, oktal & hexadezimal.',
        chapters: [{ title: '3.1 Zahlensysteme' }],
        timeLimit: 5 * 60 * 1000,
        feedback: {
            accurateAndFast:
                '⭐⭐⭐ Genau und schnell\n„Hervorragend! Der Additions-Schaltkreis läuft wieder wie geschmiert. Du hast alle Berechnungen in binär, oktal und hexadezimal schnell und korrekt durchgeführt. Die Recheneinheit ist wieder einsatzbereit!"',
            accurateButSlow:
                '⭐⭐ Genau aber langsam\n„Perfekt gerechnet! Der Additions-Schaltkreis arbeitet wieder fehlerfrei. Die Berechnungen haben etwas länger gedauert, aber Hauptsache das Ergebnis stimmt.\n💡 Tipp: Mit deinem Zahlensystem-Werkzeugkasten kannst du mehr Routine entwickeln. Kapitel 3.1 Zahlensysteme zeigt dir effiziente Rechenwege."',
            inaccurateButFast:
                '⭐ Ungenau aber schnell\n„Schnell durchgeführt, aber einige Additionen sind fehlerhaft. Der Schaltkreis produziert noch falsche Ergebnisse. Bei Rechenoperationen muss jedes Bit stimmen!\n💡 Tipp: Wiederhole die Additionsregeln mit deinem Zahlensystem-Werkzeugkasten. In Kapitel 3.1 Zahlensysteme findest du Schritt-für-Schritt-Anleitungen mit Beispielen."',
            inaccurateAndSlow:
                '⚠️ Ungenau und langsam\n„Der Additions-Schaltkreis funktioniert leider noch nicht. Die Berechnungen enthalten Fehler und haben auch viel Zeit in Anspruch genommen.\n💡 Tipp: Nutze deinen Zahlensystem-Werkzeugkasten intensiv und arbeite die Beispiele in Kapitel 3.1 Zahlensysteme durch. Frag Tim, wenn du nicht weiterkommst!"',
        },
    },

    [TaskId.Complements]: {
        id: TaskId.Complements,
        title: 'Negativzahlen-Modul wiederherstellen',
        description:
            'Stelle negative Zahlen korrekt im Binärsystem dar, indem du Einer- und Zweierkomplement anwendest.',
        dashboardDescription: 'Stelle negative Zahlen im Binärsystem dar.',
        chapters: [{ title: '3.2.1 Darstellung natürlicher Zahlen' }],
        timeLimit: 5 * 60 * 1000,
        feedback: {
            accurateAndFast:
                '⭐⭐⭐ Genau und schnell\n„Fantastisch! Das Negativzahlen-Modul ist vollständig wiederhergestellt. Du beherrschst Einer- und Zweierkomplement perfekt und konntest alle negativen Zahlen blitzschnell korrekt darstellen!"',
            accurateButSlow:
                '⭐⭐ Genau aber langsam\n„Ausgezeichnet! Alle negativen Zahlen werden jetzt korrekt im Zweierkomplement gespeichert. Die Umwandlung hat etwas Zeit gebraucht, aber das Ergebnis ist fehlerfrei.\n💡 Tipp: Dein Zahlensystem-Werkzeugkasten enthält Übungen für mehr Geschwindigkeit. Kapitel 3.2.1 Darstellung natürlicher Zahlen erklärt Abkürzungen bei der Komplement-Bildung."',
            inaccurateButFast:
                '⭐ Ungenau aber schnell\n„Schnell gearbeitet, aber das Modul zeigt noch Fehler bei der Vorzeichendarstellung. Einige negative Zahlen sind falsch kodiert – das kann zu kritischen Fehlern führen!\n💡 Tipp: Überprüfe mit deinem Zahlensystem-Werkzeugkasten die Schritte zur Komplement-Bildung. Kapitel 3.2.1 Darstellung natürlicher Zahlen erklärt häufige Fehlerquellen und wie du sie vermeidest."',
            inaccurateAndSlow:
                '⚠️ Ungenau und langsam\n„Das Negativzahlen-Modul ist noch nicht funktionsfähig. Die Darstellung negativer Zahlen enthält Fehler und die Bearbeitung war zeitaufwendig.\n💡 Tipp: Arbeite mit deinem Zahlensystem-Werkzeugkasten Schritt für Schritt. Kapitel 3.2.1 Darstellung natürlicher Zahlen bietet ausführliche Erklärungen. Lass dir von Tim die Methode nochmal erklären!"',
        },
    },

    [TaskId.TwosComplementArithmetic]: {
        id: TaskId.TwosComplementArithmetic,
        title: 'Vorzeichenbehaftete Recheneinheit aktivieren',
        description:
            'Wende das Zweierkomplement in Rechenoperationen an. Führe Additionen und Subtraktionen mit negativen Zahlen durch und verstehe, wie Overflow und Vorzeichenoperationen funktionieren, um die ALU zu kalibrieren.',
        dashboardDescription: 'Wende das Zweierkomplement in Rechnungen an und verstehe Vorzeichenoperationen.',
        chapters: [{ title: '3.2.1 Darstellung natürlicher Zahlen' }],
        timeLimit: 5 * 60 * 1000,
        feedback: {
            accurateAndFast:
                '⭐⭐⭐ Genau und schnell\n„Exzellent! Die ALU arbeitet wieder einwandfrei mit vorzeichenbehafteten Zahlen. Du hast alle Berechnungen mit Zweierkomplement-Arithmetik schnell und korrekt durchgeführt. Die Recheneinheit ist optimal kalibriert!"',
            accurateButSlow:
                '⭐⭐ Genau aber langsam\n„Super! Die ALU rechnet wieder korrekt mit negativen Zahlen. Alle Operationen wurden fehlerfrei ausgeführt, auch wenn es etwas länger gedauert hat.\n💡 Tipp: Dein Zahlensystem-Werkzeugkasten bietet Übungen für schnelleres Rechnen. Kapitel 3.2.1 Darstellung natürlicher Zahlen zeigt effiziente Lösungswege für komplexe Berechnungen."',
            inaccurateButFast:
                '⭐ Ungenau aber schnell\n„Zügig durchgeführt, aber die ALU produziert noch fehlerhafte Ergebnisse. Bei Berechnungen mit Vorzeichen sind Fehler aufgetreten – das muss korrigiert werden!\n💡 Tipp: Nutze deinen Zahlensystem-Werkzeugkasten und achte besonders auf Overflow-Fälle. Kapitel 3.2.1 Darstellung natürlicher Zahlen erklärt typische Stolpersteine bei vorzeichenbehafteten Operationen."',
            inaccurateAndSlow:
                '⚠️ Ungenau und langsam\n„Die ALU funktioniert noch nicht richtig. Die Berechnungen mit negativen Zahlen sind fehlerhaft und haben viel Zeit benötigt.\n💡 Tipp: Wiederhole die Grundlagen mit deinem Zahlensystem-Werkzeugkasten gründlich. Kapitel 3.2.1 Darstellung natürlicher Zahlen bietet detaillierte Beispiele. Tim hilft dir gerne bei konkreten Rechenoperationen!"',
        },
    },

    [TaskId.FixedFloatingPoint]: {
        id: TaskId.FixedFloatingPoint,
        title: 'Dezimalzahl-Konverter einstellen',
        description: 'Wandle Dezimalzahlen zwischen Festkomma- und Gleitkommadarstellung um. Verstehe die IEEE-754-Notation und ordne Dezimalzahlen ihren binären Gleitkomma-Repräsentationen zu, damit der Computer wieder präzise rechnen kann.',
        dashboardDescription: 'Wandle Dezimalzahlen in Fest- und Gleitkommadarstellung um.',
        chapters: [{ title: '3.2.2 Gleitkommazahlen' }],
        timeLimit: 10 * 60 * 1000,
        feedback: {
            accurateAndFast:
                '⭐⭐⭐ Genau und schnell\n„Brilliant! Der Dezimalzahl-Konverter und die FPU arbeiten wieder perfekt. Du hast Festkomma- und Gleitkommadarstellung schnell und fehlerfrei umgewandelt. Der Rechner kann jetzt wieder präzise mit Kommazahlen rechnen!"',
            accurateButSlow:
                '⭐⭐ Genau aber langsam\n„Hervorragend! Die FPU ist wieder voll funktionsfähig. Alle Umwandlungen zwischen Fest- und Gleitkomma waren korrekt, auch wenn es etwas Zeit gebraucht hat.\n💡 Tipp: Dein Zahlensystem-Werkzeugkasten bietet Übungen zur IEEE-754-Notation. In Kapitel 3.2.2 Gleitkommazahlen findest du Methoden für schnellere Konvertierung."',
            inaccurateButFast:
                '⭐ Ungenau aber schnell\n„Schnell gearbeitet, aber die FPU zeigt noch Fehler bei der Kommadarstellung. Einige Konvertierungen waren nicht korrekt – bei Gleitkommazahlen ist Präzision entscheidend!\n💡 Tipp: Nutze deinen Zahlensystem-Werkzeugkasten und achte auf die Details der IEEE-754-Darstellung. Kapitel 3.2.2 Gleitkommazahlen erklärt häufige Fehler bei der Konvertierung."',
            inaccurateAndSlow:
                '⚠️ Ungenau und langsam\n„Die FPU funktioniert noch nicht richtig. Die Umwandlungen enthalten Fehler und haben viel Zeit in Anspruch genommen.\n💡 Tipp: Arbeite mit deinem Zahlensystem-Werkzeugkasten gründlich. Kapitel 3.2.2 Gleitkommazahlen erklärt die IEEE-754-Notation ausführlich. Frag Tim bei Unklarheiten!"',
        },
    },

    [TaskId.Quiz]: {
        id: TaskId.Quiz,
        title: 'Systemcheck mit Tim',
        description: 'Tim stellt dir Kontrollfragen zu Tetraden-Codes (BCD, Aiken, Excess-3, Gray-Code). Beantworte die Fragen zu den verschiedenen Codesystemen und ihrer Anwendung, um zu beweisen, dass du die Tetraden-Darstellung beherrschst.',
        dashboardDescription: 'Tim hat ein paar Fragen zu dem Thema. Kannst du sie beantworten?',
        chapters: [{ title: '3.3.1 Tetraden-Codes' }],
        timeLimit: 2 * 60 * 1000,
        feedback: {
            accurateAndFast:
                '⭐⭐⭐ Genau und schnell\n„Perfekt! Du hast alle Fragen zu den Tetraden-Codes schnell und korrekt beantwortet. BCD, Aiken, Excess-3 und Gray-Code – du kennst dich bestens aus. Die Tetraden-Module laufen stabil!"',
            accurateButSlow:
                '⭐⭐ Genau aber langsam\n„Sehr gut! Du hast alle Fragen zu den Tetraden-Codes richtig beantwortet und gezeigt, dass du die verschiedenen Codesysteme verstanden hast. Mit etwas mehr Übung wird das Abrufen schneller gehen.\n💡 Tipp: Dein Zahlensystem-Werkzeugkasten hilft dir, das Wissen zu den Tetraden-Codes zu festigen. Lies Kapitel 3.3.1 Tetraden-Codes zur Zusammenfassung aller Code-Systeme."',
            inaccurateButFast:
                '⭐ Ungenau aber schnell\n„Du warst schnell, aber einige Antworten zu den Tetraden-Codes waren nicht korrekt. Bei der Systemdiagnose müssen alle Checks bestanden werden, sonst drohen Fehler im laufenden Betrieb!\n💡 Tipp: Wiederhole die verschiedenen Tetraden-Codes mit deinem Zahlensystem-Werkzeugkasten. Kapitel 3.3.1 Tetraden-Codes erklärt die Unterschiede zwischen BCD, Aiken, Excess-3 und Gray-Code. Tim kann dir bei unklaren Fragen helfen!"',
            inaccurateAndSlow:
                '⚠️ Ungenau und langsam\n„Der Systemcheck zeigt noch kritische Lücken bei den Tetraden-Codes. Mehrere Antworten waren falsch und die Bearbeitung hat lange gedauert. Wir sollten die verschiedenen Code-Systeme nochmal aufarbeiten.\n💡 Tipp: Gehe deinen Zahlensystem-Werkzeugkasten nochmal durch und arbeite Kapitel 3.3.1 Tetraden-Codes zu den Tetraden-Codes intensiv durch. Nutze Tim für Erklärungen – er hilft dir gerne weiter!"',
        },
    },

    // ──────────────────────────────────────────────────────────
    //  Microprocessor  (Von-Neumann & Assembler)
    // ──────────────────────────────────────────────────────────

    [TaskId.VonNeumann]: {
        id: TaskId.VonNeumann,
        title: 'Architekturcheck Von-Neumann',
        description:
            'Beantworte Quiz-Fragen zur Von-Neumann-Architektur. Zeige, dass du die Komponenten (Steuerwerk, Rechenwerk, Speicher, Ein-/Ausgabe) und ihr Zusammenspiel verstehst, damit das System wieder koordiniert arbeiten kann.',
        dashboardDescription: 'Quiz zur Von-Neumann-Architektur',
        chapters: [{ title: '11.1' }],
        timeLimit: 8 * 60 * 1000,
        feedback: {
            accurateAndFast:
                '⭐⭐⭐ Genau und schnell\n„Exzellent! Du kennst die Von-Neumann-Architektur perfekt. Alle Komponenten und ihre Funktionen sind dir klar – das Steuerwerk kann jetzt wieder mit voller Systemkenntnis arbeiten!"',
            accurateButSlow:
                '⭐⭐ Genau aber langsam\n„Sehr gut! Du hast alle Fragen zur Von-Neumann-Architektur richtig beantwortet. Die Systemarchitektur ist wiederhergestellt, auch wenn es etwas gedauert hat.\n💡 Tipp: Kapitel 11.1 fasst die wichtigsten Komponenten zusammen."',
            inaccurateButFast:
                '⭐ Ungenau aber schnell\n„Schnell durchgeklickt, aber einige Antworten zur Architektur waren falsch. Das Steuerwerk braucht präzises Wissen über die Systemkomponenten!\n💡 Tipp: Kapitel 11.1 erklärt die Komponenten und ihr Zusammenspiel detailliert."',
            inaccurateAndSlow:
                '⚠️ Ungenau und langsam\n„Das Steuerwerk hat noch keine klare Systemübersicht. Mehrere Antworten waren falsch und die Bearbeitung hat lange gedauert.\n💡 Tipp: Kapitel 11.1 bietet Diagramme und Erklärungen. Tim hilft dir gerne weiter!"',
        },
    },

    [TaskId.ReadAssembly]: {
        id: TaskId.ReadAssembly,
        title: 'Code-Interpreter aktivieren',
        description: 'Lies Assembler-Code und beantworte Fragen dazu. Zeige, dass du verstehst, was die Befehle bewirken (ADD, SUB, JMP, etc.), damit das Steuerwerk wieder Programme interpretieren kann.',
        dashboardDescription: 'Lies den Assembler-Code und beantworte die Fragen',
        chapters: [{ title: '11.2' }],
        timeLimit: 8 * 60 * 1000,
        feedback: {
            accurateAndFast:
                '⭐⭐⭐ Genau und schnell\n„Perfekt! Du liest Assembler-Code wie ein Profi. Der Code-Interpreter ist vollständig wiederhergestellt und das Steuerwerk kann jetzt alle Befehle korrekt interpretieren!"',
            accurateButSlow:
                '⭐⭐ Genau aber langsam\n„Hervorragend! Du hast alle Assembler-Befehle richtig verstanden. Der Interpreter funktioniert wieder, auch wenn das Lesen etwas Zeit gebraucht hat.\n💡 Tipp: Dein Mikroprozessor-Werkzeugkasten bietet Übungen zum schnelleren Lesen von Assembler-Code. Kapitel 11.2 zeigt typische Befehlsmuster."',
            inaccurateButFast:
                '⭐ Ungenau aber schnell\n„Schnell gelesen, aber einige Befehle wurden falsch interpretiert. Der Code-Interpreter produziert noch fehlerhafte Ausgaben!\n💡 Tipp: Nutze deinen Mikroprozessor-Werkzeugkasten und wiederhole die Assembler-Befehle. Kapitel 11.2 erklärt jeden Befehl mit Beispielen. Tim kann dir Codezeilen erklären!"',
            inaccurateAndSlow:
                '⚠️ Ungenau und langsam\n„Der Code-Interpreter funktioniert noch nicht richtig. Das Verständnis der Assembler-Befehle zeigt Lücken und die Bearbeitung hat viel Zeit gekostet.\n💡 Tipp: Arbeite mit deinem Mikroprozessor-Werkzeugkasten die Assembler-Grundlagen systematisch durch. Kapitel 11.2 führt dich Schritt für Schritt durch die Befehle. Frag Tim bei Unklarheiten!"',
        },
    },

    [TaskId.WriteAssembly]: {
        id: TaskId.WriteAssembly,
        title: 'Befehlssequenzer reparieren',
        description: 'Sortiere Assembler-Befehle in die richtige Reihenfolge. Erstelle logisch korrekte Befehlssequenzen, damit das Steuerwerk wieder strukturierte Programme ausführen kann.',
        dashboardDescription: 'Sortiere die Befehle in die richtige Reihenfolge',
        chapters: [{ title: '11.2' }],
        timeLimit: 8 * 60 * 1000,
        feedback: {
            accurateAndFast:
                '⭐⭐⭐ Genau und schnell\n„Brilliant! Du hast alle Befehlssequenzen schnell und korrekt sortiert. Der Befehlssequenzer arbeitet wieder perfekt – Programme laufen jetzt in der richtigen Reihenfolge!"',
            accurateButSlow:
                '⭐⭐ Genau aber langsam\n„Ausgezeichnet! Alle Befehlsfolgen sind korrekt. Der Sequenzer funktioniert wieder einwandfrei, auch wenn die Sortierung etwas Zeit benötigt hat.\n💡 Tipp: Dein Mikroprozessor-Werkzeugkasten enthält Übungen zu typischen Programmabläufen. Kapitel 11.2 zeigt Muster für effiziente Befehlssequenzen."',
            inaccurateButFast:
                '⭐ Ungenau aber schnell\n„Schnell sortiert, aber einige Befehlsfolgen sind noch falsch. Der Sequenzer produziert fehlerhafte Programmabläufe – das muss korrigiert werden!\n💡 Tipp: Nutze deinen Mikroprozessor-Werkzeugkasten und achte auf die logische Abfolge von Befehlen. Kapitel 11.2 erklärt, wie Programme strukturiert werden. Tim hilft dir beim Debuggen!"',
            inaccurateAndSlow:
                '⚠️ Ungenau und langsam\n„Der Befehlssequenzer ist noch nicht funktionstüchtig. Die Sortierung enthält Fehler und hat viel Zeit in Anspruch genommen.\n� Tipp: Arbeite mit deinem Mikroprozessor-Werkzeugkasten systematisch durch die Programmstrukturen. Kapitel 11.2 zeigt Beispiele für korrekte Befehlsabläufe. Lass dir von Tim die Logik erklären!"',
        },
    },

    [TaskId.JavaToAssembly]: {
        id: TaskId.JavaToAssembly,
        title: 'Compiler-Brücke wiederherstellen',
        description:
            'Übersetze Java-Code in Assembler-Befehle. Zeige, dass du die Transformation von abstrakten Anweisungen in konkrete Prozessor-Befehle verstehst, damit die Compiler-Brücke wieder funktioniert.',
        dashboardDescription: 'Übersetze Java Code in Assembler',
        chapters: [{ title: '11.2' }],
        timeLimit: 8 * 60 * 1000,
        feedback: {
            accurateAndFast:
                '⭐⭐⭐ Genau und schnell\n„Fantastisch! Du übersetzt Java in Assembler wie ein Compiler. Die Brücke zwischen High-Level-Code und Maschinensprache ist vollständig wiederhergestellt!"',
            accurateButSlow:
                '⭐⭐ Genau aber langsam\n„Sehr gut! Alle Übersetzungen von Java zu Assembler sind korrekt. Die Compiler-Brücke funktioniert wieder, auch wenn die Transformation etwas Zeit gebraucht hat.\n💡 Tipp: Kapitel 11.2 zeigt typische Übersetzungsmuster."',
            inaccurateButFast:
                '⭐ Ungenau aber schnell\n„Schnell übersetzt, aber einige Assembler-Befehle stimmen nicht mit dem Java-Code überein. Die Compiler-Brücke produziert noch fehlerhafte Übersetzungen!\n💡 Tipp: Kapitel 11.2 erklärt die Übersetzungsschritte detailliert."',
            inaccurateAndSlow:
                '⚠️ Ungenau und langsam\n„Die Compiler-Brücke ist noch nicht funktionsfähig. Die Übersetzungen enthalten Fehler und haben viel Zeit benötigt.\n💡 Tipp: Kapitel 11.2 zeigt Beispiele für Java-zu-Assembler-Übersetzungen. Tim erklärt dir gerne die Zusammenhänge!"',
        },
    },
};
