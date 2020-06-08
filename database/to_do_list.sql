CREATE TABLE "list"
(
    "task_id" serial primary key,
    "completed" BOOLEAN DEFAULT FALSE,
    "title" varchar(200) NOT NULL,
    "priority" varchar(3) DEFAULT NULL,
    CONSTRAINT priority_exclamation_mark_only CHECK (priority IN ('!', '!!', '!!!')),
    "due" TIMESTAMP DEFAULT NULL,
    "notes" varchar(500)
);