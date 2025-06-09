import { hashPassword, generateResetToken, isTokenExpired } from "@/utils/auth";
import { compare } from "bcryptjs";

describe("auth utils", () => {
  describe("hashPassword", () => {
    it("should return a bcrypt hash of the password", async () => {
      const password = "myStrongPassword";
      const hashed = await hashPassword(password);

      expect(typeof hashed).toBe("string");
      expect(hashed).toMatch(/^\$2[abxy]\$.{56}$/);

      const match = await compare(password, hashed);
      expect(match).toBe(true);
    });
  });

  describe("generateResetToken", () => {
    it("should return a 64-character hex string", () => {
      const token = generateResetToken();

      expect(typeof token).toBe("string");
      expect(token).toMatch(/^[a-f0-9]{64}$/);
    });

    it("should generate different tokens each time", () => {
      const token1 = generateResetToken();
      const token2 = generateResetToken();

      expect(token1).not.toBe(token2);
    });
  });

  describe("isTokenExpired", () => {
    it("should return true for past dates", () => {
      const past = new Date(Date.now() - 10000);
      expect(isTokenExpired(past)).toBe(true);
    });

    it("should return false for future dates", () => {
      const future = new Date(Date.now() + 10000);
      expect(isTokenExpired(future)).toBe(false);
    });
  });
});

