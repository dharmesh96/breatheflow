package main

import (
    "database/sql"
    "fmt"
    "log"
    "os"

    "github.com/gofiber/fiber/v2"
    "github.com/gofiber/fiber/v2/middleware/cors"
    _ "github.com/godror/godror"
)

var db *sql.DB

func main() {
    // Get values from environment variables to connect to the Oracle DB 
    user := os.Getenv("BREATHE_DB_USER")
    password := os.Getenv("BREATHE_DB_PASSWORD")
    // TNS alias from tnsnames.ora (e.g., "ADB_LOW")
    connectString := os.Getenv("BREATHE_DB_CONNECT_STRING")
    // Location of wallet files
    walletDir := os.Getenv("DB_WALLET_DIR")

    if user == "" || password == "" || connectString == "" || walletDir == "" {
        log.Fatal("Database environment variables are not set. Please export DB_USER, DB_PASSWORD, DB_CONNECT_STRING, and DB_WALLET_DIR.")
    }

    dsn := fmt.Sprintf(`user="%s" password="%s" connectString="%s" walletLocation="%s"`,
        user, password, connectString, walletDir)

    var err error
    db, err = sql.Open("godror", dsn)
    if err != nil {
        log.Fatalf("Failed to connect to Oracle: %v", err)
    }
    defer db.Close()

    // Test DB connection
    if err = db.Ping(); err != nil {
        log.Fatalf("DB ping failed: %v", err)
    }
    fmt.Println("Connected to Oracle ADB successfully!")

    app := fiber.New()

    // Allow cross-origin requests from your frontend dev server and from anything (adjust origins if needed)
    app.Use(cors.New(cors.Config{
        AllowOrigins: "http://localhost:5173, http://127.0.0.1:5173, http://192.168.50.11:5173, http://192.168.50.11:5000", // add your frontend host(s)
        AllowHeaders: "Origin, Content-Type, Accept",
        AllowMethods: "GET,POST,HEAD,PUT,DELETE,OPTIONS",
        // Optionally: AllowCredentials: true,
    }))

    // Health check
    app.Get("/", func(c *fiber.Ctx) error {
        return c.SendString("BreatheFlow backend running")
    })

    // Save session
    app.Post("/sessions", saveSession)

    // Fetch sessions
    app.Get("/sessions", getSessions)

    log.Fatal(app.Listen(":8080"))
}

// Session struct
type Session struct {
    UserID   string `json:"userId"`
    Pattern  string `json:"pattern"`
    Reps     int    `json:"reps"`
    Duration int    `json:"duration"` // seconds
}

// Save session to Oracle
func saveSession(c *fiber.Ctx) error {
    var session Session
    if err := c.BodyParser(&session); err != nil {
        return c.Status(400).JSON(fiber.Map{"error": err.Error()})
    }

    _, err := db.Exec(
        "INSERT INTO BREATHE_SESSIONS (USER_ID, PATTERN, REPS, DURATION, CREATED_AT) VALUES (:1, :2, :3, :4, SYSTIMESTAMP)",
        session.UserID, session.Pattern, session.Reps, session.Duration,
    )
    if err != nil {
        return c.Status(500).JSON(fiber.Map{"error": err.Error()})
    }

    return c.JSON(fiber.Map{"status": "success"})
}

// Fetch sessions from Oracle
func getSessions(c *fiber.Ctx) error {
    rows, err := db.Query("SELECT USER_ID, PATTERN, REPS, DURATION, CREATED_AT FROM BREATHE_SESSIONS ORDER BY CREATED_AT DESC")
    if err != nil {
        return c.Status(500).JSON(fiber.Map{"error": err.Error()})
    }
    defer rows.Close()

    var sessions []Session
    for rows.Next() {
        var s Session
        var createdAt string
        if err := rows.Scan(&s.UserID, &s.Pattern, &s.Reps, &s.Duration, &createdAt); err != nil {
            return c.Status(500).JSON(fiber.Map{"error": err.Error()})
        }
        sessions = append(sessions, s)
    }

    return c.JSON(sessions)
}

