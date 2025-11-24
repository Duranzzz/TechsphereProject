import sql from "@/app/api/utils/sql";
import { hash } from "argon2";

export async function POST() {
  try {
    // Check if admin already exists
    const existingUser = await sql`
      SELECT id FROM auth_users WHERE email = 'admin@techsphere.com'
    `;

    if (existingUser.length > 0) {
      return Response.json({
        message: "Admin user already exists",
        success: true,
      });
    }

    // Create the admin user
    const newUser = await sql`
      INSERT INTO auth_users (name, email, "emailVerified", image)
      VALUES ('Admin TechSphere', 'admin@techsphere.com', NULL, NULL)
      RETURNING id, name, email
    `;

    const userId = newUser[0].id;

    // Hash the password
    const hashedPassword = await hash("admin123");

    // Create the credentials account
    await sql`
      INSERT INTO auth_accounts 
      ("userId", provider, type, "providerAccountId", password)
      VALUES (${userId}, 'credentials', 'credentials', ${userId}, ${hashedPassword})
    `;

    return Response.json({
      message:
        "Admin user created successfully! You can now sign in with admin@techsphere.com / admin123",
      success: true,
      user: newUser[0],
    });
  } catch (error) {
    console.error("Error setting up admin:", error);
    return Response.json(
      {
        error: "Failed to create admin user",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
