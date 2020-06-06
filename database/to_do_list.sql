CREATE TABLE "list"
(
    "task_id" serial primary key,
    "title" varchar(200) NOT NULL,
    "completed" BOOLEAN DEFAULT FALSE,
    "priority" varchar(3) DEFAULT NULL,
    CONSTRAINT priority_exclamation_mark_only CHECK (priority IN ('!', '!!', '!!!')),
    "due" DATE DEFAULT NULL,
    "notes" varchar(500)
);