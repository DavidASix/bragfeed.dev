import "server-only"; // Ensure this file is only run on the server
import { db } from "@/schema/db";
import { and, ColumnBaseConfig, eq } from "drizzle-orm";
import { PgColumn, PgTable } from "drizzle-orm/pg-core";

interface SerialColumn extends ColumnBaseConfig<"number", "PgSerial"> {
  dataType: "number";
  columnType: "PgSerial";
}

interface UuidColumn extends ColumnBaseConfig<"string", "PgUUID"> {
  dataType: "string";
  columnType: "PgUUID";
}

interface TextColumn extends ColumnBaseConfig<"string", "PgText"> {
  dataType: "string";
  columnType: "PgText";
}

export type OwnedTable = PgTable & {
  id: PgColumn<SerialColumn | UuidColumn>;
  user_id: PgColumn<TextColumn>;
};

/**
 * This function checks if a user owns a specific item in a given table. It should be called before any
 * CRUD operation to ensure that the user has the necessary permissions to modify or access the item.
 *
 * @param userId - The ID of the user to check ownership for, which is a TEXT UUID
 * @param itemId - The ID of the item to check ownership for, which is a serial number or UUID
 * @param table  - The PG Table to check ownership against
 * @returns - Boolean indicating whether the user owns the item
 */
export async function userHasOwnership(
  userId: string,
  itemId: number | string,
  table: OwnedTable,
): Promise<boolean> {
  try {
    const ownership = await db
      .select()
      .from(table)
      .where(and(eq(table.user_id, userId), eq(table.id, itemId)))
      .limit(1);

    return ownership.length > 0;
  } catch (error) {
    console.error("Error checking user ownership:", error);
    return false;
  }
}
