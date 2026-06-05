CREATE DATABASE ReWandReC;

USE ReWandReC;

CREATE TABLE roles (
    role_id INT AUTO_INCREMENT PRIMARY KEY,  -- Unique role ID --
    role_name VARCHAR(50) NOT NULL UNIQUE,    -- role name --
    role_description TEXT ,                    -- about the role --
    role_level INT NOT NULL,                   -- hierarchy of the role(1.Employee 2.Manager 3.HR 4.Leadership) --
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- timestamp --
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP   -- updation of timespan --
);

ALTER TABLE roles
ADD CONSTRAINT chk_role_level
CHECK (role_level > 0); -- ensures hierarchy is valid --

CREATE TABLE departments (
    department_id INT AUTO_INCREMENT PRIMARY KEY, -- Unique dept_id for each user --
    department_name VARCHAR(100),                 -- Name of dept --
    department_code VARCHAR(20) UNIQUE,           -- Code of dept --
    department_head INT NULL,                     -- id of dept head --
    parent_department_id INT NULL,                -- sub-depts --
    location VARCHAR(100),                        -- place --
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    employee_code VARCHAR(30) UNIQUE,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,

    role_id INT NOT NULL,
    manager_id INT NULL,
    department_id INT NULL,

    designation VARCHAR(100),
    joining_date DATE,
    status ENUM('Active','Inactive') DEFAULT 'Active',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (role_id) REFERENCES roles(role_id),
    FOREIGN KEY (manager_id) REFERENCES users(user_id),
    FOREIGN KEY (department_id) REFERENCES departments(department_id)
);

ALTER TABLE users
ADD updated_at TIMESTAMP
DEFAULT CURRENT_TIMESTAMP
ON UPDATE CURRENT_TIMESTAMP;

ALTER TABLE departments
ADD CONSTRAINT fk_department_head
FOREIGN KEY (department_head) REFERENCES users(user_id),
ADD CONSTRAINT fk_parent_department
FOREIGN KEY (parent_department_id) REFERENCES departments(department_id);

CREATE TABLE awards (
    award_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100),
    description TEXT,

    award_type ENUM('Voucher','Monetary','Recognition'),

    total_budget DECIMAL(12,2) CHECK (total_budget >= 0),
    used_budget DECIMAL(12,2) DEFAULT 0,

    allow_self_nomination BOOLEAN DEFAULT FALSE,

    start_date DATE,
    end_date DATE,
    frequency ENUM('Monthly','Quarterly','Yearly'),

    max_winners INT,

    created_by INT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (created_by) REFERENCES users(user_id)
);

ALTER TABLE awards
ADD CONSTRAINT chk_total_budget
CHECK (total_budget >= 0),

ADD CONSTRAINT chk_used_budget
CHECK (used_budget >= 0),

ADD CONSTRAINT chk_budget_limit
CHECK (used_budget <= total_budget),

ADD CONSTRAINT chk_max_winners
CHECK (max_winners > 0),

ADD CONSTRAINT chk_award_dates
CHECK (end_date >= start_date);

CREATE TABLE nominations (
    nomination_id INT AUTO_INCREMENT PRIMARY KEY,

    nominated_by INT NOT NULL,
    award_id INT NOT NULL,

    nomination_category ENUM('Individual','Team'),
    nomination_type ENUM('Self','Manager','Leadership'),

    title VARCHAR(200),
    reason TEXT,

    status ENUM('Pending','Approved','Rejected') DEFAULT 'Pending',
    current_level INT DEFAULT 1,

    submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (nominated_by) REFERENCES users(user_id),
    FOREIGN KEY (award_id) REFERENCES awards(award_id)
);

CREATE INDEX idx_nomination_status
ON nominations(status);

CREATE TABLE workflow_levels (
    level_id INT AUTO_INCREMENT PRIMARY KEY,
    level_name VARCHAR(50),
    role_id INT NOT NULL,
    level_order INT NOT NULL,
    description TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (role_id) REFERENCES roles(role_id)
);

ALTER TABLE workflow_levels
ADD CONSTRAINT chk_level_order
CHECK (level_order > 0);

