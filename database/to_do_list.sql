CREATE TABLE "list"
(
    "task_id" serial primary key,
    "completed" BOOLEAN DEFAULT FALSE,
    "title" varchar(200) NOT NULL,
    "priority" varchar(3) DEFAULT NULL,
    CONSTRAINT priority_exclamation_mark_only CHECK (priority IN ('!', '!!', '!!!')),
    "due" DATE DEFAULT NULL,
    "notes" varchar(500)
);





/*
Note from Ian:
I decided to explore some more database functionality with this project. I've made it so the completed
at column updates automatically when the complete column is changed. The database
can also handle "deleting" tasks while keeping the data around. See the comments for each section
for more details.
*/

/*
first create the "task_app" database
*/
CREATE DATABASE task_app;

/*
then run the following queries in order
*/
CREATE TABLE tasks (
	id  			INTEGER GENERATED ALWAYS AS IDENTITY,
	task			TEXT NOT NULL,
	created			TIMESTAMPTZ DEFAULT NOW
(),
	due				DATE,
	complete        BOOLEAN DEFAULT FALSE,
    completed_at   	TIMESTAMPTZ,
	deleted			BOOLEAN DEFAULT FALSE,
	color			VARCHAR
(6)
	);

/* generate some seed data */
INSERT INTO tasks
    (task)
VALUES
    ('End world hunger');
INSERT INTO tasks
    (task)
VALUES
    ('Get more toilet paper');
INSERT INTO tasks
    (task)
VALUES
    ('Finish singing the song that never ends');


/*
set_completed_at is called by the trigger on_complete, and sets 
completed_at based on what the complete value is after the update
*/

CREATE OR REPLACE FUNCTION set_completed_at
()
	RETURNS trigger 
	LANGUAGE plpgsql
	AS $$
BEGIN
    IF NEW.complete = TRUE THEN
    UPDATE tasks
                SET completed_at = NOW()
                WHERE id = NEW.id;
    ELSE
    UPDATE tasks
                SET completed_at = NULL
                WHERE id = NEW.id;
END
IF;
        RETURN NEW;
END;
	$$;

/*
trigger on complete triggers whenever a task is updated an the complete column changes
it calls the set_completed_at function
*/
CREATE TRIGGER on_complete
    AFTER
UPDATE ON tasks
    FOR EACH ROW
WHEN
(OLD.complete IS DISTINCT FROM NEW.complete)
EXECUTE PROCEDURE set_completed_at
();



/*
mark_deleted marks a task as deleted so the item is ignored by all subsequent queries
so long as the function get_all_tasks is used
*/
CREATE OR REPLACE PROCEDURE mark_deleted
(INT)
	LANGUAGE plpgsql
	AS $$
BEGIN
    UPDATE tasks
			SET deleted = TRUE
			WHERE id = $1;

    COMMIT;
END;
$$;


/*
get_all_tasks returns a table of all tasks not marked deleted.
get_all_tasks should be used in place of referencing the table directly to ensure
"deleted" tasks are ignored. 
*/
CREATE OR REPLACE FUNCTION get_all_tasks
()
	RETURNS TABLE
(
		id  			INTEGER,
        task			TEXT,
        created			TIMESTAMPTZ,
        due				DATE,
        complete        BOOLEAN,
        completed_at   	TIMESTAMPTZ,
        deleted			BOOLEAN,
        color			VARCHAR
(6)
	)
	LANGUAGE plpgsql
	AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM tasks
    WHERE tasks.deleted = FALSE
    ORDER BY created ASC, id ASC;
END;
$$;

/* testing get_all_tasks. if all proceding queries have been run this should return 
a table with 2 task objects, starting at task id 2*/
SELECT *
FROM get_all_tasks();