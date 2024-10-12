describe("Profile", () => {
  beforeEach(() => {
    cy.visit("/login");
    cy.get("input[id=username]").type("super");
    cy.get("input[id=password]").type("123");
    cy.get("button[type=submit]").click();
  });

  it("User profile", () => {
    cy.get("h1").contains("Profile");
    cy.get("a.navbar-brand").contains("super");
    cy.get("h4.card-title").contains("Username: super");
    cy.get("p.card-text:first").contains("Email: super@super.com");
    cy.get("p.card-text").contains("Full Name: Super Admin");
    cy.get("p.card-text:last").contains("Roles: super");
  });

  it("Update profile", () => {
    cy.get("input[id=username]").type("super123");
    cy.get("button[type=submit]").click();

    // Assert that the profile page has been updated
    cy.get("a.navbar-brand").contains("super123");
    cy.get("h4.card-title").contains("Username: super123");

    // Reset the username back to super
    cy.get("input[id=username]").type("super");
    cy.get("button[type=submit]").click();
  });

  it("Delete profile shows modal", () => {
    cy.get("button").contains("Delete Profile").click();
    cy.get("div.modal").should("be.visible");
    cy.get("button.btn-close").click();
  });
});
