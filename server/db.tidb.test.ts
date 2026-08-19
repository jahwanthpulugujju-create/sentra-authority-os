import { describe, expect, it } from "vitest";
import { getDatabasePoolOptions } from "./db";

describe("TiDB Cloud database connection configuration", () => {
  it("requires TLS certificate verification for TiDB Cloud endpoints", () => {
    expect(
      getDatabasePoolOptions(
        "mysql://tenant.root:secret@gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000/sentra",
      ),
    ).toMatchObject({
      host: "gateway01.ap-southeast-1.prod.aws.tidbcloud.com",
      port: 4000,
      user: "tenant.root",
      database: "sentra",
      ssl: { rejectUnauthorized: true },
    });
  });

  it("does not impose TiDB-specific TLS options on non-TiDB MySQL connection strings", () => {
    expect(getDatabasePoolOptions("mysql://user:secret@db.example.test:3306/sentra")).toEqual({
      host: "db.example.test",
      port: 3306,
      user: "user",
      password: "secret",
      database: "sentra",
    });
  });
});
