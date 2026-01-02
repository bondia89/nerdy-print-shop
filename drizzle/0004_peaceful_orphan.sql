CREATE TABLE `admin_permissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`email` varchar(320) NOT NULL,
	`canManageProducts` boolean NOT NULL DEFAULT false,
	`canManageOrders` boolean NOT NULL DEFAULT false,
	`canManageCoupons` boolean NOT NULL DEFAULT false,
	`canManageCategories` boolean NOT NULL DEFAULT false,
	`canViewAnalytics` boolean NOT NULL DEFAULT false,
	`canManageUsers` boolean NOT NULL DEFAULT false,
	`grantedBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `admin_permissions_id` PRIMARY KEY(`id`),
	CONSTRAINT `admin_permissions_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
ALTER TABLE `orders` MODIFY COLUMN `paymentMethod` enum('whatsapp') NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` DROP COLUMN `pixCode`;