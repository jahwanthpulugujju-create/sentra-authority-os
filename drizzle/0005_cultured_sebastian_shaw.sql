ALTER TABLE `capabilities` ADD `keyId` varchar(96) DEFAULT 'sentra-hmac-k2026-08' NOT NULL;--> statement-breakpoint
ALTER TABLE `capabilities` ADD `keyVersion` varchar(32) DEFAULT '2026.08' NOT NULL;--> statement-breakpoint
ALTER TABLE `capabilities` ADD `keyStatus` varchar(16) DEFAULT 'ACTIVE' NOT NULL;--> statement-breakpoint
ALTER TABLE `capabilities` ADD `keyRotationDueAt` timestamp;