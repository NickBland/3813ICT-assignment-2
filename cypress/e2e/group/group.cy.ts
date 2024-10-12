describe("Group", () => {
  beforeEach(() => {
    cy.visit("/login");
    cy.get("input[id=username]").type("super");
    cy.get("input[id=password]").type("123");
    cy.get("button[type=submit]").click();
    cy.visit("/groups");
  });

  it("Group list", () => {
    cy.get("h1").contains("Groups");
    cy.get("table").find("tr").should("have.length.at.least", 2);
  });

  it("Add group button should be disabled with no inputs", () => {
    cy.get("button[id=addGroupButton]").click();
    cy.get("div[id=addGroupModal]").should("be.visible");
    cy.get("button[id=saveAddGroup]").should("be.disabled");
    cy.get("button[id=closeAddGroup]").click();
  });

  it("Invalid form data should show errors", () => {
    cy.get("button[id=addGroupButton]").click();
    // Quickly click the inputs to 'touch' them and display the errors
    cy.get("input[id=name]").click();
    cy.get("input[id=description]").focus().blur();
    // Confirm the error messages
    cy.get("div.text-danger").contains("Please enter more than 3 characters");
  });

  it("Add group", () => {
    cy.get("button[id=addGroupButton]").click();
    cy.wait(500);
    cy.get("input[id=name]").type("TestGroup");
    cy.get("input[id=description]").type("Test Group Description");
    cy.get("button[id=saveAddGroup]").click();
    cy.get("table").find("tr").should("have.length.at.least", 3);
  });

  it("Visit Newly Made Group", () => {
    cy.get("button[id=view-TestGroup]").click();
    cy.get("h1").contains("TestGroup");
    cy.get("h4.card-title").contains("Name: TestGroup");
    cy.get("p.card-text").contains("Description: Test Group Description");
  });

  it("Update group", () => {
    cy.get("button[id=view-TestGroup]").click();
    cy.get("button[id=updateGroupButton]").click();
    cy.get("input[id=name]").type("Updated");
    cy.get("input[id=description]").type("Updated Description");
    cy.get("button[id=submitUpdatedGroup]").click();
    cy.get("h1").contains("TestGroupUpdated");
    cy.get("h4.card-title").contains("Name: TestGroupUpdated");
    cy.get("p.card-text").contains(
      "Description: Test Group Description Updated"
    );

    // Reset the group back to original
    cy.get("button[id=updateGroupButton]").click();
    cy.get("input[id=name]").type("TestGroup");
    cy.get("input[id=description]").type("Test Group Description");
    cy.get("button[id=submitUpdatedGroup]").click();
  });

  it("Add user to group", () => {
    cy.get("button[id=view-TestGroup]").click();
    cy.get("button[id=addUserButton]").click();
    cy.get("select[id=username]").select("joe");
    cy.get("button[id=submitAddUser]").click();
    cy.get("li.list-group-item").should("contain", "joe");
  });

  it("Remove user from group", () => {
    cy.get("button[id=view-TestGroup]").click();
    cy.get("button[id=removeUserButton]").click();
    cy.get("select[id=username]").select("joe");
    cy.get("button[id=submitRemoveUser]").click();
    cy.get("p.card-text").should("not.contain", "joe");
  });
});
