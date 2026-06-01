/**
 * Mock data — surface-only. Not connected to real database or learner records.
 *
 * Belt level is parameterised so the same shapes can later back Yellow,
 * Green, and Black Belt courses.
 */

export type BeltLevel = "white" | "yellow" | "green" | "black";

export interface KnowledgeCheckQuestion {
  id: string;
  prompt: string;
  options: { id: string; label: string }[];
  correctOptionId: string;
  explanation: string;
}

export interface Resource {
  id: string;
  title: string;
  kind: "workbook" | "summary" | "glossary" | "template" | "example";
  description: string;
  placeholderHref: string;
}

export interface Activity {
  title: string;
  prompt: string;
}

export interface Lesson {
  id: string;
  title: string;
  learningObjective: string;
  contentHtmlMock: string;
  hasVideo: boolean;
  keyTakeaway: string;
  activity?: Activity;
  estimatedMinutes: number;
  completed: boolean;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  knowledgeCheck?: KnowledgeCheckQuestion[];
}

export interface Course {
  belt: BeltLevel;
  title: string;
  level: string;
  description: string;
  estimatedDuration: string;
  modules: Module[];
  resources: Resource[];
  progressPercentage: number;
  completed: boolean;
}

export const mockWhiteBeltCourse: Course = {
  belt: "white",
  title: "Six Sigma White Belt",
  level: "Introductory",
  description:
    "A short, structured introduction to Six Sigma — the language, the mindset, and the basic problem-solving toolkit. No prior knowledge required.",
  estimatedDuration: "≈ 2 hours self-paced",
  progressPercentage: 100,
  completed: true,
  modules: [
    {
      id: "m1",
      title: "Introduction to Six Sigma",
      description: "What Six Sigma is, where it came from, and why it works.",
      lessons: [
        {
          id: "l1",
          title: "Welcome to Six Sigma",
          learningObjective:
            "Place Six Sigma in the wider quality-improvement landscape.",
          contentHtmlMock:
            "Six Sigma is a disciplined, data-driven approach to eliminating defects in any process — from manufacturing to transactional and from product to service.",
          hasVideo: true,
          keyTakeaway:
            "Six Sigma reduces variation; that's the lever every other tool serves.",
          estimatedMinutes: 6,
          completed: true,
          activity: {
            title: "Reflect",
            prompt:
              "Name one process at your work where the result varies more than it should.",
          },
        },
        {
          id: "l2",
          title: "A very short history",
          learningObjective:
            "Connect Six Sigma to Motorola, GE, and the lineage that produced it.",
          contentHtmlMock:
            "Born at Motorola in 1986, scaled at GE in the 1990s, today it's the operating system of process improvement across every major industry.",
          hasVideo: false,
          keyTakeaway: "Six Sigma is a proven, transferable methodology.",
          estimatedMinutes: 5,
          completed: true,
        },
      ],
    },
    {
      id: "m2",
      title: "What is Process Improvement?",
      description: "Processes, inputs, outputs, and the cost of getting it wrong.",
      lessons: [
        {
          id: "l3",
          title: "Processes everywhere",
          learningObjective: "Recognise that every output is the result of a process.",
          contentHtmlMock:
            "If you can describe inputs and outputs, you've found a process. Process improvement makes that path shorter, cheaper, and more reliable.",
          hasVideo: false,
          keyTakeaway: "You can't improve what you can't see.",
          estimatedMinutes: 5,
          completed: true,
        },
      ],
    },
    {
      id: "m3",
      title: "Understanding Waste and Variation",
      description: "The eight wastes and the two faces of variation.",
      lessons: [
        {
          id: "l4",
          title: "The eight wastes",
          learningObjective: "Identify waste in everyday work.",
          contentHtmlMock:
            "Defects, Over-production, Waiting, Non-utilised talent, Transport, Inventory, Motion, Extra-processing. The acronym is DOWNTIME.",
          hasVideo: true,
          keyTakeaway: "Most processes carry two or three of these on any given day.",
          estimatedMinutes: 7,
          completed: true,
        },
        {
          id: "l5",
          title: "Variation: common vs special cause",
          learningObjective: "Distinguish noise in the system from signals to act on.",
          contentHtmlMock:
            "Common-cause variation is the natural rhythm of a stable process. Special-cause variation is the assignable spike — and the only kind worth reacting to.",
          hasVideo: false,
          keyTakeaway:
            "Don't tamper with common-cause variation. Investigate special-cause.",
          estimatedMinutes: 6,
          completed: true,
        },
      ],
    },
    {
      id: "m4",
      title: "DMAIC Overview",
      description: "The five phases that structure every Six Sigma project.",
      lessons: [
        {
          id: "l6",
          title: "Define • Measure • Analyse • Improve • Control",
          learningObjective: "Recall the five DMAIC phases and what each delivers.",
          contentHtmlMock:
            "Define the problem. Measure the baseline. Analyse the root cause. Improve the process. Control the gain.",
          hasVideo: true,
          keyTakeaway: "DMAIC is the spine. Every tool you'll meet hangs off it.",
          estimatedMinutes: 8,
          completed: true,
        },
      ],
    },
    {
      id: "m5",
      title: "Roles in Six Sigma",
      description: "Who does what — White, Yellow, Green, Black, Master Black.",
      lessons: [
        {
          id: "l7",
          title: "The belt hierarchy",
          learningObjective: "Locate yourself on the belt ladder.",
          contentHtmlMock:
            "White Belts speak the language. Yellow Belts contribute to projects. Green Belts run them part-time. Black Belts run them full-time. Master Black Belts coach the Black Belts.",
          hasVideo: false,
          keyTakeaway:
            "White Belt is the first rung — and the on-ramp to everything that follows.",
          estimatedMinutes: 5,
          completed: true,
        },
      ],
    },
    {
      id: "m6",
      title: "Basic Problem-Solving Tools",
      description: "Pareto, fishbone, 5 Whys, and the SIPOC.",
      lessons: [
        {
          id: "l8",
          title: "Pareto and the 80/20",
          learningObjective: "Use a Pareto chart to find the vital few.",
          contentHtmlMock:
            "Most defects come from a small number of causes. The Pareto chart is the picture that proves it.",
          hasVideo: true,
          keyTakeaway: "Solve the few that drive the many.",
          estimatedMinutes: 7,
          completed: true,
        },
        {
          id: "l9",
          title: "Fishbone, 5 Whys, SIPOC",
          learningObjective: "Pick the right tool for the right question.",
          contentHtmlMock:
            "Fishbone enumerates possible causes. 5 Whys digs into one cause. SIPOC zooms out to the whole process.",
          hasVideo: false,
          keyTakeaway: "Three small tools, three big jobs.",
          estimatedMinutes: 6,
          completed: true,
        },
      ],
    },
    {
      id: "m7",
      title: "White Belt Knowledge Check",
      description: "Six questions to confirm you're ready to certify.",
      lessons: [
        {
          id: "l10",
          title: "Knowledge Check",
          learningObjective: "Demonstrate working recall of every previous module.",
          contentHtmlMock: "A short test. Pass mark 5/6. Unlimited retries.",
          hasVideo: false,
          keyTakeaway: "Pass it once and your certificate unlocks.",
          estimatedMinutes: 10,
          completed: true,
        },
      ],
      knowledgeCheck: [
        {
          id: "q1",
          prompt:
            "Which of the five DMAIC phases is about understanding the root cause?",
          options: [
            { id: "a", label: "Define" },
            { id: "b", label: "Measure" },
            { id: "c", label: "Analyse" },
            { id: "d", label: "Improve" },
          ],
          correctOptionId: "c",
          explanation:
            "Analyse is where data turns into a root cause. Improve is what you do once you know it.",
        },
        {
          id: "q2",
          prompt: "Which of the following is one of the eight wastes?",
          options: [
            { id: "a", label: "Variation" },
            { id: "b", label: "Waiting" },
            { id: "c", label: "Customers" },
            { id: "d", label: "Suppliers" },
          ],
          correctOptionId: "b",
          explanation: "DOWNTIME — Defects, Over-production, Waiting, …",
        },
        {
          id: "q3",
          prompt:
            "Common-cause variation is best described as:",
          options: [
            { id: "a", label: "Random noise inside a stable process" },
            { id: "b", label: "A defect caused by a specific incident" },
            { id: "c", label: "A signal to immediately act on" },
            { id: "d", label: "Always avoidable" },
          ],
          correctOptionId: "a",
          explanation:
            "Common-cause is the natural variation of a stable process. Don't tamper.",
        },
        {
          id: "q4",
          prompt: "Which tool is best for ranking causes by frequency?",
          options: [
            { id: "a", label: "Fishbone" },
            { id: "b", label: "Pareto chart" },
            { id: "c", label: "SIPOC" },
            { id: "d", label: "5 Whys" },
          ],
          correctOptionId: "b",
          explanation: "Pareto sorts and ranks by frequency — that's its job.",
        },
        {
          id: "q5",
          prompt: "A Green Belt typically:",
          options: [
            { id: "a", label: "Runs improvement projects part-time" },
            { id: "b", label: "Has only theoretical training" },
            { id: "c", label: "Manages a portfolio of Black Belts" },
            { id: "d", label: "Audits process control charts only" },
          ],
          correctOptionId: "a",
          explanation: "Green Belts run projects part-time alongside their day job.",
        },
        {
          id: "q6",
          prompt: "DMAIC stands for:",
          options: [
            { id: "a", label: "Define, Measure, Analyse, Improve, Control" },
            { id: "b", label: "Design, Make, Adapt, Inspect, Confirm" },
            { id: "c", label: "Develop, Map, Audit, Implement, Close" },
            { id: "d", label: "Define, Model, Analyse, Iterate, Commit" },
          ],
          correctOptionId: "a",
          explanation: "Define, Measure, Analyse, Improve, Control. The spine.",
        },
      ],
    },
    {
      id: "m8",
      title: "Course Completion",
      description: "Your certificate, your next step, and what unlocks now.",
      lessons: [
        {
          id: "l11",
          title: "You did it",
          learningObjective: "Receive your certificate and pick a next step.",
          contentHtmlMock:
            "Your certificate is below. The post-course portal shows what comes next — Yellow Belt, bringing your company onto Sigmafy, or simply sharing the win.",
          hasVideo: false,
          keyTakeaway: "White Belt is the first rung. The ladder is right here.",
          estimatedMinutes: 2,
          completed: true,
        },
      ],
    },
  ],
  resources: [
    {
      id: "r1",
      title: "White Belt Workbook (PDF)",
      kind: "workbook",
      description: "Self-paced workbook covering every module's exercises.",
      placeholderHref: "#mock-workbook",
    },
    {
      id: "r2",
      title: "DMAIC Summary Sheet",
      kind: "summary",
      description: "One-page recap of all five DMAIC phases.",
      placeholderHref: "#mock-dmaic",
    },
    {
      id: "r3",
      title: "Six Sigma Glossary",
      kind: "glossary",
      description: "Every term you'll meet in Yellow Belt and beyond.",
      placeholderHref: "#mock-glossary",
    },
    {
      id: "r4",
      title: "Worked Project Example",
      kind: "example",
      description:
        "A 12-page worked example of a real Green Belt project from intake to control.",
      placeholderHref: "#mock-example",
    },
    {
      id: "r5",
      title: "Process Map Template",
      kind: "template",
      description: "Editable template ready to drop into your first project.",
      placeholderHref: "#mock-template",
    },
  ],
};
