describe("User List", () => {
  beforeEach(() => {
    cy.visit("/login");
    cy.get("input[id=username]").type("super");
    cy.get("input[id=password]").type("123");
    cy.get("button[type=submit]").click();
    cy.visit("/users");
  });

  it("User list", () => {
    cy.get("h1").contains("Users");
    cy.get("table").find("tr").should("have.length.at.least", 3);
  });

  it("Add user button should be disabled with no inputs", () => {
    cy.get("button").contains("Add User").click();
    cy.get("div[id=addUserModal]").should("be.visible");
    cy.get("button").contains("Create User").should("be.disabled");
  });

  it("Invalid form data should show errors", () => {
    cy.get("button").contains("Add User").click();
    // Quickly click the inputs to 'touch' them and display the errors
    cy.get("input[id=username]").click();
    cy.get("input[id=name]").focus().blur();
    cy.get("input[id=email]").focus().blur();
    cy.get("input[id=password]").focus().blur();
    // Confirm the error messages
    cy.get("div.text-danger").contains("Please enter more than 3 characters");
    cy.get("div.text-danger").contains("A valid email is required");
  });

  it("Add user", () => {
    cy.get("button").contains("Add User").click();
    cy.wait(500); // Wait for the modal to appear - this is beacuse the animation disrupts cypress typing the username
    cy.get("input[id=username]").type("TestUsername"); // Also slow down the typing just in case
    cy.get("input[id=name]").type("Test User");
    cy.get("input[id=email]").type("testuser@test.com");
    cy.get("input[id=password]").type("testuser");
    cy.get("button").contains("Create User").click();
    cy.get("table").find("tr").should("have.length.at.least", 4);
  });

  it("Delete user shows modal", () => {
    cy.get("button[id=delete-TestUsername").click();
    cy.wait(500);
    cy.get("button.btn-close[id=dismiss-deleteUser]").click();
  });

  it("Delete user", () => {
    // Select the last row in the table's delete button
    cy.get("button[id=delete-TestUsername").click();
    cy.wait(500);
    cy.get("button.btn-danger[id=confirm-deleteUser]").click();
    cy.get("table").find("tr").should("have.length.at.least", 3);
  });
});
