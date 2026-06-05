// app.js - UI Logic and Wireframe Interactions for Terumo ReWandReC

document.addEventListener('DOMContentLoaded', () => {
    
    // --- APP STATE ---
    let currentUser = null;
    let currentView = 'dashboard';
    
    function getCurrentUserRoleLevel() {
        if (!currentUser) return 1;
        const roles = window.db.getTable('roles');
        const role = roles.find(r => r.role_id === currentUser.role_id);
        return role ? role.role_level : 1;
    }
    
    // Nomination Form State
    let selectedWizNominees = []; // For team nominations
    let uploadedWizFilename = 'project_report.pdf'; // Default mock file
    
    // Approvals View Filter
    let activeApprovalTab = 'pending'; // 'pending', 'approved', 'rejected'

    // Notifications View Filter
    let activeNotifTab = 'all'; // 'all', 'unread', 'nominations', 'approvals'

    // --- DOM ELEMENT REFERENCES ---
    const userRoleSelector = document.getElementById('user-role-selector');
    const currentUserAvatar = document.getElementById('current-user-avatar');
    const currentUserName = document.getElementById('current-user-name');
    const currentUserRoleText = document.getElementById('current-user-role');
    
    const navItems = document.querySelectorAll('.nav-item');
    const viewPanels = document.querySelectorAll('.view-panel');
    
    // Dashboards
    const employeeDashboard = document.getElementById('employee-dashboard');
    const managerHrDashboard = document.getElementById('manager-hr-dashboard');
    
    // Sidebar dynamic badge targets
    const navApprovalsCount = document.getElementById('nav-approvals-count');
    const navNotifCount = document.getElementById('nav-notif-count');
    const bellBadge = document.getElementById('bell-badge');
    const toastContainer = document.getElementById('toast-container');

    // --- INITIALIZATION ---
    function init() {
        populateUserSelector();
        setupNavigation();
        setupRoleSwitcher();
        setupNominationFormEvents();
        setupAIEnhancer();
        setupApprovalsTabs();
        setupNotificationsTabs();
        setupDirectoryFilters();
        setupGlobalSearch();
        setupFormResetActions();
        setupAdminFormEvents();
        setupLoginAction();
        
        // Reset DB system trigger
        const btnResetDB = document.getElementById('btn-db-reset-system');
        if (btnResetDB) {
            btnResetDB.addEventListener('click', () => {
                if (confirm("Are you sure you want to reset the system database? All custom modifications, records, and nominations will be cleared.")) {
                    window.db.reset();
                    window.location.reload();
                }
            });
        }
        
        // Initialize particle animation on login pane background
        initParticlesConstellation();

        // Log in Vivek Sharma (EMP001 - Employee) by default
        logInUser(1, true);
    }

    // Populate the User Switcher dropdown
    function populateUserSelector() {
        const users = window.db.getTable('users');
        const roles = window.db.getTable('roles');
        
        userRoleSelector.innerHTML = '';
        users.forEach(u => {
            const role = roles.find(r => r.role_id === u.role_id) || {};
            const opt = document.createElement('option');
            opt.value = u.user_id;
            opt.textContent = `${u.first_name} ${u.last_name} (${role.role_name})`;
            userRoleSelector.appendChild(opt);
        });
    }

    // Handle session logging and display panels
    function logInUser(userId, isInitial = false) {
        const users = window.db.getTable('users');
        const roles = window.db.getTable('roles');
        
        const user = users.find(u => u.user_id === Number(userId));
        if (!user) return;
        
        currentUser = user;
        userRoleSelector.value = userId;
        
        // Set profile details
        currentUserAvatar.textContent = `${user.first_name[0]}${user.last_name[0]}`;
        currentUserName.textContent = `${user.first_name} ${user.last_name}`;
        
        const role = roles.find(r => r.role_id === user.role_id) || {};
        currentUserRoleText.textContent = user.designation;
        
        // Sidebar configurations based on roles levels (Restricted access control)
        const navItemsMap = {
            dashboard: document.querySelector('[data-view="dashboard"]'),
            nominations: document.querySelector('[data-view="nominations"]'),
            approvals: document.getElementById('nav-approvals'),
            reports: document.querySelector('[data-view="reports"]'),
            employees: document.querySelector('[data-view="employees"]'),
            notifications: document.querySelector('[data-view="notifications"]'),
            audit: document.getElementById('nav-audit'),
            settings: document.querySelector('[data-view="settings"]')
        };

        // Hide all sidebar links first
        Object.keys(navItemsMap).forEach(key => {
            if (navItemsMap[key]) navItemsMap[key].style.display = 'none';
        });

        // Define exact allowed views per level (Strict access control)
        const accessByLevel = {
            1: ['dashboard', 'nominations', 'notifications'], // Employee
            2: ['dashboard', 'nominations', 'approvals', 'notifications'], // Manager
            3: ['dashboard', 'approvals', 'reports', 'employees', 'notifications', 'audit'], // HR Manager
            4: ['dashboard', 'nominations', 'approvals', 'notifications', 'settings'], // Leadership
            5: ['dashboard', 'employees', 'audit', 'settings'] // Admin
        };

        const allowedViews = accessByLevel[role.role_level] || ['dashboard'];
        allowedViews.forEach(view => {
            if (navItemsMap[view]) navItemsMap[view].style.display = 'block';
        });

        // If the current view is not allowed for the new role, automatically revert to dashboard
        if (!allowedViews.includes(currentView)) {
            switchView('dashboard');
        }
        
        // Toggle dashboard layout
        const adminDashboard = document.getElementById('admin-dashboard');
        employeeDashboard.style.display = 'none';
        managerHrDashboard.style.display = 'none';
        if (adminDashboard) adminDashboard.style.display = 'none';

        if (role.role_level === 1) {
            employeeDashboard.style.display = 'block';
        } else if (role.role_level === 5) {
            if (adminDashboard) adminDashboard.style.display = 'block';
        } else {
            managerHrDashboard.style.display = 'block';
        }
        
        // Hide login page with transition
        if (!isInitial) {
            const loginContainer = document.getElementById('login-container');
            if (loginContainer) {
                loginContainer.classList.remove('active');
            }
        }
        
        // Refresh alerts, badges, counters
        updateBadgeCounts();
        
        // Render current window view
        renderCurrentView();
    }

    function setupRoleSwitcher() {
        userRoleSelector.addEventListener('change', (e) => {
            logInUser(e.target.value);
            showToast(`Logged in as ${currentUser.first_name} ${currentUser.last_name}`, 'success');
        });
    }

    // --- SIDEBAR SWITCH NAVIGATION ---
    function setupNavigation() {
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const view = item.getAttribute('data-view');
                switchView(view);
            });
        });

        // Quick self nominate button inside Employee Workspace
        document.getElementById('btn-dashboard-self-nominate').addEventListener('click', () => {
            switchView('nominations');
            // Preset to self-nomination type
            document.getElementById('wiz-type-self').checked = true;
            toggleNominationTypeUI('Self');
        });
    }

    function switchView(viewName) {
        currentView = viewName;
        
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.value = '';
        }

        navItems.forEach(item => {
            if (item.getAttribute('data-view') === viewName) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
        
        viewPanels.forEach(panel => {
            if (panel.id === `${viewName}-view`) {
                panel.classList.add('active');
            } else {
                panel.classList.remove('active');
            }
        });
        
        renderCurrentView();
    }

    // Refresh dynamic lists and queries
    function renderCurrentView() {
        updateBadgeCounts();

        if (currentView === 'dashboard') {
            renderDashboardData();
        } else if (currentView === 'nominations') {
            loadNominationFormContext();
        } else if (currentView === 'approvals') {
            renderApprovalsData();
        } else if (currentView === 'reports') {
            renderReportsData();
        } else if (currentView === 'employees') {
            renderDirectoryData();
        } else if (currentView === 'notifications') {
            renderNotificationsData();
        } else if (currentView === 'audit') {
            renderAuditLogsData();
        }
    }

    // --- DYNAMIC BADGE & TIMELINE ALERT UPDATES ---
    function updateBadgeCounts() {
        const approvals = window.db.getPendingApprovals().filter(a => a.approver_id === currentUser.user_id);
        const notifications = window.db.getTable('notifications').filter(n => n.user_id === currentUser.user_id && !n.is_read);
        
        // Approvals badge
        if (approvals.length > 0) {
            navApprovalsCount.textContent = approvals.length;
            navApprovalsCount.style.display = 'inline-block';
        } else {
            navApprovalsCount.style.display = 'none';
        }

        // Notifications sidebar and header badge
        if (notifications.length > 0) {
            navNotifCount.textContent = notifications.length;
            navNotifCount.style.display = 'inline-block';
            bellBadge.textContent = notifications.length;
            bellBadge.style.display = 'flex';
        } else {
            navNotifCount.style.display = 'none';
            bellBadge.style.display = 'none';
        }

        // Trigger bell ring animation
        const bellBtn = document.getElementById('bell-btn');
        if (bellBtn && notifications.length > 0) {
            bellBtn.classList.remove('ring-bell');
            void bellBtn.offsetWidth; // Trigger reflow
            bellBtn.classList.add('ring-bell');
        } else if (bellBtn) {
            bellBtn.classList.remove('ring-bell');
        }
    }

    // --- VIEW A: DASHBOARDS DATA ---
    function renderDashboardData() {
        const roleLevel = getCurrentUserRoleLevel();
        
        if (roleLevel === 1) { // EMPLOYEE WORKSPACE
            const totalEarned = window.db.getEmployeeTotalEarned(currentUser.user_id);
            const history = window.db.getEmployeeAwardHistory(currentUser.user_id);
            const nominations = window.db.getTable('nominations').filter(n => n.nominated_by === currentUser.user_id && n.nomination_type === 'Self');
            
            animateCountUp(document.getElementById('emp-total-rewards'), totalEarned, '₹');
            animateCountUp(document.getElementById('emp-awards-count'), history.length);
            animateCountUp(document.getElementById('emp-nominations-count'), nominations.length);
            
            // Build premium history cards grid (Wireframe 7 Layout Card Hover)
            const historyCards = document.getElementById('emp-history-cards');
            if (historyCards) {
                historyCards.innerHTML = '';
                if (history.length === 0) {
                    historyCards.innerHTML = `<div class="text-center text-secondary" style="grid-column: 1 / -1; padding: 2rem;">No awards won yet. Ask your manager to nominate you!</div>`;
                } else {
                    history.forEach((h, idx) => {
                        const card = document.createElement('div');
                        card.className = 'award-history-card reveal-row';
                        card.style.animationDelay = `${idx * 0.08}s`;
                        
                        const awardDate = new Date(h.awarded_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
                        const valText = h.reward_type === 'Recognition' ? 'Recognition Seal' : `₹${h.reward_amount.toLocaleString()}`;
                        
                        const iconClass = h.reward_type === 'Recognition' ? 'success' : 'primary';
                        const iconEl = h.reward_type === 'Recognition' ? '<i class="fa-solid fa-crown"></i>' : '<i class="fa-solid fa-trophy"></i>';
                        
                        card.innerHTML = `
                            <div class="award-card-icon ${iconClass}">
                                ${iconEl}
                            </div>
                            <div class="award-card-title">${escapeHTML(h.title)}</div>
                            <div class="award-card-value">${valText}</div>
                            <div class="award-card-date">
                                <i class="fa-solid fa-calendar-days"></i> ${awardDate}
                            </div>
                            <div class="award-card-nominator">
                                Nominated by: <strong>${escapeHTML(h.refer_by)}</strong>
                            </div>
                            <button class="btn btn-outline btn-sm view-cert-btn" style="margin-top: 1rem; width: 100%; justify-content: center;" data-recipient="${escapeHTML(currentUser.first_name + ' ' + currentUser.last_name)}" data-award="${escapeHTML(h.title)}" data-date="${awardDate}">
                                <i class="fa-solid fa-certificate"></i> View Certificate
                            </button>
                        `;
                        historyCards.appendChild(card);
                    });
                    
                    historyCards.querySelectorAll('.view-cert-btn').forEach(btn => {
                        btn.addEventListener('click', () => {
                            const rec = btn.getAttribute('data-recipient');
                            const awd = btn.getAttribute('data-award');
                            const dt = btn.getAttribute('data-date');
                            showCertificateModal(rec, awd, dt);
                        });
                    });
                }
            }
        } else if (roleLevel === 5) { // ADMIN WORKSPACE
            const users = window.db.getTable('users');
            const values = window.db.getTable('core_values');
            const competencies = window.db.getTable('competencies');
            const audits = window.db.getTable('audit_logs');

            document.getElementById('admin-stats-users').textContent = users.length;
            document.getElementById('admin-stats-values').textContent = values.filter(v => v.status === 'Active').length;
            document.getElementById('admin-stats-competencies').textContent = competencies.filter(c => c.status === 'Active').length;
            document.getElementById('admin-stats-audits').textContent = audits.length;

            renderAdminValuesTable(values);
            renderAdminCompetenciesTable(competencies);
            renderAdminAwardsTable();
        } else { // MANAGER / HR / LEADERSHIP WORKSPACE
            const nominations = window.db.getTable('nominations');
            const approvals = window.db.getTable('approvals');
            const winners = window.db.getTable('winners');
            const budgets = window.db.getAwardsBudgets();
            
            const totalNominationsCount = nominations.length;
            const pendingHRCount = approvals.filter(a => (a.level_id === 1 || a.level_id === 3) && a.status === 'Pending').length;
            const pendingLdrCount = approvals.filter(a => a.level_id === 2 && a.status === 'Pending').length;
            const winnersCount = winners.filter(w => w.is_announced).length;
            
            const totalRemainingBudget = budgets.reduce((sum, b) => sum + b.remaining_budget, 0);
            
            animateCountUp(document.getElementById('mgr-total-nominations'), totalNominationsCount);
            animateCountUp(document.getElementById('mgr-pending-hr'), pendingHRCount);
            animateCountUp(document.getElementById('mgr-pending-leadership'), pendingLdrCount);
            animateCountUp(document.getElementById('mgr-approved-winners'), winnersCount);
            animateCountUp(document.getElementById('mgr-remaining-budget'), totalRemainingBudget, '₹');
            
            // Build recent nominations list (Wireframe 1)
            const recentTable = document.getElementById('mgr-recent-table');
            recentTable.innerHTML = '';
            
            const users = window.db.getTable('users');
            const awards = window.db.getTable('awards');
            const recentNominations = [...nominations].sort((a,b) => new Date(b.submission_date) - new Date(a.submission_date)).slice(0, 5);
            
            if (recentNominations.length === 0) {
                recentTable.innerHTML = `<tr><td colspan="5" class="text-center text-secondary">No submissions recorded.</td></tr>`;
            } else {
                recentNominations.forEach((n, idx) => {
                    const nomineeLinks = window.db.getTable('nomination_nominees').filter(nn => nn.nomination_id === n.nomination_id);
                    const nomineeNames = nomineeLinks.map(link => {
                        const u = users.find(user => user.user_id === link.user_id);
                        return u ? `${u.first_name} ${u.last_name}` : 'Unknown';
                    }).join(', ');
                    
                    const award = awards.find(a => a.award_id === n.award_id) || {};
                    const dateSub = new Date(n.submission_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
                    
                    const tr = document.createElement('tr');
                    tr.className = 'reveal-row';
                    tr.style.animationDelay = `${idx * 0.08}s`;
                    tr.innerHTML = `
                        <td class="font-bold">${escapeHTML(nomineeNames)}</td>
                        <td>${escapeHTML(award.title)}</td>
                        <td><span class="badge ${getNomStatusBadgeClass(n.status)}">${n.status}</span></td>
                        <td>${dateSub}</td>
                        <td class="text-right">
                            <button class="btn btn-outline btn-sm view-nom-detail-btn" data-id="${n.nomination_id}">
                                <i class="fa-solid fa-eye"></i> View
                            </button>
                        </td>
                    `;
                    recentTable.appendChild(tr);
                });
                
                recentTable.querySelectorAll('.view-nom-detail-btn').forEach(btn => {
                    btn.addEventListener('click', () => {
                        showNominationReviewModal(btn.getAttribute('data-id'), false);
                    });
                });
            }

            // Update Donut Chart Percentages & Conic Gradient Dynamically
            const countApproved = nominations.filter(n => n.status === 'Approved').length;
            const countPendingMgr = nominations.filter(n => n.status === 'Pending' && n.current_level === 0).length;
            const countPendingHR = nominations.filter(n => n.status === 'Pending' && n.current_level === 1).length;
            const countPendingLdr = nominations.filter(n => n.status === 'Pending' && n.current_level === 2).length;
            const countRejected = nominations.filter(n => n.status === 'Rejected').length;
            
            const total = totalNominationsCount || 1;
            
            const pctApproved = (countApproved / total) * 100;
            const pctPendingMgr = (countPendingMgr / total) * 100;
            const pctPendingHR = (countPendingHR / total) * 100;
            const pctPendingLdr = (countPendingLdr / total) * 100;
            const pctRejected = (countRejected / total) * 100;

            document.getElementById('donut-total-val').textContent = totalNominationsCount;
            
            const donutGraphic = document.querySelector('.donut-graphic');
            if (donutGraphic) {
                donutGraphic.style.background = `conic-gradient(
                    var(--color-primary) 0% ${pctApproved}%,
                    #a855f7 ${pctApproved}% ${pctApproved + pctPendingMgr}%,
                    #3b82f6 ${pctApproved + pctPendingMgr}% ${pctApproved + pctPendingMgr + pctPendingHR}%,
                    var(--color-warning) ${pctApproved + pctPendingMgr + pctPendingHR}% ${pctApproved + pctPendingMgr + pctPendingHR + pctPendingLdr}%,
                    var(--color-danger) ${pctApproved + pctPendingMgr + pctPendingHR + pctPendingLdr}% 100%
                )`;
            }

            const donutLegend = document.querySelector('.donut-legend');
            if (donutLegend) {
                donutLegend.innerHTML = `
                    <li class="donut-legend-item">
                        <span class="donut-dot" style="background: var(--color-primary);"></span>
                        Approved: <strong>${countApproved}</strong> (${pctApproved.toFixed(0)}%)
                    </li>
                    <li class="donut-legend-item">
                        <span class="donut-dot" style="background: #a855f7;"></span>
                        Pending Manager: <strong>${countPendingMgr}</strong> (${pctPendingMgr.toFixed(0)}%)
                    </li>
                    <li class="donut-legend-item">
                        <span class="donut-dot" style="background: #3b82f6;"></span>
                        Pending HR: <strong>${countPendingHR}</strong> (${pctPendingHR.toFixed(0)}%)
                    </li>
                    <li class="donut-legend-item">
                        <span class="donut-dot" style="background: var(--color-warning);"></span>
                        Pending Leadership: <strong>${countPendingLdr}</strong> (${pctPendingLdr.toFixed(0)}%)
                    </li>
                    <li class="donut-legend-item">
                        <span class="donut-dot" style="background: var(--color-danger);"></span>
                        Rejected: <strong>${countRejected}</strong> (${pctRejected.toFixed(0)}%)
                    </li>
                `;
            }

            // Toggle and render Leadership insights if role level === 4 (Leadership)
            const roleObj = window.db.getTable('roles').find(r => r.role_id === currentUser.role_id) || {};
            const roleLevel = roleObj.role_level;
            const leadershipCard = document.getElementById('leadership-analytics-card');
            
            if (leadershipCard) {
                if (roleLevel === 4) {
                    leadershipCard.style.display = 'block';
                    
                    // --- 1. Program Breakdown stacked bar chart ---
                    const programChartWrapper = document.getElementById('program-bar-chart');
                    if (programChartWrapper) {
                        programChartWrapper.innerHTML = '';
                        const activeAwards = window.db.getTable('awards');
                        
                        activeAwards.forEach(award => {
                            const awardNoms = nominations.filter(n => n.award_id === award.award_id);
                            const totalNoms = awardNoms.length;
                            
                            if (totalNoms === 0) return;
                            
                            const app = awardNoms.filter(n => n.status === 'Approved').length;
                            const pm = awardNoms.filter(n => n.status === 'Pending' && n.current_level === 0).length;
                            const ph = awardNoms.filter(n => n.status === 'Pending' && n.current_level === 1).length;
                            const pl = awardNoms.filter(n => n.status === 'Pending' && n.current_level === 2).length;
                            const rej = awardNoms.filter(n => n.status === 'Rejected').length;
                            
                            const appPct = (app / totalNoms) * 100;
                            const pmPct = (pm / totalNoms) * 100;
                            const phPct = (ph / totalNoms) * 100;
                            const plPct = (pl / totalNoms) * 100;
                            const rejPct = (rej / totalNoms) * 100;
                            
                            const row = document.createElement('div');
                            row.className = 'bar-chart-row';
                            row.innerHTML = `
                                <div class="bar-chart-info">
                                    <span class="bar-chart-label">${escapeHTML(award.title)}</span>
                                    <span class="bar-chart-value"><strong>${totalNoms}</strong> nominations</span>
                                </div>
                                <div class="bar-track">
                                    ${app > 0 ? `<div class="bar-segment approved" style="width: ${appPct}%;" title="Approved: ${app}"></div>` : ''}
                                    ${pm > 0 ? `<div class="bar-segment pending-mgr" style="width: ${pmPct}%;" title="Pending Manager: ${pm}"></div>` : ''}
                                    ${ph > 0 ? `<div class="bar-segment pending-hr" style="width: ${phPct}%;" title="Pending HR: ${ph}"></div>` : ''}
                                    ${pl > 0 ? `<div class="bar-segment pending-ldr" style="width: ${plPct}%;" title="Pending Leadership: ${pl}"></div>` : ''}
                                    ${rej > 0 ? `<div class="bar-segment rejected" style="width: ${rejPct}%;" title="Rejected: ${rej}"></div>` : ''}
                                </div>
                            `;
                            programChartWrapper.appendChild(row);
                        });
                        
                        if (programChartWrapper.children.length === 0) {
                            programChartWrapper.innerHTML = '<div style="font-size:0.8rem; color:var(--text-muted); text-align:center; padding:1rem;">No program data available.</div>';
                        }
                    }

                    // --- 2. Department Distribution stacked bar chart ---
                    const deptChartWrapper = document.getElementById('dept-bar-chart');
                    if (deptChartWrapper) {
                        deptChartWrapper.innerHTML = '';
                        const departments = window.db.getTable('departments');
                        const users = window.db.getTable('users');
                        const nomineeLinks = window.db.getTable('nomination_nominees');
                        
                        departments.forEach(dept => {
                            const deptUserIds = users.filter(u => u.department_id === dept.department_id).map(u => u.user_id);
                            const deptNominationIds = nomineeLinks
                                .filter(link => deptUserIds.includes(link.user_id))
                                .map(link => link.nomination_id);
                            
                            const uniqueDeptNominationIds = [...new Set(deptNominationIds)];
                            const deptNoms = nominations.filter(n => uniqueDeptNominationIds.includes(n.nomination_id));
                            const totalNoms = deptNoms.length;
                            
                            if (totalNoms === 0) return;
                            
                            const app = deptNoms.filter(n => n.status === 'Approved').length;
                            const pm = deptNoms.filter(n => n.status === 'Pending' && n.current_level === 0).length;
                            const ph = deptNoms.filter(n => n.status === 'Pending' && n.current_level === 1).length;
                            const pl = deptNoms.filter(n => n.status === 'Pending' && n.current_level === 2).length;
                            const rej = deptNoms.filter(n => n.status === 'Rejected').length;
                            
                            const appPct = (app / totalNoms) * 100;
                            const pmPct = (pm / totalNoms) * 100;
                            const phPct = (ph / totalNoms) * 100;
                            const plPct = (pl / totalNoms) * 100;
                            const rejPct = (rej / totalNoms) * 100;
                            
                            const row = document.createElement('div');
                            row.className = 'bar-chart-row';
                            row.innerHTML = `
                                <div class="bar-chart-info">
                                    <span class="bar-chart-label">${escapeHTML(dept.department_name)}</span>
                                    <span class="bar-chart-value"><strong>${totalNoms}</strong> nominations</span>
                                </div>
                                <div class="bar-track">
                                    ${app > 0 ? `<div class="bar-segment approved" style="width: ${appPct}%;" title="Approved: ${app}"></div>` : ''}
                                    ${pm > 0 ? `<div class="bar-segment pending-mgr" style="width: ${pmPct}%;" title="Pending Manager: ${pm}"></div>` : ''}
                                    ${ph > 0 ? `<div class="bar-segment pending-hr" style="width: ${phPct}%;" title="Pending HR: ${ph}"></div>` : ''}
                                    ${pl > 0 ? `<div class="bar-segment pending-ldr" style="width: ${plPct}%;" title="Pending Leadership: ${pl}"></div>` : ''}
                                    ${rej > 0 ? `<div class="bar-segment rejected" style="width: ${rejPct}%;" title="Rejected: ${rej}"></div>` : ''}
                                </div>
                            `;
                            deptChartWrapper.appendChild(row);
                        });
                        
                        if (deptChartWrapper.children.length === 0) {
                            deptChartWrapper.innerHTML = '<div style="font-size:0.8rem; color:var(--text-muted); text-align:center; padding:1rem;">No department data available.</div>';
                        }
                    }
                } else {
                    leadershipCard.style.display = 'none';
                }
            }
        }
    }

    // --- VIEW B: NOMINATION FORM SUBMISSION (Wireframe 2) ---
    function loadNominationFormContext() {
        const users = window.db.getTable('users');
        const awards = window.db.getTable('awards');
        const coreValues = window.db.getTable('core_values');
        const competencies = window.db.getTable('competencies');
        const roleLevel = getCurrentUserRoleLevel();

        // Populates Employee List dropdown
        const empSelect = document.getElementById('wiz-select-employee');
        empSelect.innerHTML = '<option value="">-- Choose Employee --</option>';
        users.forEach(u => {
            const uRole = window.db.getTable('roles').find(r => r.role_id === u.role_id) || {};
            if (uRole.role_level === 5) {
                return; // Skip Admin from nomination select
            }
            if (roleLevel === 2 && uRole.role_level !== 1) {
                return; // Managers can only nominate Employees (role level 1)
            }
            if (roleLevel < 4 && uRole.role_level === 3) {
                return; // Skip HR users from non-leadership nominators
            }
            const opt = document.createElement('option');
            opt.value = u.user_id;
            opt.textContent = `${u.first_name} ${u.last_name} (${u.employee_code})`;
            empSelect.appendChild(opt);
        });

        // Populates active program dropdown
        const awardSelect = document.getElementById('wiz-select-award');
        awardSelect.innerHTML = '<option value="">-- Choose Award Program --</option>';
        
        const activeAwards = awards.filter(a => {
            const isActive = (a.status || 'Active') === 'Active';
            if (roleLevel === 1) {
                // Employees can only self-nominate for programs that allow it
                return isActive && a.allow_self_nomination;
            }
            return isActive;
        });

        activeAwards.forEach(a => {
            const opt = document.createElement('option');
            opt.value = a.award_id;
            opt.textContent = a.title;
            awardSelect.appendChild(opt);
        });

        // Populates Core Values Checklist (Active only)
        const valuesBox = document.getElementById('wiz-core-values-checklist');
        valuesBox.innerHTML = '';
        coreValues.filter(v => v.status === 'Active').forEach(v => {
            const lbl = document.createElement('label');
            lbl.className = 'check-label';
            lbl.innerHTML = `<input type="checkbox" name="wiz_values" value="${v.core_value_id}"> ${v.value_name}`;
            valuesBox.appendChild(lbl);
        });

        // Populates Competencies Checklist (Active only)
        const compBox = document.getElementById('wiz-competencies-checklist');
        compBox.innerHTML = '';
        competencies.filter(c => c.status === 'Active').forEach(c => {
            const lbl = document.createElement('label');
            lbl.className = 'check-label';
            lbl.innerHTML = `<input type="checkbox" name="wiz_competencies" value="${c.competency_id}"> ${c.competency_name}`;
            compBox.appendChild(lbl);
        });

        // Clear team nominations state
        selectedWizNominees = [];
        document.getElementById('wiz-team-chips-box').style.display = 'none';
        document.getElementById('wiz-team-chips-box').innerHTML = '';
        document.getElementById('lbl-select-employee').textContent = 'Select Employee *';

        // Check active role to disable or restrict selectors
        const selfRadio = document.getElementById('wiz-type-self');
        const mgrRadio = document.getElementById('wiz-type-mgr');
        const ldrRadio = document.getElementById('wiz-type-ldr');
        
        const selfParentLabel = selfRadio ? selfRadio.closest('.check-label') : null;
        const mgrParentLabel = mgrRadio ? mgrRadio.closest('.check-label') : null;
        const ldrParentLabel = ldrRadio ? ldrRadio.closest('.check-label') : null;

        const catIndiv = document.getElementById('wiz-cat-indiv');
        const catTeam = document.getElementById('wiz-cat-team');

        if (roleLevel === 1) { // Employee: STRICT RESTRICTIONS TO SELF NOMINATION ONLY
            // 1. Force Category to Individual
            catIndiv.checked = true;
            catTeam.disabled = true;
            
            // 2. Force Nomination Type to Self
            selfRadio.checked = true;
            selfRadio.disabled = false;
            if (selfParentLabel) selfParentLabel.style.display = 'flex';
            
            mgrRadio.disabled = true;
            ldrRadio.disabled = true;
            
            // Hide the entire Category/Type options row for Employee self-nominations
            const selectorsRow = document.getElementById('wiz-selectors-row');
            if (selectorsRow) selectorsRow.style.display = 'none';
            
            // Limit nominee selection
            toggleNominationTypeUI('Self');
        } else {
            // Manager/HR/Leadership cannot Self Nominate
            selfRadio.checked = false;
            selfRadio.disabled = true;
            if (selfParentLabel) selfParentLabel.style.display = 'none';
            
            mgrRadio.disabled = false;
            ldrRadio.disabled = false;
            catTeam.disabled = false;
            
            // Show the options row for non-employee nomination flows
            const selectorsRow = document.getElementById('wiz-selectors-row');
            if (selectorsRow) selectorsRow.style.display = 'grid';
            
            if (roleLevel === 4) {
                ldrRadio.checked = true;
                toggleNominationTypeUI('Leadership');
            } else {
                mgrRadio.checked = true;
                toggleNominationTypeUI('Manager');
            }
        }
    }

    function setupNominationFormEvents() {
        // Toggle Category change (Individual vs Team)
        document.getElementById('wiz-cat-indiv').addEventListener('click', () => {
            document.getElementById('wiz-team-chips-box').style.display = 'none';
            document.getElementById('lbl-select-employee').textContent = 'Select Employee *';
            selectedWizNominees = [];
        });

        document.getElementById('wiz-cat-team').addEventListener('click', () => {
            document.getElementById('wiz-team-chips-box').style.display = 'flex';
            document.getElementById('lbl-select-employee').textContent = 'Add Team Member *';
            selectedWizNominees = [];
            document.getElementById('wiz-team-chips-box').innerHTML = '';
        });

        // Dynamic multi-nominees selection list for teams
        document.getElementById('wiz-select-employee').addEventListener('change', (e) => {
            const val = e.target.value;
            if (!val) return;
            
            const isTeam = document.getElementById('wiz-cat-team').checked;
            
            if (isTeam) {
                const uId = Number(val);
                if (!selectedWizNominees.includes(uId)) {
                    selectedWizNominees.push(uId);
                    
                    const uObj = window.db.getTable('users').find(u => u.user_id === uId);
                    const badge = document.createElement('span');
                    badge.className = 'badge info cursor-pointer';
                    badge.style.padding = '0.4rem 0.8rem';
                    badge.innerHTML = `${escapeHTML(uObj.first_name + ' ' + uObj.last_name)} &times;`;
                    badge.addEventListener('click', () => {
                        selectedWizNominees = selectedWizNominees.filter(id => id !== uId);
                        badge.remove();
                    });
                    document.getElementById('wiz-team-chips-box').appendChild(badge);
                }
                document.getElementById('wiz-select-employee').value = '';
            }
        });

        // Toggle Type change (Self vs Manager vs Leadership)
        document.querySelectorAll('input[name="wiz_type"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                toggleNominationTypeUI(e.target.value);
            });
        });

        // File Uploader Click Setup
        const fileBox = document.getElementById('wiz-file-uploader-box');
        const fileInput = document.getElementById('wiz-hidden-file');
        
        fileBox.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                uploadedWizFilename = e.target.files[0].name;
                document.getElementById('wiz-upload-filename-text').innerHTML = `<i class="fa-solid fa-file-pdf" style="color:var(--color-accent-red);"></i> Selected: <strong class="font-bold">${escapeHTML(uploadedWizFilename)}</strong>`;
            }
        });

        // Submit form handler
        document.getElementById('nomination-form-wizard').addEventListener('submit', (e) => {
            e.preventDefault();
            submitNominationForm();
        });
    }

    function setupAIEnhancer() {
        const btnReason = document.getElementById('btn-ai-enhance-reason');
        const btnOutcome = document.getElementById('btn-ai-enhance-outcome');
        
        if (btnReason) {
            btnReason.addEventListener('click', () => {
                const textarea = document.getElementById('wiz-reason');
                const text = textarea.value.trim();
                if (!text) {
                    showToast('Please type a draft reason first so the AI can enhance it!', 'warning');
                    return;
                }
                
                // Disable button and show spinner loading indicator
                btnReason.disabled = true;
                const originalHTML = btnReason.innerHTML;
                btnReason.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Polishing draft...';
                
                setTimeout(() => {
                    const enhanced = enhanceReasonText(text);
                    textarea.value = enhanced;
                    
                    // Restore button
                    btnReason.disabled = false;
                    btnReason.innerHTML = originalHTML;
                    
                    showToast('AI successfully polished and enhanced your nomination reason!', 'success');
                    triggerConfettiExplosion();
                }, 1200);
            });
        }
        
        if (btnOutcome) {
            btnOutcome.addEventListener('click', () => {
                const outcomeInput = document.getElementById('wiz-outcome');
                const metricInput = document.getElementById('wiz-metric');
                
                const outcomeText = outcomeInput.value.trim();
                const metricText = metricInput.value.trim();
                
                if (!outcomeText && !metricText) {
                    showToast('Please enter an outcome or metric detail first so the AI can optimize it!', 'warning');
                    return;
                }
                
                btnOutcome.disabled = true;
                const originalHTML = btnOutcome.innerHTML;
                btnOutcome.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Optimizing achievements...';
                
                setTimeout(() => {
                    if (outcomeText) {
                        outcomeInput.value = enhanceOutcomeText(outcomeText);
                    }
                    if (metricText) {
                        metricInput.value = enhanceMetricText(metricText);
                    }
                    
                    btnOutcome.disabled = false;
                    btnOutcome.innerHTML = originalHTML;
                    
                    showToast('AI successfully optimized your achievement outcomes and metrics!', 'success');
                    triggerConfettiExplosion();
                }, 1200);
            });
        }
    }
    
    function enhanceReasonText(text) {
        const lower = text.toLowerCase();
        
        if (lower.includes('telemetry') || lower.includes('iot') || lower.includes('sensor')) {
            return "Demonstrated exceptional technical leadership and innovation in telemetry systems engineering. Successfully spearheaded the optimization of the data streaming pipeline, resolved critical communication latency bottlenecks, and enhanced real-time sensor monitoring reliability by 40%.";
        }
        if (lower.includes('innovat') || lower.includes('new') || lower.includes('built') || lower.includes('design')) {
            return "Exhibited outstanding technical vision and agility by design-thinking and architecting a novel automated module. This contribution significantly accelerated project delivery pipelines, optimized code modularity, and established a high benchmark for operational excellence across the team.";
        }
        if (lower.includes('customer') || lower.includes('client') || lower.includes('hospital') || lower.includes('user')) {
            return "Championed customer and stakeholder success by resolving critical pain points and improving platform user experience. Directed vital client workshops, resulting in a dramatic increase in system satisfaction scores and securing long-term operational partnerships.";
        }
        if (lower.includes('team') || lower.includes('collab') || lower.includes('help') || lower.includes('support')) {
            return "Fostered a highly collaborative team environment, consistently providing cross-functional support and mentoring peers. Seamlessly coordinated across department divisions to streamline integration schedules and ensure successful product deployment.";
        }
        if (lower.includes('save') || lower.includes('speed') || lower.includes('time') || lower.includes('hours')) {
            return "Drove significant efficiency improvements by identifying and automating repetitive manual workflows. Optimized core processing pipelines, leading to a massive reduction in operational cycle time and saving substantial weekly engineering hours.";
        }
        
        return `Demonstrated exceptional professional dedication and capability in executing critical project assignments. Successfully polished processes to drive business value, showing great alignment with core company values: "${text.replace(/[.\s]+$/, '')}" - establishing a strong foundation for continued team success and innovation.`;
    }
    
    function enhanceOutcomeText(text) {
        const lower = text.toLowerCase();
        if (lower.includes('schedule') || lower.includes('time') || lower.includes('early') || lower.includes('ahead')) {
            return "Delivered all critical milestone modules significantly ahead of schedule, optimizing team velocity.";
        }
        if (lower.includes('deploy') || lower.includes('rollout') || lower.includes('launch')) {
            return "Successfully executed seamless system deployment with zero downtime, safeguarding hospital operations.";
        }
        if (lower.includes('bug') || lower.includes('fix') || lower.includes('error') || lower.includes('test')) {
            return "Engineered robust automated testing protocols, resulting in a zero-defect launch in production.";
        }
        return `Successfully completed and optimized the key milestone: "${text.replace(/[.\s]+$/, '')}", driving measurable quality improvement.`;
    }
    
    function enhanceMetricText(text) {
        const lower = text.toLowerCase();
        if (lower.includes('hour') || lower.includes('time') || lower.includes('saved')) {
            return "Saved 40+ engineering hours weekly, translating to a 35% reduction in manual regression cycles.";
        }
        if (lower.includes('%') || lower.includes('percent') || lower.includes('boost') || lower.includes('improv')) {
            const matches = text.match(/\d+/);
            const pct = matches ? matches[0] : "40";
            return `Generated a validated ${pct}% efficiency boost in core transaction speeds and system throughput.`;
        }
        if (lower.includes('cost') || lower.includes('budget') || lower.includes('money')) {
            return "Reduced project operational overhead and infrastructure resource usage by 15% under budget.";
        }
        return `Achieved a validated optimization metric: "${text.replace(/[.\s]+$/, '')}" against corporate baseline targets.`;
    }

    function toggleNominationTypeUI(type) {
        const empSelect = document.getElementById('wiz-select-employee');
        if (type === 'Self') {
            empSelect.value = currentUser.user_id;
            empSelect.disabled = true;
            
            // Force Individual Category for Self Nominations
            document.getElementById('wiz-cat-indiv').checked = true;
            document.getElementById('wiz-cat-team').disabled = true;
            document.getElementById('wiz-team-chips-box').style.display = 'none';
            document.getElementById('lbl-select-employee').textContent = 'Self-Nominated Employee *';
        } else {
            empSelect.disabled = false;
            empSelect.value = '';
            document.getElementById('wiz-cat-team').disabled = false;
        }
    }

    function submitNominationForm() {
        const category = document.querySelector('input[name="wiz_category"]:checked').value;
        const type = document.querySelector('input[name="wiz_type"]:checked').value;
        const awardId = document.getElementById('wiz-select-award').value;
        
        let nominees = [];
        if (category === 'Team') {
            nominees = [...selectedWizNominees];
        } else {
            nominees = [Number(document.getElementById('wiz-select-employee').value)];
        }

        const title = document.getElementById('wiz-title').value.trim();
        const reason = document.getElementById('wiz-reason').value.trim();
        const outcome = document.getElementById('wiz-outcome').value.trim();
        const metric = document.getElementById('wiz-metric').value.trim();

        // Check values
        const valuesChecks = document.querySelectorAll('input[name="wiz_values"]:checked');
        const values = Array.from(valuesChecks).map(el => Number(el.value));

        // Check competencies
        const compChecks = document.querySelectorAll('input[name="wiz_competencies"]:checked');
        const competencies = Array.from(compChecks).map(el => Number(el.value));

        // Validate Nominees list
        if (nominees.length === 0 || !nominees[0]) {
            showToast('Please specify at least one nominee.', 'error');
            return;
        }

        try {
            window.db.createNomination({
                nominated_by: currentUser.user_id,
                award_id: awardId,
                nomination_category: category,
                nomination_type: type,
                nominees: nominees,
                title: title,
                reason: reason,
                competencies: competencies,
                core_values: values,
                outcome_text: outcome,
                achievement_description: metric,
                attachment_name: uploadedWizFilename
            });

            // Reset inputs and fields
            document.getElementById('wiz-title').value = '';
            document.getElementById('wiz-reason').value = '';
            document.getElementById('wiz-outcome').value = '';
            document.getElementById('wiz-metric').value = '';
            document.querySelectorAll('input[name="wiz_values"]:checked').forEach(el => el.checked = false);
            document.querySelectorAll('input[name="wiz_competencies"]:checked').forEach(el => el.checked = false);
            selectedWizNominees = [];
            const selectedNomineesContainer = document.getElementById('wiz-selected-nominees-container');
            if (selectedNomineesContainer) selectedNomineesContainer.innerHTML = '';
            
            // Show custom success modal overlay and animate confetti
            openModal('nomination-success');
            triggerConfettiExplosion();
        } catch (err) {
            showToast(err.message, 'error');
        }
    }

    // --- VIEW C: APPROVALS & SIGN-OFFS (Wireframe 3 & 4) ---
    function setupApprovalsTabs() {
        const pendingTab = document.getElementById('tab-pending-signoffs');
        const approvedTab = document.getElementById('tab-approved-signoffs');
        const rejectedTab = document.getElementById('tab-rejected-signoffs');

        pendingTab.addEventListener('click', () => {
            toggleApprovalsTab('pending', pendingTab);
        });
        approvedTab.addEventListener('click', () => {
            toggleApprovalsTab('approved', approvedTab);
        });
        rejectedTab.addEventListener('click', () => {
            toggleApprovalsTab('rejected', rejectedTab);
        });
    }

    function toggleApprovalsTab(tabName, element) {
        activeApprovalTab = tabName;
        
        document.querySelectorAll('.tab-headers button').forEach(b => {
            if (b.id.startsWith('tab-')) b.classList.remove('active');
        });
        element.classList.add('active');
        
        renderApprovalsData();
    }

    function renderApprovalsData() {
        const approvals = window.db.getTable('approvals');
        const nominations = window.db.getTable('nominations');
        const users = window.db.getTable('users');
        const awards = window.db.getTable('awards');
        const roleLevel = getCurrentUserRoleLevel();
        
        // 1. Filter approvals assigned to current active user
        let userApprovals = approvals.filter(ap => ap.approver_id === currentUser.user_id);
        
        // 2. Filter approvals by Tab status selector
        let filteredApprovals = [];
        if (activeApprovalTab === 'pending') {
            filteredApprovals = userApprovals.filter(ap => ap.status === 'Pending');
        } else if (activeApprovalTab === 'approved') {
            filteredApprovals = userApprovals.filter(ap => ap.status === 'Approved');
        } else {
            filteredApprovals = userApprovals.filter(ap => ap.status === 'Rejected');
        }

        const searchInput = document.querySelector('.search-input');
        const searchVal = searchInput ? searchInput.value.trim().toLowerCase() : '';
        if (searchVal) {
            filteredApprovals = filteredApprovals.filter(app => {
                const nom = nominations.find(n => n.nomination_id === app.nomination_id) || {};
                const nomineeLinks = window.db.getTable('nomination_nominees').filter(nn => nn.nomination_id === nom.nomination_id);
                const nomineeNames = nomineeLinks.map(link => {
                    const u = users.find(user => user.user_id === link.user_id);
                    return u ? `${u.first_name} ${u.last_name}` : '';
                }).join(' ').toLowerCase();
                
                const nominator = users.find(u => u.user_id === nom.nominated_by) || {};
                const nominatorName = `${nominator.first_name} ${nominator.last_name}`.toLowerCase();
                
                const award = awards.find(a => a.award_id === nom.award_id) || {};
                const awardTitle = (award.title || '').toLowerCase();
                
                const category = (nom.nomination_category || '').toLowerCase();

                return nomineeNames.includes(searchVal) ||
                       nominatorName.includes(searchVal) ||
                       awardTitle.includes(searchVal) ||
                       category.includes(searchVal);
            });
        }

        // Fill headers count stats
        document.getElementById('count-pending-approvals').textContent = userApprovals.filter(ap => ap.status === 'Pending').length;
        document.getElementById('count-approved-approvals').textContent = userApprovals.filter(ap => ap.status === 'Approved').length;
        document.getElementById('count-rejected-approvals').textContent = userApprovals.filter(ap => ap.status === 'Rejected').length;

        // Render Table Rows
        const tbody = document.getElementById('approvals-table-body');
        tbody.innerHTML = '';
        
        if (filteredApprovals.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" class="text-center text-secondary">No matching workflow sign-offs.</td></tr>`;
            document.getElementById('leadership-decision-forward-panel').style.display = 'none';
        } else {
            filteredApprovals.forEach((app, idx) => {
                const nom = nominations.find(n => n.nomination_id === app.nomination_id) || {};
                const nomineeLinks = window.db.getTable('nomination_nominees').filter(nn => nn.nomination_id === nom.nomination_id);
                const nomineeNames = nomineeLinks.map(link => {
                    const u = users.find(user => user.user_id === link.user_id);
                    return u ? `${u.first_name} ${u.last_name}` : 'Unknown';
                }).join(', ');
                
                const nominator = users.find(u => u.user_id === nom.nominated_by) || {};
                const award = awards.find(a => a.award_id === nom.award_id) || {};
                const dateSub = new Date(nom.submission_date).toLocaleDateString();
                
                const tr = document.createElement('tr');
                tr.className = 'reveal-row';
                tr.style.animationDelay = `${idx * 0.08}s`;
                
                let actionBtnHTML = '';
                if (activeApprovalTab === 'pending') {
                    actionBtnHTML = `
                        <button class="btn btn-outline btn-sm review-approval-btn" data-id="${nom.nomination_id}" data-appid="${app.approval_id}">
                            <i class="fa-solid fa-square-check"></i> Review
                        </button>
                    `;
                } else {
                    actionBtnHTML = `
                        <button class="btn btn-secondary btn-sm review-approval-btn" data-id="${nom.nomination_id}" data-appid="${app.approval_id}">
                            <i class="fa-solid fa-eye"></i> Details
                        </button>
                    `;
                }

                tr.innerHTML = `
                    <td class="font-bold">${escapeHTML(nomineeNames)}</td>
                    <td>${escapeHTML(award.title)}</td>
                    <td>${escapeHTML(nominator.first_name + ' ' + nominator.last_name)}</td>
                    <td>${nom.nomination_category}</td>
                    <td><span class="badge info">${nom.nomination_type}</span></td>
                    <td>${dateSub}</td>
                    <td class="text-right">${actionBtnHTML}</td>
                `;
                tbody.appendChild(tr);
            });
            
            tbody.querySelectorAll('.review-approval-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const nomId = btn.getAttribute('data-id');
                    const isPending = activeApprovalTab === 'pending';
                    showNominationReviewModal(nomId, isPending);
                });
            });

            // If user is HR (level 3) and reviewing pending approvals, show the Batch Forwarding helper (Wireframe 3)
            if (roleLevel === 3 && activeApprovalTab === 'pending') {
                document.getElementById('leadership-decision-forward-panel').style.display = 'flex';
                document.getElementById('btn-forward-batch-leadership').onclick = () => {
                    showToast('Batch forwarding all verified HR entries to Leadership...', 'success');
                    filteredApprovals.forEach(app => {
                        window.db.submitApprovalAction(app.approval_id, currentUser.user_id, 'Approved', 'Validated by HR');
                    });
                    renderCurrentView();
                };
            } else {
                document.getElementById('leadership-decision-forward-panel').style.display = 'none';
            }
        }
    }

    // --- WORKFLOW DETAIL REVIEW PANEL ---
    function showNominationReviewModal(nominationId, allowDecisions = false) {
        const nomDetails = window.db.getNominationDetails(nominationId);
        if (!nomDetails) return;

        const body = document.getElementById('review-modal-body');
        const footer = document.getElementById('review-modal-footer');
        
        // Connect badge lists
        const valTags = nomDetails.core_values.map(v => `<span class="badge info">${v.value_name}</span>`).join(' ') || 'None';
        const compTags = nomDetails.competencies.map(c => `<span class="badge success">${c.competency_name}</span>`).join(' ') || 'None';
        
        const outcomeHTML = nomDetails.outcome.outcome_text
            ? `<div class="mb-4">
                   <strong>Project Outcome Summary:</strong>
                   <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.25rem;">${escapeHTML(nomDetails.outcome.outcome_text)}</p>
                   ${nomDetails.outcome.achievement_description ? `<p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.25rem;">Metric: ${escapeHTML(nomDetails.outcome.achievement_description)}</p>` : ''}
               </div>`
            : '';

        const attachmentHTML = nomDetails.attachment.file_name
            ? `<div class="mb-4">
                   <strong>Supporting Document:</strong>
                   <div style="display:flex; align-items:center; gap:0.5rem; font-size:0.85rem; margin-top:0.25rem;">
                       <i class="fa-solid fa-file-pdf" style="color:var(--color-accent-red); font-size:1.15rem;"></i>
                       <a href="#" style="color:var(--color-primary); font-weight:600; text-decoration:none;">${escapeHTML(nomDetails.attachment.file_name)}</a>
                   </div>
               </div>`
            : '';

        const winnersTable = window.db.getTable('winners');
        const pendingWinners = winnersTable.filter(w => w.nomination_id === Number(nominationId));
        let winnersHTML = '';
        if (pendingWinners.length > 0) {
            const pw = pendingWinners[0];
            const totalAmount = pendingWinners.reduce((sum, w) => sum + w.reward_amount, 0);
            winnersHTML = `
                <div class="mb-4" style="background: var(--bg-card, #f8fafc); border: 1px solid var(--border-color); border-radius: 6px; padding: 0.75rem;">
                    <div style="display:flex; align-items:center; gap:0.5rem; color:var(--color-primary); font-weight:700; margin-bottom:0.5rem;">
                        <i class="fa-solid fa-trophy"></i>
                        <span>Leadership Decision Details ${!pw.is_announced ? '<span class="badge warning" style="margin-left: 0.5rem;">Pending HR Release</span>' : ''}</span>
                    </div>
                    <div style="font-size: 0.85rem; line-height: 1.5; color: var(--text-secondary);">
                        <div><strong>Award Title:</strong> ${escapeHTML(pw.reward_title)}</div>
                        <div><strong>Award Type:</strong> ${escapeHTML(pw.reward_type)}</div>
                        ${pw.reward_type !== 'Recognition' ? `<div><strong>Total Reward Amount:</strong> ₹${totalAmount.toLocaleString()}</div>` : ''}
                        <div><strong>Decision Date:</strong> ${new Date(pw.awarded_date).toLocaleDateString()}</div>
                    </div>
                </div>
            `;
        }

        // Workflow Timeline history
        let timelineHTML = '';
        nomDetails.approvals.forEach(ap => {
            const statusClass = ap.status === 'Approved' ? 'success' : (ap.status === 'Rejected' ? 'danger' : 'warning');
            const commentsText = ap.comments ? ` - "${ap.comments}"` : '';
            const actionDate = ap.action_date ? ` on ${new Date(ap.action_date).toLocaleDateString()}` : '';
            timelineHTML += `
                <li style="font-size:0.85rem; margin-bottom:0.4rem;">
                    <strong>${escapeHTML(ap.level_name)}</strong>: 
                    <span class="badge ${statusClass}">${ap.status}</span> 
                    by ${escapeHTML(ap.approver_name)}${actionDate}${commentsText}
                </li>
            `;
        });

        // Set body HTML
        body.innerHTML = `
            <div class="mb-4" style="border-bottom:1.5px solid var(--border-color); padding-bottom:0.75rem;">
                <h4 style="font-family:var(--font-heading); font-size:1.15rem; margin-bottom:0.25rem;">${escapeHTML(nomDetails.title)}</h4>
                <div style="font-size:0.8rem; color:var(--text-muted);" class="flex justify-between">
                    <span>Nominator: <strong>${escapeHTML(nomDetails.nominator_name)}</strong></span>
                    <span>Category: <strong>${nomDetails.nomination_category} (${nomDetails.nomination_type})</strong></span>
                </div>
            </div>

            <div class="mb-4">
                <strong>Nominees:</strong>
                <p class="font-bold mt-1" style="color:var(--color-primary); font-size:1rem;">${escapeHTML(nomDetails.nominees.map(u => `${u.first_name} ${u.last_name}`).join(', '))}</p>
            </div>

            <div class="mb-4">
                <strong>Nomination Justification:</strong>
                <p style="font-size:0.85rem; color:var(--text-secondary); line-height:1.5; background:#f8fafc; border:1px solid var(--border-color); border-radius:6px; padding:0.75rem; margin-top:0.25rem;">
                    ${escapeHTML(nomDetails.reason)}
                </p>
            </div>

            <div class="mb-4 flex gap-4">
                <div>
                    <strong>Core Values alignment:</strong>
                    <div class="mt-1">${valTags}</div>
                </div>
                <div>
                    <strong>Competencies:</strong>
                    <div class="mt-1">${compTags}</div>
                </div>
            </div>

            ${outcomeHTML}
            ${attachmentHTML}
            ${winnersHTML}

            <div class="mb-4" style="border-top:1px solid var(--border-color); padding-top:0.75rem;">
                <strong>Workflow Pipeline Status:</strong>
                <ul style="list-style:none; padding-left:0; margin-top:0.4rem;">
                    ${timelineHTML}
                </ul>
            </div>
        `;

        // If reviewing is active, check active level to show decision buttons
        if (allowDecisions) {
            // Find active approval step for current user
            const activeStep = nomDetails.approvals.find(ap => ap.approver_id === currentUser.user_id && ap.status === 'Pending');
            
            if (activeStep) {
                // If user is HR Manager (level 3) and reviewing an approval at level 1 (HR Validation), 
                // OR if user is Leadership Director (level 4) and reviewing an approval at level 2 (Leadership Review)
                const roleLevel = getCurrentUserRoleLevel();
                
                body.innerHTML += `
                    <div class="form-group mt-4" style="border-top:1px solid var(--border-color); padding-top:0.75rem;">
                        <label for="modal-decision-comments">Reviewer Decision Comments *</label>
                        <textarea id="modal-decision-comments" class="form-control" placeholder="Enter review remarks or budget approvals..."></textarea>
                    </div>
                `;

                if (roleLevel === 4 && activeStep.level_id === 2) {
                    // Leadership declare winner directly!
                    footer.innerHTML = `
                        <button class="btn btn-secondary" onclick="document.getElementById('approval-review-overlay').classList.remove('active')">Cancel</button>
                        <button class="btn btn-danger" id="btn-modal-reject" data-id="${activeStep.approval_id}"><i class="fa-solid fa-xmark"></i> Reject</button>
                        <button class="btn btn-primary" id="btn-modal-declare" data-nomid="${nomDetails.nomination_id}"><i class="fa-solid fa-trophy"></i> Declare Winner</button>
                    `;
                    
                    document.getElementById('btn-modal-declare').addEventListener('click', () => {
                        closeModal('approval-review');
                        // Show winner payout form
                        showWinnerDeclarationForm(nomDetails.nomination_id);
                    });
                } else if (activeStep.level_id === 3) {
                    // HR Final Sign-off
                    footer.innerHTML = `
                        <button class="btn btn-secondary" onclick="document.getElementById('approval-review-overlay').classList.remove('active')">Cancel</button>
                        <button class="btn btn-danger" id="btn-modal-reject" data-id="${activeStep.approval_id}"><i class="fa-solid fa-xmark"></i> Reject</button>
                        <button class="btn btn-success" id="btn-modal-approve" data-id="${activeStep.approval_id}"><i class="fa-solid fa-check"></i> Approve & Release Award</button>
                    `;
                    
                    document.getElementById('btn-modal-approve').addEventListener('click', () => {
                        const comments = document.getElementById('modal-decision-comments').value.trim();
                        processApprovalWorkflow(activeStep.approval_id, 'Approved', comments);
                    });
                } else {
                    // Standard Approve/Reject & Escalate (HR Validation Level 1)
                    footer.innerHTML = `
                        <button class="btn btn-secondary" onclick="document.getElementById('approval-review-overlay').classList.remove('active')">Cancel</button>
                        <button class="btn btn-danger" id="btn-modal-reject" data-id="${activeStep.approval_id}"><i class="fa-solid fa-xmark"></i> Reject</button>
                        <button class="btn btn-primary" id="btn-modal-approve" data-id="${activeStep.approval_id}"><i class="fa-solid fa-check"></i> Approve & Escalate</button>
                    `;
                    
                    document.getElementById('btn-modal-approve').addEventListener('click', () => {
                        const comments = document.getElementById('modal-decision-comments').value.trim();
                        processApprovalWorkflow(activeStep.approval_id, 'Approved', comments);
                    });
                }

                document.getElementById('btn-modal-reject').addEventListener('click', () => {
                    const comments = document.getElementById('modal-decision-comments').value.trim();
                    if (!comments) {
                        showToast('Please provide comments for rejection.', 'error');
                        return;
                    }
                    processApprovalWorkflow(activeStep.approval_id, 'Rejected', comments);
                });

            } else {
                footer.innerHTML = `<button class="btn btn-secondary" onclick="document.getElementById('approval-review-overlay').classList.remove('active')">Close</button>`;
            }
        } else {
            footer.innerHTML = `<button class="btn btn-secondary" onclick="document.getElementById('approval-review-overlay').classList.remove('active')">Close</button>`;
        }

        openModal('approval-review');
    }

    function processApprovalWorkflow(approvalId, status, comments) {
        try {
            window.db.submitApprovalAction(approvalId, currentUser.user_id, status, comments);
            closeModal('approval-review');
            showToast(`Workflow updated: ${status}`, status === 'Approved' ? 'success' : 'warning');
            renderCurrentView();
        } catch (e) {
            showToast(e.message, 'error');
        }
    }

    // --- WINNER DECLARATION PANEL FORM (Wireframe 5 Overlay) ---
    let activeNominationIdForWinner = null;
    
    function showWinnerDeclarationForm(nominationId) {
        activeNominationIdForWinner = nominationId;
        const nomDetails = window.db.getNominationDetails(nominationId);
        if (!nomDetails) return;

        document.getElementById('win-nominee-name').textContent = nomDetails.nominees.map(u => `${u.first_name} ${u.last_name}`).join(', ');
        document.getElementById('win-nominator-name').textContent = nomDetails.nominator_name;
        document.getElementById('win-award-title').textContent = nomDetails.award.title;

        // Auto fills default values
        document.getElementById('win-reward-type').value = nomDetails.award.award_type;
        document.getElementById('win-reward-title').value = `${nomDetails.award.title} Winner`;
        document.getElementById('win-remarks').value = `In recognition of outstanding contributions in: ${nomDetails.title}.`;
        
        // Auto date today
        document.getElementById('win-announce-date').value = new Date().toISOString().split('T')[0];

        // Disable amount if Recognition type
        const amtInput = document.getElementById('win-reward-amount');
        if (nomDetails.award.award_type === 'Recognition') {
            amtInput.value = 0;
            amtInput.disabled = true;
        } else {
            amtInput.disabled = false;
            // Set default default budget
            const rem = nomDetails.award.total_budget - nomDetails.award.used_budget;
            amtInput.value = rem > 25000 ? 25000 : rem;
            amtInput.max = rem;
        }

        openModal('winner-declaration');
    }

    document.getElementById('winner-declaration-form').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const nomId = activeNominationIdForWinner;
        if (!nomId) return;

        const type = document.getElementById('win-reward-type').value;
        const amount = Number(document.getElementById('win-reward-amount').value || 0);
        const title = document.getElementById('win-reward-title').value.trim();
        
        try {
            // Leadership declares winner
            window.db.leadershipDeclareWinner(nomId, currentUser.user_id, amount, title);

            closeModal('winner-declaration');
            triggerConfettiExplosion();
            showToast('Winner declared! Pending final HR release sign-off.', 'success');
            
            renderCurrentView();
        } catch (err) {
            showToast(err.message, 'error');
        }
    });

    document.getElementById('btn-cancel-winner').addEventListener('click', () => {
        closeModal('winner-declaration');
    });

    // --- VIEW D: REPORTS & ANALYTICS DATA (Wireframe 9 & 6) ---
    function renderReportsData() {
        const budgets = window.db.getAwardsBudgets();
        const winners = window.db.getTable('winners').filter(w => w.is_announced);
        const nominations = window.db.getTable('nominations');

        const activeBudgets = budgets.filter(b => {
            const award = window.db.getTable('awards').find(awd => awd.award_id === b.award_id);
            return award && award.status !== 'Inactive';
        });

        const totalUsed = activeBudgets.reduce((sum, b) => sum + b.used_budget, 0);
        const totalPool = activeBudgets.reduce((sum, b) => sum + b.total_budget, 0);
        const utilPct = totalPool > 0 ? (totalUsed / totalPool) * 100 : 0;
        
        // Update top KPI widgets
        document.getElementById('rep-winners-val').textContent = winners.length;
        document.getElementById('rep-utilization-val').textContent = `${utilPct.toFixed(2)}%`;
        
        // Aggregate elements for visuals
        const aggAllocated = document.getElementById('agg-budget-allocated');
        const aggSpent = document.getElementById('agg-budget-spent');
        const aggRemaining = document.getElementById('agg-budget-remaining');
        const aggGaugeFill = document.getElementById('agg-budget-gauge-fill');
        const aggPctText = document.getElementById('agg-budget-pct-text');
        const alarmsDiv = document.getElementById('reports-budget-alarms');
        
        if (aggAllocated) aggAllocated.textContent = `₹${totalPool.toLocaleString()}`;
        if (aggSpent) aggSpent.textContent = `₹${totalUsed.toLocaleString()}`;
        if (aggRemaining) aggRemaining.textContent = `₹${(totalPool - totalUsed).toLocaleString()}`;
        if (aggPctText) aggPctText.textContent = `${utilPct.toFixed(1)}%`;
        
        if (aggGaugeFill) {
            // Circumference of r=55 is 2 * Math.PI * 55 = 345.57
            const circumference = 345.57;
            const offset = circumference - (utilPct / 100) * circumference;
            aggGaugeFill.style.strokeDashoffset = offset;
            
            // Color code the aggregate gauge circle
            if (utilPct > 80) {
                aggGaugeFill.style.stroke = 'var(--color-accent-red)';
            } else if (utilPct > 50) {
                aggGaugeFill.style.stroke = 'var(--color-warning)';
            } else {
                aggGaugeFill.style.stroke = 'var(--color-primary)';
            }
        }
        
        // Build alarm alerts list
        let alarmsHTML = '';
        activeBudgets.forEach(b => {
            if (b.award_type !== 'Recognition') {
                const pct = b.total_budget > 0 ? (b.used_budget / b.total_budget) * 100 : 0;
                if (pct >= 80) {
                    alarmsHTML += `
                        <div class="budget-alarm-alert">
                            <i class="fa-solid fa-triangle-exclamation"></i>
                            <span><strong>${escapeHTML(b.title)}</strong> budget is critically depleted (${pct.toFixed(1)}% used)!</span>
                        </div>
                    `;
                } else if (pct >= 50) {
                    alarmsHTML += `
                        <div class="budget-alarm-alert amber">
                            <i class="fa-solid fa-circle-exclamation"></i>
                            <span><strong>${escapeHTML(b.title)}</strong> budget is moderately used (${pct.toFixed(1)}% used).</span>
                        </div>
                    `;
                }
            }
        });
        
        if (alarmsDiv) {
            alarmsDiv.innerHTML = alarmsHTML || `<div style="font-size:0.8rem; color:var(--text-muted); text-align:center;"><i class="fa-solid fa-circle-check" style="color:var(--color-success);"></i> All program budgets healthy and within parameters.</div>`;
        }
        
        // Render reports budget details table
        const tbody = document.getElementById('rep-budget-table-body');
        tbody.innerHTML = '';
        
        activeBudgets.forEach(b => {
            const tr = document.createElement('tr');
            
            const pct = b.award_type === 'Recognition' ? 0 : (b.total_budget > 0 ? (b.used_budget / b.total_budget) * 100 : 0);
            const totalText = b.award_type === 'Recognition' ? 'No limit' : `₹${b.total_budget.toLocaleString()}`;
            const usedText = b.award_type === 'Recognition' ? `₹0` : `₹${b.used_budget.toLocaleString()}`;
            
            let progressBarHTML = '';
            let alertBadgeHTML = '';
            
            if (b.award_type === 'Recognition') {
                progressBarHTML = `
                     <div class="budget-progress-container">
                         <span style="font-size: 0.75rem; color: var(--text-muted);">Non-monetary award</span>
                     </div>
                `;
                alertBadgeHTML = `<span class="badge info">N/A</span>`;
            } else {
                let fillClass = 'green';
                if (pct >= 80) {
                    fillClass = 'red';
                    alertBadgeHTML = `<span class="badge danger" style="animation: pulseGlow 1.5s infinite alternate;"><i class="fa-solid fa-triangle-exclamation"></i> Warning</span>`;
                } else if (pct >= 50) {
                    fillClass = 'amber';
                    alertBadgeHTML = `<span class="badge warning"><i class="fa-solid fa-circle-exclamation"></i> Alert</span>`;
                } else {
                    alertBadgeHTML = `<span class="badge success">Normal</span>`;
                }
                
                progressBarHTML = `
                     <div class="budget-progress-container">
                         <div class="budget-progress-bg">
                             <div class="budget-progress-fill ${fillClass}" style="width: ${pct.toFixed(0)}%;"></div>
                         </div>
                         <span style="font-size: 0.7rem; color: var(--text-secondary); text-align: right; display: block;">${pct.toFixed(1)}% utilized</span>
                     </div>
                `;
            }
            
            tr.innerHTML = `
                <td class="font-bold">${escapeHTML(b.title)}</td>
                <td class="font-bold">${totalText}</td>
                <td>${usedText}</td>
                <td>${progressBarHTML}</td>
                <td>${alertBadgeHTML}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    // --- VIEW E: EMPLOYEES DIRECTORY (Wireframe 10) ---
    function setupDirectoryFilters() {
        const depts = window.db.getTable('departments');
        const roles = window.db.getTable('roles');
        
        // Populate filters
        const deptFilter = document.getElementById('dir-filter-dept');
        const roleFilter = document.getElementById('dir-filter-role');
        
        deptFilter.innerHTML = '<option value="All">All Departments</option>';
        depts.forEach(d => {
            const opt = document.createElement('option');
            opt.value = d.department_id;
            opt.textContent = d.department_name;
            deptFilter.appendChild(opt);
        });

        roleFilter.innerHTML = '<option value="All">All Roles</option>';
        roles.forEach(r => {
            const opt = document.createElement('option');
            opt.value = r.role_id;
            opt.textContent = r.role_name;
            roleFilter.appendChild(opt);
        });

        // Add filter triggers
        deptFilter.addEventListener('change', renderDirectoryData);
        roleFilter.addEventListener('change', renderDirectoryData);
        document.getElementById('dir-filter-status').addEventListener('change', renderDirectoryData);
    }

    function setupGlobalSearch() {
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                renderCurrentView();
            });
        }
    }

    function renderDirectoryData() {
        const users = window.db.getTable('users');
        const depts = window.db.getTable('departments');
        const roles = window.db.getTable('roles');
        const roleLevel = getCurrentUserRoleLevel();
        
        // Show/hide Admin/HR actions
        const btnAddEmp = document.getElementById('btn-admin-add-employee');
        const thActions = document.getElementById('th-employee-actions');
        const isAuthorized = roleLevel === 5 || roleLevel === 3;
        
        if (isAuthorized) {
            if (btnAddEmp) btnAddEmp.style.display = 'block';
            if (thActions) thActions.style.display = 'table-cell';
        } else {
            if (btnAddEmp) btnAddEmp.style.display = 'none';
            if (thActions) thActions.style.display = 'none';
        }
        
        const deptFilter = document.getElementById('dir-filter-dept').value;
        const roleFilter = document.getElementById('dir-filter-role').value;
        const statusFilter = document.getElementById('dir-filter-status').value;

        const tbody = document.getElementById('directory-table-body');
        tbody.innerHTML = '';

        const searchInput = document.querySelector('.search-input');
        const searchVal = searchInput ? searchInput.value.trim().toLowerCase() : '';

        // Filter lines
        const filtered = users.filter(u => {
            if (deptFilter !== 'All' && u.department_id !== Number(deptFilter)) return false;
            if (roleFilter !== 'All' && u.role_id !== Number(roleFilter)) return false;
            if (statusFilter !== 'All' && u.status !== statusFilter) return false;
            
            if (searchVal) {
                const fullName = `${u.first_name} ${u.last_name}`.toLowerCase();
                const code = (u.employee_code || '').toLowerCase();
                const designation = (u.designation || '').toLowerCase();
                const deptName = (depts.find(d => d.department_id === u.department_id)?.department_name || '').toLowerCase();
                if (!fullName.includes(searchVal) && 
                    !code.includes(searchVal) && 
                    !designation.includes(searchVal) && 
                    !deptName.includes(searchVal)) {
                    return false;
                }
            }
            return true;
        });

        const totalCols = isAuthorized ? 7 : 6;

        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="${totalCols}" class="text-center text-secondary">No matching employees.</td></tr>`;
        } else {
            filtered.forEach((u, idx) => {
                const dept = depts.find(d => d.department_id === u.department_id) || {};
                const roleObj = roles.find(r => r.role_id === u.role_id) || {};
                
                const mgrObj = users.find(user => user.user_id === u.manager_id);
                const managerName = mgrObj ? `${mgrObj.first_name} ${mgrObj.last_name}` : 'N/A';
                
                const tr = document.createElement('tr');
                tr.className = 'reveal-row';
                tr.style.animationDelay = `${idx * 0.05}s`;
                
                let actionsTd = '';
                if (isAuthorized) {
                    const isTargetAdmin = roleObj.role_level === 5;
                    const canEdit = !isTargetAdmin || roleLevel === 5;
                    actionsTd = `
                        <td class="text-right">
                            ${canEdit ? `<button class="btn btn-outline btn-sm edit-employee-btn" data-id="${u.user_id}" style="padding:0.2rem 0.4rem; font-size:0.75rem;" title="Edit"><i class="fa-solid fa-pencil"></i></button>` : ''}
                            ${isTargetAdmin ? '' : `
                                <button class="btn btn-outline btn-sm toggle-employee-btn" data-id="${u.user_id}" style="padding:0.2rem 0.4rem; font-size:0.75rem;" title="Toggle Status"><i class="fa-solid ${u.status === 'Active' ? 'fa-ban' : 'fa-check'}"></i></button>
                                <button class="btn btn-outline btn-sm delete-employee-btn" data-id="${u.user_id}" style="padding:0.2rem 0.4rem; font-size:0.75rem; color:var(--color-accent-red);" title="Delete"><i class="fa-solid fa-trash"></i></button>
                            `}
                        </td>
                    `;
                }
                
                tr.innerHTML = `
                    <td class="font-bold">${escapeHTML(u.first_name + ' ' + u.last_name)} <br> <span style="font-size:0.75rem; color:var(--text-muted);">${u.designation}</span></td>
                    <td>${u.employee_code}</td>
                    <td>${escapeHTML(dept.department_name)}</td>
                    <td>${roleObj.role_name}</td>
                    <td>${escapeHTML(managerName)}</td>
                    <td><span class="badge ${u.status === 'Active' ? 'success' : 'danger'}">${u.status}</span></td>
                    ${actionsTd}
                `;
                tbody.appendChild(tr);
            });
            
            // Bind edit/toggle/delete actions
            if (isAuthorized) {
                tbody.querySelectorAll('.edit-employee-btn').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const id = Number(btn.getAttribute('data-id'));
                        const employee = window.db.getTable('users').find(user => user.user_id === id);
                        if (employee) {
                            // Populate dropdowns
                            const roleSelect = document.getElementById('employee-role-input');
                            roleSelect.innerHTML = '';
                            roles.forEach(r => {
                                if (r.role_level === 5 && roleLevel !== 5) return; // Only Admin can assign Admin role
                                const opt = document.createElement('option');
                                opt.value = r.role_id;
                                opt.textContent = r.role_name;
                                roleSelect.appendChild(opt);
                            });

                            const deptSelect = document.getElementById('employee-dept-input');
                            deptSelect.innerHTML = '';
                            depts.forEach(d => {
                                const opt = document.createElement('option');
                                opt.value = d.department_id;
                                opt.textContent = d.department_name;
                                deptSelect.appendChild(opt);
                            });

                            const mgrSelect = document.getElementById('employee-manager-input');
                            mgrSelect.innerHTML = '<option value="">-- No Manager --</option>';
                            users.filter(usr => usr.user_id !== id && usr.status === 'Active').forEach(user => {
                                const opt = document.createElement('option');
                                opt.value = user.user_id;
                                opt.textContent = `${user.first_name} ${user.last_name} (${user.employee_code})`;
                                mgrSelect.appendChild(opt);
                            });

                            // Set values
                            document.getElementById('employee-id-input').value = employee.user_id;
                            document.getElementById('employee-firstname-input').value = employee.first_name;
                            document.getElementById('employee-lastname-input').value = employee.last_name;
                            document.getElementById('employee-email-input').value = employee.email;
                            document.getElementById('employee-designation-input').value = employee.designation;
                            document.getElementById('employee-role-input').value = employee.role_id;
                            document.getElementById('employee-dept-input').value = employee.department_id;
                            document.getElementById('employee-manager-input').value = employee.manager_id || '';

                            document.getElementById('employee-modal-title').textContent = 'Edit Employee';
                            openModal('employee-form');
                        }
                    });
                });
                
                tbody.querySelectorAll('.toggle-employee-btn').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const id = Number(btn.getAttribute('data-id'));
                        window.db.toggleUserStatus(currentUser.user_id, id);
                        showToast('Employee status toggled successfully', 'success');
                        renderCurrentView();
                    });
                });

                tbody.querySelectorAll('.delete-employee-btn').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const id = Number(btn.getAttribute('data-id'));
                        if (confirm('Are you sure you want to remove this employee permanently?')) {
                            window.db.deleteUser(currentUser.user_id, id);
                            showToast('Employee deleted successfully', 'success');
                            renderCurrentView();
                        }
                    });
                });
            }
        }
    }

    // --- VIEW F: NOTIFICATIONS INBOX (Wireframe 8) ---
    function setupNotificationsTabs() {
        const all = document.getElementById('notif-tab-all');
        const unread = document.getElementById('notif-tab-unread');
        const nominations = document.getElementById('notif-tab-nominations');
        const approvals = document.getElementById('notif-tab-approvals');

        all.addEventListener('click', () => toggleNotifTab('all', all));
        unread.addEventListener('click', () => toggleNotifTab('unread', unread));
        nominations.addEventListener('click', () => toggleNotifTab('nominations', nominations));
        approvals.addEventListener('click', () => toggleNotifTab('approvals', approvals));

        // Notifications Bell Icon action triggers Notifications page tab directly
        document.getElementById('bell-btn').addEventListener('click', () => {
            switchView('notifications');
        });
    }

    function toggleNotifTab(tabName, element) {
        activeNotifTab = tabName;
        
        document.querySelectorAll('#notifications-view .tab-headers button').forEach(b => {
            b.classList.remove('active');
        });
        element.classList.add('active');
        
        renderNotificationsData();
    }

    function renderNotificationsData() {
        const notifications = window.db.getTable('notifications').filter(n => n.user_id === currentUser.user_id);
        
        // Update header count tab numbers
        document.getElementById('count-notif-all').textContent = notifications.length;
        document.getElementById('count-notif-unread').textContent = notifications.filter(n => !n.is_read).length;
        document.getElementById('count-notif-noms').textContent = notifications.filter(n => n.type === 'Award').length;
        document.getElementById('count-notif-apps').textContent = notifications.filter(n => n.type === 'Approval').length;

        // Mark read when rendering notifications panel
        notifications.forEach(n => n.is_read = true);
        window.db.save();

        let filtered = [];
        if (activeNotifTab === 'all') {
            filtered = [...notifications];
        } else if (activeNotifTab === 'unread') {
            // Already marked read in this tick, but filter keeps them briefly
            filtered = notifications.filter(n => !n.is_read);
        } else if (activeNotifTab === 'nominations') {
            filtered = notifications.filter(n => n.type === 'Award');
        } else {
            filtered = notifications.filter(n => n.type === 'Approval');
        }

        const feed = document.getElementById('notifications-feed-list');
        feed.innerHTML = '';

        if (filtered.length === 0) {
            feed.innerHTML = `<li class="text-center text-secondary">Inbox empty.</li>`;
        } else {
            // Sort desc
            const sorted = filtered.sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
            sorted.forEach(n => {
                const li = document.createElement('li');
                li.className = 'feed-item';
                
                let iconClass = 'fa-info-circle';
                if (n.type === 'Approval') iconClass = 'fa-square-check';
                else if (n.type === 'Award') iconClass = 'fa-cake-candles';
                
                const initials = currentUser.first_name[0] + currentUser.last_name[0];
                const dateText = new Date(n.created_at).toLocaleString();
                
                li.innerHTML = `
                    <div class="feed-avatar">${initials}</div>
                    <div class="feed-body">
                        <div class="feed-header">
                            <span class="feed-user">${escapeHTML(n.title)}</span>
                            <span class="feed-time">${dateText}</span>
                        </div>
                        <div class="feed-content">${escapeHTML(n.message)}</div>
                    </div>
                `;
                feed.appendChild(li);
            });
        }
    }

    // --- VIEW G: COMPLIANCE AUDIT TRAILS ---
    function renderAuditLogsData() {
        const logs = window.db.getTable('audit_logs');
        const users = window.db.getTable('users');
        const tbody = document.getElementById('audit-table-body');
        tbody.innerHTML = '';

        if (logs.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="text-center text-secondary">No recorded compliance entries.</td></tr>`;
        } else {
            const sorted = [...logs].sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
            sorted.forEach(l => {
                const actor = users.find(u => u.user_id === l.user_id) || {};
                const actorName = l.user_id ? `${actor.first_name} ${actor.last_name}` : 'SYSTEM';
                const timeStr = new Date(l.created_at).toLocaleString();
                
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td class="font-bold">${escapeHTML(actorName)}</td>
                    <td><span class="badge info" style="font-size:0.7rem;">${l.action}</span></td>
                    <td>${l.entity_name} (ID: ${l.entity_id})</td>
                    <td>${escapeHTML(l.new_value)}</td>
                    <td>${timeStr}</td>
                `;
                tbody.appendChild(tr);
            });
        }
    }

    // --- SETUP FORMS ACTIONS ---
    function setupFormResetActions() {
        document.getElementById('btn-wiz-reset').addEventListener('click', () => {
            document.getElementById('nomination-form-wizard').reset();
            loadNominationFormContext();
        });
    }

    // --- RECOGNITION CERTIFICATE DIALOG ---
    function showCertificateModal(recipient, award, date) {
        document.getElementById('lbl-cert-recipient').textContent = recipient;
        document.getElementById('lbl-cert-award').textContent = award;
        document.getElementById('lbl-cert-date').textContent = date;
        
        openModal('cert');
        
        document.getElementById('btn-cert-download-mock').onclick = () => {
            showToast('Downloading certificate as PDF...', 'success');
            setTimeout(() => {
                showToast('Recognition PDF credentials stored.', 'success');
            }, 1000);
        };
    }

    // --- OVERLAYS OPEN / CLOSE GENERAL ---
    function openModal(modalId) {
        document.getElementById(`${modalId}-overlay`).classList.add('active');
    }

    function closeModal(modalId) {
        document.getElementById(`${modalId}-overlay`).classList.remove('active');
    }

    function setupModalCloseEvents() {
        document.getElementById('btn-close-review-modal').addEventListener('click', () => closeModal('approval-review'));
        document.getElementById('btn-close-winner-modal').addEventListener('click', () => closeModal('winner-declaration'));
        document.getElementById('btn-close-cert-modal').addEventListener('click', () => closeModal('cert'));
        
        // Award form closeModal bindings
        const closeAwardBtn = document.getElementById('btn-close-award-modal');
        if (closeAwardBtn) closeAwardBtn.addEventListener('click', () => closeModal('award-form'));
        const cancelAwardBtn = document.getElementById('btn-cancel-award-form');
        if (cancelAwardBtn) cancelAwardBtn.addEventListener('click', () => closeModal('award-form'));

        // Employee form closeModal bindings
        const closeEmployeeBtn = document.getElementById('btn-close-employee-modal');
        if (closeEmployeeBtn) closeEmployeeBtn.addEventListener('click', () => closeModal('employee-form'));
        const cancelEmployeeBtn = document.getElementById('btn-cancel-employee-form');
        if (cancelEmployeeBtn) cancelEmployeeBtn.addEventListener('click', () => closeModal('employee-form'));

        // Success modal closeModal bindings
        const successGoDashboardBtn = document.getElementById('btn-success-go-dashboard');
        if (successGoDashboardBtn) {
            successGoDashboardBtn.addEventListener('click', () => {
                closeModal('nomination-success');
                switchView('dashboard');
            });
        }
    }

    // --- CONFETTI GRAPHIC ANIMATIONS ---
    function triggerConfettiExplosion() {
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.top = 0;
        container.style.left = 0;
        container.style.width = '100vw';
        container.style.height = '100vh';
        container.style.pointerEvents = 'none';
        container.style.zIndex = '99999';
        document.body.appendChild(container);

        const colors = ['#00a883', '#e30016', '#10b981', '#f59e0b', '#3b82f6'];

        for (let i = 0; i < 80; i++) {
            const c = document.createElement('div');
            c.style.position = 'absolute';
            c.style.width = `${Math.random() * 8 + 4}px`;
            c.style.height = `${Math.random() * 8 + 4}px`;
            c.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            c.style.top = `-10px`;
            c.style.left = `${Math.random() * 100}vw`;
            c.style.opacity = Math.random() * 0.7 + 0.3;
            c.style.borderRadius = '1px';
            
            const duration = Math.random() * 1.8 + 1.2;
            const delay = Math.random() * 0.4;
            
            c.style.transition = `transform ${duration}s linear ${delay}s, opacity ${duration}s ease-out ${delay}s`;
            
            container.appendChild(c);

            setTimeout(() => {
                c.style.transform = `translateY(110vh) rotate(${Math.random() * 360}deg)`;
                c.style.opacity = '0';
            }, 50);
        }

        setTimeout(() => container.remove(), 2500);
    }

    // --- TOAST FEEDBACKS ---
    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        let icon = 'fa-info-circle';
        if (type === 'success') icon = 'fa-circle-check';
        else if (type === 'error') icon = 'fa-triangle-exclamation';
        else if (type === 'warning') icon = 'fa-circle-exclamation';

        toast.innerHTML = `
            <i class="fa-solid ${icon} toast-icon"></i>
            <span>${escapeHTML(message)}</span>
        `;
        
        toastContainer.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 50);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }

    // --- UTILITY FORMATS ---
    function getBadgeClass(type) {
        if (type === 'Monetary') return 'success';
        if (type === 'Voucher') return 'warning';
        return 'info';
    }

    function getNomStatusBadgeClass(status) {
        if (status === 'Approved') return 'success';
        if (status === 'Rejected') return 'danger';
        return 'warning';
    }

    function escapeHTML(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // --- ADMIN DASHBOARD RENDER HELPERS ---
    function renderAdminValuesTable(values) {
        const tbody = document.getElementById('admin-values-table-body');
        if (!tbody) return;
        tbody.innerHTML = '';

        values.forEach(v => {
            const tr = document.createElement('tr');
            const isActive = v.status === 'Active';
            const badgeClass = isActive ? 'success' : 'danger';
            
            tr.innerHTML = `
                <td class="font-bold">${escapeHTML(v.value_name)}</td>
                <td><span class="badge ${badgeClass}">${v.status}</span></td>
                <td class="text-right">
                    <button class="btn ${isActive ? 'btn-outline' : 'btn-primary'} btn-sm toggle-value-status-btn" data-id="${v.core_value_id}" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;">
                        <i class="fa-solid ${isActive ? 'fa-ban' : 'fa-check'}"></i> ${isActive ? 'Deactivate' : 'Activate'}
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        // Add event listeners
        tbody.querySelectorAll('.toggle-value-status-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                window.db.toggleCoreValueStatus(currentUser.user_id, id);
                showToast('Core Value status updated', 'success');
                renderCurrentView();
            });
        });
    }

    function renderAdminCompetenciesTable(competencies) {
        const tbody = document.getElementById('admin-competencies-table-body');
        if (!tbody) return;
        tbody.innerHTML = '';

        competencies.forEach(c => {
            const tr = document.createElement('tr');
            const isActive = c.status === 'Active';
            const badgeClass = isActive ? 'success' : 'danger';
            
            tr.innerHTML = `
                <td class="font-bold">${escapeHTML(c.competency_name)}</td>
                <td><span class="badge ${badgeClass}">${c.status}</span></td>
                <td class="text-right">
                    <button class="btn ${isActive ? 'btn-outline' : 'btn-primary'} btn-sm toggle-competency-status-btn" data-id="${c.competency_id}" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;">
                        <i class="fa-solid ${isActive ? 'fa-ban' : 'fa-check'}"></i> ${isActive ? 'Deactivate' : 'Activate'}
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        // Add event listeners
        tbody.querySelectorAll('.toggle-competency-status-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                window.db.toggleCompetencyStatus(currentUser.user_id, id);
                showToast('Competency status updated', 'success');
                renderCurrentView();
            });
        });
    }

    function renderAdminAwardsTable() {
        const tbody = document.getElementById('admin-awards-table-body');
        if (!tbody) return;
        tbody.innerHTML = '';
        
        const awards = window.db.getTable('awards');
        if (awards.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" class="text-center text-secondary">No award programs configured.</td></tr>`;
            return;
        }
        
        awards.forEach(a => {
            const tr = document.createElement('tr');
            const isActive = (a.status || 'Active') === 'Active';
            const badgeClass = isActive ? 'success' : 'danger';
            
            tr.innerHTML = `
                <td class="font-bold">${escapeHTML(a.title)}</td>
                <td><span class="badge ${getBadgeClass(a.award_type)}">${a.award_type}</span></td>
                <td class="font-bold">₹${a.total_budget.toLocaleString()}</td>
                <td>₹${a.used_budget.toLocaleString()}</td>
                <td>${a.frequency}</td>
                <td>${a.allow_self_nomination ? '<i class="fa-solid fa-check" style="color:var(--color-success);"></i> Yes' : '<i class="fa-solid fa-xmark" style="color:var(--color-accent-red);"></i> No'}</td>
                <td><span class="badge ${badgeClass}">${a.status || 'Active'}</span></td>
                <td class="text-right">
                    <button class="btn btn-outline btn-sm edit-award-btn" data-id="${a.award_id}" style="padding:0.2rem 0.4rem; font-size:0.75rem;"><i class="fa-solid fa-pencil"></i></button>
                    <button class="btn btn-outline btn-sm toggle-award-status-btn" data-id="${a.award_id}" style="padding:0.2rem 0.4rem; font-size:0.75rem;"><i class="fa-solid ${isActive ? 'fa-ban' : 'fa-check'}"></i></button>
                    <button class="btn btn-outline btn-sm delete-award-btn" data-id="${a.award_id}" style="padding:0.2rem 0.4rem; font-size:0.75rem; color:var(--color-accent-red);"><i class="fa-solid fa-trash"></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });
        
        tbody.querySelectorAll('.edit-award-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = Number(btn.getAttribute('data-id'));
                const awardsList = window.db.getTable('awards');
                const award = awardsList.find(a => a.award_id === id);
                if (award) {
                    document.getElementById('award-id-input').value = award.award_id;
                    document.getElementById('award-title-input').value = award.title;
                    document.getElementById('award-desc-input').value = award.description;
                    document.getElementById('award-type-input').value = award.award_type;
                    document.getElementById('award-budget-input').value = award.total_budget;
                    document.getElementById('award-frequency-input').value = award.frequency;
                    document.getElementById('award-winners-input').value = award.max_winners;
                    document.getElementById('award-allow-self-nom').checked = award.allow_self_nomination;
                    document.getElementById('award-start-input').value = award.start_date;
                    document.getElementById('award-end-input').value = award.end_date;
                    
                    document.getElementById('award-modal-title').textContent = 'Edit Reward Program';
                    openModal('award-form');
                }
            });
        });
        
        tbody.querySelectorAll('.toggle-award-status-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                window.db.toggleAwardStatus(currentUser.user_id, id);
                showToast('Program status toggled successfully', 'success');
                renderCurrentView();
            });
        });
        
        tbody.querySelectorAll('.delete-award-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                if (confirm('Are you sure you want to delete this program permanently?')) {
                    window.db.deleteAward(currentUser.user_id, id);
                    showToast('Program deleted successfully', 'success');
                    renderCurrentView();
                }
            });
        });
    }

    function setupAdminFormEvents() {
        // Core Alignment forms
        const valueForm = document.getElementById('admin-add-value-form');
        const compForm = document.getElementById('admin-add-competency-form');

        if (valueForm) {
            valueForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const input = document.getElementById('admin-new-value-input');
                const valName = input.value.trim();
                if (!valName) return;

                try {
                    window.db.addCoreValue(currentUser.user_id, valName);
                    showToast(`Successfully added Core Value "${valName}"`, 'success');
                    input.value = '';
                    renderCurrentView();
                } catch (err) {
                    showToast(err.message, 'error');
                }
            });
        }

        if (compForm) {
            compForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const input = document.getElementById('admin-new-competency-input');
                const compName = input.value.trim();
                if (!compName) return;

                try {
                    window.db.addCompetency(currentUser.user_id, compName);
                    showToast(`Successfully added Competency "${compName}"`, 'success');
                    input.value = '';
                    renderCurrentView();
                } catch (err) {
                    showToast(err.message, 'error');
                }
            });
        }

        // Sub-tabs in Admin Dashboard
        const btnAlignments = document.getElementById('admin-tab-alignments');
        const btnAwards = document.getElementById('admin-tab-awards');
        const alignmentsCont = document.getElementById('admin-alignments-container');
        const awardsCont = document.getElementById('admin-awards-container');
        
        if (btnAlignments && btnAwards) {
            btnAlignments.addEventListener('click', () => {
                btnAlignments.classList.add('active');
                btnAwards.classList.remove('active');
                if (alignmentsCont) alignmentsCont.style.display = 'block';
                if (awardsCont) awardsCont.style.display = 'none';
            });
            
            btnAwards.addEventListener('click', () => {
                btnAwards.classList.add('active');
                btnAlignments.classList.remove('active');
                if (alignmentsCont) alignmentsCont.style.display = 'none';
                if (awardsCont) awardsCont.style.display = 'block';
                renderAdminAwardsTable();
            });
        }

        // Add Program Button trigger
        const btnAddAward = document.getElementById('btn-admin-add-award');
        if (btnAddAward) {
            btnAddAward.addEventListener('click', () => {
                document.getElementById('award-id-input').value = '';
                document.getElementById('award-title-input').value = '';
                document.getElementById('award-desc-input').value = '';
                document.getElementById('award-type-input').value = 'Monetary';
                document.getElementById('award-budget-input').value = '100000';
                document.getElementById('award-frequency-input').value = 'Quarterly';
                document.getElementById('award-winners-input').value = '5';
                document.getElementById('award-allow-self-nom').checked = true;
                
                const thisYear = new Date().getFullYear();
                document.getElementById('award-start-input').value = `${thisYear}-01-01`;
                document.getElementById('award-end-input').value = `${thisYear}-12-31`;
                
                document.getElementById('award-modal-title').textContent = 'Add Reward Program';
                openModal('award-form');
            });
        }

        // Award form submit
        const awardForm = document.getElementById('admin-award-form');
        if (awardForm) {
            awardForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const idVal = document.getElementById('award-id-input').value;
                const data = {
                    title: document.getElementById('award-title-input').value.trim(),
                    description: document.getElementById('award-desc-input').value.trim(),
                    award_type: document.getElementById('award-type-input').value,
                    total_budget: Number(document.getElementById('award-budget-input').value),
                    frequency: document.getElementById('award-frequency-input').value,
                    max_winners: Number(document.getElementById('award-winners-input').value),
                    allow_self_nomination: document.getElementById('award-allow-self-nom').checked,
                    start_date: document.getElementById('award-start-input').value,
                    end_date: document.getElementById('award-end-input').value
                };

                try {
                    if (idVal) {
                        window.db.updateAward(currentUser.user_id, idVal, data);
                        showToast('Reward program details updated', 'success');
                    } else {
                        window.db.createNewAward(currentUser.user_id, data);
                        showToast('New reward program successfully created', 'success');
                    }
                    closeModal('award-form');
                    renderCurrentView();
                } catch (err) {
                    showToast(err.message, 'error');
                }
            });
        }

        // Add Employee Button trigger
        const btnAddEmployee = document.getElementById('btn-admin-add-employee');
        if (btnAddEmployee) {
            btnAddEmployee.addEventListener('click', () => {
                const roles = window.db.getTable('roles');
                const depts = window.db.getTable('departments');
                const users = window.db.getTable('users');

                const roleSelect = document.getElementById('employee-role-input');
                roleSelect.innerHTML = '';
                const currentUserRoleObj = roles.find(r => r.role_id === currentUser.role_id) || {};
                const currentUserLevel = currentUserRoleObj.role_level;
                roles.forEach(r => {
                    if (r.role_level === 5 && currentUserLevel !== 5) return; // Only Admin can assign Admin role
                    const opt = document.createElement('option');
                    opt.value = r.role_id;
                    opt.textContent = r.role_name;
                    roleSelect.appendChild(opt);
                });

                const deptSelect = document.getElementById('employee-dept-input');
                deptSelect.innerHTML = '';
                depts.forEach(d => {
                    const opt = document.createElement('option');
                    opt.value = d.department_id;
                    opt.textContent = d.department_name;
                    deptSelect.appendChild(opt);
                });

                const mgrSelect = document.getElementById('employee-manager-input');
                mgrSelect.innerHTML = '<option value="">-- No Manager --</option>';
                users.filter(u => u.status === 'Active').forEach(user => {
                    const opt = document.createElement('option');
                    opt.value = user.user_id;
                    opt.textContent = `${user.first_name} ${user.last_name} (${user.employee_code})`;
                    mgrSelect.appendChild(opt);
                });

                document.getElementById('employee-id-input').value = '';
                document.getElementById('employee-firstname-input').value = '';
                document.getElementById('employee-lastname-input').value = '';
                document.getElementById('employee-email-input').value = '';
                document.getElementById('employee-designation-input').value = '';
                document.getElementById('employee-role-input').value = '1';
                document.getElementById('employee-dept-input').value = '1';
                document.getElementById('employee-manager-input').value = '';

                document.getElementById('employee-modal-title').textContent = 'Add Employee';
                openModal('employee-form');
            });
        }

        // Employee form submit
        const employeeForm = document.getElementById('admin-employee-form');
        if (employeeForm) {
            employeeForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const idVal = document.getElementById('employee-id-input').value;
                const data = {
                    first_name: document.getElementById('employee-firstname-input').value.trim(),
                    last_name: document.getElementById('employee-lastname-input').value.trim(),
                    email: document.getElementById('employee-email-input').value.trim(),
                    designation: document.getElementById('employee-designation-input').value.trim(),
                    role_id: Number(document.getElementById('employee-role-input').value),
                    department_id: Number(document.getElementById('employee-dept-input').value),
                    manager_id: document.getElementById('employee-manager-input').value || null
                };

                try {
                    if (idVal) {
                        window.db.updateUser(currentUser.user_id, idVal, data);
                        showToast('Employee profile updated successfully', 'success');
                    } else {
                        window.db.createUser(currentUser.user_id, data);
                        showToast('New employee successfully registered', 'success');
                    }
                    closeModal('employee-form');
                    renderCurrentView();
                } catch (err) {
                    showToast(err.message, 'error');
                }
            });
        }
    }

    // --- ENTRANCE LOGIN ACTION ---
    function setupLoginAction() {
        const loginForm = document.getElementById('login-form');
        if (!loginForm) return;
        
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const usernameVal = document.getElementById('login-email').value.trim();
            const passwordVal = document.getElementById('login-password').value;
            
            const users = window.db.getTable('users');
            const matchedUser = users.find(u => 
                (u.email.toLowerCase() === usernameVal.toLowerCase() || u.employee_code.toLowerCase() === usernameVal.toLowerCase()) && 
                u.password === passwordVal
            );
            
            if (matchedUser) {
                logInUser(matchedUser.user_id, false);
                triggerConfettiExplosion();
                showToast(`Welcome back, ${matchedUser.first_name}!`, 'success');
            } else {
                showToast('Invalid credentials. Please try again.', 'error');
            }
        });
    }

    // --- KPI ANIMATED COUNT UP HELPER ---
    function animateCountUp(element, endVal, prefix = '', suffix = '') {
        if (!element) return;
        let cleanVal = endVal;
        if (typeof endVal === 'string') {
            cleanVal = parseFloat(endVal.replace(/[^\d.]/g, ''));
        }
        if (isNaN(cleanVal)) {
            element.textContent = endVal;
            return;
        }
        
        const start = 0;
        const duration = 1000;
        let startTimestamp = null;
        
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const ease = progress * (2 - progress);
            const current = Math.floor(ease * (cleanVal - start) + start);
            
            element.textContent = prefix + current.toLocaleString() + suffix;
            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                element.textContent = typeof endVal === 'string' ? endVal : prefix + endVal.toLocaleString() + suffix;
            }
        };
        window.requestAnimationFrame(step);
    }

    // --- LOGIN PARTICLES CONSTELLATION ANIMATION ---
    function initParticlesConstellation() {
        const canvas = document.getElementById('login-particles-canvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const container = document.querySelector('.login-left-pane');
        if (!container) return;
        
        let width = canvas.width = container.offsetWidth;
        let height = canvas.height = container.offsetHeight;
        
        const particles = [];
        const particleCount = 45;
        const connectionDistance = 100;
        const mouse = { x: null, y: null, radius: 150 };
        
        // Handle resize
        window.addEventListener('resize', () => {
            if (container.offsetWidth && container.offsetHeight) {
                width = canvas.width = container.offsetWidth;
                height = canvas.height = container.offsetHeight;
            }
        });
        
        // Track mouse movement relative to left pane container
        container.addEventListener('mousemove', (e) => {
            const rect = container.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        });
        
        container.addEventListener('mouseleave', () => {
            mouse.x = null;
            mouse.y = null;
        });
        
        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = (Math.random() - 0.5) * 0.4; // slow movements
                this.vy = (Math.random() - 0.5) * 0.4;
                this.radius = Math.random() * 1.5 + 1;
            }
            
            update() {
                this.x += this.vx;
                this.y += this.vy;
                
                // Bounce off edges
                if (this.x < 0 || this.x > width) this.vx *= -1;
                if (this.y < 0 || this.y > height) this.vy *= -1;
            }
            
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
                ctx.fill();
            }
        }
        
        // Initialize
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
        
        function drawLines() {
            for (let i = 0; i < particles.length; i++) {
                const p1 = particles[i];
                
                // Connection to mouse
                if (mouse.x !== null && mouse.y !== null) {
                    const dx = p1.x - mouse.x;
                    const dy = p1.y - mouse.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < mouse.radius) {
                        const alpha = (1 - dist / mouse.radius) * 0.25;
                        ctx.beginPath();
                        ctx.moveTo(p1.x, p1.y);
                        ctx.lineTo(mouse.x, mouse.y);
                        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
                
                // Connections between particles
                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dx = p1.x - p2.x;
                    const dy = p1.y - p2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    
                    if (dist < connectionDistance) {
                        const alpha = (1 - dist / connectionDistance) * 0.12;
                        ctx.beginPath();
                        ctx.moveTo(p1.x, p1.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
                        ctx.lineWidth = 0.3;
                        ctx.stroke();
                    }
                }
            }
        }
        
        function animate() {
            ctx.clearRect(0, 0, width, height);
            
            particles.forEach(p => {
                p.update();
                p.draw();
            });
            
            drawLines();
            
            requestAnimationFrame(animate);
        }
        
        animate();
    }

    // Modal helpers setup
    setupModalCloseEvents();

    // Start App
    init();

});

