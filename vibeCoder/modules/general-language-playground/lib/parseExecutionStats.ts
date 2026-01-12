export type ExecutionStat = {
  runId: string;
  timestamp: number;

  exitCode: number;
  status: "completed" | "failed" | "timeout";

  wallTimeMs: number;
  userTimeMs: number;
  systemTimeMs: number;
  cpuPercent: number;
  maxMemoryKb: number;

  programOutput: string;
};

const generateRunId = () => {
  const ts = Date.now();
  const rand = Math.random().toString(36).slice(2, 6);
  return `${ts}-${rand}`;
};

const safeNum = (v: any): number => {
  const n = Number(String(v).trim());
  return Number.isFinite(n) ? n : 0;
};

const parseWallTimeToMs = (value: string): number => {
  try {
    const parts = value.split(":").map(Number);

    if (parts.length === 3) {
      const [h, m, s] = parts;
      return ((h * 60 + m) * 60 + s) * 1000;
    }

    if (parts.length === 2) {
      const [m, s] = parts;
      return ((m * 60) + s) * 1000;
    }

    return Number(value) * 1000;
  } catch {
    return 0;
  }
};

/**
 * UNIVERSAL PARSER
 * - reads only content inside markers
 * - supports duplicated timing sections
 * - uses last metric group as final run result
 */
export const parseExecutionStats = (raw: string): ExecutionStat => {

  const runId = generateRunId();
  const timestamp = Number(runId.split("-")[0]);

  // isolate ONLY the content between START & END
  const startIdx = raw.lastIndexOf("__RUN_STATS_START__");
  const endIdx = raw.lastIndexOf("__RUN_STATS_END__");

  const block = raw
    .slice(startIdx, endIdx)
    .replace("__RUN_STATS_START__", "")
    .trim();

  const lines = block
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(Boolean);

  // everything before metrics = program output
  const programOutputLines: string[] = [];
  const metricLines: string[] = [];

  let metricsStarted = false;

  for (const line of lines) {

    // relax match — sometimes padding / ANSI collapsed
    if (line.includes("Command being timed:")) {
      metricsStarted = true;
    }

    if (!metricsStarted) {
      programOutputLines.push(line);
    } else {
      metricLines.push(line);
    }
  }

  // defaults
  let userTime = 0;
  let systemTime = 0;
  let wallTimeMs = 0;
  let cpuPercent = 0;
  let maxMemoryKb = 0;
  let exitCode = 0;

  /**
   * IMPORTANT
   * Some runs contain MULTIPLE timing sets.
   * We intentionally keep the LAST one
   * because that's the final execution context.
   */
  for (const line of metricLines) {

    if (line.includes("User time (seconds)")) {
      userTime = safeNum(line.split(":").at(-1));
    }

    else if (line.includes("System time (seconds)")) {
      systemTime = safeNum(line.split(":").at(-1));
    }

    else if (line.includes("Percent of CPU")) {
      cpuPercent = safeNum(line.split(":").at(-1)?.replace("%", ""));
    }

    else if (line.includes("Elapsed (wall clock)")) {
      const val = (line.split(":").at(-1) ?? "").trim();
      wallTimeMs = parseWallTimeToMs(val);
    }

    else if (line.includes("Maximum resident set size")) {
      maxMemoryKb = safeNum(line.split(":").at(-1));
    }

    else if (line.includes("Exit status")) {
      exitCode = safeNum(line.split(":").at(-1));
    }
  }

  return {
    runId,
    timestamp,

    exitCode,
    status:
      exitCode === 0 ? "completed" :
      exitCode === 124 ? "timeout" :
      "failed",

    wallTimeMs,
    userTimeMs: userTime * 1000,
    systemTimeMs: systemTime * 1000,
    cpuPercent,
    maxMemoryKb,

    programOutput: programOutputLines.join("\n")
  };
};
