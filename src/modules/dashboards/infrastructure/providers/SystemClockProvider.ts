import type { ClockInterface } from "@/modules/dashboards/domain/interfaces/ClockInterface";

export class SystemClockProvider implements ClockInterface {
  public now(): Date {
    return new Date();
  }
}
