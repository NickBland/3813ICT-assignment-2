describe("Login", () => {
  beforeEach(() => {
    cy.visit("/login");
  });

  it("Invalid username or password", () => {
    cy.get("input[id=username]").type("invalid");
    cy.get("input[id=password]").type("invalid");
    cy.get("button[type=submit]").click();
    cy.intercept("POST", "/api/login", {
      statusCode: 401,
      body: { message: "Incorrect User or Password" },
    });
    cy.get("div.alert").contains("401: Incorrect User or Password");
  });

  it("No password", () => {
    cy.get("input[id=username]").type("invalid");

    // Check that the submit button is disabled
    cy.get("button[type=submit]").should("be.disabled");

    // Click in and then out of password field and then check if an error message appears
    cy.get("input[id=password]").focus().blur();
    cy.get("div").contains("Password is required");
  });

  it("Valid login", () => {
    cy.get("input[id=username]").type("super");
    cy.get("input[id=password]").type("123");
    cy.get("button[type=submit]").click();
    cy.intercept("POST", "/api/login", {
      statusCode: 200,
      body: { username: "valid" },
    });
    cy.url().should("eq", "http://localhost:4200/profile");
  });
});
