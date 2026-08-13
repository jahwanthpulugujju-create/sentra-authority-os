ALTER TABLE `authority_events` ADD `approval` text;--> statement-breakpoint
ALTER TABLE `authority_events` ADD `approvalHash` varchar(64);--> statement-breakpoint
ALTER TABLE `authority_events` ADD `decisionLatencyMs` int DEFAULT 0 NOT NULL;