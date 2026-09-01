const RESET = "\x1b[0m";
const CYAN = "\x1b[36m";
const GREEN = "\x1b[32m";
const GRAY = "\x1b[90m";
const RED = "\x1b[31m";

export function showBanner(botUser) {
  const botName = botUser?.tag || botUser?.username || "Unknown Bot";

  console.log(`\n${CYAN}╔══════════════════════════════════════════════════════════════╗${RESET}`);
  console.log(`${CYAN}║${RESET} ${botName}`);
  console.log(`${CYAN}║${RESET} ${GREEN}● Online${RESET}`);
  console.log(`${CYAN}╚══════════════════════════════════════════════════════════════╝${RESET}\n`);
}

export const logger = {
  info(message) {
    console.log(`${CYAN}[INFO]${RESET} ${message}`);
  },
  success(message) {
    console.log(`${GREEN}[OK]${RESET} ${message}`);
  },
  warn(message) {
    console.log(`${CYAN}[WARN]${RESET} ${message}`);
  },
  error(message) {
    console.error(`${RED}[ERROR]${RESET} ${message}`);
  }
};
