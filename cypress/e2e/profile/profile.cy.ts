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
  });
});