CREATE TABLE approvals (
    approval_id INT AUTO_INCREMENT PRIMARY KEY,

    nomination_id INT NOT NULL,

    approver_id INT NOT NULL,
    level_id INT NOT NULL,

    status ENUM('Pending','Approved','Rejected')
    DEFAULT 'Pending',

    comments TEXT,
    action_date TIMESTAMP NULL,

    FOREIGN KEY (nomination_id)
    REFERENCES nominations(nomination_id)
    ON DELETE CASCADE,

    FOREIGN KEY (approver_id)
    REFERENCES users(user_id),

    FOREIGN KEY (level_id)
    REFERENCES workflow_levels(level_id)
);

CREATE INDEX idx_approval_status
ON approvals(status);

CREATE TABLE winners (
    winner_id INT AUTO_INCREMENT PRIMARY KEY,

    nomination_id INT NOT NULL,
    user_id INT NOT NULL,
    award_id INT NOT NULL,

    reward_amount DECIMAL(12,2) DEFAULT 0,
    reward_type ENUM('Voucher','Monetary','Recognition'),

    reward_title VARCHAR(100),
    certificate_url VARCHAR(255),

    is_announced BOOLEAN DEFAULT FALSE,

    awarded_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (nomination_id) REFERENCES nominations(nomination_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (award_id) REFERENCES awards(award_id)
);

ALTER TABLE winners
ADD CONSTRAINT check_reward_amount
CHECK (reward_amount >= 0);

CREATE INDEX idx_winner_user
ON winners(user_id);

CREATE TABLE nomination_nominees (
    id INT AUTO_INCREMENT PRIMARY KEY,

    nomination_id INT NOT NULL,
    user_id INT NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (nomination_id)
    REFERENCES nominations(nomination_id)
    ON DELETE CASCADE,

    FOREIGN KEY (user_id)
    REFERENCES users(user_id),

    UNIQUE(nomination_id, user_id)
);

CREATE TABLE core_values (
    core_value_id INT AUTO_INCREMENT PRIMARY KEY,
    value_name VARCHAR(50) UNIQUE
);

CREATE TABLE competencies (
    competency_id INT AUTO_INCREMENT PRIMARY KEY,

    competency_name VARCHAR(100) UNIQUE
);

CREATE TABLE nomination_competencies (
    id INT AUTO_INCREMENT PRIMARY KEY,

    nomination_id INT,
    competency_id INT,

    FOREIGN KEY (nomination_id)
    REFERENCES nominations(nomination_id)
    ON DELETE CASCADE,

    FOREIGN KEY (competency_id)
    REFERENCES competencies(competency_id)
);

CREATE TABLE nomination_core_values (
    id INT AUTO_INCREMENT PRIMARY KEY,

    nomination_id INT,
    core_value_id INT,

    FOREIGN KEY (nomination_id)
    REFERENCES nominations(nomination_id)
    ON DELETE CASCADE,

    FOREIGN KEY (core_value_id)
    REFERENCES core_values(core_value_id)
);

CREATE TABLE nomination_outcomes (
    outcome_id INT AUTO_INCREMENT PRIMARY KEY,

    nomination_id INT,

    outcome_text TEXT,

    achievement_description TEXT,

    FOREIGN KEY (nomination_id)
    REFERENCES nominations(nomination_id)
    ON DELETE CASCADE
);

CREATE TABLE attachments (
    attachment_id INT AUTO_INCREMENT PRIMARY KEY,

    nomination_id INT,

    file_name VARCHAR(255),
    file_path VARCHAR(255),

    uploaded_by INT,

    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (nomination_id)
    REFERENCES nominations(nomination_id)
    ON DELETE CASCADE,

    FOREIGN KEY (uploaded_by)
    REFERENCES users(user_id)
);

CREATE TABLE audit_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT,

    action VARCHAR(100),

    entity_name VARCHAR(100),

    entity_id INT,

    old_value TEXT,
    new_value TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
    REFERENCES users(user_id)
);

CREATE TABLE notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(200),
    message TEXT,
    type VARCHAR(50),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE INDEX idx_notifications_user
ON notifications(user_id);

CREATE INDEX idx_users_role
ON users(role_id);

CREATE INDEX idx_users_department
ON users(department_id);

CREATE INDEX idx_approvals_approver
ON approvals(approver_id);

CREATE INDEX idx_nominations_award
ON nominations(award_id);

CREATE OR REPLACE VIEW employee_reward_summary AS
SELECT 
    user_id,
    COUNT(*) AS total_awards,
    SUM(reward_amount) AS total_earnings
FROM winners
WHERE is_announced = TRUE
GROUP BY user_id;
