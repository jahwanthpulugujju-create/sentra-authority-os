CREATE TABLE `capabilities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`capabilityId` varchar(96) NOT NULL,
	`resourceId` int NOT NULL,
	`requestHash` varchar(64) NOT NULL,
	`payload` text NOT NULL,
	`signature` varchar(64) NOT NULL,
	`status` enum('ISSUED','CONSUMED','EXPIRED','REJECTED') NOT NULL DEFAULT 'ISSUED',
	`issuedAt` timestamp NOT NULL,
	`expiresAt` timestamp NOT NULL,
	`consumedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `capabilities_id` PRIMARY KEY(`id`),
	CONSTRAINT `capabilities_capabilityId_unique` UNIQUE(`capabilityId`)
);
