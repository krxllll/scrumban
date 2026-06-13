CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE project_member_role AS ENUM ('OWNER', 'MEMBER');
CREATE TYPE task_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL CHECK (length(trim(name)) > 0),
    email TEXT NOT NULL CHECK (length(trim(email)) > 0),
    password_hash TEXT NOT NULL CHECK (length(password_hash) > 0),
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT users_email_unique UNIQUE (email)
);

CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL CHECK (length(trim(name)) > 0),
    description TEXT,
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Project owners are regular users with project-scoped ownership.
CREATE TABLE project_members (
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role project_member_role NOT NULL DEFAULT 'MEMBER',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (project_id, user_id)
);

-- The project creator should be inserted here with role OWNER.
CREATE TABLE board_columns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL CHECK (length(trim(name)) > 0),
    position INTEGER NOT NULL CHECK (position >= 0),
    wip_limit INTEGER CHECK (wip_limit IS NULL OR wip_limit > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT board_columns_project_id_position_unique UNIQUE (project_id, position),
    CONSTRAINT board_columns_id_project_id_unique UNIQUE (id, project_id)
);

CREATE TABLE epics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL CHECK (length(trim(title)) > 0),
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT epics_id_project_id_unique UNIQUE (id, project_id)
);

CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    column_id UUID NOT NULL,
    epic_id UUID,
    parent_task_id UUID,
    title TEXT NOT NULL CHECK (length(trim(title)) > 0),
    description TEXT,
    priority task_priority NOT NULL DEFAULT 'MEDIUM',
    due_date TIMESTAMPTZ,
    story_points INTEGER CHECK (story_points IS NULL OR story_points >= 0),
    assignee_id UUID,
    reporter_id UUID NOT NULL,
    position INTEGER NOT NULL CHECK (position >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT tasks_parent_task_not_self CHECK (parent_task_id IS NULL OR parent_task_id <> id),
    CONSTRAINT tasks_id_project_id_unique UNIQUE (id, project_id),
    CONSTRAINT tasks_column_id_position_unique UNIQUE (column_id, position),
    CONSTRAINT tasks_column_in_project_fk
        FOREIGN KEY (column_id, project_id)
        REFERENCES board_columns(id, project_id)
        ON DELETE RESTRICT,
    CONSTRAINT tasks_epic_in_project_fk
        FOREIGN KEY (epic_id, project_id)
        REFERENCES epics(id, project_id)
        ON DELETE SET NULL (epic_id),
    CONSTRAINT tasks_parent_in_project_fk
        FOREIGN KEY (parent_task_id, project_id)
        REFERENCES tasks(id, project_id)
        ON DELETE SET NULL (parent_task_id),
    CONSTRAINT tasks_assignee_project_member_fk
        FOREIGN KEY (project_id, assignee_id)
        REFERENCES project_members(project_id, user_id)
        ON DELETE SET NULL (assignee_id),
    CONSTRAINT tasks_reporter_project_member_fk
        FOREIGN KEY (project_id, reporter_id)
        REFERENCES project_members(project_id, user_id)
        ON DELETE RESTRICT
);

CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    content TEXT NOT NULL CHECK (length(trim(content)) > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action TEXT NOT NULL CHECK (length(trim(action)) > 0),
    old_value TEXT,
    new_value TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_projects_owner_id ON projects(owner_id);

CREATE INDEX idx_project_members_project_id ON project_members(project_id);
CREATE INDEX idx_project_members_user_id ON project_members(user_id);
CREATE INDEX idx_project_members_role ON project_members(role);

CREATE INDEX idx_board_columns_project_id ON board_columns(project_id);

CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_column_id ON tasks(column_id);
CREATE INDEX idx_tasks_assignee_id ON tasks(assignee_id);
CREATE INDEX idx_tasks_reporter_id ON tasks(reporter_id);
CREATE INDEX idx_tasks_epic_id ON tasks(epic_id);
CREATE INDEX idx_tasks_parent_task_id ON tasks(parent_task_id);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_priority ON tasks(priority);

CREATE INDEX idx_comments_task_id ON comments(task_id);

CREATE INDEX idx_activity_logs_task_id ON activity_logs(task_id);
