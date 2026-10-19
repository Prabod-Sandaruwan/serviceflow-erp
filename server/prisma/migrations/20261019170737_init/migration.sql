-- CreateTable
CREATE TABLE `employees` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `full_name` VARCHAR(191) NOT NULL,
    `job_title` VARCHAR(191) NULL,
    `department` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `password_hash` VARCHAR(191) NOT NULL,
    `role` ENUM('ADMIN', 'MANAGER', 'STAFF') NOT NULL DEFAULT 'STAFF',
    `employee_id` BIGINT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `must_change_password` BOOLEAN NOT NULL DEFAULT true,
    `last_login_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    UNIQUE INDEX `users_employee_id_key`(`employee_id`),
    INDEX `users_role_idx`(`role`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `clients` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `client_type` ENUM('INDIVIDUAL', 'COMPANY') NOT NULL DEFAULT 'COMPANY',
    `display_name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `address` TEXT NULL,
    `registration_number` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `clients_display_name_idx`(`display_name`),
    INDEX `clients_email_idx`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `leads` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `owner_id` BIGINT NOT NULL,
    `status` ENUM('NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL_SENT', 'CONVERTED', 'LOST') NOT NULL DEFAULT 'NEW',
    `lost_reason` VARCHAR(191) NULL,
    `expected_value` DECIMAL(14, 2) NULL,
    `converted_client_id` BIGINT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `leads_converted_client_id_key`(`converted_client_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `follow_ups` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `lead_id` BIGINT NOT NULL,
    `follow_up_date` DATETIME(3) NOT NULL,
    `type` ENUM('CALL', 'EMAIL', 'MEETING', 'OTHER') NOT NULL,
    `status` ENUM('SCHEDULED', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'SCHEDULED',
    `next_follow_up_date` DATETIME(3) NULL,
    `created_by` BIGINT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `follow_ups_lead_id_follow_up_date_idx`(`lead_id`, `follow_up_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `quotations` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `quotation_number` VARCHAR(20) NOT NULL,
    `client_id` BIGINT UNSIGNED NOT NULL,
    `lead_id` BIGINT UNSIGNED NULL,
    `revision_of_id` BIGINT UNSIGNED NULL,
    `title` VARCHAR(160) NOT NULL,
    `status` ENUM('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'SENT', 'ACCEPTED', 'DECLINED') NOT NULL DEFAULT 'DRAFT',
    `quotation_date` DATE NOT NULL,
    `valid_until` DATE NOT NULL,
    `subtotal` DECIMAL(14, 2) NOT NULL DEFAULT 0,
    `tax_type` VARCHAR(20) NULL,
    `tax_rate` DECIMAL(5, 2) NULL,
    `tax_amount` DECIMAL(14, 2) NOT NULL DEFAULT 0,
    `tax_reference` VARCHAR(60) NULL,
    `total` DECIMAL(14, 2) NOT NULL,
    `created_by` BIGINT UNSIGNED NOT NULL,
    `submitted_at` DATETIME(3) NULL,
    `approved_by` BIGINT UNSIGNED NULL,
    `decided_at` DATETIME(3) NULL,
    `rejection_reason` VARCHAR(500) NULL,
    `sent_at` DATETIME(3) NULL,
    `responded_at` DATETIME(3) NULL,
    `response_note` VARCHAR(500) NULL,
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `quotations_quotation_number_key`(`quotation_number`),
    INDEX `quotations_status_created_by_idx`(`status`, `created_by`),
    INDEX `quotations_client_id_idx`(`client_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `quotation_items` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `quotation_id` BIGINT UNSIGNED NOT NULL,
    `line_no` SMALLINT UNSIGNED NOT NULL,
    `description` VARCHAR(255) NOT NULL,
    `quantity` DECIMAL(12, 2) NOT NULL,
    `unit_price` DECIMAL(14, 2) NOT NULL,
    `line_amount` DECIMAL(14, 2) NOT NULL,

    INDEX `quotation_items_quotation_id_idx`(`quotation_id`),
    UNIQUE INDEX `quotation_items_quotation_id_line_no_key`(`quotation_id`, `line_no`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `projects` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `project_code` VARCHAR(20) NOT NULL,
    `quotation_id` BIGINT UNSIGNED NOT NULL,
    `client_id` BIGINT UNSIGNED NOT NULL,
    `name` VARCHAR(160) NOT NULL,
    `description` TEXT NULL,
    `status` ENUM('PLANNED', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PLANNED',
    `start_date` DATE NULL,
    `end_date` DATE NULL,
    `budget_amount` DECIMAL(14, 2) NOT NULL,
    `cancel_reason` VARCHAR(500) NULL,
    `created_by` BIGINT UNSIGNED NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `projects_project_code_key`(`project_code`),
    UNIQUE INDEX `projects_quotation_id_key`(`quotation_id`),
    INDEX `projects_client_id_idx`(`client_id`),
    INDEX `projects_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `milestones` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `project_id` BIGINT UNSIGNED NOT NULL,
    `name` VARCHAR(160) NOT NULL,
    `description` TEXT NULL,
    `sort_order` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    `status` ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED', 'APPROVED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `billing_amount` DECIMAL(14, 2) NOT NULL,
    `due_date` DATE NULL,
    `completed_at` DATETIME(3) NULL,
    `approved_by` BIGINT UNSIGNED NULL,
    `approved_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `milestones_project_id_idx`(`project_id`),
    INDEX `milestones_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tasks` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `project_id` BIGINT UNSIGNED NOT NULL,
    `milestone_id` BIGINT UNSIGNED NULL,
    `title` VARCHAR(160) NOT NULL,
    `description` TEXT NULL,
    `priority` ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT') NOT NULL DEFAULT 'MEDIUM',
    `status` ENUM('TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED') NOT NULL DEFAULT 'TODO',
    `due_date` DATE NULL,
    `assignee_id` BIGINT UNSIGNED NULL,
    `created_by` BIGINT UNSIGNED NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `tasks_assignee_id_status_idx`(`assignee_id`, `status`),
    INDEX `tasks_project_id_status_idx`(`project_id`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `invoices` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `invoice_number` VARCHAR(20) NOT NULL,
    `project_id` BIGINT UNSIGNED NOT NULL,
    `milestone_id` BIGINT UNSIGNED NOT NULL,
    `active_milestone_key` BIGINT UNSIGNED NULL,
    `status` ENUM('DRAFT', 'ISSUED', 'PARTIALLY_PAID', 'PAID', 'CANCELLED') NOT NULL DEFAULT 'DRAFT',
    `issue_date` DATE NULL,
    `due_date` DATE NULL,
    `subtotal` DECIMAL(14, 2) NOT NULL,
    `tax_type` VARCHAR(20) NULL,
    `tax_rate` DECIMAL(5, 2) NULL,
    `tax_amount` DECIMAL(14, 2) NOT NULL DEFAULT 0,
    `tax_reference` VARCHAR(60) NULL,
    `total` DECIMAL(14, 2) NOT NULL,
    `notes` TEXT NULL,
    `created_by` BIGINT UNSIGNED NOT NULL,
    `issued_by` BIGINT UNSIGNED NULL,
    `issued_at` DATETIME(3) NULL,
    `cancelled_by` BIGINT UNSIGNED NULL,
    `cancelled_at` DATETIME(3) NULL,
    `cancel_reason` VARCHAR(500) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `invoices_invoice_number_key`(`invoice_number`),
    UNIQUE INDEX `invoices_active_milestone_key_key`(`active_milestone_key`),
    INDEX `invoices_project_id_idx`(`project_id`),
    INDEX `invoices_milestone_id_idx`(`milestone_id`),
    INDEX `invoices_status_due_date_idx`(`status`, `due_date`),
    INDEX `invoices_issue_date_idx`(`issue_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `invoice_items` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `invoice_id` BIGINT UNSIGNED NOT NULL,
    `line_no` SMALLINT UNSIGNED NOT NULL,
    `description` VARCHAR(255) NOT NULL,
    `quantity` DECIMAL(12, 2) NOT NULL,
    `unit_price` DECIMAL(14, 2) NOT NULL,
    `line_amount` DECIMAL(14, 2) NOT NULL,

    INDEX `invoice_items_invoice_id_idx`(`invoice_id`),
    UNIQUE INDEX `invoice_items_invoice_id_line_no_key`(`invoice_id`, `line_no`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payments` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `invoice_id` BIGINT UNSIGNED NOT NULL,
    `amount` DECIMAL(14, 2) NOT NULL,
    `method` ENUM('CASH', 'BANK_TRANSFER', 'CARD', 'OTHER') NOT NULL,
    `payment_date` DATE NOT NULL,
    `reference` VARCHAR(80) NULL,
    `note` VARCHAR(500) NULL,
    `status` ENUM('ACTIVE', 'VOIDED') NOT NULL DEFAULT 'ACTIVE',
    `idempotency_key` VARCHAR(64) NULL,
    `recorded_by` BIGINT UNSIGNED NOT NULL,
    `voided_by` BIGINT UNSIGNED NULL,
    `voided_at` DATETIME(3) NULL,
    `void_reason` VARCHAR(500) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `payments_idempotency_key_key`(`idempotency_key`),
    INDEX `payments_invoice_id_status_idx`(`invoice_id`, `status`),
    INDEX `payments_payment_date_idx`(`payment_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `expenses` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `project_id` BIGINT UNSIGNED NOT NULL,
    `category` ENUM('SOFTWARE_LICENSE', 'HOSTING_INFRASTRUCTURE', 'THIRD_PARTY_SERVICE', 'TRAVEL', 'EQUIPMENT', 'SUBCONTRACTOR', 'OTHER') NOT NULL,
    `description` VARCHAR(255) NOT NULL,
    `supplier` VARCHAR(120) NULL,
    `amount` DECIMAL(14, 2) NOT NULL,
    `expense_date` DATE NOT NULL,
    `status` ENUM('ACTIVE', 'VOIDED') NOT NULL DEFAULT 'ACTIVE',
    `recorded_by` BIGINT UNSIGNED NOT NULL,
    `voided_by` BIGINT UNSIGNED NULL,
    `voided_at` DATETIME(3) NULL,
    `void_reason` VARCHAR(500) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `expenses_project_id_expense_date_idx`(`project_id`, `expense_date`),
    INDEX `expenses_expense_date_idx`(`expense_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `audit_logs` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `actor_user_id` BIGINT UNSIGNED NULL,
    `actor_role` VARCHAR(20) NULL,
    `action` VARCHAR(60) NOT NULL,
    `entity_type` VARCHAR(40) NOT NULL,
    `entity_id` BIGINT UNSIGNED NULL,
    `before_json` JSON NULL,
    `after_json` JSON NULL,
    `request_id` CHAR(36) NULL,
    `ip_address` VARCHAR(45) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `audit_logs_entity_type_entity_id_idx`(`entity_type`, `entity_id`),
    INDEX `audit_logs_actor_user_id_created_at_idx`(`actor_user_id`, `created_at`),
    INDEX `audit_logs_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_employee_id_fkey` FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `leads` ADD CONSTRAINT `leads_owner_id_fkey` FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `leads` ADD CONSTRAINT `leads_converted_client_id_fkey` FOREIGN KEY (`converted_client_id`) REFERENCES `clients`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `follow_ups` ADD CONSTRAINT `follow_ups_lead_id_fkey` FOREIGN KEY (`lead_id`) REFERENCES `leads`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `follow_ups` ADD CONSTRAINT `follow_ups_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `quotations` ADD CONSTRAINT `quotations_client_id_fkey` FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `quotations` ADD CONSTRAINT `quotations_lead_id_fkey` FOREIGN KEY (`lead_id`) REFERENCES `leads`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `quotations` ADD CONSTRAINT `quotations_revision_of_id_fkey` FOREIGN KEY (`revision_of_id`) REFERENCES `quotations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `quotations` ADD CONSTRAINT `quotations_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `quotations` ADD CONSTRAINT `quotations_approved_by_fkey` FOREIGN KEY (`approved_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `quotation_items` ADD CONSTRAINT `quotation_items_quotation_id_fkey` FOREIGN KEY (`quotation_id`) REFERENCES `quotations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `projects` ADD CONSTRAINT `projects_quotation_id_fkey` FOREIGN KEY (`quotation_id`) REFERENCES `quotations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `projects` ADD CONSTRAINT `projects_client_id_fkey` FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `projects` ADD CONSTRAINT `projects_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `milestones` ADD CONSTRAINT `milestones_project_id_fkey` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `milestones` ADD CONSTRAINT `milestones_approved_by_fkey` FOREIGN KEY (`approved_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tasks` ADD CONSTRAINT `tasks_project_id_fkey` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tasks` ADD CONSTRAINT `tasks_milestone_id_fkey` FOREIGN KEY (`milestone_id`) REFERENCES `milestones`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tasks` ADD CONSTRAINT `tasks_assignee_id_fkey` FOREIGN KEY (`assignee_id`) REFERENCES `employees`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tasks` ADD CONSTRAINT `tasks_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_project_id_fkey` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_milestone_id_fkey` FOREIGN KEY (`milestone_id`) REFERENCES `milestones`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_issued_by_fkey` FOREIGN KEY (`issued_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_cancelled_by_fkey` FOREIGN KEY (`cancelled_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoice_items` ADD CONSTRAINT `invoice_items_invoice_id_fkey` FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_invoice_id_fkey` FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_recorded_by_fkey` FOREIGN KEY (`recorded_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_voided_by_fkey` FOREIGN KEY (`voided_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `expenses` ADD CONSTRAINT `expenses_project_id_fkey` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `expenses` ADD CONSTRAINT `expenses_recorded_by_fkey` FOREIGN KEY (`recorded_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `expenses` ADD CONSTRAINT `expenses_voided_by_fkey` FOREIGN KEY (`voided_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_actor_user_id_fkey` FOREIGN KEY (`actor_user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- ============================================================================
-- ServiceFlow ERP - Hand-crafted SQL additions (Task DB-009)
-- These pieces cannot be natively expressed in Prisma Schema:
-- 1. sessions table for express-mysql-session
-- 2. Domain CHECK constraints for financial & business invariants
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Sessions Table (Managed by express-mysql-session)
-- ----------------------------------------------------------------------------
CREATE TABLE `sessions` (
  `session_id` VARCHAR(128) COLLATE utf8mb4_bin NOT NULL,
  `expires` INT UNSIGNED NOT NULL,
  `data` MEDIUMTEXT COLLATE utf8mb4_bin,
  PRIMARY KEY (`session_id`),
  INDEX `idx_sessions_expires` (`expires`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 2. Business & Financial CHECK Constraints
-- ----------------------------------------------------------------------------

-- Leads: Expected value must be non-negative
ALTER TABLE `leads`
  ADD CONSTRAINT `chk_leads_expected_value_nonneg`
  CHECK (`expected_value` IS NULL OR `expected_value` >= 0);

-- Quotations: Date consistency, valid money, valid tax rates, and total integrity
ALTER TABLE `quotations`
  ADD CONSTRAINT `chk_quotations_valid_until_ge_date`
  CHECK (`valid_until` >= `quotation_date`),
  ADD CONSTRAINT `chk_quotations_subtotal_nonneg`
  CHECK (`subtotal` >= 0),
  ADD CONSTRAINT `chk_quotations_tax_rate_range`
  CHECK (`tax_rate` IS NULL OR (`tax_rate` >= 0 AND `tax_rate` <= 100)),
  ADD CONSTRAINT `chk_quotations_tax_amount_nonneg`
  CHECK (`tax_amount` >= 0),
  ADD CONSTRAINT `chk_quotations_total_nonneg`
  CHECK (`total` >= 0),
  ADD CONSTRAINT `chk_quotations_total_equals_subtotal_plus_tax`
  CHECK (`total` = `subtotal` + `tax_amount`);

-- Quotation Items: Line amount, quantity and unit price validation
ALTER TABLE `quotation_items`
  ADD CONSTRAINT `chk_quotation_items_quantity_pos`
  CHECK (`quantity` > 0),
  ADD CONSTRAINT `chk_quotation_items_unit_price_nonneg`
  CHECK (`unit_price` >= 0),
  ADD CONSTRAINT `chk_quotation_items_line_amount_nonneg`
  CHECK (`line_amount` >= 0);

-- Projects: Date ordering and budget non-negative
ALTER TABLE `projects`
  ADD CONSTRAINT `chk_projects_dates_order`
  CHECK (`end_date` IS NULL OR `start_date` IS NULL OR `end_date` >= `start_date`),
  ADD CONSTRAINT `chk_projects_budget_amount_nonneg`
  CHECK (`budget_amount` >= 0);

-- Milestones: Billing amount non-negative
ALTER TABLE `milestones`
  ADD CONSTRAINT `chk_milestones_billing_amount_nonneg`
  CHECK (`billing_amount` >= 0);

-- Invoices: Date ordering, valid money, valid tax rates, and total integrity
ALTER TABLE `invoices`
  ADD CONSTRAINT `chk_invoices_due_date_ge_issue_date`
  CHECK (`due_date` IS NULL OR `issue_date` IS NULL OR `due_date` >= `issue_date`),
  ADD CONSTRAINT `chk_invoices_subtotal_nonneg`
  CHECK (`subtotal` >= 0),
  ADD CONSTRAINT `chk_invoices_tax_rate_range`
  CHECK (`tax_rate` IS NULL OR (`tax_rate` >= 0 AND `tax_rate` <= 100)),
  ADD CONSTRAINT `chk_invoices_tax_amount_nonneg`
  CHECK (`tax_amount` >= 0),
  ADD CONSTRAINT `chk_invoices_total_nonneg`
  CHECK (`total` >= 0),
  ADD CONSTRAINT `chk_invoices_total_equals_subtotal_plus_tax`
  CHECK (`total` = `subtotal` + `tax_amount`);

-- Invoice Items: Line amount, quantity and unit price validation
ALTER TABLE `invoice_items`
  ADD CONSTRAINT `chk_invoice_items_quantity_pos`
  CHECK (`quantity` > 0),
  ADD CONSTRAINT `chk_invoice_items_unit_price_nonneg`
  CHECK (`unit_price` >= 0),
  ADD CONSTRAINT `chk_invoice_items_line_amount_nonneg`
  CHECK (`line_amount` >= 0);

-- Payments: Amount must be strictly greater than zero
ALTER TABLE `payments`
  ADD CONSTRAINT `chk_payments_amount_pos`
  CHECK (`amount` > 0);

-- Expenses: Amount must be strictly greater than zero
ALTER TABLE `expenses`
  ADD CONSTRAINT `chk_expenses_amount_pos`
  CHECK (`amount` > 0);