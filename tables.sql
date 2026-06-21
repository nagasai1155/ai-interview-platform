CREATE DATABASE ai_interview;
use ai_interview;
show tables;
use ai_interview;
select * from users;
drop table users;

CREATE TABLE users (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(100)        NOT NULL,
    email           VARCHAR(150)        NOT NULL UNIQUE,
    password_hash   VARCHAR(255),
    provider        VARCHAR(50)         DEFAULT 'local',   -- 'local' | 'google' | 'github'
    provider_id     VARCHAR(255),                          -- OAuth subject ID
    role            VARCHAR(20)         DEFAULT 'USER',    -- 'USER' | 'ADMIN'
    created_at      TIMESTAMP           DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP           DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE resumes (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id          BIGINT        NOT NULL,
    file_name        VARCHAR(255)  NOT NULL,
    file_url         VARCHAR(500)  NOT NULL,
    raw_text         TEXT,
    parsed_skills    JSON,          -- ["Java","Spring Boot","React"]
    parsed_experience JSON,         -- [{title, company, years}]
    ats_score        INT           DEFAULT 0,
    uploaded_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE interview_sessions (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id          BIGINT        NOT NULL,
    resume_id        BIGINT,
    job_title        VARCHAR(150),
    job_description  TEXT,
    status           VARCHAR(30)   DEFAULT 'IN_PROGRESS',  -- 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED'
    overall_score    INT           DEFAULT 0,
    interview_type   VARCHAR(30)   DEFAULT 'TEXT',          -- 'TEXT' | 'VOICE' | 'CODING'
    started_at       TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    completed_at     TIMESTAMP     NULL,
    FOREIGN KEY (user_id)   REFERENCES users(id)   ON DELETE CASCADE,
    FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE SET NULL
);

CREATE TABLE questions (
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id     BIGINT        NOT NULL,
    question_text  TEXT          NOT NULL,
    category       VARCHAR(60),   -- 'technical' | 'behavioural' | 'situational'
    difficulty     VARCHAR(20)   DEFAULT 'MEDIUM',  -- 'EASY' | 'MEDIUM' | 'HARD'
    order_index    INT           NOT NULL DEFAULT 0,
    FOREIGN KEY (session_id) REFERENCES interview_sessions(id) ON DELETE CASCADE
);

CREATE TABLE answers (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    question_id      BIGINT  NOT NULL,
    session_id       BIGINT  NOT NULL,
    answer_text      TEXT,
    voice_transcript TEXT,
    score            INT     DEFAULT 0,  -- 0–10 from AI
    ai_feedback      TEXT,
    strengths        TEXT,
    improvements     TEXT,
    answered_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    FOREIGN KEY (session_id)  REFERENCES interview_sessions(id) ON DELETE CASCADE
);

