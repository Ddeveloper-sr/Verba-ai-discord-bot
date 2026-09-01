const RESET = "\x1b[0m";
const CYAN = "\x1b[36m";
const GREEN = "\x1b[32m";
const GRAY = "\x1b[90m";
const RED = "\x1b[31m";

const PAIMON = `
██████╗  █████╗ ██╗███╗   ███╗ ██████╗ ███╗   ██╗
██╔══██╗██╔══██╗██║████╗ ████║██╔═══██╗████╗  ██║
██████╔╝███████║██║██╔████╔██║██║   ██║██╔██╗ ██║
██╔═══╝ ██╔══██║██║██║╚██╔╝██║██║   ██║██║╚██╗██║
██║     ██║  ██║██║██║ ╚═╝ ██║╚██████╔╝██║ ╚████║
╚═╝     ╚═╝  ╚═╝╚═╝╚═╝     ╚═╝ ╚═════╝ ╚═╝  ╚═══╝
`;

export function showBanner() {
  console.log(`${CYAN}${PAIMON}${RESET}`);
  console.log(`${GREEN}Online${RESET} ${GRAY}• Verba AI Discord Bot • Bun${RESET}\n`);
}

export const logger = {
  info(message) { console.log(`${CYAN}[INFO]${RESET} ${message}`); },
  success(message) { console.log(`${GREEN}[OK]${RESET} ${message}`); },
  warn(message) { console.log(`${CYAN}[WARN]${RESET} ${message}`); },
  error(message) { console.error(`${RED}[ERROR]${RESET} ${message}`); }
};
