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

INSERT INTO "list" ("title", "priority", "due", "notes") VALUES ('Title 1', '!', '06/10/2020 16:50', 'Notes about the task.');
INSERT INTO "list" ("title", "priority", "due") VALUES ('Title 2', '!!', '06/10/2020 17:50');
INSERT INTO "list" ("title", "priority", "notes") VALUES ('Title 3', '!!!', 'Different notes.');
INSERT INTO "list" ("title", "due") VALUES ('Title 4', '06/10/2020 14:50');
INSERT INTO "list" ("title") VALUES ('Title 5');
INSERT INTO "list" ("title") VALUES ('Title 6');
INSERT INTO "list" ("title") VALUES ('Title 7');