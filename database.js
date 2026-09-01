import { Database } from "bun:sqlite";
const db = new Database(process.env.SQLITE_PATH || "./memory.sqlite", { create: true });
db.exec(`CREATE TABLE IF NOT EXISTS sessions (scope TEXT PRIMARY KEY, session_id TEXT NOT NULL, updated_at INTEGER NOT NULL); CREATE TABLE IF NOT EXISTS memories (id INTEGER PRIMARY KEY AUTOINCREMENT, scope TEXT NOT NULL, role TEXT NOT NULL, content TEXT NOT NULL, created_at INTEGER NOT NULL); CREATE INDEX IF NOT EXISTS idx_memories_scope_created ON memories(scope, created_at DESC);`);
const getSessionStmt = db.query("SELECT session_id FROM sessions WHERE scope = ?1");
const saveSessionStmt = db.query("INSERT INTO sessions(scope, session_id, updated_at) VALUES(?1, ?2, ?3) ON CONFLICT(scope) DO UPDATE SET session_id=excluded.session_id, updated_at=excluded.updated_at");
const addMemoryStmt = db.query("INSERT INTO memories(scope, role, content, created_at) VALUES(?1, ?2, ?3, ?4)");
const getMemoriesStmt = db.query("SELECT role, content FROM memories WHERE scope = ?1 ORDER BY created_at DESC, id DESC LIMIT ?2");
export function getSession(scope) { return getSessionStmt.get(scope)?.session_id || null; }
export function saveSession(scope, sessionId) { saveSessionStmt.run(scope, sessionId, Date.now()); }
export function addMemory(scope, role, content) { addMemoryStmt.run(scope, role, content, Date.now()); }
export function getMemories(scope, limit = 20) { return getMemoriesStmt.all(scope, limit).reverse(); }
export function closeDatabase() { db.close(); }
