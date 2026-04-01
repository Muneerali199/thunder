import sqlite3 from 'sqlite3';
import { createHash } from 'crypto';
import path from 'path';

// Database connection
const DB_PATH = path.join(__dirname, '../data/projects.db');

class Database {
  private db: sqlite3.Database;

  constructor() {
    this.db = new sqlite3.Database(DB_PATH);
    this.init();
  }

  private init() {
    // Create projects table with deduplication constraints
    const createProjectsTable = `
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        prompt TEXT NOT NULL,
        prompt_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create chats table
    const createChatsTable = `
      CREATE TABLE IF NOT EXISTS chats (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        project_id TEXT,
        message TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects (id)
      )
    `;

    // Create unique index for deduplication
    // This prevents duplicate projects for the same user with the same normalized prompt
    const createUniqueIndex = `
      CREATE UNIQUE INDEX IF NOT EXISTS idx_user_prompt_dedup 
      ON projects (user_id, prompt_hash)
    `;

    // Create index for recent lookups (performance optimization)
    const createRecentIndex = `
      CREATE INDEX IF NOT EXISTS idx_user_recent 
      ON projects (user_id, created_at DESC)
    `;

    this.db.serialize(() => {
      this.db.run(createProjectsTable);
      this.db.run(createChatsTable);
      this.db.run(createUniqueIndex);
      this.db.run(createRecentIndex);
    });
  }

  /**
   * Normalize prompt for deduplication
   * Creates a hash of the trimmed, lowercased prompt
   */
  private normalizePrompt(prompt: string): string {
    const normalized = prompt.trim().toLowerCase();
    return createHash('md5').update(normalized).digest('hex');
  }

  /**
   * Create or retrieve existing project with deduplication
   * Returns existing project if found within time window, otherwise creates new one
   */
  async createOrGetProject(userId: string, prompt: string): Promise<{
    project: any;
    isNew: boolean;
    isDuplicate: boolean;
  }> {
    const promptHash = this.normalizePrompt(prompt);
    const projectId = `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return new Promise((resolve, reject) => {
      // First check for existing project within the last 2 minutes
      const checkExistingQuery = `
        SELECT * FROM projects 
        WHERE user_id = ? AND prompt_hash = ? 
        AND datetime(created_at, '+2 minutes') > datetime('now')
        ORDER BY created_at DESC 
        LIMIT 1
      `;

      this.db.get(checkExistingQuery, [userId, promptHash], (err, existingProject) => {
        if (err) {
          reject(err);
          return;
        }

        if (existingProject) {
          // Return existing project - it's a duplicate request
          resolve({
            project: existingProject,
            isNew: false,
            isDuplicate: true
          });
          return;
        }

        // No recent duplicate found, create new project
        const insertQuery = `
          INSERT INTO projects (id, user_id, prompt, prompt_hash, created_at, updated_at)
          VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
        `;

        this.db.run(insertQuery, [projectId, userId, prompt, promptHash], (err: any) => {
          if (err) {
            // Check if it's a uniqueness constraint error
            if (err.message.includes('UNIQUE constraint failed')) {
              // Another request just created the same project, fetch it
              this.db.get(checkExistingQuery, [userId, promptHash], (fetchErr: any, duplicateProject: any) => {
                if (fetchErr) {
                  reject(fetchErr);
                  return;
                }
                resolve({
                  project: duplicateProject,
                  isNew: false,
                  isDuplicate: true
                });
              });
            } else {
              reject(err);
            }
            return;
          }

          // Successfully created new project
          const newProject = {
            id: projectId,
            user_id: userId,
            prompt: prompt,
            prompt_hash: promptHash,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          resolve({
            project: newProject,
            isNew: true,
            isDuplicate: false
          });
        });
      });
    });
  }

  /**
   * Create a chat entry
   */
  async createChat(userId: string, projectId: string | null, message: string): Promise<any> {
    const chatId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return new Promise((resolve, reject) => {
      const insertQuery = `
        INSERT INTO chats (id, user_id, project_id, message, created_at)
        VALUES (?, ?, ?, ?, datetime('now'))
      `;

      this.db.run(insertQuery, [chatId, userId, projectId, message], (err: any) => {
        if (err) {
          reject(err);
          return;
        }

        const newChat = {
          id: chatId,
          user_id: userId,
          project_id: projectId,
          message: message,
          created_at: new Date().toISOString()
        };

        resolve(newChat);
      });
    });
  }

  /**
   * Get user's projects
   */
  async getUserProjects(userId: string, limit: number = 50): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT * FROM projects 
        WHERE user_id = ? 
        ORDER BY created_at DESC 
        LIMIT ?
      `;

      this.db.all(query, [userId, limit], (err, projects) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(projects || []);
      });
    });
  }

  /**
   * Get user's chats
   */
  async getUserChats(userId: string, limit: number = 50): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT * FROM chats 
        WHERE user_id = ? 
        ORDER BY created_at DESC 
        LIMIT ?
      `;

      this.db.all(query, [userId, limit], (err, chats) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(chats || []);
      });
    });
  }

  /**
   * Clean up old projects (optional maintenance)
   */
  async cleanupOldProjects(daysOld: number = 30): Promise<number> {
    return new Promise((resolve, reject) => {
      const deleteQuery = `
        DELETE FROM projects 
        WHERE datetime(created_at, '+' || ? || ' days') < datetime('now')
      `;

      this.db.run(deleteQuery, [daysOld], (err: any, result: any) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(result?.changes || 0);
      });
    });
  }

  /**
   * Close database connection
   */
  close(): void {
    this.db.close();
  }
}

export const database = new Database();
export default Database;
