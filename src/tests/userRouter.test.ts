import { userRouter } from "@/server/routers/user";
import { prisma } from "@/lib/prisma";
import { addHours } from "date-fns";
import { hashPassword } from "@/utils/auth";

jest.mock("@/lib/prisma", () => ({
  prisma: require("@mocks/prisma").prisma,
}));

jest.mock("date-fns", () => ({
  addHours: jest.fn((date: Date, hours: number) => new Date(date.getTime() + hours * 3600 * 1000)),
}));

jest.mock("@/utils/auth", () => ({
  hashPassword: jest.fn((s: string) => "hashed-" + s),
  generateResetToken: jest.fn(() => "random-token"),
  isTokenExpired: jest.fn((date: Date) => date < new Date()),
}));

describe("userRouter", () => {
  const ctx = {
    req: {
      headers: new Map([["x-forwarded-host", "http://localhost:3000"]]),
      get: (key: string) => {
        if (key === "x-forwarded-host") return "http://localhost:3000";
        return null;
      }
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("register", () => {
    it("successfully registers a new user", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.user.create as jest.Mock).mockResolvedValue({
        id: "user-1",
        email: "test@example.com",
      });

      const caller = userRouter.createCaller(ctx as any);

      const res = await caller.register({
        email: "test@example.com",
        password: "password",
        username: "tester",
      });

      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: "test@example.com" } });
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: "test@example.com",
          password: "hashed-password",
          username: "tester",
        },
      });
      expect(res).toEqual({
        message: "User registered",
        user: {
          id: "user-1",
          email: "test@example.com",
        },
      });
    });

    it("throws if user already exists", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: "existing-user" });

      const caller = userRouter.createCaller(ctx as any);

      await expect(
        caller.register({
          email: "exists@example.com",
          password: "password",
          username: "user",
        })
      ).rejects.toThrow("User already exists");
    });

    it("throws if missing username", async () => {
      const caller = userRouter.createCaller(ctx as any);

      await expect(
        caller.register({
          password: "password",
          username: "    ",
          email: "test@example.com",
        })
      ).rejects.toThrow("Missing required fields");
    });

    it("throws if missing password", async () => {
      const caller = userRouter.createCaller(ctx as any);

      await expect(
        caller.register({
          password: "    ",
          username: "username",
          email: "test@example.com",
        })
      ).rejects.toThrow("Missing required fields");
    });
  });

  describe("forgotPassword", () => {
    it("creates a reset token and returns true", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: "user-1", email: "test@example.com" });
      (prisma.passwordResetToken.create as jest.Mock).mockResolvedValue({ token: "random-token-1234567890randomtoken" });
      (addHours as jest.Mock).mockImplementation((date: Date, hours: number) => new Date(date.getTime() + hours * 3600 * 1000));

      const caller = userRouter.createCaller(ctx as any);

      const result = await caller.forgotPassword({ email: "test@example.com" });

      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: "test@example.com" } });
      expect(prisma.passwordResetToken.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          userId: "user-1",
          token: expect.any(String),
          expiresAt: expect.any(Date),
        }),
      }));
      expect(result).toBe(true);
    });

    it("throws if no user with that email", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const caller = userRouter.createCaller(ctx as any);

      await expect(caller.forgotPassword({ email: "missing@example.com" })).rejects.toThrow(
        "No account with that email address exists."
      );
    });
  });

  describe("resetPassword", () => {
    it("resets password successfully", async () => {
      const fakeToken = "valid-token-123";
      const fakeUserId = "user-1";
      (prisma.passwordResetToken.findUnique as jest.Mock).mockResolvedValue({
        token: fakeToken,
        userId: fakeUserId,
        expiresAt: new Date(Date.now() + 3600 * 1000),
      });
      (hashPassword as jest.Mock).mockImplementation((s: string) => "hashed-" + s);
      (prisma.user.update as jest.Mock).mockResolvedValue({});
      (prisma.passwordResetToken.delete as jest.Mock).mockResolvedValue({});

      const caller = userRouter.createCaller(ctx as any);

      const result = await caller.resetPassword({
        token: fakeToken,
        newPassword: "newPassword123",
      });

      expect(prisma.passwordResetToken.findUnique).toHaveBeenCalledWith({ where: { token: fakeToken } });
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: fakeUserId },
        data: { password: "hashed-newPassword123" },
      });
      expect(prisma.passwordResetToken.delete).toHaveBeenCalledWith({ where: { token: fakeToken } });
      expect(result).toEqual({ success: true });
    });

    it("throws if token is invalid or expired", async () => {
      (prisma.passwordResetToken.findUnique as jest.Mock).mockResolvedValue(null);

      const caller = userRouter.createCaller(ctx as any);

      await expect(
        caller.resetPassword({ token: "bad-token", newPassword: "1234" })
      ).rejects.toThrow("Invalid or expired token.");
    });

    it("throws if token expired", async () => {
      (prisma.passwordResetToken.findUnique as jest.Mock).mockResolvedValue({
        token: "expired-token",
        userId: "user-1",
        expiresAt: new Date(Date.now() - 1000), // expired in past
      });

      const caller = userRouter.createCaller(ctx as any);

      await expect(
        caller.resetPassword({ token: "expired-token", newPassword: "1234" })
      ).rejects.toThrow("Invalid or expired token.");
    });
  });
});
