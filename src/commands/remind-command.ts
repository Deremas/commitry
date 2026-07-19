import { evaluateRepository } from "../reminders/reminder-engine.js";
export async function remindCommand(options: { json?: boolean }, cwd = process.cwd()): Promise<void> { const evaluation = await evaluateRepository(cwd, { notify: !options.json }); if (options.json) console.log(JSON.stringify(evaluation, null, 2)); }
