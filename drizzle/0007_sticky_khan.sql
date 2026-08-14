CREATE TABLE `escalation_reviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reviewId` varchar(96) NOT NULL,
	`eventId` varchar(64) NOT NULL,
	`tokenHash` varchar(64) NOT NULL,
	`status` enum('PENDING','APPROVED','DENIED') NOT NULL DEFAULT 'PENDING',
	`expiresAt` timestamp NOT NULL,
	`resolvedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `escalation_reviews_id` PRIMARY KEY(`id`),
	CONSTRAINT `escalation_reviews_reviewId_unique` UNIQUE(`reviewId`),
	CONSTRAINT `escalation_reviews_eventId_unique` UNIQUE(`eventId`)
);
