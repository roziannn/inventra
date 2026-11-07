CREATE TABLE "CORE_Session" (
	"Id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"UserId" uuid NOT NULL,
	"TokenHash" text NOT NULL,
	"ExpiresAt" timestamp with time zone NOT NULL,
	"CreatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	"RevokedAt" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "CORE_Session" ADD CONSTRAINT "CORE_Session_UserId_CORE_User_Id_fk" FOREIGN KEY ("UserId") REFERENCES "public"."CORE_User"("Id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "UX_CORE_Session_TokenHash" ON "CORE_Session" USING btree ("TokenHash");--> statement-breakpoint
CREATE INDEX "IX_CORE_Session_UserId" ON "CORE_Session" USING btree ("UserId");--> statement-breakpoint
CREATE INDEX "IX_CORE_Session_ExpiresAt" ON "CORE_Session" USING btree ("ExpiresAt");