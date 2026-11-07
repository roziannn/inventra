CREATE TABLE "CORE_Role" (
	"Id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"RoleCode" varchar(50) NOT NULL,
	"RoleName" varchar(100) NOT NULL,
	"Description" text,
	"IsSystem" boolean DEFAULT false NOT NULL,
	"IsActive" boolean DEFAULT true NOT NULL,
	"CreatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	"CreatedBy" uuid,
	"UpdatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	"UpdatedBy" uuid
);
--> statement-breakpoint
CREATE TABLE "CORE_UserRole" (
	"UserId" uuid NOT NULL,
	"RoleId" uuid NOT NULL,
	"AssignedAt" timestamp with time zone DEFAULT now() NOT NULL,
	"AssignedBy" uuid,
	CONSTRAINT "PK_CORE_UserRole" PRIMARY KEY("UserId","RoleId")
);
--> statement-breakpoint
ALTER TABLE "CORE_UserRole" ADD CONSTRAINT "CORE_UserRole_UserId_CORE_User_Id_fk" FOREIGN KEY ("UserId") REFERENCES "public"."CORE_User"("Id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "CORE_UserRole" ADD CONSTRAINT "CORE_UserRole_RoleId_CORE_Role_Id_fk" FOREIGN KEY ("RoleId") REFERENCES "public"."CORE_Role"("Id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "UX_CORE_Role_RoleCode" ON "CORE_Role" USING btree ("RoleCode");--> statement-breakpoint
CREATE UNIQUE INDEX "UX_CORE_Role_RoleName" ON "CORE_Role" USING btree ("RoleName");--> statement-breakpoint
CREATE INDEX "IX_CORE_UserRole_RoleId" ON "CORE_UserRole" USING btree ("RoleId");