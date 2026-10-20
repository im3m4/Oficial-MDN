ALTER TABLE `contact_submissions` ADD `reference` text;--> statement-breakpoint
CREATE UNIQUE INDEX `idx_contact_submissions_reference` ON `contact_submissions` (`reference`);