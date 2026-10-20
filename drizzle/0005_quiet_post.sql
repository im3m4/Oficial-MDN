CREATE TABLE `consent_choice_counts` (
	`day` text NOT NULL,
	`choice` text NOT NULL,
	`count` integer DEFAULT 0 NOT NULL,
	PRIMARY KEY(`day`, `choice`)
);
