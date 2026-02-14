import dotenv from 'dotenv';
dotenv.config();

export const env = {
    // Server
    PORT: parseInt(process.env.PORT || '3000', 10),
    NODE_ENV: process.env.NODE_ENV || 'development',

    // Database
    DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/student_management',

    // Redis
    REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',

    // JWT
    JWT_SECRET: process.env.JWT_SECRET || 'default-dev-secret',
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'default-dev-refresh-secret',
    JWT_EXPIRE: process.env.JWT_EXPIRE || '24h',
    JWT_REFRESH_EXPIRE: process.env.JWT_REFRESH_EXPIRE || '7d',

    // Ollama
    OLLAMA_BASE_URL: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
    OLLAMA_MODEL: process.env.OLLAMA_MODEL || 'llama3.2',

    // File Upload
    UPLOAD_DIR: process.env.UPLOAD_DIR || './uploads',
    MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10),
};
