CREATE TABLE `authority_outbox` (
	`id` int AUTO_INCREMENT NOT NULL,
	`outboxId` varchar(64) NOT NULL,
	`sourceEventId` varchar(64) NOT NULL,
	`eventType` varchar(80) NOT NULL,
	`schemaVersion` varchar(16) NOT NULL DEFAULT '1.0',
	`tenantId` varchar(96) NOT NULL,
	`correlationId` varchar(96) NOT NULL,
	`causationId` varchar(96),
	`payload` text NOT NULL,
	`payloadHash` varchar(64) NOT NULL,
	`status` enum('PENDING','PUBLISHED','FAILED') NOT NULL DEFAULT 'PENDING',
	`attempts` int NOT NULL DEFAULT 0,
	`publishedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `authority_outbox_id` PRIMARY KEY(`id`),
	CONSTRAINT `authority_outbox_outboxId_unique` UNIQUE(`outboxId`),
	CONSTRAINT `authority_outbox_sourceEventId_unique` UNIQUE(`sourceEventId`)
);
