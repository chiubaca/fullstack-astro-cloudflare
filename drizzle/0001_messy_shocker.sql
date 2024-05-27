ALTER TABLE `todo` ADD `image_ref` text;--> statement-breakpoint
CREATE UNIQUE INDEX `todo_image_ref_unique` ON `todo` (`image_ref`);