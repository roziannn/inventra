CREATE TABLE "CORE_User" (
	"Id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"Username" varchar(50) NOT NULL,
	"Email" varchar(150) NOT NULL,
	"PasswordHash" text NOT NULL,
	"FullName" varchar(150) NOT NULL,
	"IsActive" boolean DEFAULT true NOT NULL,
	"LastLoginAt" timestamp with time zone,
	"CreatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	"CreatedBy" uuid,
	"UpdatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	"UpdatedBy" uuid
);
--> statement-breakpoint
CREATE UNIQUE INDEX "UX_CORE_User_Username" ON "CORE_User" USING btree ("Username");--> statement-breakpoint
CREATE UNIQUE INDEX "UX_CORE_User_Email" ON "CORE_User" USING btree ("Email");