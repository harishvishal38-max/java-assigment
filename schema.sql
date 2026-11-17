-- ====================================================================
-- Complaint Registration and Tracking System - SQLite Database Schema
-- File: complaints.db
-- ====================================================================

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('CUSTOMER', 'ADMIN'))
);

CREATE TABLE IF NOT EXISTS complaints (
    id INTEGER PRIMARY KEY,
    customer_name TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    priority TEXT NOT NULL CHECK(priority IN ('LOW', 'MEDIUM', 'HIGH')),
    date_filed TEXT NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('REGISTERED', 'IN_PROGRESS', 'RESOLVED')) DEFAULT 'REGISTERED',
    remarks TEXT DEFAULT 'Awaiting review'
);

-- Initial Administrator Account
INSERT OR IGNORE INTO users (name, password, role) VALUES ('admin', 'admin123', 'ADMIN');

-- Initial Demo Customers
INSERT OR IGNORE INTO users (name, password, role) VALUES ('dinesh', 'dinesh123', 'CUSTOMER');
INSERT OR IGNORE INTO users (name, password, role) VALUES ('ram', 'ram123', 'CUSTOMER');
INSERT OR IGNORE INTO users (name, password, role) VALUES ('sita', 'sita123', 'CUSTOMER');
INSERT OR IGNORE INTO users (name, password, role) VALUES ('priya', 'priya123', 'CUSTOMER');
INSERT OR IGNORE INTO users (name, password, role) VALUES ('raj', 'raj123', 'CUSTOMER');

-- Initial Seed Complaints from Academic PDF Report
INSERT OR IGNORE INTO complaints (id, customer_name, category, description, priority, date_filed, status, remarks)
VALUES 
(1001, 'dinesh', 'Service', 'Internet connection is down since two days', 'HIGH', '2026-11-09', 'IN_PROGRESS', 'Technician assigned'),
(1002, 'ram', 'Billing', 'Charged twice for monthly bill', 'MEDIUM', '2026-11-09', 'RESOLVED', 'Refund processed'),
(1003, 'sita', 'Product', 'Received a damaged product', 'LOW', '2026-11-09', 'IN_PROGRESS', 'Replacement being arranged'),
(1004, 'priya', 'Service', 'Mobile network signal is very weak', 'MEDIUM', '2026-11-09', 'REGISTERED', 'Awaiting review'),
(1005, 'raj', 'Other', 'Unable to update address in profile', 'LOW', '2026-11-09', 'REGISTERED', 'Awaiting review');
