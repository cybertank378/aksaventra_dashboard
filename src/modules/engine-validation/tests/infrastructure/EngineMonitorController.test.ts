import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { EngineMonitorServices } from "@/modules/engine-validation/application/services/EngineMonitorServices";
import { EngineMonitorController } from "@/modules/engine-validation/infrastructure/http/EngineMonitorController";
import { createMockEngineMonitorRepository } from "@/modules/engine-validation/tests/mocks/mockEngineMonitorFactories";

describe("EngineMonitorController (Triple A Pattern)", () => {
  it("should return 200 with summary data on getSummary", async () => {
    // Arrange
    const mockRepo = createMockEngineMonitorRepository();
    const services = new EngineMonitorServices(mockRepo);
    const controller = new EngineMonitorController(services);
    const req = new NextRequest("http://localhost:3000/api/v1/engine/monitor/summary");

    // Act
    const res = await controller.getSummary(req);
    const json = await res.json();

    // Assert
    expect(res.status).toBe(200);
    expect(json.requestsLast15m).toBe(342);
  });

  it("should return 200 with live feed data on getFeed", async () => {
    // Arrange
    const mockRepo = createMockEngineMonitorRepository();
    const services = new EngineMonitorServices(mockRepo);
    const controller = new EngineMonitorController(services);
    const req = new NextRequest("http://localhost:3000/api/v1/engine/monitor/feed?group=ALL");

    // Act
    const res = await controller.getFeed(req);
    const json = await res.json();

    // Assert
    expect(res.status).toBe(200);
    expect(json.items).toBeDefined();
    expect(json.pagination).toBeDefined();
  });

  it("should return 200 with verification result on verifyChecksum", async () => {
    // Arrange
    const mockRepo = createMockEngineMonitorRepository();
    const services = new EngineMonitorServices(mockRepo);
    const controller = new EngineMonitorController(services);
    const body = {
      version: "v2.2.2",
      sha256Hash: "4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945",
    };
    const req = new NextRequest("http://localhost:3000/api/v1/engine/integrity/verify", {
      method: "POST",
      body: JSON.stringify(body),
    });

    // Act
    const res = await controller.verifyChecksum(req);
    const json = await res.json();

    // Assert
    expect(res.status).toBe(200);
    expect(json.outcome).toBe("VALID");
    expect(json.isTrusted).toBe(true);
  });

  it("should return 400 when verifyChecksum payload is invalid", async () => {
    // Arrange
    const mockRepo = createMockEngineMonitorRepository();
    const services = new EngineMonitorServices(mockRepo);
    const controller = new EngineMonitorController(services);
    const req = new NextRequest("http://localhost:3000/api/v1/engine/integrity/verify", {
      method: "POST",
      body: JSON.stringify({ version: "" }),
    });

    // Act
    const res = await controller.verifyChecksum(req);
    const json = await res.json();

    // Assert
    expect(res.status).toBe(400);
    expect(json.errors).toBeDefined();
  });

  it("should return 200 on patchStatus when valid payload and id are passed", async () => {
    // Arrange
    const mockRepo = createMockEngineMonitorRepository();
    const services = new EngineMonitorServices(mockRepo);
    const controller = new EngineMonitorController(services);
    const req = new NextRequest("http://localhost:3000/api/v1/engine/integrity/rel-test-1/status", {
      method: "PATCH",
      headers: {
        "x-auth-user-id": "admin-1",
      },
      body: JSON.stringify({ isActive: false, reason: "Security revoked" }),
    });

    // Act
    const res = await controller.patchStatus(req, {
      params: Promise.resolve({ id: "rel-test-1" }),
    });
    const json = await res.json();

    // Assert
    expect(res.status).toBe(200);
    expect(json.isActive).toBe(false);
  });
});
