CREATE TABLE `message` (
	`id` integer PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`text` text NOT NULL,
	`timestamp` text DEFAULT (current_timestamp) NOT NULL,
	`image_ref` text,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	`timestamp` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`oauth_id` text(255) NOT NULL,
	`oauth_type` text NOT NULL,
	`avatar_url` text,
	`user_name` text NOT NULL,
	`full_name` text NOT NULL,
	`email` text NOT NULL,
	`timestamp` text DEFAULT (current_timestamp) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `message_image_ref_unique` ON `message` (`image_ref`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_oauth_id_unique` ON `user` (`oauth_id`);