// db.js - Terumo ReWandReC Database Simulation Layer

(function(global) {
    const STORAGE_KEY = 'rewandrec_database_terumo';

    // Seed Data matching the Terumo corporate wireframes
    const seedData = {
        roles: [
            { role_id: 1, role_name: 'Employee', role_description: 'Individual Contributor', role_level: 1 },
            { role_id: 2, role_name: 'Manager', role_description: 'Team Manager / Supervisor', role_level: 2 },
            { role_id: 3, role_name: 'HR Manager', role_description: 'Human Resources Administrator', role_level: 3 },
            { role_id: 4, role_name: 'Leadership', role_description: 'Executive Director / Leadership', role_level: 4 },
            { role_id: 5, role_name: 'Admin', role_description: 'System Administrator', role_level: 5 }
        ],
        departments: [
            { department_id: 1, department_name: 'Engineering', department_code: 'ENG', department_head: 3, parent_department_id: null, location: 'HQ - Building A' },
            { department_id: 2, department_name: 'Marketing', department_code: 'MKTG', department_head: 3, parent_department_id: null, location: 'HQ - Building A' },
            { department_id: 3, department_name: 'Human Resources', department_code: 'HR', department_head: 5, parent_department_id: null, location: 'HQ - Building B' },
            { department_id: 4, department_name: 'Leadership Office', department_code: 'LDR', department_head: 6, parent_department_id: null, location: 'HQ - Building C' }
        ],
        users: [
            { user_id: 1, employee_code: 'EMP001', first_name: 'Vivek', last_name: 'Sharma', email: 'vivek.sharma@terumo.com', password: 'password123', role_id: 1, manager_id: 3, department_id: 1, designation: 'Software Engineer', joining_date: '2023-04-10', status: 'Active', profile_photo: null },
            { user_id: 2, employee_code: 'EMP002', first_name: 'Priya', last_name: 'Singh', email: 'priya.singh@terumo.com', password: 'password123', role_id: 1, manager_id: 3, department_id: 2, designation: 'Marketing Associate', joining_date: '2024-02-15', status: 'Active', profile_photo: null },
            { user_id: 3, employee_code: 'EMP003', first_name: 'Rahul', last_name: 'Verma', email: 'rahul.verma@terumo.com', password: 'password123', role_id: 2, manager_id: 6, department_id: 1, designation: 'Engineering Manager', joining_date: '2021-06-01', status: 'Active', profile_photo: null },
            { user_id: 4, employee_code: 'EMP004', first_name: 'Anita', last_name: 'Kumari', email: 'anita.kumari@terumo.com', password: 'password123', role_id: 1, manager_id: 5, department_id: 3, designation: 'HR Executive', joining_date: '2023-09-12', status: 'Active', profile_photo: null },
            { user_id: 5, employee_code: 'EMP005', first_name: 'Anjali', last_name: 'Mehta', email: 'anjali.mehta@terumo.com', password: 'password123', role_id: 3, manager_id: 6, department_id: 3, designation: 'HR Manager', joining_date: '2019-10-05', status: 'Active', profile_photo: null },
            { user_id: 6, employee_code: 'EMP006', first_name: 'Amit', last_name: 'Kapoor', email: 'amit.kapoor@terumo.com', password: 'password123', role_id: 4, manager_id: null, department_id: 4, designation: 'Director', joining_date: '2015-05-20', status: 'Active', profile_photo: null },
            { user_id: 7, employee_code: 'EMP000', first_name: 'Admin', last_name: 'User', email: 'admin.user@terumo.com', password: 'password123', role_id: 5, manager_id: null, department_id: 4, designation: 'System Administrator', joining_date: '2020-01-01', status: 'Active', profile_photo: null }
        ],
        awards: [
            { award_id: 1, title: 'Best Innovator Award', description: 'Outstanding innovation and excellence in engineering/product architecture.', award_type: 'Monetary', total_budget: 500000.00, used_budget: 175000.00, allow_self_nomination: true, start_date: '2026-01-01', end_date: '2026-12-31', frequency: 'Quarterly', max_winners: 6, created_by: 5, status: 'Active' },
            { award_id: 2, title: 'Team Player Award', description: 'Awarded to teams or individuals showing incredible collaboration and support.', award_type: 'Voucher', total_budget: 300000.00, used_budget: 120000.00, allow_self_nomination: true, start_date: '2026-01-01', end_date: '2026-12-31', frequency: 'Monthly', max_winners: 10, created_by: 5, status: 'Active' },
            { award_id: 3, title: 'Rising Star Award', description: 'Recognizing rapid growth, outstanding efforts, and agility in new employees.', award_type: 'Monetary', total_budget: 200000.00, used_budget: 75000.00, allow_self_nomination: false, start_date: '2026-01-01', end_date: '2026-12-31', frequency: 'Quarterly', max_winners: 4, created_by: 5, status: 'Active' },
            { award_id: 4, title: 'Leadership Excellence Award', description: 'Honoring exceptional leadership, mentoring, and department success direction.', award_type: 'Recognition', total_budget: 100000.00, used_budget: 50000.00, allow_self_nomination: false, start_date: '2026-01-01', end_date: '2026-12-31', frequency: 'Yearly', max_winners: 2, created_by: 6, status: 'Active' },
            { award_id: 5, title: 'Customer Excellence Award', description: 'Awarded to employees demonstrating exceptional focus on client and hospital satisfaction.', award_type: 'Voucher', total_budget: 100000.00, used_budget: 0.00, allow_self_nomination: true, start_date: '2026-01-01', end_date: '2026-12-31', frequency: 'Monthly', max_winners: 5, created_by: 5, status: 'Active' }
        ],
        nominations: [
            { nomination_id: 1, nominated_by: 3, award_id: 1, nomination_category: 'Individual', nomination_type: 'Manager', title: 'Telemetry Module Improvement R&D', reason: 'Vivek has shown outstanding innovation in our R&D project which improved telemetry data processing efficiency by 40%.', status: 'Approved', current_level: 3, submission_date: '2026-05-14T10:15:00.000Z' },
            { nomination_id: 2, nominated_by: 3, award_id: 2, nomination_category: 'Team', nomination_type: 'Manager', title: 'Hospital Deployment Coordination', reason: 'Team worked over the weekend to roll out updates to Tokyo General Hospital.', status: 'Pending', current_level: 2, submission_date: '2026-05-15T09:30:00.000Z' },
            { nomination_id: 3, nominated_by: 1, award_id: 1, nomination_category: 'Individual', nomination_type: 'Self', title: 'Automated Device Debugger API', reason: 'I built a secondary debugging simulator that saves up to 10 development testing hours weekly.', status: 'Pending', current_level: 1, submission_date: '2026-05-16T11:45:00.000Z' },
            { nomination_id: 4, nominated_by: 5, award_id: 4, nomination_category: 'Individual', nomination_type: 'Leadership', title: 'Agility Project Drive', reason: 'Rahul successfully drove the Agile transformation across all Engineering teams.', status: 'Approved', current_level: 3, submission_date: '2026-05-11T16:00:00.000Z' }
        ],
        workflow_levels: [
            { level_id: 0, level_name: 'Manager Review', role_id: 2, level_order: 0, description: 'Review and approve/recommend self-nomination.' },
            { level_id: 1, level_name: 'HR Validation', role_id: 3, level_order: 1, description: 'Verify budgets, details, and guidelines.' },
            { level_id: 2, level_name: 'Leadership Review', role_id: 4, level_order: 2, description: 'Final approval by director/leadership board.' },
            { level_id: 3, level_name: 'HR Final Sign-off', role_id: 3, level_order: 3, description: 'Final release approval after leadership decision.' }
        ],
        approvals: [
            { approval_id: 1, nomination_id: 1, approver_id: 5, level_id: 1, status: 'Approved', comments: 'Budget and criteria verified. Forwarding to Leadership.', action_date: '2026-05-14T11:00:00.000Z' },
            { approval_id: 2, nomination_id: 1, approver_id: 6, level_id: 2, status: 'Approved', comments: 'Incredible engineering. Winner approved.', action_date: '2026-05-14T11:30:00.000Z' },
            
            { approval_id: 3, nomination_id: 2, approver_id: 5, level_id: 1, status: 'Pending', comments: null, action_date: null },
            
            { approval_id: 4, nomination_id: 3, approver_id: 5, level_id: 1, status: 'Pending', comments: null, action_date: null }
        ],
        winners: [
            { winner_id: 1, nomination_id: 1, user_id: 1, award_id: 1, reward_amount: 50000.00, reward_type: 'Monetary', reward_title: 'Best Innovator Winner', certificate_url: 'certificates/cert_001.pdf', is_announced: true, awarded_date: '2026-05-14T11:30:00.000Z' },
            { winner_id: 2, nomination_id: 4, user_id: 3, award_id: 4, reward_amount: 0.00, reward_type: 'Recognition', reward_title: 'Leadership Excellence', certificate_url: 'certificates/cert_002.pdf', is_announced: true, awarded_date: '2026-05-12T10:00:00.000Z' }
        ],
        nomination_nominees: [
            { id: 1, nomination_id: 1, user_id: 1 },
            { id: 2, nomination_id: 2, user_id: 1 },
            { id: 3, nomination_id: 2, user_id: 2 },
            { id: 4, nomination_id: 3, user_id: 1 },
            { id: 5, nomination_id: 4, user_id: 3 }
        ],
        core_values: [
            { core_value_id: 1, value_name: 'Innovation', status: 'Active' },
            { core_value_id: 2, value_name: 'Leadership', status: 'Active' },
            { core_value_id: 3, value_name: 'Integrity', status: 'Active' },
            { core_value_id: 4, value_name: 'Collaboration', status: 'Active' },
            { core_value_id: 5, value_name: 'Excellence', status: 'Active' }
        ],
        competencies: [
            { competency_id: 1, competency_name: 'Leadership', status: 'Active' },
            { competency_id: 2, competency_name: 'Problem Solving', status: 'Active' },
            { competency_id: 3, competency_name: 'Innovation', status: 'Active' },
            { competency_id: 4, competency_name: 'Collaboration', status: 'Active' },
            { competency_id: 5, competency_name: 'Communication', status: 'Active' },
            { competency_id: 6, competency_name: 'Technical Expertise', status: 'Active' }
        ],
        nomination_competencies: [
            { id: 1, nomination_id: 1, competency_id: 3 },
            { id: 2, nomination_id: 1, competency_id: 6 },
            { id: 3, nomination_id: 3, competency_id: 6 }
        ],
        nomination_core_values: [
            { id: 1, nomination_id: 1, core_value_id: 1 },
            { id: 2, nomination_id: 3, core_value_id: 1 }
        ],
        nomination_outcomes: [
            { outcome_id: 1, nomination_id: 1, outcome_text: 'Delivered telemetry module ahead of time and reduced errors.', achievement_description: '40% efficiency improvement.' }
        ],
        attachments: [
            { attachment_id: 1, nomination_id: 1, file_name: 'project_report.pdf', file_path: 'uploads/project_report.pdf', uploaded_by: 3 }
        ],
        audit_logs: [
            { log_id: 1, user_id: 5, action: 'CREATE_AWARD', entity_name: 'awards', entity_id: 1, old_value: null, new_value: 'Created Best Innovator Award with budget 500000.00', created_at: '2026-01-01T09:00:00.000Z' },
            { log_id: 2, user_id: 3, action: 'CREATE', entity_name: 'nominations', entity_id: 1, old_value: null, new_value: 'Nominated Vivek Sharma for Best Innovator Award', created_at: '2026-05-14T10:15:00.000Z' },
            { log_id: 3, user_id: 3, action: 'APPROVE', entity_name: 'approvals', entity_id: 1, old_value: 'Pending', new_value: 'Nomination #NOM125 approved', created_at: '2026-05-14T10:15:00.000Z' },
            { log_id: 4, user_id: 5, action: 'APPROVE', entity_name: 'approvals', entity_id: 2, old_value: 'Pending', new_value: 'Nomination #NOM125 approved (HR)', created_at: '2026-05-14T11:00:00.000Z' }
        ],
        notifications: [
            { notification_id: 1, user_id: 1, title: 'Winner Declared!', message: 'HR approved your nomination for Best Innovator Award', type: 'Award', is_read: false, created_at: '2026-05-14T11:35:00.000Z' },
            { notification_id: 2, user_id: 1, title: 'Workflow Notification', message: 'Your nomination has been sent to Leadership for final approval.', type: 'Approval', is_read: false, created_at: '2026-05-14T11:15:00.000Z' },
            { notification_id: 3, user_id: 3, title: 'Action Required', message: 'New nomination submitted by Priya Singh for Team Excellence requires your approval.', type: 'Approval', is_read: false, created_at: '2026-05-15T09:40:00.000Z' }
        ]
    };

    class TerumoDatabase {
        constructor() {
            this.load();
        }

        load() {
            const data = localStorage.getItem(STORAGE_KEY);
            if (data) {
                try {
                    this.data = JSON.parse(data);
                    
                    // Schema compliance check: reset if old data lacks Admin user or active core values
                    const roles = this.getTable('roles');
                    const users = this.getTable('users');
                    const values = this.getTable('core_values');
                    const awards = this.getTable('awards');
                    
                    const lacksAdmin = !roles.some(r => r.role_id === 5) || !users.some(u => u.role_id === 5);
                    const lacksStatus = values.length > 0 && !('status' in values[0]);
                    const lacksAwardStatus = awards.length > 0 && !('status' in awards[0]);
                    const lacksManagerReview = !this.getTable('workflow_levels').some(w => w.level_id === 0);
                    
                    if (lacksAdmin || lacksStatus || lacksAwardStatus || lacksManagerReview) {
                        console.warn("Outdated simulation database schema. Automatically resetting seeds.");
                        this.reset();
                    }
                } catch (e) {
                    console.error("Error parsing local storage database. Re-seeding.", e);
                    this.data = JSON.parse(JSON.stringify(seedData));
                    this.save();
                }
            } else {
                this.data = JSON.parse(JSON.stringify(seedData));
                this.save();
            }
        }

        save() {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
        }

        reset() {
            this.data = JSON.parse(JSON.stringify(seedData));
            this.save();
        }

        getTable(tableName) {
            return this.data[tableName] || [];
        }

        // Display of award history on employee dashboard / personal workspace
        getEmployeeAwardHistory(userId) {
            const winners = this.getTable('winners');
            const awards = this.getTable('awards');
            const nominations = this.getTable('nominations');
            const users = this.getTable('users');
            
            return winners
                .filter(w => w.user_id === Number(userId) && w.is_announced)
                .map(w => {
                    const award = awards.find(a => a.award_id === w.award_id) || {};
                    const nomination = nominations.find(n => n.nomination_id === w.nomination_id) || {};
                    const nominator = users.find(u => u.user_id === nomination.nominated_by) || {};
                    
                    return {
                        title: award.title || 'Unknown Award',
                        reward_type: w.reward_type,
                        reward_amount: w.reward_amount,
                        reward_title: w.reward_title,
                        awarded_date: w.awarded_date,
                        refer_by: nominator ? `${nominator.first_name} ${nominator.last_name}` : 'N/A'
                    };
                });
        }

        getEmployeeTotalEarned(userId) {
            const winners = this.getTable('winners');
            return winners
                .filter(w => w.user_id === Number(userId) && w.is_announced)
                .reduce((sum, w) => sum + Number(w.reward_amount || 0), 0);
        }

        getAwardsBudgets() {
            return this.getTable('awards').map(a => {
                const total = Number(a.total_budget || 0);
                const used = Number(a.used_budget || 0);
                return {
                    award_id: a.award_id,
                    title: a.title,
                    award_type: a.award_type,
                    total_budget: total,
                    used_budget: used,
                    remaining_budget: total - used,
                    allow_self_nomination: a.allow_self_nomination,
                    start_date: a.start_date,
                    end_date: a.end_date,
                    frequency: a.frequency,
                    max_winners: a.max_winners
                };
            });
        }

        getPendingApprovals() {
            const approvals = this.getTable('approvals');
            const nominations = this.getTable('nominations');
            const users = this.getTable('users');
            const awards = this.getTable('awards');

            return approvals
                .filter(app => app.status === 'Pending')
                .map(app => {
                    const nomination = nominations.find(n => n.nomination_id === app.nomination_id) || {};
                    const nomineeLinks = this.getTable('nomination_nominees').filter(nn => nn.nomination_id === nomination.nomination_id);
                    const nominees = nomineeLinks.map(link => users.find(u => u.user_id === link.user_id)).filter(Boolean);
                    const award = awards.find(a => a.award_id === nomination.award_id) || {};
                    const nominator = users.find(u => u.user_id === nomination.nominated_by) || {};
                    
                    return {
                        approval_id: app.approval_id,
                        nomination_id: app.nomination_id,
                        approver_id: app.approver_id,
                        level_id: app.level_id,
                        status: app.status,
                        comments: app.comments,
                        action_date: app.action_date,
                        nomination: {
                            ...nomination,
                            nominees: nominees,
                            award_title: award.title,
                            award_type: award.award_type,
                            nominator_name: `${nominator.first_name} ${nominator.last_name}`
                        }
                    };
                });
        }

        getNominationNominees(nominationId) {
            const links = this.getTable('nomination_nominees').filter(nn => nn.nomination_id === Number(nominationId));
            const users = this.getTable('users');
            return links.map(link => users.find(u => u.user_id === link.user_id)).filter(Boolean);
        }

        incrementAwardBudget(awardId, amount) {
            const awards = this.getTable('awards');
            const award = awards.find(a => a.award_id === Number(awardId));
            if (!award) throw new Error(`Award with ID ${awardId} not found`);

            const newUsed = Number(award.used_budget || 0) + Number(amount);
            
            if (award.award_type !== 'Recognition' && newUsed > Number(award.total_budget)) {
                throw new Error(`Insufficient budget. Limit: ${award.total_budget}, Proposed Used: ${newUsed}`);
            }

            award.used_budget = newUsed;
            this.save();
            return award;
        }

        getEmployeeRewardSummary() {
            const winners = this.getTable('winners').filter(w => w.is_announced);
            const users = this.getTable('users');
            const depts = this.getTable('departments');

            const summaryMap = {};
            winners.forEach(w => {
                if (!summaryMap[w.user_id]) {
                    summaryMap[w.user_id] = { total_awards: 0, total_earnings: 0 };
                }
                summaryMap[w.user_id].total_awards += 1;
                summaryMap[w.user_id].total_earnings += Number(w.reward_amount || 0);
            });

            return users.map(u => {
                const summary = summaryMap[u.user_id] || { total_awards: 0, total_earnings: 0 };
                const dept = depts.find(d => d.department_id === u.department_id) || {};
                return {
                    user_id: u.user_id,
                    name: `${u.first_name} ${u.last_name}`,
                    employee_code: u.employee_code,
                    designation: u.designation,
                    department_name: dept.department_name || 'N/A',
                    total_awards: summary.total_awards,
                    total_earnings: summary.total_earnings
                };
            });
        }

        logAction(userId, action, entityName, entityId, oldValue, newValue) {
            const logs = this.getTable('audit_logs');
            const logId = logs.length > 0 ? Math.max(...logs.map(l => l.log_id)) + 1 : 1;
            
            logs.push({
                log_id: logId,
                user_id: userId ? Number(userId) : null,
                action: action,
                entity_name: entityName,
                entity_id: entityId,
                old_value: oldValue ? String(oldValue) : null,
                new_value: newValue ? String(newValue) : null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });
            this.save();
        }

        createNotification(userId, title, message, type) {
            const notifications = this.getTable('notifications');
            const notifId = notifications.length > 0 ? Math.max(...notifications.map(n => n.notification_id)) + 1 : 1;

            notifications.push({
                notification_id: notifId,
                user_id: Number(userId),
                title: title,
                message: message,
                type: type || 'Info',
                is_read: false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });
            this.save();
        }

        createNomination(data) {
            const {
                nominated_by,
                award_id,
                nomination_category,
                nomination_type, // 'Self', 'Manager', 'Leadership'
                nominees,
                title,
                reason,
                competencies,
                core_values,
                outcome_text,
                achievement_description,
                attachment_name
            } = data;

            const award = this.getTable('awards').find(a => a.award_id === Number(award_id));
            if (!award) throw new Error('Selected award does not exist.');

            const users = this.getTable('users');
            const roles = this.getTable('roles');
            const nominator = users.find(u => u.user_id === Number(nominated_by));
            if (!nominator) throw new Error('Nominator profile not found');
            const nominatorRole = roles.find(r => r.role_id === nominator.role_id) || {};

            // HR Submission Block
            if (nominatorRole.role_level === 3) {
                throw new Error("HR Managers are not permitted to submit nominations.");
            }

            // Nominees alignment checks
            nominees.forEach(nId => {
                const nominee = users.find(u => u.user_id === Number(nId));
                if (!nominee) throw new Error(`Nominee with ID ${nId} not found`);
                const nomineeRole = roles.find(r => r.role_id === nominee.role_id) || {};
                
                // Admin Protection
                if (nomineeRole.role_level === 5) {
                    throw new Error("Admin User cannot be nominated.");
                }

                // HR Nomination restrictions
                if (nomineeRole.role_level === 3 && nominatorRole.role_level < 4) {
                    throw new Error("HR Managers can only be nominated by Leadership.");
                }

                // Manager nomination restrictions
                if (nominatorRole.role_level === 2 && nomineeRole.role_level !== 1) {
                    throw new Error("Managers can only nominate Employees, not HR, leadership or admin.");
                }
            });

            // Self Nomination Check
            if (nomination_type === 'Self' && !award.allow_self_nomination) {
                throw new Error(`Self-nominations are not permitted for "${award.title}".`);
            }

            const nominations = this.getTable('nominations');
            const nominationId = nominations.length > 0 ? Math.max(...nominations.map(n => n.nomination_id)) + 1 : 1;
            
            const newNomination = {
                nomination_id: nominationId,
                nominated_by: Number(nominated_by),
                award_id: Number(award_id),
                nomination_category: nomination_category,
                nomination_type: nomination_type,
                title: title,
                reason: reason,
                status: 'Pending',
                current_level: 1, // Manager Review level
                submission_date: new Date().toISOString()
            };
            nominations.push(newNomination);

            // Link Nominees
            const nomineeTable = this.getTable('nomination_nominees');
            nominees.forEach(nId => {
                const nextId = nomineeTable.length > 0 ? Math.max(...nomineeTable.map(nn => nn.id)) + 1 : 1;
                nomineeTable.push({
                    id: nextId,
                    nomination_id: nominationId,
                    user_id: Number(nId),
                    created_at: new Date().toISOString()
                });
            });

            // Link Competencies
            const compTable = this.getTable('nomination_competencies');
            if (competencies && competencies.length > 0) {
                competencies.forEach(cId => {
                    const nextId = compTable.length > 0 ? Math.max(...compTable.map(nc => nc.id)) + 1 : 1;
                    compTable.push({
                        id: nextId,
                        nomination_id: nominationId,
                        competency_id: Number(cId)
                    });
                });
            }

            // Link Core Values
            const valTable = this.getTable('nomination_core_values');
            if (core_values && core_values.length > 0) {
                core_values.forEach(vId => {
                    const nextId = valTable.length > 0 ? Math.max(...valTable.map(nv => nv.id)) + 1 : 1;
                    valTable.push({
                        id: nextId,
                        nomination_id: nominationId,
                        core_value_id: Number(vId)
                    });
                });
            }

            // Outcomes
            if (outcome_text || achievement_description) {
                const outcomeTable = this.getTable('nomination_outcomes');
                const nextId = outcomeTable.length > 0 ? Math.max(...outcomeTable.map(no => no.outcome_id)) + 1 : 1;
                outcomeTable.push({
                    outcome_id: nextId,
                    nomination_id: nominationId,
                    outcome_text: outcome_text,
                    achievement_description: achievement_description
                });
            }

            // Attachment
            if (attachment_name) {
                const attachTable = this.getTable('attachments');
                const nextId = attachTable.length > 0 ? Math.max(...attachTable.map(at => at.attachment_id)) + 1 : 1;
                attachTable.push({
                    attachment_id: nextId,
                    nomination_id: nominationId,
                    file_name: attachment_name,
                    file_path: `uploads/nom_${nominationId}_${attachment_name}`,
                    uploaded_by: Number(nominated_by),
                    uploaded_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                });
            }

            // Set up level 1 approval (HR Validation)
            const approvals = this.getTable('approvals');
            const approvalId = approvals.length > 0 ? Math.max(...approvals.map(ap => ap.approval_id)) + 1 : 1;
            const hrUsers = this.getTable('users').filter(u => u.role_id === 3);
            const hrId = hrUsers.length > 0 ? hrUsers[0].user_id : 5; // Anjali Mehta default HR

            const managerId = nominator ? nominator.manager_id : null;

            if (nomination_type === 'Self' && managerId) {
                // Submitted as Self nomination - goes to direct Line Manager (Level 0)
                approvals.push({
                    approval_id: approvalId,
                    nomination_id: nominationId,
                    approver_id: managerId,
                    level_id: 0, // Manager Review
                    status: 'Pending',
                    comments: null,
                    action_date: null
                });
                newNomination.current_level = 0;
                this.createNotification(managerId, 'Manager Review Required', `New self-nomination for "${title}" submitted by ${nominator.first_name} ${nominator.last_name} requires your review.`, 'Approval');
            } else if (nomination_type === 'Leadership') {
                // Submitted by Leadership - goes directly to Leadership Review (Level 2)
                approvals.push({
                    approval_id: approvalId,
                    nomination_id: nominationId,
                    approver_id: 6, // Amit Kapoor (Director)
                    level_id: 2, // Leadership Review
                    status: 'Pending',
                    comments: null,
                    action_date: null
                });
                newNomination.current_level = 2;
                this.createNotification(6, 'Executive Sign-off Required', `A nomination for "${title}" has been submitted and awaits your final sign-off.`, 'Approval');
            } else {
                // Submitted by Employee (Peer) or Manager - goes to HR Validation (Level 1)
                approvals.push({
                    approval_id: approvalId,
                    nomination_id: nominationId,
                    approver_id: hrId,
                    level_id: 1, // HR Validation
                    status: 'Pending',
                    comments: null,
                    action_date: null
                });
                newNomination.current_level = 1;
                this.createNotification(hrId, 'HR Validation Required', `New nomination for "${title}" requires validation.`, 'Approval');
            }

            this.logAction(nominated_by, 'CREATE', 'nominations', nominationId, null, `Submitted ${nomination_type} nomination for ${nominees.length} employee(s)`);
            this.save();
            return nominationId;
        }

        submitApprovalAction(approvalId, userId, status, comments) {
            const approvals = this.getTable('approvals');
            const appRecord = approvals.find(ap => ap.approval_id === Number(approvalId));
            if (!appRecord) throw new Error('Approval record not found');
            if (appRecord.status !== 'Pending') throw new Error('This workflow step has already been processed');

            const nominations = this.getTable('nominations');
            const nomination = nominations.find(n => n.nomination_id === appRecord.nomination_id);
            if (!nomination) throw new Error('Nomination details not found');

            appRecord.status = status;
            appRecord.comments = comments;
            appRecord.action_date = new Date().toISOString();

            this.logAction(userId, 'APPROVE', 'approvals', approvalId, 'Pending', `Nomination #${nomination.nomination_id} ${status.toLowerCase()}`);

            if (status === 'Rejected') {
                nomination.status = 'Rejected';
                this.createNotification(nomination.nominated_by, 'Nomination Rejected', `Your nomination for "${nomination.title}" was rejected.`, 'Status');
                // Clean up unannounced winners if rejected at final stage
                this.data.winners = this.getTable('winners').filter(w => w.nomination_id !== nomination.nomination_id);
            } else {
                // Progression logic
                if (appRecord.level_id === 0) { // Manager Review Approved -> Send to HR Validation (Level 1)
                    nomination.current_level = 1;
                    
                    const nextAppId = approvals.length > 0 ? Math.max(...approvals.map(ap => ap.approval_id)) + 1 : 1;
                    const hrUsers = this.getTable('users').filter(u => u.role_id === 3);
                    const hrId = hrUsers.length > 0 ? hrUsers[0].user_id : 5; // Anjali Mehta default HR

                    approvals.push({
                        approval_id: nextAppId,
                        nomination_id: nomination.nomination_id,
                        approver_id: hrId,
                        level_id: 1, // HR Validation
                        status: 'Pending',
                        comments: null,
                        action_date: null
                    });
                    
                    this.createNotification(hrId, 'HR Validation Required', `Self-nomination "${nomination.title}" has been approved by manager and requires HR validation.`, 'Approval');
                }
                else if (appRecord.level_id === 1) { // HR Validated -> Send to Leadership (Level 2)
                    nomination.current_level = 2;
                    
                    const nextAppId = approvals.length > 0 ? Math.max(...approvals.map(ap => ap.approval_id)) + 1 : 1;
                    approvals.push({
                        approval_id: nextAppId,
                        nomination_id: nomination.nomination_id,
                        approver_id: 6, // Amit Kapoor (Director)
                        level_id: 2, // Leadership Review
                        status: 'Pending',
                        comments: null,
                        action_date: null
                    });
                    
                    this.createNotification(6, 'Leadership Review Required', `Nomination "${nomination.title}" is ready for final sign-off.`, 'Approval');
                } 
                else if (appRecord.level_id === 2) { // Leadership Approved -> Escalate to HR Final Sign-off (Level 3)
                    nomination.current_level = 3;
                    
                    const nextAppId = approvals.length > 0 ? Math.max(...approvals.map(ap => ap.approval_id)) + 1 : 1;
                    const hrUsers = this.getTable('users').filter(u => u.role_id === 3);
                    const hrId = hrUsers.length > 0 ? hrUsers[0].user_id : 5; // default to Anjali Mehta

                    approvals.push({
                        approval_id: nextAppId,
                        nomination_id: nomination.nomination_id,
                        approver_id: hrId,
                        level_id: 3, // HR Final Sign-off
                        status: 'Pending',
                        comments: comments || 'Approved by Leadership',
                        action_date: null
                    });

                    // Create default winner entry if not exists (so details rendering in releases view does not fail)
                    const winners = this.getTable('winners');
                    const hasWinner = winners.some(w => w.nomination_id === nomination.nomination_id);
                    if (!hasWinner) {
                        const award = this.getTable('awards').find(a => a.award_id === nomination.award_id) || {};
                        const nominees = this.getTable('nomination_nominees').filter(nn => nn.nomination_id === nomination.nomination_id);
                        
                        nominees.forEach(nominee => {
                            const nextWinnerId = winners.length > 0 ? Math.max(...winners.map(w => w.winner_id)) + 1 : 1;
                            const certificateId = `cert_${String(nextWinnerId).padStart(3, '0')}`;
                            
                            winners.push({
                                winner_id: nextWinnerId,
                                nomination_id: nomination.nomination_id,
                                user_id: nominee.user_id,
                                award_id: award.award_id,
                                reward_amount: (award.award_type === 'Recognition' ? 0 : 25000) / nominees.length,
                                reward_type: award.award_type,
                                reward_title: `${award.title} Winner`,
                                certificate_url: `certificates/${certificateId}.pdf`,
                                is_announced: false, // Pending HR release
                                awarded_date: new Date().toISOString()
                            });
                        });
                    }

                    this.createNotification(hrId, 'HR Final Sign-off Required', `Leadership has approved nomination "${nomination.title}". Please review and release the award.`, 'Approval');
                }
                else if (appRecord.level_id === 3) { // HR Final Sign-off Approved -> release award
                    nomination.status = 'Approved';
                    
                    const winners = this.getTable('winners').filter(w => w.nomination_id === nomination.nomination_id);
                    const award = this.getTable('awards').find(a => a.award_id === nomination.award_id);
                    
                    let totalAmount = 0;
                    winners.forEach(w => {
                        w.is_announced = true;
                        totalAmount += Number(w.reward_amount || 0);

                        this.createNotification(
                            w.user_id,
                            '🎉 Winner Declared!',
                            `Congratulations! You have been awarded "${w.reward_title || award.title}"! Open your award history to download your certificate.`,
                            'Award'
                        );
                    });

                    if (award) {
                        this.incrementAwardBudget(award.award_id, totalAmount);
                        this.logAction(userId, 'UPDATE', 'awards', award.award_id, `Used budget: ${award.used_budget - totalAmount}`, `Updated budget: ${award.used_budget} (Winner Declared & Released)`);
                    }

                    this.createNotification(nomination.nominated_by, 'Nomination Released', `Your nomination "${nomination.title}" has been officially released by HR!`, 'Status');
                }
            }

            this.save();
            return { nominationStatus: nomination.status, currentLevel: nomination.current_level };
        }

        leadershipDeclareWinner(nominationId, leaderUserId, rewardAmount, rewardTitle) {
            const nominations = this.getTable('nominations');
            const nomination = nominations.find(n => n.nomination_id === Number(nominationId));
            if (!nomination) throw new Error('Nomination not found');

            const awards = this.getTable('awards');
            const award = awards.find(a => a.award_id === nomination.award_id);
            if (!award) throw new Error('Award definition not found');

            const winners = this.getTable('winners');
            const amt = Number(rewardAmount || 0);

            const nominees = this.getTable('nomination_nominees').filter(nn => nn.nomination_id === nomination.nomination_id);
            
            nominees.forEach(nominee => {
                const nextWinnerId = winners.length > 0 ? Math.max(...winners.map(w => w.winner_id)) + 1 : 1;
                const certificateId = `cert_${String(nextWinnerId).padStart(3, '0')}`;
                
                winners.push({
                    winner_id: nextWinnerId,
                    nomination_id: nomination.nomination_id,
                    user_id: nominee.user_id,
                    award_id: award.award_id,
                    reward_amount: amt / nominees.length,
                    reward_type: award.award_type,
                    reward_title: rewardTitle || `${award.title} Winner`,
                    certificate_url: `certificates/${certificateId}.pdf`,
                    is_announced: false, // Pending HR release
                    awarded_date: new Date().toISOString()
                });
            });

            // Set the Level 2 active approval step to 'Approved'
            const approvals = this.getTable('approvals');
            const activeStep = approvals.find(ap => ap.nomination_id === nomination.nomination_id && ap.approver_id === Number(leaderUserId) && ap.status === 'Pending');
            if (activeStep) {
                activeStep.status = 'Approved';
                activeStep.comments = `Winner declared: ${rewardTitle || award.title}`;
                activeStep.action_date = new Date().toISOString();
            }

            // Escalate to Level 3 (HR Final Sign-off)
            nomination.current_level = 3;
            
            const nextAppId = approvals.length > 0 ? Math.max(...approvals.map(ap => ap.approval_id)) + 1 : 1;
            const hrUsers = this.getTable('users').filter(u => u.role_id === 3);
            const hrId = hrUsers.length > 0 ? hrUsers[0].user_id : 5; // default to Anjali Mehta

            approvals.push({
                approval_id: nextAppId,
                nomination_id: nomination.nomination_id,
                approver_id: hrId,
                level_id: 3, // HR Final Sign-off
                status: 'Pending',
                comments: null,
                action_date: null
            });

            // Notify HR
            this.createNotification(
                hrId,
                'HR Final Sign-off Required',
                `Leadership has selected winner(s) for the award "${award.title}" under nomination "${nomination.title}". Please review and release the award.`,
                'Approval'
            );

            // Notify direct managers of nominees
            const users = this.getTable('users');
            const nomineeNames = nominees.map(link => {
                const u = users.find(user => user.user_id === link.user_id);
                return u ? `${u.first_name} ${u.last_name}` : 'Unknown';
            }).join(', ');

            const managersToNotify = new Set();
            nominees.forEach(link => {
                const nominee = users.find(u => u.user_id === link.user_id);
                if (nominee && nominee.manager_id) {
                    managersToNotify.add(nominee.manager_id);
                }
            });

            managersToNotify.forEach(mId => {
                this.createNotification(
                    mId,
                    'Winner Selected (Pending HR Release)',
                    `Leadership has selected a member of your team (${nomineeNames}) as a winner for "${award.title}". The final release is pending HR approval.`,
                    'Status'
                );
            });

            this.logAction(leaderUserId, 'UPDATE', 'nominations', nomination.nomination_id, 'Leadership Review', 'Winner declared (Pending HR Sign-off)');
            this.save();
            return winners;
        }

        announceWinner(nominationId, hrUserId, rewardAmount, rewardTitle) {
            const nominations = this.getTable('nominations');
            const nomination = nominations.find(n => n.nomination_id === Number(nominationId));
            if (!nomination) throw new Error('Nomination not found');
            
            // Allow finalization if approved by leadership (or if HR has validated it for low value)
            if (nomination.status !== 'Approved') {
                // If it is in level 3 (Leadership) and pending leadership decision, HR can finalize it if authorized
                // But typically it goes to 'Approved' status when the leadership final sign-off is completed.
                // Let's set the status to 'Approved' directly if they announce it.
                nomination.status = 'Approved';
            }

            const awards = this.getTable('awards');
            const award = awards.find(a => a.award_id === nomination.award_id);
            if (!award) throw new Error('Award definition not found');

            const winners = this.getTable('winners');
            const amt = Number(rewardAmount || 0);

            // Increment budget and verify limit
            this.incrementAwardBudget(award.award_id, amt);

            const nominees = this.getTable('nomination_nominees').filter(nn => nn.nomination_id === nomination.nomination_id);
            
            nominees.forEach(nominee => {
                const nextWinnerId = winners.length > 0 ? Math.max(...winners.map(w => w.winner_id)) + 1 : 1;
                const certificateId = `cert_${String(nextWinnerId).padStart(3, '0')}`;
                
                winners.push({
                    winner_id: nextWinnerId,
                    nomination_id: nomination.nomination_id,
                    user_id: nominee.user_id,
                    award_id: award.award_id,
                    reward_amount: amt / nominees.length,
                    reward_type: award.award_type,
                    reward_title: rewardTitle || `${award.title} Winner`,
                    certificate_url: `certificates/${certificateId}.pdf`,
                    is_announced: true,
                    awarded_date: new Date().toISOString()
                });

                this.createNotification(
                    nominee.user_id,
                    '🎉 Winner Declared!',
                    `Congratulations! You have been awarded "${rewardTitle || award.title}"! Open your award history to download your certificate.`,
                    'Award'
                );
            });

            this.logAction(hrUserId, 'UPDATE', 'awards', award.award_id, `Used budget: ${award.used_budget - amt}`, `Updated budget: ${award.used_budget} (Winner Declared)`);
            this.save();
            return winners;
        }

        createNewAward(hrUserId, data) {
            const { title, description, award_type, total_budget, allow_self_nomination, start_date, end_date, frequency, max_winners } = data;

            const budgetNum = Number(total_budget || 0);
            const winnersNum = Number(max_winners || 1);

            if (budgetNum < 0) throw new Error('Budget cannot be negative.');
            if (winnersNum <= 0) throw new Error('Max winners must be greater than 0.');
            if (new Date(end_date) < new Date(start_date)) throw new Error('End date must be on or after start date.');

            const awards = this.getTable('awards');
            const awardId = awards.length > 0 ? Math.max(...awards.map(a => a.award_id)) + 1 : 1;

            const newAward = {
                award_id: awardId,
                title: title,
                description: description,
                award_type: award_type,
                total_budget: budgetNum,
                used_budget: 0.00,
                allow_self_nomination: Boolean(allow_self_nomination),
                start_date: start_date,
                end_date: end_date,
                frequency: frequency,
                max_winners: winnersNum,
                created_by: Number(hrUserId),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            awards.push(newAward);
            this.logAction(hrUserId, 'CREATE', 'awards', awardId, null, `Created Award "${title}"`);
            this.save();
            return newAward;
        }

        getNominationDetails(nominationId) {
            const nominations = this.getTable('nominations');
            const users = this.getTable('users');
            const awards = this.getTable('awards');
            const coreVals = this.getTable('core_values');
            const competencies = this.getTable('competencies');

            const nom = nominations.find(n => n.nomination_id === Number(nominationId));
            if (!nom) return null;

            const nominator = users.find(u => u.user_id === nom.nominated_by) || {};
            const award = awards.find(a => a.award_id === nom.award_id) || {};
            
            const nomineeLinks = this.getTable('nomination_nominees').filter(nn => nn.nomination_id === nom.nomination_id);
            const nominees = nomineeLinks.map(link => users.find(u => u.user_id === link.user_id)).filter(Boolean);

            const valLinks = this.getTable('nomination_core_values').filter(nv => nv.nomination_id === nom.nomination_id);
            const values = valLinks.map(link => coreVals.find(v => v.core_value_id === link.core_value_id)).filter(Boolean);

            const compLinks = this.getTable('nomination_competencies').filter(nc => nc.nomination_id === nom.nomination_id);
            const comps = compLinks.map(link => competencies.find(c => c.competency_id === link.competency_id)).filter(Boolean);

            const outcome = this.getTable('nomination_outcomes').find(no => no.nomination_id === nom.nomination_id) || {};
            const attachment = this.getTable('attachments').find(at => at.nomination_id === nom.nomination_id) || {};

            const approvals = this.getTable('approvals')
                .filter(ap => ap.nomination_id === nom.nomination_id)
                .map(ap => {
                    const approver = users.find(u => u.user_id === ap.approver_id) || {};
                    const level = this.getTable('workflow_levels').find(l => l.level_id === ap.level_id) || {};
                    return {
                        ...ap,
                        approver_name: `${approver.first_name} ${approver.last_name}`,
                        level_name: level.level_name
                    };
                });

            return {
                ...nom,
                nominator_name: `${nominator.first_name} ${nominator.last_name}`,
                award: award,
                nominees: nominees,
                core_values: values,
                competencies: comps,
                outcome: outcome,
                attachment: attachment,
                approvals: approvals
            };
        }

        // --- ADMIN METHODS FOR CORE VALUES & COMPETENCIES MANAGEMENT ---
        addCoreValue(actorUserId, name) {
            const values = this.getTable('core_values');
            const newId = values.length > 0 ? Math.max(...values.map(v => v.core_value_id)) + 1 : 1;
            const newVal = { core_value_id: newId, value_name: name, status: 'Active' };
            values.push(newVal);
            this.logAction(actorUserId, 'CREATE', 'core_values', newId, null, `Created Core Value "${name}"`);
            this.save();
            return newVal;
        }

        toggleCoreValueStatus(actorUserId, id) {
            const values = this.getTable('core_values');
            const val = values.find(v => v.core_value_id === Number(id));
            if (val) {
                const oldVal = val.status;
                val.status = val.status === 'Active' ? 'Inactive' : 'Active';
                this.logAction(actorUserId, 'UPDATE', 'core_values', id, `status: ${oldVal}`, `status: ${val.status}`);
                this.save();
            }
            return val;
        }

        addCompetency(actorUserId, name) {
            const comps = this.getTable('competencies');
            const newId = comps.length > 0 ? Math.max(...comps.map(c => c.competency_id)) + 1 : 1;
            const newComp = { competency_id: newId, competency_name: name, status: 'Active' };
            comps.push(newComp);
            this.logAction(actorUserId, 'CREATE', 'competencies', newId, null, `Created Competency "${name}"`);
            this.save();
            return newComp;
        }

        toggleCompetencyStatus(actorUserId, id) {
            const comps = this.getTable('competencies');
            const comp = comps.find(c => c.competency_id === Number(id));
            if (comp) {
                const oldVal = comp.status;
                comp.status = comp.status === 'Active' ? 'Inactive' : 'Active';
                this.logAction(actorUserId, 'UPDATE', 'competencies', id, `status: ${oldVal}`, `status: ${comp.status}`);
                this.save();
            }
            return comp;
        }

        // --- AWARD MANAGEMENT CRUD METHODS ---
        updateAward(actorUserId, awardId, data) {
            const awards = this.getTable('awards');
            const award = awards.find(a => a.award_id === Number(awardId));
            if (!award) throw new Error(`Award with ID ${awardId} not found`);

            const oldVal = JSON.stringify(award);
            award.title = data.title;
            award.description = data.description;
            award.award_type = data.award_type;
            award.total_budget = Number(data.total_budget);
            award.allow_self_nomination = Boolean(data.allow_self_nomination);
            award.start_date = data.start_date;
            award.end_date = data.end_date;
            award.frequency = data.frequency;
            award.max_winners = Number(data.max_winners);
            
            this.logAction(actorUserId, 'UPDATE', 'awards', awardId, oldVal, JSON.stringify(award));
            this.save();
            return award;
        }

        toggleAwardStatus(actorUserId, awardId) {
            const awards = this.getTable('awards');
            const award = awards.find(a => a.award_id === Number(awardId));
            if (award) {
                const oldStatus = award.status || 'Active';
                award.status = oldStatus === 'Active' ? 'Inactive' : 'Active';
                this.logAction(actorUserId, 'UPDATE', 'awards', awardId, `status: ${oldStatus}`, `status: ${award.status}`);
                this.save();
            }
            return award;
        }

        deleteAward(actorUserId, awardId) {
            const awards = this.getTable('awards');
            const idx = awards.findIndex(a => a.award_id === Number(awardId));
            if (idx !== -1) {
                const award = awards[idx];
                awards.splice(idx, 1);
                this.logAction(actorUserId, 'DELETE', 'awards', awardId, JSON.stringify(award), null);
                this.save();
            }
        }

        // --- EMPLOYEE USER MANAGEMENT CRUD METHODS ---
        createUser(actorUserId, data) {
            const users = this.getTable('users');
            const roles = this.getTable('roles');
            const newId = users.length > 0 ? Math.max(...users.map(u => u.user_id)) + 1 : 1;
            
            const targetRoleObj = roles.find(r => r.role_id === Number(data.role_id)) || {};
            const actorObj = users.find(u => u.user_id === Number(actorUserId)) || {};
            const actorRoleObj = roles.find(r => r.role_id === actorObj.role_id) || {};

            if (targetRoleObj.role_level === 5 && actorRoleObj.role_level !== 5) {
                throw new Error("Only an Administrator can assign the Admin role.");
            }

            const count = users.length + 1;
            const code = `EMP${String(count).padStart(3, '0')}`;

            const newUser = {
                user_id: newId,
                employee_code: code,
                first_name: data.first_name,
                last_name: data.last_name,
                email: data.email,
                password: 'password123',
                role_id: Number(data.role_id),
                manager_id: data.manager_id ? Number(data.manager_id) : null,
                department_id: Number(data.department_id),
                designation: data.designation,
                joining_date: data.joining_date || new Date().toISOString().split('T')[0],
                status: 'Active',
                profile_photo: data.profile_photo || null
            };

            users.push(newUser);
            this.logAction(actorUserId, 'CREATE', 'users', newId, null, JSON.stringify(newUser));
            this.save();
            return newUser;
        }

        updateUser(actorUserId, userId, data) {
            const users = this.getTable('users');
            const user = users.find(u => u.user_id === Number(userId));
            if (!user) throw new Error(`User with ID ${userId} not found`);

            const roles = this.getTable('roles');
            const targetRoleObj = roles.find(r => r.role_id === user.role_id) || {};
            const proposedRoleObj = roles.find(r => r.role_id === Number(data.role_id)) || {};
            const actorObj = users.find(u => u.user_id === Number(actorUserId)) || {};
            const actorRoleObj = roles.find(r => r.role_id === actorObj.role_id) || {};

            if ((targetRoleObj.role_level === 5 || proposedRoleObj.role_level === 5) && actorRoleObj.role_level !== 5) {
                throw new Error("Only an Administrator can manage or assign Admin profiles.");
            }

            const oldVal = JSON.stringify(user);
            user.first_name = data.first_name;
            user.last_name = data.last_name;
            user.email = data.email;
            user.role_id = Number(data.role_id);
            user.manager_id = data.manager_id ? Number(data.manager_id) : null;
            user.department_id = Number(data.department_id);
            user.designation = data.designation;
            user.profile_photo = data.profile_photo !== undefined ? data.profile_photo : user.profile_photo;
            
            this.logAction(actorUserId, 'UPDATE', 'users', userId, oldVal, JSON.stringify(user));
            this.save();
            return user;
        }

        toggleUserStatus(actorUserId, userId) {
            const users = this.getTable('users');
            const user = users.find(u => u.user_id === Number(userId));
            if (user) {
                const roles = this.getTable('roles');
                const targetRoleObj = roles.find(r => r.role_id === user.role_id) || {};
                const actorObj = users.find(u => u.user_id === Number(actorUserId)) || {};
                const actorRoleObj = roles.find(r => r.role_id === actorObj.role_id) || {};

                if (targetRoleObj.role_level === 5) {
                    throw new Error("Admin profiles cannot be toggled to inactive.");
                }

                if (actorRoleObj.role_level !== 5 && actorRoleObj.role_level !== 3) {
                    throw new Error("You do not have permission to toggle employee status.");
                }

                const oldStatus = user.status;
                user.status = user.status === 'Active' ? 'Inactive' : 'Active';
                this.logAction(actorUserId, 'UPDATE', 'users', userId, `status: ${oldStatus}`, `status: ${user.status}`);
                this.save();
            }
            return user;
        }

        deleteUser(actorUserId, userId) {
            const users = this.getTable('users');
            const idx = users.findIndex(u => u.user_id === Number(userId));
            if (idx !== -1) {
                const user = users[idx];
                const roles = this.getTable('roles');
                const targetRoleObj = roles.find(r => r.role_id === user.role_id) || {};
                const actorObj = users.find(u => u.user_id === Number(actorUserId)) || {};
                const actorRoleObj = roles.find(r => r.role_id === actorObj.role_id) || {};

                if (targetRoleObj.role_level === 5) {
                    throw new Error("Admin profiles cannot be deleted.");
                }

                if (actorRoleObj.role_level !== 5 && actorRoleObj.role_level !== 3) {
                    throw new Error("You do not have permission to delete employee profiles.");
                }

                users.splice(idx, 1);
                this.logAction(actorUserId, 'DELETE', 'users', userId, JSON.stringify(user), null);
                this.save();
            }
        }
    }

    // Export Terumo Database Simulator
    global.db = new TerumoDatabase();

})(window);
