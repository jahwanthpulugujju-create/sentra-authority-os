CREATE TABLE `authority_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventId` varchar(64) NOT NULL,
	`scenario` varchar(64) NOT NULL,
	`outcome` enum('ALLOW','DENY','ESCALATE','FREEZE') NOT NULL,
	`requestId` varchar(64) NOT NULL,
	`deviceId` int NOT NULL,
	`canonicalRequest` text NOT NULL,
	`requestHash` varchar(64) NOT NULL,
	`capability` text,
	`capabilityHash` varchar(64),
	`gatewayResult` varchar(160) NOT NULL,
	`executionResult` varchar(160) NOT NULL,
	`actuatorChanged` int NOT NULL DEFAULT 0,
	`previousHash` varchar(64) NOT NULL,
	`recordHash` varchar(64) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `authority_events_id` PRIMARY KEY(`id`),
	CONSTRAINT `authority_events_eventId_unique` UNIQUE(`eventId`),
	CONSTRAINT `authority_events_recordHash_unique` UNIQUE(`recordHash`)
);
--> statement-breakpoint
CREATE TABLE `demo_devices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(80) NOT NULL,
	`name` varchar(120) NOT NULL,
	`deviceType` varchar(80) NOT NULL,
	`location` varchar(120) NOT NULL,
	`online` int NOT NULL DEFAULT 1,
	`actuatorState` int NOT NULL DEFAULT 0,
	`temperatureMilliC` int NOT NULL DEFAULT 28600,
	`lastSeenAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `demo_devices_id` PRIMARY KEY(`id`),
	CONSTRAINT `demo_devices_slug_unique` UNIQUE(`slug`)
);
