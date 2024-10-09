import { app } from "../src/server";

import { before } from "mocha";

import { use, expect } from "chai";
import chaiHttp from "chai-http";

const chai = use(chaiHttp);

describe("Groups", () => {
  let authToken: string;

  before(async () => {
    // Get an authToken to use in the tests, this can be done by calling the /api/user/login endpoint
    const res = await chai.request(app).post("/api/user/login").send({
      username: "super",
      password: "123",
    });

    authToken = res.body.authToken;
  });

  describe("GET All groups", () => {
    after(() => {
      console.log("----------------------------------------");
    });
    describe("With Valid Auth", () => {
      it("should return a 200 status", (done) => {
        chai
          .request(app)
          .get("/api/group")
          .set("Authorization", `Bearer ${authToken}`)
          .end((err, res) => {
            expect(res.status).to.be.equal(200);
            expect(res.body).to.be.an("array");
            done();
          });
      });
    });

    describe("Without Auth", () => {
      it("should return a 401 status", (done) => {
        chai
          .request(app)
          .get("/api/group")
          .end((err, res) => {
            expect(res.status).to.be.equal(401);
            done();
          });
      });
    });
  });

  describe("GET Single Group", () => {
    after(() => {
      console.log("----------------------------------------");
    });
    describe("With Valid Auth", () => {
      it("should return a 200 status", (done) => {
        chai
          .request(app)
          .get("/api/group/1")
          .set("Authorization", `Bearer ${authToken}`)
          .end((err, res) => {
            expect(res.status).to.be.equal(200);
            expect(res.body).to.be.an("object");
            done();
          });
      });
    });

    describe("Without Auth", () => {
      it("should return a 401 status", (done) => {
        chai
          .request(app)
          .get("/api/group/1")
          .end((err, res) => {
            expect(res.status).to.be.equal(401);
            done();
          });
      });
    });

    describe("With Invalid Group ID", () => {
      it("should return a 404 status", (done) => {
        chai
          .request(app)
          .get("/api/group/999")
          .set("Authorization", `Bearer ${authToken}`)
          .end((err, res) => {
            expect(res.status).to.be.equal(404);
            done();
          });
      });
    });
  });

  describe("POST Create Group", () => {
    after(() => {
      console.log("----------------------------------------");
    });
    describe("With Valid Auth", () => {
      it("should return a 200 status", (done) => {
        chai
          .request(app)
          .post("/api/group")
          .set("Authorization", `Bearer ${authToken}`)
          .send({
            name: "New Test Group",
            description: "This is a new group!",
          })
          .end((err, res) => {
            expect(res.status).to.be.equal(200);
            expect(res.body).to.be.an("object");
            done();
          });
      });
    });

    describe("Without Auth", () => {
      it("should return a 401 status", (done) => {
        chai
          .request(app)
          .post("/api/group")
          .send({
            name: "New Test Group",
            description: "This is a new group!",
          })
          .end((err, res) => {
            expect(res.status).to.be.equal(401);
            done();
          });
      });
    });

    describe("Without Name", () => {
      it("should return a 400 status", (done) => {
        chai
          .request(app)
          .post("/api/group")
          .set("Authorization", `Bearer ${authToken}`)
          .send({
            description: "This is a new group!",
          })
          .end((err, res) => {
            expect(res.status).to.be.equal(400);
            done();
          });
      });
    });

    describe("Duplicate Group Name", () => {
      it("should return a 409 status", (done) => {
        chai
          .request(app)
          .post("/api/group")
          .set("Authorization", `Bearer ${authToken}`)
          .send({
            name: "New Test Group",
            description: "This is a new group!",
          })
          .end((err, res) => {
            expect(res.status).to.be.equal(409);
            done();
          });
      });
    });
  });

  describe("PUT Update Group", () => {
    let testID: number;

    before(async () => {
      // Get the group ID to use in the tests
      const res = await chai
        .request(app)
        .get("/api/group")
        .set("Authorization", `Bearer ${authToken}`);

      // Find testID by looking for the group with the name "New Test Group"
      testID = res.body.find(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (group: any) => group.name === "New Test Group"
      ).id;
    });

    after(() => {
      console.log("----------------------------------------");
    });
    describe("With Valid Auth", () => {
      it("should return a 200 status", (done) => {
        chai
          .request(app)
          .put("/api/group/" + testID)
          .set("Authorization", `Bearer ${authToken}`)
          .send({
            description: "This is an updated group!",
          })
          .end((err, res) => {
            expect(res.status).to.be.equal(200);
            expect(res.body).to.be.an("object");
            done();
          });
      });
    });

    describe("Without Auth", () => {
      it("should return a 401 status", (done) => {
        chai
          .request(app)
          .put("/api/group/" + testID)
          .send({
            name: "Updated Test Group",
            description: "This is an updated group!",
          })
          .end((err, res) => {
            expect(res.status).to.be.equal(401);
            done();
          });
      });
    });

    describe("Invalid Group ID", () => {
      it("should return a 404 status", (done) => {
        chai
          .request(app)
          .put("/api/group/999")
          .set("Authorization", `Bearer ${authToken}`)
          .send({
            name: "Updated Test Group",
            description: "This is an updated group!",
          })
          .end((err, res) => {
            expect(res.status).to.be.equal(404);
            done();
          });
      });
    });
  });

  describe("POST Add User to Group", () => {
    let testID: number;

    before(async () => {
      // Get the group ID to use in the tests
      const res = await chai
        .request(app)
        .get("/api/group")
        .set("Authorization", `Bearer ${authToken}`);

      // Find testID by looking for the group with the name "New Test Group"
      testID = res.body.find(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (group: any) => group.name === "New Test Group"
      ).id;

      // Create a new user to add to the groups
      await chai
        .request(app)
        .post("/api/user")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          username: "newgroupsuser",
          name: "New User",
          password: "123",
          email: "new@user2.com",
          roles: [],
          groups: [],
        });
    });

    after(() => {
      console.log("----------------------------------------");
    });

    describe("With Valid Auth", () => {
      it("should return a 200 status", (done) => {
        chai
          .request(app)
          .post("/api/group/" + testID + "/user/newgroupsuser")
          .set("Authorization", `Bearer ${authToken}`)
          .end((err, res) => {
            expect(res.status).to.be.equal(200);
            done();
          });
      });
    });

    describe("Without Auth", () => {
      it("should return a 401 status", (done) => {
        chai
          .request(app)
          .post("/api/group/" + testID + "/user/newgroupsuser")
          .end((err, res) => {
            expect(res.status).to.be.equal(401);
            done();
          });
      });
    });

    describe("Invalid Group ID", () => {
      it("should return a 404 status", (done) => {
        chai
          .request(app)
          .post("/api/group/999/user/newgroupsuser")
          .set("Authorization", `Bearer ${authToken}`)
          .end((err, res) => {
            expect(res.status).to.be.equal(404);
            done();
          });
      });
    });

    describe("Invalid User", () => {
      it("should return a 404 status", (done) => {
        chai
          .request(app)
          .post("/api/group/" + testID + "/user/doesnotexist")
          .set("Authorization", `Bearer ${authToken}`)
          .end((err, res) => {
            expect(res.status).to.be.equal(404);
            done();
          });
      });
    });

    describe("User Already in Group", () => {
      it("should return a 409 status", (done) => {
        chai
          .request(app)
          .post("/api/group/" + testID + "/user/newgroupsuser")
          .set("Authorization", `Bearer ${authToken}`)
          .end((err, res) => {
            expect(res.status).to.be.equal(409);
            done();
          });
      });
    });
  });

  describe("DELETE Remove User from Group", () => {
    let testID: number;

    before(async () => {
      // Get the group ID to use in the tests
      const res = await chai
        .request(app)
        .get("/api/group")
        .set("Authorization", `Bearer ${authToken}`);

      // Find testID by looking for the group with the name "New Test Group"
      testID = res.body.find(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (group: any) => group.name === "New Test Group"
      ).id;
    });

    after(() => {
      console.log("----------------------------------------");
    });

    describe("With Valid Auth", () => {
      it("should return a 200 status", (done) => {
        chai
          .request(app)
          .delete("/api/group/" + testID + "/user/newgroupsuser")
          .set("Authorization", `Bearer ${authToken}`)
          .end((err, res) => {
            expect(res.status).to.be.equal(200);
            done();
          });
      });
    });

    describe("Without Auth", () => {
      it("should return a 401 status", (done) => {
        chai
          .request(app)
          .delete("/api/group/" + testID + "/user/newgroupsuser")
          .end((err, res) => {
            expect(res.status).to.be.equal(401);
            done();
          });
      });
    });

    describe("Invalid Group ID", () => {
      it("should return a 404 status", (done) => {
        chai
          .request(app)
          .delete("/api/group/999/user/newgroupsuser")
          .set("Authorization", `Bearer ${authToken}`)
          .end((err, res) => {
            expect(res.status).to.be.equal(404);
            done();
          });
      });
    });

    describe("Invalid User", () => {
      it("should return a 404 status", (done) => {
        chai
          .request(app)
          .delete("/api/group/" + testID + "/user/doesnotexist")
          .set("Authorization", `Bearer ${authToken}`)
          .end((err, res) => {
            expect(res.status).to.be.equal(404);
            done();
          });
      });
    });

    describe("User Not in Group", () => {
      it("should return a 409 status", (done) => {
        chai
          .request(app)
          .delete("/api/group/" + testID + "/user/newgroupsuser")
          .set("Authorization", `Bearer ${authToken}`)
          .end((err, res) => {
            expect(res.status).to.be.equal(409);
            done();
          });
      });
    });
  });
});
