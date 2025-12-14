import User from "../model/user.js";

describe("User Model Test", () => {
  
  it("should create a user instance with required fields", () => {
    const userData = {
      name: "Test User",
      email: "test@example.com",
      password: "hashedpassword123",
    };
    
    const user = new User(userData);
    
    expect(user.name).toBe("Test User");
    expect(user.email).toBe("test@example.com");
    expect(user.password).toBe("hashedpassword123");
    expect(user.followers).toEqual([]);
    expect(user.following).toEqual([]);
  });

  it("should support notification linking", () => {
    const user = new User({
        name: "Notified User", 
        email: "notify@test.com", 
        password: "pass"
    });
    
    // Simulate adding a notification ID
    user.notifications.push("64f8a1234567890abcdef123");
    
    expect(user.notifications).toHaveLength(1);
  });
});