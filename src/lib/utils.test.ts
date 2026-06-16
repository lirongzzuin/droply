import { describe, it, expect } from "vitest";
import { formatKRW, formatCount, timeAgo, countdownTo, countdownLabel, isEndingSoon } from "./utils";

describe("formatKRW", () => {
  it("천 단위 구분 + 원화 기호", () => {
    expect(formatKRW(2450000)).toBe("₩2,450,000");
    expect(formatKRW(0)).toBe("₩0");
    expect(formatKRW(null)).toBe("—");
  });
});

describe("formatCount", () => {
  it("1000 미만은 그대로, 이상은 K 축약", () => {
    expect(formatCount(842)).toBe("842");
    expect(formatCount(1204)).toBe("1.2K");
    expect(formatCount(2100)).toBe("2.1K");
    expect(formatCount(12400)).toBe("12K");
  });
});

describe("timeAgo", () => {
  const now = 1_000_000_000_000;
  it("상대 시간 라벨", () => {
    expect(timeAgo(new Date(now).toISOString(), now)).toBe("방금");
    expect(timeAgo(new Date(now - 5 * 60000).toISOString(), now)).toBe("5분 전");
    expect(timeAgo(new Date(now - 3 * 3600000).toISOString(), now)).toBe("3시간 전");
    expect(timeAgo(new Date(now - 2 * 86400000).toISOString(), now)).toBe("2일 전");
  });
});

describe("countdownTo / label", () => {
  const now = 1_000_000_000_000;
  it("남은 시간을 분해한다", () => {
    const cd = countdownTo(new Date(now + (2 * 86400 + 3 * 3600 + 4 * 60 + 5) * 1000).toISOString(), now);
    expect(cd).toMatchObject({ days: 2, hours: 3, minutes: 4, seconds: 5, done: false });
  });
  it("지난 시각은 done=true", () => {
    expect(countdownTo(new Date(now - 1000).toISOString(), now).done).toBe(true);
  });
  it("라벨: 1일 이상은 d일 h시간, 이내는 HH:MM:SS", () => {
    expect(countdownLabel(countdownTo(new Date(now + 50 * 3600000).toISOString(), now))).toMatch(/일/);
    expect(countdownLabel(countdownTo(new Date(now + 42 * 60000 + 18000).toISOString(), now))).toBe("00:42:18");
  });
  it("isEndingSoon: 24시간 이내", () => {
    expect(isEndingSoon(countdownTo(new Date(now + 23 * 3600000).toISOString(), now))).toBe(true);
    expect(isEndingSoon(countdownTo(new Date(now + 25 * 3600000).toISOString(), now))).toBe(false);
  });
});
