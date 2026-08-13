CREATE TABLE `protected_resources` (
	`id` int AUTO_INCREMENT NOT NULL,
	`resourceKey` varchar(80) NOT NULL,
	`name` varchar(120) NOT NULL,
	`toolType` varchar(80) NOT NULL,
	`workspace` varchar(120) NOT NULL,
	`available` int NOT NULL DEFAULT 1,
	`executionState` int NOT NULL DEFAULT 0,
	`contextScore` int NOT NULL DEFAULT 72,
	`lastCheckedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `protected_resources_id` PRIMARY KEY(`id`),
	CONSTRAINT `protected_resources_resourceKey_unique` UNIQUE(`resourceKey`)
);
--> statement-breakpoint
DROP TABLE `demo_devices`;--> statement-breakpoint
ALTER TABLE `authority_events` RENAME COLUMN `deviceId` TO `resourceId`;--> statement-breakpoint
ALTER TABLE `authority_events` RENAME COLUMN `actuatorChanged` TO `executionChanged`;